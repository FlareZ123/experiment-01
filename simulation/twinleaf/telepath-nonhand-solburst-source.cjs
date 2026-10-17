'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const {initializeCards}=require('./headless.cjs');
const output=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
/** @param {string} name */
const load=name=>require(path.join(output,name));

/**
 * Real pinned Store attack effect: Solgaleo-GX UPR's Sol Burst-GX searches the
 * DECK for a Special Energy, then uses AttachEnergyEffect to attach it to a
 * Benched Psychic Pokémon. Telepathic Psychic Energy's printed search trigger
 * is restricted to attaching FROM HAND. No source 60 or match outcome is used.
 *
 * @param {0|1} seat Physical player slot.
 */
function runSeat(seat) {
  const manager=initializeCards();
  let nextId=200;
  /** @param {string} name */
  const card=name=>{
    const c=manager.getCardByName(name);
    assert.ok(c,'Missing pinned printing '+name);
    c.id=nextId++;
    return c;
  };
  const {Store}=load('game/store/store');
  const {Player}=load('game/store/state/player');
  const {PokemonCardList}=load('game/store/state/pokemon-card-list');
  const {CardList}=load('game/store/state/card-list');
  const {GamePhase}=load('game/store/state/state');
  const {Format}=load('game/store/card/card-types');
  const {AttackAction}=load('game/store/actions/game-actions');
  const {ResolvePromptAction}=load('game/store/actions/resolve-prompt-action');
  const {PlayerType,SlotType}=load('game/store/actions/play-card-action');
  const store=new Store({onStateChange(){}});
  const state=store.state;
  const mine=new Player(),opponent=new Player();
  mine.id=201;opponent.id=202;
  mine.bench=Array.from({length:5},()=>new PokemonCardList());
  opponent.bench=Array.from({length:5},()=>new PokemonCardList());
  state.players=seat===0?[mine,opponent]:[opponent,mine];
  state.activePlayer=seat;
  state.turn=3;
  state.phase=GamePhase.PLAYER_TURN;
  state.gameSettings.format=Format.EXPANDED;

  const solgaleo=card('Solgaleo-GX UPR');
  const metal=card('Metal Energy SVE');
  const mew=card('Mewtwo & Mew-GX UNM');
  const telepath=card('Telepath [P] Energy M3');
  mine.active.cards.push(solgaleo,metal);
  mine.active.energies.cards.push(metal);
  mine.bench[0].cards.push(mew);
  mine.deck.cards.push(telepath,card('Duskull VIV'),card('Unown AOR'));
  for(let i=0;i<10;i++)mine.deck.cards.push(card('Psychic Energy SVE'));
  opponent.active.cards.push(card('Pidgey MEW'));
  for(const p of state.players) {
    p.deck.cards.push(card('Psychic Energy SVE'));
    for(let i=0;i<6;i++) {
      const prize=new CardList();
      prize.cards.push(card('Psychic Energy SVE'));
      p.prizes.push(prize);
    }
  }

  assert.ok(mine.deck.cards.includes(telepath));
  assert.ok(!mine.hand.cards.includes(telepath));
  assert.ok(!mine.bench[0].energies.cards.includes(telepath));
  store.dispatch(new AttackAction(mine.id,'Sol Burst-GX'));
  const attach=state.prompts.find(p=>p.result===undefined&&p.constructor.name==='AttachEnergyPrompt');
  assert.ok(attach,'Sol Burst-GX did not offer its deck-origin Energy attachment');
  assert.equal(attach.cardList,mine.deck,'Sol Burst-GX prompt must draw from deck');
  const to={player:PlayerType.BOTTOM_PLAYER,slot:SlotType.BENCH,index:0};
  const result=[{card:telepath,to}];
  assert.equal(attach.validate(result),true);
  store.dispatch(new ResolvePromptAction(attach.id,result));
  const search=state.prompts.find(p=>p.result===undefined&&p.constructor.name==='ChooseCardsPrompt');
  const evidence={
    seat,sourceAttack:'Sol Burst-GX',sourceZone:'deck',
    attackCard:solgaleo.fullName,energy:telepath.fullName,
    target:mew.fullName,
    handStillEmpty:mine.hand.cards.length===0,
    telepathStillInDeck:mine.deck.cards.includes(telepath),
    telepathAttached:mine.bench[0].energies.cards.includes(telepath),
    unexpectedTelepathSearch:!!search,
    searchMessage:search?.message??null,
    deckUnchangedContainsSource:mine.deck.cards.includes(telepath),
    pendingPrompts:state.prompts.filter(p=>p.result===undefined).map(p=>p.constructor.name)
  };
  assert.equal(evidence.unexpectedTelepathSearch,true,
    'Source baseline no longer produces the non-hand Telepath search');
  assert.equal(evidence.telepathStillInDeck,true,
    'Unexpectedly repaired deck-to-Pokemon energy zone migration');
  assert.equal(evidence.telepathAttached,true,
    'Expected actual reducer attachment to target energy list');
  return evidence;
}
function run() {
  return {schema:'solburst-telepath-nonhand-origin-real-store-v1',
    engine:'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    source:'two-seat constructed effect board, true Store AttackAction and ResolvePromptAction',
    status:'source-engine-negative-assertions-unqualified',
    qualifiedForCompetitiveInference:false,
    rows:[runSeat(0),runSeat(1)]};
}
if(require.main===module)process.stdout.write(JSON.stringify(run(),null,2)+'\n');
module.exports={run,runSeat};
