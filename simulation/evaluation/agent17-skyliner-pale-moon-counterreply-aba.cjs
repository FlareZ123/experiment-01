'use strict';

const {initializeCards}=require('../twinleaf/headless.cjs');
const {originals}=require('./agent41-rank3-arbitration-original-store.cjs');
const {runArm}=require('./agent2-fresh-rank1-rank3-multibasic-panel.cjs');
const {TRIAL,EXPECTED}=require('./agent17-skyliner-reply-owner-pass-native.cjs');
const {REFERENCE_ROOT}=require('./agent17-teamflare-rank1-postdenial-pass-owner.cjs');

const VERSION='agent17-original-source-TeamFlare-plus-rank1-PaleMoon-single-root-ABA-v1';

/** Frozen original source, real Store, controls retain the same flank root. */
function run(){
  initializeCards();
  const cards=originals();
  const names=['TeamFlare-control','rank1-PaleMoon-GX-counterreply',
    'TeamFlare-control-repeat'];
  const arms=names.map((name,index)=>runArm({
    ...TRIAL,id:TRIAL.id+':'+name,
    targetedTeamFlareNative:true,
    targetedPaleMoonNative:index===1,
    captureOwnerPassSnapshots:true,
    captureOwnerPassSeat:0,captureOwnerPassTurns:[59,61]
  },cards));
  const [a,b,c]=arms;
  const matchedPhysical=arms.every(arm=>
    arm.fullDealSha256===EXPECTED.fullDeal&&
    arm.rank3DealSha256===EXPECTED.sourceDeal);
  const matchedControls=a.status==='native-terminal'&&
    c.status==='native-terminal'&&
    a.rootLedgerSha256===REFERENCE_ROOT&&
    c.rootLedgerSha256===REFERENCE_ROOT&&
    a.winner===0&&c.winner===0;
  const passIndex=a.rootActionLedger?.findIndex(row=>
    row.playerSlot===1&&row.turnBefore===60&&
    row.actionOrdinal===232&&row.action==='PassTurnAction')??-1;
  const commonPrefix=passIndex>=0&&b.rootActionLedger?.slice(0,passIndex)
    .every((row,index)=>JSON.stringify(row)===
      JSON.stringify(a.rootActionLedger[index]))===true;
  const attack=b.rootActionLedger?.[passIndex]??null;
  const actualPaleMoon=commonPrefix&&
    attack?.actionOrdinal===232&&attack.playerSlot===1&&
    attack.turnBefore===60&&attack.action==='AttackAction'&&
    attack.attack==='Pale Moon-GX';
  const turn61=arm=>arm.ownerPassFrontierAudit?.events?.find(row=>
    row.globalTurn===61&&row.actorSeat===0)??null;
  const output={
    version:VERSION,
    originalSourceRank3Seat:0,originalReferenceRank1Seat:1,
    frozenOriginalSeed:TRIAL.seed,
    physicalDealParity:matchedPhysical,
    repeatedTeamFlareControlHistory:matchedControls,
    exactEarlierRootsBeforeSecondIntervention:commonPrefix,
    expectedOriginalRank1Turn60PassOrdinal:232,
    actualSecondInterventionRoot:attack,
    nativePaleMoonGXAttackRootAccepted:!!actualPaleMoon,
    controlNativeWinner:a.winner??null,
    counterreplyNativeWinner:b.winner??null,
    repeatNativeWinner:c.winner??null,
    controlRank1AttackCount:a.rank1AttackCount??null,
    counterreplyRank1AttackCount:b.rank1AttackCount??null,
    repeatRank1AttackCount:c.rank1AttackCount??null,
    controlRank1EndReason:a.endReason??null,
    counterreplyRank1EndReason:b.endReason??null,
    controller:a.targetedTeamFlareAudit,
    counterreplyOwnerSelector:b.targetedPaleMoonAudit??null,
    opponentNextTurnOwnerPublic:turn61(b),
    nativeCounterreplyTerminal:b.nativeTerminal??null,
    arms:arms.map(arm=>({
      id:arm.id,status:arm.status,error:arm.error??null,
      winner:arm.winner??null,globalTurns:arm.globalTurns??null,
      actions:arm.actions??null,rootSha256:arm.rootLedgerSha256??null,
      fullPhysicalDeal:arm.fullDealSha256??null,
      sourceDeal:arm.rank3DealSha256??null,
      rootActionLedger:arm.rootActionLedger??null,
      sourceTurn59Pass:arm.ownerPassFrontierAudit?.events?.find(x=>
        x.globalTurn===59)??null,
      sourceTurn61Pass:turn61(arm),
      newAttackSelector:arm.targetedPaleMoonAudit??null,
      terminal:arm.nativeTerminal??null
    })),
    competitivelyQualifiedGames:0,
    paperGxAndDelayedEffectQualified:false,
    scope:'one original retrospective native rank1 second reply, not independent sample or competitive match'
  };
  output.atLeastNativeProposalValidated=!!matchedPhysical&&
    !!matchedControls&&!!commonPrefix&&!!actualPaleMoon&&
    b.status==='native-terminal';
  return output;
}

if(require.main===module){
  try{
    const result=run();
    process.stdout.write(JSON.stringify(result)+'\n');
    if(!result.atLeastNativeProposalValidated)process.exitCode=1;
  }catch(error){
    process.stdout.write(JSON.stringify({
      version:VERSION,status:'native-counterreply-abort',
      error:String(error?.stack??error).slice(0,5000),
      competitivelyQualifiedGames:0
    })+'\n');
    process.exitCode=1;
  }
}
module.exports={VERSION,run};
