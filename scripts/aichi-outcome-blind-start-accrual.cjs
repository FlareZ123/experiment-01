'use strict';

/**
 * Materialize actual-start strata from a previously frozen source-dealt seed
 * stream, without consulting game outcomes, selected actions, wins or losses.
 *
 * Precondition: the seed list, candidate physical seat, first/second quotas,
 * policies and original-source 60s were committed before running any games.
 * The function validates the observed prefix of that exact attempt stream.
 *
 * An unverified or missing first-draw log blocks qualification rather than
 * silently dropping a potentially outcome-correlated failed game.
 */
const STARTS = ['first', 'second'];

/** @typedef {{gameId:string,seed:number}} Attempt */
/** @typedef {{gameId:string,seed:number,firstTurnSlot:number,verifiedByDrawLog:boolean,firstTurnPlayerId:number,firstTurnPlayerName:string,firstDrawLogName:string}} Observation */
/**
 * @param {{candidateEngineSlot:'A'|'B', quotas:{first:number,second:number},attempts:Attempt[]}} registration
 * @param {Observation[]} observations
 * @returns {{complete:boolean,blocked:boolean,consumedAttempts:number,selectedPlannedTrials:{gameId:string,seed:number,startingSeat:string}[],retainedAttempts:object[],remainingQuotas:{first:number,second:number},qualifiedForCompetitiveInference:false}}
 */
function accrueActualStarts(registration, observations) {
  if (!registration || !['A','B'].includes(registration.candidateEngineSlot) ||
      !registration.quotas || !Array.isArray(registration.attempts) ||
      !Array.isArray(observations)) {
    throw new TypeError('Frozen candidate physical seat, quotas and seed stream required.');
  }
  const quotas=registration.quotas;
  if (!STARTS.every(s=>Number.isSafeInteger(quotas[s]) && quotas[s]>=0) ||
      quotas.first+quotas.second===0 ||
      observations.length>registration.attempts.length) {
    throw new RangeError('Finite nonempty actual-start quotas and bounded observed prefix required.');
  }
  const ids=new Set();
  const seeds=new Set();
  for(const row of registration.attempts) {
    if (!row || typeof row.gameId!=='string' || !row.gameId ||
        !Number.isSafeInteger(row.seed) || row.seed<0 ||
        row.seed>0xffffffff || ids.has(row.gameId) || seeds.has(row.seed)) {
      throw new Error('Preregistered attempt identities and 32-bit seeds must be unique.');
    }
    ids.add(row.gameId);
    seeds.add(row.seed);
  }
  const wantedSlot=registration.candidateEngineSlot==='A'?0:1;
  const counts={first:0,second:0};
  const selectedPlannedTrials=[];
  const retainedAttempts=[];
  let blocked=false;
  let complete=false;
  for(let i=0;i<observations.length;i++) {
    if (complete) {
      throw new Error('A game was executed after the fixed quota was attained.');
    }
    const expected=registration.attempts[i];
    const observed=observations[i];
    if (!observed || expected.gameId!==observed.gameId ||
        expected.seed!==observed.seed) {
      throw new Error('Observation must match the next preregistered seed/ID in order.');
    }
    const slot=observed.firstTurnSlot;
    const logName=slot===0?'research-A':slot===1?'research-B':null;
    if (observed.verifiedByDrawLog!==true || logName===null ||
        observed.firstTurnPlayerId!==(slot===0?101:202) ||
        observed.firstTurnPlayerName!==logName ||
        observed.firstDrawLogName!==logName) {
      if (i+1<observations.length) {
        throw new Error('Observation after an unverified first draw is forbidden.');
      }
      blocked=true;
      retainedAttempts.push({gameId:expected.gameId,seed:expected.seed,
        ordinal:i,actualStart:'unverified',selected:false,
        reason:'draw-log-qualification-blocked'});
      break;
    }
    const startingSeat=slot===wantedSlot?'first':'second';
    const selected=counts[startingSeat]<quotas[startingSeat];
    if (selected) {
      counts[startingSeat]++;
      selectedPlannedTrials.push({gameId:expected.gameId,
        seed:expected.seed,startingSeat});
    }
    retainedAttempts.push({gameId:expected.gameId,seed:expected.seed,
      ordinal:i,actualStart:startingSeat,selected,
      reason:selected?'accepted-chronological-quota':'surplus-start-stratum'});
    complete=STARTS.every(s=>counts[s]===quotas[s]);
  }
  return {
    complete,blocked,consumedAttempts:retainedAttempts.length,
    selectedPlannedTrials,retainedAttempts,
    remainingQuotas:{first:quotas.first-counts.first,
      second:quotas.second-counts.second},
    qualifiedForCompetitiveInference:false
  };
}

module.exports={accrueActualStarts};
