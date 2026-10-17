'use strict';
const assert=require('node:assert/strict');
const crypto=require('node:crypto');
const path=require('node:path');
const {initializeCards,runMatch}=require('./headless.cjs');
const {resolveManifestFile}=require('./resolve-field.cjs');
const {loadDefaultCampaign}=require('../../scripts/aichi-comparison-campaign.cjs');

const hash=value=>crypto.createHash('sha256')
  .update(JSON.stringify(value)).digest('hex');

/**
 * Inspect only source Store root dispatches. Bot speculative Store instances
 * are excluded by identity. Capture the printed copied-attack choice and
 * six-counter allocation when they actually occur in a source game.
 *
 * @template T
 * @param {Function} Store Pinned compiled constructor.
 * @param {()=>T} run One synchronous headless game.
 * @returns {{result:T,sourceActions:object[],copyChoices:object[],
 *   spreadChoices:object[],firstNormalTurnZoneDigest:string|null}}
 */
function withSourceApexObservation(Store,run){
  const descriptor=Object.getOwnPropertyDescriptor(Store.prototype,'dispatch');
  assert.equal(typeof descriptor?.value,'function');
  let root=null,firstNormalTurnZoneDigest=null;
  const sourceActions=[],copyChoices=[],spreadChoices=[];
  const instrument=function(...args){
    const action=args[0],type=action?.constructor?.name??'UnknownAction';
    if(root===null&&type==='AddPlayerAction')root=this;
    if(this!==root)return descriptor.value.apply(this,args);
    const state=this.state;
    if(firstNormalTurnZoneDigest===null&&state?.phase===2&&
      state.players?.length===2&&state.players.every(p=>p.prizes?.length===6)){
      firstNormalTurnZoneDigest=hash(state.players.map(p=>({
        active:p.active.cards.map(c=>c.fullName),
        bench:p.bench.map(b=>b.cards.map(c=>c.fullName)),
        hand:p.hand.cards.map(c=>c.fullName),
        deck:p.deck.cards.map(c=>c.fullName),
        prizes:p.prizes.map(z=>z.cards.map(c=>c.fullName))
      })));
    }
    const pending=state?.prompts?.find(p=>p.result===undefined);
    const seat=pending?state.players.findIndex(p=>p.id===pending.playerId):
      state.players.findIndex(p=>p.id===(action?.clientId??action?.id));
    const selection=type==='ResolvePromptAction'&&
      pending?.constructor?.name==='ChooseAttackPrompt'?
      action.result?.name??null:null;
    const entry={
      step:sourceActions.length,turn:state?.turn??null,
      phase:state?.phase??null,activePlayer:state?.activePlayer??null,
      type,seat,prompt:pending?.constructor?.name??null,
      ...(type==='AttackAction'?{attack:action?.name??null}:{}),
      ...(selection!==null?{selectedAttack:selection}:{})
    };
    sourceActions.push(entry);
    if(selection!==null)copyChoices.push({...entry,
      activePokemon:state.players[seat]?.active.getPokemonCard()?.fullName??null,
      choices:pending.cards.flatMap(c=>c.attacks.map(a=>a.name))
    });
    if(type==='ResolvePromptAction'&&
      pending?.constructor?.name==='PutDamagePrompt'&&
      pending.damage===60)spreadChoices.push({...entry,
        resolution:Array.isArray(action.result)?
          action.result.map(x=>({damage:x.damage,target:x.target})):null
      });
    return descriptor.value.apply(this,args);
  };
  Object.defineProperty(Store.prototype,'dispatch',{...descriptor,value:instrument});
  try {
    const result=run();
    return {result,sourceActions,copyChoices,spreadChoices,
      firstNormalTurnZoneDigest};
  } finally {
    Object.defineProperty(Store.prototype,'dispatch',descriptor);
  }
}

/** @param {object[]} before @param {object[]} after */
function firstActionDifference(before,after){
  const n=Math.max(before.length,after.length);
  for(let i=0;i<n;i++)if(JSON.stringify(before[i])!==JSON.stringify(after[i]))
    return {index:i,control:before[i]??null,experimental:after[i]??null};
  return null;
}

