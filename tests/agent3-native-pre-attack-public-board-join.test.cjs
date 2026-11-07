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
        cost:[4,9,9]}]},bench:[],stadium:[]},
    {active:{name:'Girafarig',printing:'Girafarig LOT',
      damage:0,energyCards:['Psychic Energy','Psychic Energy','Psychic Energy'],
      toolCards:[],printedAttacks:[{name:'Get Lost',cost:['Colorless']}]},
      bench:[],stadium:[]}
  ];
  const immediate=structuredClone(before);
  immediate[1].active.damage=140;
  const after=structuredClone(before);
  after[1].active=null;
  const attack={actionOrdinal:85,initiatingRootActionOrdinal:85,
    attackName:'Volt Cyclone',triggerAction:'AttackAction',
    turnBefore:17,declarationRootTurnAfter:17,
    declarationRootPromptPendingAfter:true,
    completionRootOrdinal:91,completionRootTurnBefore:17,
    completionRootTurnMatchesDeclarationTurn:true,
    activePrintingBefore:'Iron Thorns ex TWM',
    activePrintedAttackNamesBefore:['Volt Cyclone'],
    attackNamePrintedOnPhysicalActiveBefore:true,
    directAttackPrintedOnPhysicalActiveBefore:true,
    settledPromptChain:true,settlementCrossesClockReset:false,
    publicBoardBefore:before,
    publicBoardImmediatelyAfterDeclarationRoot:immediate,
    publicBoardAfter:after};
  const attempts=[{trial:{id:trial},sourceSeat:0,candidateSeat:1,
    sourceAttackSettlement:{attacks:[attack]},
    candidateAttackSettlement:{attacks:[]}}];
  const victims=[{registeredTrialId:trial,attackName:'Volt Cyclone',
    actualPrizeExitRootOrdinal:88,victimLocation:'active',
    victimPrinting:{name:'Girafarig',fullName:'Girafarig LOT',set:'LOT',
      setNumber:'94',printedHp:90},victimDamageBeforeNativeKo:140}];
  const nominal=[{trialId:trial,originalRank:6,attackName:'Volt Cyclone',
    rosterAttackerPrintedId:'sv6-77',rosterAttackerName:'Iron Thorns ex',
    attackerTypes:['Lightning'],attackerStage:'Basic',
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
  assert.equal(result.version,'agent3-native-pre-attack-public-board-join-v3');
  assert.equal(result.rows.length,1);
  assert.equal(result.nativeDamageDeltaPrintMatches,1);
  assert.equal(result.declarationRootBoardsCaptured,1);
  assert.equal(result.finalBoardsCaptured,1);
  assert.equal(result.physicalActiveIdentityComplete,1);
  assert.equal(result.qualifiedCompetitiveGames,0);
  assert.equal(result.paperGameCertified,false);
  assert.equal(result.rows[0].attackerPrintingFromActualNativeBoard,
    'Iron Thorns ex TWM');
  assert.equal(result.rows[0].incrementalNativeDamageSincePreAttack,140);
  assert.equal(result.rows[0].declarationRootActionOrdinal,85);
  assert.equal(result.rows[0].initiatingRootActionOrdinal,85);
  assert.equal(result.rows[0].declarationRootTurnAfter,17);
  assert.equal(result.rows[0].declarationRootPromptPendingAfter,true);
  assert.equal(result.rows[0].completionRootOrdinal,91);
  assert.equal(result.rows[0].completionRootTurnBefore,17);
  assert.equal(result.rows[0].completionRootTurnMatchesDeclarationTurn,true);
  assert.equal(result.rows[0].publicBoardImmediatelyAfterDeclarationRoot.length,2);
  assert.equal(result.rows[0].publicBoardAfterPromptClosure.length,2);
  assert.equal(result.rows[0].targetIdentityGranularity,
    'printing-only-no-instance-id');
  assert.equal(result.rows[0].physicalActiveIdentityGranularity,
    'printing-and-printed-attack-menu-no-instance-id');
  assert.equal(result.rows[0].targetDamageImmediatelyAfterDeclarationRoot,140);
  assert.equal(result.rows[0].targetDamageAfterPromptClosure,null);
  assert.equal(result.rows[0].targetDamageThresholdReachedImmediatelyAfterDeclarationRoot,true);
  assert.equal(result.rows[0].targetDamageDeltaFromPreAttackToDeclarationRoot,140);
  assert.equal(result.rows[0].targetDamageDeltaFromDeclarationRootToActualNativeKo,0);
  assert.equal(result.rows[0].targetKnockedOutDuringLaterPromptResolution,false);
  assert.equal(result.rows[0].declarationRootVsPromptClosureClassification,
    'TARGET_DAMAGE_THRESHOLD_REACHED_AT_DECLARATION_ROOT');
  assert.equal(result.rows[0].physicalActivePrintingBefore,'Iron Thorns ex TWM');
  assert.deepEqual(result.rows[0].physicalActivePrintedAttackNamesBefore,
    ['Volt Cyclone']);
  assert.equal(result.rows[0].attackNamePrintedOnPhysicalActiveBefore,true);
  assert.equal(result.rows[0].directAttackPrintedOnPhysicalActiveBefore,true);
  assert.equal(result.rows[0].physicalActiveIdentityComplete,true);
  assert.deepEqual(result.rows[0].attackerEnergyNamesBeforeAttack,
    ['Lightning Energy','Double Colorless Energy']);
  assert.equal(result.rows[0].directPrintedEnergySufficiency.status,'POSSIBLE');
  assert.equal(result.rows[0].actualAttachedEnergyPaymentCertified,false);
  assert.deepEqual(result.rows[0].actualPrintedAttackCostEnum,[4,9,9]);
  assert.equal(result.rows[0].actualPrintedAttackCostMatchesSourceScreen,true);
  assert.deepEqual(result.rows[0].publicStadiumNamesBeforeAttack,[[],[]]);
  assert.deepEqual(result.rows[0].publicInPlayPrintingsBeforeAttack,[
    {active:'Iron Thorns ex TWM',bench:[]},
    {active:'Girafarig LOT',bench:[]}
  ]);
});


