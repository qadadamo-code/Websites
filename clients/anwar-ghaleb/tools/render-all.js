const fs=require('fs'),vm=require('vm');const ctx={window:{}};vm.runInNewContext(fs.readFileSync(__dirname+'/../assets/js/data.js','utf8'),ctx);
const specs=[];for(const p of ctx.window.AG.products)p.v.forEach((v,i)=>specs.push({id:p.id+'_'+i,b:p.b,o:v[1],r:p.r}));
fs.writeFileSync('/tmp/claude-0/specs-all.json',JSON.stringify(specs));console.log(specs.length);
