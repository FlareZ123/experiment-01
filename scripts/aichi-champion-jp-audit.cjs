'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = relative => JSON.parse(fs.readFileSync(path.join(root, relative), 'utf8'));
const sorted = entries => entries.map(row =>
  [row.name, row.count, row.category].join('\u0000')).sort();

/**
 * Fail-closed source-identity gate for the official Aichi champion's
 * Japanese printing 60. Proves bilingual name, count, category and
 * narrowly applicable named bans. It cannot certify all reprint errata.
 *
 * @param {object} official Saved Japanese printing manifest.
 * @param {object} field Aichi 29 published lists.
 * @param {object} bans Event-dated Japanese banned identities.
 * @returns {object} Reproducible bounded source gate.
 */
function audit(official, field, bans) {
  assert.equal(official.schema, 'aichi-champion-official-japanese-prints-v1');
  assert.equal(official.event_date, '2026-05-10');
  assert.equal(official.source_code, 'QnLLQ9-qvPVqa-g9gi6Q');
  assert.equal(official.github_actions_run, 39424838770);
  assert.match(official.original_html_sha256, /^[a-f0-9]{64}$/);
  assert.equal(official.official_printing_rows, 33);
  assert.equal(official.printed_copies, 60);
  assert.deepEqual(official.category_counts, {
    pokemon: 18, trainer: 31, energy: 11
  });
  assert.equal(bans.valid_for_event, official.event_date);
  const champion = field.decks.find(row => row.rank === 1);
  assert.equal(champion.player, 'Yasunori Kato');
  assert.equal(champion.archetype, 'Shadow Rider Calyrex');
  assert.equal(official.entries.length, 33);
  const usedIds = new Set();
  const sourceEntries = [];
  const nameContacts = [];
  for (const row of official.entries) {
    assert.ok(Number.isSafeInteger(row.japanese_card_id) &&
      row.japanese_card_id > 0);
    assert.ok(!usedIds.has(row.japanese_card_id), 'duplicate Japanese ID');
    usedIds.add(row.japanese_card_id);
    assert.match(row.japanese_set, /^[A-Za-z0-9+-]+$/);
    assert.ok(Number.isSafeInteger(row.count) && row.count >= 1 &&
      row.count <= 11);
    const category = row.section === 'deck_pke' ? 'Pokémon' :
      row.section === 'deck_ene' ? 'Energy' : 'Trainer';
    sourceEntries.push({name: row.name_en, category, count: row.count});
    for (const ban of bans.banned_identities) {
      if (ban.english_name !== row.name_en) continue;
      if (ban.selector.type === 'trainer_name' ||
        ban.selector.type === 'pokemon_name') {
        assert.fail('Official champion list contains banned name '+row.name_en);
      }
      if (ban.japanese_printing === row.japanese_set) {
        assert.fail('Official Japanese printing collides with banned set '+row.name_en);
      }
      nameContacts.push({
        englishName: row.name_en,
        exactSourceId: row.japanese_card_id,
        sourceSet: row.japanese_set,
        namedBanSet: ban.japanese_printing,
        banSelector: ban.selector
      });
    }
  }
  assert.deepEqual(sorted(sourceEntries), sorted(champion.cards),
    'Published English inventory and official Japanese saved deck differ');
  assert.equal(sourceEntries.reduce((sum, row) => sum + row.count, 0), 60);
  const exact = name => {
    const found = official.entries.filter(row => row.name_en === name);
    assert.equal(found.length, 1);
    return found[0];
  };
  assert.deepEqual([exact('Mimikyu').japanese_card_id,
    exact('Mimikyu').japanese_set], [34271, 'SM4p']);
  assert.deepEqual([exact('Dialga-GX').japanese_card_id,
    exact('Dialga-GX').japanese_set], [35683, 'SM5S']);
  assert.deepEqual([exact('Marshadow').japanese_card_id,
    exact('Marshadow').japanese_set], [37268, 'SM12a']);
  // Confirm this named-ban exemption against actual source effect text at:
  // https://www.pokemon-card.com/card-search/details.php/card/37268/
  assert.deepEqual(nameContacts.map(row => row.englishName), ['Marshadow']);
  assert.equal(exact('Unfair Stamp').count, 1);
  assert.equal(official.entries.filter(row =>
    row.name_en === 'Radiant Eternatus').reduce((n, row) => n + row.count, 0), 1);
  return {
    schema: 'aichi-champion-official-print-and-dated-ban-audit-v1',
    officialCode: official.source_code,
    officialHtmlSha256: official.original_html_sha256,
    sourceRows: official.entries.length,
    sourceCopies: 60,
    bilingualNameCountCategoryMatch: true,
    datedNamedBanCollision: false,
    sameNameBanContacts: nameContacts,
    marshadowAbilityVerifiedViaOfficialPrint: 'Resetting Hole',
    completeJapanesePaperLegalityVerified: false,
    qualifiedCompetitiveGameCount: 0
  };
}

/** @returns {object} Source-backed audit packet. */
function auditFromResources() {
  return audit(read('results/aichi-2026/official-champion-japanese-print-60.json'),
    read('results/aichi-2026/full-decklists.json'),
    read('results/legality/japan-expanded-aichi-2026.json'));
}

if (require.main === module) {
  process.stdout.write(JSON.stringify(auditFromResources(), null, 2) + '\n');
}

module.exports = {audit, auditFromResources};
