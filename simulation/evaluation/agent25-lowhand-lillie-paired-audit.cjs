'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const SCHEMA='agent25-lowhand-lillie-same-deal-bilateral-audit-v1';

/**
 * Compare the four existing historical Store scenarios, including failed arms.
 * The paired records are development diagnostics only.
 * @param {object} control Four-arm original-policy result.
 * @param {object} treatment Four-arm opt-in result.
 * @returns {object} All-pair audit, including unsuccessful and absent exposure.
 */
function auditLowHandLilliePair(control,treatment){
  for(const x of [control,treatment]){
    assert.equal(x.attempted,4);
    assert.equal(x.rows.length,4);
    assert.equal(x.competitiveQualifiedGames,0);
    assert.equal(x.actorOnlyCompositionOptIn,true);
  }
  const base=new Map(control.rows.map(row=>[row.trial.id,row]));
  assert.equal(base.size,4,'Duplicate control trial ids');
  assert.equal(new Set(treatment.rows.map(row=>row.trial.id)).size,4,
    'Duplicate treatment trial ids');
  const rows=treatment.rows.map(row=>{
    const original=base.get(row.trial.id);
    assert.ok(original,'Missing comparison arm');
    const root=row.actorOnlyDecisionCoverage?.detailedComponentAudits?.root;
    const root0=original.actorOnlyDecisionCoverage?.detailedComponentAudits?.root;
    if(root)assert.equal(root.lowHandLillieRootOptIn,true);
    if(root0)assert.equal(root0.lowHandLillieRootOptIn,false);
    const proposals=root?.typedIntentCounts?.['play-lowhand-lillie']??0;
    const physical=root?.nativePhysicalConfirmedByIntent?.['play-lowhand-lillie']??0;
    const unconfirmed=root?.nativePhysicalUnconfirmedByIntent?.['play-lowhand-lillie']??0;
    const supporterEvents=(row.paperSupporterDiscipline?.nativeSupporterEvents??[])
      .filter(event=>event.name==="Lillie's Determination M1L");
    return {
      id:row.trial.id,rank:row.trial.rank,
      sourceDealMatch:original.sourceDealFingerprint!==undefined&&
        original.sourceDealFingerprint===row.sourceDealFingerprint,
      firstPlayerMatch:original.actualStarterSeat!==undefined&&
        original.actualStarterSeat===row.actualStarterSeat,
      sourceDealControl:original.sourceDealFingerprint??null,
      sourceDealTreatment:row.sourceDealFingerprint??null,
      controlStatus:original.status??(original.finished?'terminal':'censored'),
      treatmentStatus:row.status??(row.finished?'terminal':'censored'),
      controlRoots:original.rootActionCount??null,
      treatmentRoots:row.rootActionCount??null,
      controlRootDigest:original.rootActionLedgerSha256??null,
      treatmentRootDigest:row.rootActionLedgerSha256??null,
      lowHandLillie:{proposals,physical,unconfirmed,
        nativeSettled:supporterEvents.filter(e=>e.settled===true).length,
        nativeEvents:supporterEvents},
      originalWinner:original.finished?original.winner:null,
      treatmentWinner:row.finished?row.winner:null,
      originalError:original.error??null,
      treatmentError:row.error??null,
      competitiveQualified:false
    };
  });
  return {
    schema:SCHEMA,pairs:rows.length,competitiveQualifiedGames:0,
    matchingSourceDeals:rows.filter(row=>row.sourceDealMatch).length,
    matchingFirstPlayers:rows.filter(row=>row.firstPlayerMatch).length,
    proposed:rows.reduce((n,row)=>n+row.lowHandLillie.proposals,0),
    physicallyConfirmed:rows.reduce((n,row)=>n+row.lowHandLillie.physical,0),
    nativeSettled:rows.reduce((n,row)=>n+row.lowHandLillie.nativeSettled,0),
    caveat:'Retrospective, weak-policy, uncalibrated and incomplete-field games',
    rows
  };
}
if(require.main===module){
  const [controlPath,treatmentPath]=process.argv.slice(2);
  assert.ok(controlPath&&treatmentPath);
  const control=JSON.parse(fs.readFileSync(controlPath,'utf8'));
  const treatment=JSON.parse(fs.readFileSync(treatmentPath,'utf8'));
  process.stdout.write(JSON.stringify(auditLowHandLilliePair(control,treatment),null,2)+'\n');
}
module.exports={SCHEMA,auditLowHandLilliePair};
