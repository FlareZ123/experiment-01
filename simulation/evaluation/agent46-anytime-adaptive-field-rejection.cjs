'use strict';
const {PROTOCOL:BASE_PROTOCOL,anytimeAdaptiveFieldEnvelope}=
  require('./agent46-anytime-adaptive-field-envelope.cjs');

const VERSION='agent46-anytime-adaptive-field-rejection-v1';
const PROTOCOL='PROSPECTIVE_ADAPTIVE_FIELD_995_EXCLUSION_V1';

/**
 * Falsify the extreme single-fixed-60 Aichi field target from qualified losses
 * on potentially only one authentic opponent cell. The complete field is
 * still included with optimistic 100% candidate wins for untested cells.
 *
 * For each original cell i let p_i = true qualified paper-game win chance and
 * f_i=1-p_i = true nonwin chance. The fixed 32/64/128-cell field is
 * p = mean(p_i), f=mean(f_i). The conditional supermartingale for failure
 * indicators gives L_f<=f with anytime familywise coverage 1-alpha, so the
 * candidate's FIELD WIN RATE is at most U_p=1-L_f. Reject the >=target claim
 * if U_p<targetRate. This does not produce a stronger alternative deck.
 *
 * A frozen candidate-ordinal k allocates familywise error alpha/[k(k+1)],
 * further split among C distinct source rank/seat/starter cells. Importantly,
 * if the SAME candidate is also submitted to the lower-bound/proof method,
 * that second test must consume a distinct hypothesis ordinal (or another
 * explicitly preallocated alpha share), to avoid double spending alpha.
 *
 * CENSORED/MISSING source matches count as ZERO failure evidence, which is
 * the OPPOSITE safe direction from a win-lower-bound test. Even if a native
 * engine shows a nonwin, it must be kept censored unless every original-paper
 * rule, qualified opponent decision, physical deal and clock was verified.
 * Calls are mathematical diagnostics and cannot attest genuine qualification.
 *
 * @typedef {'QUALIFIED_WIN'|'QUALIFIED_NONWIN'|'CENSORED'} Status
 * @typedef {{trialIndex:number,gameId:string,cell:number,rank:number,
 * candidateSeat?:0|1,startingSeat?:0|1,candidatePrinted60Digest:string,
 * sourcePrinted60Digest:string,sourceDealFingerprint:string,status:Status}} Game
 *
 * @param {{candidateOrdinal:number,candidateId:string,
 * candidatePrinted60Digest:string,layout:'RANK'|'RANK_SEAT'|'RANK_SEAT_START',
 * selectionProtocol:string,externalRegistrationId:string,
 * freshConditionalCellGameDraws:true,
 * authenticatedOriginalPrints:Array<{rank:number,printed60Sha256:string,physicalCards:60}>,
 * games:Game[],targetRate?:number,alpha?:number}} cfg
 * @returns {object}
 */
function anytimeAdaptiveFieldRejection(cfg){
  if(cfg?.selectionProtocol!==PROTOCOL){
    throw new TypeError('Prospective field-rejection protocol is required');
  }
  const targetRate=cfg.targetRate??0.995;
  if(!(targetRate>0&&targetRate<1)){
    throw new TypeError('Target field win probability must be between zero and one');
  }
  // Translate an externally qualified paper nonwin to an observed failure.
  // Other qualified wins become nonfailures; source/clock censored trials
  // remain censored and receive no artificially favorable failure evidence.
  const failures=(cfg.games??[]).map(game=>({
    ...game,
    status:game.status==='QUALIFIED_NONWIN'?'QUALIFIED_WIN':
      game.status==='QUALIFIED_WIN'?'QUALIFIED_NONWIN':game.status
  }));
  const analysis=anytimeAdaptiveFieldEnvelope({
    ...cfg,selectionProtocol:BASE_PROTOCOL,targetRate:1-targetRate,
    games:failures
  });
  const fieldNonwinRateLowerBound=analysis.fieldLowerBound;
  const fieldWinRateUpperBound=1-fieldNonwinRateLowerBound;
  return {
    version:VERSION,selectionProtocol:PROTOCOL,
    externalRegistrationId:analysis.externalRegistrationId,
    candidateId:analysis.candidateId,
    candidateOrdinal:analysis.candidateOrdinal,
    candidatePrinted60Digest:analysis.candidatePrinted60Digest,
    layout:analysis.layout,cellCount:analysis.cellCount,
    authenticatedSourceRanks:analysis.authenticatedSourceRanks,
    registeredGames:analysis.registeredGames,
    observedCells:analysis.observedCells,
    genuineQualifiedPaperNonwins:analysis.qualifiedWins,
    genuineQualifiedPaperWins:analysis.qualifiedNonwins,
    censoredGames:analysis.censoredGames,
    perCell:analysis.perCell.map(cell=>({
      cell:cell.cell,rank:cell.rank,
      qualifiedNonwins:cell.wins,
      qualifiedWins:cell.nonwins-cell.censored,
      censored:cell.censored,
      nonwinRateLowerBound:cell.lowerBound,
      winRateUpperBound:1-cell.lowerBound
    })),
    targetRate,alpha:analysis.alpha,
    cellThreshold:analysis.cellThreshold,
    fieldNonwinRateLowerBound,
    fieldWinRateUpperBound,
    decision:fieldWinRateUpperBound<targetRate?
      'CONDITIONAL_EVIDENCE_FIELD_CANNOT_REACH_TARGET':
      'INSUFFICIENT_INFORMATION',
    statisticalAssumptionsExternallyVerified:false,
    competitiveQualified:false,
    qualification:'Conditional falsification test only; actual original-source games, paper nonwins, clock and fixed policy must be independently audited. Native losses cannot qualify. Distinct test families require distinct allocated hypothesis ordinals.'
  };
}
module.exports={VERSION,PROTOCOL,anytimeAdaptiveFieldRejection};
