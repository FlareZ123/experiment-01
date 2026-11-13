'use strict';

/*
 * Fail-closed bridge from the Aichi normalized diagnostic field to Twinleaf's
 * registered-deck input. It joins on Twinleaf Card.set + Card.setNumber and
 * emits matched Card.fullName strings for the MCTS deck provider.
 * Requires the pinned Twinleaf submodule built under vendor/twinleaf.
 * A complete mapping is not paper-format or physical-print admission.
 */

const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const { createHash } = require('node:crypto');

function compositeKey(set, setNumber) {
  return String(set) + String.fromCharCode(0) + String(setNumber);
}

function sha256Utf8(value) {
  return createHash('sha256').update(value, 'utf8').digest('hex');
}

function canonicalJson(value) {
  if (Array.isArray(value)) {
    return '[' + value.map(canonicalJson).join(',') + ']';
  }
  if (value && typeof value === 'object') {
    return '{' + Object.keys(value).sort().map(key =>
      JSON.stringify(key) + ':' + canonicalJson(value[key])
    ).join(',') + '}';
  }
  return JSON.stringify(value);
}

function compareText(left, right) {
  return left < right ? -1 : left > right ? 1 : 0;
}

function normalizedDeckIdentityHashes(deck) {
  if (!deck || !Array.isArray(deck.cards)) return null;
  const functionalRows = [];
  const sourcePrintRows = [];
  for (const row of deck.cards) {
    const normalized = row && row.normalized;
    const printing = normalized && normalized.printing;
    const cardPoolPrinting = normalized && normalized.card_pool_printing;
    if (!normalized || typeof normalized.card_id !== 'string' || !normalized.card_id ||
        typeof normalized.card_text_sha256 !== 'string' || !/^[a-f0-9]{64}$/i.test(normalized.card_text_sha256) ||
        !Number.isSafeInteger(normalized.count) || normalized.count < 1 ||
        !printing || typeof printing.set !== 'string' || !printing.set ||
        typeof printing.number !== 'string' || !printing.number ||
        !cardPoolPrinting || typeof cardPoolPrinting.set_id !== 'string' || !cardPoolPrinting.set_id ||
        typeof cardPoolPrinting.number !== 'string' || !cardPoolPrinting.number) {
      return null;
    }
    functionalRows.push({
      card_id: normalized.card_id,
      count: normalized.count,
      card_text_sha256: normalized.card_text_sha256,
    });
    sourcePrintRows.push({
      card_id: normalized.card_id,
      count: normalized.count,
      card_text_sha256: normalized.card_text_sha256,
      printing: printing,
      card_pool_printing: cardPoolPrinting,
    });
  }
  functionalRows.sort((a, b) =>
    compareText(a.card_id, b.card_id) ||
    compareText(a.card_text_sha256, b.card_text_sha256) ||
    a.count - b.count
  );
  sourcePrintRows.sort((a, b) =>
    compareText(a.card_id, b.card_id) ||
    compareText(a.printing.set, b.printing.set) ||
    compareText(a.printing.number, b.printing.number) ||
    a.count - b.count
  );
  return {
    deck_identity_sha256: sha256Utf8(canonicalJson(functionalRows)),
    source_print_identity_sha256: sha256Utf8(canonicalJson(sourcePrintRows)),
  };
}

function registered60Hashes(registered60, registered60Counts) {
  if (!Array.isArray(registered60) || registered60.length !== 60 ||
      registered60.some(fullName => typeof fullName !== 'string' || !fullName)) {
    throw new TypeError('registered60 hash input must be exactly 60 non-empty Twinleaf fullName strings');
  }
  if (!Array.isArray(registered60Counts)) {
    throw new TypeError('registered60Counts must be an array');
  }

  const aggregated = new Map();
  for (const row of registered60Counts) {
    if (!row || typeof row.printing !== 'string' || !row.printing ||
        !Number.isSafeInteger(row.copies) || row.copies < 1) {
      throw new TypeError('registered60Counts rows require a fullName printing and positive integer copies');
    }
    aggregated.set(row.printing, (aggregated.get(row.printing) || 0) + row.copies);
  }

  const canonicalPairs = Array.from(aggregated, ([fullName, copies]) => ({
    fullName: fullName,
    copies: copies,
  })).sort((a, b) => a.fullName < b.fullName ? -1 : a.fullName > b.fullName ? 1 : 0);

  const expandedCounts = new Map();
  for (const fullName of registered60) {
    expandedCounts.set(fullName, (expandedCounts.get(fullName) || 0) + 1);
  }
  if (expandedCounts.size !== canonicalPairs.length ||
      canonicalPairs.some(row => expandedCounts.get(row.fullName) !== row.copies) ||
      canonicalPairs.reduce((sum, row) => sum + row.copies, 0) !== 60) {
    throw new Error('registered60 hash inputs disagree; refusing to emit inconsistent deck hashes');
  }

  return {
    algorithm: 'SHA-256',
    ordered_input_sha256: sha256Utf8(JSON.stringify(registered60)),
    canonical_multiset_sha256: sha256Utf8(JSON.stringify(canonicalPairs)),
  };
}

