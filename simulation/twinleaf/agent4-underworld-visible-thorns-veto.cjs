'use strict';
const assert=require('node:assert/strict');

const VERSION='agent4-owner-public-iron-thorns-underworld-veto-v1';
const SOURCE='Shadow Rider Calyrex VMAX CRE';
const LOCK='Iron Thorns ex TWM';

/**
 * A deliberately narrow owner/public-state proof of known suppression.
 * Historical v3's owner Underworld proposer is still used unchanged before
 * this check. The pinned native Store remains final legality authority.
 *
 * @param {object} view Detached actor-only observation.
 * @param {object|null} intent Existing authentic owner-root intent.
 * @returns {{veto:boolean,reason:string}}
 */
function classifyVisibleThornsVeto(view,intent){
  if(intent?.kind!=='use-underworld-door')
    return {veto:false,reason:'no-underworld-intent'};
  if(view?.decisionKind!=='owner-root')
    return {veto:false,reason:'not-owner-root'};
  const active=view.opponentPublic?.active;
  if(active?.printing!==LOCK ||
     !active.abilities?.includes('Initialization'))
    return {veto:false,reason:'no-visible-active-iron-thorns-lock'};
  // The public Stadium can shut off Initialization. A conservative public
  // veto abstains on any Stadium or source Tool not in its narrow proof scope.
  if([...(view.ownPublic?.stadium??[]),
      ...(view.opponentPublic?.stadium??[])].length!==0)
    return {veto:false,reason:'stadium-interaction-unresolved'};
  const slot=intent.position==='bench'?
    view.ownPublic?.bench?.[intent.benchIndex]:
    view.ownPublic?.active;
  if(slot?.printing!==SOURCE ||!slot.abilities?.includes('Underworld Door'))
    return {veto:false,reason:'source-printing-not-proven'};
  if((slot.tools??[]).length!==0)
    return {veto:false,reason:'tool-interaction-unresolved'};
  return {veto:true,reason:'public-active-thorns-untooled-vmax'};
}

/**
 * Temporarily replace the research-owned pure Underworld chooser with
 * identical candidate generation plus a narrow, source-evidence-based veto.
 * Returning null allows existing actor policy to evaluate later options in
 * the same source/candidate/turn root. Never substitutes raw bot State.
 *
 * @template T
 * @param {()=>T} work Synchronous native runner.
 * @returns {{result:T,audit:object}}
 */
function withPublicThornsUnderworldVeto(work){
  assert.equal(typeof work,'function');
  const chosen=require('./agent31-underworld-door-owner-frontier.cjs');
  const original=chosen.chooseUnderworldDoorRoot;
  assert.equal(typeof original,'function');
  const audit={
    schema:VERSION,proposalsSeen:0,underworldIntents:0,
    provenVetoes:0,nonVetoReasons:{},samples:[],
    readsOpponentHidden:false,readsDeckOrPrizes:false,
    onlyDetatchedOwnerView:true,changesPrintedSixties:false,
    paperQualifiedGames:0
  };
  function guarded(view,catalog,receipt){
    const proposal=original(view,catalog,receipt);
    audit.proposalsSeen++;
    if(proposal?.kind==='use-underworld-door')audit.underworldIntents++;
    const classification=classifyVisibleThornsVeto(view,proposal);
    if(classification.veto){
      audit.provenVetoes++;
      if(audit.samples.length<36)audit.samples.push({
        seat:view.actorSeat,globalTurn:view.globalTurn,
        reason:classification.reason,source:proposal.sourcePrinting,
        position:proposal.position,benchIndex:proposal.benchIndex,
        publicOpponentActive:view.opponentPublic.active.printing,
        releasedResource:'Underworld Door',
        returnedProposal:null
      });
      return null;
    }
    audit.nonVetoReasons[classification.reason]=
      (audit.nonVetoReasons[classification.reason]??0)+1;
    return proposal;
  }
  chosen.chooseUnderworldDoorRoot=guarded;
  try{return {result:work(),audit};}
  finally{
    assert.strictEqual(chosen.chooseUnderworldDoorRoot,guarded);
    chosen.chooseUnderworldDoorRoot=original;
  }
}

module.exports={VERSION,classifyVisibleThornsVeto,
  withPublicThornsUnderworldVeto};
