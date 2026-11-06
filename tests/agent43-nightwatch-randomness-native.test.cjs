'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { initializeCards } = require('../simulation/twinleaf/headless.cjs');

const BASE = path.resolve(__dirname, '../vendor/twinleaf/ptcg-server/output');
/** @param {string} name */
const native = name => require(path.join(BASE, name));

/**
 * Isolate pinned Night Watch with three distinguishable opponent hand cards.
 * Staged Store position, never a naturally dealt or competitively qualified game.
 * @param {0|1} attackerSeat
 */
function stage(attackerSeat, copycat = false) {
  const { Store } = native('game/store/store');
  const { State, GamePhase } = native('game/store/state/state');
  const { Player } = native('game/store/state/player');
  const { GameSettings } = native('game/core/game-settings');
  const { Format } = native('game/store/card/card-types');
  const { CardList } = native('game/store/state/card-list');
  const manager = initializeCards();
  let nextId = 430000 + attackerSeat * 100 + Number(copycat) * 1000;
  /** @param {string} fullName */
  function get(fullName) {
    const card = manager.getCardByName(fullName);
    assert.ok(card, 'Unregistered pinned card: ' + fullName);
    card.id = nextId++;
    return card;
  }
  const attacker = new Player();
  const defender = new Player();
  attacker.id = attackerSeat === 0 ? 101 : 202;
  defender.id = attackerSeat === 0 ? 202 : 101;
  const nightWatchCard = get('Trevenant & Dusknoir-GX SMP');
  attacker.active.cards.push(copycat ? get('Mimikyu GRI') : nightWatchCard);
  defender.active.cards.push(copycat ? nightWatchCard : get('Rotom V LOR'));
  for (let i = 0; i < (copycat ? 2 : 3); i++) {
    const energy = get('Psychic Energy SVE');
    attacker.active.cards.push(energy);
    attacker.active.energies.cards.push(energy);
  }
  const opponentHand = [
    get('Psychic Energy SVE'),
    get('Water Energy SVE'),
    get('Grass Energy SVE')
  ];
  defender.hand.cards.push(...opponentHand);
  for (const player of [attacker, defender]) {
    for (let i = 0; i < 8; i++) player.deck.cards.push(get('Psychic Energy SVE'));
    for (let i = 0; i < 6; i++) {
      const slot = new CardList();
      slot.cards.push(get('Psychic Energy SVE'));
      player.prizes.push(slot);
    }
  }
  const settings = new GameSettings();
  settings.format = Format.EXPANDED;
  const state = new State();
  state.gameSettings = settings;
  state.rules = settings.rules;
  state.turn = 4;
  state.phase = GamePhase.PLAYER_TURN;
  state.activePlayer = attackerSeat;
  state.players = attackerSeat === 0 ? [attacker, defender] : [defender, attacker];
  if (copycat) state.playerLastAttack = {
    [defender.id]: { attack: nightWatchCard.attacks[0], sourceCard: nightWatchCard }
  };
  const store = new Store({ onStateChange() {} });
  store.state = state;
  return { store, state, attacker, defender, opponentHand };
}

/**
 * Distinct attacker-driven selections from otherwise identical Store states.
 * @param {0|1} attackerSeat
 * @param {[number,number]} indices
 */
