'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const {initializeCards} = require('./headless.cjs');

const output = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');
/** @param {string} file */
const engine = file => require(path.join(output, file));

/**
 * An independent, staged Board/turn test of Perfection availability under
 * the real pinned Store after legal counter-Item actions and prompts.
 * The board is injected deliberately: this tests effects, not setup access.
 *
 * @param {{active:'plain'|'iron'|'klefki', garbodor:boolean, tools:('cologne'|'blower')[]}} options
 */
function probe(options) {
  const manager = initializeCards();
  let id = 1;
  /** @param {string} name */
  const card = name => {
    const found = manager.getCardByName(name);
    assert.ok(found, 'Missing printed engine card ' + name);
    found.id = id++;
    return found;
  };
  const {Store} = engine('game/store/store');
  const {Player} = engine('game/store/state/player');
  const {GamePhase} = engine('game/store/state/state');
  const {CardList} = engine('game/store/state/card-list');
  const {PokemonCardList} = engine('game/store/state/pokemon-card-list');
  const {Format} = engine('game/store/card/card-types');
  const {PlayCardAction,PlayerType,SlotType} =
    engine('game/store/actions/play-card-action');
  const {ResolvePromptAction} =
    engine('game/store/actions/resolve-prompt-action');
  const {CheckPokemonPowersEffect} =
    engine('game/store/effects/check-effects');
  const {IS_ABILITY_BLOCKED} = engine('game/store/prefabs/prefabs');

  const store = new Store({onStateChange() {}});
  const state = store.state;
  const opponent = new Player(), mine = new Player();
  opponent.id = 101;
  opponent.name = 'published-field lock adversary';
  mine.id = 202;
  mine.name = 'fixed New Moon challenger';
  state.players = [opponent, mine];
  state.phase = GamePhase.PLAYER_TURN;
  state.turn = 4;
  state.activePlayer = 1;
  state.gameSettings.format = Format.EXPANDED;
  const mew = card('Mewtwo & Mew-GX UNM');
  mine.active.cards.push(mew);
  const opposing = card(options.active === 'iron'
    ? 'Iron Thorns ex TWM'
    : options.active === 'klefki' ? 'Klefki SVI' : 'Pidgey MEW');
  opponent.active.cards.push(opposing);
  let garboSlot = null, garbageTool = null;
  if (options.garbodor) {
    garboSlot = new PokemonCardList();
    garboSlot.cards.push(card('Trubbish BKP'), card('Garbodor BKP'));
    garbageTool = card('Float Stone BKT');
    garboSlot.tools.push(garbageTool);
    opponent.bench.push(garboSlot);
  }
  for (const player of state.players) {
    for (let k = 0; k < 6; k++) {
      const list = new CardList();
      list.cards.push(card('Psychic Energy SVE'));
      player.prizes.push(list);
    }
    player.deck.cards.push(card('Psychic Energy SVE'),card('Psychic Energy SVE'));
  }
  const items = options.tools.map(type => card(type === 'cologne'
    ? 'Canceling Cologne ASR' : 'Field Blower GRI'));
  mine.hand.cards.push(...items);

  const powerCheck = () => {
    const effect = new CheckPokemonPowersEffect(mine, mew);
    store.reduceEffect(state, effect);
    return {
      blocked: IS_ABILITY_BLOCKED(store, state, mine, mew),
      visible: effect.powers.some(power => power.name === 'Perfection')
    };
  };
  const stages = [{step: 'initial', ...powerCheck()}];
  const target = {player: PlayerType.ANY,slot: SlotType.BOARD,index: 0};
  const pending = () => state.prompts.find(prompt => prompt.result === undefined);

  for (const item of items) {
    const played = item.name === 'Canceling Cologne' ? 'cologne' : 'blower';
    assert.ok(mine.hand.cards.includes(item));
    store.dispatch(new PlayCardAction(mine.id,mine.hand.cards.indexOf(item),target));
    if (played === 'blower') {
      assert.ok(garboSlot, 'Blower experiment requires opponent Garbodor Tool');
      const prompt = pending();
      assert.equal(prompt?.constructor.name,'ChoosePokemonPrompt',
        'Field Blower target selection was not exposed');
      assert.equal(prompt.validate([garboSlot],state),true);
      store.dispatch(new ResolvePromptAction(prompt.id,[garboSlot]));
      assert.equal(garboSlot.tools.includes(garbageTool),false,
        'Real Field Blower failed to discard chosen Tool');
      assert.ok(opponent.discard.cards.includes(garbageTool));
    } else {
      assert.equal(opponent.marker.hasMarker('CANCELING_COLOGNE_MARKER',item),true,
        'Real Cologne action did not mark opponent Active');
    }
    assert.equal(pending(),undefined,'Counter-Item left unresolved Store prompts');
    stages.push({step:played, ...powerCheck()});
  }
  return {
    ...options, stages,
    garbotoxinToolAfter: garbageTool ? garboSlot.tools.includes(garbageTool) : null,
    sourceScope: 'staged printed-card Store actions/prompt, not a physically dealt game'
  };
}

function run() {
  const scenarios = [
    {active:'plain',garbodor:false,tools:[]},
    {active:'plain',garbodor:true,tools:[]},
    {active:'plain',garbodor:true,tools:['blower']},
    {active:'iron',garbodor:false,tools:[]},
    {active:'iron',garbodor:false,tools:['cologne']},
    {active:'klefki',garbodor:false,tools:['cologne']},
    {active:'iron',garbodor:true,tools:['cologne']},
    {active:'iron',garbodor:true,tools:['blower']},
    {active:'iron',garbodor:true,tools:['cologne','blower']}
  ];
  const rows = scenarios.map(probe);
  const expectedVisible = [
    [true],[false],[false,true],[false],[false,true],
    [false,true],[false,false],[false,false],[false,false,true]
  ];
  rows.forEach((row, idx) => {
    assert.deepEqual(row.stages.map(stage => stage.visible),expectedVisible[idx],
      'Perfection lock/answer mismatch: ' + JSON.stringify(row));
    row.stages.forEach(stage => assert.equal(stage.blocked,!stage.visible));
  });
  return {
    schema: 'new-moon-ability-counter-reducer-v1',
    engine: 'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    candidate: 'new-moon-lockbreak-v1',
    qualification: 'Conditioned injected midgame board and actual Item Store actions, no match win data',
    rows
  };
}

if (require.main === module) {
  process.stdout.write(JSON.stringify(run(), null, 2) + '\n');
}
module.exports = {probe, run};
