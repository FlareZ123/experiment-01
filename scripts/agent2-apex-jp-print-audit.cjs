'use strict';

const assert = require('node:assert/strict');
const {createHash} = require('node:crypto');

const VERSION = 'agent2-apex-registered-japanese-print-audit-v1';
const EXPECTED = Object.freeze({
  v0: '21846db95f88d5d5abc6ee3876b3522732092e27ca5e7485948f354d8468a769',
  v1: '5cd6b0fc7781e1a5a3b29f5a23654750295af89bdc63621f235fbd0c56701fd0'
});
const EXPECTED_SOURCE = Object.freeze({
  v0: 'results/aichi-2026/agent43-apex-alchemy-paper-expanded-v0.json',
  v1: 'results/aichi-2026/agent2-apex-alchemy-shake4-quick2-v1.json'
});

/**
 * Canonical digest for the original registered paper-Expanded English proxy identity.
 * @param {{cardId:string,count:number}[]} cards
 * @returns {string}
 */
function cardIdentitySha256(cards) {
  return createHash('sha256')
    .update(cards.map(c=>c.cardId+':'+c.count+'\n').sort().join(''), 'utf8')
    .digest('hex');
}

/**
 * Verify fixed candidate identity, name/count source registration, official
 * Japanese card-reference syntax, chosen-print consistency and necessary
 * Japanese deck-construction restrictions. This is deliberately not a
 * certificate of Japanese card-text equivalence, release-date eligibility,
 * latest errata or actual tournament registration.
 *
 * @param {{v0:object,v1:object}} originals Frozen English-proxy manifests.
 * @param {object} crosswalk Publisher-linked proposed Japanese card map.
 * @param {object} bans Dated Japanese Aichi Expanded ban snapshot.
 * @returns {object} Machine-readable positive/negative necessary checks.
 */
