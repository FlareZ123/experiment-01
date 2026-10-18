'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const {initializeCards} = require('./headless.cjs');

const pinned = 'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05';
const root = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');
/** @param {string} name */
const load = name => require(path.join(root, name));

/**
 * A deliberately staged Store action experiment. It determines whether a
 * copied GX attack can be executed through the pinned simulator's POWER action
 * channel without an ordinary AttackAction, and whether an ordinary attack
 * works for the source Pokemon. This is not a source-dealt game.
 *
 * @param {'native'|'perfection'} channel
 * @returns {object}
 */
function probe(channel) {
  const manager = initializeCards();
  let serial = 1;
  /** @param {string} fullName */
  const make = fullName => {
    const card = manager.getCardByName(fullName);
    assert.ok(card, 'Missing pinned card ' + fullName);
    card.id = serial++;
    return card;
  };
  const {Store} = load('game/store/store');
  const {Player} = load('game/store/state/player');
  const {CardList} = load('game/store/state/card-list');
  const {GamePhase} = load('game/store/state/state');
  const {Format} = load('game/store/card/card-types');
  const {UseAbilityAction, AttackAction} = load('game/store/actions/game-actions');
  const {ResolvePromptAction} = load('game/store/actions/resolve-prompt-action');
  const {PlayerType,SlotType} = load('game/store/actions/play-card-action');

  const store = new Store({onStateChange() {}});
  const state = store.state;
  const opponent = new Player();
  opponent.id = 101;
  opponent.name = 'controlled opponent';
  opponent.active.cards.push(make('Pidgey MEW'));
  const mine = new Player();
  mine.id = 202;
  mine.name = 'controlled attacker';
  const gengar = make('Gengar & Mimikyu-GX TEU');
  const mewtwo = make('Mewtwo & Mew-GX UNM');
  if (channel === 'native') {
    mine.active.cards.push(gengar);
  } else {
    mine.active.cards.push(mewtwo);
    mine.discard.cards.push(gengar);
  }
  mine.active.energies.cards.push(make('Psychic Energy SVE'));
  for (const player of [opponent,mine]) {
    player.deck.cards.push(make('Psychic Energy SVE'),make('Psychic Energy SVE'));
    for (let i=0; i<6; i++) {
      const prize = new CardList();
      prize.cards.push(make('Psychic Energy SVE'));
      player.prizes.push(prize);
    }
  }
  state.players = [opponent,mine];
  state.turn = 2;
  state.activePlayer = 1;
  state.phase = GamePhase.PLAYER_TURN;
  state.gameSettings.format = Format.EXPANDED;
  assert.equal(mine.usedGX, false);

  const declarations = [];
  let selectedCopy = null;
  if (channel === 'native') {
    const action = new AttackAction(mine.id,'Horror House-GX');
    declarations.push(action.type);
    store.dispatch(action);
  } else {
    const action = new UseAbilityAction(mine.id,'Perfection',
      {player:PlayerType.BOTTOM_PLAYER,slot:SlotType.ACTIVE,index:0});
    declarations.push(action.type);
    store.dispatch(action);
    let prompt = state.prompts.find(p => p.result === undefined);
    for (let step=0; step<8 && prompt?.constructor.name==='WaitPrompt';step++) {
      store.dispatch(new ResolvePromptAction(prompt.id,true));
      prompt = state.prompts.find(p => p.result === undefined);
    }
    assert.equal(prompt?.constructor.name,'ChooseAttackPrompt',
      'Perfection should request a copied attack; pending=' +
      state.prompts.filter(p=>p.result===undefined).map(p=>p.constructor.name).join(','));
    const printed = prompt.cards.find(c => c.fullName === gengar.fullName);
    assert.ok(printed,'Actual discard Gengar must be in the attack-source prompt');
    const attack = printed.attacks.find(a => a.name === 'Horror House-GX');
    assert.ok(attack,'Printed Horror House-GX unavailable');
    assert.equal(prompt.validate(attack),true,
      'One Psychic Energy must suffice for printed Horror House-GX');
    selectedCopy = attack.name;
    const choice = new ResolvePromptAction(prompt.id,attack);
    declarations.push(choice.type);
    store.dispatch(choice);
  }

  assert.equal(mine.usedGX,true,
    'Horror House-GX must actually execute and spend the one-per-game GX use');
  return {
    channel, declarationActionTypes:declarations,
    selectedCopiedAttack:selectedCopy, usedGX:mine.usedGX,
    resolvedAsGx:true,
    pendingPromptTypes:state.prompts.filter(p=>p.result===undefined)
      .map(p=>p.constructor.name),
    scope:'staged printed-card legal Store action, not an authentic 60-card deal'
  };
}

/** @returns {object} */
function run() {
  const native = probe('native');
  const perfection = probe('perfection');
  assert.equal(native.usedGX,true);
  assert.equal(perfection.usedGX,true);
  assert.equal(perfection.selectedCopiedAttack,'Horror House-GX');
  assert.deepEqual(perfection.declarationActionTypes,
    ['USE_ABILITY_ACTION','RESOLVE_PROMPT_ACTION']);
  return {
    schema:'perfection-delegated-action-contract-v1',
    engine:pinned,
    paperDistinction:'Perfection is a continuous Ability under printed paper text; pinned Twinleaf exposes an activated copy-action interface',
    caution:'AttackAction-only event counts undercount resolved copied attacks',
    native,perfection,qualifiedCompetitiveGame:false
  };
}

if (require.main === module) {
  process.stdout.write(JSON.stringify(run(),null,2)+'\n');
}
module.exports={probe,run};
