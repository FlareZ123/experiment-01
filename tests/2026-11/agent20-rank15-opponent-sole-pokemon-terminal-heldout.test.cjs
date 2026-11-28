'use strict';

// Basic win condition: opponent has no Pokémon in play after its final Active
// is KO'd, even if this KO does not take our last Prize. Avoid a false clean
// win if Float Up shuffles our own sole Eldegoss out simultaneously.
const test=require('node:test');
const assert=require('node:assert/strict');
const {rootDecision,terminal}=require(
  '../../simulation/evaluation/2026-11/agent20-rank15-lopunny-vileplume-opponent-policy.cjs');
const MEGA='Mega Lopunny ex PFL 84', ELD='Eldegoss V RCL 19';
const V='Shadow Rider Calyrex V CRE 74', BELT='Choice Belt PAL 176';
const DEW='Life Dew PLF 107',LEGACY='Legacy Energy TWM 167';
const card=(printing,tools=[],energies=[],extra={})=>({
  printing,tools,energies,hp:210,damage:0,printed:{stage:'BASIC'},...extra
});
function request(seat,options={}){
  const active=options.eldegoss?
    card(ELD,[],['Grass Energy BLW 105'],{hp:180}):
    card(MEGA,[BELT],['Grass Energy BLW 105'],{
      hp:330,printed:{stage:'STAGE_1'}
    });
  const opponent=card(options.opponent??V,options.tool?[DEW]:[],
    options.legacy?[LEGACY]:[],{hp:210,damage:options.eldegoss?160:60});
  return {role:'opponent',seat,prompt:null,
    observation:{actorSeat:seat,globalTurn:9,
      ownHand:[ELD,'Oddish UNB 5'],
      ownPublic:{
        active,bench:options.ownBench===false?[]:[card('Oddish UNB 5')],
        discard:['Guzma BUS 115'],prizeCount:options.prizes??3,stadium:[]
      },
      opponentPublic:{
        active:opponent,
        bench:options.opponentBench?[card('Pidgey FLF 75')]:[],
        prizeCount:3,stadium:[]
      }
    },
    actionFrontier:{items:[
      {kind:'attack',token:'ko',attackName:options.eldegoss?'Float Up':'Spiky Hopper'},
      {kind:'play-card',token:options.eldegoss?'bench-oddish':'eldegoss',
        actorPrinting:options.eldegoss?'Oddish UNB 5':ELD}
    ]}
  };
}
for(const seat of [0,1]){
  for(const [name,options,expected] of [
    ['opponent lone V KO wins despite 3 own Prizes',{},'ko'],
    ['same V with a Bench Pokémon is only nonterminal',{
      opponentBench:true},'eldegoss'],
    ['opponent lone V with Life Dew yields one Prize but still wins by board',{
      tool:true},'ko'],
    ['opponent lone V with Legacy yields one Prize but still wins by board',{
      legacy:true},'ko'],
    ['Life Dew on V plus another opponent Basic is not a terminal',{
      tool:true,opponentBench:true},'eldegoss'],
    ['Legacy on V plus another opponent Basic is not a terminal',{
      legacy:true,opponentBench:true},'eldegoss'],
    ['opponent lone V and own two Prizes retains conventional terminal',{
      prizes:2},'ko'],
    ['opponent lone V and own four Prizes still wins by no Pokémon',{
      prizes:4},'ko']
  ]){
    test('seat '+seat+': '+name,()=>{
      assert.deepEqual(rootDecision(request(seat,options)),{
        kind:'select-action',token:expected
      });
    });
  }
  test('seat '+seat+': Eldegoss Float Up sole own Pokémon not clean terminal',()=>{
    const r=request(seat,{eldegoss:true,ownBench:false});
    assert.equal(terminal(r.actionFrontier.items[0],r),false);
  });
  test('seat '+seat+': Eldegoss Float Up with own surviving Bench can win',()=>{
    const r=request(seat,{eldegoss:true});
    assert.equal(terminal(r.actionFrontier.items[0],r),true);
  });
}
