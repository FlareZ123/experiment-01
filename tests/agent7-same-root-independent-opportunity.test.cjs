'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {
  collectAndChooseOwnerRoot,structurallySupported,
  newSameRootAudit,recordSameRootAudit
}=require('../simulation/twinleaf/agent41-same-root-proposal-choice.cjs');

function rootView(overrides={}) {
  return {
    decisionKind:'owner-root',globalTurn:4,
    ownHand:['Grass Energy SVE 1','Double Dragon Energy ROS 97',
      'Team Flare Grunt XY 129','Carmine TWM 145',
      'Mysterious Treasure FLI 113','Dragon donor SIT 101'],
    ownTurnResources:{
      energyPlayedTurn:0,supporterPlayedTurn:0,
      energyPlayLocked:false,specialEnergyPlayLocked:false,
      supporterPlayLocked:false,itemPlayLocked:false,
      stadiumPlayLocked:false,stadiumPlayedTurn:0
    },
    ownPublic:{
      active:{attacks:[{name:'Dragon Laser',damage:130}],energies:[]},
      bench:[null,{printing:'Backup SIT 99',energies:[]}],
      publicTurnRestrictions:{},prizeCount:6
    },
    opponentPublic:{
      active:{energies:['Psychic Energy SVE 5','Psychic Energy SVE 5']},
      bench:[{printing:'Opponent Backup SIT 5'}]
    },
    ...overrides
  };
}

function firstBasic(){
  return {kind:'attach-basic-energy',handIndex:0,
    printing:'Grass Energy SVE 1',slot:'active',index:0};
}

test('a synthetic hold cannot manufacture an independent opportunity',()=>{
  const out=collectAndChooseOwnerRoot(rootView(),{},firstBasic(),
    {},[]);
  assert.equal(out.receipt.opportunityCount,2);
  assert.equal(out.receipt.supportedAlternativeCount,0);
  assert.deepEqual(out.receipt.offers.map(o=>o.source),
    ['first-return','terminal-hold']);
  const audit=newSameRootAudit();
  recordSameRootAudit(audit,0,4,1,out.receipt);
  assert.equal(audit.ownerRoots,1);
  assert.equal(audit.offerRoots,0);
  assert.equal(audit.samples.length,0);
});

test('one independent payable-looking Special is counted and can be chosen',()=>{
  const proposer=[{
    name:'immediate-special',flag:'publicContextSpecialEnergy',
    propose:()=>({kind:'attach-special-energy',handIndex:1,
      printing:'Double Dragon Energy ROS 97',slot:'active',index:0})
  }];
  const out=collectAndChooseOwnerRoot(rootView(),{},firstBasic(),
    {publicContextSpecialEnergy:true,sameRootChoiceApply:true},proposer);
  assert.equal(out.intent.printing,'Double Dragon Energy ROS 97');
  assert.equal(out.receipt.selectedSource,'immediate-special');
  assert.equal(out.receipt.changed,true);
  assert.equal(out.receipt.supportedAlternativeCount,1);
  const audit=newSameRootAudit();
  recordSameRootAudit(audit,1,4,11,out.receipt);
  assert.equal(audit.bySeat[1].changedRoots,1);
  assert.equal(audit.offerRoots,1);
  assert.equal(audit.changedSamples[0].rootOrdinal,11);
});

test('unsupported proposals and thrown selectors do not inflate counts',()=>{
  const proposals=[
    {name:'missing-card',flag:'x',propose:()=>({
      kind:'attach-special-energy',handIndex:89,
      printing:'Double Dragon Energy ROS 97',slot:'active',index:0
    })},
    {name:'broken',flag:'x',propose:()=>{throw Error('selector bug')}}
  ];
  const out=collectAndChooseOwnerRoot(rootView(),{},firstBasic(),
    {sameRootProbeAll:true},proposals);
  assert.equal(out.receipt.supportedAlternativeCount,0);
  assert.equal(out.receipt.unsupportedSelectors.length,1);
  assert.equal(out.receipt.selectorErrors.length,1);
  const audit=newSameRootAudit();
  recordSameRootAudit(audit,0,4,5,out.receipt);
  assert.equal(audit.offerRoots,0);
  assert.equal(audit.selectorErrorRoots,1);
});

