'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {
  SAMPLE_LIMIT,newElectrodeOwnerCensus,recordElectrodeOwnerCensus
}=require('../simulation/twinleaf/agent1-rank17-electrode-census.cjs');
const ELECTRODE={
  name:'Electrode-GX',printing:'Electrode-GX CES',
  abilities:['Extra Energy Bomb'],tools:[]
};
const RAICHU={
  name:'Alolan Raichu',printing:'Alolan Raichu UNM',
  abilities:[],tools:[]
};
const ENERGY='Reversal Energy PAL';

/**
 * @param {{seat?:0|1,discard?:string[],bench?:any[],opponentActive?:object|null}} [options]
 * @returns {object} Minimal detached paper-visible owner view.
 */
function view(options={}){
  return {
    decisionKind:'owner-root',actorSeat:options.seat??0,
    globalTurn:6,ownPublic:{
      active:options.active??{name:'Pikachu',printing:'Pikachu XY',
        abilities:[],tools:[]},
      bench:options.bench??[ELECTRODE,RAICHU,null,null,null],
      discard:options.discard??[],stadium:[]
    },
    opponentPublic:{
      active:options.opponentActive??null,bench:[],stadium:[]
    }
  };
}
test('zero, partial and full source line opportunities count in disjoint buckets',()=>{
  const audit=newElectrodeOwnerCensus();
  recordElectrodeOwnerCensus(audit,view({discard:[]}),{kind:'pass'},1);
  recordElectrodeOwnerCensus(audit,view({discard:[ENERGY]}),{kind:'pass'},2);
  recordElectrodeOwnerCensus(audit,
    view({discard:[ENERGY,ENERGY,ENERGY,ENERGY]}),{kind:'attack'},3);
  recordElectrodeOwnerCensus(audit,
    view({seat:1,discard:Array(5).fill(ENERGY)}),{kind:'pass'},4);
  assert.equal(audit.ownerRootDecisions,4);
  assert.equal(audit.lineCoPresentRoots,4);
  assert.equal(audit.lineWithZeroDiscardEnergyRoots,1);
  assert.equal(audit.lineWithOneToFourDiscardEnergyRoots,2);
  assert.equal(audit.lineWithFivePlusDiscardEnergyRoots,1);
  assert.equal(audit.physicalNecessaryRoots,3);
  assert.equal(audit.bySeat[0].physicalNecessaryRoots,2);
  assert.equal(audit.bySeat[1].physicalNecessaryRoots,1);
  assert.deepEqual(audit.positiveRootIntentKinds,{pass:2,attack:1});
  assert.equal(audit.competitivelyQualifiedGames,0);
  assert.equal(audit.paperLegality,'UNVERIFIED');
});
test('missing recipient only blocks line-specific numerator',()=>{
  const audit=newElectrodeOwnerCensus();
  recordElectrodeOwnerCensus(audit,
    view({discard:Array(5).fill(ENERGY),bench:[ELECTRODE,null,null,null,null]}),
    {kind:'pass'},1);
  assert.equal(audit.electrodeInPlayRoots,1);
  assert.equal(audit.raichuRecipientInPlayRoots,0);
  assert.equal(audit.lineCoPresentRoots,0);
  assert.equal(audit.physicalNecessaryRoots,0);
});
test('missing Electrode does not inflate availability from an exposed Raichu',()=>{
  const audit=newElectrodeOwnerCensus();
  recordElectrodeOwnerCensus(audit,
    view({discard:Array(5).fill(ENERGY),bench:[RAICHU,null,null,null,null]}),
    {kind:'pass'},1);
  assert.equal(audit.electrodeInPlayRoots,0);
  assert.equal(audit.raichuRecipientInPlayRoots,1);
  assert.equal(audit.physicalNecessaryRoots,0);
});
test('public suppression hints stay warnings and no paper legality is inferred',()=>{
  const audit=newElectrodeOwnerCensus();
  recordElectrodeOwnerCensus(audit,
    view({discard:[ENERGY],opponentActive:{
      name:'Wobbuffet',printing:'Wobbuffet PHF',
      abilities:['Bide Barricade'],tools:[]
    }}),{kind:'pass'},1);
  assert.equal(audit.physicalNecessaryRoots,1);
  assert.equal(audit.publicLockClueCounts['opposing-active-bide-barricade'],1);
  assert.equal(audit.examples[0].paperLegality,'UNVERIFIED');
});
test('sample retention is bounded, while counts retain every repeated root',()=>{
  const audit=newElectrodeOwnerCensus();
  for(let i=0;i<SAMPLE_LIMIT+5;i++){
    recordElectrodeOwnerCensus(audit,view({discard:[ENERGY]}),{kind:'pass'},i+1);
  }
  assert.equal(audit.ownerRootDecisions,SAMPLE_LIMIT+5);
  assert.equal(audit.physicalNecessaryRoots,SAMPLE_LIMIT+5);
  assert.equal(audit.examples.length,SAMPLE_LIMIT);
  assert.equal(audit.samplesTruncated,5);
  assert.equal(audit.competitivelyQualifiedGames,0);
});
test('hidden fields cannot change counts or retained owner evidence',()=>{
  const a=newElectrodeOwnerCensus(),b=newElectrodeOwnerCensus();
  const visible=view({discard:[ENERGY]});
  recordElectrodeOwnerCensus(a,visible,{kind:'pass'},1);
  recordElectrodeOwnerCensus(b,
    {...visible,opponentHandSecret:['card'],ownUnknownPrizes:['card']},
    {kind:'pass'},1);
  assert.deepEqual(b,a);
});

test('source-wide partial Bomb opportunity is distinct from Raichu-line opportunity',()=>{
  const audit=newElectrodeOwnerCensus();
  const voltorb={name:'Voltorb',printing:'Voltorb ROS',abilities:[],tools:[]};
  const sourceGxActive={name:'Gengar & Mimikyu-GX',
    printing:'Gengar & Mimikyu-GX TEU',abilities:[],tools:[]};
  const opponentGx={name:'Gengar & Mimikyu-GX',
    printing:'Gengar & Mimikyu-GX TEU',abilities:[],tools:[]};
  recordElectrodeOwnerCensus(audit,
    view({discard:[ENERGY],active:sourceGxActive,
      bench:[ELECTRODE,voltorb,null,null,null]}),
    {kind:'pass'},1);
  recordElectrodeOwnerCensus(audit,
    view({discard:Array(5).fill(ENERGY),active:sourceGxActive,
      bench:[ELECTRODE,opponentGx,null,null,null]}),
    {kind:'pass'},2);
  recordElectrodeOwnerCensus(audit,
    view({discard:[],active:sourceGxActive,
      bench:[ELECTRODE,voltorb,null,null,null]}),
    {kind:'attack'},3);
  assert.equal(audit.ownerRootDecisions,3);
  assert.equal(audit.generalBombSourceElectrodeRecipientCoPresentRoots,2);
  assert.equal(audit.generalBombPartialOneToFourDiscardRoots,1);
  assert.equal(audit.generalBombFullFivePlusDiscardRoots,0);
  assert.equal(audit.generalBombZeroDiscardRoots,1);
  assert.equal(audit.generalBombPhysicallyNecessaryRoots,1);
  assert.deepEqual(audit.generalBombPositiveRootIntentKinds,{pass:1});
  assert.equal(audit.physicalNecessaryRoots,0);
  assert.equal(audit.competitivelyQualifiedGames,0);
});
