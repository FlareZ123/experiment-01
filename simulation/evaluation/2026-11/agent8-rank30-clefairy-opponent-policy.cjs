'use strict';
/*
 * Rank 30 Lillie's Clefairy (Aichi 2026) actor-only prototype, not a game policy
 * qualification. Every selected root must be an offered native action token.
 * Native host retains ownership of hidden cards, prompts, shuffle, and legality.
 * Native fullName aliases may omit collector numbers. Match only the exact
 * source card name and set for those aliases; SOURCE_COUNTS remains the original
 * printed 60 and is not replaced by native surrogate names.
 */
const POLICY_VERSION = 'agent8-rank30-clefairy-opponent-v1';
const SOURCE_RANK = 30;
const SOURCE_LIST_BLOB_SHA1 = 'ae773f6201d7aa69d31914dbfee66f3fba692200';
const SOURCE_COUNTS = Object.freeze([
  ["Lillie's Clefairy ex JTG 56",3],['Unown AOR 30',3],
  ['Latias ex SSP 76',1],['Tapu Lele-GX GRI 60',1],['Dedenne-GX UNB 57',1],
  ['Squawkabilly ex PAL 169',1],['Crobat V DAA 104',1],['Fezandipiti ex ASC 142',1],
  ['Empoleon V BST 40',1],['Mimikyu GRI 58',1],['Dialga-GX UPR 100',1],['Minior PAR 99',1],
  ['Guzma BUS 115',3],['Marnie SSH 169',1],['Raihan EVS 152',1],
  ['Wondrous Patch PFL 94',4],['Quick Ball FST 237',4],['Field Blower GRI 125',3],
  ['Rescue Carrier EVS 154',3],['Battle VIP Pass FST 225',3],
  ["Trainers' Mail ROS 92",2],['VS Seeker PHF 109',2],['Battle Compressor PHF 92',2],
  ['Rescue Stretcher GRI 130',1],['Ultra Ball MEG 131',1],
  ['Hisuian Heavy Ball ASR 146',1],['Secret Box TWM 163',1],
  ['Forest Seal Stone SIT 156',1],['Float Stone BKT 137',1],['Sky Field ROS 89',3],
  ['Psychic Energy MEE 13',5],['Telepathic Psychic Energy POR 88',2]
]);
const P = Object.freeze({
  clefairy: /^Lillie's Clefairy ex JTG(?: 56)?\b/i,
  box: /^Secret Box TWM(?: 163)?\b/i,
  basicPsychic: /^(?:Basic )?Psychic Energy(?: MEE(?: 13)?)?\b/i,
  telepathic: /^(?:Telepathic Psychic Energy POR(?: 88)?|Telepath \[P\] Energy M3)\b/i,
  sky: /^Sky Field ROS(?: 89)?\b/i,
  vip: /^Battle VIP Pass FST(?: 225)?\b/i,
  patch: /^(?:Wondrous Patch PFL(?: 94)?|Wonder Patch MBD)\b/i,
  fss: /^Forest Seal Stone SIT(?: 156)?\b/i,
  float: /^Float Stone BKT(?: 137)?\b/i,
  guzma: /^Guzma BUS(?: 115)?\b/i,
  marnie: /^Marnie SSH(?: 169)?\b/i,
  quickBall: /^Quick Ball FST(?: 237)?\b/i,
  blower: /^Field Blower GRI(?: 125)?\b/i,
  compressor: /^Battle Compressor PHF(?: 92)?\b/i,
  vsSeeker: /^VS Seeker PHF(?: 109)?\b/i,
  carrier: /^Rescue Carrier EVS(?: 154)?\b/i,
  unown: /^Unown AOR(?: 30)?\b/i,
  mimikyu: /^Mimikyu GRI(?: 58)?\b/i,
  minior: /^Minior PAR(?: 99)?\b/i,
  snorlax: /^Snorlax PGO(?: 55)?\b/i,
  mail: /^Trainers' Mail ROS(?: 92)?\b/i,
  ultra: /^Ultra Ball MEG(?: 131)?\b/i
});
const arr = value => Array.isArray(value) ? value : [];
const text = value => typeof value === 'string' ? value : value?.printing ?? value?.fullName ?? value?.label ?? '';
const has = (value, pattern) => pattern.test(text(value));
const slots = player => [player?.active,...arr(player?.bench)].filter(p => p && p.concealed !== true);
const safeInt = v => Number.isSafeInteger(v) && v >= 0;
// The shared v3 worker protocol admits only its existing fixed reason-code set.
// Keep source-local diagnostics in code, but map every external abstention onto
// one accepted public code; never change the shared protocol for this rank.
const PUBLIC_ABORT = Object.freeze({
  R30_BOX_PROMPT_UNSUPPORTED:'UNSUPPORTED_CARD_COMBINATION_SOURCE',
  R30_BOX_THREE_SAFE_PAYMENTS_UNAVAILABLE:'NO_LEGAL_CARD_SET',
  R30_BOX_SEARCH_MINIMUM_UNAVAILABLE:'NO_LEGAL_CARD_SET',
  R30_BOX_NO_LEGAL_EMPTY_CHOICE:'NO_LEGAL_CARD_SET',
  R30_QUICKBALL_PROMPT_UNSUPPORTED:'UNSUPPORTED_CARD_COMBINATION_SOURCE',
  R30_QUICKBALL_NO_SAFE_PAYMENT:'NO_USEFUL_CARD_CHOICE',
  R30_QUICKBALL_NO_VALID_TARGET:'NO_LEGAL_CARD_SET',
  R30_NO_OFFERED_ROOT:'NO_EXECUTABLE_ACTION',
  R30_ROOT_UNSUPPORTED:'NO_SUPPORTED_ROOT_ACTION',
  R30_OBSERVATION_INCOMPLETE:'ROLE_SEAT_OBSERVATION_MISMATCH',
  R30_UNSUPPORTED_PROMPT_FAMILY:'UNSUPPORTED_PROMPT_TYPE',
  R30_VIP_PROMPT_UNSUPPORTED:'UNSUPPORTED_CARD_COMBINATION_SOURCE',
  R30_VIP_NO_TARGET:'NO_LEGAL_CARD_SET',
  R30_PATCH_PROMPT_UNSUPPORTED:'UNSUPPORTED_PROMPT_TYPE',
  R30_PATCH_NO_ELIGIBLE_BENCH:'NO_VISIBLE_POKEMON_TARGET',
  R30_TELEPATH_PROMPT_UNSUPPORTED:'UNSUPPORTED_CARD_COMBINATION_SOURCE',
  R30_TELEPATH_NO_TARGET:'NO_LEGAL_CARD_SET',
  R30_STAR_PROMPT_UNSUPPORTED:'UNSUPPORTED_CARD_COMBINATION_SOURCE',
  R30_STAR_NO_CARD:'NO_LEGAL_CARD_SET',
  R30_GUZMA_PROMPT_UNSUPPORTED:'UNSUPPORTED_POKEMON_PROMPT',
  R30_GUZMA_NO_LEGAL_TARGET:'NO_VISIBLE_POKEMON_TARGET',
  R30_COMPRESSOR_PROMPT_UNSUPPORTED:'UNSUPPORTED_CARD_COMBINATION_SOURCE',
  R30_COMPRESSOR_NO_TARGET:'NO_LEGAL_CARD_SET',
  R30_VSSEEKER_PROMPT_UNSUPPORTED:'UNSUPPORTED_CARD_COMBINATION_SOURCE',
  R30_VSSEEKER_NO_GUZMA:'NO_LEGAL_CARD_SET',
  R30_CARRIER_PROMPT_UNSUPPORTED:'UNSUPPORTED_CARD_COMBINATION_SOURCE',
  R30_CARRIER_NO_TARGET:'NO_LEGAL_CARD_SET',
  R30_MINIOR_PROMPT_UNSUPPORTED:'UNRECOGNIZED_SIMPLE_PROMPT',
  R30_MINIOR_NO_CONFIRM:'UNRECOGNIZED_SIMPLE_PROMPT',
  R30_MAIL_PROMPT_UNSUPPORTED:'UNSUPPORTED_CARD_COMBINATION_SOURCE',
  R30_MAIL_NO_USEFUL_CARD:'NO_LEGAL_CARD_SET',
  R30_ULTRA_PROMPT_UNSUPPORTED:'UNSUPPORTED_CARD_COMBINATION_SOURCE',
  R30_ULTRA_PAYMENT_UNAVAILABLE:'NO_LEGAL_CARD_SET',
  R30_ULTRA_NO_POKEMON:'NO_LEGAL_CARD_SET',
  R30_ENGINE_SETUP_UNSUPPORTED:'UNSUPPORTED_PROMPT_TYPE',
  R30_ENGINE_SETUP_NO_BASIC:'NO_LEGAL_CARD_SET',
  R30_ENGINE_SETUP_NO_EMPTY:'NO_LEGAL_CARD_SET'
});
const no = reasonCode => ({kind:'abstain',reasonCode:PUBLIC_ABORT[reasonCode]??reasonCode});
const act = x => ({kind:'select-action',token:x.token});
const picks = xs => ({kind:'select-choices',tokens:xs.map(x=>x.token)});
function sameSource(a,p) {return has(a?.source?.sourcePrinting ?? a?.publicMetadata?.sourcePrinting,p);}
function ownPrinting(a) {return a?.actorPrinting ?? a?.publicMetadata?.sourcePrinting ?? '';}
function benchCount(player) {return arr(player?.bench).filter(v=>v&&v.concealed!==true).length;}
function stadium(o) {return [...arr(o?.ownPublic?.stadium),...arr(o?.opponentPublic?.stadium)].some(c=>has(c,P.sky));}
function copyCount(hand,p) {return arr(hand).filter(c=>has(c,p)).length;}
function basicDiscard(own) {return arr(own?.discard).some(c=>has(c,P.basicPsychic));}
function hasBenchedPsychic(own) {
  return arr(own?.bench).some(c=>c&&(
    has(c,P.clefairy)||/^Latias ex SSP(?: 76)?\b/i.test(text(c))||
    /^Tapu Lele-GX GRI(?: 60)?\b/i.test(text(c))||
    /^Mimikyu GRI(?: 58)?\b/i.test(text(c))));
}
function availableCards(request) {return arr(request?.actionFrontier?.items).filter(a=>typeof a?.token==='string'&&a.token.length>0);}
function isLaterTurn(observation) {
  const ownTurn = observation?.ownTurnResources?.ownTurnNumber ?? observation?.ownPublic?.turnNumber;
  if(safeInt(ownTurn))return ownTurn>=2;
  const globalTurn=observation?.globalTurn;
  return safeInt(globalTurn) && globalTurn>=3;
}
// Scores are only local discard preferences. Preserve Telepathic, Clefairy,
// ACE SPEC, Forest Seal Stone and live gust; never discard them here.
function discardScore(value,o) {
  const h = o.ownHand, p = text(value);
  if (has(p,P.basicPsychic) && hasBenchedPsychic(o.ownPublic)) {
    const own=o.ownPublic,hand=arr(o.ownHand);
    const basicCopies=copyCount(hand,P.basicPsychic);
    const telepathCopies=copyCount(hand,P.telepathic);
    const manualAvailable=o.ownTurnResources?.energyPlayedTurn===0;
    const needsClef=has(own.active,P.clefairy)&&
      arr(own.active.energies).length<2;
    const miniorCounter=miniorStallOpportunity(o)?.knockout&&
      !slots(own).some(x=>has(x,P.minior)&&arr(x.energies).length>=1);
    // The only hand Energy cannot be burned into search while it powers
    // this-turn Rondo or Minior's forced switch against a Snorlax Block.
    if(basicCopies===1&&manualAvailable&&telepathCopies===0&&
      (needsClef||miniorCounter))return 0;
    if(basicCopies>1)return 90;
    if(hand.some(x=>has(x,P.patch))&&hasBenchedPsychic(own))return 88;
    if(manualAvailable&&telepathCopies===0&&
       slots(own).every(x=>arr(x.energies).length===0))return 15;
    return 55;
  }
  if (has(p,P.vip) && isLaterTurn(o)) return 80;
  if (has(p,P.sky) && stadium(o) && copyCount(h,P.sky)>1) return 70;
  if (has(p,P.quickBall) && copyCount(h,P.quickBall)>1 && slots(o.ownPublic).some(c=>has(c,P.clefairy))) return 35;
  return 0;
}
function safeDiscardPayment(o,choices,count) {
  const ownHand = arr(o.ownHand);
  const seen = new Set();
  const options = arr(choices).filter(c=>c.kind==='card' && typeof c.token==='string' &&
    !seen.has(c.token) && seen.add(c.token) && ownHand.some(h=>text(h)===text(c)))
    .map((choice,i)=>({choice,score:discardScore(choice,o),i}))
    .filter(row=>row.score>0)
    .sort((a,b)=>b.score-a.score||a.i-b.i);
  const manualAvailable=o.ownTurnResources?.energyPlayedTurn===0;
  const needClef=has(o.ownPublic?.active,P.clefairy)&&
    arr(o.ownPublic?.active?.energies).length<2;
  const needMinior=miniorStallOpportunity(o)?.knockout&&
    !slots(o.ownPublic).some(c=>has(c,P.minior)&&arr(c.energies).length>=1);
  const reserveBasic=manualAvailable&&copyCount(ownHand,P.telepathic)===0&&
    (needClef||needMinior)?1:0;
  const maxBasicSpent=Math.max(0,copyCount(ownHand,P.basicPsychic)-reserveBasic);
  const result=[];let basicSpent=0;
  for(const row of options){
    if(has(row.choice,P.basicPsychic)){
      if(basicSpent>=maxBasicSpent)continue;
      basicSpent++;
    }
    result.push(row.choice);
    if(result.length===count)break;
  }
  return result.length>=count?result:null;
}
function discardPayment(o,choices){return safeDiscardPayment(o,choices,3);}
function proposedDeckSearch(o,choices) {
  const offered=arr(choices).filter(c=>c.kind==='card' && typeof c.token==='string');
  const wantPatch=basicDiscard(o.ownPublic)&&hasBenchedPsychic(o.ownPublic);
  const wantsFss=slots(o.ownPublic).some(c=>/\bV\b/.test(text(c)))&&o.ownTurnResources?.vstarUsed!==true;
  const candidates=[
    [wantPatch?P.patch:P.quickBall,'Item'],
    [wantsFss?P.fss:P.float,'Tool'],
    [P.guzma,'Supporter'],
    [P.sky,'Stadium']
  ];
  const result=[];
  for(const [pattern] of candidates) {
    const card=offered.find(c=>has(c,pattern)&&!result.some(z=>z.token===c.token));
    if(card)result.push(card);
  }
  return result;
}
function boxPrompt(request) {
  const p=request.prompt, m=p.publicMetadata??{},o=request.observation;
  if(p.promptType!=='ChooseCardsPrompt'||m.selectionType!=='card-combination'||
     m.ownerSeat!=='actor'||m.isOwnerVisible!==true||
     !safeInt(m.minimumCount)||!safeInt(m.maximumCount)||
     m.minimumCount>m.maximumCount) return no('R30_BOX_PROMPT_UNSUPPORTED');
  let selected;
  if(m.sourceZone==='hand' && m.minimumCount===3 && m.maximumCount===3) {
    selected=discardPayment(o,p.choices);
    if(!selected)return no('R30_BOX_THREE_SAFE_PAYMENTS_UNAVAILABLE');
  } else if(m.sourceZone==='deck' && m.maximumCount<=4) {
    selected=proposedDeckSearch(o,p.choices).slice(0,m.maximumCount);
    if(selected.length<m.minimumCount)return no('R30_BOX_SEARCH_MINIMUM_UNAVAILABLE');
  } else return no('R30_BOX_PROMPT_UNSUPPORTED');
  if(!selected.length){
    const empty=arr(p.choices).find(x=>x.kind==='empty-selection'&&typeof x.token==='string');
    return m.minimumCount===0&&empty?{kind:'select-choice',token:empty.token}:
      no('R30_BOX_NO_LEGAL_EMPTY_CHOICE');
  }
  return picks(selected);
}
function telepathPrompt(request) {
  const p=request.prompt,m=p.publicMetadata??{},o=request.observation;
  if(p.promptType!=='ChooseCardsPrompt'||m.selectionType!=='card-combination'||
    m.sourceZone!=='deck'||m.ownerSeat!=='actor'||m.isOwnerVisible!==true||
    !safeInt(m.minimumCount)||!safeInt(m.maximumCount)||m.maximumCount>2)
    return no('R30_TELEPATH_PROMPT_UNSUPPORTED');
  const cards=arr(p.choices).filter(c=>c.kind==='card'&&typeof c.token==='string');
  const result=[];
  const get=pattern=>cards.find(c=>has(c,pattern)&&!result.some(x=>x.token===c.token));
  const own=slots(o.ownPublic);
  const ownHand=arr(o.ownHand);
  const clefs=own.filter(x=>has(x,P.clefairy)).length+
    ownHand.filter(x=>has(x,P.clefairy)).length;
  if(clefs===0&&result.length<m.maximumCount){
    const x=get(P.clefairy);if(x)result.push(x);
  }
  if(result.length<m.maximumCount&&!own.some(x=>/^Latias ex SSP(?: 76)?\b/i.test(text(x)))&&
     !ownHand.some(x=>/^Latias ex SSP(?: 76)?\b/i.test(text(x)))){
    const x=get(/^Latias ex SSP(?: 76)?\b/i);if(x)result.push(x);
  }
  if(clefs+result.filter(x=>has(x,P.clefairy)).length<2&&result.length<m.maximumCount){
    const x=get(P.clefairy);if(x)result.push(x);
  }
  if(result.length<m.maximumCount&&result.length===0){
    const x=get(/^Unown AOR(?: 30)?\b/i)??get(/^Mimikyu GRI(?: 58)?\b/i)??
      get(/^Tapu Lele-GX GRI(?: 60)?\b/i);
    if(x)result.push(x);
  }
  if(result.length<m.minimumCount)return no('R30_TELEPATH_NO_TARGET');
  if(result.length===0){
    const empty=arr(p.choices).find(c=>c.kind==='empty-selection'&&typeof c.token==='string');
    return m.minimumCount===0&&empty?{kind:'select-choice',token:empty.token}:
      no('R30_TELEPATH_NO_TARGET');
  }
  return picks(result);
}

