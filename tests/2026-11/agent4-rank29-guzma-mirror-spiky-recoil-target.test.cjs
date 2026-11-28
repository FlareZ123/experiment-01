'use strict';

// Original Aichi rank6/29 mirror each contains Spiky Energy JTG159.
// An opponent Bench Spiky holder gusted by Guzma moves to Active; when
// Knocked Out by Volt Cyclone it damages the 2-Prize attacking Thorns.
// A 10-HP attacker plus 2 remaining opponent Prizes would tie rather
// than end in a clean win. The physical same-print benchIndex matters.
// Pure actor-visible policy test; NOT a native battle settlement.
const test=require('node:test');
const assert=require('node:assert/strict');
const {POLICY_VERSION,createPolicy,opponentPokemonScore}=
  require('../../simulation/evaluation/2026-11/agent4-rank29-iron-thorns-opponent-policy.cjs');

const SP='Spiky Energy JTG 159';
const SPEED='Speed Lightning Energy RCL 173';
const DCE='Double Colorless Energy SUM 136';
function thorns(energy=[],damage=100){
  return {printing:'Iron Thorns ex TWM 77',hp:230,damage,
    energies:energy,tools:[],
    printed:{stage:'BASIC',subtypes:['Pokémon ex'],
      weakness:[{type:'Fighting',value:2}],resistance:[]}};
}
function request(seat,{
  order=[SP,SPEED],ownAttackers=[thorns([SPEED,DCE],220)],
  opponentPrizes=2,ownPrizes=2,stadium=[]
}={}){
  const opponentBench=order.map(energy=>thorns([energy]));
  const observation={
    actorSeat:seat,globalTurn:11,ownHand:['Guzma BUS 115'],
    ownPublic:{active:thorns([],0),bench:ownAttackers,prizeCount:ownPrizes,
      stadium:[],publicTurnRestrictions:{}},
    opponentPublic:{active:thorns([],0),bench:opponentBench,
      prizeCount:opponentPrizes,stadium},
    ownTurnResources:{supporterPlayedTurn:0}
  };
  const choices=opponentBench.map((row,i)=>({
    kind:'pokemon',token:'target-'+i,printing:row.printing,
    publicMetadata:{ownerSeat:'opponent',targetZone:'bench',
      benchIndex:i,isOwnerVisible:true}
  }));
  return {role:'opponent',seat,observation,prompt:{
    promptType:'ChoosePokemonPrompt',
    source:{sourceKind:'card-effect',sourcePrinting:'Guzma BUS 115',
      effectName:'Guzma'},
    publicMetadata:{selectionType:'pokemon',minimumCount:1,maximumCount:1},
    choices
  }};
}
for(const seat of [0,1]){
  const policy=createPolicy({role:'opponent',seat,
    policyVersion:POLICY_VERSION,config:{}});
  test('seat '+seat+': chooses clean final-prize Thorns over same-print Spiky tie in either bench order',()=>{
    for(const order of [[SP,SPEED],[SPEED,SP]]){
      const r=request(seat,{order});
      const clean=order.indexOf(SPEED),spiky=order.indexOf(SP);
      assert.equal(opponentPokemonScore(
        r.prompt.choices[clean],r.observation,'guzma'),1495);
      assert.ok(opponentPokemonScore(
        r.prompt.choices[spiky],r.observation,'guzma')<1495);
      assert.deepEqual(policy.decide(r),{
        kind:'select-choices',tokens:['target-'+clean]});
    }
  });
  test('seat '+seat+': healthy funded second attacker rescues Spiky winning gust',()=>{
    const r=request(seat,{ownAttackers:[
      thorns([SPEED,DCE],220),thorns([SPEED,DCE],0)
    ]});
    assert.equal(opponentPokemonScore(
      r.prompt.choices[0],r.observation,'guzma'),1495);
  });
  test('seat '+seat+': no last-Prize recoil catastrophe leaves ordinary Spiky KO',()=>{
    const r=request(seat,{opponentPrizes:3});
    assert.equal(opponentPokemonScore(
      r.prompt.choices[0],r.observation,'guzma'),1495);
  });
  test('seat '+seat+': no Spiky on gust target retains the terminal attack',()=>{
    const r=request(seat,{order:[SPEED,SPEED]});
    assert.equal(opponentPokemonScore(
      r.prompt.choices[0],r.observation,'guzma'),1495);
    assert.deepEqual(policy.decide(r),{
      kind:'select-choices',tokens:['target-0']});
  });
}
