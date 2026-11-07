'use strict';

const assert=require('node:assert/strict');
const test=require('node:test');
const {
  VERSION,auditMimikyuCopycatEonBlade
}=require('../simulation/evaluation/agent3-mimikyu-copycat-eon-blade-eligibility.cjs');

const trialId='1:212:B:champion-reference';

function fixture(){
  const sourceBoard=[
    {active:{printing:'Latias ex SSP'},bench:[],stadium:['Sky Field']},
    {active:{printing:'Mimikyu GRI'},bench:[],stadium:[]}
  ];
  const candidateBoard=[
    {active:{printing:'Latias ex SSP'},bench:[],stadium:[]},
    {active:{
      printing:'Mimikyu GRI',
      energyCards:['Psychic Energy','Psychic Energy'],
      toolCards:[],
      printedAttacks:[
        {name:'Filch',cost:['Colorless']},
        {name:'Copycat',cost:['Psychic','Colorless']}
      ]
    },bench:[],stadium:['Sky Field']}
  ];
  const prior={
    actionOrdinal:10,turnBefore:4,attackName:'Eon Blade',
    completionRootOrdinal:11,settledPromptChain:true,
    settlementCrossesClockReset:false,delegatedCopy:false,
    publicBoardBefore:sourceBoard
  };
  const current={
    actionOrdinal:20,turnBefore:5,attackName:'Eon Blade',
    triggerAction:'ResolvePromptAction',delegatedCopy:true,
    completionRootOrdinal:22,settledPromptChain:true,
    settlementCrossesClockReset:false,publicBoardBefore:candidateBoard
  };
  const attempt={
    trial:{id:trialId,candidateId:'champion-reference'},
    sourceSeat:0,candidateSeat:1,
    sourceAttackSettlement:{attacks:[prior]},
    candidateAttackSettlement:{attacks:[current]},
    rootActionLedger:[
      {actionOrdinal:10,turnBefore:4,turnAfter:4,playerSlot:0,
        action:'AttackAction',attack:'Eon Blade'},
      {actionOrdinal:15,turnBefore:5,turnAfter:5,playerSlot:1,
        action:'AttackAction',attack:'Copycat'},
      {actionOrdinal:20,turnBefore:5,turnAfter:5,playerSlot:1,
        action:'ResolvePromptAction',
        attackChoice:{printing:'Latias ex SSP',attackName:'Eon Blade'}}
    ]
  };
  const root={
    registeredTrialId:trialId,attackRole:'fixed-contender',
    attackSeat:1,attackName:'Eon Blade',
    attackDeclarationRootOrdinal:20,sameTurn:5
  };
  const preAttack={
    registeredTrialId:trialId,acceptedDeclarationOrdinal:20,
    attackerPrintingFromActualNativeBoard:'Mimikyu GRI',
    attackerEnergyNamesBeforeAttack:['Psychic Energy','Psychic Energy']
  };
  const nominal={
    trialId,attackName:'Eon Blade',originalRank:1,
    rosterAttackerPrintedId:'sv8-76',rosterAttackerName:'Latias ex'
  };
  const originalField={decks:[{rank:1,cards:[
    {category:'Pokémon',name:'Latias ex',
      printing:{set:'SSP',number:'76'}},
    {category:'Pokémon',name:'Mimikyu',
      printing:{set:'GRI',number:'58'}}
  ]}]};
  return {
    attempts:[attempt],prizeAttacks:[root],preAttackRows:[preAttack],
    printedRows:[nominal],originalField,attempt,root,prior,current
  };
}

function audit(f){
  return auditMimikyuCopycatEonBlade(
    f.attempts,f.prizeAttacks,f.preAttackRows,
    f.printedRows,f.originalField
  );
}

test('Mimikyu pays its own Copycat cost and copies the prior-turn non-GX Eon Blade',()=>{
  const f=fixture();
  const result=audit(f);
  assert.equal(result.version,VERSION);
  assert.equal(result.rows.length,1);
  const row=result.rows[0];
  assert.equal(row.paperCopycatConditionSupported,true,row.failureReasons.join(', '));
  assert.deepEqual(row.copycatPrintedCost,['Psychic','Colorless']);
  assert.deepEqual(row.donorPrintedAttackCost,['Psychic','Psychic','Colorless']);
  assert.equal(row.donorCostAppliedToMimikyu,false);
  assert.equal(row.copycatCostFunding.status,'POSSIBLE');
  assert.equal(row.priorOpponentAttackWasImmediatelyPreviousTurn,true);
  assert.equal(row.priorOpponentAttackNonGx,true);
  assert.equal(row.actualAttachedEnergyPaymentCertified,false);
  assert.equal(row.paperGameCertified,false);
});

