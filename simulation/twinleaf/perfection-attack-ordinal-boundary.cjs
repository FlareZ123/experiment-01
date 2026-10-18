'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const {initializeCards} = require('./headless.cjs');
const {captureChooseAttackReference} = require('./choose-attack-reference.cjs');
const {newlyLoggedAttackDeclarations} =
  require('../evaluation/twinleaf-attack-log-declarations.cjs');

const PINNED = 'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05';
const output = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');
/** @param {string} modulePath */
const load = modulePath => require(path.join(output, modulePath));

/**
 * Exercise real pinned Store roots with either no pre-attack coin check or
 * deterministic heads/tails. Math.random is replaced only during this staged
 * local test and is always restored. It never changes a source game or bot.
 *
 * @param {'none'|'heads'|'tails'} scenario
 * @returns {object}
 */
function probe(scenario) {
  const manager = initializeCards();
  let serial = 1;
  /** @param {string} name */
  const make = name => {
    const card = manager.getCardByName(name);
    assert.ok(card, 'Missing pinned source printing: ' + name);
    card.id = serial++;
    return card;
  };
  const {Store} = load('game/store/store');
  const {Player} = load('game/store/state/player');
  const {CardList} = load('game/store/state/card-list');
  const {GamePhase} = load('game/store/state/state');
  const {Format} = load('game/store/card/card-types');
  const {UseAbilityAction} = load('game/store/actions/game-actions');
  const {ResolvePromptAction} = load('game/store/actions/resolve-prompt-action');
  const {PlayerType, SlotType} = load('game/store/actions/play-card-action');
  const state = new Store({onStateChange() {}});
  const owner = new Player();
  owner.id = 202;
  owner.name = 'copy attacker';
  owner.active.cards.push(make('Mewtwo & Mew-GX UNM'));
  owner.active.energies.cards.push(make('Psychic Energy SVE'));
  owner.discard.cards.push(make('Gengar & Mimikyu-GX TEU'));
  if (scenario !== 'none') owner.active.coinFlipCancelAttackNextTurn = 1;
  const defender = new Player();
  defender.id = 101;
  defender.name = 'defender';
  defender.active.cards.push(make('Pidgey MEW'));
  for (const player of [defender, owner]) {
    player.deck.cards.push(make('Psychic Energy SVE'),make('Psychic Energy SVE'));
    for (let i=0; i<6; i++) {
      const prize = new CardList();
      prize.cards.push(make('Psychic Energy SVE'));
      player.prizes.push(prize);
    }
  }
  state.state.players = [defender,owner];
  state.state.activePlayer = 1;
  state.state.turn = 2;
  state.state.phase = GamePhase.PLAYER_TURN;
  state.state.gameSettings.format = Format.EXPANDED;
  const rows = [];
  /** @returns {object|undefined} */
  const pending = () => state.state.prompts.find(p => p.result === undefined);
  /** @param {object} action */
  const dispatch = action => {
    const logIndex = state.state.logs.length;
    const beforePrompt = pending()?.constructor.name ?? null;
    const ordinal = rows.length + 1;
    const turnBefore = state.state.turn;
    state.dispatch(action);
    const declared = newlyLoggedAttackDeclarations(state.state.logs,logIndex,{
      actionOrdinal:ordinal,turnBefore,triggerAction:action.constructor.name
    });
    rows.push({
      ordinal,
      action:action.constructor.name,
      pendingBefore:beforePrompt,
      turnBefore,
      turnAfter:state.state.turn,
      declarations:declared.map(d=>d.attackName)
    });
  };
  const oldRandom = Math.random;
  try {
    Math.random = () => scenario === 'tails' ? 0.99 : 0.01;
    dispatch(new UseAbilityAction(owner.id,'Perfection',{
      player:PlayerType.BOTTOM_PLAYER,slot:SlotType.ACTIVE,index:0
    }));
    for (let step=0; pending()?.constructor.name==='WaitPrompt' && step<12; step++) {
      dispatch(new ResolvePromptAction(pending().id,true));
    }
    const choose = pending();
    assert.equal(choose?.constructor.name,'ChooseAttackPrompt');
    const source = choose.cards.find(c => c.fullName === 'Gengar & Mimikyu-GX TEU');
    assert.ok(source);
    const selected = source.attacks.find(a => a.name === 'Horror House-GX');
    assert.ok(selected);
    assert.equal(choose.validate(selected),true);
    const choice = new ResolvePromptAction(choose.id,selected);
    const reference = captureChooseAttackReference(choose,choice);
    const selectionOrdinal = rows.length+1;
    dispatch(choice);
    const selectedRoot = rows.at(-1);
    const selectionDeclarations = selectedRoot.declarations;
    if (scenario === 'none') {
      assert.deepEqual(selectionDeclarations,['Horror House-GX']);
    } else {
      assert.deepEqual(selectionDeclarations,[],
        'Coin-flip branch must not log attack on selection root');
      assert.equal(pending()?.constructor.name,'WaitPrompt',
        'Pinned automatic coin flip pauses for its animation');
      dispatch(new ResolvePromptAction(pending().id,true));
    }
    const declarers = rows.filter(r=>r.declarations.includes('Horror House-GX'));
    if (scenario === 'tails') {
      assert.equal(declarers.length,0,
        'Failed pre-attack coin flip ends attack without declaration');
    } else {
      assert.equal(declarers.length,1);
      assert.equal(declarers[0].ordinal,
        scenario === 'none' ? selectionOrdinal : selectionOrdinal+1);
    }
    assert.equal(reference.selection.printing,'Gengar & Mimikyu-GX TEU');
    assert.equal(reference.selection.attackName,'Horror House-GX');
    return {
      scenario,selectionOrdinal,selection:reference.selection,
      declarationOrdinal:declarers[0]?.ordinal ?? null,
      rootActions:rows,
      completedAttackDeclaration:declarers.length===1
    };
  } finally {
    Math.random=oldRandom;
  }
}

/** @returns {object} */
function run() {
  const scenarios=['none','heads','tails'].map(probe);
  assert.equal(scenarios[0].selectionOrdinal,scenarios[0].declarationOrdinal);
  assert.equal(scenarios[1].selectionOrdinal+1,scenarios[1].declarationOrdinal);
  assert.equal(scenarios[2].declarationOrdinal,null);
  return {
    schema:'copied-attack-selection-vs-declaration-root-counterexample-v1',
    engine:PINNED,
    testType:'staged pinned Store; deterministic overridden coin RNG; no source deal',
    scenarios,
    result:'Matching root ordinal is conditional; selected attack may declare on a later root or never declare',
    competitiveQualification:false
  };
}
if (require.main === module) process.stdout.write(JSON.stringify(run(),null,2)+'\n');
module.exports={probe,run};
