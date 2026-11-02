'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const original=require('../results/aichi-2026/full-decklists.json');
const {chooseVipPromptCards}=require(
  '../simulation/twinleaf/agent9-battle-vip-owner-after-pass.cjs');
const {benchAbilityEntryContract}=require(
  '../scripts/agent9-vip-bench-entry-provenance.cjs');
const cards=require('../resources/cards/en/swsh8.json');

const TYPES={BASIC:2,POKEMON:0};
const source=original.decks.find(d=>d.rank===5);
const view={
  decisionKind:'owner-prompt',pendingOwnerDeckSearch:true,
  ownPublic:{active:{name:'Mew V'},bench:[null,null,null,null,null]}
};

/**
 * Build a card-identity-preserving, all-key-Basics-unprized owner search
 * opportunity from source rank5, after exactly one Mew V becomes Active.
 * A full 60 can realize this as 6 Prizes + starting hand hold Trainers.
 * @returns {object[]} Physical search targets with exact printed identities.
 */
function ownerRank5SearchCards(){
  assert.equal(source.archetype,'Mew Genesect');
  assert.equal(source.cards.reduce((n,c)=>n+c.count,0),60);
  assert.equal(source.cards.find(c=>c.name==='Battle VIP Pass').count,3);
  const allowed=new Set(['Mew V','Mew VMAX','Genesect V',
    'Crobat V','Dedenne-GX',"Lillie's Clefairy ex"]);
  const p=source.cards.filter(c=>c.category==='Pokémon');
  assert.deepEqual(new Set(p.map(c=>c.name)),allowed);
  const all=p.flatMap(c=>Array.from({length:c.count},(_,i)=>({
    name:c.name,fullName:c.name+' '+c.printing.set,
    set:c.printing.set,number:String(c.printing.number),copy:i,
    superType:TYPES.POKEMON,
    stage:c.name==='Mew VMAX'?3:TYPES.BASIC,
    evolvesFrom:c.name==='Mew VMAX'?'Mew V':undefined
  })));
  const active=all.findIndex(c=>c.name==='Mew V');
  assert.ok(active>=0);
  all.splice(active,1);
  return all;
}

/** @param {object[]} all Source owner-authorized deck search cards. */
function nativeLikePrompt(all){
  return {cards:{cards:all},validate(selected){
    return selected.length<=2&&selected.every(c=>all.includes(c)&&
      c.stage===TYPES.BASIC);
  }};
}

test('source rank5 native-like owner VIP selection is Mew V + Crobat V, excluding 4 Genesect V',()=>{
  const full=ownerRank5SearchCards();
  const p=nativeLikePrompt(full);
  const chosen=chooseVipPromptCards(p,view,TYPES);
  assert.deepEqual(chosen.map(c=>c.name),['Mew V','Crobat V']);
  assert.equal(full.filter(c=>c.name==='Genesect V').length,4);
  const genesect=full.find(c=>c.name==='Genesect V');
  assert.equal(p.validate([chosen[0],genesect]),true,
    'A Mew V + Genesect V target pair is native-eligible under the same owner search');
  assert.deepEqual(chooseVipPromptCards(nativeLikePrompt([...full].reverse()),
    view,TYPES).map(c=>c.name),['Mew V','Crobat V'],
    'deck enumeration order cannot explain the preference');
});

test('Crobat VIP has no Dark Asset trigger while Genesect has an in-play draw Ability',()=>{
  const crobat=ownerRank5SearchCards().find(c=>c.name==='Crobat V');
  assert.deepEqual(benchAbilityEntryContract({
    name:'Crobat V',printing:{set:crobat.set,number:crobat.number}
  },'direct-deck-to-bench'),{
    ability:'Dark Asset',handEntryConditionMet:false,
    otherActivationConditionsVerified:false
  });
  const genesect=cards.find(c=>c.number==='185'&&c.name==='Genesect V');
  assert.ok(genesect);
  const ability=genesect.abilities.find(a=>a.name==='Fusion Strike System');
  assert.ok(ability);
  assert.match(ability.text,/Once during your turn, you may draw/i);
  assert.doesNotMatch(ability.text,/from your hand onto your Bench/i,
    'Genesect use is unrelated to how it entered the Bench');
});
