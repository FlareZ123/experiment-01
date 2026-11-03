'use strict';

const assert=require('node:assert/strict');

const SCHEMA='agent48-original-source-setup-contrast-v1';
const CANDIDATES=['champion-reference','new-moon-lockbreaker-v1'];
const SHA256=/^[a-f0-9]{64}$/;

/**
 * Extract only public setup counts, not hand, deck, Prize or revealed-card
 * identities, from one archived native original-source attempted game.
 * @param {object} row Genuine archived canonical native trial.
 * @returns {object} Public setup counts with their completeness status.
 */
function summarizeOriginalSourceSetup(row){
  const t=row?.trial;
  assert.ok(t&&['A','B'].includes(t.candidateSlot));
  assert.ok(CANDIDATES.includes(t.candidateId));
  const sourceSeat=t.candidateSlot==='A'?1:0;
  const setup=row.initialSetupCompensation;
  const publicReveal=row.initialPublicMulliganReveals;
  const setupVerified=setup?.schema==='real-store-initial-setup-compensation-v1'&&
    Array.isArray(setup.mulligans)&&setup.mulligans.length===2&&
    setup.mulligans.every(x=>Number.isSafeInteger(x)&&x>=0)&&
    Array.isArray(setup.bonusDrawn)&&setup.bonusDrawn.length===2&&
    setup.bonusDrawn.every(x=>Number.isSafeInteger(x)&&x>=0);
  const revealVerified=publicReveal?.schema===
    'native-public-opponent-mulligan-reveal-v1'&&
    Array.isArray(publicReveal.revealedHandCounts)&&
    publicReveal.revealedHandCounts.length===2&&
    publicReveal.revealedHandCounts.every(x=>
      Number.isSafeInteger(x)&&x>=0);
  const sourceDigest=typeof row.sourceDealFingerprint==='string'&&
    SHA256.test(row.sourceDealFingerprint)?
    row.sourceDealFingerprint:null;
  return {
    candidateId:t.candidateId,sourceSeat,
    setupCountsVerified:setupVerified,
    // Counts and relative comparisons below are public; no source cards.
    mulligansBySeat:setupVerified?[...setup.mulligans]:null,
    bonusDrawnBySeat:setupVerified?[...setup.bonusDrawn]:null,
    publicRevealCountsVerified:revealVerified,
    revealedMulliganCountsBySeat:revealVerified?
      [...publicReveal.revealedHandCounts]:null,
    sourceDigest,
    nativeStarterVerified:row.verifiedFirstTurn===true&&
      [0,1].includes(row.actualStarterSeat),
    nativeStarterSeat:row.verifiedFirstTurn===true&&
      [0,1].includes(row.actualStarterSeat)?
      row.actualStarterSeat:null,
    competitiveGameQualified:false
  };
}

/**
 * Compare two fixed-candidate original source setups on a registered same-seed
 * group, without claiming the registration guarantees physical equivalence.
 * @param {object[]} rows Native rows of a single recorded policy mode.
 * @param {string} groupId Registered `rank:repeat:seat` ID.
 * @returns {object} Owner-information-safe postgame setup covariates.
 */