test('engine Active attack cost must match the independently registered source print',()=>{
  const f=fixture();
  f.attempts[0].sourceAttackSettlement.attacks[0]
    .publicBoardBefore[0].active.printedAttacks[0].cost=[5,9,9];
  assert.throws(()=>run(f));
});

test('the same native cumulative KO value can include earlier attack damage',()=>{
  const f=fixture();
  f.attempts[0].sourceAttackSettlement.attacks[0]
    .publicBoardBefore[1].active.damage=100;
  const result=run(f);
  assert.equal(result.rows[0].targetPreAttackDamage,100);
  assert.equal(result.rows[0].incrementalNativeDamageSincePreAttack,40);
  assert.equal(result.rows[0].targetDamageDeltaFromPreAttackToDeclarationRoot,40);
  assert.equal(result.rows[0].targetDamageDeltaFromDeclarationRootToActualNativeKo,0);
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
    triggerAction:'ResolvePromptAction',
    initiatingRootActionOrdinal:83,declarationRootTurnAfter:17,
    declarationRootPromptPendingAfter:true,completionRootTurnBefore:17,
    completionRootTurnMatchesDeclarationTurn:true,
    activePrintingBefore:'Mimikyu GRI',
    activePrintedAttackNamesBefore:['Copycat'],
    attackNamePrintedOnPhysicalActiveBefore:false,
    directAttackPrintedOnPhysicalActiveBefore:null,
    publicBoardBefore:[
      {active:{name:'Trevenant & Dusknoir-GX',
        printing:'Trevenant & Dusknoir-GX SMP',damage:200,
        energyCards:['Psychic Energy'],toolCards:[],printedAttacks:[]},
        bench:[],stadium:[]},
      {active:{name:'Mimikyu',printing:'Mimikyu GRI',damage:0,
        energyCards:['Psychic Energy','Psychic Energy'],
        toolCards:[],printedAttacks:[{name:'Copycat',
          cost:[9,9]}]},bench:[],stadium:[]}
    ],
    publicBoardImmediatelyAfterDeclarationRoot:[
      {active:{name:'Trevenant & Dusknoir-GX',
        printing:'Trevenant & Dusknoir-GX SMP',damage:200,
        energyCards:['Psychic Energy'],toolCards:[],printedAttacks:[]},
        bench:[],stadium:[]},
      {active:{name:'Mimikyu',printing:'Mimikyu GRI',damage:0,
        energyCards:['Psychic Energy','Psychic Energy'],
        toolCards:[],printedAttacks:[{name:'Copycat',
          cost:[9,9]}]},bench:[],stadium:[]}
    ],
    publicBoardAfter:[
      {active:null,bench:[],stadium:[]},
      {active:{name:'Mimikyu',printing:'Mimikyu GRI',damage:0,
        energyCards:['Psychic Energy','Psychic Energy'],
        toolCards:[],printedAttacks:[{name:'Copycat',
          cost:[9,9]}]},bench:[],stadium:[]}
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
    attackerTypes:['Psychic'],attackerStage:'Basic',
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
  assert.equal(result.rows[0].physicalActivePrintingBefore,'Mimikyu GRI');
  assert.deepEqual(result.rows[0].physicalActivePrintedAttackNamesBefore,
    ['Copycat']);
  assert.equal(result.rows[0].attackNamePrintedOnPhysicalActiveBefore,false);
  assert.equal(result.rows[0].directAttackPrintedOnPhysicalActiveBefore,null);
  assert.equal(result.rows[0].physicalActiveIdentityComplete,true);
  assert.equal(result.rows[0].targetDamageImmediatelyAfterDeclarationRoot,200);
  assert.equal(result.rows[0].targetDamageDeltaFromPreAttackToDeclarationRoot,0);
  assert.equal(result.rows[0].targetDamageDeltaFromDeclarationRootToActualNativeKo,200);
  assert.equal(result.rows[0].targetKnockedOutDuringLaterPromptResolution,true);
  assert.equal(result.rows[0].declarationRootVsPromptClosureClassification,
    'TARGET_KO_DURING_LATER_PROMPT_RESOLUTION');
  assert.equal(result.rows[0].copiedOrGrantedSourceUnresolved,true);
  assert.equal(result.rows[0].directPrintedEnergySufficiency,null);
  assert.equal(result.rows[0].nativeDeltaEqualsPrintedNominal,true);
  assert.equal(result.rows[0].actualAttachedEnergyPaymentCertified,false);
});

test('direct printed funding remains observational under missing or unknown Energy',()=>{
  const f=fixture();
  const attacker=f.attempts[0].sourceAttackSettlement.attacks[0]
    .publicBoardBefore[0].active;
  attacker.energyCards=['Double Colorless Energy'];
  const missing=run(f);
  assert.equal(missing.rows[0].directPrintedEnergySufficiency.status,'IMPOSSIBLE');
  assert.equal(missing.rows[0].actualAttachedEnergyPaymentCertified,false);
  assert.equal(missing.paperGameCertified,false);
  attacker.energyCards.push('Unmodeled Energy');
  const unknown=run(f);
  assert.equal(unknown.rows[0].directPrintedEnergySufficiency.status,'UNVERIFIED');
});

test('strict source printing, victim, root and period validation rejects false joins',()=>{
  for(const mutate of [
    f=>{f.attempts[0].sourceAttackSettlement.attacks[0].actionOrdinal=86;},
    f=>{f.attempts[0].sourceAttackSettlement.attacks[0].settledPromptChain=false;},
    f=>{f.attempts[0].sourceAttackSettlement.attacks[0].settlementCrossesClockReset=true;},
    f=>{f.attempts[0].sourceAttackSettlement.attacks[0].publicBoardBefore[0].active.printing='Iron Thorns ex PRE';},
    f=>{f.attempts[0].sourceAttackSettlement.attacks[0].publicBoardBefore[1].active.printing='Girafarig UNB';},
    f=>{f.attempts[0].sourceAttackSettlement.attacks[0].activePrintingBefore='Iron Thorns ex PRE';},
    f=>{f.attempts[0].sourceAttackSettlement.attacks[0].activePrintedAttackNamesBefore=['Wrong Attack'];},
    f=>{f.attempts[0].sourceAttackSettlement.attacks[0].attackNamePrintedOnPhysicalActiveBefore=false;},
    f=>{f.attempts[0].sourceAttackSettlement.attacks[0].directAttackPrintedOnPhysicalActiveBefore=false;},
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

test('legacy records without an immediate declaration-root board remain explicitly unknown',()=>{
  const f=fixture();
  delete f.attempts[0].sourceAttackSettlement.attacks[0]
    .publicBoardImmediatelyAfterDeclarationRoot;
  const result=run(f);
  assert.equal(result.rows[0].declarationRootBoardCaptured,false);
  assert.equal(result.rows[0].targetDamageImmediatelyAfterDeclarationRoot,null);
  assert.equal(result.rows[0].targetDamageThresholdReachedImmediatelyAfterDeclarationRoot,null);
  assert.equal(result.rows[0].declarationRootVsPromptClosureClassification,
    'UNKNOWN_NO_DECLARATION_ROOT_BOARD');
  assert.equal(result.qualifiedCompetitiveGames,0);
});

test('a target still on Bench below printed HP conflicts with a native KO receipt',()=>{
  const f=fixture();
  const attack=f.attempts[0].sourceAttackSettlement.attacks[0];
  const benchPokemon={
    name:'Girafarig',printing:'Girafarig LOT',damage:20,
    energyCards:['Psychic Energy','Psychic Energy','Psychic Energy'],
    toolCards:[],printedAttacks:[{name:'Get Lost',cost:['Colorless']}]
  };
  attack.publicBoardImmediatelyAfterDeclarationRoot[1].active=null;
  attack.publicBoardImmediatelyAfterDeclarationRoot[1].bench=[
    structuredClone(benchPokemon)
  ];
  attack.publicBoardAfter[1].active=null;
  attack.publicBoardAfter[1].bench=[structuredClone(benchPokemon)];
  const result=run(f);
  assert.equal(result.rows[0].targetLocationImmediatelyAfterDeclarationRoot,'bench');
  assert.equal(result.rows[0].targetLocationAfterPromptClosure,'bench');
  assert.equal(result.rows[0].declarationRootVsPromptClosureClassification,
    'INCONSISTENT_NATIVE_KO_OBSERVATION_FINAL_TARGET_BELOW_PRINTED_HP');
  assert.equal(result.rows[0].targetKnockedOutDuringLaterPromptResolution,false);
});

test('damage reaching printed HP during later prompt resolution is distinct from KO removal',()=>{
  const f=fixture();
  const attack=f.attempts[0].sourceAttackSettlement.attacks[0];
  attack.publicBoardImmediatelyAfterDeclarationRoot[1].active.damage=20;
  attack.publicBoardAfter[1].active=structuredClone(attack.publicBoardBefore[1].active);
  attack.publicBoardAfter[1].active.damage=100;
  const result=run(f);
  assert.equal(result.rows[0].declarationRootVsPromptClosureClassification,
    'TARGET_DAMAGE_THRESHOLD_REACHED_DURING_LATER_PROMPT_RESOLUTION');
  assert.equal(result.rows[0].targetKnockedOutDuringLaterPromptResolution,false);
  assert.equal(result.rows[0].targetDamageThresholdReachedDuringLaterPromptResolution,true);
  assert.equal(result.rows[0].targetDamageDeltaFromDeclarationRootToPromptClosure,80);
});

test('a settled native KO with a below-HP target still in play is flagged inconsistent',()=>{
  const f=fixture();
  const attack=f.attempts[0].sourceAttackSettlement.attacks[0];
  attack.publicBoardImmediatelyAfterDeclarationRoot[1].active.damage=20;
  attack.publicBoardAfter[1].active=structuredClone(attack.publicBoardBefore[1].active);
  attack.publicBoardAfter[1].active.damage=20;
  const result=run(f);
  assert.equal(result.rows[0].declarationRootVsPromptClosureClassification,
    'INCONSISTENT_NATIVE_KO_OBSERVATION_FINAL_TARGET_BELOW_PRINTED_HP');
  assert.equal(result.rows[0].targetKnockedOutDuringLaterPromptResolution,false);
  assert.equal(result.rows[0].targetDamageThresholdReachedDuringLaterPromptResolution,false);
});

test('a target moved to Bench then removed during later prompts is timed as a later KO',()=>{
  const f=fixture();
  const attack=f.attempts[0].sourceAttackSettlement.attacks[0];
  attack.publicBoardImmediatelyAfterDeclarationRoot[1].active=null;
  attack.publicBoardImmediatelyAfterDeclarationRoot[1].bench=[{
    name:'Girafarig',printing:'Girafarig LOT',damage:20,
    energyCards:['Psychic Energy','Psychic Energy','Psychic Energy'],
    toolCards:[],printedAttacks:[{name:'Get Lost',cost:['Colorless']}]
  }];
  const result=run(f);
  assert.equal(result.rows[0].declarationRootVsPromptClosureClassification,
    'TARGET_KO_DURING_LATER_PROMPT_RESOLUTION');
  assert.equal(result.rows[0].targetKnockedOutDuringLaterPromptResolution,true);
  assert.equal(result.rows[0].targetDamageDeltaFromDeclarationRootToActualNativeKo,120);
});

test('an absent initiating-root ordinal is preserved as explicit null',()=>{
  const f=fixture();
  delete f.attempts[0].sourceAttackSettlement.attacks[0]
    .initiatingRootActionOrdinal;
  const result=run(f);
  assert.equal(result.rows[0].initiatingRootActionOrdinal,null);
  assert.equal(result.rows[0].declarationRootActionOrdinal,85);
  assert.equal(result.rows[0].physicalActiveIdentityComplete,true);
});
