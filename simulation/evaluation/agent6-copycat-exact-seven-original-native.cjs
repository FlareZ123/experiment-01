'use strict';

const assert=require('node:assert/strict');
const {createHash}=require('node:crypto');
const registration=require('../../results/aichi-2026/registrations/agent6-copycat-exact-seven-24arm-native-20261107.json');
const {runMatch}=require('../twinleaf/headless.cjs');
const {planAichi}=require('./aichi-pilot.cjs');
const source60=require('../../results/aichi-2026/full-decklists.json');
const {createOriginalSevenCopycatCapture}=
  require('./agent6-copycat-original-seven-capture.cjs');
const {GameMessage}=require('../../vendor/twinleaf/ptcg-server/output/game/game-message');

const VERSION='agent6-copycat-exact-start-seven-native-A-B-A-v2';
const digest=value=>createHash('sha256').update(JSON.stringify(value)).digest('hex');

/** @returns {{champion:number[],rank10:number[],nativeManifestSha256:string}} */
function originals() {
  const plan=planAichi(1,{
    allowEquivalentBasicEnergies:true,
    allowBasicEnergyMirrorPrintings:true,
    allowJapanesePromoHooks:true
  });
  const opp=plan.opponents.find(x=>x.rank===10);
  assert.equal(opp?.status,'ready','The authenticated original rank10 must resolve');
  assert.equal(plan.candidate.cards.length,60);
  assert.equal(opp.cards.length,60);
  const original=source60.decks.find(d=>d.rank===1);
  assert.ok(original);
  let cursor=0,physicalBasicCopies=0;
  const basicPrints=new Set();
  for(const card of original.cards){
    const resolved=plan.candidate.cards.slice(cursor,cursor+card.count);
    assert.equal(resolved.length,card.count);
    if(card.category==='Pokémon'&&card.name!=='Shadow Rider Calyrex VMAX') {
      resolved.forEach(print=>basicPrints.add(print));
      physicalBasicCopies+=resolved.length;
    }
    cursor+=card.count;
  }
  assert.equal(cursor,60);
  assert.equal(physicalBasicCopies,14,
    'Frozen original champion basic-count integrity drift');
  return {champion:plan.candidate.cards,rank10:opp.cards,
    championBasicPrints:basicPrints,
    nativeManifestSha256:plan.manifestDigest,
    explicitPrintingSubstitutions:{
      champion:plan.candidate.substitutions,
      rank10:opp.substitutions
    }};
}

/**
 * Single literal replay of an already preregistered source-seed/seat condition.
 * The root observer is an instance-only temporary dispatch wrapper and does
 * not alter either player policy, card, effect, prompt or RNG.
 * @param {object} group Registered immutable physical deal.
 * @param {string} mode A-control/B-exact-seven-observer/A-repeat.
 * @param {ReturnType<typeof originals>} decks Exact original source 60s.
 * @returns {object} Failure-inclusive real Store evidence.
 */
function runOne(group,mode,decks) {
  const championSeat=group.championSeat;
  const capture=mode==='B-observe-true-starting-seven'?
    createOriginalSevenCopycatCapture(championSeat,3,
      GameMessage.CHOOSE_STARTING_POKEMONS,decks.championBasicPrints):null;
  const request={
    deckA:championSeat===0?decks.champion:decks.rank10,
    deckB:championSeat===1?decks.champion:decks.rank10,
    seed:group.seed,maxActions:registration.maxNativeRootActionsPerArm,
    label:'agent6-copycat-source-'+group.seed+'-championSeat'+championSeat,
    strictPromptValidation:true,
    mandatoryOptionFallback:true,
    enforceSelectOptionLegality:true,
    enforceVisiblePlayLockBothSeats:true,
    captureInitialSourceDealFingerprintSeat:championSeat,
    captureInitialFullPhysicalDeal:true,
    captureSetupCompensation:true,
    captureDecisionTrace:true,
    captureNativeAbortEvidence:true,
    captureStartingBoard:true,
    onRootStoreCreated:capture?.onRootStoreCreated
  };
  try {
    const game=runMatch(request);
    return {
      seed:group.seed,championSeat,rank10Seat:1-championSeat,mode,
      status:game.finished?'native-terminal-unqualified':'root-cap-unqualified',
      actions:game.actions,turns:game.turns,winner:game.winner,
      nativeFinished:game.finished,
      publicRootSha256:digest(game.rootActionLedger??null),
      nativeActionCount:game.rootActionLedger?.length??null,
      sourceDeal:game.initialSourceDealFingerprint?.digestSha256??null,
      fullDeal:game.initialFullPhysicalDealFingerprint?.digestSha256??null,
      setupCompensation:game.initialSetupCompensation??null,
      actualFirstTurn:game.actualFirstTurn??null,
      observerRootCapture:capture?.result()??null,
      observerRootAudit:capture?.audit()??null,
      originalCardNameCountInventoryUsed:true,
      paperQualifiedCompetitiveGames:0
    };
  } catch (error) {
    return {
      seed:group.seed,championSeat,rank10Seat:1-championSeat,mode,
      status:'engine-error',error:String(error?.message??error).slice(0,280),
      observerRootCapture:capture?.result()??null,
      observerRootAudit:capture?.audit()??null,
      sourceDeal:null,fullDeal:null,publicRootSha256:null,
      originalCardNameCountInventoryUsed:true,paperQualifiedCompetitiveGames:0
    };
  }
}

