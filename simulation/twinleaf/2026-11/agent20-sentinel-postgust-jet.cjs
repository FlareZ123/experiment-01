'use strict';

const VERSION = 'agent20-sentinel-postgust-jet-escape-v2-temple-veto';
const JET = 'Jet Energy PAL';
const LOCK = 'Vileplume AOR';
const BENCH = 'Bunnelby PRC';

/**
 * Propose an owner-visible Energy attachment that switches a gusted Vileplume
 * out of Active without consuming an Item or a Supporter.
 * Native Store validates the proposal. No deck, Prize or opponent hand read.
 *
 * @param {object} view Detached actorObservation.
 * @returns {{kind:string,handIndex:number,benchIndex:number,
 *   printing:string,targetPrinting:string}|null}
 */
function chooseSentinelPostGustJet(view) {
  if (view?.decisionKind !== 'owner-root' ||
      !Number.isSafeInteger(view.globalTurn) ||
      !Array.isArray(view.ownHand)) return null;
  const own = view.ownPublic;
  const resources = view.ownTurnResources;
  if (own?.active?.printing !== LOCK ||
      !Array.isArray(own.bench) || !resources ||
      resources.energyPlayedTurn === view.globalTurn ||
      resources.energyPlayLocked === true ||
      resources.specialEnergyPlayLocked === true ||
      own.publicTurnRestrictions?.energyPlayLocked === true ||
      own.publicTurnRestrictions?.specialEnergyPlayLocked === true) return null;
  // Official Japanese card Q&A: Temple of Sinnoh disables Jet's switch
  // effect on attachment. Spending the turn's Energy would strand Vileplume.
  const stadiums=[...(own.stadium??[]),
    ...(view.opponentPublic?.stadium??[])];
  if(stadiums.some(name=>name.startsWith('Temple of Sinnoh ')))
    return null;
  const handIndex = view.ownHand.indexOf(JET);
  if (handIndex < 0) return null;
  const benchIndex = own.bench.findIndex(pokemon =>
    pokemon?.printing === BENCH &&
    Array.isArray(pokemon.energies) && pokemon.energies.length > 0);
  if (benchIndex < 0) return null;
  return {
    kind:'attach-jet-to-escape-item-lock',
    handIndex, benchIndex, printing:JET, targetPrinting:BENCH
  };
}

module.exports = {VERSION, JET, LOCK, BENCH, chooseSentinelPostGustJet};
