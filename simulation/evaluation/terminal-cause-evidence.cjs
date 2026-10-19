'use strict';

/**
 * Conservative, public-board-only classification of a recorded engine ending.
 * A causal explanation may have several simultaneous sufficient conditions.
 * Never use these tags as tournament outcomes or optimal-policy evidence.
 *
 * @param {object} row Frozen exploratory trial observation with its actual Store transition.
 * @returns {{status:string,conditions:string[],engineWinner:number|null}}
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
      before.phase===after.phase) {
    return {status:'missing-or-inconsistent-transition',
      conditions:[],engineWinner:winner};
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
      count('missing-or-inconsistent-transition'),
    observedTerminals:count('observed-sufficient-conditions'),
    unresolvedTerminals:count('terminal-rule-unresolved')+
      count('missing-or-inconsistent-transition'),
    capped:count('action-capped'),
    errors:count('engine-error'),
    conditionIncidences:Object.fromEntries(causeNames.map(name=>[
      name,observations.filter(row=>row.conditions.includes(name)).length
    ])),
    observations,
    competitiveGamesQualified:0
  };
}

module.exports={classifyTerminalCause,summarizeTerminalCauses};
