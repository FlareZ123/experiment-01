'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const path=require('node:path');
const {initializeCards}=require('../simulation/twinleaf/headless.cjs');

const output=path.resolve(__dirname,'../vendor/twinleaf/ptcg-server/output');
/** @param {string} file */
const engine=file=>require(path.join(output,file));

/**
 * Staged mechanics only. Both attackers and attached Energy were constructed
 * explicitly; this cannot establish that an original rank30 source draw and
 * policy execute this sequence in a real original game.
 */
function nativeFundedRondoCase(){
 const {Store}=engine('game/store/store');
 const {GamePhase}=engine('game/store/state/state');
 const {Player}=engine('game/store/state/player');
 const {PokemonCardList}=engine('game/store/state/pokemon-card-list');
 const {CardList}=engine('game/store/state/card-list');
 const {CheckRetreatCostEffect}=engine('game/store/effects/check-effects');
 const {RetreatAction,AttackAction}=engine('game/store/actions/game-actions');
 const {ResolvePromptAction}=
   engine('game/store/actions/resolve-prompt-action');
 const cards=initializeCards();
 const card=printing=>{
  const x=cards.getCardByName(printing);
  assert.ok(x,'Missing native printing: '+printing);
  return x;
 };
 const source=new Player();
 source.id=101;source.name='source-rank30';
 const opponent=new Player();
 opponent.id=202;opponent.name='candidate-control';
 for(const p of [source,opponent]){
  p.prizes=[new CardList()];
  p.prizes[0].cards.push(card('Psychic Energy SVE'));
  p.deck.cards.push(card('Psychic Energy SVE'));
 }
 source.active.cards.push(card('Latias ex SSP'));
 const clefairy=new PokemonCardList();
 clefairy.cards.push(card("Lillie's Clefairy ex JTG"));
 const e=[card('Psychic Energy SVE'),card('Psychic Energy SVE')];
 clefairy.cards.push(...e);clefairy.energies.cards.push(...e);
 source.bench=[clefairy];
 opponent.active.cards.push(card('Shadow Rider Calyrex V CRE'));
 const opponentBench=new PokemonCardList();
 opponentBench.cards.push(card('Marshadow UNB'));
 opponent.bench=[opponentBench];
 const store=new Store({onStateChange(){}});
 const state=store.state;
 state.players=[opponent,source];
 state.activePlayer=1;
 state.turn=8;
 state.phase=GamePhase.PLAYER_TURN;
 const retreatCost=new CheckRetreatCostEffect(source);
 store.reduceEffect(state,retreatCost);
 const initialCost=retreatCost.cost.length;
 const beforeOpponentDamage=opponent.active.damage;
 store.dispatch(new RetreatAction(source.id,0));
 assert.equal(source.active.getPokemonCard().fullName,"Lillie's Clefairy ex JTG");
 assert.equal(source.active.energies.cards.length,2);
 store.dispatch(new AttackAction(source.id,'Full Moon Rondo'));
 for(let i=0;i<10;i++){
  const prompt=state.prompts.find(p=>
    p.result===undefined&&p.constructor.name==='WaitPrompt');
  if(!prompt)break;
  store.dispatch(new ResolvePromptAction(prompt.id,null));
 }
 const afterOpponentDamage=opponent.active.damage;
 return {initialCost,afterActive:source.active.getPokemonCard().fullName,
  afterOpponentDamage,deltaDamage:afterOpponentDamage-beforeOpponentDamage,
  benchOwn:source.bench.length,benchOpponent:opponent.bench.length,
  attackName:state.playerLastAttack[source.id]?.attack?.name??null,
  sourceRetreatCount:source.retreatCount??null};
}

test('pinned native Latias Skyliner promotes two-Psychic Clefairy to real Rondo damage',()=>{
 const x=nativeFundedRondoCase();
 assert.equal(x.initialCost,0);
 assert.equal(x.afterActive,"Lillie's Clefairy ex JTG");
 assert.equal(x.deltaDamage,60);
 assert.equal(x.attackName,'Full Moon Rondo');
});
module.exports={nativeFundedRondoCase};
