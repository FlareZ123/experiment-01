'use strict';

const {createHash} = require('node:crypto');
const {readFileSync} = require('node:fs');
const official = require('./agent27-aichi-open-time-adjudication.cjs');

const VERSION='agent45-aichi-clock-receipt-adapter-v3';
const OFFICIAL_SOURCE='https://www.pokemon-card.com/info/005445.html';
const FINAL_STATUSES=new Set(['NORMAL_PAPER_GAME_WIN','ELIMINATION_PRIZE_LEAD']);
const EXTENSION_FINAL_STATUSES=new Set(['NORMAL_PAPER_GAME_WIN','EXTENSION_WIN']);

/**
 * Bind an evidence packet to the actual executed Aichi scorer source,
 * declared event source and version. This is a code/protocol fingerprint,
 * not a proof of an independently authenticated paper record.
 * @returns {string}
 */
function aichiClockProtocolSha256(){
  return createHash('sha256')
    .update(OFFICIAL_SOURCE).update('\n')
    .update(readFileSync(require.resolve('./agent27-aichi-open-time-adjudication.cjs')))
    .digest('hex');
}

/**
 * Interpret the independently supplied game clock with Agent27's existing
 * official event scorer. A resolved result still needs external authentication.
 * Every malformed, missing, ambiguous, disputed or incomplete receipt remains
 * a non-admitting outcome.
 *
 * @param {object} trial Physical original-source trial plus clock evidence
 * @returns {{shapeComplete:boolean,status:string,disposition:string|null,
 *   stage:string|null,limitMinutes:number|null,winnerSeat:0|1|null,
 *   outcome:string|null,conditionalOnly:boolean}}
 */
function inspectOfficialAichiClock(trial){
  const stage=trial?.eventStage??null;
  const disposition=trial?.clockDisposition??null;
  const limitMinutes=Object.hasOwn(official.STAGES,stage)?
    official.STAGES[stage].minutes:null;
  const result=(shapeComplete,status,winnerSeat=null,outcome=null,extra={})=>({
    schema:VERSION,shapeComplete,status,disposition,stage,limitMinutes,
    winnerSeat,outcome,conditionalOnly:true,competitiveAdmission:false,
    ...extra
  });
  const nonempty=value=>typeof value==='string'&&value.trim().length>0;
  if(limitMinutes===null)return result(false,'UNKNOWN_EVENT_STAGE');
  if(!nonempty(trial.paperReceiptId)||
     !nonempty(trial.adjudicationProtocolSha)||
     trial.adjudicationProtocolSha!==aichiClockProtocolSha256())
    return result(false,'MISSING_OR_MISMATCHED_PAPER_PROTOCOL');
  if(disposition==='no-official-call'){
    if(trial.clockReceiptId!==null||!trial.noCallClockPacket||
       trial.timeCallPacket!=null||trial.extensionLedgerPacket!=null)
      return result(false,'NO_CALL_PACKET_CONTRADICTORY');
    const packet=trial.noCallClockPacket;
    if(packet.stage!==stage ||
       packet.paperTerminalEvidenceRef!==trial.paperReceiptId)
      return result(false,'NO_CALL_PACKET_SOURCE_MISMATCH');
    let audit;
    try{audit=official.auditNoCallClockPacket(packet);}
    catch{return result(false,'NO_CALL_PACKET_MALFORMED');}
    if(audit.noCallEvidenceShapeComplete!==true||
       audit.status!=='NORMAL_PAPER_GAME_WIN'||
       (audit.conditionalWinnerSeat!==0&&audit.conditionalWinnerSeat!==1))
      return result(false,audit.status);
    return result(true,audit.status,audit.conditionalWinnerSeat,'paper-win');
  }
  if(disposition==='official-call'){
    if(!nonempty(trial.clockReceiptId)||!trial.timeCallPacket||
       trial.noCallClockPacket!=null)
      return result(false,'OFFICIAL_CALL_PACKET_MISSING_OR_CONTRADICTORY');
    const packet=trial.timeCallPacket;
    if(packet.stage!==stage||
       packet.officialClockEvidenceRef!==trial.clockReceiptId||
       packet.independentPaperStateEvidenceRef!==trial.paperReceiptId)
      return result(false,'OFFICIAL_CALL_SOURCE_MISMATCH');
    let audit;
    try{audit=official.auditTimeCallPacket(packet);}
    catch{return result(false,'OFFICIAL_CALL_PACKET_MALFORMED');}
    if(audit.status==='SWISS_BOTH_LOSE' && stage==='open-swiss'){
      if(trial.extensionLedgerPacket!=null)
        return result(false,'UNEXPECTED_EXTENSION_LEDGER_FOR_RESOLVED_CALL');
      return result(true,audit.status,null,'both-loss');
    }
    if(FINAL_STATUSES.has(audit.status) &&
       (audit.conditionalWinnerSeat===0||audit.conditionalWinnerSeat===1)){
      if(trial.extensionLedgerPacket!=null)
        return result(false,'UNEXPECTED_EXTENSION_LEDGER_FOR_RESOLVED_CALL');
      return result(true,audit.status,audit.conditionalWinnerSeat,'paper-win');
    }
    if(audit.extensionRule!=='tied-low'&&audit.extensionRule!=='both-high')
      return result(false,audit.status);
    if(!trial.extensionLedgerPacket ||
       trial.extensionLedgerPacket.timeCallPacket!=null)
      return result(false,'EXTENSION_PACKET_MISSING_OR_CONTRADICTORY');
    let extension;
    try{extension=official.auditExtensionLedger({
      ...trial.extensionLedgerPacket,timeCallPacket:packet
    });}
    catch{return result(false,'EXTENSION_PACKET_MALFORMED');}
    if(extension.status==='EXTENSION_LEDGER_TERMINAL'){
      const extensionDiagnostics={
        extensionLedgerStatus:extension.status,
        terminalStatus:extension.terminalStatus??null,
        requiresSixPrizeTiebreaker:extension.requiresSixPrizeTiebreaker===true,
        extensionLedgerShapeComplete:extension.extensionLedgerShapeComplete===true,
        extensionTerminalSequence:extension.terminalSequence??null
      };
      if(extension.terminalStatus==='TIEBREAKER_REQUIRED_SIX_PRIZE'&&
         extension.requiresSixPrizeTiebreaker===true&&
         extension.conditionalWinnerSeat===null)
        return result(false,extension.status,null,null,extensionDiagnostics);
      if(EXTENSION_FINAL_STATUSES.has(extension.terminalStatus)&&
         (extension.conditionalWinnerSeat===0||
          extension.conditionalWinnerSeat===1))
        return result(true,extension.terminalStatus,
          extension.conditionalWinnerSeat,'paper-win',extensionDiagnostics);
      return result(false,extension.status,null,null,extensionDiagnostics);
    }
    return result(false,extension.status);
  }
  return result(false,'UNVERIFIED_OR_DISPUTED_CLOCK_DISPOSITION');
}

/**
 * A coherent receipt is an externally asserted structural observation.
 * No self-reported packet can, by itself, certify competitive play.
 * @param {object} trial
 * @returns {boolean}
 */
function verifiedOfficialAichiClock(trial){
  return inspectOfficialAichiClock(trial).shapeComplete;
}

module.exports={VERSION,aichiClockProtocolSha256,
  inspectOfficialAichiClock,verifiedOfficialAichiClock};
