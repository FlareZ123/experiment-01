'use strict';

const {test}=require('node:test');
const assert=require('node:assert/strict');
const {chooseRank13CrispinRoot,chooseNativeCrispinEnergySearch,
  chooseNativeCrispinBenchAttach}=
  require('../../simulation/twinleaf/agent5/rank13-crispin-owner-funding.cjs');

const GRASS={name:'Grass Energy',fullName:'Grass Energy MEE',id:11};
const FIRE={name:'Fire Energy',fullName:'Fire Energy MEE',id:12};
const OTHER={fullName:'Double Dragon Energy ROS',id:13};
function root(options={}){
  return {decisionKind:'owner-root',globalTurn:options.turn??2,actorSeat:1,
    ownHand:options.hand??['Crispin SCR','Regidrago VSTAR SIT'],
    ownTurnResources:{supporterPlayedTurn:options.played??0,
      supporterPlayLocked:options.locked??false},
    ownPublic:{active:{printing:'Tapu Lele-GX GRI'},
      deckCount:42,bench:[{printing:'Regidrago V SIT'},null],
      publicTurnRestrictions:{supporterPlayLocked:options.locked??false}}
  };
}
class ResolvePromptAction{
  constructor(id,result){this.id=id;this.result=result;}
}
function native(){
  const deck={cards:[GRASS,FIRE,OTHER]};
  const bench=[
    {getPokemonCard:()=>({fullName:'Dedenne GX UNB'})},
    {getPokemonCard:()=>({fullName:'Regidrago VSTAR SIT'})}
  ];
  const owner={id:202,deck,bench,
    supporter:{cards:[{fullName:'Crispin SCR'}]}};
  return {state:{players:[{id:101},owner]},owner};
}

test('rank13 Crispin plays from real T2 hand after source compressor',()=>{
  const intent=chooseRank13CrispinRoot(root());
  assert.equal(intent?.kind,'play-regidrago-crispin');
  assert.equal(intent.handIndex,0);
  assert.equal(chooseRank13CrispinRoot(root({turn:1})),null);
  assert.equal(chooseRank13CrispinRoot(root({played:2})),null);
  assert.equal(chooseRank13CrispinRoot(root({locked:true})),null);
  assert.equal(chooseRank13CrispinRoot(root({hand:[]})),null);
  const noBench=root();noBench.ownPublic.bench=[];
  assert.equal(chooseRank13CrispinRoot(noBench),null);
});

test('Crispin native search uses actual two differently typed owner-deck objects',()=>{
  const {state,owner}=native();
  const prompt={id:31,playerId:owner.id,cards:owner.deck,
    result:undefined,constructor:{name:'ChooseCardsPrompt'},
    validate(cards){return cards.length===2&&cards[0]===GRASS&&cards[1]===FIRE;}};
  const reply=chooseNativeCrispinEnergySearch(state,1,prompt,ResolvePromptAction);
  assert.equal(reply.action.id,31);
  assert.deepEqual(reply.chosen,[GRASS,FIRE]);
  assert.deepEqual(reply.action.result,[GRASS,FIRE]);
  const otherPrompt={...prompt,cards:{cards:[GRASS,FIRE]}};
  assert.throws(()=>chooseNativeCrispinEnergySearch(
    state,1,otherPrompt,ResolvePromptAction),/strictly equal|reference/i);
  owner.deck.cards.splice(1,1);
  prompt.validate=cards=>cards.length===1&&cards[0]===GRASS;
  const oneType=chooseNativeCrispinEnergySearch(
    state,1,prompt,ResolvePromptAction);
  assert.deepEqual(oneType.chosen,[GRASS]);
  const printedGrass={name:'Grass Energy',fullName:'Grass Energy SVI',id:30};
  const printedFire={name:'Fire Energy',fullName:'Fire Energy SVI',id:31};
  owner.deck.cards.splice(0,owner.deck.cards.length,printedGrass,printedFire);
  prompt.validate=cards=>cards.length===2&&
    cards[0]===printedGrass&&cards[1]===printedFire;
  const alternate=chooseNativeCrispinEnergySearch(
    state,1,prompt,ResolvePromptAction);
  assert.deepEqual(alternate.chosen,[printedGrass,printedFire]);
});

test('Crispin native attachment targets real Benched Regidrago with Grass',()=>{
  const {state,owner}=native();
  const prompt={id:33,playerId:owner.id,result:undefined,
    cardList:{cards:[GRASS,FIRE]},constructor:{name:'AttachEnergyPrompt'},
    validate(assignments){return assignments.length===1&&
      assignments[0].card===GRASS&&assignments[0].to.index===1&&
      assignments[0].to.slot===6;}};
  const reply=chooseNativeCrispinBenchAttach(state,1,prompt,
    ResolvePromptAction,{BOTTOM_PLAYER:8},{BENCH:6});
  assert.equal(reply.action.id,33);
  assert.equal(reply.chosen,GRASS);
  assert.equal(reply.targetIndex,1);
  assert.deepEqual(reply.action.result,[{card:GRASS,
    to:{player:8,slot:6,index:1}}]);
  owner.bench.length=0;
  assert.equal(chooseNativeCrispinBenchAttach(state,1,prompt,
    ResolvePromptAction,{BOTTOM_PLAYER:8},{BENCH:6}),null);
});

test('Crispin root physical observer confirms Supporter quota without treating pending prompt as resolved',()=>{
  const {rootPhysicalWitness}=require(
    '../../simulation/twinleaf/agent5-owner-root-slice.cjs');
  const intent={kind:'play-regidrago-crispin',printing:'Crispin SCR'};
  const before={supporterSpent:0,supporterTurn:0};
  const accepted={supporterSpent:1,supporterTurn:2};
  assert.equal(rootPhysicalWitness(intent,before,accepted,{}),
    'confirmed-public-effect');
  assert.equal(rootPhysicalWitness(intent,before,{
    supporterSpent:0,supporterTurn:2
  },{}),'no-confirmed-public-effect');
  assert.equal(rootPhysicalWitness(intent,before,{
    supporterSpent:1,supporterTurn:0
  },{}),'no-confirmed-public-effect');
});
