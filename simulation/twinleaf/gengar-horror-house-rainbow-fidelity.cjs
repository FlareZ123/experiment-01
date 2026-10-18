'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const {initializeCards} = require('./headless.cjs');

const ROOT = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');
/** @param {string} relativePath */
const load = relativePath => require(path.join(ROOT, relativePath));

/**
 * A controlled pinned-Store card-text fidelity comparison. Both actual
 * attached Energy cards appear in active.cards and active.energies.cards,
 * matching AttachEnergyEffect. No true 60-card deal is represented.
 *
 * @param {'basic'|'rainbow'|'prism'|'colorless'} variant
 * @returns {object}
 */
function probe(variant) {
  const manager = initializeCards();
  let identifier = 1;
  /** @param {string} name */
  const card = name => {
    const instance = manager.getCardByName(name);
    assert.ok(instance, 'Missing pinned card '+name);
    instance.id = identifier++;
    return instance;
  };
  const {Store} = load('game/store/store');
  const {Player} = load('game/store/state/player');
  const {CardList} = load('game/store/state/card-list');
  const {GamePhase} = load('game/store/state/state');
  const {Format,CardType,SuperType} = load('game/store/card/card-types');
  const {CheckProvidedEnergyEffect} = load('game/store/effects/check-effects');
  const {AttackAction} = load('game/store/actions/game-actions');
  const state = new Store({onStateChange() {}});
  const game = state.state;
  const source = new Player();
  source.id = 202;
  source.name = 'Horror House source';
  source.active.cards.push(card('Gengar & Mimikyu-GX TEU'));
  const opponent = new Player();
  opponent.id = 101;
  opponent.name = 'Draw witness';
  opponent.active.cards.push(card('Pidgey MEW'));
  const attachedNames = ['Psychic Energy SVE',
    variant === 'basic' ? 'Psychic Energy SVE' :
      variant === 'rainbow' ? 'Rainbow Energy SUM' : variant === 'prism' ? 'Prism Energy NXD' : 'Double Colorless Energy EVO'];
  for (const name of attachedNames) {
    const energy = card(name);
    source.active.cards.push(energy);
    source.active.energies.cards.push(energy);
  }
  for (const p of [opponent, source]) {
    for (let i=0;i<10;i++) p.deck.cards.push(card('Psychic Energy SVE'));
    for (let i=0;i<6;i++) {
      const prize = new CardList();
      prize.cards.push(card('Psychic Energy SVE'));
      p.prizes.push(prize);
    }
  }
  game.players = [opponent,source];
  game.turn = 2;
  game.activePlayer = 1;
  game.phase = GamePhase.PLAYER_TURN;
  game.gameSettings.format = Format.EXPANDED;

  const energyEffect = new CheckProvidedEnergyEffect(source);
  state.reduceEffect(game,energyEffect);
  const semanticMap = energyEffect.energyMap.map(entry => ({
    name:entry.card.name,provides:entry.provides
  }));
  const rawPsychicCards = source.active.cards.filter(c =>
    c.superType === SuperType.ENERGY && c.provides.includes(CardType.PSYCHIC));
  const actualAttached = source.active.energies.cards.map(c=>c.name);
  assert.equal(actualAttached.length,2);

  state.dispatch(new AttackAction(source.id,'Horror House-GX'));
  assert.equal(source.usedGX,true);
  assert.equal(opponent.cannotPlayItemCards,true);
  return {
    variant,attachedNames,actualAttached,semanticMap,
    printedPsychicCardCount:rawPsychicCards.length,
    sourceHandCount:source.hand.cards.length,
    opponentHandCount:opponent.hand.cards.length,
    sourceUsedGX:source.usedGX,
    opponentItemLocked:opponent.cannotPlayItemCards,
    phase:game.phase
  };
}

/** @returns {object} */
function run() {
  const basic=probe('basic');
  const rainbow=probe('rainbow');
  const prism=probe('prism');
  const colorless=probe('colorless');
  assert.equal(basic.printedPsychicCardCount,2);
  assert.equal(rainbow.printedPsychicCardCount,1);
  assert.equal(prism.printedPsychicCardCount,1);
  assert.equal(colorless.printedPsychicCardCount,1);
  assert.ok(rainbow.semanticMap.some(entry=>
    entry.name==='Rainbow Energy' && entry.provides.includes(CardType.ANY)),
    'Rainbow must dynamically provide every type through CheckProvidedEnergyEffect');
  assert.equal(basic.sourceHandCount,7,
    'Two native Psychic Energy should trigger the extra-effect draw');
  assert.equal(basic.opponentHandCount,7);
  assert.equal(colorless.sourceHandCount,0,
    'One Psychic and one Colorless must not qualify');
  assert.equal(colorless.opponentHandCount,0);
  assert.equal(rainbow.sourceHandCount,0,
    'Pinned bug witness: two Psychic-providing units with Rainbow fail draw');
  assert.equal(rainbow.opponentHandCount,0);
  assert.equal(prism.sourceHandCount,0);
  assert.equal(prism.opponentHandCount,0);
  return {
    schema:'pinned-horror-house-extra-psychic-source-fidelity-v1',
    pinned:'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    basic,rainbow,prism,colorless,
    paperExpectedRainbowDraw:7,
    pinObservedRainbowDraw:rainbow.sourceHandCount,
    sourceMechanism:'Gengar counts energy.provides.includes(PSYCHIC) on raw cards, ignoring CheckProvidedEnergyEffect dynamic ANY',
    classification:'staged Store discrepancy; not a source-dealt game or win-rate evidence',
    qualifiedForCompetitiveInference:false
  };
}

if(require.main===module)process.stdout.write(JSON.stringify(run(),null,2)+'\n');
module.exports={probe,run};
