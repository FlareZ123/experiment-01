'use strict';

const assert=require('node:assert/strict');
const test=require('node:test');
const {selectOriginalRank11Pairs,compareOriginalRank11Pairs,
  compactGame}=require('../simulation/evaluation/agent50-rank11-bilateral-known-dead-native-pair.cjs');

const candidates=['champion-reference','new-moon-lockbreaker-v1'];

/** @returns {object[]} */
function originalTrials(){
  const out=[];
  for(const candidateSlot of ['A','B']){
    const seed=candidateSlot==='A'?3821563342:1326071353;
    for(const candidateId of candidates){
      out.push({id:'11:2:'+candidateSlot+':'+candidateId,
        rank:11,repeat:2,candidateSlot,candidateId,seed});
    }
  }
  return out;
}

/**
 * Fake postgame public physical traces, with explicit separate source and
 * candidate attack settlement. Does not pretend to simulate Twinleaf.
 * @param {object} trial
 * @param {string} attack
 * @returns {object}
 */
function row(trial,attack){
  const candidateSeat=trial.candidateSlot==='A'?0:1;
  const sourceSeat=1-candidateSeat;
  const rootActionLedger=[{actionOrdinal:0,action:'AttackAction',
    attack,turnBefore:3,playerSlot:candidateSeat}];
  return {trial,sourceSeat,candidateSeat,
    sourceDeckFingerprint:'source-'+trial.candidateSlot,
    candidateDeckFingerprint:'candidate-'+trial.candidateId,
    sourceDealFingerprint:'deal-'+trial.candidateSlot,
    fullPhysicalDealFingerprint:'full-'+trial.candidateSlot+'-'+trial.candidateId,
    actualStarterSeat:trial.candidateSlot==='A'?1:0,
    finished:false,status:'action-cap',actionCount:1,
    rootActionLedger,
    sourceAttackSettlement:{declarations:0,settled:0,
      withVerifiedSameEpochSourceReturn:0,attacks:[]},
    candidateAttackSettlement:{declarations:1,settled:1,
      withVerifiedSameEpochSourceReturn:1,
      attacks:[{actionOrdinal:0,attackName:attack,
        settledPromptChain:true,prizesAfter:[6,5],
        nextSourceRoot:{ordinal:1,turn:4,action:'PlayCardAction'}}]}
  };
}

test('all four rank11 original repeat-2 registered candidate-deal arms selected',()=>{
  const rows=selectOriginalRank11Pairs([
    ...originalTrials(),{...originalTrials()[0],repeat:1}
  ]);
  assert.equal(rows.length,4);
  assert.equal(new Set(rows.map(x=>x.id)).size,4);
});

test('wrong source physical seed and repeated candidate are independently rejected',()=>{
  const corrupt=originalTrials();
  corrupt[2]={...corrupt[2],seed:1};
  assert.throws(()=>selectOriginalRank11Pairs(corrupt),/source deal changed/);
  const duplicate=originalTrials();
  duplicate[1]={...duplicate[0]};
  assert.throws(()=>selectOriginalRank11Pairs(duplicate),/Duplicate original/);
});

test('same physical input and both-policy attack root difference retained on all arms',()=>{
  const trials=originalTrials();
  const original=trials.map(x=>row(x,'Get Lost'));
  const treated=trials.map(x=>row(x,'Mind Shock'));
  const paired=compareOriginalRank11Pairs(original,treated);
  assert.equal(paired.nativeGameAttempts,8);
  assert.equal(paired.samePhysicalInputPairs,4);
  assert.equal(paired.mismatchedPhysicalInputPairs,0);
  assert.equal(paired.competitiveQualifiedGames,0);
  for(const x of paired.pairs){
    assert.equal(x.firstRootDifference.index,0);
    assert.equal(x.changedSameRootAttacks.length,1);
    assert.equal(x.changedSameRootAttacks[0].owner,'candidate');
    assert.equal(x.changedSameRootAttacks[0].treatmentSettlement.settledPromptChain,true);
    assert.equal(x.changedSameRootAttacks[0].treatmentSettlement.nextSourceRoot.action,
      'PlayCardAction');
  }
});

