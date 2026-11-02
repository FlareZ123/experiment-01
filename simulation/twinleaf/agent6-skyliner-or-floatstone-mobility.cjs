'use strict';

const {chooseOwnerSkylinerRondoRetreat}=require(
  './agent6-owner-public-skyliner-rondo-frontier.cjs');
const {publicSkylinerSuppressionReason}=require(
  './agent6-skyliner-ability-suppression-guard.cjs');

const VERSION='agent6-skyliner-or-floatstone-owner-mobility-v1';

/**
 * Exact-source alternate free Retreat for the rank-30 singleton Float Stone.
 * The ability-based v2 remains untouched. An already-attached Float Stone
 * makes its owner's Active Pokemon have no Retreat Cost even if Skyliner is
 * suppressed, unless another public effect nullifies the Tool.
 *
 * Known public Tool-effect suppression: Jamming Tower in play, or Tool
 * Jammer on the opponent's Active. This is a deliberately limited
 * positive certificate for these exact printings, not a general Tool model.
 *
 * @param {object} view Authenticated detached owner-root observation.
 * @param {object} catalog Public Basic Energy and Status print metadata.
 * @returns {object|null} Native-neutral compatible retreat intent.
 */
function chooseSkylinerOrFloatStoneRondoRetreat(view,catalog){
  const base=chooseOwnerSkylinerRondoRetreat(view,catalog);
  if(!base)return null;
  const blocked=publicSkylinerSuppressionReason(view);
  if(blocked===null)return base;
  const own=view.ownPublic,opponent=view.opponentPublic;
  if(!own.active?.tools?.includes('Float Stone BKT'))return null;
  const stadium=[...(own.stadium??[]),...(opponent?.stadium??[])];
  if(stadium.some(p=>p.startsWith('Jamming Tower ')))return null;
  if(opponent?.active?.tools?.some(p=>p.startsWith('Tool Jammer ')))
    return null;
  return {...base,mobilitySource:'float-stone-bkt',
    underlyingSkylinerBlock:blocked,
    reason:'attached-float-stone-free-retreat-through-ability-lock'};
}

module.exports={VERSION,chooseSkylinerOrFloatStoneRondoRetreat};
