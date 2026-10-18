'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const {initializeCards}=require('./headless.cjs');
const output=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
/** @param {string} source */
const load=source=>require(path.join(output,source));

/**
 * Diagnostic of real Secret Box cost and search prompts against a conditional
 * Tool-Garbodor position. All zones are deliberately staged. No opponent
 * decision policy, authentic dealt hand, or winning attack is implied.
 */
function run() {
  const manager=initializeCards();
  let serial=1;
  /** @param {string} fullName */
  function card(fullName) {
    const value=manager.getCardByName(fullName);
    assert.ok(value,'Missing pinned printing '+fullName);
    value.id=serial++;
    return value;
  }
  const {Store}=load('game/store/store');
  const {Player}=load('game/store/state/player');
  const {CardList}=load('game/store/state/card-list');
  const {PokemonCardList}=load('game/store/state/pokemon-card-list');
  const {GamePhase}=load('game/store/state/state');
  const {Format}=load('game/store/card/card-types');
  const {PlayCardAction,PlayerType,SlotType}=
    load('game/store/actions/play-card-action');
  const {ResolvePromptAction}=load('game/store/actions/resolve-prompt-action');
  const {CheckPokemonPowersEffect}=
    load('game/store/effects/check-effects');
  const {IS_ABILITY_BLOCKED}=load('game/store/prefabs/prefabs');

  const store=new Store({onStateChange(){}});
  const state=store.state;
  const opponent=new Player(),mine=new Player();
  opponent.id=101;opponent.name='injected printed Garbotoxin';
  mine.id=202;mine.name='frozen New Moon response resources';
  state.players=[opponent,mine];
  state.activePlayer=1;state.turn=4;state.phase=GamePhase.PLAYER_TURN;
  state.gameSettings.format=Format.EXPANDED;
  const mew=card('Mewtwo & Mew-GX UNM');
  mine.active.cards.push(mew);
  const psychic=card('Psychic Energy SVE');
  mine.active.cards.push(psychic);
  mine.active.energies.cards.push(psychic);
  opponent.active.cards.push(card('Pidgey MEW'));
  const garbage=new PokemonCardList();
  garbage.cards.push(card('Trubbish BKP'),card('Garbodor BKP'));
  const float=card('Float Stone BKT');
  garbage.tools.push(float);
  opponent.bench.push(garbage);
  for(const player of state.players) {
    for(let i=0;i<6;i++){
      const list=new CardList();
      list.cards.push(card('Psychic Energy SVE'));
      player.prizes.push(list);
    }
    player.deck.cards.push(card('Psychic Energy SVE'));
  }

  const box=card('Secret Box TWM');
  const payments=[
    card('Battle VIP Pass FST'),
    card('Canceling Cologne ASR'),
    card('Ace Trainer AOR')
  ];
  mine.hand.cards.push(box,...payments);
  const targets=[
    card('Field Blower GRI'),
    card('Powerglass SFA'),
    card("Lillie's Determination M1L"),
    card('Sky Field ROS')
  ];
  mine.deck.cards.push(...targets);
  const summarize=()=>({
    hand:mine.hand.cards.map(c=>c.fullName),
    discard:mine.discard.cards.map(c=>c.fullName),
    deck:mine.deck.cards.map(c=>c.fullName),
    garbodorTools:garbage.tools.map(c=>c.fullName),
    currentPrompt:state.prompts.filter(p=>p.result===undefined).map(p=>({
      type:p.constructor.name,
      ownerId:p.playerId??null,
      ownHand:p.cards===mine.hand,
      ownDeck:p.cards===mine.deck,
      options:p.options??null,
      promptCards:p.cards?.cards?.map(c=>c.fullName)??null
    }))
  });
  const power=()=>{
    const check=new CheckPokemonPowersEffect(mine,mew);
    store.reduceEffect(state,check);
    return {visible:check.powers.some(x=>x.name==='Perfection'),
      blocked:IS_ABILITY_BLOCKED(store,state,mine,mew)};
  };
  const before={...summarize(),perfection:power()};
  let after=null,error=null;
  try {
    const index=mine.hand.cards.indexOf(box);
    store.dispatch(new PlayCardAction(mine.id,index,{
      player:PlayerType.ANY,slot:SlotType.BOARD,index:0
    }));
    after={...summarize(),perfection:power()};
  }catch(e){
    error=String(e?.stack||e);
    after={...summarize(),perfection:power()};
  }
  assert.equal(before.perfection.visible,false);
  return {
    schema:'newmoon-secret-box-real-store-prompt-diagnostic-v1',
    engine:'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    setup:'staged own Secret Box plus exactly 3 hand payments; no card draw, no action-policy opportunity claim',
    before,after,error,qualifiedForCompetitiveInference:false
  };
}
if(require.main===module)process.stdout.write(JSON.stringify(run(),null,2)+'\n');
module.exports={run};
