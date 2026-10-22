'use strict';

const path=require('node:path');
const output=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');

/** @param {object} left @param {object} right */
function sameTarget(left,right) {
  return left?.player===right?.player &&
    left?.slot===right?.slot &&
    left?.index===right?.index;
}

/**
 * Enforce the pinned AttachEnergyPrompt's sameTarget validation on the
 * speculative bot's *selection*. Card references remain unchanged.
 * The original result is preserved if the correction itself is not legal.
 *
 * @param {{options:object,validate:(assignments:any)=>boolean}} prompt
 * @param {null|Array<{card:object,to:object}>} proposed
 * @returns {{value:null|Array<{card:object,to:object}>,changed:boolean}}
 */
function repairSameTargetSelection(prompt,proposed) {
  if(prompt?.options?.sameTarget!==true || !Array.isArray(proposed) ||
      proposed.length<2 || prompt.validate(proposed)) {
    return {value:proposed,changed:false};
  }
  const target=proposed[0]?.to;
  if(!target || proposed.every(row=>sameTarget(row.to,target))) {
    return {value:proposed,changed:false};
  }
  const corrected=proposed.map(row=>({...row,to:target}));
  return prompt.validate(corrected) ?
    {value:corrected,changed:true} :
    {value:proposed,changed:false};
}

/**
 * Install a reversible, opt-in bot resolver selection fix around one
 * synchronous pinned Twinleaf headless run. No vendor file is changed.
 * @template T
 * @param {()=>T} execute
 * @param {{AttachEnergyPromptResolver?:Function,AttachEnergyPrompt?:Function}} [dependencies] Test seam for pinned prompt classes.
 * @returns {{result:T,audit:object}}
 */
function withSameTargetAttachEnergySelection(execute,dependencies={}) {
  const AttachEnergyPromptResolver=dependencies.AttachEnergyPromptResolver ??
    require(path.join(output,
      'simple-bot/prompt-resolver/attach-energy-prompt-resolver'))
      .AttachEnergyPromptResolver;
  const AttachEnergyPrompt=dependencies.AttachEnergyPrompt ??
    require(path.join(output,
      'game/store/prompts/attach-energy-prompt')).AttachEnergyPrompt;
  const proto=AttachEnergyPromptResolver.prototype;
  const prior=proto.getPromptResult;
  const events=[];
  const audit={schema:'bot-same-target-energy-selection-v1',
    repairedPromptCount:0,events,competitiveStrengthQualified:false};
  proto.getPromptResult=function sameTargetGet(state,prompt) {
    const result=prior.call(this,state,prompt);
    if(!(prompt instanceof AttachEnergyPrompt) ||
        prompt.options.sameTarget!==true) return result;
    const repaired=repairSameTargetSelection(prompt,result);
    if(repaired.changed) {
      audit.repairedPromptCount++;
      events.push({promptId:prompt.id,message:prompt.message,
        selectedCardCount:repaired.value.length,
        fixedDestination:repaired.value[0].to});
    }
    return repaired.value;
  };
  try {
    const result=execute();
    return {result,audit};
  } catch(error) {
    // The trial's native exception remains authoritative. Preserve partial
    // correction evidence for the caller's failure-inclusive output.
    if(error&&typeof error==='object')
      error.nativeSameTargetEnergyEvidence=audit;
    throw error;
  } finally {
    proto.getPromptResult=prior;
  }
}

module.exports={sameTarget,repairSameTargetSelection,
  withSameTargetAttachEnergySelection};
