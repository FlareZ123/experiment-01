'use strict';

const {withPaperBellelbaOptionalPayment}=
  require('./agent12-bellelba-paper-optional-payment-guard.cjs');
const {withPaperOpponentHandDiscards}=
  require('./agent12-opponent-hand-discard-paper-guard.cjs');

const VERSION='agent12-aichi-three-source-supporters-paper-guard-portfolio-v1';

/**
 * Explicit opt-in paper Source Supporter action boundary.
 *
 * Nested wrappers are synchronous and restore their original Store method
 * even on rejection. The input source game policy must choose paper-legal
 * answers to pending native prompts; this guard only vetoes illegal answers.
 * No automatic opponent policy, full match or freeze changes are made.
 *
 * @template T
 * @param {()=>T} run Synchronous real pinned Store work.
 * @param {{Store?:Function,types?:object}} [deps] Test injection only.
 * @returns {{result:T,audit:object}}
 */
function withPaperAichiThreeSupporters(run,deps={}){
  const outer=withPaperBellelbaOptionalPayment(
    ()=>withPaperOpponentHandDiscards(run,deps),deps);
  return {
    result:outer.result.result,
    audit:{
      version:VERSION,
      bellelba:outer.audit,
      opponentHand:outer.result.audit,
      qualifiedCompetitiveGames:0
    }
  };
}
module.exports={VERSION,withPaperAichiThreeSupporters};
