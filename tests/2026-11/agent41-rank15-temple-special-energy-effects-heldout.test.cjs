'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {
  POLICY_VERSION,createPolicy,energyProvided,attachedEnergyUnits,energyActionScore
} = require('../../simulation/evaluation/2026-11/agent20-rank15-lopunny-vileplume-opponent-policy.cjs');

const TEMPLE='Temple of Sinnoh ASR 155';
const JET='Jet Energy PAL 190';
const DCE='Double Colorless Energy SUM 136';
const CAPTURE='Capture Energy RCL 171';
const GRASS='Grass Energy BLW 105';
const BUNNEL='Bunnelby PRC 121';
const BUS='Vileplume BUS 6';
const MEGA='Mega Lopunny ex PFL 84';
const FAN='Fan Rotom SCR 118';
const TM='Technical Machine: Evolution PAR 178';

const mon=(printing,energies=[],tools=[],stage='BASIC')=>({
  printing,energies,tools,abilitySuppressions:[],publicRestrictions:{},printed:{stage}
});
const en=(token,printing,target,index,zone='bench')=>({
  kind:'play-card',token,actorPrinting:printing,targetPrinting:target,
  publicMetadata:{targetSeat:'actor',targetZone:zone,
    ...(zone==='bench'?{targetIndex:index}:{}),isOwnerVisible:true}
});
const retreat=(token,target,index)=>({
  kind:'retreat',token,targetPrinting:target,
  publicMetadata:{targetSeat:'actor',targetZone:'bench',
    targetIndex:index,benchIndex:index,isOwnerVisible:true}
});
const mk=(seat,active,bench,items,temple,ownHand=[])=>({
  role:'opponent',seat,prompt:null,
  observation:{
    actorSeat:seat,globalTurn:7,ownHand,
    ownPublic:{active,bench,prizeCount:3,stadium:[]},
    opponentPublic:{active:mon('Shadow Rider Calyrex V CRE 74'),bench:[],prizeCount:3,
      stadium:temple?[TEMPLE]:[]}
  },actionFrontier:{items}
});
const choose=r=>createPolicy({
  role:'opponent',seat:r.seat,policyVersion:POLICY_VERSION,config:{}
}).decide(r);

for(const seat of [0,1]) {
  test('seat '+seat+': Temple changes attached DCE from 2 units to 1 and requires another manual Energy',()=>{
    const mega=mon(MEGA,[DCE],[],'STAGE_1');
    const item=en('grass',GRASS,MEGA,0);
    const r=mk(seat,mon(FAN),[mega],[item],true,[GRASS]);
    assert.equal(energyProvided(DCE,r.observation),1);
    assert.equal(attachedEnergyUnits(mega,r.observation),1);
    assert.equal(energyActionScore(item,r.observation),132);
    assert.deepEqual(choose(r),{kind:'select-action',token:'grass'});
    r.observation.opponentPublic.stadium=[];
    assert.equal(energyProvided(DCE,r.observation),2);
    assert.equal(attachedEnergyUnits(mega,r.observation),2);
    assert.equal(energyActionScore(item,r.observation),0);
    assert.deepEqual(choose(r),{kind:'abstain',reasonCode:'NO_SUPPORTED_ROOT_ACTION'});
  });

  test('seat '+seat+': suppressed Temple restores unsuppressed DCE count',()=>{
    const r=mk(seat,mon(FAN),[mon(MEGA,[DCE],[],'STAGE_1')],[],true);
    r.observation.ownPublic.publicTurnRestrictions={
      stadiumAndToolHaveNoEffectTurnsRemaining:1
    };
    assert.equal(attachedEnergyUnits(r.observation.ownPublic.bench[0],r.observation),2);
  });

  test('seat '+seat+': under Temple actually offered BUS retreat beats fake Jet switch',()=>{
    const r=mk(seat,mon(BUNNEL,[],['Float Stone BKT 137']),[mon(BUS)],
      [en('jet',JET,BUS,0),retreat('retreat',BUS,0)],true,[JET]);
    assert.deepEqual(choose(r),{kind:'select-action',token:'retreat'});
    r.observation.opponentPublic.stadium=[];
    assert.deepEqual(choose(r),{kind:'select-action',token:'jet'});
  });

  test('seat '+seat+': Temple suppresses Jet-to-Bench Mega mobility score',()=>{
    const r=mk(seat,mon(FAN),[mon(MEGA,[GRASS],[],'STAGE_1')],
      [en('jet',JET,MEGA,0)],true,[JET]);
    assert.equal(energyActionScore(r.actionFrontier.items[0],r.observation),135);
    r.observation.opponentPublic.stadium=[];
    assert.equal(energyActionScore(r.actionFrontier.items[0],r.observation),180);
  });

  test('seat '+seat+': Temple removes Capture search-only priority on Fan',()=>{
    const item=en('capture',CAPTURE,FAN,0,'active');
    const r=mk(seat,mon(FAN),[],[item],true,[CAPTURE]);
    assert.equal(energyActionScore(item,r.observation),0);
    assert.deepEqual(choose(r),{kind:'abstain',reasonCode:'NO_SUPPORTED_ROOT_ACTION'});
    r.observation.opponentPublic.stadium=[];
    assert.equal(energyActionScore(item,r.observation),65);
    assert.deepEqual(choose(r),{kind:'select-action',token:'capture'});
  });

  test('seat '+seat+': on Temple, Basic Energy outranks no-switch Jet into TM Bunnelby',()=>{
    const actions=[en('jet',JET,BUNNEL,0),en('grass',GRASS,BUNNEL,0)];
    const r=mk(seat,mon(FAN),[mon(BUNNEL,[],[TM])],actions,true,[JET,GRASS]);
    assert.equal(energyActionScore(actions[0],r.observation),160);
    assert.equal(energyActionScore(actions[1],r.observation),165);
    assert.deepEqual(choose(r),{kind:'select-action',token:'grass'});
  });
}