function poweredBenchClefairy(o) {
  return arr(o?.ownPublic?.bench).map((pokemon,index)=>({pokemon,index})).
    filter(x=>has(x.pokemon,P.clefairy)&&arr(x.pokemon?.energies).length>=2);
}
function guzmaOpportunity(o) {
  const own=o?.ownPublic,opp=o?.opponentPublic;
  if(!own||!opp||!poweredBenchClefairy(o).length)return null;
  const baseDamage=20*(1+benchCount(own)+benchCount(opp));
  const matches=arr(opp.bench).map((pokemon,index)=>({pokemon,index,
    prizeValue:sourcePrizeTarget(pokemon),remaining:pokemon?.hp-pokemon?.damage,
    // Guzma promotes a Benched Clefairy: use its future Psychic weakness,
    // not merely the current active Pokémon's weakness modifier.
    predictedDamage:baseDamage*clefairyWeaknessAgainst(o,pokemon)}))
    .filter(t=>t.pokemon && Number.isFinite(t.remaining)&&t.remaining>0&&
      t.prizeValue>=2 && t.predictedDamage>=t.remaining)
    .sort((a,b)=>b.prizeValue-a.prizeValue||a.remaining-b.remaining||a.index-b.index);
  return matches[0]??null;
}
function guzmaPrompt(request) {
  const p=request.prompt,m=p.publicMetadata??{},o=request.observation;
  if(p.promptType!=='ChoosePokemonPrompt'||m.selectionType!=='pokemon'||
    m.targetZone!=='bench'||!safeInt(m.minimumCount)||
    !safeInt(m.maximumCount)||m.minimumCount!==1||m.maximumCount!==1)
    return no('R30_GUZMA_PROMPT_UNSUPPORTED');
  const choices=arr(p.choices).filter(c=>c.kind==='pokemon'&&
    typeof c.token==='string'&&c.publicMetadata?.targetZone==='bench'&&
    safeInt(c.publicMetadata?.benchIndex));
  const opponentChoices=choices.filter(c=>c.publicMetadata.ownerSeat==='opponent');
  if(opponentChoices.length){
    const victim=guzmaOpportunity(o);
    const target=opponentChoices.find(c=>c.publicMetadata.benchIndex===victim?.index);
    return target?picks([target]):no('R30_GUZMA_NO_LEGAL_TARGET');
  }
  const ownChoices=choices.filter(c=>c.publicMetadata.ownerSeat==='actor');
  if(ownChoices.length) {
    const powered=new Set(poweredBenchClefairy(o).map(x=>x.index));
    const target=ownChoices.find(c=>powered.has(c.publicMetadata.benchIndex));
    return target?picks([target]):no('R30_GUZMA_NO_LEGAL_TARGET');
  }
  return no('R30_GUZMA_NO_LEGAL_TARGET');
}

