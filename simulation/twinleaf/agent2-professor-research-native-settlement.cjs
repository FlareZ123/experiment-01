'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const {actorNativeActionReceipt}=require(
  './agent34-actor-only-root-policy.cjs');
const {captureProfessorResearchPhysicalDraw,VERSION:WITNESS}=
  require('./agent2-professor-research-physical-draw-witness.cjs');

const VERSION='agent2-native-professor-research-postselection-settlement-v1';

/**
 * Passive, reversible Store dispatch observer for a genuinely selected
 * actor-only Professor's Research root. The only access to private deck
 * physical references is confined to a trusted proof closure, never a
 * decision policy or serializable response.
 *
 * @template T
 * @param {()=>T} execute Genuine Store experiment.
 * @param {{Store?:Function,getActionReceipt?:Function}} [deps] Mock seams.
 * @returns {{result:T,audit:object}}
 */
function withProfessorResearchDrawSettlement(execute,deps={}){
  assert.equal(typeof execute,'function');
  const output=path.resolve(__dirname,
    '../../vendor/twinleaf/ptcg-server/output');
  const Store=deps.Store??require(path.join(output,'game/store/store')).Store;
  const getActionReceipt=deps.getActionReceipt??actorNativeActionReceipt;
  const before=Object.getOwnPropertyDescriptor(Store.prototype,'dispatch');
  assert.equal(typeof before?.value,'function');
  const pending=new Map();
  const audit={
    version:VERSION,witnessVersion:WITNESS,
    monitoredSelectedResearchActions:0,
    exactSevenPhysicalDraws:0,
    pendingAtExit:0,
    observedReceipts:[],
    ownerPrivateDeckIdentityExported:false,
    alteredPolicyChoices:false,
    paperWholeGameQualified:false,
    competitiveGameQualified:false
  };

  function dispatch(action,...args){
    const receipt=getActionReceipt(action);
    const take=receipt?.kind==='play-seeker-recovered-research';
    let candidate=null;
    if(take){
      assert.ok(receipt.seat===0||receipt.seat===1);
      assert.ok(!pending.has(receipt.seat),
        'One Research action must settle before another is certified');
      candidate=captureProfessorResearchPhysicalDraw(
        this.state,receipt.seat,receipt.handIndex);
      audit.monitoredSelectedResearchActions++;
    }
    const result=before.value.apply(this,[action,...args]);
    if(candidate){
      pending.set(receipt.seat,{
        verify:candidate.verify,
        store:this,
        rootOrdinal:receipt.nativeStoreActionOrdinal??null,
        actorSeat:receipt.seat
      });
    }
    for(const [seat,p] of pending){
      if(p.store!==this)continue;
      const result=p.verify(this.state);
      if(result.valid){
        audit.exactSevenPhysicalDraws++;
        if(audit.observedReceipts.length<32)
          audit.observedReceipts.push({
            ...result,rootOrdinal:p.rootOrdinal
          });
        pending.delete(seat);
      }
    }
    return result;
  }

  Object.defineProperty(Store.prototype,'dispatch',
    {...before,value:dispatch});
  try{return {result:execute(),audit};}
  catch(error){
    if(error&&typeof error==='object')
      error.agent2ResearchNativeSettlementAudit=audit;
    throw error;
  }finally{
    audit.pendingAtExit=pending.size;
    assert.strictEqual(Store.prototype.dispatch,dispatch);
    Object.defineProperty(Store.prototype,'dispatch',before);
  }
}

module.exports={VERSION,withProfessorResearchDrawSettlement};
