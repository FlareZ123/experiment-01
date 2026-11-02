'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const path=require('node:path');
const roster=require('../results/aichi-2026/full-decklists.json');
const {loadPrintedPokemon}=require(
  '../scripts/aichi-regidrago-attack-payload-panel.cjs');
const {actorSingleSearchInput,chooseActorSingleSearch}=require(
  '../simulation/twinleaf/agent41-actor-owner-single-search.cjs');

const source=roster.decks.find(deck=>deck.rank===13);
const catalog=loadPrintedPokemon(roster,path.resolve(__dirname,'../resources'));
const target='Regidrago V SIT';
const earlier=[
  'Budew ASC','Dedenne-GX UNB','Dialga-GX UPR',
  'Kyurem SFA','Latias ex SSP'
];

function sourceBasics(){
  const cards=[];
  for(const row of source.cards.filter(c=>c.category==='Pokémon')){
    const key=JSON.stringify([
      row.name,row.printing.set,String(row.printing.number)
    ]);
    const printed=catalog.get(key);
    assert.ok(printed,key);
    if(!printed.subtypes.includes('Basic'))continue;
    for(let i=0;i<row.count;i++)cards.push({
      fullName:row.name+' '+row.printing.set,
      name:row.name,
      types:printed.types,
      eligible:true
    });
  }
  return cards;
}

class ChooseCardsPrompt{
  constructor(owner){
    this.id=23;
    this.playerId=owner.id;
    this.cards=owner.deck;
    this.message='CHOOSE_CARD_TO_HAND';
    this.options={min:0,max:1};
  }
  validate(cards){
    return Array.isArray(cards)&&cards.length<=1&&
      cards.every(card=>this.cards.cards.includes(card)&&card.eligible===true);
  }
}

/**
 * Stub the owner-authorized physical K1 prompt boundary, never infer hidden
 * current-game Prize or deck identities before this prompt.
 * @param {object[]} eligibleCards Source-printed Basic cards in mock owner deck.
 * @returns {{prompt:object,selected:string}}
 */
function chooseSourceBasic(eligibleCards){
  const owner={id:17,deck:{cards:eligibleCards}};
  const state={players:[owner,{id:18}],prompts:[new ChooseCardsPrompt(owner)]};
  const actor=actorSingleSearchInput(state,0,()=>({
    decisionKind:'owner-prompt',
    ownHand:['Quick Ball FST']
  }));
  assert.equal(actor.prompt.source,'own-deck');
  const result=chooseActorSingleSearch(actor);
  assert.ok(Array.isArray(result.indices));
  const offered=actor.prompt.offered[result.indices[0]];
  return {prompt:actor.prompt,selected:offered.printing};
}

test('source rank13 has five printed Basic search targets earlier than Regidrago V',()=>{
  assert.equal(source.archetype,'Regidrago');
  const cards=sourceBasics();
  assert.equal(cards.filter(c=>c.fullName===target).length,4);
  const found=[...new Set(cards.filter(c=>c.fullName<target)
    .map(c=>c.fullName))].sort();
  assert.deepEqual(found,earlier);
});

test('generic validated owner K1 chooser selects Budew ahead of intended V',()=>{
  const cards=sourceBasics();
  const first=chooseSourceBasic(cards);
  assert.equal(first.selected,'Budew ASC');
  assert.ok(first.prompt.offered.some(x=>x.printing===target&&
    x.selectableAlone));
  assert.equal(chooseSourceBasic(cards.slice().reverse()).selected,
    first.selected);
});

test('K1 alphabetic chooser can take Regidrago V if earlier Basics are absent',()=>{
  const cards=sourceBasics().filter(c=>!earlier.includes(c.fullName));
  const choice=chooseSourceBasic(cards);
  assert.equal(choice.selected,target);
});

test('synthetic owner prompt is a K1-only diagnostic, never a native win',()=>{
  const cards=sourceBasics();
  const selected=chooseSourceBasic(cards);
  assert.notEqual(selected.selected,target);
  assert.ok(roster.missing_full_lists.some(d=>d.rank===23));
  assert.ok(roster.missing_full_lists.some(d=>d.rank===28));
});
