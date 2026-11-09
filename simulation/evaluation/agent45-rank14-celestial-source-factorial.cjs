'use strict';

const assert=require('node:assert/strict');
const registration=require(
  '../../results/aichi-2026/registrations/agent32-prospective-29rank-116native-20261109.json');
const {runNativeBatch}=require('./agent32-fresh-perfection-field.cjs');
const {withPaperCelestialRoarEnergy}=require(
  '../twinleaf/agent47-celestial-roar-paper-energy-hook.cjs');

const VERSION='agent45-rank14-immutable-source-paper-roar-pivot-factorial-v1';
const ORIGINAL_ID='14:3029:B:new-moon-lockbreaker-v1';

/**
 * Run a retrospective source-mechanics challenge on the exact rank14
 * original 60 and frozen physical deal, with unchanged candidate 60 and
 * shared bilateral policy. Paper-correct Celestial Roar is an existing,
 * reversible hook and is not a claim of skilled source attack selection.
 * @param {{batch?:Function,correctedRoar?:Function,emit?:boolean}} [deps]
 * @returns {object}
 */
function run(deps={}){
  const original=registration.groups.find(g=>g.id===ORIGINAL_ID);
  assert.ok(original&&original.rank===14&&original.candidateSlot==='B');
  const registered=[...registration.groups.slice(0,3),original]
    .map(x=>({...x}));
  assert.equal(new Set(registered.map(x=>x.id)).size,4);
  const execute=deps.batch??runNativeBatch;
  const paper=deps.correctedRoar??withPaperCelestialRoarEnergy;
  const common={
    registeredTrials:registered,
    registeredFrameName:registration.schema,
    nativeRootActionLimit:registration.nativeRootLimit,
    vipAfterPass:true,vipPreferMewtwoDonor:true
  };
  const arms=[];
  for(const candidatePivot of [false,true]){
    for(const sourceCorrectedCelestialRoar of [false,true]){
      const play=()=>execute(true,undefined,{
        ...common,perfectionTransition:candidatePivot
      });
      const wrapper=sourceCorrectedCelestialRoar?
        paper(play):{result:play(),audit:null};
      const raw=wrapper.result.selected.rawDevelopment.rows;
      assert.equal(raw.length,4);
      const row=raw.find(x=>x.trial?.id===ORIGINAL_ID);
      assert.ok(row);
      const roots=row.rootActionLedger??[];
      const source=roots.filter(r=>r.playerSlot===0);
      const attacking=source.filter(r=>r.action==='AttackAction');
      const sourceAttacks=attacking.map(r=>({
        turn:r.turnBefore,attack:r.attack??null,
        rootActionOrdinal:r.actionOrdinal??null
      }));
      arms.push({
        candidatePivot,sourceCorrectedCelestialRoar,
        nativeFinished:row.finished===true,
        nativeWinnerSeat:row.winner??null,
        nativeError:row.error?String(row.error).slice(0,850):null,
        nativeRootActionCount:roots.length,
        remainingPrizes:row.finalPrizes??null,
        originalFullPhysicalDealHash:row.fullPhysicalDealFingerprint??null,
        originalSourceDealHash:row.sourceDealFingerprint??null,
        nativeTargetLinkage:row.nativeAcceptedTargetSidecar?.rootOrdinalLinked??false,
        originalSourceRootActions:source.length,
        originalSourcePassRoots:source.filter(r=>r.action==='PassTurnAction').length,
        originalSourceAttacks:sourceAttacks,
        sourceCelestialRoarAttackCount:attacking.filter(r=>
          r.attack==='Celestial Roar').length,
        paperCorrectedRoarAudit:wrapper.audit,
        competitivePaperGamesQualified:0
      });
    }
  }
  const hashesComplete=arms.every(a=>
    typeof a.originalFullPhysicalDealHash==='string'&&
    typeof a.originalSourceDealHash==='string');
  const physicalParity=hashesComplete&&
    arms.every(a=>a.originalFullPhysicalDealHash===
      arms[0].originalFullPhysicalDealHash&&
      a.originalSourceDealHash===arms[0].originalSourceDealHash);
  const allTargetsLinked=arms.every(a=>a.nativeTargetLinkage===true);
  const naturalTerminalArms=arms.filter(a=>a.nativeFinished&&a.nativeError===null).length;
  const paperHookCalled=arms.filter(a=>
    a.paperCorrectedRoarAudit?.replacedAttackResolutions>0).length;
  const result={version:VERSION,originalRegistration:registration.schema,
    originalRank:14,originalArchetype:'Regidrago',
    frozenOriginalId:ORIGINAL_ID,seed:original.seed,
    printedSixtiesUnchanged:true,enginePin:registration.enginePin,
    comparison:'2x2: existing physical source paper-correct Celestial Roar energy/custody vs unchanged original native reducer; candidate donor-funded Perfection pivot off/on',
    retrospectiveOnly:true,registeredControlRows:registered.length,
    physicalParity,allTargetsLinked,naturalTerminalArms,
    paperHookCalled,arms,competitiveGamesQualified:0};
  if(deps.emit!==false)process.stdout.write(
    'AGENT45_RANK14_SOURCE_CELESTIAL_FACTORIAL '+
    JSON.stringify(result)+'\n');
  if(!physicalParity||!allTargetsLinked)process.exitCode=1;
  return result;
}

if(require.main===module)run();
module.exports={VERSION,ORIGINAL_ID,run};
