'use strict';

/*
 * Not a matchup/game or owner-V3 admission.
 * Optional pinned compiled-Twinleaf REDUCER smoke. Build vendor/twinleaf first
 * and run locally as:
 *   node --test tests/2026-11/agent21-rank15-spiky-hopper-native-smoke.test.cjs
 *
 * This test directly invokes native AttackEffect during a synthetic ATTACK
 * phase; it does NOT establish physical attack-cost availability, evolution
 * timing, live Supporter sequencing, or a complete legal game.
 */

const assert=require('node:assert/strict');
const test=require('node:test');
const fs=require('node:fs');
const path=require('node:path');
const {withPaperRank15SpikyHopper,ENGINE_PIN}=
  require('../../simulation/twinleaf/agent21-rank15-spiky-hopper-paper-hook.cjs');

const output=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
const load=file=>require(path.join(output,file));
const PRINT={
  mega:'sets/11-mega-evolution/set-phantasmal-flames/mega-lopunny-ex',
  shadow:'sets/09-sword-and-shield/set-chilling-reign/shadow-rider-calyrex-v',
  powerful:'sets/09-sword-and-shield/set-darkness-ablaze/powerful-colorless-energy',
  belt:'sets/10-scarlet-and-violet/set-paldea-evolved/choice-belt'
};
const compiledPresent=fs.existsSync(path.join(output,PRINT.mega+'.js'));
const skipMessage='requires built pinned Twinleaf output at '+output;

test('native printed Spiky Hopper gives baseline 160 and attached +20/+30',
  {skip:compiledPresent?false:skipMessage},()=>{
    assert.equal(ENGINE_PIN,
      'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05');
    const {Store}=load('game/store/store');
    const {State,GamePhase}=load('game/store/state/state');
    const {Player}=load('game/store/state/player');
    const {AttackEffect}=load('game/store/effects/game-effects');
    const {MegaLopunnyex}=load(PRINT.mega);
    const {ShadowRiderCalyrexV}=load(PRINT.shadow);
    const {PowerfulColorlessEnergy}=load(PRINT.powerful);
    const {ChoiceBelt}=load(PRINT.belt);

    function attack({seat,powerful=false,belt=false,hook=false}) {
      const state=new State(),own=new Player(),opponent=new Player();
      own.id=100;opponent.id=200;
      own.name='rank15 Mega Lopunny';opponent.name='210 HP Shadow Rider V';
      state.players=seat===0?[own,opponent]:[opponent,own];
      state.activePlayer=seat;
      state.phase=GamePhase.ATTACK;state.turn=5;
      const attacker=new MegaLopunnyex(),target=new ShadowRiderCalyrexV();
      attacker.id=101;target.id=201;
      own.active.cards.push(attacker);opponent.active.cards.push(target);
      if(powerful) {
        const energy=new PowerfulColorlessEnergy();
        energy.id=102;
        own.active.cards.push(energy);
        own.active.energies.cards.push(energy);
      }
      if(belt) {
        const tool=new ChoiceBelt();
        tool.id=103;
        own.active.cards.push(tool);
        own.active.tools.push(tool);
      }
      const store=new Store({gameSettings:state.gameSettings,
        onStateChange(){},onPrompt(){},onFinish(){}});
      store.state=state;
      const effect=new AttackEffect(own,opponent,attacker.attacks[1]);
      const execute=()=>store.reduceEffect(state,effect);
      const result=hook?withPaperRank15SpikyHopper(execute):execute();
      assert.equal(result,state);
      assert.equal(effect.damage,0,
        'Both stock and patched shred paths must suppress generic double damage');
      return opponent.active.damage;
    }

    for(const seat of [0,1]) {
      assert.equal(attack({seat}),160,
        'Native unpatched baseline should deliver 160');
      assert.equal(attack({seat,powerful:true,belt:true}),160,
        'Native unpatched modifier bypass establishes regression');
      assert.equal(attack({seat,hook:true}),160);
      assert.equal(attack({seat,powerful:true,hook:true}),180);
      assert.equal(attack({seat,belt:true,hook:true}),190);
      assert.equal(attack({seat,powerful:true,belt:true,hook:true}),210);
    }
  });
