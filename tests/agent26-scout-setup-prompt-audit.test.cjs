'use strict';
const assert=require('node:assert/strict');
const test=require('node:test');
const {auditFrozenScoutSetup,sourceSetupBenchSelection}=require('../scripts/agent26-scout-setup-prompt-audit.cjs');

function arm(id,seat,selected){
 const [rank,repeat,candidateSlot,candidateId]=id.split(':');
 return {trial:{id,rank:Number(rank),repeat:Number(repeat),candidateSlot,candidateId,seed:1000+Number(rank)*100+Number(repeat)*2+(candidateSlot==='A'?0:1)},
 sourceSeat:seat,sourceDeckFingerprint:'same-deck',
 sourceDealFingerprint:rank==='6'&&repeat==='3'&&candidateSlot==='B'?candidateId:'identical-position',
 verifiedFirstTurn:true,actualStarterSeat:seat,finished:true,
 nativePromptChoices:{events:[{turn:0,actorSeat:seat,kind:'ChooseCardsPrompt',sourceZone:'hand',sourceZoneCardCountBefore:7,selectedCards:selected,ordinal:4}]}};
}
function frozenFixture(){
 const rows=[],sourcePairs=[];
 for(const rank of [6,11]) for(const slot of ['A','B']) for(let repeat=0;repeat<4;repeat++){
  const prefix=[rank,repeat,slot].join(':'),seat=slot==='A'?1:0,altered=prefix==='6:3:B';
  rows.push(arm(prefix+':champion-reference',seat,['Iron Thorns ex TWM']));
  rows.push(arm(prefix+':new-moon-lockbreaker-v1',seat,altered?['Iron Thorns ex TWM','Iron Thorns ex TWM']:['Iron Thorns ex TWM']));
  sourcePairs.push({pairId:prefix,sameSourcePhysicalDeal:!altered});
 }
 return {schema:'agent41-preregistered-32-arm-canonical-scout-v1',registrationPath:'frozen-registration',developmentResult:{rows,sourcePairs}};
}
test('frozen source setup witness classifies all 16 pairs and preserves raw',()=>{
 const fixture=frozenFixture(),before=JSON.stringify(fixture),r=auditFrozenScoutSetup(fixture);
 assert.equal(r.totalPairs,16);assert.equal(r.matchingSourcePhysicalDeals,15);
 assert.equal(r.divergentSourcePhysicalDeals,1);
 assert.equal(r.matchingObservedSourceSetupBenchChoices,15);
 assert.equal(r.divergentObservedSourceSetupBenchChoices,1);
 assert.deepEqual(r.mismatchPairIds,['6:3:B']);assert.deepEqual(r.divergentSetupPairIds,['6:3:B']);
 const x=r.rows.find(y=>y.pairId==='6:3:B');
 assert.deepEqual(x.championSelectedSetupBench,['Iron Thorns ex TWM']);
 assert.deepEqual(x.newMoonSelectedSetupBench,['Iron Thorns ex TWM','Iron Thorns ex TWM']);
 assert.equal(r.competitiveQualifiedGames,0);
 assert.equal(JSON.stringify(fixture),before);
});
test('missing and inconsistent native source setup evidence fails closed',()=>{
 const one=frozenFixture();one.developmentResult.rows[0].nativePromptChoices.events=[];
 assert.throws(()=>auditFrozenScoutSetup(one),/Expected one/);
 const two=frozenFixture();two.developmentResult.rows[1].trial.seed=999;
 assert.throws(()=>auditFrozenScoutSetup(two));
 const three=frozenFixture();three.developmentResult.rows.pop();
 assert.throws(()=>auditFrozenScoutSetup(three));
});
test('native actor and seven-card source hand are enforced',()=>{
 const x=arm('6:0:A:champion-reference',1,['Iron Thorns ex TWM']);
 assert.deepEqual(sourceSetupBenchSelection(x),{cards:['Iron Thorns ex TWM'],promptOrdinal:4,sourceSeat:1});
 x.nativePromptChoices.events[0].sourceZoneCardCountBefore=8;
 assert.throws(()=>sourceSetupBenchSelection(x),/initial seven/);
});
