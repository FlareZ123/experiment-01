'use strict';

const assert=require('node:assert/strict');
const test=require('node:test');
const path=require('node:path');
const {
  RULES,targetMatch,buildPublicPrintMetadata,
  loadBundledPublicPrintMetadata,publicDiscardTargetNecessary
}=require('../simulation/twinleaf/planning/owner-public-discard-target-necessary.cjs');

const source=Object.keys(RULES);
const meta=new Map([
  ['Guzma BUS',{supertype:'Trainer',subtypes:['Supporter']}],
  ['Battle Compressor PHF',{supertype:'Trainer',subtypes:['Item']}],
  ['Koffing CEC',{supertype:'Pokémon',subtypes:['Basic'],hp:'60'}],
  ['Shadow Rider Calyrex VMAX CRE',{supertype:'Pokémon',subtypes:['VMAX'],hp:'320'}],
  ['Psychic Energy SVE',{supertype:'Energy',subtypes:['Basic']}],
  ['Double Colorless Energy SUM',{supertype:'Energy',subtypes:['Special']}]
]);
function view(printing,discard=[],extra={}){
  return {
    decisionKind:'owner-root',actorSeat:0,globalTurn:6,
    ownHand:[printing,'Other held card'],
    ownPublic:{discard},
    opponentPublic:{concealedHand:['SENSITIVE_OPPONENT_CARD']},
    ...extra
  };
}
function check(printing,discard=[],catalog=meta){
  return publicDiscardTargetNecessary(view(printing,discard),
    {handIndex:0,printing},catalog);
}

test('source-registered exact printings and public source IDs are explicit',()=>{
  assert.equal(source.length,5);
  assert.equal(RULES['VS Seeker PHF'].sourceId,'xy4-109');
  assert.equal(RULES['Rescue Carrier EVS'].sourceId,'swsh7-154');
  assert.equal(RULES['Night Stretcher ASC'].sourceId,'me2pt5-196');
});

test('VS Seeker rejects empty or non-Supporter discard, accepts public target',()=>{
  assert.equal(check('VS Seeker PHF').paperPlayable,false);
  const noSupport=check('VS Seeker PHF',['Battle Compressor PHF']);
  assert.equal(noSupport.blocker,'proven-no-public-discard-target');
  const withSupport=check('VS Seeker PHF',['Battle Compressor PHF','Guzma BUS']);
  assert.equal(withSupport.paperPlayable,null);
  assert.deepEqual(withSupport.eligibleTargetIndices,[1]);
});

test('the low-HP bound is checked on the actual discarded Pokémon',()=>{
  assert.equal(check('Rescue Carrier EVS',['Shadow Rider Calyrex VMAX CRE'])
    .paperPlayable,false);
  assert.deepEqual(check('Rescue Carrier EVS',['Koffing CEC'])
    .eligibleTargetIndices,[0]);
  assert.equal(targetMatch({supertype:'Pokémon',subtypes:['Basic']},
    'pokemon-hp-90'),null);
});

test('recovery classes distinguish Basic and Special Energy, and Pokémon',()=>{
  assert.equal(check('Super Rod PAL',['Double Colorless Energy SUM'])
    .paperPlayable,false);
  assert.equal(check('Night Stretcher ASC',['Psychic Energy SVE'])
    .paperPlayable,null);
  assert.equal(check('Special Charge STS',['Psychic Energy SVE'])
    .paperPlayable,false);
  assert.deepEqual(check('Special Charge STS',['Double Colorless Energy SUM'])
    .eligibleTargetIndices,[0]);
  assert.deepEqual(check('Super Rod PAL',['Koffing CEC'])
    .eligibleTargetIndices,[0]);
});

test('missing print metadata is UNKNOWN, never a false negative',()=>{
  const x=check('VS Seeker PHF',['unregistered unknown printing']);
  assert.equal(x.paperPlayable,null);
  assert.equal(x.status,'target-identity-unresolved');
  assert.deepEqual(x.unknownMetadataIndices,[0]);
  const y=check('Rescue Carrier EVS',['Unknown Pokémon'],new Map([
    ['Unknown Pokémon',{supertype:'Pokémon',subtypes:['Basic']}]
  ]));
  assert.equal(y.paperPlayable,null);
  assert.deepEqual(y.unknownMetadataIndices,[0]);
});

test('all five printings fail on an actually empty public discard pile',()=>{
  for(const printing of source)
    assert.equal(check(printing,[]).paperPlayable,false,printing);
});

test('owner-hand copy and root status are mandatory inputs',()=>{
  assert.throws(()=>publicDiscardTargetNecessary(view(source[0]),
    {handIndex:1,printing:source[0]},meta));
  assert.throws(()=>publicDiscardTargetNecessary(view(source[0],[],{
    decisionKind:'owner-prompt'}),{handIndex:0,printing:source[0]},meta));
});

test('concealed opponent state is not consulted or serialized',()=>{
  const a=view(source[0],['Guzma BUS']);
  const b=view(source[0],['Guzma BUS']);
  Object.defineProperty(b.opponentPublic,'concealedHand',{get(){
    throw new Error('opponent hand must not be read');
  }});
  const first=publicDiscardTargetNecessary(a,{handIndex:0,printing:source[0]},meta);
  const second=publicDiscardTargetNecessary(b,{handIndex:0,printing:source[0]},meta);
  assert.deepEqual(first,second);
  assert.equal(JSON.stringify(first).includes('SENSITIVE_OPPONENT_CARD'),false);
});


test('same-name same-set HP threshold conflicts are unresolved, not guessed',()=>{
  const index=buildPublicPrintMetadata(
    [{id:'bw1',ptcgoCode:'BLW'}],[{setId:'bw1',cards:[
      {name:'Bouffalant',supertype:'Pokémon',subtypes:['Basic'],hp:'90'},
      {name:'Bouffalant',supertype:'Pokémon',subtypes:['Basic'],hp:'100'},
      {name:'Bouffalant',supertype:'Pokémon',subtypes:['Basic'],hp:'90'}
    ]}]);
  assert.equal(index.get('Bouffalant BLW').variants.length,2);
  assert.equal(targetMatch(index.get('Bouffalant BLW'),'pokemon-hp-90'),null);
  assert.equal(targetMatch(index.get('Bouffalant BLW'),
    'pokemon-or-basic-energy'),true);
  const ambiguous=check('Rescue Carrier EVS',['Bouffalant BLW'],index);
  assert.equal(ambiguous.paperPlayable,null);
  assert.deepEqual(ambiguous.unknownMetadataIndices,[0]);
  assert.equal(targetMatch({supertype:'Trainer',subtypes:[]},'supporter'),null);
  assert.equal(targetMatch({supertype:'Energy',subtypes:[]},'special-energy'),null);
});

test('bundled database preserves real HP collision and five source cards',()=>{
  const index=loadBundledPublicPrintMetadata(
    path.join(__dirname,'../resources'));
  assert.equal(targetMatch(index.get('Bouffalant BLW'),'pokemon-hp-90'),null);
  assert.equal(targetMatch(index.get('Guzma BUS'),'supporter'),true);
  assert.equal(targetMatch(index.get('VS Seeker PHF'),'supporter'),false);
  for(const printing of source)
    assert.equal(index.has(printing),true,printing);
});
