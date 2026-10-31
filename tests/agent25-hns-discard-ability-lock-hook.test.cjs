'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {
  withCorrectedHnsDiscardAbilityCount,VERSION,pin
}=require('../simulation/twinleaf/agent25-hns-discard-ability-lock-paper-hook.cjs');

class FakePokemonCard {
  constructor(name,psychic=true){
    this.powers=[{powerType:'ABILITY',name,psychic}];
    this.attacks=[{name:'test'}];
  }
}
function fixture(){
  const helper={countHideNSneakPokemonInDiscard(player){
    return player.discard.cards.filter(c=>c.powers?.some(p=>
      p.name==="Hide 'n' Sneak")).length;
  }};
  class Dhelmise extends FakePokemonCard {
    constructor(){super('unrelated');this.attacks=[{name:'Vengeful Anchor'}];}
    reduceEffect(store,state,effect){
      if(effect.attack===this.attacks[0]&&
         helper.countHideNSneakPokemonInDiscard(effect.player)>=4)
        effect.damage+=140;
      return state;
    }
  }
  class Sinistcha extends FakePokemonCard {
    constructor(){super('unrelated');this.attacks=[{name:'Matcha Spin'}];}
    reduceEffect(store,state,effect){
      if(effect.attack===this.attacks[0]&&
         helper.countHideNSneakPokemonInDiscard(effect.player)>=6)
        effect.spread=40;
      return state;
    }
  }
  class Spiritomb extends FakePokemonCard {
    constructor(){super('unrelated');this.attacks=[{name:'Spiritual End'}];}
    reduceEffect(store,state,effect){
      if(effect.attack===this.attacks[0]&&
         helper.countHideNSneakPokemonInDiscard(effect.player)>=13)
        effect.quadruple=true;
      return state;
    }
  }
  const prefabs={
    WAS_ATTACK_USED:(effect,i,card)=>effect.attack===card.attacks[i],
    IS_ABILITY_BLOCKED:(store,state,owner,card,power)=>
      state.blocked.has(card)||power.name==='No Ability'
  };
  const deps={classes:[Dhelmise,Sinistcha,Spiritomb],
    PokemonCard:FakePokemonCard,
    PowerType:{ABILITY:'ABILITY'},prefabs,helper};
  const attack=(card,player)=>({attack:card.attacks[0],player,damage:30});
  return {Dhelmise,Sinistcha,Spiritomb,helper,deps,attack};
}
function donors(number){
  return {discard:{cards:Array.from({length:number},(_,i)=>
    new FakePokemonCard("Hide 'n' Sneak",i%2===0))}};
}

test('pinned identity and explicit optional hook',()=>{
  assert.equal(typeof VERSION,'string');
  assert.equal(pin,'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05');
  const f=fixture();
  const owner=donors(4),card=new f.Dhelmise();
  const event=f.attack(card,owner);
  card.reduceEffect(null,{blocked:new Set(owner.discard.cards)},event);
  assert.equal(event.damage,170,'original wrongly ignores Ability blockers');
});

test('corrected Dhelmise changes only real named Ability donors',()=>{
  const f=fixture(),owner=donors(5),card=new f.Dhelmise();
  const first=f.attack(card,owner);
  const state={blocked:new Set(owner.discard.cards.slice(0,2))};
  const saved=card.reduceEffect;
  card.reduceEffect(null,state,first);
  assert.equal(first.damage,170);
  const {result,audit}=withCorrectedHnsDiscardAbilityCount(()=>{
    const attacked=f.attack(card,owner);
    card.reduceEffect(null,state,attacked);
    assert.equal(attacked.damage,30);
    return attacked.damage;
  },f.deps);
  assert.equal(result,30);
  assert.equal(audit.rawNamedDonors,5);
  assert.equal(audit.effectiveDonors,3);
  assert.equal(audit.suppressedDonors,2);
  assert.equal(audit.changedThresholdOutcomes,1);
  assert.equal(audit.originalHelperRestored,true);
  assert.equal(audit.allPrototypesRestored,true);
  assert.strictEqual(card.reduceEffect,saved);
  const after=f.attack(card,owner);
  card.reduceEffect(null,state,after);
  assert.equal(after.damage,170);
});

test('corrected count under a blocked power works for all three attacks',()=>{
  const f=fixture(),owner=donors(13);
  const state={blocked:new Set(owner.discard.cards.slice(0,8))};
  const {audit}=withCorrectedHnsDiscardAbilityCount(()=>{
    const d=new f.Dhelmise(),s=new f.Sinistcha(),sp=new f.Spiritomb();
    const e1=f.attack(d,owner),e2=f.attack(s,owner),e3=f.attack(sp,owner);
    d.reduceEffect(null,state,e1);
    s.reduceEffect(null,state,e2);
    sp.reduceEffect(null,state,e3);
    assert.equal(e1.damage,170,'five unblocked donor count qualifies Dhelmise');
    assert.equal(e2.spread,undefined,'five unblocked donors fail six threshold');
    assert.equal(e3.quadruple,undefined,'five unblocked donors fail thirteen');
  },f.deps);
  assert.equal(audit.attackReducerCalls,3);
  assert.equal(audit.countChecks,3);
  assert.equal(audit.suppressedDonors,24);
  assert.equal(audit.changedThresholdOutcomes,3);
});

test('unrelated reducer effects bypass count override',()=>{
  const f=fixture(),card=new f.Dhelmise(),owner=donors(4);
  const raw=f.helper.countHideNSneakPokemonInDiscard;
  withCorrectedHnsDiscardAbilityCount(()=>{
    const unrelated={attack:{name:'unrelated'},player:owner,damage:30};
    card.reduceEffect(null,{blocked:new Set(owner.discard.cards)},unrelated);
    assert.equal(unrelated.damage,30);
    assert.strictEqual(f.helper.countHideNSneakPokemonInDiscard,raw);
  },f.deps);
  assert.strictEqual(f.helper.countHideNSneakPokemonInDiscard,raw);
});

test('throwing experiment restores every shared native prototype',()=>{
  const f=fixture();
  const proto=f.Dhelmise.prototype;
  const original=Object.getOwnPropertyDescriptor(proto,'reduceEffect');
  const helper=f.helper.countHideNSneakPokemonInDiscard;
  assert.throws(()=>withCorrectedHnsDiscardAbilityCount(()=>{
    throw Error('forced test interruption');
  },f.deps),/forced test interruption/);
  assert.deepEqual(Object.getOwnPropertyDescriptor(proto,'reduceEffect'),original);
  assert.strictEqual(f.helper.countHideNSneakPokemonInDiscard,helper);
});

