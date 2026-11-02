'use strict';

const assert=require('node:assert/strict');
const test=require('node:test');
const path=require('node:path');
const {stageSourceBunnelbyBoard}=
  require('../simulation/twinleaf/bunnelby-tm-policy-replay.cjs');
const {resolveManifestFile}=
  require('../simulation/twinleaf/resolve-field.cjs');
const {initializeCards}=
  require('../simulation/twinleaf/headless.cjs');

const OUT=path.resolve(__dirname,'../vendor/twinleaf/ptcg-server/output');
/** @param {string} relative @returns {object} */
const native=relative=>require(path.join(OUT,relative));

/**
 * One deliberately conditioned, physical 60-card original rank-2 setup.
 * Source active Bunnelby; source hand G&H plus exactly two discard fillers;
 * complete printed Bench/Evolution chain in searchable deck.
 * @param {0|1} seat
 */
function staged(seat){
  const {fixture:f}=stageSourceBunnelbyBoard();
  const source=resolveManifestFile(path.resolve(__dirname,
    '../results/aichi-2026/full-decklists.json'),{
    allowEquivalentBasicEnergies:true,allowJapanesePromoHooks:true
  }).decks.find(d=>d.rank===2);
  assert.ok(source?.playableUnderEngine);
  const manager=initializeCards();
  const stock=source.cardIds.map((fullName,i)=>{
    const card=manager.getCardByName(fullName);
    assert.ok(card,'Unresolved source card '+fullName);
    card.id=70100+i+seat*1000;
    return card;
  });
  /** @param {string} name @returns {object} */
  const take=name=>{
    const i=stock.findIndex(c=>c.name===name);
    assert.ok(i>=0,'Original source card unavailable '+name);
    return stock.splice(i,1)[0];
  };
  const active=take('Bunnelby');
  const hand=['Guzma & Hala','Tag Call','Stealthy Hood',
    'Plumeria','Faba','Gladion','Karen'].map(take);
  const prizes=['Cassius','Lusamine',"Team Yell's Cheer",
    'Bellelba & Brycen-Man','Peonia','Guzma'].map(take);
  const {CardList}=native('game/store/state/card-list');
  const {GamePhase}=native('game/store/state/state');
  const player=f.attacker,state=f.store.state;
  player.active.cards.length=0;
  player.active.energies.cards.length=0;
  player.active.tools.length=0;
  player.active.cards.push(active);
  player.bench.length=0;
  player.hand.cards.splice(0,player.hand.cards.length,...hand);
  player.deck.cards.splice(0,player.deck.cards.length,...stock);
  player.discard.cards.length=0;
  player.lostzone.cards.length=0;
  player.prizes=prizes.map(card=>{
    const slot=new CardList();
    slot.cards.push(card);
    return slot;
  });
  if(seat===1)state.players=[f.defender,player];
  state.activePlayer=seat;
  state.turn=2;
  state.phase=GamePhase.PLAYER_TURN;
  assert.equal(player.active.getPokemonCard()?.fullName,'Bunnelby PRC');
  const zones=[
    ...player.active.cards,...player.hand.cards,...player.deck.cards,
    ...player.discard.cards,...player.lostzone.cards,
    ...player.prizes.flatMap(z=>z.cards),
    ...player.bench.flatMap(z=>z.cards)
  ];
  assert.equal(zones.length,60);
  assert.deepEqual(zones.map(c=>c.fullName).sort(),source.cardIds.slice().sort(),
    'Each printed source card must occupy exactly one real physical zone');
  return {f,player,state,seat,source};
}

/**
 * Clear only non-discretionary display and shuffle prompts after a native
 * action. Each shuffle is a valid permutation, without changing card supply.
 * @param {object} x Original Store fixture
 */
function settleRoutine(x){
  const {ResolvePromptAction}=native('game/store/actions/resolve-prompt-action');
  const kinds=[];
  for(let n=0;n<40;n++){
    const p=x.state.prompts.find(one=>one.result===undefined);
    if(!p)return kinds;
    const kind=p.constructor.name;
    const result=kind==='ShuffleDeckPrompt'?
      x.player.deck.cards.map((_,i)=>i):
      kind==='WaitPrompt'?null:
      kind==='ShowCardsPrompt'?true:undefined;
    if(result===undefined)throw Error('Unexpected live native prompt '+kind);
    kinds.push(kind);
    x.f.store.dispatch(new ResolvePromptAction(p.id,result));
  }
  assert.fail('Prompt overflow');
}

/** @param {object} x @param {string} name */
function playBoardTrainer(x,name){
  const {PlayCardAction,PlayerType,SlotType}=
    native('game/store/actions/play-card-action');
  const index=x.player.hand.cards.findIndex(card=>card.name===name);
  assert.ok(index>=0,'Missing source hand Trainer '+name);
  x.f.store.dispatch(new PlayCardAction(x.player.id,index,{
    player:PlayerType.ANY,slot:SlotType.BOARD,index:0
  }));
}

