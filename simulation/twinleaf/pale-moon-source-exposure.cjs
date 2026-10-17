'use strict';

/** Capture queued Pale Moon-GX KO targets by reference, from a source state. */
function queuedPaleMoon(state) {
  return (state.players || []).flatMap((player, slot) =>
    (player.pendingEndOfTurnEffects || [])
      .filter(effect => effect.type === 'knock_out' &&
        effect.attack?.name === 'Pale Moon-GX')
      .map(effect => ({slot, player, target:effect.target,
        where:player.active === effect.target ? 'active' :
          player.bench.includes(effect.target) ? 'bench' : 'other',
        pokemon:effect.target?.getPokemonCard?.()?.fullName ?? null
      })));
}

/**
 * Classify one actual dispatch transition without retaining game objects.
 * @param {object[]} before
 * @param {object[]} after
 * @param {{step:number,turn:number,action:string}} at
 * @returns {object[]}
 */
function classifyPaleMoonExit(before, after, at) {
  const events=[];
  for (const old of before) {
    if (old.where !== 'active') continue;
    const next = after.find(row => row.player === old.player &&
      row.target === old.target);
    const current = old.player.active === old.target ? 'active' :
      old.player.bench.includes(old.target) ? 'bench' : 'other';
    if (current !== 'bench') continue;
    events.push({...at,slot:old.slot,pokemon:old.pokemon,
      finding:next ? 'exercised-failing' : 'exercised-cleared'});
  }
  return events;
}
module.exports={queuedPaleMoon,classifyPaleMoonExit};
