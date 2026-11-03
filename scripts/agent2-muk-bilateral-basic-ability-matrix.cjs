'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {printedCard,rank26Exposure}=
  require('./agent2-rank26-basic-ability-exposure.cjs');

const SOURCES=Object.freeze({
 v0:{file:'agent43-apex-alchemy-paper-expanded-v0.json',
  sha:'21846db95f88d5d5abc6ee3876b3522732092e27ca5e7485948f354d8468a769'},
 v1:{file:'agent2-apex-alchemy-shake4-quick2-v1.json',
  sha:'5cd6b0fc7781e1a5a3b29f5a23654750295af89bdc63621f235fbd0c56701fd0'}
});
const readJSON=p=>JSON.parse(fs.readFileSync(p,'utf8'));

/**
 * Static original-versus-proposed full printed-60 Basic Ability exposure
 * while Muk's printed Stage1 Power of Alchemy effect remains operative.
 *
 * @param {string} root Repository root
 * @returns {object} Exact printed source and candidate copy census.
 */
function bilateralMukAbilityMatrix(root){
 const manifest=readJSON(path.join(root,'results/aichi-2026/full-decklists.json'));
 const enemy=rank26Exposure(manifest,root);
 const own={};
 for(const [label,source] of Object.entries(SOURCES)){
  const deck=readJSON(path.join(root,'results/aichi-2026',source.file));
  assert.equal(deck.deck_identity_sha256,source.sha);
  assert.equal(deck.cards.reduce((n,c)=>n+c.count,0),60);
  let basics=0,abilityCopies=0,nonbasicAbilityCopies=0;
  const exposed=[],preserved=[];
  for(const card of deck.cards.filter(c=>c.category==='Pokémon')){
   const print=printedCard(root,card.cardId);
   assert.equal(print.name,card.name);
   assert.equal(print.abilities?.length??0,(print.abilities??[]).length);
   const abilityNames=(print.abilities??[]).map(x=>x.name);
   if(print.subtypes.includes('Basic')){
    basics+=card.count;
    if(abilityNames.length){
     abilityCopies+=card.count;
     exposed.push({name:card.name,cardId:card.cardId,
       copies:card.count,abilities:abilityNames});
    }
   }else if(abilityNames.length){
    nonbasicAbilityCopies+=card.count;
    preserved.push({name:card.name,copies:card.count,
      abilities:abilityNames});
   }
  }
  assert.equal(basics,12);
  assert.equal(abilityCopies,3);
  assert.equal(exposed.length,3);
  assert.deepEqual(exposed.map(x=>x.name),
    ['Kyurem','Tapu Lele-GX','Latias ex']);
  assert.equal(nonbasicAbilityCopies,6);
  own[label]={sourceIdentitySha256:source.sha,basics,
    basicAbilityCopiesSilencedByOwnMuk:abilityCopies,
    basicAbilitiesSilenced:exposed,
    nonBasicAbilityCopiesNotCoveredByMuk:nonbasicAbilityCopies,
    nonBasicAbilitiesNotCovered:preserved};
 }
 assert.deepEqual(own.v0.basicAbilitiesSilenced,own.v1.basicAbilitiesSilenced);
 return {schema:'agent2-muk-basic-ability-bilateral-printed-census-v1',
  sourceRank26:{basics:enemy.sourceBasicCopies,
    basicAbilityCopiesSilencedByOpposingMuk:enemy.sourceBasicCopiesWithAbility,
    abilityNames:enemy.abilityRows.filter(x=>x.basicAbilityNames.length)},
  candidate:own,sourceRank26MinusOwnBasicAbilityCopies:11-3,
  independentGameResults:0,qualification:'static printed vulnerability only; not actual simultaneous board effects or game value'};
}
module.exports={SOURCES,bilateralMukAbilityMatrix};
