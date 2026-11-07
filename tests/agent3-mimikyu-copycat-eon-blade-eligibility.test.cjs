'use strict';

const assert=require('node:assert/strict');
const test=require('node:test');
const {
  VERSION,auditMimikyuCopycatEonBlade
}=require('../simulation/evaluation/agent3-mimikyu-copycat-eon-blade-eligibility.cjs');

const trialId='1:212:B:champion-reference';

function fixture(){
  const priorBoard=[
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
    publicBoardBefore:priorBoard
  };
  const current={
    actionOrdinal:20,turnBefore:5,attackName:'Eon Blade',
    triggerAction:'ResolvePromptAction',delegatedCopy:true,
    initiatingRootActionOrdinal:15,
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
        action:'AttackAction',attack:'Copycat',
        initiatingRootActionOrdinal:15},
      {actionOrdinal:20,turnBefore:5,turnAfter:5,playerSlot:1,
        action:'ResolvePromptAction',initiatingRootActionOrdinal:15,
        attackChoice:{printing:'Latias ex SSP',attackName:'Eon Blade'}}
    ]
  };
  const originalField={decks:[{rank:1,cards:[
    {category:'Pokémon',name:'Latias ex',
      printing:{set:'SSP',number:'76'}},
    {category:'Pokémon',name:'Mimikyu',
      printing:{set:'GRI',number:'58'}}
  ]}]};
  return {attempts:[attempt],originalField,attempt,prior,current};
}

function audit(f){
  return auditMimikyuCopycatEonBlade(f.attempts,f.originalField);
}

test('Mimikyu Copycat joins its own cost to a settled prior-turn non-GX Eon Blade',()=>{
  const f=fixture();
  const result=audit(f);
  assert.equal(result.version,VERSION);
  assert.equal(result.scannedAttackCount,2);
  assert.equal(result.eonBladeAttackCount,2);
  assert.equal(result.observedMimikyuCopycatEonBladeEvents,1);
  assert.equal(result.supportedRows,1);
  const row=result.rows[0];
  assert.equal(row.paperCopycatConditionSupported,true,row.failureReasons.join(', '));
  assert.equal(row.attackRole,'fixed-contender');
  assert.deepEqual(row.copycatPrintedCost,['Psychic','Colorless']);
  assert.deepEqual(row.donorPrintedAttackCost,['Psychic','Psychic','Colorless']);
  assert.equal(row.donorCostAppliedToMimikyu,false);
  assert.equal(row.copycatCostFunding.status,'POSSIBLE');
  assert.equal(row.priorOpponentAttackWasImmediatelyPreviousTurn,true);
  assert.equal(row.priorOpponentAttackNonGx,true);
  assert.equal(row.actualAttachedEnergyPaymentCertified,false);
  assert.equal(row.paperGameCertified,false);
});

test('the same join works when Mimikyu is the original-source seat',()=>{
  const f=fixture();
  const attempt=f.attempt;
  const current=attempt.candidateAttackSettlement.attacks[0];
  const prior=attempt.sourceAttackSettlement.attacks[0];
  current.publicBoardBefore[0].active={
    printing:'Mimikyu GRI',
    energyCards:['Psychic Energy','Psychic Energy'],
    toolCards:[],
    printedAttacks:[
      {name:'Copycat',cost:['Psychic','Colorless']}
    ]
  };
  current.publicBoardBefore[1].active={printing:'Latias ex SSP'};
  prior.publicBoardBefore[0].active={printing:'Mimikyu GRI'};
  prior.publicBoardBefore[1].active={printing:'Latias ex SSP'};
  attempt.sourceAttackSettlement.attacks=[current];
  attempt.candidateAttackSettlement.attacks=[prior];
  attempt.rootActionLedger=[
    {actionOrdinal:10,turnBefore:4,turnAfter:4,playerSlot:1,
      action:'AttackAction',attack:'Eon Blade'},
    {actionOrdinal:15,turnBefore:5,turnAfter:5,playerSlot:0,
      action:'AttackAction',attack:'Copycat'},
    {actionOrdinal:20,turnBefore:5,turnAfter:5,playerSlot:0,
      action:'ResolvePromptAction',
      attackChoice:{printing:'Latias ex SSP',attackName:'Eon Blade'}}
  ];
  const row=audit(f).rows[0];
  assert.equal(row.attackRole,'original-source');
  assert.equal(row.attackerSeat,0);
  assert.equal(row.opponentSeat,1);
  assert.equal(row.paperCopycatConditionSupported,true,row.failureReasons.join(', '));
});

