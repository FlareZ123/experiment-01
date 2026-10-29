'use strict';

const assert=require('node:assert/strict');

const SCHEMA='agent8-registered-source-deal-pair-audit-v1';
const HEX64=/^[0-9a-f]{64}$/;

/**
 * Different candidate 60s are paired only on the original opponent's
 * initial physical deal, never on their entire hidden two-player deals.
 * Native exceptions and incomplete records stay in the denominator.
 *
 * @param {object[]} trials Exact frozen scheduled arms from plannedTrials().
 * @param {{attempted:number,rows:object[],sourcePairs:object[]}} result
 * @returns {object} Strict registration integrity and failure-inclusive pairs.
 */
function auditRegisteredSourceDeals(trials,result){
  assert.ok(Array.isArray(trials)&&trials.length>0);
  assert.ok(Array.isArray(result?.rows));
  assert.ok(Array.isArray(result?.sourcePairs));
  assert.equal(result.attempted,trials.length);
  assert.equal(result.rows.length,trials.length);

  const expected=new Map();
  const groups=new Map();
  for(const trial of trials){
    assert.ok(typeof trial.id==='string'&&!expected.has(trial.id));
    assert.equal(trial.id,[trial.rank,trial.repeat,trial.candidateSlot,
      trial.candidateId].join(':'));
    expected.set(trial.id,trial);
    const groupId=[trial.rank,trial.repeat,trial.candidateSlot].join(':');
    const group=groups.get(groupId)??[];
    group.push(trial);
    groups.set(groupId,group);
  }
  const byId=new Map();
  for(const row of result.rows){
    const id=row.trial?.id;
    assert.ok(expected.has(id)&&!byId.has(id),
      'All actual arms must match one unique preregistered identity');
    assert.deepEqual(row.trial,expected.get(id),
      'Trial coordinates/seed differ from the preregistration');
    assert.equal(row.qualifiesForCompetitiveInference,false);
    byId.set(id,row);
  }
  assert.equal(byId.size,expected.size);

  const nativePairs=new Map();
  for(const pair of result.sourcePairs){
    assert.ok(typeof pair.pairId==='string'&&
      groups.has(pair.pairId)&&!nativePairs.has(pair.pairId),
      'One native pair receipt is required for each registered seed cell');
    nativePairs.set(pair.pairId,pair);
  }
  assert.equal(nativePairs.size,groups.size);

  const pairs=[];
  for(const [pairId,registered] of groups){
    assert.equal(registered.length,2);
    const named=new Map(registered.map(trial=>[trial.candidateId,trial]));
    assert.equal(named.size,2);
    assert.ok(named.has('champion-reference')&&
      named.has('new-moon-lockbreaker-v1'));
    const champion=byId.get(named.get('champion-reference').id);
    const newMoon=byId.get(named.get('new-moon-lockbreaker-v1').id);
    const arms=[champion,newMoon];
    const seed=registered[0].seed;
    assert.ok(registered.every(t=>t.seed===seed),
      'Compared candidate arms must share the registered seed');
    const sourceSeat=registered[0].candidateSlot==='A'?1:0;
    const candidateSeat=1-sourceSeat;

    const integrity=arms.map(row=>{
      const fp=typeof row.sourceDealFingerprint==='string'&&
        HEX64.test(row.sourceDealFingerprint)?
        row.sourceDealFingerprint:null;
      const validTurn=row.verifiedFirstTurn===true&&
        (row.actualStarterSeat===0||row.actualStarterSeat===1)&&
        row.sourceSeat===sourceSeat&&row.candidateSeat===candidateSeat&&
        row.sourceActuallyFirst===(row.actualStarterSeat===sourceSeat);
      return {fingerprint:fp,validTurn,
        actualStarterSeat:validTurn?row.actualStarterSeat:null,
        sourceActuallyFirst:validTurn?row.sourceActuallyFirst:null};
    });
    const pair=nativePairs.get(pairId);
    const knownFingerprint=integrity.every(x=>x.fingerprint!==null);
    const aligned=knownFingerprint&&
      integrity[0].fingerprint===integrity[1].fingerprint;
    const knownStarter=integrity.every(x=>x.validTurn);
    const matchingStarter=knownStarter&&
      integrity[0].actualStarterSeat===integrity[1].actualStarterSeat;

    assert.equal(pair.sameSourcePhysicalDeal,Boolean(aligned),
      'Published native source deal-pair flag contradicts actual rows');
    assert.equal(pair.sameActualStarter,Boolean(matchingStarter),
      'Published native starter-pair flag contradicts actual rows');
    const status=!knownFingerprint||!knownStarter?
      'unverified-source-pair':
      !aligned?'mismatched-source-deal':
      !matchingStarter?'mismatched-actual-starter':
      'aligned-source-deal';
    pairs.push({
      pairId,rank:registered[0].rank,repeat:registered[0].repeat,
      candidateSlot:registered[0].candidateSlot,seed,
      sourceSeat,candidateSeat,status,
      sourceActuallyFirst:status==='aligned-source-deal'?
        integrity[0].sourceActuallyFirst:null,
      sourceDealFingerprint:status==='aligned-source-deal'?
        integrity[0].fingerprint:null,
      sourceDealFingerprints:integrity.map(x=>x.fingerprint),
      armStatuses:arms.map(row=>row.status??(
        row.finished===true?'engine-terminal':'action-cap-or-incomplete')),
      evidenceScope:'Only same original source deal and native actual starter; candidate hidden deals differ'
    });
  }

  const count=(status,rank=null)=>pairs.filter(pair=>
    pair.status===status&&(rank===null||pair.rank===rank)).length;
  const sourceFirstAligned=pairs.filter(pair=>
    pair.status==='aligned-source-deal'&&pair.sourceActuallyFirst===true);
  const sourceSecondAligned=pairs.filter(pair=>
    pair.status==='aligned-source-deal'&&pair.sourceActuallyFirst===false);
  return {schema:SCHEMA,attemptedArms:result.rows.length,
    registeredSeedCells:groups.size,
    alignedSourceDealCells:count('aligned-source-deal'),
    mismatchedSourceDealCells:count('mismatched-source-deal'),
    mismatchedActualStarterCells:count('mismatched-actual-starter'),
    unverifiedSourcePairCells:count('unverified-source-pair'),
    alignedSourceFirstCells:sourceFirstAligned.length,
    alignedSourceSecondCells:sourceSecondAligned.length,
    perRank:[...new Set(trials.map(trial=>trial.rank))].sort((a,b)=>a-b)
      .map(rank=>({rank,registeredSeedCells:pairs.filter(p=>
        p.rank===rank).length,
        alignedSourceDealCells:count('aligned-source-deal',rank),
        alignedSourceFirstCells:sourceFirstAligned.filter(p=>
          p.rank===rank).length,
        alignedSourceSecondCells:sourceSecondAligned.filter(p=>
          p.rank===rank).length})),
    pairs,competitiveQualifiedGames:0,
    caveat:'Unique observed source-deal cells are not independent full games or tournament evidence. Unaligned, unknown and errored arms remain represented.'
  };
}

module.exports={SCHEMA,auditRegisteredSourceDeals};
