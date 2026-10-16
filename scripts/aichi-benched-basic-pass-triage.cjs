'use strict';

const fs = require('node:fs');
const {printedBasicEnergyAudit} =
  require('../simulation/twinleaf/printed-basic-energy-audit.cjs');

// Actual CardType ordinals of the pinned Twinleaf revision.
const TYPES = {GRASS:1,FIRE:2,WATER:3,LIGHTNING:4,PSYCHIC:5,
  FIGHTING:6,DARK:7,METAL:8,COLORLESS:9,FAIRY:10};

/** @param {object|null} p Public Pokemon snapshot. @returns {string[]} */
function coveredNames(p) {
  if (!p) return [];
  const slot = {
    getPokemonCard: () => ({name:p.name,attacks:p.printedAttacks}),
    energies: {cards:p.energyCards.map(name => ({name}))}
  };
  return printedBasicEnergyAudit(slot,TYPES).attacks
    .filter(a=>a.printedCostCoveredByBasic).map(a=>a.name);
}

/**
 * Quantify public Bench basic-cost opportunities at candidate passes.
 * These observations do not establish feasible switches or legal attacks.
 * @param {object} archive Source-locked diagnostic JSON.
 * @returns {object}
 */
function summarizeBenchedCoverage(archive) {
  return {
    evidenceType:'bench-printed-basic-cost-only-v1',
    planDigest:archive.planDigest,
    records:archive.records.map(r=>{
      const base={trialId:r.trialId,candidateId:r.candidateId};
      const seat=r.candidateEngineSlot==='A'?0:1;
      const trace=r.traceSummary?.chronologicalActionTrace;
      if(r.status!=='completed-engine-game'||!Array.isArray(trace))
        return {...base,status:'missing-trace'};
      const passes=trace.filter(x=>x.action==='PassTurnAction'&&x.playerSlot===seat);
      if(passes.some(x=>!x.publicBoardBeforePass?.[seat]))
        return {...base,status:'missing-board'};
      const examples=[];
      for(const x of passes) {
        const b=x.publicBoardBeforePass[seat];
        const bench=b.bench.flatMap(p=>{
          const names=coveredNames(p);
          return names.length?[{pokemon:p.name,attacks:names}]:[];
        });
        if(bench.length) examples.push({ordinal:x.actionOrdinal,turn:x.turnBefore,
          active:b.active?.name??null,activeCovered:coveredNames(b.active),bench});
      }
      return {...base,status:'public-cost-triage',
        candidatePasses:passes.length,benchCoveredPasses:examples.length,
        benchCoveredActiveUncovered:examples.filter(e=>e.activeCovered.length===0).length,
        examples};
    })
  };
}

if(require.main===module) {
  const archive=JSON.parse(fs.readFileSync(process.argv[2],'utf8'));
  process.stdout.write(JSON.stringify(summarizeBenchedCoverage(archive),null,2)+'\n');
}
module.exports={coveredNames,summarizeBenchedCoverage};