function supporterAvailable(o) {
  const used=o?.ownTurnResources?.supporterPlayedTurn;
  const turn=o?.globalTurn;
  return used===0 || (safeInt(used)&&safeInt(turn)&&used<turn);
}
function compressorOpportunity(o,{enablePatchProjection=false}={}) {
  const hand=arr(o?.ownHand),discard=arr(o?.ownPublic?.discard);
  const needsGuzma=Boolean(guzmaOpportunity(o)) && supporterAvailable(o) &&
    hand.some(c=>has(c,P.vsSeeker)) &&
    !hand.some(c=>has(c,P.guzma))&&!discard.some(c=>has(c,P.guzma));
  const needsPsychic=enablePatchProjection&&hand.some(c=>has(c,P.patch))&&
    hasBenchedPsychic(o.ownPublic)&&!discard.some(c=>has(c,P.basicPsychic));
  return {needsGuzma,needsPsychic,active:needsGuzma||needsPsychic};
}
function battleCompressorPrompt(request,{enablePatchProjection=false}={}) {
  const p=request.prompt,m=p.publicMetadata??{},o=request.observation;
  if(p.promptType!=='ChooseCardsPrompt'||m.selectionType!=='card-combination'||
     m.sourceZone!=='deck'||m.ownerSeat!=='actor'||m.isOwnerVisible!==true||
     !safeInt(m.minimumCount)||!safeInt(m.maximumCount)||m.maximumCount>3)
    return no('R30_COMPRESSOR_PROMPT_UNSUPPORTED');
  const goal=compressorOpportunity(o,{enablePatchProjection});
  const offered=arr(p.choices).filter(c=>c.kind==='card'&&typeof c.token==='string');
  const selected=[];
  if(goal.needsGuzma){
    const guzma=offered.find(x=>has(x,P.guzma));if(guzma)selected.push(guzma);
  }
  if(goal.needsPsychic&&selected.length<m.maximumCount){
    const energy=offered.find(x=>has(x,P.basicPsychic)&&
      !selected.some(y=>y.token===x.token));
    if(energy)selected.push(energy);
  }
  if(selected.length<m.minimumCount)return no('R30_COMPRESSOR_NO_TARGET');
  if(!selected.length){
    const empty=arr(p.choices).find(c=>c.kind==='empty-selection'&&typeof c.token==='string');
    return m.minimumCount===0&&empty?{kind:'select-choice',token:empty.token}:
      no('R30_COMPRESSOR_NO_TARGET');
  }
  return picks(selected);
}
function vsSeekerPrompt(request) {
  const p=request.prompt,m=p.publicMetadata??{},o=request.observation;
  if(p.promptType!=='ChooseCardsPrompt'||m.selectionType!=='card-combination'||
     m.sourceZone!=='discard'||m.ownerSeat!=='actor'||m.isOwnerVisible!==true||
     !safeInt(m.minimumCount)||!safeInt(m.maximumCount)||m.maximumCount!==1)
    return no('R30_VSSEEKER_PROMPT_UNSUPPORTED');
  const choices=arr(p.choices).filter(c=>c.kind==='card'&&typeof c.token==='string');
  const needsGuzma=Boolean(guzmaOpportunity(o))&&supporterAvailable(o);
  const guzma=needsGuzma?choices.find(c=>has(c,P.guzma)):null;
  if(guzma)return picks([guzma]);
  if(m.minimumCount===0){
    const empty=arr(p.choices).find(c=>c.kind==='empty-selection'&&typeof c.token==='string');
    if(empty)return {kind:'select-choice',token:empty.token};
  }
  return no('R30_VSSEEKER_NO_GUZMA');
}

function carrierOpportunity(o) {
  const own=o?.ownPublic;
  if(!own||!arr(own.discard).some(x=>has(x,P.unown)))return false;
  const cap=stadium(o)?8:5;
  const room=benchCount(own)<cap;
  const active=own.active;
  const ro=projectedRondo(o);
  if(ro&&ro.damage>=ro.remaining)return false;
  // Self-discarded 60HP Unown is recyclable, refills Rondo's one-prize Bench
  // and can draw later. Do not recover if all slots are already occupied.
  return room||arr(own.bench).some(x=>has(x,P.unown)&&
    arr(o.ownHand).length<=2);
}
function rescueCarrierPrompt(request) {
  const p=request.prompt,m=p.publicMetadata??{},o=request.observation;
  if(p.promptType!=='ChooseCardsPrompt'||m.selectionType!=='card-combination'||
    m.sourceZone!=='discard'||m.ownerSeat!=='actor'||m.isOwnerVisible!==true||
    !safeInt(m.minimumCount)||!safeInt(m.maximumCount)||m.maximumCount>2)
    return no('R30_CARRIER_PROMPT_UNSUPPORTED');
  const offered=arr(p.choices).filter(c=>c.kind==='card'&&typeof c.token==='string');
  const picked=[];
  const choose=pat=>offered.find(c=>has(c,pat)&&!picked.some(x=>x.token===c.token));
  while(picked.length<m.maximumCount){
    const x=choose(P.unown);if(!x)break;picked.push(x);
  }
  const enemy=slots(o.opponentPublic).some(x=>/^Regidrago V(?:STAR)? SIT\b/i.test(text(x)));
  if(enemy&&picked.length<m.maximumCount&&!slots(o.ownPublic).some(x=>has(x,P.mimikyu))){
    const x=choose(P.mimikyu);if(x)picked.push(x);
  }
  if(picked.length<m.minimumCount)return no('R30_CARRIER_NO_TARGET');
  if(!picked.length) {
    const empty=arr(p.choices).find(c=>c.kind==='empty-selection'&&typeof c.token==='string');
    return m.minimumCount===0&&empty?{kind:'select-choice',token:empty.token}:
      no('R30_CARRIER_NO_TARGET');
  }
  return picks(picked);
}

