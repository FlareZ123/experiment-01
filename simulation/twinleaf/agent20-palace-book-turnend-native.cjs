'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const {initializeCards} = require('./headless.cjs');

const compiled = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');
/** @param {string} file */
const native = file => require(path.join(compiled, file));

/**
 * Two-seat original Japanese Palace Book SMP printing Store action witness.
 * Every board is controlled, with physically existing Pokémon and deck cards.
 * Does not represent a random original-60 game or any win-rate result.
 *
 * @param {0 | 1} seat Owner's physical seat.
 * @param {number} deckSize Initial own deck cards.
 * @returns {object} Engine action and zone postconditions.
 */
function probePalaceBook(seat, deckSize) {
  const manager = initializeCards();
  const {Store} = native('game/store/store');
  const {Player} = native('game/store/state/player');
  const {CardList} = native('game/store/state/card-list');
  const {GamePhase} = native('game/store/state/state');
  const {Format} = native('game/store/card/card-types');
  const {PlayCardAction,PlayerType,SlotType} =
    native('game/store/actions/play-card-action');
  /** @param {string} name */
  const card = name => {
    const found = manager.getCardByName(name);
    assert.ok(found,'Printed card unavailable in pinned manager: '+name);
    return found;
  };
  const store = new Store({onStateChange(){}});
  const state = store.state;
  const owner = new Player(), opponent = new Player();
  owner.id=131;owner.name='rank7 Snorlax Palace Book witness';
  opponent.id=132;opponent.name='controlled rival';
  state.players=seat===0?[owner,opponent]:[opponent,owner];
  state.activePlayer=seat;
  state.turn=3;
  state.phase=GamePhase.PLAYER_TURN;
  state.gameSettings.format=Format.EXPANDED;
  owner.active.cards.push(card('Snorlax PGO'));
  opponent.active.cards.push(card('Shadow Rider Calyrex V CRE'));
  for(const player of [owner,opponent]){
    player.prizes=Array.from({length:6},()=>{
      const list=new CardList();
      list.cards.push(card('Dratini OBF'));
      return list;
    });
  }
  const palace=card('Palace Book SMP');
  owner.hand.cards.push(palace);
  for(let n=0;n<deckSize;n++)owner.deck.cards.push(card('Psychic Energy MEE'));
  opponent.deck.cards.push(card('Psychic Energy MEE'));
  const {ResolvePromptAction}=native('game/store/actions/resolve-prompt-action');
  const canPlay=palace.canPlay(store,state,owner);
  let error=null,accepted=false;
  try {
    store.dispatch(new PlayCardAction(owner.id,0,{
      player:PlayerType.ANY,slot:SlotType.BOARD,index:0
    }));
    accepted=true;
  }catch(failure){error=String(failure?.message||failure);}
  const resolvedPrompts=[];
  if(accepted && !error){
    for(let k=0;k<12;k++){
      const pending=state.prompts.find(p=>p.result===undefined);
      if(!pending)break;
      const kind=pending.constructor.name;
      resolvedPrompts.push(kind);
      if(kind!=='WaitPrompt'){
        error='Unexpected Palace Book follow-up: '+kind;
        break;
      }
      try { store.dispatch(new ResolvePromptAction(pending.id,null)); }
      catch(failure){error=String(failure?.message||failure);break;}
    }
  }
  return {
    seat,deckSize,
    printing:'Palace Book SMP NAN25',
    sourceRanks:[6,7,24],
    canPlay,accepted,error,
    handCountAfter:owner.hand.cards.length,
    deckCountAfter:owner.deck.cards.length,
    palaceInHand:owner.hand.cards.includes(palace),
    palaceInDiscard:owner.discard.cards.includes(palace),
    palaceInSupporter:owner.supporter.cards.includes(palace),
    supporterQuota:owner.supporterTurn,
    resultingTurn:state.turn,
    resultingActiveSeat:state.activePlayer,
    resolvedPrompts,
    pendingPrompts:state.prompts.filter(p=>p.result===undefined)
      .map(p=>p.constructor.name)
  };
}

/** @returns {object} Full staged matrix. */
function run(){
  const rows=[];
  for(const seat of [0,1])for(const deckSize of [1,3,5])
    rows.push(probePalaceBook(seat,deckSize));
  return {enginePin:'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    fullOriginalDeckUsed:false,competitiveQualifiedGames:0,
    scope:'Native item effect on controlled physical source-printing board',
    rows};
}
if(require.main===module)console.log(JSON.stringify(run(),null,2));
module.exports={probePalaceBook,run};
