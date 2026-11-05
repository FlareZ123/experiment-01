'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {captureTwoPsychicRetreat,settleTwoPsychicRetreat,
  withTwoPsychicRetreatCustody}=
  require('../simulation/twinleaf/agent42-two-psychic-retreat-physical-custody.cjs');

class RetreatAction{
  constructor(clientId,benchIndex){Object.assign(this,{clientId,benchIndex});}
}
class ResolvePromptAction{}
const pokemon=name=>({fullName:name});
const slot=(name,energyNames)=>({
  cards:[pokemon(name)],
  energies:{cards:energyNames.map(fullName=>({fullName}))},
  tools:{cards:[]},
  getPokemonCard(){return this.cards[0];}
});

function setup({seat=1,retreatType='immediate',tamper=null}={}){
  const old=slot('Shadow Rider Calyrex VMAX CRE',
    ['Psychic Energy MEE','Psychic Energy MEE']);
  const target=slot('Shadow Rider Calyrex VMAX CRE',
    ['Psychic Energy MEE','Psychic Energy MEE','Psychic Energy MEE']);
  const player={id:27,active:old,bench:[target],
    discard:{cards:[]},retreatedTurn:0};
  const other={id:59,active:slot('Lunatone OBF',[]),bench:[]};
  const state={turn:34,activePlayer:seat,
    players:seat===1?[other,player]:[player,other],prompts:[]};
  class Store{
    constructor(){this.state=state;}
    dispatch(action){
      if(action.constructor.name==='RetreatAction'){
        if(retreatType==='reject')throw Error('native cannot Retreat');
        player.active=target;
        player.bench[0]=old;
        player.retreatedTurn=34;
        if(retreatType==='prompt')state.prompts=[{
          id:1,playerId:player.id,result:undefined,
          constructor:{name:'ChooseCardsPrompt'}
        }];
        else if(retreatType==='immediate'){
          player.discard.cards.push(...old.energies.cards.splice(0,2));
        }
        if(typeof tamper==='function')tamper(player,old,target);
      }
      if(action.constructor.name==='ResolvePromptAction'){
        player.discard.cards.push(...old.energies.cards.splice(0,2));
        state.prompts[0].result=true;
      }
      return 'Store accepted';
    }
  }
  return {Store,store:new Store(),player,other,state,old,target};
}

test('two real physical card objects are required before native root',()=>{
  const f=setup();
  const action=new RetreatAction(f.player.id,0);
  const captured=captureTwoPsychicRetreat(f.state,action);
  assert.ok(captured);
  assert.equal(captured.payment.length,2);
  assert.notStrictEqual(captured.payment[0],captured.payment[1]);
  assert.equal(captured.seat,1);
});

for(const seat of [0,1]){
  test('same-physical-object native Store fee and promotion seat '+seat,()=>{
    const f=setup({seat});
    const original=f.Store.prototype.dispatch;
    const r=withTwoPsychicRetreatCustody(()=>{
      f.store.dispatch(new RetreatAction(f.player.id,0));
      return 'finished';
    },{Store:f.Store});
    assert.equal(r.result,'finished');
    assert.equal(r.audit.exactPhysicalPaidRetreats,1);
    assert.equal(r.audit.pendingAtEnd,0);
    assert.equal(r.audit.receipts[0].sourceSeat,seat);
    assert.equal(r.audit.receipts[0].targetEnergyUnchanged,true);
    assert.strictEqual(f.Store.prototype.dispatch,original);
  });
}

test('deferred actual payment is certified after accepted prompt',()=>{
  const f=setup({retreatType:'prompt'});
  const r=withTwoPsychicRetreatCustody(()=>{
    f.store.dispatch(new RetreatAction(f.player.id,0));
    f.store.dispatch(new ResolvePromptAction());
  },{Store:f.Store});
  assert.equal(r.audit.attempts,1);
  assert.equal(r.audit.exactPhysicalPaidRetreats,1);
});

test('accepted but free native retreat is not a paid paper certificate',()=>{
  const f=setup({retreatType:'no-payment'});
  const r=withTwoPsychicRetreatCustody(()=>{
    f.store.dispatch(new RetreatAction(f.player.id,0));
  },{Store:f.Store});
  assert.equal(r.audit.exactPhysicalPaidRetreats,0);
  assert.equal(r.audit.receipts[0].status,
    'PAYMENT_OR_PROMOTION_UNVERIFIED');
});

test('wrong physical promotion does not pass exact identity proof',()=>{
  const f=setup({tamper:(owner,old)=>{
    owner.active=slot('Shadow Rider Calyrex VMAX CRE',
      ['Psychic Energy MEE','Psychic Energy MEE','Psychic Energy MEE']);
  }});
  const r=withTwoPsychicRetreatCustody(()=>{
    f.store.dispatch(new RetreatAction(f.player.id,0));
  },{Store:f.Store});
  assert.equal(r.audit.exactPhysicalPaidRetreats,0);
  assert.equal(r.audit.receipts[0].exactPhysicalPromotion,false);
});

test('a foreign player cannot claim owner-paid source Retreat',()=>{
  const f=setup();
  const r=withTwoPsychicRetreatCustody(()=>{
    f.store.dispatch(new RetreatAction(f.other.id,0));
  },{Store:f.Store});
  assert.equal(r.audit.attempts,0);
});

test('an unpayable single Psychic cost cannot enter a two-card certificate',()=>{
  const f=setup();
  f.old.energies.cards.pop();
  assert.equal(captureTwoPsychicRetreat(
    f.state,new RetreatAction(f.player.id,0)),null);
});

test('rejected Store action leaves error evidence and restores hook',()=>{
  const f=setup({retreatType:'reject'});
  const original=f.Store.prototype.dispatch;
  assert.throws(()=>withTwoPsychicRetreatCustody(()=>{
    f.store.dispatch(new RetreatAction(f.player.id,0));
  },{Store:f.Store}),/native cannot Retreat/);
  assert.strictEqual(f.Store.prototype.dispatch,original);
});

test('paid Energy cannot remain attached to old Benched VMAX',()=>{
  const f=setup({tamper:(owner,old)=>{
    old.energies.cards.push(owner.discard.cards[0]);
  }});
  const r=withTwoPsychicRetreatCustody(()=>{
    f.store.dispatch(new RetreatAction(f.player.id,0));
  },{Store:f.Store});
  assert.equal(r.audit.exactPhysicalPaidRetreats,0);
  assert.equal(r.audit.receipts[0].paidCardsAbsentFromBoard,false);
});

test('two-Basic exact fee proof cannot be duplicated on repeated turn',()=>{
  const f=setup();
  const r=withTwoPsychicRetreatCustody(()=>{
    f.store.dispatch(new RetreatAction(f.player.id,0));
    f.store.dispatch(new RetreatAction(f.player.id,0));
  },{Store:f.Store});
  assert.equal(r.audit.attempts,1);
  assert.equal(r.audit.exactPhysicalPaidRetreats,1);
});
