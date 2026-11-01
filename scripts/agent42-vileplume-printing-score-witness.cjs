'use strict';

const assert=require('node:assert/strict');
const {scoreOffer,VERSION}=
  require('../simulation/twinleaf/agent41-same-root-proposal-choice.cjs');
const field=require('../results/aichi-2026/full-decklists.json');

/**
 * This is a read-only pure-policy witness. It does not dispatch a native
 * action, assert actual board prevalence, or claim a strategic win.
 * @param {string} targetPrinting
 * @param {'active'|'bench'} slot
 */
function scoreVileplumeHood(targetPrinting,slot){
  const pokemon={name:'Vileplume',printing:targetPrinting,tools:[],
    attacks:[]};
  const view={
    decisionKind:'owner-root',globalTurn:4,
    ownHand:['Stealthy Hood UNB'],
    ownPublic:{active:slot==='active'?pokemon:{name:'Oddish'},
      bench:slot==='bench'?[pokemon]:[],publicTurnRestrictions:{}},
    ownTurnResources:{}
  };
  const proposal={source:'owner-tool',intent:{
    kind:'attach-tool-candidate',printing:'Stealthy Hood UNB',
    handIndex:0,slot,index:0,nativeDispatchImplemented:true
  }};
  return scoreOffer(view,{}, {kind:'pass'},proposal,
    {nativeToolAttachRoot:true});
}

function run(){
  const rank15=field.decks.find(d=>d.rank===15);
  const vileplume=rank15.cards.filter(c=>c.name==='Vileplume');
  assert.equal(vileplume.length,2);
  assert.ok(vileplume.some(c=>c.printing.set==='AOR'&&c.printing.number==='3'));
  assert.ok(vileplume.some(c=>c.printing.set==='BUS'&&c.printing.number==='6'));
  const benchItemLock=scoreVileplumeHood('Vileplume AOR','bench');
  const benchInactiveBasicLock=scoreVileplumeHood('Vileplume BUS','bench');
  const activeBasicLock=scoreVileplumeHood('Vileplume BUS','active');
  return {
    schema:'agent42-vileplume-same-name-score-witness-v1',
    inspectedVersion:VERSION,
    rank:15,
    benchItemLock,benchInactiveBasicLock,activeBasicLock,
    equalScores:benchItemLock.score===benchInactiveBasicLock.score&&
      benchInactiveBasicLock.score===activeBasicLock.score,
    scope:'Hypothetical owned root, pure score only; no native Store witness',
    competitiveQualifiedGames:0
  };
}

if(require.main===module)process.stdout.write(JSON.stringify(run(),null,2)+'\n');
module.exports={scoreVileplumeHood,run};
