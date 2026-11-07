'use strict';

const assert=require('node:assert/strict');
const test=require('node:test');
const path=require('node:path');
const {initializeCards}=require('../simulation/twinleaf/headless.cjs');
const {nativeSinglePokemonChoices}=
  require('../simulation/twinleaf/agent8-actor-only-choose-pokemon.cjs');

const ROOT=path.resolve(__dirname,'../vendor/twinleaf/ptcg-server/output');
/** @param {string} name @returns {any} */
const native=name=>require(path.join(ROOT,name));

/**
 * Deliberately staged original physical card sequence, rather than an
 * authentic shuffled 60, naturally drawn hand or competitive full match.
 * All consequential effects are the real pinned Store and printed cards.
 * @param {0|1} seat
 * @param {'Energy Retrieval SVI'|'Night Stretcher SFA'} itemName
 */
function fixture(seat,itemName){
  const {Store}=native('game/store/store');
  const {State,GamePhase}=native('game/store/state/state');
  const {Player}=native('game/store/state/player');
  const {CardList}=native('game/store/state/card-list');
  const {PokemonCardList}=native('game/store/state/pokemon-card-list');
  const {GameSettings}=native('game/core/game-settings');
  const {Format}=native('game/store/card/card-types');
  const manager=initializeCards();
  let id=850000+(10000*seat)+(itemName==='Night Stretcher SFA'?1000:0);
  /** @param {string} printing @returns {object} */
  const card=printing=>{
    const value=manager.getCardByName(printing);
    assert.ok(value,'Printed native card unregistered: '+printing);
    value.id=id++;
    return value;
  };
  const owner=new Player(),opponent=new Player();
  owner.id=311;opponent.id=522;
  owner.name='OriginalActor';
  opponent.name='OriginalOpponent';
  const box=card('Secret Box TWM');
  const vip1=card('Battle VIP Pass FST');
  const vip2=card('Battle VIP Pass FST');
  const carrier=card('Rescue Carrier EVS');
  owner.hand.cards.push(box,vip1,vip2,carrier);
  const unown=card('Unown AOR');
  owner.active.cards.push(unown);
  const target=card('Trubbish FST');
  opponent.active.cards.push(target);
  opponent.active.damage=60;
  opponent.bench.push(new PokemonCardList());
  opponent.bench[0].cards.push(card('Lunatone OBF'));
  const item=card(itemName);
  owner.deck.cards.push(item);
  const basic1=card('Psychic Energy MEE');
  const basic2=card('Psychic Energy MEE');
  owner.discard.cards.push(basic1,basic2);
  for(const p of [owner,opponent]){
    for(let i=0;i<10;i++)p.deck.cards.push(card('Lightning Energy SVE'));
    for(let i=0;i<6;i++){
      const slot=new CardList();
      slot.cards.push(card('Lightning Energy SVE'));
      p.prizes.push(slot);
    }
  }
  const settings=new GameSettings();
  settings.format=Format.EXPANDED;
  const state=new State();
  state.gameSettings=settings;
  state.rules=settings.rules;
  state.turn=14;
  state.phase=GamePhase.PLAYER_TURN;
  state.activePlayer=seat;
  state.players=seat===0?[owner,opponent]:[opponent,owner];
  const store=new Store({onStateChange(){}});
  store.state=state;
  return {seat,itemName,store,state,owner,opponent,box,vip1,vip2,
    carrier,unown,target,item,basic1,basic2};
}

/** @param {object} state @returns {any|null} */
const pending=state=>state.prompts.find(p=>p.result===undefined)??null;

/**
 * Real engine's informational, forced-prize and forced-promotion prompts.
 * No hypothetical or strategic hidden-card targeting is claimed here.
 * @param {object} f
 * @param {boolean} [afterAttack]
 */
function finishPrompts(f,afterAttack=false){
  const {ResolvePromptAction}=
    native('game/store/actions/resolve-prompt-action');
  for(let i=0;i<36;i++){
    const p=pending(f.state);
    if(!p)return;
    const kind=p.constructor.name;
    if(kind==='ShowCardsPrompt'){
      assert.equal(p.playerId,f.opponent.id);
      f.store.dispatch(new ResolvePromptAction(p.id,true));
    }else if(kind==='ShuffleDeckPrompt'){
      const owner=f.state.players.find(x=>x.id===p.playerId);
      assert.ok(owner);
      const order=owner.deck.cards.map((_,i)=>i);
      assert.equal(p.validate(order,f.state),true);
      f.store.dispatch(new ResolvePromptAction(p.id,order));
    }else if(kind==='WaitPrompt'){
      f.store.dispatch(new ResolvePromptAction(p.id,null));
    }else if(afterAttack&&kind==='ChoosePrizePrompt'){
      assert.equal(p.playerId,f.owner.id);
      const selections=f.owner.prizes.filter(x=>x.cards.length>0)
        .slice(0,p.options.count);
      assert.equal(p.validate(selections,f.state),true);
      f.store.dispatch(new ResolvePromptAction(p.id,selections));
    }else if(afterAttack&&kind==='ChoosePokemonPrompt'){
      const available=nativeSinglePokemonChoices(f.state,p);
      assert.equal(available.length,1,
        'KO promotion must have one genuine original Bench candidate');
      f.store.dispatch(new ResolvePromptAction(p.id,[available[0].physical]));
    }else{
      assert.fail('Unexpected native Combo prompt '+kind);
    }
  }
  assert.fail('Native Box recovery combo prompt chain did not terminate');
}

