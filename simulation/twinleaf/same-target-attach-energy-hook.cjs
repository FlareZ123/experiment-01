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
 * @returns {{result:T,audit:object}}
 */
function withSameTargetAttachEnergySelection(execute) {
  const {AttachEnergyPromptResolver}=require(path.join(output,
    'simple-bot/prompt-resolver/attach-energy-prompt-resolver'));
  const {AttachEnergyPrompt}=require(path.join(output,
    'game/store/prompts/attach-energy-prompt'));
  const proto=AttachEnergyPromptResolver.prototype;
  const prior=proto.getPromptResult;
  const events=[];
  proto.getPromptResult=function sameTargetGet(state,prompt) {
    const result=prior.call(this,state,prompt);
    if(!(prompt instanceof AttachEnergyPrompt) ||
        prompt.options.sameTarget!==true) return result;
    const repaired=repairSameTargetSelection(prompt,result);
    if(repaired.changed) {
      events.push({promptId:prompt.id,message:prompt.message,
        selectedCardCount:repaired.value.length,
        fixedDestination:repaired.value[0].to});
    }
    return repaired.value;
  };
  try {
    const result=execute();
    return {result,audit:{schema:'bot-same-target-energy-selection-v1',
      repairedPromptCount:events.length,events,
      competitiveStrengthQualified:false}};
  } finally {
    proto.getPromptResult=prior;
  }
}

module.exports={sameTarget,repairSameTargetSelection,
  withSameTargetAttachEnergySelection};
