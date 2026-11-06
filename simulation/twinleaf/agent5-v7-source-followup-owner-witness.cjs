'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const {publicAndOwnerSnapshot} =
  require('./agent5-paid-ghala-dce-owner-witness.cjs');

const VERSION='agent5-v7-source-owner-followup-hand-readonly-v1';
const VOLUNTARY=new Set([
  'PassTurnAction','PlayCardAction','AttackAction','RetreatAction',
  'UseAbilityAction','UseStadiumAction'
]);

/**
 * Passively observe actual original-source owner choices after an accepted
 * Volt Cyclone declaration in a frozen native match. This layer never calls a
 * player decision function, reads concealed opponent information, or creates
 * any game action. A declaration is not a certified settled attack: the
 * independent v7 archived attack/prompt settlement is the required join.
 *
 * @template T
 * @param {()=>T} execute Native match executor.
 * @param {{sourceSeat:0|1,trialId:string,Store?:Function}} deps
 * @returns {{result:T,audit:object}} Passive audit.
 */
function withSourceFollowupOwnerWitness(execute,deps) {
  assert.equal(typeof execute,'function');
  assert.ok(deps?.sourceSeat===0||deps?.sourceSeat===1);
  assert.equal(typeof deps.trialId,'string');
  const Store=deps.Store??require(path.resolve(__dirname,
    '../../vendor/twinleaf/ptcg-server/output/game/store/store')).Store;
  const before=Object.getOwnPropertyDescriptor(Store.prototype,'dispatch');
  assert.equal(typeof before?.value,'function');

  const audit={
    schema:VERSION,trialId:deps.trialId,sourceSeat:deps.sourceSeat,
    acceptedSourceVoltDeclarations:0,
    acceptedSourceVoluntaryAfterVolt:[],
    noNativeActionMutation:true,unopenedDeckRead:false,
    opponentConcealedZoneRead:false,
    attacksSettledIndependentlyVerified:false,
    competitiveGamesQualified:0
  };
  let live=null,lastVoltTurn=null;
  function dispatch(action,...args) {
    const kind=action?.constructor?.name??null;
    if(kind==='AddPlayerAction'&&!live)live=this;
    const state=this.state;
    const sourceGlobalTurn=state?.turn??null;
    const genuine=this===live;
    const source=genuine?state?.players?.[deps.sourceSeat]:null;
    const sourceTurn=Boolean(source&&
      state.activePlayer===deps.sourceSeat&&
      state.prompts?.every(p=>p.result!==undefined));
    const actor=action?.clientId??action?.id;
    const matchedActor=sourceTurn&&
      (actor===undefined||actor===source.id);
    const voluntary=matchedActor&&VOLUNTARY.has(kind);
    const take=voluntary&&lastVoltTurn!==null&&
      state.turn>lastVoltTurn&&
      audit.acceptedSourceVoluntaryAfterVolt.length<60;
    const pre=take?{
      globalTurn:state.turn,actionKind:kind,
      cardPlayed:kind==='PlayCardAction'?
        source.hand.cards[action.handIndex]?.fullName??null:null,
      attackName:kind==='AttackAction'?action.name??null:null,
      sourceOwnerView:publicAndOwnerSnapshot(source),
      opponentPublic:{
        active:{
          pokemon:state.players[1-deps.sourceSeat].active
            .getPokemonCard()?.fullName??null,
          damage:state.players[1-deps.sourceSeat].active.damage,
          energies:state.players[1-deps.sourceSeat].active.energies.cards
            .map(c=>c.fullName)
        },
        stadium:state.players[1-deps.sourceSeat].stadium.cards
          .map(c=>c.fullName)
      },
      mostRecentVoltDeclarationTurn:lastVoltTurn
    }:null;
    const result=before.value.call(this,action,...args);
    if(genuine&&voluntary&&kind==='AttackAction'&&
       action.name==='Volt Cyclone'){
      lastVoltTurn=sourceGlobalTurn;
      audit.acceptedSourceVoltDeclarations++;
    }
    if(pre){
      const after=this.state.players[deps.sourceSeat];
      audit.acceptedSourceVoluntaryAfterVolt.push({
        ...pre,nativeStoreReturned:true,
        sourceOwnerAfter:publicAndOwnerSnapshot(after)
      });
    }
    return result;
  }
  Object.defineProperty(Store.prototype,'dispatch',{...before,value:dispatch});
  try {
    return {result:execute(),audit};
  } catch(error) {
    if(error&&typeof error==='object')
      error.agent5V7SourceFollowupAudit={...audit};
    throw error;
  } finally {
    assert.strictEqual(Store.prototype.dispatch,dispatch);
    Object.defineProperty(Store.prototype,'dispatch',before);
  }
}
module.exports={VERSION,withSourceFollowupOwnerWitness};
