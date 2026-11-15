const {SOURCES,json,methodNotAllowed}=require('../../lib/api');
module.exports=(req,res)=>{if(req.method!=='GET')return methodNotAllowed(res,req.method);return json(res,200,{sources:SOURCES});};
