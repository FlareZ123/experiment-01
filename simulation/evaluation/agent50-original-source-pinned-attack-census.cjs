'use strict';

const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const {initializeCards}=require('../twinleaf/headless.cjs');

const VERSION='agent50-29source-native-executable-attack-census-v2';

/**
 * Structural triage of original Aichi source Pokémon against the pinned card
 * registry. A local reduceEffect override is a useful indicator, but cannot
 * prove that an attack is correctly implemented: other reducers or generic
 * handling may still apply. Never convert these observations into win rates.
 *
 * @param {{getAllCards:()=>object[]}} manager Pinned native card registry.
 * @param {{decks:object[]}} source Original published Aichi source archive.
 * @returns {object}
 */
function census(manager,source){
  assert.ok(Array.isArray(source.decks));
  const registry=new Map();
  for(const card of manager.getAllCards()){
    if(typeof card.fullName!=='string')continue;
    if(!registry.has(card.fullName))registry.set(card.fullName,[]);
    registry.get(card.fullName).push(card);
  }
  const rows=[];
  for(const deck of source.decks){
    for(const entry of deck.cards.filter(c=>c.category==='Pokémon')){
      const printing=entry.printing;
      const requested=entry.name+' '+printing.set;
      const options=registry.get(requested)??[];
      const registryMatched=options.find(card=>
        String(card.setNumber)===String(printing.number))??options[0]??null;
      const live=typeof manager.getCardByName==='function'?
        manager.getCardByName(requested):null;
      const matched=live??registryMatched;
      const attacks=matched?.attacks??[];
      const special=attacks.some(attack=>attack.damageCalculation==='x'||
        attack.damageCalculation==='+'||attack.damageCalculation==='-');
      const ownReducer=matched?
        Object.prototype.hasOwnProperty.call(
          Object.getPrototypeOf(matched),'reduceEffect'):null;
      rows.push({
        rank:deck.rank,sourceName:entry.name,
        requestedPrinting:requested,requestedNumber:String(printing.number),
        nativePrinting:matched?.fullName??null,
        nativeNumber:matched?.setNumber??null,
        registryCollisions:options.length,
        executableLookupFound:live!==null,
        enumerationFound:registryMatched!==null,
        registryLookupClassDiff:live&&registryMatched?
          live.constructor.name!==registryMatched.constructor.name:false,
        matchedExactNumber:matched?
          String(matched.setNumber)===String(printing.number):false,
        nativeClass:matched?.constructor.name??null,
        specializedReducer:ownReducer,
        attackCount:attacks.length,
        dynamicPrintedDamage:special,
        attackLabels:attacks.map(a=>a.name)
      });
    }
  }
  const count=(predicate)=>rows.filter(predicate).length;
  return {
    version:VERSION,
    scope:'Published original-source physical Pokemon entries only',
    deckCount:source.decks.length,
    pokemonEntries:rows.length,
    nativeMatched:count(r=>r.nativePrinting!==null),
    executableLookupMatched:count(r=>r.executableLookupFound),
    registryEnumerationMatched:count(r=>r.enumerationFound),
    registryLookupMismatches:rows.filter(r=>r.registryLookupClassDiff),
    exactNumberMatched:count(r=>r.matchedExactNumber),
    noNativeMatch:rows.filter(r=>r.nativePrinting===null),
    unboundNumber:count(r=>r.nativePrinting!==null&&!r.matchedExactNumber),
    dynamicAttackEntries:count(r=>r.dynamicPrintedDamage),
    dynamicWithoutSpecializedReducer:rows.filter(r=>
      r.dynamicPrintedDamage&&r.specializedReducer===false),
    specializedReducerEntries:count(r=>r.specializedReducer===true),
    distinctRiskPrintings:Array.from(new Map(rows.filter(r=>
      r.dynamicPrintedDamage&&r.specializedReducer===false).map(r=>
        [r.requestedPrinting+' #'+r.requestedNumber,r])).values()),
    byRank:source.decks.map(deck=>{
      const here=rows.filter(r=>r.rank===deck.rank);
      return {rank:deck.rank,entries:here.length,
        dynamicWithoutSpecializedReducer:here.filter(r=>
          r.dynamicPrintedDamage&&r.specializedReducer===false)
          .map(r=>r.requestedPrinting)
      };
    }),
    qualification:{competitiveQualifiedGames:0,
      explanatoryLimit:'A structural reducer check is only a search priority'}
  };
}

if(require.main===module){
  const archive=JSON.parse(fs.readFileSync(path.resolve(
    __dirname,'../../results/aichi-2026/full-decklists.json'),'utf8'));
  console.log('AGENT50_PINNED_SOURCE_ATTACK_CENSUS',
    JSON.stringify(census(initializeCards(),archive)));
}

module.exports={VERSION,census};
