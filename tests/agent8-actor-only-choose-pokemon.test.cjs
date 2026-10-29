'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {actorChoosePokemonInput,chooseActorPokemon,withActorOnlyChoosePokemon,
  nativeSinglePokemonChoices,VERSION}=
  require('../simulation/twinleaf/agent8-actor-only-choose-pokemon.cjs');

class ChoosePokemonPrompt {
  constructor(owner,opts={}){
    this.id=opts.id??31;this.playerId=owner;
    this.perspectivePlayerId=opts.perspectivePlayerId;
    this.playerType=opts.playerType??0;
    this.slots=opts.slots??[2];
    this.options={min:opts.min??1,max:opts.max??1,
      allowCancel:opts.allowCancel??false,blocked:opts.blocked??[]};
    this.result=undefined;this.message='PICK_TARGET';
  }
  getPerspectivePlayerId(){return this.perspectivePlayerId??this.playerId;}
  validate(value){
    if(value===null)return this.options.allowCancel;
    return Array.isArray(value)&&value.length>=this.options.min&&
      value.length<=this.options.max&&
      value.every(p=>p?.cards?.length&&!this.options.blocked.includes(p));
  }
}
class AddPlayerAction{}
class ResolvePromptAction{constructor(id,result){this.id=id;this.result=result;}}
class Store{
  constructor(state){this.state=state;}
  dispatch(action){
    if(action instanceof AddPlayerAction)return true;
    const p=this.state.prompts.find(x=>x.id===action.id&&x.result===undefined);
    assert.ok(p?.validate(action.result));
    p.result=action.result;return true;
  }
}
class SimpleTacticsAi{
  constructor(id){this.client={id};}
  decodeNextAction(){return 'GENERIC';}
}
const pokemon=name=>({cards:[{fullName:name}]});
const player=(id,prefix)=>({
  id,active:pokemon(prefix+' Active'),
  bench:[pokemon(prefix+' One'),pokemon(prefix+' Two')]
});
function view(p){
  const project=x=>({printing:x.cards[0].fullName,hp:90,damage:10,
    energies:['Energy'],attacks:[{name:'Move'}]});
  return {active:project(p.active),bench:p.bench.map(project)};
}
const observation=(s,seat)=>({
  decisionKind:'owner-prompt',globalTurn:s.turn,
  ownPublic:view(s.players[seat]),opponentPublic:view(s.players[1-seat])
});
const observe=(s,seat)=>actorChoosePokemonInput(s,seat,observation);

test('cross-player perspective and blocked slots use actual legal targets',()=>{
  const a=player(1,'A'),b=player(2,'B');
  const p=new ChoosePokemonPrompt(1,{perspectivePlayerId:2,
    playerType:2,slots:[1,2],blocked:[b.bench[0]]});
  const s={phase:2,turn:5,players:[a,b],prompts:[p],
    privateOpponentHand:['sentinel-hidden-value']};
  const i=observe(s,0);
  assert.deepEqual(i.prompt.offered.map(x=>x.printing),['B Active','B Two']);
  assert.equal(i.prompt.perspectiveIsAnsweringOwner,false);
  assert.ok(Object.isFrozen(i.prompt.offered));
  assert.equal(JSON.stringify(i).includes('sentinel-hidden-value'),false);
  assert.deepEqual(nativeSinglePokemonChoices(s,p).map(x=>x.physical),
    [b.active,b.bench[1]]);
  assert.deepEqual(chooseActorPokemon(i),{index:0});
  assert.equal(observe(s,1),null);
});

test('real State only: both seats execute actual native prompt responses',()=>{
  const s={phase:2,turn:8,players:[player(1,'A'),player(2,'B')],prompts:[]};
  const oldBot=SimpleTacticsAi.prototype.decodeNextAction;
  const oldStore=Store.prototype.dispatch;
  const r=withActorOnlyChoosePokemon(()=>{
    const store=new Store(s);store.dispatch(new AddPlayerAction());
    for(const [seat,id] of [[0,1],[1,2]]){
      const owner=s.players[seat];
      s.prompts=[new ChoosePokemonPrompt(id,{
        id:id+30,playerType:2,blocked:[owner.bench[0]]
      })];
      const action=new SimpleTacticsAi(id).decodeNextAction(s);
      assert.ok(action instanceof ResolvePromptAction);
      assert.strictEqual(action.result[0],owner.bench[1]);
      assert.equal(store.dispatch(action),true);
    }
  },{Store,SimpleTacticsAi,ResolvePromptAction,observe,
    validate:(state,action)=>assert.ok(
      state.prompts[0].validate(action.result))});
  assert.equal(r.audit.version,VERSION);
  assert.equal(r.audit.accepted,2);
  assert.equal(r.audit.postconditionsConfirmed,2);
  assert.deepEqual(r.audit.bySeat,{0:1,1:1});
  assert.strictEqual(SimpleTacticsAi.prototype.decodeNextAction,oldBot);
  assert.strictEqual(Store.prototype.dispatch,oldStore);
});

