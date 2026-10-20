'use strict';

const assert=require('node:assert/strict');

/**
 * Exact multiset of owner-deck printings seen at a legitimately started
 * owner-deck search. This contains no opponent hidden information.
 *
 * The caller MUST invoke observeSearch only from the actual Store owner
 * prompt. Structural checking here rejects common ownership mistakes,
 * but cannot distinguish a real Store from a speculative clone by itself.
 * Unknown later deck ingress invalidates the whole cache.
 *
 * @returns {object} An owner-local, mutable knowledge object.
 */
function createOwnerK1DeckMembership(){
  let known=null;
  let epoch=0;
  let priorRoot=-1;
  let invalidationReason='no-authenticated-deck-search';
  const observedPromptIds=new Set();

  /** @returns {object} Immutable, detached owner-knowledge snapshot. */
  function snapshot(){
    return Object.freeze({
      epoch,
      exactMembershipKnown:known!==null,
      knownDeckSize:known===null?null:[...known.values()]
        .reduce((n,copies)=>n+copies,0),
      knownPrintings:known===null?null:Object.freeze(
        [...known.entries()].sort(([a],[b])=>a.localeCompare(b))
          .map(([printing,copies])=>Object.freeze({printing,copies}))),
      invalidationReason
    });
  }

  /**
   * @param {{owner:object,prompt:object,rootOrdinal:number}} input
   * @returns {object}
   */
  function observeSearch({owner,prompt,rootOrdinal}){
    assert.ok(owner&&prompt&&Number.isSafeInteger(rootOrdinal)&&rootOrdinal>=0);
    assert.equal(prompt?.constructor.name,'ChooseCardsPrompt',
      'K1 requires a native owner-deck search choice');
    assert.equal(prompt.playerId,owner.id,
      'Opponent deck search cannot establish owner K1');
    assert.ok(prompt.cards===owner.deck,
      'The exact owner deck object must be the searched zone');
    assert.ok(prompt.result===undefined,
      'The actor must actually have access to this pending search');
    assert.ok(rootOrdinal>=priorRoot,
      'Only chronological actual Store evidence may update knowledge');
    const promptId=prompt.id;
    assert.ok(typeof promptId==='number'||typeof promptId==='string');
    assert.ok(!observedPromptIds.has(promptId),
      'Reused search prompt identity cannot silently refresh owner K1');
    const cards=prompt.cards.cards;
    assert.ok(Array.isArray(cards));
    const next=new Map();
    for(const card of cards){
      assert.ok(typeof card?.fullName==='string'&&card.fullName.length>0,
        'An authenticated search must expose exact card printings');
      next.set(card.fullName,(next.get(card.fullName)??0)+1);
    }
    priorRoot=rootOrdinal;
    observedPromptIds.add(promptId);
    known=next;
    invalidationReason=null;
    epoch++;
    return snapshot();
  }

  /**
   * @param {{removed?:string[],added?:string[],rootOrdinal:number}} change
   * Known transfer cards must have been genuinely revealed to their owner.
   * For any unobserved ingress use invalidate(), not this method.
   * @returns {object}
   */
  function observeKnownDeckTransfer({removed=[],added=[],rootOrdinal}){
    assert.ok(Number.isSafeInteger(rootOrdinal)&&rootOrdinal>=priorRoot);
    assert.ok(Array.isArray(removed)&&Array.isArray(added));
    assert.ok([...removed,...added].every(name=>
      typeof name==='string'&&name.length>0));
    priorRoot=rootOrdinal;
    if(known===null)return snapshot();
    const next=new Map(known);
    for(const printing of removed){
      const count=next.get(printing)??0;
      if(count<1){
        // Contradictory physical movement destroys the certainty contract.
        known=null;
        epoch++;
        invalidationReason='inconsistent-owner-observed-card-transfer';
        return snapshot();
      }
      if(count===1)next.delete(printing);
      else next.set(printing,count-1);
    }
    for(const printing of added)next.set(printing,(next.get(printing)??0)+1);
    known=next;
    epoch++;
    return snapshot();
  }

  /** Unknown deck/Prize ingress, shuffling unobserved cards into own deck. */
  function invalidate(reason){
    assert.ok(typeof reason==='string'&&reason.length>0);
    known=null;
    invalidationReason=reason;
    epoch++;
    return snapshot();
  }

  /**
   * @param {string} printing Exact expansion printing, not just card name.
   * @returns {{status:string,knownCopies:number|null,epoch:number}}
   */
  function lookup(printing){
    assert.ok(typeof printing==='string'&&printing.length>0);
    const copies=known===null?null:(known.get(printing)??0);
    return Object.freeze({
      status:copies===null?'unknown':(copies>0?'present':'absent'),
      knownCopies:copies,epoch
    });
  }

  /**
   * Fail-closed exact-deck requirement screening for candidate *lines*.
   * A plan can still be strategically dominated when every requirement is
   * available; it may include alternative modes with different requirements.
   *
   * @param {{printing:string,count:number}[]} requirements
   * @returns {{status:string,missing:object[],epoch:number}}
   */
  function requirementStatus(requirements){
    assert.ok(Array.isArray(requirements));
    const total=new Map();
    for(const item of requirements){
      assert.ok(typeof item?.printing==='string'&&item.printing.length>0);
      assert.ok(Number.isSafeInteger(item.count)&&item.count>=1);
      total.set(item.printing,(total.get(item.printing)??0)+item.count);
    }
    if(known===null)return Object.freeze({status:'unknown',
      missing:Object.freeze([]),epoch});
    const missing=[...total.entries()]
      .filter(([printing,needed])=>(known.get(printing)??0)<needed)
      .map(([printing,needed])=>Object.freeze({
        printing,needed,available:known.get(printing)??0
      }));
    return Object.freeze({
      status:missing.length?'impossible':'physically-available',
      missing:Object.freeze(missing),epoch
    });
  }

  return Object.freeze({
    snapshot,observeSearch,observeKnownDeckTransfer,
    invalidate,lookup,requirementStatus
  });
}
module.exports={createOwnerK1DeckMembership};
