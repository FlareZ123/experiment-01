'use strict';

const fs = require('node:fs');
const path = require('node:path');

/**
 * Exact printings printed in the Aichi 2026 field manifest. Effects checked
 * against the bundled English card data; print IDs use Limitless English
 * display codes. Presence only establishes an available line, not execution.
 */
const THREATS = Object.freeze([
  {
    id: 'budew_item_lock',
    label: 'Budew: next-turn Item lock',
    condition: 'Attack with Budew (Itchy Pollen); requires the turn and Active Spot.',
    printings: [['Budew', 'ASC', '16']],
    englishCardIds: ['me2pt5-16'],
  },
  {
    id: 'vileplume_item_lock',
    label: 'Vileplume: continuous Item lock',
    condition: 'Vileplume AOR Irritating Pollen Ability must remain enabled in play; locks both players.',
    printings: [['Vileplume', 'AOR', '3']],
    englishCardIds: ['xy7-3'],
  },
  {
    id: 'garbodor_ability_lock',
    label: 'Garbodor: conditional Ability lock',
    condition: 'Garbotoxin requires a Pokémon Tool attached and an enabled Ability.',
    printings: [['Garbodor', 'LTR', '68'], ['Garbodor', 'BKP', '57']],
    englishCardIds: ['bw11-68', 'xy9-57'],
  },
  {
    id: 'thorns_rule_box_lock',
    label: 'Iron Thorns ex: Active Rule Box Ability lock',
    condition: 'Initialization requires Iron Thorns ex in Active; Future Pokémon are exempt.',
    printings: [['Iron Thorns ex', 'TWM', '77']],
    englishCardIds: ['sv6-77'],
  },
  {
    id: 'stoutland_supporter_lock',
    label: 'Stoutland: Active Supporter lock',
    condition: 'Sentinel requires Stoutland in Active Spot and an enabled Ability.',
    printings: [['Stoutland', 'BCR', '122']],
    englishCardIds: ['bw7-122'],
  },
  {
    id: 'vileplume_basic_attack_lock',
    label: 'Vileplume: Active Basic Pokémon attack lock',
    condition: 'Disgusting Pollen requires Vileplume BUS in Active Spot and an enabled Ability.',
    printings: [['Vileplume', 'BUS', '6']],
    englishCardIds: ['sm3-6'],
  },
  {
    id: 'snorlax_retreat_lock',
    label: 'Snorlax: Active retreat lock',
    condition: 'Block prevents normal retreat while Snorlax is Active; switching can still work.',
    printings: [['Snorlax', 'PGO', '55']],
    englishCardIds: ['pgo-55'],
  },
]);

/** @param {string|number} number */
function normalizeNumber(number) {
  return String(number).trim().replace(/^0+(?=\d)/, '');
}

/**
 * @param {{cards:Array<{name:string,count:number,printing:{set:string,number:string}}>} } deck
 * @param {{printings:Array<[string,string,string]>}} threat
 */
function cardCount(deck, threat) {
  return deck.cards.reduce((count, card) => {
    const found = threat.printings.some(([name, set, number]) =>
      card.name === name && card.printing?.set?.toUpperCase() === set &&
      normalizeNumber(card.printing?.number) === normalizeNumber(number));
    return count + (found ? card.count : 0);
  }, 0);
}

/**
 * @param {{decks:Array<{rank:number,archetype:string,cards:Array<{name:string,count:number,printing:object}>}>,missing_full_lists?:Array<{rank:number}>}} manifest
 */
function audit(manifest) {
  if (!Array.isArray(manifest.decks)) throw new Error('Missing field decks');
  const ranks = new Set();
  const rows = manifest.decks.map((deck) => {
    if (!Number.isInteger(deck.rank) || deck.rank < 1 || deck.rank > 32 || ranks.has(deck.rank)) {
      throw new Error('Invalid or duplicate placement ' + deck.rank);
    }
    ranks.add(deck.rank);
    if (!Array.isArray(deck.cards) ||
      deck.cards.some((c) => !Number.isInteger(c.count) || c.count < 1) ||
      deck.cards.reduce((sum, c) => sum + c.count, 0) !== 60) {
      throw new Error('Invalid 60-card deck at rank ' + deck.rank);
    }
    const counts = Object.fromEntries(THREATS.map((threat) =>
      [threat.id, cardCount(deck, threat)]));
    return {
      rank: deck.rank,
      archetype: deck.archetype,
      counts,
      anyThreat: Object.values(counts).some((n) => n > 0),
    };
  }).sort((a, b) => a.rank - b.rank);
  const missingRanks = Array.from({length: 32}, (_, i) => i + 1)
    .filter((rank) => !ranks.has(rank));
  const declaredMissing = (manifest.missing_full_lists || []).map((entry) => entry.rank)
    .sort((a, b) => a - b);
  if (JSON.stringify(missingRanks) !== JSON.stringify(declaredMissing)) {
    throw new Error('Missing ranks disagree with manifest');
  }
  return {rows, missingRanks, publishedCount: rows.length};
}

