'use strict';

const {secretBoxPaymentNegative}=
  require('./agent4-secret-box-paper-payment-hook.cjs');

const VERSION='agent21-secret-box-owner-visible-discard-cost-v1';
const BOX='Secret Box TWM';
const VIP='Battle VIP Pass FST';
const CARRIER='Rescue Carrier EVS';
const LILLIE="Lillie's Determination M1L";
const POWERGLASS='Powerglass SFA';
const BASIC_PSYCHIC='Psychic Energy';

const NEW_MOON_DCI_POLICY=Object.freeze({
  maxTotalCost:11,
  defaultCost:10,
  duplicateDiscount:2,
  spentVipCost:0,
  recoveryTargetPremium:3,
  powerglassRecoveryPremium:2,
  spentSupporterDiscount:1,
  costs:Object.freeze({
    [VIP]:12,
    [LILLIE]:6,
    [CARRIER]:8,
    [POWERGLASS]:10,
    'Forest Seal Stone SIT':12,
    'Mysterious Treasure FLI':7,
    'Ace Trainer XY7':8,
    'Sky Field ROS':8,
    'Field Blower GRI':8,
    'Fog Crystal CRE':7
  })
});

/** @param {object[]} cards @param {string} fullName @returns {number} */
function countPrinting(cards,fullName){
  return cards.filter(card=>card?.fullName===fullName).length;
}

/**
 * This cost model reads only the acting player's hand, discard, and turn
 * resources. It never reads the opponent, own deck, or Prize cards.
 * Lower values mean a safer physical discard.
 * @param {object} card Physical card in the owner's hand
 * @param {object} owner Acting native player
 * @param {object} state Native Store state
 * @param {object} policy DCI weights
 * @returns {{cost:number,reasons:string[]}}
 */
function secretBoxDiscardCost(card,owner,state,policy=NEW_MOON_DCI_POLICY){
  const hand=owner.hand.cards;
  const duplicates=Math.max(0,countPrinting(hand,card.fullName)-1);
  let cost=policy.costs[card.fullName]??policy.defaultCost;
  const reasons=[];

  // Global turn 3 is the first point by which both seats have taken a turn.
  if(card.fullName===VIP&&state.turn>2){
    cost=policy.spentVipCost;
    reasons.push('Battle VIP Pass is no longer playable after turn one');
  }
  if(duplicates>0){
    cost=Math.max(0,cost-policy.duplicateDiscount);
    reasons.push(duplicates + ' other physical copy/copies remain in hand');
  }
  if(card.fullName===CARRIER&&owner.discard.cards.some(discarded=>
    Number.isFinite(discarded.hp)&&discarded.hp<=90)){
    cost+=policy.recoveryTargetPremium;
    reasons.push('discard contains a Pokémon eligible for Rescue Carrier recovery');
  }
  if(card.fullName===POWERGLASS&&owner.discard.cards.some(discarded=>
    discarded.fullName?.startsWith(BASIC_PSYCHIC+' '))){
    cost+=policy.powerglassRecoveryPremium;
    reasons.push('Powerglass can recover a Basic Psychic Energy from the public discard');
  }
  if(card.fullName===LILLIE&&owner.supporterTurn>0){
    cost=Math.max(0,cost-policy.spentSupporterDiscount);
    reasons.push('a Supporter has already been played this turn');
  }
  return {cost,reasons};
}

/**
 * Enumerate legal three-card payments and minimize summed owner-visible DCI.
 * Ties preserve original hand order for deterministic physical selection.
 * @param {object[]} offered Physical candidates from the owner's hand
 * @param {object} owner Acting native player
 * @param {object} state Native Store state
 * @param {object} policy DCI weights
 * @returns {{cards:object[],totalCost:number,cardCosts:object[],version:string}|null}
 */
function bestPayment(offered,owner,state,policy){
  let best=null;
  for(let i=0;i<offered.length-2;i++){
    for(let j=i+1;j<offered.length-1;j++){
      for(let k=j+1;k<offered.length;k++){
        const cards=[offered[i],offered[j],offered[k]];
        if(new Set(cards).size!==3)continue;
        const cardCosts=cards.map(card=>({
          fullName:card.fullName,
          ...secretBoxDiscardCost(card,owner,state,policy)
        }));
        const totalCost=cardCosts.reduce((sum,row)=>sum+row.cost,0);
        if(best&&totalCost>=best.totalCost)continue;
        best={cards,totalCost,cardCosts,version:VERSION};
      }
    }
  }
  return best;
}

/**
 * Plan a payment before playing Secret Box. This is the DCI gate that lets a
 * policy decline the ACE SPEC when every available three-card payment is too
 * expensive. Only owner-visible zones are consulted.
 * @param {object} owner Acting native player
 * @param {object} state Native Store state
 * @param {object} [policy] DCI weights and maximum accepted cost
 * @returns {{cards:object[],totalCost:number,cardCosts:object[],version:string}|null}
 */
function planSecretBoxPayment(owner,state,policy=NEW_MOON_DCI_POLICY){
  if(!Array.isArray(owner?.hand?.cards)||!Number.isSafeInteger(state?.turn)||
     !owner.hand.cards.some(card=>card.fullName===BOX))return null;
  const offered=owner.hand.cards.filter(card=>card.fullName!==BOX);
  if(offered.length<3)return null;
  const plan=bestPayment(offered,owner,state,policy);
  return plan&&plan.totalCost<=policy.maxTotalCost?plan:null;
}

/**
 * Select the minimum-cost three-card payment from a genuine Secret Box prompt.
 * A null result means the caller should delegate or decline its proposal.
 * @param {object} prompt Genuine native Secret Box CHOOSE_CARD_TO_DISCARD prompt
 * @param {object} owner Prompted native player
 * @param {object} state Native Store state
 * @param {object} [policy] DCI weights and maximum accepted cost
 * @returns {{cards:object[],totalCost:number,cardCosts:object[],version:string}|null}
 */
function chooseSecretBoxPaymentByDci(prompt,owner,state,
  policy=NEW_MOON_DCI_POLICY){
  if(prompt?.sourceCard?.fullName!==BOX||
     prompt?.message!=='CHOOSE_CARD_TO_DISCARD'||
     prompt?.playerId!==owner?.id||
     !Number.isSafeInteger(state?.turn)||
     !Array.isArray(prompt?.cards?.cards)||
     !Array.isArray(owner?.hand?.cards)||
     prompt.options?.min!==3||prompt.options?.max!==3||
     typeof prompt.validate!=='function')return null;
  const offered=prompt.cards.cards.filter(card=>
    card.fullName!==BOX&&owner.hand.cards.includes(card));
  if(offered.length<3)return null;
  const plan=bestPayment(offered,owner,state,policy);
  if(!plan||plan.totalCost>policy.maxTotalCost||
     secretBoxPaymentNegative(prompt,plan.cards,owner)!==null||
     prompt.validate(plan.cards,state)!==true)return null;
  return plan;
}

module.exports={VERSION,BOX,VIP,CARRIER,LILLIE,POWERGLASS,
  NEW_MOON_DCI_POLICY,secretBoxDiscardCost,planSecretBoxPayment,
  chooseSecretBoxPaymentByDci};
