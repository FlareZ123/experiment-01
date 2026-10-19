'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const {prepare}=require('./iron-thorns-turn2-attack.cjs');
const {planOpeningHand,dceHandAttachmentBlocked}=
  require('./rank6-broad-thorns-policy.cjs');

const output=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
const {PlayCardAction,PlayerType,SlotType}=
  require(path.join(output,'game/store/actions/play-card-action'));

/**
 * Preserve every physical prepared-state Card instance while moving the
 * preattached DCE into the owner's hand. This is a synthetic native Store
 * fixture, not an authentic Aichi initial source deal.
 * @returns {{store:object,state:object,a:object,b:object,dce:object}}
 */
function makeHeldDce() {
  const prepared=prepare(true);
  const {a}=prepared;
  const [dce]=a.active.energies.cards;
  assert.equal(dce?.name,'Double Colorless Energy');
  assert.ok(a.active.cards.includes(dce));
  a.active.energies.cards.splice(a.active.energies.cards.indexOf(dce),1);
  a.active.cards.splice(a.active.cards.indexOf(dce),1);
  a.hand.cards.push(dce);
  assert.equal(a.active.energies.cards.length,0);
  assert.equal(a.active.getPokemonCard()?.name,'Iron Thorns ex');
  return {...prepared,dce};
}

/**
 * @param {{a:object}} fixture
 * @returns {object}
 */
function manualDceAction(fixture) {
  const index=fixture.a.hand.cards.findIndex(
    c=>c.name==='Double Colorless Energy');
  assert.ok(index>=0);
  return new PlayCardAction(fixture.a.id,index,{
    player:PlayerType.BOTTOM_PLAYER,slot:SlotType.ACTIVE,index:0
  });
}

/**
 * Source-state-neutral pinned Store falsification:
 * same printed DCE and synthetic board, changing only whether the player
 * has already made a manual Energy attachment on this turn.
 * @returns {object}
 */
function main() {
  const legal=makeHeldDce();
  const exhausted=makeHeldDce();
  assert.deepEqual(legal.a.hand.cards.map(c=>c.fullName),
    exhausted.a.hand.cards.map(c=>c.fullName));
  assert.deepEqual(legal.a.active.cards.map(c=>c.fullName),
    exhausted.a.active.cards.map(c=>c.fullName));
  assert.equal(legal.state.turn,exhausted.state.turn);
  assert.equal(legal.state.activePlayer,exhausted.state.activePlayer);

  legal.a.energyPlayedTurn=0;
  exhausted.a.energyPlayedTurn=exhausted.state.turn;

  const heldHand=legal.a.hand.cards.map(c=>({name:c.name}));
  assert.equal(planOpeningHand(heldHand,true)?.channel,'direct');
  assert.equal(planOpeningHand(heldHand,true,undefined,false,{
    energyAlreadyAttached:true
  }),null);
  assert.equal(dceHandAttachmentBlocked(legal.a,legal.state),false);
  assert.equal(dceHandAttachmentBlocked(
    exhausted.a,exhausted.state),true);

  // The unspent arm proves the exact physical DCE and Active target are
  // otherwise acceptable to the same pinned Store.
  legal.store.dispatch(manualDceAction(legal));
  assert.equal(legal.a.hand.cards.includes(legal.dce),false);
  assert.equal(legal.a.active.energies.cards.includes(legal.dce),true);
  assert.equal(legal.a.energyPlayedTurn,legal.state.turn);

  // The spent arm must fail for the *specific* native code, before any
  // attachment occurs. An unrelated INVALID_TARGET would not pass.
  assert.throws(()=>exhausted.store.dispatch(manualDceAction(exhausted)),
    e=>e?.message==='ENERGY_ALREADY_ATTACHED',
    'Pinned Store must refuse a second normal manual attachment');
  assert.equal(exhausted.a.hand.cards.includes(exhausted.dce),true);
  assert.equal(exhausted.a.active.energies.cards.includes(
    exhausted.dce),false);

  const result={
    fixture:'rank6-manual-attachment-native-v1',
    actualAichiSourceDeal:false,
    engineRevision:'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    candidateCard:'Double Colorless Energy SUM',
    activePokemon:'Iron Thorns ex TWM',
    actualStoreFirstAttachmentAccepted:true,
    actualStoreSecondAttachmentRejected:'ENERGY_ALREADY_ATTACHED',
    handAndActivePreparedCardsEqual:true,
    preflightVetoedSpentAttachment:true,
    actualCompleteGame:false,
    qualifiedForCompetitiveInference:false
  };
  process.stdout.write(JSON.stringify(result,null,2)+'\n');
  return result;
}

if(require.main===module) main();
module.exports={main,makeHeldDce,manualDceAction};