/** @returns {object} All 24 original-Store attempts and strict A/B/A result. */
function run() {
  assert.equal(registration.schema,'agent6-copycat-exact-seven-24arm-native-v2');
  assert.equal(registration.groups.length,8);
  assert.deepEqual(registration.phases,
    ['A-control','B-observe-true-starting-seven','A-repeat']);
  const decks=originals();
  const rows=[];
  for(const group of registration.groups) {
    for(const mode of registration.phases)rows.push(runOne(group,mode,decks));
  }
  assert.equal(rows.length,24);
  const normalize=r=>({status:r.status,actions:r.actions??null,
    turns:r.turns??null,winner:r.winner??null,
    nativeFinished:r.nativeFinished??null,publicRootSha256:r.publicRootSha256,
    sourceDeal:r.sourceDeal,fullDeal:r.fullDeal,error:r.error??null});
  const groups=[];
  for(let i=0;i<rows.length;i+=3) {
    const [a,b,aPrime]=rows.slice(i,i+3);
    const replayControlIdentical=JSON.stringify(normalize(a))===
      JSON.stringify(normalize(aPrime));
    const observerPolicyNeutral=JSON.stringify(normalize(a))===
      JSON.stringify(normalize(b));
    const actualSourceCapture=!!b.observerRootCapture &&
      b.observerRootAudit?.actualStoreBound===true &&
      b.observerRootAudit.originalSevenCaptured===true &&
      b.observerRootAudit.exactSevenAndSixPrizeCaptured===true &&
      b.observerRootCapture.exactInitialSevenComparable===true &&
      b.observerRootCapture.initialSeven.size===7 &&
      b.observerRootCapture.initialSeven.startingBasicCount>=1 &&
      b.observerRootAudit.instanceWrapperDetached===true;
    groups.push({seed:a.seed,championSeat:a.championSeat,
      replayControlIdentical,observerPolicyNeutral,actualSourceCapture,
      sourcePhysicalDealMatched:a.sourceDeal===b.sourceDeal&&
        b.sourceDeal===aPrime.sourceDeal,
      fullPhysicalDealMatched:a.fullDeal===b.fullDeal&&
        b.fullDeal===aPrime.fullDeal});
  }
  return {schema:VERSION,registration:'results/aichi-2026/registrations/agent6-copycat-exact-seven-24arm-native-20261107.json',
    nativeManifestSha256:decks.nativeManifestSha256,
    explicitPrintingSubstitutions:decks.explicitPrintingSubstitutions,
    attemptCount:rows.length,groups,
    allControlsMatched:groups.every(g=>g.replayControlIdentical),
    observerNoninterfering:groups.every(g=>g.observerPolicyNeutral),
    allBCaptured:groups.every(g=>g.actualSourceCapture),
    allSourceDealsMatched:groups.every(g=>g.sourcePhysicalDealMatched&&g.fullPhysicalDealMatched),
    rows,competitiveGamesQualified:0,verifiedFieldWinRate:null};
}

if(require.main===module){
  const data=run();
  process.stdout.write(JSON.stringify(data,null,2)+'\n');
  const observed=data.rows.filter(row=>row.mode==='B-observe-true-starting-seven');
  const countZone=(role,zone)=>observed.filter(row=>
    row.observerRootCapture?.originalTaggedZones?.[role]===zone).length;
  const stats={schema:data.schema,
    attemptCount:data.attemptCount,
    allControlsMatched:data.allControlsMatched,
    observerNoninterfering:data.observerNoninterfering,
    allBCaptured:data.allBCaptured,
    allSourceDealsMatched:data.allSourceDealsMatched,
    statusCounts:Object.fromEntries([...new Set(data.rows.map(r=>r.status))]
      .map(status=>[status,data.rows.filter(r=>r.status===status).length])),
    championPrintSubstitutions:data.explicitPrintingSubstitutions.champion,
    rank10PrintSubstitutions:data.explicitPrintingSubstitutions.rank10,
    observedChampionZoneCounts:Object.fromEntries(
      ['mimikyu','dialga','ball','seal'].map(role=>[role,
        Object.fromEntries(['hand','prizes','deck']
          .map(zone=>[zone,countZone(role,zone)]))])),
    observedSingleCorePrizeBallDeck:observed.filter(row=>
      row.observerRootCapture?.oneCorePrizedBallDeck).length,
    observedHeldSealAndInitialHandV:observed.filter(row=>
      row.observerRootCapture?.directInitialSealAndV).length,
    sourceFirstSevenBasicCounts:observed.map(row=>
      row.observerRootCapture?.initialSeven?.startingBasicCount??null),
    actualSourceStartingPromptsObserved:observed.map(row=>
      row.observerRootAudit?.sourceStartingPromptsSeen??null),
    actualInvalidInitialSevenPromptCounts:observed.map(row=>
      row.observerRootAudit?.rejectedInvalidSevenPromptsSeen??null),
    sourceMulligansFromNativeSetup:observed.map(row=>
      row.setupCompensation?.mulligans?.[row.championSeat]??null),
    competitivelyQualifiedGames:0};
  process.stderr.write(JSON.stringify(stats)+'\n');
  if(!data.allControlsMatched||!data.observerNoninterfering||
    !data.allBCaptured||!data.allSourceDealsMatched)process.exitCode=1;
}
module.exports={VERSION,originals,runOne,run};
