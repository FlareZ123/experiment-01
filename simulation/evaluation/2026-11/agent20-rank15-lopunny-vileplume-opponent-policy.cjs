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
// Two archive print identifiers are not valid direct card-database keys.
// Preserve original opponent-source provenance in SOURCE_COUNTS while emitting
// a legally equivalent, resolvable printing for the executable fixture.
const ENGINE_PRINTING_ALIASES = Object.freeze({
  'Karen XYP 177': 'Karen PR-XY XY177',
  'Grass Energy MEE 9': 'Grass Energy BLW 105'
});
const ENGINE_COUNTS=Object.freeze(SOURCE_COUNTS.map(([printing,count])=>
  Object.freeze([ENGINE_PRINTING_ALIASES[printing]??printing,count])));
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
  guzma:/^Guzma BUS(?: 115)?\b/i,
  karen:/^Karen (?:(?:XYP(?: (?:XY)?177a?)?)|(?:PR-XY(?: XY177a?)?))\b/i,
  n:/^N FCO(?: 105)?\b/i,
  regidrago:/^Regidrago VSTAR SIT(?: 136)?\b/i,
  eldegoss:/^Eldegoss V RCL(?: 19)?\b/i,
  tmEvolution:/^Technical Machine: Evolution PAR(?: 178)?\b/i,
  jet:/^Jet Energy PAL(?: 190)?\b/i,
  capture:/^Capture Energy RCL(?: 171)?\b/i,
  doubleColorless:/^Double Colorless Energy SUM(?: 136)?\b/i,
  xtransceiver:/^Xtransceiver NVI(?: 96)?\b/i,
  grandTree:/^Grand Tree SCR(?: 136)?\b/i,
  artazon:/^Artazon PAL(?: 171)?\b/i,
  pathPeak:/^Path to the Peak CRE(?: 148)?\b/i,
  silentLab:/^Silent Lab PRC(?: 140)?\b/i,
  thorns:/^Iron Thorns ex TWM(?: 77)?\b/i,
  grass:/^Grass Energy (?:(?:MEE(?: 9)?)|(?:BLW(?: 105)?)|(?:BW(?: 105)?))\b/i,
  hood:/^Stealthy Hood UNB(?: 186)?\b/i,
  floatStone:/^Float Stone BKT(?: 137)?\b/i,
  powerful:/^Powerful Colorless Energy DAA(?: 176)?\b/i,
  choiceBelt:/^Choice Belt PAL(?: 176)?\b/i,
  legacy:/^Legacy Energy TWM(?: 167)?\b/i,
  lifeDew:/^Life Dew PLF(?: 107)?\b/i,
  islandAmulet:/^Island Challenge Amulet CEC(?: (?:194|265))?\b/i,
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

