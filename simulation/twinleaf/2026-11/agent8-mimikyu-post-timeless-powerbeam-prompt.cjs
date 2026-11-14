'use strict';

const VERSION='agent8-mimikyu-post-timeless-powerbeam-prompt-v1';
const MIMIKYU='Mimikyu GRI';
const REGIDRAGO_VSTAR='Regidrago VSTAR SIT';
const RADIANT_ETERNATUS='Radiant Eternatus CRZ';

function isPreviousApex(tracker,opponent,state){
  const choices=tracker?.getCopycatChoices(opponent?.id);
  const history=tracker?.getPreviousTurnSnapshot(opponent?.id);
  return Array.isArray(choices)&&choices.length===1&&
    !!history&&Number.isSafeInteger(history.turn)&&history.turn<state.turn&&
    choices[0].turn===history.turn&&
    choices[0].sourceCardFullName===REGIDRAGO_VSTAR&&
    choices[0].attackName==='Apex Dragon'&&
    choices[0].gxAttack===false;
}

function knownDamage(attack){
  if(!attack||attack.damageCalculation)return null;
  if(Number.isSafeInteger(attack.damage))return attack.damage;
  if(typeof attack?.damage==='string'){
    const match=attack.damage.trim().match(/^(\d+)$/);
    if(match)return Number(match[1]);
  }
  if(attack?.damage==null&&!attack?.damageCalculation&&
     !/damage/i.test(String(attack?.text??'')))return 0;
  return null;
}

/**
 * Select the strongest known, legal non-GX damage payload for the
 * Mimikyu Copycat bonus turn after Timeless-GX has already been spent.
 * Returns the exact physical Attack object from the native prompt.
 */
function chooseNativeMimikyuPostTimelessPowerBeamPrompt(state,seat,prompt,tracker){
  if((seat!==0&&seat!==1)||state?.activePlayer!==seat||
     !Array.isArray(state.players)||state.players.length!==2||
     prompt?.constructor?.name!=='ChooseAttackPrompt'||
     !Array.isArray(prompt.cards)||typeof prompt.validate!=='function')return null;
  const owner=state.players[seat];
  const opponent=state.players[1-seat];
  if(prompt.playerId!==owner.id||
     owner.active?.getPokemonCard?.()?.fullName!==MIMIKYU||
     owner.usedGX!==true||owner.usedTurnSkip!==true||
     !isPreviousApex(tracker,opponent,state))return null;

  const donor=owner.discard?.cards?.find(card=>
    card.fullName===RADIANT_ETERNATUS&&prompt.cards.includes(card));
  if(!donor)return null;
  const powerBeam=donor.attacks?.find(attack=>
    attack.name==='Power Beam'&&attack.gxAttack!==true&&
    knownDamage(attack)===200);
  if(!powerBeam||prompt.validate(powerBeam)!==true)return null;

  let strongestOther=-1;
  for(const card of prompt.cards){
    for(const attack of card.attacks??[]){
      if(attack===powerBeam||attack.gxAttack===true||
         prompt.validate(attack)!==true)continue;
      const damage=knownDamage(attack);
      // Unknown damage text could exceed Power Beam; fail closed rather
      // than treating an unmodelled attack as zero.
      if(damage===null)return null;
      strongestOther=Math.max(strongestOther,damage);
    }
  }
  if(strongestOther>=200)return null;
  return powerBeam;
}

module.exports={
  VERSION,
  MIMIKYU,
  REGIDRAGO_VSTAR,
  RADIANT_ETERNATUS,
  isPreviousApex,
  knownDamage,
  chooseNativeMimikyuPostTimelessPowerBeamPrompt
};
