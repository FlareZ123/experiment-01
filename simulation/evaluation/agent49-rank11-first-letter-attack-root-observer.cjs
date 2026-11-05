'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createHash}=require('node:crypto');
const {run:runLateLetter}=
  require('./agent35-rank11-letter-owner-late-v3.cjs');
const {run:runOneLetter}=
  require('./agent35-rank11-source-letter-pass37-fork.cjs');
const {runStewardInnermostPrizeV5}=
  require('./agent36-issue25-steward-innermost-prize-v5.cjs');
const registration=require('../../results/aichi-2026/registrations/agent49-rank11-first-letter-pass11-20261105.json');
const VERSION='agent49-rank11-firstturn-attack-custody-v1';

/**
 * Passive source-only accepted native root/attack observer, composed within
 * Agent35's existing live owner-only Letter search. Physical source/candidate
 * decks, decisions, initial deal and Store are never mutated by this observer.
 * @param {{lateRun?:Function,oneLetter?:Function,steward?:Function}} [deps]
 * @returns {object} Historical frozen deal and exact outcome, not a win rate.
 */
function run(deps={}){
  const prior=deps.lateRun??runLateLetter;
  const one=deps.oneLetter??runOneLetter;
  const steward=deps.steward??runStewardInnermostPrizeV5;
  let captured=null;
  function sourceWithCapture({registration:reg}){
    return one({registration:reg,runner:()=>{
      const raw=steward();
      assert.ok(Array.isArray(raw.rawDevelopment?.rows));
      assert.equal(raw.rawDevelopment.rows.length,8);
      const originals=raw.rawDevelopment.rows.filter(row=>
        (row.trial?.id??row.id)===reg.selectedOriginalId);
      assert.equal(originals.length,1);
      const row=originals[0];
      const ledger=row.rootActionLedger??
        row.nativeAbortEvidence?.rootActionLedger;
      assert.ok(Array.isArray(ledger));
      captured={
        sourceId:reg.selectedOriginalId,
        nativeSourceTurnRootActions:ledger.filter(root=>
          root.actionOrdinal>=reg.sourcePassRootOrdinal &&
          root.turnBefore===reg.sourceTurn &&
          root.playerSlot===reg.originalSourceSeat)
          .map(root=>({
            actionOrdinal:root.actionOrdinal,
            turnBefore:root.turnBefore,
            action:root.action,
            card:root.card??null,
            attack:root.attack??root.attackName??null,
            pendingPrompt:root.pendingPrompt??null
          })),
        beforeAndAfterSourceTurnAttackTransitions:
          (row.publicAttackTransitions??[]).filter(transition=>
            transition.triggerPlayerSlot===reg.originalSourceSeat &&
            transition.turnBefore===reg.sourceTurn).map(transition=>({
              turnBefore:transition.turnBefore,
              triggerAction:transition.triggerAction,
              declarations:(transition.declarations??[]).map(x=>({
                attackName:x.attackName??null
              })),
              sourceAttackSettled:Boolean(transition.settled),
              ownAndOpponentPrizesBefore:
                transition.beforePrizesRemaining??null,
              ownAndOpponentPrizesAfter:
                transition.settled?.prizesRemaining??null
            })),
        abortPromptType:row.nativeAbortEvidence?.pendingPrompt??null,
        rowDisposition:row.status??null,
        opponentHiddenZoneRead:false
      };
      return raw;
    }});
  }
  const record=prior({registration,baseRun:sourceWithCapture});
  assert.ok(captured);
  assert.equal(record.originalPreForkSourceRootTapeMatched,true);
  assert.equal(record.sourceOwnerCardAcceptedByNativeStore,true);
  assert.equal(record.attemptedNativeOriginalRows,8);
  const late=record.ownerLetterSearchAudit;
  return {
    schema:VERSION,sourceOriginalRegistration:registration.selectedOriginalId,
    firstTurnSourceOrdinal:registration.sourcePassRootOrdinal,
    exactOriginalDeal:true,identicalOriginalRootPrefix:true,
    nativeLetterAccepted:record.sourceOwnerCardAcceptedByNativeStore,
    nativeLetterPhysicalTwoDarkness:
      late.searchPromptsSettled===1&&late.physicalDarknessToHand===2,
    lateLetterAudit:late,
    sourceAttackCustody:captured,
    actualSourceDisposition:record.originalSourceRowDisposition,
    allEightOriginalNativeDispositions:record.allNativeArmDispositions,
    originalSourceQualifiedGames:0,demonstratedWinRate:null
  };
}
/** Exclusive, atomic research packet writer. */
function write(filename,value){
  assert.equal(value.schema,VERSION);
  fs.mkdirSync(path.dirname(filename),{recursive:true});
  const fd=fs.openSync(filename+'.lock','wx');
  const tmp=filename+'.'+process.pid+'.tmp';
  try{
    const body=JSON.stringify(value,null,2)+'\n';
    fs.writeFileSync(tmp,body,{flag:'wx'});
    fs.renameSync(tmp,filename);
    return {bytes:Buffer.byteLength(body),sha256:createHash('sha256')
      .update(body).digest('hex')};
  }finally{
    if(fs.existsSync(tmp))fs.unlinkSync(tmp);
    fs.closeSync(fd);fs.unlinkSync(filename+'.lock');
  }
}
if(require.main===module){
  const file=process.env.AGENT49_FIRST_FAMILY_ATTACK_AUDIT;
  assert.ok(file,'AGENT49_FIRST_FAMILY_ATTACK_AUDIT is required');
  const result=run(),saved=write(file,result);
  const root=result.sourceAttackCustody.nativeSourceTurnRootActions;
  process.stdout.write('AGENT49_FIRST_FAMILY_ATTACK '+JSON.stringify({
    ...saved,firstTurnNativeSourceActions:root,
    sourceAttackSettled:result.sourceAttackCustody
      .beforeAndAfterSourceTurnAttackTransitions.length,
    latePrompt:result.sourceAttackCustody.abortPromptType,
    sourceDisposition:result.actualSourceDisposition,
    qualifiedGames:0
  })+'\n');
}
module.exports={VERSION,run,write};