test('unsupported multi-target and off-Store clones stay generic',()=>{
  const s={phase:2,turn:3,players:[player(1,'A'),player(2,'B')],
    prompts:[new ChoosePokemonPrompt(1,{min:2,max:2})]};
  const r=withActorOnlyChoosePokemon(()=>{
    const store=new Store(s);store.dispatch(new AddPlayerAction());
    assert.equal(new SimpleTacticsAi(1).decodeNextAction(s),'GENERIC');
    assert.equal(new SimpleTacticsAi(1).decodeNextAction({...s}),'GENERIC');
    assert.equal(new SimpleTacticsAi(2).decodeNextAction(s),'GENERIC');
  },{Store,SimpleTacticsAi,ResolvePromptAction,observe});
  assert.equal(r.audit.selected,0);
  assert.equal(r.audit.unsupportedNativeFallbacks,1);
  assert.equal(r.audit.nonLiveFallbacks,1);
});

test('chooser rejects invalid index and restores all reversible hooks',()=>{
  const s={phase:2,turn:3,players:[player(1,'A'),player(2,'B')],
    prompts:[new ChoosePokemonPrompt(1)]};
  const oldBot=SimpleTacticsAi.prototype.decodeNextAction;
  const oldStore=Store.prototype.dispatch;
  assert.throws(()=>withActorOnlyChoosePokemon(()=>{
    const store=new Store(s);store.dispatch(new AddPlayerAction());
    new SimpleTacticsAi(1).decodeNextAction(s);
  },{Store,SimpleTacticsAi,ResolvePromptAction,observe,
    choose:()=>({index:999}),validate:()=>{}}),/Invalid detached Pokémon index/);
  assert.strictEqual(SimpleTacticsAi.prototype.decodeNextAction,oldBot);
  assert.strictEqual(Store.prototype.dispatch,oldStore);
});

test('optional empty target set permits native cancellation',()=>{
  const s={phase:2,turn:4,players:[player(1,'A'),player(2,'B')],
    prompts:[new ChoosePokemonPrompt(1,{slots:[],allowCancel:true})]};
  assert.deepEqual(chooseActorPokemon(observe(s,0)),{index:null});
});

test('face-down setup prompt delegates before any actor board projection',()=>{
  const s={phase:1,turn:0,players:[player(1,'A'),player(2,'B')],
    prompts:[new ChoosePokemonPrompt(1)]};
  assert.equal(observe(s,0),null);
  const r=withActorOnlyChoosePokemon(()=>{
    const store=new Store(s);
    store.dispatch(new AddPlayerAction());
    return new SimpleTacticsAi(1).decodeNextAction(s);
  },{Store,SimpleTacticsAi,ResolvePromptAction,observe});
  assert.equal(r.result,'GENERIC');
  assert.equal(r.audit.selected,0);
  assert.equal(r.audit.unsupportedNativeFallbacks,1);
});


test('generic first-Pokemon prompt choice can violate a preceding public Guzma Bench plan',()=>{
  // Current actor root carries a preferred physical Bench index for the
  // 'play-held-guzma-mobility' intent, but its PlayCardAction carries no
  // preference and the neutral ChoosePokemonPrompt policy sees no plan.
  const intendedBenchIndex=1;
  const input={
    actor:{decisionKind:'owner-prompt'},
    prompt:{kind:'ChoosePokemonPrompt',allowCancel:false,offered:[
      {index:0,side:'own',zone:'bench',benchIndex:0,
        printing:'Crobat V DAA',attachedEnergyCount:0},
      {index:1,side:'own',zone:'bench',benchIndex:1,
        printing:'Oranguru V ASR',attachedEnergyCount:1}
    ]}
  };
  const choice=chooseActorPokemon(input);
  assert.deepEqual(choice,{index:0});
  assert.notEqual(
    input.prompt.offered[choice.index].benchIndex,intendedBenchIndex
  );
});

// Cross-step owner-target tests extend the existing ChoosePokemon prompt gate.
require('./agent43-guzma-prompt-continuation.test.cjs');
