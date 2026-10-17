'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const {planAichi} = require('../evaluation/aichi-pilot.cjs');
const {runMatch, initializeCards} = require('./headless.cjs');
const {firstTurnState} = require('./meloetta-rank26-firstturn-source-window.cjs');
const {observeFirstTurn, summarizeTurnOrder} = require('./turn-order-evidence.cjs');

const SOURCE = Object.freeze({
  base:20261018,repeat:86,seed:49957955,attackerSeat:1,opponentRank:6
});

/** Read the actual engine's discoverable active Meloetta powers under live lock. */
function activePowerNames(store, state, player, EngineCheck) {
  const source=player.active.getPokemonCard();
  assert.equal(source?.fullName,'Meloetta ex SV11B');
  const check=new EngineCheck(player,source);
  store.reduceEffect(state,check);
  return check.powers.map(power=>power.name);
}

/**
 * Execute one actual source-hand Item on a replayed natural initial root.
 * No cards are created, moved, inserted, or replaced by the observer.
 * @param {string[]} attackerDeck Source rank-26 registered mapped prints.
 * @param {string[]} defenderDeck Source rank-6 registered mapped prints.
 * @param {number} seed Prior authenticated first-turn source seed.
 * @returns {object}
 */
function forceHeldCologne(attackerDeck,defenderDeck,seed) {
  const output=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
  const engine=name=>require(path.join(output,name));
  const {Store}=engine('game/store/store');
  const {GamePhase}=engine('game/store/state/state');
  const {CheckPokemonPowersEffect}=engine('game/store/effects/check-effects');
  const {PlayCardAction,PlayerType,SlotType}=engine('game/store/actions/play-card-action');
  const beforeDispatch=Store.prototype.dispatch;
  const sentinel={};
  let root=null;
  let observed=null;
  Store.prototype.dispatch=function sourceCologneDispatch(action,...args) {
    if(!root&&action.constructor.name==='AddPlayerAction') root=this;
    const value=beforeDispatch.call(this,action,...args);
    const state=this.state;
    if(this===root&&!observed&&state.players.length===2&&
       state.turn===1&&state.phase===GamePhase.PLAYER_TURN&&
       !state.prompts.some(prompt=>prompt.result===undefined)) {
      const order=summarizeTurnOrder(observeFirstTurn(state),state.logs);
      assert.equal(order.verifiedByDrawLog,true);
      assert.equal(order.firstTurnSlot,SOURCE.attackerSeat);
      const attacker=state.players[SOURCE.attackerSeat];
      const opponent=state.players[1-SOURCE.attackerSeat];
      assert.equal(attacker.active.getPokemonCard()?.fullName,'Meloetta ex SV11B');
      assert.equal(opponent.active.getPokemonCard()?.fullName,'Iron Thorns ex TWM');
      assert.equal(opponent.bench.filter(slot=>slot.getPokemonCard()).length,0);
      const originalHand=attacker.hand.cards.map(card=>card.fullName);
      const cologneIndex=attacker.hand.cards.findIndex(card=>
        card.fullName==='Canceling Cologne ASR');
      assert.ok(cologneIndex>=0,'Source root must hold printed Cologne');
      const beforeAbilities=activePowerNames(
        this,state,attacker,CheckPokemonPowersEffect);
      const item=attacker.hand.cards[cologneIndex];
      assert.equal(item.fullName,'Canceling Cologne ASR');
      beforeDispatch.call(this,new PlayCardAction(attacker.id,cologneIndex,{
        player:PlayerType.ANY,slot:SlotType.BOARD,index:0
      }));
      const afterAbilities=activePowerNames(
        this,this.state,attacker,CheckPokemonPowersEffect);
      observed={
        ...order,
        sourceSeed:seed,
        attackerSeat:SOURCE.attackerSeat,
        sourceHandBefore:originalHand,
        firstNormalTurnAction:'PlayCardAction:Canceling Cologne ASR',
        firstNormalTurnActionSource:'one held Item from authentic physical hand, experimentally selected',
        meloettaAbilitiesBefore:beforeAbilities,
        meloettaAbilitiesAfter:afterAbilities,
        activeAfter:attacker.active.getPokemonCard()?.fullName??null,
        opposingActiveAfter:opponent.active.getPokemonCard()?.fullName??null,
        cologneStillInHand:attacker.hand.cards.includes(item),
        cologneInDiscard:attacker.discard.cards.includes(item),
        ownPrizesRemaining:attacker.getPrizeLeft(),
        opponentPrizesRemaining:opponent.getPrizeLeft(),
        turnAfter:this.state.turn,
        effectsNotAttempted:'No attack, Koko Ability, movement, self-KO, draw route or opposing reply simulated',
        competitiveGameQualified:false
      };
      throw sentinel;
    }
    return value;
  };
  try {
    runMatch({
      deckA:defenderDeck,deckB:attackerDeck,seed,maxActions:120,
      strictPromptValidation:true,
      isolatePolicyRandomness:true,
      forestSealSearchCorrection:true,
      supporterDecisionCorrection:true,
      leleEntryAbilityLockCorrection:true,
      entryDrawLockCorrection:true
    });
  }catch(error){
    if(error!==sentinel&&error.cause!==sentinel) throw error;
  }finally{
    Store.prototype.dispatch=beforeDispatch;
  }
  assert.ok(observed,'Authentic root never yielded source Item action');
  return observed;
}

function run(){
  initializeCards();
  const plan=planAichi(26,{
    allowEquivalentBasicEnergies:true,allowJapanesePromoHooks:true
  });
  const attacker=plan.candidate;
  const opponent=plan.opponents.find(o=>o.rank===SOURCE.opponentRank);
  assert.equal(attacker.cards.length,60);
  assert.equal(opponent?.status,'ready');
  assert.equal(opponent.cards.length,60);
  const expected=firstTurnState(attacker.cards,opponent.cards,
    SOURCE.attackerSeat,SOURCE.seed);
  assert.equal(expected.verifiedByDrawLog,true);
  const played=forceHeldCologne(attacker.cards,opponent.cards,SOURCE.seed);
  assert.equal(played.firstTurnSlot,expected.firstTurnSlot);
  assert.deepEqual(played.sourceHandBefore,expected.attackerHand,
    'Experimental Item branch did not reach the exact same authenticated root');
  assert.equal(played.meloettaAbilitiesBefore.includes('Live Debut'),false,
    'Active Iron Thorns must suppress Meloetta printed Ability');
  assert.equal(played.meloettaAbilitiesAfter.includes('Live Debut'),true,
    'Playing held Cologne must restore Meloetta Ability');
  assert.equal(played.cologneStillInHand,false);
  assert.equal(played.cologneInDiscard,true);
  assert.equal(played.ownPrizesRemaining,6);
  assert.equal(played.opponentPrizesRemaining,6);
  return {
    schema:'aichi-rank26-source-firstturn-direct-cologne-action-v1',
    sourceRank:26,opponentRank:SOURCE.opponentRank,
    sourcePrintedDecks:[attacker.cards.length,opponent.cards.length],
    seedIdentity:SOURCE,engine:'twinleafgg/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    originalSourceRootMatches:true,
    actionSuccessfullyPlayedFromActualHand:true,
    abilityGateBeforeAfterVerified:true,
    sourceGameCompleted:false,
    competitiveGameQualified:false,
    played
  };
}
if(require.main===module)process.stdout.write(JSON.stringify(run(),null,2)+'\n');
module.exports={forceHeldCologne,run,SOURCE};
