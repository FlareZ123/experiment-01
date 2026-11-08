'use strict';

const assert=require('node:assert/strict');
const {test}=require('node:test');
const {printedSignature,numberKey,audit,VERSION}=
  require('../simulation/evaluation/agent50-aichi29-native-printed-attack-parity.cjs');

test('detached printed signatures agree for native missing-value x2 and paper x2',()=>{
  const paper={
    hp:'90',types:['Fighting'],
    attacks:[{name:'Low Sweep',cost:['Fighting'],damage:'20'},
      {name:'Beatdown',cost:['Fighting','Fighting'],damage:'40'}],
    weaknesses:[{type:'Psychic',value:'×2'}],
    resistances:[]
  };
  const native={
    hp:90,cardType:[6],
    attacks:[{name:'Low Sweep',cost:[6],damage:20},
      {name:'Beatdown',cost:[6,6],damage:40}],
    weakness:[{type:5}],resistance:[]
  };
  assert.deepEqual(printedSignature(native,{6:'Fighting',5:'Psychic'}),
    printedSignature(paper));
  native.attacks[0].name='Wrong Print';
  assert.notDeepEqual(printedSignature(native,{6:'Fighting',5:'Psychic'}),
    printedSignature(paper));
  assert.equal(numberKey('074'),'74');
  assert.equal(numberKey('74'),'74');
  assert.equal(numberKey('TG01'),'TG01');
});

test('original Aichi 29 printed Pokémon native audit is exact-scope and candid',()=>{
  const result=audit();
  assert.equal(result.schema,VERSION);
  assert.equal(result.verifiedSource60Count,29);
  assert.equal(result.registeredPokemonPrintings,102);
  assert.equal(result.byRank.length,29);
  assert.deepEqual(result.byRank.map(row=>row.rank).sort((a,b)=>a-b),
    result.originalAichiRanks.slice().sort((a,b)=>a-b));
  assert.ok(result.byRank.every(row=>row.sourcePokemonCards>0&&
    row.sourcePokemonPrintings>0));
  assert.equal(result.findings.length,102);
  assert.equal(result.competitiveGamesQualified,0);
  assert.equal(result.qualifiedWinRate,null);
  assert.equal(result.paperLegalityCertified,false);
  assert.ok(result.findings.every(row=>row.ranks.length>0&&
    row.totalCopies>0&&row.status&&row.name&&row.set));
  for(const field of ['missingNativePrintings','missingSourcePrintings',
    'printedSignatureMismatches','attackSignatureMismatches',
    'nativeNumberMismatch'])
    assert.ok(Number.isSafeInteger(result[field])&&result[field]>=0);
  const mismatches=result.findings.filter(row=>
    Object.keys(row.differences).length||row.status!=='SOURCE_AND_NATIVE_FOUND');
  console.log('AGENT50_ORIGINAL29_PRINTED_NATIVE_PARITY '+JSON.stringify({
    scope:result.benchmark,printings:result.registeredPokemonPrintings,
    missingNative:result.missingNativePrintings,
    missingSource:result.missingSourcePrintings,
    printedMismatch:result.printedSignatureMismatches,
    attackMismatch:result.attackSignatureMismatches,
    nativeNumberMismatch:result.nativeNumberMismatch,
    samples:mismatches.slice(0,12),competitiveGamesQualified:0
  }));
});
