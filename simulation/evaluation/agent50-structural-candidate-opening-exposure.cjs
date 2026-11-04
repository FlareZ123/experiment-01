'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {
  createBasicClassifier,countStartingBasics
}=require('./agent1-original-field-mulligan-bonus.cjs');
const {
  printedResolver,hasTurnBenchPlayAbility,openingBenchTriggerExposure
}=require('./agent50-opening-bench-trigger-exposure.cjs');

const ROOT=path.resolve(__dirname,'../..');
const VERSION='agent50-4structural-candidate-opening-trigger-census-v1';
const CANDIDATES=Object.freeze([
  Object.freeze({name:'Apex Alchemy v0',
    path:'results/aichi-2026/agent43-apex-alchemy-paper-expanded-v0.json'}),
  Object.freeze({name:'ADP Thorton Regidrago v2',
    path:'results/aichi-2026/candidates/agent5-adp-thorton-regidrago-60-v2.json'}),
  Object.freeze({name:'Sentinel Lopunny Vileplume v1',
    path:'results/aichi-2026/candidate-sentinel-lopunny-vileplume-v1.json'}),
  Object.freeze({name:'Arven Shake Absol v1',
    path:'results/aichi-2026/candidate-arven-shake-absol-v1.json'})
]);

/**
 * Authenticate a candidate's actual JSON card ID against exact bundled
 * printed-card metadata; unlike historical source PTCGO codes, this
 * representation carries the canonical indexed set ID directly.
 *
 * @param {string} id English indexed printed-card ID.
 * @param {string} name Expected printed card name.
 * @param {string} [root]
 * @returns {object} Indexed full physical card record.
 */
function indexedCardById(id,name,root=ROOT){
  assert.equal(typeof id,'string');
  const dash=id.lastIndexOf('-');
  assert.ok(dash>0,'Indexed printed card ID must include set and number');
  const filename=path.join(root,'resources/cards/en',id.slice(0,dash)+'.json');
  const record=JSON.parse(fs.readFileSync(filename,'utf8'))
    .find(card=>card.id===id);
  assert.ok(record,'Indexed printed candidate card missing: '+id);
  assert.equal(record.name,name,'Printed candidate name differs from indexed card');
  return record;
}

/**
 * Owner-hand-only opening risk for four separately frozen structural candidate
 * 60s, using original printed identity without any pretense of real games.
 * Indexed IDs are checked on every candidate; unrelated Trainers and Energy
 * are excluded by their printed supertype.
 *
 * @param {string} [root]
 * @returns {object}
 */
function structuralCandidateBenchTriggerExposure(root=ROOT){
  const classifier=createBasicClassifier(root);
  const resolve=printedResolver(root);
  const rows=CANDIDATES.map(spec=>{
    const deck=JSON.parse(fs.readFileSync(path.join(root,spec.path),'utf8'));
    const basics=countStartingBasics(deck,classifier);
    let triggers=0;
    const qualifying=[];
    for(const source of deck.cards){
      if(source.category&&source.category!=='Pokémon')continue;
      let result;
      if(source.cardId||source.id){
        result={card:indexedCardById(source.cardId??source.id,
          source.name,root),unknown:false};
      }else{
        assert.ok(source.printing,
          'Candidate Pokémon lacks printed identity: '+spec.path);
        result=resolve(source.printing,source.name);
      }
      if(result.unknown)
        throw new Error('Candidate printed Basic text unresolved: '+spec.path);
      if(result.card.supertype!=='Pokémon')continue;
      if(result.card.subtypes.includes('Basic')&&
          hasTurnBenchPlayAbility(result.card)){
        triggers+=source.count;
        qualifying.push({
          name:source.name,
          id:result.card.id,
          count:source.count,
          abilities:result.card.abilities.filter(a=>
            typeof a.text==='string'&&
            /when you play this pok[eé]mon from your hand onto your bench/i
              .test(a.text)).map(a=>a.name)
        });
      }
    }
    const exposure=openingBenchTriggerExposure(basics,triggers);
    return {
      name:spec.name,source:spec.path,basics,triggers,qualifying,
      validOpenings:exposure.validOpenings.toString(),
      consumedTriggerOpenings:exposure.consumedTriggerOpenings.toString(),
      avoidableTriggerOpenings:exposure.avoidableTriggerOpenings.toString(),
      consumedTriggerGivenValid:exposure.consumedTriggerGivenValid,
      avoidableTriggerGivenValid:exposure.avoidableTriggerGivenValid
    };
  });
  assert.equal(rows.length,4);
  return {
    schema:VERSION,scope:'four fixed structural candidates only',
    competitiveQualifiedGames:0,
    rows
  };
}

module.exports={ROOT,VERSION,CANDIDATES,indexedCardById,
  structuralCandidateBenchTriggerExposure};
