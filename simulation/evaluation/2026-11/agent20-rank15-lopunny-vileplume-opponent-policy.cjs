'use strict';

/*
 * Original Aichi Open League 2026 rank 15, Lopunny/Vileplume.
 * Narrow actor-only development worker: source-inventory binding, one complete
 * Buddy-Buddy Poffin search/Bench/evolution channel, and source-specific
 * offered-attack decisions. Not a full-game opponent or a win-rate estimate.
 * No hidden opponent cards, identities of Prize cards or rank-specific opponent
 * hand predictions are consulted. The native Store owns action legality.
 */
const POLICY_VERSION = 'agent20-rank15-lopunny-vileplume-opponent-v1';
const SOURCE_RANK = 15;
const SOURCE_LIST_BLOB_SHA1 = 'ae773f6201d7aa69d31914dbfee66f3fba692200';
const SOURCE_COUNTS = Object.freeze([
  ['Oddish UNB 5',2],['Gloom UNB 7',2],['Vileplume AOR 3',2],['Vileplume BUS 6',1],
  ['Buneary PFL 83',2],['Mega Lopunny ex PFL 84',2],['Pidgey FLF 75',2],
  ['Pidgeotto TEU 123',1],['Pidgeotto MEW 17',1],['Pidgeot ex OBF 164',2],
  ['Bunnelby PRC 121',2],['Fan Rotom SCR 118',2],['Budew ASC 16',2],
  ['Eldegoss V RCL 19',1],['Tatsugiri TWM 131',1],
  ['Guzma & Hala CEC 193',3],['Guzma BUS 115',2],['Karen XYP 177',2],
  ['N FCO 105',1],['Tag Call CEC 206',4],['Buddy-Buddy Poffin TEF 144',3],
  ['Xtransceiver NVI 96',2],['Technical Machine: Evolution PAR 178',2],
  ['Stealthy Hood UNB 186',2],['Float Stone BKT 137',1],['Choice Belt PAL 176',1],
  ['Artazon PAL 171',2],['Grand Tree SCR 136',1],['Path to the Peak CRE 148',1],
  ['Silent Lab PRC 140',1],['Jet Energy PAL 190',2],['Grass Energy MEE 9',2],
  ['Capture Energy RCL 171',1],['Powerful Colorless Energy DAA 176',1],
  ['Double Colorless Energy SUM 136',1]
]);
const P = Object.freeze({
  oddish:/^Oddish UNB(?: 5)?\b/i, gloom:/^Gloom UNB(?: 7)?\b/i,
  aor:/^Vileplume AOR(?: 3)?\b/i,bus:/^Vileplume BUS(?: 6)?\b/i,
  buneary:/^Buneary PFL(?: 83)?\b/i,mega:/^Mega Lopunny ex PFL(?: 84)?\b/i,
  pidgey:/^Pidgey FLF(?: 75)?\b/i,
  pidgeotto:/^Pidgeotto (?:TEU(?: 123)?|MEW(?: 17)?)\b/i,
  pidgeot:/^Pidgeot ex OBF(?: 164)?\b/i,
  bunnelby:/^Bunnelby PRC(?: 121)?\b/i,
  fan:/^Fan Rotom SCR(?: 118)?\b/i,budew:/^Budew ASC(?: 16)?\b/i,
  poffin:/^Buddy-Buddy Poffin TEF(?: 144)?\b/i,
  hood:/^Stealthy Hood UNB(?: 186)?\b/i,
  powerful:/^Powerful Colorless Energy DAA(?: 176)?\b/i,
  choiceBelt:/^Choice Belt PAL(?: 176)?\b/i,
  mimikyu:/^Mimikyu GRI(?: 58)?\b/i,
  girafarig:/^Girafarig LOT(?: 94)?\b/i,
  valley:/^Dimension Valley PHF(?: 93)?\b/i
});
const arr = x => Array.isArray(x) ? x : [];
const txt = x => typeof x==='string' ? x :
  (typeof x?.printing==='string' ? x.printing : typeof x?.fullName==='string' ? x.fullName : '');
