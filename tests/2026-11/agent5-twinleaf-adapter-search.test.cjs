'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {createTwinleafInformationSetSearch,createTwinleafMcts}=require('../../simulation/twinleaf/2026-11/agent5-twinleaf-mcts-adapter.cjs');
const {observationSha256}=require('../../simulation/twinleaf/2026-11/agent5-information-set-mcts.cjs');

test('bounded MCTS adapter abstains on unresolved prompts without invoking a policy resolver',()=>{
  let resolverCalls=0;
  class ActionEnumerator {
    enumerate(state) {
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
      }
      return state;
    }
  }
  const sampleDeterminization=state=>JSON.parse(JSON.stringify(state));
  sampleDeterminization.knowledgeBySeat=()=>({
    verified:true,mode:'K0',knownTopDeck:[],knownBottomDeck:[],
    knownBottomDeckOrder:false,knownPrizePrintings:[],ownerK1Snapshot:null
  });
  const mcts=createTwinleafMcts({
    ActionEnumerator,Simulator,
    actorObservation:(state,seat)=>({actorSeat:seat,visibleTurn:state.turn}),
    GamePhase:{FINISHED:'FINISHED'},
    BotFlipMode:{RANDOM:'random'},BotShuffleMode:{RANDOM:'random'},
    simulatorOptions:{flipMode:'random',shuffleMode:'random'},
    actionKey:action=>action.name,
    sampleDeterminization,
    evaluateObservation:()=>0,
    winnerSeat:state=>state.winner,
    promptResolverForSeat:()=>{resolverCalls++;return {resolvePrompt:()=>({name:'unsafe'})};}
  },{iterations:1,maxPlies:2,seed:7});
  assert.throws(()=>mcts.search({activePlayer:0,turn:4,phase:'PLAY',winner:null,
    prompts:[],players:[{id:11},{id:22}]},0),
    error=>error.code==='MCTS_ABSTAIN_PROMPT_OUTSIDE_ENVELOPE');
  assert.equal(resolverCalls,0,'bounded adapter must never expose a prompt to policy resolvers');
});

