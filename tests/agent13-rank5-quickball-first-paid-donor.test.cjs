'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {
  VERSION,openingFirstPaidDonor,originalRank5FirstPaidDonor
}=require('../scripts/agent13-rank5-quickball-first-paid-donor.cjs');
const {choose,sourceRank5}=
  require('../scripts/agent41-rank5-quickball-duplicate-openings.cjs');
const {chooseActorHandDiscard}=
  require('../simulation/twinleaf/agent47-actor-hand-discard.cjs');

/**
 * Independent physical-subset enumeration, exercising the actual default
 * actor47 prompt chooser instead of reproducing the dynamic-program rule.
 * @param {object[]} cards Small complete deck with exact printings.
 * @param {number} k Opening hand size.
 */
function bruteDefaultDonor(cards,k){
  const physical=cards.flatMap(card=>Array.from({length:card.count},()=>({
    name:card.name,printing:card.name+' '+card.printing.set
  })));
  const byDonor=new Map();
  let eligible=0;
  const chosen=[];
  function walk(start){
    if(chosen.length!==k){
      for(let i=start;i<=physical.length-(k-chosen.length);i++){
        chosen.push(physical[i]);
        walk(i+1);
        chosen.pop();
      }
      return;
    }
    const hand=chosen.map(x=>x.printing);
    if(!chosen.some(x=>['Mew V','Genesect V'].includes(x.name)))return;
    const qb=chosen.findIndex(x=>x.name==='Quick Ball');
    if(qb<0)return;
    const originalCounts=new Map();
    for(const c of chosen)
      if(c.name!=='Quick Ball')
        originalCounts.set(c.printing,(originalCounts.get(c.printing)??0)+1);
    if(![...originalCounts.values()].some(c=>c>=2))return;
    const remaining=hand.filter((_,i)=>i!==qb);
    const promptMenu=[...new Set(remaining)].sort().map(name=>[name]);
    const selected=chooseActorHandDiscard({
      actor:{decisionKind:'owner-prompt',ownHand:remaining},
      prompt:{menu:promptMenu}
    }).printings[0];
    eligible++;
    byDonor.set(selected,(byDonor.get(selected)??0)+1);
  }
  walk(0);
  return {eligible,byDonor:Object.fromEntries(byDonor)};
}

test('original rank5 source is exact 60 and donor census conserves all sets',()=>{
  const original=sourceRank5();
  const x=originalRank5FirstPaidDonor();
  assert.equal(VERSION,'agent13-rank5-quickball-first-paid-donor-exact-v1');
  assert.equal(original.cards.reduce((sum,c)=>sum+c.count,0),60);
  assert.equal(x.printingGroups,30);
  assert.equal(x.allPhysicalOpeningSevens,386206920);
  assert.equal(x.basicValidOpeningSevens,300306336);
  assert.equal(x.basicAndQuickBallSevens,113768556);
  assert.equal(x.structuralRootEligibleSevens,36941838);
  assert.equal(Object.values(x.expectedDefaultPromptDonorByPrinting)
    .reduce((sum,n)=>sum+n,0),x.structuralRootEligibleSevens);
  assert.equal(Object.values(x.expectedDefaultPromptDonorByCategory)
    .reduce((sum,n)=>sum+n,0),x.structuralRootEligibleSevens);
  assert.equal(x.actualNativeRootSelected,false);
  assert.equal(x.paperPaymentAndTargetCertified,false);
  assert.equal(x.optimalityAndGamePerformanceCertified,false);
});

test('lexical prompt bias selects DCE in 4,652,384 physical opening sevens',()=>{
  const x=originalRank5FirstPaidDonor();
  assert.equal(x.expectedDefaultPromptDonorByPrinting[
    'Double Colorless Energy SUM'],4652384);
  assert.equal(x.defaultDceDonorSevens,4652384);
  assert.equal(x.onlyDceNonQuickBallDuplicateSevens,4042260);
  assert.equal(x.dceChosenDespiteAnotherNonQuickBallDuplicateSevens,610124);
  assert.ok(Math.abs(x.dceShareAmongStructurallyEligible-
    0.12593807595604745)<1e-14);
  assert.deepEqual(x.expectedDefaultPromptDonorByCategory,{
    Trainer:15530351,Energy:4652384,'Pokémon':16759103
  });
});

test('independent inclusion-exclusion sum confirms exact DCE donor count',()=>{
  // Before Double Colorless alphabetically, only Battle VIP Pass can be a
  // duplicated donor among this registered source's earlier printings.
  // All other 49 cards after isolating 3 VIP, 4 QB and 4 DCE comprise
  // 11 Basics and 38 non-Basics.
  let result=0;
  for(let vip=0;vip<=1;vip++)
    for(let qb=1;qb<=4;qb++)
      for(let dce=2;dce<=4;dce++)
        for(let basic=1;basic<=11;basic++){
          const other=7-vip-qb-dce-basic;
          if(other>=0&&other<=38)
            result+=choose(3,vip)*choose(4,qb)*choose(4,dce)*
              choose(11,basic)*choose(38,other);
        }
  assert.equal(result,4652384);
});

test('tiny brute physical subsets match the actual actor47 one-card chooser',()=>{
  const cards=[
    {name:'Quick Ball',category:'Trainer',count:3,
      printing:{set:'FST',number:'237'}},
    {name:'Double Colorless Energy',category:'Energy',count:2,
      printing:{set:'SUM',number:'136'}},
    {name:'Genesect V',category:'Pokémon',count:2,
      printing:{set:'FST',number:'185'}},
    {name:'Mew V',category:'Pokémon',count:2,
      printing:{set:'FST',number:'113'}},
    {name:'Battle VIP Pass',category:'Trainer',count:2,
      printing:{set:'FST',number:'225'}},
    {name:'Ultra Ball',category:'Trainer',count:2,
      printing:{set:'MEG',number:'131'}}
  ];
  const dp=openingFirstPaidDonor(cards,7);
  const brute=bruteDefaultDonor(cards,7);
  assert.equal(dp.structuralRootEligibleSevens,brute.eligible);
  assert.deepEqual(dp.expectedDefaultPromptDonorByPrinting,brute.byDonor);
  const reverse=openingFirstPaidDonor([...cards].reverse(),7);
  assert.deepEqual(dp.expectedDefaultPromptDonorByPrinting,
    reverse.expectedDefaultPromptDonorByPrinting);
});

test('empty Quick Ball source and no duplicate donor cannot trigger root',()=>{
  const cards=[
    {name:'Mew V',category:'Pokémon',count:2,
      printing:{set:'FST',number:'113'}},
    {name:'Double Colorless Energy',category:'Energy',count:2,
      printing:{set:'SUM',number:'136'}},
    {name:'Guzma',category:'Trainer',count:3,
      printing:{set:'BUS',number:'115'}}
  ];
  const x=openingFirstPaidDonor(cards,7);
  assert.equal(x.structuralRootEligibleSevens,0);
  assert.equal(x.defaultDceDonorSevens,0);
  assert.equal(x.dceShareAmongStructurallyEligible,0);
});
