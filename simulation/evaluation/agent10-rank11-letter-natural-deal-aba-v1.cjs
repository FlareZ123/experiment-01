'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createHash}=require('node:crypto');
const {planAichi}=require('./aichi-pilot.cjs');
const {initializeCards,runMatch}=require('../twinleaf/headless.cjs');
const {withCanonicalActorOnlyPolicy}=
  require('./agent7-canonical-actor-composition.cjs');
const {withOwnerResourceTutorAfterPass}=
  require('../twinleaf/agent11-native-owner-resource-tutor-after-pass.cjs');
const {withSameRuntime}=
  require('./agent4-selected-v3-paper-funded-release.cjs');

const ROOT=path.resolve(__dirname,'../..');
const manifest=require('../../results/aichi-2026/registrations/agent10-rank11-letter-natural-deal-aba-v1.json');
const roster=require('../../results/aichi-2026/full-decklists.json');
const PIN='twinleafgg/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05';
const checksum=x=>createHash('sha256').update(JSON.stringify(x)).digest('hex');
const VERSION=manifest.schema;

/**
 * Two fixed original source/candidate pairs per historical native physical
 * seed. The historical selected-v3 policy is not this standalone baseline;
 * never infer same policy or same source physical deal from seed alone.
 * @returns {Map<string,string[]>} Exact native Deck fullName 60s.
 */
function prepare(){
  const source=roster.decks.find(d=>d.rank===11);
  const rank1=roster.decks.find(d=>d.rank===1);
  assert.ok(source&&rank1);
  const newMoon=require('../../scripts/aichi-new-moon-candidate.cjs')
    .loadNewMoonCandidate();
  const opts={allowEquivalentBasicEnergies:true,
    allowBasicEnergyMirrorPrintings:true,allowJapanesePromoHooks:true};
  const candidates=[
    ['champion-reference',{label:'champion-reference',cards:rank1.cards}],
    ['new-moon-lockbreaker-v1',{
      label:'new-moon-lockbreaker-v1',cards:newMoon.cards}]
  ];
  const resolved=new Map(candidates.map(([name,definition])=>
    [name,planAichi(definition,opts).candidate.cards]));
  const original=planAichi(5,opts).opponents.find(d=>d.rank===11)?.cards;
  assert.equal(original.length,60);
  assert.equal(original.filter(x=>x==='Professors Letter BKT').length,4);
  assert.equal(original.filter(x=>x==='Darkness Energy MEE').length,8);
  resolved.set('original-rank11',original);
  for(const deck of resolved.values())assert.equal(deck.length,60);
  return resolved;
}

/**
 * Execute all twelve frozen attempted arms under genuine native Store.
 * Selected experimental Tutor hooks are inside the canonical actor wrapper,
 * and both physical seats receive the same policy and registration.
 *
 * @returns {object} Full errors, physical pairing, actual root and tutor audit.
 */
