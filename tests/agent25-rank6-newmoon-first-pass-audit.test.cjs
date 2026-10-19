'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {summarizeCandidatePass}=require(
  '../simulation/evaluation/agent25-rank6-newmoon-first-pass-audit.cjs');

test('reports only passing owner-hand and public-board perspective',()=>{
  const game={decisionTrace:[
    {actionOrdinal:4,playerSlot:1,turnBefore:3,action:'PlayCardAction',
      decisionHandBefore:{ownHandPrintings:['unrelated private'],opponentHandSize:4}},
    {actionOrdinal:5,playerSlot:0,turnBefore:3,action:'PlayCardAction',
      card:'Telepathic Psychic Energy',decisionHandBefore:{
        ownHandPrintings:['Telepathic Psychic Energy MEG'],opponentHandSize:5}},
    {actionOrdinal:6,playerSlot:0,turnBefore:3,action:'PassTurnAction',
      decisionHandBefore:{ownHandPrintings:['Fog Crystal CRE'],opponentHandSize:5},
      publicBoardBeforePass:{publicBoard:'visible'},
      attackPassProbe:{tested:[{name:'Horror House-GX',engineAcceptedAnnouncement:false}]}}
  ]};
  const x=summarizeCandidatePass(game,0);
  assert.equal(x.passOrdinal,6);
  assert.deepEqual(x.ownerHandAtPass,['Fog Crystal CRE']);
  assert.equal(x.opponentHandCount,5);
  assert.deepEqual(x.publicBoardAtPass,{publicBoard:'visible'});
  assert.equal(x.firstResponseActions.length,2);
  assert.equal(x.alreadyChosenPassAttackProbe.tested[0].engineAcceptedAnnouncement,false);
  assert.equal(JSON.stringify(x).includes('unrelated private'),false);
});

test('rejects missing, duplicated and alternate-seat pass witnesses',()=>{
  const candidate={playerSlot:0,turnBefore:3,action:'PassTurnAction'};
  assert.throws(()=>summarizeCandidatePass({decisionTrace:[]},0));
  assert.throws(()=>summarizeCandidatePass({decisionTrace:[candidate,candidate]},0));
  assert.throws(()=>summarizeCandidatePass({decisionTrace:[candidate]},1));
  assert.throws(()=>summarizeCandidatePass({decisionTrace:[candidate]},2));
});
