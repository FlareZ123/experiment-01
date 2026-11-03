'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const {createHash}=require('node:crypto');
const {runMatch,initializeCards}=
  require('../twinleaf/headless.cjs');
const {planAichi}=require('./aichi-pilot.cjs');
const {deriveSlotSeeds}=
  require('../../scripts/aichi-decorrelated-seeds.cjs');
const {withPureNativeSupporterProposal}=
  require('../twinleaf/agent20-native-supporter-proposal-purity.cjs');
const {nativeFirstDifference,digest}=
  require('./agent7-funded-stadium-symmetric-eightgroup-native.cjs');
const REG=require('../../results/aichi-2026/registrations/agent20-native-supporter-proposal-purity-bilateral-8original-20261103.json');
const OUT=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
const native=name=>require(path.join(OUT,name));

/**
 * One registered original-sixty two-seat seed, with identical A/B/A inputs.
 * @param {object} group
 * @param {'A'|'B'} slot
 * @param {string[]} p
 * @param {string[]} o
 * @param {object} deps
 * @returns {object}
 */
function runGroup(group,slot,p,o,deps){
  const seat=slot==='A'?0:1;
  const request={
    deckA:seat===0?p:o,deckB:seat===1?p:o,
    seed:group.slots[slot],maxActions:REG.maxActions,
    strictPromptValidation:true,isolatePolicyRandomness:true,
    captureDecisionTrace:true,captureInitialFullPhysicalDeal:true,
    label:REG.schema+'-'+group.primaryRank+'v'+group.otherRank+
      '-'+group.kind+'-'+slot
  };
  const attempt=(id,fn)=>{
    try{return{id,status:'executed',payload:fn()};}
    catch(error){return{
      id,status:'native-error',
      error:String(error?.stack??error),
      purityAudit:error?.agent20SupporterPurityAudit??null
    };}
  };
  const c1=attempt('original-native-control',()=>runMatch(request));
  const t=attempt('both-seat-supporter-purity',()=>
    withPureNativeSupporterProposal(()=>runMatch(request),deps));
  const c2=attempt('original-native-repeat',()=>runMatch(request));
  const first=c1.payload;
  const other=t.payload?.result;
  const repeat=c2.payload;
  const observed=t.payload?.audit??t.purityAudit??null;
  const fingerprints=[first,other,repeat].map(game=>
    game?.initialFullPhysicalDealFingerprint?.digestSha256??null);
  const fullPhysicalParity=fingerprints.every(x=>
    x!==null&&x===fingerprints[0]);
  const repeatedControl=!!first&&!!repeat&&digest(first)===digest(repeat);
  const difference=nativeFirstDifference(first,other);
  const actionReport=game=>game?{
    finished:game.finished,winner:game.winner,actions:game.actions,
    fullDeal:game.initialFullPhysicalDealFingerprint,
    rootActionLedger:game.rootActionLedger,
    decisionTrace:game.decisionTrace,
    attackTrace:game.attackTrace
  }:null;
  return{
    ranks:[group.primaryRank,group.otherRank],
    seedKind:group.kind,slot,primarySeat:seat,seed:request.seed,
    attemptedNativeGames:3,
    statuses:[c1,t,c2].map(a=>({arm:a.id,status:a.status,
      error:a.error??null})),
    fullPhysicalParity,fingerprints,
    repeatedControl,
    firstActualRootDivergence:difference,
    purityAudit:observed,
    originalControl:actionReport(first),
    purityTreatment:actionReport(other),
    repeatedOriginalControl:actionReport(repeat),
    competitiveQualifiedGames:0
  };
}

