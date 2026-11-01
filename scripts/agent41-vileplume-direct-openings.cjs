'use strict';

const assert=require('node:assert/strict');
const {createHash}=require('node:crypto');
const fs=require('node:fs');
const path=require('node:path');

const VERSION='agent41-vileplume-direct-tagcall-bunnelby-initial8-v1';
const ROSTER='results/aichi-2026/full-decklists.json';
const ROSTER_BLOB_SHA='ae773f6201d7aa69d31914dbfee66f3fba692200';
const BASICS_BY_RANK=Object.freeze({
  2:['Pidgey','Oddish','Lillipup','Bunnelby','Fan Rotom',
     'Relicanth','Mr. Mime','Girafarig','Budew','Jirachi'],
  15:['Oddish','Buneary','Pidgey','Bunnelby','Fan Rotom',
      'Budew','Eldegoss V','Tatsugiri']
});

/** @param {number} n @param {number} k @returns {bigint} */
function choose(n,k){
  assert.ok(Number.isSafeInteger(n)&&Number.isSafeInteger(k)&&n>=0);
  if(k<0||k>n)return 0n;
  const m=Math.min(k,n-k);
  let result=1n;
  for(let i=1;i<=m;i++)result=result*BigInt(n-i+1)/BigInt(i);
  return result;
}

/**
 * Exact inclusion-exclusion probability that a uniformly drawn h-card set
 * contains at least one card from EACH disjoint named category.
 * @param {number} total Deck size.
 * @param {number} drawn Cards in a uniform unordered sample.
 * @param {number[]} groupSizes Disjoint categories, positive counts.
 * @returns {number}
 */
function eachNamedGroupVisible(total,drawn,groupSizes){
  assert.ok(Number.isSafeInteger(total)&&Number.isSafeInteger(drawn));
  assert.ok(total>0&&drawn>=0&&drawn<=total);
  assert.ok(Array.isArray(groupSizes)&&groupSizes.every(n=>
    Number.isSafeInteger(n)&&n>0));
  assert.ok(groupSizes.reduce((a,b)=>a+b,0)<=total);
  let sum=0n;
  for(let mask=0;mask<2**groupSizes.length;mask++){
    let removed=0,parity=0;
    for(let i=0;i<groupSizes.length;i++){
      if(mask&(1<<i)){removed+=groupSizes[i];parity++;}
    }
    const term=choose(total-removed,drawn);
    sum+=parity%2===0?term:-term;
  }
  return Number(sum)/Number(choose(total,drawn));
}

/**
 * At least one designated starter among the opening hand, plus one or more
 * of every other disjoint category by the first mandatory normal draw.
 * This only measures named card presence; all later game constraints are
 * intentionally absent.
 *
 * @param {number} total Full deck size.
 * @param {number} opening Number of opening cards, excluding first draw.
 * @param {number} starterCount Number of designated Basic starters.
 * @param {number[]} otherGroupSizes Other disjoint named-card categories.
 * @returns {number}
 */
function starterInitiallyAndGroupsByFirstDraw(total,opening,starterCount,
  otherGroupSizes){
  assert.ok(opening>=0&&opening<total);
  assert.ok(Number.isSafeInteger(starterCount)&&starterCount>=1&&
    starterCount<=total);
  assert.ok(Array.isArray(otherGroupSizes));
  assert.ok(otherGroupSizes.reduce((a,b)=>a+b,0)<=total-starterCount);
  // Count all groups by the eighth card. Remove the cases where the
  // designated starter appears only at that eighth position.
  const seen=eachNamedGroupVisible(total,opening+1,
    [starterCount,...otherGroupSizes]);
  const lastOnlyStarter=(starterCount/total)*
    Number(choose(total-starterCount,opening))/
    Number(choose(total-1,opening))*
    eachNamedGroupVisible(total-starterCount,opening,otherGroupSizes);
  return seen-lastOnlyStarter;
}

/** @param {Buffer} bytes @returns {string} */
function gitBlobHash(bytes){
  return createHash('sha1').update('blob '+bytes.length+'\0')
    .update(bytes).digest('hex');
}