function trainersMailPriority(name,o,{enablePatchProjection=false}={}) {
  const own=o.ownPublic;
  const current=slots(own);
  const active=own?.active;
  const remaining=projectedRondo(o);
  if(has(name,P.mail))return -100; // Rules forbid Trainers' Mail finding itself.
  if(has(name,P.vip))return !isLaterTurn(o)&&benchCount(own)<(stadium(o)?8:5)?100:-100;
  if(has(name,P.guzma))return guzmaOpportunity(o)?95:30;
  if(has(name,P.quickBall)) {
    const clefs=current.some(x=>has(x,P.clefairy))||
      o.ownHand.some(x=>has(x,P.clefairy));
    const miniorCounter=miniorStallOpportunity(o)?.knockout&&
      !current.some(x=>has(x,P.minior));
    return !clefs||miniorCounter?90:45;
  }
  if(has(name,P.carrier))return carrierOpportunity(o)?88:20;
  if(has(name,P.patch))return enablePatchProjection&&basicDiscard(own)&&
    hasBenchedPsychic(own)?87:15;
  if(has(name,P.vsSeeker))return guzmaOpportunity(o)&&
    arr(own.discard).some(x=>has(x,P.guzma))?86:25;
  if(has(name,P.box))return canStartBox(o)?83:20;
  if(has(name,P.ultra))return ultraOpportunity(o)?78:20;
  if(has(name,P.sky))return !stadium(o)&&remaining&&
    remaining.damage<remaining.remaining&&remaining.damage+rondoIncrement(o)>=remaining.remaining?82:48;
  if(has(name,P.fss))return o.ownTurnResources?.vstarUsed===false&&
    current.some(x=>/\b(?:Crobat V DAA|Empoleon V BST)\b/i.test(text(x)))?80:35;
  if(has(name,P.compressor))return compressorOpportunity(o,{enablePatchProjection}).active?78:20;
  if(has(name,P.marnie))return threatenSecondTarget(o)?70:35;
  if(has(name,P.telepathic)||has(name,P.basicPsychic))return 0; // Not Trainers.
  if(has(name,P.blower))return arr(o.opponentPublic?.stadium).length||
    current.some(x=>arr(x.tools).some(t=>/^(?:Stealthy Hood|Float Stone)\b/i.test(text(t))))?55:15;
  return 0; // Unhandled source cannot be presented as a useful search hit.
}
function trainersMailPrompt(request,{enablePatchProjection=false}={}) {
  const p=request.prompt,m=p.publicMetadata??{},o=request.observation;
  if(p.promptType!=='ChooseCardsPrompt'||m.selectionType!=='card-combination'||
    m.sourceZone!=='deck'||m.ownerSeat!=='actor'||m.isOwnerVisible!==true||
    !safeInt(m.minimumCount)||!safeInt(m.maximumCount)||m.maximumCount>1)
    return no('R30_MAIL_PROMPT_UNSUPPORTED');
  const ranked=arr(p.choices).filter(x=>x.kind==='card'&&typeof x.token==='string')
    .map((x,index)=>({x,index,score:trainersMailPriority(x,o,{enablePatchProjection})}))
    .filter(r=>r.score>0).sort((a,b)=>b.score-a.score||a.index-b.index);
  if(ranked.length)return picks([ranked[0].x]);
  const empty=arr(p.choices).find(x=>x.kind==='empty-selection'&&typeof x.token==='string');
  return m.minimumCount===0&&empty?{kind:'select-choice',token:empty.token}:
    no('R30_MAIL_NO_USEFUL_CARD');
}

function ultraOpportunity(o) {
  const own=o?.ownPublic;
  if(!own||!safeInt(own.deckCount)||own.deckCount<=0)return false;
  const clefs=slots(own).filter(x=>has(x,P.clefairy)).length+
    arr(o.ownHand).filter(x=>has(x,P.clefairy)).length;
  const miniorNeeded=miniorStallOpportunity(o)?.knockout&&
    !slots(own).some(x=>has(x,P.minior))&&!o.ownHand.some(x=>has(x,P.minior));
  if(clefs>0&&!miniorNeeded)return false;
  const cap=stadium(o)?8:5;
  if(benchCount(own)>=cap)return false;
  const options=arr(o.ownHand).filter(c=>!has(c,P.ultra))
    .map((c,i)=>({kind:'card',token:'candidate-'+i,printing:text(c)}));
  return Boolean(safeDiscardPayment(o,options,2));
}
function ultraBallPrompt(request) {
  const p=request.prompt,m=p.publicMetadata??{},o=request.observation;
  if(p.promptType!=='ChooseCardsPrompt'||m.selectionType!=='card-combination'||
    m.ownerSeat!=='actor'||m.isOwnerVisible!==true||!safeInt(m.minimumCount)||
    !safeInt(m.maximumCount)||m.minimumCount>m.maximumCount)
    return no('R30_ULTRA_PROMPT_UNSUPPORTED');
  if(m.sourceZone==='hand'&&m.minimumCount===2&&m.maximumCount===2){
    const payment=safeDiscardPayment(o,p.choices,2);
    return payment?picks(payment):no('R30_ULTRA_PAYMENT_UNAVAILABLE');
  }
  if(m.sourceZone==='deck'&&m.maximumCount===1){
    const choices=arr(p.choices).filter(c=>c.kind==='card'&&typeof c.token==='string');
    const stall=miniorStallOpportunity(o)?.knockout &&
      !slots(o.ownPublic).some(x=>has(x,P.minior));
    const wanted=stall?choices.find(x=>has(x,P.minior)):null;
    const firstClef=choices.find(x=>has(x,P.clefairy));
    const latias=choices.find(x=>/^Latias ex SSP(?: 76)?\b/i.test(text(x)));
    const chosen=wanted??firstClef??latias;
    if(chosen)return picks([chosen]);
    const empty=arr(p.choices).find(c=>c.kind==='empty-selection'&&typeof c.token==='string');
    return m.minimumCount===0&&empty?{kind:'select-choice',token:empty.token}:
      no('R30_ULTRA_NO_POKEMON');
  }
  return no('R30_ULTRA_PROMPT_UNSUPPORTED');
}

function starNeedsResource(o,{enablePatchProjection=false}={}) {
  if(o?.ownTurnResources?.vstarUsed!==false)return false;
  const own=slots(o.ownPublic),hand=arr(o.ownHand);
  const hasClef=own.some(x=>has(x,P.clefairy))||hand.some(x=>has(x,P.clefairy));
  if(!hasClef)return true;
  if(enablePatchProjection&&basicDiscard(o.ownPublic)&&hasBenchedPsychic(o.ownPublic)&&
    !hand.some(x=>has(x,P.patch)))return true;
  const active=o.ownPublic?.active;
  const nextEnergy=o.ownTurnResources?.energyPlayedTurn===0;
  if(has(active,P.clefairy)&&arr(active.energies).length<2&&nextEnergy&&
     !hand.some(x=>has(x,P.basicPsychic)||has(x,P.telepathic)))return true;
  const ro=projectedRondo(o);
  if(has(active,P.clefairy)&&ro&&ro.remaining>ro.damage&&ro.remaining<=ro.damage+20&&
    benchCount(o.ownPublic)===5&&!stadium(o)&&hand.some(x=>has(x,P.clefairy)))
    return true;
  return false;
}
function starAlchemyPrompt(request,{enablePatchProjection=false}={}) {
  const p=request.prompt,m=p.publicMetadata??{},o=request.observation;
  if(p.promptType!=='ChooseCardsPrompt'||m.selectionType!=='card-combination'||
    m.sourceZone!=='deck'||m.ownerSeat!=='actor'||m.isOwnerVisible!==true||
    !safeInt(m.minimumCount)||!safeInt(m.maximumCount)||m.maximumCount!==1)
    return no('R30_STAR_PROMPT_UNSUPPORTED');
  const cards=arr(p.choices).filter(c=>c.kind==='card'&&typeof c.token==='string');
  const own=slots(o.ownPublic),hand=arr(o.ownHand),ro=projectedRondo(o);
  const seek=pattern=>cards.find(c=>has(c,pattern));
  let target=null;
  if(!own.some(x=>has(x,P.clefairy))&&!hand.some(x=>has(x,P.clefairy)))
    target=seek(P.clefairy)??seek(P.quickBall);
  if(!target&&enablePatchProjection&&basicDiscard(o.ownPublic)&&
     hasBenchedPsychic(o.ownPublic))
    target=seek(P.patch);
  if(!target&&has(o.ownPublic?.active,P.clefairy)&&ro&&
     ro.remaining>ro.damage&&ro.remaining<=ro.damage+20&&
     benchCount(o.ownPublic)===5&&!stadium(o))
    target=seek(P.sky);
  if(!target&&has(o.ownPublic?.active,P.clefairy)&&
     arr(o.ownPublic?.active?.energies).length<2)
    target=seek(P.telepathic)??seek(P.basicPsychic);
  if(!target)target=seek(P.guzma)??seek(P.telepathic)??seek(P.basicPsychic)??
    seek(P.box)??seek(P.sky)??seek(P.clefairy);
  if(!target && cards.length)target=cards[0];
  if(target)return picks([target]);
  const empty=arr(p.choices).find(c=>c.kind==='empty-selection'&&typeof c.token==='string');
  return m.minimumCount===0&&empty?{kind:'select-choice',token:empty.token}:
    no('R30_STAR_NO_CARD');
}

