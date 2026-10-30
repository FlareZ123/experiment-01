'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {planAichi}=require('./aichi-pilot.cjs');
const {runMatch}=require('../twinleaf/headless.cjs');
const {withGoFirstChoice}=
  require('../twinleaf/agent6-go-first-choice.cjs');
const {withCanonicalActorOnlyPolicy}=
  require('./agent7-canonical-actor-composition.cjs');
const {withBroadThornsSourceAttack}=
  require('../twinleaf/rank6-broad-thorns-policy.cjs');
const {withSourceFirstTagCall}=
  require('../twinleaf/agent6-source-first-tagcall.cjs');
const {candidateAttackSettlement}=
  require('./agent37-candidate-attack-settlement.cjs');

/**
 * Reused six published first-turn hands, with a frozen retrospective source
 * Tag Call intervention against a source-turn-one Pass baseline. Records
 * every original Store attempt, error and accepted opponent reply.
 * @returns {object} Reproducible machine-readable development-only archive.
 */
function run(){
  const reg=JSON.parse(fs.readFileSync(path.resolve(__dirname,
    '../../results/aichi-2026/registrations/agent6-retrospective-tagcall-six-deal-20261030.json'),'utf8'));
  assert.equal(reg.schema,
    'agent6-retrospective-source-first-tagcall-six-deal-v1');
  const roster=JSON.parse(fs.readFileSync(path.resolve(__dirname,
    '../../results/aichi-2026/full-decklists.json'),'utf8'));
  const champion=roster.decks.find(row=>row.rank===1);
  assert.ok(champion);
  const plan=planAichi({label:'champion-reference',cards:champion.cards},{
    allowEquivalentBasicEnergies:true,
    allowBasicEnergyMirrorPrintings:true,
    allowJapanesePromoHooks:true});
  const source=plan.opponents.find(row=>row.rank===6);
  assert.equal(source?.status,'ready');
  const rows=[];
  for(const {sourceSeat,seeds} of reg.seedsBySourceSeat){
    for(const seed of seeds){
      const request={
        deckA:sourceSeat===0?source.cards:plan.candidate.cards,
        deckB:sourceSeat===1?source.cards:plan.candidate.cards,
        seed,maxActions:110,strictPromptValidation:true,
        captureDecisionTrace:true,
        capturePublicAttackTransitions:true,
        captureInitialSourceDealFingerprintSeat:sourceSeat,
        captureStartingBoard:true
      };
      const preferences=sourceSeat===0?[true,false]:[false,true];
      const arms=[];
      for(const tagCallStage of [false,true]){
        try{
          const outer=withGoFirstChoice(preferences,()=>
            withCanonicalActorOnlyPolicy(()=>
              withBroadThornsSourceAttack(()=>{
                return tagCallStage?
                  withSourceFirstTagCall(sourceSeat,()=>runMatch(request)):
                  {result:runMatch(request),audit:null};
              },{seat:sourceSeat,turn:3,
                playLockAwareOpening:true,k1ReplanAfterTagCall:true})));
          const broad=outer.result.result;
          const owned=broad.result;
          const game=owned.result;
          const tagAudit=owned.audit;
          assert.equal(game.firstTurnSlot,sourceSeat);
          assert.equal(game.verifiedByDrawLog,true);
          assert.equal(outer.audit.choices.length,1);
          assert.equal(outer.audit.choices[0].chooseFirst,
            preferences[outer.audit.choices[0].seat]);
          const sourceT1=(game.rootActionLedger??[]).filter(row=>
            row.playerSlot===sourceSeat&&row.turnBefore===1&&
            row.pendingPrompt===null).map(row=>({
              action:row.action,card:row.card??null}));
          const candidateT2=(game.rootActionLedger??[]).filter(row=>
            row.playerSlot===1-sourceSeat&&row.turnBefore===2&&
            row.pendingPrompt===null).map(row=>({
              action:row.action,card:row.card??null,attack:row.attack??null}));
          const ownFirst=(game.decisionTrace??[]).find(row=>
            row.playerSlot===sourceSeat&&row.turnBefore===1&&
            row.action!=='ResolvePromptAction'&&
            row.decisionHandBefore?.perspectiveSeat===sourceSeat);
          const sourceT3Roots=(game.rootActionLedger??[]).filter(row=>
            row.playerSlot===sourceSeat&&row.turnBefore===3).map(row=>({
              ordinal:row.actionOrdinal,action:row.action,
              card:row.card??null,attack:row.attack??null,
              prompt:row.pendingPrompt??null}));
          const sourceT3FirstOwner=(game.decisionTrace??[]).find(row=>
            row.playerSlot===sourceSeat&&row.turnBefore===3&&
            row.action!=='ResolvePromptAction'&&
            row.decisionHandBefore?.perspectiveSeat===sourceSeat);
          const settlement=candidateAttackSettlement(game,sourceSeat);
          const t3=settlement.attacks.filter(row=>
            row.turnBefore===3&&row.attackName==='Volt Cyclone');
          arms.push({status:'native-complete-or-capped',
            sourceSeat,seed,tagCallStage,
            coinWinnerSeat:outer.audit.choices[0].seat,
            sourceActualFirst:true,verifiedByDrawLog:true,
            sourceDealDigest:game.initialSourceDealFingerprint?.
              digestSha256??null,
            initialSourceOwnerHandPrintings:ownFirst?.
              decisionHandBefore?.ownHandPrintings??null,
            sourceT1RootActions:sourceT1,
            firstCandidateReplyRoots:candidateT2,
            sourceFirstTagCallAudit:tagAudit,
            sourceT3PolicyStarted:broad.started,
            sourceT3PolicyCompleted:broad.completed,
            sourceT3AbortReason:broad.abortReason,
            sourceT3OpeningPlan:broad.openingPlan,
            sourceT3PolicyEvents:broad.events,
            sourceT3FirstOwnerHandPrintings:sourceT3FirstOwner?.
              decisionHandBefore?.ownHandPrintings??null,
            sourceT3Roots,
            sourceT3NativeSettlements:t3,
            sourceAllAttackDeclarations:settlement.declarations,
            sourceAllSettledAttacks:settlement.settled,
            gameFinished:game.finished??null,
            competitiveQualified:false});
        }catch(error){
          arms.push({status:'native-error',sourceSeat,seed,
            tagCallStage,error:String(error?.message??error).slice(0,500),
            tagCallEvidence:error?.sourceFirstTagCallEvidence??null,
            rank6Evidence:error?.rank6PolicyEvidence??null});
        }
      }
      rows.push({sourceSeat,seed,arms,
        originalSourceDealMatches:arms.every(a=>
          a.status==='native-complete-or-capped')?
          arms[0].sourceDealDigest===arms[1].sourceDealDigest:null});
    }
  }
  assert.equal(rows.length,6);
  const all=rows.flatMap(row=>row.arms);
  assert.equal(all.length,12);
  return {schema:'agent6-source-first-tagcall-retrospective-native-v2',
    registration:'results/aichi-2026/registrations/agent6-retrospective-tagcall-six-deal-20261030.json',
    attemptedNativeArms:all.length,
    errors:all.filter(a=>a.status==='native-error').length,
    selectedTagCalls:all.filter(a=>
      a.sourceFirstTagCallAudit?.firstOwnTurnTagCallSelected).length,
    acceptedTagCallRoots:all.filter(a=>
      a.sourceFirstTagCallAudit?.realStoreRootAccepted).length,
    acceptedTagCallPrompts:all.filter(a=>
      a.sourceFirstTagCallAudit?.realStorePromptAccepted).length,
    competitiveQualifiedGames:0,rows};
}
if(require.main===module)process.stdout.write(JSON.stringify(run(),null,2)+'\n');
module.exports={run};
