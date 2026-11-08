'use strict';

const {test}=require('node:test');
const assert=require('node:assert/strict');
const {chooseEarlyRegidragoCompressor,chooseNativeEarlyCompressorDonors}=
  require('../../simulation/twinleaf/agent49/early-regidrago-compressor.cjs');
const {chooseActorRootIntent}=
  require('../../simulation/twinleaf/agent34-actor-only-root-policy.cjs');

const COMPRESSOR='Battle Compressor PHF';
const GRASS='Grass Energy MEE';
const catalog={
  basics:new Set(),abilityBasics:new Set(),
  basicEnergies:new Set([GRASS]),
  dragonPokemonPrintings:new Set(),
  basicEnergyTypes:{Grass:1,Lightning:4,Psychic:5},
  colorlessEnergyType:9,
  specialConditions:{ASLEEP:2,PARALYZED:0}
};
function view(options={}){
  return {
    decisionKind:'owner-root',actorSeat:1,globalTurn:options.turn??1,
    ownHand:options.hand??[COMPRESSOR,GRASS,'Regidrago VSTAR SIT'],
    ownTurnResources:{itemPlayLocked:options.locked??false,
      energyPlayedTurn:0,energyPlayLocked:false},
    ownPublic:{
      active:{name:'Dedenne-GX',energies:[],attacks:[]},
      bench:[{name:'Regidrago V',printing:'Regidrago V SIT',
        energies:[],attacks:[]},null,null,null,null],
      deckCount:38,discard:options.discard??['Mysterious Treasure FLI'],
      publicTurnRestrictions:{itemPlayLocked:options.locked??false}
    },
    opponentPublic:{}
  };
}
test('registered first-turn owner root chooses held Compressor before attaching Grass',()=>{
  const v=view();
  const intent=chooseEarlyRegidragoCompressor(v);
  assert.equal(intent.kind,'play-regidrago-battle-compressor');
  assert.equal(intent.handIndex,0);
  assert.equal(intent.unknownOwnerDeckContents,true);
  assert.equal(chooseActorRootIntent(v,catalog,{
    earlyRegidragoCompressor:true}).kind,'play-regidrago-battle-compressor');
  assert.equal(chooseActorRootIntent(v,catalog,{}).kind,'attach-basic-energy');
});
test('first-turn donor chooser declines Item lock, a prior Dragon and no rank13 V',()=>{
  assert.equal(chooseEarlyRegidragoCompressor(view({locked:true})),null);
  assert.equal(chooseEarlyRegidragoCompressor(view({turn:3})),null);
  assert.equal(chooseEarlyRegidragoCompressor(view({
    discard:['Dragapult ex TWM']
  })),null);
  assert.equal(chooseEarlyRegidragoCompressor(view({
    hand:[GRASS]
  })),null);
  const x=view();x.ownPublic.bench=[];
  assert.equal(chooseEarlyRegidragoCompressor(x),null);
});
test('native genuine owner deck prompt offers physical three distinct Dragon objects',()=>{
  const donors=[
    {fullName:'Noivern ex PAL',id:1},
    {fullName:'Dialga-GX UPR',id:2},
    {fullName:'Dragapult ex TWM',id:3}
  ];
  const owner={id:100,deck:{cards:donors.slice()}};
  const state={players:[{id:101},owner]};
  const prompt={
    id:40,sourceCard:{fullName:COMPRESSOR},
    cards:owner.deck,playerId:owner.id,result:undefined,
    constructor:{name:'ChooseCardsPrompt'},
    validate(selected){return selected.length<=3&&
      selected.every(card=>owner.deck.cards.includes(card));}
  };
  class ResolvePromptAction{
    constructor(id,result){this.id=id;this.result=result;}
  }
  const reply=chooseNativeEarlyCompressorDonors(
    state,1,prompt,ResolvePromptAction);
  assert.equal(reply.action.id,40);
  assert.equal(reply.chosen.length,3);
  assert.deepEqual(reply.chosen.map(x=>x.fullName),[
    'Dragapult ex TWM','Noivern ex PAL','Dialga-GX UPR'
  ]);
  assert.ok(reply.chosen.every(card=>owner.deck.cards.includes(card)));
});
test('unknown or other player zone fails closed with no private deck scan',()=>{
  const owner={id:7,deck:{cards:[]}};
  const state={players:[owner,{id:8,deck:{cards:[]}}]};
  const prompt={
    id:4,sourceCard:{fullName:COMPRESSOR},cards:state.players[1].deck,
    playerId:owner.id,result:undefined,
    constructor:{name:'ChooseCardsPrompt'},
    validate(){return true;}
  };
  assert.throws(()=>chooseNativeEarlyCompressorDonors(
    state,0,prompt,class{}),/strictEqual|reference|strictly equal/i);
});
