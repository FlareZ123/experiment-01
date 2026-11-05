'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');

const VERSION='agent7-native-owner-shadowmist-afterpass-lock-audit-v1';
const KNOWN_RANK6_SPECIAL_ENERGIES=Object.freeze([
  'Speed Lightning Energy','Capture Energy','Spiky Energy',
  'Double Colorless Energy'
]);
const KNOWN_RANK6_STADIUMS=Object.freeze([
  'Thunder Mountain','Wondrous Labyrinth','Tropical Beach',
  "Player's Ceremony"
]);
const RESPONSE_TRAINERS=Object.freeze([
  'Crushing Hammer','Guzma','Plumeria',
  "Trainers' Mail",'Camping Gear'
]);

/** Count exact printed names, allowing only the trailing set code. */
function countKnown(cards,names){
  return Object.fromEntries(names.map(name=>[
    name,cards.filter(card=>card.startsWith(name+' ')).length
  ]));
}

/**
 * Redact an authenticated acting owner's hand into counts. The actual hand
 * identities are never placed in public results or sent to the other player.
 * @param {object} player Native current acting player.
 * @param {number} turn Genuine global turn.
 * @param {0|1} seat Physical current actor.
 * @returns {object}
 */
function ownerSnapshot(player,turn,seat,store=null,state=null){
  const hand=player.hand.cards.map(card=>card.fullName);
  const heldEnergy=countKnown(hand,KNOWN_RANK6_SPECIAL_ENERGIES);
  const heldStadium=countKnown(hand,KNOWN_RANK6_STADIUMS);
  const heldResponses=countKnown(hand,RESPONSE_TRAINERS);
  const opposite=state?.players?.[1-seat];
  const publicOpposingEnergyCards=opposite?
    [opposite.active,...opposite.bench]
      .reduce((n,slot)=>n+(slot?.energies?.cards?.length??0),0):null;
  const nativeCrushingHammerCanPlay=store&&state&&
    publicOpposingEnergyCards>0?
    player.hand.cards.some(card=>
      card.fullName.startsWith('Crushing Hammer ') &&
      card.canPlay(store,state,player)===true):null;
  return {
    turn,seat,handCount:hand.length,
    knownRank6SpecialEnergyHeld:Object.values(heldEnergy)
      .reduce((a,b)=>a+b,0),
    knownRank6StadiumHeld:Object.values(heldStadium)
      .reduce((a,b)=>a+b,0),
    knownRank6TrainerResponsesHeld:Object.values(heldResponses)
      .reduce((a,b)=>a+b,0),
    knownRank6CrushingHammerHeld:heldResponses['Crushing Hammer'],
    opponentPublicEnergyCardCount:publicOpposingEnergyCards,
    nativeCrushingHammerPreliminaryCanPlay:nativeCrushingHammerCanPlay,
    nativeSpecialEnergyPlayLocked:
      player.cannotPlaySpecialEnergyCards===true,
    nativeStadiumPlayLocked:player.cannotPlayStadiumCards===true,
    nativeItemPlayLocked:player.cannotPlayItemCards===true,
    nativeSupporterPlayLocked:player.cannotPlaySupporterCards===true,
    normalEnergyAttachmentUsed:player.energyPlayedTurn===turn,
    exactHeldPrintingsArchived:false,
    sourceOnlyHandInformationNeverFedToOpposingActor:true
  };
}

/**
 * Observe only actual Store-dispatched Pass actions at their actor-owned
 * dispatch boundary. This avoids speculative bot-decode decisions. Delegates
 * the exact original Store operation and does not change gameplay.
 * @template T
 * @param {()=>T} play Existing synchronous native development experiment.
 * @param {{Store?:Function,GamePhase?:object}} [deps] Pure test seam.
 * @returns {{result:T,audit:object}}
 */
