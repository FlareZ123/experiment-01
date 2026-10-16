'use strict';
const assert = require('node:assert/strict');
const path = require('node:path');
const {planAichi} = require('../evaluation/aichi-pilot.cjs');
const {runMatch} = require('./headless.cjs');
const {withSourceOpeningProbe} = require('./rank6-seed-opening-probe.cjs');

const root = path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
/** @param {string} name */
const engine = name => require(path.join(root,name));
const {SimpleTacticsAi} = engine('simple-bot/simple-tactics-ai');
const {Store} = engine('game/store/store');
const {GamePhase} = engine('game/store/state/state');
const {PlayCardAction,PlayerType,SlotType} =
  engine('game/store/actions/play-card-action');
const {ResolvePromptAction} =
  engine('game/store/actions/resolve-prompt-action');
const {AttackAction} = engine('game/store/actions/game-actions');

/**
 * Interpose a predetermined, hand-visible turn-two alternative for the source
 * Iron Thorns seat. Selection during G&H's search may inspect that prompted
 * deck, but the policy never inspects face-down Prizes or unsearched deck.
 * Restores the original bot method before returning.
 * @template T
 * @param {()=>T} fn
 * @returns {{result:T,events:object[],completed:boolean}}
 */
function withGuzmaHalaSourceFork(fn, discardNames = ['Guzma', 'Tropical Beach']) {
  assert.equal(discardNames.length, 2, 'G&H optional search requires two discard cards');
  assert.notEqual(discardNames[0], discardNames[1]);
  const original = SimpleTacticsAi.prototype.decodeNextAction;
  const events = [];
  let step = 0;
  /** @param {object} state @param {object} p @param {object|null} prompt @param {string} description @param {object} action */
  function select(state,p,prompt,description,action) {
    events.push({step:++step,turn:state.turn,action:description,
      prompt:prompt?.constructor.name || null});
    return action;
  }
  /** @param {object} player @param {string} cardName @param {object} target */
  function play(player,cardName,target) {
    const at = player.hand.cards.findIndex(c=>c.name===cardName);
    assert.ok(at>=0,'Missing desired source-hand card: '+cardName);
    return new PlayCardAction(player.id,at,target);
  }
  SimpleTacticsAi.prototype.decodeNextAction = function forcedRank6Line(state) {
    const p = state.players.find(player=>player.id===this.client.id);
    if (!p || p.id!==202) return original.call(this,state);
    const prompt = state.prompts.find(x=>x.playerId===p.id && x.result===undefined);
    if (step===0 && state.turn===2 &&
      state.phase===GamePhase.PLAYER_TURN && state.activePlayer===1 &&
      !state.prompts.some(x=>x.result===undefined)) {
      assert.equal(p.active.getPokemonCard()?.name,'Iron Thorns ex');
      const target={player:PlayerType.ANY,slot:SlotType.BOARD,index:0};
      return select(state,p,null,'Play Guzma & Hala',
        play(p,'Guzma & Hala',target));
    }
    if (step===1) {
      assert.equal(prompt?.constructor.name,'SelectOptionPrompt');
      return select(state,p,prompt,'Choose discard-to-search mode',
        new ResolvePromptAction(prompt.id,1));
    }
    if (step===2) {
      assert.equal(prompt?.constructor.name,'ChooseCardsPrompt');
      const cards=discardNames.map(name=>{
        const card=p.hand.cards.find(item=>item.name===name);
        assert.ok(card,'Unavailable declared discard '+name);
        return card;
      });
      assert.equal(prompt.validate(cards,state),true);
      return select(state,p,prompt,'Discard ' + discardNames.join(' + '),
        new ResolvePromptAction(prompt.id,cards));
    }
    if (step===3) {
      assert.equal(prompt?.constructor.name,'ChooseCardsPrompt');
      const cards=['Double Colorless Energy','Wondrous Labyrinth Prism Star']
        .map(name=>{
          const card=p.deck.cards.find(item=>item.name===name);
          assert.ok(card,'Unavailable prompted search card '+name);
          return card;
        });
      assert.equal(prompt.validate(cards,state),true);
      return select(state,p,prompt,'Fetch DCE and Wondrous Labyrinth',
        new ResolvePromptAction(prompt.id,cards));
    }
    if (step>=4 && step<=5 && prompt) {
      if (prompt.constructor.name==='ShowCardsPrompt') {
        events.push({step,turn:state.turn,action:'Acknowledge shown cards'});
        return new ResolvePromptAction(prompt.id,true);
      }
      if (prompt.constructor.name==='WaitPrompt') {
        events.push({step,turn:state.turn,action:'Resolve Store wait'});
        return new ResolvePromptAction(prompt.id,null);
      }
    }
    if (step===4 && !prompt && state.phase===GamePhase.PLAYER_TURN) {
      return select(state,p,null,'Play Thunder Mountain',
        play(p,'Thunder Mountain Prism Star',
          {player:PlayerType.ANY,slot:SlotType.BOARD,index:0}));
    }
    if (step===5 && !prompt && state.phase===GamePhase.PLAYER_TURN) {
      return select(state,p,null,'Attach searched DCE',
        play(p,'Double Colorless Energy',
          {player:PlayerType.BOTTOM_PLAYER,slot:SlotType.ACTIVE,index:0}));
    }
    if (step===6 && !prompt && state.phase===GamePhase.PLAYER_TURN) {
      assert.ok(p.active.energies.cards.some(c=>c.name==='Double Colorless Energy'));
      assert.ok(p.stadium.cards.some(c=>c.name==='Thunder Mountain Prism Star'));
      assert.ok(p.bench.every(slot=>slot.getPokemonCard()===undefined));
      return select(state,p,null,'Attack Volt Cyclone',
        new AttackAction(p.id,'Volt Cyclone'));
    }
    return original.call(this,state);
  };
  try { return {result:fn(),events,completed:step===7}; }
  finally { SimpleTacticsAi.prototype.decodeNextAction = original; }
}