test('Dimension Valley reduces one Colorless from Psychic Mimikyu Copycat',()=>{
  const f=fixture();
  f.attempt.candidateAttackSettlement.attacks[0].publicBoardBefore[0].stadium=[];
  f.attempt.candidateAttackSettlement.attacks[0].publicBoardBefore[1].stadium=
    ['Dimension Valley'];
  f.attempt.candidateAttackSettlement.attacks[0].publicBoardBefore[1].active.energyCards=
    ['Psychic Energy'];
  f.preAttackRows[0].attackerEnergyNamesBeforeAttack=['Psychic Energy'];
  const row=audit(f).rows[0];
  assert.equal(row.paperCopycatConditionSupported,true,row.failureReasons.join(', '));
  assert.deepEqual(row.effectiveCopycatCostAfterKnownStadiums,['Psychic']);
  assert.equal(row.copycatCostFunding.status,'POSSIBLE');
});

test('an Eon Blade from an earlier turn cannot satisfy Copycat last-turn text',()=>{
  const f=fixture();
  f.prior.turnBefore=3;
  const row=audit(f).rows[0];
  assert.equal(row.paperCopycatConditionSupported,false);
  assert.ok(row.failureReasons.includes(
    'no-settled-matching-opponent-attack-on-immediately-previous-turn'));
});

test('an unsettled prior Eon Blade cannot satisfy the temporal condition',()=>{
  const f=fixture();
  f.prior.settledPromptChain=false;
  const row=audit(f).rows[0];
  assert.equal(row.paperCopycatConditionSupported,false);
  assert.ok(row.failureReasons.includes(
    'no-settled-matching-opponent-attack-on-immediately-previous-turn'));
});

test('insufficient Psychic/Colorless Energy fails the printed Copycat cost gate',()=>{
  const f=fixture();
  f.current.publicBoardBefore[1].active.energyCards=['Water Energy'];
  f.preAttackRows[0].attackerEnergyNamesBeforeAttack=['Water Energy'];
  const row=audit(f).rows[0];
  assert.equal(row.copycatCostFunding.status,'IMPOSSIBLE');
  assert.equal(row.paperCopycatConditionSupported,false);
  assert.ok(row.failureReasons.includes(
    'Mimikyu-Copycat-printed-cost-not-directly-funded'));
});

test('unknown Stadium cost modifiers fail closed',()=>{
  const f=fixture();
  f.current.publicBoardBefore[1].stadium=['Unknown Stadium'];
  const row=audit(f).rows[0];
  assert.equal(row.copycatCostFunding.status,'UNVERIFIED');
  assert.equal(row.paperCopycatConditionSupported,false);
  assert.ok(row.failureReasons.includes('unmodeled-Stadium-cost-modifier'));
});

test('a different delegated attack source cannot be joined to the prior Eon Blade',()=>{
  const f=fixture();
  f.attempt.rootActionLedger[2].attackChoice.printing='Mewtwo & Mew-GX UNM';
  const row=audit(f).rows[0];
  assert.equal(row.paperCopycatConditionSupported,false);
  assert.ok(row.failureReasons.includes(
    'current-copied-attack-choice-does-not-match-donor'));
});

test('a clock reset between the prior attack and Copycat breaks the join',()=>{
  const f=fixture();
  f.attempt.rootActionLedger.splice(1,0,{
    actionOrdinal:12,turnBefore:4,turnAfter:0,playerSlot:0,
    action:'NativeReplayReset'
  });
  const row=audit(f).rows[0];
  assert.equal(row.paperCopycatConditionSupported,false);
  assert.ok(row.failureReasons.includes(
    'clock-reset-between-prior-attack-and-Copycat'));
});

test('a non-Copycat physical Active cannot inherit the copied donor attack',()=>{
  const f=fixture();
  f.current.publicBoardBefore[1].active.printing='Latias ex SSP';
  f.preAttackRows[0].attackerPrintingFromActualNativeBoard='Latias ex SSP';
  const row=audit(f).rows[0];
  assert.equal(row.paperCopycatConditionSupported,false);
  assert.ok(row.failureReasons.includes('physical-attacker-is-not-Mimikyu-GRI'));
});

test('missing physical Copycat AttackAction root fails closed',()=>{
  const f=fixture();
  f.attempt.rootActionLedger=f.attempt.rootActionLedger.filter(row=>
    row.attack!=='Copycat');
  const row=audit(f).rows[0];
  assert.equal(row.paperCopycatConditionSupported,false);
  assert.ok(row.failureReasons.includes(
    'physical-Copycat-AttackAction-root-missing'));
});