/**
 * Count an original printed 60, then compute the direct opening window.
 * @param {object} source Original printed source deck.
 * @returns {object} Exact opening combinatorics.
 */
function analyzeRank(source){
  assert.ok([2,15].includes(source.rank));
  const counts=new Map();
  for(const card of source.cards){
    assert.ok(Number.isSafeInteger(card.count)&&card.count>0);
    counts.set(card.name,(counts.get(card.name)??0)+card.count);
  }
  assert.equal([...counts.values()].reduce((a,b)=>a+b,0),60);
  const count=name=>counts.get(name)??0;
  const b=count('Bunnelby'),o=count('Oddish'),p=count('Pidgey');
  const tag=count('Tag Call'),gh=count('Guzma & Hala');
  const basics=BASICS_BY_RANK[source.rank].reduce((n,name)=>n+count(name),0);
  assert.deepEqual([b,o,p,tag],[2,2,2,4]);
  assert.equal(gh,source.rank===2?4:3);
  assert.equal(basics,14);
  assert.equal(count('Technical Machine: Evolution'),2);
  assert.equal(count('Jet Energy'),2);
  const validOpening=1-Number(choose(60-basics,7))/Number(choose(60,7));
  const connectorCount=tag+gh;
  const starterAccessHand7=eachNamedGroupVisible(60,7,[b,connectorCount]);
  const starterAccessByDraw=starterInitiallyAndGroupsByFirstDraw(60,7,b,
    [connectorCount]);
  const starterBothBenchAndAccessHand7=eachNamedGroupVisible(60,7,
    [b,o,p,connectorCount]);
  const starterBothBenchAndAccessByDraw=
    starterInitiallyAndGroupsByFirstDraw(60,7,b,[o,p,connectorCount]);
  return {
    rank:source.rank,archetype:source.archetype,
    bunnelby:b,oddish:o,pidgey:p,tagCall:tag,guzmaHala:gh,
    tmEvolution:2,jetEnergy:2,basicPokemon:basics,
    validOpening,
    initialSeven:{
      starterAndConnectorUnconditional:starterAccessHand7,
      starterAndConnectorGivenValidOpening:starterAccessHand7/validOpening,
      starterBothBenchesConnectorUnconditional:starterBothBenchAndAccessHand7,
      starterBothBenchesConnectorGivenValidOpening:
        starterBothBenchAndAccessHand7/validOpening
    },
    initialSevenPlusFirstNormalDraw:{
      starterAndConnectorUnconditional:starterAccessByDraw,
      starterAndConnectorGivenValidOpening:starterAccessByDraw/validOpening,
      starterBothBenchesConnectorUnconditional:starterBothBenchAndAccessByDraw,
      starterBothBenchesConnectorGivenValidOpening:
        starterBothBenchAndAccessByDraw/validOpening
    },
    interpretation:'Direct named-card co-presence only, given a normal initial seven and first normal draw. No prize accessibility, G&H search resolution, hand discard realism, TM cost, second-turn setup, Bench sufficiency, opponent locks, extra draw, mulligan bonus or gameplay win proof.',
    competitivelyQualifiedGames:0
  };
}

/** @param {string} [root] @returns {object} */
function run(root=path.resolve(__dirname,'..')){
  const bytes=fs.readFileSync(path.join(root,ROSTER));
  assert.equal(gitBlobHash(bytes),ROSTER_BLOB_SHA,
    'Unreviewed original paper source deck-list change');
  const roster=JSON.parse(bytes.toString('utf8'));
  assert.equal(roster.decks.length,29);
  const ranks=[2,15].map(rank=>analyzeRank(
    roster.decks.find(d=>d.rank===rank)));
  return {version:VERSION,sourceGitBlobSha:ROSTER_BLOB_SHA,
    ranks,winRatesCertified:false};
}
if(require.main===module)process.stdout.write(JSON.stringify(run(),null,2)+'\n');
module.exports={VERSION,ROSTER,ROSTER_BLOB_SHA,choose,eachNamedGroupVisible,
  starterInitiallyAndGroupsByFirstDraw,analyzeRank,run};
