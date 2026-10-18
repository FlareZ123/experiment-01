'use strict';

const fs=require('node:fs');
const PROFILE='rank26-autonomous-cologne-pump-propagation-v3';

/**
 * Reconcile policy attempts with dispatched root actions for one exact rank26
 * opponent campaign trial. Null means channel unobserved, distinct from zero.
 * @param {object} r Campaign record.
 * @returns {object}
 */
function brief(r){
  if(r.rank!==26 || !['A','B'].includes(r.candidateEngineSlot))
    throw new TypeError('Need registered rank26 source and physical seat');
  const seat=r.candidateEngineSlot==='A'?1:0;
  const chosen=Array.isArray(r.decisionTrace)?
    r.decisionTrace.filter(x=>x.playerSlot===seat):null;
  const actual=(action,key,value)=>chosen?.filter(x=>
    x.action===action && (key===null || x[key]===value)).length??null;
  const selected=Array.isArray(r.rank26PropagationPolicy?.actions)?
    r.rank26PropagationPolicy.actions:null;
  const pumped=Array.isArray(r.rank26PumpPolicy?.actions)?
    r.rank26PumpPolicy.actions:null;
  const declared=Array.isArray(r.attackDeclarationTrace)?
    r.attackDeclarationTrace.filter(x=>x.playerSlot===seat):null;
  const played=r.cardsPlayedBySeat?.[seat]??null;
  const sourceFirst=r.firstTurn?.verifiedByDrawLog===true?
    r.firstTurn.firstTurnSlot===seat:null;
  const firstTurnBasicLightningPlays=sourceFirst===true&&chosen?
    chosen.filter(x=>x.turnBefore===1&&x.action==='PlayCardAction'&&
      x.card==='Lightning Energy').length:null;
  return {
    trialId:r.trialId,seed:r.seed,
    status:r.status,sourceSeat:seat,
    sourceFirstFromDrawLog:r.firstTurn?.verifiedByDrawLog===true?
      r.firstTurn.firstTurnSlot===seat:null,
    profile:r.observedResearchPolicyProfile,
    actualDecisions:chosen?.length??null,
    firstTurnBasicLightningPlays,
    crisisPunchEnergyBudgetDeadEnd:firstTurnBasicLightningPlays===null?
      null:firstTurnBasicLightningPlays>0,
    proposedRecoverySelections:selected?.length??null,
    proposedPumpSelections:pumped?.length??null,
    rootPropagationActions:actual('UseAbilityAction','ability','Propagation'),
    rootExeggcuteBenchActions:actual('PlayCardAction','card','Exeggcute'),
    rootDamagePumpActions:actual('PlayCardAction','card','Damage Pump'),
    rootCologneActions:actual('PlayCardAction','card','Canceling Cologne'),
    rootRiskyRuinsActions:actual('PlayCardAction','card','Risky Ruins'),
    rootCrisisPunchAttacks:actual('AttackAction','attack','Crisis Punch'),
    loggedAttackDeclarations:declared?.map(x=>({
      name:x.attackName,
      actionOrdinal:x.actionOrdinal,
      resolutionStatus:x.resolutionStatus??null
    }))??null,
    playedCardLedger:played?{
      'Exeggcute':played['Exeggcute']??0,
      'Damage Pump':played['Damage Pump']??0,
      'Risky Ruins':played['Risky Ruins']??0,
      'Canceling Cologne':played['Canceling Cologne']??0
    }:null,
    firstSourceTurnRootActions:chosen?.filter(x=>x.turnBefore===1)
      .slice(0,20).map(x=>({
        ordinal:x.actionOrdinal,action:x.action,
        card:x.card??null,ability:x.ability??null,attack:x.attack??null
      }))??null,
    terminalEngineResult:r.winner??null,
    observedFinish:r.observedFinished===true,
    competitiveGameQualified:false
  };
}

/** @param {object} report @returns {object} */
function summarize(report){
  if(report.expectedPolicyProfile!==PROFILE ||
     report.competitiveWinRateCertified!==false ||
     !Array.isArray(report.records) ||
     report.records.length!==report.selectedTrialIds?.length ||
     !report.records.every((r,i)=>
       r.trialId===report.selectedTrialIds[i]))
    throw new TypeError('Need complete source-locked unqualified v3 archive');
  return {
    schema:'rank26-v3-root-vs-proposal-source-brief-v1',
    profile:PROFILE,
    sourceTrials:report.records.length,
    records:report.records.map(brief),
    qualifiedCompetitiveGames:0,
    caveat:'Policy callbacks are hypothetical until matched to actual root actions; logged attack declaration is not verified attack resolution. Engine terminal events are not game-strength evidence.'
  };
}

if(require.main===module){
  const report=JSON.parse(fs.readFileSync(process.argv[2],'utf8'));
  process.stdout.write(JSON.stringify(summarize(report),null,2)+'\n');
}
module.exports={PROFILE,brief,summarize};