function stadiumAndToolEffectsMuted(o) {
  return [o?.ownPublic,o?.opponentPublic].some(p=>{
    const turns=p?.publicTurnRestrictions?.stadiumAndToolHaveNoEffectTurnsRemaining;
    return Number.isSafeInteger(turns)&&turns>0;
  });
}
function templeSuppressesSpecialEnergy(o) {
  const stadium=[...arr(o?.ownPublic?.stadium),...arr(o?.opponentPublic?.stadium)];
  const temple=stadium.some(x=>/^Temple of Sinnoh ASR(?: 155)?\b/i.test(txt(x)));
  return temple&&!stadiumAndToolEffectsMuted(o);
}
function toolEffectsSuppressed(o) {
  // The global restriction mutes BOTH Stadium and Tool effects. It may
  // silence Jamming Tower, but it still directly silences Choice Belt/Hood.
  const stadium=[...arr(o?.ownPublic?.stadium),...arr(o?.opponentPublic?.stadium)];
  return stadiumAndToolEffectsMuted(o)||
    stadium.some(x=>/^Jamming Tower\b/i.test(txt(x)));
}
function sourcePrizeValue(pokemon,o) {
  const p=txt(pokemon);
  const subtypes=arr(pokemon?.printed?.subtypes);
  const tagTeam=/&.+-GX\b/i.test(p)||subtypes.some(x=>
    /^TAG[ _-]?TEAM$/i.test(String(x)));
  const vunion=/\bV-UNION\b/i.test(p)||subtypes.some(x=>
    /^V[ _-]?UNION$/i.test(String(x)));
  // Paper Expanded includes three-Prize TAG TEAM-GX and Pokémon V-UNION,
  // not just VMAX and Mega Evolution ex.
  const normal=tagTeam||vunion||/^Mega .* ex\b/i.test(p)||/\bVMAX\b/i.test(p)?3:
    /\b(?:ex| VSTAR| V|GX|EX)\b/i.test(p)||/-GX\b/i.test(p)?2:1;
  // The actor's public state does not prove that Legacy's once-per-game
  // Prize discount was already spent. Assume a live copy still applies.
  const activeLegacy=arr(pokemon?.energies).some(x=>has(x,P.legacy))&&
    !templeSuppressesSpecialEnergy(o);
  const activeTools=arr(pokemon?.tools);
  const liveTools=!toolEffectsSuppressed(o);
  const lifeDew=liveTools&&activeTools.some(x=>has(x,P.lifeDew));
  const island=liveTools&&/(?:-GX\b|-EX\b| GX\b| EX\b)/i.test(p)&&
    activeTools.some(x=>has(x,P.islandAmulet));
  return Math.max(0,normal-Number(activeLegacy)-Number(lifeDew)-Number(island));
}
function movementEvidence(request) {
  const o=request.observation, r=request.publicEventReceipt;
  if(!r||r.actorSeat!==o?.actorSeat||r.turn!==o?.globalTurn||
      !r.ownerActive||txt(r.ownerActive)!==txt(o.ownPublic?.active)) return null;
  return typeof r.ownerActive.movedFromBenchToActiveThisTurn==='boolean' ?
    r.ownerActive.movedFromBenchToActiveThisTurn:null;
}
function applyTypedWeaknessResistance(base,target,attackerType) {
  if(!Number.isFinite(base)||base<0||!attackerType)return null;
  let damage=base;
  for(const row of arr(target?.printed?.weakness)){
    const type=typeof row==='string'?row:row?.type;
    if(type!==attackerType)continue;
    const val=String(row?.value??'');
    const mul=/^[x×*]([2-9])$/.exec(val);
    const plus=/^\+([1-9]\d*)$/.exec(val);
    if(mul)damage*=Number(mul[1]);
    else if(plus)damage+=Number(plus[1]);
    else return null;
  }
  for(const row of arr(target?.printed?.resistance)){
    const type=typeof row==='string'?row:row?.type;
    if(type!==attackerType)continue;
    const value=String(row?.value??'');
    if(!/^-[1-9]\d*$/.test(value))return null;
    damage=Math.max(0,damage+Number(value));
  }
  return damage;
}
function applyColorlessWeaknessResistance(base,target) {
  return applyTypedWeaknessResistance(base,target,'Colorless');
}
function sourcePrintedType(pokemon) {
  if([P.mega,P.pidgey,P.pidgeotto,P.pidgeot,P.buneary,P.bunnelby,P.fan].
      some(p=>has(pokemon,p)))return 'Colorless';
  if([P.oddish,P.gloom,P.aor,P.bus,P.budew,P.eldegoss].
      some(p=>has(pokemon,p)))return 'Grass';
  if(has(pokemon,/^Tatsugiri TWM(?: 131)?\b/i))return 'Dragon';
  return null;
}
function printedDamage(item,request) {
  const o=request.observation,own=o?.ownPublic?.active,op=o?.opponentPublic?.active;
  if(!own||!op||item.kind!=='attack')return null;
  const meta=item.publicMetadata??{};
  if(meta.hasUnmodeledModifier===true||meta.damagePrevented===true||
      meta.hasPrevention===true) return null;
  if(Number.isSafeInteger(meta.damageAfterResistance)&&meta.damageAfterResistance>=0)
    return meta.damageAfterResistance;
  const type=sourcePrintedType(own);
  if(!type)return null;
  // Spiky Hopper shreds defender effects but still applies Weakness/Resistance.
  // Other attacks fail closed if opaque defensive effects may change damage.
  const bypass=has(own,P.mega)&&item.attackName==='Spiky Hopper';
  // Life Dew changes Prize yield but does not modify attack damage. Its
  // visible Tool is safe to account for through sourcePrizeValue instead.
  if(!bypass&&(arr(op.tools).some(x=>!has(x,P.lifeDew))||
     arr(op.abilitySuppressions).some(x=>x.suppressed===false)))return null;
  let value=null;
  if(has(own,P.mega)) {
    if(item.attackName==='Gale Thrust') {
      const moved=movementEvidence(request);
      if(moved===null)return null;
      value=moved?230:60;
    }
    if(item.attackName==='Spiky Hopper')value=160;
  }
  // The full original rank15 source printing inventory: fixed-damage attack
  // branches, not global guesses about similarly named later card printings.
  if(has(own,P.pidgeot)&&item.attackName==='Blustery Wind')value=120;
  if(has(own,P.pidgey)&&item.attackName==='Peck Off')value=10;
  if(has(own,P.pidgeotto)) {
    if(/^Pidgeotto TEU(?: 123)?\b/i.test(txt(own))&&item.attackName==='Gust')value=30;
    if(/^Pidgeotto MEW(?: 17)?\b/i.test(txt(own))&&item.attackName==='Flap')value=20;
  }
  if(has(own,P.buneary)&&item.attackName==='Kick')value=20;
  if(has(own,P.fan)&&item.attackName==='Assault Landing') {
    // Printed attack: with no Stadium in play, it does nothing; suppressing
    // Stadium effects does not remove a Stadium from play.
    if(![...arr(o.ownPublic?.stadium),...arr(o.opponentPublic?.stadium)].length)
      return 0;
    value=70;
  }
  if(has(own,P.oddish)&&item.attackName==='Seed Bomb')value=20;
  if(has(own,P.gloom)&&item.attackName==='Drool')value=30;
  if(has(own,P.aor)&&item.attackName==='Solar Beam')value=70;
  if(has(own,P.bus)&&item.attackName==='Downer Shock')value=60;
  if(has(own,P.budew)&&item.attackName==='Itchy Pollen')value=10;
  if(has(own,P.eldegoss)&&item.attackName==='Float Up')value=50;
  if(has(own,/^Tatsugiri TWM(?: 131)?\b/i)&&item.attackName==='Surf')value=50;

  if(value===null)return null;
  // PCE boosts only Colorless Pokémon, but Choice Belt boosts every Type.
  // Both modifiers act before Weakness/Resistance and only when still live.
  if(type==='Colorless'&&!templeSuppressesSpecialEnergy(o)&&
    arr(own.energies).some(e=>has(e,P.powerful)))value+=20;
  if(!toolEffectsSuppressed(o)&&arr(own.tools).some(e=>has(e,P.choiceBelt))&&
    /\bV(?:MAX|STAR)?\b/i.test(txt(op)))value+=30;
  return applyTypedWeaknessResistance(value,op,type);
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
  // Float Up removes Eldegoss V itself from play after attacking. If it was
  // our only Pokémon, we also have no Pokémon in play; do not certify that
  // simultaneous game-ending position as a straightforward win.
  if(item.attackName==='Float Up'&&has(o.ownPublic?.active,P.eldegoss)&&
    benchCount(o.ownPublic)===0)return false;
  return Number.isSafeInteger(o.ownPublic?.prizeCount)&&o.ownPublic.prizeCount>0&&
    (o.ownPublic.prizeCount<=sourcePrizeValue(o.opponentPublic.active,o)||
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
const REGIDRAGO_DRAGON_PAYLOADS = Object.freeze([
  /^Dialga-GX UPR(?: 100)?\b/i,
  /^Dragapult ex TWM(?: 130)?\b/i,
  /^Kyurem SFA(?: 47)?\b/i,
  /^Noivern ex PAL(?: 153)?\b/i,
  /^Hisuian Goodra VSTAR LOR(?: 136)?\b/i,
  /^Koraidon ex TEF(?: 120)?\b/i,
  /^Mega Dragonite ex ASC(?: 152)?\b/i,
  /^Salamence ex JTG(?: 114)?\b/i
]);
function karenOpportunity(o) {
  const op=o?.opponentPublic;
  if(!op||!supporterUnused(o))return false;
  const activeDrago=has(op.active,P.regidrago);
  const poweredBenchDrago=arr(op.bench).some(x=>has(x,P.regidrago)&&
    arr(x.energies).length>=2);
  if(!activeDrago&&!poweredBenchDrago)return false;
  const publicPayloads=arr(op.discard).filter(c=>
    REGIDRAGO_DRAGON_PAYLOADS.some(p=>has(c,p)));
  const distinct=new Set(publicPayloads.map(txt)).size;
  if(distinct>=2)return true;
  // Even one Timeless-GX payload is a near-term extra-turn threat before
  // the opponent spends GX; however after its GX use, this special case dies.
  return distinct===1&&publicPayloads.some(c=>has(c,REGIDRAGO_DRAGON_PAYLOADS[0]))&&
    op.publicTurnRestrictions?.gxUsed===false;
}
function k1Available(o,patterns) {
  // K0 is epistemic uncertainty; absence from public discard ≠ in deck.
  // The owner-only exact deck-membership projection is used *only* when
  // explicitly marked trustworthy by the host.
  const k=o?.ownerK1;
  if(!k||k.exactMembershipKnown!==true||!Array.isArray(k.knownPrintings))
    return null;
  const pats=arr(patterns);
  return k.knownPrintings.some(x=>Number.isSafeInteger(x.copies)&&x.copies>0&&
    pats.some(p=>has(x.printing,p)));
}
function k1EvoTarget(o) {
  const bench=arr(o?.ownPublic?.bench).filter(Boolean);
  return bench.some(x=>{
    const pats=has(x,P.oddish)?[P.gloom]:
      has(x,P.gloom)?[P.aor,P.bus]:
      has(x,P.buneary)?[P.mega]:
      has(x,P.pidgey)?[P.pidgeotto]:
      has(x,P.pidgeotto)?[P.pidgeot]:[];
    return pats.length>0&&k1Available(o,pats)!==false;
  });
}
function energyProvided(card,o) {
  // Temple strips Double Colorless's second Energy unit as well as the
  // additional effects of Jet, Capture and Powerful Colorless.
  return has(card,P.doubleColorless)&&!templeSuppressesSpecialEnergy(o)?2:1;
}
function attachedEnergyUnits(slot,o) {
  return arr(slot?.energies).reduce((sum,card)=>sum+energyProvided(card,o),0);
}
// Two copies of Mega Lopunny (or Bunnelby) can share a printing but
// occupy different physical slots. Native projected actions carry the exact
// actor-relative target zone/index; use them before any name-only fallback.
function ownActionTarget(item,own) {
  const meta=item?.publicMetadata??{};
  if(meta.targetSeat!==undefined&&meta.targetSeat!=='actor')return null;
  const printing=item?.targetPrinting;
  if(typeof printing!=='string'||!printing)return null;
  let target=null;
  if(meta.targetZone==='active') {
    target=own?.active;
  } else if(meta.targetZone==='bench') {
    if(!Number.isSafeInteger(meta.targetIndex)||meta.targetIndex<0)return null;
    target=arr(own?.bench)[meta.targetIndex];
  } else if(meta.targetZone!==undefined) {
    return null;
  } else {
    // Historical constructed frontiers may omit coordinates. Fall back only
    // if the printing identifies exactly one visible Pokémon on the board.
    const matches=slots(own).filter(x=>txt(x)===printing);
    if(matches.length!==1)return null;
    target=matches[0];
  }
  return target&&txt(target)===printing?target:null;
}

function energyActionScore(item,o) {
  if(item?.kind!=='play-card'||
    ![P.jet,P.capture,P.doubleColorless,P.powerful,P.grass].some(p=>has(ownPrinting(item),p)))return 0;
  const own=o?.ownPublic,energy=ownPrinting(item);
  const target=ownActionTarget(item,own);
  if(!target||!item.targetPrinting)return 0;
  const used=attachedEnergyUnits(target,o),available=5-benchCount(own);
  const temple=templeSuppressesSpecialEnergy(o);
  if(has(target,P.bus)&&has(energy,P.jet)&&!temple&&has(own.active,P.bunnelby)&&
    o.opponentPublic?.active?.printed?.stage==='BASIC'&&
    !arr(target.abilitySuppressions).some(x=>
      x.abilityName==='Disgusting Pollen'&&x.suppressed===true))return 169;
  if(has(target,P.bunnelby)){
    const tm=arr(target.tools).some(t=>has(t,P.tmEvolution));
    if(tm&&used===0)return has(energy,P.jet)&&temple?160:165;
    if(used===0)return 100;
    return 0;
  }
  if(has(target,P.mega)){
    if(has(energy,P.jet)&&!temple&&!has(own.active,P.mega)&&
      arr(own.bench).some(x=>x===target)&&used>=1&&
      !(has(own.active,P.bus)&&
        o.opponentPublic?.active?.printed?.stage==='BASIC'))return 180;
    if(used>=2)return 0;
    if(has(energy,P.doubleColorless))return temple?129:158;
    if(has(energy,P.powerful))return used===0?137:140;
    if(has(energy,P.capture))return !temple&&available>0?132:113;
    if(has(energy,P.jet))return used===0?130:135;
    return used===0?128:132;
  }
  if(has(target,P.buneary))return used===0?75:0;
  if(has(target,P.eldegoss))return used===0?70:used===1?65:0;
  if(has(target,P.fan)||has(target,P.budew)||has(target,P.pidgey))
    return used===0&&has(energy,P.capture)&&!temple&&available>0?65:0;
  return 0;
}
function positionTarget(o) {
  const own=o?.ownPublic,opp=o?.opponentPublic;
  if(!own||!opp||!own.active||!opp.active)return null;
  const active=own.active,bench=arr(own.bench);
  if(has(active,P.bus)&&opp.active.printed?.stage==='BASIC'&&
    !arr(active.abilitySuppressions).some(x=>
      x.abilityName==='Disgusting Pollen'&&x.suppressed===true))return null;
  if(has(active,P.mega)&&attachedEnergyUnits(active,o)>=1)return null;
  if(has(active,P.bunnelby)&&arr(active.tools).some(x=>has(x,P.tmEvolution))&&
    attachedEnergyUnits(active,o)>=1&&k1EvoTarget(o))return null;
  let index=-1;
  if(opp.active.printed?.stage==='BASIC')index=bench.findIndex(x=>
    x&&has(x,P.bus)&&!arr(x.abilitySuppressions).some(a=>
      a.abilityName==='Disgusting Pollen'&&a.suppressed===true));
  if(index<0&&k1EvoTarget(o))index=bench.findIndex(x=>
    x&&has(x,P.bunnelby)&&attachedEnergyUnits(x,o)>=1&&
    arr(x.tools).some(t=>has(t,P.tmEvolution)));
  if(index<0)index=bench.findIndex(x=>x&&has(x,P.mega)&&attachedEnergyUnits(x,o)>=1);
  if(index<0)return null;
  return {index,printing:bench[index].printing};
}
function retreatPrompt(request) {
  const p=request.prompt,m=p.publicMetadata??{},o=request.observation;
  if(p.promptType!=='ChoosePokemonPrompt'||m.selectionType!=='pokemon'||
    m.minimumCount!==1||m.maximumCount!==1)return abstain('UNSUPPORTED_POKEMON_PROMPT');
  const target=positionTarget(o);
  if(!target)return abstain('NO_SUPPORTED_POKEMON_CHOICE');
  const found=actorPokemonBench(p).find(c=>
    c.publicMetadata?.benchIndex===target.index&&txt(c)===target.printing);
  return found?{kind:'select-choices',tokens:[found.token]}:
    abstain('NO_SUPPORTED_POKEMON_CHOICE');
}
// RetreatAction is already bound to an actual Bench slot. A repeated
// printing is not an interchangeable destination; check the native index.
function retreatActionTargets(item,target,own) {
  if(item?.kind!=='retreat')return false;
  if(item.targetPrinting&&item.targetPrinting!==target.printing)return false;
  const meta=item.publicMetadata??{};
  if(meta.targetZone!==undefined||meta.targetIndex!==undefined||
      meta.benchIndex!==undefined) {
    return meta.targetSeat==='actor'&&meta.targetZone==='bench'&&
      meta.targetIndex===target.index&&
      (meta.benchIndex===undefined||meta.benchIndex===target.index);
  }
  // Metadata-free constructed legacy inputs are safe only when a single
  // Bench slot corresponds to the requested destination.
  const bench=arr(own?.bench);
  if(item.targetPrinting)return bench.filter(x=>x&&txt(x)===target.printing).length===1;
  return bench.filter(Boolean).length===1&&bench[target.index]!==null;
}

// Rank-1 Shadow Rider V concrete response window. A stationary one-Energy
// Mega can attack for just 60; a different already-evolved, powered Benched
// Mega becomes a 230-damage Gale attacker *when it itself moves*. Do not
// overvalue the current Active merely because its 1-C Gale is payable.
// Only override the general movement policy on a visible terminal 2-Prize KO,
// an explicit current-stationary movement receipt, and a native offered move.
function terminalGalePromotionTarget(request) {
  const o=request?.observation,own=o?.ownPublic,op=o?.opponentPublic?.active;
  if(!own||!has(op,/^Shadow Rider Calyrex V CRE(?: 74)?\b/i)||
    (has(own.active,P.mega)&&movementEvidence(request)!==false))return null;
  if(arr(op.tools).some(x=>!has(x,P.lifeDew))||
     arr(op.abilitySuppressions).some(x=>x.suppressed===false))return null;
  const remaining=Number.isSafeInteger(op.hp)&&Number.isSafeInteger(op.damage)?
    op.hp-op.damage:null;
  const gale=applyColorlessWeaknessResistance(230,op);
  if(remaining===null||remaining<=0||gale===null||gale<remaining||
    !Number.isSafeInteger(own.prizeCount)||own.prizeCount<1||
    own.prizeCount>sourcePrizeValue(op,o))return null;
  const bench=arr(own.bench);
  const index=bench.findIndex(x=>x&&readyGuzmaMega(x,o));
  return index<0?null:{index,printing:bench[index].printing};
}
function terminalGalePromotionAction(items,request) {
  const target=terminalGalePromotionTarget(request);
  if(!target)return null;
  const own=request.observation.ownPublic,bench=arr(own.bench);
  const retreat=items.find(x=>retreatActionTargets(x,target,own));
  if(retreat)return retreat;
  // Jet attached from hand to the exact powered Benched Mega produces
  // Bench->Active movement, including where normal Retreat is unavailable.
  // Temple of Sinnoh disables that switching effect, not Energy provision.
  if(templeSuppressesSpecialEnergy(request.observation))return null;
  return items.find(x=>x.kind==='play-card'&&has(ownPrinting(x),P.jet)&&
    ownActionTarget(x,own)===bench[target.index])??null;
}
function mobilityActions(items,o,request) {
  const own=o?.ownPublic;
  const target=terminalGalePromotionTarget(request)??positionTarget(o);
  if(!target)return null;
  const retreat=items.find(x=>retreatActionTargets(x,target,own));
  if(retreat)return retreat;
  const float=items.find(x=>x.kind==='play-card'&&has(ownPrinting(x),P.floatStone)&&
    ownActionTarget(x,own)===own.active&&
    arr(own.active.tools).length===0);
  return float??null;
}
function capturePrompt(request) {
  const p=request.prompt,m=p.publicMetadata??{},o=request.observation;
  if(p.promptType!=='ChooseCardsPrompt'||m.selectionType!=='card-combination'||
    !actorCardZone(p,'deck')||!Number.isSafeInteger(m.minimumCount)||
    !Number.isSafeInteger(m.maximumCount)||m.minimumCount>1||m.maximumCount!==1)
    return abstain('UNSUPPORTED_CARD_COMBINATION_SOURCE');
  const empty=arr(p.choices).find(x=>x.kind==='empty-selection'&&typeof x.token==='string');
  if(benchCount(o.ownPublic)>=5)return m.minimumCount===0&&empty?
    {kind:'select-choice',token:empty.token}:abstain('NO_LEGAL_CARD_SET');
  const prefer=[usefulArtazonBasic(o),P.oddish,P.bunnelby,P.buneary,P.pidgey,P.fan,P.budew]
    .filter(Boolean);
  for(const pat of prefer){
    const c=arr(p.choices).find(c=>c.kind==='card'&&has(c,pat)&&typeof c.token==='string');
    if(c)return {kind:'select-choices',tokens:[c.token]};
  }
  return m.minimumCount===0&&empty?{kind:'select-choice',token:empty.token}:
    abstain('NO_LEGAL_CARD_SET');
}
function hoodProtectionScore(item,o) {
  if(item?.kind!=='play-card'||!has(ownPrinting(item),P.hood)||
    !has(item.targetPrinting,P.aor))return 0;
  // Two AOR Vileplume copies are distinct board objects. Protect the exact
  // Pokémon named by the native action, not an arbitrary same-printing copy.
  const target=ownActionTarget(item,o?.ownPublic);
  if(!target||!has(target,P.aor)||arr(target.tools).length!==0)return 0;
  const suppressed=arr(target.abilitySuppressions).some(x=>
    x.abilityName==='Irritating Pollen'&&x.suppressed===true&&
    /^(?:Galarian Weezing|Garbodor|Wobbuffet)\b/i.test(x.sourcePrinting??''));
  if(!suppressed)return 0;
  return toolEffectsSuppressed(o)?0:172;
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
function ghStadiumOnlyLine(o) {
  if(!supporterUnused(o))return false;
  const own=o.ownPublic;
  const inHand=arr(o.ownHand);
  const inPlay=[...arr(own.stadium),...arr(o.opponentPublic?.stadium)];
  const tree=grandTreeTarget(o)&&
    !inPlay.some(x=>has(x,P.grandTree))&&
    !inHand.some(x=>has(x,P.grandTree))&&
    k1Available(o,[P.grandTree])!==false;
  const artazon=benchCount(own)<5&&usefulArtazonBasic(o)&&
    !inPlay.some(x=>has(x,P.artazon))&&
    !inHand.some(x=>has(x,P.artazon))&&
    k1Available(o,[P.artazon])!==false;
  return !!(tree||artazon);
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
  // Grand Tree can evolve an eligible Active Basic too. Prefer an established
  // Benched target when available to preserve the rank15 Bench lock plan.
  const board=[...arr(own?.bench),own?.active];
  const established=board.filter(x=>x&&
    Number.isSafeInteger(x.lastPlayedOrEvolvedTurn)&&
    x.lastPlayedOrEvolvedTurn<o.globalTurn);
  return established.find(x=>has(x,P.oddish)&&k1Available(o,[P.gloom])!==false)||
    established.find(x=>has(x,P.pidgey)&&k1Available(o,[P.pidgeotto])!==false)||
    established.find(x=>has(x,P.buneary)&&k1Available(o,[P.mega])!==false)||null;
}
function grandTreePrompt(request) {
  const p=request.prompt,m=p.publicMetadata??{},o=request.observation;
  const own=o.ownPublic;
  if(p.promptType==='ChoosePokemonPrompt'&&m.selectionType==='pokemon'&&
     Number.isSafeInteger(m.minimumCount)&&Number.isSafeInteger(m.maximumCount)&&
     m.minimumCount<=1&&m.maximumCount<=1){
    const target=grandTreeTarget(o);
    const bench=arr(own.bench);
    const targetIndex=target?bench.indexOf(target):-1;
    const activeTarget=!!target&&target===own.active;
    // A freshly played Oddish is ineligible even when its printing is
    // identical to an established copy elsewhere. Match the physical zone,
    // owner and Bench index. An Active selection is unambiguous by zone.
    const sameNameCount=target?bench.filter(x=>x&&txt(x)===txt(target)).length:0;
    const c=arr(p.choices).find(c=>{
      if(!target||c.kind!=='pokemon'||typeof c.token!=='string'||
        c.publicMetadata?.ownerSeat!=='actor'||txt(c)!==txt(target))return false;
      if(activeTarget){
        return c.publicMetadata?.targetZone==='active'&&
          (m.targetZone===undefined||m.targetZone==='active');
      }
      if(targetIndex<0||c.publicMetadata?.targetZone!=='bench'||
         (m.targetZone!==undefined&&m.targetZone!=='bench'))return false;
      const index=c.publicMetadata?.benchIndex;
      return Number.isSafeInteger(index) ? index===targetIndex:
        sameNameCount===1;
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
  const priorities=[];
  // An existing Gloom is NOT proof that Grand Tree's current evolution
  // target belongs to its chain. A Pidgeotto may have just evolved during
  // the same Grand Tree resolution while another Gloom remains on the board.
  // Consider each *offered* legal evolutionary family, rather than using
  // else-if on unrelated board members to shadow the actual offered card.
  if(board.some(x=>has(x,P.gloom)))
    priorities.push(...(board.some(x=>has(x,P.aor))?[P.bus,P.aor]:[P.aor,P.bus]));
  if(board.some(x=>has(x,P.pidgeotto)))priorities.push(P.pidgeot);
  if(board.some(x=>has(x,P.oddish)))priorities.push(P.gloom);
  if(board.some(x=>has(x,P.pidgey)))priorities.push(
    /^Pidgeotto TEU(?: 123)?\b/i,/^Pidgeotto MEW(?: 17)?\b/i);
  if(board.some(x=>has(x,P.buneary)))priorities.push(P.mega);
  const choices=arr(p.choices).filter(c=>c.kind==='card'&&typeof c.token==='string');
  for(const pat of priorities){
    const c=choices.find(c=>has(c,pat));
    if(c)return {kind:'select-choices',tokens:[c.token]};
  }
  const empty=arr(p.choices).find(c=>c.kind==='empty-selection'&&typeof c.token==='string');
  return m.minimumCount===0&&empty?{kind:'select-choice',token:empty.token}:
    abstain('NO_LEGAL_CARD_SET');
}
function hypotheticalNextSupporter(o) {
  return {...o,ownTurnResources:{...o.ownTurnResources,supporterPlayedTurn:-1}};
}
function eldSupporterPriority(card,o) {
  const next=hypotheticalNextSupporter(o);
  if(has(card,P.karen)&&karenOpportunity(next))return 140;
  if(has(card,P.guzma)&&guzmaOpportunity(next))return 130;
  if(has(card,P.guzmaHala)&&missingEvolutionChannels(o)&&
     disposableCards(o).length>=2)return 120;
  if(has(card,P.n)&&nOpportunity(next))return 110;
  if(has(card,P.karen))return 70;
  if(has(card,P.guzma))return 60;
  if(has(card,P.guzmaHala))return 55;
  if(has(card,P.n))return 50;
  return 0;
}
function eldCanBench(o) {
  const own=o?.ownPublic;
  if(!own||benchCount(own)>=5)return false;
  const lockBases=slots(own).filter(x=>
    [P.oddish,P.gloom,P.aor,P.bus].some(p=>has(x,p))).length;
  if(5-benchCount(own)<=Math.max(0,2-lockBases))return false;
  // Happy Match is a Basic Pokémon V's Ability while Eldegoss is played
  // from hand to Bench. Both Silent Lab (Basic) and Path (Rule Box) suppress
  // that trigger unless an explicit Stadium-and-Tool nullification is live.
  const stadiums=[...arr(own.stadium),...arr(o.opponentPublic?.stadium)];
  if(!stadiumAndToolEffectsMuted(o)&&
    stadiums.some(x=>has(x,P.pathPeak)||has(x,P.silentLab)))return false;
  if(has(o.opponentPublic?.active,/^Iron Thorns ex TWM(?: 77)?\b/i))return false;
  return arr(own.discard).some(card=>eldSupporterPriority(card,o)>0);
}
function floatUpPrompt(request) {
  const p=request.prompt,m=p.publicMetadata??{};
  if(p.promptType!=='ConfirmPrompt'||m.selectionType!=='confirm'||
    p.source?.effectName!=='Float Up')
    return abstain('UNSUPPORTED_CONFIRMATION_SOURCE');
  const choices=arr(p.choices).filter(c=>c.kind==='confirm'&&typeof c.token==='string');
  const yes=choices.find(c=>c.label==='Yes');
  const no=choices.find(c=>c.label==='No');
  const safe=has(request.observation?.ownPublic?.active,P.eldegoss)&&
    benchCount(request.observation.ownPublic)>0;
  if(safe&&yes)return {kind:'select-choice',token:yes.token};
  return no?{kind:'select-choice',token:no.token}:abstain('UNRECOGNIZED_SIMPLE_PROMPT');
}
function eldegossPrompt(request) {
  const p=request.prompt,m=p.publicMetadata??{},o=request.observation;
  if(p.promptType!=='ChooseCardsPrompt'||m.selectionType!=='card-combination'||
    !actorCardZone(p,'discard')||!Number.isSafeInteger(m.minimumCount)||
    !Number.isSafeInteger(m.maximumCount)||m.minimumCount>1||m.maximumCount!==1)
    return abstain('UNSUPPORTED_DISCARD_RETRIEVAL');
  const owned=new Set(arr(o.ownPublic?.discard).map(txt));
  const ranked=arr(p.choices).map((c,i)=>({c,i,
    score:eldSupporterPriority(c,o)}))
    .filter(x=>x.c.kind==='card'&&typeof x.c.token==='string'&&
      owned.has(txt(x.c))&&x.score>0)
    .sort((a,b)=>b.score-a.score||a.i-b.i);
  if(ranked.length)return {kind:'select-choices',tokens:[ranked[0].c.token]};
  const empty=arr(p.choices).find(x=>x.kind==='empty-selection'&&typeof x.token==='string');
  return m.minimumCount===0&&empty?{kind:'select-choice',token:empty.token}:
    abstain('NO_LEGAL_CARD_SET');
}
function nOpportunity(o) {
  const own=o?.ownPublic,op=o?.opponentPublic;
  if(!own||!op||!supporterUnused(o))return false;
  const ownPrize=own.prizeCount,oppPrize=op.prizeCount;
  const opponentHand=op.handCount;
  const ownRemaining=arr(o.ownHand).filter(c=>!has(c,P.n));
  const protectedNow=ownRemaining.some(c=>
    has(c,P.grandTree)&&slots(own).some(x=>[P.oddish,P.gloom].some(p=>has(x,p)))||
    has(c,P.aor)&&slots(own).some(x=>has(x,P.gloom))||
    has(c,P.bus)&&slots(own).some(x=>has(x,P.gloom))||
    has(c,P.mega)&&slots(own).some(x=>has(x,P.buneary)));
  if(protectedNow)return false;
  if(Number.isSafeInteger(ownPrize)&&ownPrize>=4&&ownRemaining.length<=2)
    return true;
  return Number.isSafeInteger(oppPrize)&&oppPrize<=2&&
    Number.isSafeInteger(opponentHand)&&opponentHand>=5&&
    Number.isSafeInteger(ownPrize)&&ownPrize>=3&&ownRemaining.length<=5;
}
function xtransceiverPrompt(request) {
  const p=request.prompt,m=p.publicMetadata??{},o=request.observation;
  if(p.promptType!=='ChooseCardsPrompt'||m.selectionType!=='card-combination'||
    !actorCardZone(p,'deck')||!Number.isSafeInteger(m.minimumCount)||
    !Number.isSafeInteger(m.maximumCount)||m.minimumCount>1||m.maximumCount!==1)
    return abstain('UNSUPPORTED_CARD_COMBINATION_SOURCE');
  const c=arr(p.choices).filter(x=>x.kind==='card'&&typeof x.token==='string');
  const first=pat=>c.find(x=>has(x,pat));
  const k=karenOpportunity(o)?first(P.karen):null;
  const g=guzmaOpportunity(o)?first(P.guzma):null;
  const gh=missingEvolutionChannels(o)&&disposableCards(o).length>=2?
    first(P.guzmaHala):null;
  const n=nOpportunity(o)?first(P.n):null;
  const chosen=k??g??gh??n??first(P.guzmaHala)??first(P.karen)??
    first(P.guzma)??first(P.n);
  if(chosen)return {kind:'select-choices',tokens:[chosen.token]};
  const empty=arr(p.choices).find(x=>x.kind==='empty-selection'&&typeof x.token==='string');
  return m.minimumCount===0&&empty?{kind:'select-choice',token:empty.token}:
    abstain('NO_LEGAL_CARD_SET');
}
function peakLockOpportunity(o) {
  const own=o?.ownPublic,op=o?.opponentPublic;
  if(!own||!op)return false;
  if(slots(own).some(x=>has(x,P.pidgeot)))return false;
  if(arr(o.ownHand).some(x=>has(x,P.eldegoss))&&
    arr(own.discard).some(c=>[P.karen,P.guzma,P.guzmaHala,P.n].
      some(p=>has(c,p))))return false;
  const vstarUnspent=op.publicTurnRestrictions?.vstarUsed===false;
  if(vstarUnspent&&slots(op).some(x=>has(x,P.regidrago)))return true;
  const shadows=slots(op).filter(x=>/^Shadow Rider Calyrex VMAX CRE(?: 75)?\b/i.
    test(txt(x))).length;
  return shadows>=2;
}
function silentLabOpportunity(o) {
  const own=o?.ownPublic,op=o?.opponentPublic;
  if(!own||!op||o.globalTurn<=2)return false;
  const pidgeot=slots(own).some(x=>has(x,P.pidgeot));
  const iron=slots(op).some(x=>has(x,P.thorns));
  if(iron&&pidgeot)return true;
  const ownPath=[...arr(own.stadium),...arr(op.stadium)].some(x=>has(x,P.pathPeak));
  if(ownPath&&pidgeot&&
    !(op.publicTurnRestrictions?.vstarUsed===false&&
      slots(op).some(x=>has(x,P.regidrago))))return true;
  const basicEngine=slots(op).filter(x=>
    /^Comfey LOR(?: 79)?\b/i.test(txt(x))||
    /^Radiant Greninja ASR(?: 46)?\b/i.test(txt(x))).length;
  const fanUnspent=slots(own).some(x=>has(x,P.fan))&&o.globalTurn<=2;
  return basicEngine>=2&&!fanUnspent;
}
function usefulArtazonBasic(o) {
  const owned=[...slots(o?.ownPublic),...arr(o?.ownHand)];
  const count=(...patterns)=>owned.filter(x=>patterns.some(pattern=>has(x,pattern))).length;
  if(count(P.oddish,P.gloom,P.aor,P.bus)<2)return P.oddish;
  if(count(P.bunnelby)<1)return P.bunnelby;
  if(count(P.buneary,P.mega)<1)return P.buneary;
  if(count(P.pidgey,P.pidgeotto,P.pidgeot)<1)return P.pidgey;
  if(o?.globalTurn<=2&&count(P.fan)<1)return P.fan;
  return null;
}
function artazonPrompt(request) {
  const p=request.prompt,m=p.publicMetadata??{},o=request.observation;
  if(p.promptType!=='ChooseCardsPrompt'||m.selectionType!=='card-combination'||
    !actorCardZone(p,'deck')||!Number.isSafeInteger(m.minimumCount)||
    !Number.isSafeInteger(m.maximumCount)||m.minimumCount>1||m.maximumCount!==1)
    return abstain('UNSUPPORTED_CARD_COMBINATION_SOURCE');
  const empty=arr(p.choices).find(x=>x.kind==='empty-selection'&&typeof x.token==='string');
  if(benchCount(o.ownPublic)>=5)return m.minimumCount===0&&empty?
    {kind:'select-choice',token:empty.token}:abstain('NO_LEGAL_CARD_SET');
  const target=usefulArtazonBasic(o);
  const priority=[target,P.oddish,P.bunnelby,P.buneary,P.pidgey,P.fan,P.budew]
    .filter(Boolean);
  const choices=arr(p.choices).filter(x=>x.kind==='card'&&typeof x.token==='string');
  for(const pat of priority){
    const found=choices.find(c=>has(c,pat));
    if(found)return {kind:'select-choices',tokens:[found.token]};
  }
  return m.minimumCount===0&&empty?{kind:'select-choice',token:empty.token}:
    abstain('NO_LEGAL_CARD_SET');
}
function airMailPrompt(request) {
  // Pidgeotto TEU123 inspects only the actor-visible top 2. Never peek at
  // actual deck order or claim knowledge of the third card.
  const p=request.prompt,m=p.publicMetadata??{};
  if(p.promptType!=='ChooseCardsPrompt'||m.selectionType!=='card-combination'||
    !actorCardZone(p,'deck')||m.minimumCount!==1||m.maximumCount!==1||
    arr(p.choices).filter(c=>c.kind==='card').length>2)
    return abstain('UNSUPPORTED_CARD_COMBINATION_SOURCE');
  return quickSearchPrompt(request);
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
function readyGuzmaMega(x,o) {
  return has(x,P.mega)&&attachedEnergyUnits(x,o)>=1&&
    arr(x.publicRestrictions?.cannotUseAttacksNextTurn).length===0&&
    x.publicRestrictions?.cannotAttackNextTurn!==true;
}
function guzmaOpportunity(o,{resolvingGuzma=false}={}) {
  // Proposed gust is intentionally *not* a native damage projection. It
  // requires an observable powered Bench attacker and target, then selects
  // only when the printed unmodified Gale Thrust could secure Prize tempo.
  const own=o?.ownPublic,opp=o?.opponentPublic;
  if(!own||!opp||!opp.active||
    (!resolvingGuzma&&!supporterUnused(o)))
    return null;
  // Moving BUS Vileplume off Active normally surrenders Basic attack lock,
  // but preserving the lock cannot be better than a fully certified
  // last-Prize Guzma + powered Bench Mega moved-Gale knockout.
  const activeBusLock=has(own.active,P.bus);
  const bench=arr(own.bench),targets=arr(opp.bench);
  const attackerIndex=bench.findIndex(x=>readyGuzmaMega(x,o));
  if(attackerIndex<0)return null;
  // Choice Belt can add +30, but never reduces the moved-Gale base 230.
  // Even when Jamming Tower nullifies the Belt, a guaranteed base-230 KO
  // remains guaranteed. Do not discard a terminal Guzma because Belt exists.
  const prizes=Number.isSafeInteger(own.prizeCount)?own.prizeCount:null;
  const ranked=targets.map((x,index)=>{
    if(!x||!Number.isSafeInteger(x.hp)||!Number.isSafeInteger(x.damage)||
      x.hp<=x.damage||arr(x.tools).some(t=>!has(t,P.lifeDew))||
      arr(x.abilitySuppressions).some(z=>z.suppressed===false))return null;
    const galeDamage=applyColorlessWeaknessResistance(230,x);
    if(galeDamage===null||x.hp-x.damage>galeDamage)return null;
    const prizeValue=sourcePrizeValue(x,o);
    const terminal=prizes!==null&&prizes>0&&prizes<=prizeValue;
    if(activeBusLock&&!terminal)return null;
    // Don't expend the Supporter on a merely one-Prize intermediate gust.
    if(!terminal && prizeValue<2)return null;
    return {opponentIndex:index,attackerIndex,terminal,
      score:(terminal?1000:0)+prizeValue*100+(x.hp-x.damage)};
  }).filter(Boolean).sort((a,b)=>b.score-a.score||
    a.opponentIndex-b.opponentIndex);
  return ranked[0]??null;
}
function guzmaPrompt(request) {
  const p=request.prompt,m=p.publicMetadata??{},o=request.observation;
  if(p.promptType!=='ChoosePokemonPrompt'||m.selectionType!=='pokemon'||
    !Number.isSafeInteger(m.minimumCount)||!Number.isSafeInteger(m.maximumCount)||
    m.minimumCount!==1||m.maximumCount!==1)
    return abstain('UNSUPPORTED_POKEMON_PROMPT');
  const source=arr(p.choices).filter(c=>c.kind==='pokemon'&&
    typeof c.token==='string'&&c.publicMetadata?.targetZone==='bench');
  const enemy=source.filter(c=>c.publicMetadata?.ownerSeat==='opponent');
  const ours=source.filter(c=>c.publicMetadata?.ownerSeat==='actor');
  if(enemy.length&&ours.length)return abstain('UNSUPPORTED_POKEMON_PROMPT');
  if(enemy.length){
    // Opposing target hasn't changed position yet. Re-evaluate directly.
    const chance=guzmaOpportunity(o,{resolvingGuzma:true});
    if(!chance)return abstain('NO_SUPPORTED_POKEMON_CHOICE');
    const found=enemy.find(c=>c.publicMetadata?.benchIndex===chance.opponentIndex&&
      txt(o.opponentPublic.bench[chance.opponentIndex])===txt(c));
    return found?{kind:'select-choices',tokens:[found.token]}:
      abstain('NO_SUPPORTED_POKEMON_CHOICE');
  }
  // Guzma's mandatory second switch happens AFTER the opponent's selected
  // Bench Pokémon moved Active. Its old Bench target is now absent: never
  // recompute the original gust candidate against the changed opponent Bench.
  const bench=arr(o.ownPublic?.bench);
  const index=bench.findIndex(x=>readyGuzmaMega(x,o));
  const found=ours.find(c=>c.publicMetadata?.benchIndex===index&&
    txt(bench[index])===txt(c));
  return found?{kind:'select-choices',tokens:[found.token]}:
    abstain('NO_SUPPORTED_POKEMON_CHOICE');
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
function rototillerPriority(card,o) {
  const own=o?.ownPublic,opp=o?.opponentPublic;
  const lock=slots(own).some(x=>has(x,P.aor)&&
    !arr(x.abilitySuppressions).some(z=>
      z.abilityName==='Irritating Pollen'&&z.suppressed===true));
  if(has(card,P.karen)&&karenOpportunity({...o,ownTurnResources:{
    ...o.ownTurnResources,supporterPlayedTurn:-1}}))return 140;
  if(has(card,P.grandTree)&&slots(own).some(x=>[P.oddish,P.gloom,P.buneary,P.pidgey].
    some(p=>has(x,p))))return 130;
  if(has(card,P.guzma)&&slots(own).some(x=>has(x,P.mega)))return 125;
  if(has(card,P.jet)&&slots(own).some(x=>has(x,P.bus)))return 120;
  if(has(card,P.doubleColorless)&&slots(own).some(x=>has(x,P.mega)))return 115;
  if(has(card,P.guzmaHala)&&!lock&&missingEvolutionChannels(o))return 110;
  if(has(card,P.aor)&&!slots(own).some(x=>has(x,P.aor)))return 105;
  if(has(card,P.bus)&&!slots(own).some(x=>has(x,P.bus)))return 100;
  if(has(card,P.gloom)&&slots(own).some(x=>has(x,P.oddish)))return 95;
  if(has(card,P.oddish)&&slots(own).filter(x=>[P.oddish,P.gloom,P.aor,P.bus].
    some(p=>has(x,p))).length<2)return 90;
  if(has(card,P.poffin))return lock?10:70;
  if(has(card,P.tagCall))return lock?8:60;
  if(has(card,P.grass))return 35;
  if(has(card,P.jet))return 30;
  if(has(card,P.karen))return 25;
  return 20;
}
function rototillerPrompt(request) {
  const p=request.prompt,m=p.publicMetadata??{},o=request.observation;
  if(p.promptType!=='ChooseCardsPrompt'||m.selectionType!=='card-combination'||
    !actorCardZone(p,'discard')||!Number.isSafeInteger(m.minimumCount)||
    !Number.isSafeInteger(m.maximumCount)||m.minimumCount<0||
    m.minimumCount>1||m.maximumCount!==1)
    return abstain('UNSUPPORTED_DISCARD_RETRIEVAL');
  const actual=new Map();
  for(const c of arr(o.ownPublic?.discard)){
    const printing=txt(c);actual.set(printing,(actual.get(printing)??0)+1);
  }
  const candidates=arr(p.choices).filter(c=>c.kind==='card'&&
    typeof c.token==='string'&&(actual.get(txt(c))??0)>0)
    .map((c,i)=>({c,i,score:rototillerPriority(c,o)}))
    .sort((a,b)=>b.score-a.score||a.i-b.i);
  if(candidates.length)return {kind:'select-choices',tokens:[candidates[0].c.token]};
  const empty=arr(p.choices).find(c=>c.kind==='empty-selection'&&typeof c.token==='string');
  return m.minimumCount===0&&empty?{kind:'select-choice',token:empty.token}:
    abstain('NO_LEGAL_CARD_SET');
}
function bunnelbyAttritionAction(items,o) {
  if(!has(o.ownPublic?.active,P.bunnelby)||
    arr(o.ownPublic.active.energies).length===0)return null;
  const burrow=items.find(x=>x.kind==='attack'&&x.attackName==='Burrow');
  const rototiller=items.find(x=>x.kind==='attack'&&x.attackName==='Rototiller');
  const ownDeck=o.ownPublic.deckCount,oppDeck=o.opponentPublic?.deckCount;
  const meaningfulDiscard=arr(o.ownPublic.discard).length>0;
  if(rototiller&&Number.isSafeInteger(ownDeck)&&ownDeck<=1&&meaningfulDiscard)
    return rototiller;
  if(burrow&&Number.isSafeInteger(oppDeck)&&oppDeck>0&&oppDeck<=2)return burrow;
  if(rototiller&&Number.isSafeInteger(ownDeck)&&ownDeck<=3&&meaningfulDiscard)
    return rototiller;
  if(burrow&&Number.isSafeInteger(oppDeck)&&oppDeck>0)return burrow;
  return rototiller&&meaningfulDiscard?rototiller:null;
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
  const tmAvailable=arr(own?.active?.tools).some(x=>has(x,P.tmEvolution));
  const ready=has(own?.active,P.bunnelby)&&
    arr(own.active.energies).length>0&&(
      (tmAvailable&&k1EvoTarget(o))||
      (Number.isSafeInteger(o.opponentPublic?.deckCount)&&o.opponentPublic.deckCount>0)||
      arr(own.discard).length>0);
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
  let preferredMegaAttack=null;
  if(spiky&&gale) {
    const sk=knockOut(spiky,request),gk=knockOut(gale,request);
    if(sk && !gk)preferredMegaAttack=spiky;
    if(gk && !sk)preferredMegaAttack=gale;
    const copycatThreat=candidateCopycatThreat(request);
    if(copycatThreat&&movementEvidence(request)===true)preferredMegaAttack=spiky;
    // On verified Bench->Active movement Gale deals 230, not 60. Prefer
    // the higher attack when both miss KO, absent paid Copycat revenge.
    const galeDamage=printedDamage(gale,request);
    const spikyDamage=printedDamage(spiky,request);
    if(!preferredMegaAttack&&galeDamage!==null&&spikyDamage!==null&&galeDamage>spikyDamage)
      preferredMegaAttack=gale;
  }
  const peck=attacks.find(x=>x.attackName==='Peck Off'&&has(o.ownPublic?.active,P.pidgey));
  const preferredPeck=peck&&arr(o.opponentPublic?.active?.tools).some(x=>has(x,P.hood))&&
      !doubleBaseCutExposed(request)?peck:null;
  const gustOpportunity=guzmaOpportunity(o);
  const gust=items.find(x=>x.kind==='play-card'&&has(ownPrinting(x),P.guzma));
  if(gust&&gustOpportunity?.terminal)return take(gust);
  // A demonstrated last-Prize movement action must beat mere setup actions.
  const winningPromotion=terminalGalePromotionAction(items,request);
  if(winningPromotion)return take(winningPromotion);
  const karen=items.find(x=>x.kind==='play-card'&&has(ownPrinting(x),P.karen));
  if(karen&&karenOpportunity(o))return take(karen);
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
  const silent=items.find(x=>x.kind==='play-card'&&has(ownPrinting(x),P.silentLab));
  if(silent&&silentLabOpportunity(o))return take(silent);
  const peak=items.find(x=>x.kind==='play-card'&&has(ownPrinting(x),P.pathPeak));
  if(peak&&peakLockOpportunity(o))return take(peak);
  const artazon=items.find(x=>x.kind==='use-stadium'&&has(ownPrinting(x),P.artazon));
  if(artazon&&benchCount(o.ownPublic)<5&&usefulArtazonBasic(o))return take(artazon);
  const artazonPlace=items.find(x=>x.kind==='play-card'&&has(ownPrinting(x),P.artazon));
  if(artazonPlace&&benchCount(o.ownPublic)<5&&usefulArtazonBasic(o))return take(artazonPlace);
  const airMail=items.find(x=>x.kind==='use-ability'&&
    x.publicMetadata?.abilityName==='Air Mail'&&
    (has(ownPrinting(x),/^Pidgeotto TEU(?: 123)?\b/i)||
     slots(o.ownPublic).some(x=>has(x,/^Pidgeotto TEU(?: 123)?\b/i))));
  if(airMail)return take(airMail);
  const quick=items.find(x=>x.kind==='use-ability'&&
    x.publicMetadata?.abilityName==='Quick Search'&&
    (has(ownPrinting(x),P.pidgeot)||slots(o.ownPublic).some(c=>has(c,P.pidgeot))));
  if(quick)return take(quick);
  const tmAttack=attacks.find(x=>x.attackName==='Evolution'&&
    has(o.ownPublic?.active,P.bunnelby)&&
    arr(o.ownPublic?.active?.tools).some(c=>has(c,P.tmEvolution)));
  const pendingTmAttack=tmAttack&&k1EvoTarget(o)?tmAttack:null;
  const eldegoss=items.find(x=>x.kind==='play-card'&&has(ownPrinting(x),P.eldegoss));
  if(eldegoss&&eldCanBench(o))return take(eldegoss);
  const n=items.find(x=>x.kind==='play-card'&&has(ownPrinting(x),P.n));
  if(n&&nOpportunity(o))return take(n);
  const xtransceiver=items.find(x=>x.kind==='play-card'&&has(ownPrinting(x),P.xtransceiver));
  if(xtransceiver&&supporterUnused(o)&&
    o.ownPublic?.publicTurnRestrictions?.itemPlayLocked!==true&&
    k1Available(o,[P.karen,P.guzma,P.guzmaHala,P.n])!==false)
    return take(xtransceiver);
  const floatUp=items.find(x=>x.kind==='attack'&&x.attackName==='Float Up'&&
    has(o.ownPublic?.active,P.eldegoss));
  const pendingFloatUp=floatUp;
  const attrition=bunnelbyAttritionAction(items,o);
  if(attrition?.attackName==='Rototiller'&&o.ownPublic?.deckCount<=1)
    return take(attrition);
  const busWindow=busActivePromotionOpportunity(o);
  if(busWindow){
    const bench=arr(o.ownPublic?.bench);
    const busIndex=bench.findIndex(x=>x&&has(x,P.bus)&&
      !arr(x.abilitySuppressions).some(a=>
        a.abilityName==='Disgusting Pollen'&&a.suppressed===true));
    const busTarget=busIndex<0?null:{index:busIndex,printing:bench[busIndex].printing};
    const jetBus=items.find(x=>x.kind==='play-card'&&has(ownPrinting(x),P.jet)&&
      ownActionTarget(x,o.ownPublic)===bench[busIndex]);
    if(jetBus&&!templeSuppressesSpecialEnergy(o))return take(jetBus);
    const retreatBus=busTarget&&items.find(x=>retreatActionTargets(x,busTarget,o.ownPublic));
    if(retreatBus)return take(retreatBus);
  }
  const pendingAttrition=attrition;
  const mobility=mobilityActions(items,o,request);
  if(mobility)return take(mobility);
  const tmTargets=items.filter(x=>{
    if(x.kind!=='play-card'||!has(ownPrinting(x),P.tmEvolution))return false;
    const target=ownActionTarget(x,o.ownPublic);
    return !!target&&has(target,P.bunnelby)&&arr(target.tools).length===0;
  });
  // A ready Active Bunnelby can announce Evolution on this turn; a Benched
  // Bunnelby merely holds the Tool. Do not choose first-offered Bench copy.
  const attachTm=tmTargets.find(x=>ownActionTarget(x,o.ownPublic)===o.ownPublic.active)??tmTargets[0];
  if(attachTm&&missingEvolutionChannels(o))return take(attachTm);
  const attachJet=items.find(x=>{
    if(x.kind!=='play-card'||!has(ownPrinting(x),P.jet))return false;
    const target=ownActionTarget(x,o.ownPublic);
    return !!target&&target!==o.ownPublic.active&&has(target,P.bunnelby)&&
      arr(target.tools).some(c=>has(c,P.tmEvolution));
  });
  // Jet's free promotion is useful only when attached to that exact equipped
  // Benched Bunnelby. Its ordinary Energy attachment is still scored below.
  if(attachJet&&!templeSuppressesSpecialEnergy(o)&&missingEvolutionChannels(o))
    return take(attachJet);
  if(gust&&gustOpportunity&&!gustOpportunity.terminal)return take(gust);
  const gh=items.find(x=>x.kind==='play-card'&&has(ownPrinting(x),P.guzmaHala));
  if(gh&&(ghLineFeasible(o,P.guzmaHala)||ghStadiumOnlyLine(o)))return take(gh);
  const tag=items.find(x=>x.kind==='play-card'&&has(ownPrinting(x),P.tagCall));
  if(tag&&!arr(o.ownHand).some(c=>has(c,P.guzmaHala))&&
    k1Available(o,[P.guzmaHala])!==false&&
    (ghLineFeasible(o,P.tagCall)||ghStadiumOnlyLine(o)))return take(tag);
  const hood=items.map(x=>({item:x,score:hoodProtectionScore(x,o)}))
    .filter(x=>x.score>0)[0];
  if(hood)return take(hood.item);
  // Only a complete offered two-Basic deck-search line is initiated here.
  const poffin=items.find(x=>x.kind==='play-card'&&has(ownPrinting(x),P.poffin));
  if(poffin&&benchCount(o.ownPublic)<5&&
      slots(o.ownPublic).filter(x=>[P.oddish,P.gloom,P.aor,P.bus].some(p=>has(x,p))).length<2&&
      arr(o.ownHand).filter(x=>has(x,P.oddish)).length<2)
    return take(poffin);
  const energy=items.map((item,index)=>({item,index,score:energyActionScore(item,o)}))
    .filter(x=>x.score>0).sort((a,b)=>b.score-a.score||a.index-b.index)[0];
  if(energy)return take(energy.item);

  // Budew ASC16 has free Itchy Pollen Item lock. Use only after valuable
  // setup and before AOR Vileplume has already established the same lock.
  const itchy=attacks.find(x=>x.attackName==='Itchy Pollen'&&
    has(o.ownPublic?.active,P.budew));
  const aorLive=slots(o.ownPublic).some(x=>has(x,P.aor)&&
    !arr(x.abilitySuppressions).some(z=>
      z.abilityName==='Irritating Pollen'&&z.suppressed===true));
  // Nonterminal attacks end our turn. First complete offered Basic/evolution
  // setup; only immediately terminal KOs may pre-empt those opportunities.
  const setup=items.map((item,index)=>({item,index,
    score:item.kind==='play-card'?Math.max(usefulEvolution(item,o),usefulBasic(item,o)):0}))
    .filter(x=>x.score>0).sort((a,b)=>b.score-a.score||a.index-b.index)[0];
  if(setup)return take(setup.item);
  if(itchy&&o.globalTurn<=4&&!aorLive&&
    o.opponentPublic?.publicTurnRestrictions?.itemPlayLocked!==true)
    return take(itchy);
  if(pendingTmAttack)return take(pendingTmAttack);
  if(pendingAttrition)return take(pendingAttrition);
  if(pendingFloatUp)return take(pendingFloatUp);
  if(preferredMegaAttack)return take(preferredMegaAttack);
  if(preferredPeck)return take(preferredPeck);
  const scored=items.map((item,index)=>{
    let score=0;
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
     !config||typeof config!=='object'||Array.isArray(config)||
     !(Object.keys(config).length===0||
       (Object.keys(config).length===1&&config.allowPassFallback===true)))
    throw new Error('AGENT20_RANK15_INIT_MISMATCH');
  const allowPassFallback=config.allowPassFallback===true;
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
      if(has(request.prompt?.source?.sourcePrinting,P.artazon))return artazonPrompt(request);
      if(has(request.prompt?.source?.sourcePrinting,P.capture))return capturePrompt(request);
      if(has(request.prompt?.source?.sourcePrinting,P.xtransceiver))return xtransceiverPrompt(request);
      if(has(request.prompt?.source?.sourcePrinting,P.eldegoss)&&
        request.prompt?.promptType==='ConfirmPrompt')return floatUpPrompt(request);
      if(has(request.prompt?.source?.sourcePrinting,P.eldegoss))return eldegossPrompt(request);
      if(has(request.prompt?.source?.sourcePrinting,/^Pidgeotto TEU(?: 123)?\b/i)&&
        request.prompt?.source?.effectName==='Air Mail')return airMailPrompt(request);
      if(has(request.prompt?.source?.sourcePrinting,P.tagCall))return tagCallPrompt(request);
      if(has(request.prompt?.source?.sourcePrinting,P.guzmaHala))return ghPrompt(request);
      if(has(request.prompt?.source?.sourcePrinting,P.guzma))return guzmaPrompt(request);
      if(has(request.prompt?.source?.sourcePrinting,P.tmEvolution))return evolutionPrompt(request);
      if(has(request.prompt?.source?.sourcePrinting,P.bunnelby)&&
        request.prompt?.source?.effectName==='Rototiller'&&
        request.prompt?.promptType==='ChooseCardsPrompt')return rototillerPrompt(request);
      if(has(request.prompt?.source?.sourcePrinting,P.bunnelby)&&
        request.prompt?.promptType==='ConfirmPrompt')return omegaBarragePrompt(request);
      if(request.prompt?.source?.effectName==='Omega Barrage'&&
        request.prompt?.promptType==='ConfirmPrompt')return omegaBarragePrompt(request);
      if(request.prompt?.promptType==='ChoosePokemonPrompt'&&
        request.prompt?.source?.effectName==='Retreat')return retreatPrompt(request);
      if(request.prompt?.promptType==='ChoosePokemonPrompt'&&
        (request.prompt?.source?.effectName==='Retreat'||
         has(request.prompt?.source?.sourcePrinting,P.bunnelby)))return busRetreatPrompt(request);
      return abstain('UNSUPPORTED_PROMPT_TYPE');
    }
    const root=rootDecision(request);
    // Opt-in best-effort full-game mode: pass only on an otherwise
    // unsupported root, never on an unresolved/foreign prompt. The native
    // action frontier must expose the actual Pass token.
    if(allowPassFallback&&root.kind==='abstain'&&
      root.reasonCode==='NO_SUPPORTED_ROOT_ACTION'){
      const pass=arr(request.actionFrontier?.items).find(x=>playable(x)&&x.kind==='pass');
      if(pass)return take(pass);
    }
    return root;
  }});
}
module.exports={POLICY_VERSION,SOURCE_RANK,SOURCE_LIST_BLOB_SHA1,SOURCE_COUNTS,ENGINE_PRINTING_ALIASES,ENGINE_COUNTS,
  createPolicy,rootDecision,poffinPrompt,printedDamage,applyColorlessWeaknessResistance,movementEvidence,karenOpportunity,REGIDRAGO_DRAGON_PAYLOADS,
  candidateCopycatThreat,doubleBaseCutExposed,ghPrompt,tagCallPrompt,evolutionPrompt,ghLineFeasible,actorCardZone,actorPokemonBench,fanCallPrompt,quickSearchPrompt,energyProvided,attachedEnergyUnits,energyActionScore,positionTarget,retreatPrompt,mobilityActions,capturePrompt,hoodProtectionScore,k1Available,k1EvoTarget,ghStadiumOnlyLine,nOpportunity,peakLockOpportunity,silentLabOpportunity,eldCanBench,eldegossPrompt,floatUpPrompt,eldSupporterPriority,xtransceiverPrompt,usefulArtazonBasic,artazonPrompt,airMailPrompt,grandTreePrompt,grandTreeTarget,guzmaOpportunity,guzmaPrompt,rototillerPrompt,rototillerPriority,bunnelbyAttritionAction,omegaBarragePrompt,busActivePromotionOpportunity,busRetreatPrompt};
