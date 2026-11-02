'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {choose,auditOriginalRank5}=require('./agent48-temple-mew-dce-access.cjs');
const NAMES=Object.freeze([
  'Mew V','Genesect V','Wally','Double Colorless Energy',
  'Direct Stadium replacement','Mew VMAX','All other cards'
]);

/**
 * Exact combinations of source opening 7 + first normal turn draw + random
 * 6 Prizes, conditioned on the opening 7 containing a Basic Pokémon.
 * A favorable event needs Mew V in the opening seven (Active), then
 * Genesect V, Wally, one DCE and optionally a replacement Stadium among the
 * first eight, plus a Mew VMAX in the searchable remaining deck after Prizes.
 * Each counted action still needs a legal actual opponent and owner decision.
 * @param {{groups:number[],openingSize:number,prizeCount:number,basicCount:number}} p
 * @param {boolean} requireStadium
 * @returns {{favorable:bigint,possible:bigint,prePrizeFavorable:bigint,prePrizePossible:bigint}}
 */
function firstTurnWallyLocation(p,requireStadium){
  const {groups,openingSize,prizeCount,basicCount}=p;
  assert.ok(Array.isArray(groups)&&groups.length===7);
  assert.ok(groups.every(x=>Number.isSafeInteger(x)&&x>=0));
  assert.ok(Number.isSafeInteger(openingSize)&&openingSize>=1);
  assert.ok(Number.isSafeInteger(prizeCount)&&prizeCount>=0);
  assert.ok(Number.isSafeInteger(basicCount)&&basicCount>=1);
  assert.equal(typeof requireStadium,'boolean');
  const deckSize=groups.reduce((sum,x)=>sum+x,0);
  assert.ok(openingSize+1+prizeCount<=deckSize);
  assert.ok(basicCount<=deckSize&&groups[0]<=basicCount);
  const denominator=choose(deckSize,openingSize)-
    choose(deckSize-basicCount,openingSize);
  assert.ok(denominator>0n);
  const postOpen=deckSize-openingSize;
  const postDraw=postOpen-1;
  const prizeWays=choose(postDraw,prizeCount);
  let favorable=0n,prePrizeFavorable=0n;
  const drawn=Array(7).fill(0);
  /** @param {number} category @param {number} remaining @param {bigint} weight */
  function visit(category,remaining,weight){
    if(category===7){
      if(remaining!==0||drawn[0]<1)return;
      for(let i=0;i<groups.length;i++){
        if(drawn[i]>=groups[i])continue;
        const after=drawn.map((value,j)=>value+Number(i===j));
        if(after[1]<1||after[2]<1||after[3]<1||
          (requireStadium&&after[4]<1))continue;
        const arrangements=weight*BigInt(groups[i]-drawn[i]);
        prePrizeFavorable+=arrangements;
        const stillUnseenVmax=groups[5]-after[5];
        assert.ok(stillUnseenVmax>=0);
        // Ways to place Prizes while retaining at least one searchable VMAX.
        const allVmaxPrized=choose(postDraw-stillUnseenVmax,
          prizeCount-stillUnseenVmax);
        favorable+=arrangements*(prizeWays-allVmaxPrized);
      }
      return;
    }
    const upper=Math.min(groups[category],remaining);
    for(let count=0;count<=upper;count++){
      drawn[category]=count;
      visit(category+1,remaining-count,weight*choose(groups[category],count));
    }
    drawn[category]=0;
  }
  visit(0,openingSize,1n);
  return {
    favorable,possible:denominator*BigInt(postOpen)*prizeWays,
    prePrizeFavorable,prePrizePossible:denominator*BigInt(postOpen)
  };
}

/** Validate original registered card quantities rather than a generic archetype. */
function originalRank5Profile(corpus){
  const deck=corpus.decks?.find(x=>x.rank===5);
  assert.ok(deck,'Original rank5 source missing');
  const count=(category,name,set,number)=>deck.cards
    .filter(x=>x.category===category&&x.name===name&&
      x.printing.set===set&&x.printing.number===number)
    .reduce((sum,x)=>sum+x.count,0);
  const groups=[
    count('Pokémon','Mew V','FST','113'),
    count('Pokémon','Genesect V','FST','185'),
    count('Trainer','Wally','ROS','94'),
    count('Energy','Double Colorless Energy','SUM','136'),
    count('Trainer','Sky Field','ROS','89')+
      count('Trainer','Path to the Peak','CRE','148'),
    count('Pokémon','Mew VMAX','FST','114')
  ];
  assert.deepEqual(groups,[4,4,1,4,4,3],
    'Unexpected original source printed resource counts');
  const basicCount=auditOriginalRank5(corpus).basicCount;
  const total=deck.cards.reduce((sum,card)=>sum+card.count,0);
  assert.equal(total,60);
  groups.push(total-groups.reduce((sum,value)=>sum+value,0));
  assert.deepEqual(groups,[4,4,1,4,4,3,40]);
  return {groups,openingSize:7,prizeCount:6,basicCount};
}

function run(corpus){
  const profile=originalRank5Profile(corpus);
  const baseline=firstTurnWallyLocation(profile,false);
  const stadiumRequired=firstTurnWallyLocation(profile,true);
  assert.equal(baseline.possible,stadiumRequired.possible);
  return {scope:'exact original rank5 first-turn-going-second direct Wally/Mew source resource co-location',
    profile,names:NAMES,withoutTemple:baseline,
    withActiveTempleRequiringDirectStadiumResponse:stadiumRequired,
    assumptions:'Mew V offered in starting seven, Genesect+Wally+DCE (+ Stadium replacement) seen by first ordinary draw, at least one Mew VMAX in searched deck after six random Prizes; no other searches, bonus draws, locks, attacks, competing Supporters or timed match',
    competitivelyQualifiedGames:0};
}
if(require.main===module){
  const source=JSON.parse(fs.readFileSync(path.resolve(__dirname,
    '../results/aichi-2026/full-decklists.json'),'utf8'));
  process.stdout.write(JSON.stringify(run(source),(_,v)=>
    typeof v==='bigint'?v.toString():v,2)+'\n');
}
module.exports={NAMES,firstTurnWallyLocation,originalRank5Profile,run};
