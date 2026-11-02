'use strict';
const assert=require('node:assert/strict');
const VERSION='agent26-original-rank5-colorless-only-native-attack-gate-v1';
const PRINTED=Object.freeze([
  {name:'Mew V',set:'FST',number:'113',attacks:[
    ['Energy Mix',['Psychic']],
    ['Psychic Leap',['Psychic','Colorless']]]},
  {name:'Mew VMAX',set:'FST',number:'114',attacks:[
    ['Cross Fusion Strike',['Colorless','Colorless']],
    ['Max Miracle',['Psychic','Psychic']]]},
  {name:'Genesect V',set:'FST',number:'185',attacks:[
    ['Techno Blast',['Metal','Metal','Colorless']]]},
  {name:'Dedenne-GX',set:'UNB',number:'57',attacks:[
    ['Static Shock',['Lightning','Colorless']],
    ['Tingly Return-GX',['Lightning','Colorless']]]},
  {name:'Crobat V',set:'DAA',number:'104',attacks:[
    ['Venomous Fang',['Darkness','Colorless']]]},
  {name:"Lillie's Clefairy ex",set:'JTG',number:'56',attacks:[
    ['Full Moon Rondo',['Psychic','Colorless']]]}
]);

/**
 * Enumerate ordinary direct attack-cost feasibility with exact registered
 * rank5 energy prints, ignoring Energy cost changes, attack-copy delegation,
 * external attachment effects and attacks from other card texts.
 * Source attacks are frozen from supplied English card-list.zip:
 * sha256 c39af257e60a79a485aad09c7d7723b6afbb42eae1ba74e280b8a3f77581350a.
 * A copied Genesect Techno Blast can still resolve via payable
 * Mew VMAX Cross Fusion Strike, if Bench and other conditions hold.
 *
 * @param {object} manifest Authenticated 29-original Aichi printings.
 * @returns {object} Printed, conditional, paper attack-cost certificate.
 */
function rank5PrintedEnergyFeasibility(manifest){
  assert.equal(manifest.decks.length,29);
  const deck=manifest.decks.find(x=>x.rank===5);
  assert.ok(deck);
  assert.equal(deck.cards.reduce((s,c)=>s+c.count,0),60);
  const energies=deck.cards.filter(c=>c.category==='Energy');
  assert.deepEqual(energies.map(c=>({name:c.name,count:c.count})),
    [{name:'Double Colorless Energy',count:4}]);
  const pokemon=deck.cards.filter(c=>c.category==='Pokémon');
  assert.equal(pokemon.length,PRINTED.length);
  const rows=[];
  for(const spec of PRINTED){
    const card=pokemon.find(c=>c.name===spec.name);
    assert.ok(card);
    assert.equal(card.printing.set,spec.set);
    assert.equal(String(card.printing.number),spec.number);
    for(const [name,cost] of spec.attacks){
      // Every attached Energy from this original deck is Colorless.
      const colored=cost.filter(type=>type!=='Colorless');
      rows.push({pokemon:spec.name,printing:spec.set+'-'+spec.number,
        attack:name,cost:cost.slice(),
        coloredEnergyUnfunded:colored,
        payableByPrintedEnergyAlone:colored.length===0,
        immediateDceCardsRequired:colored.length===0?
          Math.ceil(cost.length/2):null});
    }
  }
  const feasible=rows.filter(r=>r.payableByPrintedEnergyAlone);
  assert.deepEqual(feasible.map(r=>[r.pokemon,r.attack]),
    [['Mew VMAX','Cross Fusion Strike']]);
  return {version:VERSION,sourceRank:5,originalSixtySize:60,
    registeredEnergyCopies:4,registeredEnergyNames:['Double Colorless Energy'],
    originalPokemonPrintings:PRINTED.length,printedAttackCount:rows.length,
    directlyColorlessPayableAttackCount:feasible.length,attacks:rows,
    attackCopyCostCaveat:'Mew VMAX Cross Fusion Strike may copy a Benched Fusion Strike donor attack, without requiring the donor attack color costs. Requires a legal Bench donor and other normal game conditions.',
    noOtherPrintedOrExternalEnergySourcesModeled:true,
    claimsNaturalGames:0,competitiveQualifiedGames:0};
}
if(require.main===module)
  process.stdout.write(JSON.stringify(rank5PrintedEnergyFeasibility(
    require('../results/aichi-2026/full-decklists.json')),null,2)+'\n');
module.exports={VERSION,PRINTED,rank5PrintedEnergyFeasibility};
