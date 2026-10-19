'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const {initializeCards}=require('./headless.cjs');
const {withHorrorHouseExtraPsychicHook}=
  require('./gengar-horror-house-extra-psychic-hook.cjs');
const output=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
/** @param {string} name @returns {any} */
const load=name=>require(path.join(output,name));

/**
 * Staged genuine-Store inverse-energy condition audit, no source-dealt games.
 * @param {'basic'|'telepath'} second
 * @param {boolean} temple
 * @returns {object}
 */
function probe(second,temple) {
  const manager=initializeCards();
  let serial=100;
  /** @param {string} name */
  const card=name=>{
    const found=manager.getCardByName(name);
    assert.ok(found,'Missing pinned printing '+name);
    found.id=serial++;
    return found;
  };
  const {Store}=load('game/store/store');
  const {Player}=load('game/store/state/player');
  const {CardList}=load('game/store/state/card-list');
  const {GamePhase}=load('game/store/state/state');
  const {Format,CardType,SuperType}=load('game/store/card/card-types');
  const {CheckProvidedEnergyEffect}=load('game/store/effects/check-effects');
  const {StateUtils}=load('game/store/state-utils');
  const {AttackAction}=load('game/store/actions/game-actions');
  const store=new Store({onStateChange(){}});
  const state=store.state;
  const source=new Player(),opponent=new Player();
  source.id=101;opponent.id=202;
  source.active.cards.push(card('Gengar & Mimikyu-GX TEU'));
  opponent.active.cards.push(card('Pidgey MEW'));
  for(const name of ['Psychic Energy SVE',
    second==='basic'?'Psychic Energy SVE':'Telepath [P] Energy M3']) {
    const energy=card(name);
    source.active.cards.push(energy);
    source.active.energies.cards.push(energy);
  }
  if(temple)opponent.stadium.cards.push(card('Temple of Sinnoh ASR'));
  for(const p of [source,opponent]){
    for(let i=0;i<12;i++)p.deck.cards.push(card('Psychic Energy SVE'));
    for(let i=0;i<6;i++){
      const prize=new CardList();
      prize.cards.push(card('Psychic Energy SVE'));
      p.prizes.push(prize);
    }
  }
  state.players=[source,opponent];
  state.activePlayer=0;
  state.turn=2;
  state.phase=GamePhase.PLAYER_TURN;
  state.gameSettings.format=Format.EXPANDED;
  const provided=new CheckProvidedEnergyEffect(source,source.active);
  store.reduceEffect(state,provided);
  const dynamicExtra=StateUtils.checkEnoughEnergy(
    provided.energyMap,[CardType.PSYCHIC,CardType.PSYCHIC]);
  const rawPrintedCount=source.active.cards.filter(c=>
    c.superType===SuperType.ENERGY&&
    c.provides.includes(CardType.PSYCHIC)).length;
  store.dispatch(new AttackAction(source.id,'Horror House-GX'));
  assert.equal(source.usedGX,true);
  assert.equal(opponent.cannotPlayItemCards,true);
  return {
    second,temple,dynamicExtra,rawPrintedCount,
    dynamicMap:provided.energyMap.map(e=>({
      card:e.card.fullName,provides:e.provides
    })),
    sourceHand:source.hand.cards.length,
    opponentHand:opponent.hand.cards.length
  };
}

function run(){
  const control=probe('basic',true);
  const free=probe('telepath',false);
  const temple=probe('telepath',true);
  const legacyHook=withHorrorHouseExtraPsychicHook(()=>
    probe('telepath',true));
  assert.equal(control.dynamicExtra,true);
  assert.equal(free.dynamicExtra,true);
  assert.equal(temple.dynamicExtra,false);
  assert.equal(temple.rawPrintedCount,2);
  assert.equal(temple.sourceHand,7,
    'Expected pinned false-positive draw under Temple');
  assert.equal(temple.opponentHand,7);
  assert.equal(legacyHook.sourceHand,7,
    'Expected existing additive correction to leave reverse mismatch');
  return {
    schema:'gengar-horror-house-temple-static-overcount-staged-v1',
    pinned:'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    control,free,temple,legacyHook,
    paperExpectedUnderTemple:0,
    qualifiedForCompetitiveInference:false
  };
}

if(require.main===module)process.stdout.write(JSON.stringify(run(),null,2)+'\n');
module.exports={run,probe};
