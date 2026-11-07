'use strict';

const assert=require('node:assert/strict');
const test=require('node:test');
const {VERSION,projectOwnerRepliesAfterSourcePrize:project}=
  require('../simulation/evaluation/agent3-postprize-owner-reply-projection.cjs');

function sourcePrize(){
  return {
    registeredTrialId:'11:211:A:new-moon-lockbreaker-v1',
    attackRole:'original-source',attackSeat:1,
    attackName:'Psychic',attackDeclarationRootOrdinal:40,
    actualPrizeExitRootOrdinal:42,attackCompletionRootOrdinal:45,
    sameTurn:6,exactPhysicalPrizeCards:1
  };
}
function sourceRow(){
  return {
    trial:{id:'11:211:A:new-moon-lockbreaker-v1'},
    sourceSeat:1,candidateSeat:0,
    rootActionLedger:[
      {actionOrdinal:40,playerSlot:1,action:'AttackAction',turnBefore:6},
      {actionOrdinal:42,playerSlot:1,action:'ResolvePromptAction',turnBefore:6},
      {actionOrdinal:45,playerSlot:1,action:'ResolvePromptAction',turnBefore:6},
      {actionOrdinal:48,playerSlot:0,action:'PlayCardAction',turnBefore:7},
      {actionOrdinal:50,playerSlot:0,action:'PassTurnAction',turnBefore:7}
    ],
    candidateRepliesAfterSourceAttacks:[{
      sourceAttackOrdinal:40,sourceTurn:6,sourceAttackName:'Psychic',
      sameEpochCandidateReplyVerified:true,
      candidateReplyOrdinal:48,candidateReplyTurn:7,
      candidateReplyAction:'PlayCardAction',
      candidateReplyTurnRootSequence:[
        {ordinal:48,action:'PlayCardAction',card:'Fog Crystal'},
        {ordinal:50,action:'PassTurnAction'}
      ],
      candidateReplyTurnFinalPass:{
        ordinal:50,turn:7,
        ownerHandAfterDecision:['Psychic Energy CRE 232','Mewtwo & Mew-GX UNM 71'],
        publicBoardBeforePass:{active:'Mewtwo & Mew-GX'},
        printedBasicEnergyBeforePass:{evidenceType:'printed-basic-energy-cost-only-v1'},
        postChoiceAttackProbe:{tested:[]}
      },
      status:'candidate-other-action'
    }]
  };
}
test('actual physical source Prize roots bind owner's full post-KO response and hand',()=>{
  const projected=project([sourceRow()],[sourcePrize()]);
  assert.equal(VERSION,'agent3-postprize-owner-reply-projection-v1');
  assert.equal(projected.length,1);
  assert.equal(projected[0].registeredTrialId,'11:211:A:new-moon-lockbreaker-v1');
  assert.equal(projected[0].causalOriginalAttackOrdinal,40);
  assert.equal(projected[0].causalSourcePrizeRootOrdinal,42);
  assert.equal(projected[0].firstCandidateResponseRootOrdinal,48);
  assert.equal(projected[0].nativeObservedFinalPassRootOrdinal,50);
  assert.equal(projected[0].candidateOwnerSeat,0);
  assert.deepEqual(projected[0].ownerHandPrintingsBeforeFinalPass,
    ['Psychic Energy CRE 232','Mewtwo & Mew-GX UNM 71']);
  assert.equal(projected[0].ownerHandCapturedAfterPolicyChoice,true);
  assert.equal(projected[0].alternateActionPaperLegalityCertified,false);
});
test('source and contender roles must be interpreted separately',()=>{
  const a=sourcePrize();a.attackRole='fixed-contender';
  assert.deepEqual(project([sourceRow()],[a]),[]);
});
test('wrong native owner seat fails hard',()=>{
  const row=sourceRow();
  row.rootActionLedger[3].playerSlot=1;
  assert.throws(()=>project([row],[sourcePrize()]),
    /Expected values to be strictly equal/);
});
test('fake Pass root invalidates claim that final owner Pass was accepted',()=>{
  const row=sourceRow();
  row.rootActionLedger[4].action='AttackAction';
  assert.throws(()=>project([row],[sourcePrize()]),
    /Expected values to be strictly equal/);
});
test('source Prize cannot be attributed to an earlier-than-completion response',()=>{
  const row=sourceRow();
  row.candidateRepliesAfterSourceAttacks[0].candidateReplyOrdinal=42;
  assert.throws(()=>project([row],[sourcePrize()]),
    /Owner voluntary reply must follow settled Prize-causing attack/);
});
test('cross-turn, altered attack name or foreign original match fail',()=>{
  const row=sourceRow();
  row.candidateRepliesAfterSourceAttacks[0].sourceTurn=8;
  assert.throws(()=>project([row],[sourcePrize()]),
    /Expected values to be strictly equal/);
  row.candidateRepliesAfterSourceAttacks[0].sourceTurn=6;
  row.candidateRepliesAfterSourceAttacks[0].sourceAttackName='Eon Blade';
  assert.throws(()=>project([row],[sourcePrize()]),
    /Expected values to be strictly equal/);
  assert.throws(()=>project([row],[{...sourcePrize(),registeredTrialId:'other'}]),
    /exact registered native trial/);
});
test('duplicate source-root reply packets cannot create an arbitrary matching answer',()=>{
  const row=sourceRow();
  row.candidateRepliesAfterSourceAttacks.push(
    {...row.candidateRepliesAfterSourceAttacks[0]});
  assert.throws(()=>project([row],[sourcePrize()]),
    /exactly one existing owner reply/);
});
test('censored game with no next root preserves missing opportunity without inventing hand',()=>{
  const row=sourceRow(),response=row.candidateRepliesAfterSourceAttacks[0];
  response.candidateReplyOrdinal=null;response.candidateReplyTurn=null;
  response.candidateReplyAction=null;response.candidateReplyTurnRootSequence=[];
  response.candidateReplyTurnFinalPass=null;response.status='no-followup-root';
  response.sameEpochCandidateReplyVerified=false;
  const [result]=project([row],[sourcePrize()]);
  assert.equal(result.firstCandidateResponseRootOrdinal,null);
  assert.equal(result.ownerHandPrintingsBeforeFinalPass,null);
  assert.equal(result.ownerHandCapturedAfterPolicyChoice,false);
  assert.equal(result.alternateActionPaperLegalityCertified,false);
});
