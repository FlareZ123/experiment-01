'use strict';
/*
 * Rank 30 Lillie's Clefairy (Aichi 2026) actor-only prototype, not a game policy
 * qualification. Every selected root must be an offered native action token.
 * Native host retains ownership of hidden cards, prompts, shuffle, and legality.
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
  clefairy: /^Lillie's Clefairy ex JTG 56\b/i,
  box: /^Secret Box TWM 163\b/i,
  basicPsychic: /^(?:Basic )?Psychic Energy MEE 13\b/i,
  telepathic: /^Telepathic Psychic Energy POR 88\b/i,
  sky: /^Sky Field ROS 89\b/i,
  vip: /^Battle VIP Pass FST 225\b/i,
  patch: /^(?:Wondrous Patch PFL 94|Wonder Patch MBD)\b/i,
  fss: /^Forest Seal Stone SIT 156\b/i,
  float: /^Float Stone BKT 137\b/i,
  guzma: /^Guzma BUS 115\b/i,
  marnie: /^Marnie SSH 169\b/i,
  quickBall: /^Quick Ball FST 237\b/i,
  blower: /^Field Blower GRI 125\b/i
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
  R30_PATCH_NO_ELIGIBLE_BENCH:'NO_VISIBLE_POKEMON_TARGET'
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
    has(c,P.clefairy)||/^Tapu Lele-GX GRI 60\b/i.test(text(c))||
    /^Mimikyu GRI 58\b/i.test(text(c))));
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
  if (has(p,P.basicPsychic) && hasBenchedPsychic(o.ownPublic)) return 90;
  if (has(p,P.vip) && isLaterTurn(o)) return 80;
  if (has(p,P.sky) && stadium(o) && copyCount(h,P.sky)>1) return 70;
  if (has(p,P.quickBall) && copyCount(h,P.quickBall)>1 && slots(o.ownPublic).some(c=>has(c,P.clefairy))) return 35;
  return 0;
}
function discardPayment(o, choices) {
  const ownHand = arr(o.ownHand);
  const seen = new Set();
  const options = arr(choices).filter(c=>c.kind==='card' && typeof c.token==='string' &&
    !seen.has(c.token) && seen.add(c.token) && ownHand.some(h=>text(h)===text(c)))
    .map((choice,i)=>({choice,score:discardScore(choice,o),i}))
    .filter(row=>row.score>0)
    .sort((a,b)=>b.score-a.score||a.i-b.i);
  return options.length>=3 ? options.slice(0,3).map(row=>row.choice) : null;
}
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
function vipPrompt(request) {
  const p=request.prompt,m=p.publicMetadata??{},o=request.observation;
  if(p.promptType!=='ChooseCardsPrompt'||m.selectionType!=='card-combination'||
    m.ownerSeat!=='actor'||m.isOwnerVisible!==true||m.sourceZone!=='deck'||
    !safeInt(m.minimumCount)||!safeInt(m.maximumCount)||m.maximumCount>2)
    return no('R30_VIP_PROMPT_UNSUPPORTED');
  const offered=arr(p.choices).filter(x=>x.kind==='card'&&typeof x.token==='string');
  const picked=[];
  const find=pattern=>offered.find(x=>has(x,pattern)&&!picked.some(y=>y.token===x.token));
  const clefsAlready=slots(o.ownPublic).filter(x=>has(x,P.clefairy)).length+
    o.ownHand.filter(x=>has(x,P.clefairy)).length;
  // A first Clefairy and Latias enable attacking + retreat mobility.
  if(clefsAlready===0 && picked.length<m.maximumCount){
    const x=find(P.clefairy);if(x)picked.push(x);
  }
  if(picked.length<m.maximumCount &&
     !slots(o.ownPublic).some(x=>/^Latias ex SSP 76\b/i.test(text(x))) &&
     !o.ownHand.some(x=>/^Latias ex SSP 76\b/i.test(text(x)))){
    const x=find(/^Latias ex SSP 76\b/i);if(x)picked.push(x);
  }
  if(picked.length<m.maximumCount && clefsAlready+
      picked.filter(x=>has(x,P.clefairy)).length<2){
    const x=find(P.clefairy);if(x)picked.push(x);
  }
  if(picked.length===0){
    const x=find(/^Mimikyu GRI 58\b/i)??find(/^Unown AOR 30\b/i);
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
    return {c,score:has(target,P.clefairy)?3:
      /^Tapu Lele-GX GRI 60\b/i.test(text(target))?2:
      /^Mimikyu GRI 58\b/i.test(text(target))?1:0};
  }).filter(r=>r.score>0).sort((a,b)=>b.score-a.score)[0];
  return best?{kind:'select-choice',token:best.c.token}:
    no('R30_PATCH_NO_ELIGIBLE_BENCH');
}

function canStartQuickBall(o) {
  if(!o||!Array.isArray(o.ownHand)||!safeInt(o.ownPublic?.deckCount)||
    o.ownPublic.deckCount<1)return false;
  if(slots(o.ownPublic).some(x=>has(x,P.clefairy))||
     o.ownHand.some(x=>has(x,P.clefairy)))return false;
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
    const choice=offered.find(x=>has(x,P.clefairy))??offered.find(x=>/^Latias ex SSP 76\b/i.test(text(x)));
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
function projectedRondo(o) {
  const own=o?.ownPublic, opp=o?.opponentPublic;
  if(!own||!opp||!safeInt(opp.active?.hp)||!safeInt(opp.active?.damage))return null;
  if(opp.active.hp<=opp.active.damage)return null;
  // Only baseline (no effective damage, Weakness or Resistance alterations) is
  // certified by this slice. A native attack could still face a protection effect.
  if(opp.active?.effectUnknown===true||opp.active?.damageModifiersUnknown===true)return null;
  const total=benchCount(own)+benchCount(opp);
  return {damage:20*(1+total),remaining:opp.active.hp-opp.active.damage,total};
}
function sourcePrizeTarget(p) {return /\b(?:VMAX|VSTAR)\b/i.test(text(p))?3:/\b(?:ex|EX|GX| V)\b/i.test(text(p))?2:1;}
function terminalRondo(o) {
  const r=projectedRondo(o);
  return r && /^Shadow Rider Calyrex VMAX CRE 75\b/i.test(text(o.opponentPublic.active)) &&
    r.damage>=r.remaining &&
    safeInt(o.ownPublic?.prizeCount) && o.ownPublic.prizeCount>0 &&
    (o.ownPublic.prizeCount<=sourcePrizeTarget(o.opponentPublic.active)||benchCount(o.opponentPublic)===0);
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

function rootDecision(request,{enablePatchProjection=false}={}) {
  const o=request.observation, items=availableCards(request);
  if(!items.length)return no('R30_NO_OFFERED_ROOT');
  const attack=items.find(a=>a.kind==='attack' && a.attackName==='Full Moon Rondo' &&
    has(ownPrinting(a),P.clefairy));
  if(attack && terminalRondo(o))return act(attack);
  // If Field Blower removes Sky Field, the attack's damage may fall below KO.
  // No Field Blower line is opened before a still-available Rondo attack.
  const sky=items.find(a=>a.kind==='play-card' && has(ownPrinting(a),P.sky));
  const ro=projectedRondo(o);
  if(sky && !stadium(o) && ro && benchCount(o.ownPublic)===5 &&
    o.ownHand.some(c=>has(c,P.clefairy)) && ro.damage<ro.remaining &&
    ro.damage+20>=ro.remaining)return act(sky);
  const vip=items.find(a=>a.kind==='play-card' && has(ownPrinting(a),P.vip));
  if(vip && benchCount(o.ownPublic)<(stadium(o)?8:5))return act(vip);
  const quick=items.find(a=>a.kind==='play-card' && has(ownPrinting(a),P.quickBall));
  if(quick && canStartQuickBall(o))return act(quick);
  const box=items.find(a=>a.kind==='play-card' && has(ownPrinting(a),P.box));
  if(box && canStartBox(o))return act(box);
  // Hand disruption against the publicly imminent two-Prize reply is a
  // tactical heuristic, not a guarantee that a hidden gust will disappear.
  if(enablePatchProjection && basicDiscard(o.ownPublic) && hasBenchedPsychic(o.ownPublic)){
    const patch=items.find(a=>a.kind==='play-card' && has(ownPrinting(a),P.patch));
    if(patch)return act(patch);
  }
  const marnie=items.find(a=>a.kind==='play-card' && has(ownPrinting(a),P.marnie));
  if(marnie && threatenSecondTarget(o) &&
    !candidateCanUseBoardHeldStarAlchemy(o))return act(marnie);
  const attach=items.find(a=>a.kind==='play-card' && has(ownPrinting(a),P.basicPsychic)&&
    has(a.targetPrinting,P.clefairy));
  if(attach)return act(attach);
  const bench=items.find(a=>a.kind==='play-card' && has(ownPrinting(a),P.clefairy) &&
    !slots(o.ownPublic).some(c=>has(c,P.clefairy)));
  if(bench)return act(bench);
  return attack ? act(attack) : no('R30_ROOT_UNSUPPORTED');
}
function createPolicy({role,seat,policyVersion,config}) {
  if(role!=='opponent'||![0,1].includes(seat)||policyVersion!==POLICY_VERSION||
     !config||![2,3].includes(Object.keys(config).length)||
     Object.keys(config).some(k=>!['sourceRank','sourceBlobSha1','enablePatchProjection'].includes(k))||
     (Object.keys(config).length===3&&config.enablePatchProjection!==true)||
     config.sourceRank!==SOURCE_RANK||config.sourceBlobSha1!==SOURCE_LIST_BLOB_SHA1)
    throw new Error('R30_SOURCE_ROLE_CONFIG_MISMATCH');
  return Object.freeze({decide(request){
    if(request?.role!==role||request.seat!==seat||request.observation?.actorSeat!==seat)
      return no('ROLE_SEAT_BINDING_MISMATCH');
    if(!request.observation?.ownPublic||!request.observation?.opponentPublic||
       !Array.isArray(request.observation?.ownHand))return no('R30_OBSERVATION_INCOMPLETE');
    if(request.prompt!==null){
      if(sameSource(request.prompt,P.box))return boxPrompt(request);
      if(sameSource(request.prompt,P.quickBall))return quickBallPrompt(request);
      if(sameSource(request.prompt,P.vip))return vipPrompt(request);
      if(sameSource(request.prompt,P.patch)&&config.enablePatchProjection===true)
        return patchPrompt(request);
      return no('R30_UNSUPPORTED_PROMPT_FAMILY');
    }
    return rootDecision(request,{enablePatchProjection:config.enablePatchProjection===true});
  }});
}
module.exports={POLICY_VERSION,SOURCE_RANK,SOURCE_LIST_BLOB_SHA1,SOURCE_COUNTS,createPolicy,
  rootDecision,boxPrompt,quickBallPrompt,vipPrompt,patchPrompt,projectedRondo,discardScore,candidateCanUseBoardHeldStarAlchemy};
