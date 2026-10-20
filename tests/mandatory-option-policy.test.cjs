'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const path=require('node:path');
const {initializeCards}=require('../simulation/twinleaf/headless.cjs');
const {withMandatoryOptionFallback}=require('../simulation/twinleaf/mandatory-option-policy.cjs');
const base=path.resolve(__dirname,'../vendor/twinleaf/ptcg-server/output');
/** @param {string} name */
function engine(name){return require(path.join(base,name));}
const {State,GamePhase}=engine('game/store/state/state');
const {Player}=engine('game/store/state/player');
const {Store}=engine('game/store/store');
const {CardList}=engine('game/store/state/card-list');
const {SimpleTacticsAi}=engine('simple-bot/simple-tactics-ai');
const {SelectOptionPrompt}=engine('game/store/prompts/select-option-prompt');
const {ChooseCardsPrompt}=engine('game/store/prompts/choose-cards-prompt');
const {PlayCardAction,PlayerType,SlotType}=engine('game/store/actions/play-card-action');
const {ResolvePromptAction}=engine('game/store/actions/resolve-prompt-action');
const definitions=engine('simple-bot/simple-bot-definitions');

function options(corrected){
  const baseOptions={tactics:definitions.allSimpleTactics,
    promptResolvers:definitions.allPromptResolvers,scores:definitions.defaultStateScores,
    arbiter:definitions.defaultArbiterOptions};
  return corrected?withMandatoryOptionFallback(baseOptions):baseOptions;
}

function mandatoryPrompt(){
  const player=new Player();player.id=101;
  const state=new State();state.players=[player];state.activePlayer=0;
  const prompt=new SelectOptionPrompt(player.id,'CHOOSE_OPTION',
    ['mode one','mode two'],{allowCancel:false,defaultValue:0});
  prompt.id=17;state.prompts=[prompt];
  return {state,player,prompt};
}

test('pinned default bot cancels noncancelable SelectOptionPrompt',()=>{
  const {state,prompt}=mandatoryPrompt();
  const bot=new SimpleTacticsAi({id:101},options(false),null);
  const action=bot.decodeNextAction(state);
  assert.ok(action instanceof ResolvePromptAction);
  assert.equal(action.id,prompt.id);
  assert.equal(action.result,null);
  assert.equal(prompt.options.allowCancel,false);
});

test('opt-in mode resolver chooses enabled default, then first enabled alternative',()=>{
  const {state,prompt}=mandatoryPrompt();
  const bot=new SimpleTacticsAi({id:101},options(true),null);
  assert.equal(bot.decodeNextAction(state).result,0);
  prompt.options.disabled=[true,false];
  assert.equal(bot.decodeNextAction(state).result,1);
  prompt.options.disabled=[true,true];
  assert.throws(()=>bot.decodeNextAction(state),/no enabled choice/);
  prompt.options.allowCancel=true;
  assert.equal(bot.decodeNextAction(state).result,null);
});

function guzmaBoard(){
  const manager=initializeCards();
  const get=name=>{
    const card=manager.getCardByName(name);
    assert.ok(card,'Expected card: '+name);
    return card;
  };
  const state=new State();state.turn=4;state.phase=GamePhase.PLAYER_TURN;state.activePlayer=0;
  const a=new Player();a.id=101;a.name='A';
  const b=new Player();b.id=202;b.name='B';
  state.players=[a,b];
  a.active.cards.push(get('Regidrago V SIT'));
  b.active.cards.push(get('Dratini OBF'));
  a.hand.cards.push(get('Guzma & Hala CEC'),get('Fire Energy MEE'),get('Grass Energy MEE'));
  a.deck.cards.push(get('Sky Field ROS'),get('Psychic Energy MEE'),get('Dratini OBF'));
  b.deck.cards.push(get('Dratini OBF'));
  for(const player of [a,b]){
    player.prizes=Array.from({length:6},()=>{
      const prize=new CardList();prize.cards.push(get('Dratini OBF'));return prize;
    });
  }
  const store=new Store({onStateChange(){}});
  store.state=state;
  store.dispatch(new PlayCardAction(a.id,0,{player:PlayerType.ANY,slot:SlotType.BOARD,index:0}));
  const prompt=state.prompts.find(p=>p.result===undefined);
  assert.ok(prompt instanceof SelectOptionPrompt,'Expected real Guzma & Hala mode choice');
  return {store,state,a,prompt};
}

