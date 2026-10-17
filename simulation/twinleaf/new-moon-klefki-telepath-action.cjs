'use strict';
const assert=require('node:assert/strict');
const path=require('node:path');
const {initializeCards}=require('./headless.cjs');
const output=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
/** @param {string} name */
const load=name=>require(path.join(output,name));

/** @param {0|1} seat */
function probe(seat) {
  const manager=initializeCards();
  let id=100;
  /** @param {string} name */
  const card=name=>{
    const c=manager.getCardByName(name);
    assert.ok(c,'Missing pinned '+name);
    c.id=id++;
    return c;
  };
  const {Store}=load('game/store/store');
  const {Player}=load('game/store/state/player');
  const {CardList}=load('game/store/state/card-list');
  const {GamePhase}=load('game/store/state/state');
  const {Format}=load('game/store/card/card-types');
  const {PlayCardAction,PlayerType,SlotType}=load('game/store/actions/play-card-action');
  const {ResolvePromptAction}=load('game/store/actions/resolve-prompt-action');
  const {RetreatAction}=load('game/store/actions/game-actions');
  const store=new Store({onStateChange(){}});
  const state=store.state;
  const mine=new Player(),them=new Player();
  mine.id=101;them.id=202;
  state.players=seat===0?[mine,them]:[them,mine];
  state.activePlayer=seat;state.turn=1;
  state.phase=GamePhase.PLAYER_TURN;
  state.gameSettings.format=Format.EXPANDED;
  const klefki=card('Klefki SVI');
  const telepath=card('Telepath [P] Energy M3');
  const mew=card('Mewtwo & Mew-GX UNM');
  const duskull=card('Duskull VIV');
  mine.active.cards.push(klefki);
  mine.hand.cards.push(telepath);
  mine.deck.cards.push(mew,duskull);
  for(let i=0;i<10;i++)mine.deck.cards.push(card('Psychic Energy SVE'));
  them.active.cards.push(card('Pidgey MEW'));
  for(const p of state.players) {
    p.deck.cards.push(card('Psychic Energy SVE'));
    for(let i=0;i<6;i++) {
      const prize=new CardList();
      prize.cards.push(card('Psychic Energy SVE'));
      p.prizes.push(prize);
    }
  }
  store.dispatch(new PlayCardAction(mine.id,0,{
    player:PlayerType.BOTTOM_PLAYER,slot:SlotType.ACTIVE,index:0
  }));
  const selection=state.prompts.find(p=>p.result===undefined&&
    p.constructor.name==='ChooseCardsPrompt');
  assert.ok(selection,'Telepath search did not offer Basic Psychic prompt: '+JSON.stringify({
    phase:state.phase,
    promptKinds:state.prompts.map(x=>({type:x.constructor.name,id:x.id,result:x.result})),
    hand:mine.hand.cards.map(x=>x.fullName),
    attachedEnergy:mine.active.energies.cards.map(x=>x.fullName),
    deck:mine.deck.cards.map(x=>x.fullName).slice(0,6),
    energyPlayedTurn:mine.energyPlayedTurn,
    active:mine.active.getPokemonCard()?.fullName
  }));
  assert.equal(selection.validate([mew,duskull]),true);
  store.dispatch(new ResolvePromptAction(selection.id,[mew,duskull]));
  const benched=mine.bench.filter(slot=>slot.getPokemonCard())
    .map(slot=>slot.getPokemonCard().fullName);
  assert.ok(benched.includes(mew.fullName));
  assert.ok(benched.includes(duskull.fullName));
  assert.ok(mine.active.energies.cards.includes(telepath));
  // Exact subsequent own-turn change, preserving prior attached card.
  // Advance past the intervening opponent turn; their policy is not modeled.
  state.turn=3;
  const mewBench=mine.bench.findIndex(p=>p.getPokemonCard()===mew);
  const before={active:mine.active.getPokemonCard().fullName,
    energy:mine.active.energies.cards.map(c=>c.fullName),benched};
  assert.ok(mewBench>=0);
  store.dispatch(new RetreatAction(mine.id,mewBench));
  assert.equal(mine.active.getPokemonCard(),mew,
    'Paid retreat did not promote searched Mewtwo');
  assert.ok(mine.discard.cards.includes(telepath),
    'Retreat must spend Telepath rather than preserve its Energy');
  return {seat,before,after:{
    active:mine.active.getPokemonCard().fullName,
    klefkiBenched:mine.bench.some(p=>p.getPokemonCard()===klefki),
    discardedTelepath:mine.discard.cards.includes(telepath),
    remainingBench:mine.bench.filter(p=>p.getPokemonCard()).length
  },qualifiedForCompetitiveInference:false};
}
function run() {
  const rows=[probe(0),probe(1)];
  return {schema:'new-moon-telepath-klefki-source-store-v1',
    engine:'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    note:'Conditioned board using real Energy PlayCardAction, prompt and paid RetreatAction; source Prize hand accessibility and match policy untested',
    rows};
}
if(require.main===module)console.log(JSON.stringify(run(),null,2));
module.exports={probe,run};
