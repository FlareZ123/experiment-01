'use strict';
const assert=require('node:assert/strict'),path=require('node:path');
const {actorObservation}=require('./actor-observation-contract.cjs');
const {assertValidPromptAction}=require('./prompt-integrity.cjs');
const VERSION='agent13-actor-only-copied-attack-choice-v2-live-state';
/**
 * Read only genuine actor-offered ChooseAttackPrompt contents and detached
 * acting-owner observation. Preserve individual printing and attack indices.
 * @param {object} state Native Store State.
 * @param {0|1} seat Physical seat.
 * @param {Function} [observe] Already audited actor-view constructor.
 * @returns {object|null}
 */
function actorChooseAttackInput(state,seat,observe=actorObservation){
  assert.ok(seat===0||seat===1);
  const pending=state.prompts.find(p=>p.result===undefined);
  if(pending?.constructor.name!=='ChooseAttackPrompt'||
    pending.playerId!==state.players[seat]?.id)return null;
  const actor=observe(state,seat);
  assert.equal(actor.decisionKind,'owner-prompt');
  const blocked=pending.options?.blocked??[];
  const offered=pending.cards.map((card,index)=>Object.freeze({
    index,printing:card.fullName,
    attacks:Object.freeze(card.attacks.map((attack,j)=>Object.freeze({
      index:j,name:attack.name,gxAttack:attack.gxAttack===true,
      blocked:blocked.some(b=>b.index===index&&b.attack===attack.name)
    })))
  }));
  return Object.freeze({actor,prompt:Object.freeze({
    id:pending.id,kind:'ChooseAttackPrompt',
    allowCancel:pending.options?.allowCancel===true,
    offered:Object.freeze(offered)
  })});
}
/**
 * Simple unqualified actor-menu choice. Exclude blocked and spent GX attacks.
 * Do not infer opponent hidden hand contents, candidate deck or matchup rank.
 * @param {object} input Detached actor-owned prompt.
 * @returns {{sourceIndex:number|null,attackIndex:number|null}}
 */
function chooseActorCopiedAttack(input,options={}){
  assert.equal(input.actor.decisionKind,'owner-prompt');
  assert.equal(input.prompt.kind,'ChooseAttackPrompt');
  const gxUsed=input.actor.ownPublic?.publicTurnRestrictions?.gxUsed===true;
  const eligible=[];
  for(const source of input.prompt.offered)
    for(const attack of source.attacks)
      if(!attack.blocked&&!(gxUsed&&attack.gxAttack))
        eligible.push({sourceIndex:source.index,attackIndex:attack.index,
          printing:source.printing,attackName:attack.name});
  // A/B-only tactical hypothesis: try printed Poltergeist before an earlier
  // unrelated donor. No opponent hand identities or hidden Trainer count are
  // consulted. Its actual damage and performance must be observed, not assumed.
  if(options.preferGengarPoltergeist===true){
    const alternate=eligible.find(candidate=>
      candidate.printing==='Gengar & Mimikyu-GX TEU'&&
      candidate.attackName==='Poltergeist');
    if(alternate)return {sourceIndex:alternate.sourceIndex,
      attackIndex:alternate.attackIndex};
  }
  if(eligible.length>0)return {sourceIndex:eligible[0].sourceIndex,
    attackIndex:eligible[0].attackIndex};
  if(input.prompt.allowCancel)return {sourceIndex:null,attackIndex:null};
  throw Error('Mandatory ChooseAttack has no permitted printed attack');
}
/**
 * Both-seat temporary prompt interceptor. The decision callback sees only a
 * frozen DTO; the real Attack object is restored for Store.dispatch afterward.
 * @template T
 * @param {()=>T} run Synchronous genuine Store workload.
 * @param {object} [deps] Test seam for pinned classes.
 * @returns {{result:T,audit:object}}
 */
