'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {summarize}=require('../scripts/rank11-candidate-first-pass-summary.cjs');

test('eight actual candidate-first arms retain only own hand and public board',()=>{
  const own={active:{name:'Mewtwo & Mew-GX',energyCards:[]},bench:[]};
  const other={active:{name:'Oranguru V'},bench:[]};
  const attempts=Array.from({length:8},(_,i)=>({
    sourceSeedIdentity:i<4?'second-a':'second-b',
    candidate:i%4===0?'champion-reference':'new-moon-generic',
    status:'engine-observed',actualSourceFirst:false,
    sourcePolicyCompleted:true,candidateAttackDeclarationCount:0,
    candidateOpeningDecisions:[{turnBefore:1,action:'PassTurnAction'}],
    candidatePassDecisions:[{
      turnBefore:1,ownHandPrintings:['Psychic Energy'],
      ownPublicBoard:own,opposingPublicBoard:other
    }]
  }));
  const x=summarize({
    schema:'rank11-direct-held-shake-candidate-attack-window-source-v2',
    qualifiedCompetitiveGames:0,attempts
  });
  assert.equal(x.candidateFirstArms,8);
  assert.equal(x.entries[1].firstPasses[0].active.name,'Mewtwo & Mew-GX');
  assert.deepEqual(x.entries[1].firstPasses[0].ownHand,['Psychic Energy']);
  assert.equal(x.entries[1].firstPasses[0].opposingActive,'Oranguru V');
  assert.equal(x.entries[1].openingActions[0].action,'PassTurnAction');
  assert.ok(!JSON.stringify(x).includes('opponentHandPrintings'));
});