/**
 * Observe attacker and defending Active before and after the real AttackAction
 * and its deferred prompts. The Store is never mutated by this probe.
 * @template T
 * @param {()=>T} fn
 * @returns {{result:T,attack:object|null}}
 */
function withDamageObserver(fn) {
  const original=Store.prototype.dispatch;
  let attack=null;
  Store.prototype.dispatch = function observeAttack(action,...rest) {
    if (action instanceof AttackAction && action.name==='Volt Cyclone' &&
      this.state.turn===2 && this.state.activePlayer===1) {
      attack={
        announced:action.name,
        defender:this.state.players[0].active.getPokemonCard()?.fullName,
        damageBefore:this.state.players[0].active.damage,
        damageAfter:null
      };
    }
    const result=original.call(this,action,...rest);
    if (attack && attack.damageAfter===null &&
      this.state.players[0].active.damage>attack.damageBefore) {
      attack.damageAfter=this.state.players[0].active.damage;
      const actor=this.state.players[1];
      attack.handAtDamage=actor.hand.cards.map(c=>c.fullName);
      attack.discardAtDamage=actor.discard.cards.map(c=>c.fullName);
    }
    return result;
  };
  try { return {result:fn(),attack}; }
  finally { Store.prototype.dispatch = original; }
}

function main() {
  const plan=planAichi(1,{
    allowEquivalentBasicEnergies:true,allowJapanesePromoHooks:true
  });
  const opponent=plan.opponents.find(x=>x.rank===6);
  assert.ok(plan.candidate.cards && opponent?.cards);
  const request={
    deckA:plan.candidate.cards,deckB:opponent.cards,seed:20367160,
    maxActions:125,strictPromptValidation:true,
    forestSealSearchCorrection:true,doubleDragonRecovery:true,
    supporterDecisionCorrection:true,isolatePolicyRandomness:true,
    captureDecisionTrace:true,leleEntryAbilityLockCorrection:true,
    radiantGateLockCorrection:true,entryDrawLockCorrection:true
  };
  const baseline=withSourceOpeningProbe(()=>runMatch(request));
  const branched=withSourceOpeningProbe(()=>withGuzmaHalaSourceFork(()=>
    withDamageObserver(()=>runMatch(request))));
  const fork=branched.out.result.result;
  const {events,completed}=branched.out;
  const damage=branched.out.result.attack;
  assert.equal(baseline.out.firstTurnSlot,0);
  assert.equal(fork.firstTurnSlot,0);
  assert.deepEqual(branched.observed.hand,baseline.observed.hand);
  assert.deepEqual(branched.observed.prizes,baseline.observed.prizes);
  assert.deepEqual(branched.observed.doubleColorless,baseline.observed.doubleColorless);
  assert.equal(baseline.observed.doubleColorless.deck.length,1);
  assert.equal(baseline.observed.doubleColorless.prizes.length,0);
  assert.equal(completed,true,'The branch failed to announce Volt Cyclone');
  assert.equal(damage?.damageBefore,0);
  assert.equal(damage?.damageAfter,140,
    'Actual source-dealt defender must take 140 from the first turn-two attack');
  console.log(JSON.stringify({
    evidence:'Physical source-printed fixed-seed twin-run counterfactual',
    seed:20367160,engine:fork.engine,
    sourceHandMatchedBeforeBothBranches:true,
    sourcePrizesMatchedBeforeBothBranches:true,
    originalProposedCard:baseline.observed.proposedCard,
    alternativeProposedCard:branched.observed.proposedCard,
    dceOriginallyUnprizedAndInDeck:true,
    originalPrizes:baseline.observed.prizes,
    actions:events,defenderDamage:damage,
    controls:{sourceDeckHashes:fork.deckHashes,
      trueFirstTurnSlot:fork.firstTurnSlot,policy:fork.policy,
      initialHand:baseline.observed.hand,
      baselineActualFirstAction:baseline.observed.proposedAction},
    caveat:'This is a deliberately overridden single decision trajectory. Bot strength, future-game winner and valid clone semantics are not inferred. The override never reads face-down prizes.'
  },null,2));
}

if(require.main===module) main();
module.exports={withGuzmaHalaSourceFork,withDamageObserver,main};
