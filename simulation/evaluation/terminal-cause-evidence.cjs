'use strict';

/**
 * Basic simultaneous win/loss outcomes in Advanced Player's Rulebook v3.4,
 * I.E (Win and Loss), expressed relative to the engine-reported winner.
 * Bits: 1 = winner has no Prizes, 2 = loser has no Prizes,
 *       4 = winner has no Pokémon, 8 = loser has no Pokémon.
 * Deck exhaustion is checked separately at the next attempted turn draw.
 */
const BASIC_RESULTS=Object.freeze([
  'none','winner','loser','tie','loser','tie','loser','loser',
  'winner','winner','tie','winner','tie','winner','loser','tie'
]);

/**
 * @param {object} after Public two-player post-transition snapshot.
 * @param {0|1} winner Claimed native winner's seat.
 * @returns {'none'|'winner'|'loser'|'tie'}
 */
function basicPaperResult(after,winner){
  const won=after.players[winner],lost=after.players[1-winner];
  const flags=(won.prizesRemaining===0?1:0)|
    (lost.prizesRemaining===0?2:0)|
    (won.inPlayPokemon===0?4:0)|
    (lost.inPlayPokemon===0?8:0);
  return BASIC_RESULTS[flags];
}

/** @param {object} player @returns {boolean} */
function validPublicCounts(player){
  return ['deckRemaining','prizesRemaining','inPlayPokemon'].every(key=>
    Number.isSafeInteger(player?.[key])&&player[key]>=0);
}

/**
 * Conservative, public-board-only classification of a recorded engine ending.
 * A causal explanation may have several simultaneous sufficient conditions.
 * Never use these tags as tournament outcomes or optimal-policy evidence.
 *
 * @param {object} row Frozen exploratory trial observation with its actual Store transition.
 * @returns {{status:string,conditions:string[],engineWinner:number|null,paperBasicOutcome?:string}}
 */
function classifyTerminalCause(row) {
  const winner=Number.isInteger(row?.engineWinner)?row.engineWinner:null;
  if(row?.status!=='engine-terminal') {
    return {status:row?.status==='engine-error'?'engine-error':
      row?.status==='action-cap-or-incomplete'?'action-capped':'unclassified-status',
    conditions:[],engineWinner:null};
  }
  const evidence=row.terminalTransition;
  const before=evidence?.before;
  const after=evidence?.after;
  if(evidence?.evidenceType!=='observed-engine-terminal-transition-v1' ||
      ![0,1].includes(winner) || after?.winner!==winner ||
      !Array.isArray(before?.players) || !Array.isArray(after?.players) ||
      before.players.length!==2 || after.players.length!==2 ||
      before.phase===after.phase ||
      !Number.isSafeInteger(before.turn) || !Number.isSafeInteger(after.turn) ||
      before.turn<0 || after.turn<before.turn ||
      ![0,1].includes(before.activePlayer) ||
      ![0,1].includes(after.activePlayer) ||
      [0,1].includes(before.winner) ||
      !before.players.every(validPublicCounts) ||
      !after.players.every(validPublicCounts)) {
    return {status:'missing-or-inconsistent-transition',
      conditions:[],engineWinner:winner};
  }
  if(typeof before.suddenDeath!=='boolean'||
      typeof after.suddenDeath!=='boolean'){
    return {status:'terminal-epoch-unverified',
      conditions:[],engineWinner:winner};
  }
  // Sudden-death tiebreakers compare each player's remaining Prizes after the
  // *complete* simultaneous KO batch. Pinned Twinleaf can end as soon as
  // seat 0 claims a Prize in sudden death, before moving either Prize card.
  // The ordinary six-Prize table is not a valid substitute for that batch.
  // Both live snapshots now retain the real Store isSuddenDeath flag. A
  // legacy snapshot without that flag cannot certify the epoch's absence.
  if(before.suddenDeath===true||after.suddenDeath===true){
    return {status:'tiebreaker-batch-adjudication-unresolved',
      conditions:[],engineWinner:winner};
  }
  const paperBasicOutcome=basicPaperResult(after,winner);
  // A native reported winner can disagree with a simultaneous loss/tie in the
  // supplied paper rules. Card text might override basic rules; such a record
  // needs separate card-level adjudication, not a sufficient-condition tag.
  if(paperBasicOutcome==='tie'||paperBasicOutcome==='loser') {
    return {status:'paper-basic-result-conflict',conditions:[],
      engineWinner:winner,paperBasicOutcome};
  }
  const loser=1-winner;
  const winningBefore=before.players[winner];
  const winningAfter=after.players[winner];
  const losingBefore=before.players[loser];
  const losingAfter=after.players[loser];
  const conditions=[];
  if(winningBefore.prizesRemaining>0 && winningAfter.prizesRemaining===0) {
    conditions.push('winner-took-final-prize');
  }
  if(losingBefore.inPlayPokemon>0 && losingAfter.inPlayPokemon===0) {
    conditions.push('loser-has-no-pokemon');
  }
  // A depleted deck becomes a loss at the next opening draw, never merely
  // because a card effect reduced a deck to zero during another turn.
  if(losingBefore.deckRemaining===0 && losingAfter.deckRemaining===0 &&
      after.turn>before.turn && after.activePlayer===loser) {
    conditions.push('loser-empty-deck-at-new-turn');
  }
  return {status:conditions.length?'observed-sufficient-conditions':
    'terminal-rule-unresolved',conditions,engineWinner:winner};
}

/**
 * Each trial retains its unique preregistered identity and censoring status.
 * Multiple sufficient conditions may be observed in the same terminal.
 * @param {object[]} rows Frozen full/cohort partition rows.
 * @returns {object}
 */
function summarizeTerminalCauses(rows) {
  const observations=rows.map(row=>({
    id:row.id,...classifyTerminalCause(row)
  }));
  const count=key=>observations.filter(row=>row.status===key).length;
  const causeNames=[...new Set(observations.flatMap(row=>row.conditions))].sort();
  return {
    trials:observations.length,
    engineTerminals:count('observed-sufficient-conditions')+
      count('terminal-rule-unresolved')+
      count('missing-or-inconsistent-transition')+
      count('paper-basic-result-conflict')+
      count('tiebreaker-batch-adjudication-unresolved')+
      count('terminal-epoch-unverified'),
    observedTerminals:count('observed-sufficient-conditions'),
    unresolvedTerminals:count('terminal-rule-unresolved')+
      count('missing-or-inconsistent-transition')+
      count('paper-basic-result-conflict')+
      count('tiebreaker-batch-adjudication-unresolved')+
      count('terminal-epoch-unverified'),
    epochUnverified:count('terminal-epoch-unverified'),
    tiebreakerUnresolved:count('tiebreaker-batch-adjudication-unresolved'),
    paperBasicConflicts:count('paper-basic-result-conflict'),
    capped:count('action-capped'),
    errors:count('engine-error'),
    conditionIncidences:Object.fromEntries(causeNames.map(name=>[
      name,observations.filter(row=>row.conditions.includes(name)).length
    ])),
    observations,
    competitiveGamesQualified:0
  };
}

module.exports={basicPaperResult,classifyTerminalCause,summarizeTerminalCauses};
