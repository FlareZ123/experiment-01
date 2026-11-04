'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const fs=require('node:fs');
const {combinations}=require('../simulation/twinleaf/agent27-owner-trainer-discard-contention.cjs');
const {RULES,loadBundledPublicPrintMetadata,withSourceDisplayAliases}=
  require('../simulation/twinleaf/planning/owner-public-discard-target-necessary.cjs');

const VERSION='agent15-source-recovery-before-first-action-v1';

/**
 * After a Basic-valid opening hand, one normal draw is exchangeable across
 * all previously unseen physical cards, even when six Prizes are dealt
 * before that draw. Items are disjoint from Basic Pokémon.
 *
 * @param {{deckSize:number,openingHand:number,basics:number,recoveries:number}} x
 */
function recoveryHeldAfterOneDraw(x){
  const {deckSize:n,openingHand:h,basics:b,recoveries:r}=x;
  assert.ok([n,h,b,r].every(v=>Number.isSafeInteger(v)&&v>=0));
  assert.ok(n>h&&h>0&&b>0&&b+r<=n);
  const total=combinations(n,h);
  const valid=total-combinations(n-b,h);
  assert.ok(valid>0n);
  const next=BigInt(n-h);
  // Among valid Basic first hands, count the hands with no held recovery
  // Items and then one further nonrecovery natural draw.
  const noRecoveryValid=combinations(n-r,h)-combinations(n-b-r,h);
  const noRecoveryWeight=noRecoveryValid*BigInt(n-h-r);
  const denominator=valid*next;
  const favorable=denominator-noRecoveryWeight;
  assert.ok(favorable>=0n&&favorable<=denominator);
  const unconditionalDenominator=combinations(n,h+1);
  const unconditionalFavorable=unconditionalDenominator-
    combinations(n-r,h+1);
  return {
    deckSize:n,openingHand:h,basics:b,recoveries:r,
    conditionalOnBasicValidSeven:{
      numerator:favorable.toString(),denominator:denominator.toString(),
      percent:Number(favorable)*100/Number(denominator)
    },
    unconditionalFirstEight:{
      numerator:unconditionalFavorable.toString(),
      denominator:unconditionalDenominator.toString(),
      percent:Number(unconditionalFavorable)*100/Number(unconditionalDenominator)
    },
    sixHiddenPrizesMarginalized:true,extraActions:false,
    opponentInterventionExcluded:true,
    anyRecoveryInFirstEightNotYetPaperPlayableWithEmptyDiscard:true
  };
}

/**
 * Classify authentic original source Pokémon from all known public
 * same-name + set variants, with source promo aliases, and preserve ambiguity.
 * @param {object} deck One authenticated printed original 60.
 * @param {Map<string,object>} metadata Public English card metadata.
 */
function sourceBasicCopyCensus(deck,metadata){
  assert.ok(Array.isArray(deck?.cards)&&metadata instanceof Map);
  let basics=0;
  const unresolved=[];
  for(const card of deck.cards){
    if(card.category!=='Pokémon')continue;
    const printing=card.name+' '+card.printing.set;
    const variants=metadata.get(printing)?.variants;
    if(!variants?.length){
      unresolved.push({printing,number:card.printing.number,
        count:card.count,reason:'unregistered-original-source-printing'});
      continue;
    }
    const statuses=new Set(variants.map(v=>
      v.supertype==='Pokémon'&&Array.isArray(v.subtypes)&&
        v.subtypes.length>0?v.subtypes.includes('Basic'):null));
    if(statuses.size!==1||statuses.has(null)){
      unresolved.push({printing,number:card.printing.number,
        count:card.count,reason:'same-name-set-basic-stage-ambiguous'});
      continue;
    }
    if(statuses.has(true))basics+=card.count;
  }
  return {basics:unresolved.length?null:basics,
    lowerBoundBasics:basics,unresolved};
}

/**
 * Static first-own-root no-discard opening counterexample census.
 * No Prize search, no opponent move, no early Trainer/Ability action,
 * no opponent mulligan compensation draw; does not model actual bot play.
 */
function sourceFieldFirstRecoveryWindow(field,metadata){
  assert.ok(Array.isArray(field?.decks)&&metadata instanceof Map);
  const rows=[];
  const ranks=new Set();
  for(const deck of field.decks){
    assert.ok(Number.isSafeInteger(deck.rank)&&!ranks.has(deck.rank));
    ranks.add(deck.rank);
    assert.equal(deck.cards.reduce((n,c)=>n+c.count,0),60);
    const source=sourceBasicCopyCensus(deck,metadata);
    const recoveries=deck.cards.filter(card=>card.category==='Trainer'&&
      Object.hasOwn(RULES,card.name+' '+card.printing.set))
      .reduce((n,card)=>n+card.count,0);
    const exact=source.basics===null?null:recoveryHeldAfterOneDraw({
      deckSize:60,openingHand:7,basics:source.basics,recoveries
    });
    rows.push({
      rank:deck.rank,archetype:deck.archetype,
      basics:source.basics,unresolvedBasicClassification:source.unresolved,
      recoveryItemCopies:recoveries,opening:exact,
      paperPlayableAtSourceFirstRootWithoutEffects:false,
      competitionOrMatchWinInferred:false
    });
  }
  return {version:VERSION,
    authenticatedOriginals:rows.length,
    sourceRecoveryCopySum:rows.reduce((n,r)=>n+r.recoveryItemCopies,0),
    sourcesWithUnresolvedBasicCopies:rows.filter(r=>
      r.unresolvedBasicClassification.length>0).length,
    sourceOpportunitiesAreModelOnly:true,
    originalRanksUnpublished:[23,25,28],
    rows,qualifiedGames:0};
}

function run(repoRoot=path.resolve(__dirname,'..')){
  const resourceRoot=path.join(repoRoot,'resources');
  const index=withSourceDisplayAliases(loadBundledPublicPrintMetadata(
    resourceRoot));
  const field=JSON.parse(fs.readFileSync(
    path.join(repoRoot,'results','aichi-2026','full-decklists.json'),'utf8'));
  return sourceFieldFirstRecoveryWindow(field,index);
}
if(require.main===module)
  process.stdout.write(JSON.stringify(run(),null,2)+'\n');
module.exports={VERSION,recoveryHeldAfterOneDraw,
  sourceBasicCopyCensus,sourceFieldFirstRecoveryWindow,run};