/**
 * Reproduce one source-ranked Aichi physical-B match, varied only by the
 * opt-in Regidrago copy-selection and counter-allocation resolver classes.
 * Same policy after the branch is not assumed. All outcomes are diagnostics.
 */
function main(){
  const manifest=resolveManifestFile(path.resolve(__dirname,
    '../../results/aichi-2026/full-decklists.json'),{
      allowEquivalentBasicEnergies:true,allowJapanesePromoHooks:true
    });
  const decks=new Map(manifest.decks.map(d=>[d.rank,d]));
  const candidate=decks.get(1),opponent=decks.get(10);
  assert.ok(candidate?.playableUnderEngine&&opponent?.playableUnderEngine);
  const schedule=loadDefaultCampaign('decorrelated-slots-v3');
  const trial=schedule.trials.find(t=>t.phase==='pilot'&&
    t.rank===10&&t.candidateId==='champion-reference'&&
    t.repeat===0&&t.candidateEngineSlot==='B');
  assert.equal(trial?.seed,4246551499);
  const request={
    deckA:opponent.cardIds,deckB:candidate.cardIds,
    seed:trial.seed,maxActions:350,label:trial.trialId,
    strictPromptValidation:true,forestSealSearchCorrection:true,
    supporterDecisionCorrection:true,doubleDragonRecovery:true,
    doubleDragonArchiveV3:true,
    isolatePolicyRandomness:true,captureDecisionTrace:true,
    captureCopycatTurnStartSeat:1,postSuperAliasRepairIsolation:true,
    mimikyuApexCopycatCompatibility:true,
    mimikyuDeclaredHistoryCorrection:true,
    regidragoDeclaredHistoryCorrection:true,
    passClearsLastAttackCorrection:true
  };
  initializeCards();
  const {Store}=require(path.resolve(__dirname,
    '../../vendor/twinleaf/ptcg-server/output/game/store/store'));
  const run=enabled=>withSourceApexObservation(Store,()=>
    runMatch({...request,
      ...(enabled?{apexSpreadPrizeWindowPolicy:true}:{})}));
  const control=run(false),experimental=run(true),repeated=run(false);
  assert.deepEqual(control,repeated,
    'Original headless result and source actions changed after opt-in policy');
  assert.deepEqual(control.result.deckHashes,experimental.result.deckHashes);
  assert.equal(control.result.doubleDragonArchiveV3,true,
    'Frozen source pair must use archived v3 Double Dragon tactic');
  assert.equal(control.result.firstTurnSlot,1);
  assert.equal(experimental.result.firstTurnSlot,1);
  assert.ok(control.firstNormalTurnZoneDigest,
    'Missing source initial complete deck/hand/Prize checkpoint');
  assert.equal(control.firstNormalTurnZoneDigest,
    experimental.firstNormalTurnZoneDigest,
    'Proposed policy changed the hidden starting deal before normal play');
  const difference=firstActionDifference(control.sourceActions,
    experimental.sourceActions);
  const compact=o=>({
    actions:o.result.actions,finished:o.result.finished,
    turn:o.result.turns,winner:o.result.winner,
    prizes:o.result.prizesRemaining,
    sourceRootActions:o.sourceActions.length,
    traceDigest:hash(o.sourceActions),
    copyChoices:o.copyChoices,spreadChoices:o.spreadChoices
  });
  return {
    schema:'rank10-source-coupled-apex-policy-v1',
    experimentType:'one-frozen-source-deal-diagnostic',
    engine:control.result.engine,trialId:trial.trialId,
    seed:trial.seed,planDigest:schedule.planDigest,
    candidatePhysicalSeat:'B',candidateActuallyFirst:true,
    sourceDeckHashes:control.result.deckHashes,
    firstNormalTurnZoneDigest:control.firstNormalTurnZoneDigest,
    policyFlag:'apexSpreadPrizeWindowPolicy',
    ddePolicy:'DoubleDragonAttachTactic-v3-archive',
    controlRepeatExact:true,
    firstRootActionDifference:difference,
    control:compact(control),experimental:compact(experimental),
    sourceReplayMechanicsVerified:false,
    qualifiedForCompetitiveInference:false
  };
}
if(require.main===module)process.stdout.write(JSON.stringify(main(),null,2)+'\n');
module.exports={firstActionDifference,withSourceApexObservation,main};
