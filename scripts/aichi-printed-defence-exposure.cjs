'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

/**
 * Read the English snapshot's set-code/printing identities, retaining exact
 * physical printings. This is a static card-text inventory, not a rules engine.
 * @param {string} root Repository root.
 * @returns {Map<string, object>}
 */
function loadPrintingIndex(root) {
  const sets = JSON.parse(fs.readFileSync(path.join(root, 'resources/sets/en.json'), 'utf8'));
  const index = new Map();
  for (const set of sets) {
    const file = path.join(root, 'resources/cards/en', set.id + '.json');
    const codes = [...new Set([set.ptcgoCode, set.id.toUpperCase()].filter(Boolean))];
    const cards = JSON.parse(fs.readFileSync(file, 'utf8'));
    for (const card of cards) {
      const printedNumber = ['smp', 'xyp'].includes(set.id)
        ? String(card.number).replace(/^(?:SM|XY)/, '')
        : String(card.number);
      for (const code of codes) {
        const key = [code, printedNumber, card.name].join('\u0000');
        const prior = index.get(key);
        if (prior) {
          // Several expansion subsets reuse a PTCGO set code.
          assert.deepEqual(
            {subtypes:card.subtypes, abilities:card.abilities ?? [], attacks:card.attacks ?? []},
            {subtypes:prior.subtypes, abilities:prior.abilities ?? [], attacks:prior.attacks ?? []},
            'Conflicting English source printings: ' + key);
        } else {
          index.set(key, card);
        }
      }
    }
  }
  return index;
}

/**
 * Classify the print's inherent attributes and literal attack text only.
 * Protections assume an active Crustle/Mimikyu Ability or a prior Snow Mirage.
 * @param {object} card Card from resources/cards/en.
 * @returns {object}
 */
function classifyPrintedPokemon(card) {
  const subtypes = new Set(card.subtypes ?? []);
  const ex = subtypes.has('ex');
  const pokemonV = ['V', 'VMAX', 'VSTAR', 'V-UNION'].some(t => subtypes.has(t));
  const printedAbility = (card.abilities ?? []).length > 0;
  const attacks = card.attacks ?? [];
  const abilities = card.abilities ?? [];
  return {
    id:card.id,
    name:card.name,
    types:card.types ?? [],
    ex,
    pokemonV,
    printedAbility,
    attackNames:attacks.map(a => a.name),
    directDamage:attacks.some(a => /^\d/.test(a.damage ?? '')),
    ignoresDefenderEffects:attacks.filter(a =>
      /(?:isn't|is not|aren't|are not) affected by any effects on (?:your opponent's|the defending)/i.test(a.text ?? ''))
      .map(a => a.name),
    damageCounterEffects:attacks.filter(a => /(?:put|place|move) .*damage counters?/i.test(a.text ?? ''))
      .map(a => a.name),
    knockoutEffects:attacks.filter(a => /(?:is|are|will be) Knocked Out/i.test(a.text ?? ''))
      .map(a => a.name),
    abilityCounterEffects:abilities.filter(a => /(?:put|place|move) .*damage counters?/i.test(a.text ?? ''))
      .map(a => a.name),
    abilitySuppression:abilities.filter(a =>
      /(?:have|has) no Abilit(?:y|ies)|can't use (?:any )?Abilit(?:y|ies)/i.test(a.text ?? ''))
      .map(a => a.name),
    barrier: {
      crustleExAbility:ex,
      mimikyuSafeguard:ex || pokemonV,
      vulpixPostSnowMirage:printedAbility
    }
  };
}

/**
 * @param {object} source Manifest object with published decks.
 * @param {Map<string, object>} printings Exact English printings.
 * @returns {Array<object>}
 */
function analyzeField(source, printings) {
  assert.equal(source.published_deck_count, 29);
  assert.equal(source.decks.length, 29);
  return source.decks.map(deck => {
    const pokemon = deck.cards.filter(c => c.category === 'Pokémon').map(row => {
      const key = [row.printing.set,String(row.printing.number),row.name].join('\u0000');
      const card = printings.get(key);
      assert.ok(card, 'Missing printed Pokémon: rank ' + deck.rank + ', ' + key);
      return {count:row.count,...classifyPrintedPokemon(card)};
    });
    const printedUncoveredDirectThreats = pokemon.filter(p => p.directDamage &&
      !p.ex && !p.pokemonV && !p.printedAbility);
    const bypassThreats = pokemon.filter(p => p.ignoresDefenderEffects.length ||
      p.damageCounterEffects.length || p.knockoutEffects.length ||
      p.abilityCounterEffects.length || p.abilitySuppression.length);
    return {
      rank:deck.rank,
      archetype:deck.archetype,
      pokemonPrintedCount:pokemon.reduce((s,p) => s+p.count,0),
      apexCanCopyShred:pokemon.some(p => p.name==='Regidrago VSTAR' &&
        p.attackNames.includes('Apex Dragon')) && pokemon.some(p =>
        p.name==='Dialga-GX' && p.types.includes('Dragon') &&
        p.ignoresDefenderEffects.includes('Shred')),
      noPrintedBarrierDirectDamage:printedUncoveredDirectThreats.map(p => ({name:p.name,id:p.id,count:p.count,attacks:p.attackNames})),
      effectOrCounterExceptions:bypassThreats.map(p => ({name:p.name,id:p.id,count:p.count,
        ignoresDefenderEffects:p.ignoresDefenderEffects,
        damageCounterEffects:p.damageCounterEffects,
        knockoutEffects:p.knockoutEffects,
        abilityCounterEffects:p.abilityCounterEffects,
        abilitySuppression:p.abilitySuppression})),
      pokemon
    };
  });
}

function main() {
  const root = path.join(__dirname, '..');
  const source = JSON.parse(fs.readFileSync(path.join(root, 'results/aichi-2026/full-decklists.json'), 'utf8'));
  const printings = loadPrintingIndex(root);
  const field = analyzeField(source,printings);
  for (const d of field) {
    const direct = d.noPrintedBarrierDirectDamage.map(p => p.name + ' (' + p.count + ')').join(', ') || 'none';
    const bypass = d.effectOrCounterExceptions.map(p => p.name).join(', ') || 'none';
    console.log('rank ' + d.rank + ' ' + d.archetype + ': no-barrier standard-damage prints: ' + direct + '; effect/counter exception prints: ' + bypass);
  }
  console.log(JSON.stringify({publishedDecks:field.length,
    ranksWithNoBarrierStandardDamage:field.filter(x=>x.noPrintedBarrierDirectDamage.length).map(x=>x.rank),
    ranksWithEffectOrCounterExceptions:field.filter(x=>x.effectOrCounterExceptions.length).map(x=>x.rank),
    ranksWithPotentialApexShred:field.filter(x=>x.apexCanCopyShred).map(x=>x.rank)}));
}

if (require.main === module) main();
module.exports = {loadPrintingIndex,classifyPrintedPokemon,analyzeField};
