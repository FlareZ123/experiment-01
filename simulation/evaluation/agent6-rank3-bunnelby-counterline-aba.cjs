'use strict';
const {initializeCards}=require('../twinleaf/headless.cjs');
const {originals}=require('./agent41-rank3-arbitration-original-store.cjs');
const {runArm}=require('./agent2-fresh-rank1-rank3-multibasic-panel.cjs');
const VERSION='agent6-original-rank3-bunnelby-counterline-aba-v1';
const PIN='a9905a76a6c4103ba4b6cb9a49e86bad795c5c05';
const SEED=3792360798;
const RANK3_SEAT=0;
const EXPECTED_SOURCE_60='72c61d594eee5ee1d593b738af627c3ab8f3a38d1a5f29695ff39c8c09c2264f';
const EXPECTED_REFERENCE_60='de8b454ce520b9f6b8db9395c5bea4e8c09cd3958b8e78159f704ba5aec71311';
const EXPECTED_FULL_DEAL='02bb2b2e4b28d1cfc9e030e70c38f389fa37948e8c3dceb34472133f4753582a';
const EXPECTED_SOURCE_DEAL='37ed042b42966fd5c2232d28d1e458131e0ba9e0febf14cb3ad2961710c70c46';
const EXPECTED_CONTROL_ROOT='5acd02e493800a041b5dedf4a9efa6a0a2de44eece25efc5424f5dda749c3acd';
function run(){
  initializeCards();
  const cards=originals();
  const common={seed:SEED,rank3Seat:RANK3_SEAT,
    energyRecipient:true,captureTargets:true,captureAttackTrace:true};
  const arms=[
    runArm({...common,id:'A-control',mode:'bilateral-skyliner-free-retreat'},cards),
    runArm({...common,id:'B-deckout-paid-retreat',
      mode:'bilateral-skyliner-free-retreat-deckout-paid',
      deckOutRetreat:true},cards),
    runArm({...common,id:'A-prime-control-repeat',
      mode:'bilateral-skyliner-free-retreat'},cards)
  ];
  const [a,b,c]=arms;
  const dealMatched=arms.every(x=>x.status!=='native-error'&&
    x.fullDealSha256===EXPECTED_FULL_DEAL&&
    x.rank3DealSha256===EXPECTED_SOURCE_DEAL&&
    x.actualFirstSeat===RANK3_SEAT&&
    x.originalSource60Hash===EXPECTED_SOURCE_60&&
    x.originalReference60Hash===EXPECTED_REFERENCE_60);
  const controlsRepeatExactly=a.status===c.status&&a.winner===c.winner&&
    a.actions===c.actions&&a.globalTurns===c.globalTurns&&
    a.rootLedgerSha256===c.rootLedgerSha256;
  const historicalControlExact=a.rootLedgerSha256===EXPECTED_CONTROL_ROOT;
  const summarize=x=>({
    id:x.id,status:x.status,winner:x.winner??null,
    actions:x.actions??null,globalTurns:x.globalTurns??null,
    rootLedgerSha256:x.rootLedgerSha256??null,
    fullDealSha256:x.fullDealSha256??null,
    rank3DealSha256:x.rank3DealSha256??null,
    originalSource60Hash:x.originalSource60Hash??null,
    originalReference60Hash:x.originalReference60Hash??null,
    deckOutRetreatAudit:x.deckOutRetreatAudit??null,
    genericAudit:x.genericAudit??null
  });
  return {
    version:VERSION,pinnedNativeRevision:PIN,
    registration:'results/aichi-2026/registrations/agent6-rank3-bunnelby-counterline-aba-20261106.md',
    seed:SEED,rank3Seat:RANK3_SEAT,
    expectedControlRoot:EXPECTED_CONTROL_ROOT,
    dealMatched,controlsRepeatExactly,historicalControlExact,
    summaries:arms.map(summarize),arms,
    competitivelyQualifiedGames:0,independentSampleGames:0,
    noFieldWinRateInference:true
  };
}
if(require.main===module){
  const data=run();
  process.stdout.write(JSON.stringify(data,null,2)+'\n');
  if(!data.dealMatched||!data.controlsRepeatExactly||
     !data.historicalControlExact)process.exitCode=1;
}
module.exports={VERSION,run};
