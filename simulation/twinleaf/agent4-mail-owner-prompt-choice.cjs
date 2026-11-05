'use strict';
const VERSION='agent4-owner-top4-trainers-mail-selection-v1';
function chooseOwnedTop4Mail(prompt,owner,types){
  if(prompt?.constructor?.name!=='ChooseCardsPrompt'||prompt.playerId!==owner?.id||prompt.message!=='CHOOSE_CARD_TO_HAND'||prompt.cards===owner.deck||!Array.isArray(prompt.cards?.cards)||prompt.cards.cards.length>4||prompt.options?.min!==0||prompt.options?.allowCancel!==false||!Number.isSafeInteger(prompt.options.max)||prompt.options.max>1)return null;
  for(const card of prompt.cards.cards){if(card.superType===types.SuperType.TRAINER&&card.name!=="Trainers' Mail"&&prompt.validate([card])===true)return [card];}
  return prompt.validate([])===true?[]:null;
}
module.exports={VERSION,chooseOwnedTop4Mail};
