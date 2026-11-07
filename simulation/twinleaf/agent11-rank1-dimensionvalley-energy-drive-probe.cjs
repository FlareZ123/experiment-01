'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');

const VERSION='agent11-t16-detached-dimensionvalley-energy-drive-native-v2';
const TARGET_TURN=16;
const ACTIVE='Tapu Lele-GX GRI';
const STADIUM='Dimension Valley PHF';
const ATTACK='Energy Drive';

/**
 * Match the physically observed post-choice source setup, before proposing
 * any trial action. Only own hand and face-up Active are consulted.
 * @param {object} view Detached acting-owner observation.
 * @returns {number} Source hand index, or -1 if the target is absent.
 */
function ownerStadiumIndex(view){
  if(view?.decisionKind!=='owner-root'||
      view?.globalTurn!==TARGET_TURN||
      view?.ownPublic?.active?.printing!==ACTIVE||
      !Array.isArray(view.ownHand))return -1;
  return view.ownHand.indexOf(STADIUM);
}

/**
 * Test the exact source's voluntarily held Stadium -> printed attack line
 * in independent copies of the real pre-Pass Store state. Neither copy is
 * consulted by a player decision, and neither ever modifies the real Store.
 *
 * @param {object} state Original actual Store state, read only.
 * @param {number} ownerId Acting source player's physical client ID.
 * @param {object} view Detached own-hand/public-board observation.
 * @param {object} [deps] Optional native dependencies supplied by pure tests.
 * @returns {object} Factually observed native clone receipt.
 */
