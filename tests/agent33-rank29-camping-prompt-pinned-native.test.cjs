'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const path=require('node:path');
const {initializeCards,seededRandom,deckPermutation}=
  require('../simulation/twinleaf/headless.cjs');
const {planAichi}=require('../simulation/evaluation/aichi-pilot.cjs');
const {actorObservation}=require('../simulation/twinleaf/actor-observation-contract.cjs');
const {DCE,THUNDER,chooseRank29TwoPieceCampingSearch}=
  require('../simulation/twinleaf/agent33-rank29-camping-attackpair-target.cjs');
const {chooseActualCampingGearCard}=
  require('../simulation/twinleaf/agent12-native-campinggear-after-pass.cjs');
const {withNumericShufflePromptValidation}=
  require('../simulation/twinleaf/agent33-shuffle-prompt-numeric-validation.cjs');

const BASE=path.resolve(__dirname,'../vendor/twinleaf/ptcg-server/output');
const native=name=>require(path.join(BASE,name));
const {Store}=native('game/store/store');
const {Player}=native('game/store/state/player');
const {Card}=native('game/store/card/card');
const {CardList}=native('game/store/state/card-list');
const {GamePhase}=native('game/store/state/state');
const {PlayCardAction,PlayerType,SlotType}=
  native('game/store/actions/play-card-action');
const {ResolvePromptAction}=
  native('game/store/actions/resolve-prompt-action');

function stage(seat){
  const plan=planAichi(1,{allowEquivalentBasicEnergies:true,
    allowBasicEnergyMirrorPrintings:true,
    allowJapanesePromoHooks:true});
  const original=plan.opponents.find(row=>row.rank===29);
  assert.equal(original?.status,'ready');
  assert.equal(original.cards.length,60);
  const manager=initializeCards(),get=printing=>{
    const card=manager.getCardByName(printing);
    assert.ok(card,'Pinned exact printing unavailable: '+printing);
    return card;
  };
  const protectedPrintings=new Set([
    THUNDER,'Guzma & Hala CEC','Speed Lightning Energy RCL'
  ]);
  const store=new Store({onStateChange(){}});
  const state=store.state,players=[new Player(),new Player()];
  players[0].id=101;players[1].id=202;
  for(const [index,player] of players.entries()){
    // One original exact source 60 per seat, with deliberately staged
    // owner-only hand/Prizes and no duplicate or invented physical cards.
    const remaining=original.cards.map(get);
    const take=(predicate,label='exact physical source target')=>{
      const at=remaining.findIndex(predicate);
      assert.ok(at>=0,'Missing '+label+' in resolved original rank29 60; related: '+
        remaining.map(card=>card.fullName).filter(name=>
          /Iron Thorns|Double Colorless|Camping Gear|Tropical Beach/.test(name)).join(', '));
      return remaining.splice(at,1)[0];
    };
    player.active.cards.push(take(card=>
      card.fullName==='Iron Thorns ex TWM'));
    if(index===seat){
      for(const printing of [DCE,'Camping Gear BST','Tropical Beach BWP 50'])
        player.hand.cards.push(take(card=>card.fullName===printing,printing));
      while(player.hand.cards.length<7)
        player.hand.cards.push(take(card=>
          !protectedPrintings.has(card.fullName)));
    }else{
      while(player.hand.cards.length<7)
        player.hand.cards.push(take(()=>true));
    }
    player.prizes=Array.from({length:6},()=>{
      const prize=new CardList();
      prize.cards.push(take(card=>index!==seat||
        !protectedPrintings.has(card.fullName)));
      return prize;
    });
    player.deck.cards.push(...remaining);
    assert.equal(player.deck.cards.length,46);
  }
  state.players=players;
  state.activePlayer=seat;
  state.phase=GamePhase.PLAYER_TURN;
  state.turn=5;
  store.state=state;
  const publicPhysicalCount=player=>[
    player.active,...player.bench,player.hand,player.deck,player.discard,
    player.lostzone,player.supporter,player.stadium,
    ...player.prizes
  ].reduce((count,zone)=>count+(zone?.cards?.length??0),0);
  assert.deepEqual(players.map(publicPhysicalCount),[60,60]);
  return {store,owner:players[seat],opponent:players[1-seat],
    seat,publicPhysicalCount};
}

