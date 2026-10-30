'use strict';

const assert=require('node:assert/strict');
const {createHash}=require('node:crypto');

const VERSION='agent13-original-field-source-identity-v1';
const CATEGORIES=['Pokémon','Trainer','Energy'];
// Basic Energy is the only unlimited same-name category in the supplied rules.
const BASIC_ENERGY_NAMES=new Set([
  'Grass Energy','Fire Energy','Water Energy','Lightning Energy',
  'Psychic Energy','Fighting Energy','Darkness Energy',
  'Metal Energy','Fairy Energy'
]);

/**
 * Parse the repository's canonical four-column, unquoted Aichi field roster.
 * Reject ambiguous rows rather than guessing rank or player identity.
 * @param {string} csv
 * @returns {Map<number,{rank:number,player:string,archetype:string,published:boolean}>}
 */
function parseField(csv){
  assert.equal(typeof csv,'string');
  const lines=csv.trim().split(/\r?\n/);
  assert.equal(lines.shift(),'rank,player,archetype,full_list_published');
  const rows=new Map();
  for(const line of lines){
    const cells=line.split(',');
    assert.equal(cells.length,4,'Ambiguous field.csv row: '+line);
    const [rankText,player,archetype,status]=cells;
    const rank=Number(rankText);
    assert.ok(Number.isInteger(rank)&&rank>=1&&rank<=32,
      'Invalid Aichi rank: '+rankText);
    assert.ok(player.length>0&&archetype.length>0,'Missing source identity');
    assert.ok(status==='yes'||status==='no','Invalid publication flag');
    assert.ok(!rows.has(rank),'Duplicate field rank '+rank);
    rows.set(rank,{rank,player,archetype,published:status==='yes'});
  }
  assert.equal(rows.size,32,'Incomplete Aichi Top 32 field');
  for(let rank=1;rank<=32;rank++)
    assert.ok(rows.has(rank),'Missing Aichi rank '+rank);
  return rows;
}

/**
 * Hash the exact published printing inventory, independent of list row order.
 * This digest does not certify Japanese paper legality or native card parity.
 * @param {Array<object>} cards
 * @returns {string}
 */
function printingFingerprint(cards){
  assert.ok(Array.isArray(cards));
  const entries=cards.map(card=>{
    assert.ok(CATEGORIES.includes(card.category),'Unknown card category');
    assert.ok(Number.isInteger(card.count)&&card.count>=1,
      'Invalid source card quantity');
    assert.ok(typeof card.name==='string'&&card.name.length>0,
      'Missing source card name');
    const p=card.printing;
    assert.ok(p&&typeof p.set==='string'&&p.set.length>0&&
      typeof p.number==='string'&&p.number.length>0&&
      typeof p.language==='string'&&p.language.length>0,
      'Missing exact published printing');
    return [card.category,card.name,p.set,p.number,p.language,card.count];
  });
  // UTF-16 code-unit ordering avoids runtime/ICU-dependent digest changes.
  entries.sort((a,b)=>{
    const left=JSON.stringify(a),right=JSON.stringify(b);
    return left<right?-1:left>right?1:0;
  });
  assert.equal(new Set(entries.map(x=>JSON.stringify(x.slice(0,5)))).size,
    entries.length,'Duplicate published printing rows');
  return createHash('sha256').update(JSON.stringify(entries)).digest('hex');
}

/**
 * Cross-check every exact source against the canonical rank/player/archetype
 * roster. Missing lists remain explicitly missing, never inferred.
 * @param {object} manifest The original full-decklists.json.
 * @param {string} csv Canonical field.csv contents.
 * @returns {{version:string,publishedCount:number,missingRanks:number[],sources:Array<object>}}
 */
