'use strict';

const assert=require('node:assert/strict');
const original=require('../results/aichi-2026/full-decklists.json');
const {specialEnergyUnits}=require('../simulation/twinleaf/agent3-special-energy-frontier.cjs');
const {energyUnits}=require('../simulation/twinleaf/actor-energy-payability.cjs');

const BASIC_NAMES=new Set([
  'Grass Energy','Fire Energy','Water Energy','Lightning Energy',
  'Psychic Energy','Fighting Energy','Darkness Energy','Metal Energy',
  'Fairy Energy'
]);
const NARROW_ENGINE_ALIASES=Object.freeze({
  'Telepathic Psychic Energy POR':'Telepath [P] Energy M3'
});
const BASIC_TYPES=Object.freeze({
  Grass:1,Fire:2,Water:3,Lightning:4,Psychic:5,
  Fighting:6,Darkness:7,Metal:8,Fairy:9
});
const NARROW_CATALOG=Object.freeze({
  specialEnergies:null,
  basicEnergyTypes:BASIC_TYPES,
  colorlessEnergyType:10
});
const FAVORABLE_CONTEXT=Object.freeze({
  isBasic:true,isEvolution:true,isDragon:true,hasRuleBox:false,
  behindOnPrizes:true,isPokemonGXorEX:false
});
const CONSERVATIVE_CONTEXT=Object.freeze({
  isBasic:false,isEvolution:false,isDragon:false,hasRuleBox:true,
  behindOnPrizes:true,isPokemonGXorEX:undefined
});

/** @param {object} card Original printed card row. */
function isBasicEnergy(card){
  return card.category==='Energy'&&
    BASIC_NAMES.has(card.name.replace(/^Basic /,''));
}

/** @param {object} card Original printed card row. */
function sourcePrinting(card){
  assert.equal(typeof card.name,'string');
  assert.equal(typeof card.printing?.set,'string');
  return card.name+' '+card.printing.set;
}

/**
 * Compare exact original-field printings against the narrow v8 Energy-unit
 * helper and the general owner-public flexible Energy model.
 *
 * The favorable context intentionally makes conditional effects available.
 * It measures recognition capacity, not whether a real recipient or Prize
 * state exists. The conservative context leaves Dragon/GX/Prize facts
 * unresolved and therefore preserves fail-closed behavior.
 *
 * @returns {object} Reproducible source-field model coverage.
 */
