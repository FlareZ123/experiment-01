'use strict';

/*
 * Opt-in native pinned Store REDUCER smoke. Requires compiled pinned
 * vendor/twinleaf/ptcg-server/output; no game, deck search, or owner Stage-A
 * dispatch. Run locally after build:
 * node --test tests/2026-11/agent21-regidrago-dialga-shred-native-smoke.test.cjs
 * 
 * The separate isolated test covers the delegated Regidrago Apex Dragon copy.
 * This smoke runs the printed Dialga-GX itself through real native Store and
 * real Tool classes; it does NOT establish physical Energy/turn legality.
 */

const fs=require('node:fs'),path=require('node:path');
const assert=require('node:assert/strict'),test=require('node:test');
const {withPaperRegidragoDialgaShred,ENGINE_PIN}=
  require('../../simulation/twinleaf/agent21-regidrago-dialga-shred-paper-hook.cjs');
const output=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
const dialgaPath='sets/08-sun-and-moon/set-ultra-prism/dialga-gx';
const built=fs.existsSync(path.join(output,dialgaPath+'.js'));
const load=rel=>require(path.join(output,rel));

test('pinned Dialga UPR Shred actual Muscle Band XY +20 to 90HP Girafarig',
  {skip:built?false:'build pinned Twinleaf first'},()=>{
    assert.equal(ENGINE_PIN,
      'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05');
    const {Store}=load('game/store/store');
    const {State,GamePhase}=load('game/store/state/state');
    const {Player}=load('game/store/state/player');
    const {AttackEffect}=load('game/store/effects/game-effects');
    const {DialgaGX}=load(dialgaPath);
    const {MuscleBand}=load('sets/07-x-and-y/set-x-and-y/muscle-band');
    const {Girafarig}=load('sets/08-sun-and-moon/set-lost-thunder/girafarig');

    function one({seat,band,hook}) {
      const state=new State(),own=new Player(),opponent=new Player();
      own.id=11;opponent.id=22;
      state.players=seat===0?[own,opponent]:[opponent,own];
      state.activePlayer=seat;
      state.phase=GamePhase.ATTACK;
      state.turn=5;
      const attacker=new DialgaGX(),target=new Girafarig();
      attacker.id=110;target.id=220;
      own.active.cards.push(attacker);
      opponent.active.cards.push(target);
      if(band){
        const tool=new MuscleBand();tool.id=111;
        // Native Tool attachment custody is slot.tools (NOT slot.cards).
        own.active.tools.push(tool);
      }
      const store=new Store({gameSettings:state.gameSettings,
        onStateChange(){},onPrompt(){},onFinish(){}});
      store.state=state;
      const attack=new AttackEffect(own,opponent,attacker.attacks[1]);
      const fire=()=>store.reduceEffect(state,attack);
      const after=hook?withPaperRegidragoDialgaShred(fire):fire();
      assert.equal(after,state);
      assert.equal(attack.damage,0);
      return opponent.active.damage;
    }
    for(const seat of [0,1]){
      assert.equal(one({seat,band:false,hook:false}),80);
      assert.equal(one({seat,band:true,hook:false}),80,
        'Stock printed Shred must demonstrate the actual missing Tool effect');
      assert.equal(one({seat,band:false,hook:true}),80);
      assert.equal(one({seat,band:true,hook:true}),100,
        'Native Muscle Band reducer should make Shred KO 90HP Girafarig');
    }
  });