function probeStadiumThenEnergyDrive(state,ownerId,view,deps={}){
  const handIndex=ownerStadiumIndex(view);
  const result={
    schema:VERSION,ownerTurn:TARGET_TURN,stadiumPrinting:STADIUM,
    sourceActive:ACTIVE,attackName:ATTACK,
    sourceHandIndex:handIndex,proposalUsesOwnerHandOnly:true,
    targetTurnMatched:handIndex>=0,baselineAttackAccepted:null,
    stadiumNativeAccepted:false,stadiumPhysicalMove:false,
    stadiumEffectiveInPlay:false,attackNativeAccepted:false,
    attackSettled:false,attackDamage:null,opponentDamageBefore:null,
    opponentDamageAfter:null,opponentPrizesBefore:null,
    stadiumWaitPrompts:[],attackWaitPrompts:[],
    opponentPrizesAfter:null,unresolvedPromptTypes:[],
    errors:[],realStoreChanged:false,paperQualified:false
  };
  if(handIndex<0){result.status='target-state-not-present';return result;}
  const output=path.resolve(__dirname,
    '../../vendor/twinleaf/ptcg-server/output');
  const load=name=>require(path.join(output,name));
  const {deepClone}=deps.utils??load('utils/utils');
  const {Store}=deps.StoreModule??load('game/store/store');
  const {AttackAction,RetreatAction,PassTurnAction}=
    deps.gameActions??load('game/store/actions/game-actions');
  const {PlayCardAction,PlayerType,SlotType}=
    deps.playActions??load('game/store/actions/play-card-action');
  const {ResolvePromptAction}=deps.resolvePromptAction??
    load('game/store/actions/resolve-prompt-action');
  const {WaitPrompt}=deps.waitPromptModule??load('game/store/prompts/wait-prompt');
  const {StateUtils}=deps.stateUtils??load('game/store/state-utils');
  const copy=()=>{const clone=new Store({onStateChange(){}});
    clone.state=deepClone(state);return clone;};
  const settleWaitPrompts=clone=>{
    const resolved=[];
    for(let i=0;i<16;i++){
      const pending=clone.state.prompts.find(p=>p.result===undefined);
      if(!pending||!(pending instanceof WaitPrompt))break;
      resolved.push({message:pending.message??null,duration:pending.duration??null,
        showVisual:pending.showVisual??null});
      clone.dispatch(new ResolvePromptAction(pending.id,null));
    }
    return resolved;
  };
  const initial=state.players.find(p=>p.id===ownerId);
  assert.ok(initial);
  const previousRandom=Math.random;
  Math.random=()=>0.5;
  try{
    const baseline=copy();
    try{
      baseline.dispatch(new AttackAction(ownerId,ATTACK));
      result.baselineAttackAccepted=true;
    }catch(error){
      result.baselineAttackAccepted=false;
      result.baselineRejection=String(error?.message??error);
    }

    const clone=copy();
    const before=clone.state.players.find(p=>p.id===ownerId);
    const opposing=clone.state.players.find(p=>p.id!==ownerId);
    const beforeHand=before.hand.cards.length;
    const selectedHeldStadium=before.hand.cards[handIndex];
    const beforeStadium=StateUtils.getStadiumCard(clone.state)?.fullName??null;
    result.stadiumBefore=beforeStadium;
    result.sourceActiveEnergyBefore=before.active.energies.cards
      .map(c=>c.fullName);
    result.opponentActiveBefore=
      opposing.active.getPokemonCard?.()?.fullName??null;
    result.opponentActiveEnergyBefore=opposing.active.energies.cards
      .map(c=>c.fullName);
    result.opponentDamageBefore=opposing.active.damage;
    result.opponentPrizesBefore=opposing.prizes.length;
    try{
      clone.dispatch(new PlayCardAction(ownerId,handIndex,{
        player:PlayerType.BOTTOM_PLAYER,slot:SlotType.BOARD,index:0
      }));
      result.stadiumNativeAccepted=true;
      result.stadiumWaitPrompts=settleWaitPrompts(clone);
    }catch(error){
      result.errors.push({phase:'play-stadium',
        message:String(error?.message??error)});
      result.status='stadium-native-rejected';
      return result;
    }
    const afterStadium=clone.state.players.find(p=>p.id===ownerId);
    result.stadiumAfter=StateUtils.getStadiumCard(clone.state)?.fullName??null;
    result.stadiumEffectiveInPlay=result.stadiumAfter===STADIUM;
    result.stadiumPhysicalMove=beforeHand-afterStadium.hand.cards.length===1 &&
      !afterStadium.hand.cards.includes(selectedHeldStadium);
    if(!result.stadiumPhysicalMove||!result.stadiumEffectiveInPlay){
      result.status='stadium-physical-custody-unverified';
      return result;
    }

    try{
      clone.dispatch(new AttackAction(ownerId,ATTACK));
      result.attackNativeAccepted=true;
      result.attackWaitPrompts=settleWaitPrompts(clone);
    }catch(error){
      result.errors.push({phase:'attack',
        message:String(error?.message??error)});
      result.status='stadium-paid-attack-native-rejected';
      return result;
    }
    const finalOwner=clone.state.players.find(p=>p.id===ownerId);
    const finalOpponent=clone.state.players.find(p=>p.id!==ownerId);
    result.opponentDamageAfter=finalOpponent.active.damage;
    result.attackDamage=result.opponentDamageAfter-result.opponentDamageBefore;
    result.opponentActiveAfter=
      finalOpponent.active.getPokemonCard?.()?.fullName??null;
    result.opponentPrizesAfter=finalOpponent.prizes.length;
    result.ownerPrizesAfter=finalOwner.prizes.length;
    result.activeEnergyPrintings=finalOwner.active.energies.cards
      .map(c=>c.fullName);
    result.unresolvedPromptTypes=clone.state.prompts
      .filter(p=>p.result===undefined).map(p=>p.constructor.name);
    result.attackSettled=result.unresolvedPromptTypes.length===0;
    result.status=result.attackSettled?'native-stadium-attack-settled':
      'native-attack-prompt-pending';

    const ownerBenchTargetIndex=initial.bench.findIndex(cardList=>
      cardList.cards[0]?.name==='Trevenant & Dusknoir-GX');
    const hasSkylinerBenchPokemon=initial.bench.some(cardList=>
      cardList.cards.some(card=>card.fullName==='Latias ex SSP'));
    const opponentId=opposing.id;
    const baselineReply=copy();
    const baselineResult={
      opponentAttackName:'Eon Blade',opponentAttackNativeAccepted:false,
      ownerActiveAfter:null,ownerActiveDamageAfter:null,
      ownerPrizesAfter:null,opponentPrizesAfter:null,
      unresolvedPromptTypes:[],waitPrompts:[]
    };
    try{
      baselineReply.dispatch(new PassTurnAction(ownerId));
      settleWaitPrompts(baselineReply);
      baselineReply.dispatch(new AttackAction(opponentId,'Eon Blade'));
      baselineResult.opponentAttackNativeAccepted=true;
      baselineResult.waitPrompts=settleWaitPrompts(baselineReply);
    }catch(error){
      baselineResult.error=String(error?.message??error);
    }
    const baselineOwner=baselineReply.state.players.find(p=>p.id===ownerId);
    const baselineOpponent=baselineReply.state.players.find(p=>p.id===opponentId);
    baselineResult.ownerActiveAfter=
      baselineOwner.active.getPokemonCard?.()?.fullName??null;
    baselineResult.ownerActiveDamageAfter=baselineOwner.active.damage??null;
    baselineResult.ownerPrizesAfter=baselineOwner.prizes.length;
    baselineResult.opponentPrizesAfter=baselineOpponent.prizes.length;
    baselineResult.unresolvedPromptTypes=baselineReply.state.prompts
      .filter(p=>p.result===undefined).map(p=>p.constructor.name);

    const defense=copy();
    const defensiveLine={
      sourceOwnerHasSkylinerBenchPokemon:hasSkylinerBenchPokemon,
      retreatTargetIndex:ownerBenchTargetIndex,
      retreatNativeAccepted:false,opponentAttackName:'Eon Blade',
      opponentAttackNativeAccepted:false,ownerActiveAfterRetreat:null,
      ownerActiveAfterReply:null,ownerActiveDamageAfter:null,
      ownerPrizesAfter:null,opponentPrizesAfter:null,
      retreatWaitPrompts:[],opponentAttackWaitPrompts:[],
      unresolvedPromptTypes:[]
    };
    try{
      if(ownerBenchTargetIndex<0)throw new Error('Trevenant & Dusknoir bench target missing');
      defense.dispatch(new RetreatAction(ownerId,ownerBenchTargetIndex));
      defensiveLine.retreatNativeAccepted=true;
      defensiveLine.retreatWaitPrompts=settleWaitPrompts(defense);
      const afterRetreatOwner=defense.state.players.find(p=>p.id===ownerId);
      defensiveLine.ownerActiveAfterRetreat=
        afterRetreatOwner.active.getPokemonCard?.()?.fullName??null;
      const currentId=defense.state.players[defense.state.activePlayer].id;
      if(currentId===ownerId){
        defense.dispatch(new PassTurnAction(ownerId));
        settleWaitPrompts(defense);
      }
      const nextId=defense.state.players[defense.state.activePlayer].id;
      if(nextId!==opponentId)throw new Error('opponent turn was not reached after retreat');
      defense.dispatch(new AttackAction(opponentId,'Eon Blade'));
      defensiveLine.opponentAttackNativeAccepted=true;
      defensiveLine.opponentAttackWaitPrompts=settleWaitPrompts(defense);
    }catch(error){
      defensiveLine.error=String(error?.message??error);
    }
    const defensiveOwner=defense.state.players.find(p=>p.id===ownerId);
    const defensiveOpponent=defense.state.players.find(p=>p.id===opponentId);
    defensiveLine.ownerActiveAfterReply=
      defensiveOwner.active.getPokemonCard?.()?.fullName??null;
    defensiveLine.ownerActiveDamageAfter=defensiveOwner.active.damage??null;
    defensiveLine.ownerPrizesAfter=defensiveOwner.prizes.length;
    defensiveLine.opponentPrizesAfter=defensiveOpponent.prizes.length;
    defensiveLine.unresolvedPromptTypes=defense.state.prompts
      .filter(p=>p.result===undefined).map(p=>p.constructor.name);
    defensiveLine.status=defensiveLine.opponentAttackNativeAccepted&&
      defensiveLine.unresolvedPromptTypes.length===0?
      'native-defensive-reply-settled':'native-defensive-reply-incomplete';
    result.baselineOpponentReply=baselineResult;
    result.defensiveLine=defensiveLine;
    return result;
  }finally{
    Math.random=previousRandom;
  }
}

module.exports={VERSION,TARGET_TURN,ACTIVE,STADIUM,ATTACK,
  ownerStadiumIndex,probeStadiumThenEnergyDrive};
