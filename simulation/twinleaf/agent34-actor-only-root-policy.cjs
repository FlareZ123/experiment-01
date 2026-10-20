'use strict';
const assert=require('node:assert/strict');
const path=require('node:path');
const {actorObservation}=require('./actor-observation-contract.cjs');
const VERSION='agent34-actor-only-root-slice-v1';
const ENERGY_TYPE={Grass:'G',Fire:'R',Water:'W',Lightning:'L',Psychic:'P',Fighting:'F',Darkness:'D',Metal:'M',Fairy:'Y'};

/**
 * Pure decision from a detached owner observation plus the public print catalog.
 * No native State, opposing hidden zones, or own unknown deck identities enter.
 * @param {object} view
 * @param {{basics:Set<string>,basicEnergies:Set<string>}} catalog
 * @returns {object} Native-neutral intent.
 */
function chooseActorRootIntent(view,catalog){
  assert.equal(view.decisionKind,'owner-root');
  const own=view.ownPublic,r=view.ownTurnResources;
  const benchIndex=own.bench.findIndex(slot=>slot===null);
  if(benchIndex>=0&&!r.pokemonPlayLocked){
    const index=view.ownHand.findIndex(p=>catalog.basics.has(p));
    if(index>=0)return {kind:'bench-basic',handIndex:index,benchIndex,printing:view.ownHand[index]};
  }
  if(own.active&&!r.energyPlayLocked&&r.energyPlayedTurn!==view.globalTurn){
    const index=view.ownHand.findIndex(p=>catalog.basicEnergies.has(p));
    if(index>=0)return {kind:'attach-basic-energy',handIndex:index,printing:view.ownHand[index]};
  }
  const active=own.active,restrictions=active?.publicRestrictions;
  const locked=own.publicTurnRestrictions?.attackLockTurnsRemaining>0||
    restrictions?.cannotAttackNextTurn===true||
    active?.specialConditions?.some(x=>/ASLEEP|PARALYZED/i.test(String(x)));
  if(active&&!locked){
    const attached=[];
    for(const printing of active.energies){
      if(!catalog.basicEnergies.has(printing))continue;
      const kind=Object.keys(ENERGY_TYPE).find(k=>printing.startsWith(k+' Energy '));
      if(kind)attached.push(ENERGY_TYPE[kind]);
    }
    for(const attack of active.attacks){
      if(attack.gxAttack||!Array.isArray(attack.cost))continue;
      if(restrictions?.blockedAttackNameNextTurn===attack.name||
        restrictions?.blockedAttackNameUntilLeavesActive===attack.name||
        restrictions?.cannotUseAttacksNextTurn?.includes(attack.name)||
        (restrictions?.onlyAllowedAttackNameNextTurn&&
          restrictions.onlyAllowedAttackNameNextTurn!==attack.name))continue;
      const left=attached.slice(),colored=attack.cost.filter(t=>t!=='C');
      if(colored.some(type=>{
        const index=left.indexOf(type);
        if(index<0)return true;
        left.splice(index,1);
        return false;
      }))continue;
      if(left.length>=attack.cost.length-colored.length){
        return {kind:'attack',attackName:attack.name};
      }
    }
  }
  return {kind:'pass',reason:'no-supported-owner-visible-root'};
}

/**
 * Reversible real-bot decision override and independent actual Store acceptance
 * counter. Prompts explicitly delegate to the native bot and are unqualified.
 * Static printing metadata comes only from CardManager's public card pool.
 * @template T
 * @param {()=>T} run Synchronous genuine pinned headless games.
 * @param {object} [deps] Injectable pinned classes or pure test fixtures.
 * @returns {{result:T,audit:object}}
 */
