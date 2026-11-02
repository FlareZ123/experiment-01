'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {physicalKey,reconcileShadowAndChoice}=
  require('../simulation/twinleaf/agent27-shadow-choice-reconciliation.cjs');
const owner={decisionKind:'owner-root',globalTurn:4,
  ownHand:['Girafarig LOT','Tapu Lele-GX GRI'],
  ownPublic:{bench:[{printing:'A'},null]},
  ownTurnResources:{pokemonPlayLocked:false},
  opponentPublic:{handCount:3}};
const catalog={basics:new Set(owner.ownHand)};
const baseline={kind:'bench-basic',handIndex:0,
  printing:'Girafarig LOT',benchIndex:1};
function chooser(view,_catalog,first,options){
  const shadow=options.sameRootProbeAll===true;
  const other={kind:'bench-basic',handIndex:1,
    printing:view.ownHand[1],benchIndex:1};
  const selected=shadow?first:other;
  return {intent:selected,receipt:{mode:shadow?'all-proposers-observe':'select',
    selectedSource:shadow?'first-return':'alternative',
    supportedAlternativeCount:1,
    offers:[{...first,source:'first-return',slot:'bench',index:1},
      {...other,source:'alternative',slot:'bench',index:1}]}};
}
test('two passes use unchanged owner view and retain alternative physical Bench copy',()=>{
  const original=structuredClone(owner);
  const out=reconcileShadowAndChoice(owner,catalog,baseline,{},chooser);
  assert.deepEqual(owner,original);
  assert.equal(out.selectedIntent.printing,'Tapu Lele-GX GRI');
  assert.equal(out.verification.selectedPhysicalOfferInShadow,true);
  assert.equal(out.verification.prePostShadowExecutableDecisionIdentical,true);
  assert.equal(out.verification.nativeStoreAccepted,false);
  assert.equal(out.shadowReceipt.mode,'all-proposers-observe');
  assert.equal(out.selectionReceipt.mode,'select');
});
test('a fabricated selector cannot promote a choice absent from the same-root census',()=>{
  const forged=(...args)=>{
    const out=chooser(...args);
    if(args[3].sameRootChoiceApply===true){
      out.intent={kind:'bench-basic',handIndex:9,
        printing:'Ghost',benchIndex:1};
      out.receipt.offers.push({...out.intent,source:'alternative',
        slot:'bench',index:1});
    }
    return out;
  };
  assert.throws(()=>reconcileShadowAndChoice(owner,catalog,baseline,{},forged),
    /absent from all-proposer/);
});
test('a selector that mutates owner-hidden-neutral public state fails closed',()=>{
  const dirty=(view,...rest)=>{
    const out=chooser(view,...rest);
    view.opponentPublic.handCount++;
    return out;
  };
  assert.throws(()=>reconcileShadowAndChoice(structuredClone(owner),
    catalog,baseline,{},dirty),/mutated detached owner view/);
});
test('physical keys preserve hand copy, Bench recipient and payment index',()=>{
  assert.notEqual(physicalKey(baseline),physicalKey({...baseline,handIndex:1}));
  assert.notEqual(physicalKey(baseline),physicalKey({...baseline,benchIndex:0}));
  assert.notEqual(physicalKey({kind:'play-quick-ball',printing:'Quick Ball SSH',
    handIndex:0,discardSourceIndex:1}),
    physicalKey({kind:'play-quick-ball',printing:'Quick Ball SSH',
      handIndex:0,discardSourceIndex:2}));
});
test('shadow and selection toggles cannot be simultaneously active',()=>{
  const seen=[];
  const spy=(view,catalog,first,options)=>{
    seen.push([options.sameRootProbeAll,options.sameRootChoiceApply]);
    return chooser(view,catalog,first,options);
  };
  reconcileShadowAndChoice(owner,catalog,baseline,
    {sameRootProbeAll:true,sameRootChoiceApply:true},spy);
  assert.deepEqual(seen,[[false,true],[true,false],[false,true]]);
});
test('shadow observer cannot silently alter a subsequent executable selection',()=>{
  let broadObserverHasRun=false;
  const contaminating=(...args)=>{
    const out=chooser(...args);
    if(args[3].sameRootProbeAll===true)broadObserverHasRun=true;
    else if(broadObserverHasRun){
      out.intent=structuredClone(baseline);
      out.receipt.selectedSource='first-return';
    }
    return out;
  };
  assert.throws(()=>reconcileShadowAndChoice(owner,catalog,baseline,
    {},contaminating),/shadow changed a later same-root executable decision/);
});
test('real common selector keeps independent immediate Special contender in shadow',()=>{
  const {collectAndChooseOwnerRoot}=require(
    '../simulation/twinleaf/agent41-same-root-proposal-choice.cjs');
  const view={decisionKind:'owner-root',globalTurn:4,
    ownHand:['Grass Energy SVE 1','Double Dragon Energy ROS 97'],
    ownTurnResources:{energyPlayedTurn:0,energyPlayLocked:false,
      specialEnergyPlayLocked:false},
    ownPublic:{active:{attacks:[{name:'Dragon Laser',damage:130}],
      energies:[]},bench:[],publicTurnRestrictions:{}},
    opponentPublic:{active:{energies:[]},bench:[]}};
  const basic={kind:'attach-basic-energy',handIndex:0,
    printing:'Grass Energy SVE 1',slot:'active',index:0};
  const proposed={kind:'attach-special-energy',handIndex:1,
    printing:'Double Dragon Energy ROS 97',slot:'active',index:0};
  const proposer=[{name:'immediate-special',flag:'publicContextSpecialEnergy',
    propose:()=>proposed}];
  const evaluate=(v,c,b,o)=>collectAndChooseOwnerRoot(v,c,b,o,proposer);
  const out=reconcileShadowAndChoice(view,{},basic,
    {publicContextSpecialEnergy:true},evaluate);
  assert.deepEqual(out.selectedIntent,proposed);
  assert.equal(out.selectionReceipt.changed,true);
  assert.equal(out.shadowReceipt.independentAllProposers,true);
  assert.equal(out.verification.nativeCanPlayVerified,false);
});

