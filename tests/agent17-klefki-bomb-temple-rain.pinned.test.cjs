'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {initializeCards}=require('../simulation/twinleaf/headless.cjs');
const {installElectrodeGXEnergyHook}=
  require('../simulation/twinleaf/electrode-gx-energy-hook.cjs');
const {installElectroRainDamageHook}=
  require('../simulation/twinleaf/electro-rain-damage-hook.cjs');

const root=path.resolve(__dirname,'../vendor/twinleaf/ptcg-server/output');
/** @param {string} name @returns {any} */
const native=name=>require(path.join(root,name));

/**
 * Conditional midgame source-rank4 board. Every non-basic card here is
 * contained by exact original rank4 or fixed Temple-v1 identities.
 * This is a staged physical state and cannot establish game reachability.
 * @param {0|1} seat Physical seat occupied by Raichu source.
 */
function makeBoard(seat){
  const {Store}=native('game/store/store');
  const {State,GamePhase}=native('game/store/state/state');
  const {Player}=native('game/store/state/player');
  const {PokemonCardList}=native('game/store/state/pokemon-card-list');
  const {CardList}=native('game/store/state/card-list');
  const {Format}=native('game/store/card/card-types');
  const manager=initializeCards();
  let serial=1700000+seat*1000;
  const card=name=>{
    const value=manager.getCardByName(name);
    assert.ok(value,'Unavailable printed card: '+name);
    value.id=serial++;
    return value;
  };
  const source=new Player(),opponent=new Player();
  source.id=171;opponent.id=172;
  source.name='rank4 Raichu original';
  opponent.name='fixed Temple v1';
  source.active.cards.push(card('Klefki SVI'));
  source.active.tools.push(card('U-Turn Board UNM'));
  const raichu=new PokemonCardList();
  raichu.cards.push(card('Pikachu LOR'),card('Alolan Raichu UNM'));
  source.bench.push(raichu);
  const electrode=new PokemonCardList();
  electrode.cards.push(card('Voltorb ROS'),card('Electrode-GX CES'));
  source.bench.push(electrode);
  opponent.active.cards.push(card('Wobbuffet PHF'));
  const target=new PokemonCardList();
  target.cards.push(card('Shadow Rider Calyrex V CRE'));
  opponent.bench.push(target);
  opponent.stadium.cards.push(card('Temple of Sinnoh ASR'));
  source.hand.cards.push(card('Sky Field ROS'));
  const energies=[
    'Reversal Energy PAL','Counter Energy CIN','Unit Energy LPM UPR',
    'Reversal Energy PAL','Counter Energy CIN'
  ].map(card);
  source.discard.cards.push(...energies);
  for(const player of [source,opponent]){
    player.deck.cards.push(card('Psychic Energy SVE'));
    for(let i=0;i<6;i++){
      const prize=new CardList();
      prize.cards.push(card('Psychic Energy SVE'));
      player.prizes.push(prize);
    }
  }
  const state=new State();
  state.players=seat===0?[source,opponent]:[opponent,source];
  state.phase=GamePhase.PLAYER_TURN;
  state.activePlayer=seat;
  state.turn=4;
  state.gameSettings.format=Format.EXPANDED;
  const store=new Store({onStateChange(){}});
  store.state=state;
  return {store,state,source,opponent,raichu,target,energies,electrode};
}

/** @param {ReturnType<typeof makeBoard>} f @returns {any[]} */
function provided(f){
  const {CheckProvidedEnergyEffect}=native('game/store/effects/check-effects');
  const checked=new CheckProvidedEnergyEffect(f.source,f.raichu);
  f.store.reduceEffect(f.state,checked);
  return checked.energyMap.map(row=>({name:row.card.name,provides:row.provides}));
}

/**
 * Resolve the selected native Store phase without changing its board.
 * @param {ReturnType<typeof makeBoard>} f
 * @param {'bomb'|'rain'} phase
 * @returns {object[]}
 */
