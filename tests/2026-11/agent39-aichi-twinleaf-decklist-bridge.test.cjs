'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { createHash } = require('node:crypto');
const {
  resolveDiagnosticField,
  registered60Hashes,
  normalizedDeckIdentityHashes,
  indexTwinleafCards,
  resolveNormalizedRow,
} = require('./agent39-aichi-twinleaf-decklist-bridge.cjs');

function sha256(value) {
  return createHash('sha256').update(value, 'utf8').digest('hex');
}

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
      card_text_sha256: input.cardTextSha256 || 'a'.repeat(64),
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
    target_format: 'paper Expanded (Black & White onward)',
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
  const result = resolveDiagnosticField(input, mockManager(cards), {
    twinleaf_revision: 'test-rev',
    research_revision: 'research-rev',
    source_audit_sha256: 'a'.repeat(64),
    source_normalized_field_sha256: 'b'.repeat(64),
  });
  assert.equal(result.status, 'complete');
  assert.equal(result.decks[0].unresolved_source_rows, 0);
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
  const deck = result.decks[0];
  const canonicalPairs = deck.registered60_counts.map(row => ({
    fullName: row.printing,
    copies: row.copies,
  })).sort((a, b) => a.fullName < b.fullName ? -1 : a.fullName > b.fullName ? 1 : 0);
  assert.equal(deck.registered60_hashes.algorithm, 'SHA-256');
  assert.equal(deck.registered60_hashes.ordered_input_sha256,
    sha256(JSON.stringify(deck.registered60)));
  assert.equal(deck.registered60_hashes.canonical_multiset_sha256,
    sha256(JSON.stringify(canonicalPairs)));
  assert.match(deck.registered60_hashes.ordered_input_sha256, /^[a-f0-9]{64}$/);
  assert.match(deck.registered60_hashes.canonical_multiset_sha256, /^[a-f0-9]{64}$/);
  assert.match(result.registered60_hash_protocol.ordered_input, /exact 60-element Twinleaf fullName array/);
  assert.match(result.registered60_hash_protocol.canonical_multiset, /UTF-16 code-unit-sorted/);
  assert.match(result.decks[0].deck_identity_sha256, /^[a-f0-9]{64}$/);
  assert.match(result.decks[0].source_print_identity_sha256, /^[a-f0-9]{64}$/);
  assert.equal(result.decks[0].source_identity_hash_status, 'complete');
  assert.deepEqual({
    deck_identity_sha256: result.decks[0].deck_identity_sha256,
    source_print_identity_sha256: result.decks[0].source_print_identity_sha256,
  }, normalizedDeckIdentityHashes(input.decks[0]));
  assert.match(result.deck_identity_hash_protocol, /UTF-16 code-unit string comparison/);
  assert.match(result.source_print_identity_hash_protocol, /UTF-16 code-unit string comparison/);
  assert.equal(result.source_audit_sha256, 'a'.repeat(64));
  assert.equal(result.source_normalized_field_sha256, 'b'.repeat(64));
  assert.equal(result.research_revision, 'research-rev');
  assert.equal(result.decks[0].source_row_mappings[1].twinleaf_full_name, 'Battle Compressor PHF');
  assert.equal(result.decks[0].source_row_mappings[3].set_number, '177');
  assert.equal(result.decks[0].source_row_mappings[3].source_printing.number, '177');
  assert.equal(result.decks[0].source_row_mappings[3].card_pool_printing.number, 'XY177');
  assert.equal(result.decks[0].source_row_mappings[4].set_number, '217');
  assert.equal(result.decks[0].source_row_mappings[4].card_pool_printing.number, 'SM217');
  assert.equal(result.decks[0].source_row_mappings[5].set_number, '67');
  assert.equal(result.decks[0].source_row_mappings[5].card_pool_printing.number, 'XY67');
  assert.equal(result.identity_join, 'normalized.printing.set + normalized.printing.number -> exact Twinleaf print when present; otherwise exact source-keyed engine proxy (ASC/196 -> SFA/61) -> Twinleaf Card.set + Card.setNumber -> Card.fullName; source_printing and card_pool_printing remain unchanged');
  assert.equal(result.diagnostic_only, true);
  assert.equal(result.diagnostic_reconstruction_eligible, true);
  assert.equal(result.paper_admission_eligible, false);
  assert.equal(result.competitive_admission_eligible, false);
});


test('resolves the exact Night Stretcher ASC/196 source through SFA/61 without rewriting source identity', () => {
  const cards = [{ set: 'SFA', setNumber: '61', fullName: 'Night Stretcher SFA' }];
  const input = field([
    row({
      index: 0,
      cardId: 'me2pt5-196',
      name: 'Night Stretcher',
      count: 60,
      set: 'ASC',
      sourceNumber: '196',
      cardPoolNumber: '196',
    }),
  ]);
  const result = resolveDiagnosticField(input, mockManager(cards));
  assert.equal(result.status, 'complete');
  const mapping = result.decks[0].source_row_mappings[0];
  assert.deepEqual(mapping.source_printing, {
    set: 'ASC', number: '196', display_language: 'en',
  });
  assert.deepEqual(mapping.card_pool_printing, {
    set_id: 'me2pt5', number: '196', language: 'en',
  });
  assert.equal(mapping.set, 'SFA');
  assert.equal(mapping.set_number, '61');
  assert.equal(mapping.twinleaf_full_name, 'Night Stretcher SFA');
  assert.deepEqual(result.decks[0].registered60_counts, [
    { printing: 'Night Stretcher SFA', copies: 60 },
  ]);
  assert.equal(result.decks[0].registered60.length, 60);
  assert.deepEqual({
    deck_identity_sha256: result.decks[0].deck_identity_sha256,
    source_print_identity_sha256: result.decks[0].source_print_identity_sha256,
  }, normalizedDeckIdentityHashes(input.decks[0]));
});


