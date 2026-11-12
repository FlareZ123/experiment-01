'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const path=require('node:path');
const {stage}=require('../../simulation/twinleaf/agent5-attack-special-arbitration-native.cjs');
const {initializeCards}=require('../../simulation/twinleaf/headless.cjs');
const {installUnderworldDoorPsychicRecipientHook}=require(
  '../../simulation/twinleaf/underworld-door-psychic-recipient-hook.cjs');
const native=name=>require(path.resolve(__dirname,
  '../../vendor/twinleaf/ptcg-server/output',name));

function stagedSource(seat,{sourceInActive=false}={}){
  const x=stage(seat),manager=initializeCards();
  let id=83000+seat*200;
  const card=name=>{
    const value=manager.getCardByName(name);
    assert.ok(value,name);
    value.id=id++;
    return value;
  };
  for(const slot of x.owner.bench)slot.cards.length=0;
  let psychic=null,offType=null;
  if(sourceInActive){
    x.owner.active.cards.length=0;
    x.owner.active.cards.push(card('Shadow Rider Calyrex V CRE'),
      card('Shadow Rider Calyrex VMAX CRE'));
    offType=x.owner.bench[0];
    offType.cards.push(card('Dialga-GX UPR'));
  }else{
    psychic=x.owner.bench[0];
    offType=x.owner.bench[1];
    psychic.cards.push(card('Shadow Rider Calyrex V CRE'),
      card('Shadow Rider Calyrex VMAX CRE'));
    offType.cards.push(card('Dialga-GX UPR'));
  }
  x.owner.hand.cards.length=0;
  const energy=card('Psychic Energy SVE');
  x.owner.hand.cards.push(energy);
  x.owner.deck.cards.length=0;
  for(let i=0;i<4;i++)x.owner.deck.cards.push(card('Psychic Energy SVE'));
  return {x,energy,psychic,offType,card};
}

function stagedDynamicSource(seat,attachedEnergyName){
  const x=stage(seat),manager=initializeCards();
  let id=83400+seat*200;
  const card=name=>{
    const value=manager.getCardByName(name);
    assert.ok(value,name);
    value.id=id++;
    return value;
  };
  for(const slot of x.owner.bench)slot.cards.length=0;
  x.owner.active.cards.length=0;
  x.owner.active.cards.push(card('Shadow Rider Calyrex V CRE'),
    card('Shadow Rider Calyrex VMAX CRE'));
  const dynamic=x.owner.bench[0];
  dynamic.cards.push(card('Kecleon CRE'));
  const attached=card(attachedEnergyName);
  dynamic.cards.push(attached);
  dynamic.energies.cards.push(attached);
  x.owner.hand.cards.length=0;
  const energy=card('Psychic Energy SVE');
  x.owner.hand.cards.push(energy);
  x.owner.deck.cards.length=0;
  for(let i=0;i<4;i++)x.owner.deck.cards.push(card('Psychic Energy SVE'));
  return {x,energy,dynamic,attached};
}

for(const seat of [0,1])test(
  'existing paper hook rejects non-Psychic Bench recipient through real Store, seat '+seat,
  ()=>{
    const {x,energy,psychic,offType}=stagedSource(seat);
    const {UseAbilityAction}=native('game/store/actions/game-actions');
    const {ResolvePromptAction}=native('game/store/actions/resolve-prompt-action');
    const {PlayerType,SlotType}=native('game/store/actions/play-card-action');
    const {GameMessage}=native('game/game-message');
    const ownerId=x.owner.id;
    const restore=installUnderworldDoorPsychicRecipientHook();
    try{
      x.store.dispatch(new UseAbilityAction(ownerId,'Underworld Door',{
        player:PlayerType.BOTTOM_PLAYER,slot:SlotType.BENCH,index:0
      }));
      let pending=x.state.prompts.find(p=>p.result===undefined);
      assert.equal(pending?.constructor.name,'WaitPrompt');
      x.store.dispatch(new ResolvePromptAction(pending.id,null));
      pending=x.state.prompts.find(p=>p.result===undefined);
      assert.equal(pending?.constructor.name,'AttachEnergyPrompt');

      const illegal=[{card:energy,to:{
        player:PlayerType.BOTTOM_PLAYER,slot:SlotType.BENCH,index:1
      }}];
      assert.equal(pending.validate(illegal),false);
      assert.throws(()=>x.store.dispatch(
        new ResolvePromptAction(pending.id,illegal)),
      error=>error.message===GameMessage.INVALID_PROMPT_RESULT);
      assert.equal(x.owner.hand.cards.includes(energy),true);
      assert.equal(offType.energies.cards.includes(energy),false);
      assert.equal(psychic.energies.cards.includes(energy),false);
      assert.equal(x.owner.deck.cards.length,4);
    }finally{
      restore();
    }
  }
);

test('existing paper hook refuses Underworld Door when no Psychic Bench target exists',()=>{
  const {x,energy}=stagedSource(0,{sourceInActive:true});
  const {UseAbilityAction}=native('game/store/actions/game-actions');
  const {PlayerType,SlotType}=native('game/store/actions/play-card-action');
  const {GameMessage}=native('game/game-message');
  const restore=installUnderworldDoorPsychicRecipientHook();
  try{
    assert.throws(()=>x.store.dispatch(new UseAbilityAction(x.owner.id,
      'Underworld Door',{
        player:PlayerType.BOTTOM_PLAYER,slot:SlotType.ACTIVE,index:0
      })),
    error=>error.message===GameMessage.CANNOT_USE_POWER);
    assert.equal(x.owner.hand.cards.includes(energy),true);
    assert.equal(x.state.prompts.filter(p=>p.result===undefined).length,0);
  }finally{
    restore();
  }
});

