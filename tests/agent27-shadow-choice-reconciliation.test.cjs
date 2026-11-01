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
    offers:[{...first,source:'first-return',slot:'bench',index:1},
      {...other,source:'alternative',slot:'bench',index:1}]}};
}
test('two passes use unchanged owner view and retain alternative physical Bench copy',()=>{
  const original=structuredClone(owner);
  const out=reconcileShadowAndChoice(owner,catalog,baseline,{},chooser);
  assert.deepEqual(owner,original);
  assert.equal(out.selectedIntent.printing,'Tapu Lele-GX GRI');
  assert.equal(out.verification.selectedPhysicalOfferInShadow,true);
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
  assert.deepEqual(seen,[[true,false],[false,true]]);
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
