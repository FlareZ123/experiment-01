'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const VERSION='agent12-original-29-print-random-opponent-hand-census-v1';
const RANDOM_OPPONENT_HAND=
  /(?:\b(?:random|at random)\b.{0,100}\bopponent['’]s hand\b|\bopponent['’]s hand\b.{0,100}\brandom\b)/i;

/**
 * Source-controlled 2026 Aichi English print references are usually ptcgoCode,
 * while promo manifest codes differ from the public card API series IDs.
 * @param {string} code PTCGO display set code from authentic original source.
 * @param {object[]} sets Card database set records.
 * @returns {string[]} Candidate exact local set IDs.
 */
function setIdsForDisplayCode(code,sets){
  const direct=sets.filter(s=>s.ptcgoCode===code).map(s=>s.id);
  const promo={SMP:'smp',BWP:'bwp',XYP:'xyp',SWSHP:'swshp'};
  return [...new Set([...direct,...(promo[code]?[promo[code]]:[])])];
}

/**
 * Verify printed identity before checking effects. Never substitute another
 * printing of a name: unseen original source prints are explicitly unresolved.
 * @param {object} entry Source manifest card entry.
 * @param {object[]} sets Database set metadata.
 * @param {(setId:string)=>object[]} getSetCards Read one literal set JSON.
 * @returns {{status:string,card?:object,identity?:string}}
 */
function resolveExactTextPrinting(entry,sets,getSetCards){
  const code=entry.printing?.set,printed=String(entry.printing?.number??'');
  if(typeof code!=='string'||!printed)return {status:'missing-source-print'};
  const candidates=[];
  for(const id of setIdsForDisplayCode(code,sets)){
    const cards=getSetCards(id);
    const official=[printed];
    if(code==='SMP')official.push('SM'+printed);
    if(code==='BWP')official.push('BW'+printed);
    if(code==='XYP')official.push('XY'+printed);
    for(const card of cards){
      if(card.name!==entry.name)continue;
      const n=String(card.number??card.id.split('-').slice(1).join('-'));
      if(official.includes(n))candidates.push(card);
    }
  }
  if(candidates.length!==1)return {
    status:candidates.length?'ambiguous-supplied-print':'unresolved-supplied-print'
  };
  return {status:'resolved-exact-supplied-print',
    card:candidates[0],identity:candidates[0].id};
}

/** @param {object} c Exact printed resource card. */
function randomOpponentHandEffects(c){
  return [
    ...(c.rules??[]).map(t=>({origin:'rule',name:null,text:t})),
    ...(c.attacks??[]).map(a=>({
      origin:'attack',name:a.name,text:a.text??''})),
    ...(c.abilities??[]).map(a=>({
      origin:'ability',name:a.name,text:a.text??''}))
  ].filter(x=>RANDOM_OPPONENT_HAND.test(x.text));
}

/**
 * @param {object} field Exact original 29 manifest.
 * @param {object[]} sets Exact card database metadata.
 * @param {(setId:string)=>object[]} getSetCards Exact local card database.
 */
function scanOriginalRandomHand(field,sets,getSetCards){
  assert.equal(field.decks.length,29);
  const rows=[],unresolved=[];
  for(const d of field.decks){
    let cards=0;
    for(const entry of d.cards){
      cards+=entry.count;
      const resolved=resolveExactTextPrinting(entry,sets,getSetCards);
      if(!resolved.card){
        unresolved.push({rank:d.rank,name:entry.name,
          set:entry.printing?.set,number:entry.printing?.number,
          reason:resolved.status,copies:entry.count});
        continue;
      }
      for(const effect of randomOpponentHandEffects(resolved.card)){
        rows.push({rank:d.rank,archetype:d.archetype,
          printing:resolved.identity,cardName:entry.name,
          copies:entry.count,...effect});
      }
    }
    assert.equal(cards,60,'Preserve each original listed source 60');
  }
  return {
    version:VERSION,sourceDeckCount:field.decks.length,
    originalSourceCards:29*60,
    exactPrintedEffectMatches:rows,
    matchedSourceRanks:[...new Set(rows.map(x=>x.rank))],
    unresolvedManifestRows:unresolved.length,
    unresolved,
    entireOriginalFieldProof:unresolved.length===0,
    missingFullDeckRanks:field.missing_full_lists.map(d=>d.rank),
    printedTextEvidenceOnly:true,
    gameOutcomesQualified:0
  };
}

function runInventory(root){
  const sets=JSON.parse(fs.readFileSync(path.join(root,
    'resources/sets/en.json'),'utf8'));
  const field=JSON.parse(fs.readFileSync(path.join(root,
    'results/aichi-2026/full-decklists.json'),'utf8'));
  const cache=new Map();
  const getSetCards=id=>{
    if(!cache.has(id))cache.set(id,JSON.parse(fs.readFileSync(
      path.join(root,'resources/cards/en',id+'.json'),'utf8')));
    return cache.get(id);
  };
  return scanOriginalRandomHand(field,sets,getSetCards);
}

if(require.main===module)
  process.stdout.write(JSON.stringify(runInventory(
    path.resolve(__dirname,'..')),null,2)+'\n');

module.exports={VERSION,RANDOM_OPPONENT_HAND,
  setIdsForDisplayCode,resolveExactTextPrinting,
  randomOpponentHandEffects,scanOriginalRandomHand,runInventory};
