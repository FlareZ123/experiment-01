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

test('resolves by source set + printed set number and emits Twinleaf fullName', () => {
  const cards = [
    { set: 'CRE', setNumber: '74', fullName: 'Shadow Rider Calyrex V CRE' },
    { set: 'PHF', setNumber: '92', fullName: 'Battle Compressor PHF' },
    { set: 'SVE', setNumber: '5', fullName: 'Psychic Energy SVE' },
    { set: 'XYP', setNumber: '177', fullName: 'Karen XYP' },
    { set: 'SMP', setNumber: '217', fullName: 'Trevenant & Dusknoir-GX SMP' },
    { set: 'XYP', setNumber: '67', fullName: 'Jirachi XYP' },
  ];
  const input = field([
    row({ index: 0, cardId: 'swsh6-74', name: 'Shadow Rider Calyrex V', count: 3, set: 'CRE', sourceNumber: '74', cardPoolNumber: '74' }),
    row({ index: 1, cardId: 'xy4-92', name: 'Battle Compressor Team Flare Gear', count: 1, set: 'PHF', sourceNumber: '92', cardPoolNumber: '92' }),
    row({ index: 2, cardId: 'sve-5', name: 'Basic Psychic Energy', count: 53, set: 'SVE', sourceNumber: '5', cardPoolNumber: '5' }),
    row({ index: 3, cardId: 'xyp-XY177', name: 'Karen', count: 1, set: 'XYP', sourceNumber: '177', cardPoolNumber: 'XY177' }),
    row({ index: 4, cardId: 'smp-SM217', name: 'Trevenant & Dusknoir-GX', count: 1, set: 'SMP', sourceNumber: '217', cardPoolNumber: 'SM217' }),
    row({ index: 5, cardId: 'xyp-XY67', name: 'Jirachi', count: 1, set: 'XYP', sourceNumber: '67', cardPoolNumber: 'XY67' }),
  ]);
  const result = resolveDiagnosticField(input, mockManager(cards), { twinleaf_revision: 'test-rev' });
  assert.equal(result.status, 'complete');
  assert.equal(result.resolved_source_rows, 6);
  assert.equal(result.complete_deck_count, 1);
  assert.deepEqual(result.decks[0].registered60_counts, [
    { printing: 'Battle Compressor PHF', copies: 1 },
    { printing: 'Jirachi XYP', copies: 1 },
    { printing: 'Karen XYP', copies: 1 },
    { printing: 'Psychic Energy SVE', copies: 53 },
    { printing: 'Shadow Rider Calyrex V CRE', copies: 3 },
    { printing: 'Trevenant & Dusknoir-GX SMP', copies: 1 },
  ]);
  assert.equal(result.decks[0].registered60.length, 60);
  assert.deepEqual(result.decks[0].registered60.slice(0, 3), [
    'Battle Compressor PHF', 'Jirachi XYP', 'Karen XYP',
  ]);
  assert.equal(result.decks[0].registered60.filter(name => name === 'Psychic Energy SVE').length, 53);
  assert.deepEqual(result.decks[0].decklist_for_seat, {
    id: 'aichi-2026-rank-1',
    cards: result.decks[0].registered60,
  });
  assert.equal(result.decks[0].source_row_mappings[1].twinleaf_full_name, 'Battle Compressor PHF');
  assert.equal(result.decks[0].source_row_mappings[3].set_number, '177');
  assert.equal(result.decks[0].source_row_mappings[3].source_printing.number, '177');
  assert.equal(result.decks[0].source_row_mappings[3].card_pool_printing.number, 'XY177');
  assert.equal(result.decks[0].source_row_mappings[4].set_number, '217');
  assert.equal(result.decks[0].source_row_mappings[4].card_pool_printing.number, 'SM217');
  assert.equal(result.decks[0].source_row_mappings[5].set_number, '67');
  assert.equal(result.decks[0].source_row_mappings[5].card_pool_printing.number, 'XY67');
  assert.equal(result.identity_join, 'normalized.printing.set + normalized.printing.number -> Twinleaf Card.set + Card.setNumber -> Card.fullName; card_pool_printing.number is not the engine setNumber');
  assert.equal(result.diagnostic_only, true);
  assert.equal(result.diagnostic_reconstruction_eligible, true);
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
  assert.deepEqual(result.decks[0].registered60_counts, [{ printing: 'Shadow Rider Calyrex V CRE', copies: 60 }]);
  assert.equal(result.decks[0].registered60.length, 60);
  assert.equal(result.decks[0].decklist_for_seat.cards.length, 60);
});

test('fails closed on missing Twinleaf card', () => {
  const input = field([
    row({ index: 0, cardId: 'xy4-92', name: 'Battle Compressor Team Flare Gear', count: 60, set: 'PHF', sourceNumber: '92', cardPoolNumber: '92' }),
  ]);
  const result = resolveDiagnosticField(input, mockManager([]));
  assert.equal(result.status, 'incomplete');
  assert.equal(result.decks[0].registered60, null);
  assert.equal(result.decks[0].registered60_counts, null);
  assert.equal(result.decks[0].decklist_for_seat, null);
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


test('fails closed when a resolved deck has fewer than 60 copies', () => {
  const cards = [{ set: 'CRE', setNumber: '74', fullName: 'Shadow Rider Calyrex V CRE' }];
  const input = field([
    row({ index: 0, cardId: 'swsh6-74', name: 'Shadow Rider Calyrex V', count: 59, set: 'CRE', sourceNumber: '74', cardPoolNumber: '74' }),
  ]);
  input.card_copies = 59;
  input.decks[0].card_copies = 59;
  const result = resolveDiagnosticField(input, mockManager(cards));
  assert.equal(result.status, 'incomplete');
  assert.equal(result.decks[0].registered60, null);
  assert.ok(result.unresolved.some(item => item.status === 'deck_card_copy_count_mismatch'));
});
