'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');
const path = require('node:path');
const {initializeCards} = require('../simulation/twinleaf/headless.cjs');
const {
  isCopycatBurrowSituation,
  withCopycatBurrowPolicy
} = require('../simulation/twinleaf/mimikyu-burrow-copycat-policy.cjs');

const output = path.resolve(__dirname, '../vendor/twinleaf/ptcg-server/output');
/** @param {string} name */
const load = name => require(path.join(output, name));

function fixture() {
  const manager = initializeCards();
  const mimikyu = manager.getCardByName('Mimikyu GRI');
  const bunnelby = manager.getCardByName('Bunnelby PRC');
  assert.ok(mimikyu);
  assert.ok(bunnelby);
  const burrow = bunnelby.attacks.find(attack => attack.name === 'Burrow');
  assert.ok(burrow);
  const {Store} = load('game/store/store');
  const {Player} = load('game/store/state/player');
  const {GamePhase} = load('game/store/state/state');
  const state = new Store({onStateChange() {}}).state;
  const owner = new Player();
  owner.id = 101;
  owner.active.cards.push(mimikyu);
  const opponent = new Player();
  opponent.id = 202;
  opponent.active.cards.push(bunnelby);
  state.players = [owner, opponent];
  state.activePlayer = 0;
  state.phase = GamePhase.PLAYER_TURN;
  state.playerLastAttack[opponent.id] = {attack:burrow,sourceCard:bunnelby};
  return {state,owner,opponent,mimikyu,bunnelby,burrow};
}

test('public-state predicate accepts only Mimikyu GRI after Bunnelby non-GX Burrow', () => {
  const f = fixture();
  assert.equal(isCopycatBurrowSituation(f.state,f.owner),true);
  f.state.playerLastAttack[f.opponent.id].attack.gxAttack = true;
  assert.equal(isCopycatBurrowSituation(f.state,f.owner),false);
  f.state.playerLastAttack[f.opponent.id].attack.gxAttack = false;
  f.state.playerLastAttack[f.opponent.id].attack.name = 'Gnaw';
  assert.equal(isCopycatBurrowSituation(f.state,f.owner),false);
  f.state.playerLastAttack[f.opponent.id].attack = f.burrow;
  f.owner.active.cards[0] = f.bunnelby;
  assert.equal(isCopycatBurrowSituation(f.state,f.owner),false);
  f.owner.active.cards[0] = f.mimikyu;
  f.state.playerLastAttack[f.opponent.id] = undefined;
  assert.equal(isCopycatBurrowSituation(f.state,f.owner),false);
});

test('tactic inserts before AttackTactic, is idempotent and returns Copycat action', () => {
  const f = fixture();
  const definitions = load('simple-bot/simple-bot-definitions');
  const original = {
    tactics:definitions.allSimpleTactics,
    promptResolvers:definitions.allPromptResolvers,
    scores:definitions.defaultStateScores,
    arbiter:{}
  };
  const modified = withCopycatBurrowPolicy(original);
  assert.notEqual(modified,original);
  assert.equal(withCopycatBurrowPolicy(modified),modified);
  assert.equal(original.tactics.some(t=>t.name==='CopycatBurrowTactic'),false);
  assert.equal(modified.tactics.filter(t=>t.name==='CopycatBurrowTactic').length,1);
  assert.ok(modified.tactics.findIndex(t=>t.name==='CopycatBurrowTactic') <
    modified.tactics.findIndex(t=>t.name==='AttackTactic'));
  const Type = modified.tactics.find(t=>t.name==='CopycatBurrowTactic');
  const tactic = new Type(modified);
  const {AttackAction} = load('game/store/actions/game-actions');
  const action = tactic.useTactic(f.state,f.owner);
  assert.ok(action instanceof AttackAction);
  assert.equal(action.name,'Copycat');
  assert.equal(action.clientId,f.owner.id);
});