const REGISTERED60_HASH_PROTOCOL = {
  algorithm: 'SHA-256',
  ordered_input: 'UTF-8 bytes of compact JSON.stringify(registered60), the exact 60-element Twinleaf fullName array passed as decklist_for_seat.cards; entries are ordered by UTF-16 code-unit ascending fullName',
  canonical_multiset: 'UTF-8 bytes of compact JSON.stringify(UTF-16 code-unit-sorted [{fullName,copies}]); duplicate fullName rows are aggregated before hashing',
};

function indexTwinleafCards(cardManager) {
  if (!cardManager || typeof cardManager.getAllCards !== 'function') {
    throw new TypeError('cardManager.getAllCards() is required');
  }
  const cards = cardManager.getAllCards();
  if (!Array.isArray(cards)) throw new TypeError('getAllCards() must return an array');
  const index = new Map();
  for (const card of cards) {
    const set = String(card && card.set != null ? card.set : '');
    const setNumber = String(card && card.setNumber != null ? card.setNumber : '');
    const fullName = String(card && card.fullName != null ? card.fullName : '');
    if (!set || !setNumber || !fullName) continue;
    const key = compositeKey(set, setNumber);
    const matches = index.get(key) || [];
    matches.push(card);
    index.set(key, matches);
  }
  return index;
}

function resolveNormalizedRow(row, index, cardManager) {
  const normalized = row && row.normalized;
  const set = String(normalized && normalized.printing && normalized.printing.set || '');
  const setNumber = String(normalized && normalized.printing && normalized.printing.number || '');
  const count = normalized && normalized.count;
  if (!set || !setNumber) return { status: 'invalid_identity_key', set: set, set_number: setNumber };
  if (!Number.isSafeInteger(count) || count < 1) {
    return { status: 'invalid_copy_count', set: set, set_number: setNumber, count: count };
  }
  const matches = index.get(compositeKey(set, setNumber)) || [];
  if (matches.length === 0) return { status: 'missing_twinleaf_card', set: set, set_number: setNumber };
  if (matches.length !== 1) {
    return { status: 'ambiguous_twinleaf_card', set: set, set_number: setNumber, match_count: matches.length };
  }
  const card = matches[0];
  const fullName = String(card.fullName || '');
  if (!fullName || String(card.set) !== set || String(card.setNumber) !== setNumber) {
    return { status: 'twinleaf_record_mismatch', set: set, set_number: setNumber, full_name: fullName };
  }
  if (typeof cardManager.isCardDefined === 'function' && !cardManager.isCardDefined(fullName)) {
    return { status: 'card_manager_rejects_full_name', set: set, set_number: setNumber, full_name: fullName };
  }
  if (typeof cardManager.getCardByName === 'function') {
    let lookedUp;
    try {
      lookedUp = cardManager.getCardByName(fullName);
    } catch (error) {
      return {
        status: 'card_manager_lookup_error',
        set: set,
        set_number: setNumber,
        full_name: fullName,
        error: String(error && error.message || error),
      };
    }
    if (!lookedUp || String(lookedUp.fullName || '') !== fullName) {
      return { status: 'card_manager_lookup_mismatch', set: set, set_number: setNumber, full_name: fullName };
    }
  }
  return {
    status: 'resolved',
    set: set,
    set_number: setNumber,
    full_name: fullName,
    card_id: String(normalized.card_id || ''),
    count: count,
  };
}

