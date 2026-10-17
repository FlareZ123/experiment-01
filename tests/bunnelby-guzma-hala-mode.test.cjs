'use strict';

const assert=require('node:assert/strict');
const test=require('node:test');
const path=require('node:path');
const {stageRank2SourceK0}=require('../simulation/twinleaf/rank2-full-source-k0-sampler.cjs');
const {initializeCards}=require('../simulation/twinleaf/headless.cjs');
const {withBunnelbyGuzmaHalaMode1,sourceCopyPossible,
  canPreferGuzmaHalaMode1}=require('../simulation/twinleaf/bunnelby-guzma-hala-policy.cjs');
const {withMandatoryOptionFallback}=require('../simulation/twinleaf/mandatory-option-policy.cjs');
const output=path.resolve(__dirname,'../vendor/twinleaf/ptcg-server/output');
const engine=name=>require(path.join(output,name));

/** Full source-60 physical zones, with two cards moved from in-play to the deck. */
function sourceBoard(prizeGloom=false) {
  const fixture=stageRank2SourceK0(prizeGloom);
  const {state,player,rank2}=fixture;
  const manager=initializeCards();
  const sourceCards=rank2.cardIds.map(name=>manager.getCardByName(name));
  const jet=player.active.energies.cards.find(c=>c.fullName==='Jet Energy PAL');
  const tm=player.active.tools.find(c=>c.fullName==='Technical Machine: Evolution PAR');
  assert.ok(jet&&tm);
  player.active.energies.cards.splice(player.active.energies.cards.indexOf(jet),1);
  player.active.cards.splice(player.active.cards.indexOf(jet),1);
  player.active.tools.splice(player.active.tools.indexOf(tm),1);
  player.deck.cards.push(jet,tm);
  const {GamePhase}=engine('game/store/state/state');
  state.phase=GamePhase.PLAYER_TURN;
  state.activePlayer=state.players.findIndex(p=>p.id===player.id);
  const {Store}=engine('game/store/store');
  const store=new Store({onStateChange(){}});
  store.state=state;
  assert.equal(player.supporterTurn,0);
  return {store,state,player,rank2,sourceCards,jet,tm};
}

function options(sourceCards) {
  const d=engine('simple-bot/simple-bot-definitions');
  const base={tactics:d.allSimpleTactics,promptResolvers:d.allPromptResolvers,
    scores:d.defaultStateScores,arbiter:d.defaultArbiterOptions};
  return withBunnelbyGuzmaHalaMode1(
    withMandatoryOptionFallback(base),sourceCards);
}

test('K0 source mode opportunity does not inspect the hidden Gloom Prize partition',()=>{
  const first=sourceBoard(false),second=sourceBoard(true);
  assert.equal(sourceCopyPossible(first.player,first.sourceCards,
    'Technical Machine: Evolution PAR'),true);
  assert.equal(sourceCopyPossible(second.player,second.sourceCards,
    'Technical Machine: Evolution PAR'),true);
  assert.equal(canPreferGuzmaHalaMode1(first.player,first.sourceCards),true);
  assert.equal(canPreferGuzmaHalaMode1(second.player,second.sourceCards),true);
  assert.deepEqual(first.player.hand.cards.map(c=>c.fullName),
    second.player.hand.cards.map(c=>c.fullName));
});

test('actual Store Guzma & Hala selects optional discard-search mode1',()=>{
  const f=sourceBoard(false);
  const {PlayCardAction,PlayerType,SlotType}=
    engine('game/store/actions/play-card-action');
  const {ResolvePromptAction}=engine('game/store/actions/resolve-prompt-action');
  const {SimpleTacticsAi}=engine('simple-bot/simple-tactics-ai');
  const {SelectOptionPrompt}=engine('game/store/prompts/select-option-prompt');
  const {ChooseCardsPrompt}=engine('game/store/prompts/choose-cards-prompt');
  const handIndex=f.player.hand.cards.findIndex(c=>
    c.fullName==='Guzma & Hala CEC');
  assert.ok(handIndex>=0);
  f.store.dispatch(new PlayCardAction(f.player.id,handIndex,
    {player:PlayerType.ANY,slot:SlotType.BOARD,index:0}));
  const first=f.state.prompts.find(p=>p.result===undefined);
  assert.ok(first instanceof SelectOptionPrompt);
  const ai=new SimpleTacticsAi({id:f.player.id},options(f.sourceCards),null);
  const mode=ai.decodeNextAction(f.state);
  assert.ok(mode instanceof ResolvePromptAction);
  assert.equal(mode.result,1);
  f.store.dispatch(mode);

  const discard=f.state.prompts.find(p=>p.result===undefined);
  assert.ok(discard instanceof ChooseCardsPrompt);
  const toDiscard=[
    f.player.hand.cards.find(c=>c.fullName==='Tag Call CEC'),
    f.player.hand.cards.find(c=>c.fullName==='Stealthy Hood UNB')
  ];
  assert.equal(discard.validate(toDiscard),true);
  f.store.dispatch(new ResolvePromptAction(discard.id,toDiscard));

  const search=f.state.prompts.find(p=>p.result===undefined);
  assert.ok(search instanceof ChooseCardsPrompt);
  assert.ok(search.cards===f.player.deck);
  assert.equal(search.validate([f.tm,f.jet]),true);
  f.store.dispatch(new ResolvePromptAction(search.id,[f.tm,f.jet]));
  for(let n=0;n<12;n++){
    const p=f.state.prompts.find(prompt=>prompt.result===undefined);
    if(!p) break;
    if(p.constructor.name==='ShuffleDeckPrompt') {
      f.store.dispatch(new ResolvePromptAction(p.id,
        f.player.deck.cards.map((_,i)=>i)));
    } else if(p.constructor.name==='WaitPrompt') {
      f.store.dispatch(new ResolvePromptAction(p.id,null));
    } else if(p.constructor.name==='ShowCardsPrompt') {
      f.store.dispatch(new ResolvePromptAction(p.id,true));
    } else {
      throw new Error('Unexpected support search prompt: '+p.constructor.name);
    }
  }
  assert.equal(f.state.prompts.some(p=>p.result===undefined),false);
  assert.ok(f.player.hand.cards.includes(f.jet));
  assert.ok(f.player.hand.cards.includes(f.tm));
  assert.ok(toDiscard.every(card=>f.player.discard.cards.includes(card)));
  assert.equal(f.player.supporterTurn>0,true);
});

test('mode1 source resolver remains opt-in and requires physical source copies',()=>{
  const d=engine('simple-bot/simple-bot-definitions');
  const base={promptResolvers:d.allPromptResolvers};
  assert.throws(()=>withBunnelbyGuzmaHalaMode1(base,[]),/source 60/);
  const first=withBunnelbyGuzmaHalaMode1(base,sourceBoard(false).sourceCards);
  assert.equal(first.promptResolvers[0].name,'BunnelbyGuzmaHalaModeResolver');
  assert.throws(()=>withBunnelbyGuzmaHalaMode1(first,
    sourceBoard(false).sourceCards),/already installed/);
});
