'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');

// Preregistered before seeing any result of this module. All arms retained.
const SEEDS=Object.freeze([1847000101,1847000102,1847000103,
  1847000104,1847000105,1847000106]);
const OPPONENT_RANKS=Object.freeze([1,11]);
const MAX_ACTIONS=160;
const PIN='a9905a76a6c4103ba4b6cb9a49e86bad795c5c05';

/** Immutable registered experiment recipe, independent of native outcomes. */
function registration(){
 const {resolveManifestFile}=require('./resolve-field.cjs');
 const manifest=resolveManifestFile(path.resolve(__dirname,
   '../../results/aichi-2026/full-decklists.json'),{
     allowEquivalentBasicEnergies:true,allowJapanesePromoHooks:true
   });
 const byRank=new Map(manifest.decks.map(d=>[d.rank,d]));
 for(const rank of [20,...OPPONENT_RANKS]){
   const deck=byRank.get(rank);
   assert.ok(deck?.playableUnderEngine,'Missing engine-mapped source rank '+rank);
   assert.equal(deck.cardIds.length,60);
 }
 const trials=[];
 for(const opponentRank of OPPONENT_RANKS)
   for(const seed of SEEDS)
     for(const sourceSeat of [0,1])
       trials.push({opponentRank,seed,sourceSeat,
         id:'rank20-vs-'+opponentRank+'-seed-'+seed+'-seat-'+sourceSeat});
 return {byRank,trials};
}

/** Same source 60s, same seed, same initial physical seat; one bounded prompt-option flag. */
function execute(trial,byRank,apexEnabled){
 const {runMatch}=require('./headless.cjs');
 const {withActorHandDiscard}=require('./agent47-actor-hand-discard.cjs');
 const {observableDigest}=require('./dde-source-clone-seat-panel.cjs');
 const own=byRank.get(20).cardIds;
 const opposing=byRank.get(trial.opponentRank).cardIds;
 const request={
   deckA:trial.sourceSeat===0?own:opposing,
   deckB:trial.sourceSeat===1?own:opposing,
   seed:trial.seed,maxActions:MAX_ACTIONS,
   doubleDragonRecovery:true,strictPromptValidation:true,
   isolatePolicyRandomness:true,captureDecisionTrace:true,
   captureInitialSourceDealFingerprintSeat:trial.sourceSeat,
   captureInitialFullPhysicalDeal:true,
   label:'agent47-original-rank20-apex-prompt-audit-'+trial.id
 };
 try{
   const wrapped=withActorHandDiscard(()=>runMatch(request),{},
     {apexPayloadDiscard:apexEnabled});
   const game=wrapped.result,audit=wrapped.audit;
   return {status:'native-returned',
     apexEnabled,gameFinished:game.finished===true,
     nativeActionCount:game.actions,turns:game.turns,
     actualFirstSeat:game.firstTurnSlot,
     deckHashes:game.deckHashes,
     sourceDealSha256:game.initialSourceDealFingerprint?.digestSha256??null,
     fullPhysicalDealSha256:game.initialFullPhysicalDeal?.digestSha256??null,
     opponentRank:trial.opponentRank,sourceSeat:trial.sourceSeat,
     policy:{
       eligible:audit.eligible,selected:audit.selected,
       nativeAccepted:audit.accepted,
       nativePhysicalSettled:audit.nativePromptPostconditionsConfirmed,
       nativeFallbacks:audit.nativeFallbacks,
       apexAlternativeProposals:audit.apexAlternativeProposals,
       apexSelected:audit.apexSelected,
       apexReasons:audit.apexReasons,
       bySeat:audit.bySeat
     },
     observableDigest:observableDigest(game)};
 }catch(error){
   return {status:'native-aborted',apexEnabled,
     error:String(error?.stack??error).slice(0,750),
     opponentRank:trial.opponentRank,sourceSeat:trial.sourceSeat,
     censored:true};
 }
}

function main(){
 const {initializeCards}=require('./headless.cjs');
 const {byRank,trials}=registration();
 initializeCards();
 const rows=trials.map(trial=>{
   const control=execute(trial,byRank,false);
   const treatment=execute(trial,byRank,true);
   const bothReturned=control.status==='native-returned'&&
     treatment.status==='native-returned';
   const pairedSourceDeal=bothReturned&&
     control.sourceDealSha256!==null&&
     control.sourceDealSha256===treatment.sourceDealSha256;
   const noProposal=bothReturned&&
     treatment.policy.apexAlternativeProposals===0;
   return {trial,...{control,treatment},
     pairedSourceDeal:bothReturned?pairedSourceDeal:null,
     observedNativeOptInOpportunity:bothReturned?
       treatment.policy.apexAlternativeProposals>0:null,
     noOpportunityControlDigestUnchanged:noProposal?
       control.observableDigest===treatment.observableDigest:null,
     qualification:'development-only'};
 });
 const counts={
   registeredPairs:rows.length,
   attemptedNativeRuns:rows.length*2,
   bothNativeReturned:rows.filter(r=>
     r.control.status==='native-returned'&&
     r.treatment.status==='native-returned').length,
   nativeAbortPairs:rows.filter(r=>r.control.status==='native-aborted'||
     r.treatment.status==='native-aborted').length,
   optedInNativeOffers:rows.reduce((n,r)=>
     n+(r.treatment.policy?.apexAlternativeProposals??0),0),
   genuinePolicyInterventionPairs:rows.filter(r=>
     r.treatment.policy?.apexSelected>0).length,
   allNoOpportunityDigestsEqual:rows.filter(r=>
     r.noOpportunityControlDigestUnchanged===true).length,
   noOpportunityDigestDifferences:rows.filter(r=>
     r.noOpportunityControlDigestUnchanged===false).length,
   pairedSourceDeals:rows.filter(r=>r.pairedSourceDeal===true).length
 };
 return {schema:'agent47-original-source20-bounded-apex-natural-prompt-census-v1',
   sourceRank:20,opponentRanks:[...OPPONENT_RANKS],
   registeredSeeds:[...SEEDS],sourceSeats:[0,1],
   maxActions:MAX_ACTIONS,enginePin:PIN,
   independentBaselineAndOptInFlags:true,
   allRegisteredTrialsRetained:true,
   counts,rows,competitiveQualifiedGames:0,
   caveat:'Retrospective seed-fixed original-source versus two unqualified simple bots. These root-only policy arms cannot prove competitive performance or natural field-wide win rate. Genuine Store aborts are retained explicitly; null parity remains unverified.'};
}
if(require.main===module)
  process.stdout.write(JSON.stringify(main(),null,2)+'\n');
module.exports={SEEDS,OPPONENT_RANKS,registration,execute,main};
