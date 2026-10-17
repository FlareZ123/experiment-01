'use strict';
const assert=require('node:assert/strict');
const crypto=require('node:crypto');
const path=require('node:path');
const {runMatch,initializeCards}=require('./headless.cjs');
const {resolveManifestFile}=require('./resolve-field.cjs');
const {withStoreDispatchTranscript}=require('./store-dispatch-transcript.cjs');
const {withTurn28CopycatShredFork}=require('./mimikyu-turn28-shred-fork.cjs');
const {withTurn29ResponseObserver}=require('./rank10-turn29-response-observer.cjs');
/** @param {unknown} x */
const sha=x=>crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex');
/**
 * Two identical source-dealt Shred arms, one with an outer read-only observer,
 * to capture actual Regidrago retreat and pass board under frozen policy RNG.
 * This is a public-resource census, not a legal-attack or policy certificate.
 */
function main(){
  const field=resolveManifestFile(path.resolve(__dirname,
    '../../results/aichi-2026/full-decklists.json'),{
    allowEquivalentBasicEnergies:true,allowJapanesePromoHooks:true});
  const byRank=new Map(field.decks.map(d=>[d.rank,d]));
  const champion=byRank.get(1),regidrago=byRank.get(10);
  assert.ok(champion?.playableUnderEngine&&regidrago?.playableUnderEngine);
  assert.equal(champion.cardIds.length,60);
  assert.equal(regidrago.cardIds.length,60);
  initializeCards();
  const engine=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
  const {Store}=require(path.join(engine,'game/store/store'));
  const {SimpleTacticsAi}=require(path.join(engine,'simple-bot/simple-tactics-ai'));
  const {AttackAction}=require(path.join(engine,'game/store/actions/game-actions'));
  const {ResolvePromptAction}=require(path.join(engine,'game/store/actions/resolve-prompt-action'));
  const types={Store,Bot:SimpleTacticsAi,AttackAction,ResolvePromptAction};
  const request={
    deckA:regidrago.cardIds,deckB:champion.cardIds,
    seed:4246551499,maxActions:350,
    captureDecisionTrace:true,captureCopycatTurnStartSeat:1,
    strictPromptValidation:true,forestSealSearchCorrection:true,
    supporterDecisionCorrection:true,doubleDragonRecovery:true,
    isolatePolicyRandomness:true,postSuperAliasRepairIsolation:true,
    mimikyuApexCopycatCompatibility:true,mimikyuApexTimelessPolicy:true,
    mimikyuApexTimelessPolicySeat:1,mimikyuTurn27SetupSeat:1,
    mimikyuDeclaredHistoryCorrection:true,
    regidragoDeclaredHistoryCorrection:true,
    passClearsLastAttackCorrection:true
  };
  const fork=()=>withTurn28CopycatShredFork(types,()=>runMatch(request),{
    forceShred:true,rootActionOrdinal:215,policyRngAlignDraws:20});
  const run=observe=>withStoreDispatchTranscript(Store,
    ()=>observe?withTurn29ResponseObserver(Store,fork):fork(),
    {liveStoreOnly:true,sourceZoneEveryDispatch:true});
  const control=run(false),observed=run(true);
  const game=observed.result.result.result;
  assert.deepEqual(game,control.result.result,
    'Observer changed original finished source match');
  assert.deepEqual(observed.actionTrace,control.actionTrace,
    'Observer changed real Store dispatch trace');
  assert.equal(observed.actionTrace[215].action,'AttackAction');
  assert.equal(observed.actionTrace[215].parameters.name,'Copycat');
  assert.equal(observed.actionTrace[215].zoneDigestBefore,
    '5a27a7fa4d3e9cbef465675b05cf2270f0550851f4cc579940a551c3ade70b4d');
  assert.equal(game.finished,true);
  assert.equal(game.winner,1);
  const events=observed.result.events;
  assert.ok(events.some(e=>e.ordinal===231&&e.action==='RetreatAction'));
  const pass=events.find(e=>e.ordinal===232&&e.action==='PassTurnAction');
  assert.ok(pass,'Source-ranked turn29 Regidrago Pass no longer at root 232');
  return {
    schema:'rank10-source-shred-opponent-turn29-public-response-v1',
    immutableSource:{rank1DeckSha256:sha(champion.cardIds),
      rank10DeckSha256:sha(regidrago.cardIds),
      seed:request.seed,candidateSeat:1,
      engine:'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
      sourceShredOrdinal:215,sourcePolicyRngBurnCount:20},
    result:{finished:game.finished,winner:game.winner,
      prizesRemaining:game.prizesRemaining,turns:game.turns},
    readOnlyObserverTraceMatch:true,rootDispatches:observed.actionTrace.length,
    rootDispatchTraceSha256:sha(observed.actionTrace),
    opponentTurn29Events:events,
    prePass:pass.board,
    passActivePrintedAttacks:pass.board.players[0].active.printedAttacks,
    evidenceLimit:'Public board and printed attacks at the authentic post-retreat '+
      'Pass. Actual attack announcement legality, sequencing and opponent '+
      'strategic response have not been independently qualified.',
    sourceReplayMechanicsVerified:false,qualifiedForCompetitiveInference:false
  };
}
if(require.main===module) process.stdout.write(JSON.stringify(main(),null,2)+'\n');
module.exports={main};
