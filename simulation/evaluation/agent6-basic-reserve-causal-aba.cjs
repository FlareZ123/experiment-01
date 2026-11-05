'use strict';
const assert=require('node:assert/strict');
const {createHash}=require('node:crypto');
const {isDeepStrictEqual}=require('node:util');
const {initializeCards}=require('../twinleaf/headless.cjs');
const {originals}=require('./agent41-rank3-arbitration-original-store.cjs');
const {runArm}=require('./agent2-fresh-rank1-rank3-multibasic-panel.cjs');
const {SEEDS,verifiedBasicRecipient}=
  require('./agent6-rank1-rank3-energy-recipient-aba.cjs');
const {paidRetreatReceipt}=
  require('./agent6-recipient-plus-paid-retreat-aba.cjs');
const VERSION='agent6-basic-paid-reserve-causal-32-armed-development-v1';
const PIN='a9905a76a6c4103ba4b6cb9a49e86bad795c5c05';
const SOURCE='72c61d594eee5ee1d593b738af627c3ab8f3a38d1a5f29695ff39c8c09c2264f';
const REFERENCE='de8b454ce520b9f6b8db9395c5bea4e8c09cd3958b8e78159f704ba5aec71311';
const sha=x=>createHash('sha256').update(JSON.stringify(x)).digest('hex');
const MODES=[
  {name:'original',reserve:false,pivot:false},
  {name:'reserve',reserve:true,pivot:false},
  {name:'reserve-paid',reserve:true,pivot:true},
  {name:'original-repeat',reserve:false,pivot:false}
];

/** @param {object} arm Original native Store game. */
function basicAttachments(arm){
  return (arm.nativeAcceptedTargetSidecar?.events??[])
    .map(verifiedBasicRecipient).filter(Boolean);
}
/** @param {object} arm Original native Store game. */
function physicalRetreats(arm){
  return (arm.nativeAcceptedTargetSidecar?.events??[])
    .map(paidRetreatReceipt).filter(Boolean);
}
/**
 * First differing physically witnessed Basic recipient or printing.
 * @param {object} original Control native arm.
 * @param {object} treatment Treatment native arm.
 */
