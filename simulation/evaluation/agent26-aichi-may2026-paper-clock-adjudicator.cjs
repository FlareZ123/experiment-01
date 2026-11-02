'use strict';
const assert=require('node:assert/strict');

const VERSION='agent26-aichi-may2026-paper-clock-adjudicator-v1';
const STAGES=new Set(['swiss','top32','final']);
const PHASES=new Set(['cutoff','extension']);

/**
 * Evaluate the *stated* Japanese CL Aichi May 2026 25/35-minute
 * end-of-time rule from a supplied public Prize snapshot. This is a pure
 * rule oracle, NOT a game clock, match replay or legality certification.
 *
 * The time-call boundary must be after the second-starting player's final
 * full turn, omitting the Pokémon Checkup that would follow. During a
 * knockout extension, Prize changes may decide the match midturn.
 *
 * Natural wins/ties (including KO, all-Prize, deck-out, no-Pokémon) must
 * be resolved externally under paper rules before using the time rule.
 * The caller is responsible for validating that prerequisite.
 *
 * @param {{
 *   stage:'swiss'|'top32'|'final',
 *   phase:'cutoff'|'extension',
 *   firstPlayerSeat:0|1,
 *   afterSecondStartingPlayerTurn:boolean,
 *   prizeRemaining:[number,number],
 *   naturalOutcome?:0|1|'tie'|null
 * }} state
 * @returns {{
 *   version:string,officialClockMinutes:number,stage:string,phase:string,
 *   status:string,winner:0|1|null,requiresExtension:boolean,
 *   actorActionAllowed:boolean,competitiveGameQualified:false,
 *   paperClockMeasured:false
 * }}
 */
function adjudicateMay2026AichiTime(state){
  assert.ok(state&&typeof state==='object');
  const {stage,phase,firstPlayerSeat,
    afterSecondStartingPlayerTurn,prizeRemaining,
    naturalOutcome=null}=state;
  assert.ok(STAGES.has(stage));
  assert.ok(PHASES.has(phase));
  assert.ok(firstPlayerSeat===0||firstPlayerSeat===1);
  assert.equal(typeof afterSecondStartingPlayerTurn,'boolean');
  assert.ok(Array.isArray(prizeRemaining)&&prizeRemaining.length===2);
  for(const x of prizeRemaining)assert.ok(Number.isSafeInteger(x)&&x>=0&&x<=6);
  assert.ok(naturalOutcome===null||naturalOutcome==='tie'||
    naturalOutcome===0||naturalOutcome===1);
  if(stage==='swiss')assert.equal(phase,'cutoff');
  const base={version:VERSION,officialClockMinutes:stage==='final'?35:25,
    stage,phase,winner:null,requiresExtension:false,
    actorActionAllowed:false,competitiveGameQualified:false,
    paperClockMeasured:false};
  if(phase==='cutoff'&&!afterSecondStartingPlayerTurn){
    return {...base,status:'AWAIT_SECOND_STARTING_PLAYER_FINAL_TURN',
      actorActionAllowed:true};
  }
  if(naturalOutcome==='tie')return {
    ...base,status:'PAPER_TIEBREAKER_NEW_SIX_PRIZE_GAME',
    actorActionAllowed:true};
  if(naturalOutcome===0||naturalOutcome===1)return {
    ...base,status:'NATURAL_PAPER_WIN',winner:naturalOutcome};
  if(prizeRemaining.includes(0))return {
    ...base,status:'NATURAL_PAPER_TERMINAL_UNVERIFIED'};
  if(stage==='swiss')return {...base,status:'SWISS_BOTH_LOSS'};
  const [a,b]=prizeRemaining;
  if(a!==b&&Math.min(a,b)<=2)return {
    ...base,status:'KNOCKOUT_PAPER_TIME_WIN',winner:a<b?0:1};
  return {...base,status:'KNOCKOUT_EXTENSION_REQUIRED',
    requiresExtension:true,actorActionAllowed:true};
}
module.exports={VERSION,adjudicateMay2026AichiTime};
