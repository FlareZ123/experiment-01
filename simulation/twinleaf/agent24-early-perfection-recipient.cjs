'use strict';

const assert=require('node:assert/strict');
const {missingEnergyUnits}=
  require('./agent3-special-energy-frontier.cjs');
const {knownMewtwoEnergyUnits}=
  require('./agent30-known-perfection-options.cjs');

const VERSION='agent24-public-bench-perfection-funding-v1';

/**
 * Fund a publicly Benched Mewtwo & Mew-GX toward one of its public in-play
 * GX donor attacks before its current Active has been Knocked Out or switched.
 * Counts exact attached Psychic/card units; never assumes an unseen donor in
 * the deck or Prizes. Restrict to at most two-Energy donor lines to avoid
 * diverting all owner Energy into an unachievable Bench.
 *
 * @param {object} view Detached actor root observation.
 * @param {object} catalog Actor's pinned public print/Energy catalog.
 * @returns {object|null} Genuine owner Basic Energy play intent.
 */
function chooseBenchPerfectionFunding(view,catalog){
  assert.equal(view.decisionKind,'owner-root');
  const own=view.ownPublic??{},r=view.ownTurnResources??{};
  if(!own.active||r.energyPlayLocked===true||
    r.energyPlayedTurn===view.globalTurn)return null;
  const donors=catalog.perfectionDonors;
  if(!(donors instanceof Map))return null;
  const sources=new Set([
    ...(own.discard??[]),
    ...(own.bench??[]).flatMap(p=>p?[p.printing]:[])
  ]);
  const printedDonors=[...donors].flatMap(([printing,attacks])=>
    sources.has(printing)?attacks.filter(x=>
      Array.isArray(x.cost)&&x.cost.length<=2&&x.cost.length>0&&
      x.cost.every(Number.isSafeInteger)):[]
  );
  if(!printedDonors.length)return null;
  const psychicType=catalog.basicEnergyTypes?.Psychic;
  const held=(view.ownHand??[]).map((printing,handIndex)=>({
    printing,handIndex
  })).filter(x=>catalog.basicEnergies?.has(x.printing)&&
    x.printing.startsWith('Psychic Energy '));
  if(!held.length||!Number.isSafeInteger(psychicType))return null;
  const gxUsed=own.publicTurnRestrictions?.gxUsed===true||
    own.publicTurnRestrictions?.cannotUseGXAttacks===true;
  const candidates=[];
  for(const [index,pokemon] of (own.bench??[]).entries()){
    if(pokemon?.printing!=='Mewtwo & Mew-GX UNM'||
      !(pokemon.abilities??[]).includes('Perfection'))continue;
    const attached=knownMewtwoEnergyUnits(view,catalog,pokemon);
    if(!Array.isArray(attached))continue;
    for(const donorAttack of printedDonors){
      if(gxUsed&&donorAttack.gxAttack)continue;
      const before=missingEnergyUnits(donorAttack.cost,attached,
        catalog.colorlessEnergyType);
      if(before<=0)continue;
      const after=missingEnergyUnits(donorAttack.cost,
        [...attached,psychicType],catalog.colorlessEnergyType);
      if(after>=before)continue;
      candidates.push({
        slot:'bench',index,printing:held[0].printing,
        handIndex:held[0].handIndex,
        donorAttack:donorAttack.name,copiedCost:donorAttack.cost.length,
        gapBefore:before,gapAfter:after
      });
    }
  }
  candidates.sort((a,b)=>a.gapAfter-b.gapAfter||
    a.copiedCost-b.copiedCost||a.index-b.index||
    a.handIndex-b.handIndex);
  return candidates[0]??null;
}

module.exports={VERSION,chooseBenchPerfectionFunding};
