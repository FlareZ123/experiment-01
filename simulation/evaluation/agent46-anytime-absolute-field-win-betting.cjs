'use strict';

const VERSION='agent46-anytime-absolute-field-win-betting-v1';
const LOG2=Math.log(2);
const BET_COUNT=32;
const DIGEST=/^[0-9a-f]{64}$/;
const STATUSES=new Set(['QUALIFIED_WIN','QUALIFIED_NONWIN','CENSORED']);

/**
 * Directional anytime e-value test of the frozen candidate's absolute
 * equal-cell paper-game win rate against a precommitted high benchmark.
 *
 * H0: average_i P(qualified paper win in opponent cell i) <= targetRate.
 * One preregistered complete round has one source-original game per cell.
 * Every game is a Bernoulli indicator X, and dependent draws within a
 * cell are excluded by the independent-round sampling design.
 * For eta in (0,1), the factor for a fully qualified game is
 *   1 + eta * (X - targetRate)/targetRate.
 * The factors are >= 0. If the C field cells within each round are
 * independent, the AM-GM inequality proves the expected product of
 * factors is <= 1 under H0, EVEN WHEN INDIVIDUAL OPPONENT CELLS HAVE
 * DIFFERENT WIN PROBABILITIES. Across independent rounds this is a
 * test supermartingale. A fixed mixture of 32 eta values and prospective
 * candidate ordinal k produces an anytime-valid directional test.
 *
 * A censored, missing-source, invalid-printing, or incomplete game is
 * assigned X=0 (loss) for the observed test. This wealth is pathwise
 * bounded above by the valid latent full-game test wealth, even if
 * errors or missingness depend arbitrarily on the game outcome. No
 * native terminal or self-asserted paper flag can auto-qualify a win.
 *
 * The caller is responsible for independent audit and authenticity of
 * the supplied original 60 roster and the per-game qualification status.
 * A verified source print, stable candidate deck digest, and 64-hex
 * original-source setup digest are necessary, not sufficient, conditions.
 * This test is conditional on an EXPLICIT cross-cell independence
 * declaration and a fixed predeclared target, layout, candidate ordinal
 * and unmodified deck and playing policies. It does not prove anything
 * for the real Aichi field without qualified data.
 *
 * @typedef {'QUALIFIED_WIN'|'QUALIFIED_NONWIN'|'CENSORED'} Status
 * @typedef {{
 *  gameId:string,roundId:string,rank:number,candidateSeat?:0|1,
 *  startingSeat?:0|1, candidatePrinted60Digest:string,
 *  sourcePrinted60Digest:string,sourceDealFingerprint:string,
 *  status:Status
 * }} Game
 * @param {{
 *  candidateOrdinal:number,candidateId:string,
 *  candidatePrinted60Digest:string,targetRate?:number,alpha?:number,
 *  layout:'RANK'|'RANK_SEAT'|'RANK_SEAT_START',
 *  independentAcrossCells:true,
 *  authenticatedOriginalPrints:Array<{rank:number,printed60Sha256:string,physicalCards:number}>,
 *  cells:Game[][]
 * }} config
 * @returns {object} Statistical evidence, never a verified gameplay result.
 */
