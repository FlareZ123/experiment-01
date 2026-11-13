'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {createTwinleafMcts}=require('../../simulation/twinleaf/2026-11/agent5-twinleaf-mcts-adapter.cjs');

test('Twinleaf adapter resolves a prompt with the prompt owner, not the root player',()=>{
  const promptSeats=[];
  class ActionEnumerator {
    enumerate(state,player) {
      return state.activePlayer===0?[{name:'root-action'}]:[];
    }
  }
  class Simulator {
    constructor(state) {
      this.store={state:JSON.parse(JSON.stringify(state))};
    }
    dispatch(action) {
      const state=this.store.state;
      if(action.name==='root-action') {
        state.activePlayer=1;
        state.prompts=[{playerId:22,result:undefined}];
      } else if(action.name==='resolve-prompt') {
        state.prompts[0].result=action;
        state.phase='FINISHED';
        state.winner=1;
      }
      return state;
    }
  }
  const mcts=createTwinleafMcts({
    ActionEnumerator,Simulator,
    actorObservation:(state,seat)=>({actorSeat:seat,visibleTurn:state.turn}),
    GamePhase:{FINISHED:'FINISHED'},
    BotFlipMode:{RANDOM:'random'},BotShuffleMode:{RANDOM:'random'},
    simulatorOptions:{flipMode:'random',shuffleMode:'random'},
    actionKey:action=>action.name,
    sampleDeterminization:state=>JSON.parse(JSON.stringify(state)),
    evaluateObservation:()=>0,
    promptOwnerSeat:(state,prompt)=>state.players.findIndex(p=>p.id===prompt.playerId),
    promptResolverForSeat:seat=>({resolvePrompt:()=>{
      promptSeats.push(seat);
      return {name:'resolve-prompt'};
    }}),
    winnerSeat:state=>state.winner
  },{iterations:1,maxPlies:2,seed:7});
  const result=mcts.search({activePlayer:0,turn:4,phase:'PLAY',winner:null,
    prompts:[],players:[{id:11},{id:22}]},0);
  assert.equal(result.actionKey,'root-action');
  assert.deepEqual(promptSeats,[1]);
  assert.equal(result.audit.terminalRollouts,1);
  assert.equal(result.audit.rootActions[0].meanValue,-1);
});

test('private sampled decklist identity follows each seat through Twinleaf state clones',()=>{
  const seen=[];
  const metadataByState=new WeakMap();
  class ActionEnumerator {
    enumerate(state) {
      return state.activePlayer===0?[{name:'root'}]:[{name:'reply'}];
    }
  }
  class Simulator {
    constructor(state){this.store={state:JSON.parse(JSON.stringify(state))};}
    dispatch(action){
      const s=this.store.state;
      if(action.name==='root')s.activePlayer=1;
      else {s.phase='FINISHED';s.winner=0;}
      return s;
    }
  }
  const sampler=(state)=>{
    const copy=JSON.parse(JSON.stringify(state));
    metadataByState.set(copy,{decklistIds:['candidate-list','sampled-opponent-list']});
    return copy;
  };
  const mcts=createTwinleafMcts({
    ActionEnumerator,Simulator,
    actorObservation:(state,seat)=>({actorSeat:seat,turn:state.turn}),
    GamePhase:{FINISHED:'FINISHED'},
    BotFlipMode:{RANDOM:'random'},BotShuffleMode:{RANDOM:'random'},
    simulatorOptions:{flipMode:'random',shuffleMode:'random'},
    actionKey:a=>a.name,sampleDeterminization:sampler,
    metadataByState,ownDecklistSeat:0,ownDecklistId:'candidate-list',
    evaluateObservation:(observation)=>{seen.push(observation.ownDecklistId);return 0;},
    promptOwnerSeat:()=>0,promptResolverForSeat:()=>({resolvePrompt:()=>({name:'noop'})}),
    winnerSeat:s=>s.winner
  },{iterations:1,maxPlies:3,seed:4});
  mcts.search({activePlayer:0,turn:1,phase:'PLAY',winner:null,prompts:[],players:[{id:1},{id:2}]},0);
  assert.ok(seen.includes('sampled-opponent-list'));
});
