'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {chooseRank13VsSeekerFundingRoot:chooseRoot,
  isRank13CrispinFundingWindow:isFundingWindow}=
  require('../../simulation/evaluation/2026-11/agent47-rank13-vsseeker-funding-line.cjs');
const original=require('../../simulation/evaluation/2026-11/agent24-rank13-regidrago-opponent-policy.cjs');
const overlay=require('../../simulation/evaluation/2026-11/agent47-rank13-crispin-overlay.cjs');

const seeker={token:'vs',kind:'play-card',actorPrinting:'VS Seeker PHF',
  label:'Play VS Seeker'};
const legacy={token:'legacy',kind:'use-ability',actorPrinting:'Regidrago VSTAR SIT',
  label:'Legacy Star',publicMetadata:{abilityName:'Legacy Star'}};
function state(seat=0){
  return {role:'opponent',seat,prompt:null,
    observation:{
      actorSeat:seat,decisionKind:'owner-root',globalTurn:5,
      ownHand:['VS Seeker PHF'],
      ownTurnResources:{supporterPlayedTurn:0},
      ownPublic:{
        active:{printing:'Regidrago VSTAR SIT',energies:[
          {printing:'Grass Energy MEE'},{printing:'Fire Energy MEE'}],
          specialConditions:[],publicRestrictions:{}},
        bench:[{printing:'Budew ASC',energies:[]}],
        discard:['Dialga-GX UPR','Crispin SCR','Guzma BUS'],
        lostZone:[],
        prizeCount:1,deckCount:18,
        publicTurnRestrictions:{vstarUsed:false,attackLockTurnsRemaining:0,
          supporterPlayLocked:false}
      },
      opponentPublic:{
        active:{printing:'Mimikyu GRI',hp:70,damage:0},
        bench:[{printing:'Shadow Rider Calyrex VMAX CRE',hp:320,damage:0}],
        prizeCount:2,handCount:3}
    },
    actionFrontier:{items:[legacy,seeker,{kind:'pass',token:'pass'}]}
  };
}
function worker(lib,seat) {
  return lib.createPolicy({role:'opponent',seat,policyVersion:lib.POLICY_VERSION,config:{}});
}
for(const seat of [0,1]){
  test('seat '+seat+': winning K0-certified last-Prize funding line beats tempting Legacy Star root',()=>{
    const req=state(seat),standard=worker(original,seat),patched=worker(overlay,seat);
    assert.equal(isFundingWindow(req.observation),true);
    assert.deepEqual(standard.decide(req),{kind:'select-action',token:'legacy'});
    assert.deepEqual(chooseRoot(req),{kind:'select-action',token:'vs'});
    assert.deepEqual(patched.decide(req),{kind:'select-action',token:'vs'});
  });
}
test('root prioritization defers to original worker when proof or legal VS Seeker branch missing',()=>{
  const mutations=[
    r=>{r.observation.ownHand=[];},
    r=>{r.observation.ownPublic.discard=['Dialga-GX UPR','Guzma BUS'];},
    r=>{r.observation.ownPublic.prizeCount=2;},
    r=>{r.observation.ownPublic.deckCount=1;},
    r=>{r.observation.ownPublic.discard.push('Fire Energy MEE',
      'Fire Energy MEE');},
    r=>{r.observation.ownTurnResources.supporterPlayedTurn=1;},
    r=>{r.observation.ownPublic.active.energies.push({printing:'Grass Energy MEE'});},
    r=>{r.observation.opponentPublic.active.damage=70;},
    r=>{r.actionFrontier.items=[legacy,{kind:'pass',token:'pass'}];},
    r=>{r.actionFrontier.items.push({...seeker,token:'second-vs'});},
    r=>{r.actionFrontier.items.push({kind:'attack',token:'attack',
      attackName:'Apex Dragon'});}
  ];
  for(const change of mutations){
    const req=state();
    change(req);
    assert.equal(chooseRoot(req),null);
    assert.deepEqual(worker(overlay,0).decide(req),worker(original,0).decide(req));
  }
});
test('root prioritization rejects wrong owner, stale decisionKind or hallucinated native frontier',()=>{
  const x=state();
  for(const change of [
    r=>{r.role='candidate';},
    r=>{r.seat=1;},
    r=>{r.observation.decisionKind='owner-prompt';},
    r=>{r.actionFrontier=null;}]) {
    const req=JSON.parse(JSON.stringify(x));
    change(req);
    assert.equal(chooseRoot(req),null);
  }
});
