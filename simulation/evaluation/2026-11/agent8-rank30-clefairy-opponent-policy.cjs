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
  latias: /^Latias ex SSP(?: 76)?\b/i,
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
  raihan: /^Raihan EVS(?: 152)?\b/i,
  heavyBall: /^Hisuian Heavy Ball ASR(?: 146)?\b/i,
  stretcher: /^Rescue Stretcher GRI(?: 130)?\b/i,
  lele: /^Tapu Lele(?:-GX| GX) GRI(?: 60)?\b/i,
  crobat: /^Crobat V DAA(?: 104)?\b/i,
  dedenne: /^Dedenne(?:-GX| GX) UNB(?: 57)?\b/i,
  squawk: /^Squawkabilly ex PAL(?: 169)?\b/i,
  fez: /^Fezandipiti ex ASC(?: 142)?\b/i,
  quickBall: /^Quick Ball FST(?: 237)?\b/i,
  blower: /^Field Blower GRI(?: 125)?\b/i,
  compressor: /^Battle Compressor PHF(?: 92)?\b/i,
  vsSeeker: /^VS Seeker PHF(?: 109)?\b/i,
  carrier: /^Rescue Carrier EVS(?: 154)?\b/i,
  unown: /^Unown AOR(?: 30)?\b/i,
  mimikyu: /^Mimikyu GRI(?: 58)?\b/i,
  empoleon: /^Empoleon V BST(?: 40)?\b/i,
  dialga: /^Dialga(?:-GX| GX) UPR(?: 100)?\b/i,
  minior: /^Minior PAR(?: 99)?\b/i,
  snorlax: /^Snorlax PGO(?: 55)?\b/i,
  mail: /^Trainers' Mail ROS(?: 92)?\b/i,
  ultra: /^Ultra Ball MEG(?: 131)?\b/i
});
const HEAVY_BALL_BASIC = Object.freeze([
  {pattern:P.clefairy,copies:3,kind:'clefairy'},
  {pattern:P.unown,copies:3,kind:'unown'},
  {pattern:P.latias,copies:1,kind:'latias'},
  {pattern:P.lele,copies:1,kind:'lele'},
  {pattern:P.dedenne,copies:1,kind:'dedenne'},
  {pattern:P.squawk,copies:1,kind:'squawk'},
  {pattern:P.crobat,copies:1,kind:'crobat'},
  {pattern:P.fez,copies:1,kind:'fez'},
  {pattern:P.empoleon,copies:1,kind:'empoleon'},
  {pattern:P.mimikyu,copies:1,kind:'mimikyu'},
  {pattern:P.dialga,copies:1,kind:'dialga'},
  {pattern:P.minior,copies:1,kind:'minior'}
]);
function sourceCardPatternCoverage() {
  return SOURCE_COUNTS.map(([printing,count])=>({
    printing,count,
    patternKeys:Object.entries(P).filter(([,pattern])=>pattern.test(printing))
      .map(([key])=>key)
  }));
}
function heavyBallBasicCoverage() {
  return HEAVY_BALL_BASIC.map(row=>{
    const matches=SOURCE_COUNTS.filter(([printing])=>row.pattern.test(printing));
    return {
      kind:row.kind,
      printing:matches.length===1?matches[0][0]:null,
      sourceCopies:matches.length===1?matches[0][1]:0,
      configuredCopies:row.copies
    };
  });
}
const {previousTurnResponseOptions}=require('../../twinleaf/agent8-ko-supporter-options.cjs');
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
  R30_RAIHAN_ATTACH_UNSUPPORTED:'UNSUPPORTED_PROMPT_TYPE',
  R30_RAIHAN_ATTACH_NO_TARGET:'NO_VISIBLE_POKEMON_TARGET',
  R30_RAIHAN_SEARCH_UNSUPPORTED:'UNSUPPORTED_CARD_COMBINATION_SOURCE',
  R30_RAIHAN_SEARCH_NO_TARGET:'NO_LEGAL_CARD_SET',
  R30_HEAVYBALL_PROMPT_UNSUPPORTED:'UNSUPPORTED_CARD_COMBINATION_SOURCE',
  R30_HEAVYBALL_NO_EMPTY_CHOICE:'NO_LEGAL_EMPTY_CHOICE',
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
  R30_ENGINE_SETUP_NO_EMPTY:'NO_LEGAL_CARD_SET',
  R30_BLOWER_PROMPT_UNSUPPORTED:'UNSUPPORTED_CARD_COMBINATION_SOURCE',
  R30_BLOWER_NO_UNIQUE_TARGET:'NO_LEGAL_CARD_SET',
  R30_LELE_PROMPT_UNSUPPORTED:'UNSUPPORTED_CARD_COMBINATION_SOURCE',
  R30_LELE_NO_SUPPORTER:'NO_LEGAL_CARD_SET',
  R30_DRAW_CONFIRM_UNSUPPORTED:'UNRECOGNIZED_SIMPLE_PROMPT',
  R30_STRETCHER_PROMPT_UNSUPPORTED:'UNSUPPORTED_CARD_COMBINATION_SOURCE',
  R30_STRETCHER_NO_TARGET:'NO_LEGAL_CARD_SET'
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
    /^Tapu Lele(?:-GX| GX) GRI(?: 60)?\b/i.test(text(c))||
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
  const openBench=Math.max(0,(stadium(o)?8:5)-benchCount(o.ownPublic));
  const maxSelect=Math.min(openBench,m.maximumCount);
  if(m.minimumCount>maxSelect)return no('R30_TELEPATH_NO_TARGET');
  const cards=arr(p.choices).filter(c=>c.kind==='card'&&typeof c.token==='string');
  const result=[];
  const get=pattern=>cards.find(c=>has(c,pattern)&&!result.some(x=>x.token===c.token));
  const own=slots(o.ownPublic);
  const ownHand=arr(o.ownHand);
  const clefs=own.filter(x=>has(x,P.clefairy)).length+
    ownHand.filter(x=>has(x,P.clefairy)).length;
  if(clefs===0&&result.length<maxSelect){
    const x=get(P.clefairy);if(x)result.push(x);
  }
  if(result.length<maxSelect&&!own.some(x=>/^Latias ex SSP(?: 76)?\b/i.test(text(x)))&&
     !ownHand.some(x=>/^Latias ex SSP(?: 76)?\b/i.test(text(x)))){
    const x=get(/^Latias ex SSP(?: 76)?\b/i);if(x)result.push(x);
  }
  if(clefs+result.filter(x=>has(x,P.clefairy)).length<2&&result.length<maxSelect){
    const x=get(P.clefairy);if(x)result.push(x);
  }
  if(result.length<maxSelect&&result.length===0){
    const x=get(/^Unown AOR(?: 30)?\b/i)??get(/^Mimikyu GRI(?: 58)?\b/i)??
      get(/^Tapu Lele(?:-GX| GX) GRI(?: 60)?\b/i);
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
    prizeValue:minimumPrizesOnAttackKnockout(pokemon),remaining:pokemon?.hp-pokemon?.damage,
    // Guzma promotes a Benched Clefairy: use its future Psychic weakness,
    // not merely the current active Pokémon's weakness modifier.
    predictedDamage:clefairyRondoDamage(o,pokemon,baseDamage)}))
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
  // The pinned actor-observation contract exposes owner.supporterTurn as the
  // number of Supporters already played in *this turn*. Comparing it with
  // the global turn index illegally enables a second Supporter later in game.
  return o?.ownTurnResources?.supporterPlayedTurn===0;
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
function vsSeekerMarnieRecovery(o) {
  if(!o||!supporterAvailable(o)||!safeInt(o.ownPublic?.deckCount)||
     o.ownPublic.deckCount<5||
     !arr(o.ownPublic?.discard).some(c=>has(c,P.marnie))||
     arr(o.ownHand).some(c=>has(c,P.marnie)||has(c,P.guzma)))
    return false;
  const other=arr(o.ownHand).filter(c=>!has(c,P.vsSeeker));
  return other.length<=2&&other.every(c=>discardScore(c,o)>=35);
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
  if(vsSeekerMarnieRecovery(o)){
    const marnie=choices.find(c=>has(c,P.marnie));
    if(marnie)return picks([marnie]);
  }
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
  const capacity=Math.max(0,(stadium(o)?8:5)-benchCount(o.ownPublic));
  const maxSelect=Math.min(m.maximumCount,capacity);
  if(m.minimumCount>maxSelect||o.ownTurnResources?.pokemonPlayLocked===true)
    return no('R30_VIP_NO_TARGET');
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
  if(clefsAlready===0 && picked.length<maxSelect){
    const x=find(P.clefairy);if(x)picked.push(x);
  }
  if(picked.length<maxSelect &&
     !slots(o.ownPublic).some(x=>/^Latias ex SSP(?: 76)?\b/i.test(text(x))) &&
     !o.ownHand.some(x=>/^Latias ex SSP(?: 76)?\b/i.test(text(x)))){
    const x=find(/^Latias ex SSP(?: 76)?\b/i);if(x)picked.push(x);
  }
  if(picked.length<maxSelect && clefsAlready+
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
      /^Tapu Lele(?:-GX| GX) GRI(?: 60)?\b/i.test(text(target))?3:
      /^Mimikyu GRI(?: 58)?\b/i.test(text(target))?2:
      /^Latias ex SSP(?: 76)?\b/i.test(text(target))?1:0};
  }).filter(r=>r.score>0).sort((a,b)=>b.score-a.score)[0];
  return best?{kind:'select-choice',token:best.c.token}:
    no('R30_PATCH_NO_ELIGIBLE_BENCH');
}

