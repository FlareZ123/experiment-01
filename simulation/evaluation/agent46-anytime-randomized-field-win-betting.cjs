'use strict';

const {createHash} = require('node:crypto');
const VERSION='agent46-anytime-randomized-field-win-betting-v1';
const PROTOCOL='PREREGISTERED_SHA256_CELL_WITH_REPLACEMENT_V1';
const COUNTS=Object.freeze({RANK:32,RANK_SEAT:64,RANK_SEAT_START:128});
const DIGEST=/^[0-9a-f]{64}$/;
const STATUSES=new Set(['QUALIFIED_WIN','QUALIFIED_NONWIN','CENSORED']);

/**
 * SHA-256 field-cell assignment, using the 32 highest digest bits.
 * The 32,64,128 cell counts divide 2^32 exactly, avoiding modulo bias.
 * Requires independently sampled, externally committed uniform seed.
 * @param {string} seed Hex encoded 32-byte random seed
 * @param {number} index Zero-based prospective game index
 * @param {'RANK'|'RANK_SEAT'|'RANK_SEAT_START'} layout
 * @returns {number}
 */
function assignedCell(seed,index,layout){
  const C=COUNTS[layout];
  if(!DIGEST.test(seed??'')||!Number.isSafeInteger(index)||index<0||!C){
    throw new TypeError('Valid seed, game index and layout required');
  }
  const hash=createHash('sha256').update('agent46-randomized-field-v1:')
    .update(Buffer.from(seed,'hex')).update(':').update(String(index)).digest();
  return hash.readUInt32BE(0)%C;
}

/**
 * A one-game-per-step test for the uniformly sampled Aichi field mean.
 * H0: average_i P(frozen candidate wins paper game in cell i) <= p0.
 * Fresh game randomness and independently uniform cell assignment imply
 * E[X_t | history] <= p0; the positive e-bet is a supermartingale.
 * This avoids the complete 32/64/128-cell round and independence across
 * cells within that round assumed by the existing balanced e-process.
 *
 * External auditors MUST verify truly random unground seed selection,
 * prospective public commitment, fresh noninterfering game draws,
 * printed60 legitimacy, owner information, both-player decision quality,
 * actual paper outcomes and clock. A digest does not prove a fair seed.
 *
 * @typedef {'QUALIFIED_WIN'|'QUALIFIED_NONWIN'|'CENSORED'} Status
 * @typedef {{trialIndex:number,gameId:string,cell:number,rank:number,
 *  candidateSeat?:0|1,startingSeat?:0|1,
 *  candidatePrinted60Digest:string,sourcePrinted60Digest:string,
 *  sourceDealFingerprint:string,status:Status}} Game
 * @param {{candidateOrdinal:number,candidateId:string,
 *  candidatePrinted60Digest:string,targetRate?:number,alpha?:number,
 *  layout:'RANK'|'RANK_SEAT'|'RANK_SEAT_START',samplingProtocol:string,
 *  randomSeed:string,precommittedSeedDigest:string,externalRegistrationId:string,
 *  independentFreshGameDraws:true,
 *  authenticatedOriginalPrints:Array<{rank:number,printed60Sha256:string,physicalCards:number}>,
 *  games:Game[]}} config
 * @returns {object}
 */
