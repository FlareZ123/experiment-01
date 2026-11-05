'use strict';

const assert=require('node:assert/strict');
const {createHash}=require('node:crypto');
const {initializeCards}=require('../twinleaf/headless.cjs');
const {originals}=require('./agent41-rank3-arbitration-original-store.cjs');
const {runArm}=require('./agent2-fresh-rank1-rank3-multibasic-panel.cjs');

const VERSION='agent2-skyliner-retrospective-readonly-attack-trace-v1';
const EXPECTED={
  originalRank3:'72c61d594eee5ee1d593b738af627c3ab8f3a38d1a5f29695ff39c8c09c2264f',
  originalRank1:'de8b454ce520b9f6b8db9395c5bea4e8c09cd3958b8e78159f704ba5aec71311',
  fullDeal:'02bb2b2e4b28d1cfc9e030e70c38f389fa37948e8c3dceb34472133f4753582a',
  rank3Deal:'37ed042b42966fd5c2232d28d1e458131e0ba9e0febf14cb3ad2961710c70c46',
  controlRoot:'f41dea697fa43e85a6278e8522692c1ca0cc0c11e1ee2b10b2c007e193640f0c',
  pivotRoot:'5acd02e493800a041b5dedf4a9efa6a0a2de44eece25efc5424f5dda749c3acd'
};
const digest=x=>createHash('sha256').update(JSON.stringify(x)).digest('hex');

/**
 * Retrospective, selected-case, read-only source attack transition replay.
 * Exactly three frozen A/B/A original matches; no general win-rate claim.
 * @returns {object} Real Store declarations, prompted settlements and controls.
 */
function run(){
  initializeCards();
  const cards=originals();
  assert.equal(digest(cards.source),EXPECTED.originalRank3);
  assert.equal(digest(cards.candidate),EXPECTED.originalRank1);
  const specs=[
    {name:'control',mode:'control',expectedRoot:EXPECTED.controlRoot},
    {name:'pivot',mode:'bilateral-skyliner-free-retreat',expectedRoot:EXPECTED.pivotRoot},
    {name:'control-repeat',mode:'control',expectedRoot:EXPECTED.controlRoot}
  ];
  const raw=specs.map(spec=>({
    ...spec,
    game:runArm({
      id:'agent2-skyliner-attacktrace-'+spec.name,
      seed:3792360798,rank3Seat:0,mode:spec.mode,
      energyRecipient:true,captureTargets:true,captureAttackTrace:true
    },cards)
  }));
  const rows=raw.map(({name,mode,expectedRoot,game})=>{
    const actual=game.rootLedgerSha256??null;
    const matched=game.status==='native-terminal'&&
      game.fullDealSha256===EXPECTED.fullDeal&&
      game.rank3DealSha256===EXPECTED.rank3Deal&&
      actual===expectedRoot;
    const transitions=game.nativePublicAttackTransitions??[];
    const declared=game.nativeAttackDeclarationTrace??[];
    return {
      name,mode,status:game.status,error:game.error??null,
      preservedRootAndPhysicalDeal:matched,
      expectedRootSha256:expectedRoot,actualRootSha256:actual,
      fullDealSha256:game.fullDealSha256??null,
      rank3DealSha256:game.rank3DealSha256??null,
      actualFirstSeat:game.actualFirstSeat??null,
      winner:game.winner??null,globalTurns:game.globalTurns??null,
      rank1AttackCount:game.rank1AttackCount??null,
      rank3AttackCount:game.rank3AttackCount??null,
      attackDeclarations:declared,
      actualPublicAttackTransitions:transitions,
      nativeTerminal:game.nativeTerminal??null,
      nativeRetreatStoreEvents:(game.nativeAcceptedTargetSidecar?.events??[])
        .filter(e=>e.action==='RetreatAction'),
      originalRootExcerpt:(game.rootActionLedger??[])
        .filter(e=>e.actionOrdinal>=211&&e.actionOrdinal<=244)
    };
  });
  const control=rows[0],pivot=rows[1],repeat=rows[2];
  const paired=rows.every(x=>x.preservedRootAndPhysicalDeal)&&
    control.actualRootSha256===repeat.actualRootSha256&&
    control.winner===repeat.winner&&
    control.winner===0&&pivot.winner===1&&
    pivot.rank1AttackCount===6&&control.rank1AttackCount===0;
  const lastPrize=pivot.nativeTerminal?.before?.players?.[1]?.prizesRemaining===1&&
    pivot.nativeTerminal?.after?.players?.[1]?.prizesRemaining===0&&
    pivot.nativeTerminal?.after?.winner===1;
  return {
    version:VERSION,selectedPositiveHistoricalCase:true,
    priorNativeExperiment:'CI42095956147-artifact13447532878',
    expected:EXPECTED,actualAttempts:raw.length,
    exactFrozenPhysicalRootReplays:paired,
    lastPrizeNativeTerminalPreserved:lastPrize,
    competitivelyQualifiedGames:0,
    rows,
    limitations:[
      'Selected positive historical group; no independent generalization',
      'Read-only native attack trace and physical snapshots are not full paper-rules certification',
      'Opponent policy and 25-minute paper match adjudication unqualified'
    ]
  };
}

if(require.main===module){
  try{
    const data=run();
    process.stdout.write(JSON.stringify(data)+'\n');
    if(!data.exactFrozenPhysicalRootReplays||
       !data.lastPrizeNativeTerminalPreserved)
      process.exitCode=1;
  }catch(error){
    process.stdout.write(JSON.stringify({
      version:VERSION,status:'audit-error',
      error:String(error?.stack??error).slice(0,6000),
      competitivelyQualifiedGames:0
    })+'\n');
    process.exitCode=1;
  }
}
module.exports={VERSION,EXPECTED,run};
