'use strict';
const assert=require('node:assert/strict');
const path=require('node:path');
const fs=require('node:fs');
const {choose,exactOpportunity}=
  require('./agent25-dhelmise-t1-physical-opportunity.cjs');
const originalField=require('../results/aichi-2026/full-decklists.json');
const v0=require('../results/als/agent25-dhelmise-stage1-discard-v0.json');
const v1=require('../results/als/agent25-dhelmise-mixed-lock-donors-v1.json');

const VERSION='agent25-hns-discard-ability-lock-source-v1';
const sourceThreats=Object.freeze({
  wobbuffet:{name:'Wobbuffet',sets:['PHF']},
  silentLab:{name:'Silent Lab',sets:['PRC']},
  garbotoxin:{name:'Garbodor',sets:['LTR','BKP']}
});
const cache=new Map();
/** Find a concrete exact printed card from the local source pool. */
function printCard(id){
  if(cache.has(id))return cache.get(id);
  const [set]=id.split('-');
  const cards=JSON.parse(fs.readFileSync(path.resolve(__dirname,
    '../resources/cards/en',set+'.json'),'utf8'));
  const card=cards.find(c=>c.id===id);
  assert.ok(card,'unknown printed '+id);
  cache.set(id,card);
  return card;
}

/** @param {object} deck Exact 60 with source printing IDs */
function donorRows(deck){
  return deck.cards.flatMap(row=>{
    if(row.category!=='Pokémon')return [];
    const card=printCard(row.id);
    const activeAbility=card.abilities?.some(a=>a.name==="Hide 'n' Sneak");
    return activeAbility?[{id:row.id,name:row.name,count:row.count,
      psychic:card.types?.includes('Psychic')===true,
      basic:card.subtypes?.includes('Basic')===true}]:[];
  });
}

/**
 * Count HNS identities that still have their named Ability while in
 * discard with the stated *effective* card-based lock condition.
 * This is a counterfactual effect of printed text, not the incidence
 * of an actually established lock in a match.
 */
function effectiveDonors(rows,lock){
  assert.ok(['none','wobbuffet','silentLab','garbotoxin'].includes(lock));
  return rows.reduce((n,row)=>{
    if(lock==='garbotoxin'||lock==='wobbuffet'&&!row.psychic||
       lock==='silentLab'&&row.basic)return n;
    return n+row.count;
  },0);
}

/** Prize-only necessary accessibility; excludes hand/deck/card movement. */
function prizeSurvival(eligible,need=4){
  assert.ok(Number.isSafeInteger(eligible)&&eligible>=0&&eligible<=60);
  assert.ok(Number.isSafeInteger(need)&&need>=1);
  const denominator=choose(60,6);
  let numerator=0n;
  for(let prized=0;prized<=Math.min(eligible-need,6);prized++)
    numerator+=choose(eligible,prized)*
      choose(60-eligible,6-prized);
  return {eligible,need,unprizedAtLeastNeedProbability:
    Number(numerator)/Number(denominator),
    numerator:numerator.toString(),denominator:denominator.toString()};
}

function originalSourceRanks(lock){
  const spec=sourceThreats[lock];
  assert.ok(spec);
  return originalField.decks.filter(d=>d.cards.some(card=>
    card.name===spec.name&&spec.sets.includes(card.printing?.set)))
    .map(d=>d.rank).sort((a,b)=>a-b);
}
function study(){
  assert.equal(originalField.published_deck_count,29);
  const variants=[v0,v1].map(deck=>{
    const rows=donorRows(deck);
    assert.equal(rows.reduce((sum,row)=>sum+row.count,0),8);
    const basicCount=deck.cards.reduce((sum,row)=>
      sum+(row.category==='Pokémon'&&
        printCard(row.id).subtypes.includes('Basic')?row.count:0),0);
    const t1=exactOpportunity({basicCount});
    const byLock={};
    for(const lock of ['none','wobbuffet','silentLab','garbotoxin'])
      byLock[lock]=prizeSurvival(effectiveDonors(rows,lock));
    return {
      version:deck.version,basicCount,hnsDonors:rows,
      t1LocationUnconditional:t1.unconditionalProbability,
      t1LocationConditionalBasicValid:t1.conditionalBasicValidProbability,
      validStartingSeven:t1.basicValidOpeningProbability,byLock
    };
  });
  return {
    version:VERSION,sourceDeckCount:29,
    originalSourceThreatRanks:{
      activeWobbuffetPotential:originalSourceRanks('wobbuffet'),
      silentLabPotential:originalSourceRanks('silentLab'),
      toolGarbotoxinPotential:originalSourceRanks('garbotoxin')
    },
    variants,
    sourcePresenceIsNotEstablishedLock:true,
    prizeSurvivalIsNecessaryOnly:true,
    originalSourceFidelityUnchanged:true,
    competitiveQualifiedGames:0
  };
}
module.exports={VERSION,printCard,donorRows,effectiveDonors,
  prizeSurvival,originalSourceRanks,study};
if(require.main===module)process.stdout.write(
  JSON.stringify(study(),null,2)+'\n');