test('distinct physically paid search costs remain separate independent offers',()=>{
  const intent={kind:'play-mysterious-treasure',handIndex:4,
    printing:'Mysterious Treasure FLI 113'};
  const proposals=[{name:'treasure',flag:'x',propose:()=>[
    {...intent,discardSourceIndex:5,discardPrinting:'Dragon donor SIT 101'},
    {...intent,discardSourceIndex:0,discardPrinting:'Grass Energy SVE 1'}
  ]}];
  const out=collectAndChooseOwnerRoot(rootView(),{},
    {kind:'pass'},{sameRootProbeAll:true},proposals);
  assert.equal(out.receipt.supportedAlternativeCount,2);
  assert.deepEqual(out.receipt.offers.filter(o=>o.source==='treasure')
    .map(o=>o.proposedDiscardIndex).sort((a,b)=>a-b),[0,5]);
});

test('owner first turn disallows ordinary Supporter but admits printed Carmine exception',()=>{
  const view=rootView({globalTurn:1});
  const ordinary={kind:'play-lowhand-lillie',handIndex:3,
    printing:'Carmine TWM 145'};
  const carmine={kind:'play-carmine-first',handIndex:3,
    printing:'Carmine TWM 145'};
  assert.equal(structurallySupported(view,ordinary),false);
  assert.equal(structurallySupported(view,carmine),true);
});

test('Grunt-versus-attack override needs a public opposing backup and nonfinal Prizes',()=>{
  const baseline={kind:'attack',attackName:'Dragon Laser'};
  const offered=[{name:'denial',flag:'x',propose:()=>({
    kind:'play-team-flare-grunt-denial',handIndex:2,
    printing:'Team Flare Grunt XY 129'
  })}];
  const chosen=collectAndChooseOwnerRoot(rootView(),{},baseline,
    {sameRootChoiceApply:true,x:true},offered);
  assert.equal(chosen.receipt.selectedSource,'denial');
  assert.equal(chosen.receipt.supportedAlternativeCount,1);
  const late=rootView();
  late.ownPublic.prizeCount=3;
  const retained=collectAndChooseOwnerRoot(late,{},baseline,
    {sameRootChoiceApply:true,x:true},offered);
  assert.equal(retained.receipt.selectedSource,'first-return');
  assert.equal(retained.receipt.supportedAlternativeCount,1);
});

test('all-proposer observation never changes the chosen root',()=>{
  const offered=[{name:'immediate-special',flag:'disabled',
    propose:()=>({kind:'attach-special-energy',handIndex:1,
      printing:'Double Dragon Energy ROS 97',slot:'active',index:0})}];
  const result=collectAndChooseOwnerRoot(rootView(),{},firstBasic(),
    {sameRootProbeAll:true},offered);
  assert.deepEqual(result.intent,firstBasic());
  assert.equal(result.receipt.supportedAlternativeCount,1);
  assert.equal(result.receipt.mode,'all-proposers-observe');
  assert.throws(()=>collectAndChooseOwnerRoot(rootView(),{},firstBasic(),
    {sameRootProbeAll:true,sameRootChoiceApply:true},offered));
});

