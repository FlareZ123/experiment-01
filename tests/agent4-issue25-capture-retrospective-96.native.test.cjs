'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {runCaptureRetrospective96,archiveReceipt,ROOT_LIMIT,VERSION}=
  require('../simulation/evaluation/agent4-issue25-capture-retrospective-96.cjs');

test('existing v6 eight contexts with explicitly retrospective 96-root Capture followthrough',()=>{
  const r=runCaptureRetrospective96();
  const source=r.treatment.find(row=>
    row.id==='6:100:A:new-moon-lockbreaker-v1');
  const control=r.control.find(row=>row.id===source.id);
  assert.ok(source&&control);
  const captureIndex=source.roots.findIndex(root=>
    root.action==='PlayCardAction'&&root.card==='Capture Energy RCL');
  const afterCapture=captureIndex<0?[]:source.roots.slice(captureIndex+1);
  const firstSourceAttack=afterCapture.find(root=>
    root.seat===source.sourceSeat&&root.action==='AttackAction')??null;
  const firstOpponentNonprompt=afterCapture.find(root=>
    root.seat!==source.sourceSeat&&root.action!=='ResolvePromptAction')??null;
  const saved=process.env.AGENT4_CAPTURE_RETRO96_DIR?
    archiveReceipt(r,process.env.AGENT4_CAPTURE_RETRO96_DIR):null;
  const summary={
    schema:VERSION,actualExecutedCap:ROOT_LIMIT,
    historicalV6RootCap:r.originalRegisteredRootCap,
    exactOriginalEight:r.exactRegisteredIDs,
    sameOriginalAndFullDeal:r.matchingFullInitialDealAndOriginalSourceDeal,
    rootStatuses:r.pairing,
    reportedNativeManifestCap:r.reportedSelectedManifestRootLimit,
    captureAudit:r.captureAudit?{
      acceptedCaptureAttachments:
        r.captureAudit.acceptedCaptureAttachments,
      matchedOwnerDeckPrompts:r.captureAudit.matchedOwnerDeckPrompts,
      acceptedOwnerSearches:r.captureAudit.acceptedOwnerSearches,
      sourceBasicPhysicallyBenched:
        r.captureAudit.sourceBasicPhysicallyBenched
    }:null,
    rescuedOriginalSource:{
      id:source.id,sourceSeat:source.sourceSeat,
      lastPublicRoots:source.roots.slice(-18),
      captureRoot:source.roots[captureIndex]??null,
      firstPostCaptureSourceAttack:firstSourceAttack,
      firstPostCaptureOpponentNonprompt:firstOpponentNonprompt,
      finalNativeStatus:source.status
    },
    noPaperGames:r.competitiveGamesQualified,
    archived:saved
  };
  console.log('AGENT4_CAPTURE_RETRO96',JSON.stringify(summary));
  assert.equal(r.schema,VERSION);
  assert.equal(r.actualExecutedRootCap,96);
  assert.equal(r.originalRegisteredRootCap,48);
  assert.equal(r.control.length,8);
  assert.equal(r.treatment.length,8);
  assert.equal(r.pairing.length,8);
  assert.ok(r.matchingFullInitialDealAndOriginalSourceDeal);
  assert.equal(r.captureAudit?.acceptedOwnerSearches>=1,true);
  assert.ok(source.roots.length>0,
    'An aborted original source trial must retain accepted native public roots');
  assert.ok(captureIndex>=0,
    'Retrospective source abort evidence must preserve the accepted Capture Energy root');
  assert.equal(r.competitiveGamesQualified,0);
  assert.equal(r.winRateClaim,null);
});
