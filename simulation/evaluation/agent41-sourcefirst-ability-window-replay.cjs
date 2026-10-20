'use strict';

const assert=require('node:assert/strict');
const {isDeepStrictEqual}=require('node:util');
const fs=require('node:fs');
const path=require('node:path');
const {executeDevelopment}=require('./agent41-bilateral-v2-development.cjs');
const {planAichi}=require('./aichi-pilot.cjs');
const {loadNewMoonCandidate}=
  require('../../scripts/aichi-new-moon-candidate.cjs');

const SEED=482443328;
const FROZEN_ROOT='d1f8b09a618a1dd43746a218ec25aad97d7d7042ba2129eab9577c2a7861b520';
const FROZEN_SOURCE_DEAL='60b66e9e74e6e2914d92ba2c03dce8671b372e624f4f50797a6022a3eb955e31';

/**
 * Historical fixture selected in prior Agent9 source-success replay,
 * intentionally not a prospective seed or conditional win-rate sample.
 */
function prepare(){
  const roster=JSON.parse(fs.readFileSync(path.resolve(__dirname,
    '../../results/aichi-2026/full-decklists.json'),'utf8'));
  const rank1=roster.decks.find(deck=>deck.rank===1);
  assert.ok(rank1);
  const opts={allowEquivalentBasicEnergies:true,
    allowBasicEnergyMirrorPrintings:true,allowJapanesePromoHooks:true};
  return new Map([
    ['champion-reference',{label:'champion-reference',cards:rank1.cards}],
    ['new-moon-lockbreaker-v1',{label:'new-moon-lockbreaker-v1',
      cards:loadNewMoonCandidate().cards}]
  ].map(([id,candidate])=>[id,{plan:planAichi(candidate,opts)}]));
}

function run(){
  const trial={rank:11,repeat:2,seed:SEED,candidateSlot:'B',
    candidateId:'new-moon-lockbreaker-v1',
    id:'11:sourcefirst-mechanic:2:B:new-moon-lockbreaker-v1'};
  const candidates=prepare();
  const options={compressorPayload:true,lateCompressorPayload:true};
  const execute=extra=>{
    try{return executeDevelopment(trial,candidates,{...options,...extra});}
    catch(error){return {status:'runner-exception',
      error:String(error?.stack??error).slice(0,2400)};}
  };
  const original=execute({});
  const watched=execute({garbotoxinWindow:true});
  const failures=[];
  const requireCheck=(condition,message)=>{
    if(!condition)failures.push(message);
  };
  for(const [name,row] of [['baseline',original],['observer',watched]]){
    requireCheck(!row.error,name+' Store execution error: '+(row.error??''));
    requireCheck(row.sourceActuallyFirst===true,name+' source was not actually first');
    requireCheck(row.sourceAudit?.completed===true,
      name+' source Tool-Garbodor line did not complete');
    requireCheck(row.sourceAudit?.opportunityTurn===1,
      name+' source Tool-Garbodor line did not finish on first turn');
    requireCheck(row.sourceDealFingerprint===FROZEN_SOURCE_DEAL,
      name+' source physical deal drifted from prior archive');
    requireCheck(row.rootActionLedgerSha256===FROZEN_ROOT,
      name+' root action history changed from prior selected deal');
  }
  const comparable=['sourceDealFingerprint','actualStarterSeat',
    'rootActionLedgerSha256','actionCount','turns','endReason',
    'finished','winner','finalPrizes','finalBoard','attackDeclarations',
    'candidateAttackSettlement','sourceAudit','firstCandidatePostSourceRoot'];
  for(const key of comparable){
    requireCheck(isDeepStrictEqual(watched[key],original[key]),
      'Read-only observation altered game field '+key);
  }
  const first=watched.firstCandidatePostSourceRoot??null;
  requireCheck(first?.action==='PlayCardAction'&&first?.card==='Field Blower'&&
    first?.turnBefore===2,'Original first candidate response was not turn-two Field Blower');
  const power=watched.garbotoxinWindowAudit??null;
  requireCheck(Boolean(power?.before&&power?.after),
    'Missing genuine Store before/after Tool-removal power checks');
  const before=power?.before??null,after=power?.after??null;
  requireCheck(before?.candidateActive==='Lunatone OBF'&&
    after?.candidateActive==='Lunatone OBF',
    'Same real Lunatone did not remain Active across removal');
  requireCheck(before?.candidatePrintedPowerNames?.includes('New Moon')&&
    after?.candidatePrintedPowerNames?.includes('New Moon'),
    'Power check did not concern the printed New Moon Ability');
  requireCheck(before?.sourceGarbodorHasTool===true &&
    after?.sourceGarbodorHasTool===false,
    'Source Tool did not transition from attached to removed');
  requireCheck(before?.candidateGenericAbilityBlocked===true &&
    after?.candidateGenericAbilityBlocked===false,
    'Native PowerEffect did not confirm suppression then restored Ability');
  return {
    schema:'agent41-authentic-sourcefirst-ability-window-equivalence-v1',
    evidenceType:'historical seed selected by previous source-success replay',
    candidate:trial.candidateId,seed:SEED,opponentRank:11,
    originalSourceArtifact:'GitHub Actions 39346205829 / artifact 12231322666',
    originalRootSha256:original.rootActionLedgerSha256??null,
    observerRootSha256:watched.rootActionLedgerSha256??null,
    sourceActuallyFirst:watched.sourceActuallyFirst??null,
    sourceLockLineCompleted:watched.sourceAudit?.completed??null,
    firstCandidateResponse:first,
    sameSourceDeal:original.sourceDealFingerprint===FROZEN_SOURCE_DEAL &&
      watched.sourceDealFingerprint===FROZEN_SOURCE_DEAL,
    sameActualPlayAndPublicEffects:comparable.every(key=>
      isDeepStrictEqual(watched[key],original[key])),
    powerWindow:power,
    candidateAttackSettlement:watched.candidateAttackSettlement??null,
    baselineExecution:{status:original.status??'completed',
      error:original.error??null,actions:original.actionCount??null,
      endReason:original.endReason??null},
    observedExecution:{status:watched.status??'completed',
      error:watched.error??null,actions:watched.actionCount??null,
      endReason:watched.endReason??null},
    validation:{passed:failures.length===0,failures},
    qualification:{
      ownerInformationSetSafe:false,paperRulesVerified:false,
      competitiveGameQualified:false,prospectiveStrengthTrial:false,
      paperClockCalibrated:false
    }
  };
}
if(require.main===module){
  let result;
  try{result=run();}
  catch(error){
    result={schema:'agent41-authentic-sourcefirst-ability-window-equivalence-v1',
      status:'preparation-or-runner-exception',
      error:String(error?.stack??error).slice(0,2400),
      validation:{passed:false,failures:['preparation-or-runner-exception']},
      qualification:{competitiveGameQualified:false}};
  }
  process.stdout.write(JSON.stringify(result,null,2)+'\n');
  if(!result.validation.passed)process.exitCode=1;
}
module.exports={SEED,FROZEN_ROOT,FROZEN_SOURCE_DEAL,run};
