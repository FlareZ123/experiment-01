'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {choose}=require('./agent1-prize-failure-budget.cjs');
const {
  VERIFIED_BASIC_PROMO_EXCEPTIONS,
  createBasicClassifier,
  countStartingBasics
}=require('./agent1-original-field-mulligan-bonus.cjs');

const ROOT=path.resolve(__dirname,'../..');
const VERSION='agent50-29original-turn-bench-trigger-opening-exposure-v1';
const TRIGGER_TEXT=/\bwhen you play this pok[eé]mon from your hand onto your bench\b/i;

/**
 * Printed Ability requires an in-turn physical Bench play from the hand.
 * For a starting hand, this opportunity is forfeited if that card instead
 * enters play during setup. No assumption is made about whether its eventual
 * Ability would be strategically useful or whether Ability lock applies.
 * @param {object} record Exact English printed card record.
 * @returns {boolean}
 */
function hasTurnBenchPlayAbility(record){
  return Array.isArray(record.abilities)&&record.abilities.some(a=>
    typeof a.text==='string'&&TRIGGER_TEXT.test(a.text));
}

/**
 * Resolve one paper source printing against the bundled indexed card corpus.
 * The three separately stage-verified promos absent from the snapshot are
 * returned as unknown text; they are never asserted to lack such an Ability.
 * @param {string} [root]
 * @returns {(printing:object,name:string)=>{card:object|null,unknown:boolean}}
 */
function printedResolver(root=ROOT){
  const sets=require(path.join(root,'resources/sets/en.json'));
  const map=new Map(),cache=new Map();
  for(const set of sets){
    if(set.ptcgoCode&&!map.has(set.ptcgoCode)&&
        !/(?:tg|gg)$/.test(set.id))
      map.set(set.ptcgoCode,set.id);
  }
  return (printing,name)=>{
    const code=printing.set+':'+printing.number;
    const id=map.get(printing.set);
    const file=id?path.join(root,'resources/cards/en',id+'.json'):null;
    if(file){
      if(!cache.has(file))
        cache.set(file,JSON.parse(fs.readFileSync(file,'utf8')));
      const card=cache.get(file).find(c=>
        String(c.number)===String(printing.number));
      if(card){
        const prismGlyph=card.subtypes?.includes('Prism Star')&&
          name.endsWith(' ♢')&&card.name===name.slice(0,-1)+'◇';
        assert.ok(card.name===name||prismGlyph,
          'Source printing name mismatch at '+code);
        assert.equal(card.supertype,'Pokémon');
        return {card,unknown:false};
      }
    }
    assert.equal(VERIFIED_BASIC_PROMO_EXCEPTIONS[code],name,
      'Unresolved printed Pokémon without independent stage verification: '+code);
    return {card:null,unknown:true};
  };
}

/**
 * Count exact physical seven-card opening hands in which the all-Basics
 * selection consumes at least one printed in-turn Bench-Ability Basic.
 * Every hand with <=maxSelected Basics is fully consumed by the greedy
 * selected v3 setup actor (pinned normal-setup max=6). In a seven-Basic
 * opening at most six are selected, so those hands are conservatively
 * excluded from both reported exposure events.
 *
 * "Avoidable" requires at least one on-play Basic and at least one different
 * non-on-play Basic: the latter can occupy the Active Spot while the former
 * remains in hand. This is a physical option, not a guaranteed useful play.
 *
 * Returns integer numerators/denominator and decimal diagnostics. No Prize,
 * game outcome, or first-turn tactical success is inferred.
 *
 * @param {number} basics Total eligible physical starting Basics.
 * @param {number} triggers Subset with printed hand-to-Bench Ability.
 * @param {{deckSize?:number,handSize?:number,maxSelected?:number}} [config]
 * @returns {object}
 */
