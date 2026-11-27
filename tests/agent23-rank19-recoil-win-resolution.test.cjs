'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const mobility=require('../simulation/evaluation/2026-11/agent23-rank19-mobility.cjs');
const mon=(printing,hp,damage=0,energies=[])=>({printing,hp,damage,energies,tools:[],specialConditions:[],publicRestrictions:{}});
const a=()=>mon('Galarian Moltres V CRE 97',220,190,['Darkness Energy','Darkness Energy','Fighting Energy']);
const b=()=>mon("Lillie's Clefairy ex JTG 56",190);
const ownBackup=()=>mon('Sudowoodo GRI 66',100);
const oppBackup=()=>mon('Shadow Rider Calyrex V CRE 74',210);
const caps={attach:false,discard:false};
function req(ourPrizeOut,theirPrizeOut,ourEmpty,theirEmpty){
 const active=a(),target=b(),o={actorSeat:0,globalTurn:10,ownHand:[],ownPublic:{active,bench:ourEmpty?[]:[ownBackup()],stadium:[],prizeCount:ourPrizeOut?2:6,publicTurnRestrictions:{gxUsed:false}},opponentPublic:{active:target,bench:theirEmpty?[]:[oppBackup()],stadium:[],prizeCount:theirPrizeOut?2:3,publicTurnRestrictions:{}}};
 return {role:'opponent',seat:0,observation:o,actionFrontier:{items:[{kind:'attack',token:'burn',actorPrinting:active.printing,attackName:'Aura Burn',publicMetadata:{attackCostPayable:true}}]}};
}
for(const ourPrizeOut of [false,true])for(const theirPrizeOut of [false,true])for(const ourEmpty of [false,true])for(const theirEmpty of [false,true]){
 const label=[ourPrizeOut,theirPrizeOut,ourEmpty,theirEmpty].map(Number).join('');
 const expected=Number(ourPrizeOut)+Number(theirEmpty)>Number(theirPrizeOut)+Number(ourEmpty);
 test('simultaneous resolution '+label,()=>{
  const r=req(ourPrizeOut,theirPrizeOut,ourEmpty,theirEmpty);
  assert.equal(mobility.attackRoot(r,caps,true)?.token,expected?'burn':undefined);
 });
}
test('unknown opponent prize count never certifies self-KO win',()=>{const r=req(true,false,false,true);delete r.observation.opponentPublic.prizeCount;assert.equal(mobility.attackRoot(r,caps,true),null);});