function rondoSearchFillerOpportunity(o) {
  if(!o||!stadium(o)||o.ownTurnResources?.pokemonPlayLocked===true||
    !rondoBenchFillerDemand(o))return false;
  const hand=arr(o.ownHand);
  if(hand.some(c=>benchBasicRole(c)!==null))return false;
  // `ownerK1.knownPrintings` is specifically the owner-certified *remaining
  // deck*, not the prize composition (owner-k1-prize-knowledge.cjs). Refuse a
  // doomed connector when its source deck contains no usable Basic filler.
  const k1=o.ownerK1;
  if(k1?.exactMembershipKnown===true&&Array.isArray(k1.knownPrintings)&&
    !k1.knownPrintings.some(row=>safeInt(row.copies)&&row.copies>0&&
      benchBasicRole(row.printing)!==null))return false;
  return true;
}
function canStartQuickBall(o) {
  if(!o||!Array.isArray(o.ownHand)||!safeInt(o.ownPublic?.deckCount)||
    o.ownPublic.deckCount<1)return false;
  const hasClefairy=slots(o.ownPublic).some(x=>has(x,P.clefairy))||
     o.ownHand.some(x=>has(x,P.clefairy));
  const needsMinior=Boolean(miniorStallOpportunity(o)?.knockout)&&
     !slots(o.ownPublic).some(x=>has(x,P.minior))&&
     !o.ownHand.some(x=>has(x,P.minior));
  if(hasClefairy&&!needsMinior&&!rondoSearchFillerOpportunity(o))return false;
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
    if(rondoSearchFillerOpportunity(o)){
      const fill=offered.find(x=>has(x,P.unown))??
        offered.find(x=>has(x,P.clefairy))??
        offered.find(x=>benchBasicRole(x)!==null);
      if(fill)return picks([fill]);
      const empty=arr(p.choices).find(x=>x.kind==='empty-selection'&&
        typeof x.token==='string');
      return m.minimumCount===0&&empty?{kind:'select-choice',token:empty.token}:
        no('R30_QUICKBALL_NO_VALID_TARGET');
    }
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
function psychicResistanceLoss(target) {
  const row=arr(target?.printed?.resistance).find(r=>
    String(r?.type).toUpperCase()==='PSYCHIC');
  if(!row)return 0;
  const value=String(row.value??'').replace(/^[−–]/,'-');
  if(!/^-\d+$/.test(value))return 0;
  return Math.abs(Number(value));
}
function clefairyRondoDamage(o,target,rawBaseDamage) {
  if(!safeInt(rawBaseDamage)||!target)return null;
  // Damage order: base => Psychic Weakness => printed Psychic Resistance.
  // All other effective modifiers require a native paper-fidelity witness.
  const doubled=rawBaseDamage*clefairyWeaknessAgainst(o,target);
  return Math.max(0,doubled-psychicResistanceLoss(target));
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
  return {damage:clefairyRondoDamage(o,opp.active,20*(1+total)),
    remaining:opp.active.hp-opp.active.damage,total};
}
function sourcePrizeTarget(p) {
  const v=text(p);
  if(/\bVMAX\b/i.test(v)||/^Mega\b.*\bex\b/i.test(v)||/\&.*-GX\b/i.test(v))return 3;
  if(/\b(?:VSTAR|ex|EX|GX|V)\b/i.test(v)||/-GX\b/i.test(v))return 2;
  return 1;
}
// Lower bound when a visible Prize-reducing Tool/Special Energy may apply.
// Legacy Energy is once-per-game; without an authenticated spent-effect receipt,
// treat it as still available. Distinct Tool and Energy protections may stack.
// This is not a complete paper Prize-modifier adjudicator.
function minimumPrizesOnAttackKnockout(target) {
  const count=sourcePrizeTarget(target);
  const energyReduction=arr(target?.energies).some(x=>
    /^Legacy Energy\b/i.test(text(x)))?1:0;
  const targetPrinting=text(target);
  const toolReduction=arr(target?.tools).some(x=>{
    const name=text(x);
    if(/^Life Dew\b/i.test(name))return true;
    if(/^Hero's Medal\b/i.test(name))return /\bVMAX\b/i.test(targetPrinting);
    if(/^Ribbon Badge\b/i.test(name))
      return /^Sylveon V(?:MAX|STAR)?\b/i.test(targetPrinting);
    if(/^Island Challenge Amulet\b/i.test(name))
      return /(?:-GX\b|-EX\b| GX\b| EX\b)/.test(targetPrinting);
    return false;
  })?1:0;
  return Math.max(0,count-energyReduction-toolReduction);
}
function terminalRondo(o) {
  const r=projectedRondo(o);
  return Boolean(r && r.damage>=r.remaining &&
    safeInt(o.ownPublic?.prizeCount) && o.ownPublic.prizeCount>0 &&
    (o.ownPublic.prizeCount<=minimumPrizesOnAttackKnockout(o.opponentPublic.active)||
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

// Mimikyu GRI 58 has two ordinary printed attacks: Filch and Copycat.
// Pinned native Copycat can resolve ordinary non-GX non-copy attacks, but
// presently refuses copied Apex Dragon; never fabricate that blocked route.
// Only use a Copycat attack when authenticated actor-visible last-opponent-turn
// history proves a deterministic knockout with a native offered root.
// Tapu Lele-GX GRI 60: Energy Drive counts Energy supplied by both Active,
// ignoring Weakness and Resistance. Physical card count is a conservative
// lower bound for units supplied by valid attached Energy.
// Latias ex SSP 76: Eon Blade is a printed 200 Psychic-damage attack,
// useful as an actual finisher and not just a Skyliner Bench support.
// Only a certified live Fairy Zone doubles damage against Dragon targets;
// a native offered Eon Blade root provides payment and attack permission.
function latiasEonBladeKO(o) {
  const attacker=o?.ownPublic?.active,target=o?.opponentPublic?.active;
  if(!has(attacker,P.latias)||!target||
     !safeInt(target.hp)||!safeInt(target.damage)||
     target.effectUnknown===true||target.damageModifiersUnknown===true||
     attacker.effectUnknown===true||attacker.damageModifiersUnknown===true)
    return null;
  // Unknown attached defensive Tools can alter damage. This restricted
  // certifier does not claim such damage is guaranteed.
  const knownNondefensive=/^(?:Stealthy Hood|Forest Seal Stone|Float Stone|Air Balloon|Rescue Board|Hero's Medal|Life Dew|Ribbon Badge|Island Challenge Amulet|Choice Belt|Choice Band)\b/i;
  if(arr(target.tools).some(t=>!knownNondefensive.test(text(t))))return null;
  const damage=clefairyRondoDamage(o,target,200);
  const remaining=target.hp-target.damage;
  return safeInt(damage)&&remaining>0&&damage>=remaining?
    Object.freeze({damage,remaining,
      prizeLowerBound:minimumPrizesOnAttackKnockout(target)}):null;
}
function tapuLeleEnergyDriveKO(o) {
  const attacker=o?.ownPublic?.active,target=o?.opponentPublic?.active;
  if(!has(attacker,P.lele)||!target||
      !safeInt(target.hp)||!safeInt(target.damage)||
      target.effectUnknown===true||target.damageModifiersUnknown===true||
      attacker.effectUnknown===true||attacker.damageModifiersUnknown===true)
    return null;
  // Do not assert a guaranteed KO through unmodelled defensive Tools.
  const knownNondefensive=/^(?:Stealthy Hood|Forest Seal Stone|Float Stone|Air Balloon|Rescue Board|Hero's Medal|Life Dew|Ribbon Badge|Island Challenge Amulet|Choice Belt|Choice Band)\b/i;
  if(arr(target.tools).some(t=>!knownNondefensive.test(text(t))))return null;
  const ownEnergies=arr(attacker.energies),oppEnergies=arr(target.energies);
  // The original rank30 60 contains no Double Turbo Energy. A copied or
  // effect-supplied instance can reduce Energy Drive by 20, so fail closed.
  if(ownEnergies.some(e=>/^Double Turbo Energy\b/i.test(text(e))))return null;
  const energyFloor=ownEnergies.length+oppEnergies.length;
  const damage=20*energyFloor,remaining=target.hp-target.damage;
  if(!safeInt(energyFloor)||energyFloor<2||remaining<=0||
     !safeInt(damage)||damage<remaining)return null;
  return Object.freeze({damageLowerBound:damage,remaining,
    energyCardFloor:energyFloor,
    prizeLowerBound:minimumPrizesOnAttackKnockout(target)});
}
function guaranteedMimikyuCopycatKO(request) {
  const o=request?.observation,r=request?.publicEventReceipt;
  if(!o||!r||r.actorSeat!==o.actorSeat||r.turn!==o.globalTurn||
     !has(o.ownPublic?.active,P.mimikyu)||
     o.opponentPublic?.active?.effectUnknown===true||
     o.opponentPublic?.active?.damageModifiersUnknown===true||
     !safeInt(o.opponentPublic?.active?.hp)||
     !safeInt(o.opponentPublic?.active?.damage)||
     r.mimikyuCopycatCompatible!==true||
     !Array.isArray(r.opponentCopycatChoices)||
     r.opponentCopycatChoices.length!==1||
     !Array.isArray(r.opponentLastTurnAttacks)||
     !safeInt(r.opponentLastTurnTurn)||
     // Until a turn-owner-attested receipt can cross the shared V3 boundary,
     // a nonadjacent turn stamp may be stale after an extra opponent turn.
     r.opponentLastTurnTurn!==o.globalTurn-1)return null;
  const selected=r.opponentCopycatChoices[0];
  if(!selected||selected.gxAttack!==false||selected.copycatAttack!==false||
     selected.turn!==r.opponentLastTurnTurn||
     !r.opponentLastTurnAttacks.some(x=>
       x.turn===selected.turn&&x.sourcePrinting===selected.sourcePrinting&&
       x.attackName===selected.attackName&&x.gxAttack===false&&
       x.copycatAttack===false))return null;
  let base=null;
  if(selected.attackName==='Full Moon Rondo'&&
      has(selected.sourcePrinting,P.clefairy))
    base=20*(1+benchCount(o.ownPublic)+benchCount(o.opponentPublic));
  if(selected.attackName==='Max Geist'&&
      /^Shadow Rider Calyrex VMAX CRE(?: 75)?\b/i.test(selected.sourcePrinting)) {
    // A conservative lower bound: count only Basic Psychic Energy units.
    // Special Energy may provide Psychic (unless Temple changes it) but is
    // never needed to certify the knockout in this restricted slice.
    const basics=slots(o.ownPublic).reduce((sum,p)=>
      sum+arr(p.energies).filter(e=>has(e,P.basicPsychic)).length,0);
    base=10+30*basics;
  }
  if(base===null)return null;
  const damage=clefairyRondoDamage(o,o.opponentPublic.active,base);
  const remaining=o.opponentPublic.active.hp-o.opponentPublic.active.damage;
  return safeInt(damage)&&remaining>0&&damage>=remaining?
    Object.freeze({sourcePrinting:selected.sourcePrinting,
      attackName:selected.attackName,damage,remaining}):null;
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
  {pattern:P.lele,kind:'lele'},
  {pattern:P.mimikyu,kind:'mimikyu'},
  {pattern:P.empoleon,kind:'empoleon'},
  {pattern:P.dialga,kind:'dialga'},
  {pattern:P.minior,kind:'minior'},
  {pattern:/^Crobat V DAA(?: 104)?\b/i,kind:'crobat'},
  {pattern:/^Dedenne(?:-GX| GX) UNB(?: 57)?\b/i,kind:'dedenne'},
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
function rondoBenchFillerDemand(o) {
  const ro=projectedRondo(o),own=o?.ownPublic;
  if(!ro||ro.damage>=ro.remaining)return null;
  const open=(stadium(o)?8:5)-benchCount(own);
  const increment=rondoIncrement(o);
  if(open<1||!safeInt(increment)||increment<=0)return null;
  const needed=Math.ceil((ro.remaining-ro.damage)/increment);
  return needed>=1&&needed<=open?{needed,open}:null;
}
// Preserve utility singletons unless their Benching supports an offered,
// same-turn Full Moon Rondo that ends the game. This covers the four source
// Basics excluded from ordinary filler without casually burning counter-tech.
const PROTECTED_BENCH_FILLER=new Set(['lele','mimikyu','empoleon','dialga']);
function terminalPrizeThreat(o) {
  const ownPrizes=o?.ownPublic?.prizeCount;
  return safeInt(ownPrizes)&&ownPrizes>0&&(
    ownPrizes<=minimumPrizesOnAttackKnockout(o?.opponentPublic?.active)||
    benchCount(o?.opponentPublic)===0);
}
function selectBasicBenchRoot(items,o) {
  const own=o.ownPublic, ownBoard=slots(own);
  const offered=items.filter(a=>a.kind==='play-card'&&benchBasicRole(ownPrinting(a)));
  if(!offered.length)return null;
  const clefs=ownBoard.filter(x=>has(x,P.clefairy)).length;
  const ro=projectedRondo(o);
  const makesKo=ro && ro.damage<ro.remaining && ro.damage+rondoIncrement(o)>=ro.remaining;
  const smallHand=arr(o.ownHand).length<=3;
  const fill=o.ownTurnResources?.pokemonPlayLocked===true?null:
    rondoBenchFillerDemand(o);
  const protectedAllowed=Boolean(fill&&terminalPrizeThreat(o)&&
    offered.length>=fill.needed&&
    items.some(a=>a.kind==='attack'&&a.attackName==='Full Moon Rondo'&&
      has(ownPrinting(a),P.clefairy)));
  const priority=({kind})=>{
    if(PROTECTED_BENCH_FILLER.has(kind))
      return protectedAllowed?(stadium(o)?25:85):0;
    // When an already-live Sky Field creates a multi-Bench KO path, every
    // Basic body can matter, including Minior outside its Snorlax matchup.
    if(fill&&stadium(o)) {
      if(kind==='unown')return 150;
      if(kind==='minior')return 145;
      if(kind==='clefairy')return 140;
      if(kind==='latias')return ownBoard.some(x=>/^Latias ex SSP(?: 76)?\b/i.test(text(x)))?0:130;
      if(kind==='fez')return 70;
      if(kind==='squawk')return 60;
      if(kind==='crobat')return 55;
      if(kind==='dedenne')return 50;
    }
    if(kind==='clefairy')return clefs===0?115:clefs===1?95:30;
    if(kind==='minior')return miniorStallOpportunity(o)?.knockout?130:0;
    if(kind==='unown')return makesKo?105:smallHand?85:70;
    if(kind==='latias')return ownBoard.some(x=>/^Latias ex SSP(?: 76)?\b/i.test(text(x)))?0:
      own.active&&arr(own.active.energies).length>=2?88:68;
    if(kind==='crobat')return smallHand&&!ownBoard.some(x=>/^Crobat V DAA(?: 104)?\b/i.test(text(x)))?80:0;
    if(kind==='dedenne')return smallHand&&arr(o.ownHand).length<=2&&
      leleAbilityAccessIsSafe(o)&&handIsSafeToReset(o,P.dedenne)?55:0;
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
function emperorEyesDisablesBasicBlock(o) {
  const ownActive=o?.ownPublic?.active;
  if(!/^Empoleon V BST(?: 40)?\b/i.test(text(ownActive)))return false;
  const ownStadiums=[...arr(o?.ownPublic?.stadium),
    ...arr(o?.opponentPublic?.stadium)];
  if(ownStadiums.some(st=>/^Path to the Peak\b/i.test(text(st))))
    return false;
  if(!arr(ownActive.abilities).includes("Emperor's Eyes"))return false;
  const live=arr(ownActive.abilitySuppressions).some(row=>
    row.abilityName==="Emperor's Eyes"&&row.suppressed===false&&
    row.reasonCode===null&&row.sourcePrinting===null);
  return live;
}
function opponentSnorlaxBlockMayBeLive(o) {
  const active=o?.opponentPublic?.active;
  if(!has(active,P.snorlax))return false;
  if(!arr(active.abilities).includes('Block'))return false;
  // Empoleon V's live Emperor's Eyes strips the Ability from opposing
  // non-Rule-Box Basic Snorlax while Empoleon occupies our Active Spot.
  if(emperorEyesDisablesBasicBlock(o))return false;
  const suppression=arr(active.abilitySuppressions).find(row=>
    row?.abilityName==='Block');
  // If a known Block exists but its liveness is not certified as disabled,
  // do not spend the only Float Stone on an immediate impossible retreat.
  return suppression?.suppressed!==true;
}
function retreatIsForbidden(o) {
  const active=o?.ownPublic?.active;
  if(!active)return true;
  const conditions=arr(active.specialConditions).map(c=>String(c).toUpperCase());
  const restrictions=active.publicRestrictions??{};
  return conditions.includes('ASLEEP')||conditions.includes('PARALYZED')||
    restrictions.cannotRetreat===true||
    restrictions.cannotRetreatNextTurn===true||
    restrictions.cannotRetreatWhileActive===true||
    opponentSnorlaxBlockMayBeLive(o);
}
function floatStoneEffectAvailable(o) {
  const own=o?.ownPublic,opp=o?.opponentPublic;
  const stadiums=[...arr(own?.stadium),...arr(opp?.stadium)];
  if(stadiums.some(x=>/^Jamming Tower\b/i.test(text(x))))return false;
  if(arr(opp?.active?.tools).some(x=>/^Tool Jammer BST(?: 136)?\b/i.test(text(x))))return false;
  // Do not assert tool mobility when the actor view does not certify the
  // current player-wide Stadium/Tool suppression epoch.
  if(own?.publicTurnRestrictions?.stadiumAndToolHaveNoEffectTurnsRemaining!==0)
    return false;
  return true;
}
function floatStoneIsLive(o) {
  return floatStoneEffectAvailable(o)&&
    arr(o?.ownPublic?.active?.tools).some(x=>has(x,P.float));
}
function floatStoneMobilityRoot(items,o) {
  if(!o?.ownPublic?.active||has(o.ownPublic.active,P.clefairy)||
     retreatIsForbidden(o)||skylinerIsLive(o)||!floatStoneEffectAvailable(o)||
     arr(o.ownPublic.active.tools).length>0||
     !poweredBenchClefairy(o).length)return null;
  const activePrinting=text(o.ownPublic.active);
  return items.find(a=>a.kind==='play-card'&&has(ownPrinting(a),P.float)&&
    a.publicMetadata?.targetSeat==='actor'&&
    a.publicMetadata?.targetZone==='active'&&
    a.publicMetadata?.isOwnerVisible===true&&
    text(a.targetPrinting)===activePrinting)??null;
}
function noCostRetreatOpportunity(o) {
  const active=o?.ownPublic?.active;
  if(!active||!Array.isArray(o?.ownPublic?.bench))return false;
  if(retreatIsForbidden(o))return false;
  // Skyliner says Basic Pokémon HAVE NO Retreat Cost: the rulebook gives
  // that wording precedence over added-cost modifiers. A printed zero alone
  // is insufficient, because an unobserved continuous modifier can raise it
  // and the worker does not yet support paid-retreat Energy prompts.
  const basicStage=String(active.printed?.stage??'').toUpperCase()==='BASIC';
  return (basicStage&&skylinerIsLive(o))||floatStoneIsLive(o);
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

// Native-offered free retreat to an already-funded secondary attacker:
// evaluate the actual new Active and the old Active's occupied Bench slot,
// rather than counting the target in both places or inventing an attack root.
function freeRetreatToPrintedFinisher(items,o) {
  if(!noCostRetreatOpportunity(o))return null;
  const own=o.ownPublic,bench=arr(own.bench),active=own.active;
  const psychic=/^(?:Psychic Energy|Telepathic Psychic Energy)\b/i;
  const candidates=[];
  for(const root of items) {
    if(root.kind!=='retreat'||root.publicMetadata?.targetSeat!=='actor'||
       root.publicMetadata?.targetZone!=='bench'||
       !safeInt(root.publicMetadata?.benchIndex))continue;
    const i=root.publicMetadata.benchIndex,target=bench[i];
    if(!target||text(root.targetPrinting)!==text(target))continue;
    const nextBench=bench.slice();nextBench[i]=active;
    const next={...o,ownPublic:{...own,active:target,bench:nextBench}};
    let win=null;
    if(has(target,P.latias)&&arr(target.energies).length>=3&&
       arr(target.energies).filter(e=>psychic.test(text(e))).length>=2)
      win=latiasEonBladeKO(next);
    if(has(target,P.lele)&&arr(target.energies).length>=2)
      win=tapuLeleEnergyDriveKO(next);
    if(!win)continue;
    candidates.push({root,win,prizes:win.prizeLowerBound??1,
      damage:win.damage??win.damageLowerBound??0});
  }
  candidates.sort((a,b)=>b.prizes-a.prizes||b.damage-a.damage);
  return candidates[0]?.root??null;
}
function certifiedPsychicBenchTargets(o) {
  const k1=o?.ownerK1;
  if(k1?.exactMembershipKnown!==true||!Array.isArray(k1.knownPrintings))
    return null;
  // Telepathic Psychic Energy tutors Basic Psychic, not arbitrary Basics.
  const psychic=/^(?:Lillie's Clefairy ex JTG(?: 56)?|Latias ex SSP(?: 76)?|Unown AOR(?: 30)?|Mimikyu GRI(?: 58)?|Tapu Lele(?:-GX| GX) GRI(?: 60)?|Fezandipiti ex ASC(?: 142)?)\b/i;
  return k1.knownPrintings.reduce((n,row)=>
    n+(safeInt(row?.copies)&&row.copies>0&&psychic.test(String(row.printing))?
      row.copies:0),0);
}
function bestManualPsychicAttachment(items,o) {
  const own=o?.ownPublic;
  if(!own)return null;
  const openBench=Math.max(0,(stadium(o)?8:5)-benchCount(own));
  const certified=certifiedPsychicBenchTargets(o);
  const availableBasics=certified===null?2:certified;
  const possibleTutor=Math.min(2,openBench,availableBasics);
  const boardRoom=possibleTutor>0&&safeInt(own.deckCount)&&own.deckCount>0;
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
        const extra=possibleTutor*rondoIncrement(o);
        if(ro&&ro.damage<ro.remaining&&ro.damage+extra>=ro.remaining)
          score=80;
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
  if(/^Dedenne(?:-GX| GX) UNB(?: 57)?\b/i.test(text(printing)))return 50;
  if(/^Squawkabilly ex PAL(?: 169)?\b/i.test(text(printing)))return 45;
  if(/^Fezandipiti ex ASC(?: 142)?\b/i.test(text(printing)))return 40;
  if(/^Tapu Lele(?:-GX| GX) GRI(?: 60)?\b/i.test(text(printing)))return 35;
  if(/^Dialga(?:-GX| GX) UPR(?: 100)?\b/i.test(text(printing)))return 30;
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
    // This source slice only attaches to a Clefairy that can still gain a
  // second Psychic Energy; other legal target families deliberately abstain.
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

function fieldBlowerTargetPrintings(o) {
  const opp=o?.opponentPublic,own=o?.ownPublic;
  if(!opp||!own)return [];
  const allTools=[...slots(own),...slots(opp)]
    .flatMap(p=>arr(p.tools)).map(t=>text(t));
  const uniqueTool=printing=>allTools.filter(t=>t===printing).length===1;
  const chosen=[];
  const ownAbilityRole=slots(own).some(p=>has(p,P.clefairy)||
    /^Latias ex SSP(?: 76)?\b/i.test(text(p))||
    has(p,P.crobat)||has(p,P.fez)||has(p,P.lele));
  const active=opp.active;
  const miniorActive=has(own.active,P.minior)&&
    arr(own.active.energies).length>=1;
  const miniorBench=arr(own.bench).some(p=>has(p,P.minior));
  const canAttach=o.ownTurnResources?.energyPlayedTurn===0&&
    arr(o.ownHand).some(c=>has(c,P.basicPsychic)||has(c,P.telepathic));
  if(has(active,P.snorlax)&&(miniorActive||(miniorBench&&canAttach))) {
    const floater=arr(active.tools).find(t=>has(t,P.float));
    if(floater&&uniqueTool(text(floater)))chosen.push(text(floater));
  }
  // Garbotoxin locks can be cleared only if every equipped Garbodor is
  // disarmed. An ambiguous equal-name Tool cannot be safely targeted using
  // the generic card-combination projection's source choice tokens.
  if(ownAbilityRole) {
    // Initialization survives removing ordinary Tool/Stadium locks. Do not
    // confuse a technically removable Path with restoring Fairy Zone.
    const iron=has(opp.active,/^Iron Thorns ex TWM(?: 77)?\b/i)&&
      arr(opp.active.abilities).includes('Initialization')&&
      !arr(opp.active.abilitySuppressions).some(row=>
        row?.abilityName==='Initialization'&&row.suppressed===true);
    if(!iron) {
      const armed=slots(opp).filter(p=>
        /^Garbodor (?:LTR(?: 68)?|BKP(?: 57)?)\b/i.test(text(p))&&
        arr(p.abilities).includes('Garbotoxin')&&
        !arr(p.abilitySuppressions).some(row=>
          row?.abilityName==='Garbotoxin'&&row.suppressed===true)&&
        arr(p.tools).length===1);
      const armedTools=armed.map(p=>text(p.tools[0]));
      const stadiums=[...arr(own.stadium),...arr(opp.stadium)];
      const blockers=stadiums.map(c=>text(c)).filter(t=>
        /^(?:Path to the Peak CRE(?: 148)?|Silent Lab PRC(?: 140)?)\b/i.test(t));
      // A SINGLE Field Blower can remove at most two distinct card objects.
      // Partial unlocking of a three-effect lock has no immediate Ability
      // benefit; avoid spending the connector without a deterministic line.
      const allBlockers=[...armedTools,...new Set(blockers)];
      if(allBlockers.length>0&&allBlockers.length<=2&&
         new Set(allBlockers).size===allBlockers.length&&
         armedTools.every(t=>uniqueTool(t))) {
        for(const t of allBlockers)if(!chosen.includes(t))chosen.push(t);
      }
    }
  }
  return chosen.slice(0,2);
}
function fieldBlowerOpportunity(o) {
  return fieldBlowerTargetPrintings(o).length>0;
}
function fieldBlowerPrompt(request) {
  const p=request.prompt,m=p.publicMetadata??{},o=request.observation;
  if(!sameSource(p,P.blower)||p.promptType!=='ChooseCardsPrompt'||
     m.selectionType!=='card-combination'||m.isOwnerVisible!==true||
     !['tool','stadium','mixed'].includes(m.sourceZone)||
     !['opponent','actor','mixed'].includes(m.ownerSeat)||
     !safeInt(m.minimumCount)||!safeInt(m.maximumCount)||
     m.minimumCount>2||m.maximumCount>2)
    return no('R30_BLOWER_PROMPT_UNSUPPORTED');
  const targets=fieldBlowerTargetPrintings(o),chosen=[];
  for(const printing of targets) {
    const offered=arr(p.choices).filter(c=>c.kind==='card'&&
      typeof c.token==='string'&&text(c)===printing);
    if(offered.length===1)chosen.push(offered[0]);
    if(chosen.length>=m.maximumCount)break;
  }
  if(chosen.length<m.minimumCount||!chosen.length)
    return no('R30_BLOWER_NO_UNIQUE_TARGET');
  return picks(chosen);
}
function skyFieldHandExpansionKO(o) {
  const own=o?.ownPublic,ro=projectedRondo(o);
  if(!ro||stadium(o)||o.ownTurnResources?.pokemonPlayLocked===true||
     benchCount(own)!==5||
     !safeInt(ro.remaining)||ro.remaining<=ro.damage)return null;
  const increment=rondoIncrement(o);
  if(!safeInt(increment)||increment<=0)return null;
  const additionalNeeded=Math.ceil((ro.remaining-ro.damage)/increment);
  const handBodies=arr(o?.ownHand).filter(c=>{
    const kind=benchBasicRole(c);
    return kind!==null&&(!PROTECTED_BENCH_FILLER.has(kind)||terminalPrizeThreat(o));
  });
  if(additionalNeeded<1||additionalNeeded>3||
     handBodies.length<additionalNeeded)return null;
  return {additionalNeeded,handBodies:handBodies.length,
    currentDamage:ro.damage,expectedDamage:ro.damage+additionalNeeded*increment,
    targetRemaining:ro.remaining};
}
function leleAbilityAccessIsSafe(o) {
  const stadiums=[...arr(o?.ownPublic?.stadium),...arr(o?.opponentPublic?.stadium)];
  if(stadiums.some(x=>/^(?:Path to the Peak|Silent Lab)\b/i.test(text(x))))
    return false;
  const oppActive=o?.opponentPublic?.active;
  if(/^Iron Thorns ex TWM(?: 77)?\b/i.test(text(oppActive))&&
    arr(oppActive.abilities).includes('Initialization')&&
    !arr(oppActive.abilitySuppressions).some(row=>row?.abilityName==='Initialization'&&
      row.suppressed===true))return false;
  if(slots(o?.ownPublic).some(p=>arr(p.abilitySuppressions).some(row=>
      row?.suppressed===true&&
      ['ABILITY_LOCKED','STADIUM_LOCKED'].includes(row.reasonCode))))
    return false;
  return true;
}
function needWonderTag(o) {
  if(!o||o.ownTurnResources?.supporterPlayedTurn!==0||
     !safeInt(o.ownPublic?.deckCount)||o.ownPublic.deckCount<=0||
     !leleAbilityAccessIsSafe(o))return false;
  const holdingSupporter=arr(o.ownHand).some(c=>
    has(c,P.guzma)||has(c,P.marnie));
  return !holdingSupporter&&
    (arr(o.ownHand).length<=3||guzmaOpportunity(o)!==null);
}
function wonderTagPrompt(request) {
  const p=request.prompt,m=p.publicMetadata??{},o=request.observation;
  if(!sameSource(p,P.lele)||p.promptType!=='ChooseCardsPrompt'||
     m.selectionType!=='card-combination'||m.sourceZone!=='deck'||
     m.ownerSeat!=='actor'||m.isOwnerVisible!==true||
     !safeInt(m.minimumCount)||!safeInt(m.maximumCount)||
     m.minimumCount>1||m.maximumCount!==1)
    return no('R30_LELE_PROMPT_UNSUPPORTED');
  const offered=arr(p.choices).filter(c=>c.kind==='card'&&
    typeof c.token==='string');
  const gust=guzmaOpportunity(o);
  // Raihan is present in the source but its native attach/search continuation
  // is not yet supported by this worker. Do not search for a dead action.
  const preference=gust?[P.guzma,P.marnie]:[P.marnie,P.guzma];
  const picked=preference.flatMap(pat=>offered.filter(c=>has(c,pat)))[0];
  if(picked)return picks([picked]);
  const empty=arr(p.choices).find(c=>c.kind==='empty-selection'&&
    typeof c.token==='string');
  return m.minimumCount===0&&empty?{kind:'select-choice',token:empty.token}:
    no('R30_LELE_NO_SUPPORTER');
}
function isInitialOwnerTurn(o) {
  const t=o?.globalTurn;
  return safeInt(t)&&t>0&&t<=2;
}
function handIsSafeToReset(o,excludePrinting=null) {
  const kept=arr(o?.ownHand).filter(c=>
    excludePrinting===null||!has(c,excludePrinting));
  if(!kept.length)return true;
  if(kept.length>2)return false;
  // A six-card fresh draw is not a cheap alternative when the remaining
  // hand contains a protected singleton, required Basic Psychic, or gust.
  return kept.every(c=>discardScore(c,o)>=45);
}
function hasFreshPriorOpponentTurnKO(request) {
  const turn=request?.observation?.globalTurn;
  const ko=request?.publicEventReceipt?.priorOpponentTurnKO;
  // Twinleaf's owner-side KO Boolean can survive a skipped owner turn after
  // Timeless-GX. Require the independent Store event's actual turn stamp.
  return safeInt(turn)&&turn>1&&ko?.any===true&&ko.turn===turn-1;
}
// Raihan's native KO marker can survive a skipped owner turn too; the stamped
// event receipt, not the native action frontier, is the freshness authority.
function raihanOpportunity(request) {
  const o=request?.observation;
  if(!o||!hasFreshPriorOpponentTurnKO(request))return false;
  const options=previousTurnResponseOptions(o,request.publicEventReceipt,
    c=>has(c,P.basicPsychic));
  return options.some(x=>x.printing==='Raihan EVS')&&
    slots(o.ownPublic).some(p=>has(p,P.clefairy)&&arr(p.energies).length<2);
}
function raihanAttachPrompt(request) {
  const p=request.prompt,m=p.publicMetadata??{},o=request.observation;
  // The pinned Raihan projector records 'active'/'bench' separately on
  // each energy-assignment choice, not in a synthesized prompt-level zone.
  // Requiring a fake top-level 'bench,active' field vetoed *all* real offers.
  if(p.promptType!=='AttachEnergyPrompt'||
     !sameSource(p,P.raihan)||p.source?.effectName!=='Raihan'||
     m.selectionType!=='energy-attachment'||m.ownerSeat!=='actor'||
     m.isOwnerVisible!==true||m.sourceZone!=='discard'||
     m.energyType!=='BASIC'||
     m.minimumCount!==1||m.maximumCount!==1||
     m.allowCancel!==false||
     !hasFreshPriorOpponentTurnKO(request))
    return no('R30_RAIHAN_ATTACH_UNSUPPORTED');
  const options=arr(p.choices).filter(c=>{
    const cm=c.publicMetadata??{},zone=cm.zone??cm.targetZone;
    return c.kind==='energy'&&typeof c.token==='string'&&
      has(c,P.basicPsychic)&&cm.sourceZone==='discard'&&
      cm.ownerSeat==='actor'&&cm.isOwnerVisible===true&&
      cm.energyType==='BASIC'&&
      (cm.targetSeat===undefined||cm.targetSeat==='actor')&&
      (zone==='active'||zone==='bench');
  });
  // This source slice only attaches to a Clefairy that can still gain its
  // second Psychic Energy; other legal target families deliberately abstain.
  const ranked=options.map(c=>{
    const cm=c.publicMetadata??{},zone=cm.zone??cm.targetZone;
    const index=safeInt(cm.benchIndex)?cm.benchIndex:
      safeInt(cm.targetIndex)?cm.targetIndex:cm.slotIndex;
    const target=zone==='active'?o.ownPublic?.active:
      safeInt(index)?arr(o.ownPublic?.bench)[index]:null;
    const useful=has(target,P.clefairy)&&arr(target?.energies).length<2;
    return {choice:c,score:!useful?-1:zone==='active'?150:125};
  }).filter(x=>x.score>0).sort((a,b)=>b.score-a.score);
  return ranked.length?{kind:'select-choice',token:ranked[0].choice.token}:
    no('R30_RAIHAN_ATTACH_NO_TARGET');
}
// Tactical search priorities are a deterministic local heuristic, not a
// claim that the chosen card is optimal across the full Aichi field.
function raihanSearchPriority(choice,o,request) {
  const hand=arr(o.ownHand),board=slots(o.ownPublic),discard=arr(o.ownPublic?.discard);
  const owned=pattern=>hand.some(c=>has(c,pattern))||
    board.some(c=>has(c,pattern))||discard.some(c=>has(c,pattern));
  const clefairyCount=hand.filter(c=>has(c,P.clefairy)).length+
    board.filter(c=>has(c,P.clefairy)).length+
    discard.filter(c=>has(c,P.clefairy)).length;
  if(has(choice,P.clefairy)&&clefairyCount<2)return 125-clefairyCount*5;
  if(has(choice,P.fez)&&!owned(P.fez)&&hand.length<=3&&
     hasFreshPriorOpponentTurnKO(request))return 120;
  if(has(choice,P.crobat)&&!owned(P.crobat)&&hand.length<=3)return 110;
  if(has(choice,P.dedenne)&&!owned(P.dedenne)&&hand.length<=2&&
     handIsSafeToReset(o))return 105;
  if(has(choice,P.lele)&&!owned(P.lele)&&
     hand.some(c=>has(c,P.guzma)||has(c,P.marnie)))return 95;
  if(has(choice,P.blower)&&fieldBlowerOpportunity(o)&&
     !hand.some(c=>has(c,P.blower)))return 90;
  if(has(choice,P.guzma)&&guzmaOpportunity(o)&&
     !hand.some(c=>has(c,P.guzma)))return 85;
  if(has(choice,P.latias)&&!owned(P.latias)&&benchCount(o.ownPublic)<5)return 80;
  if(has(choice,P.marnie)&&!hand.some(c=>has(c,P.marnie)))return 70;
  if(has(choice,P.quickBall)&&!hand.some(c=>has(c,P.quickBall)))return 60;
  if(has(choice,P.basicPsychic))return 50;
  if(has(choice,P.unown)&&!owned(P.unown)&&benchCount(o.ownPublic)<5)return 40;
  if(has(choice,P.minior)&&!owned(P.minior)&&benchCount(o.ownPublic)<5)return 35;
  return 0;
}
function raihanSearchPrompt(request) {
  const p=request.prompt,m=p.publicMetadata??{},o=request.observation;
  if(p.promptType!=='ChooseCardsPrompt'||
     m.selectionType!=='card-combination'||m.ownerSeat!=='actor'||
     m.isOwnerVisible!==true||m.sourceZone!=='deck'||
     m.minimumCount!==1||m.maximumCount!==1||
     !hasFreshPriorOpponentTurnKO(request))
    return no('R30_RAIHAN_SEARCH_UNSUPPORTED');
  const choices=arr(p.choices).filter(c=>c.kind==='card'&&
    typeof c.token==='string');
  const ranked=choices.map(c=>({choice:c,
    score:raihanSearchPriority(c,o,request)}))
    .filter(x=>x.score>0).sort((a,b)=>b.score-a.score);
  return ranked.length?picks([ranked[0].choice]):
    no('R30_RAIHAN_SEARCH_NO_TARGET');
}
function raihanPrompt(request) {
  const p=request.prompt;
  if(!sameSource(p,P.raihan))return no('R30_RAIHAN_ATTACH_UNSUPPORTED');
  if(p.promptType==='AttachEnergyPrompt')return raihanAttachPrompt(request);
  if(p.promptType==='ChooseCardsPrompt')return raihanSearchPrompt(request);
  return no('R30_RAIHAN_ATTACH_UNSUPPORTED');
}
function countOwnedHeavyBallBasic(o,pattern) {
  const hand=arr(o?.ownHand),board=slots(o?.ownPublic),
    discard=arr(o?.ownPublic?.discard);
  return hand.filter(c=>has(c,pattern)).length+
    board.filter(c=>has(c,pattern)).length+
    discard.filter(c=>has(c,pattern)).length;
}
function hisuianHeavyBallOpportunity(o,request) {
  const own=o?.ownPublic;
  if(!own||!safeInt(own.prizeCount)||own.prizeCount<=0)return false;
  return HEAVY_BALL_BASIC.some(row=>
    countOwnedHeavyBallBasic(o,row.pattern)<row.copies);
}
function hisuianHeavyBallPriority(choice,o,request) {
  const hand=arr(o.ownHand),kind=HEAVY_BALL_BASIC.find(row=>
    has(choice,row.pattern))?.kind;
  if(!kind)return 0;
  const row=HEAVY_BALL_BASIC.find(x=>x.kind===kind);
  if(countOwnedHeavyBallBasic(o,row.pattern)>=row.copies)return 0;
  if(kind==='clefairy')
    return 125-countOwnedHeavyBallBasic(o,row.pattern)*5;
  if(kind==='fez'&&hand.length<=3&&hasFreshPriorOpponentTurnKO(request))
    return 120;
  if(kind==='latias'&&benchCount(o.ownPublic)<5)return 110;
  if(kind==='crobat'&&hand.length<=3)return 100;
  if(kind==='dedenne'&&hand.length<=2&&handIsSafeToReset(o))
    return 98;
  if(kind==='squawk'&&!isLaterTurn(o)&&hand.length<=2)return 95;
  if(kind==='minior'&&miniorStallOpportunity(o)?.knockout)return 92;
  if(kind==='lele'&&hand.some(c=>has(c,P.guzma)||has(c,P.marnie)))return 90;
  if(kind==='mimikyu'&&slots(o.opponentPublic).some(c=>
    /(?:-GX| GX|\bex\b)/i.test(text(c))))return 88;
  if(kind==='unown'&&benchCount(o.ownPublic)<5)return 80;
  const fallback=startingActiveRank(choice);
  return fallback>0?30+fallback/10:0;
}
function hisuianHeavyBallPrompt(request) {
  const p=request.prompt,m=p.publicMetadata??{},o=request.observation;
  if(!sameSource(p,P.heavyBall)||p.promptType!=='ChooseCardsPrompt'||
     m.selectionType!=='card-combination'||m.sourceZone!=='prizes'||
     m.ownerSeat!=='actor'||m.isOwnerVisible!==true||
     m.minimumCount!==0||m.maximumCount!==1)
    return no('R30_HEAVYBALL_PROMPT_UNSUPPORTED');
  // Twinleaf has already filtered this Prize collection to Basic Pokémon.
  // Trust only the actor-visible offered cards; the empty choice is legal
  // because the native prompt permits 0..1.
  const offered=arr(p.choices).filter(c=>c.kind==='card'&&
    typeof c.token==='string');
  const ranked=offered.map((c,index)=>({c,index,
    score:hisuianHeavyBallPriority(c,o,request)}))
    .filter(x=>x.score>0).sort((a,b)=>b.score-a.score||a.index-b.index);
  if(ranked.length)return picks([ranked[0].c]);
  const empty=arr(p.choices).find(c=>c.kind==='empty-selection'&&
    typeof c.token==='string');
  return empty?{kind:'select-choice',token:empty.token}:
    no('R30_HEAVYBALL_NO_EMPTY_CHOICE');
}
function drawSupportOpportunity(request) {
  const o=request?.observation,own=o?.ownPublic,items=availableCards(request);
  if(!own||!leleAbilityAccessIsSafe(o)||
     !safeInt(own.deckCount)||own.deckCount<=0)return null;
  const hand=arr(o.ownHand),small=hand.length<=3;
  const priorOpponentKO=hasFreshPriorOpponentTurnKO(request);
  const readyAbility=(print,ability)=>items.find(a=>
    a.kind==='use-ability'&&has(ownPrinting(a),print)&&
    a.publicMetadata?.abilityName===ability);
  const fromHand=print=>items.find(a=>a.kind==='play-card'&&
    has(ownPrinting(a),print)&&a.publicMetadata?.targetSeat==='actor'&&
    a.publicMetadata?.targetZone==='bench'&&
    a.publicMetadata?.isOwnerVisible===true);
  const freeBench=benchCount(own)<(stadium(o)?8:5);
  if(priorOpponentKO&&hand.length<=4) {
    const flip=readyAbility(P.fez,'Flip the Script');
    if(flip)return flip;
    const fezInPlay=slots(own).some(p=>has(p,P.fez));
    if(!fezInPlay&&freeBench) {
      const setFez=fromHand(P.fez);
      if(setFez)return setFez;
    }
  }
  if(isInitialOwnerTurn(o)&&small&&handIsSafeToReset(o)) {
    const seize=readyAbility(P.squawk,'Squawk and Seize');
    if(seize)return seize;
  }
  if(small) {
    const dark=readyAbility(P.crobat,'Dark Asset');
    if(dark)return dark;
    if(freeBench&&!slots(own).some(p=>has(p,P.crobat))) {
      const setCrobat=fromHand(P.crobat);
      if(setCrobat)return setCrobat;
    }
  }
  if(hand.length<=2&&handIsSafeToReset(o,P.dedenne)&&freeBench&&
     !slots(own).some(p=>has(p,P.dedenne))) {
    const setDedenne=fromHand(P.dedenne);
    if(setDedenne)return setDedenne;
  }
  return null;
}
function onPlayDrawConfirmPrompt(request) {
  const p=request.prompt,o=request.observation;
  if(p?.promptType!=='ConfirmPrompt'||
     p.publicMetadata?.selectionType!=='confirm'||
     !leleAbilityAccessIsSafe(o))return no('R30_DRAW_CONFIRM_UNSUPPORTED');
  const effect=p.source?.effectName;
  const crobat=sameSource(p,P.crobat)&&effect==='Dark Asset';
  const dedenne=sameSource(p,P.dedenne)&&effect==='Dedechange';
  const squawk=sameSource(p,P.squawk)&&effect==='Squawk and Seize';
  if(!crobat&&!dedenne&&!squawk)
    return no('R30_DRAW_CONFIRM_UNSUPPORTED');
  const allow=crobat?
    arr(o.ownHand).length<=3&&o.ownPublic.deckCount>0:
    dedenne?handIsSafeToReset(o)&&o.ownPublic.deckCount>0:
      isInitialOwnerTurn(o)&&handIsSafeToReset(o)&&o.ownPublic.deckCount>0;
  const answer=allow?'Yes':'No';
  const choice=arr(p.choices).find(c=>c.kind==='confirm'&&
    c.label===answer&&typeof c.token==='string');
  return choice?{kind:'select-choice',token:choice.token}:
    no('R30_DRAW_CONFIRM_UNSUPPORTED');
}
function marnieRecoveryOpportunity(o) {
  const own=o?.ownPublic;
  if(!supporterAvailable(o)||!safeInt(own?.deckCount)||
     own.deckCount<5)return false;
  const remaining=arr(o.ownHand).filter(c=>!has(c,P.marnie));
  // Prefer a reshuffle only after cheap Basic deployment and manual Energy
  // have been considered; a protected singleton is not expendable draw fuel.
  return remaining.length<=2&&remaining.every(c=>discardScore(c,o)>=35);
}
function rescueStretcherTarget(o) {
  const own=o?.ownPublic;
  if(!own||o.ownTurnResources?.pokemonPlayLocked===true||
     benchCount(own)>=(stadium(o)?8:5))return null;
  const discard=arr(own.discard),held=arr(o.ownHand),board=slots(own);
  const ownClefairy=board.filter(p=>has(p,P.clefairy)).length+
    held.filter(p=>has(p,P.clefairy)).length;
  if(ownClefairy<=1&&discard.some(c=>has(c,P.clefairy)))return P.clefairy;
  const latias=/^Latias ex SSP(?: 76)?\b/i;
  if(!board.some(p=>has(p,latias))&&!held.some(c=>has(c,latias))&&
     discard.some(c=>has(c,latias)))return latias;
  return null;
}
function rescueStretcherPrompt(request) {
  const p=request.prompt,m=p?.publicMetadata??{},o=request.observation;
  if(!sameSource(p,P.stretcher))return no('R30_STRETCHER_PROMPT_UNSUPPORTED');
  const desired=rescueStretcherTarget(o);
  if(!desired)return no('R30_STRETCHER_NO_TARGET');
  if(['SelectPrompt','SelectOptionPrompt'].includes(p.promptType)&&
     m.selectionType==='option') {
    // Card text's first mode returns 1 Pokémon directly to hand. Do not
    // infer native indices: choose by actual actor-visible option label.
    const mode=arr(p.choices).find(c=>c.kind==='option'&&
      typeof c.token==='string'&&
      /(?:put|get|return|retrieve).*(?:pok[eé]mon).*(?:hand)/i.test(c.label??''));
    return mode?{kind:'select-choice',token:mode.token}:
      no('R30_STRETCHER_PROMPT_UNSUPPORTED');
  }
  if(p.promptType!=='ChooseCardsPrompt'||
     m.selectionType!=='card-combination'||m.sourceZone!=='discard'||
     m.ownerSeat!=='actor'||m.isOwnerVisible!==true||
     m.minimumCount!==1||m.maximumCount!==1)
    return no('R30_STRETCHER_PROMPT_UNSUPPORTED');
  const target=arr(p.choices).find(c=>c.kind==='card'&&
    typeof c.token==='string'&&has(c,desired));
  return target?picks([target]):no('R30_STRETCHER_NO_TARGET');
}
function rootDecision(request,{enablePatchProjection=false}={}) {
  const o=request.observation;
  // Treat the native frontier as a legal offer, but never trust a stale
  // synthetic or cached Supporter action after the per-turn count is spent.
  const items=availableCards(request).filter(a=>supporterAvailable(o)||
    !(a.kind==='play-card'&&[P.guzma,P.marnie,P.raihan].some(p=>
      has(ownPrinting(a),p))));
  if(!items.length)return no('R30_NO_OFFERED_ROOT');
  const latiasBlade=items.find(a=>a.kind==='attack'&&
    a.attackName==='Eon Blade'&&has(ownPrinting(a),P.latias));
  if(latiasBlade&&latiasEonBladeKO(o))return act(latiasBlade);
  const leleDrive=items.find(a=>a.kind==='attack'&&
    a.attackName==='Energy Drive'&&has(ownPrinting(a),P.lele));
  if(leleDrive&&tapuLeleEnergyDriveKO(o))return act(leleDrive);
  const mimikyuCopycat=items.find(a=>a.kind==='attack'&&
    a.attackName==='Copycat'&&has(ownPrinting(a),P.mimikyu));
  if(mimikyuCopycat&&guaranteedMimikyuCopycatKO(request))
    return act(mimikyuCopycat);
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
  // Lele's on-play Wonder Tag is an executable supporter-access axis,
  // not merely a two-Prize Bench filler. Under public Ability lock preserve it.
  if(needWonderTag(o)){
    const wonder=items.find(a=>a.kind==='use-ability'&&
      a.publicMetadata?.abilityName==='Wonder Tag'&&has(ownPrinting(a),P.lele));
    if(wonder)return act(wonder);
    if(benchCount(o.ownPublic)<(stadium(o)?8:5)){
      const playLele=items.find(a=>a.kind==='play-card'&&has(ownPrinting(a),P.lele));
      if(playLele)return act(playLele);
    }
  }
  // Use actual draw/hand-reset engine actions, not hypothetical access
  // through the Bench. Reserve on-play support cards until usable.
  const immediateDraw=drawSupportOpportunity(request);
  if(immediateDraw)return act(immediateDraw);
  // Strip a unique opposing Snorlax Float Stone before the prepared
  // Minior Far-Flying Meteor / Gravitational Tackle counter sequence.
  const forceBlower=items.find(a=>a.kind==='play-card'&&has(ownPrinting(a),P.blower));
  if(forceBlower&&fieldBlowerOpportunity(o))return act(forceBlower);
  const heavyBall=items.find(a=>a.kind==='play-card'&&has(ownPrinting(a),P.heavyBall));
  if(heavyBall&&hisuianHeavyBallOpportunity(o,request))return act(heavyBall);
  const raihan=items.find(a=>a.kind==='play-card'&&has(ownPrinting(a),P.raihan));
  if(raihan&&raihanOpportunity(request))return act(raihan);
  // If Field Blower removes Sky Field, the attack's damage may fall below KO.
  // No Field Blower line is opened before a still-available Rondo attack.
  const sky=items.find(a=>a.kind==='play-card' && has(ownPrinting(a),P.sky));
  const ro=projectedRondo(o);
  // Sky Field opens THREE additional Bench positions; evaluate a funded
  // three-body in-hand Rondo KO, not just the first +20-damage step.
  if(sky && skyFieldHandExpansionKO(o))return act(sky);
  const stretcher=items.find(a=>a.kind==='play-card'&&has(ownPrinting(a),P.stretcher));
  if(stretcher&&rescueStretcherTarget(o))return act(stretcher);
  const vip=items.find(a=>a.kind==='play-card'&&has(ownPrinting(a),P.vip));
  const missingStarter=!slots(o.ownPublic).some(x=>has(x,P.clefairy))&&
    !arr(o.ownHand).some(x=>has(x,P.clefairy));
  const vipSetup=vip&&!isLaterTurn(o)&&
    o.ownTurnResources?.pokemonPlayLocked!==true&&
    benchCount(o.ownPublic)<(stadium(o)?8:5);
  // An unspent first-turn VIP must be deployed before speculative Mail when
  // there is real setup space. Preserve Mail priority only with an almost-full
  // Bench already containing the key attackers.
  if(vipSetup&&(missingStarter||benchCount(o.ownPublic)<=3))return act(vip);
  const mail=items.find(a=>a.kind==='play-card'&&has(ownPrinting(a),P.mail));
  if(mail&&Number.isSafeInteger(o.ownPublic?.deckCount)&&o.ownPublic.deckCount>0)return act(mail);
  if(vipSetup)return act(vip);
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
  if(seeker&&supporterAvailable(o)&&(
       (guzmaOpportunity(o)&&discard.some(c=>has(c,P.guzma)))||
       vsSeekerMarnieRecovery(o)))return act(seeker);
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
  const freeFinisher=freeRetreatToPrintedFinisher(items,o);
  if(freeFinisher)return act(freeFinisher);
  // Prefer a free native RetreatAction to a funded Clefairy over ending a
  // turn with an inert Active. A tactical 3-Prize Guzma keeps precedence.
  const freeRetreat=freeRetreatToClefairy(items,o);
  if(freeRetreat)return act(freeRetreat);
  const floatMobility=floatStoneMobilityRoot(items,o);
  if(floatMobility)return act(floatMobility);
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
  const marnie=items.find(a=>a.kind==='play-card'&&has(ownPrinting(a),P.marnie));
  if(marnie&&!candidateCanUseBoardHeldStarAlchemy(o)&&
     (threatenSecondTarget(o)||marnieRecoveryOpportunity(o)))return act(marnie);
  const farewell=items.find(a=>a.kind==='use-ability'&&
    a.publicMetadata?.abilityName==='Farewell Letter'&&
    /^Unown AOR(?: 30)?\b/i.test(text(ownPrinting(a))));
  if(farewell&&farewellOpportunity(o))return act(farewell);
  if(attack)return act(attack);
  // When the single Mimikyu tech is stranded Active, its printed Filch draws
  // two cards without a prompt; this is preferable to an unsupported pass.
  const filch=items.find(a=>a.kind==='attack'&&a.attackName==='Filch'&&
    has(ownPrinting(a),P.mimikyu));
  if(filch&&safeInt(o.ownPublic?.deckCount)&&o.ownPublic.deckCount>=2)
    return act(filch);
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
      if([P.crobat,P.dedenne,P.squawk].some(p=>sameSource(request.prompt,p)))
        return onPlayDrawConfirmPrompt(request);
      if(sameSource(request.prompt,P.stretcher))return rescueStretcherPrompt(request);
      if(sameSource(request.prompt,P.raihan))return raihanPrompt(request);
      if(sameSource(request.prompt,P.heavyBall))return hisuianHeavyBallPrompt(request);
      if(sameSource(request.prompt,P.lele))return wonderTagPrompt(request);
      if(sameSource(request.prompt,P.blower))return fieldBlowerPrompt(request);
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
module.exports={POLICY_VERSION,SOURCE_RANK,SOURCE_LIST_BLOB_SHA1,SOURCE_COUNTS,sourceCardPatternCoverage,heavyBallBasicCoverage,createPolicy,
  vsSeekerMarnieRecovery,emperorEyesDisablesBasicBlock,certifiedPsychicBenchTargets,rescueStretcherTarget,rescueStretcherPrompt,marnieRecoveryOpportunity,rondoSearchFillerOpportunity,isInitialOwnerTurn,handIsSafeToReset,drawSupportOpportunity,onPlayDrawConfirmPrompt,leleAbilityAccessIsSafe,needWonderTag,wonderTagPrompt,skyFieldHandExpansionKO,rondoBenchFillerDemand,fieldBlowerTargetPrintings,fieldBlowerOpportunity,fieldBlowerPrompt,opponentSnorlaxBlockMayBeLive,retreatIsForbidden,floatStoneEffectAvailable,floatStoneIsLive,floatStoneMobilityRoot,rank30EngineSetupPrompt,startingActiveRank,startingBenchRank,psychicResistanceLoss,clefairyRondoDamage,clefairyWeaknessAgainst,skylinerIsLive,noCostRetreatOpportunity,freeRetreatToClefairy,freeRetreatToPrintedFinisher,bestManualPsychicAttachment,rootDecision,boxPrompt,quickBallPrompt,vipPrompt,telepathPrompt,starAlchemyPrompt,starNeedsResource,guzmaPrompt,guzmaOpportunity,battleCompressorPrompt,vsSeekerPrompt,compressorOpportunity,sourcePrizeTarget,minimumPrizesOnAttackKnockout,patchPrompt,projectedRondo,discardScore,benchBasicRole,selectBasicBenchRoot,farewellOpportunity,carrierOpportunity,rescueCarrierPrompt,miniorStallOpportunity,miniorConfirmPrompt,latiasEonBladeKO,tapuLeleEnergyDriveKO,guaranteedMimikyuCopycatKO,trainersMailPriority,trainersMailPrompt,liveFairyZone,rondoWeaknessMultiplier,rondoIncrement,safeDiscardPayment,ultraOpportunity,ultraBallPrompt,candidateCanUseBoardHeldStarAlchemy,hasFreshPriorOpponentTurnKO,raihanOpportunity,raihanAttachPrompt,raihanSearchPrompt,raihanPrompt,hisuianHeavyBallOpportunity,hisuianHeavyBallPrompt};
