'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {proposeRondoPsychicBenchStaging}=
  require('../simulation/twinleaf/agent7-rondo-psychic-bench-staging.cjs');
const {PROPOSERS,collectAndChooseOwnerRoot}=
  require('../simulation/twinleaf/agent41-same-root-proposal-choice.cjs');
const catalog={basicEnergies:new Set(['Psychic Energy SVE'])};

function view(){
 return {decisionKind:'owner-root',actorSeat:1,globalTurn:24,
  ownHand:['Psychic Energy SVE'],ownTurnResources:{energyPlayedTurn:0},
  ownPublic:{active:{printing:'Mimikyu GRI',energies:[]},
   publicTurnRestrictions:{energyPlayLocked:false},
   bench:[{printing:"Lillie's Clefairy ex JTG",
    energies:[],attacks:[{name:'Full Moon Rondo'}]}]}};
}
test('pure stage proposal has actual source-owner hand index and Bench slot',()=>{
 const p=proposeRondoPsychicBenchStaging(view(),catalog);
 assert.equal(p.kind,'attach-basic-energy');
 assert.equal(p.handIndex,0);assert.equal(p.slot,'bench');
 assert.equal(p.index,0);
 const v=view();v.ownTurnResources.energyPlayedTurn=24;
 assert.equal(proposeRondoPsychicBenchStaging(v,catalog),null);
});
test('baseline recipient is preserved unless both explicit switches enabled',()=>{
 const v=view(),baseline={kind:'attach-basic-energy',
   handIndex:0,printing:'Psychic Energy SVE'};
 const proposal=PROPOSERS.find(x=>x.name==='rondo-psychic-bench');
 assert.equal(proposal.flag,'rondoPsychicBenchStage');
 let r=collectAndChooseOwnerRoot(v,catalog,baseline,
   {rondoPsychicBenchStage:true},[proposal]);
 assert.equal(r.intent.slot,undefined);
 assert.equal(r.receipt.changed,false);
 r=collectAndChooseOwnerRoot(v,catalog,baseline,
   {rondoPsychicBenchStage:true,sameRootChoiceApply:true},[proposal]);
 assert.equal(r.intent.slot,undefined);
 r=collectAndChooseOwnerRoot(v,catalog,baseline,
   {rondoPsychicBenchStage:true,sameRootChoiceApply:true,
    rondoPsychicBenchStagingPreference:true},[proposal]);
 assert.equal(r.intent.slot,'bench');
 assert.equal(r.receipt.changed,true);
});

test('physical recipient receipt matches the exact native JTG printing',()=>{
 const {inspectSource}=require('../simulation/evaluation/agent7-rank30-psychic-bench-stage-aba.cjs');
 const result=inspectSource({finished:true,winner:1,
   nativeAcceptedTargetSidecar:{events:[{
     playerSlot:1,action:'PlayCardAction',storeAccepted:true,
     declared:{ownerHandPrinting:'Psychic Energy MEE'},
     publicBoardChanges:[{seat:1,position:'bench',index:0,
       after:{pokemon:"Lillie's Clefairy ex JTG",
         energies:['Psychic Energy MEE']}}]
   }]},rootActionLedger:[]},1);
 assert.equal(result.attachedBasicPsychicSource,1);
 assert.equal(result.attachedBasicPsychicToClefairy,1);
});

test('owner Active JTG Clefairy stays first priority over a second Bench copy',()=>{
 const v=view();
 v.ownPublic.active={printing:"Lillie's Clefairy ex JTG",
  energies:['Psychic Energy SVE'],attacks:[{name:'Full Moon Rondo'}]};
 assert.equal(proposeRondoPsychicBenchStaging(v,catalog),null);
});