function resolveDiagnosticField(field, cardManager, metadata) {
  metadata = metadata || {};
  if (!field || !Array.isArray(field.decks)) {
    throw new TypeError('diagnostic_normalized_field.decks is required');
  }
  const index = indexTwinleafCards(cardManager);
  const decks = [];
  const unresolved = [];
  let sourceRows = 0;
  let resolvedRows = 0;

  for (const deck of field.decks) {
    const sourceIdentityHashes = normalizedDeckIdentityHashes(deck);
    const merged = new Map();
    const rowMappings = [];
    let deckUnresolved = 0;
    for (const row of deck.cards || []) {
      const rowIndex = row && row.source && row.source.row_index;
      sourceRows++;
      const resolved = resolveNormalizedRow(row, index, cardManager);
      if (resolved.status !== 'resolved') {
        deckUnresolved++;
        unresolved.push({
          rank: deck.rank,
          source_row_index: rowIndex,
          source_name: row && row.source && row.source.name || null,
          source_printing: row && row.source && row.source.printing || null,
          card_id: row && row.normalized && row.normalized.card_id || null,
          normalized_name: row && row.normalized && row.normalized.name || null,
          card_pool_printing: row && row.normalized && row.normalized.card_pool_printing || null,
          ...resolved,
        });
        rowMappings.push({
          source_row_index: rowIndex,
          status: resolved.status,
          source_name: row && row.source && row.source.name || null,
          source_printing: row && row.source && row.source.printing || null,
          normalized_name: row && row.normalized && row.normalized.name || null,
          card_id: row && row.normalized && row.normalized.card_id || null,
        });
        continue;
      }
      resolvedRows++;
      const existing = merged.get(resolved.full_name) || { printing: resolved.full_name, copies: 0 };
      existing.copies += resolved.count;
      merged.set(resolved.full_name, existing);
      rowMappings.push({
        source_row_index: rowIndex,
        status: 'resolved',
        source_name: row && row.source && row.source.name || null,
        source_printing: row && row.source && row.source.printing || null,
        normalized_name: row && row.normalized && row.normalized.name || null,
        card_id: resolved.card_id,
        card_pool_printing: row && row.normalized && row.normalized.card_pool_printing || null,
        twinleaf_full_name: resolved.full_name,
        set: resolved.set,
        set_number: resolved.set_number,
        copies: resolved.count,
      });
    }

    const registered60Counts = Array.from(merged.values()).sort((a, b) => a.printing < b.printing ? -1 : a.printing > b.printing ? 1 : 0);
    const totalCopies = registered60Counts.reduce((sum, row) => sum + row.copies, 0);
    const sourceRowCountMatchesDeck = Number.isSafeInteger(deck.source_row_count) && rowMappings.length === deck.source_row_count;
    const sourceCardCopyCountMatchesDeck = Number.isSafeInteger(deck.card_copies) && totalCopies === deck.card_copies && totalCopies === 60;
    const complete = deckUnresolved === 0 && sourceRowCountMatchesDeck && sourceCardCopyCountMatchesDeck;
    const registered60 = complete ? registered60Counts.flatMap(row => Array(row.copies).fill(row.printing)) : null;
    const deckHashes = complete ? registered60Hashes(registered60, registered60Counts) : null;
    if (!sourceRowCountMatchesDeck) {
      unresolved.push({ rank: deck.rank, status: 'deck_source_row_count_mismatch', expected: deck.source_row_count, actual: rowMappings.length });
    }
    if (!sourceCardCopyCountMatchesDeck) {
      unresolved.push({ rank: deck.rank, status: 'deck_card_copy_count_mismatch', expected: deck.card_copies, actual: totalCopies });
    }
    decks.push({
      rank: deck.rank,
      player: deck.player,
      archetype: deck.archetype,
      status: complete ? 'complete' : 'incomplete',
      deck_identity_sha256: sourceIdentityHashes ? sourceIdentityHashes.deck_identity_sha256 : null,
      source_print_identity_sha256: sourceIdentityHashes ? sourceIdentityHashes.source_print_identity_sha256 : null,
      source_identity_hash_status: sourceIdentityHashes ? 'complete' : 'invalid_source_identity',
      source_row_count: rowMappings.length,
      declared_source_row_count: deck.source_row_count == null ? null : deck.source_row_count,
      source_row_count_matches: sourceRowCountMatchesDeck,
      resolved_source_rows: rowMappings.filter(row => row.status === 'resolved').length,
      unresolved_source_rows: deckUnresolved,
      source_card_copies: deck.card_copies == null ? null : deck.card_copies,
      card_copies: totalCopies,
      source_card_copy_count_matches: sourceCardCopyCountMatchesDeck,
      registered60: registered60,
      registered60_counts: complete ? registered60Counts : null,
      registered60_hashes: deckHashes,
      decklist_for_seat: complete ? {
        id: 'aichi-2026-rank-' + deck.rank,
        cards: registered60,
      } : null,
      source_row_mappings: rowMappings,
    });
  }

  const completeDecks = decks.filter(deck => deck.status === 'complete').length;
  const totalDeckCopies = decks.reduce((sum, deck) => sum + deck.card_copies, 0);
  const sourceRowCountMatches = Number.isSafeInteger(field.source_rows) && sourceRows === field.source_rows;
  const sourceDeckCountMatches = Number.isSafeInteger(field.deck_count) && decks.length === field.deck_count;
  const sourceCopyCountMatches = Number.isSafeInteger(field.card_copies) && totalDeckCopies === field.card_copies;
  const complete = completeDecks === decks.length && unresolved.length === 0 &&
    sourceRowCountMatches && sourceDeckCountMatches && sourceCopyCountMatches;

  if (!sourceRowCountMatches) unresolved.push({ status: 'source_row_count_mismatch', expected: field.source_rows, actual: sourceRows });
  if (!sourceDeckCountMatches) unresolved.push({ status: 'source_deck_count_mismatch', expected: field.deck_count, actual: decks.length });
  if (!sourceCopyCountMatches) unresolved.push({ status: 'source_card_copy_count_mismatch', expected: field.card_copies, actual: totalDeckCopies });

  return {
    schema: 'aichi-twinleaf-registered60-bridge-v1',
    status: complete ? 'complete' : 'incomplete',
    source_field_schema: field.schema,
    source_field_status: field.status,
    source_field_ranks: field.included_ranks || decks.map(deck => deck.rank),
    source_field_deck_count: field.deck_count,
    source_field_rows: field.source_rows,
    source_field_card_copies: field.card_copies,
    total_deck_card_copies: totalDeckCopies,
    deck_identity_hash_protocol: 'SHA-256 of UTF-8 canonical JSON rows {card_id,count,card_text_sha256}, sorted by (card_id,card_text_sha256,count); print-independent functional identity',
    source_print_identity_hash_protocol: 'SHA-256 of UTF-8 canonical JSON rows {card_id,count,card_text_sha256,printing,card_pool_printing}, sorted by (card_id,printing.set,printing.number,count); exact normalized source-print identity',
    registered60_hash_protocol: REGISTERED60_HASH_PROTOCOL,
    source_audit_sha256: metadata.source_audit_sha256 || null,
    source_normalized_field_sha256: metadata.source_normalized_field_sha256 || null,
    research_revision: metadata.research_revision || null,
    diagnostic_only: field.diagnostic_only === true,
    diagnostic_reconstruction_eligible: field.status === 'identity_normalized_expanded_diagnostic_only' && field.diagnostic_only === true && field.target_format === 'paper Expanded (Black & White onward)',
    physical_source_print_status: field.physical_source_print_status || null,
    paper_admission_eligible: field.paper_admission_eligible === true,
    competitive_admission_eligible: field.competitive_admission_eligible === true,
    target_format: field.target_format || null,
    source_event_format: field.source_event_format || null,
    official_banlist_status: field.official_banlist_status || null,
    official_banlist_report: field.official_banlist_report || null,
    field_manifest: field.field_manifest || null,
    normalization_policy: field.normalization_policy || [],
    source_dataset: field.source_dataset || null,
    interpretation_limit: 'A complete bridge means Twinleaf card identities resolved. When diagnostic_reconstruction_eligible is true, the source field’s separate identity, deck-construction and current-banlist screens support a legal English Expanded diagnostic reconstruction; original physical copies and competitive strength are not established.',
    source_row_count_matches: sourceRowCountMatches,
    source_deck_count_matches: sourceDeckCountMatches,
    source_card_copy_count_matches: sourceCopyCountMatches,
    twinleaf_cards_indexed: Array.from(index.values()).reduce((sum, rows) => sum + rows.length, 0),
    twinleaf_unique_set_number_keys: index.size,
    resolved_source_rows: resolvedRows,
    unresolved_source_rows: unresolved.filter(row => Number.isInteger(row.source_row_index)).length,
    complete_deck_count: completeDecks,
    total_deck_count: decks.length,
    twinleaf_revision: metadata.twinleaf_revision || null,
    identity_join: 'normalized.printing.set + normalized.printing.number -> Twinleaf Card.set + Card.setNumber -> Card.fullName; card_pool_printing.number is not the engine setNumber',
    decks: decks,
    unresolved: unresolved,
  };
}

