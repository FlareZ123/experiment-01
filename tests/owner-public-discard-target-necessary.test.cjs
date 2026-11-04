'use strict';

const assert=require('node:assert/strict');
const test=require('node:test');
const path=require('node:path');
const fs=require('node:fs');
const {
  RULES,targetMatch,buildPublicPrintMetadata,
  loadBundledPublicPrintMetadata,withSourcePromoAliases,withSourceDisplayAliases,
  publicDiscardTargetNecessary,
  augmentPaperNecessityWithDiscardTargets
}=require('../simulation/twinleaf/planning/owner-public-discard-target-necessary.cjs');
const {
  SOURCES,TYPES,withVerifiedMEEBasicEnergyPrintings
}=require('../simulation/twinleaf/planning/owner-external-mee-basic-energy-metadata.cjs');

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
  assert.equal(source.length,6);
  assert.equal(RULES['VS Seeker PHF'].sourceId,'xy4-109');
  assert.equal(RULES['Rescue Carrier EVS'].sourceId,'swsh7-154');
  assert.equal(RULES['Night Stretcher ASC'].sourceId,'me2pt5-196');
  assert.equal(RULES['Rescue Stretcher GRI'].sourceId,'sm2-130');
  assert.deepEqual(RULES['Rescue Stretcher GRI'].modes,
    ['one-pokemon-to-hand','three-pokemon-to-deck']);
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