test('prefers the exact ASC/196 Twinleaf print if a future pinned revision registers it', () => {
  const cards = [
    { set: 'ASC', setNumber: '196', fullName: 'Night Stretcher ASC' },
    { set: 'SFA', setNumber: '61', fullName: 'Night Stretcher SFA' },
  ];
  const sourceRow = row({
    index: 0,
    cardId: 'me2pt5-196',
    name: 'Night Stretcher',
    count: 1,
    set: 'ASC',
    sourceNumber: '196',
    cardPoolNumber: '196',
  });
  const manager = mockManager(cards);
  const resolved = resolveNormalizedRow(sourceRow, indexTwinleafCards(manager), manager);
  assert.equal(resolved.status, 'resolved');
  assert.equal(resolved.set, 'ASC');
  assert.equal(resolved.set_number, '196');
  assert.equal(resolved.full_name, 'Night Stretcher ASC');
});

test('Night Stretcher proxy is exact and fails closed for nearby source identities', () => {
  const manager = mockManager([
    { set: 'SFA', setNumber: '61', fullName: 'Night Stretcher SFA' },
  ]);
  const index = indexTwinleafCards(manager);
  const negativeControls = [
    row({
      index: 0, cardId: 'me2pt5-195', name: 'Night Stretcher', count: 1,
      set: 'ASC', sourceNumber: '195', cardPoolNumber: '195',
    }),
    row({
      index: 1, cardId: 'other-196', name: 'Night Stretcher', count: 1,
      set: 'ASC', sourceNumber: '196', cardPoolNumber: '196',
    }),
    row({
      index: 2, cardId: 'me2pt5-196', name: 'Other Item', count: 1,
      set: 'ASC', sourceNumber: '196', cardPoolNumber: '196',
    }),
  ];
  for (const sourceRow of negativeControls) {
    assert.equal(
      resolveNormalizedRow(sourceRow, index, manager).status,
      'missing_twinleaf_card',
    );
  }
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
  assert.ok(result.decks[0].registered60_hashes);
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
  assert.equal(result.decks[0].registered60_hashes, null);
  assert.equal(result.decks[0].unresolved_source_rows, 1);
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
  assert.equal(result.decks[0].registered60_hashes, null);
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
  assert.equal(result.decks[0].registered60_hashes, null);
  assert.ok(result.unresolved.some(item => item.status === 'deck_card_copy_count_mismatch'));
});


test('ordered input hash binds exact engine order while canonical multiset hash ignores order', () => {
  const firstOrder = [
    ...Array(30).fill('Alpha Card SET'),
    ...Array(30).fill('Beta Card SET'),
  ];
  const secondOrder = [
    ...Array(30).fill('Beta Card SET'),
    ...Array(30).fill('Alpha Card SET'),
  ];
  const rows = [
    { printing: 'Alpha Card SET', copies: 30 },
    { printing: 'Beta Card SET', copies: 30 },
  ];
  const first = registered60Hashes(firstOrder, rows);
  const second = registered60Hashes(secondOrder, rows.slice().reverse());
  assert.notEqual(first.ordered_input_sha256, second.ordered_input_sha256);
  assert.equal(first.canonical_multiset_sha256, second.canonical_multiset_sha256);
});

test('registered60 hash helper rejects disagreement between the exact array and compressed counts', () => {
  assert.throws(() => registered60Hashes(
    Array(60).fill('Alpha Card SET'),
    [{ printing: 'Alpha Card SET', copies: 59 }],
  ), /inputs disagree/);
});


test('functional identity hash ignores printing while source-print identity hash preserves it', () => {
  const rows = [
    row({ index: 0, cardId: 'xy1-1', name: 'Alpha', count: 30, set: 'SET', sourceNumber: '1', cardPoolNumber: '1', cardTextSha256: 'a'.repeat(64) }),
    row({ index: 1, cardId: 'xy1-2', name: 'Beta', count: 30, set: 'SET', sourceNumber: '2', cardPoolNumber: '2', cardTextSha256: 'b'.repeat(64) }),
  ];
  const original = normalizedDeckIdentityHashes({ cards: rows });
  const reversed = normalizedDeckIdentityHashes({ cards: rows.slice().reverse() });
  assert.deepEqual(reversed, original);

  const reprinted = JSON.parse(JSON.stringify(rows));
  reprinted[0].normalized.printing.number = '101';
  reprinted[0].normalized.card_pool_printing.number = '101';
  const afterReprint = normalizedDeckIdentityHashes({ cards: reprinted });
  assert.equal(afterReprint.deck_identity_sha256, original.deck_identity_sha256);
  assert.notEqual(afterReprint.source_print_identity_sha256, original.source_print_identity_sha256);

  const changedText = JSON.parse(JSON.stringify(rows));
  changedText[0].normalized.card_text_sha256 = 'c'.repeat(64);
  const afterTextChange = normalizedDeckIdentityHashes({ cards: changedText });
  assert.notEqual(afterTextChange.deck_identity_sha256, original.deck_identity_sha256);
  assert.notEqual(afterTextChange.source_print_identity_sha256, original.source_print_identity_sha256);
});

test('normalized source identity hashes fail closed when card text identity is missing', () => {
  const incomplete = row({
    index: 0, cardId: 'xy1-1', name: 'Alpha', count: 60,
    set: 'SET', sourceNumber: '1', cardPoolNumber: '1',
  });
  delete incomplete.normalized.card_text_sha256;
  assert.equal(normalizedDeckIdentityHashes({ cards: [incomplete] }), null);
});
