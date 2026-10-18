'use strict';
const assert=require('node:assert/strict');
const crypto=require('node:crypto');
const path=require('node:path');
const {runMatch,initializeCards}=require('./headless.cjs');
const {resolveManifestFile}=require('./resolve-field.cjs');
const {withStoreDispatchTranscript}=require('./store-dispatch-transcript.cjs');
const {withTurn28CopycatShredFork}=require('./mimikyu-turn28-shred-fork.cjs');
const {withGuzmaFork}=require('./rank10-turn29-guzma-fork.cjs');
/** @param {unknown} x */
const sha=x=>crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex');
/** Paired, same-deal mechanical Guzma response fork; no win-rate inference. */
function main(){
  const field=resolveManifestFile(path.resolve(__dirname,
    '../../results/aichi-2026/full-decklists.json'),{
      allowEquivalentBasicEnergies:true,allowJapanesePromoHooks:true});
  const ranks=new Map(field.decks.map(d=>[d.rank,d]));
  const regidrago=ranks.get(10),champion=ranks.get(1);
  assert.ok(regidrago?.playableUnderEngine&&champion?.playableUnderEngine);
  assert.equal(regidrago.cardIds.length,60);
  assert.equal(champion.cardIds.length,60);
  initializeCards();
  const output=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
  const get=p=>require(path.join(output,p));
  const {Store}=get('game/store/store');
  const {SimpleTacticsAi}=get('simple-bot/simple-tactics-ai');
  const {AttackAction}=get('game/store/actions/game-actions');
  const {ResolvePromptAction}=get('game/store/actions/resolve-prompt-action');
  const {PlayCardAction,PlayerType,SlotType}=
    get('game/store/actions/play-card-action');
  const types={Store,Bot:SimpleTacticsAi,AttackAction,ResolvePromptAction,
    PlayCardAction,PlayerType,SlotType};
  const request={deckA:regidrago.cardIds,deckB:champion.cardIds,
    seed:4246551499,maxActions:350,captureDecisionTrace:true,
    captureCopycatTurnStartSeat:1,strictPromptValidation:true,
    forestSealSearchCorrection:true,supporterDecisionCorrection:true,
    doubleDragonRecovery:true,doubleDragonArchiveV3:true,
    isolatePolicyRandomness:true,
    postSuperAliasRepairIsolation:true,
    mimikyuApexCopycatCompatibility:true,mimikyuApexTimelessPolicy:true,
    mimikyuApexTimelessPolicySeat:1,mimikyuTurn27SetupSeat:1,
    mimikyuDeclaredHistoryCorrection:true,
    regidragoDeclaredHistoryCorrection:true,
    passClearsLastAttackCorrection:true};
  const run=forceGuzma=>withStoreDispatchTranscript(Store,
    ()=>withTurn28CopycatShredFork(types,
      ()=>withGuzmaFork(types,()=>runMatch(request),{forceGuzma}),{
        forceShred:true,rootActionOrdinal:215,policyRngAlignDraws:20
      }),{liveStoreOnly:true,sourceZoneEveryDispatch:true});
  const control=run(false),forced=run(true);
  const a=control.result.result,b=forced.result.result;
  assert.equal(control.result.forcedAttack,true);
  assert.equal(forced.result.forcedAttack,true);
  assert.equal(a.stage,'control');
  assert.equal(b.stage,'blocked','Already spent Supporter must block Guzma');
  assert.equal(a.actions.length,1);
  assert.equal(b.actions.length,1);
  assert.deepEqual(a.actions[0],{
    ordinal:231,original:'RetreatAction',heldGuzma:true,
    forced:false,supporterTurn:1,preventedIllegalSupporter:false
  });
  assert.deepEqual(b.actions[0],{
    ordinal:231,original:'RetreatAction',heldGuzma:true,
    forced:true,supporterTurn:1,preventedIllegalSupporter:true
  });
  assert.deepEqual(control.actionTrace,forced.actionTrace,
    'Rejecting illegal Guzma must preserve the entire real source match');
  assert.deepEqual(a.result,b.result,
    'Illegality check must not change game outcome');
  assert.equal(control.actionTrace[231].action,'RetreatAction');
  assert.equal(forced.actionTrace[231].action,'RetreatAction');
  assert.equal(control.actionTrace[231].zoneDigestBefore,
    'a512b03755dddc50ed62022fcb075ac54e7198e202150e1d4db8341405525b86');

  const digest=r=>({finished:r.finished,winner:r.finished?r.winner:null,
    turns:r.turns,actions:r.actions,prizesRemaining:r.prizesRemaining,
    attackTrace:r.attackTrace?.map(x=>({
      seat:x.seat,turn:x.turn,attack:x.attack}))});
  return {
    schema:'rank10-archived-shred-guzma-illegality-audit-v2',
    source:{seed:request.seed,ranks:[10,1],
      deckHashes:[sha(regidrago.cardIds),sha(champion.cardIds)],
      engine:'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
      policy:'DoubleDragonAttachTactic-v3-archive',
      ShredRootOrdinal:215,GuzmaRootOrdinal:231},
    fullSourceDispatchTraceIdentical:true,
    sourceDecision:{ordinal:231,action:'RetreatAction',
      predecisionZoneSha256:control.actionTrace[231].zoneDigestBefore,
      supporterTurn:1,canPlayGuzma:false},
    controlBotEvaluatedInBothArms:true,
    illegalGuzmaSafelyRejected:true,
    responses:{control:{actions:a.actions,game:digest(a.result)},
      attemptedGuzma:{actions:b.actions,game:digest(b.result)}},
    sourceReplayMechanicsVerified:false,
    qualifiedForCompetitiveInference:false,
    limitations:'Archived, script-forced Shred prefix and one generic-bot source deal. This proves a negative Supporter timing constraint; it does not establish the optimal Retreat choice or competitive win rates.'
  };
}
if(require.main===module)process.stdout.write(JSON.stringify(main(),null,2)+'\n');
module.exports={main};
