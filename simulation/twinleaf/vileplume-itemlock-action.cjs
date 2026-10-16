'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const {initializeCards}=require('./headless.cjs');
const output=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
const load=modulePath=>require(path.join(output,modulePath));

/**
 * Check whether a real PlayCardAction for the universally familiar Switch
 * Item is blocked by the rank-2 AOR Vileplume's Irritating Pollen, from
 * either player's turn, using an otherwise identical playable-board control.
 * @param {{activeSeat:0|1,vileplume:boolean}} options
 */
function probeSwitch(options) {
  const manager=initializeCards();
  const {Store}=load('game/store/store');
  const {Player}=load('game/store/state/player');
  const {PokemonCardList}=load('game/store/state/pokemon-card-list');
  const {CardList}=load('game/store/state/card-list');
  const {GamePhase}=load('game/store/state/state');
  const {Format}=load('game/store/card/card-types');
  const {PlayCardAction,PlayerType,SlotType}=
    load('game/store/actions/play-card-action');

  /** @param {string} name */
  const card=name=>{
    const found=manager.getCardByName(name);
    assert.ok(found,'Pinned source printing missing: '+name);
    return found;
  };
  const store=new Store({onStateChange() {}});
  const state=store.state;
  const owner=new Player(),opponent=new Player();
  owner.id=101;owner.name='Aichi rank-2';
  opponent.id=202;opponent.name='Opponent';
  state.players=[owner,opponent];
  state.gameSettings.format=Format.EXPANDED;
  state.phase=GamePhase.PLAYER_TURN;
  state.turn=4;
  state.activePlayer=options.activeSeat;

  owner.active.cards.push(card('Bunnelby PRC'));
  opponent.active.cards.push(card('Shadow Rider Calyrex V CRE'));
  const ownerBench=new PokemonCardList();
  ownerBench.cards.push(card('Oddish UNB'));
  if(options.vileplume) {
    ownerBench.cards.push(card('Gloom UNB'));
    ownerBench.cards.push(card('Vileplume AOR'));
  }
  owner.bench.push(ownerBench);
  const opponentBench=new PokemonCardList();
  opponentBench.cards.push(card('Pidgey MEW'));
  opponent.bench.push(opponentBench);
  for(const player of state.players) {
    player.prizes=Array.from({length:6},()=>{
      const prize=new CardList();
      prize.cards.push(card('Dratini OBF'));
      return prize;
    });
    player.deck.cards.push(card('Grass Energy MEE'),card('Grass Energy MEE'));
  }

  const active=state.players[options.activeSeat];
  active.hand.cards.push(card('Switch SVI'));
  const play=new PlayCardAction(active.id,0,{
    player:PlayerType.BOTTOM_PLAYER,slot:SlotType.ACTIVE,index:0
  });
  let failed=false,error=null;
  try {store.dispatch(play);}
  catch(e) { failed=true;error=e.message;}
  const activeName=active.active.getPokemonCard()?.name||null;
  return {
    activeSeat:options.activeSeat,
    vileplume:options.vileplume,
    blocked:failed,
    error,
    activeName,
    unresolvedPrompts:state.prompts.filter(p=>p.result===undefined)
      .map(p=>p.constructor.name),
    switchRemainsInHand:active.hand.cards.some(c=>c.name==='Switch'),
    phase:state.phase
  };
}

function testVileplumeItemLock() {
  const results=[];
  for(const activeSeat of [0,1]) {
    const without=probeSwitch({activeSeat,vileplume:false});
    const withLock=probeSwitch({activeSeat,vileplume:true});
    assert.equal(without.blocked,false,
      'Playable Switch control unexpectedly blocked at seat '+activeSeat);
    assert.ok(without.unresolvedPrompts.includes('ChoosePokemonPrompt'),
      'Unlocked Switch must offer a Bench target');
    assert.equal(withLock.blocked,true,
      'Irritating Pollen failed to block Switch at seat '+activeSeat);
    results.push({without,withLock});
  }
  return {
    engine:'twinleafgg/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    testing:'Actual Item PlayCardAction on staged legal board, both active seats',
    item:'Switch SVI 194',ability:'Vileplume AOR 3 Irritating Pollen',
    results,
    limitation:'No complete match, Ability-lock suppression, or policy competence'
  };
}
if(require.main===module)
  console.log(JSON.stringify(testVileplumeItemLock(),null,2));
module.exports={probeSwitch,testVileplumeItemLock};