function run(attackerSeat, indices) {
  const { AttackAction } = native('game/store/actions/game-actions');
  const { ResolvePromptAction } = native('game/store/actions/resolve-prompt-action');
  const f = stage(attackerSeat);
  f.store.dispatch(new AttackAction(f.attacker.id, 'Night Watch'));
  const prompt = f.state.prompts.find(p => p.result === undefined);
  assert.equal(prompt?.constructor.name, 'ChooseCardsPrompt');
  assert.equal(prompt.playerId, f.attacker.id,
    'Native choice belongs to attacker instead of internal random sampler');
  assert.strictEqual(prompt.cards, f.defender.hand);
  assert.equal(prompt.options.min, 2);
  assert.equal(prompt.options.max, 2);
  assert.equal(prompt.options.isSecret, true);
  assert.equal(prompt.validate([f.opponentHand[0], f.opponentHand[1]], f.state), true);
  assert.equal(prompt.validate([f.opponentHand[0], f.opponentHand[2]], f.state), true);
  const chosen = indices.map(i => f.opponentHand[i]);
  f.store.dispatch(new ResolvePromptAction(prompt.id, chosen));
  const unselected = f.opponentHand.filter(c => !chosen.includes(c));
  assert.deepEqual(f.defender.hand.cards, unselected);
  assert.ok(chosen.every(c => f.defender.deck.cards.includes(c)));
  return {
    attackerSeat, choices: indices,
    promptActor: prompt.playerId, attackOwner: f.attacker.id,
    handBefore: f.opponentHand.map(c => c.name),
    handAfter: f.defender.hand.cards.map(c => c.name),
    chosenToDeck: chosen.map(c => c.name),
    pendingAfterMove: f.state.prompts.filter(p => p.result === undefined)
      .map(p => p.constructor.name),
    qualification: 'staged native effect; zero qualified games'
  };
}

for (const attackerSeat of [0, 1]) {
  test('Pinned Night Watch permits distinct attacker-selected hand pairs on seat ' + attackerSeat, () => {
    const a = run(attackerSeat, [0, 1]);
    const b = run(attackerSeat, [0, 2]);
    assert.notDeepEqual(a.handAfter, b.handAfter);
    assert.equal(a.promptActor, a.attackOwner);
    assert.equal(b.promptActor, b.attackOwner);
    console.log('AGENT43_NIGHTWATCH_NATIVE', JSON.stringify({
      attackerSeat, first: a, second: b,
      nativeChoiceDiscretionDemonstrated: true,
      paperRandomSelectionDemonstrated: false,
      competitivelyQualifiedGames: 0
    }));
  });
}


const {
  sampleDistinctHandPositions,
  isDirectNightWatchHandPrompt,
  withPaperRandomDirectNightWatch
}=require('../simulation/twinleaf/agent43-nightwatch-paper-random-resolver.cjs');

test('uniform-index sampler uses physical positions without card scores',()=>{
  assert.deepEqual(sampleDistinctHandPositions(3,2,()=>0),[0,1]);
  const values=[0.999999,0];
  assert.deepEqual(sampleDistinctHandPositions(3,2,()=>values.shift()),[2,0]);
});

for(const attackerSeat of [0,1]){
  test('separate seeded Night Watch diagnostic resolves owner prompt and restores bot seat '+attackerSeat,()=>{
    const {SimpleTacticsAi}=native('simple-bot/simple-tactics-ai');
    const defs=native('simple-bot/simple-bot-definitions');
    const {AttackAction}=native('game/store/actions/game-actions');
    const {ResolvePromptAction}=native('game/store/actions/resolve-prompt-action');
    const f=stage(attackerSeat);
    const bot=new SimpleTacticsAi({id:f.attacker.id},{
      tactics:defs.allSimpleTactics,
      promptResolvers:defs.allPromptResolvers,
      scores:defs.defaultStateScores,
      arbiter:defs.defaultArbiterOptions
    },null);
    const before=SimpleTacticsAi.prototype.resolvePrompt;
    const wrapped=withPaperRandomDirectNightWatch(()=>{
      f.store.dispatch(new AttackAction(f.attacker.id,'Night Watch'));
      const pending=f.state.prompts.find(p=>p.result===undefined);
      assert.equal(isDirectNightWatchHandPrompt(f.state,f.attacker,pending),true);
      const action=bot.resolvePrompt(f.attacker,f.state,pending);
      assert.ok(action instanceof ResolvePromptAction);
      assert.equal(action.result.length,2);
      assert.equal(pending.validate(action.result,f.state),true);
      f.store.dispatch(action);
      return {
        selected:action.result,
        remaining:f.defender.hand.cards.slice(),
        otherPrompts:f.state.prompts.filter(p=>p.result===undefined)
          .map(p=>p.constructor.name)
      };
    },{seed:20261106});
    assert.strictEqual(SimpleTacticsAi.prototype.resolvePrompt,before);
    assert.equal(wrapped.audit.restored,true);
    assert.equal(wrapped.audit.samples.length,1);
    const sample=wrapped.audit.samples[0];
    assert.equal(sample.seat,attackerSeat);
    assert.equal(sample.physicalHandSize,3);
    assert.equal(sample.count,2);
    assert.equal(sample.ownerHiddenCardNamesReadForDecision,false);
    assert.deepEqual(wrapped.result.selected,
      sample.sampledIndices.map(i=>f.opponentHand[i]));
    assert.equal(wrapped.result.remaining.length,1);
    assert.deepEqual(wrapped.result.otherPrompts,
      ['ShowCardsPrompt','ShuffleDeckPrompt']);
    assert.equal(wrapped.audit.qualifiedGames,0);
    console.log('AGENT43_NIGHTWATCH_RANDOM_NATIVE',JSON.stringify({
      attackerSeat,audit:wrapped.audit,
      remaining:wrapped.result.remaining.map(c=>c.name)
    }));
  });
}


