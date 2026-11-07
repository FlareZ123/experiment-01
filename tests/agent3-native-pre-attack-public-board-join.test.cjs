'use strict';

const assert=require('node:assert/strict');
const test=require('node:test');
const {joinNativePreAttackBoard:join}=
  require('../simulation/evaluation/agent3-native-pre-attack-public-board-join.cjs');

function fixture(){
  const trial='6:210:B:champion-reference';
  const root={
    registeredTrialId:trial,attackRole:'original-source',attackSeat:0,
    attackName:'Volt Cyclone',attackDeclarationRootOrdinal:85,
    attackCompletionRootOrdinal:91,actualPrizeExitRootOrdinal:88,
    sameTurn:17
  };
  const before=[
    {active:{name:'Iron Thorns ex',printing:'Iron Thorns ex TWM',
      damage:0,energyCards:['Lightning Energy','Double Colorless Energy'],
      toolCards:[],printedAttacks:[{name:'Volt Cyclone',
        cost:['Lightning','Colorless','Colorless']}]},bench:[],stadium:[]},
    {active:{name:'Girafarig',printing:'Girafarig LOT',
      damage:0,energyCards:['Psychic Energy','Psychic Energy','Psychic Energy'],
      toolCards:[],printedAttacks:[{name:'Get Lost',cost:['Colorless']}]},
      bench:[],stadium:[]}
  ];
  const attack={actionOrdinal:85,attackName:'Volt Cyclone',
    turnBefore:17,completionRootOrdinal:91,settledPromptChain:true,
    settlementCrossesClockReset:false,publicBoardBefore:before};
  const attempts=[{trial:{id:trial},sourceSeat:0,candidateSeat:1,
    sourceAttackSettlement:{attacks:[attack]},
    candidateAttackSettlement:{attacks:[]}}];
  const victims=[{registeredTrialId:trial,attackName:'Volt Cyclone',
    actualPrizeExitRootOrdinal:88,victimLocation:'active',
    victimPrinting:{name:'Girafarig',fullName:'Girafarig LOT',set:'LOT',
      setNumber:'94',printedHp:90},victimDamageBeforeNativeKo:140}];
  const nominal=[{trialId:trial,originalRank:6,attackName:'Volt Cyclone',
    rosterAttackerPrintedId:'sv6-77',rosterAttackerName:'Iron Thorns ex',
    printedAttackCost:['Lightning','Colorless','Colorless'],
    unmodifiedPrintedFinalAttackDamage:140}];
  const field={decks:[{rank:6,cards:[{category:'Pokémon',name:'Iron Thorns ex',
    count:4,printing:{set:'TWM',number:'77'}}]}]};
  return {attempts,roots:[root],victims,nominal,field};
}
function run(f){
  return join(f.attempts,f.roots,f.victims,f.nominal,f.field);
}

test('real-root keyed native active card and pre-damage must join unique attacker',()=>{
  const f=fixture();
  const result=run(f);
  assert.equal(result.rows.length,1);
  assert.equal(result.nativeDamageDeltaPrintMatches,1);
  assert.equal(result.qualifiedCompetitiveGames,0);
  assert.equal(result.paperGameCertified,false);
  assert.equal(result.rows[0].attackerPrintingFromActualNativeBoard,
    'Iron Thorns ex TWM');
  assert.equal(result.rows[0].incrementalNativeDamageSincePreAttack,140);
  assert.deepEqual(result.rows[0].attackerEnergyNamesBeforeAttack,
    ['Lightning Energy','Double Colorless Energy']);
  assert.equal(result.rows[0].actualAttachedEnergyPaymentCertified,false);
});

test('the same native cumulative KO value can include earlier attack damage',()=>{
  const f=fixture();
  f.attempts[0].sourceAttackSettlement.attacks[0]
    .publicBoardBefore[1].active.damage=100;
  const result=run(f);
  assert.equal(result.rows[0].targetPreAttackDamage,100);
  assert.equal(result.rows[0].incrementalNativeDamageSincePreAttack,40);
  assert.equal(result.rows[0].independentPrintedNominalDamage,140);
  assert.equal(result.rows[0].nativeDeltaEqualsPrintedNominal,false);
  assert.equal(result.nativeDamageDeltaPrintMatches,0);
});

