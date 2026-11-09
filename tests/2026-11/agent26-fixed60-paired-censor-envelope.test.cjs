'use strict';

const assert = require('node:assert/strict');
const {test} = require('node:test');
const {auditFixed60PairedCensoring, armWinInterval, unpairedReason,
  firstDivergentRoot, PHYSICAL_PASS} =
  require('../../simulation/evaluation/2026-11/agent26-fixed60-paired-censor-envelope.cjs');

const LEFT='champion-reference';
const RIGHT='new-moon-lockbreaker-v1';

/** @param {string} id @param {string} result @param {number} rank */
function arm(id, result, rank) {
  const win = result === 'W' ? 0 : 1;
  const terminal = result !== 'C';
  return {candidateId: id, rank, candidateSeat: 0, originalSeat: 1,
    physicalStatus: PHYSICAL_PASS, sourceDealFingerprint: `source-${rank}`,
    actualStarterSeat: 0, nativeDisposition: terminal ?
      'ENGINE_TERMINAL' : 'ACTION_CAP', nativeFinished: terminal,
    nativeWinner: terminal ? win : null, rootActionLedger: []};
}

/** @param {number} rank @param {number} repeat @param {string} l @param {string} r @param {boolean} mismatch */
function group(rank, repeat, l, r, mismatch = false) {
  const a=arm(LEFT,l,rank), b=arm(RIGHT,r,rank);
  if(mismatch) b.sourceDealFingerprint='distinct-original-deal';
  return {key:`${rank}:${repeat}:A`,rank,repeat,candidateSlot:'A',
    contenders:{[LEFT]:a,[RIGHT]:b}};
}

test('no absent outcomes are silently converted to losses',()=>{
  assert.deepEqual(armWinInterval(arm(LEFT,'W',5)),
    {min:1,max:1,kind:'native-win'});
  assert.deepEqual(armWinInterval(arm(LEFT,'C',5)),
    {min:0,max:1,kind:'ACTION_CAP'});
  const g=group(5,0,'W','C');
  const out=auditFixed60PairedCensoring([g],[LEFT,RIGHT]);
  assert.deepEqual(out.overall.matchedOnlyDifference,{min:0,max:1});
  assert.equal(out.paperQualifiedGames,0);
  assert.equal(out.competitiveWinRate,null);
});

test('missing physical match is retained but excluded from paired inference',()=>{
  const g=group(6,0,'C','C',true);
  assert.equal(unpairedReason(g.contenders[LEFT],g.contenders[RIGHT]),
    'different-source-physical-deal');
  const x=auditFixed60PairedCensoring([g],[LEFT,RIGHT]);
  assert.equal(x.overall.unmatchedGroups,1);
  assert.deepEqual(x.overall.matchedOnlyDifference,{min:0,max:0});
  assert.deepEqual(x.overall.allRegisteredDifference,{min:-1,max:1});
  assert.equal(x.groups[0].difference,null);
});

test('refuses a false native terminal, duplicate group and missing physical integrity',()=>{
  const a=arm(LEFT,'W',11);a.nativeWinner=null;
  assert.throws(()=>armWinInterval(a),/winner missing/);
  const g=group(11,0,'W','W');
  assert.throws(()=>auditFixed60PairedCensoring([g,g],[LEFT,RIGHT]),
    /Duplicate registered group/);
  g.contenders[RIGHT].physicalStatus='NOT_AUDITED';
  assert.equal(unpairedReason(g.contenders[LEFT],g.contenders[RIGHT]),
    'physical-integrity-not-passed');
});

test('first changed native root is a descriptive observation',()=>{
  assert.deepEqual(firstDivergentRoot([{action:'PassTurnAction',actionOrdinal:5}],
    [{action:'PlayCardAction',actionOrdinal:5,card:'Guzma'}]),{
      index:0,
      left:{actionOrdinal:5,turnBefore:null,playerSlot:null,
        action:'PassTurnAction',card:null,attack:null},
      right:{actionOrdinal:5,turnBefore:null,playerSlot:null,
        action:'PlayCardAction',card:'Guzma',attack:null}
    });
  assert.equal(firstDivergentRoot([],[]),null);
});

test('reconstructs published 16-group four-rank census without imputing capped games',()=>{
  // Only outcome-category counts and mismatch pattern from the source report.
  // Synthetic groups are never represented as actual game-trace evidence.
  const input = [
    group(5,0,'W','W'),group(5,1,'W','L'),
    group(5,2,'L','W'),group(5,3,'L','L'),
    group(6,0,'W','W'),group(6,1,'W','L'),
    group(6,2,'L','C'),group(6,3,'C','C',true),
    group(11,0,'W','W'),group(11,1,'W','W'),
    group(11,2,'W','C'),group(11,3,'W','C'),
    group(13,0,'W','W'),group(13,1,'W','C'),
    group(13,2,'C','L'),group(13,3,'C','C')
  ];
  const out=auditFixed60PairedCensoring(input,[LEFT,RIGHT]);
  assert.equal(out.overall.registeredGroups,16);
  assert.equal(out.overall.matchedSourcePhysicalGroups,15);
  assert.equal(out.overall.bothNativeTerminalMatched,9);
  assert.deepEqual(out.overall.nativeWinCountsAllRegistered[LEFT],
    {min:10,max:13});
  assert.deepEqual(out.overall.nativeWinCountsAllRegistered[RIGHT],
    {min:6,max:12});
  assert.deepEqual(out.overall.allRegisteredDifference,{min:-2,max:7});
  assert.deepEqual(out.overall.matchedOnlyDifference,{min:-1,max:6});
  assert.deepEqual(out.byRank.map(x=>[x.rank,x.matchedOnlyDifference]),[
    [5,{min:0,max:0}],[6,{min:0,max:1}],
    [11,{min:0,max:2}],[13,{min:-1,max:3}]
  ]);
  assert.equal(out.groups.filter(x=>x.bothNativeTerminal).length,9);
  console.log(JSON.stringify({aggregate:out.overall,
    perRank:out.byRank.map(x=>({rank:x.rank,...x.matchedOnlyDifference}))},null,2));
});
