'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {ownerVisibleCopyOptions,choosePromptCopy,
  withOwnerVisiblePerfectionPassBridge}=
  require('../simulation/twinleaf/owner-visible-perfection-pass-bridge.cjs');

function environment(){
  class PassTurnAction{}
  class AttackAction{}
  class UseAbilityAction{
    constructor(clientId,name,target){
      this.clientId=clientId;this.name=name;this.target=target;
    }
  }
  class ResolvePromptAction{
    constructor(id,result){this.id=id;this.result=result;}
  }
  class SimpleTacticsAi{
    constructor(id){this.client={id};this.accept=true;this.ordinary=new PassTurnAction();}
    decodeNextAction(){return this.ordinary;}
    isValidAction(){return this.accept;}
  }
  const owner={
    id:101,active:{getPokemonCard:()=>({fullName:'Mewtwo & Mew-GX UNM'})},
    discard:{cards:[{fullName:'Gengar & Mimikyu-GX TEU'},
      {fullName:'Trevenant & Dusknoir-GX SMP'}]},
    bench:[],usedGX:false
  };
  const source={id:202};
  const state={players:[owner,source],activePlayer:0,phase:'player-turn',
    turn:4,prompts:[]};
  const deps={
    bot:{SimpleTacticsAi},actions:{UseAbilityAction},
    prompts:{ResolvePromptAction},
    target:{PlayerType:{BOTTOM_PLAYER:1},SlotType:{ACTIVE:2}},
    phase:{GamePhase:{PLAYER_TURN:'player-turn'}}
  };
  return {state,owner,source,deps,SimpleTacticsAi,PassTurnAction,
    AttackAction,UseAbilityAction,ResolvePromptAction};
}

test('visible candidate list derives from owned discard and Bench, honors GX usage',()=>{
  const e=environment();
  assert.deepEqual(ownerVisibleCopyOptions(e.owner).map(x=>x.attack),
    ['Horror House-GX','Night Watch','Poltergeist']);
  e.owner.usedGX=true;
  assert.deepEqual(ownerVisibleCopyOptions(e.owner).map(x=>x.attack),
    ['Night Watch','Poltergeist']);
  e.owner.discard.cards=[];
  e.owner.bench=[{getPokemonCard:()=>({fullName:'Gengar & Mimikyu-GX TEU'})}];
  assert.deepEqual(ownerVisibleCopyOptions(e.owner).map(x=>x.attack),
    ['Poltergeist']);
  e.owner.active.getPokemonCard=()=>({fullName:'Shadow Rider Calyrex VMAX CRE'});
  assert.deepEqual(ownerVisibleCopyOptions(e.owner),[]);
});

test('real attack prompt validates the chosen attack rather than trusting donor access',()=>{
  const choices=[{source:'Gengar & Mimikyu-GX TEU',attack:'Horror House-GX'},
    {source:'Trevenant & Dusknoir-GX SMP',attack:'Night Watch'}];
  const horror={name:'Horror House-GX'},night={name:'Night Watch'};
  const prompt={cards:[
    {fullName:choices[0].source,attacks:[horror]},
    {fullName:choices[1].source,attacks:[night]}
  ],validate:attack=>attack!==horror};
  assert.strictEqual(choosePromptCopy(prompt,choices),night);
  prompt.validate=()=>false;
  assert.strictEqual(choosePromptCopy(prompt,choices),null);
});

test('live owner Pass becomes Perfection and real eligible own attack prompt is honored',()=>{
  const e=environment();
  const prior=e.SimpleTacticsAi.prototype.decodeNextAction;
  const bot=new e.SimpleTacticsAi(101);
  const output=withOwnerVisiblePerfectionPassBridge(0,()=>{
    const action=bot.decodeNextAction(e.state);
    assert.ok(action instanceof e.UseAbilityAction);
    assert.equal(action.name,'Perfection');
    assert.deepEqual(action.target,{player:1,slot:2,index:0});
    const horror={name:'Horror House-GX'};
    const prompt={id:71,playerId:101,
      cards:[{fullName:'Gengar & Mimikyu-GX TEU',attacks:[horror]}],
      validate:attack=>attack===horror};
    Object.defineProperty(prompt,'constructor',
      {value:{name:'ChooseAttackPrompt'}});
    e.state.prompts=[prompt];
    const choice=bot.decodeNextAction(e.state);
    assert.ok(choice instanceof e.ResolvePromptAction);
    assert.equal(choice.id,71);
    assert.strictEqual(choice.result,horror);
    return 'completed';
  },e.deps);
  assert.equal(output.result,'completed');
  assert.equal(output.policyAudit.activated,1);
  assert.equal(output.policyAudit.selected,1);
  assert.strictEqual(e.SimpleTacticsAi.prototype.decodeNextAction,prior);
  assert.equal(output.policyAudit.competitiveGameQualified,false);
});