function withShadowMistOwnerPassWitness(play,deps={}){
  assert.equal(typeof play,'function');
  const output=path.resolve(__dirname,
    '../../vendor/twinleaf/ptcg-server/output');
  const load=name=>require(path.join(output,name));
  const Store=deps.Store??load('game/store/store').Store;
  const GamePhase=deps.GamePhase??
    load('game/store/state/state').GamePhase;
  const original=Object.getOwnPropertyDescriptor(Store.prototype,'dispatch');
  assert.equal(typeof original?.value,'function');
  const games=[];
  let live=null,liveGame=null;
  function dispatch(action,...rest){
    const state=this.state;
    const seat=state?.activePlayer;
    const owner=state?.players?.[seat];
    const capture=this===live &&
      action?.constructor?.name==='PassTurnAction' &&
      (seat===0||seat===1) &&
      state.players?.length===2 &&
      state.phase===GamePhase.PLAYER_TURN &&
      owner?.id!==undefined &&
      !(state.prompts??[]).some(prompt=>prompt.result===undefined);
    const before=capture?ownerSnapshot(owner,state.turn,seat,this,state):null;
    const result=original.value.call(this,action,...rest);
    if(action?.constructor?.name==='AddPlayerAction' &&
       this.state.players?.length===1 &&
       this.state.players[0].id===101 && this!==live){
      live=this;
      liveGame={ordinal:games.length+1,passes:[]};
      games.push(liveGame);
    }
    if(before)liveGame.passes.push(before);
    return result;
  }
  Object.defineProperty(Store.prototype,'dispatch',
    {...original,value:dispatch});
  try{
    return {result:play(),audit:{
      version:VERSION,physicalStores:games.length,games,
      modifiedGameplayDecisions:false,competitiveQualifiedGames:0
    }};
  }finally{
    Object.defineProperty(Store.prototype,'dispatch',original);
  }
}

/**
 * Join each accepted candidate Shadow Mist root to the *first* voluntary
 * action next opposing turn, then to an actual actor-owned Pass snapshot.
 * No observed Pass is treated as strategically forced or as a game outcome.
 * @param {object[]} rows Native original arms in execution order.
 * @param {object} audit Read-only genuine Store Pass observations.
 * @returns {object}
 */
function summarizeShadowMistPasses(rows,audit){
  assert.ok(Array.isArray(rows)&&Array.isArray(audit?.games));
  assert.equal(rows.length,audit.games.length,
    'Native Store-to-trial coupling must be one-to-one');
  const arms=[];
  for(const [index,row] of rows.entries()){
    const id=row.trial?.id;
    assert.equal(typeof id,'string');
    const sourceSeat=row.sourceSeat??
      row.nativeAbortProvenance?.sourceSeat;
    assert.ok(sourceSeat===0||sourceSeat===1);
    const roots=row.rootActionLedger??
      row.nativeAbortEvidence?.rootActionLedger??[];
    const actual=roots.map((root,ordinal)=>{
      assert.equal(root.actionOrdinal,ordinal,
        'Only a complete native public root ledger can be joined');
      return root;
    });
    const sourcePasses=actual.filter(root=>
      root.playerSlot===sourceSeat && root.action==='PassTurnAction');
    const observed=audit.games[index].passes.filter(pass=>
      pass.seat===sourceSeat);
    for(const root of sourcePasses){
      assert.equal(observed.filter(p=>p.turn===root.turnBefore).length,1,
        'Each accepted source Pass needs exactly one actual owner snapshot');
    }
    const windows=[];
    for(const attack of actual){
      if(attack.playerSlot===sourceSeat ||
         attack.action!=='AttackAction' ||
         attack.attack!=='Shadow Mist')continue;
      const response=actual.find(root=>
        root.playerSlot===sourceSeat &&
        root.turnBefore===attack.turnBefore+1 &&
        root.action!=='ResolvePromptAction');
      if(!response)continue;
      const pass=response.action==='PassTurnAction';
      const snapshot=pass?observed.find(p=>
        p.turn===response.turnBefore):null;
      if(pass)assert.ok(snapshot);
      windows.push({
        candidateAttackOrdinal:attack.actionOrdinal,
        attackTurn:attack.turnBefore,
        sourceFirstReplyOrdinal:response.actionOrdinal,
        sourceReplyTurn:response.turnBefore,
        sourceFirstReplyAction:response.action,
        sourcePassLockWitness:snapshot??null,
        forcedPassCertified:false
      });
    }
    arms.push({
      id,sourceSeat,rootCount:actual.length,
      nativeDisposition:row.status??'unqualified',
      shadowMistReplyWindows:windows,
      shadowMistNextTurnSourcePasses:windows.filter(w=>
        w.sourceFirstReplyAction==='PassTurnAction').length,
      acceptedSourcePasses:sourcePasses.length,
      sourcePassOwnerSnapshots:observed.length
    });
  }
  return {version:VERSION,physicalStores:audit.physicalStores,
    trialCount:rows.length,arms,competitivelyQualifiedGames:0,
    ownerLockFlagIsNativeNotIndependentPaperProof:true,
    cannotCertifyOpponentOptimalPlay:true,
    cannotCertifyEffectDamageOrGameResult:true};
}

module.exports={VERSION,KNOWN_RANK6_SPECIAL_ENERGIES,
  KNOWN_RANK6_STADIUMS,RESPONSE_TRAINERS,ownerSnapshot,
  withShadowMistOwnerPassWitness,summarizeShadowMistPasses};
