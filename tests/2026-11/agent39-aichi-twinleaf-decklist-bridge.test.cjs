'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { resolveDiagnosticField } = require('./agent39-aichi-twinleaf-decklist-bridge.cjs');

function mockManager(cards) {
  const byName = new Map(cards.map(card => [card.fullName, card]));
  return {
    getAllCards: () => cards,
    isCardDefined: name => byName.has(name),
    getCardByName: name => {
      if (!byName.has(name)) throw new Error('Unknown card ' + name);
      return byName.get(name);
    },
  };
}

function row(input) {
  return {
    source: {
      row_index: input.index,
      name: input.name,
      printing: { set: input.set, number: input.sourceNumber, display_language: 'en' },
    },
    normalized: {
      card_id: input.cardId,
      name: input.name,
      count: input.count,
      printing: { set: input.set, number: input.sourceNumber, language: 'en' },
      card_pool_printing: { set_id: input.cardId.split('-')[0], number: input.cardPoolNumber, language: 'en' },
    },
  };
}

function field(cards) {
  return {
    schema: 'aichi-identity-normalized-expanded-diagnostic-decklists-v1',
    status: 'identity_normalized_expanded_diagnostic_only',
    diagnostic_only: true,
    physical_source_print_status: 'unverified',
    paper_admission_eligible: false,
    competitive_admission_eligible: false,
    target_format: 'paper Expanded',
    source_event_format: 'Japanese Extra',
    deck_count: 1,
    included_ranks: [1],
    source_rows: cards.length,
    card_copies: 60,
    decks: [{
      rank: 1,
      player: 'Test',
      archetype: 'Test',
      source_row_count: cards.length,
      card_copies: 60,
      cards: cards,
    }],
  };
}

test('resolves by set + canonical setNumber and emits Twinleaf fullName', () => {
  const cards = [
    { set: 'CRE', setNumber: '74', fullName: 'Shadow Rider Calyrex V CRE' },
    { set: 'PHF', setNumber: '92', fullName: 'Battle Compressor PHF' },
    { set: 'SVE', setNumber: '5', fullName: 'Psychic Energy SVE' },
    { set: 'XYP', setNumber: 'XY177', fullName: 'Karen XYP' },
  ];
  const input = field([
    row({ index: 0, cardId: 'swsh6-74', name: 'Shadow Rider Calyrex V', count: 3, set: 'CRE', sourceNumber: '74', cardPoolNumber: '74' }),
    row({ index: 1, cardId: 'xy4-92', name: 'Battle Compressor Team Flare Gear', count: 1, set: 'PHF', sourceNumber: '92', cardPoolNumber: '92' }),
    row({ index: 2, cardId: 'sve-5', name: 'Basic Psychic Energy', count: 55, set: 'SVE', sourceNumber: '5', cardPoolNumber: '5' }),
    row({ index: 3, cardId: 'xyp-XY177', name: 'Karen', count: 1, set: 'XYP', sourceNumber: '177', cardPoolNumber: 'XY177' }),
  ]);
  const result = resolveDiagnosticField(input, mockManager(cards), { twinleaf_revision: 'test-rev' });
  assert.equal(result.status, 'complete');
  assert.equal(result.resolved_source_rows, 4);
  assert.equal(result.complete_deck_count, 1);
  assert.deepEqual(result.decks[0].registered60, [
    { printing: 'Battle Compressor PHF', copies: 1 },
    { printing: 'Karen XYP', copies: 1 },
    { printing: 'Psychic Energy SVE', copies: 55 },
    { printing: 'Shadow Rider Calyrex V CRE', copies: 3 },
  ]);
  assert.equal(result.decks[0].source_row_mappings[1].twinleaf_full_name, 'Battle Compressor PHF');
  assert.equal(result.decks[0].source_row_mappings[3].set_number, 'XY177');
  assert.equal(result.decks[0].source_row_mappings[3].source_printing.number, '177');
  assert.equal(result.identity_join, 'Twinleaf Card.set + Card.setNumber -> Card.fullName; never join on display name alone');
  assert.equal(result.diagnostic_only, true);
  assert.equal(result.paper_admission_eligible, false);
  assert.equal(result.competitive_admission_eligible, false);
});

test('merges duplicate source rows that resolve to the same Twinleaf printing', () => {
  const cards = [{ set: 'CRE', setNumber: '74', fullName: 'Shadow Rider Calyrex V CRE' }];
  const input = field([
    row({ index: 0, cardId: 'swsh6-74', name: 'Shadow Rider Calyrex V', count: 30, set: 'CRE', sourceNumber: '74', cardPoolNumber: '74' }),
    row({ index: 1, cardId: 'swsh6-74', name: 'Shadow Rider Calyrex V', count: 30, set: 'CRE', sourceNumber: '74', cardPoolNumber: '74' }),
  ]);
  const result = resolveDiagnosticField(input, mockManager(cards));
  assert.equal(result.status, 'complete');
  assert.deepEqual(result.decks[0].registered60, [{ printing: 'Shadow Rider Calyrex V CRE', copies: 60 }]);
});

test('fails closed on missing Twinleaf card', () => {
  const input = field([
    row({ index: 0, cardId: 'xy4-92', name: 'Battle Compressor Team Flare Gear', count: 60, set: 'PHF', sourceNumber: '92', cardPoolNumber: '92' }),
  ]);
  const result = resolveDiagnosticField(input, mockManager([]));
  assert.equal(result.status, 'incomplete');
  assert.equal(result.decks[0].registered60, null);
  assert.equal(result.unresolved[0].status, 'missing_twinleaf_card');
});

test('fails closed on ambiguous set + setNumber', () => {
  const cards = [
    { set: 'TEU', setNumber: '51', fullName: 'Tapu Koko Prism Star TEU' },
    { set: 'TEU', setNumber: '51', fullName: 'Tapu Koko Alternate TEU' },
  ];
  const input = field([
    row({ index: 0, cardId: 'sm9-51', name: 'Tapu Koko ◇', count: 60, set: 'TEU', sourceNumber: '51', cardPoolNumber: '51' }),
  ]);
  const result = resolveDiagnosticField(input, mockManager(cards));
  assert.equal(result.status, 'incomplete');
  assert.equal(result.unresolved[0].status, 'ambiguous_twinleaf_card');
});

test('fails closed when declared source row or copy totals disagree', () => {
  const cards = [{ set: 'CRE', setNumber: '74', fullName: 'Shadow Rider Calyrex V CRE' }];
  const input = field([
    row({ index: 0, cardId: 'swsh6-74', name: 'Shadow Rider Calyrex V', count: 60, set: 'CRE', sourceNumber: '74', cardPoolNumber: '74' }),
  ]);
  input.decks[0].source_row_count = 2;
  const result = resolveDiagnosticField(input, mockManager(cards));
  assert.equal(result.status, 'incomplete');
  assert.equal(result.decks[0].registered60, null);
  assert.ok(result.unresolved.some(item => item.status === 'deck_source_row_count_mismatch'));
});
