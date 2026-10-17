'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const {initializeCards} = require('./headless.cjs');

const root = path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
/** @param {string} moduleName */
const engine = moduleName => require(path.join(root,moduleName));

/**
 * A real two-turn Store action sequence after a conditioned Vileplume/Garbodor
 * setup. Both decks and initial board are deliberately staged rather than dealt.
 *
 * @param {{ownerSeat:0|1,garbodorPrint:'BKP'|'LTR',
 * hood:'none'|'pre-attached'|'attach-after-faba'}} p
 * @returns {object}
 */
function probe(p) {
  const manager=initializeCards();
  let nextId=1;
  /** @param {string} name */
  const card=name=>{
    const c=manager.getCardByName(name);
    assert.ok(c,'Missing pinned card '+name);
    c.id=nextId++;
    return c;
  };
  const {Store}=engine('game/store/store');
  const {Player}=engine('game/store/state/player');
  const {CardList}=engine('game/store/state/card-list');
  const {PokemonCardList}=engine('game/store/state/pokemon-card-list');
  const {GamePhase}=engine('game/store/state/state');
  const {Format}=engine('game/store/card/card-types');
  const {PlayCardAction,PlayerType,SlotType}=
    engine('game/store/actions/play-card-action');
  const {ResolvePromptAction}=engine('game/store/actions/resolve-prompt-action');
  const {PassTurnAction}=engine('game/store/actions/game-actions');

  const store=new Store({onStateChange(){}});
  const state=store.state;
  const owner=new Player(),opponent=new Player();
  owner.id=101;owner.name='published rank2 control';
  opponent.id=202;opponent.name='sourced Garbodor archetype';
  state.players=p.ownerSeat===0?[owner,opponent]:[opponent,owner];
  state.phase=GamePhase.PLAYER_TURN;
  state.turn=4;
  state.activePlayer=p.ownerSeat;
  state.gameSettings.format=Format.EXPANDED;
  owner.active.cards.push(card('Bunnelby PRC'));
  opponent.active.cards.push(card('Shadow Rider Calyrex V CRE'));

  const vileplume=new PokemonCardList();
  vileplume.cards.push(card('Oddish UNB'),card('Gloom UNB'),card('Vileplume AOR'));
  if(p.hood==='pre-attached') vileplume.tools.push(card('Stealthy Hood UNB'));
  owner.bench.push(vileplume);
  const garbodor=new PokemonCardList();
  garbodor.cards.push(card('Trubbish BKP'),card('Garbodor '+p.garbodorPrint));
  const removedTool=card('Float Stone BKT');
  garbodor.tools.push(removedTool);
  opponent.bench.push(garbodor);
  for(const player of state.players) {
    player.deck.cards.push(card('Psychic Energy SVE'),card('Dratini OBF'));
    for(let i=0;i<6;i++){
      const prize=new CardList();
      prize.cards.push(card('Psychic Energy SVE'));
      player.prizes.push(prize);
    }
  }

  const faba=card('Faba LOT');
  owner.hand.cards.push(faba);
  const hood= p.hood==='attach-after-faba' ? card('Stealthy Hood UNB') : null;
  if(hood)owner.hand.cards.push(hood);
  const spareFloat=card('Float Stone BKT');
  const quickBall=card('Quick Ball FST');
  opponent.hand.cards.push(spareFloat,quickBall,card('Psychic Energy SVE'));

  const current=()=>store.state;
  const liveOwner=()=>current().players.find(x=>x.id===owner.id);
  const liveOpponent=()=>current().players.find(x=>x.id===opponent.id);
  const pending=()=>current().prompts.find(x=>x.result===undefined);
  /** @param {number} actorId @param {number} itemId @param {object} target */
  function play(actorId,itemId,target){
    let error=null;
    try{
      const actor=current().players.find(x=>x.id===actorId);
      const index=actor.hand.cards.findIndex(x=>x.id===itemId);
      assert.ok(index>=0,'Source card missing in live hand');
      store.dispatch(new PlayCardAction(actorId,index,target));
    }catch(e){error=e.message;}
    return error;
  }
  /** @param {any} result */
  function answer(result){
    const prompt=pending();
    assert.ok(prompt,'Expected outstanding prompt');
    store.dispatch(new ResolvePromptAction(prompt.id,result));
  }
  const anyBoard={player:PlayerType.ANY,slot:SlotType.BOARD,index:0};
  const ownBench={player:PlayerType.BOTTOM_PLAYER,slot:SlotType.BENCH,index:0};

  // Rank-2 player's Faba turn: remove the Tool that currently enables
  // opposing Garbotoxin. The consequent Vileplume Item lock is immediate.
  assert.equal(play(owner.id,faba.id,anyBoard),null);
  assert.equal(pending()?.constructor.name,'SelectPrompt');
  answer(0);
  assert.equal(pending()?.constructor.name,'ChoosePokemonPrompt');
  assert.equal(pending().validate([liveOpponent().bench[0]],current()),true);
  answer([liveOpponent().bench[0]]);
  assert.equal(pending(),undefined);
  assert.ok(liveOpponent().lostzone.cards.some(x=>x.id===removedTool.id));
  assert.equal(liveOpponent().bench[0].tools.length,0);

  let ownerHoodAction=null;
  if(hood){
    ownerHoodAction=play(owner.id,hood.id,ownBench);
    assert.equal(ownerHoodAction,null,'Hood is a Tool, legal through Item lock');
    assert.ok(liveOwner().bench[0].tools.some(x=>x.id===hood.id));
  }

  // Execute a genuine PassTurnAction rather than manually changing turn or
  // active-player indices. A source Garbodor player has a spare Float Stone
  // in hand and is permitted to reattach it while Vileplume locks Items.
  store.dispatch(new PassTurnAction(owner.id));
  // The pinned Store pauses both between-turn checks and the initial draw via
  // nonvisual WaitPrompt callbacks. Resolve those genuine phase prompts rather
  // than writing state.activePlayer or state.turn directly.
  let transitionPrompts=0;
  while(current().phase!==GamePhase.PLAYER_TURN ||
        current().activePlayer!==1-p.ownerSeat){
    const wait=pending();
    assert.equal(wait?.constructor.name,'WaitPrompt',
      'Only nonvisual phase progression should remain in a clean checkup');
    answer(null);
    transitionPrompts++;
    assert.ok(transitionPrompts<=5,'Turn progression exceeded expected prompt bound');
  }
  assert.equal(current().activePlayer,1-p.ownerSeat,
    'PassTurnAction and the completed Checkup should give the adversary the next turn');
  const afterPassTurn=current().turn;
  assert.ok(afterPassTurn>4,'PassTurnAction must advance global turn number');
  const retoolError=play(opponent.id,spareFloat.id,ownBench);
  assert.equal(retoolError,null,'Pre-2023 Float Stone is a Pokémon Tool, not an Item');
  assert.ok(liveOpponent().bench[0].tools.some(x=>x.id===spareFloat.id));
  assert.equal(pending(),undefined,'Tool attachment must be a completed action');

  // Quick Ball FST is four-of in all four published Garbodor archetypes.
  // Its legality after retool distinguishes suppressed bare Vileplume from
  // Hood-protected Vileplume, using a genuine opposing Item action.
  const quickError=play(opponent.id,quickBall.id,anyBoard);
  const quickPrompt=pending()?.constructor.name||null;
  const quickStillInHand=liveOpponent().hand.cards.some(x=>x.id===quickBall.id);
  const mustLock=p.hood!=='none';
  assert.equal(quickError,mustLock?'CANNOT_PLAY_THIS_CARD':null,
    'Opponent Item access after retool contradicts Hood/Garbotoxin interaction');
  assert.equal(quickStillInHand,mustLock,
    'Rejected Quick Ball must stay in the hand, accepted Quick Ball should leave');
  if(mustLock)assert.equal(quickPrompt,null,'Locked Item must not create a prompt');
  else assert.ok(quickPrompt,'Accepted Quick Ball must open a real effect prompt');

  return {...p,afterPassTurn,transitionPrompts,ownerHoodAction,retoolError,quickError,
    quickPrompt,quickStillInHand,
    replacedFloatOnGarbodor:liveOpponent().bench[0].tools.some(x=>x.id===spareFloat.id),
    firstFloatInLostZone:liveOpponent().lostzone.cards.some(x=>x.id===removedTool.id),
    stateScope:'conditioned midgame board; one real PassTurnAction; no dealt 60s'};
}

/** @returns {object} */
function run(){
  const rows=['BKP','LTR'].flatMap(garbodorPrint=>
    [0,1].flatMap(ownerSeat=>
      ['none','pre-attached','attach-after-faba'].map(hood=>
        probe({ownerSeat,garbodorPrint,hood}))));
  assert.equal(rows.length,12);
  return {
    schema:'garbotoxin-retool-after-faba-two-turn-store-v1',
    engine:'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    qualification:'Staged setup with actual Faba/Hood/PassTurn/Float Stone/Quick Ball actions, not a competitive match',
    rows
  };
}
if(require.main===module)process.stdout.write(JSON.stringify(run(),null,2)+'\n');
module.exports={probe,run};
