'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {classifyVoltCyclonePublicMove,auditFrozenPromptCoverage}=
  require('../simulation/evaluation/agent45-frozen-prompt-coverage.cjs');

const slot=(pokemon,energies)=>({pokemon,energies,tools:[]});
const source={seat:1,position:'active',index:0,
  before:slot('Iron Thorns ex TWM',['Double Colorless Energy SUM','Speed Lightning Energy RCL']),
  after:slot('Iron Thorns ex TWM',['Speed Lightning Energy RCL'])};
const bench={seat:1,position:'bench',index:0,
  before:slot('Iron Thorns ex TWM',[]),
  after:slot('Iron Thorns ex TWM',['Double Colorless Energy SUM'])};
const native={nativeDispatchAccepted:true,promptType:'AttachEnergyPrompt',
  playerSlot:1,publicChanges:[source,bench]};

test('one legal-shape source-to-own-Bench move is recognized',()=>{
  assert.equal(classifyVoltCyclonePublicMove(native,1),
    'PUBLIC_VOLT_CYCLONE_ONE_ENERGY_MATCH');
});

test('opponent KO side effects do not change the source movement conclusion',()=>{
  const enemy={seat:0,position:'active',index:0,
    before:slot('Klefki SVI',[]),after:slot(null,[])};
  assert.equal(classifyVoltCyclonePublicMove(
    {...native,publicChanges:[enemy,source,bench]},1),
  'PUBLIC_VOLT_CYCLONE_ONE_ENERGY_MATCH');
});

test('wrong owner and unaccepted prompt cannot qualify',()=>{
  assert.equal(classifyVoltCyclonePublicMove(native,0),
    'NO_SOURCE_NATIVE_ACCEPTANCE');
  assert.equal(classifyVoltCyclonePublicMove({...native,nativeDispatchAccepted:false},1),
    'NO_SOURCE_NATIVE_ACCEPTANCE');
});

test('two moved Energies or unrelated card print fail closed',()=>{
  const two={...source,
    before:slot('Iron Thorns ex TWM',['Double Colorless Energy SUM','Speed Lightning Energy RCL','Spiky Energy JTG']),
    after:slot('Iron Thorns ex TWM',['Spiky Energy JTG'])};
  assert.equal(classifyVoltCyclonePublicMove({...native,publicChanges:[two,bench]},1),
    'PUBLIC_ONE_ENERGY_MOVE_MISMATCH');
  assert.equal(classifyVoltCyclonePublicMove({...native,publicChanges:[
    {...source,before:slot('Other Pokémon',['Double Colorless Energy SUM','Speed Lightning Energy RCL']),
      after:slot('Other Pokémon',['Speed Lightning Energy RCL'])},bench]},1),
    'SOURCE_PRINTING_UNVERIFIED');
});

test('source geometry or missing public deltas fail closed',()=>{
  assert.equal(classifyVoltCyclonePublicMove({...native,publicChanges:[]},1),
    'SOURCE_GEOMETRY_UNVERIFIED');
  assert.equal(classifyVoltCyclonePublicMove({...native,publicChanges:null},1),
    'PUBLIC_DELTA_MISSING');
});

test('postgame counts preserve paper-unverified veto even on matching public effects',()=>{
  const archive={rows:[{
    trial:{id:'6:1:A:test',rank:6},sourceSeat:1,
    nativePromptChoices:{events:[
      {kind:'ChooseCardsPrompt',nativePromptMin:1,nativePromptMax:2,
        nativePromptAllowCancel:false,sourceZone:'deck',selectedCards:['Iron Thorns ex TWM']},
      {kind:'ChooseCardsPrompt',nativePromptMin:2,nativePromptMax:2,
        nativePromptAllowCancel:true,sourceZone:'discard',selectedCards:null},
      {kind:'SelectOptionPrompt',selectedOption:1}
    ]},
    nativeAcceptedEnergyPromptSidecar:{events:[native]}
  }]};
  const result=auditFrozenPromptCoverage(archive);
  assert.equal(result.choiceEvents,3);
  assert.equal(result.selectedWithinNativeNumericBounds,1);
  assert.equal(result.cancelledWithNativePermission,1);
  assert.equal(result.publicVoltCycloneShapeMatches,1);
  assert.equal(result.promptPaperVerdict,'PROMPT_PAPER_UNVERIFIED');
  assert.equal(result.fullPrintedPromptCoverage,false);
  assert.equal(result.totalNativePromptResolutionCount,'UNKNOWN');
});
