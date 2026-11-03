'use strict';

const assert=require('node:assert/strict');
const test=require('node:test');
const {auditTutorV2TerminalPeriod}=require('../scripts/agent11-terminalperiod-payoff-audit.cjs');

/** @param {number} damage @param {boolean} settled @param {string} attackName */
function eventFor(damage=0,settled=true,attackName='Terminal Period'){
  const before=[
    {active:{name:'Mega Absol ex',damage:0}},
    {active:{name:'Mew V',damage}}
  ];
  const after=[
    {active:{name:'Mega Absol ex',damage:0}},
    {active:{name:'Mew V',damage}}
  ];
  return {actionOrdinal:12,turnBefore:3,triggerAction:'AttackAction',
    triggerPlayerSlot:0,
    declarations:[{playerName:'research-A',attackName}],
    before,after,beforePrizesRemaining:[6,6],
    promptPendingAfter:true,
    settled:settled?{after,prizesRemaining:[6,6]}:null};
}

/** @param {string} mode */
function initialRow(mode){
  return {id:'source11-'+mode,mode,rank5Seat:1,seed:11312103,
    maxActions:90,engine:'fixture-pin',nativeStatus:'native-capped',
    firstTurnSlot:0,initialFullPhysicalDealDigest:'matched-full-deal',
    rootActionLedgerSha:'frozen-root-'+mode,
    decisionTraceSha:'frozen-trace-'+mode,
    nativeFinished:false,nativeWinner:null,
    tutorAudit:{acceptedItems:mode==='resource-tutor'?1:0},
    rootActionLedger:[{actionOrdinal:12,action:'AttackAction',playerSlot:0}],
    publicAttackTransitions:[eventFor()]};
}

/** @returns {{frozen:object,replay:object}} */
function fixture(){
  const rows=[initialRow('control'),initialRow('resource-tutor')];
  const snapshot=rows.map(row=>{
    const clone=structuredClone(row);
    delete clone.publicAttackTransitions;
    return clone;
  });
  const common={schema:'agent11-owner-resource-tutor-bilateral-v2',
    registrationSha256:'fixture-registration',engine:'fixture-pin',
    codeVersion:'fixture-hook',sourcePhysicalParityMatched:1};
  return {frozen:{...common,rows:snapshot},
    replay:{...common,
      attackTraceReplay:'read-only-retrospective-v2-source-payoff-audit-v1',
      rows}};
}

test('exactly observed native attacks with no six-counter condition show zero prize payoff',()=>{
  const {frozen,replay}=fixture();
  const a=auditTutorV2TerminalPeriod(frozen,replay);
  assert.equal(a.immutableRowsCompared,2);
  assert.deepEqual(a.attackNames,{'Terminal Period':2});
  assert.deepEqual(a.defendingActivePreAttackDamage,{'0':2});
  assert.equal(a.byMode.control.sourceAttackRoots,1);
  assert.equal(a.byMode['resource-tutor'].settled,1);
  assert.equal(a.byMode['resource-tutor'].sourcePrizeGains,0);
  assert.equal(a.byMode['resource-tutor'].printedSixCounterConditionMet,0);
  assert.equal(a.opponentRank5AttackRoots,0);
  assert.equal(a.competitivelyQualifiedGames,0);
});

test('exact printed six-counter gate distinguishes 50 from 60 damage',()=>{
  const {frozen,replay}=fixture();
  replay.rows[0].publicAttackTransitions=[eventFor(50)];
  replay.rows[1].publicAttackTransitions=[eventFor(60)];
  const a=auditTutorV2TerminalPeriod(frozen,replay);
  assert.equal(a.byMode.control.printedSixCounterConditionMet,0);
  assert.equal(a.byMode['resource-tutor'].printedSixCounterConditionMet,1);
  assert.deepEqual(a.defendingActivePreAttackDamage,{'50':1,'60':1});
});

test('censored prompt is not misreported as a settled attack',()=>{
  const {frozen,replay}=fixture();
  replay.rows[1].publicAttackTransitions=[eventFor(0,false)];
  const a=auditTutorV2TerminalPeriod(frozen,replay);
  assert.equal(a.byMode['resource-tutor'].sourceAttackRoots,1);
  assert.equal(a.byMode['resource-tutor'].settled,0);
  assert.equal(a.byMode['resource-tutor'].censored,1);
  assert.equal(a.byMode['resource-tutor'].sourcePrizeGains,0);
});

test('read-only replay that changes a source root ledger fails before payoff inference',()=>{
  const {frozen,replay}=fixture();
  replay.rows[1].rootActionLedgerSha='different-root';
  assert.throws(()=>auditTutorV2TerminalPeriod(frozen,replay),
    /Read-only replay changed rootActionLedgerSha/);
});

test('read-only replay that changes physical deal or tutor settlement is rejected',()=>{
  const first=fixture();
  first.replay.rows[0].initialFullPhysicalDealDigest='changed';
  assert.throws(()=>auditTutorV2TerminalPeriod(first.frozen,first.replay),
    /Read-only replay changed initialFullPhysicalDealDigest/);
  const second=fixture();
  second.replay.rows[1].tutorAudit.acceptedItems=2;
  assert.throws(()=>auditTutorV2TerminalPeriod(second.frozen,second.replay),
    /Read-only replay changed selected tutor actions/);
});

test('a missing public Store effect trace cannot become success',()=>{
  const {frozen,replay}=fixture();
  replay.rows[1].publicAttackTransitions=[];
  assert.throws(()=>auditTutorV2TerminalPeriod(frozen,replay),
    /Native source attack lacks same-root effect trace/);
});

test('preserves an alternative printed attack name without inventing its effect',()=>{
  const {frozen,replay}=fixture();
  replay.rows[1].publicAttackTransitions=[eventFor(0,true,'Claw of Darkness')];
  const a=auditTutorV2TerminalPeriod(frozen,replay);
  assert.equal(a.attackNames['Claw of Darkness'],1);
  assert.equal(a.attackNames['Terminal Period'],1);
  assert.equal(a.byMode['resource-tutor'].printedSixCounterConditionMet,0);
});

test('source seat mapping includes opposing rank5 attacks as a competence diagnostic',()=>{
  const {frozen,replay}=fixture();
  replay.rows[0].rootActionLedger.push({
    actionOrdinal:13,action:'AttackAction',playerSlot:1});
  frozen.rows[0].rootActionLedger.push({
    actionOrdinal:13,action:'AttackAction',playerSlot:1});
  assert.equal(auditTutorV2TerminalPeriod(frozen,replay).opponentRank5AttackRoots,1);
});
