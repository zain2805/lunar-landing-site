const {json,methodNotAllowed}=require('../lib/api');
module.exports= (req,res) => {
  if(req.method!=='GET') return methodNotAllowed(res,req.method);
  const openai=!!process.env.OPENAI_API_KEY, gemini=!!process.env.GEMINI_API_KEY;
  return json(res,200,{ok:true,service:'lunar-navigator-vercel',nasaHorizons:true,openaiConfigured:openai,openaiModel:process.env.OPENAI_MODEL||'gpt-4.1-mini',geminiConfigured:gemini,geminiModel:process.env.GEMINI_MODEL||'gemini-3.8-flash',aiConfigured:openai||gemini,aiProvider:openai?'openai':gemini?'gemini':'none'});
};
