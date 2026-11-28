'use strict';

/*
 * Optional source-bound continuation for the exact SCR133 Crispin selected
 * through rank-13 VS Seeker's prospective final-Prize funding line.
 * Host native prompt projection still owns legality; these decisions use only
 * actor-visible choices and never invent token/zone/card identities.
 *
 * Current base worker prefers Grass over Fire on *each* Crispin deck-search
 * choice, potentially submitting two Grass cards despite the printed
 * different-type requirement. This selector explicitly chooses one of each.
 */

const {requiredBasicForApex}=
  require('./agent47-rank13-vsseeker-funding-line.cjs');
const CRISPIN = /^Crispin SCR(?: 133)?$/i;
// Source rank13 lists MEE #9/#10; the pinned Twinleaf Basic Energy
// classes are canonical MEE #1/#2. Equivalent Basic printings are
// recognized as aliases for energy *type* only, not source inventory copies.
const GRASS = /^Grass Energy MEE(?: (?:1|9))?$/i;
const FIRE = /^Fire Energy MEE(?: (?:2|10))?$/i;

function str(v) {
  return typeof v === 'string' ? v : typeof v?.printing === 'string' ?
    v.printing : typeof v?.fullName === 'string' ? v.fullName :
      typeof v?.label === 'string' ? v.label : '';
}
function match(v,re) {return re.test(str(v));}

function chooseRank13CrispinContinuation(request) {
  const prompt=request?.prompt,view=request?.observation;
  const meta=prompt?.publicMetadata,source=prompt?.source;
  if(!prompt||!view||view.decisionKind!=='owner-prompt'||
     request.role!=='opponent' || request.seat!==view.actorSeat ||
     source?.classification!=='actor-choice' ||
     source?.sourceKind!=='card-effect' ||
     !match(source.sourcePrinting,CRISPIN) ||
     source.effectName!=='Crispin' ||
     !Array.isArray(prompt.choices))return null;

  if(prompt.promptType==='ChooseCardsPrompt') {
    if(meta?.selectionType!=='card-combination' ||
       meta?.ownerSeat!=='actor' || meta?.isOwnerVisible!==true ||
       meta?.sourceZone!=='deck' || meta?.minimumCount!==0 ||
       meta?.maximumCount!==2)return null;
    const grass=prompt.choices.find(c=>c?.kind==='card' &&
      typeof c.token==='string' && match(c,GRASS));
    const fire=prompt.choices.find(c=>c?.kind==='card' &&
      typeof c.token==='string' && match(c,FIRE));
    if(!grass||!fire||grass.token===fire.token)return null;
    // Grass first affects the native selected list's temporary-card order,
    // but not which Energy is attached (subsequent typed prompt decides).
    return {kind:'select-choices',tokens:[grass.token,fire.token]};
  }

  if(prompt.promptType==='AttachEnergyPrompt') {
    if(meta?.selectionType!=='energy-attachment' ||
       meta?.ownerSeat!=='actor' || meta?.isOwnerVisible!==true ||
       meta?.sourceZone!=='effect-revealed' ||
       meta?.minimumCount!==1 || meta?.maximumCount!==1)return null;
    const own=view.ownPublic??{};
    const active=own.active;
    const attached=active?.energies;
    // Only complete the exact GGF Apex cost: G+F -> attach Grass,
    // or G+G -> attach Fire. Other plays delegate to unchanged worker.
    const need=requiredBasicForApex(attached);
    if(!match(active, /^Regidrago VSTAR SIT(?: 136)?$/i) ||
       need===null)return null;
    const desired=need==='grass'?GRASS:FIRE;
    const candidates=prompt.choices.filter(c=>
      c?.kind==='energy' && typeof c.token==='string' &&
      match(c,desired) && c.publicMetadata?.ownerSeat==='actor' &&
      c.publicMetadata?.zone==='active' &&
      c.publicMetadata?.sourceZone==='effect-revealed' &&
      c.publicMetadata?.isOwnerVisible===true);
    if(candidates.length!==1)return null;
    return {kind:'select-choice',token:candidates[0].token};
  }
  return null;
}

module.exports={chooseRank13CrispinContinuation};
