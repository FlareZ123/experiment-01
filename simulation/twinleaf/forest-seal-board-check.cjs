'use strict';
const {initializeCards} = require('./headless.cjs');
/** Placeholder for deterministic in-play Tool Ability scenarios. */
function verifyCards() { return initializeCards().getCardByName('Forest Seal Stone SIT') !== undefined; }
if (require.main === module) console.log(verifyCards());
module.exports = {verifyCards};
