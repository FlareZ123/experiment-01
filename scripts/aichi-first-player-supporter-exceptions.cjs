'use strict';

const fs = require('node:fs');
const path = require('node:path');

const EXPLICIT_FIRST_PLAYER_EXCEPTION =
  /\bif you go first,\s*you may (?:play|use) this card during your first turn\b/i;

/**
 * @typedef {{id:string,name:string,supertype:string,subtypes:string[],rules?:string[]}} Card
 * @param {Card} card
 * @returns {boolean}
 */
function isSupporter(card) {
  return card.supertype === 'Trainer' && card.subtypes?.includes('Supporter') === true;
}

/**
 * A textual authorization to play a Supporter during the player's first
 * turn going first. This does NOT prove legality in all formats or states.
 *
 * @param {Card} card
 * @returns {boolean}
 */
function hasExplicitGoFirstPermission(card) {
  return isSupporter(card) &&
    card.rules?.some(text => EXPLICIT_FIRST_PLAYER_EXCEPTION.test(text)) === true;
}

/**
 * @param {string} cardDirectory
 * @returns {{sourceFiles:number,supporterPrintings:number,permissionPrintings:{id:string,name:string}[],distinctNames:string[],firstTurnLanguagePrintings:{id:string,name:string}[]}}
 */
function auditCardDirectory(cardDirectory) {
  const files = fs.readdirSync(cardDirectory)
    .filter(name => name.endsWith('.json')).sort();
  const permissionPrintings = [], firstTurnLanguagePrintings = [];
  let supporterPrintings = 0;
  for (const filename of files) {
    const cards = JSON.parse(fs.readFileSync(path.join(cardDirectory, filename), 'utf8'));
    for (const card of cards) {
      if (!isSupporter(card)) continue;
      supporterPrintings++;
      const rules = (card.rules ?? []).join(' ');
      if (/\bfirst turn\b/i.test(rules)) {
        firstTurnLanguagePrintings.push({id:card.id,name:card.name});
      }
      if (hasExplicitGoFirstPermission(card)) {
        permissionPrintings.push({id:card.id,name:card.name});
      }
    }
  }
  return {
    sourceFiles: files.length,
    supporterPrintings,
    permissionPrintings,
    distinctNames: [...new Set(permissionPrintings.map(c => c.name))].sort(),
    firstTurnLanguagePrintings
  };
}

if (require.main === module) {
  const cards = path.resolve(__dirname, '../resources/cards/en');
  process.stdout.write(JSON.stringify(auditCardDirectory(cards), null, 2) + '\n');
}

module.exports = {
  EXPLICIT_FIRST_PLAYER_EXCEPTION,
  isSupporter,
  hasExplicitGoFirstPermission,
  auditCardDirectory
};