function summarizeSpecialEnergyCoverage(){
  assert.equal(original.published_deck_count,29);
  assert.equal(original.decks.length,29);
  assert.deepEqual(original.missing_full_lists.map(x=>x.rank).sort((a,b)=>a-b),
    [23,25,28]);

  const sourceRows=[];
  for(const deck of original.decks){
    assert.equal(deck.cards.reduce((sum,card)=>sum+card.count,0),60,
      'Original rank '+deck.rank+' is not exactly 60 cards');
    for(const card of deck.cards.filter(x=>x.category==='Energy')){
      sourceRows.push({
        rank:deck.rank,count:card.count,name:card.name,
        printing:sourcePrinting(card),basic:isBasicEnergy(card)
      });
    }
  }
  const specialRows=sourceRows.filter(row=>!row.basic);
  const sourceSpecialNames=new Set(specialRows.map(row=>row.printing));
  const aliasNames=Object.values(NARROW_ENGINE_ALIASES);
  const narrowCatalog={
    ...NARROW_CATALOG,
    specialEnergies:new Set([...sourceSpecialNames,...aliasNames])
  };

  const printingMap=new Map();
  const rankRows=[];
  for(const deck of original.decks){
    const rows=sourceRows.filter(row=>row.rank===deck.rank);
    const summary={
      rank:deck.rank,archetype:deck.archetype,
      energyCopies:0,specialCopies:0,
      narrowExactCopies:0,narrowAliasCopies:0,
      genericFavorableCopies:0,genericConservativeCopies:0
    };
    for(const row of rows){
      summary.energyCopies+=row.count;
      const entry=printingMap.get(row.printing)??{
        printing:row.printing,name:row.name,count:0,ranks:[],
        narrowExactCopies:0,narrowAliasCopies:0,
        genericFavorableCopies:0,genericConservativeCopies:0
      };
      entry.count+=row.count;
      entry.ranks.push({rank:row.rank,count:row.count});
      if(!row.basic){
        summary.specialCopies+=row.count;
        const exact=specialEnergyUnits(row.printing,narrowCatalog,false);
        const alias=NARROW_ENGINE_ALIASES[row.printing]??row.printing;
        const aliased=specialEnergyUnits(alias,narrowCatalog,false);
        const favorable=energyUnits(row.printing,FAVORABLE_CONTEXT);
        const conservative=energyUnits(row.printing,CONSERVATIVE_CONTEXT);
        if(exact!==null){
          summary.narrowExactCopies+=row.count;
          entry.narrowExactCopies+=row.count;
        }
        if(aliased!==null){
          summary.narrowAliasCopies+=row.count;
          entry.narrowAliasCopies+=row.count;
        }
        if(favorable!==null){
          summary.genericFavorableCopies+=row.count;
          entry.genericFavorableCopies+=row.count;
        }
        if(conservative!==null){
          summary.genericConservativeCopies+=row.count;
          entry.genericConservativeCopies+=row.count;
        }
      }else{
        const favorable=energyUnits(row.printing,FAVORABLE_CONTEXT);
        const conservative=energyUnits(row.printing,CONSERVATIVE_CONTEXT);
        if(favorable!==null)summary.genericFavorableCopies+=row.count;
        if(conservative!==null)summary.genericConservativeCopies+=row.count;
      }
      printingMap.set(row.printing,entry);
    }
    rankRows.push(summary);
  }

  const printings=[...printingMap.values()].sort((a,b)=>
    a.printing.localeCompare(b.printing));
  const specialOnlyRanks=rankRows.filter(row=>
    row.energyCopies>0&&row.specialCopies===row.energyCopies);
  const sum=(rows,key)=>rows.reduce((total,row)=>total+row[key],0);
  const specialSummary={
    copies:specialRows.reduce((total,row)=>total+row.count,0),
    distinctPrintings:sourceSpecialNames.size,
    narrowExactCopies:sum(rankRows,'narrowExactCopies'),
    narrowAliasCopies:sum(rankRows,'narrowAliasCopies'),
    genericFavorableCopies:sum(rankRows,'genericFavorableCopies'),
    genericConservativeCopies:sum(rankRows,'genericConservativeCopies')
  };
  const totalSummary={
    originalDecks:original.decks.length,
    totalEnergyCopies:sum(rankRows,'energyCopies'),
    distinctEnergyPrintings:printings.length,
    specialOnlyRanks:specialOnlyRanks.map(row=>row.rank),
    specialOnlyEnergyCopies:sum(specialOnlyRanks,'energyCopies'),
    specialOnlyNarrowExactCopies:sum(specialOnlyRanks,'narrowExactCopies'),
    specialOnlyNarrowAliasCopies:sum(specialOnlyRanks,'narrowAliasCopies'),
    specialOnlyGenericFavorableCopies:
      sum(specialOnlyRanks,'genericFavorableCopies')
  };

  assert.equal(totalSummary.totalEnergyCopies,238);
  assert.equal(printings.length,21);
  assert.equal(specialSummary.copies,118);
  assert.equal(specialSummary.distinctPrintings,14);
  assert.equal(specialSummary.narrowExactCopies,38);
  assert.equal(specialSummary.narrowAliasCopies,44);
  assert.equal(specialSummary.genericFavorableCopies,118);
  assert.equal(specialSummary.genericConservativeCopies,72);
  assert.deepEqual(totalSummary.specialOnlyRanks,[4,5,6,7,17,24,29]);
  assert.equal(totalSummary.specialOnlyEnergyCopies,56);
  assert.equal(totalSummary.specialOnlyNarrowExactCopies,30);
  assert.equal(totalSummary.specialOnlyNarrowAliasCopies,30);
  assert.equal(totalSummary.specialOnlyGenericFavorableCopies,56);
  assert.equal(rankRows.find(row=>row.rank===4).narrowExactCopies,0);
  assert.equal(rankRows.find(row=>row.rank===17).narrowExactCopies,0);
  assert.equal(rankRows.find(row=>row.rank===7).narrowExactCopies,2);

  return {
    schema:'agent33-aichi-original-special-energy-model-coverage-v1',
    source:'results/aichi-2026/full-decklists.json',
    missingOriginalRanks:[23,25,28],
    narrowModel:'agent3-special-energy-frontier.specialEnergyUnits',
    generalModel:'actor-energy-payability.energyUnits',
    aliasTreatment:{
      'Telepathic Psychic Energy POR':'Telepath [P] Energy M3',
      note:'The alias scenario is reported separately; it is not silently assumed to be the original printed name.'
    },
    specialSummary,totalSummary,rankRows,printings,
    context:{
      favorable:FAVORABLE_CONTEXT,
      conservative:{
        isBasic:false,isEvolution:false,isDragon:false,hasRuleBox:true,
        behindOnPrizes:true,isPokemonGXorEX:'unknown'
      }
    },
    interpretation:{
      narrowExact:'Only direct original source name+set strings accepted by the narrow helper.',
      narrowAlias:'Same narrow helper after the one explicit Telepathic-to-engine alias mapping.',
      genericFavorable:'Every source Special Energy is represented under a deliberately favorable hypothetical recipient/Prize context.',
      genericConservative:'Counter Energy and Double Dragon Energy remain unknown under conservative public facts; they are not assigned invented units.',
      scope:'Printed Energy-unit recognition only. This does not certify attachment legality, on-attachment effects, paper payment, native Store settlement, beneficial decisions, attacks, opponent replies, or game outcomes.'
    },
    competitivelyQualifiedGames:0,
    estimatedWinRate:null
  };
}

if(require.main===module){
  process.stdout.write(JSON.stringify(summarizeSpecialEnergyCoverage(),null,2)+'\n');
}
module.exports={BASIC_NAMES,NARROW_ENGINE_ALIASES,FAVORABLE_CONTEXT,
  CONSERVATIVE_CONTEXT,isBasicEnergy,sourcePrinting,
  summarizeSpecialEnergyCoverage};