test('synthetic delegated attack name never reidentifies the public Active',()=>{
  // Deliberately inconsistent abstract native attacker/source labels exercise
  // provenance separation. This does not claim a paper-legal copied attack.
  const f=fixture();
  const id='1:212:B:champion-reference';
  f.roots[0].registeredTrialId=id;
  f.roots[0].attackRole='fixed-contender';
  f.roots[0].attackSeat=1;
  f.roots[0].attackName='Eon Blade';
  f.attempts[0].trial.id=id;
  f.attempts[0].sourceAttackSettlement={attacks:[]};
  f.attempts[0].candidateAttackSettlement={attacks:[{
    ...f.attempts[0].sourceAttackSettlement.attacks?.[0],
    actionOrdinal:85,attackName:'Eon Blade',turnBefore:17,
    completionRootOrdinal:91,settledPromptChain:true,
    settlementCrossesClockReset:false,
    publicBoardBefore:[
      {active:{name:'Trevenant & Dusknoir-GX',
        printing:'Trevenant & Dusknoir-GX SMP',damage:200,
        energyCards:['Psychic Energy'],toolCards:[],printedAttacks:[]}},
      {active:{name:'Mimikyu',printing:'Mimikyu GRI',damage:0,
        energyCards:['Psychic Energy','Psychic Energy'],
        toolCards:[],printedAttacks:[{name:'Copycat',
          cost:['Colorless','Colorless']}]}}
    ]
  }]};
  f.victims[0].registeredTrialId=id;
  f.victims[0].attackName='Eon Blade';
  f.victims[0].victimPrinting={name:'Trevenant & Dusknoir-GX',
    fullName:'Trevenant & Dusknoir-GX SMP',set:'SMP',setNumber:'217',
    printedHp:270};
  f.victims[0].victimDamageBeforeNativeKo=400;
  f.nominal[0]={trialId:id,originalRank:1,attackName:'Eon Blade',
    rosterAttackerPrintedId:'sv8-76',rosterAttackerName:'Latias ex',
    printedAttackCost:['Psychic','Psychic','Colorless'],
    unmodifiedPrintedFinalAttackDamage:200};
  f.field.decks=[{rank:1,cards:[
    {category:'Pokémon',name:'Latias ex',count:1,
      printing:{set:'SSP',number:'76'}},
    {category:'Pokémon',name:'Mimikyu',count:1,
      printing:{set:'GRI',number:'58'}}
  ]}];
  const result=run(f);
  assert.equal(result.rows[0].physicalActiveAtActualNativeAttackObserved,true);
  assert.equal(result.rows[0].attackerPrintingFromActualNativeBoard,'Mimikyu GRI');
  assert.equal(result.rows[0].sourceAttackPrintEqualsPhysicalActive,false);
  assert.equal(result.rows[0].copiedOrGrantedSourceUnresolved,true);
  assert.equal(result.rows[0].nativeDeltaEqualsPrintedNominal,true);
  assert.equal(result.rows[0].actualAttachedEnergyPaymentCertified,false);
});

test('strict source printing, victim, root and period validation rejects false joins',()=>{
  for(const mutate of [
    f=>{f.attempts[0].sourceAttackSettlement.attacks[0].actionOrdinal=86;},
    f=>{f.attempts[0].sourceAttackSettlement.attacks[0].settledPromptChain=false;},
    f=>{f.attempts[0].sourceAttackSettlement.attacks[0].settlementCrossesClockReset=true;},
    f=>{f.attempts[0].sourceAttackSettlement.attacks[0].publicBoardBefore[0].active.printing='Iron Thorns ex PRE';},
    f=>{f.attempts[0].sourceAttackSettlement.attacks[0].publicBoardBefore[1].active.printing='Girafarig UNB';},
    f=>{f.roots[0].attackSeat=1;},
    f=>{f.victims[0].victimDamageBeforeNativeKo=0;},
    f=>{f.attempts[0].sourceAttackSettlement.attacks.push(
      structuredClone(f.attempts[0].sourceAttackSettlement.attacks[0]));}
  ]){
    const f=fixture();
    mutate(f);
    assert.throws(()=>run(f));
  }
});
