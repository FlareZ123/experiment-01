'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const fs=require('node:fs');
const {randomUUID}=require('node:crypto');
const {initializeCards}=require('../twinleaf/headless.cjs');
const sets=require('../../resources/sets/en.json');
const field=require('../../results/aichi-2026/full-decklists.json');

const ROOT=path.resolve(__dirname,'../..');
const OUTPUT=path.join(ROOT,'vendor/twinleaf/ptcg-server/output');
const CODE_TO_SET=new Map(sets.map(set=>[set.ptcgoCode,set.id]));
const CARDS_BY_CODE=new Map();
const VERSION='agent50-aichi29-native-attack-parity-v1';

/**
 * Canonical comparison signature. This checks the printed, fixed fields only;
 * arbitrary native attack effect functions and text semantics are NOT covered.
 *
 * @param {object} card Authentic native or bundled source Pokémon.
 * @param {Record<string,string>} [typeNames] Pinned CardType-to-name mapping.
 * @returns {object} Visible printed attack and weakness data.
 */
function printedSignature(card,typeNames=null){
  const native=typeNames!==null;
  const type=x=>native?(typeNames[String(x)]??'UNKNOWN('+x+')'):x;
  const attacks=(card.attacks??[]).map(a=>{
    const raw=native?(Number(a.damage)===0?'':String(a.damage)+
      (a.damageCalculation==='x'?'×':a.damageCalculation??'')):
      String(a.damage??'');
    return {name:a.name,cost:(a.cost??[]).map(type),damage:raw};
  });
  const modifiers=(rows,weakness)=>rows.map(row=>({
    type:type(row.type),
    value:native?
      (weakness?(row.value===undefined?2:row.value):row.value):
      (weakness?
        (row.value==='×2'?2:row.value):
        Number(row.value))
  })).sort((a,b)=>String(a.type).localeCompare(String(b.type)));
  return {
    hp:Number(card.hp),
    types:(native?card.cardType:card.types??[]).map(type),
    attacks,
    weaknesses:modifiers(native?card.weakness??[]:
      card.weaknesses??[],true),
    resistances:modifiers(native?card.resistance??[]:
      card.resistances??[],false)
  };
}

/**
 * @param {string} code English PTCGO set code.
 * @returns {object[]|null} Bundled canonical English JSON rows.
 */
function sourceSet(code){
  if(CARDS_BY_CODE.has(code))return CARDS_BY_CODE.get(code);
  const set=CODE_TO_SET.get(code);
  const location=set?path.join(ROOT,'resources/cards/en',set+'.json'):null;
  const list=location&&fs.existsSync(location)?
    JSON.parse(fs.readFileSync(location,'utf8')):null;
  CARDS_BY_CODE.set(code,list);
  return list;
}

/** @param {unknown} n Print number. @returns {string} */
function numberKey(n){
  const value=String(n??'').trim();
  return /^\d+$/.test(value)?String(Number(value)):value;
}

/**
 * Audit only the 29 authenticated source sixties. No inference about
 * unpublished Aichi rank 23/25/28 card identities or paper legality.
 *
 * @returns {object} Detailed bounded 29-source semantic mismatches.
 */
