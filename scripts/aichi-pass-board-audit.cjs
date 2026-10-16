'use strict';

/**
 * Count observed candidate PassTurnAction board states from one source-locked
 * diagnostic archive. Passes are decision states, not independent game trials.
 *
 * @param {object} archive Output from aichi-campaign-execute.cjs.
 * @returns {object} Analysis explicitly separated from strength evidence.
 */
function analyzeCandidatePassBoards(archive) {
  if (!archive || !Array.isArray(archive.records)) {
    throw new Error('Expected a campaign diagnostic with records.');
  }
  return {
    kind:'candidate-pass-board-behavior-v1',
    evidenceScope:'Public in-game board snapshots at pass decisions; no win-rate inference',
    planDigest:archive.planDigest ?? null,
    trialCount:archive.records.length,
    rows:archive.records.map(record=>{
      const base={
        trialId:record.trialId,
        candidateId:record.candidateId,
        candidateEngineSlot:record.candidateEngineSlot,
        engineStatus:record.status
      };
      if (!['A','B'].includes(record.candidateEngineSlot)) {
        return {...base,status:'invalid-candidate-slot'};
      }
      const slot=record.candidateEngineSlot==='A' ? 0 : 1;
      const trace=record.traceSummary?.chronologicalActionTrace;
      if (!Array.isArray(trace)) return {...base,status:'missing-decision-trace'};
      const passes=trace.filter(action=>
        action.action==='PassTurnAction' && action.playerSlot===slot
      );
      if (passes.some(action=>
        !Array.isArray(action.publicBoardBeforePass) ||
        !action.publicBoardBeforePass[slot])) {
        return {...base,status:'missing-pass-board-snapshot',
          candidatePassesRecorded:passes.length};
      }
      const result={
        ...base,
        status:record.status==='completed-engine-game' ?
          'observed-completed-engine-game' : 'observed-incomplete-engine-game',
        candidatePassesRecorded:passes.length,
        passesWithVMAXInPlay:0,
        passesWithAllVMAXWithoutEnergy:0,
        unpoweredVMAXPassesWithEnergyElsewhere:0,
        unpoweredVMAXPassesWithTwoOrMoreEnergyElsewhere:0,
        passesWithFullFiveBench:0
      };
      for (const action of passes) {
        const player=action.publicBoardBeforePass[slot];
        const pokemon=[player.active,...player.bench].filter(Boolean);
        const vmax=pokemon.filter(p=>p.name==='Shadow Rider Calyrex VMAX');
        if (player.bench.length===5) result.passesWithFullFiveBench++;
        if (vmax.length===0) continue;
        result.passesWithVMAXInPlay++;
        const attached=vmax.reduce((sum,p)=>sum+p.energyCards.length,0);
        if (attached!==0) continue;
        result.passesWithAllVMAXWithoutEnergy++;
        const elsewhere=pokemon.filter(p=>p.name!=='Shadow Rider Calyrex VMAX')
          .reduce((sum,p)=>sum+p.energyCards.length,0);
        if (elsewhere>0) result.unpoweredVMAXPassesWithEnergyElsewhere++;
        if (elsewhere>=2) result.unpoweredVMAXPassesWithTwoOrMoreEnergyElsewhere++;
      }
      return result;
    })
  };
}

if (require.main===module) {
  const fs=require('node:fs');
  const input=process.argv[2];
  if (!input) throw new Error('Provide a campaign JSON file path.');
  const archive=JSON.parse(fs.readFileSync(input,'utf8'));
  process.stdout.write(JSON.stringify(analyzeCandidatePassBoards(archive),null,2)+'\n');
}

module.exports={analyzeCandidatePassBoards};