function auditRegisteredJapanesePrints(originals, crosswalk, bans) {
  assert.equal(crosswalk.schema, 'agent2-apex-alchemy-jp-crosswalk-v1');
  assert.equal(crosswalk.historical_event, '2026-05-10 Aichi Open League');
  assert.equal(crosswalk.number_of_mapped_english_identities, 34);
  assert.equal(bans.valid_for_event, '2026-05-10');
  assert.ok(Array.isArray(bans.banned_identities));

  const prohibitedTrainers = new Set(bans.banned_identities
    .filter(b=>b.selector?.type==='trainer_name').map(b=>b.japanese_name));
  const prohibitedPokemon = bans.banned_identities
    .filter(b=>b.selector?.type!=='trainer_name');
  const baselineJapanese = new Map();
  const summaries = {};

  for(const label of ['v0','v1']) {
    const source = originals[label];
    const translated = crosswalk.registered_candidates[label];
    assert.ok(source && translated, 'Missing registered '+label);
    assert.equal(translated.source_manifest, EXPECTED_SOURCE[label]);
    assert.equal(translated.deck_identity_sha256, EXPECTED[label]);
    assert.equal(source.deck_identity_sha256, EXPECTED[label]);
    assert.equal(source.total_cards, 60);
    assert.equal(translated.total_cards, 60);
    assert.ok(Array.isArray(source.cards));
    assert.ok(Array.isArray(translated.prints));
    assert.equal(source.cards.length, 34);
    assert.equal(translated.prints.length, 34);
    assert.equal(cardIdentitySha256(source.cards), EXPECTED[label]);
    const actual = new Map();
    for(const card of source.cards) {
      assert.ok(!actual.has(card.cardId), 'Repeated English identity '+card.cardId);
      assert.ok(Number.isSafeInteger(card.count) && card.count>=1);
      assert.equal(card.printing.language, 'en');
      actual.set(card.cardId, card);
    }
    assert.equal([...actual.values()].reduce((n,c)=>n+c.count,0),60);
    const reviewed = new Set();
    const japaneseNames = new Map();
    let aceSpecCopies = 0;
    let japanesePrintSlots = 0;
    for(const entry of translated.prints) {
      const id = entry.english_proxy?.cardId;
      const card = actual.get(id);
      assert.ok(card, 'Unregistered original printing '+id);
      assert.ok(!reviewed.has(id), 'Repeated crosswalk identity '+id);
      reviewed.add(id);
      assert.equal(entry.category, card.category);
      assert.equal(entry.count, card.count);
      assert.equal(entry.english_proxy.name, card.name);
      assert.equal(entry.english_proxy.set, card.printing.set);
      assert.equal(entry.english_proxy.number, card.printing.number);
      assert.ok(typeof entry.japanese_name==='string' && entry.japanese_name.length>0);
      assert.match(entry.japanese_print.set, /^[a-zA-Z0-9+_-]+$/);
      assert.match(entry.japanese_print.number,/^[0-9]+\/[0-9a-zA-Z-]+$/);
      const url=new URL(entry.official_card_url);
      assert.equal(url.protocol, 'https:');
      assert.equal(url.hostname, 'www.pokemon-card.com');
      assert.match(url.pathname, /^\/card-search\/details\.php\/card\/[0-9]+$/);
      assert.equal(url.search, '');
      assert.equal(url.hash, '');
      if(entry.category==='Trainer') {
        assert.ok(!prohibitedTrainers.has(entry.japanese_name),
          'Banned historical Japanese Trainer '+entry.japanese_name);
      }
      for(const banned of prohibitedPokemon) {
        // Name collision requires printing/Ability/attack identity analysis.
        if(entry.category==='Pokémon' && banned.japanese_name===entry.japanese_name) {
          throw new Error('Unresolved banned Pokémon identity '+entry.japanese_name);
        }
      }
      const identity={name:entry.japanese_name, print:entry.japanese_print,
        url:entry.official_card_url, category:entry.category};
      if(label==='v0') baselineJapanese.set(id,identity);
      else assert.deepEqual(identity,baselineJapanese.get(id),
        'Japanese print changed across fixed candidates: '+id);
      japaneseNames.set(entry.japanese_name,
        (japaneseNames.get(entry.japanese_name)||0)+entry.count);
      japanesePrintSlots += entry.count;
      if(id==='sv5-157') aceSpecCopies+=entry.count;
    }
    assert.equal(reviewed.size,34);
    assert.equal(japanesePrintSlots,60);
    assert.equal(aceSpecCopies,1,'Registered candidate must have one Prime Catcher');
    for(const [name,copies] of japaneseNames) {
      const basicEnergy=translated.prints.some(e=>e.japanese_name===name &&
        e.category==='Energy' && e.english_proxy.name.startsWith('Basic '));
      if(!basicEnergy) assert.ok(copies<=4,'Japanese four-of name violation: '+name);
    }
    const sumByCategory=Object.fromEntries(['Pokémon','Trainer','Energy'].map(category=>[
      category,translated.prints.filter(e=>e.category===category)
        .reduce((n,c)=>n+c.count,0)
    ]));
    assert.deepEqual(sumByCategory,{'Pokémon':20,'Trainer':30,'Energy':10});
    const supportedProfs=['博士の研究','アララギ博士','プラターヌ博士']
      .filter(name=>japaneseNames.has(name));
    assert.ok(supportedProfs.length<=1,'Japanese professor-name restriction');
    summaries[label]={englishProxyIdentitySha256:EXPECTED[label],
      officialJapaneseCardRecords:34,japanesePrintSlots,
      basicEnergyCopies:translated.prints.filter(e=>e.category==='Energy' &&
        e.english_proxy.name.startsWith('Basic ')).reduce((n,c)=>n+c.count,0),
      aceSpecCopies, japaneseCardNames:japaneseNames.size,
      categoryCopies:sumByCategory,
      exactHistoricalTrainerBanNameMatches:0,
      declaredPaperLegal:null, qualifiedCompetitiveGames:0};
  }
  const count=(label,id)=>originals[label].cards.find(c=>c.cardId===id)?.count??0;
  for(const id of originals.v0.cards.map(c=>c.cardId)) {
    const expectedDelta=id==='swsh7-142'?1:id==='swsh8-237'?-1:0;
    assert.equal(count('v1',id)-count('v0',id),expectedDelta,
      'Nonregistered variant change: '+id);
  }
  return {version:VERSION,status:'necessary-print-identity-checks-pass',
    eventDate:'2026-05-10',candidates:summaries,
    historicalJapanesePrintReleaseDatesVerified:false,
    japaneseVersusEnglishCardTextFullyAudited:false,
    officialEventPaperLegalityProven:false,
    simulatorOrQualifiedGamesProduced:0};
}

module.exports={VERSION,EXPECTED,cardIdentitySha256,auditRegisteredJapanesePrints};