function openingBenchTriggerExposure(basics,triggers,config={}){
  const deckSize=config.deckSize??60;
  const handSize=config.handSize??7;
  const maxSelected=config.maxSelected??6;
  assert.ok(Number.isSafeInteger(deckSize)&&deckSize>=handSize);
  assert.ok(Number.isSafeInteger(handSize)&&handSize>0);
  assert.ok(Number.isSafeInteger(maxSelected)&&maxSelected>=1);
  assert.ok(Number.isSafeInteger(basics)&&basics>=1&&basics<=deckSize);
  assert.ok(Number.isSafeInteger(triggers)&&triggers>=0&&triggers<=basics);
  const other=basics-triggers;
  const nonBasic=deckSize-basics;
  const total=choose(deckSize,handSize);
  const valid=total-choose(nonBasic,handSize);
  let any=0n,avoidable=0n;
  for(let t=1;t<=Math.min(triggers,handSize);t++){
    for(let r=0;r<=Math.min(other,handSize-t);r++){
      if(t+r>maxSelected)continue;
      const others=handSize-t-r;
      const ways=choose(triggers,t)*choose(other,r)*
        choose(nonBasic,others);
      any+=ways;
      if(r>=1)avoidable+=ways;
    }
  }
  assert.ok(0n<=avoidable&&avoidable<=any&&any<=valid);
  return {
    deckSize,handSize,maxSelected,basics,triggers,
    eligibleOtherBasicCopies:other,
    validOpenings:valid,
    consumedTriggerOpenings:any,
    avoidableTriggerOpenings:avoidable,
    consumedTriggerGivenValid:Number(any)/Number(valid),
    avoidableTriggerGivenValid:Number(avoidable)/Number(valid)
  };
}

/**
 * Resolve the 29 authenticated original printed inventories. The "known"
 * counts deliberately omit three separately Basic-verified but card-text
 * unknown promo printings. This makes the trigger rates lower bounds if an
 * unresolved promo actually carries the qualifying Ability.
 *
 * @param {string} [root]
 * @returns {object}
 */
function originalFieldBenchTriggerExposure(root=ROOT){
  const field=require(path.join(root,'results/aichi-2026/full-decklists.json'));
  const classifier=createBasicClassifier(root);
  const resolve=printedResolver(root);
  assert.equal(field.decks.length,29);
  assert.deepEqual(field.missing_full_lists.map(x=>x.rank).sort((a,b)=>a-b),
    [23,25,28]);
  const rows=field.decks.map(deck=>{
    assert.equal(deck.cards.reduce((s,c)=>s+c.count,0),60);
    const basics=countStartingBasics(deck,classifier);
    let triggers=0;
    const found=[],unresolved=[];
    for(const source of deck.cards){
      if(source.category!=='Pokémon')continue;
      assert.ok(source.printing);
      const result=resolve(source.printing,source.name);
      if(result.unknown){
        unresolved.push({name:source.name,printing:source.printing,
          count:source.count});
        continue;
      }
      const card=result.card;
      if(card.subtypes.includes('Basic')&&hasTurnBenchPlayAbility(card)){
        triggers+=source.count;
        found.push({name:source.name,
          printing:source.printing.set+':'+source.printing.number,
          abilityNames:card.abilities.filter(a=>
            TRIGGER_TEXT.test(a.text??'')).map(a=>a.name),
          count:source.count});
      }
    }
    const exposure=openingBenchTriggerExposure(basics,triggers);
    return {
      rank:deck.rank,archetype:deck.archetype,basics,
      knownTurnBenchTriggerBasics:triggers,
      qualifyingPrintings:found,unknownPromoText:unresolved,
      consumedTriggerOpenings:exposure.consumedTriggerOpenings.toString(),
      avoidableTriggerOpenings:exposure.avoidableTriggerOpenings.toString(),
      validOpenings:exposure.validOpenings.toString(),
      consumedTriggerGivenValid:exposure.consumedTriggerGivenValid,
      avoidableTriggerGivenValid:exposure.avoidableTriggerGivenValid
    };
  }).sort((a,b)=>a.rank-b.rank);
  assert.deepEqual(rows.map(x=>x.rank),
    Array.from({length:32},(_,i)=>i+1).filter(r=>![23,25,28].includes(r)));
  const mean=key=>rows.reduce((s,r)=>s+r[key],0)/rows.length;
  return {
    schema:VERSION,authenticatedRanks:rows.length,
    missingRanks:[23,25,28],
    knownTriggerBasicCopiesAcrossSourceSixties:rows.reduce(
      (s,r)=>s+r.knownTurnBenchTriggerBasics,0),
    ranksWithKnownTriggerBasics:rows.filter(r=>
      r.knownTurnBenchTriggerBasics>0).length,
    equalRankMeanConsumedOpportunity:mean('consumedTriggerGivenValid'),
    equalRankMeanAvoidableOpportunity:mean('avoidableTriggerGivenValid'),
    opportunityMeaning:'Physical valid-seven opportunity lost by greedy setup, conditional on this source opening; not an actual Ability use, attack, Prize, outcome, or win estimate',
    zeroCompetitiveGamesQualified:true,
    rows
  };
}

module.exports={VERSION,TRIGGER_TEXT,hasTurnBenchPlayAbility,
  printedResolver,openingBenchTriggerExposure,originalFieldBenchTriggerExposure};
