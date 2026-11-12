'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const path=require('node:path');
const {stage}=require('../../simulation/twinleaf/agent5-attack-special-arbitration-native.cjs');
const {initializeCards}=require('../../simulation/twinleaf/headless.cjs');
const {
  installUnderworldDoorPsychicRecipientHook,
  UNDERWORLD_DOOR_HOOK_ID,
  UNDERWORLD_DOOR_HOOK_TARGET
}=require('../../simulation/twinleaf/underworld-door-psychic-recipient-hook.cjs');
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
    const {pokemonHasCardType}=native('game/store/card/pokemon-card');
    assert.equal(pokemonHasCardType(dynamic.getPokemonCard(),CardType.PSYCHIC),false,
      'The pinned static card-type helper sees only Kecleon\'s printed Colorless type');
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

test('Underworld hook leaves a nested unrelated owner AttachEnergyPrompt untouched',()=>{
  const {x,card}=stagedSource(0);
  const lightning=card('Lightning Energy SVE');
  x.owner.hand.cards.push(lightning);
  const {AttachEnergyPrompt}=native('game/store/prompts/attach-energy-prompt');
  const {PlayerType,SlotType}=native('game/store/actions/play-card-action');
  const {ResolvePromptAction}=native('game/store/actions/resolve-prompt-action');
  const {UseAbilityAction}=native('game/store/actions/game-actions');
  const {GameMessage}=native('game/game-message');
  const {SuperType,EnergyType}=native('game/store/card/card-types');
  const unrelated=new AttachEnergyPrompt(x.owner.id,
    GameMessage.ATTACH_ENERGY_TO_ACTIVE,x.owner.hand,
    PlayerType.BOTTOM_PLAYER,[SlotType.ACTIVE],
    {superType:SuperType.ENERGY,energyType:EnergyType.BASIC,
      name:'Lightning Energy'},
    {allowCancel:true,min:1,max:1});
  const basePrompt=x.store.prompt;
  let injected=false;
  x.store.prompt=function(current,prompt,then){
    if(!injected&&prompt instanceof AttachEnergyPrompt&&
       prompt.message===GameMessage.ATTACH_ENERGY_TO_BENCH){
      injected=true;
      this.prompt(current,unrelated,()=>{});
    }
    return basePrompt.call(this,current,prompt,then);
  };
  const restore=installUnderworldDoorPsychicRecipientHook();
  try{
    x.store.dispatch(new UseAbilityAction(x.owner.id,'Underworld Door',{
      player:PlayerType.BOTTOM_PLAYER,slot:SlotType.BENCH,index:0
    }));
    let pending=x.state.prompts.find(p=>p.result===undefined&&
      p.constructor.name==='WaitPrompt');
    assert.ok(pending);
    x.store.dispatch(new ResolvePromptAction(pending.id,null));
    assert.equal(injected,true);
    assert.equal(x.state.prompts.includes(unrelated),true);
    const unrelatedAssignment=[{card:lightning,to:{
      player:PlayerType.BOTTOM_PLAYER,slot:SlotType.ACTIVE,index:0
    }}];
    assert.equal(unrelated.validate(unrelatedAssignment),true,
      'A non-Underworld AttachEnergyPrompt must retain its native validator');
    const actual=x.state.prompts.find(p=>p.result===undefined&&
      p instanceof AttachEnergyPrompt&&
      p.message===GameMessage.ATTACH_ENERGY_TO_BENCH&&
      p.cardList===x.owner.hand);
    assert.ok(actual,'Expected the actual Underworld prompt');
    const invalid=[{card:lightning,to:{
      player:PlayerType.BOTTOM_PLAYER,slot:SlotType.BENCH,index:0
    }}];
    assert.equal(actual.validate(invalid),false,
      'The Underworld prompt must still reject a non-Psychic source Energy');
  }finally{
    x.store.prompt=basePrompt;
    restore();
  }
});

