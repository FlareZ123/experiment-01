'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const path=require('node:path');
const {initializeCards}=require('../simulation/twinleaf/headless.cjs');

const output=path.resolve(__dirname,'../vendor/twinleaf/ptcg-server/output');
/** @param {string} filename @returns {any} */
const engine=filename=>require(path.join(output,filename));

/**
 * Preserve the candidate's physical Latias Active and two exact Bench
 * identities from source-first rank6 seed 407516727. Contrast only which
 * source Basic is Active, retaining both source Basics and Tool Jammer.
 * This is a staged mechanical control, never a replayed candidate choice.
 *
 * @param {boolean} thornsActive
 * @returns {{blocked:boolean,cost:number,retreatAccepted:boolean,
 *   beforeActive:string,afterActive:string,error:string|null}}
 */
function caseWithSourcePosition(thornsActive){
  const {Store}=engine('game/store/store');
  const {GamePhase}=engine('game/store/state/state');
  const {Player}=engine('game/store/state/player');
  const {CardList}=engine('game/store/state/card-list');
  const {PokemonCardList}=engine('game/store/state/pokemon-card-list');
  const {CheckRetreatCostEffect}=engine('game/store/effects/check-effects');
  const {RetreatAction}=engine('game/store/actions/game-actions');
  const {IS_ABILITY_BLOCKED}=engine('game/store/prefabs/prefabs');
  const cards=initializeCards();
  const get=name=>{
    const card=cards.getCardByName(name);
    assert.ok(card,'Pinned card not found: '+name);
    return card;
  };
  const source=new Player();
  source.id=101;
  source.name='rank6-source';
  const candidate=new Player();
  candidate.id=202;
  candidate.name='champion-candidate';
  for(const player of [source,candidate]){
    player.prizes=[new CardList()];
    player.prizes[0].cards.push(get('Psychic Energy SVE'));
  }
  const thorns=get('Iron Thorns ex TWM');
  const spare=get('Marshadow UNB');
  const thornsSlot=new PokemonCardList();
  thornsSlot.cards.push(thorns);
  thornsSlot.tools.push(get('Tool Jammer BST'));
  const spareSlot=new PokemonCardList();
  spareSlot.cards.push(spare);
  source.active=thornsActive?thornsSlot:spareSlot;
  source.bench=[thornsActive?spareSlot:thornsSlot];
  const latias=get('Latias ex SSP');
  candidate.active.cards.push(latias);
  for(const name of ['Tapu Lele-GX GRI','Marshadow UNB']){
    const slot=new PokemonCardList();
    slot.cards.push(get(name));
    candidate.bench.push(slot);
  }
  const store=new Store({onStateChange(){}});
  const state=store.state;
  state.players=[source,candidate];
  state.turn=2;
  state.activePlayer=1;
  state.phase=GamePhase.PLAYER_TURN;
  const blocked=Boolean(IS_ABILITY_BLOCKED(store,state,candidate,
    latias,latias.powers[0]));
  const retreatCheck=new CheckRetreatCostEffect(candidate);
  store.reduceEffect(state,retreatCheck);
  const cost=retreatCheck.cost.length;
  const beforeActive=candidate.active.getPokemonCard().fullName;
  let retreatAccepted=true;
  let error=null;
  try {
    store.dispatch(new RetreatAction(candidate.id,0));
  } catch(e) {
    retreatAccepted=false;
    error=String(e?.message??e);
  }
  return {blocked,cost,retreatAccepted,beforeActive,
    afterActive:candidate.active.getPokemonCard().fullName,error};
}

test('rank6 Active Initialization removes Latias Skyliner zero-cost retreat',()=>{
  const denied=caseWithSourcePosition(true);
  assert.equal(denied.beforeActive,'Latias ex SSP');
  assert.equal(denied.blocked,true);
  assert.equal(denied.cost,2);
  assert.equal(denied.retreatAccepted,false);
  assert.equal(denied.afterActive,'Latias ex SSP');
});

test('same board with Iron Thorns Benched restores zero-cost Latias retreat',()=>{
  const allowed=caseWithSourcePosition(false);
  assert.equal(allowed.beforeActive,'Latias ex SSP');
  assert.equal(allowed.blocked,false);
  assert.equal(allowed.cost,0);
  assert.equal(allowed.retreatAccepted,true);
  assert.equal(allowed.afterActive,'Tapu Lele-GX GRI');
});

module.exports={caseWithSourcePosition};
