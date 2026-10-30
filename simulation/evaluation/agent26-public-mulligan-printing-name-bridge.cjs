'use strict';
const assert=require('node:assert/strict');

const VERSION='agent26-native-public-mulligan-printing-name-bridge-v1';

/**
 * Build a public printed-card identity dictionary from the engine's public
 * card-definition catalog. Caller supplies card definitions, never a private
 * opponent deck, hand, or Prize-card collection.
 * @param {{fullName:string,name:string}[]} allPublicCardDefinitions
 * @returns {Map<string,string>} Full printing to publicly printed card name.
 */
function publicPrintingNameIndex(allPublicCardDefinitions){
  assert.ok(Array.isArray(allPublicCardDefinitions));
  const names=new Map();
  for(const card of allPublicCardDefinitions){
    assert.ok(typeof card.fullName==='string'&&card.fullName.length>0);
    assert.ok(typeof card.name==='string'&&card.name.length>0);
    if(names.has(card.fullName)){
      assert.equal(names.get(card.fullName),card.name,
        'Ambiguous printed identity in public catalog');
    }else names.set(card.fullName,card.name);
  }
  assert.ok(names.size>0);
  return names;
}

/**
 * Map only the opponent's already publicly revealed invalid sevens from the
 * native first-turn archive into the exact name-only posterior input.
 * Names of the viewer's own publicly revealed failed hands are omitted.
 *
 * @param {object} history Default-off read-only native public observer result.
 * @param {0|1} viewerSeat Acting physical perspective.
 * @param {Map<string,string>} publicNameIndex Public metadata only.
 * @returns {readonly (readonly string[])[]} Immutable public named failed sevens.
 */
function opponentPublicFailedHandNames(history,viewerSeat,publicNameIndex){
  assert.ok(viewerSeat===0||viewerSeat===1);
  assert.equal(history?.schema,'native-public-opponent-mulligan-reveal-v1');
  assert.equal(history.excludesPrivateCurrentHandDeckPrize,true);
  assert.equal(history.provenance,'opponent-facing ShowMulliganPrompt only');
  assert.equal(history.effectOnActorPolicy,false);
  assert.equal(history.createsCompetitiveWinRateEvidence,false);
  assert.ok(Array.isArray(history.handsByOwner)&&
    history.handsByOwner.length===2);
  assert.ok(publicNameIndex instanceof Map);
  const other=1-viewerSeat;
  const printings=history.handsByOwner[other];
  assert.ok(Array.isArray(printings));
  assert.equal(history.revealedHandCounts?.[other],printings.length);
  const names=printings.map(hand=>{
    assert.ok(Array.isArray(hand)&&hand.length===7);
    const decoded=hand.map(fullName=>{
      assert.ok(typeof fullName==='string'&&fullName.length>0);
      const name=publicNameIndex.get(fullName);
      assert.ok(typeof name==='string'&&name.length>0,
        'Public mulligan printing has no verified public name');
      return name;
    });
    return Object.freeze(decoded);
  });
  return Object.freeze(names);
}


/**
 * Specific public naming differences between native Twinleaf and the
 * exact Aichi source-list manifest. These names refer to identical printed
 * Prism Star card identities. No source-rank data is used in the mapping.
 */
const AICHI_PRISM_NAMES=Object.freeze({
  'Ditto Prism Star':'Ditto ♢',
  'Tapu Koko Prism Star':'Tapu Koko ♢',
  'Thunder Mountain Prism Star':'Thunder Mountain ♢',
  'Wondrous Labyrinth Prism Star':'Wondrous Labyrinth ♢'
});

/**
 * Convert the native public printed names into original Aichi manifest names.
 * Exact whitelist only; no fuzzy matching or unknown-card substitutions.
 * @param {{fullName:string,name:string}[]} allPublicCardDefinitions
 * @returns {Map<string,string>}
 */
function publicAichiSourceNameIndex(allPublicCardDefinitions){
  const catalog=publicPrintingNameIndex(allPublicCardDefinitions);
  for(const [printing,name] of catalog){
    if(Object.hasOwn(AICHI_PRISM_NAMES,name)){
      catalog.set(printing,AICHI_PRISM_NAMES[name]);
    }
  }
  return catalog;
}

module.exports={VERSION,publicPrintingNameIndex,
  publicAichiSourceNameIndex,opponentPublicFailedHandNames};
