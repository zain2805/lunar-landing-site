const {json,methodNotAllowed,nasaHorizons}=require('../../lib/api');
module.exports=async(req,res)=>{if(req.method!=='GET')return methodNotAllowed(res,req.method);const out=await nasaHorizons(req.query||{});return json(res,out.status,out.body);};
