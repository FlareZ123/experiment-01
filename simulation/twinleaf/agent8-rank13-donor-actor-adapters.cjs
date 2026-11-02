'use strict';
const assert=require('node:assert/strict');
const {withActorHandDiscard,chooseActorHandDiscard}=
  require('./agent47-actor-hand-discard.cjs');
const {withActorOwnerSingleSearch,chooseActorSingleSearch}=
  require('./agent41-actor-owner-single-search.cjs');
const {chooseRegidragoQuickBallDiscard,chooseRegidragoQuickBallSearch}=
  require('./agent8-regidrago-quickball-donor-frontier.cjs');

const VERSION='agent8-source13-quickball-actor-prompt-composition-v1';

/**
 * Source-scoped pure chooser extension. The existing owner-only fallback
 * remains unchanged for other prompts and the other physical player.
 * @param {object} input Detached genuine owner-prompt projection.
 * @param {0|1} sourceSeat
 * @param {(input:object)=>object|null} proposed
 * @param {(input:object)=>object|null} original
 * @returns {object|null}
 */
function source13PromptChoice(input,sourceSeat,proposed,original){
  assert.ok(sourceSeat===0||sourceSeat===1);
  assert.equal(input?.actor?.decisionKind,'owner-prompt');
  assert.equal(typeof proposed,'function');
  assert.equal(typeof original,'function');
  return input.actor.actorSeat===sourceSeat?
    proposed(input)??original(input):original(input);
}

/**
 * Inject a source-rank13 payment chooser into the existing genuine native
 * hand-prompt resolver. This is only a development profile component; the
 * source seat is an external immutable matchup designation.
 * @template T
 * @param {()=>T} execute
 * @param {0|1} sourceSeat
 * @returns {{result:T,audit:object}}
 */
function withRank13QuickBallHandPayment(execute,sourceSeat){
  const overrides=[];
  const choice=input=>{
    const selected=input.actor.actorSeat===sourceSeat?
      chooseRegidragoQuickBallDiscard(input):null;
    if(selected&&overrides.length<64)overrides.push({
      turn:input.actor.globalTurn,seat:sourceSeat,
      promptId:input.prompt.id,printings:[...selected.printings]
    });
    return selected??chooseActorHandDiscard(input);
  };
  const result=withActorHandDiscard(execute,{choose:choice});
  return {...result,audit:{...result.audit,version:VERSION,
    underlyingVersion:result.audit.version,
    sourceSeat,sourceDonorPaymentProposals:overrides,
    competitivelyQualifiedGames:0}};
}

/**
 * Inject a source-rank13 Regidrago V search choice into the native-valid
 * owner single search resolver. Card identities come only from a real
 * owner-deck search menu; unavailable or Prized targets retain fallback.
 * @template T
 * @param {()=>T} execute
 * @param {0|1} sourceSeat
 * @returns {{result:T,audit:object}}
 */
function withRank13QuickBallOwnerSearch(execute,sourceSeat){
  const overrides=[];
  const choice=input=>{
    const selected=input.actor.actorSeat===sourceSeat?
      chooseRegidragoQuickBallSearch(input):null;
    if(selected&&overrides.length<64)overrides.push({
      turn:input.actor.globalTurn,seat:sourceSeat,
      promptId:input.prompt.id,
      selectedOfferedPrinting:
        input.prompt.offered[selected.indices[0]]?.printing??null
    });
    return selected??chooseActorSingleSearch(input);
  };
  const result=withActorOwnerSingleSearch(execute,{choose:choice});
  return {...result,audit:{...result.audit,version:VERSION,
    underlyingVersion:result.audit.version,
    sourceSeat,sourceRegidragoSearchProposals:overrides,
    competitivelyQualifiedGames:0}};
}

/**
 * Drop-in canonical actor composition seams. Existing owner-card,
 * opponent-hand, deck-order and Prize-information isolation is retained.
 * @param {0|1} sourceSeat
 * @returns {{handDiscard:Function,ownerSearch:Function}}
 */
function source13QuickBallActorAdapters(sourceSeat){
  assert.ok(sourceSeat===0||sourceSeat===1);
  return {
    handDiscard:execute=>withRank13QuickBallHandPayment(execute,sourceSeat),
    ownerSearch:execute=>withRank13QuickBallOwnerSearch(execute,sourceSeat)
  };
}
module.exports={VERSION,source13PromptChoice,
  withRank13QuickBallHandPayment,withRank13QuickBallOwnerSearch,
  source13QuickBallActorAdapters};