function anytimeAbsoluteFieldWinBetting(config){
  const {candidateOrdinal,candidateId,candidatePrinted60Digest,layout,
    independentAcrossCells,authenticatedOriginalPrints,cells}=config??{};
  const C=layout==='RANK'?32:layout==='RANK_SEAT'?64:
    layout==='RANK_SEAT_START'?128:null;
  const alpha=config?.alpha??0.05;
  const targetRate=config?.targetRate??0.995;
  if(!Number.isSafeInteger(candidateOrdinal)||candidateOrdinal<1||
    typeof candidateId!=='string'||!candidateId||
    !DIGEST.test(candidatePrinted60Digest??'')||!C||
    independentAcrossCells!==true||
    !Number.isFinite(alpha)||alpha<=0||alpha>=1||
    !Number.isFinite(targetRate)||targetRate<=0||targetRate>=1||
    !Array.isArray(cells)||cells.length!==C||
    !Array.isArray(authenticatedOriginalPrints)){
    throw new TypeError('Predeclare valid fixed 60, opponent field, full original roster, target and independent balanced rounds');
  }
  const expectedSource=new Map();
  for(const row of authenticatedOriginalPrints){
    if(!Number.isSafeInteger(row?.rank)||row.rank<1||row.rank>32||
      expectedSource.has(row.rank)||!DIGEST.test(row.printed60Sha256??'')||
      row.physicalCards!==60){
      throw new TypeError('Invalid or repeated authenticated original printed60 source rank');
    }
    expectedSource.set(row.rank,row.printed60Sha256);
  }
  if(!cells.every(rows=>Array.isArray(rows)))throw new TypeError('Every field cell needs a registered trial list');
  const n=cells[0].length;
  if(!cells.every(rows=>rows.length===n)){
    throw new TypeError('Each balanced field cell must preserve every registered game in every round');
  }
  const gameIds=new Set(),roundIds=new Set(),sourcePhysicalDeals=new Set();
  let qualifiedWins=0,qualifiedNonwins=0,censoredGames=0,unadmittedSourceGames=0;
  let invalidSourceReceipts=0,duplicateSourceDealGames=0;
  for(let round=0;round<n;round++){
    const roundId=cells[0][round]?.roundId;
    if(typeof roundId!=='string'||!roundId||roundIds.has(roundId)){
      throw new TypeError('Each complete round needs a unique registered roundId');
    }
    roundIds.add(roundId);
    for(let c=0;c<C;c++){
      const game=cells[c][round];
      const rank=Math.floor(c/(C/32))+1;
      const seat=C===32?undefined:Math.floor((c%(C/32))/(C/64));
      const start=C===128?c%2:undefined;
      if(!game||typeof game.gameId!=='string'||!game.gameId||
        gameIds.has(game.gameId)||game.roundId!==roundId||
        game.rank!==rank||game.candidatePrinted60Digest!==candidatePrinted60Digest||
        (seat!==undefined&&game.candidateSeat!==seat)||
        (start!==undefined&&game.startingSeat!==start)||
        !STATUSES.has(game.status)){
        throw new TypeError('Unregistered, misidentified or incomplete original paper-game trial');
      }
      gameIds.add(game.gameId);
      const correctPrint=expectedSource.get(rank)===game.sourcePrinted60Digest &&
        DIGEST.test(game.sourcePrinted60Digest??'');
      const correctFingerprint=DIGEST.test(game.sourceDealFingerprint??'');
      const repeatedSource=correctFingerprint&&sourcePhysicalDeals.has(game.sourceDealFingerprint);
      if(correctFingerprint)sourcePhysicalDeals.add(game.sourceDealFingerprint);
      if(!correctPrint)unadmittedSourceGames++;
      if(!correctFingerprint)invalidSourceReceipts++;
      if(repeatedSource)duplicateSourceDealGames++;
      if(!correctPrint||!correctFingerprint||repeatedSource||
        game.status==='CENSORED'){
        censoredGames++;
      }else if(game.status==='QUALIFIED_WIN'){
        qualifiedWins++;
      }else{
        qualifiedNonwins++;
      }
    }
  }
  // Repeated source physical deals violate the independent-cell sampling
  // model even if their apparent successes are pessimistically censored:
  // reject the entire statistical test rather than risk optimistic reuse.
  if(duplicateSourceDealGames>0){
    throw new TypeError('Reused original source physical setup invalidates independent field rounds');
  }
  const weightsTotal=1-2**(-BET_COUNT);
  const notWins=qualifiedNonwins+censoredGames;
  const logs=[];
  for(let j=1;j<=BET_COUNT;j++){
    const eta=1-2**(-j);
    const rate=eta/targetRate;
    const logW=-j*LOG2-Math.log(weightsTotal);
    const logBet=qualifiedWins*Math.log1p(rate*(1-targetRate))+
      notWins*Math.log1p(-rate*targetRate);
    logs.push(logW+logBet);
  }
  const peak=Math.max(...logs);
  const logEValue=peak+Math.log(logs.reduce((sum,x)=>sum+Math.exp(x-peak),0));
  const logThreshold=Math.log(candidateOrdinal)+
    Math.log(candidateOrdinal+1)-Math.log(alpha);
  return {
    version:VERSION,candidateOrdinal,candidateId,
    candidatePrinted60Digest,targetRate,alpha,layout,
    cellCount:C,completedRounds:n,registeredGames:n*C,
    qualifiedWins,qualifiedNonwins,censoredGames,
    unadmittedSourceGames,invalidSourceReceipts,
    duplicateSourceDealGames,authenticatedSourceRanks:expectedSource.size,
    betCount:BET_COUNT,logEValue,
    eValue:logEValue>Math.log(Number.MAX_VALUE)?Infinity:Math.exp(logEValue),
    logThreshold,threshold:Math.exp(logThreshold),
    decision:logEValue>=logThreshold?
      'EVIDENCE_FIELD_RATE_EXCEEDS_TARGET':'INSUFFICIENT_INFORMATION',
    competitiveQualified:false,
    qualification:'Mathematical 99.5%-target or other target test only. Each game must have an independent externally verified complete paper match, authentic original opponent printed60, frozen candidate 60, competent owner-safe policy, official clock and independent across-cell source deals. No native winner automatically qualifies.'
  };
}

module.exports={VERSION,anytimeAbsoluteFieldWinBetting};