test('grouped Plumeria observer preserves physical payments and public Bench target',()=>{
  const plumeria=require('../simulation/twinleaf/agent41-same-root-proposal-choice.cjs')
    .PROPOSERS.filter(p=>p.name==='grouped-plumeria-payments');
  assert.equal(plumeria.length,1);
  const view=rootView({
    ownHand:['Plumeria BUS','Team Flare Grunt XY',
      'Psychic Energy SVE 5','Grass Energy SVE 1'],
    opponentPublic:{
      active:{printing:'Opponent Active TWM 77',
        energies:['Psychic Energy SVE 5','Psychic Energy SVE 5']},
      bench:[{printing:'Opponent Bench BUS 19',
        energies:['Darkness Energy SVE 7']}]
    }
  });
  const out=collectAndChooseOwnerRoot(view,{},{
    kind:'pass'
  },{sameRootProbeAll:true},plumeria);
  assert.equal(out.receipt.supportedAlternativeCount,1);
  assert.equal(out.receipt.selectedSource,'first-return');
  const offer=out.receipt.offers.find(o=>
    o.source==='grouped-plumeria-payments');
  assert.equal(offer.nativeDispatchImplemented,false);
  assert.equal(offer.physicalPaymentPairCount,3);
  assert.equal(offer.publicDenialTargetCount,3);
  assert.equal(offer.benchDenialTargetCount,1);
  assert.equal(offer.paymentPairsConsumingFlare,2);
  assert.equal(offer.score,-1000);
  const audit=newSameRootAudit();
  recordSameRootAudit(audit,1,4,7,out.receipt);
  assert.equal(audit.offerRoots,1);
  assert.equal(audit.offerKindCounts['play-plumeria-payment-menu'],1);
});

test('two physical Plumeria copies remain distinct grouped owner offers',()=>{
  const plumeria=require('../simulation/twinleaf/agent41-same-root-proposal-choice.cjs')
    .PROPOSERS.filter(p=>p.name==='grouped-plumeria-payments');
  const view=rootView({
    ownHand:['Plumeria BUS','Plumeria BUS','Psychic Energy SVE 5',
      'Team Flare Grunt XY'],
    opponentPublic:{
      active:{printing:'Opponent Active TWM 77',
        energies:['Psychic Energy SVE 5']},bench:[]
    }
  });
  const out=collectAndChooseOwnerRoot(view,{},{
    kind:'pass'
  },{sameRootProbeAll:true},plumeria);
  assert.equal(out.receipt.supportedAlternativeCount,2);
  assert.deepEqual(out.receipt.offers.filter(o=>
    o.source==='grouped-plumeria-payments').map(o=>o.handIndex).sort(),
  [0,1]);
});

test('grouped Plumeria cannot become selectable or evade hand and quota guards',()=>{
  const module=require('../simulation/twinleaf/agent41-same-root-proposal-choice.cjs');
  const proposer=module.PROPOSERS.find(p=>
    p.name==='grouped-plumeria-payments');
  const view=rootView({
    ownHand:['Plumeria BUS','Team Flare Grunt XY',
      'Psychic Energy SVE 5'],
    opponentPublic:{
      active:{printing:'Opponent Active TWM 77',
        energies:['Psychic Energy SVE 5']},bench:[]
    }
  });
  const [offer]=proposer.propose(view,{});
  assert.equal(structurallySupported(view,offer),true);
  assert.equal(structurallySupported(view,{
    ...offer,paymentPairs:[{handIndices:[0,1],
      printings:['Plumeria BUS','Team Flare Grunt XY']}]
  }),false);
  assert.equal(structurallySupported(view,{
    ...offer,paymentTargets:[{slot:'bench',index:4,
      pokemonPrinting:'Imaginary',energyIndex:0,
      energyPrinting:'Psychic Energy SVE 5'}]
  }),false);
  const spent=rootView({...view,
    ownTurnResources:{...view.ownTurnResources,supporterPlayedTurn:4}});
  assert.equal(structurallySupported(spent,offer),false);
  const selected=collectAndChooseOwnerRoot(view,{},{
    kind:'pass'
  },{sameRootChoiceApply:true,sameRootProbeAll:false},[
    {...proposer,flag:'test-plumeria'}
  ]);
  assert.equal(selected.receipt.supportedAlternativeCount,0);
  const observed=collectAndChooseOwnerRoot(view,{},{
    kind:'pass'
  },{sameRootProbeAll:true},[proposer]);
  assert.equal(observed.receipt.supportedAlternativeCount,1);
  assert.equal(observed.intent.kind,'pass');
});
