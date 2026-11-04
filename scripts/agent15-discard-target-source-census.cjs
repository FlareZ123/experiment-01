'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {RULES,loadBundledPublicPrintMetadata,withSourceDisplayAliases}=require(
  '../simulation/twinleaf/planning/owner-public-discard-target-necessary.cjs');

/** Source-locked static incidence, not actual hand or native root eligibility. */
function sourceRecoveryCensus(field){
  assert.ok(Array.isArray(field?.decks));
  const seen=new Set(),counts=new Map();
  for(const printing of Object.keys(RULES))
    counts.set(printing,{printing,copies:0,ranks:[]});
  for(const deck of field.decks){
    assert.ok(Number.isSafeInteger(deck.rank)&&!seen.has(deck.rank));
    seen.add(deck.rank);
    assert.equal(deck.cards.reduce((n,c)=>n+c.count,0),60);
    for(const card of deck.cards){
      if(card.category!=='Trainer')continue;
      const printing=card.name+' '+card.printing.set;
      const row=counts.get(printing);
      if(!row)continue;
      row.copies+=card.count;
      row.ranks.push(deck.rank);
    }
  }
  const rows=[...counts.values()].sort((a,b)=>b.copies-a.copies);
  return {authenticatedSourceDecks:seen.size,
    distinctRegisteredSourcePrintings:rows.filter(r=>r.copies>0).length,
    registeredPhysicalTrainerCopies:rows.reduce((n,r)=>n+r.copies,0),
    rows,sourceOnlyNotNativeOpportunities:true,
    qualifiedGames:0};
}

/** Preserve all name+set ambiguities, including outside the legal format. */
function metadataCollisionCensus(index){
  assert.ok(index instanceof Map);
  let ambiguous=0,hpCrossing90=0;
  for(const entry of index.values()){
    if(entry.variants.length<2)continue;
    ambiguous++;
    const hp=entry.variants.filter(v=>v.supertype==='Pokémon')
      .map(v=>Number(v.hp)).filter(v=>Number.isSafeInteger(v)&&v>0);
    if(hp.some(v=>v<=90)&&hp.some(v=>v>90))hpCrossing90++;
  }
  return {indexedNameSetKeys:index.size,
    nonidenticalSameNameSetMetadataKeys:ambiguous,
    hpVariantsStraddling90:hpCrossing90,
    metadataPoolNotPreFilteredForPaperExpanded:true};
}


/**
 * Coverage of source-name + set-code classifications only. A matching key
 * is not an exact collector-number printing certificate or a legality proof.
 * @param {object} field Authenticated original source.
 * @param {Map<string,object>} metadata Bundled+aliased+separate source index.
 */
function publicSourceNameSetCoverage(field,metadata){
  assert.ok(Array.isArray(field?.decks)&&metadata instanceof Map);
  const missing=new Map();
  let represented=0,unrepresented=0;
  for(const deck of field.decks){
    assert.equal(deck.cards.reduce((n,c)=>n+c.count,0),60);
    for(const card of deck.cards){
      const printing=card.name+' '+card.printing.set;
      if(metadata.has(printing)){
        represented+=card.count;
        continue;
      }
      unrepresented+=card.count;
      const prior=missing.get(printing)??{
        printing,copies:0,category:card.category,ranks:[]};
      prior.copies+=card.count;
      prior.ranks.push(deck.rank);
      missing.set(printing,prior);
    }
  }
  return {
    registeredOriginalSourceCardCopies:represented+unrepresented,
    nameSetRepresentedCopies:represented,
    nameSetUnrepresentedCopies:unrepresented,
    missingKeys:[...missing.values()].sort((a,b)=>b.copies-a.copies),
    exactCollectorNumberCertified:false,
    sourceLegalityCertified:false
  };
}

/** Verify each exact source ID and effect phrase against resources/cards/en. */
function verifyRecoveryPrints(resourceRoot){
  const patterns={
    supporter:/Supporter card from your discard pile/,
    'pokemon-hp-90':/90 HP or less/,
    'pokemon-or-basic-energy':/Pokémon (?:and|or) (?:a )?Basic Energy/,
    'special-energy':/Special Energy cards from your discard pile/
  };
  return Object.entries(RULES).map(([printing,rule])=>{
    const split=rule.sourceId.lastIndexOf('-');
    const setId=rule.sourceId.slice(0,split);
    const cards=JSON.parse(fs.readFileSync(
      path.join(resourceRoot,'cards','en',setId+'.json'),'utf8'));
    const card=cards.find(c=>c.id===rule.sourceId);
    assert.ok(card,rule.sourceId);
    assert.equal(card.name,printing.slice(0,printing.lastIndexOf(' ')));
    assert.equal(card.supertype,'Trainer');
    assert.ok(card.subtypes?.includes('Item'));
    assert.match((card.rules??[]).join(' '),patterns[rule.target]);
    return {printing,sourceId:rule.sourceId,verifiedFromBundledEnglish:true};
  });
}

function run(repoRoot=path.resolve(__dirname,'..')){
  const resourceRoot=path.join(repoRoot,'resources');
  const field=JSON.parse(fs.readFileSync(path.join(repoRoot,
    'results','aichi-2026','full-decklists.json'),'utf8'));
  const bundled=loadBundledPublicPrintMetadata(resourceRoot);
  const externallyEnriched=
    require('../simulation/twinleaf/planning/owner-external-mee-basic-energy-metadata.cjs')
      .withVerifiedMEEBasicEnergyPrintings(withSourceDisplayAliases(bundled));
  const japaneseSources=require(
    '../simulation/twinleaf/planning/owner-japanese-only-promo-source-metadata.cjs');
  const japanPublicIndex=japaneseSources.withVerifiedJapanesePromoPublicMetadata(
    externallyEnriched);
  const jpRows=field.decks.flatMap(deck=>
    japaneseSources.JapaneseOnlyPromoReceipts(deck.cards).map(
      item=>({...item,rank:deck.rank})));
  return {schema:'agent15-discard-public-target-source-census-v3-jp-format',
    source:field.source,
    incidence:sourceRecoveryCensus(field),
    metadata:metadataCollisionCensus(bundled),
    enrichedPublicMetadataSourceCoverage:
      publicSourceNameSetCoverage(field,externallyEnriched),
    japaneseOnlyPromoPublicMetadataCoverage:
      publicSourceNameSetCoverage(field,japanPublicIndex),
    japaneseOnlyPromoReceipts:jpRows,
    japaneseOnlyPromoCopies:jpRows.reduce((n,row)=>n+row.count,0),
    japaneseOnlyPromoDistinctOriginals:[...new Set(
      jpRows.map(row=>row.rank))].sort((a,b)=>a-b),
    internationalExpandedEligibilityForTheseThreeSourcePromos:
      'listed-not-legal',
    japaneseExpandedEligibilityForTheseThreeSourcePromos:'listed-legal',
    sourceInternationalPaperLegalityVerified:false,
    sourceJapanesePaperLegalityOfficiallyVerified:false,
    supplementalMEEExternalProvenance:true,
    sourceRuleReceipts:verifyRecoveryPrints(resourceRoot),
    selectedFixed60:null,qualifiedGames:0,winRate99point5Verified:false};
}
if(require.main===module)process.stdout.write(JSON.stringify(run(),null,2)+'\n');
module.exports={sourceRecoveryCensus,metadataCollisionCensus,
  publicSourceNameSetCoverage,verifyRecoveryPrints,run};