/** @param {ReturnType<typeof audit>} scan */
function toMarkdown(scan) {
  const lines = [
    '# Aichi 2026: exact-printing disruption exposure inventory',
    '',
    'Source: [published Aichi 2026 Top 32 manifest](full-decklists.json), copied from Limitless (29 published full lists of 32 placements).',
    '',
    '**Method:** Count exact card name and displayed set/number matches in each 60-card published deck. Each match is a *potential interaction*; the deck may never assemble, activate, or exploit it. The source uses English display print codes, which are not Japanese printing legality certifications.',
    '',
    '## Coverage across 29 published lists',
    '',
    '| Named interaction | Decks containing it | Rank witnesses |',
    '| --- | ---: | --- |',
  ];
  for (const marker of THREATS) {
    const matching = scan.rows.filter((row) => row.counts[marker.id] > 0);
    lines.push('| ' + marker.label + ' | ' + matching.length +
      '/' + scan.publishedCount + ' | ' + matching.map((row) => row.rank).join(', ') + ' |');
  }
  const any = scan.rows.filter((row) => row.anyThreat);
  lines.push('', 'Union: **' + any.length + '/' + scan.publishedCount +
    '** published lists contain at least one of these seven selected effects. This is a deliberately limited, non-exhaustive inventory and is not a matchup win-rate estimate.',
    '',
    '## Exact potential interaction counts by placement',
    '',
    '| Rank | Archetype | Budew | Vileplume Item | Garbotoxin | Thorns | Stoutland | Vileplume Basic | Snorlax |',
    '| ---: | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |');
  for (const row of scan.rows) {
    lines.push('| ' + row.rank + ' | ' + row.archetype + ' | ' +
      THREATS.map((t) => row.counts[t.id]).join(' | ') + ' |');
  }
  lines.push('', '**Unpublished ranks:** ' + scan.missingRanks.join(', ') +
    '. Exact copies and effects in these lists are unknown.',
    '',
    '## Mechanical conditions to preserve in tests', '');
  for (const marker of THREATS) {
    lines.push('- **' + marker.label + ':** ' + marker.condition +
      ' English card IDs: ' + marker.englishCardIds.join(', ') + '.');
  }
  lines.push('',
    '## Evaluation consequences',
    '',
    '- Budew appears in every one of the nine **published** Regidrago lists; the two unpublished Regidrago lists remain unknown. Test Item access after a successful Itchy Pollen separately from merely drawing Budew.',
    '- Item lock and Ability suppression can interact. For example, Garbotoxin can suppress Vileplume\'s Ability. Treat simultaneous lock markers as constrained board states, without adding their effects independently.',
    '- Stress testing should include pre-lock, locked, lock-broken, and counter-gust states. Explicitly measure costs of ACE SPEC access, Supporter and Bench contention, Prize cards, and first-player assignment.',
    '- Coverage is incomplete by design. This sheet selects seven clearly identifiable effects. Other control effects, attacks, Tools, Stadiums, and matchup-specific counters may be strategically decisive.',
    '',
    'Reproduce this document using the pure functions exported by [scripts/aichi_threat_inventory.cjs](../../scripts/aichi_threat_inventory.cjs) with the published manifest.',
    '');
  return lines.join('\n');
}

if (require.main === module) {
  const root = path.resolve(__dirname, '..');
  const manifest = JSON.parse(fs.readFileSync(
    path.join(root, 'results/aichi-2026/full-decklists.json'), 'utf8'));
  process.stdout.write(toMarkdown(audit(manifest)) + '\n');
}

module.exports = {THREATS, normalizeNumber, cardCount, audit, toMarkdown};
