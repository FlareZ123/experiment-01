'use strict';

const assert=require('node:assert/strict');
const test=require('node:test');
const {
  VERSION,SOURCE_PRINTING,SOURCE_ABILITY,
  withStunfiskSnapTrapPromptMarker
}=require('../../simulation/twinleaf/agent30-stunfisk-snap-trap-prompt-marker-v2.cjs');

function makeFixture(overrides={}){
  const GameMessage={CHOOSE_CARD_TO_DISCARD:'CHOOSE_CARD_TO_DISCARD'};
  const SuperType={ENERGY:'ENERGY',POKEMON:'POKEMON'};
  class ChooseCardsPrompt{
    constructor(player,message,cards,filter,options){
      this.id=0;
      this.playerId=player.id;
      this.message=message;
      this.cards=cards;
      this.filter=filter;
      this.options={
        min:0,max:cards.cards.length,allowCancel:true,isSecret:false,
        ...options
      };
    }
  }
  class SimpleTacticsAi{
    constructor(client){this.client=client;}
    decodeNextAction(){return 'original-policy-action';}
  }
  class GalarianStunfisk{
    constructor(){
      this.fullName=SOURCE_PRINTING;
      this.powers=[{name:SOURCE_ABILITY}];
    }
    reduceEffect(store,state,effect){
      const abilityOwner=state.players.find(player=>
        player.active===effect.target||
        (player.bench??[]).includes(effect.target));
      const prompt=new ChooseCardsPrompt(
        abilityOwner,GameMessage.CHOOSE_CARD_TO_DISCARD,
        typeof overrides.promptCards==='function'
          ?overrides.promptCards(effect)
          :(overrides.promptCards??effect.source),
        overrides.promptFilter??{superType:SuperType.ENERGY},
        overrides.promptOptions??{min:1,max:1,allowCancel:false}
      );
      if(overrides.promptMessage!==undefined)
        prompt.message=overrides.promptMessage;
      if(overrides.promptOwnerId!==undefined)
        prompt.playerId=overrides.promptOwnerId;
      if(overrides.promptSourceCard!==undefined)
        prompt.sourceCard=overrides.promptSourceCard;
      return store.prompt(state,prompt,()=>{});
    }
  }

  const sourceCard=new GalarianStunfisk();
  const energy={superType:SuperType.ENERGY,fullName:'Psychic Energy'};
  const attackerPokemon={fullName:'Marshadow UNB'};
  const target={
    cards:[sourceCard],
    energies:{cards:[]},
    getPokemonCard(){return sourceCard;}
  };
  const attacker={
    cards:[attackerPokemon,energy],
    energies:{cards:[energy]},
    getPokemonCard(){return attackerPokemon;}
  };
  const owner={id:0,active:target,bench:[],discard:{cards:[]}};
  const attackerOwner={id:1,active:attacker,bench:[],discard:{cards:[]}};
  const state={
    turn:54,phase:'ATTACK',players:[owner,attackerOwner],prompts:[]
  };
  const effect={
    damage:30,target,source:attacker,player:attackerOwner
  };
  const store={
    prompt(nextState,prompt,callback){
      prompt.id=173;
      nextState.prompts.push(prompt);
      this.lastPromptCallback=callback;
      return nextState;
    }
  };
  const modules={
    'sets/09-sword-and-shield/set-sword-and-shield/galarian-stunfisk':{
      GalarianStunfisk
    },
    'simple-bot/simple-tactics-ai':{SimpleTacticsAi},
    'game/store/prompts/choose-cards-prompt':{ChooseCardsPrompt},
    'game/game-message':{GameMessage},
    'game/store/card/card-types':{SuperType}
  };
  const engine=relative=>modules[relative];
  return {
    sourceCard,attacker,target,owner,attackerOwner,state,effect,store,
    engine,SimpleTacticsAi,GalarianStunfisk
  };
}

function execute(f){
  let getOriginForPrompt;
  const result=withStunfiskSnapTrapPromptMarker(lookup=>{
    getOriginForPrompt=lookup;
    f.sourceCard.reduceEffect(f.store,f.state,f.effect);
    const ai=new f.SimpleTacticsAi({id:f.owner.id});
    return ai.decodeNextAction(f.state);
  },{engine:f.engine});
  return {...result,getOriginForPrompt};
}

test('version identifies the read-only Snap Trap prompt marker',()=>{
  assert.equal(VERSION,'agent30-stunfisk-snap-trap-prompt-marker-v2');
});

