'use strict';

const {createHash}=require('node:crypto');

/**
 * Classify the immediately preceding opponent attack for each genuine
 * source-owned PassTurnAction in a steward developmental public archive.
 * This is a postgame action-tape census, not a paper-legal opportunity audit.
 *
 * @param {{attempts?:object[]}} archive Published steward native archive.
 * @returns {object} Failure-inclusive source Pass context census.
 */
function analyzeSourcePassAttackContext(archive) {
  const rows=Array.isArray(archive?.attempts)?archive.attempts:[];
  const attempts=rows.map(row=>{
    const match=typeof row?.id==='string'?
      /^[0-9]+:[^:]+:([AB]):/.exec(row.id):null;
    const expectedSeat=match?(match[1]==='A'?1:0):null;
    const tape=row?.publicRootActions;
    const digest=Array.isArray(tape)?createHash('sha256')
      .update(JSON.stringify(tape)).digest('hex'):null;
    const digestVerified=Array.isArray(tape)&&
      row.publicRootActionsTruncated===false&&
      Number.isSafeInteger(row.publicRootActionCount)&&
      tape.length===row.publicRootActionCount&&
      digest===row.publicRootLedgerSha256Computed&&
      digest===row.publicRootLedgerSha256Reported&&
      row.publicRootLedgerDigestConsistent===true;
    const sourceVerified=expectedSeat!==null&&
      row.originalSourceSeat===expectedSeat&&
      /^[0-9a-f]{64}$/.test(row.sourceDealFingerprint)&&
      /^[0-9a-f]{64}$/.test(row.fullPhysicalDealFingerprint);
    if (!digestVerified||!sourceVerified) {
      return {id:row?.id??null,nativeStatus:row?.status??null,
        custody:'UNVERIFIED',passes:[],totalSourcePasses:null,
        reason:!digestVerified?'INVALID_OR_INCOMPLETE_ACTION_TAPE':
          'SOURCE_SEAT_OR_PHYSICAL_DEAL_UNVERIFIED'};
    }
    const sourcePasses=tape.filter(event=>
      event.playerSlot===expectedSeat&&event.action==='PassTurnAction');
    const passes=sourcePasses.map(pass=>{
      const preceding=tape.filter(event=>
        event.playerSlot===1-expectedSeat&&
        event.action==='AttackAction'&&
        Number.isSafeInteger(pass.turnBefore)&&
        event.turnBefore===pass.turnBefore-1);
      const attacks=preceding.map(event=>event.attack??null);
      const category=attacks.includes('Shadow Mist')?
        'SHADOW_MIST_PRIOR_TURN':preceding.length?
        'OTHER_OPPONENT_ATTACK_PRIOR_TURN':
        'NO_RECORDED_OPPONENT_ATTACK_PRIOR_TURN';
      return {ordinal:pass.actionOrdinal,turnBefore:pass.turnBefore,
        category,precedingOpponentAttacks:attacks};
    });
    return {id:row.id,nativeStatus:row.status,
      custody:'VERIFIED_NATIVE_TAPE_NOT_PAPER_ELIGIBILITY',
      sourceSeat:expectedSeat,passes,totalSourcePasses:passes.length};
  });
  const categories={SHADOW_MIST_PRIOR_TURN:0,
    OTHER_OPPONENT_ATTACK_PRIOR_TURN:0,
    NO_RECORDED_OPPONENT_ATTACK_PRIOR_TURN:0};
  for (const row of attempts) for (const pass of row.passes)
    categories[pass.category]++;
  return {schema:'agent18-source-pass-immediately-prior-attack-v1',
    registeredAttempts:attempts.length,
    verifiedAttemptTapes:attempts.filter(row=>
      row.custody==='VERIFIED_NATIVE_TAPE_NOT_PAPER_ELIGIBILITY').length,
    unverifiableAttempts:attempts.filter(row=>
      row.custody==='UNVERIFIED').length,
    classifiedSourcePasses:Object.values(categories).reduce((a,b)=>a+b,0),
    categories,attempts,paperLegalOpportunitiesCertified:0,
    competitivelyQualifiedGames:0};
}

module.exports={analyzeSourcePassAttackContext};
