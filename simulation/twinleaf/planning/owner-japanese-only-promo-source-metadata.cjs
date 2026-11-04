'use strict';

const assert=require('node:assert/strict');

const VERSION='agent15-japanese-only-source-promo-public-identities-v1';

/*
 * Source-specific Japanese promo catalog, separately from bundled English
 * resources/cards/en/*.json. Printed source collector numbers and the exact
 * names are from original Aichi full-decklists.json. Source cards are not
 * necessarily usable in international English-language paper Expanded.
 * Limitless's English effect summaries are unofficial translations.
 *
 * These descriptors give the PUBLIC supertype and Trainer subtype only.
 * They are not native Twinleaf implementations, paper-legality rulings,
 * concrete prompt reducers, or permission to act under Item/Stadium/Tool lock.
 */
const SOURCE_JP_ONLY=Object.freeze([
  Object.freeze({
    printing:'Palace Book SMP',
    sourceSet:'SMP',sourceNumber:'NAN25',
    metadata:Object.freeze({
      supertype:'Trainer',subtypes:Object.freeze(['Item']),hp:null
    }),
    translatedEffect:'Draw 3 cards. Your turn ends.',
    source:'https://limitlesstcg.com/cards/jp/SMP/NAN25?translate=en',
    expandedJapan:'listed-legal',
    expandedInternational:'listed-not-legal',
    officiallyEnglishReleased:false,
    nativeImplemented:null
  }),
  Object.freeze({
    printing:"Player's Ceremony SP",
    sourceSet:'SP',sourceNumber:'127',
    metadata:Object.freeze({
      supertype:'Trainer',subtypes:Object.freeze(['Stadium']),hp:null
    }),
    translatedEffect:
      "Once during each player's turn, that player may draw 2 cards. "+
      'If they do, their turn ends.',
    source:'https://limitlesstcg.com/cards/jp/SP/127?translate=en',
    expandedJapan:'listed-legal',
    expandedInternational:'listed-not-legal',
    officiallyEnglishReleased:false,
    nativeImplemented:null
  }),
  Object.freeze({
    printing:'Palace Belt BWP',
    sourceSet:'BWP',sourceNumber:'153',
    metadata:Object.freeze({
      supertype:'Trainer',subtypes:Object.freeze(['Tool']),hp:null
    }),
    translatedEffect:
      'If the Pokémon this card is attached to is your Active Pokémon, '+
      'draw 2 cards at the beginning of your turn instead of 1.',
    source:'https://limitlesstcg.com/cards/jp/BWP/153?translate=en',
    expandedJapan:'listed-legal',
    expandedInternational:'listed-not-legal',
    officiallyEnglishReleased:false,
    nativeImplemented:null
  })
]);

/**
 * @param {Map<string,{variants:object[]}>} index English + exact display aliases + MEE Basic index
 * @returns {Map<string,{variants:object[]}>} New public-only source printing map.
 */
function withVerifiedJapanesePromoPublicMetadata(index){
  assert.ok(index instanceof Map);
  const result=new Map(index);
  for(const descriptor of SOURCE_JP_ONLY){
    const candidate={
      variants:[{...descriptor.metadata,
        subtypes:[...descriptor.metadata.subtypes],
        provenance:'japanese-source-unofficial-translation',
        sourceSet:descriptor.sourceSet,
        sourceNumber:descriptor.sourceNumber}]
    };
    const previous=result.get(descriptor.printing);
    assert.ok(!previous||JSON.stringify(previous)===JSON.stringify(candidate),
      'Conflicting original Japanese-only promo public metadata');
    result.set(descriptor.printing,candidate);
  }
  return result;
}

/**
 * Source card identity presence alone never proves that it may be used in
 * both Expanded jurisdictions, or that the game engine supports it.
 * @param {object[]} fieldCards A source deck's printed card entries.
 * @returns {object[]}
 */
function JapaneseOnlyPromoReceipts(fieldCards){
  assert.ok(Array.isArray(fieldCards));
  const byKey=new Map(SOURCE_JP_ONLY.map(x=>[x.printing,x]));
  const rows=[];
  for(const card of fieldCards){
    const printing=card.name+' '+card.printing.set;
    const descriptor=byKey.get(printing);
    if(!descriptor)continue;
    assert.equal(card.category,'Trainer');
    assert.equal(card.printing.number,descriptor.sourceNumber);
    rows.push({
      printing,sourceNumber:descriptor.sourceNumber,
      count:card.count,subtype:descriptor.metadata.subtypes[0],
      source:descriptor.source,
      jpExpanded:descriptor.expandedJapan,
      intlExpanded:descriptor.expandedInternational,
      englishEffectTranslationUnofficial:true,
      nativeImplementationKnown:false
    });
  }
  return rows;
}

module.exports={VERSION,SOURCE_JP_ONLY,
  withVerifiedJapanesePromoPublicMetadata,JapaneseOnlyPromoReceipts};
