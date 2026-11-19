'use strict';
/*
 * Agent35 rank-31 Dusknoir/Chimecho opponent policy v1.
 * Exact source/candidate bound; deterministic actor-view-only prototype.
 * MoveDamagePrompt is not projected by the shared host adapter and fails closed.
 * This is not a complete or native-validated playing policy.
 */
const POLICY_VERSION = 'agent35-rank31-dusknoir-chimecho-opponent-v1';
const SOURCE_RANK = 31;
const SOURCE_LIST_BLOB_SHA1 = 'ae773f6201d7aa69d31914dbfee66f3fba692200';
const SOURCE_FINGERPRINT_SHA256 = '36b077c17263471d3a2161f9cfcd352d9de7b9cfad6eeb8ad60310c32b5845c8';
const CANDIDATE_FINGERPRINT_SHA256 = '1880c60b44761c0cf22eb3e5cfa43e6e5581c174dc737932c19728cc5da5a1e4';
const ENGINE_PIN = 'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05';
const WORKER_PROTOCOL_BLOB_SHA1 = 'd51ea95c457d61b50a9ee114d342eb17f4350451';

const P = Object.freeze({
  duskull: /^Duskull PRE 35\b/i, dusclops: /^Dusclops PRE 36\b/i,
  dusknoir: /^Dusknoir PRE 37\b/i, dusknoirBcr: /^Dusknoir BCR 63\b/i,
  alakazam: /^Radiant Alakazam SIT 59\b/i, koffing: /^Koffing CEC 76\b/i,
  unown: /^Unown AOR 30\b/i, chimecho: /^Chimecho CIN 43\b/i,
  gengar: /^Gengar & Mimikyu-GX TEU 53\b/i, bloodmoon: /^Bloodmoon Ursaluna ex TWM 141\b/i,
  latias: /^Latias ex SSP 76\b/i, tapuLele: /^Tapu Lele-GX GRI 60\b/i,
  roxie: /^Roxie CEC 205\b/i, fieldBlower: /^Field Blower GRI 125\b/i,
  battleVip: /^Battle VIP Pass FST 225\b/i, poffin: /^Buddy-Buddy Poffin TEF 144\b/i,
  fogCrystal: /^Fog Crystal CRE 140\b/i, carrier: /^Rescue Carrier EVS 154\b/i,
  stretcher: /^Rescue Stretcher GRI 130\b/i, quickBall: /^Quick Ball FST 237\b/i,
  heavyBall: /^Hisuian Heavy Ball ASR 146\b/i, escapeRope: /^Escape Rope BST 125\b/i,
  pokeStop: /^PokéStop PGO 68\b/i, grandTree: /^Grand Tree SCR 136\b/i,
  hood: /^Stealthy Hood UNB 186\b/i, sealStone: /^Forest Seal Stone SIT 156\b/i,
  floatStone: /^Float Stone BKT 137\b/i, psychicEnergy: /^Psychic Energy\b/i
});
const ACTIONS = new Set(['play-card','attack','retreat','use-ability','use-stadium','pass']);
const arr = v => Array.isArray(v) ? v : [];
const textOf = v => typeof v === 'string' ? v :
  typeof v?.printing === 'string' ? v.printing :
  typeof v?.actorPrinting === 'string' ? v.actorPrinting :
  typeof v?.label === 'string' ? v.label : '';
const has = (v,p) => p.test(textOf(v));
const slots = p => [{zone:'active',index:0,pokemon:p?.active??null},
  ...arr(p?.bench).map((pokemon,index)=>({zone:'bench',index,pokemon}))].filter(x=>x.pokemon&&!x.pokemon.concealed);