function vipPrompt(request) {
  const p=request.prompt,m=p.publicMetadata??{},o=request.observation;
  if(p.promptType!=='ChooseCardsPrompt'||m.selectionType!=='card-combination'||
    m.ownerSeat!=='actor'||m.isOwnerVisible!==true||m.sourceZone!=='deck'||
    !safeInt(m.minimumCount)||!safeInt(m.maximumCount)||m.maximumCount>2)
    return no('R30_VIP_PROMPT_UNSUPPORTED');
  const offered=arr(p.choices).filter(x=>x.kind==='card'&&typeof x.token==='string');
  const picked=[];
  const find=pattern=>offered.find(x=>has(x,pattern)&&!picked.some(y=>y.token===x.token));
  const stall=miniorStallOpportunity(o);
  if(stall?.knockout && !slots(o.ownPublic).some(x=>has(x,P.minior))) {
    const minior=find(P.minior);
    if(minior)picked.push(minior);
  }
  const clefsAlready=slots(o.ownPublic).filter(x=>has(x,P.clefairy)).length+
    o.ownHand.filter(x=>has(x,P.clefairy)).length;
  // A first Clefairy and Latias enable attacking + retreat mobility.
  if(clefsAlready===0 && picked.length<m.maximumCount){
    const x=find(P.clefairy);if(x)picked.push(x);
  }
  if(picked.length<m.maximumCount &&
     !slots(o.ownPublic).some(x=>/^Latias ex SSP(?: 76)?\b/i.test(text(x))) &&
     !o.ownHand.some(x=>/^Latias ex SSP(?: 76)?\b/i.test(text(x)))){
    const x=find(/^Latias ex SSP(?: 76)?\b/i);if(x)picked.push(x);
  }
  if(picked.length<m.maximumCount && clefsAlready+
      picked.filter(x=>has(x,P.clefairy)).length<2){
    const x=find(P.clefairy);if(x)picked.push(x);
  }
  if(picked.length===0){
    const x=find(/^Mimikyu GRI(?: 58)?\b/i)??find(/^Unown AOR(?: 30)?\b/i);
    if(x)picked.push(x);
  }

  if(picked.length<m.minimumCount)return no('R30_VIP_NO_TARGET');
  if(picked.length===0){
    const empty=arr(p.choices).find(x=>x.kind==='empty-selection'&&typeof x.token==='string');
    return m.minimumCount===0&&empty?{kind:'select-choice',token:empty.token}:
      no('R30_VIP_NO_TARGET');
  }
  return picks(picked);
}

function patchPrompt(request) {
  const p=request.prompt,m=p.publicMetadata??{},o=request.observation;
  if(p.promptType!=='AttachEnergyPrompt'||m.selectionType!=='energy-attachment'||
    m.ownerSeat!=='actor'||m.isOwnerVisible!==true||m.sourceZone!=='discard')
    return no('R30_PATCH_PROMPT_UNSUPPORTED');
  const options=arr(p.choices).filter(c=>c.kind==='energy'&&
    typeof c.token==='string'&&c.publicMetadata?.sourceZone==='discard'&&
    c.publicMetadata?.ownerSeat==='actor'&&
    safeInt(c.publicMetadata?.benchIndex));
  const best=options.map(c=>{
    const target=o.ownPublic?.bench?.[c.publicMetadata.benchIndex];
    return {c,score:has(target,P.clefairy)?4:
      /^Tapu Lele-GX GRI(?: 60)?\b/i.test(text(target))?3:
      /^Mimikyu GRI(?: 58)?\b/i.test(text(target))?2:
      /^Latias ex SSP(?: 76)?\b/i.test(text(target))?1:0};
  }).filter(r=>r.score>0).sort((a,b)=>b.score-a.score)[0];
  return best?{kind:'select-choice',token:best.c.token}:
    no('R30_PATCH_NO_ELIGIBLE_BENCH');
}

function canStartQuickBall(o) {
  if(!o||!Array.isArray(o.ownHand)||!safeInt(o.ownPublic?.deckCount)||
    o.ownPublic.deckCount<1)return false;
  const hasClefairy=slots(o.ownPublic).some(x=>has(x,P.clefairy))||
     o.ownHand.some(x=>has(x,P.clefairy));
  const needsMinior=Boolean(miniorStallOpportunity(o)?.knockout)&&
     !slots(o.ownPublic).some(x=>has(x,P.minior))&&
     !o.ownHand.some(x=>has(x,P.minior));
  if(hasClefairy&&!needsMinior)return false;
  const capacity=stadium(o)?8:5;
  if(benchCount(o.ownPublic)>=capacity)return false;
  return o.ownHand.some(x=>discardScore(x,o)>0);
}
function quickBallPrompt(request) {
  const p=request.prompt,m=p.publicMetadata??{},o=request.observation;
  if(p.promptType!=='ChooseCardsPrompt'||m.selectionType!=='card-combination'||
    m.ownerSeat!=='actor'||m.isOwnerVisible!==true||
    !safeInt(m.minimumCount)||!safeInt(m.maximumCount)||
    m.maximumCount!==1||m.minimumCount>1)
    return no('R30_QUICKBALL_PROMPT_UNSUPPORTED');
  const offered=arr(p.choices).filter(x=>x.kind==='card'&&typeof x.token==='string');
  if(m.sourceZone==='hand'&&m.minimumCount===1){
    const choices=offered.filter(x=>o.ownHand.some(h=>text(h)===text(x)))
      .map((x,i)=>({x,score:discardScore(x,o),i}))
      .filter(v=>v.score>0).sort((a,b)=>b.score-a.score||a.i-b.i);
    return choices.length?picks([choices[0].x]):no('R30_QUICKBALL_NO_SAFE_PAYMENT');
  }
  if(m.sourceZone==='deck'){
    const stall=miniorStallOpportunity(o);
    const choice=(stall?.knockout&&!slots(o.ownPublic).some(x=>has(x,P.minior))?
        offered.find(x=>has(x,P.minior)):null)??
      offered.find(x=>has(x,P.clefairy))??
      offered.find(x=>/^Latias ex SSP(?: 76)?\b/i.test(text(x)));
    if(choice)return picks([choice]);
    const empty=arr(p.choices).find(x=>x.kind==='empty-selection'&&typeof x.token==='string');
    return m.minimumCount===0&&empty?{kind:'select-choice',token:empty.token}:
      no('R30_QUICKBALL_NO_VALID_TARGET');
  }
  return no('R30_QUICKBALL_PROMPT_UNSUPPORTED');
}

function canStartBox(o) {
  if(!o||!Array.isArray(o.ownHand)||o.ownHand.length<4||!hasBenchedPsychic(o.ownPublic))return false;
  const tokened=o.ownHand.map((c,i)=>({kind:'card',printing:text(c),token:'hand-'+i}));
  if(!discardPayment(o,tokened))return false;
  return !stadium(o)||!basicDiscard(o.ownPublic);
}
function liveFairyZone(o) {
  const stadiumRows=[...arr(o?.ownPublic?.stadium),...arr(o?.opponentPublic?.stadium)];
  // Printed Rule Box Pokémon Abilities are stopped by Path to the Peak.
  if(stadiumRows.some(x=>/^Path to the Peak CRE(?: 148)?\b/i.test(text(x))))return false;
  // Unknown/suppressed Abilities do not justify a ×2 prediction.
  return slots(o?.ownPublic).some(p=>has(p,P.clefairy)&&
    Array.isArray(p?.abilities)&&p.abilities.includes('Fairy Zone')&&
    Array.isArray(p?.abilitySuppressions)&&
    p.abilitySuppressions.some(row=>row?.abilityName==='Fairy Zone'&&
      row.suppressed===false&&row.reasonCode===null&&row.sourcePrinting===null));
}
function isDragonPokemon(p) {
  return arr(p?.printed?.types).some(x=>String(x).toUpperCase()==='DRAGON')||
    /^Regidrago V(?:STAR)? SIT(?: \d+)?\b/i.test(text(p));
}
function clefairyWeaknessAgainst(o,target) {
  if(!target)return 1;
  const printedPsychicWeak=arr(target?.printed?.weakness).some(w=>
    String(w?.type).toUpperCase()==='PSYCHIC'&&
    /(?:×|x|\*)2/i.test(String(w?.value)));
  // Fairy Zone applies while Clefairy waits on the Bench for Guzma.
  // Printed Psychic Weakness applies to non-Dragon Pokémon independently.
  if(isDragonPokemon(target)&&liveFairyZone(o))return 2;
  return printedPsychicWeak?2:1;
}
function rondoWeaknessMultiplier(o,target) {
  return has(o?.ownPublic?.active,P.clefairy)?
    clefairyWeaknessAgainst(o,target):1;
}
function rondoIncrement(o) {return 20*rondoWeaknessMultiplier(o,o?.opponentPublic?.active);}

