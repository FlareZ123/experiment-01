'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const {initializeCards} = require('./headless.cjs');

const root = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');
/** @param {string} moduleName */
const engine = moduleName => require(path.join(root,moduleName));

/**
 * Exact source-card Shop / Garbotoxin / Crobat / re-Tool actions.
 * Starting midgame board and hand deliberately staged; neither source deck
 * is dealt, and this cannot establish a competitive win.
 * @param {{garbodorCount:1|2,ownerSeat:0|1}} request
 */
function probe(request) {
  const manager = initializeCards();
  let nextId=1;
  /** @param {string} fullName */
  const card = fullName => {
    const value=manager.getCardByName(fullName);
    assert.ok(value, 'Pinned card missing: '+fullName);
    value.id=nextId++;
    return value;
  };

  const {Store}=engine('game/store/store');
  const {Player}=engine('game/store/state/player');
  const {CardList}=engine('game/store/state/card-list');
  const {PokemonCardList}=engine('game/store/state/pokemon-card-list');
  const {GamePhase}=engine('game/store/state/state');
  const {Format}=engine('game/store/card/card-types');
  const {PlayCardAction,PlayerType,SlotType}=
    engine('game/store/actions/play-card-action');
  const {UseStadiumAction}=engine('game/store/actions/game-actions');
  const {ResolvePromptAction}=engine('game/store/actions/resolve-prompt-action');

  const store=new Store({onStateChange(){}});
  const state=store.state;
  state.gameSettings.format=Format.EXPANDED;
  state.phase=GamePhase.PLAYER_TURN;
  state.turn=4;
  state.activePlayer=request.ownerSeat;
  const owner=new Player(),opponent=new Player();
  owner.id=101;owner.name='rank11 source-card mechanism owner';
  opponent.id=202;opponent.name='benchmark reference';
  state.players=request.ownerSeat===0?[owner,opponent]:[opponent,owner];

  owner.active.cards.push(card('Oranguru V ASR'));
  opponent.active.cards.push(card('Shadow Rider Calyrex V CRE'));
  owner.stadium.cards.push(card('Shopping Center EVS'));

  const originalTools=[];
  for(let index=0;index<request.garbodorCount;index++){
    const pokemon=new PokemonCardList();
    pokemon.cards.push(card('Trubbish FST'),card('Garbodor BKP'));
    const attached=card('Float Stone BKT');
    pokemon.tools.push(attached);
    originalTools.push(attached);
    owner.bench.push(pokemon);
  }
  owner.bench.push(new PokemonCardList());
  const crobat=card('Crobat V DAA');
  owner.hand.cards.push(crobat);
  for(const player of state.players){
    player.deck.cards.push(...Array.from({length:14},()=>card('Psychic Energy SVE')));
    for(let index=0;index<6;index++){
      const prize=new CardList();
      prize.cards.push(card('Psychic Energy SVE'));
      player.prizes.push(prize);
    }
  }

  const current=()=>store.state;
  const me=()=>current().players.find(player=>player.id===owner.id);
  const pending=()=>current().prompts.find(p=>p.result===undefined);
  /** @param {any} result */
  const answer=result=>{
    const prompt=pending();
    assert.ok(prompt,'Expected real pending prompt');
    store.dispatch(new ResolvePromptAction(prompt.id,result));
  };
  /** @param {number} cardId @param {object} target */
  const play=(cardId,target)=>{
    const index=me().hand.cards.findIndex(c=>c.id===cardId);
    assert.ok(index>=0,'Requested card not in live hand');
    store.dispatch(new PlayCardAction(owner.id,index,target));
  };

  store.dispatch(new UseStadiumAction(owner.id));
  const stadiumPrompt=pending();
  assert.equal(stadiumPrompt?.constructor.name,'ChoosePokemonPrompt');
  const firstGarbodor=me().bench[0];
  assert.equal(stadiumPrompt.validate([firstGarbodor],current()),true);
  answer([firstGarbodor]);
  assert.equal(pending(),undefined,'Shopping Center target must finish');
  assert.equal(me().bench[0].tools.length,0);
  assert.equal(me().hand.cards.some(c=>c.id===originalTools[0].id),true);

  const deckBefore=me().deck.cards.length;
  play(crobat.id,{
    player:PlayerType.BOTTOM_PLAYER,
    slot:SlotType.BENCH,
    index:request.garbodorCount
  });
  const entryPrompt=pending()?.constructor.name||null;
  if(entryPrompt==='ConfirmPrompt')answer(true);
  assert.equal(pending(),undefined,'Crobat entry must finish all pending prompts');
  const draws=deckBefore-me().deck.cards.length;
  const expectedDraws=request.garbodorCount===1?5:0;
  assert.equal(draws,expectedDraws,'Garbodor suppression should control Crobat Dark Asset');
  assert.equal(entryPrompt,request.garbodorCount===1?'ConfirmPrompt':null,
    'Dark Asset prompt must match active Garbotoxin count');

  play(originalTools[0].id,{
    player:PlayerType.BOTTOM_PLAYER,
    slot:SlotType.BENCH,
    index:0
  });
  assert.ok(me().bench[0].tools.some(c=>c.id===originalTools[0].id),
    'Float Stone must be legally reattached after Crobat draw');
  assert.equal(pending(),undefined);

  return {
    ...request,stadiumPrompt:stadiumPrompt.constructor.name,
    entryPrompt,draws,expectedDraws,
    reattached:true,ownerStadium:me().stadium.cards[0].fullName,
    boardScope:'synthetic midgame source cards, true UseStadiumAction and PlayCardActions',
    qualifiedForCompetitiveInference:false
  };
}

/** @returns {object} */
function run(){
  const rows=[0,1].flatMap(ownerSeat=>
    [1,2].map(garbodorCount=>probe({ownerSeat,garbodorCount})));
  assert.equal(rows.length,4);
  return {
    study:'Shopping Center EVS return Tool -> conditional Crobat V Dark Asset -> reattach Float Stone',
    engine:'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    rows,qualification:'action-level staged mechanics only; no natural source setup or win rate'
  };
}
if(require.main===module)process.stdout.write(JSON.stringify(run(),null,2)+'\n');
module.exports={probe,run};
