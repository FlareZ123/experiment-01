'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {certificate}=
  require('../simulation/evaluation/agent35-v9-powerglass-root98.cjs');

/** Build source-exposed but fully synthetic witness for receipt gate tests. */
function fixture(){
  const roots=Array.from({length:99},(_,i)=>({actionOrdinal:i,
    playerSlot:i===98?1:0,action:i===98?'PassTurnAction':'ResolvePromptAction'}));
  for(const [ordinal,card] of [[92,'Mewtwo & Mew-GX'],
    [93,"Lillie's Determination"],[97,'Squawkabilly ex']]){
    roots[ordinal]={actionOrdinal:ordinal,playerSlot:1,action:'PlayCardAction',card};
  }
  const sourceBench=['Tapu Lele-GX GRI','Trubbish FST','Crobat V DAA',
    'Latias ex SSP','Mega Absol ex M1L'].map(printing=>({printing}));
  const ownerBench=['Mewtwo & Mew-GX UNM','Lunatone OBF','Duskull VIV',
    'Trevenant & Dusknoir-GX SMP','Squawkabilly ex PAL'].map(printing=>({printing}));
  return {nativeAttempt:{
    id:'11:1000:B:new-moon-lockbreaker-v1',sourceSeat:0,candidateSeat:1,
    status:'native-terminal-unqualified',
    sourceDealFingerprint:'a6e4ba442cc784498de9d2938b47e8e42b6e9591fc07558e505ac2cd9094b317',
    fullPhysicalDealFingerprint:'94526e4b7eecefa78cbb7db5bc053cb593e90d20310a680e6510a00c11e702d7',
    rootActionLedger:roots,
    sourceAttackSettlement:{attacks:[{
      actionOrdinal:86,attackName:'Super Poison Breath',
      prizesBefore:[6,6],prizesAfter:[5,6],
      publicBoardBefore:[{},{
        active:{printing:'Unown AOR',energyCards:['Psychic Energy','Psychic Energy']}
      }],
      publicBoardAfter:[{},{
        active:{printing:'Unown AOR',energyCards:[]}
      }]
    }]},
    nativeAllOwnerPassFrontier:{receipts:[{
      actionOrdinal:98,actorSeat:1,turn:14,
      ownerHandAtChosenPass:['Powerglass SFA','Escape Rope BST'],
      publicBoardBeforePass:[
        {active:{printing:'Trubbish FST',damage:60,toolCards:[]},
          bench:sourceBench,stadium:[]},
        {active:{printing:'Unown AOR',damage:0,energyCards:[],toolCards:[]},
          bench:ownerBench,stadium:[]}
      ]
    }]}
  }};
}

test('paper conditional line reaches precisely a one-Prize opponent',()=>{
  const c=certificate(fixture());
  assert.equal(c.actualPassOrdinal,98);
  assert.equal(c.realBoardAtPass.sourceDamage,60);
  assert.equal(c.priorPhysicalKoEvidence.previousUnownPhysicalBasicPsychicAttached,2);
  assert.equal(c.executionOfThisCounterfactual,false);
  assert.equal(c.competitivelyQualifiedGames,0);
});
test('reject missing KO Prize receipt or non-Basic attached card',()=>{
  const a=fixture();a.nativeAttempt.sourceAttackSettlement.attacks[0].prizesAfter=[6,6];
  assert.throws(()=>certificate(a));
  const b=fixture();
  b.nativeAttempt.sourceAttackSettlement.attacks[0].publicBoardBefore[1]
    .active.energyCards[0]='Telepathic Psychic Energy';
  assert.throws(()=>certificate(b));
});
test('reject absent held Powerglass, occupied Tool and incorrect damage',()=>{
  const a=fixture();
  a.nativeAttempt.nativeAllOwnerPassFrontier.receipts[0]
    .ownerHandAtChosenPass=['Escape Rope BST'];
  assert.throws(()=>certificate(a));
  const b=fixture();
  b.nativeAttempt.nativeAllOwnerPassFrontier.receipts[0]
    .publicBoardBeforePass[1].active.toolCards=['Float Stone BKT'];
  assert.throws(()=>certificate(b));
  const c=fixture();
  c.nativeAttempt.nativeAllOwnerPassFrontier.receipts[0]
    .publicBoardBeforePass[0].active.damage=50;
  assert.throws(()=>certificate(c));
});
test('reject visible lock and altered intervening card action history',()=>{
  const a=fixture();
  a.nativeAttempt.nativeAllOwnerPassFrontier.receipts[0]
    .publicBoardBeforePass[0].bench[3].printing='Vileplume AOR';
  assert.throws(()=>certificate(a));
  const b=fixture();
  b.nativeAttempt.rootActionLedger[96]={
    actionOrdinal:96,action:'PlayCardAction',card:'Energy Retrieval',playerSlot:1
  };
  assert.throws(()=>certificate(b));
});
