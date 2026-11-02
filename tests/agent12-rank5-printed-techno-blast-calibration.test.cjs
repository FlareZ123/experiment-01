'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {readSourcePrintings,computedPsychicDamage,expectedPrintedPrizes,
  calibrateRank5TechnoBlast}=
  require('../simulation/evaluation/agent12-rank5-printed-techno-blast-calibration.cjs');

function exampleArchive(){
  const episodes=[
    ['Dialga-GX',0,6,4,'Latias ex'],
    ['Latias ex',0,4,2,'Girafarig'],
    ['Girafarig',0,2,1,null],
    ['Latias ex',0,6,4,'Galarian Articuno V'],
    ['Galarian Articuno V',0,4,2,'Gengar & Mimikyu-GX'],
    ['Gengar & Mimikyu-GX',0,2,2,'Gengar & Mimikyu-GX'],
    ['Gengar & Mimikyu-GX',210,2,0,null],
    ['Tapu Lele-GX',0,6,4,'Trevenant & Dusknoir-GX']
  ];
  return {schema:'agent13-integrated-rank5-v31-corrected-root-release-v1',
    enginePin:'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    actualSourcePrinted60Sha256:
      'a66f9b785b7fb36606229f1bf7a396892320803e7576a39f1552a7825bd74c05',
    attempted:16,competitiveQualifiedGames:0,
    comparisons:episodes.map(([name,pre,prizeB,prizeA,afterName],i)=>{
      const turn=19+4*i;
      const attack={
        attackName:'Cross Fusion Strike',actionOrdinal:80+i,turnBefore:turn,
        settledPromptChain:true,settlementCrossesClockReset:false,
        publicBoardBefore:[
          {active:{name,damage:pre}},
          {active:{name:'Mew VMAX',energyCards:['Double Colorless Energy']},
            bench:[{name:'Genesect V'}]}
        ],
        publicBoardAfter:[
          {active:afterName?{name:afterName,
            damage:afterName==='Gengar & Mimikyu-GX'&&name===afterName?210:0}:null},
          {active:{name:'Mew VMAX',damage:0}}
        ],
        prizesBefore:[6,prizeB],prizesAfter:[6,prizeA]
      };
      return {trial:{id:'example'+i},
        controlledSameSourceDeal:'EXACT_SOURCE_DEAL_MATCH',
        integratedV3:{
          sourceSeat:1,originalSourceAttackDeclarations:1,
          sourceAttackSettlement:{declarations:1,settled:1,attacks:[attack]},
          ownerSourceGenesectCopiedSelections:[
            {turn,sourceIndex:1,attackIndex:0}
          ]}
      };
    })};
}

test('printed-source HP, Psychic Weakness and capped TAG TEAM prizes',()=>{
  const cards=readSourcePrintings();
  assert.equal(cards.get('Genesect V').attacks[0].damage,'210');
  assert.equal(computedPsychicDamage(210,cards.get('Girafarig')),420);
  assert.equal(computedPsychicDamage(210,cards.get('Gengar & Mimikyu-GX')),210);
  assert.equal(expectedPrintedPrizes(cards.get('Gengar & Mimikyu-GX')),3);
  assert.equal(expectedPrintedPrizes(cards.get('Latias ex')),2);
  assert.equal(expectedPrintedPrizes(cards.get('Girafarig')),1);
});

test('eight archival-format printed attack outcomes preserve 7 KO and 1 damaged',()=>{
  const result=calibrateRank5TechnoBlast(exampleArchive());
  assert.equal(result.sourcePrintedAttackEvents,8);
  assert.equal(result.baselinePaperOutcomesConsistent,8);
  assert.equal(result.printedTargetKnockouts,7);
  assert.equal(result.printedTargetDamageWithoutKnockout,1);
  assert.equal(result.printedPrizesTaken,13);
  assert.equal(result.allEightConsistent,true);
  assert.equal(result.competitivelyQualifiedGames,0);
  const tag=result.events.find(x=>x.target==='Gengar & Mimikyu-GX'&&x.expectedKO);
  assert.equal(tag.printedPrizeValue,3);
  assert.equal(tag.sourcePrizesBefore,2);
  assert.equal(tag.expectedPrizesTaken,2);
});

test('an impossible Prize award survives as a negative rather than a hidden success',()=>{
  const input=exampleArchive();
  input.comparisons[2].integratedV3
    .sourceAttackSettlement.attacks[0].prizesAfter[1]=2;
  const result=calibrateRank5TechnoBlast(input);
  assert.equal(result.baselinePaperOutcomesConsistent,7);
  assert.equal(result.allEightConsistent,false);
  assert.equal(result.events[2].expectedPrizesTaken,1);
  assert.equal(result.events[2].observedPrizesTaken,0);
});

test('missing actual donor or DCE cannot pass printed attack gate',()=>{
  const input=exampleArchive();
  const event=input.comparisons[0].integratedV3
    .sourceAttackSettlement.attacks[0];
  event.publicBoardBefore[1].bench=[];
  const result=calibrateRank5TechnoBlast(input);
  assert.equal(result.baselinePaperOutcomesConsistent,7);
  assert.equal(result.events[0].donorOnBench,false);
});

test('a different field or source-deck digest cannot be substituted',()=>{
  const input=exampleArchive();
  input.actualSourcePrinted60Sha256='unverified';
  assert.throws(()=>calibrateRank5TechnoBlast(input),/Expected values to be strictly equal/);
});
