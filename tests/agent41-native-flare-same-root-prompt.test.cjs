'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {withNativeActorFlarePrompt}=
  require('../simulation/twinleaf/agent41-same-root-native-flare-prompt.cjs');

class PlayCardAction {
  constructor(handIndex){this.handIndex=handIndex;}
}
class ResolvePromptAction {
  constructor(id,cards){this.id=id;this.cards=cards;}
}
class FakeAi {
  constructor(id){this.client={id};}
  decodeNextAction(){return {kind:'native-fallback'};}
}
const GamePhase={PLAYER_TURN:'PLAYER_TURN'};

function physicalTest(seat){
  const energy={fullName:'Psychic Energy MEE'};
  const flare={fullName:'Team Flare Grunt XY'};
  const owner={id:'owner',hand:{cards:[flare]},supporterTurn:0,
    discard:{cards:[]},active:{energies:{cards:[]}}};
  const opponent={id:'opponent',hand:{cards:[]},supporterTurn:0,
    discard:{cards:[]},active:{energies:{cards:[energy]}}};
  const state={
    phase:GamePhase.PLAYER_TURN,activePlayer:seat,
    turn:4,players:seat===0?[owner,opponent]:[opponent,owner],
    prompts:[]
  };
  class FakeStore {
    constructor(){this.state=state;}
    dispatch(action){
      if(action?.constructor?.name==='AddPlayerAction')return true;
      if(action instanceof PlayCardAction){
        owner.hand.cards.splice(action.handIndex,1);
        owner.supporterTurn++;
        state.prompts.push({
          id:17,playerId:owner.id,message:'CHOOSE_CARD_TO_DISCARD',
          result:undefined,validate:(cards)=>cards.length===1&&cards[0]===energy
        });
        return true;
      }
      if(action instanceof ResolvePromptAction){
        const removed=opponent.active.energies.cards.shift();
        assert.strictEqual(removed,energy);
        opponent.discard.cards.push(removed);
        state.prompts[0].result=action.cards;
        return true;
      }
      throw Error('Unexpected native action');
    }
  }
  const adapter=withNativeActorFlarePrompt(()=>{
    const store=new FakeStore();
    store.dispatch({constructor:{name:'AddPlayerAction'}});
    store.dispatch(new PlayCardAction(0));
    assert.equal(opponent.active.energies.cards.length,1);
    const native=new FakeAi(owner.id).decodeNextAction(state);
    assert.ok(native instanceof ResolvePromptAction);
    store.dispatch(native);
    return {cards:opponent.discard.cards,ownerHand:owner.hand.cards};
  },{
    Ai:FakeAi,Store:FakeStore,
    cardActions:{PlayCardAction},ResolvePromptAction,GamePhase,
    selectEnergy:()=>[energy],
    actorReceipt:()=>({
      kind:'play-team-flare-grunt-denial',printing:'Team Flare Grunt XY',
      seat,handIndex:0,policyDecisionOrdinal:7
    })
  });
  assert.equal(adapter.audit.nativeRootAccepted,1);
  assert.equal(adapter.audit.nativeEnergyPromptsAccepted,1);
  assert.equal(adapter.audit.physicallySettledActiveEnergy,1);
  assert.equal(adapter.audit.nativeUnresolvedChains,0);
  assert.equal(adapter.audit.bySeat[seat].settled,1);
  assert.equal(adapter.audit.receipts.at(-1).ownerAdditionalHandPayment,0);
  assert.deepEqual(adapter.result.ownerHand,[]);
  assert.deepEqual(adapter.result.cards,[energy]);
}

for(const seat of [0,1])
  test('same-root native Team Flare exact physical prompt at seat '+seat,()=>
    physicalTest(seat));

test('untagged native owner card cannot become an adopted Flare root',()=>{
  class Store {
    constructor(){this.state={activePlayer:0,phase:GamePhase.PLAYER_TURN,
      players:[{id:'a',hand:{cards:[]}},{}]};}
    dispatch(){return true;}
  }
  const res=withNativeActorFlarePrompt(()=>{
    const store=new Store();
    store.dispatch({constructor:{name:'AddPlayerAction'}});
    store.dispatch(new PlayCardAction(0));
    return true;
  },{Ai:FakeAi,Store,GamePhase,
    cardActions:{PlayCardAction},ResolvePromptAction,
    actorReceipt:()=>null,selectEnergy:()=>[]});
  assert.equal(res.audit.nativeRootAccepted,0);
  assert.equal(res.audit.physicallySettledActiveEnergy,0);
});
