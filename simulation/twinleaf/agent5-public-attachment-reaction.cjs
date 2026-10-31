'use strict';

const {visiblePrintedProfile}=
  require('./agent10-original-printing-energy-flags.cjs');

const VERSION='agent5-public-buddy-pulse-attachment-risk-v2-profiled-prizes';
const DAMAGE_COUNTERS=2;
const DAMAGE_PER_COUNTER=10;
const ATTACHMENT_KINDS=new Set(['attach-special-energy','attach-basic-energy']);

/**
 * Detect one published, visible, attachment-triggered knockout hazard.
 * This is a potential-hazard veto: Ability suppression, changed HP, and
 * other replacement/prevention effects require separate native evaluation.
 * The caller must provide a detached actorObservation, not native State.
 *
 * @param {object} view Current actor's own hand and both public boards.
 * @param {object} intent Candidate own-hand Energy attachment.
 * @param {object} [catalog] Optional global public printing profile index.
 * @returns {{potentialKnockout:boolean,reason:string,printing:string|null,
 *   remainingHp:number|null,triggerDamage:number,terminalLossPossible:boolean}}
 */
function evaluatePublicAttachmentReaction(view,intent,catalog={}){
  const base={potentialKnockout:false,reason:'outside-recognized-trigger',
    printing:null,remainingHp:null,triggerDamage:0,
    terminalLossPossible:false};
  if(!ATTACHMENT_KINDS.has(intent?.kind))return base;
  if(intent.slot!=='bench'&&intent.slot!=='active')return base;
  const own=view?.ownPublic;
  const target=intent.slot==='active'?own?.active:own?.bench?.[intent.index];
  if(!target)return {...base,reason:'no-public-target'};
  const others=[view?.opponentPublic?.active,
    ...(view?.opponentPublic?.bench??[])].filter(Boolean);
  if(!others.some(p=>p.name==='Plusle')||
     !others.some(p=>p.name==='Minun'&&p.abilities?.includes('Buddy Pulse'))){
    return {...base,reason:'no-visible-buddy-pulse-pair'};
  }
  if(!Number.isSafeInteger(target.hp)||!Number.isSafeInteger(target.damage)||
     target.hp<=0||target.damage<0){
    return {...base,reason:'unknown-effective-hp'};
  }
  const remainingHp=target.hp-target.damage;
  const triggerDamage=DAMAGE_COUNTERS*DAMAGE_PER_COUNTER;
  const potentialKnockout=remainingHp<=triggerDamage;
  // This exact two-Prize printing is checked against the supplied card DB.
  // Do not infer an arbitrary Rule Box's Prize reward from a name suffix.
  const index=catalog.publicPokemonProfileIndex;
  const profile=index instanceof Map&&typeof target.printing==='string'?
    visiblePrintedProfile(index,target.printing):null;
  const knownAward=Number.isInteger(profile?.prizesOnKnockout)&&
    profile.prizesOnKnockout>=1&&profile.prizesOnKnockout<=3?
      profile.prizesOnKnockout:
      (target.printing==='Regidrago V SIT'?2:null);
  const terminalLossPossible=potentialKnockout&&knownAward!==null&&
    Number.isSafeInteger(view?.opponentPublic?.prizeCount)&&
    view.opponentPublic.prizeCount<=knownAward;
  return {potentialKnockout,
    reason:potentialKnockout?'visible-buddy-pulse-possible-knockout':
      'visible-buddy-pulse-insufficient-damage',
    printing:target.printing??null,remainingHp,triggerDamage,
    terminalLossPossible};
}

module.exports={VERSION,evaluatePublicAttachmentReaction};
