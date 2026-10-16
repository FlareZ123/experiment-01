'use strict';
const path = require('node:path');
const output = path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
/** @param {string} name */
function engine(name) { return require(path.join(output,name)); }

/** Mechanically legal fallback for noncancelable option prompts. */
function makeMandatoryOptionResolver() {
  const {PromptResolver}=engine('simple-bot/prompt-resolver/prompt-resolver');
  const {SelectOptionPrompt}=engine('game/store/prompts/select-option-prompt');
  const {ResolvePromptAction}=engine('game/store/actions/resolve-prompt-action');
  return class MandatoryOptionResolver extends PromptResolver {
    /** @param {object} state @param {object} player @param {object} prompt */
    resolvePrompt(state,player,prompt) {
      if (!(prompt instanceof SelectOptionPrompt) || prompt.options.allowCancel!==false) return;
      const enabled=index=>Number.isInteger(index)&&index>=0&&index<prompt.values.length&&
        prompt.options.disabled?.[index]!==true;
      const pref=prompt.options.defaultValue;
      const choice=enabled(pref)?pref:prompt.values.findIndex((_,i)=>enabled(i));
      if(choice<0) throw new Error('Mandatory option prompt has no enabled choice.');
      return new ResolvePromptAction(prompt.id,choice);
    }
  };
}

/**
 * Source-locked legality fallback, not strategically optimized mode selection.
 * @param {object} options Upstream SimpleBotOptions.
 */
function withMandatoryOptionFallback(options) {
  if(!Array.isArray(options.promptResolvers)) throw new Error('Missing prompt resolvers.');
  if(options.promptResolvers.some(C=>C.name==='MandatoryOptionResolver')) {
    throw new Error('Mandatory option fallback already selected.');
  }
  return {...options,promptResolvers:[makeMandatoryOptionResolver(),...options.promptResolvers]};
}
module.exports={makeMandatoryOptionResolver,withMandatoryOptionFallback};
