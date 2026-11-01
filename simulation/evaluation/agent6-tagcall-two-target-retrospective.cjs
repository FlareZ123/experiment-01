'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {planAichi}=require('./aichi-pilot.cjs');
const {runMatch}=require('../twinleaf/headless.cjs');
const {withGoFirstChoice}=require('../twinleaf/agent6-go-first-choice.cjs');
const {withCanonicalActorOnlyPolicy}=
  require('./agent7-canonical-actor-composition.cjs');
const {withBroadThornsSourceAttack}=
  require('../twinleaf/rank6-broad-thorns-policy.cjs');
const {withOwnerTagCallHala}=
  require('../twinleaf/agent6-owner-tagcall-hala-native.cjs');
const {candidateAttackSettlement}=
  require('./agent37-candidate-attack-settlement.cjs');
const VERSION='agent6-frozen-six-tagcall-single-versus-double-target-v1';
function run(){
  const root=path.resolve(__dirname,'../..');
  const reg=JSON.parse(fs.readFileSync(path.join(root,
    'results/aichi-2026/registrations/agent6-retrospective-tagcall-six-deal-20261030.json'),'utf8'));
  const manifest=JSON.parse(fs.readFileSync(path.join(root,
    'results/aichi-2026/full-decklists.json'),'utf8'));
  const champion=manifest.decks.find(x=>x.rank===1);
  const plan=planAichi({label:'champion-reference',cards:champion.cards},{
    allowEquivalentBasicEnergies:true,allowBasicEnergyMirrorPrintings:true,
    allowJapanesePromoHooks:true});
  const source=plan.opponents.find(x=>x.rank===6);
  assert.equal(source?.status,'ready');
  const rows=[];
  for(const {sourceSeat,seeds} of reg.seedsBySourceSeat){
    for(const seed of seeds){
      const deckA=sourceSeat===0?source.cards:plan.candidate.cards;
      const deckB=sourceSeat===1?source.cards:plan.candidate.cards;
      const prefs=sourceSeat===0?[true,false]:[false,true];
      const request={deckA,deckB,seed,maxActions:125,
        strictPromptValidation:true,captureDecisionTrace:true,
        capturePublicAttackTransitions:true,
        captureInitialSourceDealFingerprintSeat:sourceSeat,
        captureStartingBoard:true};
      const arms=[];
      for(const mode of ['baseline','single','double']){
        try{
          const wrapped=withGoFirstChoice(prefs,()=>
            withCanonicalActorOnlyPolicy(()=>
              withBroadThornsSourceAttack(()=>
                mode==='baseline'?
                  {result:runMatch(request),audit:null}:
                  withOwnerTagCallHala([deckA,deckB],()=>runMatch(request),{
                    secondaryTagTeamPriority:mode==='double'?
                      ['Cynthia & Caitlin CEC']:[]
                  }),{seat:sourceSeat,turn:3,
                    playLockAwareOpening:true,k1ReplanAfterTagCall:true})));
          const broad=wrapped.result.result;
          const game=broad.result.result;
          const audit=broad.result.audit;
          const settlement=candidateAttackSettlement(game,sourceSeat);
          assert.equal(game.firstTurnSlot,sourceSeat);
          assert.equal(game.verifiedByDrawLog,true);
          arms.push({mode,status:'completed',seed,sourceSeat,
            sourceDealDigest:game.initialSourceDealFingerprint?.digestSha256??null,
            nativeAudit:audit,
            sourceT1Roots:(game.rootActionLedger??[]).filter(r=>
              r.playerSlot===sourceSeat&&r.turnBefore===1),
            sourceT3Roots:(game.rootActionLedger??[]).filter(r=>
              r.playerSlot===sourceSeat&&r.turnBefore===3),
            t3PolicyCompleted:broad.completed,
            t3AbortReason:broad.abortReason,
            t3Events:broad.events,
            sourceT3VoltCyclone:settlement.attacks.filter(r=>
              r.turnBefore===3&&r.attackName==='Volt Cyclone'),
            competitiveQualified:false});
        }catch(error){
          arms.push({mode,status:'native-error',
            error:String(error?.message??error).slice(0,900),
            nativeAudit:error?.ownerTagCallHalaNativeAudit??null});
        }
      }
      rows.push({sourceSeat,seed,arms,
        samePhysicalDeal:arms.every(a=>a.status==='completed'&&
          a.sourceDealDigest!==null&&
          a.sourceDealDigest===arms[0].sourceDealDigest)});
    }
  }
  const all=rows.flatMap(r=>r.arms);
  const count=mode=>all.filter(a=>a.mode===mode);
  const totalAttacks=mode=>count(mode).reduce((n,a)=>
    n+(a.sourceT3VoltCyclone?.length??0),0);
  return {version:VERSION,retrospectiveDeals:rows.length,
    totalArms:all.length,
    allNativeErrors:all.filter(a=>a.status==='native-error').length,
    identicalTriples:rows.filter(r=>r.samePhysicalDeal).length,
    acceptedDoubleTargets:count('double').filter(a=>
      Object.values(a.nativeAudit?.firstAcceptedNativePairBySeat??{})
        .some(r=>r?.selectedPrintings?.length===2)).length,
    t3AttackCounts:{baseline:totalAttacks('baseline'),
      single:totalAttacks('single'),double:totalAttacks('double')},
    competitiveQualifiedGames:0,rows};
}
if(require.main===module)process.stdout.write(JSON.stringify(run(),null,2)+'\n');
module.exports={VERSION,run};
