'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const {createHash}=require('node:crypto');
const {stagedPainfulSpoons}=
  require('../twinleaf/agent4-rank31-alakazam-movesource-native.cjs');

const output=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
/** @param {string} id @returns {any} */
const native=id=>require(path.join(output,id));
const VERSION='agent36-raw-simple-tactics-hidden-owner-deck-order-diagnostic-v2-proposal-purity-contrast';

/** @param {readonly string[]} cards @returns {string} */
function multisetHash(cards){
  return createHash('sha256').update(JSON.stringify([...cards].sort()))
    .digest('hex');
}

/**
 * Two native, physically identical printing multisets differ only in the
 * unrevealed ordering of the acting player's own deck. A player may know
 * the remaining deck contents after K1, but cannot know its shuffled order.
 * This is a staged 60-card owner configuration, not a historical deal.
 * @param {0|1} seat
 * @param {'evolution-top'|'energy-top'} top
 * @param {{pureSupporterProposal?:boolean}} [options]
 */
function probeOwnHiddenDeckOrder(seat,top,options={}){
  assert.ok(seat===0||seat===1);
  assert.ok(top==='evolution-top'||top==='energy-top');
  const f=stagedPainfulSpoons(seat);
  for(const b of f.source.bench)b.cards.length=0;
  for(let i=0;i<4;i++)
    f.source.bench[i].cards.push(f.card('Shadow Rider Calyrex V CRE'));
  // Original rank2 AOR Vileplume puts genuine mutual Item lock into play.
  f.opponent.bench[2].cards.push(
    f.card('Oddish UNB'),f.card('Gloom UNB'),f.card('Vileplume AOR'));
  for(const b of [f.opponent.active,...f.opponent.bench])b.damage=0;
  const items=[
    ...Array(4).fill('Battle VIP Pass FST'),
    ...Array(4).fill('Mysterious Treasure FLI'),
    ...Array(4).fill('Fog Crystal CRE'),
    ...Array(4).fill('VS Seeker PHF'),
    'Quick Ball FST'
  ];
  f.source.hand.cards.push(...items.map(f.card),
    f.card("Professor's Research JTG"));
  f.source.deck.cards.length=0;
  const evolutions=Array.from({length:4},()=>
    f.card('Shadow Rider Calyrex VMAX CRE'));
  const energies=Array.from({length:27},()=>f.card('Psychic Energy SVE'));
  f.source.deck.cards.push(...(top==='evolution-top'?
    [...evolutions,...energies]:[...energies,...evolutions]));
  const ownerZoneCount=f.source.hand.cards.length+
    f.source.deck.cards.length+
    f.source.prizes.reduce((n,p)=>n+p.cards.length,0)+
    f.source.active.cards.length+
    f.source.bench.reduce((n,b)=>n+b.cards.length,0);
  assert.equal(ownerZoneCount,60);
  const observation={
    actorSeat:seat,turn:f.state.turn,
    hand:f.source.hand.cards.map(c=>c.fullName),
    active:f.source.active.getPokemonCard()?.fullName??null,
    bench:f.source.bench.map(b=>b.getPokemonCard()?.fullName??null),
    opponentActive:f.opponent.active.getPokemonCard()?.fullName??null,
    opponentBench:f.opponent.bench.map(b=>b.getPokemonCard()?.fullName??null),
    ownerDeckCount:f.source.deck.cards.length,
    ownerPrizes:f.source.prizes.map(p=>p.cards.length),
    opponentDeckCount:f.opponent.deck.cards.length,
    opponentHandCount:f.opponent.hand.cards.length
  };
  const ownerDeckMultiset=multisetHash(f.source.deck.cards
    .map(c=>c.fullName));
  const ownerDeckTopSeven=f.source.deck.cards.slice(0,7)
    .map(c=>c.fullName);
  const {SimpleTacticsAi}=native('simple-bot/simple-tactics-ai');
  const definitions=native('simple-bot/simple-bot-definitions');
  const bot=new SimpleTacticsAi({id:f.source.id},{
    tactics:definitions.allSimpleTactics,
    scores:definitions.defaultStateScores,
    promptResolvers:definitions.allPromptResolvers,
    arbiter:definitions.defaultArbiterOptions
  },null);
  const supporterBefore=f.source.supporterTurn;
  const {PlaySupporterTactic}=native('simple-bot/simple-tactics/play-supporter-tactic');
  const proto=PlaySupporterTactic.prototype;
  const original=Object.getOwnPropertyDescriptor(proto,'useTactic');
  let action;
  if(options.pureSupporterProposal){
    function restoredSupporterTactic(state,player){
      const prior=player.supporterTurn;
      try { return original.value.call(this,state,player); }
      finally {player.supporterTurn=prior;}
    }
    Object.defineProperty(proto,'useTactic',
      {...original,value:restoredSupporterTactic});
    try {action=bot.decodeNextAction(f.state);}
    finally {
      assert.strictEqual(proto.useTactic,restoredSupporterTactic);
      Object.defineProperty(proto,'useTactic',original);
    }
  }else action=bot.decodeNextAction(f.state);
  return {
    version:VERSION,seat,top,ownerZoneCount,
    pureSupporterProposal:options.pureSupporterProposal===true,
    observation,ownerDeckMultiset,ownerDeckTopSeven,
    nativeDefaultAction:action?.constructor?.name??null,
    nativeDefaultCard:action?.constructor?.name==='PlayCardAction'?
      f.source.hand.cards[action.handIndex]?.fullName??null:null,
    nativeActionHandIndex:action?.handIndex??null,
    supporterTurnBefore:supporterBefore,
    supporterTurnAfter:f.source.supporterTurn,
    qualifiedGames:0,sourceDeal:false
  };
}
if(require.main===module){
  for(const seat of [0,1])for(const pureSupporterProposal of [false,true]){
    const high=probeOwnHiddenDeckOrder(seat,'evolution-top',
      {pureSupporterProposal});
    const low=probeOwnHiddenDeckOrder(seat,'energy-top',
      {pureSupporterProposal});
    assert.deepEqual(high.observation,low.observation);
    assert.equal(high.ownerDeckMultiset,low.ownerDeckMultiset);
    console.log('AGENT36_HIDDEN_DECK_ORDER_NATIVE '+JSON.stringify({
      seat,pureSupporterProposal,sameOwnerVisibleObservation:true,
      sameOwnerDeckPhysicalMultiset:true,
      highAction:high.nativeDefaultAction,
      highCard:high.nativeDefaultCard,
      lowAction:low.nativeDefaultAction,
      lowCard:low.nativeDefaultCard,
      nativeSupporterMutation:[high.supporterTurnAfter,low.supporterTurnAfter],
      highOwnerTopSeven:high.ownerDeckTopSeven,
      lowOwnerTopSeven:low.ownerDeckTopSeven,
      qualifiedGames:0
    }));
  }
}
module.exports={VERSION,probeOwnHiddenDeckOrder};