test('shared all-proposer mode sees unchosen physical Basics after Pass at final Bench',()=>{
  const {PROPOSERS,collectAndChooseOwnerRoot}=require(
    '../simulation/twinleaf/agent41-same-root-proposal-choice.cjs');
  const proposer=PROPOSERS.find(p=>p.name==='agent27-lastbench-same-kind');
  assert.ok(proposer,'Observer must be registered in shared proposer family');
  assert.equal(proposer.flag,'agent27LastBenchShadow');
  const view={...owner,ownPublic:{...owner.ownPublic,
    active:{printing:'E'},bench:[{printing:'A'},{printing:'B'},
      {printing:'C'},{printing:'D'},null]}};
  const completeCatalog={basics:new Set(owner.ownHand),
    abilityBasics:new Set(['Tapu Lele-GX GRI'])};
  const first={kind:'pass'};
  const before=structuredClone(view);
  const observed=collectAndChooseOwnerRoot(view,completeCatalog,first,
    {sameRootProbeAll:true,sameRootChoiceApply:false},[proposer]);
  assert.deepEqual(view,before);
  assert.deepEqual(observed.intent,first);
  assert.equal(observed.receipt.mode,'all-proposers-observe');
  assert.equal(observed.receipt.supportedAlternativeCount,2);
  const basics=observed.receipt.offers.filter(x=>
    x.source==='agent27-lastbench-same-kind');
  assert.deepEqual(basics.map(x=>[x.printing,x.handIndex,x.index]).sort(),
    [['Girafarig LOT',0,4],['Tapu Lele-GX GRI',1,4]]);
  assert.ok(basics.every(x=>x.nativeDispatchImplemented===false));
  const defaultOff=collectAndChooseOwnerRoot(view,completeCatalog,first,
    {sameRootProbeAll:false,sameRootChoiceApply:false},[proposer]);
  assert.equal(defaultOff.receipt.supportedAlternativeCount,0);
  const benchFirst={kind:'bench-basic',printing:'Girafarig LOT',
    handIndex:0,benchIndex:4};
  const sameKind=collectAndChooseOwnerRoot(view,completeCatalog,benchFirst,
    {sameRootProbeAll:true,sameRootChoiceApply:false},[proposer]);
  assert.equal(sameKind.receipt.supportedAlternativeCount,1);
  assert.equal(sameKind.receipt.offers.find(x=>
    x.source==='agent27-lastbench-same-kind').printing,'Tapu Lele-GX GRI');
});

test('last-Bench shadow obeys owner play locks and ignores opponent hidden cards',()=>{
  const {lastBenchShadowProposer}=require(
    '../simulation/twinleaf/agent27-owner-lastbench-basic-conflict.cjs');
  const propose=lastBenchShadowProposer().propose;
  const catalog={basics:new Set(owner.ownHand),
    abilityBasics:new Set(['Tapu Lele-GX GRI'])};
  const view={...owner,ownPublic:{active:{printing:'E'},
    bench:[{printing:'A'},{printing:'B'},{printing:'C'},
      {printing:'D'},null]}};
  const initial=propose(view,catalog,{}, {kind:'pass'});
  assert.equal(initial.length,2);
  const unseen={...view,opponentPrivate:{hand:['Secret'],prizes:['X']},
    unseenOwnedDeckOrder:['Private']};
  assert.deepEqual(propose(unseen,catalog,{}, {kind:'pass'}),initial);
  assert.deepEqual(propose({...view,ownTurnResources:{
    pokemonPlayLocked:true}},catalog,{}, {kind:'pass'}),[]);
  const noAbility=propose({...view,ownTurnResources:{
    pokemonPlayLocked:false,abilityPokemonPlayLocked:true}},
    catalog,{}, {kind:'pass'});
  assert.deepEqual(noAbility.map(x=>x.printing),['Girafarig LOT']);
});
