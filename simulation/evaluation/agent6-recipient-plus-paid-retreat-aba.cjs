'use strict';
const assert=require('node:assert/strict');
const {createHash}=require('node:crypto');
const {
  SEEDS,pairGroup,summarizeGroups
}=require('./agent6-rank1-rank3-energy-recipient-aba.cjs');

const VERSION='agent6-original-rank1-rank3-recipient-multibasic-factorial-aba-v1';
const PIN='a9905a76a6c4103ba4b6cb9a49e86bad795c5c05';
const SOURCE='72c61d594eee5ee1d593b738af627c3ab8f3a38d1a5f29695ff39c8c09c2264f';
const REFERENCE='de8b454ce520b9f6b8db9395c5bea4e8c09cd3958b8e78159f704ba5aec71311';
const hash=x=>createHash('sha256').update(JSON.stringify(x)).digest('hex');

/**
 * Evidence only. Actual Store targets are observed immediately after dispatch;
 * a nonthrowing method alone does not establish paid retreat.
 * @param {object} event Native accepted root sidecar.
 * @returns {object|null}
 */
function paidRetreatReceipt(event){
  if(event?.storeAccepted!==true||event.action!=='RetreatAction'||
     event.declared?.kind!=='retreat'||
     event.declared.status!=='captured'||
     event.visibility!=='public-after-dispatch'||
     !Array.isArray(event.publicBoardChanges))return null;
  const active=event.publicBoardChanges.find(row=>
    row.seat===event.playerSlot&&row.position==='active'&&
    row.before?.pokemon&&row.after?.pokemon&&
    row.before.pokemon!==row.after.pokemon);
  if(!active)return null;
  const old=active.before;
  const moved=event.publicBoardChanges.find(row=>
    row.seat===event.playerSlot&&row.position==='bench'&&
    row.after?.pokemon===old.pokemon);
  if(!moved||!Array.isArray(old.energies)||
      !Array.isArray(moved.after.energies))return null;
  const energyCardDelta=old.energies.length-moved.after.energies.length;
  return {
    ownerSeat:event.playerSlot,turn:event.turnBefore,
    authenticatedRootActionOrdinal:event.rootActionOrdinal??null,
    retreatIntoIndex:event.declared.benchIndex,
    oldActivePrinting:old.pokemon,newActivePrinting:active.after.pokemon,
    energyCardDelta,
    observedNativePaidBasicRetreat:energyCardDelta>=2&&
      old.energies.every(x=>
        /^(?:Grass|Fire|Water|Lightning|Psychic|Fighting|Darkness|Metal|Fairy) Energy /.test(x)),
    // This conservatively does not attest paper retreat-cost modifiers,
    // attached Special Energy, Tool locks, or full attack followthrough.
    paperFullLegalityCertified:false
  };
}

/**
 * Complete native pair for a shared actor policy using two frozen original
 * decks. All arms have Basic recipient routing; only the middle arm adds a
 * source-independent symmetric multi-Basic retreat proposer.
 */