const boardHas = (p,pat) => slots(p).some(x=>has(x.pokemon.printing,pat));
const boardCount = (p,pat) => slots(p).filter(x=>has(x.pokemon.printing,pat)).length;
const handHas = (o,pat) => arr(o?.ownHand).some(x=>has(x,pat));
const handCount = o => arr(o?.ownHand).length;
const benchSpace = p => arr(p?.bench).filter(Boolean).length<5;
const energies = p => arr(p?.energies).length;
const ownEnergy = o => slots(o?.ownPublic).reduce((n,x)=>n+energies(x.pokemon),0);
const remainingHp = p => Number.isFinite(p?.hp)&&Number.isFinite(p?.damage)?p.hp-p.damage:-1;
const toolHas = (p,pat) => arr(p?.tools).some(x=>has(x,pat));
const opponentTools = o => slots(o?.opponentPublic).reduce((n,x)=>n+arr(x.pokemon.tools).length,0);
const hoodCount = o => slots(o?.opponentPublic).reduce((n,x)=>n+arr(x.pokemon.tools).filter(x=>has(x,P.hood)).length,0);
const stadiumCount = o => arr(o?.opponentPublic?.stadium).length;
const prizes = p => {
  const s=arr(p?.printed?.subtypes).join(' ').toLowerCase(), n=textOf(p?.printing).toLowerCase();
  if(/\b(tag team|vmax|v-union)\b/.test(s)||/-gx\b/.test(n)) return 3;
  if(/\b(vstar|v|ex|gx)\b/.test(s)||/\b(?:v|ex|gx)\b/.test(n)) return 2;
  return 1;
};
const ruleBox = v => /(?:-GX\b|\bGX\b|\bEX\b|\bex\b|Pokémon V\b|VMAX\b|VSTAR\b)/i.test(textOf(v));
const supporterReady = o => o?.ownTurnResources?.supporterPlayedTurn===0 &&
  o?.ownTurnResources?.supporterPlayLocked!==true &&
  o?.ownPublic?.publicTurnRestrictions?.supporterPlayLocked!==true;
const itemReady = o => o?.ownTurnResources?.itemPlayLocked!==true &&
  o?.ownPublic?.publicTurnRestrictions?.itemPlayLocked!==true;