function withActorOnlyChooseAttack(run,deps={}){
  assert.equal(typeof run,'function');
  const base=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
  const SimpleTacticsAi=deps.SimpleTacticsAi??require(path.join(base,
    'simple-bot/simple-tactics-ai')).SimpleTacticsAi;
  const Store=deps.Store??require(path.join(base,'game/store/store')).Store;
  const ResolvePromptAction=deps.ResolvePromptAction??require(path.join(base,
    'game/store/actions/resolve-prompt-action')).ResolvePromptAction;
  const observe=deps.observe??actorChooseAttackInput;
  const validate=deps.validate??assertValidPromptAction;
  const original=Object.getOwnPropertyDescriptor(SimpleTacticsAi.prototype,'decodeNextAction');
  const originalDispatch=Object.getOwnPropertyDescriptor(Store.prototype,'dispatch');
  assert.equal(typeof original?.value,'function');
  assert.equal(typeof originalDispatch?.value,'function');
  const decisions=new WeakMap(),stores=new WeakSet();
  let liveStore=null;
  const preferGengarPoltergeist=deps.preferGengarPoltergeist===true;
  const audit={version:preferGengarPoltergeist?
    VERSION+'+agent13-gengar-poltergeist-first-v1':VERSION,
    origin:'detached owner ChooseAttack menu',
    preferGengarPoltergeist,
    menus:0,selected:0,nativeStores:0,accepted:0,rejected:0,
    nativeFallbacks:0,nonLiveSpeculativeFallbacks:0,
    selections:[],competitiveGameQualified:false};
  function decide(state){
    if(state!==liveStore?.state){
      audit.nonLiveSpeculativeFallbacks++;
      return original.value.call(this,state);
    }
    const seat=state.players.findIndex(p=>p.id===this.client?.id);
    const input=seat>=0?observe(state,seat):null;
    if(!input){
      if(state.prompts?.some(p=>p.result===undefined&&
        p.playerId===this.client?.id))audit.nativeFallbacks++;
      return original.value.call(this,state);
    }
    audit.menus++;
    const intent=chooseActorCopiedAttack(input,{preferGengarPoltergeist});
    const prompt=state.prompts.find(p=>p.result===undefined);
    const selected=intent.sourceIndex===null?null:
      prompt.cards[intent.sourceIndex].attacks[intent.attackIndex];
    const action=new ResolvePromptAction(input.prompt.id,selected);
    validate(state,action,{enforceSelectOptionLegality:true});
    const fact={seat,turn:input.actor.globalTurn,
      sourceIndex:intent.sourceIndex,attackIndex:intent.attackIndex,
      printing:intent.sourceIndex===null?null:
        input.prompt.offered[intent.sourceIndex].printing,
      attack:selected?.name??null};
    decisions.set(action,fact);audit.selected++;
    if(audit.selections.length<64)audit.selections.push(fact);
    return action;
  }
  function dispatch(action,...args){
    if(action?.constructor?.name==='AddPlayerAction'&&!stores.has(this)){
      stores.add(this);audit.nativeStores++;
    }
    if(action?.constructor?.name==='AddPlayerAction')liveStore=this;
    if(!stores.has(this)||!decisions.has(action))
      return originalDispatch.value.apply(this,[action,...args]);
    try{
      const value=originalDispatch.value.apply(this,[action,...args]);
      audit.accepted++;return value;
    }catch(error){audit.rejected++;throw error;}
  }
  Object.defineProperty(SimpleTacticsAi.prototype,'decodeNextAction',
    {...original,value:decide});
  Object.defineProperty(Store.prototype,'dispatch',
    {...originalDispatch,value:dispatch});
  try{return {result:run(),audit};}
  finally{
    assert.strictEqual(Store.prototype.dispatch,dispatch);
    Object.defineProperty(Store.prototype,'dispatch',originalDispatch);
    assert.strictEqual(SimpleTacticsAi.prototype.decodeNextAction,decide);
    Object.defineProperty(SimpleTacticsAi.prototype,'decodeNextAction',original);
  }
}
module.exports={VERSION,actorChooseAttackInput,chooseActorCopiedAttack,
  withActorOnlyChooseAttack};
