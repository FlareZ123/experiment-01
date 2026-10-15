'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { loneBasicProbability, soloAfterBonus } = require('./aichi_solo_start.cjs');

/** @param {string | number} value @returns {string} */
function numberKey(value) {
  let key = String(value).trim().toUpperCase();
  key = key.replace(/^(SWSH|SM|XY|BW)(?=\d+$)/, '');
  return key.replace(/^0+(?=\d)/, '');
}

/**
 * Resolve a Limitless translated set/number to a specific English printing.
 * If the translation does not identify exactly one card, reject it.
 * @param {string} root
 * @returns {(printing: {set:string,number:string}) => object}
 */
function printingResolver(root) {
  const sets = JSON.parse(fs.readFileSync(path.join(root, 'resources/sets/en.json'), 'utf8'));
  const aliases = new Map();
  const index = new Map();
  for (const set of sets) {
    for (const alias of [set.id, set.ptcgoCode]) {
      if (!alias) continue;
      const key = alias.toUpperCase();
      if (!aliases.has(key)) aliases.set(key, new Set());
      aliases.get(key).add(set.id);
    }
    const file = path.join(root, 'resources/cards/en', set.id + '.json');
    if (!fs.existsSync(file)) continue;
    for (const card of JSON.parse(fs.readFileSync(file, 'utf8'))) {
      if (card.supertype !== 'Pokémon') continue;
      const key = set.id + ':' + numberKey(card.number);
      if (!index.has(key)) index.set(key, []);
      index.get(key).push(card);
    }
  }
  return (printing) => {
    const candidates = [...(aliases.get(printing.set.toUpperCase()) || [])].flatMap((id) =>
      index.get(id + ':' + numberKey(printing.number)) || []);
    if (candidates.length !== 1) {
      throw new Error('Unresolved Pokémon printing ' + printing.set + ' ' + printing.number
        + ': ' + candidates.length + ' candidates');
    }
    return candidates[0];
  };
}

/**
 * Bare 280-damage attack used by a Psychic-type Pokémon; printed Weakness
 * and Resistance apply. Excludes any attached Tools and other board effects.
 * @param {object} card
 * @returns {number}
 */
function barePsychicDamage(card) {
  let amount = 280;
  for (const weakness of card.weaknesses || []) {
    if (weakness.type === 'Psychic') {
      if (weakness.value === '×2') amount *= 2;
      else if (/^\+\d+$/.test(weakness.value)) amount += Number(weakness.value);
      else throw new Error('Unrecognized Psychic Weakness: ' + weakness.value);
    }
  }
  for (const resistance of card.resistances || []) {
    if (resistance.type === 'Psychic') {
      if (/^-\d+$/.test(resistance.value)) amount += Number(resistance.value);
      else throw new Error('Unrecognized Psychic Resistance: ' + resistance.value);
    }
  }
  return Math.max(0, amount);
}

const initialCounters = new Map([
  ['Mischievous Lock', 'suppresses Basic Meloetta Ability'],
  ['Midnight Fluttering', 'suppresses Active Meloetta Ability'],
  ['Initialization', 'suppresses Rulebox Meloetta Ability'],
  ['Safeguard', 'prevents damage from Pokémon ex'],
]);

/**
 * @param {object} card
 * @returns {{name:string,hp:number,damage:number,survivesBareHit:boolean,activeProtection:string[]}}
 */
function classifyBasic(card) {
  if (!card.subtypes?.includes('Basic')) throw new Error('Not a printed Basic: ' + card.name);
  const hp = Number(card.hp);
  const damage = barePsychicDamage(card);
  return {
    name: card.name,
    hp,
    damage,
    survivesBareHit: hp > damage,
    activeProtection: (card.abilities || []).map((ability) =>
      initialCounters.get(ability.name)).filter(Boolean),
  };
}

/**
 * Score each 60-card defender against rank26's first-turn Crisis Punch
 * based on printed Basic HP and four named intrinsic active Abilities.
 * @param {object[]} decks
 * @param {(printing: {set:string,number:string}) => object} resolve
 * @param {number} attackingRank
 * @returns {object[]}
 */
function defendAgainstDonk(decks, resolve, attackingRank = 26) {
  const attacker = decks.find((deck) => deck.rank === attackingRank);
  if (!attacker) throw new Error('Unknown attacker rank');
  const attackingBasics = attacker.cards.filter((row) => row.category === 'Pokémon'
    && resolve(row.printing).subtypes.includes('Basic'))
    .reduce((total, row) => total + row.count, 0);
  return decks.filter((deck) => deck.rank !== attackingRank).map((deck) => {
    const basics = deck.cards.filter((row) => row.category === 'Pokémon').map((row) => ({
      count: row.count,
      card: resolve(row.printing),
    })).filter(({card}) => card.subtypes.includes('Basic'));
    const total = basics.reduce((sum, entry) => sum + entry.count, 0);
    const classes = basics.map(({count,card}) => ({...classifyBasic(card),count}));
    const hpSafe = classes.filter((entry) => entry.survivesBareHit)
      .reduce((sum, entry) => sum + entry.count, 0);
    const abilityDependent = classes.filter((entry) => entry.activeProtection.length > 0)
      .reduce((sum, entry) => sum + entry.count, 0);
    const unprotected = classes.filter((entry) => !entry.survivesBareHit && entry.activeProtection.length === 0)
      .reduce((sum, entry) => sum + entry.count, 0);
    if (hpSafe + abilityDependent + unprotected !== total) {
      throw new Error('Overlapping intrinsic counter classes at rank ' + deck.rank);
    }
    const soloPre = loneBasicProbability(total);
    const soloPost = soloAfterBonus(total, attackingBasics);
    return {
      rank: deck.rank,
      archetype: deck.archetype,
      basics: total,
      hpSafe,
      abilityDependent,
      unprotected,
      soloPre,
      soloPost,
      plainVulnerabilityPost: soloPost * unprotected / total,
      classes,
    };
  });
}

if (require.main === module) {
  const root = path.resolve(__dirname, '..');
  const lists = JSON.parse(fs.readFileSync(path.join(root, 'results/aichi-2026/full-decklists.json'), 'utf8'));
  const rows = defendAgainstDonk(lists.decks, printingResolver(root));
  const md = [
    '# Aichi 2026 printed starter resistance to rank-26 Crisis Punch',
    '',
    'Conditional lone-Active structural risk after all opponent-mulligan bonuses,',
    'with intrinsic HP and a limited named-Ability classification. The last column',
    'ignores all mid-turn effects including rank26 Canceling Cologne. It does not',
    'represent attack completion or matchup win probability.',
    '',
    '| Rank | Archetype | Basics | Printed HP survivors | Ability-protected Basics | Unprotected Basics | One-Basic after bonus | Unprotected single Active |',
    '| ---: | --- | ---: | ---: | ---: | ---: | ---: | ---: |',
  ];
  for (const row of rows) md.push('| ' + row.rank + ' | ' + row.archetype + ' | '
    + row.basics + ' | ' + row.hpSafe + ' | ' + row.abilityDependent + ' | '
    + row.unprotected + ' | ' + (row.soloPost * 100).toFixed(3) + '% | '
    + (row.plainVulnerabilityPost * 100).toFixed(3) + '% |');
  process.stdout.write(md.join('\n') + '\n');
}

module.exports = { numberKey, printingResolver, barePsychicDamage, classifyBasic, defendAgainstDonk };
