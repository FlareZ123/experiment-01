'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {
  DECKOUT_TEXT,deckOutAttack,fundedDeckOutBench,
  chooseDeckOutEnergyRecipient,chooseDeckOutPaidRetreat,
  withBilateralDeckOutPaidRetreat
}=require('../simulation/twinleaf/agent6-owner-deckout-paid-retreat.cjs');

const catalog={
  stages:{BASIC:0},
  basicEnergyTypes:{Water:3,Lightning:4},
  colorlessEnergyType:9,
  basicEnergies:new Set(['Water Energy MEE','Lightning Energy MEE']),
  specialEnergies:new Set(['Capture Energy RCL']),
  specialConditions:{ASLEEP:1,PARALYZED:2},
  dragonPokemonPrintings:new Set()
};

function fixture(){
  const bunnelby={
    printing:'Bunnelby PRC',name:'Bunnelby',
    printed:{stage:0,types:[1],retreatCost:[9]},
    energies:['Capture Energy RCL'],
    attacks:[{name:'Burrow',cost:[9],damage:0,text:DECKOUT_TEXT}],
    abilities:['Barrage'],
    abilityDetails:[{name:'Barrage',text:'This Pokémon can attack twice during your turn.'}],
    publicRestrictions:{},specialConditions:[]
  };
  const active={
    printing:'Rotom V LOR',name:'Rotom V',
    printed:{stage:0,types:[4],retreatCost:[9]},
    energies:[],
    attacks:[{name:'Scrap Short',cost:[4,4],damage:40,text:''}],
    abilities:[],tools:[],publicRestrictions:{},specialConditions:[]
  };
  const stunfisk={
    printing:'Galarian Stunfisk SSH',name:'Galarian Stunfisk',
    printed:{stage:0,types:[8],retreatCost:[9,9]},
    energies:[],
    attacks:[{name:'Damage Rush',cost:[8,9],damage:60,text:''}],
    abilities:[],tools:[],publicRestrictions:{},specialConditions:[]
  };
  const view={
    decisionKind:'owner-root',actorSeat:0,globalTurn:59,
    ownHand:['Water Energy MEE'],
    ownTurnResources:{retreatedTurn:0,energyPlayLocked:false,energyPlayedTurn:0},
    ownPublic:{
      deckCount:17,stadium:[],
      publicTurnRestrictions:{attackLockTurnsRemaining:0},
      active,bench:[null,bunnelby,null,null,stunfisk]
    },
    opponentPublic:{
      deckCount:15,stadium:[],
      active:{printing:'Trevenant & Dusknoir-GX SMP',hp:270,damage:0,
        energies:['Psychic Energy MEE','Psychic Energy MEE','Psychic Energy MEE'],
        attacks:[{name:'Night Watch',cost:[5,5,5],damage:150,text:''}],
        publicRestrictions:{},specialConditions:[]},
      bench:[]
    }
  };
  return {view,active,bunnelby,stunfisk};
}

function originalRecipient(){
  return {
    handIndex:0,printing:'Water Energy MEE',slot:'bench',index:4,
    attackName:'Damage Rush',gapBefore:2,gapAfter:1,
    knownBasicEnergyOnly:true
  };
}

test('recognizes a funded printed deck-out attack using Capture Energy',()=>{
  const {view,bunnelby}=fixture();
  assert.deepEqual(deckOutAttack(view,catalog,bunnelby),{
    attackName:'Burrow',hasDoubleAttackTrait:true
  });
  assert.deepEqual(fundedDeckOutBench(view,catalog),{
    benchIndex:1,printing:'Bunnelby PRC',
    attackName:'Burrow',hasDoubleAttackTrait:true
  });
});

test('retargets only the already-selected Basic Energy to the Active',()=>{
  const {view}=fixture();
  const original=originalRecipient();
  const before=JSON.stringify(view);
  const selected=chooseDeckOutEnergyRecipient(view,catalog,original);
  assert.equal(selected.slot,'active');
  assert.equal(selected.index,0);
  assert.equal(selected.handIndex,original.handIndex);
  assert.equal(selected.printing,original.printing);
  assert.equal(selected.originalBenchIndex,4);
  assert.equal(selected.deckOutRetreatRecipient,true);
  assert.equal(JSON.stringify(view),before);
});

test('proposes paid retreat only after one known Basic is attached to the Active',()=>{
  const {view}=fixture();
  view.ownPublic.active.energies=['Water Energy MEE'];
  const offer=chooseDeckOutPaidRetreat(view,catalog);
  assert.equal(offer?.kind,'paid-retreat');
  assert.equal(offer?.benchIndex,1);
  assert.equal(offer?.printing,'Bunnelby PRC');
  assert.equal(offer?.attackName,'Burrow');
  assert.equal(offer?.retreatCostUnits,1);
  assert.equal(offer?.hasDoubleAttackTrait,true);
  assert.equal(offer?.paperFullLegalityCertified,false);
});

test('uses the same owner-only algorithm for either physical seat',()=>{
  const {view}=fixture();
  view.actorSeat=1;
  assert.equal(chooseDeckOutEnergyRecipient(view,catalog,originalRecipient())
    ?.slot,'active');
  view.ownPublic.active.energies=['Water Energy MEE'];
  assert.equal(chooseDeckOutPaidRetreat(view,catalog)?.benchIndex,1);
});

test('refuses to mill when the owner is behind or opponent deck is empty',()=>{
  const {view}=fixture();
  view.ownPublic.deckCount=14;
  assert.equal(chooseDeckOutEnergyRecipient(view,catalog,originalRecipient())
    .slot,'bench');
  view.ownPublic.deckCount=17;
  view.opponentPublic.deckCount=0;
  assert.equal(chooseDeckOutEnergyRecipient(view,catalog,originalRecipient())
    .slot,'bench');
});