function withActorOnlyRootPolicy(run,deps={}){
  assert.equal(typeof run,'function');
  const base=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
  const SimpleTacticsAi=deps.SimpleTacticsAi??
    require(path.join(base,'simple-bot/simple-tactics-ai')).SimpleTacticsAi;
  const {PlayCardAction,PlayerType,SlotType}=deps.cardActions??
    require(path.join(base,'game/store/actions/play-card-action'));
  const {AttackAction,PassTurnAction}=deps.gameActions??
    require(path.join(base,'game/store/actions/game-actions'));
  const getCatalog=deps.getCatalog??(()=>{
    const {CardManager}=require(path.join(base,'game/cards/card-manager'));
    const {PokemonCard}=require(path.join(base,'game/store/card/pokemon-card'));
    const {EnergyCard}=require(path.join(base,'game/store/card/energy-card'));
    const {Stage,EnergyType}=require(path.join(base,'game/store/card/card-types'));
    const all=CardManager.getInstance().getAllCards();
    return {
      basics:new Set(all.filter(c=>c instanceof PokemonCard&&c.stage===Stage.BASIC).map(c=>c.fullName)),
      basicEnergies:new Set(all.filter(c=>c instanceof EnergyCard&&c.energyType===EnergyType.BASIC).map(c=>c.fullName))
    };
  });
  const observe=deps.observe??actorObservation;
  const Store=deps.Store??require(path.join(base,'game/store/store')).Store;
  const beforeDispatch=Object.getOwnPropertyDescriptor(Store.prototype,'dispatch');
  assert.equal(typeof beforeDispatch?.value,'function');
  const original=Object.getOwnPropertyDescriptor(SimpleTacticsAi.prototype,'decodeNextAction');
  assert.equal(typeof original?.value,'function');
  const typedDecisions=new WeakMap();
  let nativeStore=null,catalog=null;
  const audit={
    version:VERSION,origin:'detached-actor-observation',
    selectedRootDecisions:0,acceptedActorRoots:0,rejectedActorRoots:0,
    typedIntentCounts:{},nativeRootAcceptances:[],
    unsupportedPromptFallbacks:0,nonOwnerNativeDelegations:0,
    ownerRootIntents:[],competitiveGameQualified:false,
    note:'Only roots are actor-only. Every native prompt fallback makes the full game unqualified.'
  };
  function wrapped(state){
    const playerId=this.client?.id;
    const seat=state.players?.findIndex(p=>p.id===playerId);
    const pending=state.prompts?.find(p=>p.result===undefined);
    if(seat===-1||pending||state.activePlayer!==seat){
      if(pending&&state.players?.[seat]?.id===pending.playerId)audit.unsupportedPromptFallbacks++;
      else audit.nonOwnerNativeDelegations++;
      return original.value.call(this,state);
    }
    if(catalog===null)catalog=getCatalog();
    const view=observe(state,seat);
    const intent=chooseActorRootIntent(view,catalog);
    const ownerId=state.players[seat].id;
    let action;
    switch(intent.kind){
      case 'bench-basic':
        action=new PlayCardAction(ownerId,intent.handIndex,{
          player:PlayerType.BOTTOM_PLAYER,slot:SlotType.BENCH,index:intent.benchIndex});
        break;
      case 'attach-basic-energy':
        action=new PlayCardAction(ownerId,intent.handIndex,{
          player:PlayerType.BOTTOM_PLAYER,slot:SlotType.ACTIVE,index:0});
        break;
      case 'attack':action=new AttackAction(ownerId,intent.attackName);break;
      case 'pass':action=new PassTurnAction(ownerId);break;
      default:throw new Error('Unknown actor-only intent: '+intent.kind);
    }
    audit.selectedRootDecisions++;
    typedDecisions.set(action,{globalTurn:view.globalTurn,seat,kind:intent.kind});
    audit.typedIntentCounts[intent.kind]=(audit.typedIntentCounts[intent.kind]??0)+1;
    if(audit.ownerRootIntents.length<40)audit.ownerRootIntents.push({
      globalTurn:view.globalTurn,seat,intent,typedAction:action.constructor.name
    });
    return action;
  }
  function dispatchObserved(action,...args){
    if(nativeStore===null&&action?.constructor?.name==='AddPlayerAction')nativeStore=this;
    const choice=this===nativeStore?typedDecisions.get(action):undefined;
    if(!choice)return beforeDispatch.value.apply(this,[action,...args]);
    try{
      const result=beforeDispatch.value.apply(this,[action,...args]);
      audit.acceptedActorRoots++;
      if(audit.nativeRootAcceptances.length<64)
        audit.nativeRootAcceptances.push({...choice,accepted:true});
      return result;
    }catch(error){
      audit.rejectedActorRoots++;
      if(audit.nativeRootAcceptances.length<64)
        audit.nativeRootAcceptances.push({...choice,accepted:false,error:String(error)});
      throw error;
    }
  }
  Object.defineProperty(SimpleTacticsAi.prototype,'decodeNextAction',{...original,value:wrapped});
  Object.defineProperty(Store.prototype,'dispatch',{...beforeDispatch,value:dispatchObserved});
  try{return {result:run(),audit};}
  finally{
    assert.strictEqual(Store.prototype.dispatch,dispatchObserved);
    Object.defineProperty(Store.prototype,'dispatch',beforeDispatch);
    assert.strictEqual(SimpleTacticsAi.prototype.decodeNextAction,wrapped);
    Object.defineProperty(SimpleTacticsAi.prototype,'decodeNextAction',original);
  }
}
module.exports={VERSION,chooseActorRootIntent,withActorOnlyRootPolicy};