test('pinned Store Guzma & Hala mode selection requires meaningful option',()=>{
  const f=guzmaBoard();
  const ai=new SimpleTacticsAi({id:101},options(true),null);
  const chosen=ai.decodeNextAction(f.state);
  assert.ok(chosen instanceof ResolvePromptAction);
  assert.equal(chosen.result,0);
  f.store.dispatch(chosen);
  const next=f.state.prompts.find(p=>p.result===undefined);
  assert.ok(next instanceof ChooseCardsPrompt,'Stadium-search choice should follow the selected mode');
  assert.ok(next.cards.cards.some(c=>c.name==='Sky Field'));
});

test('pinned Store processes null choice and skips compulsory G&H mode',()=>{
  const f=guzmaBoard();
  const ai=new SimpleTacticsAi({id:101},options(false),null);
  const action=ai.decodeNextAction(f.state);
  assert.equal(action.result,null);
  f.store.dispatch(action);
  assert.equal(f.state.prompts.some(p=>p.result===undefined),false,
    'A null mode incorrectly ends this noncancelable card choice');
  assert.equal(f.a.hand.cards.some(c=>c.name==='Sky Field'),false);
});

test('headless opt-in composes the same resolver across both actual seats and records policy',()=>{
  const {runMatch,upstreamSmokeDeck}=require('../simulation/twinleaf/headless.cjs');
  const deck=upstreamSmokeDeck();
  const request={deckA:deck,deckB:deck,seed:20261020,maxActions:24,
    strictPromptValidation:true,isolatePolicyRandomness:true};
  const baseline=runMatch(request);
  const guarded=runMatch({...request,mandatoryOptionFallback:true});
  assert.equal(baseline.mandatoryOptionFallback,false);
  assert.equal(guarded.mandatoryOptionFallback,true);
  assert.doesNotMatch(baseline.policy,/MandatoryOptionDefaultFallback/);
  assert.match(guarded.policy,/MandatoryOptionDefaultFallback-v1/);
  assert.deepEqual(guarded.deckHashes,baseline.deckHashes);
  assert.equal(guarded.firstTurnSlot,baseline.firstTurnSlot);
  assert.ok(guarded.actions<=request.maxActions);
  assert.ok(baseline.actions<=request.maxActions);
});

test('optional strict gate catches real Store G&H null even with original strict validation',()=>{
  const {assertValidPromptAction}=
    require('../simulation/twinleaf/prompt-integrity.cjs');
  const native=guzmaBoard();
  const defaultBot=new SimpleTacticsAi({id:101},options(false),null);
  const invalid=defaultBot.decodeNextAction(native.state);
  assert.equal(invalid.result,null);
  assert.doesNotThrow(()=>assertValidPromptAction(native.state,invalid));
  assert.throws(()=>assertValidPromptAction(native.state,invalid,
    {enforceSelectOptionLegality:true}),/invalid result to SelectOptionPrompt/);
  const selected=new SimpleTacticsAi({id:101},options(true),null)
    .decodeNextAction(native.state);
  assert.equal(selected.result,0);
  assert.doesNotThrow(()=>assertValidPromptAction(native.state,selected,
    {enforceSelectOptionLegality:true}));
});

test('headless mode + fail-closed option validation are versioned and composable',()=>{
  const {runMatch,upstreamSmokeDeck}=require('../simulation/twinleaf/headless.cjs');
  const deck=upstreamSmokeDeck();
  const request={deckA:deck,deckB:deck,seed:20261020,maxActions:24,
    strictPromptValidation:true,isolatePolicyRandomness:true,
    mandatoryOptionFallback:true,enforceSelectOptionLegality:true};
  const result=runMatch(request);
  assert.equal(result.mandatoryOptionFallback,true);
  assert.equal(result.enforceSelectOptionLegality,true);
  assert.match(result.policy,/SelectOptionLegalityGate-v1/);
  assert.match(result.policy,/MandatoryOptionDefaultFallback-v1/);
  assert.ok(result.actions<=request.maxActions);
  assert.throws(()=>runMatch({...request,strictPromptValidation:false}),
    /Option legality gate requires strictPromptValidation:true/);
});
