'use strict';
/**
 * Research-only v5 actor-visible Guzma & Hala root opportunity gate.
 * No native integration, hidden deck/Prize access or assumed search inventory.
 * Caller must certify actor-owned hand, root legal frontier and high-DCI fodder;
 * native search prompts must be checked after committing the Supporter.
 */
const SUPPORTER='Guzma & Hala';
const ROLES=['stadium','tool','specialEnergy'];
const KNOWN={
  stadium:['Sky Field','Path to the Peak','Dimension Valley'],
  tool:['Stealthy Hood','Powerglass','Forest Seal Stone'],
  specialEnergy:['Telepathic Psychic Energy']
};
function eligibleRoot(view) {
  if(!view||typeof view!=='object'||!view.own||!view.plan||!view.public)
    return {status:'unsupported',reason:'MISSING_VIEW'};
  const {own,plan,public:pub}=view;
  if (![own.supporterUsed,own.supporterLocked,pub.sourceActiveToolJammer,
        plan.competingAceTrainerFinisher,plan.criticalStadiumChange,
        plan.toolHolderAvailable,plan.energyAttachmentAvailable,
        own.nativeGuzmaHalaOffered].every(x=>typeof x==='boolean') ||
       !Array.isArray(own.hand) || !own.hand.every(x=>
         x && typeof x.token==='string'&&x.token.length>0 &&
         typeof x.name==='string' && typeof x.lowOpportunityCost==='boolean') ||
       !Array.isArray(plan.wanted) || plan.wanted.some(x=>
         !x || !ROLES.includes(x.role) || !KNOWN[x.role].includes(x.name)))
    return {status:'unsupported',reason:'UNCERTIFIED_ACTOR_FIELDS'};
  // The same deck's live Solrock+Lunatone New Moon protects our Pokémon
  // from ALL Stadium effects, including beneficial Dimension Valley reduction.
  // Do not waste G&H on a purported one-energy Rondo line that cannot work.
  if(plan.wanted.some(x=>x.role==='stadium'&&x.name==='Dimension Valley')) {
    if(typeof pub.ownNewMoonActive!=='boolean' ||
       typeof plan.rondoAttackNeedsValleyDiscount!=='boolean')
      return {status:'unsupported',reason:'VALLEY_NEW_MOON_ORDER_UNCERTIFIED'};
    if(pub.ownNewMoonActive && plan.rondoAttackNeedsValleyDiscount)
      return {status:'blocked',reason:'OWN_NEW_MOON_NULLIFIES_VALLEY_DISCOUNT'};
  }
  if(new Set(own.hand.map(x=>x.token)).size!==own.hand.length)
    return {status:'unsupported',reason:'DUPLICATE_HAND_TOKEN'};
  if(own.supporterUsed||own.supporterLocked)
    return {status:'blocked',reason:'SUPPORTER_UNAVAILABLE'};
  if(plan.competingAceTrainerFinisher)
    return {status:'blocked',reason:'COMPETING_TERMINAL_SUPPORTER'};
  if(!own.nativeGuzmaHalaOffered||!own.hand.some(x=>x.name===SUPPORTER))
    return {status:'blocked',reason:'NOT_IN_NATIVE_LEGAL_FRONTIER'};
  const want=new Map(plan.wanted.map(x=>[x.role,x.name]));
  if(want.has('tool')&&!plan.toolHolderAvailable)want.delete('tool');
  if(want.has('specialEnergy')&&!plan.energyAttachmentAvailable)want.delete('specialEnergy');
  if(want.get('tool')==='Stealthy Hood'&&plan.hoodHolder==='active-mewtwo'&&pub.sourceActiveToolJammer)
    want.delete('tool');
  if(!want.size)return {status:'blocked',reason:'NO_LIVE_AXES'};
  const fodder=own.hand.filter(x=>x.name!==SUPPORTER&&x.lowOpportunityCost);
  const triple=want.has('tool')||want.has('specialEnergy');
  if(triple&&fodder.length<2) {
    if(!want.has('stadium')||!plan.criticalStadiumChange)
      return {status:'blocked',reason:'NO_TWO_DISCARDABLE_CARDS'};
    return {status:'candidate',mode:'stadium-only',firstAction:'play-supporter',
      name:SUPPORTER,discardIntents:[],wanted:{stadium:want.get('stadium')},
      revalidateAtNativePrompt:true,information:'search targets not assumed in deck'};
  }
  if(triple)return {status:'candidate',mode:'triple-search',firstAction:'play-supporter',
    name:SUPPORTER,discardIntents:fodder.slice(0,2).map(x=>x.token),
    wanted:Object.fromEntries(want),revalidateAtNativePrompt:true,
    information:'actual native discard and search prompts require fresh validation'};
  if(want.has('stadium')&&plan.criticalStadiumChange)
    return {status:'candidate',mode:'stadium-only',firstAction:'play-supporter',
      name:SUPPORTER,discardIntents:[],wanted:{stadium:want.get('stadium')},
      revalidateAtNativePrompt:true,information:'search targets not assumed in deck'};
  return {status:'blocked',reason:'STADIUM_NOT_CRITICAL'};
}
function chooseNativeSearchPrompt(offer,role,desired) {
  if(!ROLES.includes(role)||!KNOWN[role].includes(desired)||!offer||
     !Array.isArray(offer.choices) || !offer.choices.every(x=>
       x&&typeof x.name==='string'&&typeof x.token==='string'))
    return {status:'unsupported',reason:'UNKNOWN_SEARCH_PROMPT'};
  const card=offer.choices.find(x=>x.name===desired);
  return card?{status:'select-choice',token:card.token,name:card.name}:
    {status:'unavailable',reason:'EXPECTED_PRINTING_NOT_OFFERED'};
}
module.exports={eligibleRoot,chooseNativeSearchPrompt};
