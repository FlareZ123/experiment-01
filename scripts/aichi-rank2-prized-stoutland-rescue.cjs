'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {choose,fraction,basicCountFromPrintedDeck}=
  require('./aichi-rank15-dual-lock-prize-ceiling.cjs');

/**
 * Exact random legal-seven then six-Prize probability that k named distinct
 * non-Basic singleton cards all occupy Prizes. Weight every Prize layout by
 * remaining valid seven-card opening hands, avoiding independence assumptions.
 * @param {number} basicCount Basic Pokemon copies in the 60.
 * @param {number} k Number of specified non-Basic singletons in Prizes.
 */
function allNamedSingletonsPrized(basicCount,k){
  assert.ok(Number.isInteger(basicCount)&&basicCount>=1&&basicCount<=53);
  assert.ok(Number.isInteger(k)&&k>=0&&k<=6&&basicCount+k<=60);
  const weighted=count=>{
    let total=0n;
    for(let b=0;b<=6-count;b++){
      total+=choose(basicCount,b)*choose(60-basicCount-count,6-count-b)*
        (choose(54,7)-choose(54-basicCount+b,7));
    }
    return total;
  };
  return fraction(weighted(k),weighted(0));
}

/** @param {{numerator:string,denominator:string}} f */
const pair=f=>[BigInt(f.numerator),BigInt(f.denominator)];
/** Source counts are 1 Stoutland BCR, 1 Gladion CIN, 1 Peonia CRE. */
function sourceRescueAvailability(basicCount=14){
  const [a,ad]=pair(allNamedSingletonsPrized(basicCount,1));
  const [b,bd]=pair(allNamedSingletonsPrized(basicCount,2));
  const [c,cd]=pair(allNamedSingletonsPrized(basicCount,3));
  const remaining=a*cd-c*ad;
  assert.ok(remaining>=0n);
  return {
    basicCount,
    stoutlandPrized:fraction(a,ad),
    stoutlandAndOneSpecifiedRescuerPrized:fraction(b,bd),
    allThreeSingletonsPrized:fraction(c,cd),
    atLeastOneRescuerUnprizedGivenStoutlandPrized:
      fraction(remaining,ad*cd*a),
    zeroRescuersUnprizedGivenStoutlandPrized:
      fraction(c*ad,a*cd),
    onlyPhysicalPrizeAvailability:true,
    noPromiseOfSupporterAccessOrSuccessfulPeoniaSelection:true,
    competitiveQualifiedGames:0
  };
}

/** @param {string} root Repository checkout root. */
function fromSourceManifest(root=path.resolve(__dirname,'..')){
  const data=JSON.parse(fs.readFileSync(path.join(root,
    'results/aichi-2026/full-decklists.json'),'utf8'));
  const source=data.decks.find(deck=>deck.rank===2);
  assert.ok(source&&source.cards.reduce((sum,row)=>sum+row.count,0)===60);
  for(const [name,set] of [['Stoutland','BCR'],['Gladion','CIN'],
    ['Peonia','CRE']]){
    assert.equal(source.cards.filter(c=>c.name===name&&c.printing.set===set)
      .reduce((sum,c)=>sum+c.count,0),1);
  }
  const basicCount=basicCountFromPrintedDeck(source,root);
  assert.equal(basicCount,14);
  return {schema:'rank2-source-prize-rescue-v1',rank:2,
    ...sourceRescueAvailability(basicCount)};
}

if(require.main===module)
  process.stdout.write(JSON.stringify(fromSourceManifest(),null,2)+'\n');
module.exports={allNamedSingletonsPrized,sourceRescueAvailability,fromSourceManifest};