test('exact Snap Trap prompt is stamped and joined to the blocked native prompt',()=>{
  const f=makeFixture();
  const originalReducer=f.GalarianStunfisk.prototype.reduceEffect;
  const originalDecoder=f.SimpleTacticsAi.prototype.decodeNextAction;
  const {result,audit,getOriginForPrompt}=execute(f);
  assert.equal(result,'original-policy-action');
  assert.equal(audit.printedSourceInvocations,1);
  assert.equal(audit.exactSourcePromptsStamped.length,1);
  assert.equal(audit.blockedPromptOriginEvents.length,1);
  assert.equal(audit.hiddenCardIdentitiesInspected,false);
  assert.equal(audit.rawStateDecoderExecutedByMarker,false);
  assert.equal(audit.decisionActionsIssuedByMarker,0);
  assert.equal(f.GalarianStunfisk.prototype.reduceEffect,originalReducer);
  assert.equal(f.SimpleTacticsAi.prototype.decodeNextAction,originalDecoder);
  const proof=audit.blockedPromptOriginEvents[0];
  assert.equal(proof.sourcePrinting,SOURCE_PRINTING);
  assert.equal(proof.sourceAbility,SOURCE_ABILITY);
  assert.equal(proof.sourceSeat,0);
  assert.equal(proof.attackerSeat,1);
  assert.equal(proof.attackerPrinting,'Marshadow UNB');
  assert.equal(proof.attackerZone,'opponent-active-pokemon-list');
  assert.equal(proof.promptCardsIsAttackingPokemonList,true);
  assert.equal(proof.promptEnergyListIsAttackingEnergySublist,true);
  assert.equal(proof.eligibleSubzone,'attacker-active-energies');
  assert.deepEqual(proof.eligibleEnergyPrintings,['Psychic Energy']);
  assert.equal(proof.min,1);
  assert.equal(proof.max,1);
  assert.equal(proof.allowCancel,false);
  assert.equal(proof.isSecret,false);
  assert.equal(proof.promptSourceCardMetadataPresent,false);
  assert.equal(proof.moveSourceCard,SOURCE_PRINTING);
  assert.equal(proof.moveSourceEffect,SOURCE_ABILITY);
  assert.equal(proof.promptIdBeforeStore,0);
  assert.equal(proof.promptIdAfterStore,173);
  assert.equal(proof.promptIdAssignedByStore,true);
  assert.equal(proof.pendingNativePromptId,'173');
  const sourceProof=audit.exactSourcePromptsStamped[0];
  assert.strictEqual(getOriginForPrompt(f.state.prompts[0]),sourceProof);
  assert.equal(getOriginForPrompt({...f.state.prompts[0]}),null);
});

test('marker preserves the original policy action and does not resolve the prompt',()=>{
  const f=makeFixture();
  const {result,audit}=execute(f);
  assert.equal(result,'original-policy-action');
  assert.equal(f.state.prompts.length,1);
  assert.equal(f.state.prompts[0].result,undefined);
  assert.equal(audit.decisionActionsIssuedByMarker,0);
});

test('Energy sublist passed instead of the PokemonCardList is not stamped',()=>{
  const f=makeFixture({promptCards:effect=>effect.source.energies});
  const {audit}=execute(f);
  assert.equal(audit.exactSourcePromptsStamped.length,0);
  assert.equal(audit.blockedPromptOriginEvents.length,0);
});

test('wrong prompt filter is not stamped',()=>{
  const f=makeFixture({promptFilter:{superType:'POKEMON'}});
  const {audit}=execute(f);
  assert.equal(audit.exactSourcePromptsStamped.length,0);
});

test('an Energy filter with extra constraints is not stamped',()=>{
  const f=makeFixture({
    promptFilter:{superType:'ENERGY',name:'Psychic Energy'}
  });
  const {audit}=execute(f);
  assert.equal(audit.exactSourcePromptsStamped.length,0);
});

test('wrong prompt message is not stamped',()=>{
  const f=makeFixture({promptMessage:'CHOOSE_CARD_TO_MOVE'});
  const {audit}=execute(f);
  assert.equal(audit.exactSourcePromptsStamped.length,0);
});

test('cancellable or non-single-card prompt is not stamped',()=>{
  const f=makeFixture({promptOptions:{min:0,max:2,allowCancel:true}});
  const {audit}=execute(f);
  assert.equal(audit.exactSourcePromptsStamped.length,0);
});

test('wrong prompt owner is not stamped',()=>{
  const f=makeFixture({promptOwnerId:1});
  const {audit}=execute(f);
  assert.equal(audit.exactSourcePromptsStamped.length,0);
});

test('wrong printed source or ability name is not stamped',()=>{
  const f=makeFixture();
  f.sourceCard.fullName='Galarian Stunfisk VIV';
  const {audit}=execute(f);
  assert.equal(audit.exactSourcePromptsStamped.length,0);
  const g=makeFixture();
  g.sourceCard.powers[0].name='Other Ability';
  assert.equal(execute(g).audit.exactSourcePromptsStamped.length,0);
});

