'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');
const {VERSION,TARGET,describeTrial} =
  require('../simulation/evaluation/agent25-crushing-before-plumeria-native.cjs');

test('the retrospective native target is immutable and scoped to rank6 T3',()=>{
  assert.match(VERSION,/source-t3-crushing-before-plumeria/);
  assert.equal(TARGET,'6:3:B:champion-reference');
});

test('genuine source T3 roots and next opponent actions remain distinguished',()=>{
  const a=describeTrial({rows:[{
    trial:{id:TARGET},sourceSeat:0,actualStarterSeat:0,
    sourceDealFingerprint:'source',fullPhysicalDealFingerprint:'full',
    finished:false,status:'action-limit',winner:null,
    rootActionLedger:[
      {playerSlot:1,turnBefore:2,pendingPrompt:null,
        actionOrdinal:4,action:'PlayCardAction',card:'Fog Crystal'},
      {playerSlot:0,turnBefore:3,pendingPrompt:null,
        actionOrdinal:29,action:'PlayCardAction',card:'Plumeria'},
      {playerSlot:0,turnBefore:3,pendingPrompt:'ChooseCardsPrompt',
        actionOrdinal:30,action:'ResolvePromptAction'},
      {playerSlot:1,turnBefore:4,pendingPrompt:null,
        actionOrdinal:35,action:'PassTurnAction'}
    ],
    actorOnlyDecisionCoverage:{ownerPlumeriaAfterPassAudit:{
      acceptedPlumeria:1}}
  }]});
  assert.equal(a.length,1);
  assert.deepEqual(a[0].sourceT3,[{
    ordinal:29,kind:'PlayCardAction',card:'Plumeria',attack:null
  }]);
  assert.deepEqual(a[0].opponentContinuation,[{
    ordinal:35,turn:4,kind:'PassTurnAction',card:null,attack:null
  }]);
  assert.equal(a[0].qualified,false);
  assert.equal(a[0].plumeriaAccepted,1);
  assert.equal(a[0].hammerAccepted,null);
});

test('missing native root cannot manufacture a settled Hammer claim',()=>{
  const rows=describeTrial({rows:[{
    trial:{id:TARGET},sourceSeat:0,
    rootActionLedger:[],sourceDealFingerprint:null,
    status:'engine-error',finished:false,
    actorOnlyDecisionCoverage:null
  }]});
  assert.deepEqual(rows[0].sourceT3,[]);
  assert.deepEqual(rows[0].opponentContinuation,[]);
  assert.equal(rows[0].hammerAccepted,null);
  assert.equal(rows[0].plumeriaAccepted,null);
  assert.equal(rows[0].qualified,false);
});

test('native T3 probe is passive, owner-visible and reversibly installed',()=>{
  const {withSourceT3CrushingProbe} =
    require('../simulation/evaluation/agent25-crushing-before-plumeria-native.cjs');
  class PlayCardAction {constructor(handIndex){this.handIndex=handIndex;}}
  class AddPlayerAction {}
  class FakeAi {
    constructor(){this.client={id:'source'};}
    decodeNextAction(){return new PlayCardAction(1);}
  }
  class FakeStore {
    constructor(state){this.state=state;}
    dispatch(action){return action.constructor.name;}
  }
  const owner={id:'source',hand:{cards:[
    {fullName:'Crushing Hammer POR',canPlay(){return true;}},
    {fullName:'Plumeria BUS'},
    {fullName:'Enhanced Hammer TWM'}
  ]}};
  const opponent={id:'opponent',active:{
    getPokemonCard(){return {fullName:'Lillie\'s Clefairy ex JTG'};},
    energies:{cards:[{fullName:'Psychic Energy MEE'}]}
  },bench:[]};
  const state={players:[owner,opponent],activePlayer:0,turn:3,prompts:[]};
  const oldDecode=FakeAi.prototype.decodeNextAction;
  const oldDispatch=FakeStore.prototype.dispatch;
  let chosen;
  const wrapped=withSourceT3CrushingProbe(()=>{
    const store=new FakeStore(state),actor=new FakeAi();
    assert.equal(store.dispatch(new AddPlayerAction()),'AddPlayerAction');
    chosen=actor.decodeNextAction(state);
    return 'unchanged-result';
  },{Ai:FakeAi,Store:FakeStore});
  assert.equal(wrapped.result,'unchanged-result');
  assert.equal(chosen.handIndex,1);
  assert.equal(wrapped.audit.observed.length,1);
  const root=wrapped.audit.observed[0];
  assert.equal(root.chosenCard,'Plumeria BUS');
  assert.equal(root.crushingHeldCopies,1);
  assert.equal(root.enhancedHeldCopies,1);
  assert.equal(root.nativeCanPlayCrushing,true);
  assert.deepEqual(root.opponentVisibleEnergy,[{
    pokemon:'Lillie\'s Clefairy ex JTG',
    energies:['Psychic Energy MEE']
  }]);
  assert.strictEqual(FakeAi.prototype.decodeNextAction,oldDecode);
  assert.strictEqual(FakeStore.prototype.dispatch,oldDispatch);
});

test('native probe refuses nonlive/synthetic wrong-player roots',()=>{
  const {withSourceT3CrushingProbe} =
    require('../simulation/evaluation/agent25-crushing-before-plumeria-native.cjs');
  class PlayCardAction {constructor(handIndex){this.handIndex=handIndex;}}
  class AddPlayerAction {}
  class FakeAi {
    constructor(){this.client={id:'source'};}
    decodeNextAction(){return new PlayCardAction(1);}
  }
  class FakeStore {
    constructor(state){this.state=state;}
    dispatch(action){return action.constructor.name;}
  }
  const state={players:[{id:'source',hand:{cards:[
    {fullName:'Crushing Hammer POR',canPlay(){throw Error('must not run');}},
    {fullName:'Plumeria BUS'}
  ]}},{id:'opponent'}],activePlayer:1,turn:3,prompts:[]};
  const observed=withSourceT3CrushingProbe(()=>{
    const store=new FakeStore(state),actor=new FakeAi();
    store.dispatch(new AddPlayerAction());
    actor.decodeNextAction(state);
  },{Ai:FakeAi,Store:FakeStore});
  assert.deepEqual(observed.audit.observed,[]);
});