function projectedRondo(o) {
  const own=o?.ownPublic, opp=o?.opponentPublic;
  if(!own||!opp||!safeInt(opp.active?.hp)||!safeInt(opp.active?.damage))return null;
  if(opp.active.hp<=opp.active.damage)return null;
  // Only baseline (no effective damage, Weakness or Resistance alterations) is
  // certified by this slice. A native attack could still face a protection effect.
  if(opp.active?.effectUnknown===true||opp.active?.damageModifiersUnknown===true)return null;
  const total=benchCount(own)+benchCount(opp);
  return {damage:20*(1+total)*rondoWeaknessMultiplier(o,opp.active),
    remaining:opp.active.hp-opp.active.damage,total};
}
function sourcePrizeTarget(p) {
  const v=text(p);
  if(/\bVMAX\b/i.test(v)||/^Mega\b.*\bex\b/i.test(v)||/\&.*-GX\b/i.test(v))return 3;
  if(/\b(?:VSTAR|ex|EX|GX|V)\b/i.test(v)||/-GX\b/i.test(v))return 2;
  return 1;
}
function terminalRondo(o) {
  const r=projectedRondo(o);
  return Boolean(r && r.damage>=r.remaining &&
    safeInt(o.ownPublic?.prizeCount) && o.ownPublic.prizeCount>0 &&
    (o.ownPublic.prizeCount<=sourcePrizeTarget(o.opponentPublic.active)||
      benchCount(o.opponentPublic)===0));
}
function threatenSecondTarget(o) {
  return safeInt(o.opponentPublic?.prizeCount)&&o.opponentPublic.prizeCount<=2&&
    slots(o.ownPublic).some(c=>/\b(?:ex|GX| V)\b/i.test(text(c)));
}
function candidateCanUseBoardHeldStarAlchemy(observation) {
  const opponent=observation?.opponentPublic;
  const oppVstarSpent=opponent?.publicTurnRestrictions?.vstarUsed===true ||
    observation?.opponentTurnResources?.vstarUsed===true;
  if(oppVstarSpent) return false;
  return slots(opponent).some(p=>arr(p.tools).some(t=>has(t,P.fss)));
}

function miniorStallOpportunity(o) {
  const active=o?.opponentPublic?.active;
  if(!has(active,P.snorlax)||!safeInt(active?.hp)||!safeInt(active?.damage))return null;
  // PGO55 has 150 HP, 4 Colorless Retreat Cost, Fighting x2 Weakness.
  // Do not silently treat a Float Stone-modified retreat or increased HP as
  // the same 160-damage knockout. Other continuous damage effects remain a
  // full native-Store qualification dependency.
  const tools=arr(active.tools);
  const retreatModified=tools.some(x=>/^(?:Float Stone BKT|Air Balloon SSH|Escape Board UPR)\b/i.test(text(x)));
  const hp=active.hp-active.damage;
  return {hp,projectedDamage:retreatModified?null:160,
    knockout:!retreatModified&&hp>0&&hp<=160};
}
function miniorConfirmPrompt(request) {
  const p=request.prompt,m=p.publicMetadata??{},o=request.observation;
  if(p.promptType!=='ConfirmPrompt'||m.selectionType!=='confirm'||
      p.source?.effectName!=='Far-Flying Meteor')
    return no('R30_MINIOR_PROMPT_UNSUPPORTED');
  const accept=arr(p.choices).find(c=>c.kind==='confirm'&&
    c.label==='Yes'&&typeof c.token==='string');
  const decline=arr(p.choices).find(c=>c.kind==='confirm'&&
    c.label==='No'&&typeof c.token==='string');
  if(miniorStallOpportunity(o)?.knockout&&
     arr(o.ownPublic?.bench).some(x=>has(x,P.minior))&&accept)
    return {kind:'select-choice',token:accept.token};
  return decline?{kind:'select-choice',token:decline.token}:
    no('R30_MINIOR_NO_CONFIRM');
}

const BENCH_BASIC = Object.freeze([
  {pattern:P.clefairy,kind:'clefairy'},
  {pattern:/^Latias ex SSP(?: 76)?\b/i,kind:'latias'},
  {pattern:/^Unown AOR(?: 30)?\b/i,kind:'unown'},
  {pattern:P.minior,kind:'minior'},
  {pattern:/^Crobat V DAA(?: 104)?\b/i,kind:'crobat'},
  {pattern:/^Dedenne-GX UNB(?: 57)?\b/i,kind:'dedenne'},
  {pattern:/^Squawkabilly ex PAL(?: 169)?\b/i,kind:'squawk'},
  {pattern:/^Fezandipiti ex ASC(?: 142)?\b/i,kind:'fez'}
]);
function benchBasicRole(value) {
  const row=BENCH_BASIC.find(r=>has(value,r.pattern));
  return row?.kind??null;
}
function valuableBasicReplacement(o) {
  const inPlay=slots(o?.ownPublic);
  const hand=arr(o?.ownHand);
  const clefs=inPlay.filter(x=>has(x,P.clefairy)).length;
  return (clefs<2 && hand.some(x=>has(x,P.clefairy)))||
    (!inPlay.some(x=>/^Latias ex SSP(?: 76)?\b/i.test(text(x))) &&
       hand.some(x=>/^Latias ex SSP(?: 76)?\b/i.test(text(x))));
}
function farewellOpportunity(o) {
  const own=o?.ownPublic;
  if(!own||!arr(own.bench).some(x=>/^Unown AOR(?: 30)?\b/i.test(text(x))))return false;
  const ro=projectedRondo(o);
  if(ro && ro.damage>=ro.remaining)return false;
  const cap=stadium(o)?8:5;
  if(benchCount(own)>=cap && valuableBasicReplacement(o))return true;
  if(arr(o.ownHand).length<=2 && (!has(own.active,P.clefairy)||
     arr(own.active.energies).length<2) && benchCount(own)<cap)return true;
  return false;
}
function selectBasicBenchRoot(items,o) {
  const own=o.ownPublic, ownBoard=slots(own);
  const offered=items.filter(a=>a.kind==='play-card'&&benchBasicRole(ownPrinting(a)));
  if(!offered.length)return null;
  const clefs=ownBoard.filter(x=>has(x,P.clefairy)).length;
  const ro=projectedRondo(o);
  const makesKo=ro && ro.damage<ro.remaining && ro.damage+rondoIncrement(o)>=ro.remaining;
  const smallHand=arr(o.ownHand).length<=3;
  const priority=({kind})=>{
    if(kind==='clefairy')return clefs===0?115:clefs===1?95:30;
    if(kind==='minior')return miniorStallOpportunity(o)?.knockout?130:0;
    if(kind==='unown')return makesKo?105:smallHand?85:70;
    if(kind==='latias')return ownBoard.some(x=>/^Latias ex SSP(?: 76)?\b/i.test(text(x)))?0:
      own.active&&arr(own.active.energies).length>=2?88:68;
    if(kind==='crobat')return smallHand&&!ownBoard.some(x=>/^Crobat V DAA(?: 104)?\b/i.test(text(x)))?80:0;
    if(kind==='dedenne')return smallHand&&arr(o.ownHand).length<=2?55:0;
    if(kind==='squawk')return !isLaterTurn(o)&&smallHand?65:0;
    if(kind==='fez')return ownBoard.some(x=>/^Fezandipiti ex ASC(?: 142)?\b/i.test(text(x)))?0:50;
    return 0;
  };
  const candidates=offered.map((item,index)=>({item,index,score:priority({kind:benchBasicRole(ownPrinting(item))})}))
    .filter(x=>x.score>0).sort((a,b)=>b.score-a.score||a.index-b.index);
  return candidates[0]?.item??null;
}

function skylinerIsLive(o) {
  const allStadiums=[...arr(o?.ownPublic?.stadium),...arr(o?.opponentPublic?.stadium)];
  if(allStadiums.some(x=>/^(?:Path to the Peak CRE(?: 148)?|Silent Lab PRC(?: 140)?)\b/i.test(text(x))))return false;
  return slots(o?.ownPublic).some(p=>/^Latias ex SSP(?: 76)?\b/i.test(text(p))&&
    arr(p.abilities).includes('Skyliner')&&
    arr(p.abilitySuppressions).some(row=>row?.abilityName==='Skyliner'&&
      row.suppressed===false&&row.reasonCode===null&&row.sourcePrinting===null));
}
function noCostRetreatOpportunity(o) {
  const active=o?.ownPublic?.active;
  if(!active||!Array.isArray(o?.ownPublic?.bench))return false;
  const conditions=arr(active.specialConditions).map(c=>String(c).toUpperCase());
  if(conditions.includes('ASLEEP')||conditions.includes('PARALYZED'))return false;
  const restrictions=active.publicRestrictions??{};
  if(restrictions.cannotRetreat===true||
    restrictions.cannotRetreatNextTurn===true||
    restrictions.cannotRetreatWhileActive===true)return false;
  // Skyliner says Basic Pokémon HAVE NO Retreat Cost: the rulebook gives
  // that wording precedence over added-cost modifiers. A printed zero alone
  // is insufficient, because an unobserved continuous modifier can raise it
  // and the worker does not yet support paid-retreat Energy prompts.
  const basicStage=String(active.printed?.stage??'').toUpperCase()==='BASIC';
  return basicStage&&skylinerIsLive(o);
}
function freeRetreatToClefairy(items,o) {
  if(!noCostRetreatOpportunity(o)||has(o?.ownPublic?.active,P.clefairy))
    return null;
  const ownBench=arr(o.ownPublic?.bench);
  const options=items.filter(a=>a.kind==='retreat'&&
    a.publicMetadata?.targetSeat==='actor'&&
    a.publicMetadata?.targetZone==='bench'&&
    safeInt(a.publicMetadata?.benchIndex));
  // The offer is the engine's legal native RetreatAction. Reject a stale or
  // mismatched target: the policy never guesses a Bench index.
  return options.find(a=>{
    const target=ownBench[a.publicMetadata.benchIndex];
    return target&&has(target,P.clefairy)&&has(a.targetPrinting,P.clefairy)&&
      arr(target.energies).length>=2;
  })??null;
}