function run(){
  assert.equal(manifest.schema,
    'agent10-rank11-letter-natural-deal-native-aba-v1');
  assert.equal(manifest.predeclaredArms,12);
  assert.equal(manifest.contexts.length,4);
  assert.deepEqual(manifest.modes,['control-a','tutor-after-pass','control-b']);
  const catalogue=initializeCards();
  assert.ok(catalogue.getAllCards().length>0);
  const decks=prepare();
  const rows=[];
  for(const context of manifest.contexts){
    assert.equal(context.rank,11);
    assert.ok([1417228605,4210336107].includes(context.seed));
    const candidate=decks.get(context.candidateId),source=decks.get('original-rank11');
    assert.equal(candidate.length,60);
    const sourceSeat=context.candidateSlot==='A'?1:0;
    const deckA=sourceSeat===0?source:candidate;
    const deckB=sourceSeat===1?source:candidate;
    for(const mode of manifest.modes){
      const tutorOptIn=mode==='tutor-after-pass';
      const options={deckA,deckB,seed:context.seed,
        maxActions:manifest.nativeCap,strictPromptValidation:true,
        isolatePolicyRandomness:true,captureDecisionTrace:true,
        captureInitialFullPhysicalDeal:true,
        captureInitialSourceDealFingerprintSeat:sourceSeat,
        capturePublicAttackTransitions:true,captureFinalPublicBoard:true,
        captureNativeAbortEvidence:true,
        label:'agent10-letter-'+context.id+':'+mode};
      let game=null,tutorAudit=null,actorAudit=null,error=null;
      try{
        const actual=withSameRuntime(()=>withCanonicalActorOnlyPolicy(()=>{
          if(!tutorOptIn)return runMatch(options);
          const result=withOwnerResourceTutorAfterPass(
            ()=>runMatch(options),[deckA,deckB]);
          tutorAudit=result.audit;
          return result.result;
        },{},{}));
        game=actual.result;
        actorAudit={version:actual.audit.version,
          nativeDecisionCounts:actual.audit.nativeDecisionCounts};
        assert.equal(game.engine,PIN);
      }catch(e){
        error={name:e?.name??null,message:String(e?.message??e).slice(0,700),
          nativeAbortEvidence:e?.nativeAbortEvidence??null};
      }
      const roots=game?.rootActionLedger??[];
      const sourceRoots=roots.filter(x=>x.playerSlot===sourceSeat);
      rows.push({
        contextId:context.id,mode,trialSeed:context.seed,sourceSeat,
        tutorOptIn,engine:PIN,error,
        status:error?'native-error':
          game?.finished?'native-terminal':'native-capped',
        initialFullPhysicalDealDigest:
          game?.initialFullPhysicalDealFingerprint?.digestSha256??null,
        firstTurnSeat:game?.firstTurnSlot??null,
        sourceDealDigest:game?.initialSourceDealFingerprint?.digestSha256??null,
        sourceDealMatchesHistoric:Boolean(game?.initialSourceDealFingerprint?.digestSha256?.startsWith(context.historicalSourceDealPrefix)),
        actualGameFinished:game?.finished===true,
        actualNativeWinner:game?.finished?game.winner:null,
        actualNativeFinalPrizesRemaining:game?.prizesRemaining??null,
        nativeEndReason:game?.endReason??null,
        sourceNativeAttackCount:sourceRoots.filter(x=>
          x.action==='AttackAction').length,
        sourceNativeLetterPlayCount:sourceRoots.filter(x=>
          x.action==='PlayCardAction'&&
          /Professor.?s Letter/.test(x.card??'')).length,
        sourceNativeEnergyAttachCount:sourceRoots.filter(x=>
          x.action==='PlayCardAction'&&
          /Darkness Energy/.test(x.card??'')).length,
        sourceNativeAttackNames:sourceRoots.filter(x=>
          x.action==='AttackAction').map(x=>x.attack??null),
        sourcePrizesFromSettledNativeAttacks:(game?.publicAttackTransitions??[])
          .filter(x=>x.triggerPlayerSlot===sourceSeat&&
            Array.isArray(x.settled?.prizesRemaining))
          .reduce((n,x)=>n+Math.max(0,
            (x.beforePrizesRemaining?.[sourceSeat]??0)-
            (x.settled?.prizesRemaining?.[sourceSeat]??0)),0),
        sourceSelectedRootActions:sourceRoots,
        rootActionLedgerSha:game?checksum(roots):null,
        fullRootActionLedger:roots,
        publicAttackTransitions:game?.publicAttackTransitions??null,
        tutorAudit,actorAudit,
        qualifiesForCompetitiveInference:false
      });
    }
  }
  assert.equal(rows.length,manifest.predeclaredArms);
  const pairs=[];
  for(const ctx of manifest.contexts){
    const x=rows.filter(r=>r.contextId===ctx.id);
    const [a,b,c]=x;
    assert.deepEqual(x.map(y=>y.mode),manifest.modes);
    const physical=x.every(y=>Boolean(y.initialFullPhysicalDealDigest))&&
      a.initialFullPhysicalDealDigest===b.initialFullPhysicalDealDigest&&
      a.initialFullPhysicalDealDigest===c.initialFullPhysicalDealDigest&&
      a.firstTurnSeat===b.firstTurnSeat&&a.firstTurnSeat===c.firstTurnSeat;
    pairs.push({
      contextId:ctx.id,seed:ctx.seed,
      physicalPairProven:physical,
      controlRepeatLedgerIdentical:Boolean(a.rootActionLedgerSha)&&
        a.rootActionLedgerSha===c.rootActionLedgerSha,
      controlStatus:a.status,treatmentStatus:b.status,repeatStatus:c.status,
      treatmentTutorAccepted:b.tutorAudit?.acceptedItems??null,
      treatmentTutorSettled:b.tutorAudit?.physicalTargetsSettled??null,
      treatmentSourceLetterPlays:b.sourceNativeLetterPlayCount,
      controlSourceAttackCount:a.sourceNativeAttackCount,
      treatmentSourceAttackCount:b.sourceNativeAttackCount
    });
  }
  return {
    schema:VERSION,
    historicalV3SourceArtifactId:manifest.originalV3ArtifactId,
    differentCanonicalPolicyFromOriginalV3:true,
    pinnedEngine:PIN,
    runGitSha:process.env.GITHUB_SHA??null,
    predeclaredArms:manifest.predeclaredArms,attemptedArms:rows.length,
    nativeErrors:rows.filter(r=>r.status==='native-error').length,
    nativeTerminals:rows.filter(r=>r.status==='native-terminal').length,
    nativeCaps:rows.filter(r=>r.status==='native-capped').length,
    provenPairedPhysicalContexts:pairs.filter(x=>x.physicalPairProven).length,
    exactControlReplays:pairs.filter(x=>x.controlRepeatLedgerIdentical).length,
    actualTutorNativeAccepted:rows.filter(r=>r.tutorOptIn)
      .reduce((n,r)=>n+(r.tutorAudit?.acceptedItems??0),0),
    actualTutorPhysicalMovements:rows.filter(r=>r.tutorOptIn)
      .reduce((n,r)=>n+(r.tutorAudit?.physicalTargetsSettled??0),0),
    qualifiesForCompetitiveInference:false,competitiveQualifiedGames:0,
    pairs,rows
  };
}

if(require.main===module){
  const {writeAtomicLocked}=
    require('./agent23-selected-joint-v2-release.cjs');
  const result=run();
  writeAtomicLocked('agent10-rank11-letter-natural-deal-aba-v1.json',result);
  process.stdout.write('AGENT10_RANK11_LETTER_NATURAL_ABA '+
    JSON.stringify({schema:result.schema,attempted:result.attemptedArms,
      nativeErrors:result.nativeErrors,
      physical:result.provenPairedPhysicalContexts,
      identicalControls:result.exactControlReplays,
      accepted:result.actualTutorNativeAccepted,
      moved:result.actualTutorPhysicalMovements,
      pairs:result.pairs,competitiveQualifiedGames:0})+'\n');
}

module.exports={VERSION,prepare,run};
