'use strict';

const assert=require('node:assert/strict');
const {createInformationSetMcts}=require('./agent5-information-set-mcts.cjs');

function withRandom(random,fn) {
  const previous=Math.random;
  Math.random=random;
  try{return fn();}
  finally{Math.random=previous;}
}

function createTwinleafInformationSetSearch(deps,options={}) {
  const required=[
    'ActionEnumerator','Simulator','actorObservation','GamePhase',
    'BotFlipMode','BotShuffleMode','simulatorOptions',
    'actionKey','sampleDeterminization','evaluateObservation',
    'promptOwnerSeat','promptResolverForSeat','winnerSeat'
  ];
  for(const name of required)assert.ok(deps[name], 'Missing Twinleaf adapter dependency: '+name);
  assert.equal(deps.simulatorOptions.flipMode,deps.BotFlipMode.RANDOM,
    'Search simulations must use random coin flips, not Twinleaf defaults');
  assert.equal(deps.simulatorOptions.shuffleMode,deps.BotShuffleMode.RANDOM,
    'Search simulations must use random deck shuffles, not Twinleaf defaults');
  const enumerator=new deps.ActionEnumerator();
  const knowledgeSnapshot=deps.knowledgeSnapshot??(()=>null);
  if(deps.metadataByState) {
    assert.ok(deps.ownDecklistSeat===0||deps.ownDecklistSeat===1,
      'Decklist-aware observations require the bot physical seat');
    assert.ok(typeof deps.ownDecklistId==='string'&&deps.ownDecklistId.length>0,
      'Decklist-aware observations require the bot own decklist ID');
  }
  const maxPromptResolutions=options.maxPromptResolutions??64;

  function stable(state) {
    return !(state.prompts??[]).some(prompt=>prompt.result===undefined);
  }
  function resolvePrompts(simulator,random) {
    let count=0;
    while(!stable(simulator.store.state)) {
      assert.ok(count++<maxPromptResolutions,
        'Prompt resolution exceeded the safety bound');
      const state=simulator.store.state;
      const prompt=state.prompts.find(item=>item.result===undefined);
      const seat=deps.promptOwnerSeat(state,prompt);
      assert.ok(seat===0||seat===1,'Prompt owner could not be mapped to a physical seat');
      const resolver=deps.promptResolverForSeat(seat);
      assert.ok(resolver&&typeof resolver.resolvePrompt==='function',
        'Prompt owner has no actor-scoped resolver');
      const action=resolver.resolvePrompt(state.players[seat],state,prompt);
      assert.ok(action,'Prompt resolver returned no action');
      simulator.dispatch(action);
    }
    return simulator.store.state;
  }

  return Object.freeze({
    observe(state,seat) {
      const observation=deps.actorObservation(state,seat,{
        ownerK1Snapshot:knowledgeSnapshot(state,seat)
      });
      const sampled=deps.metadataByState?.get(state);
      const ownDecklistId=sampled?.decklistIds?.[seat]??
        (seat===deps.ownDecklistSeat?deps.ownDecklistId:null);
      return ownDecklistId===null?observation:{...observation,ownDecklistId};
    },
    activeSeat(state) {
      const seat=state.activePlayer;
      assert.ok(seat===0||seat===1,'Twinleaf activePlayer is not a physical seat index');
      return seat;
    },
    enumerateActions(state,seat) {
      assert.equal(state.activePlayer,seat);
      const player=state.players[seat];
      const actions=enumerator.enumerate(state,player,player.id);
      assert.ok(Array.isArray(actions));
      return actions;
    },
    actionKey:deps.actionKey,
    applyAction(state,action,random) {
      const metadata=deps.metadataByState?.get(state);
      const simulator=withRandom(random,()=>new deps.Simulator(state,deps.simulatorOptions));
      withRandom(random,()=>simulator.dispatch(action));
      const next=withRandom(random,()=>resolvePrompts(simulator,random));
      if(metadata&&deps.metadataByState)deps.metadataByState.set(next,metadata);
      return next;
    },
    sampleDeterminization:deps.sampleDeterminization,
    isTerminal(state) {
      return state.phase===deps.GamePhase.FINISHED;
    },
    terminalValue(state,seat) {
      const winner=deps.winnerSeat(state);
      if(winner===null||winner===undefined)return 0;
      return winner===seat?1:-1;
    },
    evaluateObservation:deps.evaluateObservation,
    actionPrior:deps.actionPrior,
    isStable:stable
  });
}

function createTwinleafMcts(deps,options={}) {
  const adapter=createTwinleafInformationSetSearch(deps,options);
  return createInformationSetMcts({
    ...adapter,
    iterations:options.iterations??128,
    maxPlies:options.maxPlies??16,
    cPuct:options.cPuct??1.4,
    seed:options.seed??1
  });
}

module.exports={createTwinleafInformationSetSearch,createTwinleafMcts};
