const http=require('node:http');
const fs=require('node:fs');
const path=require('node:path');
const {URL}=require('node:url');
const ROOT=__dirname, PUBLIC=path.join(ROOT,'public'), PORT=Number(process.env.PORT||3000);

// Minimal .env loader; no npm dependencies are required.
try {
 const raw=fs.readFileSync(path.join(ROOT,'.env'),'utf8');
 for(const line of raw.split(/\r?\n/)){
  const m=line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/);
  if(m&&!process.env[m[1]])process.env[m[1]]=m[2].replace(/^['"]|['"]$/g,'');
 }
} catch {}
const GEMINI_API_KEY=process.env.GEMINI_API_KEY||'';
const GEMINI_MODEL=process.env.GEMINI_MODEL||'gemini-3.8-flash';
const OPENAI_API_KEY=process.env.OPENAI_API_KEY||'';
const OPENAI_MODEL=process.env.OPENAI_MODEL||'gpt-4.1-mini';
const SOURCES=[
 {name:'NASA Planetary Data System — Geosciences Node',url:'https://pds-geosciences.wustl.edu/',description:'Planetary surface and geoscience data archives.'},
 {name:'NASA Planetary Data System',url:'https://pds.nasa.gov/',description:'Official archive catalogue and mission data products.'},
 {name:'Lunar Orbiter Laser Altimeter (LOLA)',url:'https://pgda.gsfc.nasa.gov/products/78',description:'Lunar topography products; check product documentation and resolution.'},
 {name:'NASA Moon Trek',url:'https://trek.nasa.gov/moon/',description:'Interactive lunar mapping and exploration portal.'},
 {name:'LROC QuickMap',url:'https://quickmap.lroc.asu.edu/',description:'Lunar Reconnaissance Orbiter Camera imagery and derived layers.'},
 {name:'NASA/JPL Horizons API',url:'https://ssd-api.jpl.nasa.gov/doc/horizons.html',description:'Solar-system ephemeris and observer geometry service.'},
 {name:'NAIF SPICE Generic Kernels',url:'https://naif.jpl.nasa.gov/naif/data_generic.html',description:'SPICE kernels needed for accurate body and surface geometry.'},
 {name:'NASA SPICE Toolkit',url:'https://naif.jpl.nasa.gov/naif/toolkit.html',description:'SPICE toolkit documentation and software.'}
];
function send(res,status,obj,type='application/json; charset=utf-8'){
 res.writeHead(status,{'Content-Type':type,'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});
 res.end(type.startsWith('application/json')?JSON.stringify(obj):obj);
}
function bodyJSON(req){
 return new Promise((resolve,reject)=>{let raw='';req.on('data',c=>{raw+=c;if(raw.length>20000){reject(Error('Request body too large'));req.destroy();}});
 req.on('end',()=>{try{resolve(JSON.parse(raw||'{}'))}catch{reject(Error('Invalid JSON body'))}});req.on('error',reject)});
}
const validDate=s=>/^\d{4}-\d{2}-\d{2}$/.test(s)&&!Number.isNaN(Date.parse(s));
async function handle(req,res){
 const u=new URL(req.url,'http://localhost');
 if(req.method==='GET'&&u.pathname==='/api/health')return send(res,200,{ok:true,service:'lunar-navigator-backend',nasaHorizons:true,geminiConfigured:!!GEMINI_API_KEY,geminiModel:GEMINI_MODEL,openaiConfigured:!!OPENAI_API_KEY,openaiModel:OPENAI_MODEL,aiConfigured:!!(OPENAI_API_KEY||GEMINI_API_KEY),aiProvider:OPENAI_API_KEY?'openai':GEMINI_API_KEY?'gemini':'none'});
 if(req.method==='GET'&&u.pathname==='/api/nasa/sources')return send(res,200,{sources:SOURCES});
 if(req.method==='GET'&&u.pathname==='/api/nasa/horizons'){
  const start=u.searchParams.get('start'),stop=u.searchParams.get('stop'),step=u.searchParams.get('step')||'1h';
  if(!validDate(start)||!validDate(stop)||stop<=start)return send(res,400,{error:'Provide valid dates; stop must be later than start.'});
  if(!['1h','6h','12h','1d'].includes(step))return send(res,400,{error:'Unsupported step size.'});
  const q=new URLSearchParams({format:'json',COMMAND:"'301'",CENTER:"'500@399'",MAKE_EPHEM:"'YES'",EPHEM_TYPE:"'OBSERVER'",START_TIME:`'${start}'`,STOP_TIME:`'${stop}'`,STEP_SIZE:`'${step}'`,QUANTITIES:"'1,2,4'",CSV_FORMAT:"'YES'",OBJ_DATA:"'YES'"});
  try{
   const r=await fetch('https://ssd.jpl.nasa.gov/api/horizons.api?'+q,{signal:AbortSignal.timeout(30000)}),d=await r.json();
   if(!r.ok||d.error)return send(res,502,{error:d.error||`Horizons HTTP ${r.status}`});
   return send(res,200,{source:'NASA/JPL Horizons API',sourceUrl:'https://ssd-api.jpl.nasa.gov/doc/horizons.html',target:'Moon (301)',observer:'Earth geocentre (500@399)',coordinateScope:'Geocentric; not a lunar surface observer',start,stop,step,result:d.result,signature:d.signature});
  }catch(e){return send(res,502,{error:'NASA/JPL Horizons request failed: '+e.message})}
 }
 if(req.method==='POST'&&['/api/gemini/chat','/api/ai/chat'].includes(u.pathname)){
  const useOpenAI=u.pathname==='/api/ai/chat'&&!!OPENAI_API_KEY;
  if(!OPENAI_API_KEY&&!GEMINI_API_KEY)return send(res,503,{error:'No AI provider configured. Add OPENAI_API_KEY or GEMINI_API_KEY to your server environment.'});
  let b;try{b=await bodyJSON(req)}catch(e){return send(res,400,{error:e.message})}
  const message=String(b.message||'').trim();if(!message||message.length>5000)return send(res,400,{error:'Question must contain 1–5000 characters.'});
  const s=b.site&&typeof b.site==='object'?b.site:null;
  const context=s?`Selected candidate reference: ${String(s.name||'').slice(0,120)}; approximate latitude ${Number(s.latitude)}, longitude ${Number(s.longitude)}. Profile: ${String(s.profile||'').slice(0,500)}.`:'No candidate site selected.';
  const prompt=`You are a careful lunar south-pole mission research assistant. Distinguish established facts, assumptions and unknowns. Never fabricate NASA measurements, terrain values, coordinates, illumination duration, Earth visibility or safety scores. Candidate coordinates are approximate references, not verified landing coordinates. Explain when local SPICE kernels, high-resolution elevation data, slope/roughness products or mission constraints are needed. Do not provide flight certification or a final landing recommendation.\n${context}\nMission date: ${String(b.missionDate||'not specified').slice(0,30)}\nQuestion: ${message}`;
  try{
   if(useOpenAI){
    const r=await fetch('https://api.openai.com/v1/responses',{method:'POST',headers:{'Content-Type':'application/json','Authorization':`Bearer ${OPENAI_API_KEY}`},body:JSON.stringify({model:OPENAI_MODEL,instructions:'You are a careful lunar south-pole mission research assistant. Be factual, transparent and cautious. Distinguish verified facts from assumptions. Never invent NASA measurements or certify a landing site.',input:prompt,max_output_tokens:1200,store:false}),signal:AbortSignal.timeout(45000)});
    const d=await r.json();if(!r.ok)return send(res,502,{error:d.error?.message||`OpenAI HTTP ${r.status}`});
    const answer=typeof d.output_text==='string'?d.output_text:(d.output||[]).flatMap(item=>item.content||[]).map(part=>part.text||'').filter(Boolean).join('\n').trim();
    if(!answer)return send(res,502,{error:'OpenAI returned no readable text.'});
    return send(res,200,{provider:'openai',model:OPENAI_MODEL,text:answer});
   }
   const endpoint='https://generativelanguage.googleapis.com/v1beta/interactions';
   const r=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json','x-goog-api-key':GEMINI_API_KEY},body:JSON.stringify({model:GEMINI_MODEL,input:prompt,system_instruction:'You are a careful lunar south-pole mission research assistant. Be factual, transparent and cautious.',store:false,generation_config:{temperature:0.25,max_output_tokens:1200}}),signal:AbortSignal.timeout(45000)});
   const d=await r.json();if(!r.ok)return send(res,502,{error:d.error?.message||`Gemini HTTP ${r.status}`});
   const answer = (() => {
    if (typeof d.output_text === 'string' && d.output_text.trim()) return d.output_text.trim();
    const fromOutputs = (d.outputs || []).flatMap(item => {
      if (typeof item.text === 'string') return [item.text];
      return (item.content || []).map(part => part.text || '').filter(Boolean);
    }).join('\n').trim();
    if (fromOutputs) return fromOutputs;
    return (d.steps || []).filter(step => step.type === 'model_output' || step.type === 'message')
      .flatMap(step => step.content || []).map(part => part.text || '').filter(Boolean).join('\n').trim();
   })();
   if(!answer)return send(res,502,{error:'Gemini returned no readable text. Check the selected model and API response.'});
   return send(res,200,{provider:'gemini',model:GEMINI_MODEL,text:answer});
  }catch(e){return send(res,502,{error:'AI request failed: '+e.message})}
 }
 if(req.method==='GET'&&(u.pathname==='/'||u.pathname==='/index.html'))return send(res,200,fs.readFileSync(path.join(PUBLIC,'index.html'),'utf8'),'text/html; charset=utf-8');
 return send(res,404,{error:'Not found'});
}
http.createServer((req,res)=>handle(req,res).catch(()=>send(res,500,{error:'Internal server error'}))).listen(PORT,'0.0.0.0',()=>console.log(`Lunar Navigator: http://localhost:${PORT} | AI ${OPENAI_API_KEY?'OpenAI configured':GEMINI_API_KEY?'Gemini configured':'key missing'}`));
