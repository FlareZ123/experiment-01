'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {planAichi}=require('./aichi-pilot.cjs');
const {captureSetupOnly}=require('./aichi-setup-only-capture.cjs');
const {withGoFirstChoice}=require('../twinleaf/agent6-go-first-choice.cjs');
const {runMatch}=require('../twinleaf/headless.cjs');
const {Store}=require('../../vendor/twinleaf/ptcg-server/output/game/store/store');

/** Pinned original-Store setup only: no complete games or competitive results. */
function run(){
  const roster=JSON.parse(fs.readFileSync(path.resolve(__dirname,
    '../../results/aichi-2026/full-decklists.json'),'utf8'));
  const champion=roster.decks.find(x=>x.rank===1);
  assert.ok(champion);
  const plan=planAichi({label:'champion-reference',cards:champion.cards},{
    allowEquivalentBasicEnergies:true,
    allowBasicEnergyMirrorPrintings:true,allowJapanesePromoHooks:true});
  const rows=[];
  for(const rank of [6,11]){
    const source=plan.opponents.find(x=>x.rank===rank);
    assert.equal(source?.status,'ready');
    for(const seat of [0,1]){
      const seed=seat===0?24941728:1460221882;
      const decks={deckA:seat===0?source.cards:plan.candidate.cards,
        deckB:seat===1?source.cards:plan.candidate.cards,
        seed,maxActions:150,strictPromptValidation:true};
      const arms=[];
      for(const wantFirst of [true,false]){
        const o=withGoFirstChoice([wantFirst,wantFirst],
          ()=>captureSetupOnly(Store,()=>runMatch(decks),{
            sourceSeat:seat,captureFirstTurnEvidence:true}));
        assert.equal(o.result.stoppedAtFirstTurn,true);
        assert.equal(o.result.firstTurnEvidence?.verifiedByDrawLog,true);
        assert.equal(o.audit.choices.length,1);
        const winner=o.audit.choices[0].seat;
        const first=o.result.firstTurnEvidence.firstTurnSlot;
        assert.equal(first,wantFirst?winner:1-winner);
        arms.push({wantFirst,winner,first});
      }
      assert.equal(arms[0].winner,arms[1].winner);
      assert.notEqual(arms[0].first,arms[1].first);
      rows.push({rank,sourceSeat:seat,seed,arms});
    }
  }
  return {schema:'agent6-native-go-first-polarity-v1',rows,
    verifiedPairs:rows.length,qualifiedCompetitiveGames:0};
}
if(require.main===module)process.stdout.write(JSON.stringify(run(),null,2)+'\n');
module.exports={run};
