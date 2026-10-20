'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const {actorObservation} = require('./actor-observation-contract.cjs');

const VERSION = 'actor-only-native-root-tactics-v1-development';
const BASIC_TYPES = new Set([
  'GRASS','FIRE','WATER','LIGHTNING','PSYCHIC',
  'FIGHTING','DARKNESS','METAL','FAIRY'
]);

/**
 * Return exactly the printed Basic Energy type. Nonbasic Energy receives
 * no invented color or multiplier; speculative Special Energy math is unsafe.
 * @param {string} printing
 * @returns {string|null}
 */
function basicEnergyType(printing) {
  const match = /^(Grass|Fire|Water|Lightning|Psychic|Fighting|Darkness|Metal|Fairy) Energy\s/.exec(printing);
  return match ? match[1].toUpperCase() : null;
}

/**
 * Strictly prove an attack payable from already-visible Basic Energy only.
 * COLORLESS can use any surplus basic energy; colored symbols cannot.
 * Return false on unfamiliar costs or any Special Energy. False negatives
 * are expected, and live Store remains the independent legality authority.
 * @param {string[]} costs
 * @param {string[]} attachedPrintings
 * @returns {boolean}
 */
function basicOnlyAttackPayable(costs, attachedPrintings) {
  if(!Array.isArray(costs)||!Array.isArray(attachedPrintings))return false;
  const resources=attachedPrintings.map(basicEnergyType);
  if(resources.includes(null))return false;
  const requirements=costs.map(x=>String(x).toUpperCase());
  if(requirements.some(x=>x!=='COLORLESS'&&!BASIC_TYPES.has(x)))return false;
  const remaining=[...resources];
  for(const required of requirements) {
    if(required==='COLORLESS')continue;
    const index=remaining.indexOf(required);
    if(index<0)return false;
    remaining.splice(index,1);
  }
  return remaining.length>=requirements.filter(x=>x==='COLORLESS').length;
}

/**
 * A small deterministic decision policy, restricted to detached actor view,
 * fixed printed-card reference metadata, and static engine enum values.
 * It never receives a native State, Player, Card, Prompt, Simulator, or
 * concealed opponent data. Intents are translated separately.
 *
 * @param {object} view The frozen actorObservation result.
 * @param {'bench'|'energy'|'attack'} tactic
 * @param {(printing:string)=>object} catalog Lookup returning copied print metadata.
 * @param {{pokemon:unknown,energy:unknown,basicStage:unknown,basicEnergy:unknown}} enums
 * @returns {object|null}
 */
function decideActorRootIntent(view,tactic,catalog,enums) {
  if(view?.decisionKind!=='owner-root')return null;
  const flags=view.ownTurnResources;
  const hand=view.ownHand;
  if(!Array.isArray(hand)||!flags)return null;
  if(tactic==='bench') {
    if(flags.pokemonPlayLocked)return null;
    const benchIndex=view.ownPublic.bench.findIndex(slot=>slot===null);
    if(benchIndex<0)return null;
    for(let i=0;i<hand.length;i++){
      const spec=catalog(hand[i]);
      if(spec?.superType!==enums.pokemon||spec.stage!==enums.basicStage)
        continue;
      if(flags.abilityPokemonPlayLocked&&spec.hasAbility===true)continue;
      return {kind:'bench',handIndex:i,printing:hand[i],benchIndex};
    }
    return null;
  }
  if(tactic==='energy') {
    if(flags.energyPlayLocked||flags.energyPlayedTurn>=view.globalTurn)return null;
    const first=hand.findIndex(name=>{
      const spec=catalog(name);
      return spec?.superType===enums.energy&&
        spec.energyType===enums.basicEnergy&&
        basicEnergyType(name)!==null;
    });
    if(first<0)return null;
    const energyColor=basicEnergyType(hand[first]);
    const choices=[{slot:'ACTIVE',index:0,card:view.ownPublic.active},
      ...view.ownPublic.bench.map((card,index)=>({slot:'BENCH',index,card}))]
      .filter(entry=>entry.card);
    if(choices.length===0)return null;
    const score=choice=>{
      const known=choice.card.energies.map(basicEnergyType);
      if(known.includes(null))return 99;
      const possible=choice.card.attacks.map(attack=>{
        const need=attack.cost??[];
        if(!Array.isArray(need)||need.length===0)return 98;
        const typed=need.filter(x=>String(x).toUpperCase()!=='COLORLESS');
        const matching=typed.filter(x=>known.includes(String(x).toUpperCase())).length;
        return Math.max(0,need.length-known.length)+
          Math.max(0,typed.length-matching);
      });
      return Math.min(...possible,99);
    };
    choices.sort((a,b)=>score(a)-score(b));
    return {kind:'energy',handIndex:first,printing:hand[first],
      targetSlot:choices[0].slot,targetIndex:choices[0].index,
      basicType:energyColor};
  }
  if(tactic==='attack') {
    const attacker=view.ownPublic.active;
    if(!attacker||attacker.specialConditions.length>0||
      view.ownPublic.publicTurnRestrictions.attackLockTurnsRemaining>0||
      attacker.publicRestrictions.cannotAttackNextTurn)return null;
    const blocked=attacker.publicRestrictions;
    const candidates=attacker.attacks.filter(attack=>
      (!attack.gxAttack||(!view.ownPublic.publicTurnRestrictions.gxUsed&&
        !view.ownPublic.publicTurnRestrictions.cannotUseGXAttacks))&&
      !blocked.cannotUseAttacksNextTurn.includes(attack.name)&&
      blocked.blockedAttackNameNextTurn!==attack.name&&
      blocked.blockedAttackNameUntilLeavesActive!==attack.name&&
      (blocked.onlyAllowedAttackNameNextTurn===null||
        blocked.onlyAllowedAttackNameNextTurn===attack.name)&&
      basicOnlyAttackPayable(attack.cost,attacker.energies));
    if(candidates.length===0)return null;
    candidates.sort((a,b)=>Number(b.damage||0)-Number(a.damage||0));
    return {kind:'attack',attackName:candidates[0].name};
  }
  throw new TypeError('Unsupported actor-only tactic '+tactic);
}