function compareOriginalSourceSetup(rows,groupId){
  assert.ok(Array.isArray(rows));
  assert.match(groupId,/^(5|6|11):\d+:[AB]$/);
  const found=rows.filter(row=>row?.trial&&
    [row.trial.rank,row.trial.repeat,row.trial.candidateSlot].join(':')===
      groupId);
  assert.equal(found.length,2,'Need exactly two native candidate attempts');
  assert.deepEqual(found.map(x=>x.trial.candidateId).sort(),
    [...CANDIDATES].sort());
  const [a,b]=found;
  assert.equal(a.trial.seed,b.trial.seed,
    'Registered seed differs within source group');
  const snapshots=Object.fromEntries(found.map(row=>[
    row.trial.candidateId,summarizeOriginalSourceSetup(row)
  ]));
  const x=snapshots[CANDIDATES[0]],y=snapshots[CANDIDATES[1]];
  const publicSetupKnown=x.setupCountsVerified&&y.setupCountsVerified;
  const publicRevealsKnown=x.publicRevealCountsVerified&&
    y.publicRevealCountsVerified;
  return {
    schema:SCHEMA,groupId,sourceSeat:x.sourceSeat,
    registeredSameSeed:true,
    physicalSourceDigestKnown:x.sourceDigest!==null&&y.sourceDigest!==null,
    physicalSourceDealMatch:x.sourceDigest!==null&&y.sourceDigest!==null?
      x.sourceDigest===y.sourceDigest:null,
    publicSetupKnown,
    sameMulliganCounts:publicSetupKnown?
      JSON.stringify(x.mulligansBySeat)===
      JSON.stringify(y.mulligansBySeat):null,
    sameBonusDrawnCounts:publicSetupKnown?
      JSON.stringify(x.bonusDrawnBySeat)===
      JSON.stringify(y.bonusDrawnBySeat):null,
    publicRevealsKnown,
    samePublicMulliganCounts:publicRevealsKnown?
      JSON.stringify(x.revealedMulliganCountsBySeat)===
      JSON.stringify(y.revealedMulliganCountsBySeat):null,
    starterKnown:x.nativeStarterVerified&&y.nativeStarterVerified,
    sameNativeStarter:x.nativeStarterVerified&&y.nativeStarterVerified?
      x.nativeStarterSeat===y.nativeStarterSeat:null,
    snapshots:Object.fromEntries(Object.entries(snapshots).map(([id,s])=>[
      id,{
        setupCountsVerified:s.setupCountsVerified,
        mulligansBySeat:s.mulligansBySeat,
        bonusDrawnBySeat:s.bonusDrawnBySeat,
        publicRevealCountsVerified:s.publicRevealCountsVerified,
        revealedMulliganCountsBySeat:s.revealedMulliganCountsBySeat,
        nativeStarterVerified:s.nativeStarterVerified,
        nativeStarterSeat:s.nativeStarterSeat
      }
    ])),
    causalOriginEstablished:false,competitiveGameQualified:false
  };
}

/**
 * Census all registered cross-candidate source groups with actual setup
 * counts and native physical-opening parity. This is a retrospective
 * observational table; no randomization, causal effect or game wins implied.
 * @param {object[]} rows All actual native rows in one archived policy mode.
 * @returns {object} Count-only original-source setup comparison.
 */
function censusOriginalSourceSetup(rows){
  assert.ok(Array.isArray(rows));
  const groups=new Set(rows.map(row=>{
    const t=row?.trial;
    assert.ok(t&&[5,6,11].includes(t.rank));
    assert.ok(Number.isSafeInteger(t.repeat)&&t.repeat>=0);
    assert.ok(['A','B'].includes(t.candidateSlot));
    return [t.rank,t.repeat,t.candidateSlot].join(':');
  }));
  const comparisons=[...groups].map(id=>compareOriginalSourceSetup(rows,id));
  const known=comparisons.filter(x=>x.publicSetupKnown&&
    x.physicalSourceDigestKnown);
  const sameMulligan=known.filter(x=>x.sameMulliganCounts===true);
  const differentMulligan=known.filter(x=>x.sameMulliganCounts===false);
  const summary=cohort=>({
    groups:cohort.length,
    physicalOpeningMatched:cohort.filter(x=>x.physicalSourceDealMatch===true)
      .length,
    physicalOpeningMismatched:cohort.filter(x=>x.physicalSourceDealMatch===false)
      .length,
    sameCompensation:cohort.filter(x=>x.sameBonusDrawnCounts===true).length
  });
  return {
    schema:'agent48-real-native-setup-opening-census-v1',
    groups:groups.size,
    pairedComparisonsWithKnownSetupAndDigest:known.length,
    sameMulliganVector:summary(sameMulligan),
    differentMulliganVector:summary(differentMulligan),
    insufficientSetupOrSourceDigest:comparisons.length-known.length,
    comparisons:comparisons.map(x=>({
      groupId:x.groupId,publicSetupKnown:x.publicSetupKnown,
      sameMulliganCounts:x.sameMulliganCounts,
      sameBonusDrawnCounts:x.sameBonusDrawnCounts,
      physicalSourceDigestKnown:x.physicalSourceDigestKnown,
      physicalSourceDealMatch:x.physicalSourceDealMatch,
      sameNativeStarter:x.sameNativeStarter
    })),
    causalOriginEstablished:false,
    competitiveGameQualified:false
  };
}

module.exports={SCHEMA,summarizeOriginalSourceSetup,compareOriginalSourceSetup,
  censusOriginalSourceSetup};
