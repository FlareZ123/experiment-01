'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const root = path.resolve(__dirname, '..');
const readJson = relative => JSON.parse(
  fs.readFileSync(path.join(root, relative), 'utf8')
);

const roster = readJson('results/aichi-2026/full-decklists.json');
const crosswalk = readJson(
  'results/aichi-2026/2026-11/agent39-xyp-japanese-print-crosswalk-20261113.json'
);
const xypCards = readJson('resources/cards/en/xyp.json');

test('all Aichi XYP source rows have a pre-event Japanese print crosswalk', () => {
  assert.equal(crosswalk.event_date, '2026-05-10');
  assert.equal(crosswalk.coverage.source_rows, 9);
  assert.equal(crosswalk.coverage.physical_copies, 12);
  assert.equal(crosswalk.coverage.distinct_english_printings, 3);

  const sourceRows = roster.decks.flatMap(deck =>
    deck.cards
      .filter(card => card.printing?.set === 'XYP')
      .map(card => ({
        rank: deck.rank,
        player: deck.player,
        name: card.name,
        count: card.count,
        number: String(card.printing.number)
      }))
  );
  const crosswalkRows = crosswalk.cards.flatMap(card =>
    card.source_rows.map(row => ({
      rank: row.rank,
      player: row.player,
      name: card.name,
      count: row.count,
      number: String(card.english_printing.number),
      cardId: card.english_printing.card_id
    }))
  );

  assert.equal(sourceRows.length, 9);
  assert.equal(sourceRows.reduce((sum, row) => sum + row.count, 0), 12);
  assert.equal(crosswalkRows.length, 9);
  assert.equal(crosswalkRows.reduce((sum, row) => sum + row.count, 0), 12);

  for (const row of sourceRows) {
    assert.ok(crosswalkRows.some(mapped =>
      mapped.rank === row.rank &&
      mapped.player === row.player &&
      mapped.name === row.name &&
      mapped.count === row.count &&
      mapped.number === row.number
    ), `unmapped XYP source row: ${JSON.stringify(row)}`);
  }

  for (const mapped of crosswalk.cards) {
    const english = xypCards.find(card => card.id === mapped.english_printing.card_id);
    assert.ok(english, `missing English card ${mapped.english_printing.card_id}`);
    assert.equal(english.name, mapped.name);
    assert.equal(english.legalities?.expanded, 'Legal');
    assert.equal(mapped.english_printing.expanded_legality, 'Legal');
    assert.ok(mapped.official_card_url.startsWith(
      'https://www.pokemon-card.com/card-search/details.php/card/'
    ));
    assert.ok(mapped.matching_text.length > 0);

    const availability = mapped.availability.earliest_evidence || mapped.availability.start;
    const year = Number(String(availability).slice(0, 4));
    assert.ok(Number.isFinite(year) && year < 2026,
      `Japanese print not shown pre-event for ${mapped.name}`);
  }

  const regirockRanks = crosswalk.cards.find(card => card.name === 'Regirock')
    .source_rows.map(row => row.rank).sort((a, b) => a - b);
  assert.deepEqual(regirockRanks, [3, 7]);

  const karenRanks = crosswalk.cards.find(card => card.name === 'Karen')
    .source_rows.map(row => row.rank).sort((a, b) => a - b);
  assert.deepEqual(karenRanks, [2, 5, 8, 15, 16, 22]);
});