test('bounded MCTS adapter also abstains when an actual transition opens a prompt',()=>{
  let simulatorInstances=0;
  class ActionEnumerator {
    enumerate(state) {
      return state.activePlayer===0?[{name:'root-action'}]:[];
    }
  }
  class Simulator {
    constructor(state) {
      this.instance=++simulatorInstances;
      this.store={state:JSON.parse(JSON.stringify(state))};
    }
    dispatch() {
      if(this.instance===3)this.store.state.prompts=[{result:undefined}];
      return this.store.state;
    }
  }
  const sampleDeterminization=state=>JSON.parse(JSON.stringify(state));
  sampleDeterminization.knowledgeBySeat=()=>({
    verified:true,mode:'K0',knownTopDeck:[],knownBottomDeck:[],
    knownBottomDeckOrder:false,knownPrizePrintings:[],ownerK1Snapshot:null
  });
  const mcts=createTwinleafMcts({
    ActionEnumerator,Simulator,
    actorObservation:(state,seat)=>({actorSeat:seat,turn:state.turn}),
    GamePhase:{FINISHED:'FINISHED'},
    BotFlipMode:{RANDOM:'random'},BotShuffleMode:{RANDOM:'random'},
    simulatorOptions:{flipMode:'random',shuffleMode:'random'},
    actionKey:action=>action.name,sampleDeterminization,
    evaluateObservation:()=>0,winnerSeat:()=>null
  },{iterations:1,maxPlies:2,seed:9});
  assert.throws(()=>mcts.search({activePlayer:0,turn:1,phase:'PLAY',prompts:[],
    players:[{id:1},{id:2}]},0),
    error=>error.code==='MCTS_ABSTAIN_PROMPT_OUTSIDE_ENVELOPE');
  assert.equal(simulatorInstances,3,
    'one root preflight, one determinized preflight, and one actual transition were expected');
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
  sampler.metadataByState=metadataByState;
  sampler.knowledgeBySeat=()=>({
    verified:true,mode:'K0',knownTopDeck:[],knownBottomDeck:[],
    knownBottomDeckOrder:false,knownPrizePrintings:[],ownerK1Snapshot:null
  });
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

test('MCTS observation key binds the full owner ledger and sampled states reuse its exact snapshot',()=>{
  const metadataByState=new WeakMap();
  const ledgers=[
    {verified:true,mode:'K0',knownTopDeck:[],knownBottomDeck:[],
      knownBottomDeckOrder:false,knownPrizePrintings:[],ownerK1Snapshot:null},
    {verified:true,mode:'K0',knownTopDeck:[],knownBottomDeck:[],
      knownBottomDeckOrder:false,knownPrizePrintings:[],ownerK1Snapshot:null}
  ];
  const sampler=state=>{
    const copy=JSON.parse(JSON.stringify(state));
    metadataByState.set(copy,{knowledgeBySeat:ledgers.map(x=>JSON.parse(JSON.stringify(x)))});
    return copy;
  };
  sampler.metadataByState=metadataByState;
  sampler.knowledgeBySeat=(_state,seat)=>ledgers[seat];
  const adapter=createTwinleafInformationSetSearch({
    ActionEnumerator:class {},
    Simulator:class {},
    actorObservation:(state,seat)=>({actorSeat:seat,turn:state.turn}),
    GamePhase:{FINISHED:'FINISHED'},
    BotFlipMode:{RANDOM:'random'},BotShuffleMode:{RANDOM:'random'},
    simulatorOptions:{flipMode:'random',shuffleMode:'random'},
    actionKey:action=>action.name,
    sampleDeterminization:sampler,
    evaluateObservation:()=>0,
    promptOwnerSeat:()=>0,
    promptResolverForSeat:()=>({resolvePrompt:()=>({name:'noop'})}),
    winnerSeat:()=>null
  });
  const state={activePlayer:0,turn:1,phase:'PLAY',prompts:[],players:[{id:1},{id:2}]};
  const k0=adapter.observe(state,0);
  const k0Hash=observationSha256(k0);
  ledgers[0]={...ledgers[0],mode:'PARTIAL',
    knownBottomDeck:['Psychic Energy'],knownBottomDeckOrder:true};
  const partial=adapter.observe(state,0);
  assert.notEqual(observationSha256(partial),k0Hash,
    'owner-known bottom-deck identities/order must distinguish information-set keys');
  const sampled=sampler(state,0,()=>0.1);
  const sampledObservation=adapter.observe(sampled,0);
  const sampledHash=observationSha256(sampledObservation);
  ledgers[0]={...ledgers[0],mode:'K1',
    knownPrizePrintings:[{printing:'PrizeCard',copies:6}],
    ownerK1Snapshot:{epoch:7,exactMembershipKnown:true,
      knownPrintings:[{printing:'PrizeCard',copies:6}]}
  };
  const afterProviderChange=adapter.observe(sampled,0);
  assert.equal(observationSha256(afterProviderChange),sampledHash,
    'sampled determinization must retain the exact ledger snapshot used to create it');
  assert.deepEqual(afterProviderChange.ownerKnowledgeLedger,partial.ownerKnowledgeLedger);
});


test('Simulator filters illegal candidates and a reached ActionEnumerator class cap abstains',()=>{
  const base={
    actorObservation:(state,seat)=>({actorSeat:seat,turn:state.turn}),
    GamePhase:{FINISHED:'FINISHED'},
    BotFlipMode:{RANDOM:'random'},BotShuffleMode:{RANDOM:'random'},
    simulatorOptions:{flipMode:'random',shuffleMode:'random'},
    actionKey:action=>action.name,
    sampleDeterminization:Object.assign(state=>({...state}),{
      knowledgeBySeat:()=>({verified:true,mode:'K0',knownTopDeck:[],
        knownBottomDeck:[],knownBottomDeckOrder:false,knownPrizePrintings:[],
        ownerK1Snapshot:null})
    }),
    evaluateObservation:()=>0,winnerSeat:()=>null
  };
  const dispatches=[];
  class Simulator {
    constructor(state){this.store={state:{...state}};}
    dispatch(action){
      dispatches.push(action.name);
      if(action.name==='illegal')throw new Error('Simulator rejected illegal candidate');
      return this.store.state;
    }
  }
  const adapter=createTwinleafInformationSetSearch({
    ...base,Simulator,
    ActionEnumerator:class {enumerate(){return [{name:'legal'},{name:'illegal'}];}}
  });
  const state={activePlayer:0,turn:1,phase:'PLAY',prompts:[],players:[{id:1},{id:2}]};
  assert.deepEqual(adapter.enumerateActions(state,0).map(action=>action.name),['legal']);
  assert.deepEqual(dispatches,['legal','illegal']);

  const capped=createTwinleafInformationSetSearch({
    ...base,Simulator,
    ActionEnumerator:class {enumerate(){return Array.from({length:8},(_,i)=>({name:'a'+i}));}}
  });
  assert.throws(()=>capped.enumerateActions(state,0),
    error=>error.code==='MCTS_ABSTAIN_ACTION_FRONTIER_CAPPED');
});