function audit(){
  assert.equal(field.decks.length,29);
  const nativeCards=initializeCards();
  const {CardType}=require(path.join(OUTPUT,'game/store/card/card-types'));
  const typeNames={
    [CardType.GRASS]:'Grass',[CardType.FIRE]:'Fire',
    [CardType.WATER]:'Water',[CardType.LIGHTNING]:'Lightning',
    [CardType.PSYCHIC]:'Psychic',[CardType.FIGHTING]:'Fighting',
    [CardType.DARK]:'Darkness',[CardType.METAL]:'Metal',
    [CardType.COLORLESS]:'Colorless',[CardType.FAIRY]:'Fairy',
    [CardType.DRAGON]:'Dragon'
  };
  const use=new Map();
  for(const deck of field.decks){
    for(const row of deck.cards.filter(x=>x.category==='Pokémon')){
      const key=[row.name,row.printing.set,row.printing.number].join('|');
      const entry=use.get(key)??{
        name:row.name,set:row.printing.set,
        number:row.printing.number,ranks:[],totalCopies:0
      };
      entry.ranks.push(deck.rank);
      entry.totalCopies+=row.count;
      use.set(key,entry);
    }
  }
  const findings=[];
  for(const input of use.values()){
    const source=sourceSet(input.set)?.find(card=>
      card.supertype==='Pokémon'&&card.name===input.name&&
      numberKey(card.number)===numberKey(input.number));
    const nativeCard=nativeCards.getCardByName(input.name+' '+input.set);
    const status=!source?'MISSING_BUNDLED_SOURCE':
      !nativeCard?'MISSING_PINNED_NATIVE':
      'SOURCE_AND_NATIVE_FOUND';
    const sourceSig=source?printedSignature(source):null;
    const nativeSig=nativeCard?printedSignature(nativeCard,typeNames):null;
    const differences={};
    if(sourceSig&&nativeSig){
      for(const key of Object.keys(sourceSig)){
        if(JSON.stringify(sourceSig[key])!==JSON.stringify(nativeSig[key]))
          differences[key]={
            paper:sourceSig[key],native:nativeSig[key]
          };
      }
    }
    const numberMismatch=nativeCard&&
      numberKey(nativeCard.setNumber)!==numberKey(input.number);
    findings.push({
      ...input,status,
      nativeFullName:nativeCard?.fullName??null,
      nativeSetNumber:nativeCard?.setNumber??null,
      numberMismatch:!!numberMismatch,
      differences
    });
  }
  const mismatches=findings.filter(row=>Object.keys(row.differences).length>0);
  const missingNative=findings.filter(x=>x.status==='MISSING_PINNED_NATIVE');
  const missingSource=findings.filter(x=>x.status==='MISSING_BUNDLED_SOURCE');
  const mismatchedNames=findings.filter(x=>x.differences.attacks);
  return {
    schema:VERSION,pinnedEngineRevision:'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    benchmark:'29 verified complete Aichi source sixties',
    originalAichiRanks:field.decks.map(x=>x.rank),
    verifiedSource60Count:29,
    registeredPokemonPrintings:findings.length,
    missingNativePrintings:missingNative.length,
    missingSourcePrintings:missingSource.length,
    printedSignatureMismatches:mismatches.length,
    attackSignatureMismatches:mismatchedNames.length,
    nativeNumberMismatch:findings.filter(x=>x.numberMismatch).length,
    findings,competitiveGamesQualified:0,
    paperLegalityCertified:false,
    qualifiedWinRate:null
  };
}

/**
 * Locked atomic artifact, never clobbers an existing source receipt.
 *
 * @param {object} report Full deterministic report.
 * @param {string} destination Absolute JSON path.
 */
function save(report,destination){
  fs.mkdirSync(path.dirname(destination),{recursive:true});
  const lock=destination+'.lock';
  const token=fs.openSync(lock,'wx');
  const temp=destination+'.tmp-'+process.pid+'-'+randomUUID();
  try{
    fs.writeFileSync(temp,JSON.stringify(report,null,2)+'\n',{flag:'wx'});
    fs.renameSync(temp,destination);
  }finally{
    if(fs.existsSync(temp))fs.unlinkSync(temp);
    fs.closeSync(token);fs.unlinkSync(lock);
  }
}
if(require.main===module){
  const result=audit();
  const destination=path.join(ROOT,
    'artifacts/agent50-native-field-parity/aichi29-printings.json');
  save(result,destination);
  process.stdout.write(JSON.stringify({
    version:result.schema,registeredPokemonPrintings:result.registeredPokemonPrintings,
    missingNativePrintings:result.missingNativePrintings,
    missingSourcePrintings:result.missingSourcePrintings,
    printedSignatureMismatches:result.printedSignatureMismatches,
    attackSignatureMismatches:result.attackSignatureMismatches,
    nativeNumberMismatch:result.nativeNumberMismatch,
    sampleNonmatching:result.findings
      .filter(x=>Object.keys(x.differences).length||x.status!=='SOURCE_AND_NATIVE_FOUND')
      .slice(0,30),
    artifact:destination,competitiveGamesQualified:0
  },null,2)+'\n');
}
module.exports={VERSION,printedSignature,sourceSet,numberKey,audit,save};
