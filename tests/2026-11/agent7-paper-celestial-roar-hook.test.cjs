'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {withPaperCelestialRoar}=
  require('../../simulation/twinleaf/agent7/paper-celestial-roar-hook.cjs');

class CardList{constructor(){this.cards=[];}}
class EnergyCard{constructor(name,type){this.fullName=name;this.energyType=type;}}
class AttachEnergyPrompt{
  constructor(playerId,message,cardList,playerType,slots,filter,options){
    Object.assign(this,{playerId,message,cardList,playerType,slots,filter,options});
  }
}
class RegidragoV{
  constructor(){this.attacks=[{name:'Celestial Roar'},{name:'Dragon Laser'}];}
  reduceEffect(){return 'delegated-dragon-laser';}
}
const game={CardList,EnergyCard,AttachEnergyPrompt,
  GameMessage:{ATTACH_ENERGY_CARDS:'ATTACH_ENERGY_CARDS'},
  PlayerType:{BOTTOM_PLAYER:2},SlotType:{ACTIVE:1},
  SuperType:{ENERGY:'ENERGY'},EnergyType:{BASIC:0,SPECIAL:1},
  StateUtils:{getTarget:(state,player,target)=>{
    assert.equal(target.slot,1);
    return player.active;
  }}
};
function fixture(names){
  const energyBasic=new EnergyCard('Fire Energy MEE',0);
  const energySpecial=new EnergyCard('Double Dragon Energy ROS',1);
  const trainerA={fullName:'Mysterious Treasure FLI'};
  const trainerB={fullName:'Battle Compressor PHF'};
  const byName={basic:energyBasic,special:energySpecial,
    trainerA,trainerB};
  const deck=new CardList();
  deck.cards=names.map(name=>byName[name]);
  const active=new CardList(),discard=new CardList(),player={id:41,deck,active,discard};
  const state={turn:2,players:[player]};
  const pokemon=new RegidragoV();
  let pending=null;
  const store={prompt:(s,p,callback)=>{
    pending={p,callback};
    return s;
  }};
  const MOVE_CARDS=(store,s,src,dest,options={})=>{
    const cards=options.cards??src.cards.slice(0,options.count??src.cards.length);
    for(const card of cards){
      const index=src.cards.indexOf(card);
      assert.ok(index>=0,'physical card must remain in original source');
      src.cards.splice(index,1);
      dest.cards.push(card);
    }
    return s;
  };
  const deps={RegidragoV,game,MOVE_CARDS,
    WAS_ATTACK_USED:(effect,index,p)=>effect.attack===p.attacks[index]};
  const run=()=>{
    const result=pokemon.reduceEffect(store,state,
      {player,attack:pokemon.attacks[0]});
    return {result,pending:()=>pending,player};
  };
  return {run,deps,byName,pokemon,player};
}
test('native hook attaches revealed Basic and Special, discards remainder once',()=>{
  const f=fixture(['trainerA','special','basic']);
  const outcome=withPaperCelestialRoar(()=>{
    const r=f.run();
    const pending=r.pending();
    assert.equal(pending.p.options.min,2);
    assert.equal(pending.p.options.max,2);
    assert.deepEqual(pending.p.filter,{superType:'ENERGY'});
    const transfers=[f.byName.energySpecial,f.byName.energyBasic].map(card=>({
      card,to:{player:2,slot:1,index:0}
    }));
    pending.callback(transfers);
    return r.result;
  },f.deps);
  assert.equal(outcome.result,f.run().result);
  assert.deepEqual(f.player.active.cards,
    [f.byName.energySpecial,f.byName.energyBasic]);
  assert.deepEqual(f.player.discard.cards,[f.byName.trainerA]);
  assert.equal(f.player.deck.cards.length,0);
  assert.equal(outcome.audit.specialEnergyOffered,1);
  assert.equal(outcome.audit.openedCards,3);
  assert.equal(outcome.audit.allRemaindersCleared,1);
});
test('native hook empties all three no-energy cards without mutation skipping',()=>{
  const f=fixture(['trainerA','trainerB','trainerA']);
  const outcome=withPaperCelestialRoar(()=>f.run().result,f.deps);
  assert.equal(outcome.audit.interceptedAttacks,1);
  assert.equal(outcome.audit.discardedRemainders,3);
  assert.equal(outcome.audit.allRemaindersCleared,1);
  assert.equal(f.player.discard.cards.length,3);
  assert.equal(f.player.deck.cards.length,0);
});
test('second attack delegates without replacing original game effect',()=>{
  const f=fixture(['basic']);
  const result=withPaperCelestialRoar(()=>
    f.pokemon.reduceEffect({}, {},{attack:f.pokemon.attacks[1]}),f.deps);
  assert.equal(result.result,'delegated-dragon-laser');
  assert.equal(result.audit.interceptedAttacks,0);
});
test('reversible prototype restored after success and exceptions',()=>{
  const f=fixture(['basic']);
  const original=RegidragoV.prototype.reduceEffect;
  withPaperCelestialRoar(()=>42,f.deps);
  assert.strictEqual(RegidragoV.prototype.reduceEffect,original);
  assert.throws(()=>withPaperCelestialRoar(()=>{
    throw new Error('test-native-abort');
  },f.deps),/test-native-abort/);
  assert.strictEqual(RegidragoV.prototype.reduceEffect,original);
});