function firstBasicDifference(original,treatment){
  const a=basicAttachments(original),b=basicAttachments(treatment);
  let first=null;
  for(let index=0;index<Math.max(a.length,b.length);index++){
    if(!isDeepStrictEqual(a[index]??null,b[index]??null)){
      first={index,control:a[index]??null,treatment:b[index]??null};
      break;
    }
  }
  return {
    physicalBasicControl:a.length,physicalBasicTreatment:b.length,
    firstDifference:first
  };
}
/** @returns {object} 8 historical source/seat games, each four arms. */
function run(){
  initializeCards();
  const cards=originals();
  assert.equal(sha(cards.source),SOURCE);
  assert.equal(sha(cards.candidate),REFERENCE);
  const vars=['AGENT8_ACTOR_QUICK_BALL_DEV',
    'AGENT41_OWNER_TERMINAL_ARBITRATION_DEV'];
  const previous=vars.map(key=>[key,process.env[key]]);
  const groups=[];
  try{
    for(const key of vars)process.env[key]='false';
    for(const seed of SEEDS){
      for(const rank3Seat of [0,1]){
        const arms=MODES.map(spec=>runArm({
          seed,rank3Seat,id:[seed,rank3Seat,spec.name].join(':'),
          mode:spec.pivot?'reserve-paid-pivot':'control',
          energyRecipient:true,reserveRecipient:spec.reserve,
          captureTargets:true
        },cards));
        const [a,b,c,d]=arms;
        const sameStart=arms.every(x=>
          x.status==='native-terminal'&&
          x.originalSource60Hash===SOURCE&&
          x.originalReference60Hash===REFERENCE&&
          x.fullDealSha256!==null&&
          x.fullDealSha256===a.fullDealSha256&&
          x.rank3DealSha256!==null&&
          x.rank3DealSha256===a.rank3DealSha256&&
          x.nativeVerifiedStartByDraw===true&&
          x.actualFirstSeat===a.actualFirstSeat);
        const exactControl=sameStart&&
          a.rootLedgerSha256===d.rootLedgerSha256&&
          isDeepStrictEqual(a.rootActionLedger,d.rootActionLedger)&&
          a.nativeAcceptedTargetSidecar?.sha256===
            d.nativeAcceptedTargetSidecar?.sha256&&
          sha(a.finalPublicBoard)===sha(d.finalPublicBoard)&&
          a.winner===d.winner&&a.endReason===d.endReason&&
          a.actions===d.actions&&a.globalTurns===d.globalTurns;
        groups.push({seed,rank3Seat,sameStart,exactControl,
          firstReserveDifference:firstBasicDifference(a,b),
          firstPaidDifference:firstBasicDifference(a,c),
          nativePaidPhysicalRetreats:physicalRetreats(c),
          nativeResults:arms.map(x=>({
            id:x.id,status:x.status,winner:x.winner,
            rootCount:x.rootCount,rank1Attacks:x.rank1AttackCount,
            rank3Attacks:x.rank3AttackCount,
            rank1RetreatRoots:x.rank1RetreatRoots,
            rank3RetreatRoots:x.rank3RetreatRoots,
            retargets:x.reserveRecipientAudit?.proposals??[],
            paidProposals:x.genericAudit?.proposals??[],
            error:x.error??null
          })),
          rawArms:arms,competitivelyQualifiedGames:0});
      }
    }
  }finally{
    for(const [key,value] of previous){
      if(value===undefined)delete process.env[key];
      else process.env[key]=value;
    }
  }
  const arms=groups.flatMap(g=>g.rawArms);
  const totals={
    nativeTerminals:arms.filter(x=>x.status==='native-terminal').length,
    nativeErrors:arms.filter(x=>x.status==='native-error').length,
    nativeCaps:arms.filter(x=>x.status==='native-cap').length,
    reserveOnlyOffers:groups.reduce((n,g)=>
      n+(g.rawArms[1].reserveRecipientAudit?.proposals.length??0),0),
    reservePaidOffers:groups.reduce((n,g)=>
      n+(g.rawArms[2].reserveRecipientAudit?.proposals.length??0),0),
    paidTyped:groups.reduce((n,g)=>n+
      (g.rawArms[2].genericAudit?.typedRetreatsBySeat??[])
        .reduce((a,b)=>a+b,0),0),
    nativePaidPhysicalRetreats:groups.reduce((n,g)=>
      n+g.nativePaidPhysicalRetreats.length,0),
    nativeChangedWinnersReserve:groups.filter(g=>
      g.rawArms[0].winner!==g.rawArms[1].winner).length,
    nativeChangedWinnersReservePaid:groups.filter(g=>
      g.rawArms[0].winner!==g.rawArms[2].winner).length
  };
  return {
    schema:VERSION,pinnedTwinleaf:PIN,
    originalSource60Sha256:SOURCE,reference60Sha256:REFERENCE,
    historicalSeeds:SEEDS,rank3Seats:[0,1],modes:MODES,
    actualNativeArms:arms.length,expectedNativeArms:32,
    allPhysicalStartsPaired:groups.every(g=>g.sameStart),
    allRepeatedControlsExact:groups.every(g=>g.exactControl),
    totals,groups,competitivelyQualifiedGames:0,
    limitations:'Small retrospective 2-original-rank native games; no full-paper 25-minute adjudication, qualified games, or 99.5% claim.'
  };
}
if(require.main===module){
  try{
    const x=run();
    process.stderr.write('AGENT6_RESERVE_CAUSAL_SUMMARY '+
      JSON.stringify({
        schema:x.schema,actualNativeArms:x.actualNativeArms,
        allPhysicalStartsPaired:x.allPhysicalStartsPaired,
        allRepeatedControlsExact:x.allRepeatedControlsExact,
        totals:x.totals,
        groups:x.groups.map(g=>({
          seed:g.seed,rank3Seat:g.rank3Seat,
          sameStart:g.sameStart,exactControl:g.exactControl,
          firstReserveDifference:g.firstReserveDifference,
          firstPaidDifference:g.firstPaidDifference,
          nativePaidPhysicalRetreats:g.nativePaidPhysicalRetreats,
          nativeResults:g.nativeResults
        })),
        competitivelyQualifiedGames:0
      })+'\n');
    process.stdout.write(JSON.stringify(x)+'\n');
    if(!x.allPhysicalStartsPaired||!x.allRepeatedControlsExact)
      process.exitCode=1;
  }catch(error){
    process.stderr.write('AGENT6_RESERVE_CAUSAL_ERROR '+
      String(error?.stack??error).slice(0,6500)+'\n');
    process.stdout.write(JSON.stringify({
      schema:VERSION,status:'runner-error',
      error:String(error?.stack??error).slice(0,6500),
      competitivelyQualifiedGames:0
    })+'\n');
    process.exitCode=1;
  }
}
module.exports={VERSION,MODES,basicAttachments,
  physicalRetreats,firstBasicDifference,run};