function attestField(manifest,csv){
  assert.ok(manifest&&Array.isArray(manifest.decks));
  const rows=parseField(csv);
  assert.equal(manifest.total_placements,32);
  assert.equal(manifest.published_deck_count,manifest.decks.length);
  const decks=new Map();
  for(const deck of manifest.decks){
    assert.ok(Number.isInteger(deck.rank)&&rows.has(deck.rank),
      'Invalid original source rank');
    assert.ok(!decks.has(deck.rank),'Duplicate original source rank');
    const row=rows.get(deck.rank);
    assert.ok(row.published,'Deck supplied for unpublished rank '+deck.rank);
    assert.equal(deck.player,row.player,'Wrong player at rank '+deck.rank);
    assert.equal(deck.archetype,row.archetype,
      'Wrong archetype at rank '+deck.rank);
    assert.ok(Array.isArray(deck.cards));
    assert.equal(deck.cards.reduce((n,c)=>n+c.count,0),60,
      'Incorrect original 60 at rank '+deck.rank);
    const byName=new Map();
    for(const card of deck.cards)
      byName.set(card.name,(byName.get(card.name)??0)+card.count);
    for(const [name,count] of byName){
      if(BASIC_ENERGY_NAMES.has(name)){
        assert.ok(deck.cards.filter(card=>card.name===name)
          .every(card=>card.category==='Energy'),
          'Basic Energy exemption applied to wrong category');
      }else{
        assert.ok(count<=4,
          'Four-copy paper deck limit exceeded at rank '+deck.rank+': '+name);
      }
    }
    for(const category of CATEGORIES){
      const count=deck.cards.filter(x=>x.category===category)
        .reduce((n,c)=>n+c.count,0);
      assert.equal(deck.category_counts?.[category],count,
        'Incorrect category count at rank '+deck.rank);
    }
    const fingerprint=printingFingerprint(deck.cards);
    decks.set(deck.rank,{rank:deck.rank,player:deck.player,
      archetype:deck.archetype,printingSha256:fingerprint,
      cardRows:deck.cards.length});
  }
  const missingRanks=[...rows.values()].filter(row=>!row.published)
    .map(row=>row.rank).sort((a,b)=>a-b);
  const suppliedMissing=manifest.missing_full_lists;
  assert.ok(Array.isArray(suppliedMissing),'No missing list provenance');
  assert.deepEqual(suppliedMissing.map(x=>x.rank).sort((a,b)=>a-b),
    missingRanks,'Unpublished rank set mismatch');
  for(const row of rows.values()){
    assert.equal(decks.has(row.rank),row.published,
      'Publication and exact deck mismatch at rank '+row.rank);
    if(!row.published){
      const absent=suppliedMissing.find(x=>x.rank===row.rank);
      assert.equal(absent.player,row.player);
      assert.equal(absent.archetype,row.archetype);
    }
  }
  return {version:VERSION,publishedCount:decks.size,missingRanks,
    sources:[...decks.values()].sort((a,b)=>a.rank-b.rank)};
}

/**
 * Tie a resolved source player's actual ordered native 60-card ID array to
 * its canonical original printing inventory. Distinct hashes are intentional:
 * equivalence substitutions and native implementation gaps remain visible.
 * @param {{opponents:Array<object>,sourceDeckCount:number}} plan
 * @param {object} manifest
 * @param {string} csv
 * @returns {{version:string,publishedCount:number,missingRanks:number[],sources:Array<object>}}
 */
