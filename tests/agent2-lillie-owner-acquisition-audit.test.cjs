'use strict';

const assert=require('node:assert/strict');
const test=require('node:test');
const {withNativeLillieOwnerAcquisitionAudit}=
  require('../simulation/twinleaf/agent2-lillie-owner-acquisition-audit.cjs');

class AddPlayerAction{}
class PlayCardAction{
  /** @param {number} id @param {number} handIndex */
  constructor(id,handIndex){this.id=id;this.handIndex=handIndex;}
}
class ResolvePromptAction{}

const card=(fullName,pokemon=false)=>({
  fullName,attacks:pokemon?[{name:'Test attack'}]:undefined
});
const L="Lillie's Determination M1L";
const T='Trevenant & Dusknoir-GX UNM';
const R='Radiant Eternatus CRZ';

/** @param {0|1} seat @param {boolean} preAlreadyHad */
function game(seat,preAlreadyHad=false){
  const owner={id:50+seat,hand:{cards:[
    card(L),card(preAlreadyHad?T:'Other Trainer'),card('Other Energy')]}};
  const opponent={id:99,hand:{cards:[card('PRIVATE OPPONENT HAND')]},deck:{
    cards:[card('PRIVATE OPPONENT DECK')]}};
  const stored=seat===0?[owner,opponent]:[opponent,owner];
  const drawn=[
    card(T,true),card(R,true),card('Energy 1'),card('Energy 2'),
    card('Energy 3'),card('Trainer 1'),card('Trainer 2'),card('Trainer 3')
  ];
  class Store{
    constructor(){this.state={turn:seat===0?2:4,
      players:stored,prompts:[]};}
    dispatch(action){
      if(action instanceof AddPlayerAction)return true;
      if(action instanceof PlayCardAction){
        const p=this.state.players.find(x=>x.id===action.id);
        const found=p.hand.cards.splice(action.handIndex,1)[0];
        if(found.fullName===L){
          p.hand.cards=[];this.state.prompts=[{result:undefined}];
        }
        return found;
      }
      if(action instanceof ResolvePromptAction){
        owner.hand.cards=drawn.slice();
        this.state.prompts=[];
        return true;
      }
      throw new Error('Unexpected fake dispatch');
    }
  }
  return {Store,owner,opponent,T,R,seat};
}
for(const seat of [0,1]){
  for(const preAlreadyHad of [false,true]){
    test('read-only owner acquisition seat '+seat+' pre-existing='+preAlreadyHad,()=>{
      const g=game(seat,preAlreadyHad);
      const originalDispatch=g.Store.prototype.dispatch;
      const done=withNativeLillieOwnerAcquisitionAudit(()=>{
        const store=new g.Store();
        store.dispatch(new AddPlayerAction());
        store.dispatch(new PlayCardAction(g.owner.id,0));
        store.dispatch(new ResolvePromptAction());
        assert.equal(g.owner.hand.cards.length,8);
        store.dispatch(new PlayCardAction(g.owner.id,0));
        return 'done';
      },{Store:g.Store});
      assert.equal(done.result,'done');
      assert.equal(done.audit.rootAttempts,1);
      assert.equal(done.audit.settledSameTurn,1);
      assert.equal(done.audit.firstSubsequentPokemonPlays,1);
      const witness=done.audit.records[0];
      assert.equal(witness.firstNextPokemonPlay.printing,T);
      assert.equal(witness.firstNextPokemonPlay.existedBeforeShuffle,preAlreadyHad);
      assert.equal(witness.firstNextPokemonPlay.existedImmediatelyAfterDraw,true);
      assert.equal(done.audit.newlyAccessiblePokemonFromPostdrawHand,
        preAlreadyHad?0:1);
      assert.equal(done.audit.competitiveQualified,false);
      assert.equal(JSON.stringify(done.audit).includes('PRIVATE OPPONENT'),false);
      assert.strictEqual(g.Store.prototype.dispatch,originalDispatch);
    });
  }
}
test('no observed Lillie is not manufactured from generic game actions',()=>{
  const g=game(0);
  const done=withNativeLillieOwnerAcquisitionAudit(()=>{
    const store=new g.Store();
    store.dispatch(new AddPlayerAction());
    return true;
  },{Store:g.Store});
  assert.equal(done.audit.rootAttempts,0);
});
test('native errors propagate and descriptor is restored',()=>{
  const g=game(1);
  const before=g.Store.prototype.dispatch;
  assert.throws(()=>withNativeLillieOwnerAcquisitionAudit(()=>{
    const store=new g.Store();
    store.dispatch(new AddPlayerAction());
    throw new Error('controlled experiment failure');
  },{Store:g.Store}),/controlled experiment failure/);
  assert.strictEqual(g.Store.prototype.dispatch,before);
});
