'use strict';
const assert=require('node:assert/strict');
const path=require('node:path');
const {rank9BombOwnerSnapshot}=
 require('./agent10-rank9-extra-energy-bomb-owner-frontier.cjs');
const VERSION='agent1-rank17-source-native-bomb-public-frontier-v1';
const ROOTS=new Set(['PlayCardAction','PassTurnAction',
 'UseAbilityAction','AttackAction','RetreatAction','UseStadiumAction']);
/** Observe owner-only actual source Store roots, without changing the action.
 * @template T
 * @param {()=>T} run Synchronous actual native experiment.
 * @param {0|1} seat Original printed source physical seat.
 * @param {{Store?:Function,energySuperType?:number|string}} [deps]
 * @returns {{result:T,audit:object}}
 */
function withSourceBombFrontier(run,seat,deps={}){
 assert.equal(typeof run,'function');
 assert.ok(seat===0||seat===1);
 const base=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
 const Store=deps.Store??require(path.join(base,'game/store/store')).Store;
 const energySuperType=deps.energySuperType??
  require(path.join(base,'game/store/card/card-types')).SuperType.ENERGY;
 const descriptor=Object.getOwnPropertyDescriptor(Store.prototype,'dispatch');
 assert.equal(typeof descriptor?.value,'function');
 let store=null,sourceRoots=0;
 const snapshots=[],seen=new Set();
 const audit={version:VERSION,seat,snapshots,ownerRootCount:0,
  potentialBombGeometryRoots:0,completeRaichuBombGeometryRoots:0,
  realAbilityRootCount:0,policyUnchanged:true,sourceOnly:true,
  competitiveQualifiedGames:0};
 function observed(action,...args){
  const name=action?.constructor?.name??null;
  if(name==='AddPlayerAction'&&!store)store=this;
  const state=this.state;
  if(this===store&&ROOTS.has(name)&&state?.activePlayer===seat&&
   state.players?.length===2&&
   !state.prompts?.some(x=>x.result===undefined)&&
   Number.isSafeInteger(state.turn)&&state.turn>0){
   sourceRoots++;audit.ownerRootCount++;
   if(name==='UseAbilityAction')audit.realAbilityRootCount++;
   const v=rank9BombOwnerSnapshot(state,seat,energySuperType);
   if(v.possibleEnergyTransferGeometry)audit.potentialBombGeometryRoots++;
   const hasRaichu=v.eligibleRecipientPrintings.includes('Alolan Raichu UNM');
   if(v.possibleEnergyTransferGeometry&&hasRaichu)
    audit.completeRaichuBombGeometryRoots++;
   if(v.anyEnergyInDiscard||v.sourceHasElectrode||hasRaichu){
    const key=JSON.stringify([v.globalTurn,v.activePrinting,v.electrodeLocations,
     v.discardedEnergyPrintings,v.eligibleRecipientLocations,v.ownBoard,
     v.ownerPrizes,v.opponentPrizes]);
    if(!seen.has(key)){
     seen.add(key);
     snapshots.push({nativeOwnerRootIndex:sourceRoots,action:name,
      ...v,sourceHasRaichu:hasRaichu});
    }
   }
  }
  return descriptor.value.call(this,action,...args);
 }
 Object.defineProperty(Store.prototype,'dispatch',{...descriptor,value:observed});
 try{return {result:run(),audit};}
 finally{
  assert.strictEqual(Store.prototype.dispatch,observed);
  Object.defineProperty(Store.prototype,'dispatch',descriptor);
 }
}
module.exports={VERSION,withSourceBombFrontier};
