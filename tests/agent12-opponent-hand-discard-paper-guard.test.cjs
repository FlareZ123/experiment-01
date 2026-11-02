'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {VERSION,handDiscardPaperViolation,withPaperOpponentHandDiscards}=
  require('../simulation/twinleaf/agent12-opponent-hand-discard-paper-guard.cjs');

const types={SuperType:{ENERGY:'ENERGY',TRAINER:'TRAINER',POKEMON:'POKEMON'}};
class ChooseCardsPrompt{}
class ResolvePromptAction{
  constructor(id,result){this.id=id;this.result=result;}
}
class FakeStore{
  constructor(state){this.state=state;this.accepted=[];}
  dispatch(action){this.accepted.push(action);return action.result;}
}
function fixture(print){
  const p={id:1,hand:{cards:[]}},o={id:2,hand:{cards:[]}};
  const pokemon={superType:'POKEMON'},basic={superType:'ENERGY'},
    special={superType:'ENERGY'},tool={superType:'TRAINER'};
  o.hand.cards=[pokemon,basic,special,tool];
  const prompt=Object.assign(new ChooseCardsPrompt(),{
    id:101,playerId:p.id,result:undefined,
    cards:o.hand,message:'CHOOSE_CARD_TO_DISCARD',
    sourceCard:{fullName:print},options:{min:0,max:2},
    validate(selected){
      return Array.isArray(selected)&&selected.length<=2&&
        selected.every(x=>print==='Team Skull Grunt SUM'?
          x.superType==='ENERGY':x===special||x===tool);
    }
  });
  const state={players:[p,o],prompts:[prompt]};
  return {prompt,state,store:new FakeStore(state),pokemon,basic,special,tool};
}
test('physical per-card print eligibility detects outsider and count despite permissive native min-zero metadata',()=>{
  const s=fixture('Sidney FST 241');
  assert.equal(handDiscardPaperViolation(s.prompt,[s.special,s.tool],s.state,types),null);
  assert.equal(handDiscardPaperViolation(s.prompt,[],s.state,types),null);
  assert.equal(handDiscardPaperViolation(s.prompt,[s.pokemon],s.state,types),
    'PINNED_PRINTED_TARGET_FILTER_OR_COUNT_INVALID');
  assert.equal(handDiscardPaperViolation(s.prompt,[s.tool,s.tool],s.state,types),
    'SELECTION_MUST_USE_DISTINCT_PHYSICAL_CARDS');
  assert.equal(handDiscardPaperViolation(s.prompt,[{}],s.state,types),
    'CARD_NOT_IN_OPPONENT_HAND');
  const t=fixture('Team Skull Grunt SUM');
  assert.equal(handDiscardPaperViolation(t.prompt,[t.basic,t.special],t.state,types),null);
  assert.equal(handDiscardPaperViolation(t.prompt,[],t.state,types),
    'TEAM_SKULL_MUST_DISCARD_UP_TO_TWO_AVAILABLE_ENERGY');
  assert.equal(handDiscardPaperViolation(t.prompt,[t.pokemon,t.tool],t.state,types),
    'PINNED_PRINTED_TARGET_FILTER_OR_COUNT_INVALID');
  t.state.players[1].hand.cards=[t.pokemon,t.tool];
  assert.equal(handDiscardPaperViolation(t.prompt,[],t.state,types),null);
});
test('reversible source-stamped Store guard preserves native legal and vetoes prohibited targets',()=>{
  const original=Object.getOwnPropertyDescriptor(FakeStore.prototype,'dispatch');
  for(const printing of ['Sidney FST 241','Team Skull Grunt SUM']){
    const f=fixture(printing);
    const good=printing==='Sidney FST 241'?[f.special,f.tool]:[f.basic,f.special];
    const out=withPaperOpponentHandDiscards(()=>{
      assert.throws(()=>f.store.dispatch(new ResolvePromptAction(101,[f.pokemon])),
        /PAPER_OPPONENT_HAND_TARGET_INVALID/);
      assert.deepEqual(f.store.dispatch(new ResolvePromptAction(101,good)),good);
      return 'done';
    },{Store:FakeStore,types});
    assert.equal(out.audit.version,VERSION);
    assert.equal(out.audit.inspected,2);
    assert.equal(out.audit.vetoed,1);
    assert.equal(out.audit.accepted,1);
    assert.equal(out.audit.qualifiedCompetitiveGames,0);
    assert.equal(f.store.accepted.length,1);
    assert.deepEqual(Object.getOwnPropertyDescriptor(FakeStore.prototype,'dispatch'),original);
  }
});