function loadTwinleafCardManager(repositoryRoot) {
  repositoryRoot = repositoryRoot || path.resolve(__dirname, '../../..');
  const outputDir = path.join(repositoryRoot, 'vendor', 'twinleaf', 'ptcg-server', 'output');
  const CardManager = require(path.join(outputDir, 'game', 'cards', 'card-manager')).CardManager;
  const setExports = require(path.join(outputDir, 'sets'));
  const manager = CardManager.getInstance();
  const initialCardCount = manager.getAllCards().length;
  if (initialCardCount !== 0) throw new Error('CardManager is already populated; run the bridge in a fresh Node process');
  const sets = Object.entries(setExports).filter(entry => Array.isArray(entry[1]) && entry[1].length > 0);
  if (sets.length === 0) throw new Error('Twinleaf output/sets exports no card arrays; build the pinned submodule first');
  const expectedCards = sets.reduce((sum, entry) => sum + entry[1].length, 0);
  for (const entry of sets) manager.defineSet(entry[1]);
  const actualCards = manager.getAllCards().length;
  if (actualCards !== expectedCards) {
    throw new Error('Twinleaf CardManager registered ' + actualCards + ' unique cards from ' + expectedCards + ' set entries; refusing duplicate/overwritten identities');
  }
  return {
    manager: manager,
    set_export_count: sets.length,
    expected_card_count: expectedCards,
    actual_card_count: actualCards,
  };
}

