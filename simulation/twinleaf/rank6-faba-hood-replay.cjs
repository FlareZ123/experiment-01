'use strict';
const {run}=require('./rank6-hood-removal-replay.cjs');
if(require.main===module){
  process.stdout.write(JSON.stringify(run({targetFabaHood:true}),null,2)+'\n');
}
module.exports={runFaba:()=>run({targetFabaHood:true})};