/** @returns {object} */
function run(){
  initializeCards();
  const {Store}=native('game/store/store');
  const {SimpleTacticsAi}=native('simple-bot/simple-tactics-ai');
  const {PlaySupporterTactic}=
    native('simple-bot/simple-tactics/play-supporter-tactic');
  const {PlayCardAction}=native('game/store/actions/play-card-action');
  const {TrainerCard}=native('game/store/card/trainer-card');
  const {TrainerType}=native('game/store/card/card-types');
  const {GamePhase}=native('game/store/state/state');
  const deps={Store,SimpleTacticsAi,PlaySupporterTactic,
    PlayCardAction,TrainerCard,TrainerType,GamePhase};
  const rows=[];
  for(const group of REG.seedGroups){
    const primary=planAichi(group.primaryRank,{
      allowEquivalentBasicEnergies:true,allowJapanesePromoHooks:true
    });
    const p=primary.candidate.cards;
    const o=primary.opponents.find(x=>x.rank===group.otherRank)?.cards;
    assert.equal(p?.length,60);
    assert.equal(o?.length,60);
    assert.deepEqual(
      deriveSlotSeeds(group.seedBase,'pilot',group.primaryRank,group.repeat),
      group.slots
    );
    for(const slot of /** @type {const} */ (['A','B']))
      rows.push(runGroup(group,slot,p,o,deps));
  }
  assert.equal(rows.length,8);
  return{
    schema:REG.schema,registration:REG,
    enginePin:REG.enginePin,
    runHead:process.env.GITHUB_SHA??null,
    attemptedPhysicalGroups:rows.length,
    attemptedNativeGames:rows.length*3,
    groupsWithAnyNativeError:rows.filter(x=>
      x.statuses.some(a=>a.status==='native-error')).length,
    sameInitialFullDealGroups:rows.filter(x=>x.fullPhysicalParity).length,
    repeatedControlExactGroups:rows.filter(x=>x.repeatedControl).length,
    totalExactNativeProposerSideEffectsReversed:rows.reduce(
      (s,x)=>s+(x.purityAudit?.exactOwnTurnSideEffectsReversed??0),0),
    totalAcceptedNativeProposerSupporters:rows.reduce(
      (s,x)=>s+(x.purityAudit?.acceptedPreviouslyRestoredActions??0),0),
    totalRejectedNativeProposerSupporters:rows.reduce(
      (s,x)=>s+(x.purityAudit?.rejectedPreviouslyRestoredActions??0),0),
    groupsWithActualFirstRootDivergence:rows.filter(x=>
      x.firstActualRootDivergence?.firstControl&&
      x.firstActualRootDivergence?.firstTreatment).length,
    competitiveQualifiedGames:0,
    claimBoundary:'Both-seat native bot proposal purity developmental original 60s only; absolute paper win-rate, full Aichi field and opponent competence untested',
    rows
  };
}
if(require.main===module){
  const out=run();
  process.stdout.write(JSON.stringify(out,null,2)+'\n');
  process.stderr.write('AGENT20_SUPPORTER_PURITY_BILATERAL '+JSON.stringify({
    groups:out.attemptedPhysicalGroups,attempts:out.attemptedNativeGames,
    errors:out.groupsWithAnyNativeError,
    sameDeals:out.sameInitialFullDealGroups,
    repeatedControls:out.repeatedControlExactGroups,
    restored:out.totalExactNativeProposerSideEffectsReversed,
    accepted:out.totalAcceptedNativeProposerSupporters,
    rejected:out.totalRejectedNativeProposerSupporters,
    firstDivergences:out.groupsWithActualFirstRootDivergence,
    cases:out.rows.map(row=>({
      ranks:row.ranks,kind:row.seedKind,seat:row.primarySeat,
      restored:row.purityAudit?.exactOwnTurnSideEffectsReversed??null,
      accepted:row.purityAudit?.acceptedPreviouslyRestoredActions??null,
      firstRoot:row.firstActualRootDivergence,
      errorArms:row.statuses.filter(x=>x.error).map(x=>x.arm)
    }))
  })+'\n');
  if(out.repeatedControlExactGroups!==8)process.exitCode=1;
}
module.exports={run,runGroup};
