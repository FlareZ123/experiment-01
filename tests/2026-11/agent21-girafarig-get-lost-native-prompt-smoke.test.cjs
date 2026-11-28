'use strict';

/*
 * Optional real pinned-Twinleaf Store PROMPT smoke (NOT a game).
 * Build vendor/twinleaf/ptcg-server/output first; then:
 *   node --test tests/2026-11/agent21-girafarig-get-lost-native-prompt-smoke.test.cjs
 *
 * Direct AttackEffect bypasses physical Energy, turn, and legality checks.
 * This test is a source-card damage/discard prompt regression only. It makes
 * no claim about win rates or player policy qualification.
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const test=require('node:test');
const {withPaperGirafarigGetLost,ENGINE_PIN}=
  require('../../simulation/twinleaf/agent21-girafarig-get-lost-compulsory-selection-paper-hook.cjs');

const output=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
const girafarigPath='sets/08-sun-and-moon/set-lost-thunder/girafarig';
const exists=fs.existsSync(path.join(output,girafarigPath+'.js'));
const load=p=>require(path.join(output,p));

test('pinned Get Lost native ChooseCardsPrompt count, compulsory use, distinct cards',
  {skip:exists?false:'requires compiled pinned Twinleaf'},()=>{
    assert.equal(ENGINE_PIN,
      'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05');
    const {Store}=load('game/store/store');
    const {State,GamePhase}=load('game/store/state/state');
    const {Player}=load('game/store/state/player');
    const {AttackEffect}=load('game/store/effects/game-effects');
    const {ChooseCardsPrompt}=load(
      'game/store/prompts/choose-cards-prompt');
    const {Girafarig}=load(girafarigPath);
    const {DialgaGX}=load(
      'sets/08-sun-and-moon/set-ultra-prism/dialga-gx');

    function one(seat,discardCount,patched){
      const state=new State(),owner=new Player(),opponent=new Player();
      owner.id=101;opponent.id=202;
      owner.name='Girafarig Get Lost';opponent.name='opposing Dragon discard';
      state.players=seat===0?[owner,opponent]:[opponent,owner];
      state.activePlayer=seat;state.phase=GamePhase.ATTACK;state.turn=5;
      const attacker=new Girafarig();attacker.id=1000;
      owner.active.cards.push(attacker);
      for(let i=0;i<discardCount;i++){
        const dragon=new DialgaGX();dragon.id=2000+i;
        opponent.discard.cards.push(dragon);
      }
      const store=new Store({gameSettings:state.gameSettings,
        onStateChange(){},onPrompt(){},onFinish(){}});
      store.state=state;
      const attack=new AttackEffect(owner,opponent,attacker.attacks[0]);
      const fire=()=>store.reduceEffect(state,attack);
      const returned=patched?withPaperGirafarigGetLost(fire):fire();
      assert.equal(returned,state);
      const prompts=state.prompts.filter(p=>p instanceof ChooseCardsPrompt);
      assert.equal(prompts.length,1);
      const prompt=prompts[0];
      const expected=Math.min(2,discardCount);
      if(!patched){
        assert.equal(prompt.options.min,2);
        assert.equal(prompt.options.max,2);
        assert.equal(prompt.options.allowCancel,true);
        return;
      }
      assert.equal(prompt.options.min,expected);
      assert.equal(prompt.options.max,expected);
      assert.equal(prompt.options.allowCancel,false);
      const cards=opponent.discard.cards;
      assert.equal(prompt.validate(cards.slice(0,expected),state),true);
      assert.equal(prompt.validate(null,state),false);
      if(expected>0)
        assert.equal(prompt.validate([],state),false);
      if(expected===2){
        assert.equal(prompt.validate([cards[0]],state),false);
        assert.equal(prompt.validate([cards[0],cards[0]],state),false);
        assert.equal(prompt.validate([cards[0],owner.active.getPokemonCard()],state),false);
      }
    }

    for(const seat of [0,1]){
      one(seat,2,false);
      for(const n of [0,1,2,3])one(seat,n,true);
    }
  });
