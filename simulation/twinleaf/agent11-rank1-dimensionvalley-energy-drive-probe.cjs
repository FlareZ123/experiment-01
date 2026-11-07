'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');

const VERSION='agent11-t16-detached-dimensionvalley-energy-drive-native-v1';
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
    attackSettled:false,opponentDamageBefore:null,
    opponentDamageAfter:null,opponentPrizesBefore:null,
    opponentPrizesAfter:null,unresolvedPromptTypes:[],
    errors:[],realStoreChanged:false,paperQualified:false
  };
  if(handIndex<0){result.status='target-state-not-present';return result;}
  const output=path.resolve(__dirname,
    '../../vendor/twinleaf/ptcg-server/output');
  const load=name=>require(path.join(output,name));
  const {deepClone}=deps.utils??load('utils');
  const {Store}=deps.StoreModule??load('game/store/store');
  const {AttackAction}=deps.gameActions??load('game/store/actions/game-actions');
  const {PlayCardAction,PlayerType,SlotType}=
    deps.playActions??load('game/store/actions/play-card-action');
  const {StateUtils}=deps.stateUtils??load('game/store/state-utils');
  const copy=()=>{const clone=new Store({onStateChange(){}});
    clone.state=deepClone(state);return clone;};
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
    const beforeStadium=StateUtils.getStadiumCard(clone.state)?.fullName??null;
    result.stadiumBefore=beforeStadium;
    result.opponentDamageBefore=opposing.active.damage;
    result.opponentPrizesBefore=opposing.prizes.cards.length;
    try{
      clone.dispatch(new PlayCardAction(ownerId,handIndex,{
        player:PlayerType.BOTTOM_PLAYER,slot:SlotType.BOARD,index:0
      }));
      result.stadiumNativeAccepted=true;
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
      !afterStadium.hand.cards.includes(initial.hand.cards[handIndex]);
    if(!result.stadiumPhysicalMove||!result.stadiumEffectiveInPlay){
      result.status='stadium-physical-custody-unverified';
      return result;
    }

    try{
      clone.dispatch(new AttackAction(ownerId,ATTACK));
      result.attackNativeAccepted=true;
    }catch(error){
      result.errors.push({phase:'attack',
        message:String(error?.message??error)});
      result.status='stadium-paid-attack-native-rejected';
      return result;
    }
    const finalOwner=clone.state.players.find(p=>p.id===ownerId);
    const finalOpponent=clone.state.players.find(p=>p.id!==ownerId);
    result.opponentDamageAfter=finalOpponent.active.damage;
    result.opponentPrizesAfter=finalOpponent.prizes.cards.length;
    result.ownerPrizesAfter=finalOwner.prizes.cards.length;
    result.activeEnergyPrintings=finalOwner.active.energies.cards
      .map(c=>c.fullName);
    result.unresolvedPromptTypes=clone.state.prompts
      .filter(p=>p.result===undefined).map(p=>p.constructor.name);
    result.attackSettled=result.unresolvedPromptTypes.length===0;
    result.status=result.attackSettled?'native-stadium-attack-settled':
      'native-attack-prompt-pending';
    return result;
  }finally{
    Math.random=previousRandom;
  }
}

module.exports={VERSION,TARGET_TURN,ACTIVE,STADIUM,ATTACK,
  ownerStadiumIndex,probeStadiumThenEnergyDrive};