function readTwinleafRevision(repositoryRoot) {
  const submodulePath = path.join(repositoryRoot, 'vendor', 'twinleaf');
  try {
    return execFileSync('git', ['-C', submodulePath, 'rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
  } catch (_) {
    return null;
  }
}

function readResearchRevision(repositoryRoot) {
  try {
    return execFileSync('git', ['-C', repositoryRoot, 'rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
  } catch (_) {
    return null;
  }
}

function runCli(argv) {
  argv = argv || process.argv.slice(2);
  const auditPath = argv[0];
  const outputPath = argv[1];
  if (!auditPath) {
    throw new Error('Usage: node agent39-aichi-twinleaf-decklist-bridge.cjs <aichi-expanded-identity-audit.json> [output.json]');
  }
  const repositoryRoot = path.resolve(__dirname, '../../..');
  const auditText = fs.readFileSync(path.resolve(auditPath), 'utf8');
  const audit = JSON.parse(auditText);
  const field = audit.diagnostic_normalized_field;
  const loaded = loadTwinleafCardManager(repositoryRoot);
  const result = resolveDiagnosticField(field, loaded.manager, {
    twinleaf_revision: readTwinleafRevision(repositoryRoot),
    research_revision: readResearchRevision(repositoryRoot),
    source_audit_sha256: sha256Utf8(auditText),
    source_normalized_field_sha256: sha256Utf8(canonicalJson(field)),
  });
  result.source_audit = {
    schema: audit.schema || null,
    event_date: audit.event_date || null,
    decklist_source: audit.decklist_source || null,
    card_pool: audit.card_pool || null,
    selection: audit.selection || null,
    field_inventory: audit.field_inventory || null,
    summary: audit.summary || null,
    official_banlist_overlay: audit.official_banlist_overlay || null,
    physical_print_limit: audit.physical_print_limit || null,
  };
  result.twinleaf_set_export_count = loaded.set_export_count;
  result.twinleaf_expected_card_count = loaded.expected_card_count;
  result.twinleaf_actual_card_count = loaded.actual_card_count;
  const output = JSON.stringify(result, null, 2) + '\n';
  if (outputPath) fs.writeFileSync(path.resolve(outputPath), output);
  else process.stdout.write(output);
  if (result.status !== 'complete') process.exitCode = 1;
}

if (require.main === module) {
  try {
    runCli();
  } catch (error) {
    process.stderr.write(String(error && error.stack || error) + '\n');
    process.exitCode = 2;
  }
}

module.exports = {
  compositeKey: compositeKey,
  indexTwinleafCards: indexTwinleafCards,
  resolveNormalizedRow: resolveNormalizedRow,
  resolveDiagnosticField: resolveDiagnosticField,
  loadTwinleafCardManager: loadTwinleafCardManager,
  readTwinleafRevision: readTwinleafRevision,
  readResearchRevision: readResearchRevision,
  sha256Utf8: sha256Utf8,
  canonicalJson: canonicalJson,
  registered60Hashes: registered60Hashes,
  normalizedDeckIdentityHashes: normalizedDeckIdentityHashes,
  REGISTERED60_HASH_PROTOCOL: REGISTERED60_HASH_PROTOCOL,
  runCli: runCli,
};