function bestManualPsychicAttachment(items,o) {
  const own=o?.ownPublic;
  if(!own)return null;
  const boardRoom=benchCount(own)<(stadium(o)?8:5)&&
    safeInt(own.deckCount)&&own.deckCount>0;
  const rows=[];
  for(const item of items) {
    const energy=ownPrinting(item);
    const special=has(energy,P.telepathic);
    if(item.kind!=='play-card'||(!special&&!has(energy,P.basicPsychic)))
      continue;
    const m=item.publicMetadata??{};
    if(m.targetSeat!=='actor'||m.isOwnerVisible!==true||
      !['active','bench'].includes(m.targetZone))continue;
    const target=m.targetZone==='active'?own.active:
      safeInt(m.targetIndex)?arr(own.bench)[m.targetIndex]:null;
    if(!target||text(target)!==text(item.targetPrinting))continue;
    // Every Clefairy in this source is a Basic Psychic attacker requiring
    // one Psychic and one Colorless. Both source Energy families supply Psychic
    // to it, but only Telepathic offers a Basic-Psychic Bench search.
    const count=arr(target.energies).length;
    let score=0;
    if(has(target,P.clefairy)) {
      if(count<2)score=m.targetZone==='active'?150:125;
      else if(special&&boardRoom) {
        // A search can increase Rondo by 20 per additional Bench occupant,
        // but do not consume a turn attachment solely to overfund a KO line.
        const ro=projectedRondo(o);
        if(ro&&ro.damage<ro.remaining&&ro.damage+40>=ro.remaining)score=80;
      }
    } else if(special&&boardRoom&&has(target,/^Latias ex SSP(?: 76)?\b/i)) {
      score=35;
    }
    if(score<=0)continue;
    if(special)score+=boardRoom?14:-8;
    rows.push({item,score});
  }
  rows.sort((a,b)=>b.score-a.score);
  return rows[0]?.item??null;
}

function startingActiveRank(printing) {
  if(has(printing,P.clefairy))return 120;
  if(/^Latias ex SSP(?: 76)?\b/i.test(text(printing)))return 110;
  if(has(printing,P.unown))return 85;
  if(has(printing,P.minior))return 75;
  if(has(printing,P.mimikyu))return 70;
  if(/^Empoleon V BST(?: 40)?\b/i.test(text(printing)))return 60;
  if(/^Crobat V DAA(?: 104)?\b/i.test(text(printing)))return 55;
  if(/^Dedenne-GX UNB(?: 57)?\b/i.test(text(printing)))return 50;
  if(/^Squawkabilly ex PAL(?: 169)?\b/i.test(text(printing)))return 45;
  if(/^Fezandipiti ex ASC(?: 142)?\b/i.test(text(printing)))return 40;
  if(/^Tapu Lele-GX GRI(?: 60)?\b/i.test(text(printing)))return 35;
  if(/^Dialga-GX UPR(?: 100)?\b/i.test(text(printing)))return 30;
  return 0;
}
function startingBenchRank(printing) {
  if(has(printing,P.clefairy))return 120;
  if(/^Latias ex SSP(?: 76)?\b/i.test(text(printing)))return 115;
  if(has(printing,P.unown))return 75;
  // Draw-on-play support Pokémon should not be inert setup Bench liabilities.
  // Minior, Mimikyu and Dialga are conditional ALS resources; retain in hand.
  return 0;
}
function rank30EngineSetupPrompt(request) {
  const p=request.prompt,o=request.observation,m=p?.publicMetadata??{};
  if(o?.phase!==1||p?.source?.sourceKind!=='engine'||
     p.source.sourcePrinting!==null||
     p.source.classification!=='actor-choice')return no('R30_ENGINE_SETUP_UNSUPPORTED');
  if(p.promptType==='ChooseCardsPrompt'&&
     p.source.effectName==='CHOOSE_STARTING_POKEMONS'&&
     p.description==='CHOOSE_STARTING_POKEMONS') {
    if(m.selectionType!=='card-combination'||m.sourceZone!=='hand'||
       m.ownerSeat!=='actor'||m.isOwnerVisible!==true||
       !safeInt(m.minimumCount)||!safeInt(m.maximumCount)||
       m.minimumCount>m.maximumCount||m.maximumCount>7)
       return no('R30_ENGINE_SETUP_UNSUPPORTED');
    const cards=arr(p.choices).filter(c=>c.kind==='card'&&
      typeof c.token==='string'&&
      c.publicMetadata?.sourceZone==='hand'&&
      c.publicMetadata?.ownerSeat==='actor'&&
      c.publicMetadata?.isOwnerVisible===true&&
      startingActiveRank(c)>0);
    const availableBench=Math.max(0,5-benchCount(o.ownPublic));
    if(m.minimumCount===1&&o.ownPublic?.active===null) {
      const choices=cards.slice().sort((a,b)=>
        startingActiveRank(b)-startingActiveRank(a));
      if(!choices.length)return no('R30_ENGINE_SETUP_NO_BASIC');
      const first=choices[0];
      const others=choices.slice(1)
        .filter(c=>startingBenchRank(c)>0)
        .sort((a,b)=>startingBenchRank(b)-startingBenchRank(a));
      const selected=[first,...others.slice(0,availableBench)];
      if(selected.length>m.maximumCount)selected.length=m.maximumCount;
      return picks(selected);
    }
    if(m.minimumCount===0&&o.ownPublic?.active!==null) {
      const selected=cards.filter(c=>startingBenchRank(c)>0)
        .sort((a,b)=>startingBenchRank(b)-startingBenchRank(a))
        .slice(0,Math.min(availableBench,m.maximumCount));
      if(selected.length)return picks(selected);
      const empty=arr(p.choices).find(c=>
        c.kind==='empty-selection'&&typeof c.token==='string');
      return empty?{kind:'select-choice',token:empty.token}:
        no('R30_ENGINE_SETUP_NO_EMPTY');
    }
    return no('R30_ENGINE_SETUP_UNSUPPORTED');
  }
  if(p.promptType==='ConfirmPrompt'&&p.source.effectName==='GO_FIRST'&&
     p.description==='GO_FIRST'&&m.selectionType==='confirm') {
    // First-player default preserves the earliest setup and manual attachment.
    const yes=arr(p.choices).find(c=>c.kind==='confirm'&&
      /^yes$/i.test(c.label??'')&&typeof c.token==='string');
    return yes?{kind:'select-choice',token:yes.token}:
      no('R30_ENGINE_SETUP_UNSUPPORTED');
  }
  if(p.promptType==='SelectPrompt'&&
     p.source.effectName==='WANT_TO_DRAW_CARDS'&&
     p.description==='WANT_TO_DRAW_CARDS'&&m.selectionType==='option'&&
     safeInt(m.count)) {
    const options=arr(p.choices).filter(c=>c.kind==='option'&&
      typeof c.token==='string');
    const ranked=options.map(c=>{
      const match=/^Draw (\d+) card\(s\)$/i.exec(c.label??'');
      const index=c.publicMetadata?.choiceIndex;
      return {c,draw:match?Number(match[1]):-1,index};
    }).filter(x=>x.draw>=0&&safeInt(x.index)&&x.index<m.count);
    ranked.sort((a,b)=>b.draw-a.draw||a.index-b.index);
    return ranked.length?{kind:'select-choice',token:ranked[0].c.token}:
      no('R30_ENGINE_SETUP_UNSUPPORTED');
  }
  return no('R30_ENGINE_SETUP_UNSUPPORTED');
}