function drain(f,phase){
  const {ResolvePromptAction}=native('game/store/actions/resolve-prompt-action');
  const {PlayerType,SlotType}=native('game/store/actions/play-card-action');
  const events=[];
  for(let i=0;i<40;i++){
    const prompt=f.state.prompts.find(row=>row.result===undefined);
    if(!prompt)break;
    const kind=prompt.constructor.name;
    let selection;
    if(kind==='WaitPrompt')selection=null;
    else if(kind==='AttachEnergyPrompt' && phase==='bomb'){
      selection=f.energies.map(card=>({card,to:{
        player:PlayerType.BOTTOM_PLAYER,slot:SlotType.BENCH,index:0
      }}));
    }else if(kind==='ChooseCardsPrompt' && phase==='rain'){
      selection=f.energies.slice();
    }else if(kind==='PutDamagePrompt' && phase==='rain'){
      selection=[{target:{
        player:PlayerType.TOP_PLAYER,slot:SlotType.BENCH,index:0
      },damage:prompt.damage}];
    }else if(kind==='ShuffleDeckPrompt'){
      const owner=f.state.players.find(p=>p.id===prompt.playerId)||f.source;
      selection=owner.deck.cards.map((_card,index)=>index);
    }else if(kind==='ChoosePrizePrompt'){
      const owner=f.state.players.find(p=>p.id===prompt.playerId);
      assert.ok(owner,'Prize owner required');
      selection=owner.prizes.filter(prize=>prize.cards.length).slice(0,prompt.options.count);
    }else throw Error('Unexpected '+phase+' prompt: '+kind);
    if(['AttachEnergyPrompt','ChooseCardsPrompt','PutDamagePrompt'].includes(kind)){
      assert.equal(prompt.validate(selection,f.state),true,
        'Printed phase payment rejected '+phase+'/'+kind);
    }
    events.push({kind,amount:Array.isArray(selection)?selection.length:0,
      damage:prompt.damage??null});
    f.store.dispatch(new ResolvePromptAction(prompt.id,selection));
  }
  assert.ok(!f.state.prompts.some(prompt=>prompt.result===undefined),
    'All '+phase+' prompts must finish');
  return events;
}