function attestNativePlan(plan,manifest,csv){
  const field=attestField(manifest,csv);
  assert.ok(plan&&Array.isArray(plan.opponents));
  assert.equal(plan.sourceDeckCount,field.publishedCount);
  assert.equal(plan.opponents.length,32,'Resolved Top 32 roster incomplete');
  const expected=new Map(field.sources.map(x=>[x.rank,x]));
  const seen=new Set();
  const sources=[];
  for(const opponent of plan.opponents){
    const rank=opponent.rank;
    assert.ok(Number.isInteger(rank)&&rank>=1&&rank<=32);
    assert.ok(!seen.has(rank),'Duplicate resolved source rank '+rank);
    seen.add(rank);
    const original=expected.get(rank);
    if(!original){
      assert.ok(field.missingRanks.includes(rank),
        'Unexpected resolved source rank '+rank);
      assert.equal(opponent.status,'missing-published-list');
      assert.equal(opponent.cards,null);
      continue;
    }
    assert.equal(opponent.player,original.player,
      'Native source player mismatch at rank '+rank);
    assert.equal(opponent.archetype,original.archetype,
      'Native source archetype mismatch at rank '+rank);
    assert.ok(opponent.status==='ready'||
      opponent.status==='unresolved-printings',
      'Unexpected native source status at rank '+rank);
    if(opponent.status==='ready'){
      assert.ok(Array.isArray(opponent.cards)&&
        opponent.cards.length===60,
        'Invalid resolved 60 at rank '+rank);
      assert.ok(opponent.cards.every(x=>
        typeof x==='string'&&x.length>0),
        'Invalid native card ID at rank '+rank);
    }else{
      assert.equal(opponent.cards,null,'Unresolved native source is playable');
    }
    sources.push({...original,nativeStatus:opponent.status,
      nativeOrderedSha256:opponent.status==='ready'?
        createHash('sha256').update(JSON.stringify(opponent.cards))
          .digest('hex'):null,
      nativeHasSubstitutions:
        Array.isArray(opponent.substitutions)?
          opponent.substitutions.length>0:null});
  }
  assert.equal(seen.size,32);
  sources.sort((a,b)=>a.rank-b.rank);
  return {version:VERSION,publishedCount:field.publishedCount,
    missingRanks:field.missingRanks,sources};
}

/**
 * Bind one physical native match request to the original rank, the unchanged
 * candidate, and the pre-resolution printing/provenance receipt. A valid
 * receipt must be generated before either deck array can be changed.
 * This validates a dispatch request, not real match play or card effects.
 * @param {{plan:object,rank:number,candidateSeat:0|1,deckA:string[],deckB:string[]}} input
 * @returns {object} Attested physical source/candidate seat and digest packet.
 */
function attestPhysicalArm({plan,rank,candidateSeat,deckA,deckB}){
  assert.ok(candidateSeat===0||candidateSeat===1,
    'Invalid physical candidate seat');
  assert.ok(plan&&plan.originalSourceIdentity);
  assert.ok(Array.isArray(deckA)&&Array.isArray(deckB));
  const source=plan.opponents.find(opponent=>opponent.rank===rank);
  const original=plan.originalSourceIdentity.sources.find(row=>row.rank===rank);
  assert.ok(source&&original,'No fully recovered source rank '+rank);
  assert.equal(source.status,'ready','Unresolved original source');
  assert.ok(Array.isArray(source.cards)&&source.cards.length===60);
  assert.ok(Array.isArray(plan.candidate.cards)&&
    plan.candidate.cards.length===60,'Unresolved candidate');
  const digestIds=cards=>createHash('sha256')
    .update(JSON.stringify(cards)).digest('hex');
  assert.equal(digestIds(source.cards),original.nativeOrderedSha256,
    'Original source native ID fingerprint changed after resolution');
  assert.equal(digestIds(plan.candidate.cards),
    plan.candidateNativeOrderedSha256,
    'Fixed candidate native ID fingerprint changed after resolution');
  const expectedA=candidateSeat===0?plan.candidate.cards:source.cards;
  const expectedB=candidateSeat===1?plan.candidate.cards:source.cards;
  assert.deepEqual(deckA,expectedA,
    'Physical seat A is not the registered native 60');
  assert.deepEqual(deckB,expectedB,
    'Physical seat B is not the registered native 60');
  return {
    version:VERSION,
    rank,
    player:original.player,
    archetype:original.archetype,
    originalPrintingSha256:original.printingSha256,
    originalNativeOrderedSha256:original.nativeOrderedSha256,
    candidateNativeOrderedSha256:plan.candidateNativeOrderedSha256,
    sourceSeat:1-candidateSeat,
    candidateSeat,
    seatAOrderedSha256:digestIds(deckA),
    seatBOrderedSha256:digestIds(deckB),
    nativeSourceSubstituted:original.nativeHasSubstitutions,
    competitiveGameQualified:false
  };
}

module.exports={VERSION,parseField,printingFingerprint,attestField,
  attestNativePlan,attestPhysicalArm};