function anytimeRandomizedFieldWinBetting(config){
  const {candidateOrdinal,candidateId,candidatePrinted60Digest,layout,
    samplingProtocol,randomSeed,precommittedSeedDigest,externalRegistrationId,
    independentFreshGameDraws,authenticatedOriginalPrints,games}=config??{};
  const C=COUNTS[layout],targetRate=config?.targetRate??0.995,alpha=config?.alpha??0.05;
  if(!Number.isSafeInteger(candidateOrdinal)||candidateOrdinal<1||
    typeof candidateId!=='string'||!candidateId||
    !DIGEST.test(candidatePrinted60Digest??'')||!C||samplingProtocol!==PROTOCOL||
    !DIGEST.test(randomSeed??'')||!DIGEST.test(precommittedSeedDigest??'')||
    typeof externalRegistrationId!=='string'||!externalRegistrationId||
    independentFreshGameDraws!==true||!Number.isFinite(targetRate)||
    targetRate<=0||targetRate>=1||!Number.isFinite(alpha)||alpha<=0||alpha>=1||
    !Array.isArray(authenticatedOriginalPrints)||!Array.isArray(games)){
    throw new TypeError('Missing preregistered candidate or randomized paper-game parameters');
  }
  const seedDigest=createHash('sha256').update(Buffer.from(randomSeed,'hex')).digest('hex');
  if(seedDigest!==precommittedSeedDigest)throw new TypeError('Seed differs from external commitment');
  const source=new Map();
  for(const row of authenticatedOriginalPrints){
    if(!Number.isSafeInteger(row?.rank)||row.rank<1||row.rank>32||
      source.has(row.rank)||!DIGEST.test(row.printed60Sha256??'')||
      row.physicalCards!==60)throw new TypeError('Invalid or duplicated original printed60 roster');
    source.set(row.rank,row.printed60Sha256);
  }
  const ids=new Set(),deals=new Set(),perCellCounts=Array(C).fill(0);
  let qualifiedWins=0,qualifiedNonwins=0,censoredGames=0;
  let unadmittedSourceGames=0,invalidSourceReceipts=0;
  for(let i=0;i<games.length;i++){
    const game=games[i],cell=assignedCell(randomSeed,i,layout);
    const rank=Math.floor(cell/(C/32))+1;
    const candidateSeat=C===32?undefined:Math.floor((cell%(C/32))/(C/64));
    const startingSeat=C===128?cell%2:undefined;
    if(!game||game.trialIndex!==i||typeof game.gameId!=='string'||
      !game.gameId||ids.has(game.gameId)||game.cell!==cell||game.rank!==rank||
      (candidateSeat!==undefined&&game.candidateSeat!==candidateSeat)||
      (startingSeat!==undefined&&game.startingSeat!==startingSeat)||
      game.candidatePrinted60Digest!==candidatePrinted60Digest||
      !STATUSES.has(game.status)){
      throw new TypeError('Missing, reordered or misidentified preregistered game');
    }
    ids.add(game.gameId);perCellCounts[cell]++;
    const printOkay=source.get(rank)===game.sourcePrinted60Digest&&
      DIGEST.test(game.sourcePrinted60Digest??'');
    const dealOkay=DIGEST.test(game.sourceDealFingerprint??'');
    if(dealOkay&&deals.has(game.sourceDealFingerprint)){
      throw new TypeError('Repeated physical source deal violates independent games');
    }
    if(dealOkay)deals.add(game.sourceDealFingerprint);
    if(!printOkay)unadmittedSourceGames++;
    if(!dealOkay)invalidSourceReceipts++;
    if(!printOkay||!dealOkay||game.status==='CENSORED')censoredGames++;
    else if(game.status==='QUALIFIED_WIN')qualifiedWins++;
    else qualifiedNonwins++;
  }
  const B=32,logs=[],logWeightSum=Math.log1p(-(2**(-B)));
  for(let j=1;j<=B;j++){
    const eta=1-2**(-j);
    logs.push(-j*Math.LN2-logWeightSum+
      qualifiedWins*Math.log1p(eta*(1-targetRate)/targetRate)+
      (qualifiedNonwins+censoredGames)*Math.log1p(-eta));
  }
  const top=Math.max(...logs);
  const logEValue=top+Math.log(logs.reduce((sum,x)=>sum+Math.exp(x-top),0));
  const logThreshold=Math.log(candidateOrdinal)+Math.log(candidateOrdinal+1)-Math.log(alpha);
  return {version:VERSION,samplingProtocol:PROTOCOL,externalRegistrationId,
    precommittedSeedDigest,candidateOrdinal,candidateId,candidatePrinted60Digest,
    targetRate,alpha,layout,cellCount:C,registeredGames:games.length,
    perCellCounts,observedCells:perCellCounts.filter(n=>n>0).length,
    qualifiedWins,qualifiedNonwins,censoredGames,unadmittedSourceGames,
    invalidSourceReceipts,authenticatedSourceRanks:source.size,betCount:B,
    logEValue,eValue:logEValue>Math.log(Number.MAX_VALUE)?Infinity:Math.exp(logEValue),
    logThreshold,threshold:Math.exp(logThreshold),
    decision:logEValue>=logThreshold?
      'EVIDENCE_RANDOMIZED_FIELD_RATE_EXCEEDS_TARGET':'INSUFFICIENT_INFORMATION',
    competitiveQualified:false,
    qualification:'Mathematical evidence only. Independent third-party verification of random seed and original qualified paper matches is mandatory; native wins do not qualify.'};
}

module.exports={VERSION,PROTOCOL,assignedCell,anytimeRandomizedFieldWinBetting};