test('source-seat first roots retain source-owned attacker attribution',()=>{
  const trials=originalTrials();
  const original=trials.map(x=>row(x,'Terminal Period'));
  const treated=trials.map(x=>row(x,'Claw of Darkness'));
  for(const row of [...original,...treated]){
    row.rootActionLedger[0].playerSlot=row.sourceSeat;
    row.sourceAttackSettlement=row.candidateAttackSettlement;
    row.candidateAttackSettlement={declarations:0,settled:0,attacks:[]};
  }
  const result=compareOriginalRank11Pairs(original,treated);
  assert.equal(result.pairs[0].changedSameRootAttacks[0].owner,'source');
});

test('changed physical deals are exposed as unmatched rather than silently compared',()=>{
  const trials=originalTrials();
  const original=trials.map(x=>row(x,'Get Lost'));
  const treated=trials.map(x=>row(x,'Mind Shock'));
  treated[0].fullPhysicalDealFingerprint='mismatched-original-deal';
  const paired=compareOriginalRank11Pairs(original,treated);
  assert.equal(paired.samePhysicalInputPairs,3);
  assert.equal(paired.mismatchedPhysicalInputPairs,1);
  assert.deepEqual(paired.pairs[0].unmatchedInputs,['fullPhysicalDealFingerprint']);
});

test('later equal-index changed attacks after an earlier fork are never called same-root',()=>{
  const trials=originalTrials();
  const original=trials.map(x=>row(x,'Get Lost'));
  const treated=trials.map(x=>row(x,'Mind Shock'));
  for(const r of original){
    r.rootActionLedger.unshift({actionOrdinal:-1,action:'PlayCardAction',
      card:'Old card',turnBefore:3,playerSlot:r.candidateSeat});
  }
  for(const r of treated){
    r.rootActionLedger.unshift({actionOrdinal:-1,action:'PlayCardAction',
      card:'Different card',turnBefore:3,playerSlot:r.candidateSeat});
  }
  const paired=compareOriginalRank11Pairs(original,treated);
  assert.equal(paired.samePhysicalInputPairs,4);
  assert.equal(paired.pairs[0].firstRootDifference.index,0);
  assert.deepEqual(paired.pairs[0].changedSameRootAttacks,[]);
});
test('preregistered sixteen candidate-sixty arms compare without hardcoded four-arm assumption',()=>{
  const trials=[];
  for(let repeat=0;repeat<4;repeat++){
    for(const x of originalTrials()){
      trials.push({...x,repeat,id:[11,repeat,x.candidateSlot,x.candidateId].join(':'),
        seed:x.seed+repeat});
    }
  }
  const baseline=trials.map(x=>row(x,'Get Lost'));
  const treatment=trials.map(x=>row(x,'Mind Shock'));
  const result=compareOriginalRank11Pairs(baseline,treatment,
    {expectedArms:16,schema:'fresh-sixteen-test'});
  assert.equal(result.schema,'fresh-sixteen-test');
  assert.equal(result.nativeGameAttempts,32);
  assert.equal(result.physicalGroups,8);
  assert.equal(result.samePhysicalInputPairs,16);
  assert.equal(result.pairs.length,16);
});
test('missing physical source receipt is never accepted as a matched deal',()=>{
  const trials=originalTrials();
  const original=trials.map(x=>row(x,'Get Lost'));
  const treated=trials.map(x=>row(x,'Mind Shock'));
  original[0].sourceDealFingerprint=null;
  treated[0].sourceDealFingerprint=null;
  const paired=compareOriginalRank11Pairs(original,treated);
  assert.equal(paired.samePhysicalInputPairs,3);
  assert.deepEqual(paired.pairs[0].unmatchedInputs,['sourceDealFingerprint']);
});
test('action-capped and terminal outcomes are not conflated',()=>{
  const trial=originalTrials()[0];
  const capped=compactGame(row(trial,'Get Lost'));
  const terminalRow=row(trial,'Mind Shock');
  terminalRow.finished=true;
  terminalRow.winner=terminalRow.candidateSeat;
  terminalRow.finalPrizes=[6,0];
  const terminal=compactGame(terminalRow);
  assert.equal(capped.finished,false);
  assert.equal(capped.winner,null);
  assert.equal(terminal.finished,true);
  assert.equal(terminal.winner,0);
  assert.deepEqual(terminal.finalPrizes,[6,0]);
});
