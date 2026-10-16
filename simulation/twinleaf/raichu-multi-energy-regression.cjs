'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const {stagedRaichu, providedEnergy} = require('./temple-raichu-board.cjs');
const {withElectroRainDamageHook} = require('./electro-rain-damage-hook.cjs');

const output = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');
/** @param {string} name */
const load = name => require(path.join(output, name));

/**
 * Conditional board for the published rank-4/rank-17 Special Energy package.
 * The prize deficit is imposed directly; neither Electrode-GX's preceding
 * self-KO nor the Energy attachments are represented as legal turn actions.
 * @param {boolean} withSight
 * @param {boolean} repairedDamage
 * @returns {{withSight:boolean,repairedDamage:boolean,provided:object[],selectionCount:number,damage:number,events:object[],discarded:string[]}}
 */
function runMultiEnergy(withSight, repairedDamage) {
  const f = stagedRaichu([
    'Reversal Energy PAL', 'Counter Energy CIN', 'Unit Energy LPM UPR'
  ], null);
  const {PokemonCardList} = load('game/store/state/pokemon-card-list');
  const {CardList} = load('game/store/state/card-list');
  const {PlayerType, SlotType} = load('game/store/actions/play-card-action');
  const {AttackAction} = load('game/store/actions/game-actions');
  const {ResolvePromptAction} = load('game/store/actions/resolve-prompt-action');

  const target = new PokemonCardList();
  target.cards.push(f.card('Shadow Rider Calyrex VMAX CRE'));
  f.b.bench.push(target);
  if (withSight) f.a.active.tools.push(f.card('Telescopic Sight VIV'));

  for (const [player, n] of [[f.a, 6], [f.b, 4]]) {
    player.prizes = Array.from({length:n}, () => {
      const slot = new CardList();
      slot.cards.push(f.card('Psychic Energy SVE'));
      return slot;
    });
    player.deck.cards.push(f.card('Psychic Energy SVE'));
  }

  // Each physical card needs a distinct ID for pinned prompt validation.
  f.a.active.getPokemonCard().id = 1045;
  f.attached.forEach((energy, index) => { energy.id = 1046 + index; });
  target.getPokemonCard().id = 2050;

  const provided = providedEnergy(f);
  const events = [];
  const resolve = () => {
    f.store.dispatch(new AttackAction(101, 'Electro Rain'));
    for (let i = 0; i < 40; i++) {
      const prompt = f.state.prompts.find(p => p.result === undefined);
      if (!prompt) break;
      let choice;
      if (prompt.constructor.name === 'ChooseCardsPrompt') {
        choice = [...f.attached];
        events.push({kind:'discard-choice',cards:choice.map(card => card.fullName)});
      } else if (prompt.constructor.name === 'PutDamagePrompt') {
        choice = [{target:{player:PlayerType.TOP_PLAYER, slot:SlotType.BENCH,index:0},damage:prompt.damage}];
        events.push({kind:'damage-choice',damage:prompt.damage});
      } else if (prompt.constructor.name === 'WaitPrompt') {
        choice = null;
        events.push({kind:'wait'});
      } else {
        throw new Error('Unexpected prompt '+prompt.constructor.name);
      }
      assert.ok(prompt.validate(choice, f.state),
        'Pinned prompt declined '+prompt.constructor.name+': '+JSON.stringify(events.at(-1)));
      f.store.dispatch(new ResolvePromptAction(prompt.id, choice));
    }
    assert.ok(!f.state.prompts.some(p => p.result === undefined),
      'Unresolved prompts remain after 40 events');
  };
  if (repairedDamage) withElectroRainDamageHook(resolve);
  else resolve();
  return {
    withSight,
    repairedDamage,
    provided,
    selectionCount:events.filter(e => e.kind === 'damage-choice').length,
    damage:target.damage,
    events,
    discarded:f.a.discard.cards.filter(card => f.attached.some(e => e.id === card.id)).map(card=>card.fullName)
  };
}

/** @returns {object} */
function verify() {
  const baseline = runMultiEnergy(false,false);
  const corrected = runMultiEnergy(false,true);
  const correctedSight = runMultiEnergy(true,true);
  const report = {
    sourceRanks:[4,17],
    engine:'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    scope:'staged behind-on-Prizes Alolan Raichu, 3 Special Energy cards; no setup or game-policy inference',
    expectedEnergyUnits:6,
    expectedBaseDamage:180,
    expectedSightDamage:210,
    baseline,corrected,correctedSight
  };
  console.log(JSON.stringify(report,null,2));
  assert.equal(baseline.selectionCount,6,'Each provided Lightning Energy unit must provide one target selection');
  assert.equal(baseline.damage,180,'Six selections must place 180 attack damage with no modifiers');
  assert.equal(corrected.selectionCount,6);
  assert.equal(corrected.damage,180);
  assert.equal(correctedSight.selectionCount,6);
  assert.equal(correctedSight.damage,210,'Telescopic Sight must add one +30 modifier per damaged target');
  return report;
}

if (require.main === module) verify();
module.exports = {runMultiEnergy,verify};