test('repeated owner Pass in same physical turn cannot repeatedly attempt Perfection',()=>{
  const e=environment();
  const bot=new e.SimpleTacticsAi(101);
  const result=withOwnerVisiblePerfectionPassBridge(0,()=>{
    const first=bot.decodeNextAction(e.state);
    const second=bot.decodeNextAction(e.state);
    assert.ok(first instanceof e.UseAbilityAction);
    assert.ok(second instanceof e.PassTurnAction);
    return 'bounded';
  },e.deps);
  assert.equal(result.policyAudit.activated,1);
});

test('preflight refusal retains original pass without fabricating a copied attack',()=>{
  const e=environment();
  const bot=new e.SimpleTacticsAi(101);
  bot.accept=false;
  const result=withOwnerVisiblePerfectionPassBridge(0,()=>{
    assert.ok(bot.decodeNextAction(e.state) instanceof e.PassTurnAction);
    return true;
  },e.deps);
  assert.equal(result.policyAudit.failedPreflight,1);
  assert.equal(result.policyAudit.activated,0);
});

test('non-Pass original moves, other physical seat, missing owner donor do not change',()=>{
  const e=environment();
  const bot=new e.SimpleTacticsAi(101);
  const enemy=new e.SimpleTacticsAi(202);
  const decision=new e.AttackAction();
  bot.ordinary=decision;
  const result=withOwnerVisiblePerfectionPassBridge(0,()=>{
    assert.strictEqual(bot.decodeNextAction(e.state),decision);
    assert.ok(enemy.decodeNextAction(e.state) instanceof e.PassTurnAction);
    bot.ordinary=new e.PassTurnAction();
    e.owner.discard.cards=[];
    assert.ok(bot.decodeNextAction(e.state) instanceof e.PassTurnAction);
    return true;
  },e.deps);
  assert.equal(result.policyAudit.activated,0);
});

test('hook itself never reads hidden opponent or own-deck zones',()=>{
  const e=environment();
  for(const field of ['hand','deck','prizes']){
    Object.defineProperty(e.source,field,{
      get(){throw new Error('opponent hidden '+field+' accessed');}
    });
  }
  Object.defineProperty(e.owner,'deck',{
    get(){throw new Error('owner hidden deck accessed');}
  });
  const bot=new e.SimpleTacticsAi(101);
  const result=withOwnerVisiblePerfectionPassBridge(0,()=>{
    assert.ok(bot.decodeNextAction(e.state) instanceof e.UseAbilityAction);
    return true;
  },e.deps);
  assert.equal(result.policyAudit.activated,1);
  assert.equal(result.policyAudit.informationSetCertified,false,
    'The pinned upstream preflight remains outside this pure wrapper guarantee');
});

test('unsupported copied-attack prompt declines with honest audit',()=>{
  const e=environment();
  const bot=new e.SimpleTacticsAi(101);
  const result=withOwnerVisiblePerfectionPassBridge(0,()=>{
    assert.ok(bot.decodeNextAction(e.state) instanceof e.UseAbilityAction);
    const prompt={id:3,playerId:101,cards:[],validate:()=>false};
    Object.defineProperty(prompt,'constructor',
      {value:{name:'ChooseAttackPrompt'}});
    e.state.prompts=[prompt];
    assert.ok(bot.decodeNextAction(e.state) instanceof e.PassTurnAction);
    return true;
  },e.deps);
  assert.equal(result.policyAudit.missingPromptCopy,1);
  assert.equal(result.policyAudit.selected,0);
});

test('reversible hook restores prototype after failing execution',()=>{
  const e=environment();
  const prior=e.SimpleTacticsAi.prototype.decodeNextAction;
  assert.throws(()=>withOwnerVisiblePerfectionPassBridge(0,()=>{
    throw new Error('injected Store failure');
  },e.deps),/injected Store failure/);
  assert.strictEqual(e.SimpleTacticsAi.prototype.decodeNextAction,prior);
});

test('both physical candidate seats use the identical executable algorithm',()=>{
  const e=environment();
  e.owner.id=202;e.source.id=101;e.state.players=[e.source,e.owner];
  e.state.activePlayer=1;
  const bot=new e.SimpleTacticsAi(202);
  const output=withOwnerVisiblePerfectionPassBridge(1,()=>{
    assert.ok(bot.decodeNextAction(e.state) instanceof e.UseAbilityAction);
    return 'same';
  },e.deps);
  assert.equal(output.result,'same');
  assert.equal(output.policyAudit.candidateSeat,1);
  assert.equal(output.policyAudit.activated,1);
});