/**
 * Reversible opt-in native execution of three actor-only root tactics. The
 * remaining default tactics and every prompt resolver continue to use the
 * unqualified native policy; audit records cannot certify a complete game.
 * @template T
 * @param {()=>T} execute Runs a real original headless Store match.
 * @param {object} [deps] Injectable pinned interfaces for isolated testing.
 * @returns {{result:T,audit:object}}
 */
function withActorOnlyNativeRootTactics(execute,deps={}){
  assert.equal(typeof execute,'function');
  const root=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
  const engine=name=>require(path.join(root,name));
  const Basic=deps.PlayBasicTactic??engine('simple-bot/simple-tactics/play-basic-tactic').PlayBasicTactic;
  const Energy=deps.AttachEnergyTactic??engine('simple-bot/simple-tactics/attach-energy-tactic').AttachEnergyTactic;
  const Attack=deps.AttackTactic??engine('simple-bot/simple-tactics/attack-tactic').AttackTactic;
  const Store=deps.Store??engine('game/store/store').Store;
  const {PlayCardAction,PlayerType,SlotType}=deps.playCards??engine('game/store/actions/play-card-action');
  const {AttackAction}=deps.gameActions??engine('game/store/actions/game-actions');
  const {SuperType,Stage,EnergyType}=deps.cardTypes??engine('game/store/card/card-types');
  const manager=deps.cardManager??engine('game/cards/card-manager').CardManager.getInstance();
  const descriptors=[['bench',Basic],['energy',Energy],['attack',Attack]].map(
    ([kind,Class])=>({kind,Class,old:Object.getOwnPropertyDescriptor(
      Class.prototype,'useTactic')}));
  descriptors.forEach(row=>assert.equal(typeof row.old?.value,'function'));
  const dispatchDescriptor=Object.getOwnPropertyDescriptor(Store.prototype,'dispatch');
  assert.equal(typeof dispatchDescriptor?.value,'function');
  const cardCache=new Map();
  function catalog(printing){
    if(!cardCache.has(printing)){
      const card=manager.getCardByName(printing);
      cardCache.set(printing,card?Object.freeze({
        superType:card.superType,stage:card.stage,
        energyType:card.energyType,
        hasAbility:(card.powers??[]).length>0
      }):null);
    }
    return cardCache.get(printing);
  }
  const enums={pokemon:SuperType.POKEMON,energy:SuperType.ENERGY,
    basicStage:Stage.BASIC,basicEnergy:EnergyType.BASIC};
  const proposed=new WeakMap();
  let proposals=0,accepted=0,rejected=0,firstLive=null;
  const events=[];
  const patched=[];
  function propose(tactic){
    return function proposedActorRootTactic(state,player){
      const seat=state.players.indexOf(player);
      if(seat!==0&&seat!==1)return undefined;
      const view=actorObservation(state,seat);
      const intent=decideActorRootIntent(view,tactic,catalog,enums);
      if(!intent)return undefined;
      let action;
      if(tactic==='attack'){
        action=new AttackAction(player.id,intent.attackName);
      }else{
        const target={player:PlayerType.BOTTOM_PLAYER,
          slot:intent.kind==='bench'?SlotType.BENCH:
            intent.targetSlot==='ACTIVE'?SlotType.ACTIVE:SlotType.BENCH,
          index:intent.kind==='bench'?intent.benchIndex:intent.targetIndex};
        action=new PlayCardAction(player.id,intent.handIndex,target);
      }
      proposed.set(action,{seat,tactic,turn:view.globalTurn,intent});
      proposals++;
      return action;
    };
  }
  try{
    for(const row of descriptors){
      const fn=propose(row.kind);
      Object.defineProperty(row.Class.prototype,'useTactic',{
        ...row.old,value:fn});
      patched.push(row);
    }
    function dispatch(action,...args){
      if(action?.constructor?.name==='AddPlayerAction'&&!firstLive)
        firstLive=this;
      const hit=this===firstLive?proposed.get(action):null;
      try{
        const result=dispatchDescriptor.value.call(this,action,...args);
        if(hit){
          accepted++;
          if(events.length<64)events.push({...hit,nativeAccepted:true});
        }
        return result;
      }catch(error){
        if(hit){
          rejected++;
          if(events.length<64)events.push({...hit,nativeAccepted:false,
            error:String(error.message??error)});
        }
        throw error;
      }
    }
    Object.defineProperty(Store.prototype,'dispatch',{
      ...dispatchDescriptor,value:dispatch});
    const result=execute();
    return {result,audit:{version:VERSION,bothSeats:true,
      proposedNativeActions:proposals,nativeAcceptedActions:accepted,
      nativeRejectedActions:rejected,events,
      hiddenInformationSafe:false,
      competitiveGameQualified:false,
      scope:'Three root tactic classes only; all other tactics and prompts retain unqualified native policy'
    }};
  }finally{
    Object.defineProperty(Store.prototype,'dispatch',dispatchDescriptor);
    for(const row of patched.reverse())
      Object.defineProperty(row.Class.prototype,'useTactic',row.old);
  }
}

module.exports={VERSION,basicEnergyType,basicOnlyAttackPayable,
  decideActorRootIntent,withActorOnlyNativeRootTactics};
