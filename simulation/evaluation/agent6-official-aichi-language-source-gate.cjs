'use strict';

const fs=require('node:fs');
const path=require('node:path');
const {createHash}=require('node:crypto');

const SCHEMA='agent6-aichi-2026-official-source-language-boundary-v1';
const EVENT=Object.freeze({
  date:'2026-05-10',
  event:'Champions League 2026 Aichi May, Open League',
  format:'Japanese Extra',
  requiredPhysicalCardLanguage:'ja',
  officialRulesUrl:'https://www.pokemon-card.com/info/005445.html',
  officialRuleText:'日本語のカードのみ使用可能。'
});

/**
 * Exact published source-print manifest checksum defined by Agent48's
 * original-printed60-admission-v1.json. This hashes the *transcription*,
 * including its language/display fields, and never physical printing photos.
 * @param {Array<{category:string,name:string,count:number,printing:{set:string,number:string,language:string}}>} cards
 * @returns {string}
 */
function sourcePrinted60Sha256(cards){
  const rows=cards.map(card=>[
    card.category,card.name,card.count,card.printing.set,
    card.printing.number,card.printing.language
  ]);
  rows.sort((a,b)=>{
    const left=JSON.stringify(a),right=JSON.stringify(b);
    return left<right?-1:left>right?1:0;
  });
  return createHash('sha256').update(JSON.stringify(rows),'utf8').digest('hex');
}

/**
 * Join the frozen original 29 source name/count lists to their independent
 * admission checksums. The official Japanese-language rule applies to the
 * original event and is distinct from a claim about the physical copies a
 * particular player used, which the English catalog does not authenticate.
 *
 * @param {{decks:Array<{rank:number,player:string,cards:Array<object>}>,missing_full_lists:Array<{rank:number}>}} manifest
 * @param {{sourceGitBlobSha:string,rows:Array<{rank:number,printed60Sha256:string,physicalCards:number}>}} admission
 * @returns {object} Read-only source metadata and qualification receipt.
 */
function attestOfficialAichiLanguage(manifest,admission){
  if(!Array.isArray(manifest?.decks)||!Array.isArray(manifest?.missing_full_lists)||
     !Array.isArray(admission?.rows)){
    throw new TypeError('Expected published source sixties and original admission ledger');
  }
  const existing=new Map();
  for(const row of admission.rows){
    if(existing.has(row.rank))throw new Error('Duplicate admission rank '+row.rank);
    existing.set(row.rank,row);
  }
  const ranks=new Set(),languageTotals=new Map(),languageRowTotals=new Map();
  const sourceRows=[];
  for(const deck of manifest.decks){
    if(!Number.isInteger(deck.rank)||ranks.has(deck.rank)){
      throw new Error('Duplicate or invalid source rank '+deck.rank);
    }
    ranks.add(deck.rank);
    const admitted=existing.get(deck.rank);
    if(!admitted)throw new Error('Unadmitted original source rank '+deck.rank);
    let total=0;
    const byToken=new Map(),byTokenRows=new Map();
    for(const card of deck.cards){
      if(!Number.isSafeInteger(card.count)||card.count<=0||
         typeof card.printing?.language!=='string'||
         typeof card.printing?.set!=='string'||
         typeof card.printing?.number!=='string'){
        throw new Error('Invalid original printing metadata for rank '+deck.rank);
      }
      total+=card.count;
      const lang=card.printing.language;
      byToken.set(lang,(byToken.get(lang)||0)+card.count);
      byTokenRows.set(lang,(byTokenRows.get(lang)||0)+1);
      languageTotals.set(lang,(languageTotals.get(lang)||0)+card.count);
      languageRowTotals.set(lang,(languageRowTotals.get(lang)||0)+1);
    }
    if(total!==60||admitted.physicalCards!==60){
      throw new Error('Original source physical-card count mismatch at rank '+deck.rank);
    }
    const transcribedHash=sourcePrinted60Sha256(deck.cards);
    if(transcribedHash!==admitted.printed60Sha256){
      throw new Error('Original name/count/display-transcription SHA mismatch at rank '+deck.rank);
    }
    sourceRows.push({
      rank:deck.rank,player:deck.player,
      transcribedPrinted60Sha256:transcribedHash,
      sourceDisplayLanguageRows:Object.fromEntries([...byTokenRows].sort()),
      sourceDisplayLanguageCopies:Object.fromEntries([...byToken].sort()),
      requiredPhysicalCardLanguage:EVENT.requiredPhysicalCardLanguage,
      exactActualPhysicalJapanesePrintingsAuthenticated:false,
      sourceDisplayPrintingIsNotPhysicalEventPrintingCertificate:true
    });
  }
  if(existing.size!==ranks.size)throw new Error('Unused source admission ranks');
  const missingRanks=manifest.missing_full_lists.map(item=>item.rank).sort((a,b)=>a-b);
  if(missingRanks.some(rank=>ranks.has(rank))){
    throw new Error('Rank marked both original and missing');
  }
  sourceRows.sort((a,b)=>a.rank-b.rank);
  return {
    schema:SCHEMA,event:EVENT,sourceManifestGitBlobSha:admission.sourceGitBlobSha,
    originalSourceDecks:sourceRows.length,
    knownMissingOriginalRanks:missingRanks,
    originalSourceCardCopies:sourceRows.length*60,
    sourceDisplayLanguageRows:Object.fromEntries([...languageRowTotals].sort()),
    sourceDisplayLanguageCopies:Object.fromEntries([...languageTotals].sort()),
    exactActualPhysicalJapanesePrintingsAuthenticated:false,
    policy:'Preserve original authenticated card names/counts and content hashes; treat English set and language fields as translated display metadata, not historical Japanese physical-art evidence.',
    competitivelyQualifiedGames:0,
    ranks:sourceRows
  };
}

/** @returns {object} Repository-frozen original source and admission cross-check. */
function attestRepositoryOfficialAichiLanguage(){
  const root=path.resolve(__dirname,'../..');
  const manifest=JSON.parse(fs.readFileSync(path.join(root,
    'results/aichi-2026/full-decklists.json'),'utf8'));
  const admission=JSON.parse(fs.readFileSync(path.join(root,
    'results/aichi-2026/original-printed60-admission-v1.json'),'utf8'));
  return attestOfficialAichiLanguage(manifest,admission);
}

if(require.main===module){
  const audit=attestRepositoryOfficialAichiLanguage();
  console.log(JSON.stringify({
    schema:audit.schema,event:audit.event,
    originalSourceDecks:audit.originalSourceDecks,
    knownMissingOriginalRanks:audit.knownMissingOriginalRanks,
    sourceDisplayLanguageRows:audit.sourceDisplayLanguageRows,
    sourceDisplayLanguageCopies:audit.sourceDisplayLanguageCopies,
    admissionShaAgreesAllRanks:true,exactActualPhysicalJapanesePrintingsAuthenticated:false,
    competitivelyQualifiedGames:0
  },null,2));
}

module.exports={SCHEMA,EVENT,sourcePrinted60Sha256,
  attestOfficialAichiLanguage,attestRepositoryOfficialAichiLanguage};