function targetForChoice(choice, player, owner) {
  const m=choice?.publicMetadata??{};
  if(m.ownerSeat!==owner) return null;
  if(m.targetZone==='active') return player?.active??null;
  if(m.targetZone==='bench') {
    const n=/bench\s+(\d+)/i.exec(choice?.label??'');
    return n ? arr(player?.bench)[Number(n[1])-1]??null : null;
  }
  return null;
}
function blastDamage(printing) {
  if(P.dusclops.test(printing??'')) return 50;
  if(P.dusknoir.test(printing??'')) return 130;
  return 0;
}
function blastScore(choice,obs,sourcePrinting) {
  const d=blastDamage(sourcePrinting), target=targetForChoice(choice,obs?.opponentPublic,'opponent');
  if(!d||!target||target.printing!==choice.printing||toolHas(target,P.hood)) return 0;
  const hp=remainingHp(target), prizeCount=prizes(target);
  return hp>0&&hp<=d&&prizeCount>=2 ? 300+prizeCount*50+d-hp : 0;
}
function blastOpportunity(obs,d) {
  let best=0;
  for(const {pokemon:p} of slots(obs?.opponentPublic)) {
    const hp=remainingHp(p), pv=prizes(p);
    if(!toolHas(p,P.hood)&&hp>0&&hp<=d&&pv>=2) best=Math.max(best,300+pv*50+d-hp);
  }
  return best;
}
function fieldBlowerTargetScore(choice,obs) {
  const target=targetForChoice(choice,obs?.opponentPublic,'opponent');
  if(!target||target.printing!==choice.printing) return 0;
  return arr(target.tools).reduce((n,t)=>n+(has(t,P.hood)?320:has(t,P.sealStone)?230:has(t,P.floatStone)?170:70),0);
}
function fieldBlowerModeScore(choice,obs) {
  const label=String(choice?.label??'').toLowerCase(), tools=opponentTools(obs), hoods=hoodCount(obs), stadiums=stadiumCount(obs);
  if(!tools&&!stadiums) return 0;
  if(/(?:two|2).{0,30}tool|tool.{0,30}(?:two|2)/.test(label)) return tools>=2?500+hoods*20:90;
  if(/stadium/.test(label)&&/tool/.test(label)) return tools>=1&&stadiums>=1?300+hoods*10:80;
  if(/tool/.test(label)&&tools>0) return 180+hoods*10;
  if(/stadium/.test(label)&&stadiums>0) return 100;
  return 0;
}
function multi(prompt,ranked,min,max) {
  const selected=ranked.filter(x=>x.score>0).sort((a,b)=>b.score-a.score||a.index-b.index).slice(0,max).map(x=>x.choice);
  if(selected.length<min) return {kind:'abstain',reasonCode:'MULTI_SELECT_TARGETS_UNAVAILABLE'};
  if(!selected.length) {
    const empty=arr(prompt?.choices).find(x=>x.kind==='empty-selection');
    return empty?{kind:'select-choice',token:empty.token}:{kind:'abstain',reasonCode:'EMPTY_SELECTION_UNAVAILABLE'};
  }
  return {kind:'select-choices',tokens:selected.map(x=>x.token)};
}
function multiOne(prompt,choices,score,reason) {
  const m=prompt?.publicMetadata??{}, min=Number.isSafeInteger(m.minimumCount)?m.minimumCount:1,
    max=Number.isSafeInteger(m.maximumCount)?m.maximumCount:1;
  const ranked=arr(choices).map((choice,index)=>({choice,index,score:score(choice)}));
  const result=multi(prompt,ranked,min,max);
  return result.kind==='abstain'&&result.reasonCode==='MULTI_SELECT_TARGETS_UNAVAILABLE'
    ? {...result,reasonCode:reason}:result;
}
function one(choices,score,reason) {
  const ranked=arr(choices).map((choice,index)=>({choice,index,score:score(choice)})).filter(x=>x.score>0)
    .sort((a,b)=>b.score-a.score||a.index-b.index);
  return ranked.length?{kind:'select-choice',token:ranked[0].choice.token}:{kind:'abstain',reasonCode:reason};
}
function abilityPokemon(obs) {
  return slots(obs?.opponentPublic).some(x=>arr(x.pokemon.abilities).length||arr(x.pokemon.abilityDetails).length);
}
function opponentPrizes(obs) { return Number.isSafeInteger(obs?.opponentPublic?.prizeCount)?obs.opponentPublic.prizeCount:6; }
function gxUsed(obs) { return obs?.ownPublic?.publicTurnRestrictions?.gxUsed===true||obs?.ownTurnResources?.gxUsed===true; }
function publicTrainerCount(obs) {
  const hand=obs?.opponentPublic?.publicHand;
  if(!Array.isArray(hand)) return null;
  return hand.filter(x=>/^(?:Roxie|Professor|Iono|Arven|Marnie|Guzma|Boss|Field Blower|Fog Crystal|Quick Ball|Rescue|Battle VIP|Buddy-Buddy|Escape Rope|Rare Candy|PokéStop|Grand Tree)/i.test(textOf(x))).length;
}
function attackScore(item,obs) {
  const n=item?.attackName??item?.label??'', m=item?.publicMetadata??{};
  if(/Bell of Silence/i.test(n)) return abilityPokemon(obs)?260:160;
  if(/Horror House-GX/i.test(n)) return !gxUsed(obs)&&opponentPrizes(obs)>0?250:0;
  if(/Poltergeist/i.test(n)) { const c=publicTrainerCount(obs); return c!==null&&c>=2?170+c*20:0; }
  if(/Blood Moon/i.test(n)) return opponentPrizes(obs)<=3?230:90;
  if(/Eon Blade/i.test(n)) {
    const hp=Number.isFinite(m.targetHp)&&Number.isFinite(m.targetDamage)?m.targetHp-m.targetDamage:null;
    const damage=Number.isFinite(m.damageAfterWeakness)?m.damageAfterWeakness:m.damage;
    return hp!==null&&Number.isFinite(damage)&&damage>=hp?230:150;
  }
  if(/Shadow Bind/i.test(n)) return 130;
  if(/Poison Gas/i.test(n)) return 55;
  if(/Mind Ruler/i.test(n)) return Array.isArray(obs?.opponentPublic?.publicHand)&&obs.opponentPublic.publicHand.length>=5?100:0;
  return 0;
}
function scoreAction(item,request) {
  const o=request.observation, own=o.ownPublic??{}, opp=o.opponentPublic??{}, p=item.actorPrinting??'',
    m=item.publicMetadata??{}, h=handCount(o), turn=Number(o.globalTurn??0);
  if(item.kind==='attack') return attackScore(item,o);
  if(item.kind==='use-ability') {
    const a=m.abilityName??item.label??'';
    if(/Cursed Blast/i.test(a)) return blastOpportunity(o,blastDamage(item.actorPrinting));
    if(/Farewell Letter/i.test(a)&&P.unown.test(item.actorPrinting??'')) {
      const u=slots(own).find(x=>has(x.pokemon.printing,P.unown));
      return u&&energies(u.pokemon)===0&&!arr(u.pokemon.tools).length&&(h<=5||!benchSpace(own))?130:0;
    }
    if(/Wonder Tag/i.test(a)&&P.tapuLele.test(item.actorPrinting??'')) return handHas(o,P.roxie)?80:180;
    // Sinister Hand and Painful Spoons are deliberately disabled: MoveDamagePrompt is unprojected.
    return 0;
  }
  if(item.kind==='use-stadium') return P.pokeStop.test(p)&&h<=4&&Number(own.deckCount??0)>8?90:0;
  if(item.kind!=='play-card') return 0;
  if(P.duskull.test(p)) return !boardHas(own,P.duskull)&&benchSpace(own)?210:0;
  if(P.dusclops.test(p)) return boardHas(own,P.duskull)&&!boardHas(own,P.dusclops)?240:0;
  if(P.dusknoir.test(p)) return boardHas(own,P.dusclops)&&!boardHas(own,P.dusknoir)?270:0;
  if(P.dusknoirBcr.test(p)) return 0;
  if(P.chimecho.test(p)) return !boardHas(own,P.chimecho)&&benchSpace(own)?190:0;
  if(P.gengar.test(p)) return !boardHas(own,P.gengar)&&benchSpace(own)?160:0;
  if(P.latias.test(p)) return !boardHas(own,P.latias)&&benchSpace(own)?150:0;
  if(P.tapuLele.test(p)) return !boardHas(own,P.tapuLele)&&benchSpace(own)?145:0;
  if(P.alakazam.test(p)) return !boardHas(own,P.alakazam)&&benchSpace(own)&&slots(opp).some(x=>x.pokemon.damage>0)?135:0;
  if(P.bloodmoon.test(p)) return !boardHas(own,P.bloodmoon)&&benchSpace(own)&&opponentPrizes(o)<=3?150:0;
  if(P.koffing.test(p)) return !boardHas(own,P.koffing)&&!handHas(o,P.roxie)&&benchSpace(own)?90:0;
  if(P.unown.test(p)) return !boardHas(own,P.unown)&&benchSpace(own)&&h<=4?100:0;
  if(P.fieldBlower.test(p)) {
    if(!itemReady(o)) return 0;
    const hc=hoodCount(o),tc=opponentTools(o);
    return hc>=2?320:hc===1&&(tc>=2||stadiumCount(o)>0)?260:tc>0?180:0;
  }
  if(P.roxie.test(p)) return supporterReady(o)?(handHas(o,P.koffing)?290:h>=6?110:0):0;
  if(P.battleVip.test(p)) return turn<=1&&benchSpace(own)?210:0;
  if(P.poffin.test(p)) return turn<=2&&benchSpace(own)?185:0;
  if(P.fogCrystal.test(p)) return (!boardHas(own,P.duskull)&&!handHas(o,P.duskull))||ownEnergy(o)===0?175:90;
  if(P.carrier.test(p)) return /Duskull PRE 35|Dusclops PRE 36|Koffing CEC 76|Chimecho CIN 43/i.test(arr(own.discard).join(' '))?180:0;
  if(P.stretcher.test(p)) return /Dusknoir PRE 37|Dusclops PRE 36|Dusknoir BCR 63|Radiant Alakazam SIT 59/i.test(arr(own.discard).join(' '))?190:0;
  if(P.quickBall.test(p)) return benchSpace(own)&&!boardHas(own,P.duskull)&&h>=2?135:0;
  if(/^Rare Candy\b/i.test(p)) return boardHas(own,P.duskull)&&arr(o.ownHand).some(x=>has(x,P.dusknoir))&&!boardHas(own,P.dusclops)?225:0;
  if(/^Random Receiver\b/i.test(p)) return supporterReady(o)&&!handHas(o,P.roxie)?120:0;
  if(P.pokeStop.test(p)) return h<=4&&Number(own.deckCount??0)>8?85:0;
  if(P.escapeRope.test(p)) return slots(opp).length>1?80:0;
  return 0;
}
function cardScore(choice,obs,context) {
  const p=textOf(choice), own=obs.ownPublic??{}, h=handCount(obs);
  if(context==='roxie') {
    if(ruleBox(choice)) return 0;
    if(P.koffing.test(p)) return 400;
    if(P.unown.test(p)) return 90;
    if(P.duskull.test(p)&&boardCount(own,P.duskull)>=2) return 55;
    return 0;
  }
  if(context==='fog') {
    if(P.duskull.test(p)&&!boardHas(own,P.duskull)&&!handHas(obs,P.duskull)) return 280;
    if(P.chimecho.test(p)&&!boardHas(own,P.chimecho)&&!handHas(obs,P.chimecho)) return 250;
    if(P.koffing.test(p)&&!boardHas(own,P.koffing)&&!handHas(obs,P.koffing)) return 190;
    if(P.psychicEnergy.test(p)&&ownEnergy(obs)===0&&h===0) return 220;
    if(P.psychicEnergy.test(p)&&ownEnergy(obs)===0) return 160;
    return 0;
  }
  if(context==='basic') {
    if(P.duskull.test(p)&&!boardHas(own,P.duskull)) return 280;
    if(P.chimecho.test(p)&&!boardHas(own,P.chimecho)) return 250;
    if(P.koffing.test(p)&&!boardHas(own,P.koffing)&&!handHas(obs,P.roxie)) return 210;
    if(P.unown.test(p)&&!boardHas(own,P.unown)) return 140;
    if(P.gengar.test(p)&&!boardHas(own,P.gengar)) return 130;
    return 0;
  }
  if(context==='wonder') return P.roxie.test(p)&&!handHas(obs,P.roxie)?300:0;
  if(context==='carrier') {
    if(P.duskull.test(p)) return 260;
    if(P.dusclops.test(p)) return 240;
    if(P.koffing.test(p)) return 220;
    if(P.chimecho.test(p)) return 200;
    if(P.unown.test(p)) return 160;
    return 0;
  }
  if(context==='stretcher') {
    if(P.dusknoir.test(p)) return 280;
    if(P.dusclops.test(p)) return 250;
    if(P.dusknoirBcr.test(p)) return 220;
    if(P.alakazam.test(p)) return 210;
    if(P.duskull.test(p)) return 180;
    return 0;
  }
  if(context==='quick-cost') {
    if(P.koffing.test(p)&&handHas(obs,P.roxie)) return 0;
    if(P.dusknoir.test(p)||P.dusclops.test(p)||P.dusknoirBcr.test(p)||P.alakazam.test(p)) return 0;
    if(P.unown.test(p)) return 90;
    if(P.koffing.test(p)) return 65;
    return 35;
  }
  if(context==='stadium') return P.pokeStop.test(p)?120:P.grandTree.test(p)?40:0;
  return 0;
}
function promptDecision(request) {
  const p=request.prompt,o=request.observation,choices=arr(p.choices),sp=p.source?.sourcePrinting??'',
    source=(sp+' '+(p.source?.effectName??'')+' '+(p.description??'')).toLowerCase(),m=p.publicMetadata??{};
  if(p.promptType==='ChoosePokemonPrompt'&&source.includes('cursed blast'))
    return multiOne(p,choices,c=>blastScore(c,o,sp),'NO_UNPROTECTED_PRIZE_TARGET');
  if(source.includes('field blower')&&p.promptType==='SelectOptionPrompt')
    return one(choices,c=>fieldBlowerModeScore(c,o),'FIELD_BLOWER_MODE_UNRECOGNIZED');
  if(source.includes('field blower')&&p.promptType==='ChoosePokemonPrompt') {
    const min=Number.isSafeInteger(m.minimumCount)?m.minimumCount:0,max=Number.isSafeInteger(m.maximumCount)?m.maximumCount:2;
    return multi(p,choices.map((choice,index)=>({choice,index,score:fieldBlowerTargetScore(choice,o)})),min,max);
  }
  if(p.promptType==='ChooseCardsPrompt'&&m.selectionType) {
    const min=Number.isSafeInteger(m.minimumCount)?m.minimumCount:1,max=Number.isSafeInteger(m.maximumCount)?m.maximumCount:min;
    if(source.includes('roxie')) {
      const c=choices.filter(x=>x.publicMetadata?.ownerSeat==='actor'&&x.publicMetadata?.sourceZone==='hand');
      return multi(p,c.map((choice,index)=>({choice,index,score:cardScore(choice,o,'roxie')})),min,max);
    }
    if(source.includes('fog crystal')) {
      const c=choices.filter(x=>x.publicMetadata?.ownerSeat==='actor'&&x.publicMetadata?.sourceZone==='deck');
      return multiOne(p,c,x=>cardScore(x,o,'fog'),'NO_FOG_CRYSTAL_TARGET');
    }
    if(source.includes('battle vip pass')||source.includes('buddy-buddy poffin')) {
      const c=choices.filter(x=>x.publicMetadata?.ownerSeat==='actor'&&x.publicMetadata?.sourceZone==='deck');
      return multi(p,c.map((choice,index)=>({choice,index,score:cardScore(choice,o,'basic')})),min,max);
    }
    if(source.includes('wonder tag')) {
      const c=choices.filter(x=>x.publicMetadata?.ownerSeat==='actor'&&x.publicMetadata?.sourceZone==='deck');
      return multiOne(p,c,x=>cardScore(x,o,'wonder'),'NO_SUPPORTER_TARGET');
    }
    if(source.includes('rescue carrier')) {
      const c=choices.filter(x=>x.publicMetadata?.ownerSeat==='actor'&&x.publicMetadata?.sourceZone==='discard');
      return multi(p,c.map((choice,index)=>({choice,index,score:cardScore(choice,o,'carrier')})),min,max);
    }
    if(source.includes('rescue stretcher')) {
      const c=choices.filter(x=>x.publicMetadata?.ownerSeat==='actor'&&x.publicMetadata?.sourceZone==='discard');
      return multiOne(p,c,x=>cardScore(x,o,'stretcher'),'NO_RECOVERY_TARGET');
    }
    if(source.includes('quick ball')) {
      const c=choices.filter(x=>x.publicMetadata?.ownerSeat==='actor'&&x.publicMetadata?.sourceZone==='hand');
      return multiOne(p,c,x=>cardScore(x,o,'quick-cost'),'NO_SAFE_QUICK_BALL_COST');
    }
  }
  if(p.promptType==='ChoosePokemonPrompt'&&source.includes('rare candy')) {
    const c=choices.filter(x=>x.publicMetadata?.ownerSeat==='actor'&&['active','bench'].includes(x.publicMetadata?.targetZone));
    return multiOne(p,c,x=>{
      const target=targetForChoice(x,o.ownPublic,'actor');
      return target&&P.duskull.test(target.printing)&&arr(o.ownHand).some(y=>has(y,P.dusknoir))?220:0;
    },'NO_RARE_CANDY_DUSKULL_TARGET');
  }
  if(p.promptType==='ChoosePokemonPrompt'&&source.includes('escape rope')) {
    const c=choices.filter(x=>x.publicMetadata?.ownerSeat==='actor'&&x.publicMetadata?.targetZone==='bench');
    return multiOne(p,c,x=>{
      const target=targetForChoice(x,o.ownPublic,'actor');
      if(!target) return 0;
      if(P.chimecho.test(target.printing)||P.gengar.test(target.printing)) return 220;
      if(P.dusknoir.test(target.printing)||P.bloodmoon.test(target.printing)) return 180;
      return 40+energies(target)*10;
    },'NO_SAFE_ESCAPE_ROPE_SWITCH');
  }
  if(p.promptType==='ChoosePrizePrompt'&&source.includes('hisuian heavy ball')) {
    const c=choices.filter(x=>x.publicMetadata?.ownerSeat==='actor'&&x.publicMetadata?.isOwnerVisible===true&&typeof x.printing==='string');
    return multiOne(p,c,x=>P.dusknoir.test(x.printing)||P.dusclops.test(x.printing)||P.duskull.test(x.printing)||P.chimecho.test(x.printing)?180:0,'PRIZE_IDENTITY_UNAVAILABLE');
  }
  if(p.promptType==='MoveDamagePrompt') return {kind:'abstain',reasonCode:'MOVE_DAMAGE_PROMPT_NOT_PROJECTED'};
  return {kind:'abstain',reasonCode:'UNSUPPORTED_PROMPT_TYPE'};
}
function bestAction(request) {
  const items=arr(request.actionFrontier?.items).filter(x=>ACTIONS.has(x.kind));
  if(!items.length) return {kind:'abstain',reasonCode:'NO_EXECUTABLE_ACTION'};
  let best=null,score=0;
  for(const item of items) { const s=scoreAction(item,request); if(s>score){best=item;score=s;} }
  if(best) return {kind:'select-action',token:best.token};
  const pass=items.find(x=>x.kind==='pass');
  return pass?{kind:'select-action',token:pass.token}:{kind:'abstain',reasonCode:'NO_SUPPORTED_ACTION'};
}
function createPolicy({role,seat,policyVersion,config}) {
  const keys=['candidateFingerprint','rank','sourceFingerprint'];
  if(role!=='opponent'||(seat!==0&&seat!==1)||policyVersion!==POLICY_VERSION||!config||
    Object.keys(config).sort().join(',')!==keys.join(',')||config.rank!==SOURCE_RANK||
    config.sourceFingerprint!==SOURCE_FINGERPRINT_SHA256||config.candidateFingerprint!==CANDIDATE_FINGERPRINT_SHA256)
    throw new Error('AGENT35_RANK31_POLICY_INIT_MISMATCH');
  return Object.freeze({decide(request){
    if(!request||request.role!=='opponent'||request.seat!==seat||request.observation?.actorSeat!==seat)
      return {kind:'abstain',reasonCode:'ROLE_SEAT_BINDING_MISMATCH'};
    return request.prompt!==null?promptDecision(request):bestAction(request);
  }});
}
module.exports={POLICY_VERSION,SOURCE_RANK,SOURCE_LIST_BLOB_SHA1,SOURCE_FINGERPRINT_SHA256,
  CANDIDATE_FINGERPRINT_SHA256,ENGINE_PIN,WORKER_PROTOCOL_BLOB_SHA1,createPolicy,scoreAction,
  attackScore,promptDecision,blastDamage,blastScore,fieldBlowerModeScore,fieldBlowerTargetScore};