/** @param {object} x @param {string[]} names */
function resolveNamedDeckPrompt(x,names){
  const {ResolvePromptAction}=native('game/store/actions/resolve-prompt-action');
  const prompt=x.state.prompts.find(p=>p.result===undefined);
  assert.equal(prompt?.constructor.name,'ChooseCardsPrompt');
  assert.equal(prompt.cards,x.player.deck);
  const selected=names.map(name=>{
    const card=x.player.deck.cards.find(c=>c.fullName===name);
    assert.ok(card,'Missing searchable original '+name);
    return card;
  });
  assert.equal(prompt.validate(selected,x.state),true,
    'Printed choices rejected by native Store');
  x.f.store.dispatch(new ResolvePromptAction(prompt.id,selected));
}

/** @param {object} x */
function resolveGuzmaThreeChannels(x){
  const {ResolvePromptAction}=native('game/store/actions/resolve-prompt-action');
  playBoardTrainer(x,'Guzma & Hala');
  let prompt=x.state.prompts.find(p=>p.result===undefined);
  assert.equal(prompt?.constructor.name,'SelectOptionPrompt');
  x.f.store.dispatch(new ResolvePromptAction(prompt.id,1));
  prompt=x.state.prompts.find(p=>p.result===undefined);
  assert.equal(prompt?.constructor.name,'ChooseCardsPrompt');
  assert.equal(prompt.cards,x.player.hand);
  const discards=['Plumeria BUS','Faba LOT'].map(name=>{
    const card=x.player.hand.cards.find(c=>c.fullName===name);
    assert.ok(card);
    return card;
  });
  assert.equal(prompt.validate(discards,x.state),true);
  x.f.store.dispatch(new ResolvePromptAction(prompt.id,discards));
  resolveNamedDeckPrompt(x,[
    'Artazon PAL','Technical Machine: Evolution PAR','Capture Energy RCL'
  ]);
  const auxiliary=settleRoutine(x);
  assert.equal(x.player.supporterTurn>0,true);
  assert.ok(discards.every(c=>x.player.discard.cards.includes(c)));
  for(const name of ['Artazon PAL','Technical Machine: Evolution PAR',
    'Capture Energy RCL']){
    assert.ok(x.player.hand.cards.some(c=>c.fullName===name));
  }
  return auxiliary;
}

/** @param {object} x @param {string} basic */
function resolveBasicSearch(x,basic){
  const prompt=x.state.prompts.find(p=>p.result===undefined);
  assert.equal(prompt?.constructor.name,'ChooseCardsPrompt',
    'Both Artazon and Capture must offer native Basic search');
  assert.equal(prompt.cards,x.player.deck);
  const card=x.player.deck.cards.find(c=>c.fullName===basic);
  assert.ok(card,'Original source Basic unavailable '+basic);
  const {ResolvePromptAction}=native('game/store/actions/resolve-prompt-action');
  assert.equal(prompt.validate([card],x.state),true);
  x.f.store.dispatch(new ResolvePromptAction(prompt.id,[card]));
  return settleRoutine(x);
}

for(const seat of [0,1]){
  test('original rank2 GH Artazon Capture genuine source cards, seat '+seat,()=>{
    const x=staged(seat);
    const stages={};
    stages.gh=resolveGuzmaThreeChannels(x);
    playBoardTrainer(x,'Artazon');
    stages.stadium=settleRoutine(x);
    assert.ok(x.player.stadium.cards.some(c=>c.fullName==='Artazon PAL'),
      'Original Artazon must enter real Stadium zone');
    const {UseStadiumAction}=
      native('game/store/actions/game-actions');
    x.f.store.dispatch(new UseStadiumAction(x.player.id));
    stages.artazon=resolveBasicSearch(x,'Oddish UNB');
    assert.deepEqual(x.player.bench.map(b=>b.getPokemonCard()?.fullName),
      ['Oddish UNB']);
    const {PlayCardAction,PlayerType,SlotType}=
      native('game/store/actions/play-card-action');
    const capture=x.player.hand.cards.findIndex(c=>
      c.fullName==='Capture Energy RCL');
    assert.ok(capture>=0);
    x.f.store.dispatch(new PlayCardAction(x.player.id,capture,{
      player:PlayerType.BOTTOM_PLAYER,slot:SlotType.ACTIVE,index:0
    }));
    stages.capture=resolveBasicSearch(x,'Pidgey MEW');
    assert.deepEqual(x.player.bench.map(b=>b.getPokemonCard()?.fullName),
      ['Oddish UNB','Pidgey MEW']);
    assert.deepEqual(x.player.active.energies.cards.map(c=>c.fullName),
      ['Capture Energy RCL']);
    assert.equal(x.state.activePlayer,seat);
    assert.equal(x.f.store.hasPrompts(),false);
    console.log('AGENT7_NATIVE_GH_ARTAZON_CAPTURE',JSON.stringify({
      seat,sourceRank:2,sourcePhysicalCards:60,
      sourceSupporter:'Guzma & Hala CEC',
      searched:['Artazon PAL','Technical Machine: Evolution PAR',
        'Capture Energy RCL'],
      realBench:x.player.bench.map(b=>b.getPokemonCard()?.fullName),
      realActiveEnergy:x.player.active.energies.cards.map(c=>c.fullName),
      prompts:stages,competitivelyQualifiedGames:0
    }));
  });
}
