'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const {initializeCards}=require('./headless.cjs');

const OUTPUT=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
const PIN='a9905a76a6c4103ba4b6cb9a49e86bad795c5c05';
/** @param {string} key */
const load=key=>require(path.join(OUTPUT,key));

/**
 * Controlled, staged native two-player Blockade contract. Both printed
 * Exeggcute Basic variants used here exist at the pinned Twinleaf revision.
 * This tests actual printed AttackAction, player-level Supporter denial,
 * no-mutation rejection and expiry, not live initial setup or deck strength.
 *
 * @param {0|1} sourceSeat Source player physical seat.
 * @returns {object}
 */
function probe(sourceSeat){
  assert.ok(sourceSeat===0||sourceSeat===1);
  const cards=initializeCards();
  let nextCardId=1;
  /** @param {string} fullName */
  const card=fullName=>{
    const x=cards.getCardByName(fullName);
    assert.ok(x,'Pinned class missing: '+fullName);
    x.id=nextCardId++;
    return x;
  };
  const {Store}=load('game/store/store');
  const {Player}=load('game/store/state/player');
  const {CardList}=load('game/store/state/card-list');
  const {PokemonCardList}=load('game/store/state/pokemon-card-list');
  const {GamePhase}=load('game/store/state/state');
  const {Format}=load('game/store/card/card-types');
  const {AttackAction,PassTurnAction}=load('game/store/actions/game-actions');
  const {PlayCardAction,PlayerType,SlotType}=
    load('game/store/actions/play-card-action');
  const {ResolvePromptAction}=
    load('game/store/actions/resolve-prompt-action');

  const store=new Store({onStateChange(){}});
  const state=store.state;
  const source=new Player(), opponent=new Player();
  source.id=101; opponent.id=202;
  source.name='Rank2 derived Exeggutor/Vileplume';
  opponent.name='Staged resisting opponent';
  state.players=sourceSeat===0?[source,opponent]:[opponent,source];
  state.phase=GamePhase.PLAYER_TURN;
  state.turn=2;
  state.activePlayer=sourceSeat;
  state.gameSettings.format=Format.EXPANDED;

  const stageBasic=card('Exeggcute VIV');
  const exeggutor=card('Exeggutor PLF');
  source.active.cards.push(stageBasic,exeggutor);
  const jet=card('Jet Energy PAL');
  source.active.cards.push(jet);
  source.active.energies.cards.push(jet);
  const extra= new PokemonCardList();
  extra.cards.push(card('Oddish UNB'));
  source.bench.push(extra);

  opponent.active.cards.push(card('Wobbuffet PHF'));
  const bench=new PokemonCardList();
  bench.cards.push(card('Shadow Rider Calyrex V CRE'));
  opponent.bench.push(bench);
  const supporter=card("Professor's Research JTG");
  opponent.hand.cards.push(supporter);
  for(const player of [source,opponent]){
    for(let i=0;i<12;i++)player.deck.cards.push(card('Psychic Energy SVE'));
    for(let i=0;i<6;i++){
      const prize=new CardList();
      prize.cards.push(card('Psychic Energy SVE'));
      player.prizes.push(prize);
    }
  }
  /** Settle only native WaitPrompt animations; any other unresolved prompt fails. */
  const resolveWait=()=>{
    let count=0;
    for(let k=0;k<40;k++){
      const prompt=store.state.prompts.find(p=>p.result===undefined);
      if(!prompt)return count;
      assert.equal(prompt.constructor.name,'WaitPrompt',
        'Unexpected nonanimation prompt at staged Blockade contract');
      store.dispatch(new ResolvePromptAction(prompt.id,null));
      count++;
    }
    throw new Error('Native prompt settling did not terminate');
  };
  store.dispatch(new AttackAction(source.id,'Blockade'));
  const waitsAfterAttack=resolveWait();
  const owner=()=>store.state.players.find(p=>p.id===opponent.id);
  assert.equal(store.state.players[store.state.activePlayer].id,opponent.id,
    'Native Blockade AttackAction must pass turn to recipient');
  assert.equal(owner().cannotPlaySupporterCards,true);
  assert.equal(owner().active.damage,10);
  assert.ok(owner().hand.cards.includes(supporter));

  const before={
    hand:owner().hand.cards.map(c=>c.fullName),
    supporterTurn:owner().supporterTurn,
    damage:owner().active.damage
  };
  const attempt=()=>store.dispatch(new PlayCardAction(
    opponent.id,owner().hand.cards.indexOf(supporter),
    {player:PlayerType.ANY,slot:SlotType.BOARD,index:0}
  ));
  assert.throws(attempt,/BLOCKED_BY_EFFECT/,
    'Attack-applied player lock must reject genuinely held Supporter');
  assert.deepEqual({
    hand:owner().hand.cards.map(c=>c.fullName),
    supporterTurn:owner().supporterTurn,
    damage:owner().active.damage
  },before,'Rejected native Supporter must not mutate owner resources');
  store.dispatch(new PassTurnAction(opponent.id));
  resolveWait();
  assert.equal(owner().cannotPlaySupporterCards,false,
    'Lock must expire after the targeted player finishes next turn');
  assert.equal(store.state.players[store.state.activePlayer].id,source.id);
  store.dispatch(new PassTurnAction(source.id));
  resolveWait();
  assert.equal(store.state.players[store.state.activePlayer].id,opponent.id);
  assert.equal(owner().cannotPlaySupporterCards,false);
  const index=owner().hand.cards.indexOf(supporter);
  assert.ok(index>=0);
  store.dispatch(new PlayCardAction(opponent.id,index,
    {player:PlayerType.ANY,slot:SlotType.BOARD,index:0}));
  resolveWait();
  assert.ok(!owner().hand.cards.includes(supporter),
    'Previously denied Supporter must be playable after attack lock expires');
  return {
    sourceSeat,
    activePrintedStages:['Exeggcute VIV','Exeggutor PLF'],
    attachedEnergy:'Jet Energy PAL',
    opponentActive:'Wobbuffet PHF',
    opponentHeldSupporter:"Professor's Research JTG",
    attacked:'Blockade',
    damage:10,
    waitsAfterAttack,
    deniedHeldSupporterWithoutMutation:true,
    playerLevelLockPresentOnOpposingTurn:true,
    lockExpiredAfterOpposingTurn:true,
    sameSupporterPlayableOnLaterTurn:true,
    scope:'Fully staged actual Store roots; no normal draw/prize construction or source-policy setup, no complete match'
  };
}

/** @returns {object} */
function main(){
  return {schema:'agent18-pinned-blockade-player-lock-native-v1',pin:PIN,
    rows:[probe(0),probe(1)],
    competitiveQualifiedGames:0};
}
if(require.main===module)
  process.stdout.write(JSON.stringify(main(),null,2)+'\n');
module.exports={PIN,probe,main};
