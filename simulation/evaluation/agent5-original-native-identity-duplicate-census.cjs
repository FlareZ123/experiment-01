'use strict';

const assert=require('node:assert/strict');
const crypto=require('node:crypto');
const fs=require('node:fs');
const path=require('node:path');
const {initializeCards}=require('../twinleaf/headless.cjs');

const root=path.resolve(__dirname,'../..');
const PIN='a9905a76a6c4103ba4b6cb9a49e86bad795c5c05';
/** @param {unknown} value */
const digest=value=>crypto.createHash('sha256')
  .update(typeof value==='string'?value:JSON.stringify(value)).digest('hex');

/**
 * Group cards by the exact supplied name, printed set code and card number.
 * This class census is a *warning* of possible implementation differences.
 * Duplicate effect hashes can arise from harmless source-code differences;
 * matching hashes do not prove complete print correctness.
 *
 * @param {object} input
 * @returns {object}
 */
function census(input){
  const {allCards,field,candidate,sourceSets,sourceCards}=input;
  const byKey=new Map();
  const key=(name,set,number)=>[
    name,String(set).toUpperCase(),String(number)
  ].join('\u0000');
  for(const card of allCards){
    const k=key(card.name,card.set,card.setNumber);
    if(!byKey.has(k))byKey.set(k,[]);
    byKey.get(k).push(card);
  }

  const requests=new Map();
  /** @param {string} name @param {string} set @param {string|number} number @param {object} reference */
  function add(name,set,number,reference){
    const k=key(name,set,number);
    if(!requests.has(k))requests.set(k,{
      name,set:String(set).toUpperCase(),number:String(number),references:[]
    });
    requests.get(k).references.push(reference);
  }
  assert.equal(field.decks.length,29,'Authenticated original source cohort changed');
  for(const deck of field.decks){
    assert.ok(Number.isSafeInteger(deck.rank));
    assert.equal(deck.cards.reduce((n,row)=>n+row.count,0),60,
      'Original rank '+deck.rank+' no longer sums to 60');
    for(const row of deck.cards){
      add(row.name,row.printing.set,row.printing.number,{
        source:'aichi-original',rank:deck.rank,count:row.count
      });
    }
  }
  assert.equal(candidate.cards.reduce((n,row)=>n+row.count,0),60);
  const setMap=new Map(sourceSets.map(s=>[s.id,s.ptcgoCode]));
  for(const row of candidate.cards){
    const id=row.id;
    const prefix=id.slice(0,id.lastIndexOf('-'));
    const printed=sourceCards(prefix).find(card=>card.id===id);
    assert.ok(printed,'Missing fixed candidate exact source card '+id);
    assert.equal(printed.name,row.name);
    const code=setMap.get(prefix);
    assert.ok(code,'Missing source set mapping for '+id);
    add(row.name,code,printed.number,{
      source:'agent5-adp-thorton-v2',id,count:row.count
    });
  }

  const allRequests=[...requests.values()];
  const rows=[];
  const unmatched=[];
  const counters={
    exactUniqueRequested:allRequests.length,
    exactClassDuplicated:0,
    duplicateWithDifferentReducerHash:0,
    duplicateWithDifferentCardText:0,
    originalExposure:0,candidateExposure:0
  };
  for(const requested of allRequests){
    const native=byKey.get(key(requested.name,requested.set,requested.number))??[];
    if(native.length===0){
      unmatched.push(requested);
      continue;
    }
    if(native.length<2)continue;
    const variants=native.map(card=>{
      const attacks=(card.attacks??[]).map(a=>({
        name:a.name,damage:a.damage,cost:a.cost,text:a.text
      }));
      const powers=(card.powers??[]).map(p=>({
        name:p.name,powerType:p.powerType,text:p.text
      }));
      return {
        fullName:card.fullName,className:card.constructor.name,
        hp:card.hp??null,cardType:card.cardType??null,
        stage:card.stage??null,retreat:card.retreat??null,
        attacks,powers,
        printedTextFingerprint:digest({attacks,powers}),
        reducerSha256:digest(String(card.reduceEffect))
      };
    });
    const differingReducer=new Set(variants.map(x=>x.reducerSha256)).size>1;
    const differingText=new Set(variants.map(x=>x.printedTextFingerprint)).size>1;
    const originalRanks=[...new Set(requested.references
      .filter(x=>x.source==='aichi-original').map(x=>x.rank))].sort((a,b)=>a-b);
    const selectedCandidate=requested.references.some(x=>
      x.source==='agent5-adp-thorton-v2');
    if(originalRanks.length)counters.originalExposure++;
    if(selectedCandidate)counters.candidateExposure++;
    counters.exactClassDuplicated++;
    if(differingReducer)counters.duplicateWithDifferentReducerHash++;
    if(differingText)counters.duplicateWithDifferentCardText++;
    rows.push({
      name:requested.name,set:requested.set,number:requested.number,
      originalRanks,candidateV2:selectedCandidate,
      references:requested.references,nativeCount:variants.length,
      differingReducer,differingText,variants
    });
  }
  rows.sort((a,b)=>b.originalRanks.length-a.originalRanks.length||
    b.candidateV2-a.candidateV2||
    a.name.localeCompare(b.name)||
    a.set.localeCompare(b.set)||
    Number(a.number)-Number(b.number));
  const flf=rows.find(row=>row.name==='M Charizard-EX'&&
    row.set==='FLF'&&row.number==='69');
  assert.ok(flf,'Known FLF69 original candidate native duplicate lost');
  assert.equal(flf.nativeCount,2);
  assert.equal(flf.candidateV2,true);
  assert.equal(flf.differingReducer,true);
  return {
    schema:'agent5-original-native-exact-identity-duplicate-census-v1',
    engineRevision:PIN,allNativeInstances:allCards.length,
    sourceOriginalDecks:field.decks.length,
    printedIdentityRequests:allRequests.length,
    originalUnmatchedPrintings:unmatched.filter(x=>
      x.references.some(z=>z.source==='aichi-original')).length,
    knownCandidateFlf69NativeDualCount:flf.nativeCount,
    rulesSemanticsVerified:false,competitiveQualifiedGames:0,
    interpretation:'Source inventory duplicate-class warning and code-signature differences, not a card-effect correctness verdict.',
    counters,duplicatePrintings:rows,unmatchedExactIdentity:unmatched
  };
}

/** @returns {object} */
function run(){
  const field=JSON.parse(fs.readFileSync(path.join(root,
    'results/aichi-2026/full-decklists.json'),'utf8'));
  const candidate=JSON.parse(fs.readFileSync(path.join(root,
    'results/aichi-2026/candidates/agent5-adp-thorton-regidrago-60-v2.json'),'utf8'));
  const sourceSets=JSON.parse(fs.readFileSync(path.join(root,
    'resources/sets/en.json'),'utf8'));
  const cache=new Map();
  /** @param {string} prefix */
  const sourceCards=prefix=>{
    if(!cache.has(prefix))cache.set(prefix,
      JSON.parse(fs.readFileSync(path.join(root,
        'resources/cards/en',prefix+'.json'),'utf8')));
    return cache.get(prefix);
  };
  return census({allCards:initializeCards().getAllCards(),field,candidate,
    sourceSets,sourceCards});
}
if(require.main===module)process.stdout.write(JSON.stringify(run(),null,2)+'\n');
module.exports={census,run};
