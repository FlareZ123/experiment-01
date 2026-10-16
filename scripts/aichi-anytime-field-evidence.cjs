'use strict';

const FIELD_SIZE=32;
const CELLS_PER_ROUND=64;
const ZERO_LOSS_WEIGHT=0.95;
const LAMBDAS=Object.freeze([0.05,0.1,0.25,0.5,1,2,4,8,16,32]);

/** @param {number[]} values Logarithmic component e-values. */
function logSumExp(values) {
  const maximum = Math.max(...values);
  if (maximum === -Infinity) return maximum;
  return maximum + Math.log(values.reduce((sum,x)=>sum+Math.exp(x-maximum),0));
}

/**
 * Confirm the entire rank-by-actual-starting-seat matrix is present.
 * Upstream matches must already be policy-qualified and independent.
 * @param {Array<{rank:number,startingSeat:string,outcome:string}>} round
 */
function countQualifiedWins(round) {
  if (!Array.isArray(round) || round.length !== CELLS_PER_ROUND) {
    throw new Error('Each round requires exactly 64 ranked seat games.');
  }
  const seen = new Set();
  const gameIds = new Set();
  const seeds = new Set();
  let wins = 0;
  for (const game of round) {
    if (!game || !Number.isInteger(game.rank) || game.rank < 1 || game.rank > FIELD_SIZE ||
        !['first','second'].includes(game.startingSeat) ||
        !['win','loss','draw'].includes(game.outcome) ||
        game.status !== 'qualified-completed-game' ||
        typeof game.gameId !== 'string' || !game.gameId ||
        !Number.isInteger(game.seed) || game.seed < 0 || game.seed > 0xffffffff ||
        !/^[a-f0-9]{64}$/.test(game.candidateDeckSha256) ||
        !/^[a-f0-9]{64}$/.test(game.opponentDeckSha256) ||
        typeof game.candidatePolicyRevision !== 'string' || !game.candidatePolicyRevision ||
        typeof game.opponentPolicyRevision !== 'string' || !game.opponentPolicyRevision ||
        typeof game.engineRevision !== 'string' || !game.engineRevision ||
        typeof game.rulesetRevision !== 'string' || !game.rulesetRevision) {
      throw new Error('Invalid or unqualified game evidence: rank, starting seat, status, outcome or provenance.');
    }
    const key = game.rank + ':' + game.startingSeat;
    if (seen.has(key)) throw new Error('Repeated rank/seat cell: ' + key);
    if (gameIds.has(game.gameId)) throw new Error('Repeated game ID within round: ' + game.gameId);
    if (seeds.has(game.seed)) throw new Error('Repeated game seed within round: ' + game.seed);
    seen.add(key);
    gameIds.add(game.gameId);
    seeds.add(game.seed);
    if (game.outcome === 'win') wins += 1;
  }
  return wins;
}


function assessFieldEvidence(rounds, options={}) {
  const nullMean=options.nullMean===undefined ? 0.995 : options.nullMean;
  const alpha=options.alpha===undefined ? 0.05 : options.alpha;
  if (!Array.isArray(rounds) || !(nullMean>0 && nullMean<1) ||
      !(alpha>0 && alpha<1)) throw new Error('Invalid evidence inputs.');
  const thresholdLog=-Math.log(alpha);
  const finiteWeightLog=Math.log((1-ZERO_LOSS_WEIGHT)/LAMBDAS.length);
  let wins=0, firstCrossedAtRound=null, logEValue=0;
  const gameIds=new Set(), seeds=new Set();
  let candidateDigest=null, engineRevision=null, rulesetRevision=null;
  let candidatePolicyRevision=null;
  const opponentDigests=new Map(), opponentPolicies=new Map();
  for (let index=0; index<rounds.length; index++) {
    const round=rounds[index];
    const qualifiedWins=countQualifiedWins(round);
    // The numerical e-process cannot authenticate records or establish independence.
    // Reject visible record reuse and provenance drift before crediting a round.
    for (const game of round) {
      if (gameIds.has(game.gameId)) throw new Error('Repeated game ID across rounds: '+game.gameId);
      if (seeds.has(game.seed)) throw new Error('Repeated game seed across rounds: '+game.seed);
      gameIds.add(game.gameId);
      seeds.add(game.seed);
      if (candidateDigest===null) candidateDigest=game.candidateDeckSha256;
      if (engineRevision===null) engineRevision=game.engineRevision;
      if (rulesetRevision===null) rulesetRevision=game.rulesetRevision;
      if (candidatePolicyRevision===null) candidatePolicyRevision=game.candidatePolicyRevision;
      if (candidateDigest!==game.candidateDeckSha256 ||
          engineRevision!==game.engineRevision ||
          rulesetRevision!==game.rulesetRevision ||
          candidatePolicyRevision!==game.candidatePolicyRevision) {
        throw new Error('Candidate deck, engine, ruleset or candidate policy changed across evidence rounds.');
      }
      if (opponentDigests.has(game.rank) &&
          opponentDigests.get(game.rank)!==game.opponentDeckSha256) {
        throw new Error('Opponent deck changed for rank '+game.rank);
      }
      if (opponentPolicies.has(game.rank) &&
          opponentPolicies.get(game.rank)!==game.opponentPolicyRevision) {
        throw new Error('Opponent policy changed for rank '+game.rank);
      }
      opponentDigests.set(game.rank,game.opponentDeckSha256);
      opponentPolicies.set(game.rank,game.opponentPolicyRevision);
    }
    wins += qualifiedWins;
    const games=(index+1)*CELLS_PER_ROUND;

    const zeroLog=wins===games ? Math.log(ZERO_LOSS_WEIGHT)-games*Math.log(nullMean) : -Infinity;
    const terms=[zeroLog];
    for (const lambda of LAMBDAS) {
      const logNormalizer=lambda+Math.log(nullMean+(1-nullMean)*Math.exp(-lambda));
      terms.push(finiteWeightLog+lambda*wins-games*logNormalizer);
    }
    logEValue=logSumExp(terms);
    if (firstCrossedAtRound===null && logEValue>=thresholdLog) firstCrossedAtRound=index+1;
  }
  const games=rounds.length*CELLS_PER_ROUND;
  return {
    rounds:rounds.length, games, wins, nonWins:games-wins,
    nullMean, alpha, logEValue, eValue:Math.exp(logEValue),
    threshold:1/alpha, currentCrosses:logEValue>=thresholdLog,
    everCrossed:firstCrossedAtRound!==null, firstCrossedAtRound
  };
}

module.exports={
  FIELD_SIZE, CELLS_PER_ROUND, ZERO_LOSS_WEIGHT, LAMBDAS,
  countQualifiedWins, assessFieldEvidence
};
