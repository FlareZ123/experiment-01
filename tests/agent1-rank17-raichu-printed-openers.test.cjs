'use strict';

const {test}=require('node:test');
const assert=require('node:assert/strict');
const {
  SETUP_POKEMON,shouldPrepareRaichu
}=require('../simulation/twinleaf/rank4-raichu-compressor-policy.cjs');
const {
  createElectrodeOpportunityObserver
}=require('../simulation/twinleaf/electrode-opportunity-observer.cjs');

const PIKACHU_RANK4='Pikachu LOR';
const PIKACHU_RANK17='Pikachu XY';
const DITTO='Ditto Prism Star LOT';

function slot(fullName=null){
  return {getPokemonCard:()=>fullName===null?null:{fullName}};
}
function player(active='Voltorb ROS',bench=[null,null,null,null,null]){
  return {
    id:101,active:slot(active),bench:bench.map(slot),
    hand:{cards:[{name:'Battle Compressor',fullName:'Battle Compressor PHF'}]},
    deck:{cards:[{fullName:'Psychic Energy SVE'}]},
    discard:{cards:[]},getPrizeLeft:()=>6,
    cannotPlayItemCards:false
  };
}
function board(active,bench){
  const owner=player(active,bench);
  const opponent=player('Snorlax PGO');
  Object.defineProperty(opponent,'hand',{get(){
    throw Error('Observer attempted to inspect opponent private hand');
  }});
  return {
    phase:2,turn:1,activePlayer:0,prompts:[],players:[owner,opponent]
  };
}

test('source 4 LOR and original source 17 XY are both eligible Compressor predecessors',()=>{
  for(const printing of [PIKACHU_RANK4,PIKACHU_RANK17]){
    assert.ok(SETUP_POKEMON.has(printing));
    const state=board(printing,[null,null,null,null,null]);
    assert.equal(shouldPrepareRaichu(state,state.players[0],2),true,
      'Acting source may use real held Compressor before its first Evolution');
  }
  assert.equal(SETUP_POKEMON.has('Pikachu VIV'),false);
  const wrong=board('Pikachu VIV',[null,null,null,null,null]);
  assert.equal(shouldPrepareRaichu(wrong,wrong.players[0],2),false);
});

test('source-print expansion retains held Item, lock and turn legality gates',()=>{
  const state=board(PIKACHU_RANK17,[null,null,null,null,null]);
  state.players[0].hand.cards.length=0;
  assert.equal(shouldPrepareRaichu(state,state.players[0],2),false);
  state.players[0].hand.cards.push({name:'Battle Compressor'});
  state.players[0].cannotPlayItemCards=true;
  assert.equal(shouldPrepareRaichu(state,state.players[0],2),false);
  state.players[0].cannotPlayItemCards=false;
  state.turn=3;
  assert.equal(shouldPrepareRaichu(state,state.players[0],2),false);
});

test('exact rank17 XY, rank4 LOR and pinned Ditto labels enter source observer',()=>{
  for(const predecessor of [PIKACHU_RANK17,PIKACHU_RANK4,DITTO]){
    const state=board('Unown AOR',[predecessor,'Voltorb ROS',null,null,null]);
    const observer=createElectrodeOpportunityObserver();
    observer.observe(state);
    const packet=observer.snapshot();
    assert.equal(packet.positionFrontier.countsBySeat[0].bothBasicPredecessorsVisible,1,
      predecessor);
    assert.equal(packet.positionFrontier.distinctOwnedPositionStates[0]
      .bothBasicPredecessorsVisible,true,predecessor);
    assert.equal(packet.countsBySeat[1].decisions,0,
      'Only acting owner receives this observation');
  }
});

test('observer does not count unrelated predecessor and does not inspect concealed opponent hand',()=>{
  const state=board('Unown AOR',['Pikachu VIV','Voltorb ROS',null,null,null]);
  const observer=createElectrodeOpportunityObserver();
  observer.observe(state);
  assert.equal(observer.snapshot().positionFrontier.countsBySeat[0]
    .bothBasicPredecessorsVisible,0);
  state.players[0].active=slot(PIKACHU_RANK17);
  observer.observe(state);
  assert.equal(observer.snapshot().positionFrontier.countsBySeat[0]
    .bothBasicPredecessorsVisible,1);
});
