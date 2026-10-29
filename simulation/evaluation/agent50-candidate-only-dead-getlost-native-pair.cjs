'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createHash}=require('node:crypto');
const {plannedTrials,REGISTRATION_BLOB}=
  require('./agent41-prospective-canonical-scout.cjs');
const {runDevelopment}=
  require('./agent41-bilateral-v2-development.cjs');

const SCHEMA='agent50-candidate-only-known-dead-getlost-original-32-paired-v1';
const ROOT=path.resolve(__dirname,'../..');
const REGISTRATION='results/aichi-2026/registrations/agent41-prospective-canonical-32-20261029.json';

/** @param {object} row @returns {object} */
function arm(row){
  const roots=row.rootActionLedger??[];
  const candidate=row.candidateSeat??(row.trial.candidateSlot==='A'?0:1);
  const source=row.sourceSeat??(1-candidate);
  const attacks=seat=>roots.filter(r=>r.action==='AttackAction'&&
    r.playerSlot===seat);
  const candidateAttacks=attacks(candidate);
  const sourceAttacks=attacks(source);
  const prompts=row.nativePromptChoices?.events??[];
  const zeroSourceDiscard=prompts.filter(e=>
    e.actorSeat===candidate&&e.kind==='ChooseCardsPrompt'&&
    e.sourceZone==='discard'&&e.sourcePlayerSlot===source&&
    e.sourceZoneCardCountBefore===0&&e.turn>0).length;
  return {trialId:row.trial.id,rank:row.trial.rank,candidateId:row.trial.candidateId,
    seed:row.trial.seed,sourceSeat:source,candidateSeat:candidate,
    sourceDealFingerprint:row.sourceDealFingerprint??null,
    fullPhysicalDealFingerprint:row.fullPhysicalDealFingerprint??null,
    candidateDeckFingerprint:row.candidateDeckFingerprint??null,
    sourceDeckFingerprint:row.sourceDeckFingerprint??null,
    actualStarterSeat:row.actualStarterSeat??null,
    gameError:row.status??null,finished:row.finished===true,
    winner:row.finished===true?row.winner:null,
    actionCount:row.actionCount??null,turns:row.turns??null,
    sourceAttacks:sourceAttacks.length,candidateAttacks:candidateAttacks.length,
    getLost:candidateAttacks.filter(a=>a.attack==='Get Lost').length,
    mindShock:candidateAttacks.filter(a=>a.attack==='Mind Shock').length,
    zeroSourceDiscardPrompts:zeroSourceDiscard,
    nativeRootLedgerSha256:row.rootActionLedgerSha256??null,
    nativeRoots:roots};
}
/**
 * Pair each actual game including censored and native failed games.
 * Different policy effects can modify future legal action trajectories; any
 * outcome differences are retrospective development effects, not match rates.
 * @param {object[]} controlRows
 * @param {object[]} treatmentRows
 * @returns {object}
 */
