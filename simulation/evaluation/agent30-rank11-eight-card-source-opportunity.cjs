'use strict';

const {originalSource}=require('./agent30-rank11-source-setup-replay.cjs');

/**
 * Count physically visible native card names without revealing them to a bot.
 * @param {string[]} cards Physical native printing identities
 * @returns {Map<string,number>}
 */
function countNames(cards){
  const totals=new Map();
  for(const full of cards){
    const name=full.replace(/ (?:[A-Z0-9]+)$/u,'')
      .replace(/^Professors Letter$/u,"Professor's Letter");
    totals.set(name,(totals.get(name)||0)+1);
  }
  return totals;
}

/**
 * Restricted retrospective source opening locations. The physical eight
 * consists of the opening seven and ordinary first draw after six Prizes.
 * This ignores extra draws, preliminary actions, Bench decisions, locks and
 * actual owner policy. It is never a legal player observation or bot input.
 *
 * @param {{initialSeven:string[],prizeSix:string[],
 *   firstNaturalDraw:string}} deal Verified original-source physical setup
 * @returns {{direct:boolean,heldSeal:boolean,any:boolean}}
 */
function classifyEightCardOpportunity(deal){
  const eight=[...deal.initialSeven,deal.firstNaturalDraw];
  const remaining=[...originalSource()];
  for(const printed of [...eight,...deal.prizeSix]){
    const at=remaining.indexOf(printed);
    if(at<0)throw new Error('Original physical source copy mismatch');
    remaining.splice(at,1);
  }
  const hand=countNames(eight),deck=countNames(remaining);
  const held=name=>hand.get(name)||0;
  const inDeck=name=>deck.get(name)||0;
  const canObtainTrubbish=held('Trubbish')>0||
    (held('Battle VIP Pass')>0&&inDeck('Trubbish')>0);
  const hasTool=['Muscle Band','Float Stone','Forest Seal Stone']
    .some(name=>held(name)>0);
  const direct=held('Boost Shake')>0&&hasTool&&
    canObtainTrubbish&&inDeck('Garbodor')>0;
  const hasSeparateTool=held('Muscle Band')>0||
    held('Float Stone')>0||held('Forest Seal Stone')>=2;
  const hasV=held('Oranguru V')>0||held('Crobat V')>0||
    (held('Battle VIP Pass')>0&&
      (inDeck('Oranguru V')>0||inDeck('Crobat V')>0));
  const heldSeal=held('Boost Shake')===0&&held('Forest Seal Stone')>0&&
    hasSeparateTool&&hasV&&canObtainTrubbish&&
    inDeck('Boost Shake')>0&&inDeck('Garbodor')>0;
  return {direct,heldSeal,any:direct||heldSeal};
}

module.exports={classifyEightCardOpportunity};
