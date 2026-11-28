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
  tagCall:/^Tag Call CEC(?: 206)?\b/i,
  guzmaHala:/^Guzma & Hala CEC(?: 193)?\b/i,
  tmEvolution:/^Technical Machine: Evolution PAR(?: 178)?\b/i,
  jet:/^Jet Energy PAL(?: 190)?\b/i,
  capture:/^Capture Energy RCL(?: 171)?\b/i,
  doubleColorless:/^Double Colorless Energy SUM(?: 136)?\b/i,
  xtransceiver:/^Xtransceiver NVI(?: 96)?\b/i,
  grandTree:/^Grand Tree SCR(?: 136)?\b/i,
  artazon:/^Artazon PAL(?: 171)?\b/i,
  grass:/^Grass Energy MEE(?: 9)?\b/i,
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
function missingEvolutionChannels(o) {
  const own=o.ownPublic;
  const bench=arr(own?.bench).filter(Boolean);
  const target=bench.some(x=>[P.oddish,P.buneary,P.pidgey].some(p=>has(x,p)));
  const bunnelby=slots(own).some(x=>has(x,P.bunnelby));
  return bunnelby&&target;
}
function supporterUnused(o) {
  const played=o?.ownTurnResources?.supporterPlayedTurn;
  return Number.isSafeInteger(played)&&Number.isSafeInteger(o?.globalTurn)&&
    played<o.globalTurn;
}
function discardPriority(card,o) {
  const hand=arr(o?.ownHand);
  if(has(card,P.xtransceiver))return 100;
  if(has(card,P.tagCall))return 85;
  if(has(card,P.artazon)&&hand.filter(x=>has(x,P.artazon)).length>1)return 55;
  if(has(card,P.grass)&&hand.filter(x=>has(x,P.grass)).length>1)return 35;
  return 0;
}
function disposableCards(o,excluded=null) {
  const hand=arr(o?.ownHand).slice();
  if(excluded){const i=hand.findIndex(x=>has(x,excluded));if(i>=0)hand.splice(i,1);}
  return hand.map((card,i)=>({card,i,score:discardPriority(card,o)}))
    .filter(x=>x.score>=55).sort((a,b)=>b.score-a.score||a.i-b.i);
}
function ghLineFeasible(o,excluded) {
  // A legal root alone is not a complete setup plan. Only take this line
  // with a visible Bench evolution target and two actor-owned discardables.
  return missingEvolutionChannels(o)&&supporterUnused(o)&&
    disposableCards(o,excluded).length>=2;
}
function actorCardZone(p,zone) {
  const m=p.publicMetadata??{};
  const choices=arr(p.choices).filter(x=>x.kind==='card');
  if(m.sourceZone!==undefined&&m.sourceZone!==zone)return false;
  if(m.ownerSeat!==undefined&&m.ownerSeat!=='actor')return false;
  if(m.isOwnerVisible===false)return false;
  if(choices.some(x=>x.publicMetadata?.ownerSeat!==undefined&&
    x.publicMetadata.ownerSeat!=='actor'))return false;
  if(choices.some(x=>x.publicMetadata?.sourceZone!==undefined&&
    x.publicMetadata.sourceZone!==zone))return false;
  const ownerKnown=m.ownerSeat==='actor'||
    (choices.length>0&&choices.every(x=>x.publicMetadata?.ownerSeat==='actor'));
  const zoneKnown=m.sourceZone===zone||
    (choices.length>0&&choices.every(x=>x.publicMetadata?.sourceZone===zone));
  return ownerKnown&&zoneKnown;
}
function actorPokemonBench(p) {
  const m=p.publicMetadata??{};
  if(m.targetZone!==undefined&&m.targetZone!=='bench')return [];
  if(m.ownerSeat!==undefined&&m.ownerSeat!=='actor')return [];
  return arr(p.choices).filter(x=>x.kind==='pokemon'&&
    x.publicMetadata?.ownerSeat==='actor'&&x.publicMetadata?.targetZone==='bench'&&
    typeof x.token==='string');
}
function grandTreeTarget(o) {
  if(!Number.isSafeInteger(o?.globalTurn)||o.globalTurn<=2)return null;
  const own=o.ownPublic;
  const established=arr(own?.bench).filter(x=>x&&
    Number.isSafeInteger(x.lastPlayedOrEvolvedTurn)&&
    x.lastPlayedOrEvolvedTurn<o.globalTurn);
  return established.find(x=>has(x,P.oddish))||
    established.find(x=>has(x,P.pidgey))||
    established.find(x=>has(x,P.buneary))||null;
}
function grandTreePrompt(request) {
  const p=request.prompt,m=p.publicMetadata??{},o=request.observation;
  const own=o.ownPublic;
  if(p.promptType==='ChoosePokemonPrompt'&&m.selectionType==='pokemon'&&
     Number.isSafeInteger(m.minimumCount)&&Number.isSafeInteger(m.maximumCount)&&
     m.minimumCount<=1&&m.maximumCount<=1){
    const target=grandTreeTarget(o);
    const c=actorPokemonBench(p).find(c=>{
      if(!target||!has(c,has(target,P.oddish)?P.oddish:
        has(target,P.pidgey)?P.pidgey:P.buneary))return false;
      const i=c.publicMetadata?.benchIndex;
      return !Number.isSafeInteger(i)||
        o.ownPublic.bench[i]?.printing===target.printing;
    });
    if(c)return {kind:'select-choices',tokens:[c.token]};
    const empty=arr(p.choices).find(c=>c.kind==='empty-selection'&&typeof c.token==='string');
    return m.minimumCount===0&&empty?{kind:'select-choice',token:empty.token}:
      abstain('NO_SUPPORTED_POKEMON_CHOICE');
  }
  if(p.promptType!=='ChooseCardsPrompt'||m.selectionType!=='card-combination'||
     !actorCardZone(p,'deck')||!Number.isSafeInteger(m.minimumCount)||
     !Number.isSafeInteger(m.maximumCount)||m.minimumCount>1||m.maximumCount>1)
    return abstain('UNSUPPORTED_CARD_COMBINATION_SOURCE');
  const board=slots(own);
  let priorities=[];
  // The stage-one search happens while the prior-turn Basic remains in play;
  // the second prompt occurs after the engine has already evolved to Stage 1.
  if(board.some(x=>has(x,P.gloom))){
    priorities=board.some(x=>has(x,P.aor))?[P.bus,P.aor]:[P.aor,P.bus];
  }else if(board.some(x=>has(x,P.oddish))){
    priorities=[P.gloom];
  }else if(board.some(x=>has(x,P.pidgeotto))){
    priorities=[P.pidgeot];
  }else if(board.some(x=>has(x,P.pidgey))){
    priorities=[P.pidgeotto];
  }else if(board.some(x=>has(x,P.buneary))){
    priorities=[P.mega];
  }
  for(const pat of priorities){
    const c=arr(p.choices).find(c=>c.kind==='card'&&has(c,pat)&&typeof c.token==='string');
    if(c)return {kind:'select-choices',tokens:[c.token]};
  }
  const empty=arr(p.choices).find(c=>c.kind==='empty-selection'&&typeof c.token==='string');
  return m.minimumCount===0&&empty?{kind:'select-choice',token:empty.token}:
    abstain('NO_LEGAL_CARD_SET');
}
function quickSearchPrompt(request) {
  const p=request.prompt,m=p.publicMetadata??{},o=request.observation;
  if(p.promptType!=='ChooseCardsPrompt'||m.selectionType!=='card-combination'||
    !actorCardZone(p,'deck')||!Number.isSafeInteger(m.minimumCount)||
    !Number.isSafeInteger(m.maximumCount)||m.minimumCount>1||m.maximumCount!==1)
    return abstain('UNSUPPORTED_CARD_COMBINATION_SOURCE');
  const own=o.ownPublic,op=o.opponentPublic;
  const board=slots(own),hand=arr(o.ownHand);
  const hasBoard=pat=>board.some(x=>has(x,pat));
  const hasHand=pat=>hand.some(x=>has(x,pat));
  const itemLocked=own?.publicTurnRestrictions?.itemPlayLocked===true;
  const needsStage2=hasBoard(P.gloom)&&!hasBoard(P.aor);
  const needsStage1=hasBoard(P.oddish)&&!hasBoard(P.gloom)&&!hasBoard(P.aor)&&!hasBoard(P.bus);
  const needsMega=hasBoard(P.buneary)&&!hasBoard(P.mega);
  const needsPidgeot=hasBoard(P.pidgeotto)&&!hasBoard(P.pidgeot);
  const bunnelby=hasBoard(P.bunnelby);
  const toolAttached=board.some(x=>has(x,P.bunnelby)&&
    arr(x.tools).some(t=>has(t,P.tmEvolution)));
  const stageTarget=arr(own.bench).some(x=>x&&
    [P.oddish,P.gloom,P.buneary,P.pidgey,P.pidgeotto].some(p=>has(x,p)));
  const score=c=>{
    if(has(c,P.aor))return needsStage2&&!hasHand(P.aor)?210:35;
    if(has(c,P.bus))return hasBoard(P.gloom)&&!hasBoard(P.bus)&&
      op?.active?.printed?.stage==='BASIC'&&!hasHand(P.bus)?195:32;
    if(has(c,P.gloom))return needsStage1&&!hasHand(P.gloom)?180:28;
    if(has(c,P.pidgeot))return needsPidgeot&&!hasHand(P.pidgeot)?175:36;
    if(has(c,P.mega))return needsMega&&!hasHand(P.mega)?173:45;
    if(has(c,P.tmEvolution))return bunnelby&&stageTarget&&!toolAttached&&!hasHand(P.tmEvolution)?170:33;
    if(has(c,P.jet))return bunnelby&&stageTarget&&!hasHand(P.jet)?155:80;
    if(has(c,P.doubleColorless))return hasBoard(P.mega)&&!hasHand(P.doubleColorless)?145:75;
    if(has(c,P.guzmaHala))return supporterUnused(o)&&!hasHand(P.guzmaHala)&&
      bunnelby&&stageTarget?140:60;
    if(has(c,P.grandTree))return stageTarget&&!hasHand(P.grandTree)?130:50;
    if(has(c,P.poffin))return !itemLocked&&benchCount(own)<5&&!hasBoard(P.oddish)&&
      !hasHand(P.poffin)?120:5;
    if(has(c,P.tagCall))return !itemLocked&&supporterUnused(o)&&!hasHand(P.guzmaHala)?100:4;
    if(has(c,P.artazon))return benchCount(own)<5?92:45;
    if(has(c,P.capture))return benchCount(own)<5?80:50;
    if(has(c,P.oddish))return !hasBoard(P.oddish)&&benchCount(own)<5?90:38;
    if(has(c,P.bunnelby))return !bunnelby&&benchCount(own)<5?86:34;
    return 12;
  };
  const choices=arr(p.choices).filter(c=>c.kind==='card'&&typeof c.token==='string');
  const ranked=choices.map((c,i)=>({c,i,score:score(c)}))
    .sort((a,b)=>b.score-a.score||a.i-b.i);
  if(ranked.length)return {kind:'select-choices',tokens:[ranked[0].c.token]};
  const empty=arr(p.choices).find(c=>c.kind==='empty-selection'&&typeof c.token==='string');
  return m.minimumCount===0&&empty?{kind:'select-choice',token:empty.token}:
    abstain('NO_LEGAL_CARD_SET');
}
function fanCallPrompt(request) {
  const p=request.prompt,m=p.publicMetadata??{},o=request.observation;
  if(p.promptType!=='ChooseCardsPrompt'||m.selectionType!=='card-combination'||
    !actorCardZone(p,'deck')||!Number.isSafeInteger(m.minimumCount)||
    !Number.isSafeInteger(m.maximumCount)||m.minimumCount>m.maximumCount||
    m.maximumCount>3)return abstain('UNSUPPORTED_CARD_COMBINATION_SOURCE');
  const seen=[...slots(o.ownPublic),...arr(o.ownHand)];
  const priorities=[P.bunnelby,P.pidgey,P.buneary,P.pidgeotto,P.fan];
  const choiceCandidates=arr(p.choices).filter(c=>c.kind==='card'&&typeof c.token==='string');
  const selected=[],selectedPatterns=new Set();
  for(const pat of priorities){
    if(seen.some(x=>has(x,pat))||selectedPatterns.has(pat))continue;
    const c=choiceCandidates.find(x=>has(x,pat)&&!selected.some(y=>y.token===x.token));
    if(c){selected.push(c);selectedPatterns.add(pat);}
    if(selected.length>=m.maximumCount)break;
  }
  if(selected.length>=m.minimumCount&&selected.length)
    return {kind:'select-choices',tokens:selected.map(c=>c.token)};
  const empty=arr(p.choices).find(c=>c.kind==='empty-selection'&&typeof c.token==='string');
  return m.minimumCount===0&&empty?{kind:'select-choice',token:empty.token}:
    abstain('NO_LEGAL_CARD_SET');
}
function tagCallPrompt(request) {
  const p=request.prompt,m=p.publicMetadata??{},o=request.observation;
  if(p.promptType!=='ChooseCardsPrompt'||m.selectionType!=='card-combination'||
    !actorCardZone(p,'deck')||
    !Number.isSafeInteger(m.minimumCount)||!Number.isSafeInteger(m.maximumCount)||
    m.minimumCount<0||m.maximumCount>2||m.maximumCount<m.minimumCount)
    return abstain('UNSUPPORTED_CARD_COMBINATION_SOURCE');
  const choice=arr(p.choices).find(x=>x.kind==='card'&&typeof x.token==='string'&&has(x,P.guzmaHala));
  if(choice&&m.maximumCount>=1&&!arr(o.ownHand).some(x=>has(x,P.guzmaHala)))
    return {kind:'select-choices',tokens:[choice.token]};
  const empty=arr(p.choices).find(x=>x.kind==='empty-selection'&&typeof x.token==='string');
  return m.minimumCount===0&&empty?{kind:'select-choice',token:empty.token}:
    abstain('NO_LEGAL_CARD_SET');
}
function ghSearchCategory(c) {
  if(has(c,P.grandTree)||has(c,P.artazon))return 'stadium';
  if(has(c,P.tmEvolution)||has(c,P.hood))return 'tool';
  if(has(c,P.jet)||has(c,P.capture)||has(c,P.doubleColorless))return 'energy';
  return null;
}
function ghPrompt(request) {
  const p=request.prompt,m=p.publicMetadata??{},o=request.observation;
  if(p.promptType==='SelectOptionPrompt'&&m.selectionType==='option'){
    const options=arr(p.choices).filter(c=>c.kind==='option'&&typeof c.token==='string');
    const yes=options.find(c=>c.publicMetadata?.choiceIndex===1&&/discard 2/i.test(c.label??''));
    const no=options.find(c=>c.publicMetadata?.choiceIndex===0);
    if(yes&&missingEvolutionChannels(o)&&disposableCards(o,P.guzmaHala).length>=2)return {kind:'select-choice',token:yes.token};
    return no?{kind:'select-choice',token:no.token}:
      abstain('UNRECOGNIZED_SIMPLE_PROMPT');
  }
  const fromChoices=new Set(arr(p.choices).filter(x=>x.kind==='card')
    .map(x=>x.publicMetadata?.sourceZone).filter(Boolean));
  const zone=m.sourceZone??(fromChoices.size===1?[...fromChoices][0]:null);
  if(p.promptType!=='ChooseCardsPrompt'||m.selectionType!=='card-combination'||
    !['hand','deck'].includes(zone)||!actorCardZone(p,zone)||
    !Number.isSafeInteger(m.minimumCount)||
    !Number.isSafeInteger(m.maximumCount)||m.maximumCount<m.minimumCount||
    m.maximumCount>(zone==='deck'?3:2))
    return abstain('UNSUPPORTED_CARD_COMBINATION_SOURCE');
  const available=arr(p.choices).filter(c=>c.kind==='card'&&typeof c.token==='string');
  let selected=[];
  if(zone==='hand'){
    if(m.minimumCount>2||m.maximumCount!==2)return abstain('BAD_CARD_SELECTION_BOUNDS');
    const handCounts=new Map();
    for(const h of arr(o.ownHand))handCounts.set(txt(h),(handCounts.get(txt(h))??0)+1);
    const physicallyOwned=available.filter(c=>{
      const key=txt(c),left=handCounts.get(key)??0;
      if(!left)return false;
      handCounts.set(key,left-1);return true;
    });
    selected=physicallyOwned.map((c,i)=>({c,i,score:discardPriority(c,o)}))
      .filter(x=>x.score>=55).sort((a,b)=>b.score-a.score||a.i-b.i)
      .slice(0,2).map(x=>x.c);
  } else {
    const bench=arr(o.ownPublic?.bench).filter(Boolean);
    const ready=bench.some(x=>[P.oddish,P.buneary,P.pidgey].some(q=>has(x,q)));
    const priorities=[
      [P.grandTree,ready?110:30],[P.artazon,70],
      [P.tmEvolution,missingEvolutionChannels(o)?120:40],[P.hood,35],
      [P.jet,slots(o.ownPublic).some(x=>has(x,P.bunnelby))?115:45],
      [P.doubleColorless,65],[P.capture,55]
    ];
    for(const category of ['stadium','tool','energy']){
      const candidate=available.map((c,i)=>({c,i,cat:ghSearchCategory(c),
        score:priorities.find(([pat])=>has(c,pat))?.[1]??0}))
        .filter(x=>x.cat===category&&x.score>0)
        .sort((a,b)=>b.score-a.score||a.i-b.i)[0];
      if(candidate)selected.push(candidate);
    }
    selected=selected.sort((a,b)=>b.score-a.score||a.i-b.i)
      .slice(0,m.maximumCount).map(x=>x.c);
  }
  if(selected.length<m.minimumCount)return abstain('NO_LEGAL_CARD_SET');
  if(selected.length)return {kind:'select-choices',tokens:selected.map(x=>x.token)};
  const empty=arr(p.choices).find(c=>c.kind==='empty-selection'&&typeof c.token==='string');
  return m.minimumCount===0&&empty?{kind:'select-choice',token:empty.token}:
    abstain('NO_LEGAL_CARD_SET');
}
function stageTargets(o) {
  const bench=arr(o?.ownPublic?.bench).filter(Boolean);
  return bench.some(x=>[P.oddish,P.gloom,P.buneary,P.pidgey,P.pidgeotto].some(p=>has(x,p)));
}
function evolutionPrompt(request) {
  const p=request.prompt,m=p.publicMetadata??{},o=request.observation;
  const own=o?.ownPublic;
  if(p.promptType==='ChooseCardsPrompt'&&m.selectionType==='card-combination'&&
    actorCardZone(p,'deck')&&
    Number.isSafeInteger(m.minimumCount)&&Number.isSafeInteger(m.maximumCount)&&
    m.maximumCount<=2&&m.minimumCount<=m.maximumCount){
    const bench=arr(own?.bench).filter(Boolean);
    const inPlay=slots(own);
    const gloom=bench.filter(x=>has(x,P.gloom)).length;
    const priority=[];
    // A newly evolved Gloom may evolve again by this second attack's effect.
    // Dual-lock line requires distinct Vileplume cards on distinct Gloom.
    if(gloom){
      const needsBus=!inPlay.some(x=>has(x,P.bus));
      const needsAor=!inPlay.some(x=>has(x,P.aor));
      const stages=[];
      if(needsBus)stages.push(P.bus);
      if(needsAor)stages.push(P.aor);
      stages.push(P.aor,P.bus);
      priority.push(...stages.slice(0,gloom));
    }
    for(const x of bench){
      if(has(x,P.oddish))priority.push(P.gloom);
      else if(has(x,P.buneary))priority.push(P.mega);
      else if(has(x,P.pidgey))priority.push(P.pidgeotto);
      else if(has(x,P.pidgeotto))priority.push(P.pidgeot);
    }
    const selected=[],used=new Set();
    for(const pattern of priority){
      const c=arr(p.choices).find(x=>x.kind==='card'&&!used.has(x.token)&&
        typeof x.token==='string'&&has(x,pattern));
      if(c){selected.push(c);used.add(c.token);}
      if(selected.length>=m.maximumCount)break;
    }
    if(selected.length>=m.minimumCount&&selected.length)
      return {kind:'select-choices',tokens:selected.map(x=>x.token)};
    const empty=arr(p.choices).find(x=>x.kind==='empty-selection'&&typeof x.token==='string');
    return m.minimumCount===0&&empty?{kind:'select-choice',token:empty.token}:
      abstain('NO_LEGAL_CARD_SET');
  }
  if(p.promptType==='ChoosePokemonPrompt'&&m.selectionType==='pokemon'&&
    Number.isSafeInteger(m.minimumCount)&&Number.isSafeInteger(m.maximumCount)&&
    m.maximumCount<=2&&m.minimumCount<=m.maximumCount){
    const knownBench=arr(own?.bench);
    const selected=[],usedSlots=new Set();
    const candidates=actorPokemonBench(p);
    for(const pattern of [P.gloom,P.oddish,P.pidgeotto,P.buneary,P.pidgey]){
      for(const c of candidates){
        if(!has(c,pattern)||selected.some(x=>x.token===c.token))continue;
        const index=c.publicMetadata?.benchIndex;
        if(Number.isSafeInteger(index)){
          if(usedSlots.has(index)||!has(knownBench[index],pattern))continue;
          usedSlots.add(index);
        }else{
          const available=knownBench.findIndex((slot,i)=>!usedSlots.has(i)&&has(slot,pattern));
          if(available<0)continue;
          usedSlots.add(available);
        }
        selected.push(c);
        if(selected.length>=m.maximumCount)break;
      }
      if(selected.length>=m.maximumCount)break;
    }
    if(selected.length>=m.minimumCount&&selected.length)
      return {kind:'select-choices',tokens:selected.map(x=>x.token)};
    const empty=arr(p.choices).find(x=>x.kind==='empty-selection'&&typeof x.token==='string');
    return m.minimumCount===0&&empty?{kind:'select-choice',token:empty.token}:
      abstain('NO_SUPPORTED_POKEMON_CHOICE');
  }
  return abstain('UNSUPPORTED_PROMPT_TYPE');
}
function omegaBarragePrompt(request) {
  const p=request.prompt,m=p.publicMetadata??{},o=request.observation;
  if(p.promptType!=='ConfirmPrompt'||m.selectionType!=='confirm'||
    !(has(p.source?.sourcePrinting,P.bunnelby)||
      p.source?.effectName==='Omega Barrage'))
    return abstain('UNSUPPORTED_CONFIRMATION_SOURCE');
  const yes=arr(p.choices).find(c=>c.kind==='confirm'&&c.label==='Yes'&&typeof c.token==='string');
  const no=arr(p.choices).find(c=>c.kind==='confirm'&&c.label==='No'&&typeof c.token==='string');
  const own=o.ownPublic;
  const ready=has(own?.active,P.bunnelby)&&
    arr(own.active.tools).some(x=>has(x,P.tmEvolution))&&
    arr(own.active.energies).length>0&&stageTargets(o);
  if(ready&&yes)return {kind:'select-choice',token:yes.token};
  return no?{kind:'select-choice',token:no.token}:
    abstain('UNRECOGNIZED_SIMPLE_PROMPT');
}
function busActivePromotionOpportunity(o) {
  const own=o?.ownPublic,opp=o?.opponentPublic;
  if(!own||!opp||!opp.active||!has(own.active,P.bunnelby))return false;
  if(opp.active.printed?.stage!=='BASIC')return false;
  return arr(own.bench).some(x=>x&&has(x,P.bus)&&
    !arr(x.abilitySuppressions).some(a=>
      a.abilityName==='Disgusting Pollen'&&a.suppressed===true));
}
function busRetreatPrompt(request) {
  const p=request.prompt,m=p.publicMetadata??{};
  if(p.promptType!=='ChoosePokemonPrompt'||m.selectionType!=='pokemon'||
    (m.targetZone!==undefined&&m.targetZone!=='bench')||m.minimumCount!==1||m.maximumCount!==1)
    return abstain('UNSUPPORTED_POKEMON_PROMPT');
  if(!busActivePromotionOpportunity(request.observation))
    return abstain('NO_SUPPORTED_POKEMON_CHOICE');
  const choices=actorPokemonBench(p).filter(x=>has(x,P.bus));
  return choices.length===1?{kind:'select-choices',tokens:[choices[0].token]}:
    abstain('NO_SUPPORTED_POKEMON_CHOICE');
}
function rootDecision(request) {
  const o=request.observation;
  const items=arr(request.actionFrontier?.items).filter(playable);
  if(!items.length)return abstain('NO_EXECUTABLE_ACTION');
  const attacks=items.filter(x=>x.kind==='attack');
  const immediate=attacks.find(x=>terminal(x,request));
  if(immediate)return take(immediate);
  const gale=attacks.find(x=>x.attackName==='Gale Thrust'&&has(o.ownPublic?.active,P.mega));
  const spiky=attacks.find(x=>x.attackName==='Spiky Hopper'&&has(o.ownPublic?.active,P.mega));
  if(spiky&&gale) {
    const sk=knockOut(spiky,request),gk=knockOut(gale,request);
    if(sk && !gk)return take(spiky);
    if(sk && gk && movementEvidence(request)===true&&candidateCopycatThreat(request))
      return take(spiky);
  }
  const peck=attacks.find(x=>x.attackName==='Peck Off'&&has(o.ownPublic?.active,P.pidgey));
  if(peck && arr(o.opponentPublic?.active?.tools).some(x=>has(x,P.hood))&&
      !doubleBaseCutExposed(request))return take(peck);
  // First-turn Fan Call is a free actor-owned search for the source's
  // low-HP Colorless setup basics; only trigger when a useful slot is missing.
  const fanCall=items.find(x=>x.kind==='use-ability'&&
    x.publicMetadata?.abilityName==='Fan Call'&&
    (has(ownPrinting(x),P.fan)||slots(o.ownPublic).some(c=>has(c,P.fan))));
  const fanNeeds=[P.bunnelby,P.pidgey,P.buneary].some(p=>
    ![...slots(o.ownPublic),...arr(o.ownHand)].some(c=>has(c,p)));
  if(fanCall&&fanNeeds&&benchCount(o.ownPublic)<5&&o.globalTurn<=2)return take(fanCall);
  const grand=items.find(x=>x.kind==='use-stadium'&&has(ownPrinting(x),P.grandTree));
  if(grand&&grandTreeTarget(o))return take(grand);
  const quick=items.find(x=>x.kind==='use-ability'&&
    x.publicMetadata?.abilityName==='Quick Search'&&
    (has(ownPrinting(x),P.pidgeot)||slots(o.ownPublic).some(c=>has(c,P.pidgeot))));
  if(quick)return take(quick);
  const tmAttack=attacks.find(x=>x.attackName==='Evolution'&&
    has(o.ownPublic?.active,P.bunnelby)&&
    arr(o.ownPublic?.active?.tools).some(c=>has(c,P.tmEvolution)));
  if(tmAttack&&arr(o.ownPublic?.bench).some(x=>x&&
     [P.oddish,P.gloom,P.buneary,P.pidgey,P.pidgeotto].some(p=>has(x,p))))return take(tmAttack);
  const busWindow=busActivePromotionOpportunity(o);
  if(busWindow){
    const jetBus=items.find(x=>x.kind==='play-card'&&has(ownPrinting(x),P.jet)&&
      has(x.targetPrinting,P.bus));
    if(jetBus)return take(jetBus);
    const retreatBus=items.find(x=>x.kind==='retreat'&&
      (!x.targetPrinting||has(x.targetPrinting,P.bus)));
    if(retreatBus)return take(retreatBus);
  }
  const attachTm=items.find(x=>x.kind==='play-card'&&has(ownPrinting(x),P.tmEvolution)&&
    has(x.targetPrinting,P.bunnelby));
  if(attachTm&&slots(o.ownPublic).some(x=>has(x,P.bunnelby)&&
     arr(x.tools).length===0)&&missingEvolutionChannels(o))return take(attachTm);
  const attachJet=items.find(x=>x.kind==='play-card'&&has(ownPrinting(x),P.jet)&&
    has(x.targetPrinting,P.bunnelby));
  if(attachJet&&slots(o.ownPublic).some(x=>has(x,P.bunnelby)&&
     arr(x.tools).some(c=>has(c,P.tmEvolution)))&&missingEvolutionChannels(o))return take(attachJet);
  const gh=items.find(x=>x.kind==='play-card'&&has(ownPrinting(x),P.guzmaHala));
  if(gh&&ghLineFeasible(o,P.guzmaHala))return take(gh);
  const tag=items.find(x=>x.kind==='play-card'&&has(ownPrinting(x),P.tagCall));
  if(tag&&!arr(o.ownHand).some(c=>has(c,P.guzmaHala))&&
    ghLineFeasible(o,P.tagCall))return take(tag);
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
     !actorCardZone(p,'deck')||!Number.isSafeInteger(meta.minimumCount)||
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
      if(has(request.prompt?.source?.sourcePrinting,P.fan))return fanCallPrompt(request);
      if(has(request.prompt?.source?.sourcePrinting,P.pidgeot))return quickSearchPrompt(request);
      if(has(request.prompt?.source?.sourcePrinting,P.grandTree))return grandTreePrompt(request);
      if(has(request.prompt?.source?.sourcePrinting,P.tagCall))return tagCallPrompt(request);
      if(has(request.prompt?.source?.sourcePrinting,P.guzmaHala))return ghPrompt(request);
      if(has(request.prompt?.source?.sourcePrinting,P.tmEvolution))return evolutionPrompt(request);
      if(has(request.prompt?.source?.sourcePrinting,P.bunnelby)&&
        request.prompt?.promptType==='ConfirmPrompt')return omegaBarragePrompt(request);
      if(request.prompt?.source?.effectName==='Omega Barrage'&&
        request.prompt?.promptType==='ConfirmPrompt')return omegaBarragePrompt(request);
      if(request.prompt?.promptType==='ChoosePokemonPrompt'&&
        (request.prompt?.source?.effectName==='Retreat'||
         has(request.prompt?.source?.sourcePrinting,P.bunnelby)))return busRetreatPrompt(request);
      return abstain('UNSUPPORTED_PROMPT_TYPE');
    }
    return rootDecision(request);
  }});
}
module.exports={POLICY_VERSION,SOURCE_RANK,SOURCE_LIST_BLOB_SHA1,SOURCE_COUNTS,
  createPolicy,rootDecision,poffinPrompt,printedDamage,movementEvidence,
  candidateCopycatThreat,doubleBaseCutExposed,ghPrompt,tagCallPrompt,evolutionPrompt,ghLineFeasible,actorCardZone,actorPokemonBench,fanCallPrompt,quickSearchPrompt,grandTreePrompt,grandTreeTarget,omegaBarragePrompt,busActivePromotionOpportunity,busRetreatPrompt};
