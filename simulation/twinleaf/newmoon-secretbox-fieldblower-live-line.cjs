'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const {initializeCards}=require('./headless.cjs');
const output=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
/** @param {string} name */
const load=name=>require(path.join(output,name));

/**
 * Entire staged real-Store line: 3 printed cards paid to Secret Box,
 * a legal Item/Tool/Supporter/Stadium search, then the searched
 * Field Blower removing a publicly equipped Garbodor Tool.
 * This does not establish genuine source-deal access or a strong bot.
 */
function run(){
  const manager=initializeCards();
  let nextId=1;
  /** @param {string} name */
  const card=name=>{
    const c=manager.getCardByName(name);
    assert.ok(c,'Missing pinned card: '+name);
    c.id=nextId++;
    return c;
  };
  const {Store}=load('game/store/store');
  const {Player}=load('game/store/state/player');
  const {CardList}=load('game/store/state/card-list');
  const {PokemonCardList}=load('game/store/state/pokemon-card-list');
  const {GamePhase}=load('game/store/state/state');
  const {Format}=load('game/store/card/card-types');
  const {PlayCardAction,PlayerType,SlotType}=
    load('game/store/actions/play-card-action');
  const {ResolvePromptAction}=load('game/store/actions/resolve-prompt-action');
  const {CheckPokemonPowersEffect}=load('game/store/effects/check-effects');
  const {IS_ABILITY_BLOCKED}=load('game/store/prefabs/prefabs');
  const store=new Store({onStateChange(){}});
  const state=store.state;
  state.phase=GamePhase.PLAYER_TURN;
  state.turn=4;
  state.activePlayer=1;
  state.gameSettings.format=Format.EXPANDED;
  const opponent=new Player(),mine=new Player();
  opponent.id=101;mine.id=202;
  opponent.name='conditioned rank11 tooled-Garbodor board';
  mine.name='fixed New Moon printed resource classes';
  state.players=[opponent,mine];
  opponent.active.cards.push(card('Pidgey MEW'));
  const garbage=new PokemonCardList();
  garbage.cards.push(card('Trubbish BKP'),card('Garbodor BKP'));
  const float=card('Float Stone BKT');
  garbage.tools.push(float);
  opponent.bench.push(garbage);
  const mew=card('Mewtwo & Mew-GX UNM');
  mine.active.cards.push(mew);
  const energy=card('Psychic Energy SVE');
  mine.active.cards.push(energy);
  mine.active.energies.cards.push(energy);
  for(const p of state.players){
    for(let i=0;i<6;i++){
      const prize=new CardList();
      prize.cards.push(card('Psychic Energy SVE'));
      p.prizes.push(prize);
    }
    p.deck.cards.push(card('Psychic Energy SVE'));
  }
  const box=card('Secret Box TWM');
  const payments=[card('Battle VIP Pass FST'),
    card('Canceling Cologne ASR'),card('Ace Trainer AOR')];
  mine.hand.cards.push(box,...payments);
  const blower=card('Field Blower GRI');
  const chosen=[blower,card('Powerglass SFA'),
    card("Lillie's Determination M1L"),card('Sky Field ROS')];
  mine.deck.cards.push(...chosen);
  const pending=()=>state.prompts.find(p=>p.result===undefined);
  /** @param {object} prompt @param {unknown} selected */
  const select=(prompt,selected)=>{
    assert.equal(prompt.validate(selected,state),true,
      'Invalid '+prompt.constructor.name+' selection');
    store.dispatch(new ResolvePromptAction(prompt.id,selected));
  };
  const ability=()=>{
    const e=new CheckPokemonPowersEffect(mine,mew);
    store.reduceEffect(state,e);
    return {visible:e.powers.some(x=>x.name==='Perfection'),
      blocked:IS_ABILITY_BLOCKED(store,state,mine,mew)};
  };
  const initial={
    hand:mine.hand.cards.map(c=>c.fullName),
    unprizedSearchTargets:chosen.map(c=>c.fullName),
    garboTools:garbage.tools.map(c=>c.fullName),
    perfection:ability(),
    threeCardCostAccepted:box.canPlay(store,state,mine),
    twoCardCostRejected:!box.canPlay(store,state,{
      hand:{cards:[box,payments[0],payments[1]]}
    })
  };
  assert.equal(initial.perfection.visible,false);
  assert.equal(initial.threeCardCostAccepted,true);
  assert.equal(initial.twoCardCostRejected,true);
  const trace=[];
  store.dispatch(new PlayCardAction(mine.id,mine.hand.cards.indexOf(box),{
    player:PlayerType.ANY,slot:SlotType.BOARD,index:0
  }));
  let p=pending();
  assert.equal(p?.constructor.name,'ChooseCardsPrompt',
    'Secret Box must request three discard cards');
  assert.equal(p.options.min,3);
  assert.equal(p.options.max,3);
  assert.equal(p.cards.cards.length,3);
  trace.push({prompt:'three-discard',chosen:payments.map(x=>x.fullName),
    handTempNotOriginal:p.cards!==mine.hand});
  select(p,payments);
  assert.ok(payments.every(x=>mine.discard.cards.includes(x)),
    'Paid cards must all be in discard');
  p=pending();
  assert.equal(p?.constructor.name,'ChooseCardsPrompt',
    'Secret Box must open deck Trainer-category search');
  assert.equal(p.cards,mine.deck,'Search must legally inspect own deck');
  assert.equal(p.options.maxItems,1);
  assert.equal(p.options.maxTools,1);
  assert.equal(p.options.maxSupporters,1);
  assert.equal(p.options.maxStadiums,1);
  trace.push({prompt:'four-category-search',chosen:chosen.map(x=>x.fullName),
    max:p.options.max});
  select(p,chosen);
  assert.ok(chosen.every(x=>mine.hand.cards.includes(x)),
    'All four selected printed Trainer classes must enter hand');
  for(let i=0;i<8;i++){
    p=pending();
    if(!p)break;
    trace.push({prompt:p.constructor.name});
    if(p.constructor.name==='ShowCardsPrompt'){
      select(p,true);
    }else if(p.constructor.name==='WaitPrompt'){
      select(p,null);
    }else if(p.constructor.name==='ShuffleDeckPrompt'){
      select(p,Array.from({length:mine.deck.cards.length},(_,j)=>j));
    }else{
      assert.fail('Unexpected pending postsearch prompt: '+p.constructor.name);
    }
  }
  assert.equal(pending(),undefined,'Unresolved Box continuation');
  const afterSearch={
    hand:mine.hand.cards.map(c=>c.fullName),
    paymentsInDiscard:payments.every(x=>mine.discard.cards.includes(x)),
    searchPickedAllFour:chosen.every(x=>mine.hand.cards.includes(x)),
    toolStillOnGarbodor:garbage.tools.includes(float),
    perfection:ability()
  };
  assert.equal(afterSearch.perfection.visible,false,
    'Search itself should not turn off Garbotoxin');

  store.dispatch(new PlayCardAction(mine.id,mine.hand.cards.indexOf(blower),{
    player:PlayerType.ANY,slot:SlotType.BOARD,index:0
  }));
  p=pending();
  assert.equal(p?.constructor.name,'ChoosePokemonPrompt');
  trace.push({prompt:'Field Blower target',chosen:['Garbodor BKP']});
  select(p,[garbage]);
  assert.equal(pending(),undefined,'Blower left unexpected pending prompt');
  assert.equal(garbage.tools.includes(float),false);
  assert.ok(opponent.discard.cards.includes(float));
  const afterBlower={
    garboTools:garbage.tools.map(x=>x.fullName),
    floatStoneDiscarded:opponent.discard.cards.includes(float),
    fieldBlowerDiscarded:mine.discard.cards.includes(blower),
    perfection:ability()
  };
  assert.equal(afterBlower.perfection.visible,true);
  return {
    schema:'newmoon-secretbox-fieldblower-real-store-chain-v1',
    pinnedEngine:'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    qualification:'Staged legal printed Trainer actions on a conditioned board. The three disposable cards and search targets were planted; no source-dealt owner-hand event or copied attack has been established.',
    initial,trace,afterSearch,afterBlower,
    qualifiedForCompetitiveInference:false
  };
}
if(require.main===module)process.stdout.write(JSON.stringify(run(),null,2)+'\n');
module.exports={run};
