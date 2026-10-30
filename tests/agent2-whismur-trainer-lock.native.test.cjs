'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const test=require('node:test');
const {initializeCards}=require('../simulation/twinleaf/headless.cjs');
const ROOT=path.resolve(__dirname,'../vendor/twinleaf/ptcg-server/output');
/** @param {string} name */
const native=name=>require(path.join(ROOT,name));

/**
 * One native first-turn-second Whismur Bawl versus source-listed rank2
 * Tag Call and Guzma & Hala. Source card parts are genuine printings;
 * the small staged board is not a registered Aichi physical 60-card deal.
 *
 * @param {0|1} ownerSeat
 * @param {boolean} afterBawl
 */
function runOne(ownerSeat,afterBawl){
  const cardManager=initializeCards();
  const {Store}=native('game/store/store');
  const {Player}=native('game/store/state/player');
  const {CardList}=native('game/store/state/card-list');
  const {GamePhase}=native('game/store/state/state');
  const {Format}=native('game/store/card/card-types');
  const {PlayCardAction,PlayerType,SlotType}=
    native('game/store/actions/play-card-action');
  const {AttackAction}=native('game/store/actions/game-actions');
  const {ResolvePromptAction}=
    native('game/store/actions/resolve-prompt-action');
  const store=new Store({onStateChange(){}});
  const state=store.state;
  state.gameSettings.format=Format.EXPANDED;
  state.phase=GamePhase.PLAYER_TURN;
  state.turn=afterBawl?2:3;
  state.activePlayer=afterBawl?ownerSeat:1-ownerSeat;
  const owner=new Player(),source=new Player();
  owner.id=501;owner.name='Whismur opening challenger';
  source.id=602;source.name='Aichi rank2 Tag Call source miniature';
  state.players=ownerSeat===0?[owner,source]:[source,owner];
  let nextCardId=90000;
  const card=name=>{
    const instance=cardManager.getCardByName(name);
    assert.ok(instance,'Missing genuine native print '+name);
    instance.id=nextCardId++;
    return instance;
  };
  const whismur=card('Whismur CES');
  const bawl=whismur.attacks.find(x=>x.name==='Bawl');
  assert.ok(bawl,'Whismur CES Bawl not registered');
  assert.equal(bawl.cost.length,1,
    'Pinned Bawl must request one Energy symbol, cost type is native enum');
  owner.active.cards.push(whismur);
  source.active.cards.push(card('Shadow Rider Calyrex V CRE'));
  const item=card('Tag Call CEC');
  source.hand.cards.push(item);
  source.deck.cards.push(card('Guzma & Hala CEC'));
  if(afterBawl)owner.hand.cards.push(card('Psychic Energy SVE'));
  for(const player of state.players){
    for(let i=0;i<9;i++)player.deck.cards.push(card('Psychic Energy SVE'));
    for(let i=0;i<6;i++){
      const prize=new CardList();
      prize.cards.push(card('Dratini OBF'));
      player.prizes.push(prize);
    }
  }
  const live=()=>store.state;
  const currentSource=()=>live().players.find(x=>x.id===source.id);
  if(afterBawl){
    store.dispatch(new PlayCardAction(owner.id,0,{
      player:PlayerType.BOTTOM_PLAYER,slot:SlotType.ACTIVE,index:0
    }));
    assert.equal(live().players.find(x=>x.id===owner.id)
      .active.energies.cards.length,1);
    store.dispatch(new AttackAction(owner.id,'Bawl'));
    // In this pinned engine the postattack WaitPrompt may remain pending
    // *after* turn increments to 3. Do not mistake that in-progress prompt
    // for the Bawl Trainer lock. Resolve all actual WaitPrompts first.
    for(let step=0;step<20;step++){
      const prompt=live().prompts.find(x=>x.result===undefined);
      if(!prompt&&live().turn>=3)break;
      assert.ok(prompt,'Bawl must complete to next player without a stalled prompt');
      assert.equal(prompt.constructor.name,'WaitPrompt',
        'Unexpected native Bawl prompt');
      store.dispatch(new ResolvePromptAction(prompt.id,null));
    }
    assert.equal(live().turn,3,'Bawl must end challenger second-player turn');
    assert.equal(live().prompts.find(x=>x.result===undefined),undefined,
      'Bawl must leave no unresolved attack prompt before source Trainer');
  }
  assert.equal(live().activePlayer,1-ownerSeat);
  const originalHand=currentSource().hand.cards.length;
  const originalDeck=currentSource().deck.cards.length;
  const target={player:PlayerType.ANY,slot:SlotType.BOARD,index:0};
  let error=null;
  try{
    const handIndex=currentSource().hand.cards.findIndex(x=>x.id===item.id);
    assert.ok(handIndex>=0);
    store.dispatch(new PlayCardAction(source.id,handIndex,target));
  }catch(e){error=e.message;}
  const pending=live().prompts.find(p=>p.result===undefined);
  const itemStillHeld=currentSource().hand.cards.some(x=>x.id===item.id);
  const result={
    version:'agent2-whismur-trainer-lock-native-v1',
    ownerSeat,afterBawl,sourceCurrentTurn:live().turn,
    printedAttacker:'Whismur CES Bawl',
    testedSourceTrainer:'Tag Call CEC',
    originalSourceHandCount:originalHand,
    originalSourceDeckCount:originalDeck,
    sourceItemStillHeld:itemStillHeld,
    sourceHandAfter:currentSource().hand.cards.length,
    sourceDeckAfter:currentSource().deck.cards.length,
    resultingPrompt:pending?.constructor.name??null,
    error,
    stage:'real pinned Store with mini-board and source-listed printed Trainer',
    fullOriginal60:false,
    competitiveQualified:false
  };
  return result;
}

for(const seat of [0,1]){
  test('native second-player Bawl locks rank2 Tag Call both seats '+seat,()=>{
    const control=runOne(seat,false);
    const treatment=runOne(seat,true);
    process.stdout.write(JSON.stringify({control,treatment})+'\n');
    assert.equal(control.sourceItemStillHeld,false,
      'A rank2-printed Tag Call must be otherwise playable');
    assert.equal(control.resultingPrompt,'ChooseCardsPrompt',
      'Unlocked Tag Call should have a real native deck choice');
    assert.equal(treatment.sourceItemStillHeld,true,
      'Bawl should prevent actual source Item use, preserving source hand');
    assert.equal(treatment.resultingPrompt,null,
      'Bawl lock should not construct Tag Call search prompt');
    assert.equal(treatment.sourceDeckAfter,treatment.originalSourceDeckCount,
      'Blocked opponent Trainer leaves full deck unchanged');
  });
}
