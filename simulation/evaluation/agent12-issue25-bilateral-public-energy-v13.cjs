'use strict';

const {runDevelopment} =
  require('./agent41-bilateral-v2-development.cjs');
const {runCanonicalVipIssue25V11} =
  require('./agent16-issue25-canonical-vip-v11.cjs');

const VERSION='agent12-issue25-v13-both-seat-public-context-energy-development';
const ENTRY='simulation/evaluation/agent12-issue25-bilateral-public-energy-v13.cjs';

/**
 * Add the existing actor-only, public Prize/printing-aware Special Energy
 * policy on BOTH physical seats to the v11 canonical VIP development runner.
 * Preserve v6's registered eight originals, source-independent common
 * resources, unchanged 60s and 48-root cap. No release qualification.
 *
 * @param {{runner?:Function,layers?:object,attackLayer?:Function}} [deps]
 * @returns {{manifest:object,diagnostic:object,rawDevelopment:object|null}}
 */
function runBilateralPublicEnergyIssue25V13(deps={}) {
  const run=deps.runner??runDevelopment;
  const executed=runCanonicalVipIssue25V11({
    ...deps,
    runner:options=>run({
      ...options,bilateralPublicContextSpecialEnergy:true
    })
  });
  const rows=executed.rawDevelopment?.rows??[];
  const evidence=rows.map(row=>{
    const sourceSeat=row.sourceSeat??
      row.nativeAbortProvenance?.sourceSeat??null;
    const root=row.actorOnlyDecisionCoverage?.detailedComponentAudits?.root??null;
    const ledger=row.rootActionLedger??
      row.nativePublicRootArchive?.rootActionLedger??
      row.nativeAbortEvidence?.rootActionLedger??null;
    const specialRootActions=Array.isArray(ledger)&&sourceSeat!==null?
      ledger.filter(event=>
        event.playerSlot===sourceSeat&&
        event.action==='PlayCardAction'&&
        /Energy$/.test(event.card??'')).map(event=>({
          actionOrdinal:event.actionOrdinal,
          globalTurn:event.turnBefore,
          card:event.card
        })):null;
    return {
      id:row.trial?.id??row.id??null,
      sourceSeat,
      actorPublicSpecialFlag:root?.publicContextSpecialEnergyOptIn??null,
      publicSpecialBothSeatProfile:
        row.bilateralPublicContextSpecialProfile??null,
      nativeSourceEnergyPlayRoots:specialRootActions,
      nativeSourceEnergyPlayRootCount:specialRootActions?.length??null,
      nativeSourceAttackRoots:Array.isArray(ledger)&&sourceSeat!==null?
        ledger.filter(event=>
          event.playerSlot===sourceSeat&&event.action==='AttackAction')
          .length:null,
      finished:row.finished===true,
      nativeStatus:row.status??'returned-unqualified'
    };
  });
  return {
    manifest:{
      ...executed.manifest,
      version:VERSION,policyEntryPoint:ENTRY,
      selectedBothSeatPublicSpecialEnergy:true,
      selectedExistingPublicSpecialAdapter:
        'agent17-public-context-special-energy',
      comparisonBaseline:
        'agent16-issue25-v11-canonical-actor-inner-vip-after-pass',
      sameEightPreexistingRegisteredSourceTrials:true,
      noNewOriginalDeckLists:true,
      noNewCandidateDeckLists:true,
      developmentOnly:true,
      releaseQualified:false,competitiveGamesQualified:0
    },
    diagnostic:{
      ...executed.diagnostic,
      schema:VERSION,publicSpecialSourceEvidence:evidence,
      nativeBothSeatPublicSpecialProfileRows:
        evidence.filter(row=>
          row.publicSpecialBothSeatProfile?.sharedPolicy===true).length,
      acceptedSourceEnergyRootsObserved:evidence.reduce((sum,row)=>
        sum+(row.nativeSourceEnergyPlayRootCount??0),0),
      sourceAttackRootsObserved:evidence.reduce((sum,row)=>
        sum+(row.nativeSourceAttackRoots??0),0),
      verdict:'FAIL-v13-development-source-opponent-competence-unqualified',
      competitiveGamesQualified:0
    },
    rawDevelopment:executed.rawDevelopment
  };
}
module.exports={VERSION,ENTRY,runBilateralPublicEnergyIssue25V13};