function run(){
  const {initializeCards}=require('../twinleaf/headless.cjs');
  const {originals}=require('./agent41-rank3-arbitration-original-store.cjs');
  const {runArm}=require('./agent2-fresh-rank1-rank3-multibasic-panel.cjs');
  initializeCards();
  const decks=originals();
  assert.equal(hash(decks.source),SOURCE);
  assert.equal(hash(decks.candidate),REFERENCE);
  const prior=new Map([
    ['AGENT8_ACTOR_QUICK_BALL_DEV',process.env.AGENT8_ACTOR_QUICK_BALL_DEV],
    ['AGENT41_OWNER_TERMINAL_ARBITRATION_DEV',
      process.env.AGENT41_OWNER_TERMINAL_ARBITRATION_DEV]
  ]);
  const groups=[];
  try {
    process.env.AGENT8_ACTOR_QUICK_BALL_DEV='false';
    process.env.AGENT41_OWNER_TERMINAL_ARBITRATION_DEV='false';
    for(const seed of SEEDS){
      for(const rank3Seat of [0,1]){
        const armSpecs=[
          {name:'recipient-control',paid:false},
          {name:'recipient-plus-paid',paid:true},
          {name:'recipient-control-repeat',paid:false}
        ];
        const arms=armSpecs.map(spec=>runArm({
          seed,rank3Seat,id:[seed,rank3Seat,spec.name].join(':'),
          mode:spec.paid?'bilateral-multi-basic-retreat':'control',
          energyRecipient:true,captureTargets:true
        },decks));
        groups.push({seed,rank3Seat,arms});
      }
    }
  }finally{
    for(const [key,value] of prior){
      if(value===undefined)delete process.env[key];
      else process.env[key]=value;
    }
  }
  const pairs=groups.map(g=>pairGroup(g.arms));
  const outcome=pairs.map((g,i)=>{
    const middle=groups[i].arms[1];
    const audit=middle.genericAudit;
    const nativeRetreatReceipts=(middle.nativeAcceptedTargetSidecar?.events??[])
      .map(paidRetreatReceipt).filter(Boolean);
    const seatCount=audit?.originalPassesBySeat??null;
    return {
      seed:g.seed,rank3Seat:g.rank3Seat,
      strictPhysicalAndARepeatMatched:
        g.classification==='paired-development',
      status:g.classification,
      knownFullDeal:g.control.initialPhysicalDeal,
      sourceDeal:g.control.originalRank3Deal,
      opponentWinnerControl:g.control.winner,
      opponentWinnerTreatment:g.treatment.winner,
      rank1AttacksControl:g.control.rank1NativeAttacks,
      rank1AttacksTreatment:g.treatment.rank1NativeAttacks,
      nominalMultiBasicOffersBySeat:audit?.nominalOffersBySeat??null,
      originalPassesBySeat:seatCount,
      typedRetreatsBySeat:audit?.chosenTypedRetreatsBySeat??null,
      proposerActions:audit?.proposedActions??[],
      nativeObservedRetreats:nativeRetreatReceipts,
      selectiveTargetComparison:g.selectivePhysicalTargetDifference,
      sourceOriginal60Hash:SOURCE,referenceOriginal60Hash:REFERENCE,
      competitivelyQualifiedGames:0
    };
  });
  return {
    version:VERSION,pinnedTwinleaf:PIN,
    sourceOriginal60Hash:SOURCE,referenceOriginal60Hash:REFERENCE,
    previouslyUsedSeeds:SEEDS,originalGroups:8,expectedArms:24,
    actualArms:groups.flatMap(g=>g.arms).length,
    allGroupsStrictlyPaired:pairs.every(g=>
      g.classification==='paired-development'),
    treatment:'same symmetric owner-public Basic recipient on all arms; only middle arm adds existing same algorithm both-seat multi-Basic paid retreat',
    summary:summarizeGroups(pairs),
    paidOpportunityTotals:outcome.reduce((a,g)=>({
      originalPasses:a.originalPasses+(g.originalPassesBySeat??[]).reduce((x,y)=>x+y,0),
      nominalOffers:a.nominalOffers+(g.nominalMultiBasicOffersBySeat??[]).reduce((x,y)=>x+y,0),
      typedProposals:a.typedProposals+(g.typedRetreatsBySeat??[]).reduce((x,y)=>x+y,0),
      confirmedPhysicalPaidBasicRetreats:a.confirmedPhysicalPaidBasicRetreats+
        g.nativeObservedRetreats.filter(x=>x.observedNativePaidBasicRetreat).length
    }),{originalPasses:0,nominalOffers:0,typedProposals:0,
      confirmedPhysicalPaidBasicRetreats:0}),
    groups:outcome,sourcePairs:pairs,
    rawArms:groups.flatMap(g=>g.arms),
    competitivelyQualifiedGames:0,
    limitations:['Retrospective correlated historical seed/seat groups',
      'Even native physical Energy-card payment is not complete paper legality',
      'A win in the pinned developmental bot is not a paper Expanded tournament win',
      'Only two source ranks, unqualified 25-minute clock and three missing originals']
  };
}
if(require.main===module){
  try{
    const result=run();
    process.stdout.write(JSON.stringify(result)+'\n');
    if(!result.allGroupsStrictlyPaired||result.actualArms!==24)process.exitCode=1;
  }catch(error){
    process.stdout.write(JSON.stringify({
      version:VERSION,status:'runner-failure',
      error:String(error?.stack??error).slice(0,7000),
      competitivelyQualifiedGames:0
    })+'\n');
    process.exitCode=1;
  }
}
module.exports={VERSION,paidRetreatReceipt,run};