test('Rescue Stretcher both modes require a discarded Pokémon',()=>{
  assert.equal(check('Rescue Stretcher GRI',[]).paperPlayable,false);
  assert.equal(check('Rescue Stretcher GRI',[
    'Psychic Energy SVE','Double Colorless Energy SUM','Guzma BUS'
  ]).paperPlayable,false);
  const single=check('Rescue Stretcher GRI',['Koffing CEC']);
  assert.equal(single.paperPlayable,null,
    'one Pokémon is an eligible hand-mode target, not proof of shuffle-three');
  assert.deepEqual(single.eligibleTargetIndices,[0]);
  assert.equal(check('Rescue Stretcher GRI',['unknown public card'])
    .paperPlayable,null);
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

test('all six printings fail on an actually empty public discard pile',()=>{
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

test('bundled database preserves real HP collision and six source cards',()=>{
  const index=loadBundledPublicPrintMetadata(
    path.join(__dirname,'../resources'));
  assert.equal(targetMatch(index.get('Bouffalant BLW'),'pokemon-hp-90'),null);
  assert.equal(targetMatch(index.get('Guzma BUS'),'supporter'),true);
  assert.equal(targetMatch(index.get('VS Seeker PHF'),'supporter'),false);
  for(const printing of source)
    assert.equal(index.has(printing),true,printing);
});


test('existing five-family owner paper screen keeps its facts and adds negative',()=>{
  const v=view('VS Seeker PHF',['Battle Compressor PHF']);
  v.ownHand.push('Float Stone BKT');
  const original={version:'existing-paper-v1',negativeProofFamilies:['generic-public'],
    rows:[
      {handIndex:0,printing:'VS Seeker PHF',paperPlayable:null,
        necessaryBlockers:[]},
      {handIndex:2,printing:'Float Stone BKT',paperPlayable:false,
        necessaryBlockers:['generic-public:no-slot']}
    ]};
  const result=augmentPaperNecessityWithDiscardTargets(v,original,meta);
  assert.equal(result.registeredHeldDiscardRecoveryCopies,1);
  assert.equal(result.newlyProvenPublicDiscardTargetFailures,1);
  assert.equal(result.provenNecessaryConditionFailures,2);
  assert.equal(result.rows[0].paperPlayable,false);
  assert.deepEqual(result.rows[0].necessaryBlockers,
    ['printed-discard-target:proven-no-public-discard-target']);
  assert.equal(result.rows[1].paperPlayable,false);
  assert.deepEqual(original.rows[0].necessaryBlockers,[]);
  assert.equal(original.rows[0].paperPlayable,null);
  assert.equal(result.allRemainingArePaperLegal,false);
  assert.equal(result.selectedOrDispatchedAction,false);
});

test('unknown target metadata never blocks another unqualified Trainer',()=>{
  const v=view('VS Seeker PHF',['mystery-card']);
  const base={version:'v1',rows:[{handIndex:0,
    printing:'VS Seeker PHF',necessaryBlockers:[],paperPlayable:null}]};
  const result=augmentPaperNecessityWithDiscardTargets(v,base,meta);
  assert.equal(result.newlyProvenPublicDiscardTargetFailures,0);
  assert.equal(result.rows[0].paperPlayable,null);
  assert.deepEqual(result.rows[0].necessaryBlockers,[]);
});


test('historical source promo set aliases retain verified public types',()=>{
  const original=loadBundledPublicPrintMetadata(
    path.join(__dirname,'../resources'));
  const aliased=withSourcePromoAliases(original);
  assert.equal(original.has('Karen XYP'),false);
  assert.equal(targetMatch(aliased.get('Karen XYP'),'supporter'),true);
  assert.equal(targetMatch(aliased.get('Regirock XYP'),
    'pokemon-or-basic-energy'),true);
  assert.equal(targetMatch(aliased.get('Tropical Beach BWP'),'supporter'),false);
  assert.deepEqual(aliased.get('Karen XYP'),original.get('Karen PR-XY'));
  assert.equal(targetMatch(aliased.get('Palace Book SMP'),'supporter'),null,
    'A source promo absent from this English database remains unresolved');
  assert.equal(aliased.size>=original.size,true);
  assert.equal(original.size,16475,'Alias preparation must not mutate catalog');
});


test('source Prism Star ♢ and English database ◇ classify the same public Basic',()=>{
  const canonical=loadBundledPublicPrintMetadata(
    path.join(__dirname,'../resources'));
  const source=withSourcePromoAliases(canonical);
  assert.equal(canonical.has('Ditto ♢ LOT'),false);
  assert.equal(targetMatch(source.get('Ditto ♢ LOT'),
    'pokemon-or-basic-energy'),true);
  assert.equal(targetMatch(source.get('Tapu Koko ♢ TEU'),
    'pokemon-or-basic-energy'),true);
  assert.deepEqual(source.get('Ditto ♢ LOT'),canonical.get('Ditto ◇ LOT'));
  assert.deepEqual(source.get('Tapu Koko ♢ TEU'),
    canonical.get('Tapu Koko ◇ TEU'));
});


test('pinned native M1L display of source MEG/86 Absol preserves Pokémon class only',()=>{
  const sourceCard=JSON.parse(fs.readFileSync(path.join(__dirname,
    '../resources/cards/en/me1.json'),'utf8'))
    .find(card=>card.id==='me1-86');
  assert.equal(sourceCard.name,'Mega Absol ex');
  assert.equal(sourceCard.supertype,'Pokémon');
  assert.deepEqual(sourceCard.subtypes,['Basic','MEGA','ex']);
  const raw=loadBundledPublicPrintMetadata(path.join(__dirname,'../resources'));
  assert.equal(raw.has('Mega Absol ex M1L'),false);
  const aliased=withSourceDisplayAliases(raw);
  assert.deepEqual(aliased.get('Mega Absol ex M1L'),
    raw.get('Mega Absol ex MEG'));
  const enhanced=withVerifiedMEEBasicEnergyPrintings(aliased);
  const source9=['VS Seeker PHF','Darkness Energy MEE','Mega Absol ex M1L'];
  const stretcher=check('Rescue Stretcher GRI',source9,enhanced);
  assert.equal(stretcher.paperPlayable,null);
  assert.equal(stretcher.status,'public-target-exists-other-conditions-unknown');
  assert.deepEqual(stretcher.eligibleTargetIndices,[2]);
  assert.deepEqual(stretcher.unknownMetadataIndices,[]);
  const carrier=check('Rescue Carrier EVS',['Mega Absol ex M1L'],enhanced);
  assert.equal(carrier.paperPlayable,false,'MEG/86 Absol is above HP 90');
  assert.equal(aliased.has('Mega Absol ex MEG'),true);
  assert.equal(raw.has('Mega Absol ex M1L'),false,
    'Native source-display alias must not mutate English catalog');
});

test('external MEE Basic source remains explicit and never mutates bundled data',()=>{
  assert.equal(SOURCES.length,2);
  assert.deepEqual(TYPES,['Grass','Fire','Water','Lightning',
    'Psychic','Fighting','Darkness','Metal']);
  const raw=loadBundledPublicPrintMetadata(path.join(__dirname,'../resources'));
  assert.equal(raw.has('Darkness Energy MEE'),false);
  const enhanced=withVerifiedMEEBasicEnergyPrintings(
    withSourcePromoAliases(raw));
  assert.equal(raw.has('Darkness Energy MEE'),false);
  for(const type of TYPES){
    assert.equal(targetMatch(enhanced.get(type+' Energy MEE'),
      'pokemon-or-basic-energy'),true);
    assert.equal(targetMatch(enhanced.get(type+' Energy MEE'),
      'special-energy'),false);
  }
  assert.equal(targetMatch(enhanced.get('Professors Letter BKT'),
    'pokemon-or-basic-energy'),false);
});

test('real archived Super Rod discard becomes a known Basic Energy target',()=>{
  const raw=loadBundledPublicPrintMetadata(path.join(__dirname,'../resources'));
  const index=withVerifiedMEEBasicEnergyPrintings(
    withSourcePromoAliases(raw));
  const discard=['Professors Letter BKT','Darkness Energy MEE'];
  const rod=check('Super Rod PAL',discard,index);
  assert.deepEqual(rod.eligibleTargetIndices,[1]);
  assert.deepEqual(rod.unknownMetadataIndices,[]);
  assert.equal(rod.paperPlayable,null,'positive target cannot certify full play');
  const seeker=check('VS Seeker PHF',discard,index);
  assert.equal(seeker.paperPlayable,false);
  assert.equal(seeker.blocker,'proven-no-public-discard-target');
});


test('exact original Team Flare Gear and Unit Energy source collector print labels',()=>{
  const canonical=loadBundledPublicPrintMetadata(
    path.join(__dirname,'../resources'));
  const sourced=withSourceDisplayAliases(canonical);
  for(const [alias,canonicalName] of [
    ['Battle Compressor PHF','Battle Compressor Team Flare Gear PHF'],
    ['Robo Substitute PHF','Robo Substitute Team Flare Gear PHF'],
    ['Target Whistle PHF','Target Whistle Team Flare Gear PHF'],
    ['Unit Energy LPM UPR','Unit Energy LightningPsychicMetal UPR']
  ])assert.deepEqual(sourced.get(alias),canonical.get(canonicalName),alias);
  assert.equal(targetMatch(sourced.get('Battle Compressor PHF'),'supporter'),false);
  assert.equal(targetMatch(sourced.get('Robo Substitute PHF'),'supporter'),false);
  assert.equal(targetMatch(sourced.get('Target Whistle PHF'),'supporter'),false);
  assert.equal(targetMatch(sourced.get('Unit Energy LPM UPR'),
    'special-energy'),true);
  assert.equal(targetMatch(sourced.get('Unit Energy LPM UPR'),
    'pokemon-or-basic-energy'),false);
});
