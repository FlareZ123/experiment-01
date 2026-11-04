'use strict';

const assert=require('node:assert/strict');
const field=require('../../results/aichi-2026/full-decklists.json');
const {originalBasicCounts}=require('./agent32-adp-field-mulligan-offers.cjs');

const VERSION='agent4-bonus-bench-native-seed-replay-v1';
const FIRST_SEEDS=Object.freeze(Array.from({length:8},(_,i)=>20261126+i));
const EXTENSION_SEEDS=Object.freeze(Array.from({length:32},(_,i)=>20261134+i));
const SEEDS=Object.freeze([...FIRST_SEEDS,...EXTENSION_SEEDS]);
const PIN='a9905a76a6c4103ba4b6cb9a49e86bad795c5c05';

/**
 * Exact JS unsigned 32-bit xorshift32 used by pinned
 * simulation/twinleaf/headless.cjs. This intentionally retains that weak
 * deterministic stream to replay existing native receipts. It must not be
 * described as a statistically independent paper shuffle oracle.
 * @param {number} seed
 * @returns {()=>number}
 */
function seededRandom(seed){
  assert.ok(Number.isSafeInteger(seed));
  let state=seed>>>0;
  if(state===0)state=0x9e3779b9;
  return ()=>{
    state^=state<<13;
    state^=state>>>17;
    state^=state<<5;
    return (state>>>0)/0x100000000;
  };
}

/**
 * Reproduce the pinned headless Fisher-Yates shuffle, including the
 * traversal and source-card index remapping.
 * @param {number[]} deck
 * @param {()=>number} random
 * @returns {number[]}
 */
function shuffle(deck,random){
  const order=Array.from({length:deck.length},(_,i)=>i);
  for(let i=deck.length-1;i>0;i--){
    const j=Math.floor(random()*(i+1));
    [order[i],order[j]]=[order[j],order[i]];
  }
  return order.map(index=>deck[index]);
}

/**
 * Reconstruct source-file input index locations from the authenticated
 * original printing inventory. These are source ordering indices, not
 * revealed in-game card identities. Native experimental legality/proxy
 * substitutions remain separate from their printed source provenance.
 * @param {number} rank
 * @returns {Set<number>}
 */
function basicMask(rank){
  const source=field.decks.find(row=>row.rank===rank);
  const basic=originalBasicCounts().find(row=>row.rank===rank);
  assert.ok(source&&basic);
  assert.equal(source.cards.reduce((s,row)=>s+row.count,0),60);
  const basicNames=new Set(basic.basicPrintings.map(row=>
    row.name+'|'+row.printing));
  const mask=new Set();
  let index=0;
  for(const row of source.cards){
    const signature=row.name+'|'+row.printing.set+' '+row.printing.number;
    for(let i=0;i<row.count;i++){
      if(basicNames.has(signature))mask.add(index);
      index++;
    }
  }
  assert.equal(index,60);
  assert.equal(mask.size,basic.basicCopies);
  return mask;
}

/**
 * Reconstruct setup-only numbered Card positions using the actual reducer's
 * successive 7-card draws, simultaneous-both-invalid retry and single-player
 * retry, conservative exactly-one Active placement, six Prizes and all offered
 * optional compensation draws.
 *
 * No bot strategy beyond the already-installed deterministic source setup
 * is simulated; no attack, opponent reply, winner, or competitive game.
 *
 * @param {number} seed
 * @param {0|1} sourceSeat
 * @param {{champion?:Set<number>,source?:Set<number>}} [known]
 */
