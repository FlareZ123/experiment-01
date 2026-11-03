'use strict';
const {createHash}=require('node:crypto');

const VERSION='agent46-anytime-adaptive-field-envelope-v1';
const PROTOCOL='PROSPECTIVE_ADAPTIVELY_SELECTED_FIELD_CELLS_V1';
const COUNTS=Object.freeze({RANK:32,RANK_SEAT:64,RANK_SEAT_START:128});
const DIGEST=/^[0-9a-f]{64}$/;
const STATUSES=new Set(['QUALIFIED_WIN','QUALIFIED_NONWIN','CENSORED']);
const BETS=Array.from({length:32},(_,i)=>{
  const j=i+1;
  return {eta:1-2**(-j),logWeight:-j*Math.LN2-
    Math.log1p(-(2**(-32)))};
});

/**
 * Precommitted mixture e-value at a fixed test-null q for one cell.
 * Under conditional Bernoulli success probability <=q, each factor
 * 1 + eta * (X-q)/q has conditional expectation <=1.
 * @param {number} wins
 * @param {number} nonwins Includes conservative censored nonwins.
 * @param {number} q Null parameter strictly between 0 and 1.
 * @returns {number} Log mixture e-value
 */
function cellLogE(wins,nonwins,q){
  if(!Number.isSafeInteger(wins)||wins<0||
     !Number.isSafeInteger(nonwins)||nonwins<0||
     !(q>0&&q<1))throw new TypeError('Invalid cell e-value inputs');
  const terms=BETS.map(({eta,logWeight})=>
    logWeight+wins*Math.log1p(eta*(1-q)/q)+
    nonwins*Math.log1p(-eta));
  const peak=Math.max(...terms);
  return peak+Math.log(terms.reduce((a,x)=>a+Math.exp(x-peak),0));
}

/**
 * Time-uniform one-sided confidence lower endpoint for a cell success rate.
 * Every q below this endpoint has rejected H0:p_cell<=q; inversion uses
 * that logE(wins,nonwins,q) is nonincreasing in q.
 * @param {number} wins
 * @param {number} nonwins
 * @param {number} logThreshold
 * @returns {number}
 */
function cellAnytimeLowerBound(wins,nonwins,logThreshold){
  if(!Number.isFinite(logThreshold)||logThreshold<=0||
     !Number.isSafeInteger(wins)||wins<0||
     !Number.isSafeInteger(nonwins)||nonwins<0)
    throw new TypeError('Invalid cell confidence inputs');
  if(wins===0)return 0;
  let lo=0,hi=1;
  for(let iter=0;iter<60;iter++){
    const mid=(lo+hi)/2;
    if(cellLogE(wins,nonwins,mid)>=logThreshold)lo=mid;
    else hi=mid;
  }
  return lo;
}

/**
 * Arbitrarily chosen opponent cells may be interleaved/adaptively selected.
 * For each selected cell i, game outcomes must remain fresh conditional
 * Bernoulli draws with a fixed p_i: E[X_t | prior, selected i] = p_i.
 * Individual cell e-processes are still supermartingales under their own
 * p_i nulls; a union bound over all cells and candidate ordinals gives an
 * anytime simultaneous lower confidence envelope on the field mean.
 *
 * Unlike randomized one-game pooling, this method does not require
 * cryptographically random field-cell selection. The reduced power is
 * substantial: all 32 (or 64/128) cells require strong lower bounds.
 * All paper-match/clock/roster/adaptive-selection claims require external
 * audits; this function cannot certify their truth.
 *
 * @typedef {'QUALIFIED_WIN'|'QUALIFIED_NONWIN'|'CENSORED'} Status
 * @typedef {{trialIndex:number,gameId:string,cell:number,rank:number,
 * candidateSeat?:0|1,startingSeat?:0|1,
 * candidatePrinted60Digest:string,sourcePrinted60Digest:string,
 * sourceDealFingerprint:string,status:Status}} Game
 * @param {{candidateOrdinal:number,candidateId:string,
 * candidatePrinted60Digest:string,layout:'RANK'|'RANK_SEAT'|'RANK_SEAT_START',
 * selectionProtocol:string,externalRegistrationId:string,
 * freshConditionalCellGameDraws:true,
 * authenticatedOriginalPrints:Array<{rank:number,printed60Sha256:string,physicalCards:60}>,
 * games:Game[],targetRate?:number,alpha?:number}} config
 * @returns {object}
 */
