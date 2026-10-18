'use strict';

const assert=require('node:assert/strict');
const test=require('node:test');
const fs=require('node:fs');
const path=require('node:path');
const {assess,run}=require('../scripts/rank11-source-energy-exhaustion.cjs');

const root=path.resolve(__dirname,'..');
const roster=JSON.parse(fs.readFileSync(path.join(root,
  'results/aichi-2026/full-decklists.json'),'utf8'));
const source=JSON.parse(fs.readFileSync(path.join(root,
  'results/twinleaf/rank11-turn23-energy-exhaustion-source.json'),'utf8'));

/** @returns {object} */
function fixture() {return structuredClone(source);}

test('real-source 8/8 board exhaustion and one-energy Pass gate',()=>{
  const result=run();
  assert.equal(result.exactDeckEnergyCopies,8);
  assert.equal(result.unlocatedDarknessEnergyBeforeCopy,0);
  assert.equal(result.darknessEnergyDiscardedAtKO,3);
  assert.equal(result.darknessEnergyRemainingOnBoardAfterKO,5);
  assert.equal(result.basicDarknessEnergyAccessibleByOrdinaryManualAttachmentNextTurn,0);
  assert.equal(result.immediatelyPayablePrintedMegaAbsolAttacksAtPass,0);
});

test('fails when a Darkness Energy is unlocated before the copied attack',()=>{
  const changed=fixture();
  changed.sourceBeforeCopiedAttack.bench[0].energies=[];
  assert.throws(()=>assess(roster,changed),/Every physical Darkness Energy/);
});

test('fails if a new source Energy returns or a source-recovery action appears',()=>{
  const changed=fixture();
  changed.sourceTurn23RootActions[1].card='Super Rod';
  assert.throws(()=>assess(roster,changed),/Expected values to be strictly deep-equal/);
});

test('fails when the immediate Active becomes powered after the knockout',()=>{
  const changed=fixture();
  changed.sourceAfterCopiedAttack.active.energies.push('Darkness Energy');
  assert.throws(()=>assess(roster,changed),/one-Energy Mega Absol/);
});
