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
/**
 * After G&H retrieves Telepathic Psychic Energy, its native Basic Psychic search
 * may bench Solrock+Lunatone, activating own New Moon and cancelling beneficial
 * Dimension Valley. Select real native-offered tokens while preserving discount.
 * No hidden deck/Prize information and never invent card names not offered.
 */
function selectValleyCompatibleTpeBasics(nativeOffer,state) {
  if(!nativeOffer||!Array.isArray(nativeOffer.choices)||!state||
     !nativeOffer.choices.every(x=>x&&typeof x.token==='string'&&x.token.length>0&&
       typeof x.name==='string'&&x.name.length>0)||
     !Number.isSafeInteger(state.needBasicCount)||state.needBasicCount<0||
     state.needBasicCount>2||!Number.isSafeInteger(state.openBenchSlots)||
     state.openBenchSlots<0||
     typeof state.hasSolrockInPlay!=='boolean'||
     typeof state.hasLunatoneInPlay!=='boolean'||
     typeof state.valleyDiscountNeeded!=='boolean')
    return {status:'unsupported',reason:'TPE_NATIVE_SEARCH_FACTS_MISSING'};
  if(state.needBasicCount>state.openBenchSlots)
    return {status:'blocked',reason:'INSUFFICIENT_BENCH_SLOTS'};
  if(new Set(nativeOffer.choices.map(x=>x.token)).size!==nativeOffer.choices.length)
    return {status:'unsupported',reason:'TPE_OFFER_DUPLICATE_SOURCE_TOKEN'};
  if(state.valleyDiscountNeeded&&state.hasSolrockInPlay&&state.hasLunatoneInPlay)
    return {status:'blocked',reason:'NEW_MOON_ALREADY_ACTIVE'};
  const rows=nativeOffer.choices;
  const pool=state.needBasicCount===0?[[]]:
    state.needBasicCount===1?rows.map(x=>[x]):
      rows.flatMap((x,i)=>rows.slice(i+1).map(y=>[x,y]));
  for(const picks of pool){
    const hasSol=state.hasSolrockInPlay||picks.some(x=>x.name==='Solrock');
    const hasLuna=state.hasLunatoneInPlay||picks.some(x=>x.name==='Lunatone');
    if(state.valleyDiscountNeeded&&hasSol&&hasLuna)continue;
    return {status:'candidate',tokens:picks.map(x=>x.token),
      selectedNames:picks.map(x=>x.name),
      preservedValleyDiscount:state.valleyDiscountNeeded,
      revalidateAfterEachPlacement:true,
      information:'native source options only; no deck/Prize contents assumed'};
  }
  return {status:'blocked',reason:'TPE_SEARCH_WOULD_ACTIVATE_NEW_MOON'};
}
module.exports={eligibleRoot,chooseNativeSearchPrompt,selectValleyCompatibleTpeBasics};

