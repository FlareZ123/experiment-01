'use strict';

const assert=require('node:assert/strict');
const test=require('node:test');
const {initializeCards}=require('../simulation/twinleaf/headless.cjs');

test('pinned native M Charizard-EX FLF69 variant fingerprint diagnostic',()=>{
  const original=require('../resources/cards/en/xy2.json')
    .find(card=>card.id==='xy2-69');
  assert.equal(original.name,'M Charizard-EX');
  assert.equal(original.hp,'230');
  assert.deepEqual(original.types,['Dragon']);
  assert.equal(original.attacks[0].name,'Wild Blaze');
  assert.equal(original.attacks[0].damage,'300');
  const all=initializeCards().getAllCards().filter(card=>
    card.name==='M Charizard-EX' &&
    String(card.set).toUpperCase()==='FLF' &&
    String(card.setNumber)==='69');
  const fingerprints=all.map(card=>({
    fullName:card.fullName,set:card.set,number:card.setNumber,
    hp:card.hp,cardType:card.cardType,stage:card.stage,
    attacks:card.attacks.map(a=>({
      name:a.name,damage:a.damage,cost:a.cost,
      description:a.description,hasEffect:typeof a.effect==='function'
    })),weakness:card.weakness,weaknessType:card.weaknessType,
    resistance:card.resistance,retreat:card.retreat,
    tags:card.tags
  }));
  console.log('AGENT50_FLF69_NATIVE_AMBIGUITY',
    JSON.stringify({source:{
      id:original.id,name:original.name,hp:original.hp,types:original.types,
      attacks:original.attacks,weaknesses:original.weaknesses
    },candidateFingerprints:fingerprints}));
  assert.equal(all.length,2,'v2 source import reported two FLF69 exact native cards');
});