test('non-Active target is not stamped',()=>{
  const f=makeFixture();
  f.owner.active={cards:[],energies:{cards:[]}};
  f.owner.bench.push(f.target);
  const {audit}=execute(f);
  assert.equal(audit.exactSourcePromptsStamped.length,0);
});

test('non-Active attacker is not stamped',()=>{
  const f=makeFixture();
  f.attackerOwner.active={cards:[],energies:{cards:[]}};
  f.attackerOwner.bench.push(f.attacker);
  const {audit}=execute(f);
  assert.equal(audit.exactSourcePromptsStamped.length,0);
});

test('same player cannot be both damaged ability owner and attacker',()=>{
  const f=makeFixture();
  f.owner.active=f.attacker;
  f.owner.bench.push(f.target);
  f.effect.target=f.target;
  f.effect.player=f.owner;
  const {audit}=execute(f);
  assert.equal(audit.exactSourcePromptsStamped.length,0);
});

test('no eligible attached Energy means no Snap Trap prompt origin',()=>{
  const f=makeFixture();
  f.attacker.energies.cards=[];
  const {audit}=execute(f);
  assert.equal(audit.exactSourcePromptsStamped.length,0);
});

test('a prompt with an unrelated CardList object is not stamped',()=>{
  const f=makeFixture({promptCards:effect=>({
    cards:effect.source.cards.slice(),
    energies:{cards:effect.source.energies.cards.slice()},
    getPokemonCard(){return effect.source.getPokemonCard();}
  })});
  const {audit}=execute(f);
  assert.equal(audit.exactSourcePromptsStamped.length,0);
});

test('multiple public attached Energies are reported without selecting one',()=>{
  const f=makeFixture();
  const second={superType:'ENERGY',fullName:'Double Colorless Energy'};
  f.attacker.energies.cards.push(second);
  f.attacker.cards.push(second);
  const {audit}=execute(f);
  assert.equal(audit.exactSourcePromptsStamped.length,1);
  assert.equal(audit.exactSourcePromptsStamped[0].eligibleEnergyCount,2);
  assert.deepEqual(
    audit.exactSourcePromptsStamped[0].eligibleEnergyPrintings,
    ['Psychic Energy','Double Colorless Energy']
  );
  assert.equal(f.state.prompts[0].result,undefined);
});

test('source prompt audit is attached to thrown native errors',()=>{
  const f=makeFixture();
  const error=new Error('native failure');
  assert.throws(()=>withStunfiskSnapTrapPromptMarker(()=>{
    f.sourceCard.reduceEffect(f.store,f.state,f.effect);
    throw error;
  },{engine:f.engine}),caught=>caught===error&&
    caught.stunfiskSnapTrapPromptMarkerAudit?.exactSourcePromptsStamped.length===1);
});


test('source prompt ID is captured when native Store.prompt throws after assignment',()=>{
  const f=makeFixture();
  const failure=new Error('Store.prompt failure after assigning ID');
  f.store.prompt=function(nextState,prompt,callback){
    prompt.id=173;
    nextState.prompts.push(prompt);
    this.lastPromptCallback=callback;
    throw failure;
  };
  assert.throws(()=>withStunfiskSnapTrapPromptMarker(lookup=>{
    f.sourceCard.reduceEffect(f.store,f.state,f.effect);
  },{engine:f.engine}),error=>{
    const proof=error?.stunfiskSnapTrapPromptMarkerAudit
      ?.exactSourcePromptsStamped?.[0];
    return error===failure&&proof?.promptIdBeforeStore===0&&
      proof?.promptIdAfterStore===173&&
      proof?.promptIdAssignedByStore===true;
  });
});

test('prototype descriptors are restored when the native callback throws',()=>{
  const f=makeFixture();
  const originalReducer=Object.getOwnPropertyDescriptor(
    f.GalarianStunfisk.prototype,'reduceEffect');
  const originalDecoder=Object.getOwnPropertyDescriptor(
    f.SimpleTacticsAi.prototype,'decodeNextAction');
  assert.throws(()=>withStunfiskSnapTrapPromptMarker(()=>{
    f.sourceCard.reduceEffect(f.store,f.state,f.effect);
    throw new Error('expected');
  },{engine:f.engine}),/expected/);
  assert.deepEqual(Object.getOwnPropertyDescriptor(
    f.GalarianStunfisk.prototype,'reduceEffect'),originalReducer);
  assert.deepEqual(Object.getOwnPropertyDescriptor(
    f.SimpleTacticsAi.prototype,'decodeNextAction'),originalDecoder);
});
