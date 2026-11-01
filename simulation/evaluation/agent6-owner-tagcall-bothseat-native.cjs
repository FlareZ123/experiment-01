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

const VERSION='agent6-rank6-two-seat-tag-call-original-store-locked-deals-v1';

/**
 * Development-only paired source-locked physical Store matches. The six
 * previously examined original rank6 source-first decks deliberately
 * include an overrepresentative Tag Call holding fraction, so their
 * frequency and payoff cannot be used as out-of-sample win evidence.
 * This runner does, however, require original Store acceptance, exact
 * physical deck custody and both acting physical seat configurations.
 */
function run(){
  const root=path.resolve(__dirname,'../..');
  const registration=JSON.parse(fs.readFileSync(path.join(root,
    'results/aichi-2026/registrations/agent6-retrospective-tagcall-six-deal-20261030.json'),'utf8'));
  assert.equal(registration.schema,
    'agent6-retrospective-source-first-tagcall-six-deal-v1');
  const originals=JSON.parse(fs.readFileSync(path.join(root,
    'results/aichi-2026/full-decklists.json'),'utf8'));
  const champion=originals.decks.find(x=>x.rank===1);
  assert.ok(champion);
  const plan=planAichi({label:'champion-reference',cards:champion.cards},{
    allowEquivalentBasicEnergies:true,
    allowBasicEnergyMirrorPrintings:true,
    allowJapanesePromoHooks:true});
  const source=plan.opponents.find(x=>x.rank===6);
  assert.equal(source?.status,'ready');
  const rows=[];
  for(const {sourceSeat,seeds} of registration.seedsBySourceSeat){
    for(const seed of seeds){
      const deckA=sourceSeat===0?source.cards:plan.candidate.cards;
      const deckB=sourceSeat===1?source.cards:plan.candidate.cards;
      const prefs=sourceSeat===0?[true,false]:[false,true];
      const request={deckA,deckB,seed,maxActions:110,
        strictPromptValidation:true,captureDecisionTrace:true,
        capturePublicAttackTransitions:true,
        captureInitialSourceDealFingerprintSeat:sourceSeat,
        captureStartingBoard:true};
      const arms=[];
      for(const ownerTagStage of [false,true]){
        try{
          const outer=withGoFirstChoice(prefs,()=>
            withCanonicalActorOnlyPolicy(()=>
              withBroadThornsSourceAttack(()=>
                ownerTagStage?
                  withOwnerTagCallHala([deckA,deckB],
                    ()=>runMatch(request)):
                  {result:runMatch(request),audit:null},
                {seat:sourceSeat,turn:3,
                  playLockAwareOpening:true,
                  k1ReplanAfterTagCall:true})));
          const broad=outer.result.result;
          const nested=broad.result;
          const game=nested.result;
          const audit=nested.audit;
          assert.equal(game.firstTurnSlot,sourceSeat);
          assert.equal(game.verifiedByDrawLog,true);
          const first=(game.decisionTrace??[]).find(row=>
            row.playerSlot===sourceSeat&&row.turnBefore===1&&
            row.action!=='ResolvePromptAction'&&
            row.decisionHandBefore?.perspectiveSeat===sourceSeat);
          arms.push({ownerTagStage,status:'native-complete-or-capped',
            sourceSeat,seed,
            sourceDealDigest:game.initialSourceDealFingerprint?.
              digestSha256??null,
            firstOwnerHand: first?.decisionHandBefore?.ownHandPrintings??null,
            firstSourceRoots:(game.rootActionLedger??[]).filter(row=>
              row.playerSlot===sourceSeat&&row.turnBefore===1).map(row=>({
                action:row.action,card:row.card??null,
                prompt:row.pendingPrompt??null
              })),
            ownerTagAudit:audit,
            nativeSourceAttackRoots:(game.rootActionLedger??[]).filter(row=>
              row.playerSlot===sourceSeat&&row.action==='AttackAction').map(row=>({
                turn:row.turnBefore,attack:row.attack??null
              })),
            gameFinished:game.finished??null,
            competitiveQualified:false});
        }catch(error){
          arms.push({ownerTagStage,status:'native-error',sourceSeat,seed,
            error:String(error?.message??error).slice(0,700),
            ownerTagAudit:error?.ownerTagCallHalaNativeAudit??null});
        }
      }
      const bothValid=arms.every(a=>a.status==='native-complete-or-capped');
      rows.push({sourceSeat,seed,arms,
        sourceDealFingerprintPaired:
          bothValid?arms[0].sourceDealDigest===arms[1].sourceDealDigest:null});
    }
  }
  assert.equal(rows.length,6);
  const all=rows.flatMap(row=>row.arms);
  assert.equal(all.length,12);
  return {version:VERSION,originalSourceRank:6,
    sourceOriginalSixty:true,
    sourceFirst:true,sourcePhysicalSeats:[0,1],
    totalArms:12,retrospectiveDealPairs:6,
    statusCounts:all.reduce((map,row)=>{
      map[row.status]=(map[row.status]??0)+1;return map;
    },{}),
    pairedSourceDealCount:rows.filter(row=>
      row.sourceDealFingerprintPaired===true).length,
    nativeTagCallRootAccepted:all.filter(x=>x.ownerTagStage)
      .reduce((sum,x)=>sum+Object.values(x.ownerTagAudit?.ownerBySeat??{})
        .reduce((acc,s)=>acc+(s?.acceptedRoots??0),0),0),
    nativeGHDeckPromptsAccepted:all.filter(x=>x.ownerTagStage)
      .reduce((sum,x)=>sum+Object.values(x.ownerTagAudit?.ownerBySeat??{})
        .reduce((acc,s)=>acc+(s?.acceptedGHDeckPrompts??0),0),0),
    competitiveQualifiedGames:0,rows};
}

if(require.main===module)
  process.stdout.write(JSON.stringify(run(),null,2)+'\n');

module.exports={VERSION,run};