/**
 * Use a real physical Camping Gear Item in a staged pinned Store, then
 * resolve its generated own-deck one-card prompt with the selected policy.
 */
function run(seat,mode){
  const {store,owner,opponent,publicPhysicalCount}=stage(seat);
  const initialOpponentHand=opponent.hand.cards.length;
  const gearIndex=owner.hand.cards.findIndex(card=>
    card.fullName==='Camping Gear BST');
  assert.ok(gearIndex>=0);
  store.dispatch(new PlayCardAction(owner.id,gearIndex,{
    player:PlayerType.ANY,slot:SlotType.BOARD,index:0
  }));
  const prompt=store.state.prompts.find(p=>
    p.constructor?.name==='ChooseCardsPrompt'&&
    p.result===undefined&&p.cards===owner.deck);
  assert.ok(prompt,'Real native own-deck Camping Gear search prompt absent');
  assert.equal(prompt.playerId,owner.id);
  const observed=actorObservation(store.state,seat);
  assert.equal(observed.decisionKind,'owner-prompt');
  assert.equal(observed.ownHand.includes(DCE),true);
  const candidate=mode==='adaptive'?
    chooseRank29TwoPieceCampingSearch(observed,prompt.cards.cards,
      cards=>prompt.validate(cards,store.state)):
    null;
  const selected=mode==='adaptive'?candidate?.physical:
    chooseActualCampingGearCard(prompt,store.state);
  assert.ok(selected,'Missing native-valid prompt selection');
  assert.equal(prompt.validate([selected],store.state),true);
  const before=owner.deck.cards.length;
  store.dispatch(new ResolvePromptAction(prompt.id,[selected]));
  const terminalPrompts=[];
  for(let step=0;step<8 &&
    store.state.activePlayer===seat &&
    store.state.phase===GamePhase.PLAYER_TURN;step++){
    const next=store.state.prompts.find(p=>p.result===undefined);
    if(!next)break;
    const kind=next.constructor?.name;
    assert.ok(['ShuffleDeckPrompt','WaitPrompt'].includes(kind),
      'Unexpected native terminal prompt: '+kind);
    const answer=kind==='ShuffleDeckPrompt'?
      deckPermutation(owner.deck.cards.length,
        seededRandom(0x33a2026+seat)):
      null;
    assert.equal(next.validate(answer,store.state),true);
    terminalPrompts.push(kind);
    store.dispatch(new ResolvePromptAction(next.id,answer));
  }
  assert.equal(owner.hand.cards.includes(selected),true,
    'Physical selected card must reach owner hand');
  assert.equal(owner.deck.cards.includes(selected),false);
  assert.equal(owner.deck.cards.length,before-1);
  assert.equal(opponent.hand.cards.length,initialOpponentHand);
  assert.equal(publicPhysicalCount(owner),60);
  assert.equal(publicPhysicalCount(opponent),60);
  return {selected:selected.fullName,mode,seat,
    ownSearchPromptObserved:true,
    physicalMoved:true,
    nativePhase:store.state.phase,
    nativeTurn:store.state.turn,
    nativeActiveSeat:store.state.activePlayer,
    nativePending:store.state.prompts.filter(p=>p.result===undefined)
      .map(p=>({type:p.constructor?.name,actor:p.playerId,id:p.id})),
    nativePromptQueue:store.promptItems?.map(item=>item.ids?.length)??[],
    terminalPrompts,
    turnEndObserved:store.state.activePlayer!==seat||
      store.state.phase!==GamePhase.PLAYER_TURN};
}

for(const seat of [0,1]){
  test('pinned native Camping Gear fixed-vs-missing-Thunder search seat '+seat,()=>{
    const fixedHook=withNumericShufflePromptValidation(()=>run(seat,'fixed'));
    const adaptiveHook=withNumericShufflePromptValidation(()=>run(seat,'adaptive'));
    const fixed=fixedHook.result;
    const adaptive=adaptiveHook.result;
    assert.ok(fixedHook.audit.rawRejectedCorrected>=1);
    assert.ok(adaptiveHook.audit.rawRejectedCorrected>=1);
    assert.equal(fixed.selected,'Guzma & Hala CEC');
    assert.equal(adaptive.selected,THUNDER);
    assert.equal(fixed.turnEndObserved,true,JSON.stringify(fixed));
    assert.equal(adaptive.turnEndObserved,true,JSON.stringify(adaptive));
  });
}
