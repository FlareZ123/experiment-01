'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {initializeCards}=require('./headless.cjs');
const output=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
/** @param {string} name */
const native=name=>require(path.join(output,name));

/** Assert the two source Stadium answer printings are original rank-5 cards. */
function originalRank5Stadiums(){
  const source=JSON.parse(fs.readFileSync(path.resolve(__dirname,
    '../../results/aichi-2026/full-decklists.json'),'utf8'));
  const deck=source.decks.find(x=>x.rank===5);
  assert.ok(deck);
  assert.equal(deck.cards.reduce((sum,x)=>sum+x.count,0),60);
  for(const [name,set,number] of [
    ['Sky Field','ROS','89'],['Path to the Peak','CRE','148']]){
    const row=deck.cards.find(x=>x.name===name&&
      x.printing.set===set&&x.printing.number===number);
    assert.equal(row?.count,2,'Original rank5 Stadium replacement printing changed');
  }
  return ['Sky Field ROS','Path to the Peak CRE'];
}

/**
 * Source-owned real Stadium replacement and native attack under genuine Store.
 * No natural source 60 setup, search, opposing reply or match qualification.
 * @param {0|1} seat
 * @param {string} stadium
 */
function trial(seat,stadium){
  assert.ok([0,1].includes(seat));
  assert.ok(originalRank5Stadiums().includes(stadium));
  const {Store}=native('game/store/store');
  const {Player}=native('game/store/state/player');
  const {GamePhase}=native('game/store/state/state');
  const {CardType,Format}=native('game/store/card/card-types');
  const {CardList}=native('game/store/state/card-list');
  const {PokemonCardList}=native('game/store/state/pokemon-card-list');
  const {PlayCardAction,PlayerType,SlotType}=
    native('game/store/actions/play-card-action');
  const {CheckProvidedEnergyEffect}=native('game/store/effects/check-effects');
  const {ResolvePromptAction}=native('game/store/actions/resolve-prompt-action');
  const {AttackAction}=native('game/store/actions/game-actions');
  const {StateUtils}=native('game/store/state-utils');
  const cards=initializeCards();
  let id=482000+seat*1000+(stadium.startsWith('Sky')?0:100);
  const card=name=>{
    const c=cards.getCardByName(name);
    assert.ok(c,'Missing exact native source printed card '+name);
    c.id=id++;
    return c;
  };
  const store=new Store({onStateChange(){}}),state=store.state;
  const owner=new Player(),opponent=new Player();
  owner.id=4821;opponent.id=4822;
  owner.name='Original Mew/Genesect';
  opponent.name='Public opposing target';
  state.players=seat===0?[owner,opponent]:[opponent,owner];
  state.activePlayer=seat;
  state.turn=4;
  state.phase=GamePhase.PLAYER_TURN;
  state.gameSettings.format=Format.EXPANDED;
  for(const player of state.players){
    player.prizes=Array.from({length:6},()=>{
      const prize=new CardList();prize.cards.push(card('Psychic Energy MEE'));
      return prize;
    });
    for(let i=0;i<8;i++)player.deck.cards.push(card('Psychic Energy MEE'));
  }
  owner.active.cards.push(card('Mew V FST'),card('Mew VMAX FST'));
  owner.active.pokemonPlayedTurn=1;
  const bench=new PokemonCardList();bench.cards.push(card('Genesect V FST'));
  owner.bench.push(bench);
  const dce=card('Double Colorless Energy SUM');
  owner.active.cards.push(dce);owner.active.energies.cards.push(dce);
  opponent.active.cards.push(card('Shadow Rider Calyrex VMAX CRE'));
  opponent.stadium.cards.push(card('Temple of Sinnoh ASR'));
  owner.hand.cards.push(card(stadium));
  const provides=()=>{
    const effect=new CheckProvidedEnergyEffect(owner);
    store.reduceEffect(state,effect);
    return effect.energyMap.find(x=>x.card===dce)?.provides;
  };
  assert.equal(StateUtils.getStadiumCard(state)?.fullName,'Temple of Sinnoh ASR');
  assert.deepEqual(provides(),[CardType.COLORLESS]);
  const handIndex=owner.hand.cards.findIndex(c=>c.fullName===stadium);
  assert.ok(handIndex>=0);
  store.dispatch(new PlayCardAction(owner.id,handIndex,{
    player:PlayerType.ANY,slot:SlotType.BOARD,index:0
  }));
  assert.equal(StateUtils.getStadiumCard(state)?.fullName,stadium);
  assert.deepEqual(provides(),[CardType.COLORLESS,CardType.COLORLESS]);
  assert.equal(owner.hand.cards.some(c=>c.fullName===stadium),false);
  store.dispatch(new AttackAction(owner.id,'Cross Fusion Strike'));
  let copied=false;
  for(let i=0;i<30;i++){
    const p=state.prompts.find(x=>x.result===undefined);
    if(!p)break;
    if(p.constructor.name==='WaitPrompt'){
      store.dispatch(new ResolvePromptAction(p.id,null));
    }else if(p.constructor.name==='ChooseAttackPrompt'){
      const genesect=p.cards.find(c=>c.fullName==='Genesect V FST');
      assert.ok(genesect);
      const attack=genesect.attacks.find(a=>a.name==='Techno Blast');
      assert.ok(attack);assert.equal(p.validate(attack),true);
      store.dispatch(new ResolvePromptAction(p.id,attack));
      copied=true;
    }else assert.fail('Unexpected native source response prompt '+p.constructor.name);
  }
  assert.equal(copied,true);
  assert.equal(opponent.active.damage,210);
  return {sourceRank:5,sourceSeat:seat,printedStadium:stadium,
    replacedTemple:true,attachedDceCards:1,restoredColorlessUnits:2,
    copiedGenesect:true,settledDamage:opponent.active.damage,
    competitivelyQualified:false};
}
function run(){
  const rows=[];
  for(const stadium of originalRank5Stadiums())for(const seat of [0,1]){
    const row=trial(seat,stadium);
    rows.push(row);
    console.log('AGENT48_RANK5_STADIUM_RESPONSE_NATIVE',JSON.stringify(row));
  }
  assert.equal(rows.length,4);
  return {source:'authentic original rank5 named Stadium printings',
    pin:'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    rows,competitiveQualifiedGames:0};
}
if(require.main===module)process.stdout.write(JSON.stringify(run(),null,2)+'\n');
module.exports={originalRank5Stadiums,trial,run};
