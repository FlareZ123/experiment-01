'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createHash}=require('node:crypto');
const {planAichi}=require('./aichi-pilot.cjs');
const {printingFingerprint}=
  require('./agent13-source-identity-gate.cjs');
const {runMatch}=require('../twinleaf/headless.cjs');
const {withActorOnlyRootPolicy}=
  require('../twinleaf/agent34-actor-only-root-policy.cjs');

const ROOT=path.resolve(__dirname,'../..');
const REGISTRATION='results/aichi-2026/registrations/agent1-rank17-ditto-prism-prospective-20261103.json';
const VERSION='agent1-original-rank17-ditto-stage1-two-seat-prospective-v1';
const SETTINGS=Object.freeze({
  allowEquivalentBasicEnergies:true,
  allowBasicEnergyMirrorPrintings:true,
  allowJapanesePromoHooks:true
});
const digest=value=>createHash('sha256')
  .update(JSON.stringify(value)).digest('hex');

/** Validate source-original exact printing identity before running any deal. */
function preflight(){
  const registered=JSON.parse(fs.readFileSync(path.join(ROOT,REGISTRATION),'utf8'));
  assert.equal(registered.schema,
    'agent1-rank17-original-prospective-ditto-dynamic-root-v1');
  assert.equal(registered.sourceRank,17);
  assert.equal(registered.opponentRank,1);
  assert.equal(registered.pinnedVendor,
    'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05');
  assert.deepEqual(registered.control,
    {naturalEvolutionRoot:true,dittoStage1Root:false});
  assert.deepEqual(registered.treatment,
    {naturalEvolutionRoot:true,dittoStage1Root:true});
  assert.ok(Array.isArray(registered.seedGroups));
  assert.equal(registered.seedGroups.length,8);
  assert.equal(new Set(registered.seedGroups).size,8);
  assert.ok(registered.seedGroups.every(seed=>
    Number.isSafeInteger(seed)&&seed>=0&&seed<=0xffffffff));
  assert.deepEqual(registered.sourceSeats,[0,1]);
  assert.equal(registered.expectedPairs,16);
  assert.equal(registered.expectedNativeArms,32);
  const manifest=JSON.parse(fs.readFileSync(path.join(ROOT,
    registered.sourceRoster),'utf8'));
  const source=manifest.decks.find(row=>row.rank===17);
  assert.ok(source);
  assert.equal(printingFingerprint(source.cards),
    registered.sourcePrinted60Sha256,
    'Original rank17 printed source identity drift');
  const plan=planAichi(1,SETTINGS);
  const sourceOriginal=plan.opponents.find(row=>row.rank===17);
  assert.equal(sourceOriginal?.status,'ready');
  assert.equal(plan.candidate.cards?.length,60);
  assert.equal(sourceOriginal.cards.length,60);
  assert.equal(plan.engineRevision,registered.pinnedVendor);
  return {registered,plan,sourceOriginal};
}

/**
 * One original 60-card, actual native Store run. Both arms differ solely in
 * opt-in Ditto Stage1 root. Engine rules and all other policy switches match.
 * @param {object} plan Frozen source and candidate printed engine identities.
 * @param {object} source Original rank17 engine deck.
 * @param {object} registered Frozen external preregistration.
 * @param {number} seed Preregistered random 32-bit deal seed.
 * @param {0|1} sourceSeat Physical seat of original rank17.
 * @param {boolean} enabled Ditto owner Stage1 permission root enabled.
 * @returns {object}
 */
function arm(plan,source,registered,seed,sourceSeat,enabled){
  const deckA=sourceSeat===0?source.cards:plan.candidate.cards;
  const deckB=sourceSeat===1?source.cards:plan.candidate.cards;
  const mode=enabled?'ditto-stage1-opt-in':'natural-evolution-control';
  const identity={seed,sourceSeat,mode,
    sourcePrinted60Sha256:registered.sourcePrinted60Sha256,
    physicalSeatADeckSha256:digest(deckA),
    physicalSeatBDeckSha256:digest(deckB)};
  try{
    const test=withActorOnlyRootPolicy(()=>runMatch({
      ...registered.bothArmsNativeOptions,
      deckA,deckB,seed,
      label:'agent1-source-rank17-'+mode
    }),{naturalEvolutionRoot:true,dittoStage1Root:enabled});
    const a=test.audit,g=test.result;
    const sourceAcceptedEvolutions=a.nativeRootAcceptances.filter(x=>
      x.seat===sourceSeat&&x.kind==='evolve-pokemon');
    const ditto=a.dittoStage1??null;
    return {
      ...identity,
      nativeError:null,gameActions:g.actions,gameTurns:g.turns,
      finished:g.finished,endReason:g.endReason,winner:g.winner,
      firstTurnSlot:g.firstTurnSlot,
      physicalOpeningDigest:digest(g.initialFullPhysicalDealFingerprint),
      originalSourceOpeningDigest:
        g.initialSourceDealFingerprint?.digestSha256??null,
      engineDeckHashes:g.deckHashes,
      acceptedActorRoots:a.acceptedActorRoots,
      rejectedActorRoots:a.rejectedActorRoots,
      nativePhysicalConfirmed:a.nativePhysicalConfirmed,
      unsupportedPromptFallbacks:a.unsupportedPromptFallbacks,
      typedIntentCounts:a.typedIntentCounts,
      actorPolicyVersion:a.version,
      sourceAcceptedEvolutions:sourceAcceptedEvolutions.map(row=>({
        turn:row.globalTurn,
        printing:row.intent.printing,from:row.intent.from,
        sourceAbility:row.intent.sourceAbility??null,
        physicalEffect:row.nativePhysicalEffect??null,
        accepted:row.accepted
      })),
      dittoStage1:ditto,
      actualPublicRootLedger:g.rootActionLedger??null,
      competitiveQualified:false
    };
  }catch(error){
    return {...identity,nativeError:String(error?.stack??error),
      physicalOpeningDigest:null,originalSourceOpeningDigest:null,
      sourceAcceptedEvolutions:null,dittoStage1:null,
      competitiveQualified:false};
  }
}