function anytimeAdaptiveFieldEnvelope(config){
  const {candidateOrdinal,candidateId,candidatePrinted60Digest,layout,
    selectionProtocol,externalRegistrationId,freshConditionalCellGameDraws,
    authenticatedOriginalPrints,games}=config??{};
  const C=COUNTS[layout],targetRate=config?.targetRate??0.995;
  const alpha=config?.alpha??0.05;
  if(!Number.isSafeInteger(candidateOrdinal)||candidateOrdinal<1||
     typeof candidateId!=='string'||!candidateId||
     !DIGEST.test(candidatePrinted60Digest??'')||!C||
     selectionProtocol!==PROTOCOL||
     typeof externalRegistrationId!=='string'||!externalRegistrationId||
     freshConditionalCellGameDraws!==true||
     !Number.isFinite(targetRate)||!(targetRate>0&&targetRate<1)||
     !Number.isFinite(alpha)||!(alpha>0&&alpha<1)||
     !Array.isArray(authenticatedOriginalPrints)||!Array.isArray(games))
    throw new TypeError('Missing or invalid prospective adaptive field registration');
  const source=new Map();
  for(const row of authenticatedOriginalPrints){
    if(!Number.isSafeInteger(row?.rank)||row.rank<1||row.rank>32||
       source.has(row.rank)||!DIGEST.test(row.printed60Sha256??'')||
       row.physicalCards!==60)
      throw new TypeError('Invalid or duplicate original 60 source roster');
    source.set(row.rank,row.printed60Sha256);
  }
  const counts=Array.from({length:C},(_,cell)=>({
    cell,rank:Math.floor(cell/(C/32))+1,
    wins:0,nonwins:0,censored:0,lowerBound:0
  }));
  const ids=new Set(),deals=new Set();
  let qualifiedWins=0,qualifiedNonwins=0,censoredGames=0;
  for(let trialIndex=0;trialIndex<games.length;trialIndex++){
    const g=games[trialIndex];
    const i=g?.cell;
    if(!Number.isSafeInteger(i)||i<0||i>=C)
      throw new TypeError('Unregistered or out-of-range field cell');
    const rank=Math.floor(i/(C/32))+1;
    const candidateSeat=C===32?undefined:
      Math.floor((i%(C/32))/(C/64));
    const startingSeat=C===128?i%2:undefined;
    if(g.trialIndex!==trialIndex||
       typeof g.gameId!=='string'||!g.gameId||ids.has(g.gameId)||
       g.rank!==rank||g.candidatePrinted60Digest!==candidatePrinted60Digest||
       (candidateSeat!==undefined&&g.candidateSeat!==candidateSeat)||
       (startingSeat!==undefined&&g.startingSeat!==startingSeat)||
       !STATUSES.has(g.status))
      throw new TypeError('Altered, missing or duplicated prospectively registered game');
    ids.add(g.gameId);
    const printOkay=source.get(rank)===g.sourcePrinted60Digest&&
      DIGEST.test(g.sourcePrinted60Digest??'');
    const dealOkay=DIGEST.test(g.sourceDealFingerprint??'');
    if(dealOkay&&deals.has(g.sourceDealFingerprint))
      throw new TypeError('Repeated physical source deal; fresh-game assumption fails');
    if(dealOkay)deals.add(g.sourceDealFingerprint);
    const c=counts[i];
    if(!printOkay||!dealOkay||g.status==='CENSORED'){
      c.nonwins++;c.censored++;censoredGames++;
    }else if(g.status==='QUALIFIED_WIN'){
      c.wins++;qualifiedWins++;
    }else{c.nonwins++;qualifiedNonwins++;}
  }
  const logThreshold=Math.log(C)+Math.log(candidateOrdinal)+
    Math.log(candidateOrdinal+1)-Math.log(alpha);
  let lowerSum=0;
  for(const c of counts){
    c.lowerBound=cellAnytimeLowerBound(c.wins,c.nonwins,logThreshold);
    lowerSum+=c.lowerBound;
  }
  const fieldLowerBound=lowerSum/C;
  return {version:VERSION,selectionProtocol:PROTOCOL,externalRegistrationId,
    candidateId,candidateOrdinal,candidatePrinted60Digest,layout,
    cellCount:C,registeredGames:games.length,authenticatedSourceRanks:source.size,
    observedCells:counts.filter(x=>x.wins+x.nonwins>0).length,
    qualifiedWins,qualifiedNonwins,censoredGames,
    logCellThreshold:logThreshold,cellThreshold:Math.exp(logThreshold),
    fieldLowerBound,targetRate,alpha,perCell:counts,
    decision:fieldLowerBound>targetRate?
      'CONDITIONAL_FIELD_LOWER_BOUND_EXCEEDS_TARGET':'INSUFFICIENT_INFORMATION',
    statisticalAssumptionsExternallyVerified:false,
    competitiveQualified:false,
    qualification:'Time-uniform simultaneous conditional confidence sequence only; externally verify paper wins, conditional game laws, source printings, registration and clock. No native games qualify.'};
}
module.exports={VERSION,PROTOCOL,COUNTS,cellLogE,cellAnytimeLowerBound,
  anytimeAdaptiveFieldEnvelope};