function paired(controlRows,treatmentRows){
  assert.equal(controlRows.length,32);
  assert.equal(treatmentRows.length,32);
  const controls=new Map(controlRows.map(r=>[r.trial.id,arm(r)]));
  const treatments=new Map(treatmentRows.map(r=>[r.trial.id,arm(r)]));
  assert.equal(controls.size,32);assert.equal(treatments.size,32);
  const fields=['seed','sourceSeat','candidateSeat','sourceDealFingerprint',
    'fullPhysicalDealFingerprint','sourceDeckFingerprint',
    'candidateDeckFingerprint','actualStarterSeat'];
  const pairs=[];
  for(const [id,a] of controls){
    const b=treatments.get(id);
    assert.ok(b,'Missing treatment arm for '+id);
    const differentFixedInputs=fields.filter(k=>a[k]!==b[k]);
    const firstDifference=(()=>{
      const len=Math.min(a.nativeRoots.length,b.nativeRoots.length);
      for(let i=0;i<len;i++){
        if(JSON.stringify(a.nativeRoots[i])!==JSON.stringify(b.nativeRoots[i]))
          return {index:i,control:a.nativeRoots[i],treatment:b.nativeRoots[i]};
      }
      return a.nativeRoots.length!==b.nativeRoots.length?
        {index:len,control:a.nativeRoots[len]??null,
          treatment:b.nativeRoots[len]??null}:null;
    })();
    const {nativeRoots:ar,...before}=a;
    const {nativeRoots:br,...after}=b;
    pairs.push({trialId:id,rank:a.rank,candidateId:a.candidateId,
      differentFixedInputs,identicalInputEvidence:differentFixedInputs.length===0,
      original:before,knownDeadCandidate:after,
      firstNativeRootDivergence:firstDifference,
      bothNativeTerminals:a.finished&&b.finished,
      comparisonQualifiedForCompetition:false});
  }
  const aggregate=group=>{
    const original=group.map(p=>p.original);
    const treatment=group.map(p=>p.knownDeadCandidate);
    const totals=items=>({
      getLost:items.reduce((n,r)=>n+r.getLost,0),
      mindShock:items.reduce((n,r)=>n+r.mindShock,0),
      zeroSourceDiscardPrompts:items.reduce((n,r)=>
        n+r.zeroSourceDiscardPrompts,0),
      sourceAttacks:items.reduce((n,r)=>n+r.sourceAttacks,0),
      nativeTerminals:items.filter(r=>r.finished).length,
      capped:items.filter(r=>r.finished!==true&&r.gameError===null).length,
      engineErrors:items.filter(r=>r.gameError!==null).length
    });
    return {arms:group.length,original:totals(original),
      candidateOnlyKnownDead:totals(treatment),
      changedRootLedgers:group.filter(p=>p.original.nativeRootLedgerSha256!==
        p.knownDeadCandidate.nativeRootLedgerSha256).length,
      matchedPhysicalInputs:group.filter(p=>p.identicalInputEvidence).length,
      firstDivergenceCandidateSeat:group.filter(p=>
        p.firstNativeRootDivergence?.control?.playerSlot===
          p.original.candidateSeat).length};
  };
  const byRank={};
  for(const rank of [6,11])byRank[rank]=aggregate(pairs.filter(p=>p.rank===rank));
  return {schema:SCHEMA,attempts:64,originalRegistration:REGISTRATION,
    originalRegistrationBlobSha1:REGISTRATION_BLOB,
    total:aggregate(pairs),byRank,pairs,
    competitiveQualifiedGames:0,
    caveat:'All treatments reuse previously observed original 32 seeds. This is a retrospective owner-only known-dead root policy experiment, not prospective competitive evidence.'};
}

/** @returns {object} */
function run(){
  const bytes=fs.readFileSync(path.join(ROOT,REGISTRATION));
  const blob=createHash('sha1').update('blob '+bytes.length+'\0')
    .update(bytes).digest('hex');
  assert.equal(blob,REGISTRATION_BLOB,'Original immutable seed plan changed');
  const plan=JSON.parse(bytes.toString('utf8'));
  const trials=plannedTrials(plan);
  const shared={...plan.frozenRunOptions,registeredTrials:trials,
    registeredFrameName:REGISTRATION};
  assert.equal(shared.actorOnlyComposition,true);
  const control=runDevelopment(shared);
  const treatment=runDevelopment({...shared,candidateOnlyKnownDeadRoot:true});
  const output=paired(control.rows,treatment.rows);
  output.original77EmptyDiscardReproduced=
    output.total.original.zeroSourceDiscardPrompts===77;
  output.allPhysicalInputsMatched=
    output.total.matchedPhysicalInputs===32;
  return output;
}

if(require.main===module){
  const result=run();
  process.stdout.write(JSON.stringify(result,null,2)+'\n');
}
module.exports={SCHEMA,arm,paired,run};
