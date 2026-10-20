'use strict';
/**
 * Match native recipient coordinates independent of object identity.
 * @param {object} a
 * @param {object} b
 * @returns {boolean}
 */
function sameTarget(a,b){return !!a && !!b && a.player===b.player && a.slot===b.slot && a.index===b.index;}
/**
 * Check native recipient side, occupancy and distinct-target constraints.
 * This is supplementary to the existing source-card and count validator.
 * @param {object[]} assignments
 * @param {{target:object,list:object}[]} eligibleEntries
 * @param {object} promptOptions
 * @returns {boolean}
 */
function validAttachEnergyTargets(assignments,eligibleEntries,promptOptions={}){
 if(!Array.isArray(assignments)||!Array.isArray(eligibleEntries))return false;
 const blocked=promptOptions.blockedTo===undefined?[]:promptOptions.blockedTo;
 if(!Array.isArray(blocked))return false;
 const chosen=[],types=new Set();
 for(const entry of assignments){
  const target=entry?.to;
  if(!target||!eligibleEntries.some(x=>sameTarget(x.target,target))||blocked.some(x=>sameTarget(x,target)))return false;
  if(promptOptions.sameTarget===true&&chosen.length>0&&!sameTarget(chosen[0],target))return false;
  if(promptOptions.differentTargets===true&&chosen.some(x=>sameTarget(x,target)))return false;
  if(promptOptions.differentTypes===true){const type=entry.card?.provides?.[0]??null;if(types.has(type))return false;types.add(type);}
  chosen.push(target);
 }
 return true;
}
module.exports={sameTarget,validAttachEnergyTargets};
