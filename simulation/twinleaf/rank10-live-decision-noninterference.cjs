'use strict';

const assert=require('node:assert/strict');
const crypto=require('node:crypto');
const path=require('node:path');
const {runMatch,initializeCards}=require('./headless.cjs');
const {resolveManifestFile}=require('./resolve-field.cjs');
const {loadDefaultCampaign}=
  require('../../scripts/aichi-comparison-campaign.cjs');

const output=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
/** @param {string} name */
const engine=name=>require(path.join(output,name));

/**
 * Deterministically serialize *data descriptors* and reachable source-object
 * topology. Never enumerate a prototype, invoke an accessor or modify State.
 * The hash includes hidden zones but the report exposes only the digest.
 * @param {unknown} root
 * @returns {{digest:string,nodes:number}}
 */
function stateGraphFingerprint(root) {
  const seen=new WeakMap();
  const nodes=[];
  /** @param {unknown} value @returns {object} */
  function visit(value) {
    if(value===null)return {kind:'null'};
    const type=typeof value;
    if(type==='undefined')return {kind:'undefined'};
    if(type==='number'&&!Number.isFinite(value))
      return {kind:'number',value:String(value)};
    if(type==='bigint')return {kind:'bigint',value:value.toString()};
    if(type==='symbol')return {kind:'symbol',value:String(value)};
    if(type==='function')return {kind:'function',name:value.name};
    if(type!=='object')return {kind:type,value};
    if(seen.has(value))return {ref:seen.get(value)};
    const id=nodes.length;
    seen.set(value,id);
    nodes.push(null);
    const proto=Object.getPrototypeOf(value);
    const ctor=proto&&Object.getOwnPropertyDescriptor(proto,'constructor');
    const className=typeof ctor?.value==='function' ?
      ctor.value.name : Array.isArray(value)?'Array':'object';
    const properties=[];
    for(const key of Reflect.ownKeys(value)) {
      const descriptor=Object.getOwnPropertyDescriptor(value,key);
      if(!descriptor)continue;
      properties.push({
        key:typeof key==='symbol'?String(key):key,
        enumerable:descriptor.enumerable,
        configurable:descriptor.configurable,
        ...(Object.hasOwn(descriptor,'value')?
          {writable:descriptor.writable,data:visit(descriptor.value)}:
          {getter:descriptor.get?.name??null,setter:descriptor.set?.name??null})
      });
    }
    nodes[id]={className,properties};
    return {ref:id};
  }
  const entry=visit(root);
  const json=JSON.stringify({entry,nodes});
  return {digest:crypto.createHash('sha256').update(json).digest('hex'),
    nodes:nodes.length};
}

/**
 * Capture whether an actual SimpleTacticsAi's source State changes merely
 * while selecting an action. No extra policy evaluations are invoked.
 * @template T
 * @param {function} SimpleTacticsAi
 * @param {()=>T} work
 * @param {{turn:number,seat:number}} target
 * @returns {{result:T,observations:object[]}}
 */
function withLiveDecisionFingerprint(SimpleTacticsAi,work,target) {
  const descriptor=Object.getOwnPropertyDescriptor(
    SimpleTacticsAi.prototype,'decodeNextAction');
  assert.ok(descriptor&&typeof descriptor.value==='function');
  const observations=[];
  const wrapped=function(state) {
    const shouldCapture=state.turn===target.turn&&
      state.activePlayer===target.seat&&
      state.prompts.every(prompt=>prompt.result!==undefined)&&
      observations.length===0;
    if(!shouldCapture)return descriptor.value.call(this,state);
    const before=stateGraphFingerprint(state);
    const action=descriptor.value.call(this,state);
    const after=stateGraphFingerprint(state);
    observations.push({
      turn:state.turn,seat:state.activePlayer,
      action:action?.constructor?.name??null,
      before,after,sourceMutatedDuringDecision:before.digest!==after.digest,
      graphNodeDelta:after.nodes-before.nodes
    });
    return action;
  };
  Object.defineProperty(SimpleTacticsAi.prototype,'decodeNextAction',{
    ...descriptor,value:wrapped
  });
  try {
    return {result:work(),observations};
  } finally {
    Object.defineProperty(SimpleTacticsAi.prototype,'decodeNextAction',descriptor);
  }
}

/**
 * Authentic fixed rank-10 champion physical-B source deal.
 * This audit introduces no policy branch and cannot qualify competitive play.
 */
function auditRank10LiveDecision() {
  initializeCards();
  const field=resolveManifestFile(path.resolve(__dirname,
    '../../results/aichi-2026/full-decklists.json'),{
      allowEquivalentBasicEnergies:true,
      allowJapanesePromoHooks:true
    });
  const byRank=new Map(field.decks.map(deck=>[deck.rank,deck]));
  const rank1=byRank.get(1),rank10=byRank.get(10);
  assert.ok(rank1?.playableUnderEngine&&rank10?.playableUnderEngine);
  const schedule=loadDefaultCampaign('decorrelated-slots-v3');
  const matching=schedule.trials.filter(trial=>
    trial.phase==='pilot'&&trial.rank===10&&trial.repeat===0&&
    trial.candidateId==='champion-reference'&&
    trial.candidateEngineSlot==='B');
  assert.equal(matching.length,1);
  const trial=matching[0];
  assert.equal(trial.seed,4246551499);

  const common={
    deckA:rank10.cardIds,deckB:rank1.cardIds,seed:trial.seed,
    maxActions:350,label:trial.trialId,strictPromptValidation:true,
    forestSealSearchCorrection:true,supporterDecisionCorrection:true,
    doubleDragonRecovery:true,isolatePolicyRandomness:true,
    captureDecisionTrace:true,captureCopycatTurnStartSeat:1,
    postSuperAliasRepairIsolation:true,
    mimikyuApexCopycatCompatibility:true,
    mimikyuDeclaredHistoryCorrection:true,
    regidragoDeclaredHistoryCorrection:true,
    passClearsLastAttackCorrection:true
  };
  const {SimpleTacticsAi}=engine('simple-bot/simple-tactics-ai');
  const control=runMatch(common);
  const observed=withLiveDecisionFingerprint(
    SimpleTacticsAi,()=>runMatch(common),{turn:27,seat:1});
  assert.equal(observed.observations.length,1,
    'Expected a genuine candidate turn-27 decision');
  assert.deepEqual(observed.result,control,
    'Read-only graph audit changed the genuine fixed-seed source game');
  assert.equal(control.firstTurnSlot,1);
  const event=observed.observations[0];
  return {
    study:'authentic-rank-10-champion-B-turn27-root-bot-graph-mutation',
    researchClassification:'authentic-source-dealt-decision-diagnostic',
    engine:control.engine,
    trial:{id:trial.trialId,seed:trial.seed,
      candidatePhysicalSeat:1,candidateActuallyFirst:true,
      planDigest:schedule.planDigest,
      sourcePrintedDeckHashes:control.deckHashes},
    target:event,
    observationNoninterference:true,
    matchedEngineControlSummary:true,
    qualifiedForCompetitiveInference:false,
    limitations:[
      'Graph fingerprint checks own-enumerable State descriptors only',
      'This observes the root decision, not all speculative branches or reducers',
      'No full-parameter live prompt/reducer replay or policy qualification',
      'One fixed trial and one physical candidate seat'
    ]
  };
}
if(require.main===module)
  process.stdout.write(JSON.stringify(auditRank10LiveDecision(),null,2)+'\n');
module.exports={stateGraphFingerprint,withLiveDecisionFingerprint,
  auditRank10LiveDecision};
