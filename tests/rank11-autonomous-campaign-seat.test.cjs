'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {buildCampaign} = require('../scripts/aichi-comparison-campaign.cjs');
const {executeCampaign} =
  require('../simulation/evaluation/aichi-campaign-runner.cjs');

/** @param {string} name @returns {object} */
function card(name) {
  return {name, count:60,
    printing:{set:'SYN',number:'1',language:'en'}};
}

test('source-rank11 policy receives the opponent physical seat in every candidate arm', () => {
  const field=Array.from({length:32}, (_,i)=>({
    rank:i+1, player:'P'+(i+1), archetype:'Synthetic',
    published:i===0||i===10
  }));
  const source={decks:[field[0],field[10]].map(f=>({
    ...f,cards:[card('source-'+f.rank)]
  }))};
  const candidates=[
    {id:'champion-reference',referenceOnly:true,cards:[card('candidate-ref')]},
    {id:'new-moon-lockbreaker-v1',provisionalEnglishProxy:true,
      sourceCode:'source',proxyIdCountHash:'a'.repeat(64),
      cards:[card('candidate-provisional')]}
  ];
  const campaign=buildCampaign({field,source,candidates,
    pilotRanks:[11],seatSeedMode:'decorrelated-slots-v3',
    repeats:1,seedBase:20261018});
  const seen=[];
  const result=executeCampaign({field,source,candidates,campaign},{
    phase:'pilot',maxTrials:4,
    trialIds:campaign.trials.filter(x=>x.phase==='pilot').map(x=>x.trialId),
    prepareCandidate(candidate) {
      return {engineRevision:'tested',candidate:{
        cards:Array(60).fill('candidate-'+candidate.id),
        substitutions:[],unresolved:[]},
        opponents:[{rank:11,status:'ready',cards:Array(60).fill('source-rank11'),
          substitutions:[],unresolved:[]}]};
    },
    runMatch(request) {
      seen.push({seat:request.rank11SourceSeat,
        firstCardA:request.deckA[0],firstCardB:request.deckB[0]});
      return {seed:request.seed,finished:false,
        deckHashes:[],rules:{format:'EXPANDED'},policyRandomIsolation:true};
    }
  });
  assert.equal(result.recordedTrials,4);
  assert.deepEqual(seen.map(x=>x.seat),[1,0,1,0]);
  assert.deepEqual(seen.map(x=>x.firstCardA),[
    'candidate-champion-reference','source-rank11',
    'candidate-new-moon-lockbreaker-v1','source-rank11'
  ]);
  assert.deepEqual(seen.map(x=>x.firstCardB),[
    'source-rank11','candidate-champion-reference',
    'source-rank11','candidate-new-moon-lockbreaker-v1'
  ]);
  assert.equal(result.competitiveWinRateCertified,false);
  assert.equal(result.records.every(x=>x.rank===11),true);
});
