'use strict';

const assert=require('node:assert/strict');
const {
  choose,rational,sourceCounts
}=require('./agent18-rank6-ghala-direct-access-exact.cjs');
const ROSTER=require('../../results/aichi-2026/full-decklists.json');

const VERSION='agent18-original-rank6-trainers-mail-marginal-exact-v1';
const TOTAL_CARDS=60,OPENING=7,PRIZES=6,TURN_DRAW=1;
const MAX_MAIL=3;
const FOUR_CARD_DENOMINATOR=choose(46,4);

/**
 * Original verified Rank6 names: Basic, Guzma & Hala, Tag Call, Thunder
 * Mountain, DCE, Trainers' Mail, all other printings. No alterations.
 * @param {object} [roster]
 * @returns {number[]}
 */
function rank6MailCounts(roster=ROSTER){
  const original=sourceCounts(roster);
  const deck=roster.decks.find(row=>row.rank===6);
  const mail=deck.cards.find(card=>card.name==="Trainers' Mail");
  assert.equal(mail?.count,3,'Original Rank6 must have three Trainers Mail');
  assert.deepEqual(original,[4,2,2,1,1,50]);
  return [...original.slice(0,5),mail.count,original[5]-mail.count];
}

/**
 * Exact conditional combinatorics for all legal seven-card Basic openings,
 * subsequent six-card Prizes, one turn draw, and the four-card Mail search.
 * Mail cannot select another Mail and always shuffles unsuccessful looks,
 * so each next four-card attempt samples the same 46-card owner deck.
 *
 * Direct access consumes one initially held G&H or Tag from the 8-card
 * opening-plus-turn-draw hand. Mail-fetched G&H or Tag is newly added, then
 * spent; this uses no extra initial card beyond the Mail(s) played.
 *
 * @param {number[]} [profile] Exact original Rank6 count categories.
 * @returns {object} Reduced exact ratios and witnessed denominator invariant.
 */
