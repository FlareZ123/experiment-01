'use strict';

/**
 * Source-exact rank29 Iron Thorns opening-line reachability, NOT a game win rate.
 * Models random 7-card hands with mulligans until any Basic, 6 facedown Prizes,
 * first normal-turn draw, then a one-Supporter Guzma & Hala line.
 * No search Items other than Tag Call, no Trainers' Mail / other draw, opponent
 * counterplay, setup draws from opposing mulligans, or native engine assumptions.
 * Additional off-deck exact printing binding comes from the registered rank29
 * list; no card text is derived from the record.
 */
const source = require('../../../results/aichi-2026/full-decklists.json');
const SOURCE_RANK = 29;
const SOURCE_BLOB_SHA1 = 'ae773f6201d7aa69d31914dbfee66f3fba692200';
const VERSION = 'agent4-rank29-opening-ghala-mc-v1';

function xorshift32(seed) {
  if(!Number.isSafeInteger(seed)||seed<=0||seed>0xffffffff) throw Error('INVALID_SEED');
  let state = seed >>> 0;
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return (state>>>0)/0x100000000;
  };
}
function make60(input=source) {
  const d=input.decks.find(row=>row.rank===SOURCE_RANK);
  if(!d||d.player!=='Kohei Hamamichi') throw Error('SOURCE_BINDING_MISMATCH');
  const cards=d.cards.flatMap(({name,count})=>Array.from({length:count},()=>name));
  if(cards.length!==60||cards.filter(x=>x==='Iron Thorns ex').length!==4) throw Error('SOURCE_NOT_EXACT_60');
  for(const [name,count] of [
    ['Guzma & Hala',2],['Tag Call',2],['Double Colorless Energy',1],
    ['Thunder Mountain ♢',1]
  ]) if(cards.filter(x=>x===name).length!==count) throw Error('LINE_SOURCE_COUNT_DRIFT');
  return cards;
}
function drawShuffle(card60,rand){
  const copy=card60.slice();
  for(let i=copy.length-1;i>0;i--){
    const j=Math.floor(rand()*(i+1));
    [copy[i],copy[j]]=[copy[j],copy[i]];
  }
  return copy;
}
function count(deck,name) {return deck.filter(card=>card===name).length;}

// Conservative discard-value proxy, not an authoritative per-card DCI.
// Opponent is unknown; do not sacrifice ACE SPEC, singleton disruption,
// or first G&H. Repeated cheap setup Items / off-axis Energy are disposable.
const PROXY_CHEAP = new Set([
  "Trainers' Mail",'Camping Gear','Speed Lightning Energy',
  'Capture Energy','Spiky Energy','Crushing Hammer'
]);
function cheapCount(hand) {
  const cheap=hand.filter(name=>PROXY_CHEAP.has(name)).length;
  // Repeated high-copy Supporters or VS Seeker can substitute a cost
  // when redundant. This is a lower-bound proxy relative to relaxed payment.
  const extras = ['Plumeria','Guzma','VS Seeker','Team Flare Grunt']
    .reduce((sum,name)=>sum+Math.max(0,count(hand,name)-1),0);
  return cheap+extras;
}