function replay(seed,sourceSeat,known={}){
  assert.ok(sourceSeat===0||sourceSeat===1);
  const masks=[
    sourceSeat===0?(known.source??basicMask(6)):(known.champion??basicMask(1)),
    sourceSeat===1?(known.source??basicMask(6)):(known.champion??basicMask(1))
  ];
  const random=seededRandom(seed);
  // Genuine pinned setup reducer's first coin flip is before both shuffles.
  const firstCoin=random()<0.5;
  const players=[0,1].map(()=>({
    deck:Array.from({length:60},(_,i)=>i),
    hand:[],active:null,prizes:[],mulligans:0
  }));
  const valid=seat=>players[seat].hand.some(i=>masks[seat].has(i));
  const draw=(seat,count)=>{
    const player=players[seat];
    player.hand.push(...player.deck.splice(0,count));
  };
  const reshuffle=seat=>{
    const player=players[seat];
    player.deck=shuffle(player.deck,random);
    draw(seat,7);
  };
  const retry=seat=>{
    const player=players[seat];
    player.mulligans++;
    player.deck.push(...player.hand);
    player.hand=[];
    reshuffle(seat);
  };
  const setupActive=seat=>{
    const player=players[seat];
    const index=player.hand.findIndex(i=>masks[seat].has(i));
    assert.ok(index>=0);
    player.active=player.hand.splice(index,1)[0];
    player.prizes.push(...player.deck.splice(0,6));
  };
  reshuffle(0);
  reshuffle(1);
  let retries=0;
  while(!valid(0)&&!valid(1)){
    assert.ok(++retries<=64,'Unbounded double mulligan');
    retry(0);
    retry(1);
  }
  const earlyValid=[valid(0),valid(1)];
  if(earlyValid[0]&&earlyValid[1]){
    setupActive(0);
    setupActive(1);
    return {seed,sourceSeat,firstCoin,
      mulligans:players.map(p=>p.mulligans),
      bonusRecipient:null,bonusCardsChosen:0,
      retainedBonusBasicCount:0,expectedBonusPrompt:false};
  }
  const validSeat=earlyValid[0]?0:1;
  const invalidSeat=1-validSeat;
  setupActive(validSeat);
  while(!valid(invalidSeat)){
    assert.ok(++retries<=64,'Unbounded single mulligan');
    retry(invalidSeat);
  }
  setupActive(invalidSeat);
  const extraDraws=Math.max(0,
    players[invalidSeat].mulligans-players[validSeat].mulligans);
  if(extraDraws)draw(validSeat,extraDraws);
  const basics=players[validSeat].hand.filter(i=>
    masks[validSeat].has(i)).length;
  return {seed,sourceSeat,firstCoin,
    mulligans:players.map(p=>p.mulligans),
    bonusRecipient:extraDraws?validSeat:null,
    bonusCardsChosen:extraDraws,
    retainedBonusBasicCount:basics,
    expectedBonusPrompt:extraDraws>0&&basics>0};
}

/** @returns {object} */
function run(){
  const source=basicMask(6),champion=basicMask(1);
  assert.equal(source.size,4);
  assert.equal(champion.size,14);
  const rows=[];
  for(const sourceSeat of [0,1]){
    for(const seed of SEEDS)
      rows.push(replay(seed,sourceSeat,{source,champion}));
  }
  return {
    version:VERSION,pinnedNativeTwinleaf:PIN,
    originalSourceRank:6,referenceRank:1,
    actorPolicy:'single initial Basic, all optional bonus draws, no extra Bench placement',
    sourceInputOrder:'full-decklists.json ordered printing-expanded 60s',
    originalEightWitnessPrediction:[0,1].map(seat=>rows.filter(r=>
      r.sourceSeat===seat&&FIRST_SEEDS.includes(r.seed)&&
      r.expectedBonusPrompt).length),
    extensionWitnessPrediction:[0,1].map(seat=>rows.filter(r=>
      r.sourceSeat===seat&&EXTENSION_SEEDS.includes(r.seed)&&
      r.expectedBonusPrompt).length),
    predictions:rows,qualifiedGames:0,
    caveat:'A fixed-seed native setup transcript replay, not an independent statistical sampling or win model'
  };
}
if(require.main===module)process.stdout.write(JSON.stringify(run(),null,2)+'\n');
module.exports={VERSION,PIN,FIRST_SEEDS,EXTENSION_SEEDS,SEEDS,
  seededRandom,shuffle,basicMask,replay,run};
