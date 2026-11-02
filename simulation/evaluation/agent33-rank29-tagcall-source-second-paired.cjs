'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {planAichi}=require('./aichi-pilot.cjs');
const {runMatch}=require('../twinleaf/headless.cjs');
const {withGoFirstChoice}=require('../twinleaf/agent6-go-first-choice.cjs');
const {withCanonicalActorOnlyPolicy}=require('./agent7-canonical-actor-composition.cjs');
const {withOwnerTagCallHala}=require('../twinleaf/agent6-owner-tagcall-hala-native.cjs');
const ROOT=path.resolve(__dirname,'../..');
const REG='results/aichi-2026/registrations/agent33-rank29-tagcall-second-20261102.json';
const VERSION='agent33-original-rank29-source-second-tagcall-prospective-v1';
/** Preregistered exact original rank29 source-second comparison, developmental only. */
function run(){
 const reg=JSON.parse(fs.readFileSync(path.join(ROOT,REG),'utf8'));
 assert.equal(reg.schema,'agent33-rank29-second-v1');
 assert.equal(reg.sourceRank,29);assert.equal(reg.candidateRank,1);
 assert.equal(reg.sourceFirst,false);assert.equal(reg.pairs,8);
 assert.equal(reg.arms,16);assert.equal(reg.maxActions,150);
 const data=JSON.parse(fs.readFileSync(path.join(ROOT,
  'results/aichi-2026/full-decklists.json'),'utf8'));
 assert.equal(data.decks.length,29);
 const champion=data.decks.find(d=>d.rank===1);
 const plan=planAichi({label:'original-champion',cards:champion.cards},{
  allowEquivalentBasicEnergies:true,allowBasicEnergyMirrorPrintings:true,
  allowJapanesePromoHooks:true});
 const source=plan.opponents.find(d=>d.rank===29);
 assert.equal(source?.status,'ready');assert.equal(source.cards.length,60);
 const rows=[];
 for(const seat of [0,1])for(const seed of reg.seedsBySeat[seat]){
  const deckA=seat===0?source.cards:plan.candidate.cards;
  const deckB=seat===1?source.cards:plan.candidate.cards;
  const request={deckA,deckB,seed,maxActions:reg.maxActions,
    strictPromptValidation:true,captureDecisionTrace:true,
    capturePublicAttackTransitions:true,
    captureInitialSourceDealFingerprintSeat:seat,captureStartingBoard:true};
  const choices=seat===0?[false,true]:[true,false];
  const arms=[];
  for(const intervention of [false,true]){
   try{
    const outer=withGoFirstChoice(choices,()=>withCanonicalActorOnlyPolicy(
      ()=>intervention?withOwnerTagCallHala([deckA,deckB],
        ()=>runMatch(request)):{result:runMatch(request),audit:null}));
    const nested=outer.result.result;
    const game=nested.result;
    assert.equal(game.firstTurnSlot,1-seat);
    assert.equal(game.verifiedByDrawLog,true);
    const trace=game.rootActionLedger??[];
    const sourceOwnFirstTurn=trace.filter(x=>
      x.playerSlot===seat&&x.turnBefore===2);
    arms.push({intervention,status:'native-complete-or-capped',seed,seat,
      nativeAudit:nested.audit,firstTurnSlot:game.firstTurnSlot,
      originalPhysicalDealDigest:
        game.initialSourceDealFingerprint?.digestSha256??null,
      firstSourceTurnActions:sourceOwnFirstTurn,
      fullNativeRootLedger:trace,
      publicAttackTransitions:game.publicAttackTransitions??null,
      gameFinished:game.finished??null,
      sourceTurnTrace:(game.decisionTrace??[]).filter(x=>
        x.playerSlot===seat&&x.turnBefore<=3),
      competitiveQualified:false});
   }catch(e){
    arms.push({intervention,status:'native-error',seat,seed,
      error:String(e?.message??e).slice(0,900),
      nativeAudit:e?.ownerTagCallHalaNativeAudit??null,
      competitiveQualified:false});
   }
  }
  const matched=arms.every(a=>a.status==='native-complete-or-capped')&&
    arms[0].originalPhysicalDealDigest!==null&&
    arms[0].originalPhysicalDealDigest===arms[1].originalPhysicalDealDigest;
  rows.push({seat,seed,matchedPhysicalDeal:matched,arms});
 }
 assert.equal(rows.length,8);assert.equal(rows.flatMap(r=>r.arms).length,16);
 const all=rows.flatMap(r=>r.arms);
 const treated=rows.map(r=>r.arms[1]);
 return {version:VERSION,registration:REG,originalSourceRank:29,
  candidateRank:1,sourceFirst:false,sourceSecond:true,
  sourceOriginalSixty:true,registeredPairs:8,nativeArms:16,
  summary:{errors:all.filter(a=>a.status==='native-error').length,
    matched:rows.filter(r=>r.matchedPhysicalDeal).length,
    eligibleSourceRoots:treated.filter(a=>
      a.nativeAudit?.ownerBySeat?.[a.seat]?.eligibleRoots>0).length,
    acceptedTagRoots:treated.reduce((n,a)=>n+
      (a.nativeAudit?.ownerBySeat?.[a.seat]?.acceptedRoots??0),0),
    acceptedGHSearches:treated.reduce((n,a)=>n+
      (a.nativeAudit?.ownerBySeat?.[a.seat]?.acceptedGHDeckPrompts??0),0),
    qualifiedGames:0},rows};
}
if(require.main===module)process.stdout.write(JSON.stringify(run(),null,2)+'\n');
module.exports={VERSION,run};