for(const seat of [0,1])test(
  'existing paper hook rejects Special Horror Psychic Energy from hand, seat '+seat,
  ()=>{
    const {x,energy,psychic,card}=stagedSource(seat);
    const special=card('Horror Psychic Energy RCL');
    x.owner.hand.cards.push(special);
    const {EnergyType,CardType}=native('game/store/card/card-types');
    assert.equal(special.energyType,EnergyType.SPECIAL);
    assert.deepEqual(special.provides,[CardType.COLORLESS],
      'Horror Psychic Energy provides Psychic only while attached, not while in hand');
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
      pending=x.state.prompts.find(p=>p.result===undefined&&
        p.constructor.name==='AttachEnergyPrompt');
      assert.ok(pending);
      const illegal=[{card:special,to:{
        player:PlayerType.BOTTOM_PLAYER,slot:SlotType.BENCH,index:0
      }}];
      assert.equal(pending.validate(illegal),false);
      assert.throws(()=>x.store.dispatch(
        new ResolvePromptAction(pending.id,illegal)),
      error=>error.message===GameMessage.INVALID_PROMPT_RESULT);
      assert.equal(x.owner.hand.cards.includes(energy),true);
      assert.equal(x.owner.hand.cards.includes(special),true);
      assert.equal(psychic.energies.cards.includes(special),false);
      assert.equal(x.owner.deck.cards.length,4);
    }finally{
      restore();
    }
  }
);

for(const seat of [0,1])test(
  'existing paper hook rejects Special Telepathic Psychic Energy despite its static Psychic provides field, seat '+seat,
  ()=>{
    const {x,energy,psychic,card}=stagedSource(seat);
    const special=card('Telepath [P] Energy M3');
    x.owner.hand.cards.push(special);
    const {EnergyType,CardType}=native('game/store/card/card-types');
    assert.equal(special.energyType,EnergyType.SPECIAL);
    assert.deepEqual(special.provides,[CardType.PSYCHIC],
      'Twinleaf stores its attached-state Psychic provision on the card object');
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
      pending=x.state.prompts.find(p=>p.result===undefined&&
        p.constructor.name==='AttachEnergyPrompt');
      assert.ok(pending);
      const illegal=[{card:special,to:{
        player:PlayerType.BOTTOM_PLAYER,slot:SlotType.BENCH,index:0
      }}];
      assert.equal(pending.validate(illegal),false);
      assert.throws(()=>x.store.dispatch(
        new ResolvePromptAction(pending.id,illegal)),
      error=>error.message===GameMessage.INVALID_PROMPT_RESULT);
      assert.equal(x.owner.hand.cards.includes(energy),true);
      assert.equal(x.owner.hand.cards.includes(special),true);
      assert.equal(psychic.energies.cards.includes(special),false);
      assert.equal(x.owner.deck.cards.length,4);
    }finally{
      restore();
    }
  }
);

test('hook exposes exact runtime ownership receipt and enforces one install/restore',()=>{
  const {ShadowRiderCalyrexVMAX}=native(
    'sets/09-sword-and-shield/set-chilling-reign/shadow-rider-calyrex-vmax');
  const original=ShadowRiderCalyrexVMAX.prototype.reduceEffect;
  const restore=installUnderworldDoorPsychicRecipientHook();
  try{
    assert.equal(restore.patchId,UNDERWORLD_DOOR_HOOK_ID);
    assert.equal(restore.patchId,'underworld-door-psychic-recipient-v1');
    assert.equal(restore.target,UNDERWORLD_DOOR_HOOK_TARGET);
    assert.equal(restore.target,'ShadowRiderCalyrexVMAX.prototype.reduceEffect');
    assert.equal(restore.originalReducer,original);
    assert.equal(restore.installedReducer,
      ShadowRiderCalyrexVMAX.prototype.reduceEffect);
    assert.equal(restore.installedReducer.underworldDoorHookId,
      UNDERWORLD_DOOR_HOOK_ID);
    assert.equal(restore.isInstalled,true);
    assert.equal(restore.isRestored,false);
    assert.throws(()=>installUnderworldDoorPsychicRecipientHook(),
      /already installed/);
  }finally{
    restore();
  }
  assert.equal(restore.isInstalled,false);
  assert.equal(restore.isRestored,true);
  assert.equal(ShadowRiderCalyrexVMAX.prototype.reduceEffect,original);
  assert.throws(()=>restore(),/lost reducer ownership/);
});