/** @param {0|1} seat @param {'Energy Retrieval SVI'|'Night Stretcher SFA'} itemName */
function run(seat,itemName){
  const f=fixture(seat,itemName);
  const {PlayCardAction,PlayerType,SlotType}=
    native('game/store/actions/play-card-action');
  const {ResolvePromptAction}=
    native('game/store/actions/resolve-prompt-action');
  const {AttackAction}=native('game/store/actions/game-actions');
  const pay=[f.vip1,f.vip2,f.carrier];
  const initialOwnerPrizeCount=f.owner.prizes.length;
  const initialOppPrizeCount=f.opponent.prizes.length;
  const initialDeckCount=f.owner.deck.cards.length;
  f.store.dispatch(new PlayCardAction(f.owner.id,0,{
    player:PlayerType.ANY,slot:SlotType.BOARD,index:0
  }));
  let p=pending(f.state);
  assert.equal(p?.constructor.name,'ChooseCardsPrompt');
  assert.equal(p.message,'CHOOSE_CARD_TO_DISCARD');
  assert.equal(p.playerId,f.owner.id);
  assert.equal(p.options.min,3);
  assert.equal(p.options.max,3);
  assert.equal(p.validate(pay,f.state),true);
  f.store.dispatch(new ResolvePromptAction(p.id,pay));
  for(const paid of pay) assert.ok(f.owner.discard.cards.includes(paid));
  p=pending(f.state);
  assert.equal(p?.constructor.name,'ChooseCardsPrompt');
  assert.equal(p.message,'CHOOSE_CARD_TO_HAND');
  assert.strictEqual(p.cards,f.owner.deck);
  assert.equal(p.playerId,f.owner.id);
  assert.equal(p.validate([f.item],f.state),true);
  f.store.dispatch(new ResolvePromptAction(p.id,[f.item]));
  finishPrompts(f);
  assert.ok(f.owner.hand.cards.includes(f.item));
  assert.ok(f.owner.discard.cards.includes(f.box));
  assert.equal(f.owner.deck.cards.includes(f.item),false);
  assert.equal(f.owner.deck.cards.length,initialDeckCount-1);
  assert.ok(f.item.canPlay(f.store,f.state,f.owner));
  f.store.dispatch(new PlayCardAction(f.owner.id,
    f.owner.hand.cards.indexOf(f.item),{
      player:PlayerType.ANY,slot:SlotType.BOARD,index:0
    }));
  p=pending(f.state);
  assert.equal(p?.constructor.name,'ChooseCardsPrompt');
  assert.equal(p.message,'CHOOSE_CARD_TO_HAND');
  assert.equal(p.playerId,f.owner.id);
  assert.strictEqual(p.cards,f.owner.discard);
  assert.equal(p.validate([f.basic1],f.state),true);
  f.store.dispatch(new ResolvePromptAction(p.id,[f.basic1]));
  finishPrompts(f);
  assert.ok(f.owner.hand.cards.includes(f.basic1));
  assert.ok(f.owner.discard.cards.includes(f.basic2));
  assert.ok(f.owner.discard.cards.includes(f.item));
  assert.equal(f.owner.supporter.cards.includes(f.item),false);
  const index=f.owner.hand.cards.indexOf(f.basic1);
  assert.ok(index>=0);
  f.store.dispatch(new PlayCardAction(f.owner.id,index,{
    player:PlayerType.ANY,slot:SlotType.ACTIVE,index:0
  }));
  assert.ok(f.owner.active.energies.cards.includes(f.basic1));
  assert.equal(f.owner.active.getPokemonCard(),f.unown);
  const beforeAttackPrizes=f.owner.prizes.reduce((n,x)=>n+x.cards.length,0);
  assert.equal(beforeAttackPrizes,initialOwnerPrizeCount);
  f.store.dispatch(new AttackAction(f.owner.id,'Hidden Power'));
  finishPrompts(f,true);
  assert.ok(f.opponent.discard.cards.includes(f.target),
    'Original Trubbish must be actually KO by attack damage');
  assert.equal(f.opponent.active.getPokemonCard()?.name,'Lunatone',
    'Real opponent Bench must promote after first KO');
  const afterPrizes=f.owner.prizes.reduce((n,x)=>n+x.cards.length,0);
  assert.equal(afterPrizes,beforeAttackPrizes-1);
  assert.equal(f.opponent.prizes.reduce((n,x)=>n+x.cards.length,0),
    initialOppPrizeCount);
  console.log('AGENT21_NATIVE_BOX_SALVAGE_KO',JSON.stringify({
    seat,itemName,paidPhysicalIds:pay.map(x=>x.id),
    itemPhysicalId:f.item.id,recoveredBasicPhysicalId:f.basic1.id,
    attackerPhysicalId:f.unown.id,knockedOutPhysicalId:f.target.id,
    initialOwnPrizeCount:beforeAttackPrizes,finalOwnPrizeCount:afterPrizes,
    remainingOwnerDeckCount:f.owner.deck.cards.length,
    sourceHistoricalMatch:false,competitivelyQualifiedGames:0
  }));
}
for(const seat of [0,1]){
  for(const item of ['Energy Retrieval SVI','Night Stretcher SFA']){
    test('pinned full physical Box -> '+item+' -> Basic -> Unown KO -> Prize in actor seat '+seat,
      ()=>run(seat,item));
  }
}