for(const seat of [0,1])test(
  'existing paper hook rejects non-Psychic Basic Energy on a Psychic recipient through real Store, seat '+seat,
  ()=>{
    const {x,energy,psychic,card}=stagedSource(seat);
    const nonPsychicEnergy=card('Lightning Energy SVE');
    x.owner.hand.cards.push(nonPsychicEnergy);
    const {UseAbilityAction}=native('game/store/actions/game-actions');
    const {ResolvePromptAction}=native('game/store/actions/resolve-prompt-action');
    const {PlayerType,SlotType}=native('game/store/actions/play-card-action');
    const {GameMessage}=native('game/game-message');
    const restore=installUnderworldDoorPsychicRecipientHook();
    try{
      x.store.dispatch(new UseAbilityAction(x.owner.id,'Underworld Door',{
        player:PlayerType.BOTTOM_PLAYER,slot:SlotType.BENCH,index:0
      }));
      let pending=x.state.prompts.find(p=>p.result===undefined);
      assert.equal(pending?.constructor.name,'WaitPrompt');
      x.store.dispatch(new ResolvePromptAction(pending.id,null));
      pending=x.state.prompts.find(p=>p.result===undefined);
      assert.equal(pending?.constructor.name,'AttachEnergyPrompt');
      const illegal=[{card:nonPsychicEnergy,to:{
        player:PlayerType.BOTTOM_PLAYER,slot:SlotType.BENCH,index:0
      }}];
      assert.equal(pending.validate(illegal),false);
      assert.throws(()=>x.store.dispatch(
        new ResolvePromptAction(pending.id,illegal)),
      error=>error.message===GameMessage.INVALID_PROMPT_RESULT);
      assert.equal(x.owner.hand.cards.includes(energy),true);
      assert.equal(x.owner.hand.cards.includes(nonPsychicEnergy),true);
      assert.equal(psychic.energies.cards.includes(nonPsychicEnergy),false);
      assert.equal(x.owner.deck.cards.length,4);
    }finally{
      restore();
    }
  }
);

for(const seat of [0,1])test(
  'existing paper hook accepts dynamically Psychic Chromashift Kecleon, seat '+seat,
  ()=>{
    const {x,energy,dynamic}=stagedDynamicSource(seat,'Psychic Energy SVE');
    const {CheckPokemonTypeEffect}=native('game/store/effects/check-effects');
    const {CardType}=native('game/store/card/card-types');
    const typeCheck=new CheckPokemonTypeEffect(dynamic);
    x.store.reduceEffect(x.state,typeCheck);
    assert.ok(typeCheck.cardTypes.includes(CardType.PSYCHIC),
      'Chromashift must expose Psychic through the native type-effect pipeline');
    const {UseAbilityAction}=native('game/store/actions/game-actions');
    const {ResolvePromptAction}=native('game/store/actions/resolve-prompt-action');
    const {PlayerType,SlotType}=native('game/store/actions/play-card-action');
    const restore=installUnderworldDoorPsychicRecipientHook();
    try{
      x.store.dispatch(new UseAbilityAction(x.owner.id,'Underworld Door',{
        player:PlayerType.BOTTOM_PLAYER,slot:SlotType.ACTIVE,index:0
      }));
      let pending=x.state.prompts.find(p=>p.result===undefined);
      assert.equal(pending?.constructor.name,'WaitPrompt');
      x.store.dispatch(new ResolvePromptAction(pending.id,null));
      pending=x.state.prompts.find(p=>p.result===undefined);
      assert.equal(pending?.constructor.name,'AttachEnergyPrompt');
      const valid=[{card:energy,to:{
        player:PlayerType.BOTTOM_PLAYER,slot:SlotType.BENCH,index:0
      }}];
      assert.equal(pending.validate(valid),true);
      x.store.dispatch(new ResolvePromptAction(pending.id,valid));
      assert.equal(dynamic.energies.cards.includes(energy),true);
      assert.equal(x.owner.hand.cards.includes(energy),false);
      assert.equal(x.owner.deck.cards.length,2);
    }finally{
      restore();
    }
  }
);

for(const seat of [0,1])test(
  'existing paper hook rejects non-Psychic Chromashift Kecleon without Psychic Basic Energy, seat '+seat,
  ()=>{
    const {x,energy,dynamic}=stagedDynamicSource(seat,'Lightning Energy SVE');
    const {CheckPokemonTypeEffect}=native('game/store/effects/check-effects');
    const {CardType}=native('game/store/card/card-types');
    const typeCheck=new CheckPokemonTypeEffect(dynamic);
    x.store.reduceEffect(x.state,typeCheck);
    assert.equal(typeCheck.cardTypes.includes(CardType.PSYCHIC),false,
      'Chromashift must not expose Psychic when only Lightning Basic Energy is attached');
    const {UseAbilityAction}=native('game/store/actions/game-actions');
    const {PlayerType,SlotType}=native('game/store/actions/play-card-action');
    const {GameMessage}=native('game/game-message');
    const restore=installUnderworldDoorPsychicRecipientHook();
    try{
      assert.throws(()=>x.store.dispatch(new UseAbilityAction(x.owner.id,
        'Underworld Door',{
          player:PlayerType.BOTTOM_PLAYER,slot:SlotType.ACTIVE,index:0
        })),
      error=>error.message===GameMessage.CANNOT_USE_POWER);
      assert.equal(x.owner.hand.cards.includes(energy),true);
      assert.equal(dynamic.energies.cards.includes(energy),false);
      assert.equal(x.state.prompts.filter(p=>p.result===undefined).length,0);
    }finally{
      restore();
    }
  }
);
