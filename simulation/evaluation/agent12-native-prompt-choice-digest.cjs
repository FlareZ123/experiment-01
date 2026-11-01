'use strict';

const assert=require('node:assert/strict');
const {createHash}=require('node:crypto');

const VERSION='agent12-native-prompt-choice-ordinal-digest-v1';

/**
 * Deterministic digest of physically selected native cards from the existing
 * post-game evidence sidecar. Does not read private state from actor policy,
 * and never claims absent card-name receipts are complete witnesses.
 *
 * @param {object} sidecar Existing nativePromptChoices evidence sidecar.
 * @returns {object} Physical print-choice checksum, coverage and counts.
 */
function digestNativePromptChoices(sidecar){
  const rows=sidecar?.events??[];
  assert.ok(Array.isArray(rows));
  const normalized=rows.map(x=>{
    assert.ok(Number.isSafeInteger(x.ordinal));
    assert.equal(typeof x.kind,'string');
    const cards=x.selectedCards;
    assert.ok(cards===null||cards===undefined||
      (Array.isArray(cards)&&cards.every(n=>typeof n==='string')));
    return {
      ordinal:x.ordinal,
      kind:x.kind,
      sourceZone:x.sourceZone??null,
      sourcePlayerSlot:x.sourcePlayerSlot??null,
      submittedPhysicalPrintings:cards??null
    };
  }).sort((a,b)=>a.ordinal-b.ordinal);
  for(let i=1;i<normalized.length;i++)
    assert.notEqual(normalized[i-1].ordinal,normalized[i].ordinal,
      'Prompt ordinal duplicated; refuse ambiguous physical checksum');
  const selectedWithNames=normalized.filter(x=>
    x.submittedPhysicalPrintings!==null).length;
  return {
    version:VERSION,
    hashDomain:'SHA256 canonical sorted postgame original native printed selections',
    totalPromptChoiceEvents:normalized.length,
    selectedPrintingNamesKnown:selectedWithNames,
    selectedPrintingNamesUnknown:normalized.length-selectedWithNames,
    completePhysicalSelectedPrintings:
      selectedWithNames===normalized.length,
    digestSha256:createHash('sha256')
      .update(JSON.stringify({version:VERSION,events:normalized}))
      .digest('hex'),
    note:'Postgame evidence only. A complete named-choice digest cannot independently certify physical custody, random source, actor information boundaries or paper rules.'
  };
}

module.exports={VERSION,digestNativePromptChoices};
