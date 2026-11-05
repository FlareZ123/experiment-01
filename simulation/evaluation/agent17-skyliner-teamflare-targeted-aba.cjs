'use strict';

const assert=require('node:assert/strict');
const {initializeCards}=require('../twinleaf/headless.cjs');
const {originals}=require('./agent41-rank3-arbitration-original-store.cjs');
const {runArm}=require('./agent2-fresh-rank1-rank3-multibasic-panel.cjs');
const {TRIAL,EXPECTED}=require('./agent17-skyliner-reply-owner-pass-native.cjs');

const VERSION='agent17-skyliner-turn59-source-teamflare-A-B-A-v1';

/** @param {object} arm Registered same-deal native Store result. */
function turn59(arm){
  const p=arm.ownerPassFrontierAudit?.events??[];
  return p.find(row=>row.globalTurn===59&&row.actorSeat===0)??null;
}

/** Reproduce original B before and after a single selected Team Flare root. */
function run() {
  initializeCards();
  const cards=originals();
  const variants=[
    {armName:'original-B-control',targetedTeamFlareNative:false},
    {armName:'turn59-Team-Flare-counterfactual',targetedTeamFlareNative:true},
    {armName:'original-B-control-repeat',targetedTeamFlareNative:false}
  ];
  const arms=variants.map(spec=>runArm({
    ...TRIAL,id:TRIAL.id+':'+spec.armName,
    targetedTeamFlareNative:spec.targetedTeamFlareNative
  },cards));
  const [a,b,c]=arms;
  const allSourcePhysical=arms.every(arm=>
    arm.fullDealSha256===EXPECTED.fullDeal&&
    arm.rank3DealSha256===EXPECTED.sourceDeal);
  const controlsExact= a.status==='native-terminal'&&
    c.status==='native-terminal'&&
    a.rootLedgerSha256===EXPECTED.rootLedger&&
    c.rootLedgerSha256===EXPECTED.rootLedger&&
    a.winner===1&&c.winner===1;
  const originalPassIndex=a.rootActionLedger?.findIndex(row=>
    row.actionOrdinal===227&&row.playerSlot===0&&
    row.action==='PassTurnAction')??-1;
  const frozenPrefix=originalPassIndex>=0&&
    b.rootActionLedger?.slice(0,originalPassIndex).every((row,index)=>
      JSON.stringify(row)===JSON.stringify(a.rootActionLedger[index]))&&
    b.rootActionLedger[originalPassIndex]?.actionOrdinal===227;
  const newRoot=b.rootActionLedger?.[originalPassIndex]??null;
  const playedAtTarget=newRoot?.action==='PlayCardAction'&&
    newRoot?.playerSlot===0&&
    newRoot?.turnBefore===59&&
    newRoot?.card==='Team Flare Grunt';
  const physicalAccepted=b.nativeAcceptedTargetSidecar?.events?.find(row=>
    row.action==='PlayCardAction'&&row.turnBefore===59&&
    row.playerSlot===0&&row.declared?.ownerHandPrinting==='Team Flare Grunt XY'&&
    row.storeAccepted===true)??null;
  const baselinePass=turn59(a),interventionPass=turn59(b);
  const originalActive=baselinePass?.opponentPublic.active;
  const intervenedActive=interventionPass?.opponentPublic.active;
  const energyBefore=originalActive?.energies??null;
  const energyAfter=intervenedActive?.energies??null;
  const sameActive=originalActive?.printing===intervenedActive?.printing;
  const energyCardsRemoved=sameActive&&energyBefore&&energyAfter?
    energyBefore.length-energyAfter.length:null;
  const output={
    version:VERSION,seed:TRIAL.seed,sourceSeat:0,referenceSeat:1,
    exactBaselineSourceDeal:allSourcePhysical,
    repeatedOriginalRootLedger:controlsExact,
    unchangedRootsBeforeNativeAction:!!frozenPrefix,
    originalPassActionOrdinal:227,
    interventionRoot:newRoot,
    nativeTypedTeamFlareRoot:!!playedAtTarget,
    nativeAcceptedPhysicalTeamFlare:physicalAccepted!==null,
    physicalTeamFlareReceipt:physicalAccepted,
    actualOpponentActiveBefore:originalActive?.printing??null,
    actualOpponentActiveAfter:intervenedActive?.printing??null,
    energyCardCountBefore:energyBefore?.length??null,
    energyCardCountAfter:energyAfter?.length??null,
    actualEnergyCardsRemoved:energyCardsRemoved,
    supportiveQuotaAfter:interventionPass?.actorTurnResources.supporterPlayedTurn??null,
    controlWinner:a.winner??null,interventionWinner:b.winner??null,
    repeatWinner:c.winner??null,
    controlRank1Attacks:a.rank1AttackCount??null,
    interventionRank1Attacks:b.rank1AttackCount??null,
    repeatRank1Attacks:c.rank1AttackCount??null,
    arms:arms.map(arm=>({
      name:arm.id,status:arm.status,error:arm.error??null,
      winner:arm.winner??null,endReason:arm.endReason??null,
      nativeTerminal:arm.nativeTerminal??null,
      actions:arm.actions??null,globalTurns:arm.globalTurns??null,
      originalSourceDeal:arm.rank3DealSha256??null,
      fullPhysicalDeal:arm.fullDealSha256??null,
      nativeRootLedger:arm.rootLedgerSha256??null,
      rootActionLedger:arm.rootActionLedger??null,
      sourceTurn59OwnerPass:turn59(arm),
      targetedPolicyReceipt:arm.targetedTeamFlareAudit??null,
      nativeTarget:arm.nativeAcceptedTargetSidecar?.events?.filter(row=>
        row.turnBefore===59&&row.playerSlot===0)??null
    })),
    competitiveGamesQualified:0,
    scope:'Retrospective source-rank3 original B single selected turn59 root, 3 native attempts, no qualified opponents or tournament clock'
  };
  const valid=allSourcePhysical&&controlsExact&&frozenPrefix&&
    playedAtTarget&&physicalAccepted!==null&&
    b.status==='native-terminal'&&
    energyCardsRemoved===1;
  output.nativeInterventionValidated=!!valid;
  return output;
}

if(require.main===module){
  try{
    const output=run();
    process.stdout.write(JSON.stringify(output)+'\n');
    if(!output.nativeInterventionValidated)process.exitCode=1;
  }catch(error){
    process.stdout.write(JSON.stringify({
      version:VERSION,status:'native-runner-failure',
      error:String(error?.stack??error).slice(0,5000),
      competitiveGamesQualified:0})+'\n');
    process.exitCode=1;
  }
}
module.exports={VERSION,run,turn59};
