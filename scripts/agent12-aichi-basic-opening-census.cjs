'use strict';

const fs = require('node:fs');
const path = require('node:path');
const {openingMulliganProbability, pairedSetupMulligans} =
  require('./agent12-expanded-mulligan-pairing.cjs');

const REPOSITORY = path.resolve(__dirname, '..');
const readJson = file =>
  JSON.parse(fs.readFileSync(path.join(REPOSITORY, file), 'utf8'));

/**
 * Resolve original Pokémon printing numbers against the retained card JSON,
 * rather than guessing evolution stage from species or rule-box terminology.
 *
 * @returns {object} Source-exact Basic counts and opening-mulligan statistics.
 */
function censusAichiBasics() {
  const input = readJson('results/aichi-2026/full-decklists.json');
  const sets = readJson('resources/sets/en.json');
  const byCode = new Map();
  for (const set of sets) {
    if (!set.ptcgoCode) continue;
    const existing = byCode.get(set.ptcgoCode) || [];
    existing.push(set.id);
    byCode.set(set.ptcgoCode, existing);
  }
  // Roster abbreviations differ from official PR-SM and PR-XY set codes.
  byCode.set('SMP', ['smp']);
  byCode.set('XYP', ['xyp']);
  // The archived roster uses U+2662 (♢) for Prism Star names; the retained
  // English card database uses U+25C7 (◇) for the same printed symbol.
  const normalizeName = name => name.replace(/\u2662/gu, '\u25c7');
  const cache = new Map();
  /** @param {string} setId */
  function setCards(setId) {
    if (!cache.has(setId)) {
      cache.set(setId, readJson('resources/cards/en/' + setId + '.json'));
    }
    return cache.get(setId);
  }

  const rows = [];
  for (const source of input.decks) {
    let total = 0;
    let pokemonCopies = 0;
    let basicCopies = 0;
    const basicPrintings = [];
    const nonBasicPrintings = [];
    for (const row of source.cards) {
      total += row.count;
      if (row.category !== 'Pokémon') continue;
      pokemonCopies += row.count;
      const candidates = [];
      const ids = byCode.get(row.printing.set) || [];
      const sourceNumber = Number(row.printing.number);
      for (const setId of ids) {
        for (const printed of setCards(setId)) {
          if (normalizeName(printed.name) !== normalizeName(row.name)) continue;
          // SMP 217 in original source becomes SM217 in card DB;
          // XYP 49 becomes XY49. Ordinary set numbers are unchanged.
          const normalizedPrintedNumber =
            Number(String(printed.number).replace(/^[^0-9]+/, ''));
          if (normalizedPrintedNumber !== sourceNumber) continue;
          candidates.push(printed);
        }
      }
      if (candidates.length !== 1) {
        throw new Error('Cannot uniquely resolve source printed card: rank ' +
          source.rank + ' ' + row.count + 'x ' + row.name +
          ' ' + row.printing.set + ' ' + row.printing.number +
          ': ' + candidates.map(x => x.id).join(','));
      }
      const printed = candidates[0];
      const fact = {
        count: row.count,
        name: row.name,
        sourceSet: row.printing.set,
        sourceNumber: row.printing.number,
        databaseCardId: printed.id,
        printedSubtypes: printed.subtypes
      };
      if (printed.subtypes.includes('Basic')) {
        basicCopies += row.count;
        basicPrintings.push(fact);
      } else {
        nonBasicPrintings.push(fact);
      }
    }
    if (total !== 60 || basicCopies < 1) {
      throw new Error('Source rank ' + source.rank +
        ' lacks complete playable 60 / one Basic: ' +
        JSON.stringify({total, basicCopies}));
    }
    const q = openingMulliganProbability(basicCopies);
    rows.push({
      rank: source.rank, player: source.player,
      archetype: source.archetype, deckCards: total,
      pokemonCopies, basicCopies,
      noBasicOpeningProbability: q,
      expectedStandaloneMulligans: q / (1-q),
      basicPrintings, nonBasicPrintings
    });
  }
  rows.sort((a,b) => a.rank - b.rank);
  const rank1 = rows.find(x => x.rank === 1);
  if (!rank1) throw new Error('Missing source rank1 comparison reference');
  for (const row of rows) {
    const p = pairedSetupMulligans(row.basicCopies, rank1.basicCopies);
    row.expectedOptionalDrawsOfferedVersusRank1 =
      p.expectedOptionalDrawsAvailableToOpponent;
    row.expectedOptionalDrawsReceivedVersusRank1 =
      p.expectedOptionalDrawsAvailableToMe;
  }
  return {
    sourceRanks: rows.length,
    missingOriginalRanks: input.missing_full_lists.map(x => x.rank),
    allPokemonPrintingsResolved: true,
    rows
  };
}

module.exports = {censusAichiBasics};
if (require.main === module) {
  const result = censusAichiBasics();
  process.stdout.write(JSON.stringify({
    sourceRanks:result.sourceRanks,
    missingOriginalRanks:result.missingOriginalRanks,
    sourcePrintingLookupComplete:result.allPokemonPrintingsResolved,
    rows:result.rows.map(row => ({
      rank:row.rank,archetype:row.archetype,basicCopies:row.basicCopies,
      noBasicOpeningProbability:row.noBasicOpeningProbability,
      expectedOptionalDrawsOfferedVersusRank1:
        row.expectedOptionalDrawsOfferedVersusRank1
    }))
  },null,2)+'\n');
}