test('direct Latias ex Eon Blade attacks are excluded from the Copycat audit',()=>{
  const f=fixture();
  f.current.delegatedCopy=false;
  f.current.triggerAction='AttackAction';
  f.current.publicBoardBefore[1].active={
    printing:'Latias ex SSP',
    energyCards:['Psychic Energy','Psychic Energy','Psychic Energy'],
    printedAttacks:[{name:'Eon Blade',cost:['Psychic','Psychic','Colorless']}]
  };
  const result=audit(f);
  assert.equal(result.observedMimikyuCopycatEonBladeEvents,0);
  assert.equal(result.noMimikyuCopycatEonBladeObserved,true);
  assert.deepEqual(result.rows,[]);
});

test('Dimension Valley with one Psychic remains unverified without suppression and New Moon state',()=>{
  const f=fixture();
  f.current.publicBoardBefore[1].stadium=['Dimension Valley'];
  f.current.publicBoardBefore[1].active.energyCards=['Psychic Energy'];
  const row=audit(f).rows[0];
  assert.equal(row.copycatCostFunding.status,'UNVERIFIED');
  assert.equal(row.paperCopycatConditionSupported,false);
  assert.ok(row.failureReasons.includes(
    'Mimikyu-Copycat-cost-unverified-under-Stadium-state'));
});

test('Dimension Valley does not matter when attached Energy pays the full printed cost',()=>{
  const f=fixture();
  f.current.publicBoardBefore[1].stadium=['Dimension Valley'];
  const row=audit(f).rows[0];
  assert.equal(row.copycatCostFunding.status,'POSSIBLE');
  assert.equal(row.paperCopycatConditionSupported,true,row.failureReasons.join(', '));
});

test('insufficient Energy without a known reducer fails the printed Copycat cost gate',()=>{
  const f=fixture();
  f.current.publicBoardBefore[1].active.energyCards=['Water Energy'];
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
  assert.ok(row.failureReasons.includes('unmodeled-or-conflicting-Stadium-state'));
});

test('conflicting public Stadiums fail closed',()=>{
  const f=fixture();
  f.current.publicBoardBefore[0].stadium=['Sky Field'];
  f.current.publicBoardBefore[1].stadium=['Dimension Valley'];
  const row=audit(f).rows[0];
  assert.equal(row.conflictingStadiums,true);
  assert.equal(row.copycatCostFunding.status,'UNVERIFIED');
  assert.equal(row.paperCopycatConditionSupported,false);
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

test('a different delegated attack source cannot be joined to the prior Eon Blade',()=>{
  const f=fixture();
  f.attempt.rootActionLedger[2].attackChoice.printing='Mewtwo & Mew-GX UNM';
  const row=audit(f).rows[0];
  assert.equal(row.paperCopycatConditionSupported,false);
  assert.ok(row.failureReasons.includes(
    'current-copied-attack-choice-does-not-match-donor'));
});

test('delegated attack and Store root must share the exact Copycat initiating ordinal',()=>{
  const attackMismatch=fixture();
  attackMismatch.current.initiatingRootActionOrdinal=14;
  const attackRow=audit(attackMismatch).rows[0];
  assert.equal(attackRow.currentCopycatLineageValid,false);
  assert.ok(attackRow.failureReasons.includes(
    'current-copied-attack-not-initiated-by-this-Copycat-root'));

  const rootMismatch=fixture();
  rootMismatch.attempt.rootActionLedger[2].initiatingRootActionOrdinal=16;
  const rootRow=audit(rootMismatch).rows[0];
  assert.equal(rootRow.currentCopycatLineageValid,false);
  assert.ok(rootRow.failureReasons.includes(
    'current-copied-attack-not-initiated-by-this-Copycat-root'));
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

test('missing physical Copycat AttackAction root fails closed',()=>{
  const f=fixture();
  f.attempt.rootActionLedger=f.attempt.rootActionLedger.filter(row=>
    row.attack!=='Copycat');
  const row=audit(f).rows[0];
  assert.equal(row.paperCopycatConditionSupported,false);
  assert.ok(row.failureReasons.includes(
    'physical-Copycat-AttackAction-root-missing'));
});


test('New Moon pair across Active and Bench is surfaced without assuming a Valley discount',()=>{
  const f=fixture();
  f.current.publicBoardBefore[1].stadium=['Dimension Valley'];
  f.current.publicBoardBefore[1].active.energyCards=['Psychic Energy'];
  f.current.publicBoardBefore[1].bench=[
    {printing:'Lunatone OBF'},{printing:'Solrock CES'}
  ];
  const row=audit(f).rows[0];
  assert.equal(row.newMoonPairVisible,true);
  assert.equal(row.copycatCostFunding.status,'UNVERIFIED');
  assert.equal(row.paperCopycatConditionSupported,false);
});
