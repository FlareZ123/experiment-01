'use strict';

/*
 * OPTIONAL PINNED native Store prompt-level smoke, NOT a competitive game.
 * Requires the built pinned Twinleaf at vendor/twinleaf/ptcg-server/output.
 *
 *   node --test tests/2026-11/agent21-kyurem-trifrost-native-prompt-smoke.test.cjs
 *
 * Direct AttackEffect bypasses normal attack-cost/attachment sequencing;
 * do not infer a successful legal attack or matchup result. Does validate
 * actual native ChoosePokemonPrompt count/selection on two physical seats.
 */

const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const test=require('node:test');
const {withPaperKyuremTrifrostTargets,ENGINE_PIN}=
  require('../../simulation/twinleaf/agent21-kyurem-trifrost-target-prompt-paper-hook.cjs');
const output=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
const kyuremPath='sets/10-scarlet-and-violet/set-shrouded-fable/kyurem';
const exists=fs.existsSync(path.join(output,kyuremPath+'.js'));
const load=p=>require(path.join(output,p));

test('native Kyurem SFA Trifrost prompt is exactly three distinct targets',
  {skip:exists?false:'requires compiled pinned Twinleaf'},()=>{
    assert.equal(ENGINE_PIN,
      'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05');
    const {Store}=load('game/store/store');
    const {State,GamePhase}=load('game/store/state/state');
    const {Player}=load('game/store/state/player');
    const {AttackEffect}=load('game/store/effects/game-effects');
    const {ChoosePokemonPrompt}=load(
      'game/store/prompts/choose-pokemon-prompt');
    const {Kyurem}=load(kyuremPath);
    const {Girafarig}=load(
      'sets/08-sun-and-moon/set-lost-thunder/girafarig');

    function one(seat,count,patched) {
      const own=new Player(),opponent=new Player(),state=new State();
      own.id=101;opponent.id=202;
      own.name='rank Regidrago copied Kyurem';
      opponent.name='opponent public board';
      state.players=seat===0?[own,opponent]:[opponent,own];
      state.activePlayer=seat;
      state.phase=GamePhase.ATTACK;state.turn=4;
      const kyurem=new Kyurem();kyurem.id=11;
      own.active.cards.push(kyurem);
      const current=[];
      for(let i=0;i<count;i++){
        const card=new Girafarig();card.id=201+i;
        if(i===0){opponent.active.cards.push(card);current.push(opponent.active);}
        else{
          const {PokemonCardList}=load('game/store/state/pokemon-card-list');
          const benchSlot=new PokemonCardList();
          benchSlot.cards.push(card);
          opponent.bench.push(benchSlot);
          current.push(benchSlot);
        }
      }
      const store=new Store({gameSettings:state.gameSettings,
        onStateChange(){},onPrompt(){},onFinish(){}});
      store.state=state;
      const effect=new AttackEffect(own,opponent,kyurem.attacks[0]);
      const f=()=>store.reduceEffect(state,effect);
      const result=patched?withPaperKyuremTrifrostTargets(f):f();
      assert.equal(result,state);
      const prompts=state.prompts.filter(p=>p instanceof ChoosePokemonPrompt);
      assert.equal(prompts.length,1);
      const prompt=prompts[0];
      if(!patched){
        assert.equal(prompt.options.min,1);
        assert.equal(prompt.options.max,3);
        return;
      }
      const req=Math.min(3,count);
      assert.equal(prompt.options.min,req);
      assert.equal(prompt.options.max,req);
      assert.equal(prompt.validate(current.slice(0,req),state),true);
      if(req>1){
        assert.equal(prompt.validate(current.slice(0,req-1),state),false);
        assert.equal(prompt.validate(Array(req).fill(current[0]),state),false);
      }
      assert.equal(prompt.validate([own.active,...current.slice(1,req)],state),false);
    }

    for(const seat of [0,1]){
      one(seat,3,false);
      for(const count of [1,2,3,4])one(seat,count,true);
    }
  });
