'use strict';

const assert=require('node:assert/strict');

const VERSION='agent34-owner-visible-bench-psychic-attack-gap-recipient-v1';

/**
 * Rank legal-looking Psychic Bench recipient indices using only the acting
 * owner's detached public board. This ranks NEXT attachment proximity to a
 * printed non-GX attack, with an explicit Max Geist tie preference. The native
 * AttachEnergyPrompt.validate and real Store always decide legality.
 *
 * Unknown Energy printing or unmodeled attack costs yields a conservative
 * last-priority option, preserving ordinary source preference as a tie break.
 * The ranking is a developmental hypothesis, not a proof of optimal play.
 *
 * @param {object} view Detached owner-prompt observation.
 * @param {{requiredRecipientType:number,colorlessEnergyType:number,
 * preferredBenchIndex?:number}} spec Source-stamped typed prompt contract.
 * @param {number[]} indices Already filtered printed Psychic Bench slots.
 * @returns {number[]} Ranked indices without modifying source arrays.
 */
function rankOwnerPsychicBenchRecipients(view,spec,indices){
  assert.equal(view?.decisionKind,'owner-prompt');
  assert.ok(Number.isSafeInteger(spec.requiredRecipientType));
  assert.ok(Number.isSafeInteger(spec.colorlessEnergyType));
  const bench=view.ownPublic.bench;
  const psychic=spec.requiredRecipientType;
  const colorless=spec.colorlessEnergyType;
  const rank=index=>{
    const pokemon=bench[index];
    const energy=pokemon?.energies;
    if(!Array.isArray(energy)||!energy.every(p=>
      typeof p==='string'&&p.startsWith('Psychic Energy ')))
      return [99,99,99];
    const attacks=(pokemon.attacks??[]).filter(a=>
      a.gxAttack!==true&&!a.name?.endsWith('-GX')&&
      Array.isArray(a.cost)&&a.cost.length>0&&
      a.cost.every(type=>type===psychic||type===colorless));
    const available=attacks.map(a=>({
      gap:a.cost.length-energy.length,
      maxGeist:a.name==='Max Geist'&&
        pokemon.printing==='Shadow Rider Calyrex VMAX CRE'
    }));
    const next=available.filter(a=>a.gap>0);
    if(next.length){
      const missing=Math.min(...next.map(a=>a.gap));
      const canFinish=next.some(a=>a.gap===missing&&a.maxGeist);
      return [missing-1,canFinish?0:1,energy.length];
    }
    if(available.length)return [50,0,energy.length];
    return [90,0,energy.length];
  };
  const preferred=spec.preferredBenchIndex;
  return [...indices].sort((a,b)=>{
    const ra=rank(a),rb=rank(b);
    return ra[0]-rb[0]||ra[1]-rb[1]||ra[2]-rb[2]||
      (a===preferred?-1:0)-(b===preferred?-1:0)||a-b;
  });
}

module.exports={VERSION,rankOwnerPsychicBenchRecipients};
