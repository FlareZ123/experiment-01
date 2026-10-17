'use strict';
const {queuedPaleMoon,classifyPaleMoonExit}=
  require('./pale-moon-source-exposure.cjs');

/** @template T @param {Function} Store @param {()=>T} work */
function observePaleMoonReplay(Store,work) {
  const old=Object.getOwnPropertyDescriptor(Store.prototype,'dispatch');
  if(typeof old?.value!=='function')throw new TypeError('Missing dispatch');
  let root=null,arm=null;
  const arms=[];
  const dispatch=function(action) {
    const name=action?.constructor?.name ?? null;
    if(name==='AddPlayerAction'&&this!==root){
      root=this;arm={dispatches:0,activeQueueSteps:0,events:[]};
      arms.push(arm);
    }
    if(this!==root)return old.value.call(this,action);
    const before=queuedPaleMoon(this.state),turn=this.state.turn;
    if(before.some(x=>x.where==='active'))arm.activeQueueSteps++;
    const result=old.value.call(this,action);
    const after=queuedPaleMoon(this.state);
    const at={step:arm.dispatches,turn,action:name};
    arm.events.push(...classifyPaleMoonExit(before,after,at));
    for(const row of after.filter(x=>x.where==='bench')){
      if(before.some(old=>old.player===row.player &&
        old.target===row.target && old.where==='active'))continue;
      arm.events.push({...at,slot:row.slot,pokemon:row.pokemon,
        finding:'unresolved',reason:'Bench queue without observed exit'});
    }
    arm.dispatches++;
    return result;
  };
  Object.defineProperty(Store.prototype,'dispatch',{...old,value:dispatch});
  let result;
  try{result=work();}
  finally{Object.defineProperty(Store.prototype,'dispatch',old);}
  for(const item of arms) {
    item.status=item.events.some(e=>e.finding==='exercised-failing')?
      'exercised-failing':item.events.some(e=>e.finding==='unresolved')?
      'unresolved':item.events.some(e=>e.finding==='exercised-cleared')?
      'exercised-cleared':'not-exercised';
  }
  return {result,arms};
}
module.exports={observePaleMoonReplay};
