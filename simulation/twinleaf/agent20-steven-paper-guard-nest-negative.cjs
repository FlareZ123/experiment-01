'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const {initializeCards}=require('./headless.cjs');
const {installStevenPaperMinimumHook}=
  require('./agent20-steven-paper-minimum-hook.cjs');

const compiled=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
/** @param {string} filename */
const native=filename=>require(path.join(compiled,filename));

/**
 * Paper-valid zero selection from a *restricted* source-rank7 Nest Ball search.
 * Contrasts with unrestricted Steven minimum-one, using identical guard.
 * This is an isolated source-printing legal-action smoke test, not a match.
 *
 * @param {0|1} seat Physical seat of printed Nest Ball owner.
 * @returns {object} Native and guard decision receipts.
 */
function probe(seat){
  const manager=initializeCards();
  /** @param {string} printing */
  const card=printing=>{
    const found=manager.getCardByName(printing);
    assert.ok(found,'Cannot resolve pinned exact printing '+printing);
    return found;
  };
  const {Store}=native('game/store/store');
  const {Player}=native('game/store/state/player');
  const {CardList}=native('game/store/state/card-list');
  const {GamePhase}=native('game/store/state/state');
  const {Format}=native('game/store/card/card-types');
  const {PlayCardAction,PlayerType,SlotType}=
    native('game/store/actions/play-card-action');
  const {ResolvePromptAction}=
    native('game/store/actions/resolve-prompt-action');
  const store=new Store({onStateChange(){}});
  const source=new Player(),opponent=new Player();
  source.id=881;opponent.id=882;
  source.name='original rank7 Nest Ball owner';
  opponent.name='controlled opposition';
  source.active.cards.push(card('Snorlax PGO'));
  opponent.active.cards.push(card('Shadow Rider Calyrex V CRE'));
  for(const p of [source,opponent]){
    p.prizes=Array.from({length:6},()=>{
      const list=new CardList();
      list.cards.push(card('Psychic Energy MEE'));
      return list;
    });
  }
  source.deck.cards.push(card('Dratini OBF'),
    card('Psychic Energy MEE'),card('Psychic Energy MEE'));
  opponent.deck.cards.push(card('Psychic Energy MEE'));
  const nest=card('Nest Ball SVI');
  source.hand.cards.push(nest);
  const state=store.state;
  state.players=seat===0?[source,opponent]:[opponent,source];
  state.activePlayer=seat;
  state.turn=3;state.phase=GamePhase.PLAYER_TURN;
  state.gameSettings.format=Format.EXPANDED;
  const deckBefore=source.deck.cards.length;
  const restore=installStevenPaperMinimumHook();
  let validatorAcceptedZero=false,accepted=false;
  let promptPrinting=null,promptOwnDeck=false;
  let thrown=null;
  try{
    store.dispatch(new PlayCardAction(source.id,0,{
      player:PlayerType.ANY,slot:SlotType.BOARD,index:0
    }));
    const prompt=state.prompts.find(p=>
      p.result===undefined&&p.constructor.name==='ChooseCardsPrompt');
    assert.ok(prompt,'Original source Nest Ball missing own-deck prompt');
    promptPrinting=prompt.sourceCard?.fullName??null;
    promptOwnDeck=prompt.cards===source.deck;
    validatorAcceptedZero=prompt.validate([],state);
    assert.equal(validatorAcceptedZero,true);
    store.dispatch(new ResolvePromptAction(prompt.id,[]));
    accepted=true;
  }catch(error){thrown=String(error?.message||error);}
  finally{restore();}
  return {
    seat,originalRank:7,printing:'Nest Ball SVI 181',
    ownDeck:promptOwnDeck,promptPrinting,deckBefore,
    deckAfter:source.deck.cards.length,validatorAcceptedZero,
    accepted,thrown,guardAudit:{...restore.audit},
    currentPromptTypes:state.prompts.filter(p=>p.result===undefined)
      .map(p=>p.constructor.name)
  };
}

/** @returns {object} Both original owner seats. */
function run(){
  const rows=[probe(0),probe(1)];
  return {
    pin:'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    scope:'Restricted Basic search zero reply; source-rank7 exact printing, isolated staged decks',
    rows,competitiveQualifiedGames:0
  };
}

if(require.main===module)console.log(JSON.stringify(run(),null,2));
module.exports={probe,run};