function oneOpening(deck60,rand){
  let deck, mulligans=0;
  do{
    deck=drawShuffle(deck60,rand);
    if(!deck.slice(0,7).includes('Iron Thorns ex')) mulligans++;
    else break;
  } while(mulligans<200);
  if(mulligans>=200) throw Error('MULLIGAN_REJECTION_CAP');
  const opening=deck.slice(0,7);
  const prizes=deck.slice(7,13);
  const turnDraw=deck[13];
  const hand=opening.concat(turnDraw).filter(name=>name!=='Iron Thorns ex');
  const remaining=deck.slice(14);
  const has=(name)=>hand.includes(name);
  const inDeck=(name)=>remaining.includes(name);
  const dce='Double Colorless Energy',mountain='Thunder Mountain ♢';
  const dceHand=has(dce),mountainHand=has(mountain);
  const targetAccess=(dceHand||inDeck(dce))&&(mountainHand||inDeck(mountain));
  const connector=has('Guzma & Hala')? 'held-gh' :
    has('Tag Call')&&inDeck('Guzma & Hala')?'tag-gh':null;
  const mustPay=!dceHand;
  const remove=[...hand];
  function take(name) {
    const i=remove.indexOf(name);
    if(i>=0)remove.splice(i,1);
  }
  if(connector==='held-gh') take('Guzma & Hala');
  if(connector==='tag-gh') take('Tag Call');
  if(dceHand)take(dce);
  if(mountainHand)take(mountain);
  // Any second Tag Call or G&H can be payment, though our conservative
  // DCI proxy does not mark such cards cheap by default.
  const free=targetAccess && dceHand && mountainHand;
  const viaGuzma=targetAccess && connector!==null &&
    (!mustPay || remove.length>=2);
  const cheapViaGuzma=targetAccess && connector!==null &&
    (!mustPay || cheapCount(remove)>=2);
  return {
    mulligans,
    dcePrized:prizes.includes(dce),
    mountainPrized:prizes.includes(mountain),
    firstTurnHandBoth:dceHand&&mountainHand,
    reachableRelaxed:free||viaGuzma,
    reachableCheap:free||cheapViaGuzma,
    connector:connector??'none',
    unaffordableRelaxed:targetAccess&&connector!==null&&mustPay&&remove.length<2,
    unaffordableCheap:targetAccess&&connector!==null&&mustPay&&cheapCount(remove)<2,
    missingTarget:!targetAccess,
    noConnector:targetAccess&&!free&&connector===null
  };
}
function wilson(k,n){
  const z=1.95996398454, p=k/n, d=1+z*z/n;
  const c=(p+z*z/(2*n))/d;
  const h=z*Math.sqrt((p*(1-p)+z*z/(4*n))/n)/d;
  return [Math.max(0,c-h),Math.min(1,c+h)];
}
function run({trials=100000,seed=20261127,input=source}={}){
  if(!Number.isSafeInteger(trials)||trials<1000||trials>1000000)throw Error('INVALID_TRIALS');
  const card60=make60(input),rand=xorshift32(seed),sums=Object.create(null);
  const connector={ 'held-gh':0,'tag-gh':0,'none':0 };
  let mulligans=0;
  for(let i=0;i<trials;i++){
    const sample=oneOpening(card60,rand);
    mulligans+=sample.mulligans;
    connector[sample.connector]++;
    for(const [key,value] of Object.entries(sample))
      if(typeof value==='boolean') sums[key]=(sums[key]??0)+(value?1:0);
  }
  const probability={};
  for(const [key,k] of Object.entries(sums)) probability[key]={
    successes:k,trials,p:k/trials,wilson95:wilson(k,trials)
  };
  return {
    version:VERSION,sourceRank:SOURCE_RANK,sourceBlobSha1:SOURCE_BLOB_SHA1,
    seed,trials,mulliganMean:mulligans/trials,connectorCount:connector,
    probability,scope:{
      startingHand:'Seven cards redraw whole opening until >=1 Iron Thorns ex',
      prizePlacement:'Six cards after the accepted seven',
      firstTurn:'One normal turn draw after Prize placement; no opposing mulligan bonuses',
      reachable:'Both DCE and Thunder held; or G&H held/Tag Call fetchable, mandatory Stadium search, optional two-card discard if DCE not in hand',
      cheapPayment:'Hand-picked cheap repeated Item/Energy proxy; not empirical player decision',
      relaxedPayment:'Any two non-reserved cards after active/bench placement and connector use',
      excluded:'Trainers Mail, Speed draw, Camping Gear, opposing locks and counterplay, game turns and outcomes',
      qualifiedGames:0
    }
  };
}
if(require.main===module)process.stdout.write(JSON.stringify(run(),null,2)+'\n');
module.exports={VERSION,SOURCE_RANK,SOURCE_BLOB_SHA1,make60,oneOpening,run};