function rootDecision(request,{enablePatchProjection=false}={}) {
  const o=request.observation, items=availableCards(request);
  if(!items.length)return no('R30_NO_OFFERED_ROOT');
  const miniorAttack=items.find(a=>a.kind==='attack'&&
    a.attackName==='Gravitational Tackle'&&has(ownPrinting(a),P.minior));
  if(miniorAttack&&miniorStallOpportunity(o)?.knockout)return act(miniorAttack);
  const attack=items.find(a=>a.kind==='attack' && a.attackName==='Full Moon Rondo' &&
    has(ownPrinting(a),P.clefairy));
  if(attack && terminalRondo(o))return act(attack);
  // A source-legal Guzma can win now. Do not spend a generic draw/search
  // connector before a supported 3-/2-Prize terminal gust-and-Rondo line.
  const finishingGust=guzmaOpportunity(o);
  if(finishingGust&&safeInt(o.ownPublic?.prizeCount)&&
     o.ownPublic.prizeCount>0&&o.ownPublic.prizeCount<=finishingGust.prizeValue){
    const directGuzma=items.find(a=>a.kind==='play-card'&&has(ownPrinting(a),P.guzma));
    if(directGuzma)return act(directGuzma);
    const retrievedGuzma=items.find(a=>a.kind==='play-card'&&has(ownPrinting(a),P.vsSeeker));
    if(retrievedGuzma&&supporterAvailable(o)&&
       arr(o.ownPublic?.discard).some(x=>has(x,P.guzma)))return act(retrievedGuzma);
  }
  // If Field Blower removes Sky Field, the attack's damage may fall below KO.
  // No Field Blower line is opened before a still-available Rondo attack.
  const sky=items.find(a=>a.kind==='play-card' && has(ownPrinting(a),P.sky));
  const ro=projectedRondo(o);
  if(sky && !stadium(o) && ro && benchCount(o.ownPublic)===5 &&
    o.ownHand.some(c=>benchBasicRole(c)!==null) && ro.damage<ro.remaining &&
    ro.damage+20>=ro.remaining)return act(sky);
  const mail=items.find(a=>a.kind==='play-card'&&has(ownPrinting(a),P.mail));
  if(mail&&Number.isSafeInteger(o.ownPublic?.deckCount)&&o.ownPublic.deckCount>0)return act(mail);
  const vip=items.find(a=>a.kind==='play-card' && has(ownPrinting(a),P.vip));
  if(vip && benchCount(o.ownPublic)<(stadium(o)?8:5))return act(vip);
  const quick=items.find(a=>a.kind==='play-card' && has(ownPrinting(a),P.quickBall));
  if(quick && canStartQuickBall(o))return act(quick);
  const carrier=items.find(a=>a.kind==='play-card'&&has(ownPrinting(a),P.carrier));
  if(carrier&&carrierOpportunity(o))return act(carrier);
  const ultra=items.find(a=>a.kind==='play-card'&&has(ownPrinting(a),P.ultra));
  if(ultra&&ultraOpportunity(o))return act(ultra);
  const box=items.find(a=>a.kind==='play-card' && has(ownPrinting(a),P.box));
  if(box && canStartBox(o))return act(box);
  const discard=arr(o.ownPublic?.discard);
  const seeker=items.find(a=>a.kind==='play-card'&&has(ownPrinting(a),P.vsSeeker));
  if(seeker&&guzmaOpportunity(o)&&supporterAvailable(o)&&
     discard.some(c=>has(c,P.guzma)))return act(seeker);
  const compressor=items.find(a=>a.kind==='play-card'&&has(ownPrinting(a),P.compressor));
  if(compressor&&compressorOpportunity(o,{enablePatchProjection}).active)
    return act(compressor);

  // Attach the one-use VSTAR Tool to a source Pokémon V; avoid burning the
  // VSTAR power unless a specific missing attack/setup channel is visible.
  const vstarV=/^(?:Crobat V DAA(?: 104)?|Empoleon V BST(?: 40)?)\b/i;
  if(o.ownTurnResources?.vstarUsed===false){
    const stone=items.find(a=>a.kind==='play-card'&&has(ownPrinting(a),P.fss)&&
      vstarV.test(text(a.targetPrinting)));
    if(stone)return act(stone);
  }

  // Hand disruption against the publicly imminent two-Prize reply is a
  // tactical heuristic, not a guarantee that a hidden gust will disappear.
  if(enablePatchProjection && basicDiscard(o.ownPublic) && hasBenchedPsychic(o.ownPublic)){
    const patch=items.find(a=>a.kind==='play-card' && has(ownPrinting(a),P.patch));
    if(patch)return act(patch);
  }
  const star=items.find(a=>a.kind==='use-ability'&&
    a.publicMetadata?.abilityName==='Star Alchemy');
  if(star && starNeedsResource(o,{enablePatchProjection}))return act(star);
  const guzma=items.find(a=>a.kind==='play-card'&&has(ownPrinting(a),P.guzma));
  if(guzma&&guzmaOpportunity(o))return act(guzma);
  // Prefer a free native RetreatAction to a funded Clefairy over ending a
  // turn with an inert Active. A tactical 3-Prize Guzma keeps precedence.
  const freeRetreat=freeRetreatToClefairy(items,o);
  if(freeRetreat)return act(freeRetreat);
  const marnie=items.find(a=>a.kind==='play-card' && has(ownPrinting(a),P.marnie));
  if(marnie && threatenSecondTarget(o) &&
    !candidateCanUseBoardHeldStarAlchemy(o))return act(marnie);
  if(miniorStallOpportunity(o)?.knockout&&
     arr(o.ownPublic?.bench).some(x=>has(x,P.minior))){
    const attachMinior=items.find(a=>a.kind==='play-card'&&
      (has(ownPrinting(a),P.basicPsychic)||has(ownPrinting(a),P.telepathic))&&
      has(a.targetPrinting,P.minior));
    if(attachMinior)return act(attachMinior);
  }
  const bestEnergy=bestManualPsychicAttachment(items,o);
  if(bestEnergy)return act(bestEnergy);
  const basic=selectBasicBenchRoot(items,o);
  if(basic)return act(basic);
  const farewell=items.find(a=>a.kind==='use-ability'&&
    a.publicMetadata?.abilityName==='Farewell Letter'&&
    /^Unown AOR(?: 30)?\b/i.test(text(ownPrinting(a))));
  if(farewell&&farewellOpportunity(o))return act(farewell);
  if(attack)return act(attack);
  // Only an exclusively passive native frontier can be safely passed.
  // Never mask an unsupported legal source action (notably Copycat) as a pass.
  if(items.every(x=>x.kind==='pass'))return act(items[0]);
  return no('R30_ROOT_UNSUPPORTED');
}
function createPolicy({role,seat,policyVersion,config}) {
  const keys=config&&typeof config==='object'&&!Array.isArray(config)?
    Object.keys(config):null;
  // Real shared V3 init accepts ONLY config={}. Rank/source are immutable
  // in this signed policy bundle, not caller-provided settings. The legacy
  // two-key form and explicit three-key Patch opt-in remain developer-only
  // direct-call compatibility and are rejected by V3 validateInit.
  const isV3Config=keys!==null&&keys.length===0;
  const isAnnotatedDevConfig=keys!==null&&[2,3].includes(keys.length)&&
    keys.every(k=>['sourceRank','sourceBlobSha1','enablePatchProjection'].includes(k))&&
    (keys.length!==3||config.enablePatchProjection===true)&&
    config.sourceRank===SOURCE_RANK&&
    config.sourceBlobSha1===SOURCE_LIST_BLOB_SHA1;
  if(role!=='opponent'||![0,1].includes(seat)||policyVersion!==POLICY_VERSION||
    !(isV3Config||isAnnotatedDevConfig))
    throw new Error('R30_SOURCE_ROLE_CONFIG_MISMATCH');
  return Object.freeze({decide(request){
    if(request?.role!==role||request.seat!==seat||request.observation?.actorSeat!==seat)
      return no('ROLE_SEAT_BINDING_MISMATCH');
    if(!request.observation?.ownPublic||!request.observation?.opponentPublic||
       !Array.isArray(request.observation?.ownHand))return no('R30_OBSERVATION_INCOMPLETE');
    if(request.prompt!==null){
      if(request.prompt?.source?.sourceKind==='engine')
        return rank30EngineSetupPrompt(request);
      if(sameSource(request.prompt,P.box))return boxPrompt(request);
      if(sameSource(request.prompt,P.ultra))return ultraBallPrompt(request);
      if(sameSource(request.prompt,P.quickBall))return quickBallPrompt(request);
      if(sameSource(request.prompt,P.mail))return trainersMailPrompt(request,
        {enablePatchProjection:config.enablePatchProjection===true});
      if(sameSource(request.prompt,P.vip))return vipPrompt(request);
      if(sameSource(request.prompt,P.telepathic))return telepathPrompt(request);
      if(sameSource(request.prompt,P.minior))return miniorConfirmPrompt(request);
      if(sameSource(request.prompt,P.carrier))return rescueCarrierPrompt(request);
      if(sameSource(request.prompt,P.guzma))return guzmaPrompt(request);
      if(sameSource(request.prompt,P.compressor))return battleCompressorPrompt(request,
        {enablePatchProjection:config.enablePatchProjection===true});
      if(sameSource(request.prompt,P.vsSeeker))return vsSeekerPrompt(request);
      if(sameSource(request.prompt,P.fss))return starAlchemyPrompt(request,
        {enablePatchProjection:config.enablePatchProjection===true});
      if(sameSource(request.prompt,P.patch)&&config.enablePatchProjection===true)
        return patchPrompt(request);
      return no('R30_UNSUPPORTED_PROMPT_FAMILY');
    }
    return rootDecision(request,{enablePatchProjection:config.enablePatchProjection===true});
  }});
}
module.exports={POLICY_VERSION,SOURCE_RANK,SOURCE_LIST_BLOB_SHA1,SOURCE_COUNTS,createPolicy,
  rank30EngineSetupPrompt,startingActiveRank,startingBenchRank,clefairyWeaknessAgainst,skylinerIsLive,noCostRetreatOpportunity,freeRetreatToClefairy,bestManualPsychicAttachment,rootDecision,boxPrompt,quickBallPrompt,vipPrompt,telepathPrompt,starAlchemyPrompt,starNeedsResource,guzmaPrompt,guzmaOpportunity,battleCompressorPrompt,vsSeekerPrompt,compressorOpportunity,sourcePrizeTarget,patchPrompt,projectedRondo,discardScore,benchBasicRole,selectBasicBenchRoot,farewellOpportunity,carrierOpportunity,rescueCarrierPrompt,miniorStallOpportunity,miniorConfirmPrompt,trainersMailPriority,trainersMailPrompt,liveFairyZone,rondoWeaknessMultiplier,rondoIncrement,safeDiscardPayment,ultraOpportunity,ultraBallPrompt,candidateCanUseBoardHeldStarAlchemy};
