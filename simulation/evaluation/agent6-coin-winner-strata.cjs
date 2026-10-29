'use strict';

const assert=require('node:assert/strict');
const IDS=['champion-reference','new-moon-lockbreaker-v1'];

/** First-turn evidence consistent with the coin winner's chosen direction. */
function verifiedChoice(o){
  const w=o?.coinWinnerSeat,first=o?.choseFirst;
  const e=o?.firstTurnEvidence;
  if(![0,1].includes(w)||typeof first!=='boolean'||!e)return false;
  const seat=first?w:1-w;
  const name=seat===0?'research-A':'research-B';
  return e.verifiedByDrawLog===true&&e.firstTurnSlot===seat&&
    e.firstTurnPlayerId===(seat===0?101:202)&&
    e.firstTurnPlayerName===name&&e.firstDrawLogName===name;
}

/**
 * Prospective, outcome-blind intake stratified by exogenous coin winner.
 * Permits legitimate different first-player choices across candidate decks.
 * @param {object[]} attempts Frozen chronological setup-only receipts.
 * @param {{ranks?:number[],quota?:number}} [options]
 * @returns {object}
 */
function allocateCoinWinnerPairs(attempts,{ranks=[6,11],quota=4}={}){
  assert.ok(Array.isArray(attempts)&&Array.isArray(ranks)&&ranks.length>0&&
    new Set(ranks).size===ranks.length&&
    ranks.every(x=>Number.isInteger(x)&&x>=1&&x<=32)&&
    Number.isSafeInteger(quota)&&quota>0);
  const seen=new Set(),counts=new Map(),accepted=[],rejected=[];
  for(const r of ranks)for(const seat of [0,1])for(const winner of [0,1])
    counts.set(`${r}:${seat}:${winner}`,0);
  for(const [ordinal,a] of attempts.entries()){
    assert.deepEqual(Object.keys(a).sort(),
      ['rank','sourceSeat','seed','observations'].sort());
    assert.ok(ranks.includes(a.rank)&&[0,1].includes(a.sourceSeat));
    const id=`${a.rank}:${a.sourceSeat}:${a.seed}`;
    assert.ok(Number.isSafeInteger(a.seed)&&a.seed>=0&&
      a.seed<=0xffffffff&&!seen.has(id));
    seen.add(id);
    assert.ok(Array.isArray(a.observations)&&a.observations.length===2);
    assert.deepEqual(a.observations.map(o=>o.candidateId).sort(),IDS.slice().sort());
    for(const o of a.observations)assert.deepEqual(Object.keys(o).sort(),
      ['candidateId','coinWinnerSeat','choseFirst','firstTurnEvidence'].sort());
    const [x,y]=a.observations;
    const base={ordinal,rank:a.rank,sourceSeat:a.sourceSeat,seed:a.seed};
    const key=`${a.rank}:${a.sourceSeat}:${x.coinWinnerSeat}`;
    const reason=!verifiedChoice(x)||!verifiedChoice(y)?
      'invalid-or-missing-coin-start-proof':
      x.coinWinnerSeat!==y.coinWinnerSeat?'coin-winner-mismatch':
      counts.get(key)>=quota?'predeclared-quota-full':null;
    if(reason){rejected.push({...base,reason});continue;}
    counts.set(key,counts.get(key)+1);
    accepted.push({...base,coinWinnerSeat:x.coinWinnerSeat,
      actualFirstTurnByCandidate:a.observations.map(o=>({
        candidateId:o.candidateId,firstTurnSlot:o.firstTurnEvidence.firstTurnSlot}))});
  }
  const shortfalls=[...counts].flatMap(([stratum,n])=>n<quota?
    [{stratum,observed:n,missing:quota-n}]:[]);
  return {schema:'agent6-coin-winner-intake-v1',attempts:attempts.length,
    accepted,rejected,shortfalls,complete:shortfalls.length===0,
    competitiveQualifiedGames:0};
}
module.exports={verifiedChoice,allocateCoinWinnerPairs};
