'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {run,supporterCensus} = require('../scripts/aichi-supporter-density.cjs');

test('printed category and card-database subtype determine Supporters',()=>{
  const types=new Map([
    ['Guzma',new Set(['Supporter'])],
    ['VS Seeker',new Set(['Item'])],
    ['Psychic Energy',new Set()]
  ]);
  const manifest={missing_full_lists:[23,25,28],decks:[{
    rank:99,archetype:'Synthetic',cards:[
      {name:'Guzma',category:'Trainer',count:2},
      {name:'VS Seeker',category:'Trainer',count:4},
      {name:'Psychic Energy',category:'Energy',count:54}
    ]
  }]};
  const report=supporterCensus(manifest,types);
  assert.equal(report.classificationComplete,true);
  assert.equal(report.totalSupporterCopies,2);
  assert.equal(report.totalVSSeekerCopies,4);
  assert.equal(report.rows[0].printedCards,60);
  assert.equal(report.rows[0].distinctSupporterNames,1);
});

test('unknown Trainers remain explicitly unclassified',()=>{
  const report=supporterCensus({decks:[{
    rank:1,archetype:'Fixture',cards:[
      {name:'Novel Trainer',category:'Trainer',count:1},
      {name:'Basic Energy',category:'Energy',count:59}
    ]
  }]},new Map());
  assert.equal(report.classificationComplete,false);
  assert.deepEqual(report.unknownTrainerNames,['Novel Trainer']);
});

test('published Aichi 29 recovered lists have an exact checked Supporter census',()=>{
  const result=run();
  assert.equal(result.sourceDeckCount,29);
  assert.equal(result.totalPrintedCards,29*60);
  assert.equal(result.classificationComplete,true);
  assert.deepEqual(result.unknownTrainerNames,[]);
  assert.equal(result.conflictingTrainerSubtypeNames.length,0);
  assert.equal(result.totalSupporterCopies,297);
  assert.equal(result.medianSupporterCopies,9);
  assert.equal(result.deckCountWithSupporter,29);
  assert.equal(result.deckCountWithAtLeastFour,28);
  assert.equal(result.totalVSSeekerCopies,59);
  assert.equal(result.rows.find(row=>row.rank===11).supporterCopies,8);
  assert.equal(result.competitivelyQualifiedGames,0);
});