function exactMailExtension(profile=rank6MailCounts()){
  assert.deepEqual(profile,[4,2,2,1,1,3,47]);
  const expectedOpening=choose(TOTAL_CARDS,OPENING)-
    choose(TOTAL_CARDS-profile[0],OPENING);
  const conditionedDenominator=expectedOpening*
    choose(TOTAL_CARDS-OPENING,PRIZES)*
    BigInt(TOTAL_CARDS-OPENING-PRIZES);
  const K=FOUR_CARD_DENOMINATOR;
  const scaledDenominator=conditionedDenominator*K**3n;
  const counted={
    heldDirectPaid:0n,mailOnlyExtra:0n,
    combinedPaidAccess:0n,combinedPaidAccessWithBench:0n,
    firstMailExtra:0n,secondMailExtra:0n,thirdMailExtra:0n
  };
  let enumerated=0n,weightedStates=0;
  for(let b=1;b<=profile[0];b++)
  for(let h=0;h<=profile[1];h++)
  for(let tag=0;tag<=profile[2];tag++)
  for(let mountain=0;mountain<=profile[3];mountain++)
  for(let dce=0;dce<=profile[4];dce++)
  for(let mail=0;mail<=profile[5];mail++){
    const other=7-b-h-tag-mountain-dce-mail;
    if(other<0||other>profile[6])continue;
    const hand=[b,h,tag,mountain,dce,mail,other];
    let initialWeight=1n;
    for(let i=0;i<profile.length;i++)
      initialWeight*=choose(profile[i],hand[i]);
    if(initialWeight===0n)continue;
    const remaining=profile.map((count,i)=>count-hand[i]);
    for(let pb=0;pb<=Math.min(remaining[0],6);pb++)
    for(let ph=0;ph<=Math.min(remaining[1],6-pb);ph++)
    for(let pt=0;pt<=Math.min(remaining[2],6-pb-ph);pt++)
    for(let pm=0;pm<=Math.min(remaining[3],6-pb-ph-pt);pm++)
    for(let pd=0;pd<=Math.min(remaining[4],6-pb-ph-pt-pm);pd++)
    for(let pq=0;pq<=Math.min(remaining[5],6-pb-ph-pt-pm-pd);pq++){
      const po=6-pb-ph-pt-pm-pd-pq;
      if(po<0||po>remaining[6])continue;
      const prized=[pb,ph,pt,pm,pd,pq,po];
      let prizeWeight=1n;
      for(let i=0;i<profile.length;i++)
        prizeWeight*=choose(remaining[i],prized[i]);
      if(prizeWeight===0n)continue;
      const deck=remaining.map((count,i)=>count-prized[i]);
      for(let drawn=0;drawn<profile.length;drawn++){
        if(deck[drawn]===0)continue;
        weightedStates++;
        const weight=initialWeight*prizeWeight*BigInt(deck[drawn]);
        enumerated+=weight;
        const B=b+(drawn===0?1:0);
        const H=h+(drawn===1?1:0);
        const T=tag+(drawn===2?1:0);
        const M=mountain+(drawn===3?1:0);
        const D=dce+(drawn===4?1:0);
        const Q=mail+(drawn===5?1:0);
        const ghDeck=deck[1]-(drawn===1?1:0);
        const tagDeck=deck[2]-(drawn===2?1:0);
        const resourcesOutsidePrizes=pm===0&&pd===0;
        const direct=H>=1||(T>=1&&ghDeck>=1);
        const bench=B>=2;
        if(direct&&resourcesOutsidePrizes&&7-B-M-D>=2){
          const contribution=weight*K**3n;
          counted.heldDirectPaid+=contribution;
          counted.combinedPaidAccess+=contribution;
          if(bench)counted.combinedPaidAccessWithBench+=contribution;
          continue;
        }
        if(direct||!resourcesOutsidePrizes||H!==0||
            ghDeck<1||Q<1)continue;

        const validTargets=ghDeck+tagDeck;
        const fail=choose(46-validTargets,4);
        const hit=K-fail;
        if(hit===0n)continue;
        for(let j=1;j<=Q;j++){
          // A Mail-retrieved G&H/Tag is an extra card. The Mail(s) used,
          // rather than a held route card, are the only hand loss here.
          if(8-j-B-M-D<2)continue;
          const contribution=weight*fail**BigInt(j-1)*hit*
            K**BigInt(MAX_MAIL-j);
          counted.mailOnlyExtra+=contribution;
          counted.combinedPaidAccess+=contribution;
          if(bench)counted.combinedPaidAccessWithBench+=contribution;
          if(j===1)counted.firstMailExtra+=contribution;
          if(j===2)counted.secondMailExtra+=contribution;
          if(j===3)counted.thirdMailExtra+=contribution;
        }
      }
    }
  }
  assert.equal(enumerated,conditionedDenominator,
    'Seven-card opening, six Prize and draw partition was incomplete');
  assert.equal(counted.heldDirectPaid+counted.mailOnlyExtra,
    counted.combinedPaidAccess);
  assert.equal(counted.firstMailExtra+counted.secondMailExtra+
    counted.thirdMailExtra,counted.mailOnlyExtra);
  const ratios={};
  for(const [key,value] of Object.entries(counted))
    ratios[key]=rational(value,scaledDenominator);
  return {
    schema:VERSION,sourceRank:6,
    originalPrintedCounts:profile,
    setup:{initialCards:7,prizes:6,normalTurnDraw:1,
      initialHandRequiresBasic:true,
      remainingOwnerDeckAfterDraw:46,
      oneMailLookCards:4,heldMailCopyCap:3,
      fourCardSampleCount:K.toString(),
      exactInitialSevenPrizeSixDrawOneWeightedOutcomes:
        conditionedDenominator.toString(),
      enumeratedWeightedStates:weightedStates,
      exhaustiveWeightedPartitionVerified:true},
    probabilities:ratios,
    modelAssumptions:[
      'Paper Expanded; original registered rank6 sixty unchanged',
      'Owner going second with one ordinary first-turn draw and no opponent mulligan bonus',
      'All held Iron Thorns ex Basics enter Active/Bench; two different cards are available as mandatory G&H discard payment',
      'Protection from discarding applies only to held Basics, Thunder Mountain and DCE; other card strategic value not assessed',
      'A held G&H or Tag consumes one opening hand card; Mail-fetched target is gained and spent from deck',
      'A successful Mail can select genuine G&H or Tag Call among the top 4, excluding Mail itself',
      'Each unsuccessful four-card Mail search shuffles the other cards back; successive held Mail searches resample uniformly',
      'G&H and Thunder/DCE cannot be fetched from Prizes; one G&H must remain in deck if Tag Call selected',
      'No opposing restriction, consumed Supporter, prior Energy attachment or Stadium quota',
      'No alternative search or draw effects, item lock, attack authorization, mandatory Volt Cyclone Energy move or opponent reply'
    ],
    inference:'Exact physical resource-access probability for this restricted route, no actual attack or matchup win rate',
    competitivelyQualifiedGames:0
  };
}

if(require.main===module)
  process.stdout.write(JSON.stringify(exactMailExtension(),null,2)+'\n');

module.exports={
  VERSION,MAX_MAIL,FOUR_CARD_DENOMINATOR,rank6MailCounts,exactMailExtension
};
