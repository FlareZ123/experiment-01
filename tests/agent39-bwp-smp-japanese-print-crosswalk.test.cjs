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
  'results/aichi-2026/2026-11/agent39-bwp-smp-japanese-print-crosswalk-20261113.json'
);
const bwp = readJson('resources/cards/en/bwp.json');
const smp = readJson('resources/cards/en/smp.json');

test('Aichi Tropical Beach and Trevenant-GX rows have pre-event Japanese print bridges', () => {
  assert.equal(crosswalk.coverage.source_rows, 4);
  assert.equal(crosswalk.coverage.physical_copies, 5);

  const sourceRows = roster.decks.flatMap(deck =>
    deck.cards
      .filter(card =>
        (card.printing?.set === 'BWP' && String(card.printing?.number) === '50') ||
        (card.printing?.set === 'SMP' && String(card.printing?.number) === '217'))
      .map(card => ({
        rank: deck.rank,
        player: deck.player,
        name: card.name,
        count: card.count,
        set: card.printing.set,
        number: String(card.printing.number)
      }))
  );
  const mappedRows = crosswalk.cards.flatMap(card =>
    card.source_rows.map(row => ({
      rank: row.rank,
      player: row.player,
      name: card.name,
      count: row.count,
      set: card.english_printing.set,
      number: String(card.english_printing.number),
      cardId: card.english_printing.card_id
    }))
  );

  assert.equal(sourceRows.length, 4);
  assert.equal(sourceRows.reduce((sum, row) => sum + row.count, 0), 5);
  assert.equal(mappedRows.length, 4);
  assert.equal(mappedRows.reduce((sum, row) => sum + row.count, 0), 5);

  for (const row of sourceRows) {
    assert.ok(mappedRows.some(mapped =>
      mapped.rank === row.rank &&
      mapped.player === row.player &&
      mapped.name === row.name &&
      mapped.count === row.count &&
      mapped.set === row.set &&
      mapped.number === row.number
    ), `unmapped source row: ${JSON.stringify(row)}`);
  }

  for (const mapped of crosswalk.cards) {
    const pool = mapped.english_printing.set === 'BWP' ? bwp : smp;
    const english = pool.find(card => card.id === mapped.english_printing.card_id);
    assert.ok(english, `missing English card ${mapped.english_printing.card_id}`);
    assert.equal(english.name, mapped.name);
    assert.equal(english.legalities?.expanded, 'Legal');
    assert.equal(mapped.english_printing.expanded_legality, 'Legal');
    assert.ok(mapped.matching_text.length > 0);
  }

  const tropical = crosswalk.cards.find(card => card.name === 'Tropical Beach');
  assert.equal(tropical.japanese_printing.number, '050/BW-P');
  assert.ok(tropical.availability.available_by.includes('2012'));
  assert.ok(tropical.official_card_url.startsWith('https://www.pokemon-card.com/'));

  const trevenant = crosswalk.cards.find(card => card.name === 'Trevenant & Dusknoir-GX');
  assert.equal(trevenant.availability.date, '2019-10-04');
  assert.deepEqual(trevenant.japanese_printings.map(card => card.number), ['179/173', '053/173']);

  const combined = crosswalk.combined_manual_crosswalk_status;
  assert.deepEqual(combined.raw_english_only_metadata_census, { rows: 57, copies: 151 });
  assert.deepEqual(combined.japanese_pre_event_bridged.total, { rows: 13, copies: 17 });
  assert.deepEqual(combined.remaining_without_japanese_print_bridge, { rows: 44, copies: 134 });
  assert.equal(combined.non_energy_unbridged_promo_copies, 14);
});
