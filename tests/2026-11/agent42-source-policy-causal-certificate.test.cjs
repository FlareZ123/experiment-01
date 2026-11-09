'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {
  VERSION,firstRootDifference,certifyGroup,certifyCohort
} = require('../../simulation/evaluation/2026-11/agent42-source-policy-causal-certificate.cjs');

const PHASES = ['P0S0','P1S0','P0S1','P1S1'];
const trial = Object.freeze({id:'11:0:B:new-moon-lockbreaker-v1',
  rank:11,seed:3592222510,candidateSlot:'B',
  candidateId:'new-moon-lockbreaker-v1'});

function root(seat,action,ordinal=100,detail={}) {
  return {actionOrdinal:ordinal,turnBefore:18,playerSlot:seat,
    action,...detail};
}
function fourArms(t=trial) {
  const source = t.candidateSlot === 'A' ? 1 : 0;
  const candidate = 1-source;
  const common = [root(candidate,'PlayCardAction',98,{card:'Fog Crystal'}),
    root(source,'PassTurnAction',99)];
  const attack = root(source,'AttackAction',100,{attack:'Psychic'});
  const quickBall = root(source,'PlayCardAction',100,{card:'Quick Ball'});
  const row = roots => ({trial:{...t},
    sourceDealFingerprint:'source-full-physical-seed',
    fullPhysicalDealFingerprint:'full-both-physical-seed',
    actualStarterSeat:1,status:'native-terminal',finished:true,
    winner:candidate,rootActionLedger:roots});
  return {
    P0S0:row([...common,attack]),
    P1S0:row([...common,attack]),
    P0S1:row([...common,quickBall]),
    P1S1:row([...common,quickBall])
  };
}

test('actual rank11 reported action choice is recognized as source attack displaced',()=>{
  assert.match(VERSION,/agent42/);
  const result = certifyGroup(fourArms(),trial);
  assert.equal(result.physicalGate.admitted,true);
  assert.equal(result.sourceSeat,0);
  assert.equal(result.candidateSeat,1);
  assert.equal(result.withoutPivot.status,'SOURCE_ATTACK_DISPLACED');
  assert.equal(result.withPivot.status,'SOURCE_ATTACK_DISPLACED');
  assert.equal(result.withoutPivot.firstDifference.index,2);
  assert.equal(result.withoutPivot.firstDifference.challenger.card,'Quick Ball');
  assert.equal(result.withoutPivot.displacedAttack.attack,'Psychic');
  assert.equal(result.withoutPivot.displacedAttack.settlement,
    'NO_SETTLEMENT_RECEIPT');
  assert.equal(result.withoutPivot.actionReceipt,'NO_NATIVE_SIDECAR');
  assert.equal(result.effectiveInnermostChooserSeatIsolation,
    'NOT_PROVEN_BY_LEDGER_ONLY');
  assert.equal(result.competitivePaperQualifiedGames,0);
});

test('opposite physical seat attributes new source action to source',()=>{
  const t={...trial,candidateSlot:'A',id:'5:0:A:new-moon-lockbreaker-v1',rank:5};
  const arms=fourArms(t);
  assert.equal(certifyGroup(arms,t).sourceSeat,1);
  assert.equal(certifyGroup(arms,t).withoutPivot.status,'SOURCE_ATTACK_DISPLACED');
});

test('candidate action first difference fails source isolation',()=>{
  const arms=fourArms();
  arms.P0S1.rootActionLedger[0]=root(1,'UseAbilityAction',98,
    {ability:'Underworld Door'});
  assert.equal(certifyGroup(arms,trial).withoutPivot.status,
    'CANDIDATE_OR_CROSS_SEAT_FIRST_DIVERGENCE');
});

test('invalid cross-seat first divergence is not treated as source',()=>{
  const arms=fourArms();
  arms.P0S1.rootActionLedger[2].playerSlot=1;
  assert.equal(certifyGroup(arms,trial).withoutPivot.status,
    'CANDIDATE_OR_CROSS_SEAT_FIRST_DIVERGENCE');
});

test('all four source/full physical deals and first player must match',()=>{
  const arms=fourArms();
  arms.P1S1.fullPhysicalDealFingerprint='different';
  const r=certifyGroup(arms,trial);
  assert.equal(r.physicalGate.admitted,false);
  assert.equal(r.withoutPivot.status,'INVALID_PHYSICAL_OR_REGISTRATION');
  assert.equal(r.withPivot.status,'INVALID_PHYSICAL_OR_REGISTRATION');
  arms.P1S1.fullPhysicalDealFingerprint=arms.P0S0.fullPhysicalDealFingerprint;
  arms.P1S1.actualStarterSeat=0;
  assert.equal(certifyGroup(arms,trial).physicalGate.admitted,false);
});

test('registration identity and printed sixty selector cannot drift',()=>{
  const arms=fourArms();
  arms.P0S1.trial.seed++;
  assert.equal(certifyGroup(arms,trial).physicalGate.allRegistered,false);
  assert.equal(certifyGroup(arms,trial).withoutPivot.status,
    'INVALID_PHYSICAL_OR_REGISTRATION');
});

