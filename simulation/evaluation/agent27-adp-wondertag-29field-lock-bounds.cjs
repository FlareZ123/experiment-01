'use strict';
const assert=require('node:assert/strict');
const field=require('../../results/aichi-2026/full-decklists.json');
const thornPrints=require('../../resources/cards/en/sv6.json');
const lelePrints=require('../../resources/cards/en/sm2.json');
const {loadRegisteredStartingBasicCounts,exactBonusMultiplicity}=
 require('./agent1-original-field-mulligan-bonus.cjs');
const {FULL60}=require('./agent27-adp-original29-four-bonus-bounds.cjs');
const PROFILES=['mechanical','dragons','dragonsEnergy','dragonsEnergyCompressor'];
const LOCKED_ORIGINAL_RANKS=[6,24,29];
/** Frozen exact 0..4 accepted optional draw count for the 13-class physical
 * source route including paid Tapu Lele GX Wonder Tag. Recompute with
 * countWonderTagBonuses(n), n=0..4, from agent27-adp-wondertag-bonus.cjs.
 */
const WITH_LELE=Object.freeze([
 {denominator:250397245379590400n,
  mechanical:109541773114908463n,dragons:50778042472737262n,
  dragonsEnergy:69899599913538126n,dragonsEnergyCompressor:80845853351768176n},
 {denominator:11518273287461158400n,
  mechanical:5462172580802571978n,dragons:2799567752348437034n,
  dragonsEnergy:3873292251854427240n,dragonsEnergyCompressor:4410172371756153560n},
 {denominator:518322297935752128000n,
  mechanical:262405039590825224370n,dragons:147892155782215579218n,
  dragonsEnergy:202807611409907191458n,
  dragonsEnergyCompressor:226639785446465152080n},
 {denominator:22806181109173093632000n,
  mechanical:12182948191904657656872n,dragons:7496257022267584239456n,
  dragonsEnergy:10092246420189873551616n,
  dragonsEnergyCompressor:11062776229398216044784n},
 {denominator:980665787694443026176000n,
  mechanical:548937260015761136337000n,dragons:365040856017847488625920n,
  dragonsEnergy:479554996487831131140480n,
  dragonsEnergyCompressor:516104329519847910670800n}
]);
function verifyLockedOriginals(){
 const thorn=thornPrints.find(x=>x.id==='sv6-77'),lele=lelePrints.find(x=>x.id==='sm2-60');
 assert.ok(thorn.subtypes.includes('Future')&&thorn.subtypes.includes('Basic'));
 assert.match(thorn.abilities.find(x=>x.name==='Initialization').text,
  /Rule Box in play.*have no Abilities, except for Future Pokémon/);
 assert.ok(lele.subtypes.includes('GX')&&!lele.subtypes.includes('Future'));
 assert.match(lele.abilities.find(x=>x.name==='Wonder Tag').text,
  /from your hand onto your Bench/);
 for(const rank of LOCKED_ORIGINAL_RANKS){
  const deck=field.decks.find(x=>x.rank===rank);
  assert.ok(deck);
  assert.equal(deck.archetype,'Iron Thorns');
  const pokemon=deck.cards.filter(x=>x.category==='Pokémon');
  assert.equal(pokemon.length,1);
  assert.equal(pokemon[0].name,'Iron Thorns ex');
  assert.equal(pokemon[0].count,4);
  assert.deepEqual(pokemon[0].printing,{set:'TWM',number:'77',language:'en'});
  assert.equal(deck.cards.reduce((s,x)=>s+x.count,0),60);
 }
 return [...LOCKED_ORIGINAL_RANKS];
}
/** A conditional source-access probability and interval for any count >= 5.
 * Exact n0..4; for five or more, a monotone source-reachability
 * lower bound using n4 and a conservative maximum of 1.
 */
function accessInterval(weights,conditionalRates){
 const known=weights.slice(0,5).reduce((s,w,j)=>s+w*conditionalRates[j],0);
 return [known+weights[5]*conditionalRates[4],known+weights[5]];
}
function main(){
 const locked=verifyLockedOriginals(),originals=loadRegisteredStartingBasicCounts().originals;
 assert.equal(originals.length,29);
 assert.deepEqual([...field.missing_full_lists].map(x=>x.rank),[23,25,28]);
 for(let n=0;n<5;n++)assert.equal(WITH_LELE[n].denominator,FULL60[n].denominator);
 const conditional=Object.fromEntries(PROFILES.map(k=>[k,{
  without:FULL60.map(e=>Number(e[k])/Number(e.denominator)),
  with:WITH_LELE.map(e=>Number(e[k])/Number(e.denominator))}]));
 const rows=originals.map(({rank,basics})=>{
  const offered=exactBonusMultiplicity(7,basics,4);
  const masses=offered.candidateOffered.map(x=>x.probability),tail=offered.candidateOfferTail;
  const weights=[1-tail-masses.reduce((a,b)=>a+b,0),...masses,tail];
  assert.ok(Math.abs(weights.reduce((a,b)=>a+b,0)-1)<1e-12);
  const suppressed=locked.includes(rank);
  const axes=Object.fromEntries(PROFILES.map(k=>{
   const c=conditional[k],incrementKnown=
    weights.slice(0,5).reduce((s,w,j)=>s+w*(c.with[j]-c.without[j]),0);
   return [k,{
    without:accessInterval(weights,c.without),
    unrestricted:accessInterval(weights,c.with),
    sourceKnownLock:accessInterval(weights,suppressed?c.without:c.with),
    incrementalWithWonderTag:[incrementKnown,incrementKnown+tail],
    incrementalWithKnownLock:suppressed?[0,0]:[incrementKnown,incrementKnown+tail]
   }];
  }));
  return {rank,basics,activeIronThornsLock:suppressed,bonusMasses:weights,axes};
 });
 const average=fn=>rows.reduce((s,r)=>s+fn(r),0)/rows.length;
 const avgInterval=(p,k)=>[0,1].map(i=>average(r=>r.axes[p][k][i]));
 return {version:'agent27-adp-paid-wondertag-29field-lock-bounds-v1',
  sourceCandidate:'agent5-adp-thorton-regidrago-60-v2',
  sourceOpponentCount:rows.length,missingOriginalRanks:[23,25,28],
  identifiedTurnOneLockRanks:locked,
  candidateBonusMasses:[0,1,2,3,4,5].map(i=>average(r=>r.bonusMasses[i])),
  conditionalRates:conditional,
  sourceField:Object.fromEntries(PROFILES.map(k=>[k,{
   without:avgInterval(k,'without'),unrestricted:avgInterval(k,'unrestricted'),
   sourceKnownLock:avgInterval(k,'sourceKnownLock'),
   incrementalWithWonderTag:avgInterval(k,'incrementalWithWonderTag'),
   incrementalWithKnownLock:avgInterval(k,'incrementalWithKnownLock')
  }])),
  rank6:rows.find(r=>r.rank===6),
  allOpponents:rows,qualifiedGames:0,
  limitations:'Basic-valid first seven, all offered bonus cards accepted; no opponent actions besides known opening Initialization locks, no other lock, no additional support search, no actual board or attack payoff.'};
}
module.exports={WITH_LELE,LOCKED_ORIGINAL_RANKS,PROFILES,verifyLockedOriginals,accessInterval,main};
if(require.main===module)console.log(JSON.stringify(main(),null,2));
