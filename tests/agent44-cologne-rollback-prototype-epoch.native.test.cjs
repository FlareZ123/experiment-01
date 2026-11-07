'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const path=require('node:path');
const {initializeCards}=require('../simulation/twinleaf/headless.cjs');
const {installCancelingCologneOncePerTurnHook}=
  require('../simulation/twinleaf/canceling-cologne-once-per-turn-hook.cjs');

const output=path.resolve(__dirname,'../vendor/twinleaf/ptcg-server/output');
/** @param {string} filename Compiled pinned Twinleaf module. */
const native=filename=>require(path.join(output,filename));
const {Store}=native('game/store/store');
const {Player}=native('game/store/state/player');
const {State}=native('game/store/state/state');
const {Card}=native('game/store/card/card');
const {deepClone}=native('utils/utils');
const {GameLog}=native('game/game-message');
const FIELD='__researchCancelingCologneLastPlayedTurn';

/**
 * Reproduce the actual pinned deepClone inheritance chain created when the
 * Store rolls back an illegal action. This previously made delete resurrect
 * a stale Cologne-use marker in a sudden-death tiebreaker.
 * @returns {object} Genuine Store State and two pinned rollback clones.
 */
function nativeRollbackChain(){
  const source=new State();
  const first=new Player();
  first.id=202;
  first[FIELD]=4;
  source.turn=4;
  source.players=[first,new Player()];
  const rollback=deepClone(source,[Card]);
  const nested=deepClone(rollback,[Card]);
  assert.notStrictEqual(rollback.players[0],first);
  assert.notStrictEqual(nested.players[0],rollback.players[0]);
  assert.strictEqual(Object.getPrototypeOf(rollback.players[0]),first);
  assert.strictEqual(Object.getPrototypeOf(nested.players[0]),
    rollback.players[0]);
  assert.equal(nested.players[0][FIELD],4);
  return {source,rollback,nested};
}

test('pinned rollback clone exposes inherited marker after ordinary delete',()=>{
  const {nested}=nativeRollbackChain();
  const owner=nested.players[0];
  assert.equal(Object.hasOwn(owner,FIELD),true);
  delete owner[FIELD];
  assert.equal(Object.hasOwn(owner,FIELD),false);
  assert.equal(owner[FIELD],4,
    'Pinnned Object.create deepClone makes delete reveal stale prior marker');
});

test('paper hook shadows inherited quota and preserves unrelated log gate',()=>{
  const {nested}=nativeRollbackChain();
  const store=new Store({onStateChange(){}});
  store.state=nested;
  const owner=nested.players[0];
  const card=initializeCards().getCardByName('Canceling Cologne ASR');
  assert.ok(card,'Expected exact pinned ASR Item');
  const originalCanPlay=Object.getPrototypeOf(card).canPlay;
  const restore=installCancelingCologneOncePerTurnHook();
  assert.strictEqual(installCancelingCologneOncePerTurnHook(),restore,
    'Installing same paper hook twice must be idempotent');
  try{
    assert.equal(card.canPlay(store,nested,owner),false);
    store.log(nested,GameLog.LOG_PLAYER_PLAYS_SUPPORTER);
    assert.equal(owner[FIELD],4,'Other public logs must keep current quota');
    assert.equal(card.canPlay(store,nested,owner),false);

    store.log(nested,GameLog.LOG_SUDDEN_DEATH);
    assert.equal(Object.hasOwn(owner,FIELD),true,
      'Reset must explicitly shadow inherited previously spent quota');
    assert.equal(owner[FIELD],undefined);
    assert.equal(Object.getPrototypeOf(owner)[FIELD],4,
      'Prior source state remains immutable and historically marked');
    assert.equal(card.canPlay(store,nested,owner),true,
      'The replayed first Cologne must be offered after epoch reset');

    const nextClone=deepClone(nested,[Card]);
    assert.equal(nextClone.players[0][FIELD],undefined,
      'Subsequent native speculative clone preserves the reset shadow');
    assert.equal(card.canPlay(store,nextClone,nextClone.players[0]),true);
  }finally{
    restore();
    restore();
  }
  assert.strictEqual(Object.getPrototypeOf(card).canPlay,originalCanPlay,
    'Hook restoration must recover exact pinned class method');
});
