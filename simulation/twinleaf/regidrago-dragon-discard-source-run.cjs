'use strict';
const assert=require('node:assert/strict');
const path=require('node:path');
const {initializeCards,runMatch}=require('./headless.cjs');
const {resolveManifestFile}=require('./resolve-field.cjs');
const {audit}=require('./regidrago-dragon-discard-access-audit.cjs');
const SEEDS=[4246551499,4246551500,4246551501];
function main() {
  const decks=resolveManifestFile(path.resolve(__dirname,
    '../../results/aichi-2026/full-decklists.json'),{
    allowEquivalentBasicEnergies:true,allowJapanesePromoHooks:true
  }).decks;
  const champion=decks.find(row=>row.rank===1);
  const regidrago=decks.find(row=>row.rank===10);
  assert.ok(champion?.playableUnderEngine&&regidrago?.playableUnderEngine);
  initializeCards();
