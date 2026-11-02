'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {publicMirrorOpportunity,withPublicMirrorObserver}=
  require('../simulation/twinleaf/agent19-dual-mew-source-observer.cjs');

/** @param {string|null} name @param {string[]} [energy] */
function slot(name,energy=[]){
  return {getPokemonCard:()=>name?{fullName:name}:null,
    energies:{cards:energy.map(fullName=>({fullName}))}};
}
function state(options={}){
  const mew={id:101,active:slot(options.active??'Mew VMAX FST',
    options.energy??['Double Colorless Energy SUM']),
    bench:[slot(options.mirror===false?'Genesect V FST':'Mew VMAX FST')]};
  const opponent={id:202,
    active:slot(options.opponent??'Mimikyu PAL'),bench:[],
    secretHand:['NEVER_READ'],secretDeck:['NEVER_READ']};
  return {phase:5,turn:7,players:[mew,opponent],
    prompts:options.offer?[Object.assign(new ChooseAttackPrompt(),{
      playerId:101,result:undefined,
      cards:[{fullName:'Mew VMAX FST',
        attacks:[{name:'Max Miracle'}]}]})]:[],
    secretPrize:['NEVER_READ']};
}
class ChooseAttackPrompt{}
class AddPlayerAction{}
class PlayCardAction{}
class Store{dispatch(){return 'accepted';}}

test('owner public mirror view requires both evolved Mew, DCE and PAL97',()=>{
  const view=publicMirrorOpportunity(state(),0);
  assert.equal(view.dual,true);assert.equal(view.paid,true);
  assert.equal(view.allPublicBoardPieces,true);
  assert.equal(view.offeredMaxMiracle,false);
  for(const options of [{mirror:false},{energy:[]},
    {opponent:'Iron Thorns ex TWM'},{active:'Genesect V FST'}]){
    assert.equal(publicMirrorOpportunity(state(options),0)
      .allPublicBoardPieces,false);
  }
});

test('genuine offered owner prompt is separately recorded',()=>{
  assert.equal(publicMirrorOpportunity(state({offer:true}),0)
    .offeredMaxMiracle,true);
});

test('observer counts only real live Store, not other speculative stores',()=>{
  const original=Store.prototype.dispatch;
  const s=state({offer:true});s.phase=5; // injected enum
  const outcome=withPublicMirrorObserver(()=>{
    const live=new Store();live.state=s;
    live.dispatch(new AddPlayerAction());
    live.dispatch(new PlayCardAction());
    const sim=new Store();sim.state=s;
    sim.dispatch(new PlayCardAction());
    return 9;
  },0,{Store,GamePhase:{PLAYER_TURN:5}});
  assert.equal(outcome.result,9);
  assert.equal(outcome.audit.seenStoreActions,2);
  assert.equal(outcome.audit.fullPublicBoard,2);
  assert.equal(outcome.audit.actualOfferedMirror,2);
  assert.deepEqual(outcome.audit.first.fullPublicBoard.attached,
    ['Double Colorless Energy SUM']);
  assert.strictEqual(Store.prototype.dispatch,original);
  assert.equal(JSON.stringify(outcome.audit).includes('NEVER_READ'),false);
});

test('observer restores native Store hook after downstream failure',()=>{
  const original=Store.prototype.dispatch;
  assert.throws(()=>withPublicMirrorObserver(()=>{throw Error('NATIVE_ABORT');},
    0,{Store,GamePhase:{PLAYER_TURN:5}}),/NATIVE_ABORT/);
  assert.strictEqual(Store.prototype.dispatch,original);
});
