'use strict';
const assert=require('node:assert/strict');
const path=require('node:path');
const {run,writeLocked}=
  require('./agent5-rank6-paid-dce-thunder-volt-v10.cjs');
const {withSourceAfterDceThunderVolt}=
  require('../twinleaf/agent5-source-paid-dce-thunder-volt.cjs');
const {withSourceTurn4PalaceBook,TARGET,ITEM,VERSION:HOOK_VERSION}=
  require('../twinleaf/agent9-rank6-turn4-palace-book-hook.cjs');

const VERSION='agent9-rank6-original-v10-turn4-book-native-aba-v1';

/** @param {object} episode Exact Agent5 native v10 receipt. */
function treatmentTapes(episode){
  return new Map(episode.archives.treatment.attempts.map(a=>[
    a.id,a.publicRootActions.map(root=>({
      actionOrdinal:root.actionOrdinal,
      playerSlot:root.playerSlot,turnBefore:root.turnBefore,
      action:root.action,card:root.card??null,
      attack:root.attack??null
    }))
  ]));
}

/**
 * Retrospective exact original native A/B/A for a single owner-held Item:
 * 8 frozen source group trials in each arm, no new deck or seed.
 * @param {{native?:Function,sourceHook?:Function,bookHook?:Function}} [deps]
 * @returns {object} Original control-repeat receipts and selected physical Item result.
 */
function runPalaceAba(deps={}){
  const native=deps.native??run;
  const source=deps.sourceHook??withSourceAfterDceThunderVolt;
  const book=deps.bookHook??withSourceTurn4PalaceBook;
  const control=native();
  const treatment=native({hook:(execute,{trialId})=>{
    if(trialId!==TARGET)return source(execute,{trialId});
    let selected=null;
    try{
      const witnessed=source(()=>{
        selected=book(execute,{trialId});
        return selected.result;
      },{trialId});
      return {result:witnessed.result,audit:{...witnessed.audit,
        palaceBookAudit:selected?.audit??null}};
    }catch(error){
      if(error&&typeof error==='object')
        error.agent9PalaceBookCompositeAudit={
          source:error.agent5AfterDceThunderVoltAudit??null,
          book:selected?.audit??error.agent9Turn4PalaceBookAudit??null
        };
      throw error;
    }
  }});
  const repeat=native();
  const A=treatmentTapes(control),B=treatmentTapes(treatment),C=treatmentTapes(repeat);
  const controlRepeat=Array.from(A.keys()).every(id=>
    JSON.stringify(A.get(id))===JSON.stringify(C.get(id)));
  const sevenUntouched=Array.from(A.keys()).filter(id=>id!==TARGET)
    .every(id=>JSON.stringify(A.get(id))===JSON.stringify(B.get(id)));
  const before=A.get(TARGET),after=B.get(TARGET);
  const prior=before.find(a=>a.turnBefore===4&&a.playerSlot===0&&
    a.action==='PassTurnAction');
  const selectedRoot=after.find(a=>a.actionOrdinal===prior?.actionOrdinal);
  const earliest=prior?.actionOrdinal??null;
  const priorPrefix=before.filter(a=>a.actionOrdinal<earliest);
  const nextPrefix=after.filter(a=>a.actionOrdinal<earliest);
  const preservedBefore=earliest!==null&&
    JSON.stringify(priorPrefix)===JSON.stringify(nextPrefix);
  const row=treatment.rows.find(r=>r.id===TARGET);
  const bookAudit=row?.nativeSourceOwnerLineAudit?.palaceBookAudit??null;
  const originalControlsSamePhysicalDeal=control.rows.every(r=>{
    const c=repeat.rows.find(x=>x.id===r.id);
    const b=treatment.rows.find(x=>x.id===r.id);
    return c&&b&&r.sameOriginalAndCandidateFullPhysicalDeal&&
      c.sameOriginalAndCandidateFullPhysicalDeal&&
      b.sameOriginalAndCandidateFullPhysicalDeal&&
      r.originalAcceptedPublicRootTapeSha256===
        c.originalAcceptedPublicRootTapeSha256&&
      r.originalAcceptedPublicRootTapeSha256===
        b.originalAcceptedPublicRootTapeSha256;
  });
  assert.ok(controlRepeat,'control-repeat root tape must match');
  assert.ok(sevenUntouched,'all seven other source treatment root tapes must match');
  assert.ok(originalControlsSamePhysicalDeal,
    'v9 original physical control snapshots diverged');
  assert.ok(preservedBefore,'same game root prefix before Book must match');
  assert.equal(prior.action,'PassTurnAction');
  const declaredItem=selectedRoot?.action==='PlayCardAction'&&
    selectedRoot?.card===ITEM;
  return {
    version:VERSION,hookVersion:HOOK_VERSION,
    originalTrialCountPerArm:8,actualOriginalAttempts:24,
    originalSourceOriginalCandidate60sFixed:true,
    original48RootCapFixed:true,
    physicalDealsAndUnchangedV9ControlMatched:originalControlsSamePhysicalDeal,
    repeatedV10AcceptedRootTapesIdentical:controlRepeat,
    sevenNonTargetTreatmentTapesUnchanged:sevenUntouched,
    originalRootBeforeItemSame:preservedBefore,
    originalPassTurnRoot:prior,
    treatmentItemRoot:selectedRoot,
    treatmentProposedNativeItemAtRegisteredPass:declaredItem,
    selectedBookAudit:bookAudit,
    targetStatuses:{control:control.rows.find(r=>r.id===TARGET).treatmentDisposition,
      treatment:row.treatmentDisposition,
      repeat:repeat.rows.find(r=>r.id===TARGET).treatmentDisposition},
    targetPostDivergenceControl:
      before.filter(a=>a.actionOrdinal>=earliest).slice(0,20),
    targetPostDivergenceTreatment:
      after.filter(a=>a.actionOrdinal>=earliest).slice(0,20),
    targetPostDivergenceControlRepeat:
      C.get(TARGET).filter(a=>a.actionOrdinal>=earliest).slice(0,20),
    sourceAttackNativeReceipts:row.treatmentSourceAttackSettlement,
    competentlyQualifiedGames:0,
    estimatedWinRate:null,paperFullyValidated:false,
    limitations:[
      'One retrospective original trial, no independent generalization',
      'A printed Item play may fail native legality or fail physical effects',
      'Other competing owner choices, opponent skill and clock unqualified',
      'No change to selected Issue25 v4 or field-wide 60'
    ]
  };
}
if(require.main===module){
  try{
    const out=runPalaceAba();
    assert.ok(process.env.AGENT9_PALACE_BOOK_DIR,'Output directory required');
    writeLocked(path.join(process.env.AGENT9_PALACE_BOOK_DIR,
      'agent9-source-palace-book-aba-native.json'),out);
    process.stdout.write(JSON.stringify({
      version:VERSION,controlRepeat:out.repeatedV10AcceptedRootTapesIdentical,
      otherSevenSame:out.sevenNonTargetTreatmentTapesUnchanged,
      sameBefore:out.originalRootBeforeItemSame,
      originalPass:out.originalPassTurnRoot,
      selectedRoot:out.treatmentItemRoot,
      bookAudit:out.selectedBookAudit,
      status:out.targetStatuses,competentlyQualifiedGames:0
    })+'\n');
  }catch(error){
    process.stdout.write(JSON.stringify({version:VERSION,
      error:String(error?.stack??error).slice(0,8000),
      competentlyQualifiedGames:0})+'\n');
    process.exitCode=1;
  }
}
module.exports={VERSION,treatmentTapes,runPalaceAba};
