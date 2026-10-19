'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {planAichi}=require('./aichi-pilot.cjs');
const {developmentTrials,executeDevelopment}=
  require('./agent41-bilateral-v2-development.cjs');
const {loadNewMoonCandidate}=
  require('../../scripts/aichi-new-moon-candidate.cjs');
const {withOwnerVisiblePerfectionPassBridge}=
  require('../twinleaf/owner-visible-perfection-pass-bridge.cjs');

const root=path.resolve(__dirname,'../..');

/**
 * Preserve historical rank6 and rank11 60s verbatim. The common candidate
 * algorithm from Agent41 is unchanged in the baseline and treated branches.
 * The experimental Pass-only Perfection owner policy wraps BOTH candidate
 * slots with the identical code but naturally activates only when Mewtwo is
 * Active. Never use these known historical streams as prospective games.
 */
function developmentCandidates(){
  const roster=JSON.parse(fs.readFileSync(path.join(root,
    'results/aichi-2026/full-decklists.json'),'utf8'));
  const reference=roster.decks.find(deck=>deck.rank===1);
  assert.ok(reference);
  const defs=[
    ['champion-reference',{label:'champion-reference',cards:reference.cards}],
    ['new-moon-lockbreaker-v1',{label:'new-moon-lockbreaker-v1',
      cards:loadNewMoonCandidate().cards}]
  ];
  return new Map(defs.map(([id,deck])=>[id,{
    plan:planAichi(deck,{
      allowEquivalentBasicEnergies:true,
      allowBasicEnergyMirrorPrintings:true,allowJapanesePromoHooks:true
    })
  }]));
}

/** @param {object} row @returns {object} Small auditable outcome envelope. */
function summarize(row){
  if(!row)return {status:'not-executed',qualified:false};
  if(row.status==='engine-error')
    return {status:'engine-error',error:row.error,qualified:false};
  return {
    status:row.finished?'engine-terminal':'action-cap',
    actualStarterSeat:row.actualStarterSeat,
    verifiedFirstTurn:row.verifiedFirstTurn,
    sourceDealFingerprint:row.sourceDealFingerprint,
    sourceFirstOwnHandSha256:row.sourceFirstOwnHandSha256,
    rootActionLedgerSha256:row.rootActionLedgerSha256,
    candidateAttackDeclarations:row.attackDeclarations.candidate,
    sourceAttackDeclarations:row.attackDeclarations.source,
    candidatePostChoicePassProbe:row.candidatePostChoicePassProbe,
    firstSettledPublicAttack:row.firstSettledPublicAttack,
    actions:row.actionCount,turns:row.turns,
    engineWinner:row.finished?row.winner:null,
    finalPrizes:row.finalPrizes,
    qualified:false
  };
}

/** @returns {object} Retrospective development, never held-out v2. */
function run(){
  const prepared=developmentCandidates();
  const trials=developmentTrials().filter(row=>
    row.candidateId==='new-moon-lockbreaker-v1');
  assert.equal(trials.length,2);
  const rows=[];
  for(const trial of trials){
    const candidateSeat=trial.candidateSlot==='A'?0:1;
    let control,treated,bridgeAudit=null,exception=null;
    try{
      control=executeDevelopment(trial,prepared);
      const bridge=withOwnerVisiblePerfectionPassBridge(candidateSeat,
        ()=>executeDevelopment(trial,prepared));
      treated=bridge.result;
      bridgeAudit=bridge.policyAudit;
    }catch(error){
      exception=String(error?.stack??error);
    }
    const valid=Boolean(control&&treated&&
      control.status!=='engine-error'&&treated.status!=='engine-error');
    const sameInitialPhysicalSource=valid&&
      control.sourceDealFingerprint===treated.sourceDealFingerprint;
    const sameTrueFirst=valid&&control.actualStarterSeat===
      treated.actualStarterSeat&&control.verifiedFirstTurn===true&&
      treated.verifiedFirstTurn===true;
    rows.push({
      id:trial.id,rank:trial.rank,seed:trial.seed,
      candidateSeat,registeredStatus:'HISTORICAL DEVELOPMENT FIXTURE',
      control:summarize(control),bridge:summarize(treated),
      commonCandidatePolicy:control?.policyVersion??null,
      bridgeAudit,exception,
      sameInitialPhysicalSource,sameTrueFirst,
      competitiveGameQualified:false
    });
  }
  return {
    schema:'agent35-owner-visible-perfection-pass-bridge-historical-v0',
    sourceRegistration:'Previously inspected Agent41 v1 rank6/rank11 fixtures',
    additionalRegisteredAttempts:0,retrospectiveArms:rows.length,
    rows,comparativeDeckStrengthCertified:false,
    paperRulesCertified:false,clockCertified:false,
    qualifiedCompetitiveGames:0,
    caveat:'A branch of existing known-source deals that changes candidate policy. Not the Agent41 prospective bilateral-v2 registration, a card-swap causal estimate or a human-competence win-rate result.'
  };
}
if(require.main===module)process.stdout.write(JSON.stringify(run(),null,2)+'\n');
module.exports={developmentCandidates,summarize,run};
