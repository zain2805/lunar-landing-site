const {json,methodNotAllowed,aiChat}=require('../../lib/api');
module.exports=async(req,res)=>{if(req.method!=='POST')return methodNotAllowed(res,req.method);const out=await aiChat(req.body||{},true);return json(res,out.status,out.body);};
