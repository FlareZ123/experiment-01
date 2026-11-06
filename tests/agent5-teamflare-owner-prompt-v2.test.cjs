'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {
  withOriginalTeamFlareEnergyPrompt, VERSION, SOURCE
} = require('../simulation/twinleaf/agent5-teamflare-owner-prompt-v2.cjs');

class AddPlayerAction {}
class PlayCardAction {
  constructor(id, handIndex) { this.id = id; this.handIndex = handIndex; }
}
class ResolvePromptAction {
  constructor(id, result) { this.id = id; this.result = result; }
}
class ChooseCardsPrompt {
  constructor(owner, target, message='CHOOSE_CARD_TO_DISCARD') {
    this.id = 31;
    this.playerId = owner.id;
    this.cards = target;
    this.message = message;
    this.options = {min:1,max:1,allowCancel:false};
    this.result = undefined;
  }
  validate(cards) {
    return Array.isArray(cards) && cards.length === 1 &&
      this.cards.energies.cards.includes(cards[0]);
  }
}
class Ai {
  decodeNextAction() { return {kind:'original-pass'}; }
}
const GamePhase = {PLAYER_TURN:'PLAYER_TURN'};
function slot(name, energies=[]) {
  const cards = [...energies];
  return {
    getPokemonCard:()=>({fullName:name}),
    cards, energies:{cards:[...energies]}, tools: []
  };
}
function fixture(mode='settled') {
  const psychic={fullName:'Psychic Energy MEE',superType:2};
  const flare={fullName:SOURCE};
  const owner = {
    id:'owner',
    active:slot('Iron Thorns ex TWM'),
    hand:{cards:[flare]}, supporter:{cards:[]}, discard:{cards:[]},
    supporterTurn:0
  };
  const opponent = {
    id:'opponent', active:slot('Tapu Lele-GX GRI',[psychic]),
    discard:{cards:[]}
  };
  Object.defineProperty(opponent, 'hand', {get() {
    throw Error('illegal opponent-hand read');
  }});
  class Store {
    constructor() {
      this.state={phase:GamePhase.PLAYER_TURN, turn:5,
        activePlayer:0, players:[owner,opponent], prompts:[]};
    }
    dispatch(action) {
      if (action instanceof PlayCardAction) {
        const [played]=owner.hand.cards.splice(action.handIndex,1);
        owner.supporter.cards.push(played);
        owner.supporterTurn=1;
        this.state.prompts.push(new ChooseCardsPrompt(owner,opponent.active,
          mode==='wrong-message'?'CHOOSE_ANOTHER_CARD':'CHOOSE_CARD_TO_DISCARD'));
      }
      if (action instanceof ResolvePromptAction) {
        if (mode==='reject') throw Error('native prompt rejected');
        if (mode==='silent') return true;
        const prompt=this.state.prompts[0];
        prompt.result=action.result;
        for(const card of action.result) {
          const index=opponent.active.cards.indexOf(card);
          assert.ok(index>=0);
          opponent.active.cards.splice(index,1);
          const attached=opponent.active.energies.cards.indexOf(card);
          assert.ok(attached>=0);
          opponent.active.energies.cards.splice(attached,1);
          opponent.discard.cards.push(card);
        }
      }
      return true;
    }
  }
  return {Store,owner,opponent,flare,psychic};
}
function run(mode='settled') {
  const env=fixture(mode);
  const store=new env.Store();
  const originalAi=Ai.prototype.decodeNextAction;
  const originalDispatch=env.Store.prototype.dispatch;
  let offered;
  try {
    const result=withOriginalTeamFlareEnergyPrompt(()=>{
      store.dispatch(new AddPlayerAction());
      store.dispatch(new PlayCardAction('owner',0));
      offered=new Ai().decodeNextAction(store.state);
      if (offered instanceof ResolvePromptAction) store.dispatch(offered);
      return store;
    }, {
      seat:0,turn:5,Store:env.Store,SimpleTacticsAi:Ai,
      ResolvePromptAction,GamePhase
    });
    assert.strictEqual(Ai.prototype.decodeNextAction,originalAi);
    assert.strictEqual(env.Store.prototype.dispatch,originalDispatch);
    return {...env,offered,...result};
  } catch(error) {
    assert.strictEqual(Ai.prototype.decodeNextAction,originalAi);
    assert.strictEqual(env.Store.prototype.dispatch,originalDispatch);
    throw error;
  }
}

test('one real owner prompt discards exact opponent Active Energy object',()=>{
  const result=run();
  assert.ok(result.offered instanceof ResolvePromptAction);
  assert.strictEqual(result.offered.result[0],result.psychic);
  assert.equal(result.audit.version,VERSION);
  assert.equal(result.audit.sourceFlareAccepted,1);
  assert.equal(result.audit.exactPromptOffers,1);
  assert.equal(result.audit.promptActionsSelected,1);
  assert.equal(result.audit.promptActionsAccepted,1);
  assert.equal(result.audit.physicallySettledEnergyDiscards,1);
  assert.deepEqual(result.opponent.discard.cards,[result.psychic]);
  assert.deepEqual(result.opponent.active.energies.cards,[]);
  assert.deepEqual(result.owner.supporter.cards,[result.flare]);
  assert.equal(result.audit.rootCardMovedFromHand,true);
  assert.equal(result.audit.sourceSupporterTurnBefore,0);
  assert.equal(result.audit.sourceSupporterTurnAfter,1);
  assert.equal(result.audit.paperQualified,false);
  assert.equal(result.audit.competitiveQualified,false);
});

test('silent non-settling native prompt return never counts physical payoff',()=>{
  const x=run('silent');
  assert.equal(x.audit.sourceFlareAccepted,1);
  assert.equal(x.audit.promptActionsSelected,1);
  assert.equal(x.audit.promptActionsAccepted,0);
  assert.equal(x.audit.physicallySettledEnergyDiscards,0);
  assert.equal(x.audit.unsupportedChoices,1);
  assert.deepEqual(x.opponent.discard.cards,[]);
  assert.equal(x.offered.constructor.name,'ResolvePromptAction');
});

test('wrong pending prompt preserves preexisting bot choice',()=>{
  const x=run('wrong-message');
  assert.equal(x.offered.kind,'original-pass');
  assert.equal(x.audit.physicallySettledEnergyDiscards,0);
  assert.equal(x.audit.promptActionsSelected,0);
  assert.equal(x.audit.unexpectedPending.length,1);
});

test('native thrown prompt rejection is preserved with attached bounded audit',()=>{
  assert.throws(()=>run('reject'),error=>{
    assert.match(String(error),/native prompt rejected/);
    assert.equal(error.agent5TeamFlarePromptAudit.nativePromptRejected,1);
    assert.equal(error.agent5TeamFlarePromptAudit.physicallySettledEnergyDiscards,0);
    return true;
  });
});

test('opponent seat mismatch does not install a nonowner prompt response',()=>{
  const env=fixture();
  const store=new env.Store();
  const before=Ai.prototype.decodeNextAction;
  const ret=withOriginalTeamFlareEnergyPrompt(()=>{
    store.dispatch(new AddPlayerAction());
    store.dispatch(new PlayCardAction('owner',0));
    return new Ai().decodeNextAction(store.state);
  },{seat:1,turn:5,Store:env.Store,SimpleTacticsAi:Ai,
    ResolvePromptAction,GamePhase});
  assert.equal(ret.result.kind,'original-pass');
  assert.equal(ret.audit.sourceFlareAccepted,0);
  assert.strictEqual(Ai.prototype.decodeNextAction,before);
});
