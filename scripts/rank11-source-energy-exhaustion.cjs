'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

/**
 * Reconstruct a card-conservation bound from the exact rank-11 source 60,
 * the archived pre-attack board and the complete following root-action list.
 * This is a source-specific necessary-resource proof, not a policy comparison.
 * @param {object} roster Canonical Aichi published 60-card manifest.
 * @param {object} witness Independently checked archived Store excerpt.
 * @returns {object}
 */
function assess(roster,witness) {
  const rank=witness.provenance.sourceRank;
  const source=roster.decks.find(deck=>deck.rank===rank);
  assert.ok(source,'Exact published opponent list required');
  const energies=source.cards.filter(card=>card.category==='Energy');
  assert.equal(energies.length,1,
    'Proof requires one homogeneous printed Energy source');
  assert.equal(energies[0].name,'Darkness Energy');
  const availableEnergy=energies[0].count;
  const before=witness.sourceBeforeCopiedAttack;
  const after=witness.sourceAfterCopiedAttack;
  const inPlay=[before.active,...before.bench]
    .flatMap(slot=>slot.energies);
  assert.ok(inPlay.every(name=>name==='Darkness Energy'),
    'Unaccounted Special Energy invalidates one-card-one-energy bound');
  assert.equal(inPlay.length,availableEnergy,
    'Every physical Darkness Energy must be accounted for on-board');
  assert.equal(before.active.name,'Mega Absol ex');
  assert.equal(after.active.name,'Mega Absol ex');
  assert.equal(after.knockedOutActiveEnergyCards,before.active.energies.length,
    'Recorded KO must move all original Active Energy off board');
  assert.equal(after.active.energies.length,1,
    'Promoted attacker must remain a one-Energy Mega Absol ex');
  assert.deepEqual(after.active.energies,['Darkness Energy']);
  assert.deepEqual(after.active.printedAttacks.map(attack=>attack.cost),[
    ['Darkness','Colorless'],
    ['Darkness','Darkness','Colorless']
  ]);
  const actions=witness.sourceTurn23RootActions;
  assert.deepEqual(actions.map(row=>row.ordinal),[216,217,218,219,220,221,222,223,224]);
  assert.deepEqual(actions.filter(row=>row.action==='PlayCardAction')
    .map(row=>row.card),['Float Stone','Shopping Center','Marnie']);
  assert.equal(actions.filter(row=>row.action==='PassTurnAction').length,1);
  assert.ok(actions.every(row=>row.action==='PlayCardAction'||
    row.action==='ResolvePromptAction'||row.action==='PassTurnAction'));
  // These three printed card effects do not recover discarded Basic Energy:
  // Float Stone changes retreat, Shopping Center is a Stadium with a Tool
  // bounce effect, and Marnie shuffles/draws hands.
  const remainingAfterKO=availableEnergy-after.knockedOutActiveEnergyCards;
  assert.equal(remainingAfterKO,5);
  return {
    schema:'rank11-turn23-print-resource-conservation-proof-v1',
    sourceRank:rank,seed:witness.provenance.seed,
    archiveRun:witness.provenance.run_id,
    archiveZipSha256:witness.provenance.artifact_zip_sha256,
    exactDeckEnergyCopies:availableEnergy,
    sourceDarknessEnergyInPlayBeforeCopy:inPlay.length,
    unlocatedDarknessEnergyBeforeCopy:availableEnergy-inPlay.length,
    darknessEnergyDiscardedAtKO:after.knockedOutActiveEnergyCards,
    darknessEnergyRemainingOnBoardAfterKO:remainingAfterKO,
    sourceActiveEnergyAtPass:after.active.energies,
    sourcePlayActionsNextTurn:actions.filter(row=>row.action==='PlayCardAction')
      .map(row=>row.card),
    basicDarknessEnergyAccessibleByDrawNextTurn:0,
    basicDarknessEnergyAccessibleByOrdinaryManualAttachmentNextTurn:0,
    immediatelyPayablePrintedMegaAbsolAttacksAtPass:0,
    interpretation:'No ordinary Darkness Energy in hand/deck for an immediate attachment, and no printed attack payable on the observed one-Energy Active. Alternative strategies using discard acceleration, prior turn choices or switching are not assessed.',
    opponentPolicyQualified:false
  };
}

/** @returns {object} */
function run() {
  const root=path.resolve(__dirname,'..');
  const roster=JSON.parse(fs.readFileSync(path.join(root,
    'results/aichi-2026/full-decklists.json'),'utf8'));
  const witness=JSON.parse(fs.readFileSync(path.join(root,
    'results/twinleaf/rank11-turn23-energy-exhaustion-source.json'),'utf8'));
  return assess(roster,witness);
}
if(require.main===module)process.stdout.write(JSON.stringify(run(),null,2)+'\n');
module.exports={assess,run};