/** Preregistered fresh deals, both original physical seats, one policy change. */
function run(){
  const {registered,plan,sourceOriginal}=preflight();
  const pairs=[];
  for(const seed of registered.seedGroups){
    for(const sourceSeat of registered.sourceSeats){
      const control=arm(plan,sourceOriginal,registered,seed,sourceSeat,false);
      const treatment=arm(plan,sourceOriginal,registered,seed,sourceSeat,true);
      assert.equal(control.physicalSeatADeckSha256,
        treatment.physicalSeatADeckSha256);
      assert.equal(control.physicalSeatBDeckSha256,
        treatment.physicalSeatBDeckSha256);
      const bothSucceeded=control.nativeError===null&&
        treatment.nativeError===null;
      const samePhysicalOpening=bothSucceeded&&
        control.physicalOpeningDigest===treatment.physicalOpeningDigest&&
        control.firstTurnSlot===treatment.firstTurnSlot&&
        JSON.stringify(control.engineDeckHashes)===
          JSON.stringify(treatment.engineDeckHashes);
      const difference=bothSucceeded?{
        sourceNativeEvolutions:
          treatment.sourceAcceptedEvolutions.length-
          control.sourceAcceptedEvolutions.length,
        actorAcceptedRoot:
          treatment.acceptedActorRoots-control.acceptedActorRoots,
        didNativeOutcomeDiffer:
          treatment.finished!==control.finished||
          treatment.winner!==control.winner||
          treatment.endReason!==control.endReason,
        treatmentSelectedDittoStage1:
          treatment.dittoStage1?.selected??0,
        treatmentAcceptedDittoStage1:
          treatment.dittoStage1?.accepted??0,
        treatmentConfirmedDittoStage1:
          treatment.dittoStage1?.physicallyConfirmed??0
      }:null;
      pairs.push({seed,sourceSeat,bothSucceeded,samePhysicalOpening,
        difference,control,treatment});
    }
  }
  const successPairs=pairs.filter(p=>p.bothSucceeded);
  const pairedPhysical=successPairs.filter(p=>p.samePhysicalOpening);
  return {
    schema:VERSION,registration:REGISTRATION,
    registeredBeforeOutcomes:true,enginePin:registered.pinnedVendor,
    sourceRank:17,opponentRank:1,
    originalPrinted60Sha256:registered.sourcePrinted60Sha256,
    registeredSeedGroups:registered.seedGroups,
    registeredSourceSeats:registered.sourceSeats,
    attemptedNativeArms:pairs.length*2,
    expectedNativeArms:registered.expectedNativeArms,
    nativeErrorArms:pairs.flatMap(p=>[p.control,p.treatment])
      .filter(r=>r.nativeError!==null).length,
    completePairs:successPairs.length,
    identicalPhysicalOpeningPairs:pairedPhysical.length,
    treatmentDittoSelected:successPairs.reduce((n,p)=>
      n+(p.difference.treatmentSelectedDittoStage1??0),0),
    treatmentDittoNativeAccepted:successPairs.reduce((n,p)=>
      n+(p.difference.treatmentAcceptedDittoStage1??0),0),
    treatmentDittoPhysicallyConfirmed:successPairs.reduce((n,p)=>
      n+(p.difference.treatmentConfirmedDittoStage1??0),0),
    pairs,competitiveQualifiedGames:0,certifiedWinRate:null,
    caveat:'Fresh preregistered actual original-sixty early-game development; generic prompt fallback and unverified full paper semantics forbid competitive qualification.'
  };
}
if(require.main===module)process.stdout.write(JSON.stringify(run(),null,2)+'\n');
module.exports={VERSION,SETTINGS,REGISTRATION,preflight,arm,run};