/** @param {0|1} seat */
function run(seat){
  const field=JSON.parse(fs.readFileSync(path.resolve(__dirname,
    '../results/aichi-2026/full-decklists.json'),'utf8'));
  const rank4=field.decks.find(row=>row.rank===4);
  const required=[
    ['Klefki',1],['U-Turn Board',1],['Electrode-GX',3],
    ['Alolan Raichu',2],['Sky Field',3],['Reversal Energy',4],
    ['Counter Energy',4],['Unit Energy LPM',4]
  ];
  for(const [name,min] of required)assert.ok(rank4.cards.some(
    row=>row.name===name&&row.count>=min),'Exact rank4 inventory: '+name);

  const restoreBomb=installElectrodeGXEnergyHook();
  const restoreRain=installElectroRainDamageHook();
  try{
    const f=makeBoard(seat);
    const {UseAbilityAction,RetreatAction,AttackAction}=
      native('game/store/actions/game-actions');
    const {PlayCardAction,PlayerType,SlotType}=
      native('game/store/actions/play-card-action');
    const {CardType}=native('game/store/card/card-types');
    const {CheckPokemonPowersEffect}=native('game/store/effects/check-effects');
    const {StateUtils}=native('game/store/state-utils');
    const first=new CheckPokemonPowersEffect(f.source,
      f.electrode.getPokemonCard());
    f.store.reduceEffect(f.state,first);
    assert.ok(first.powers.some(power=>power.name==='Extra Energy Bomb'),
      'Active Klefki must release Stage1 Electrode despite Active Wobbuffet');
    assert.equal(StateUtils.getStadiumCard(f.state)?.fullName,
      'Temple of Sinnoh ASR');
    const before=provided(f);
    assert.ok(before.length===0);
    const prizeBefore=f.opponent.getPrizeLeft();
    f.store.dispatch(new UseAbilityAction(f.source.id,'Extra Energy Bomb',{
      player:PlayerType.BOTTOM_PLAYER,slot:SlotType.BENCH,index:1
    }));
    const bombPrompts=drain(f,'bomb');
    assert.equal(f.opponent.getPrizeLeft(),prizeBefore-2);
    assert.ok(f.source.discard.cards.some(c=>c.fullName==='Electrode-GX CES'));
    assert.equal(f.raichu.energies.cards.length,5);
    assert.equal(f.source.active.getPokemonCard().fullName,'Klefki SVI');
    assert.equal(f.opponent.active.getPokemonCard().fullName,'Wobbuffet PHF');
    assert.ok(provided(f).every(row=>
      row.provides.every(n=>n!==CardType.LIGHTNING)),
      'While Temple is active Special Energy must not furnish Lightning');
    const stadiumIndex=f.source.hand.cards.findIndex(c=>c.fullName==='Sky Field ROS');
    assert.ok(stadiumIndex>=0);
    f.store.dispatch(new PlayCardAction(f.source.id,stadiumIndex,{
      player:PlayerType.ANY,slot:SlotType.BOARD,index:0
    }));
    assert.equal(StateUtils.getStadiumCard(f.state)?.fullName,'Sky Field ROS');
    f.store.dispatch(new RetreatAction(f.source.id,0));
    assert.equal(f.source.active.getPokemonCard()?.fullName,'Alolan Raichu UNM',
      'Original Klefki U-Turn Board should give free retreat to funded Raichu');
    assert.equal(f.opponent.active.getPokemonCard()?.fullName,'Wobbuffet PHF');
    const sourcePrizeBefore=f.source.getPrizeLeft();
    const energyMap=provided(f);
    assert.ok(energyMap.some(row=>row.provides.includes(CardType.LIGHTNING)),
      'Stadium removal must restore non-Colorless Energy');
    f.store.dispatch(new AttackAction(f.source.id,'Electro Rain'));
    const rainPrompts=drain(f,'rain');
    assert.ok(rainPrompts.some(row=>row.kind==='PutDamagePrompt'));
    assert.ok(f.target.damage>=210,
      'Native attack should KO opposing Benched 210 HP Shadow Rider V');
    assert.equal(f.source.getPrizeLeft(),sourcePrizeBefore-2);
    assert.equal(f.opponent.active.getPokemonCard()?.fullName,'Wobbuffet PHF');
    return {seat,stageOnly:true,
      ownPrintedOriginalRank:4,otherFixedCandidate:'Temple v1',
      bombPrompts,rainPrompts,
      energyDiscardedByRain: f.energies.every(card=>
        f.source.discard.cards.includes(card)),
      attackDamage:f.target.damage,
      sourcePrizesTaken:sourcePrizeBefore-f.source.getPrizeLeft(),
      opponentPrizesTaken:prizeBefore-f.opponent.getPrizeLeft(),
      opponentActiveAfter:'Wobbuffet PHF',
      status:'CONDITIONAL_NATIVE_STORE_CHAIN_NOT_NATURAL_GAME',
      competitivelyQualifiedGames:0};
  }finally{
    restoreRain();
    restoreBomb();
  }
}

test('both seats: source Klefki releases Bomb -> Sky Field -> U-Turn retreat -> Electro Rain with opposing Active Wobbuffet unchanged',()=>{
  const rows=[run(0),run(1)];
  for(const row of rows){
    assert.equal(row.sourcePrizesTaken,2);
    assert.equal(row.opponentPrizesTaken,2);
    assert.equal(row.competitivelyQualifiedGames,0);
  }
  console.log('AGENT17_KLEFKI_BOMB_RAIN_NATIVE',JSON.stringify(rows));
});