const {withSourceMarkedPaperRandomNightWatch}=
  require('../simulation/twinleaf/agent43-nightwatch-source-marked-random.cjs');

for(const attackerSeat of [0,1]){
  for(const copycat of [false,true]){
    test('source-marked original Night Watch '+(copycat?'copied':'direct')+
      ' native responder seat '+attackerSeat,()=>{
      const {clearCopyAttackSessionsForTests}=native(
        'game/store/prefabs/copy-attack-delegation');
      const {SimpleTacticsAi}=native('simple-bot/simple-tactics-ai');
      const {AttackAction}=native('game/store/actions/game-actions');
      const {ResolvePromptAction}=native('game/store/actions/resolve-prompt-action');
      clearCopyAttackSessionsForTests();
      const f=stage(attackerSeat,copycat);
      const bot=new SimpleTacticsAi({id:f.attacker.id},{
        tactics:[],promptResolvers:[]
      },null);
      const before=SimpleTacticsAi.prototype.resolvePrompt;
      try{
        const result=withSourceMarkedPaperRandomNightWatch(()=>{
          f.store.dispatch(new AttackAction(f.attacker.id,
            copycat?'Copycat':'Night Watch'));
          const prompt=f.state.prompts.find(p=>p.result===undefined&&
            p.constructor.name==='ChooseCardsPrompt');
          assert.ok(prompt,'original source must create attacker-owned hand prompt');
          assert.equal(prompt.playerId,f.attacker.id);
          assert.strictEqual(prompt.cards,f.defender.hand);
          const action=bot.resolvePrompt(f.attacker,f.state,prompt);
          assert.ok(action instanceof ResolvePromptAction);
          assert.equal(action.result.length,2);
          assert.equal(prompt.validate(action.result,f.state),true);
          f.store.dispatch(action);
          return {chosen:action.result,
            remaining:f.defender.hand.cards.slice()};
        },{seed:20261106+attackerSeat+Number(copycat)*10});
        assert.equal(result.audit.markedSourcePrompts,1);
        assert.equal(result.audit.samples.length,1);
        assert.equal(result.audit.prototypeRestored,true);
        const sample=result.audit.samples[0];
        assert.equal(sample.sourceBoundToCopycat,copycat);
        assert.equal(sample.activeUser,
          copycat?'Mimikyu GRI':'Trevenant & Dusknoir-GX SMP');
        assert.deepEqual(result.result.chosen,
          sample.sampledPhysicalIndices.map(i=>f.opponentHand[i]));
        assert.equal(result.result.remaining.length,1);
        assert.strictEqual(SimpleTacticsAi.prototype.resolvePrompt,before);
        console.log('AGENT43_NIGHTWATCH_SOURCE_NATIVE',JSON.stringify({
          attackerSeat,copycat,audit:result.audit,
          remaining:result.result.remaining.map(c=>c.name)
        }));
      }finally{
        clearCopyAttackSessionsForTests();
      }
    });
  }
}