test('fails closed for an unfunded or unknown-energy Bench attack',()=>{
  const {view,bunnelby}=fixture();
  bunnelby.energies=['Unknown Energy NEW'];
  assert.equal(fundedDeckOutBench(view,catalog),null);
  bunnelby.energies=['Capture Energy RCL'];
  bunnelby.publicRestrictions.blockedAttackNameNextTurn='Burrow';
  assert.equal(fundedDeckOutBench(view,catalog),null);
});

test('does not displace a payable damaging Active or bypass known locks',()=>{
  const {view,active}=fixture();
  active.energies=['Water Energy MEE'];
  active.attacks=[{name:'Water Strike',cost:[3],damage:100,text:''}];
  assert.equal(chooseDeckOutPaidRetreat(view,catalog),null);
  active.attacks=[{name:'Scrap Short',cost:[4,4],damage:40,text:''}];
  active.tools=['Float Stone BKT'];
  assert.equal(chooseDeckOutPaidRetreat(view,catalog),null);
  active.tools=[];
  view.ownTurnResources.retreatedTurn=59;
  assert.equal(chooseDeckOutPaidRetreat(view,catalog),null);
});

test('does not retarget if the selected attachment or energy play is unavailable',()=>{
  const {view}=fixture();
  assert.equal(chooseDeckOutEnergyRecipient(view,catalog,null),null);
  assert.equal(chooseDeckOutEnergyRecipient(view,catalog,{
    ...originalRecipient(),printing:'Capture Energy RCL'
  }).slot,'bench');
  view.ownTurnResources.energyPlayLocked=true;
  assert.equal(chooseDeckOutEnergyRecipient(view,catalog,originalRecipient())
    .slot,'bench');
});

test('never reads opponent hidden information or mutates its input',()=>{
  const {view}=fixture();
  Object.defineProperty(view,'opponentPrivate',{
    get(){throw new Error('opponent hidden information accessed');}
  });
  const before=JSON.stringify(view);
  assert.equal(chooseDeckOutEnergyRecipient(view,catalog,originalRecipient())
    .slot,'active');
  assert.equal(JSON.stringify(view),before);
});

test('bilateral wrapper submits native retreat and accepts only real second-attack prompts',()=>{
  class PassTurnAction{}
  class RetreatAction{
    constructor(playerId,benchIndex){this.playerId=playerId;this.benchIndex=benchIndex;}
  }
  class AttackAction{constructor(name){this.name=name;}}
  class ResolvePromptAction{
    constructor(id,value){this.id=id;this.value=value;}
  }
  class ConfirmPrompt{
    constructor(playerId,message){this.playerId=playerId;this.message=message;this.id='confirm';}
    validate(value){return value===true;}
  }
  class ChooseAttackPrompt{
    constructor(playerId,message,cards){this.playerId=playerId;this.message=message;this.cards=cards;this.id='choose';}
    validate(attack){return attack?.name==='Burrow';}
  }
  class SimpleTacticsAi{
    decodeNextAction(){return new PassTurnAction();}
  }
  class Store{
    constructor(){this.state=null;}
    reduceEffect(state,effect){effect.cost=[9];}
    dispatch(action){return action;}
  }
  class CheckRetreatCostEffect{
    constructor(player){this.player=player;this.cost=[9];}
  }
  const GameMessage={
    WANT_TO_USE_ABILITY:'want-ability',
    CHOOSE_ATTACK_TO_COPY:'choose-copy'
  };
  const {view}=fixture();
  view.ownPublic.active.energies=['Water Energy MEE'];
  const card={
    fullName:'Bunnelby PRC',
    attacks:[{name:'Burrow',text:DECKOUT_TEXT,damage:'',cost:[9]}]
  };
  const state={
    turn:59,activePlayer:0,prompts:[],
    players:[
      {id:'owner',active:{getPokemonCard:()=>card}},
      {id:'opponent',deck:{cards:Array(10).fill({})}}
    ]
  };
  const recipientModule={
    chooseActorEnergyRecipient:()=>originalRecipient()
  };
  const oldRecipient=recipientModule.chooseActorEnergyRecipient;
  const deps={
    SimpleTacticsAi,RetreatAction,Store,CheckRetreatCostEffect,
    ResolvePromptAction,GameMessage,catalog,observe:()=>view,recipientModule
  };
  const result=withBilateralDeckOutPaidRetreat(()=>{
    const ai=new SimpleTacticsAi();
    const store=new Store();store.state=state;
    const recipient=recipientModule.chooseActorEnergyRecipient(view,catalog);
    const retreat=ai.decodeNextAction(state);
    store.dispatch(new AttackAction('Burrow'));
    state.prompts=[new ConfirmPrompt('owner',GameMessage.WANT_TO_USE_ABILITY)];
    const confirm=ai.decodeNextAction(state);
    state.prompts=[new ChooseAttackPrompt('owner',
      GameMessage.CHOOSE_ATTACK_TO_COPY,[card])];
    const second=ai.decodeNextAction(state);
    return {recipient,retreat,confirm,second};
  },deps);
  assert.equal(result.result.recipient.slot,'active');
  assert.equal(result.result.retreat.constructor.name,'RetreatAction');
  assert.equal(result.result.retreat.benchIndex,1);
  assert.equal(result.result.confirm.value,true);
  assert.equal(result.result.second.value.name,'Burrow');
  assert.equal(result.audit.typedRetreatsBySeat[0],1);
  assert.equal(result.audit.acceptedSecondAttackConfirmPrompts,1);
  assert.equal(result.audit.chosenSecondAttackPrompts,1);
  assert.strictEqual(recipientModule.chooseActorEnergyRecipient,oldRecipient);
});
