'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const path=require('node:path');
const {stage}=
  require('../simulation/twinleaf/agent5-attack-special-arbitration-native.cjs');
const {initializeCards}=require('../simulation/twinleaf/headless.cjs');
const {installPassClearsLastAttackHook}=
  require('../simulation/twinleaf/last-attack-pass-hook.cjs');

const output=path.resolve(__dirname,'../vendor/twinleaf/ptcg-server/output');
/** @param {string} p */
const native=p=>require(path.join(output,p));
const {AttackAction,PassTurnAction}=
  native('game/store/actions/game-actions');
const {PlayCardAction,PlayerType,SlotType}=
  native('game/store/actions/play-card-action');
const {ResolvePromptAction}=native('game/store/actions/resolve-prompt-action');
const invalidTarget={player:PlayerType.ANY,slot:SlotType.BOARD,index:0};

/** @param {object} store */
function settle(store){
  for(let n=0;n<24;n++){
    const prompt=store.state.prompts.find(p=>p.result===undefined);
    if(!prompt)return;
    assert.equal(prompt.constructor.name,'WaitPrompt');
    store.dispatch(new ResolvePromptAction(prompt.id,null));
  }
  assert.fail('Unsettled native turn boundary');
}

/**
 * @param {0|1} seat
 * @param {boolean} causeRollback
 * @returns {object} Real paid attack followed by a later pass.
 */
function lastAttackAfterPass(seat,causeRollback){
  const x=stage(seat),restore=installPassClearsLastAttackHook();
  try{
    const store=x.store,owner=x.owner,other=x.opponent;
    const manager=initializeCards();
    let uniqueId=940000+seat*1000;
    const make=name=>{
      const card=manager.getCardByName(name);
      assert.ok(card,'Pinned printed card missing: '+name);
      card.id=uniqueId++;
      return card;
    };
    other.active.cards.length=0;
    other.active.energies.cards.length=0;
    other.active.cards.push(make('Mimikyu GRI'));
    for(let n=0;n<2;n++){
      const energy=make('Psychic Energy SVE');
      other.active.cards.push(energy);
      other.active.energies.cards.push(energy);
    }
    store.dispatch(new AttackAction(owner.id,'Gnaw'));
    settle(store);
    assert.equal(store.state.activePlayer,1-seat);
    assert.equal(store.state.playerLastAttack[owner.id]?.attack.name,'Gnaw');

    store.dispatch(new PassTurnAction(other.id));
    settle(store);
    assert.equal(store.state.activePlayer,seat);
    const pre=store.state;
    let rejection=null;
    if(causeRollback){
      try{
        store.dispatch(new PlayCardAction(owner.id,999,invalidTarget));
      }catch(error){rejection=error.name+': '+error.message;}
      assert.ok(rejection,'Deliberately illegal hand index must force rollback');
      assert.notStrictEqual(store.state,pre);
      assert.strictEqual(
        Object.getPrototypeOf(store.state.playerLastAttack),
        pre.playerLastAttack,
        'Real pinned Store rollback must inherit preceding attack map');
      assert.equal(Object.hasOwn(store.state.playerLastAttack,owner.id),true);
      const attackMap=store.state.playerLastAttack;
      const current=attackMap[owner.id];
      delete attackMap[owner.id];
      assert.equal(attackMap[owner.id]?.attack.name,'Gnaw',
        'Counterfactual old delete resurrects inherited stale attack');
      attackMap[owner.id]=current;
    }
    const player=store.state.players[seat];
    assert.equal(store.state.playerLastAttack[player.id]?.attack.name,'Gnaw');
    store.dispatch(new PassTurnAction(player.id));
    settle(store);
    const staleRecordAfterPass=
      store.state.playerLastAttack[player.id]?.attack.name??null;
    assert.equal(store.state.activePlayer,1-seat);
    const damageBefore=store.state.players[seat].active.damage;
    store.dispatch(new AttackAction(other.id,'Copycat'));
    settle(store);
    const copiedDamage=store.state.players[seat].active.damage-damageBefore;
    return {
      seat,rollback:causeRollback,rejection,
      copiedDamageFromPaperInvalidStaleAttack:copiedDamage,
      mimikyuActualCopycatSettled:true,
      staleRecordAfterPass,
      remainingOwnRecord:
        Object.hasOwn(store.state.playerLastAttack,player.id),
      remainingInheritedRecord:
        Object.getPrototypeOf(store.state.playerLastAttack)[player.id]
          ?.attack.name??null,
      actualStorePassAccepted:true,qualifiedCompetitiveGames:0
    };
  }finally{restore();}
}

for(const seat of [0,1]){
  test('actual native LastAttack Pass invalid-rollback shadow, seat '+seat,()=>{
    const control=lastAttackAfterPass(seat,false);
    const rollback=lastAttackAfterPass(seat,true);
    assert.equal(control.staleRecordAfterPass,null);
    assert.equal(rollback.staleRecordAfterPass,null,
      'Paper Pass must clear inherited prior attack after real Store rollback');
    assert.equal(control.copiedDamageFromPaperInvalidStaleAttack,0);
    assert.equal(rollback.copiedDamageFromPaperInvalidStaleAttack,0,
      'Native Mimikyu Copycat must not copy Gnaw from two opponent turns ago');
    console.log('AGENT44_LAST_ATTACK_ROLLBACK',JSON.stringify({
      seat,control,rollback,competitiveQualifiedGames:0
    }));
  });
}