test('first divergence requires same ordinal and global turn',()=>{
  const arms=fourArms();
  arms.P0S1.rootActionLedger[2].actionOrdinal=101;
  assert.equal(certifyGroup(arms,trial).withoutPivot.status,
    'UNALIGNED_ACCEPTED_ROOTS');
  arms.P0S1.rootActionLedger[2].actionOrdinal=100;
  arms.P0S1.rootActionLedger[2].turnBefore=19;
  assert.equal(certifyGroup(arms,trial).withoutPivot.status,
    'UNALIGNED_ACCEPTED_ROOTS');
});

test('prompt-only differences and missing root ledger fail closed',()=>{
  const arms=fourArms();
  arms.P0S1.rootActionLedger[2].action='ResolvePromptAction';
  assert.equal(certifyGroup(arms,trial).withoutPivot.status,
    'PROMPT_ONLY_FIRST_DIVERGENCE');
  delete arms.P0S1.rootActionLedger;
  assert.equal(certifyGroup(arms,trial).withoutPivot.status,
    'MISSING_ROOT_LEDGER');
});

test('one-sided trailing root does not certify a changed source choice',()=>{
  const arms=fourArms();
  arms.P0S0.rootActionLedger.splice(2);
  const result=certifyGroup(arms,trial);
  assert.equal(result.withoutPivot.status,'INCOMPLETE_DIFFERENT_LENGTH_PREFIX');
});

test('identical accepted roots are inactive despite a registered flag',()=>{
  const arms=fourArms();
  arms.P0S1.rootActionLedger=arms.P0S0.rootActionLedger;
  arms.P1S1.rootActionLedger=arms.P1S0.rootActionLedger;
  const result=certifyGroup(arms,trial);
  assert.equal(result.withoutPivot.status,'INACTIVE_SOURCE_TREATMENT');
  assert.equal(result.withPivot.status,'INACTIVE_SOURCE_TREATMENT');
  assert.equal(result.ownerPaymentCertified,false);
});

test('positive native payment receipt is strictly narrower than Store acceptance',()=>{
  const arms=fourArms();
  const event={rootActionOrdinal:100,playerSlot:0,action:'PlayCardAction',
    storeAccepted:true};
  arms.P0S1.nativeAcceptedTargetSidecar={events:[event]};
  let result=certifyGroup(arms,trial);
  assert.equal(result.withoutPivot.actionReceipt,
    'STORE_ACCEPTED_PAPER_PAYMENT_UNVERIFIED');
  assert.equal(result.ownerPaymentCertified,false);
  Object.assign(event,{ownerInformationVerified:true,
    paperPrintedPaymentVerified:true,physicalZoneTransitionsVerified:true});
  result=certifyGroup(arms,trial);
  assert.equal(result.withoutPivot.actionReceipt,
    'OWNER_PAYMENT_AND_CUSTODY_RECEIPTED');
  assert.equal(result.ownerPaymentCertified,true);
  event.storeAccepted=false;
  assert.equal(certifyGroup(arms,trial).ownerPaymentCertified,false);
});

test('baseline settled attack is specifically recognized as real displaced payoff',()=>{
  const arms=fourArms();
  arms.P0S0.sourceAttackSettlement={attacks:[{
    actionOrdinal:100,attackName:'Psychic',
    settledPromptChain:true,settlementCrossesClockReset:false,
    completionRootOrdinal:104}]};
  assert.equal(certifyGroup(arms,trial).withoutPivot.displacedAttack.settlement,
    'ATTACK_SETTLED');
  arms.P0S0.sourceAttackSettlement.attacks[0].settlementCrossesClockReset=true;
  assert.equal(certifyGroup(arms,trial).withoutPivot.displacedAttack.settlement,
    'NO_SETTLEMENT_RECEIPT');
});

test('retrospective winning game alone does not qualify paper games',()=>{
  const arms=fourArms();
  arms.P0S1.winner=0;
  const r=certifyGroup(arms,trial);
  assert.deepEqual(r.sourceWinnerEffects,{withoutPivot:true,withPivot:false});
  assert.equal(r.competitivePaperQualifiedGames,0);
  arms.P1S1.status='root-cap';
  assert.equal(certifyGroup(arms,trial).sourceWinnerEffects,null);
});

test('all censoring statuses survive cohort calculation with both pivots',()=>{
  const arms=fourArms();
  arms.P1S1.status='engine-error';arms.P1S1.finished=false;
  const byPhase=Object.fromEntries(PHASES.map(p=>[p,[arms[p]]]));
  const c=certifyCohort(byPhase,[trial]);
  assert.equal(c.totals.nativeAttempts,4);
  assert.equal(c.totals.physicallyMatched,1);
  assert.equal(c.totals.activeSourceWithoutPivot,1);
  assert.equal(c.totals.activeSourceWithPivot,1);
  assert.equal(c.totals.sourceAttackDisplacements,2);
  assert.equal(c.groups[0].statuses.P1S1.status,'engine-error');
  assert.equal(c.groups[0].fourTerminals,false);
  assert.equal(c.groups[0].sourceWinnerEffects,null);
});

test('extra phase, missing phase and duplicate phase ID are rejected',()=>{
  const arms=fourArms();
  const byPhase=Object.fromEntries(PHASES.map(p=>[p,[arms[p]]]));
  assert.throws(()=>certifyCohort({...byPhase,P1S1:[]},[trial]));
  const duplicatePhase=Object.fromEntries(PHASES.map(p=>
    [p,[arms[p],arms[p]]]));
  assert.throws(()=>certifyCohort(duplicatePhase,[trial,trial]),/Duplicate/);
  assert.deepEqual(firstRootDifference([],[]),null);
});