const has = (x,p) => p.test(txt(x));
const slots = player => [player?.active,...arr(player?.bench)].filter(x=>x&&x.concealed!==true);
const benchCount = player => arr(player?.bench).filter(x=>x&&x.concealed!==true).length;
const ownPrinting = x => x?.actorPrinting ?? x?.publicMetadata?.sourcePrinting ?? '';
const playable = item => ['attack','play-card','retreat','use-ability','use-stadium','pass'].includes(item?.kind)&&
  typeof item?.token==='string'&&item.token.length>0;
const take = item => ({kind:'select-action',token:item.token});
const abstain = reasonCode => ({kind:'abstain',reasonCode});

function sourcePrizeValue(pokemon) {
  const p=txt(pokemon);
  if (/^Mega .* ex\b/i.test(p)||/\bVMAX\b/i.test(p)) return 3;
  if (/\b(?:ex| VSTAR| V|GX|EX)\b/i.test(p)||/-GX\b/i.test(p)) return 2;
  return 1;
}
function movementEvidence(request) {
  const o=request.observation, r=request.publicEventReceipt;
  if(!r||r.actorSeat!==o?.actorSeat||r.turn!==o?.globalTurn||
      !r.ownerActive||txt(r.ownerActive)!==txt(o.ownPublic?.active)) return null;
  return typeof r.ownerActive.movedFromBenchToActiveThisTurn==='boolean' ?
    r.ownerActive.movedFromBenchToActiveThisTurn:null;
}
function printedDamage(item,request) {
  const o=request.observation,own=o?.ownPublic?.active,op=o?.opponentPublic?.active;
  if(!own||!op||item.kind!=='attack')return null;
  const meta=item.publicMetadata??{};
  if(meta.hasUnmodeledModifier===true||meta.damagePrevented===true||
      meta.hasPrevention===true) return null;
  if(Number.isSafeInteger(meta.damageAfterResistance)&&meta.damageAfterResistance>=0)
    return meta.damageAfterResistance;
  // No scalar assertion about Weakness, Resistance or unknown protections.
  if(arr(op.printed?.weakness).length||arr(op.printed?.resistance).length||
      arr(op.tools).length||arr(op.abilitySuppressions).some(x=>x.suppressed===false))return null;
  let value=null;
  if(has(own,P.mega)) {
    if(item.attackName==='Gale Thrust') {
      const moved=movementEvidence(request);
      if(moved===null)return null;
      value=moved?230:60;
    }
    if(item.attackName==='Spiky Hopper')value=160;
    if(value!==null){
      if(arr(own.energies).some(e=>has(e,P.powerful)))value+=20;
      if(arr(own.tools).some(e=>has(e,P.choiceBelt))&&/\bV(?:MAX|STAR)?\b/i.test(txt(op)))value+=30;
    }
  }
  if(has(own,P.pidgeot)&&item.attackName==='Blustery Wind')value=120;
  if(has(own,P.pidgey)&&item.attackName==='Peck Off')value=10;
  return value;
}
function knockOut(item,request) {
  const op=request.observation?.opponentPublic?.active;
  const power=printedDamage(item,request);
  if(!Number.isSafeInteger(op?.hp)||!Number.isSafeInteger(op?.damage)||power===null)return false;
  return op.hp>op.damage && power>=op.hp-op.damage;
}
function terminal(item,request) {
  if(!knockOut(item,request))return false;
  const o=request.observation;
  return Number.isSafeInteger(o.ownPublic?.prizeCount)&&o.ownPublic.prizeCount>0&&
    (o.ownPublic.prizeCount<=sourcePrizeValue(o.opponentPublic.active)||
     benchCount(o.opponentPublic)===0);
}
function candidateCopycatThreat(request) {
  const o=request.observation;
  const own=o?.ownPublic?.active;
  const opp=o?.opponentPublic;
  if(!has(own,P.mega)||!Number.isSafeInteger(own.damage)||
     own.damage<100||own.damage>160 || !Number.isSafeInteger(opp?.prizeCount)||
     opp.prizeCount>3)return false;
  // A concrete public funding hypothesis, not a guarantee of an opponent reply.
  const m=arr(opp.bench).find(x=>has(x,P.mimikyu));
  const funded=m && arr(m.energies).length>=2 ||
    (m&&arr(m.energies).length>=1&&
      [...arr(opp.stadium),...arr(o.ownPublic?.stadium)].some(x=>has(x,P.valley)));
  return !!funded;
}
function doubleBaseCutExposed(request) {
  const o=request.observation;
  const d=arr(o?.ownPublic?.discard);
  const twoBases=d.filter(c=>has(c,P.oddish)).length>=2 ||
    d.filter(c=>has(c,P.gloom)).length>=2;
  const attacker=o?.opponentPublic?.active;
  const valley=[...arr(o?.ownPublic?.stadium),...arr(o?.opponentPublic?.stadium)]
    .some(s=>has(s,P.valley));
  return twoBases&&has(attacker,P.girafarig)&&
    (arr(attacker.energies).length>=1||valley);
}
function usefulEvolution(item,o) {
  const p=ownPrinting(item), target=item.targetPrinting;
  const own=o?.ownPublic, op=o?.opponentPublic;
  if(has(p,P.gloom)&&has(target,P.oddish))return 85;
  if(has(p,P.aor)&&has(target,P.gloom)){
    // AOR lock can shut off our own pending Item setup; avoid rushing it with
    // both Oddish unestablished and Poffin still available in hand.
    const established=slots(own).filter(x=>has(x,P.oddish)||has(x,P.gloom)||has(x,P.aor)||has(x,P.bus)).length;
    if(established<=1 && arr(o.ownHand).some(x=>has(x,P.poffin))&&benchCount(own)<5)return 0;
    return 125;
  }
  if(has(p,P.bus)&&has(target,P.gloom)){
    const oppActive=op?.active;
    return oppActive?.printed?.stage==='BASIC' ? 135:75;
  }
  if(has(p,P.mega)&&has(target,P.buneary))return 90;
  if(has(p,P.pidgeotto)&&has(target,P.pidgey))return 65;
  if(has(p,P.pidgeot)&&has(target,P.pidgeotto))return 78;
  return 0;
}
function usefulBasic(item,o) {
  const p=ownPrinting(item), own=o.ownPublic;
  if(item.kind!=='play-card'||benchCount(own)>=5)return 0;
  const board=slots(own);
  if(has(p,P.oddish))return board.filter(x=>[P.oddish,P.gloom,P.aor,P.bus].some(q=>has(x,q))).length<2?100:0;
  if(has(p,P.buneary))return board.some(x=>has(x,P.buneary)||has(x,P.mega))?0:52;
  if(has(p,P.pidgey))return board.some(x=>has(x,P.pidgey)||has(x,P.pidgeotto)||has(x,P.pidgeot))?0:42;
  if(has(p,P.bunnelby))return board.some(x=>has(x,P.bunnelby))?0:35;
  if(has(p,P.fan))return board.some(x=>has(x,P.fan))?0:30;
  return 0;
}
function rootDecision(request) {
  const o=request.observation;
  const items=arr(request.actionFrontier?.items).filter(playable);
  if(!items.length)return abstain('NO_EXECUTABLE_ACTION');
  const attacks=items.filter(x=>x.kind==='attack');
  const immediate=attacks.find(x=>terminal(x,request));
  if(immediate)return take(immediate);
  const gale=attacks.find(x=>x.attackName==='Gale Thrust'&&has(ownPrinting(x),P.mega));
  const spiky=attacks.find(x=>x.attackName==='Spiky Hopper'&&has(ownPrinting(x),P.mega));
  if(spiky&&gale) {
    const sk=knockOut(spiky,request),gk=knockOut(gale,request);
    if(sk && !gk)return take(spiky);
    if(sk && gk && movementEvidence(request)===true&&candidateCopycatThreat(request))
      return take(spiky);
  }
  const peck=attacks.find(x=>x.attackName==='Peck Off'&&has(ownPrinting(x),P.pidgey));
  if(peck && arr(o.opponentPublic?.active?.tools).some(x=>has(x,P.hood))&&
      !doubleBaseCutExposed(request))return take(peck);
  // Only a complete offered two-Basic deck-search line is initiated here.
  const poffin=items.find(x=>x.kind==='play-card'&&has(ownPrinting(x),P.poffin));
  if(poffin&&benchCount(o.ownPublic)<5&&
      slots(o.ownPublic).filter(x=>[P.oddish,P.gloom,P.aor,P.bus].some(p=>has(x,p))).length<2&&
      arr(o.ownHand).filter(x=>has(x,P.oddish)).length<2)
    return take(poffin);
  const scored=items.map((item,index)=>{
    let score=0;
    if(item.kind==='play-card')score=Math.max(usefulEvolution(item,o),usefulBasic(item,o));
    if(item.kind==='attack') {
      if(item===peck && doubleBaseCutExposed(request))score=0;
      else if(knockOut(item,request))score=100;
      else if(item===spiky)score=60;
      else if(item===gale)score=55;
      else if(item.attackName==='Blustery Wind'&&has(ownPrinting(item),P.pidgeot))score=45;
      else if(item===peck&&arr(o.opponentPublic?.active?.tools).length)score=35;
    }
    return {item,index,score};
  }).filter(x=>x.score>0).sort((a,b)=>b.score-a.score||a.index-b.index);
  return scored.length?take(scored[0].item):abstain('NO_SUPPORTED_ROOT_ACTION');
}
function poffinPrompt(request) {
  const p=request.prompt,meta=p.publicMetadata??{},o=request.observation;
  if(p.promptType!=='ChooseCardsPrompt'||meta.selectionType!=='card-combination'||
     meta.ownerSeat!=='actor'||meta.isOwnerVisible!==true||
     meta.sourceZone!=='deck'||!Number.isSafeInteger(meta.minimumCount)||
     !Number.isSafeInteger(meta.maximumCount)||meta.minimumCount<0||
     meta.maximumCount>2||meta.maximumCount<meta.minimumCount)
    return abstain('UNSUPPORTED_CARD_COMBINATION_SOURCE');
  const cap=Math.max(0,5-benchCount(o.ownPublic));
  const priority=[P.oddish,P.buneary,P.pidgey,P.bunnelby,P.budew,P.fan];
  const selected=[], seen=new Set();
  for(const match of priority){
    if(selected.length>=Math.min(cap,meta.maximumCount))break;
    for(const c of arr(p.choices)){
      if(c.kind!=='card'||typeof c.token!=='string'||seen.has(c.token)||
         !has(c,match))continue;
      if(match===P.oddish){
        const board=slots(o.ownPublic).filter(x=>[P.oddish,P.gloom,P.aor,P.bus].some(q=>has(x,q))).length;
        if(board+selected.filter(x=>has(x,P.oddish)).length>=2)continue;
      }
      seen.add(c.token);selected.push(c);
      if(selected.length>=Math.min(cap,meta.maximumCount))break;
    }
  }
  if(selected.length<meta.minimumCount)return abstain('NO_LEGAL_CARD_SET');
  if(selected.length)return {kind:'select-choices',tokens:selected.map(x=>x.token)};
  const empty=arr(p.choices).find(x=>x.kind==='empty-selection'&&typeof x.token==='string');
  return meta.minimumCount===0&&empty?{kind:'select-choice',token:empty.token}:
    abstain('NO_LEGAL_CARD_SET');
}
function createPolicy({role,seat,policyVersion,config}) {
  if(role!=='opponent'||(seat!==0&&seat!==1)||policyVersion!==POLICY_VERSION||
     !config||typeof config!=='object'||Array.isArray(config)||Object.keys(config).length)
    throw new Error('AGENT20_RANK15_INIT_MISMATCH');
  return Object.freeze({decide(request){
    if(request?.role!=='opponent'||request.seat!==seat||request.observation?.actorSeat!==seat)
      return abstain('ROLE_SEAT_BINDING_MISMATCH');
    if(!request.observation?.ownPublic||!request.observation?.opponentPublic||
        !Array.isArray(request.observation?.ownHand))
      return abstain('ROLE_SEAT_OBSERVATION_MISMATCH');
    if(request.prompt!==null){
      if(has(request.prompt?.source?.sourcePrinting,P.poffin))return poffinPrompt(request);
      return abstain('UNSUPPORTED_PROMPT_TYPE');
    }
    return rootDecision(request);
  }});
}
module.exports={POLICY_VERSION,SOURCE_RANK,SOURCE_LIST_BLOB_SHA1,SOURCE_COUNTS,
  createPolicy,rootDecision,poffinPrompt,printedDamage,movementEvidence,
  candidateCopycatThreat,doubleBaseCutExposed};
