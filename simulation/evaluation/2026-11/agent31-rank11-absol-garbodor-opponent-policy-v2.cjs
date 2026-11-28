'use strict';
/* Rank-11 Aichi Absol/Garbodor opponent policy v2. Deterministic, actor-view-only, fail-closed.
   Agent49's current V3 validator requires config={}; immutable source/candidate bindings live here. */
const POLICY_VERSION='agent31-rank11-absol-garbodor-opponent-v2';
const SOURCE_RANK=11;
const SOURCE_LIST_BLOB_SHA1='ae773f6201d7aa69d31914dbfee66f3fba692200';
const SOURCE_ENTRY_JSON_SHA256='0da7b283f0416c883eda2825267a8e51e2d3b55ec130a2103da6539d04b350e6';
const CANDIDATE_ENTRY_JSON_SHA256='4c18dd93ba49fd8f7d88aad573249dc6941b4cf61d52b99f80309345b5d58c59';
const ENGINE_PIN='a9905a76a6c4103ba4b6cb9a49e86bad795c5c05';
const WORKER_PROTOCOL_BLOB_SHA1='468f957b17656f41cf9af8c77e6954bb79ea5695';
const PRINT=Object.freeze({
 mega:/^Mega Absol ex MEG 86\b/i,trubbish:/^Trubbish FST 168\b/i,garbodor:/^Garbodor BKP 57\b/i,
 oranguru:/^Oranguru V ASR 133\b/i,latias:/^Latias ex SSP 76\b/i,tapu:/^Tapu Lele-GX GRI 60\b/i,
 crobat:/^Crobat V DAA 104\b/i,squawk:/^Squawkabilly ex PAL 169\b/i,carmine:/^Carmine TWM 145\b/i,
 marnie:/^Marnie SSH 169\b/i,guzma:/^Guzma BUS 115\b/i,vip:/^Battle VIP Pass FST 225\b/i,
 quick:/^Quick Ball FST 237\b/i,letter:/^Professor's Letter BKT 146\b/i,darkPatch:/^Dark Patch ASR 139\b/i,
 boost:/^Boost Shake EVS 142\b/i,escape:/^Escape Rope BST 125\b/i,rod:/^Super Rod PAL 188\b/i,
 vs:/^VS Seeker PHF 109\b/i,secret:/^Secret Box TWM 163\b/i,float:/^Float Stone BKT 137\b/i,
 forest:/^Forest Seal Stone SIT 156\b/i,muscle:/^Muscle Band XY 121\b/i,
 shopping:/^Shopping Center EVS 157\b/i,temple:/^Temple of Sinnoh ASR 155\b/i,dark:/^Darkness Energy MEE 15\b/i,
 fieldBlower:/^Field Blower GRI 125\b/i,stealthyHood:/^Stealthy Hood UNB 186\b/i,unfairStamp:/^Unfair Stamp TWM 165\b/i,
 shadowVmax:/^Shadow Rider Calyrex VMAX CRE 75\b/i,shadowV:/^Shadow Rider Calyrex V CRE 74\b/i,
 clefairy:/^Lillie's Clefairy ex JTG 56\b/i,radiantEternatus:/^Radiant Eternatus CRZ 105\b/i,
 mysteriousTreasure:/^Mysterious Treasure FLI 113\b/i,fogCrystal:/^Fog Crystal CRE 140\b/i,
 iono:/^Iono PAL 185\b/i,nightStretcher:/^Night Stretcher ASC 196\b/i,arven:/^Arven SVI 166\b/i,
 lilliesDetermination:/^Lillie's Determination MEG 119\b/i,psychicEnergy:/^Psychic Energy MEE 13\b/i
});
const SOURCE_INVENTORY=Object.freeze([
 ['Mega Absol ex MEG 86',3],['Trubbish FST 168',2],['Garbodor BKP 57',2],['Oranguru V ASR 133',2],
 ['Latias ex SSP 76',1],['Tapu Lele-GX GRI 60',1],['Crobat V DAA 104',1],['Squawkabilly ex PAL 169',1],
 ['Carmine TWM 145',3],['Marnie SSH 169',3],['Guzma BUS 115',2],['Battle VIP Pass FST 225',4],
 ['Quick Ball FST 237',4],["Professor's Letter BKT 146",4],['Dark Patch ASR 139',3],['Boost Shake EVS 142',2],
 ['Escape Rope BST 125',1],['Super Rod PAL 188',1],['VS Seeker PHF 109',1],['Secret Box TWM 163',1],
 ['Float Stone BKT 137',3],['Forest Seal Stone SIT 156',2],['Muscle Band XY 121',1],
 ['Shopping Center EVS 157',2],['Temple of Sinnoh ASR 155',2],['Darkness Energy MEE 15',8]
]);
const EXECUTABLE=new Set(['play-card','attack','retreat','use-ability','use-stadium','pass']);
function list(v){return Array.isArray(v)?v:[]}
function textOf(v){if(typeof v==='string')return v;if(typeof v?.printing==='string')return v.printing;if(typeof v?.fullName==='string')return v.fullName;if(typeof v?.label==='string')return v.label;return ''}
function matches(v,p){return p.test(textOf(v))}
function slots(p){return[{zone:'active',index:0,pokemon:p?.active??null},...list(p?.bench).map((pokemon,index)=>({zone:'bench',index,pokemon}))].filter(r=>r.pokemon&&r.pokemon.concealed!==true)}
function count(p,x){return slots(p).filter(r=>matches(r.pokemon.printing,x)).length}
function benchCount(p){return list(p?.bench).filter(Boolean).length}
function handCount(o){return list(o?.ownHand).length}
function deckCount(o){return Number.isSafeInteger(o?.ownPublic?.deckCount)?o.ownPublic.deckCount:0}
function opponentHandCount(o){return Number.isSafeInteger(o?.opponentPublic?.handCount)?o.opponentPublic.handCount:0}
function supporterAvailable(o){return o?.ownTurnResources?.supporterPlayedTurn===0&&o?.ownTurnResources?.supporterPlayLocked!==true&&o?.ownPublic?.publicTurnRestrictions?.supporterPlayLocked!==true}
function energyCount(p){return list(p?.energies).length}
function hasLatias(o){return count(o?.ownPublic,PRINT.latias)>0}
function hasGarbodor(o){return count(o?.ownPublic,PRINT.garbodor)>0}
function hasTrubbish(o){return count(o?.ownPublic,PRINT.trubbish)>0}
function hasMegaAbsol(o){return count(o?.ownPublic,PRINT.mega)>0}
function discardHas(p,x){return list(p?.discard).some(c=>matches(c,x))}
function remainingHp(p){return p&&Number.isFinite(p.hp)&&Number.isFinite(p.damage)?p.hp-p.damage:-1}
function owner(c){return c?.publicMetadata?.ownerSeat??null}
function zone(c){return c?.publicMetadata?.sourceZone??c?.publicMetadata?.targetZone??c?.publicMetadata?.zone??null}
function ownPokemon(c,o){const p=textOf(c),z=c?.publicMetadata?.targetZone??c?.publicMetadata?.zone??null,i=c?.publicMetadata?.benchIndex??c?.publicMetadata?.targetIndex;if(z==='active'){const x=o.ownPublic?.active;return x&&x.printing===p?{zone:z,index:0,pokemon:x}:null}if(z==='bench'&&Number.isSafeInteger(i)){const x=o.ownPublic?.bench?.[i];return x&&x.printing===p?{zone:z,index:i,pokemon:x}:null}const f=slots(o.ownPublic).filter(r=>r.zone===z&&r.pokemon.printing===p);return f.length===1?f[0]:null}
function opponentPokemon(c,o){const p=textOf(c),z=c?.publicMetadata?.targetZone??c?.publicMetadata?.zone??null,i=c?.publicMetadata?.benchIndex??c?.publicMetadata?.targetIndex;if(z==='active'){const x=o.opponentPublic?.active;return x&&x.printing===p?{zone:z,index:0,pokemon:x}:null}if(z==='bench'&&Number.isSafeInteger(i)){const x=o.opponentPublic?.bench?.[i];return x&&x.printing===p?{zone:z,index:i,pokemon:x}:null}const f=slots(o.opponentPublic).filter(r=>r.zone===z&&r.pokemon.printing===p);return f.length===1?f[0]:null}
function prizeLiability(p){const s=list(p?.printed?.subtypes).join(' ').toLowerCase();if(/\bvmax\b/.test(s)||/VMAX|^Mega .+ ex\b| & .+-GX/i.test(p?.printing??''))return 3;if(/\b(?:v|gx|ex)\b/.test(s)||/(?: Pokémon )?(?:V|GX|ex)\b/.test(p?.printing??''))return 2;return 1}
function opponentTargetScore(c,o,d=220){if(owner(c)!=='opponent'||!['bench','active'].includes(zone(c)))return 0;const r=opponentPokemon(c,o);if(!r)return 0;const hp=remainingHp(r.pokemon);return prizeLiability(r.pokemon)*60+(hp>0&&hp<=d?190:0)+energyCount(r.pokemon)*14+Math.max(0,r.pokemon.damage??0)*0.2}
function ownSwitchScore(c,o){if(owner(c)!=='actor'||zone(c)!=='bench')return 0;const r=ownPokemon(c,o);if(!r)return 0;if(matches(r.pokemon.printing,PRINT.mega)&&energyCount(r.pokemon)>=2)return 250;if(matches(r.pokemon.printing,PRINT.mega))return 175;if(matches(r.pokemon.printing,PRINT.garbodor))return 80;if(matches(r.pokemon.printing,PRINT.oranguru))return 65;return 20+energyCount(r.pokemon)*5}
function toolScore(c,o){if(owner(c)!=='actor'||zone(c)!=='deck')return 0;const p=textOf(c),own=o.ownPublic;if(matches(p,PRINT.forest)){const v=slots(own).some(r=>/(?:Oranguru V|Crobat V)/i.test(r.pokemon.printing)&&r.pokemon.tools.length===0);return v&&!o.ownTurnResources?.vstarUsed?260:55}if(matches(p,PRINT.float)){const t=slots(own).some(r=>matches(r.pokemon.printing,PRINT.trubbish)&&r.pokemon.tools.length===0);if(t)return 250;return matches(own.active?.printing??'',PRINT.oranguru)&&!hasLatias(o)?155:70}if(matches(p,PRINT.muscle))return slots(own).some(r=>matches(r.pokemon.printing,PRINT.mega)&&r.pokemon.tools.length===0)?170:40;return 0}
function basicScore(c,o){if(owner(c)!=='actor'||zone(c)!=='deck')return 0;const p=textOf(c);if(matches(p,PRINT.trubbish))return !hasGarbodor(o)&&count(o.ownPublic,PRINT.trubbish)<2?310:25;if(matches(p,PRINT.oranguru))return count(o.ownPublic,PRINT.oranguru)<1?255:65;if(matches(p,PRINT.mega))return count(o.ownPublic,PRINT.mega)<2?225:35;if(matches(p,PRINT.tapu))return supporterAvailable(o)?125:45;if(matches(p,PRINT.crobat))return handCount(o)<=4?120:45;if(matches(p,PRINT.latias))return !hasLatias(o)?110:25;if(matches(p,PRINT.squawk))return o.globalTurn<=2&&handCount(o)<=2?95:15;return 0}
function cardSearchScore(c,o){if(owner(c)!=='actor'||zone(c)!=='deck')return 0;const p=textOf(c);if(matches(p,PRINT.garbodor))return hasTrubbish(o)&&!hasGarbodor(o)?320:0;if(matches(p,PRINT.boost))return hasTrubbish(o)&&!hasGarbodor(o)?250:0;if(matches(p,PRINT.vip))return o.globalTurn<=2&&benchCount(o.ownPublic)<5?230:0;if(matches(p,PRINT.quick))return count(o.ownPublic,PRINT.trubbish)<2||count(o.ownPublic,PRINT.oranguru)===0||count(o.ownPublic,PRINT.mega)<2?180:40;if(matches(p,PRINT.darkPatch))return discardHas(o.ownPublic,PRINT.dark)&&hasMegaAbsol(o)?175:0;if(matches(p,PRINT.letter))return list(o.ownHand).filter(v=>matches(v,PRINT.dark)).length<2?155:0;if([PRINT.float,PRINT.forest,PRINT.muscle].some(x=>matches(p,x)))return toolScore({...c,publicMetadata:{ownerSeat:'actor',sourceZone:'deck'}},o);if(matches(p,PRINT.guzma))return supporterAvailable(o)&&benchCount(o.opponentPublic)>0?190:0;if(matches(p,PRINT.marnie))return supporterAvailable(o)&&opponentHandCount(o)>=4?170:0;if(matches(p,PRINT.carmine))return supporterAvailable(o)&&handCount(o)<=4?150:0;if(matches(p,PRINT.vs))return supporterAvailable(o)&&(discardHas(o.ownPublic,PRINT.guzma)||discardHas(o.ownPublic,PRINT.marnie)||discardHas(o.ownPublic,PRINT.carmine))?145:0;if(matches(p,PRINT.rod))return list(o.ownPublic?.discard).length>1?90:0;if(matches(p,PRINT.temple))return list(o.opponentPublic?.stadium).length>0?95:25;return 20}
function discardScore(c,o){const p=textOf(c),own=o.ownPublic,hand=list(o.ownHand);if(matches(p,PRINT.secret))return 0;if(matches(p,PRINT.garbodor)&&!hasGarbodor(o))return 0;if(matches(p,PRINT.trubbish)&&!hasGarbodor(o))return 0;if(matches(p,PRINT.mega)&&count(own,PRINT.mega)<2)return 0;if(matches(p,PRINT.oranguru)&&count(own,PRINT.oranguru)<1)return 0;if(matches(p,PRINT.float)&&hasTrubbish(o)&&!slots(own).some(r=>matches(r.pokemon.printing,PRINT.trubbish)&&r.pokemon.tools.length>0))return 0;if(matches(p,PRINT.forest)&&!o.ownTurnResources?.vstarUsed&&slots(own).some(r=>/(?:Oranguru V|Crobat V)/i.test(r.pokemon.printing)&&r.pokemon.tools.length===0))return 0;if(matches(p,PRINT.guzma)&&supporterAvailable(o)&&benchCount(o.opponentPublic)>0)return 0;if(matches(p,PRINT.vs)&&!discardHas(own,PRINT.guzma)&&!discardHas(own,PRINT.marnie))return 0;if(matches(p,PRINT.dark))return hand.filter(v=>matches(v,PRINT.dark)).length>2?55:0;if(matches(p,PRINT.vip))return o.globalTurn>2?110:0;if(matches(p,PRINT.carmine))return hand.length>4?35:15;if(matches(p,PRINT.marnie))return opponentHandCount(o)<=2?35:0;if(matches(p,PRINT.boost))return hasGarbodor(o)?80:0;if(matches(p,PRINT.rod))return 30;if(matches(p,PRINT.letter))return hand.filter(v=>matches(v,PRINT.dark)).length>=2?35:0;return 0}
function safeToDiscardHand(o){const ps=[PRINT.secret,PRINT.garbodor,PRINT.trubbish,PRINT.mega,PRINT.oranguru,PRINT.guzma,PRINT.vs,PRINT.boost,PRINT.forest,PRINT.float];return !list(o.ownHand).some(c=>ps.some(p=>matches(c,p)))}
function opponentHandDiscardScore(c,o){if(owner(c)!=='opponent'||zone(c)!=='hand')return 0;const p=textOf(c);if(matches(p,PRINT.fieldBlower))return 320;if(matches(p,PRINT.stealthyHood))return 300;if(matches(p,PRINT.unfairStamp))return 280;if(matches(p,PRINT.shadowVmax))return 265;if(matches(p,PRINT.guzma))return 250;if(matches(p,PRINT.shadowV))return 240;if(matches(p,PRINT.clefairy))return 230;if(matches(p,PRINT.radiantEternatus))return 220;if(matches(p,PRINT.mysteriousTreasure)||matches(p,PRINT.fogCrystal))return 190;if(matches(p,PRINT.iono))return 180;if(matches(p,PRINT.vs)||matches(p,PRINT.nightStretcher))return 170;if(matches(p,PRINT.arven)||matches(p,PRINT.lilliesDetermination))return 160;if(matches(p,PRINT.psychicEnergy))return 10;const t=c?.publicMetadata?.cardType??'';if(/pokemon/i.test(t))return 120;if(/energy/i.test(t))return 10;if(/trainer|supporter|item|tool/i.test(t))return 100;return 30}
function callFamilyScore(c,o){const s=basicScore(c,o);return matches(c,PRINT.trubbish)&&count(o.ownPublic,PRINT.trubbish)>0?30:s}
function scoreAttack(i,o){const a=i.attackName??'',m=i.publicMetadata??{};if(m.attackCostPayable===false)return 0;const rem=Number.isFinite(m.targetHp)&&Number.isFinite(m.targetDamage)?m.targetHp-m.targetDamage:-1;if(/^Terminal Period$/i.test(a))return m.targetDamage===60?340:0;if(/^Claw of Darkness$/i.test(a)){const d=Number.isFinite(m.damageAfterWeakness)?m.damageAfterWeakness:Number.isFinite(m.damage)?m.damage:200;return rem>0&&rem<=d?330:210}if(/^Motivate$/i.test(a))return discardHas(o.ownPublic,PRINT.dark)&&slots(o.ownPublic).some(r=>r.zone==='bench'&&matches(r.pokemon.printing,PRINT.mega)&&energyCount(r.pokemon)<3)?230:0;if(/^Call for Family$/i.test(a))return deckCount(o)>0&&benchCount(o.ownPublic)<5&&(count(o.ownPublic,PRINT.oranguru)<1||count(o.ownPublic,PRINT.mega)<2)?205:0;if(/^Tapu Cure-GX$/i.test(a)){const used=o.ownPublic?.publicTurnRestrictions?.gxUsed===true||o.ownTurnResources?.gxUsed===true,damaged=slots(o.ownPublic).filter(r=>r.zone==='bench'&&(r.pokemon.damage??0)>0).length;return !used&&damaged>=2?160:0}if(/^Super Poison Breath$/i.test(a))return 40;if(/^Psychic$/i.test(a)){const d=Number.isFinite(m.damageAfterWeakness)?m.damageAfterWeakness:Number.isFinite(m.damage)?m.damage:30;return d>=150?(rem>0&&rem<=d?260:160):45}if(/^Energy Drive$/i.test(a))return Number.isFinite(m.damage)&&m.damage>=160?170:65;if(/^Eon Blade$/i.test(a)){const d=Number.isFinite(m.damageAfterWeakness)?m.damageAfterWeakness:200;return rem>0&&rem<=d?210:90}if(/^Venomous Fang$/i.test(a))return 75;if(/^Offensive Bomb$/i.test(a))return 45;return 0}
function supporterScore(c,o){if(matches(c,PRINT.guzma)){const best=slots(o.opponentPublic).filter(r=>r.zone==='bench').some(r=>prizeLiability(r.pokemon)>=2);return supporterAvailable(o)&&best?215:0}if(matches(c,PRINT.marnie))return supporterAvailable(o)&&opponentHandCount(o)>=4?175:0;if(matches(c,PRINT.carmine))return supporterAvailable(o)&&handCount(o)<=4&&safeToDiscardHand(o)?150:0;return 0}
function scoreAction(i,req){const o=req.observation,own=o.ownPublic,opp=o.opponentPublic,m=i.publicMetadata??{},c=i.actorPrinting??'',hand=list(o.ownHand);if(!EXECUTABLE.has(i.kind))return-1;if(i.kind==='pass')return 0;if(i.kind==='attack')return scoreAttack(i,o);if(i.kind==='use-ability'){const a=m.abilityName??'';if(/^Back Order$/i.test(a)&&matches(own.active?.printing??'',PRINT.oranguru)&&deckCount(o)>0)return 280;if(/^Star Alchemy$/i.test(a)&&!o.ownTurnResources?.vstarUsed&&!own.publicTurnRestrictions?.vstarUsed&&deckCount(o)>0)return hasTrubbish(o)&&!hasGarbodor(o)?250:205;if(/^Dark Asset$/i.test(a)&&hand.length<6&&deckCount(o)>0)return 180;if(/^Squawk and Seize$/i.test(a)&&o.globalTurn<=2&&hand.length<=2&&safeToDiscardHand(o))return 220;return 0}if(i.kind==='use-stadium'){const s=c||m.stadiumPrinting||'';if(matches(s,PRINT.temple)){const special=slots(opp).some(r=>r.pokemon.energies.some(e=>/Special Energy|Double Dragon|Jet Energy/i.test(textOf(e))));return special?120:(list(opp.stadium).length>0?75:0)}return 0}if(i.kind==='retreat'){const t=i.targetPrinting??'',r=slots(own).find(v=>v.pokemon.printing===t);if(matches(t,PRINT.mega)){const e=r?energyCount(r.pokemon):0,activeDamage=opp.active?.damage??0;return e>=3||(e>=2&&activeDamage===300)?220:0;}if(matches(t,PRINT.garbodor))return 65;return 0}if(i.kind!=='play-card')return 0;if(matches(c,PRINT.trubbish))return count(own,PRINT.trubbish)<2?205:25;if(matches(c,PRINT.garbodor))return hasTrubbish(o)&&!hasGarbodor(o)?235:70;if(matches(c,PRINT.mega))return count(own,PRINT.mega)<2?180:40;if(matches(c,PRINT.oranguru))return count(own,PRINT.oranguru)<1?195:40;if(matches(c,PRINT.latias))return !hasLatias(o)?115:25;if(matches(c,PRINT.tapu))return supporterAvailable(o)?130:55;if(matches(c,PRINT.crobat))return hand.length<=4?115:40;if(matches(c,PRINT.squawk))return o.globalTurn<=2&&hand.length<=2?95:15;if(matches(c,PRINT.vip))return o.globalTurn<=2&&benchCount(own)<5?245:0;if(matches(c,PRINT.quick))return count(own,PRINT.trubbish)<2||count(own,PRINT.oranguru)===0||count(own,PRINT.mega)<2?185:60;if(matches(c,PRINT.letter))return hand.filter(v=>matches(v,PRINT.dark)).length<2?130:35;if(matches(c,PRINT.darkPatch))return discardHas(own,PRINT.dark)&&slots(own).some(r=>r.zone==='bench'&&matches(r.pokemon.printing,PRINT.mega)&&energyCount(r.pokemon)<3)?205:0;if(matches(c,PRINT.boost)){const t=slots(own).some(r=>matches(r.pokemon.printing,PRINT.trubbish)&&r.pokemon.lastPlayedOrEvolvedTurn<=o.globalTurn);return t&&!hasGarbodor(o)?165:0}if([PRINT.guzma,PRINT.marnie,PRINT.carmine].some(p=>matches(c,p)))return supporterScore(c,o);if(matches(c,PRINT.dark)){const r=slots(own).find(v=>v.pokemon.printing===i.targetPrinting);return r&&matches(r.pokemon.printing,PRINT.mega)&&energyCount(r.pokemon)<3?190:35}if(matches(c,PRINT.float)){const r=slots(own).find(v=>v.pokemon.printing===i.targetPrinting);if(!r||r.pokemon.tools.length>0)return 0;if(matches(r.pokemon.printing,PRINT.trubbish)&&!hasGarbodor(o))return 225;if(matches(r.pokemon.printing,PRINT.oranguru)&&!hasLatias(o))return 125;return 45}if(matches(c,PRINT.forest)){const r=slots(own).find(v=>v.pokemon.printing===i.targetPrinting);if(!r||r.pokemon.tools.length>0||o.ownTurnResources?.vstarUsed||own.publicTurnRestrictions?.vstarUsed)return 0;return/Oranguru V|Crobat V/i.test(r.pokemon.printing)?175:40}if(matches(c,PRINT.muscle)){const r=slots(own).find(v=>v.pokemon.printing===i.targetPrinting);return r&&matches(r.pokemon.printing,PRINT.mega)&&r.pokemon.tools.length===0?150:0}if(matches(c,PRINT.vs))return supporterAvailable(o)&&(discardHas(own,PRINT.guzma)||discardHas(own,PRINT.marnie)||discardHas(own,PRINT.carmine))?150:25;if(matches(c,PRINT.rod))return list(own.discard).length>=2&&(own.deckCount<=20||!hasMegaAbsol(o)||!hasGarbodor(o))?90:0;if(matches(c,PRINT.secret))return hand.filter(v=>discardScore({printing:v},o)>0).length>=3?115:0;if(matches(c,PRINT.escape))return benchCount(opp)>0?90:0;if(matches(c,PRINT.temple))return list(opp.stadium).length>0?85:20;return 0}
function multiSelect(p,choices,fn,reason){const m=p.publicMetadata??{},min=Number.isSafeInteger(m.minimumCount)?m.minimumCount:1,max=Number.isSafeInteger(m.maximumCount)?m.maximumCount:min,ranked=choices.map(choice=>({choice,score:fn(choice)})).filter(r=>r.score>0).sort((a,b)=>b.score-a.score),selected=ranked.slice(0,max).map(r=>r.choice);if(selected.length<min){if(min===0){const e=p.choices.find(c=>c.kind==='empty-selection');if(e)return{kind:'select-choice',token:e.token}}return{kind:'abstain',reasonCode:reason}}if(selected.length===0){const e=p.choices.find(c=>c.kind==='empty-selection');return e?{kind:'select-choice',token:e.token}:{kind:'abstain',reasonCode:reason}}return{kind:'select-choices',tokens:selected.map(c=>c.token)}}
function singleChoice(p,choices,fn,reason){const r=choices.map(choice=>({choice,score:fn(choice)})).sort((a,b)=>b.score-a.score);return!r.length||r[0].score<=0?{kind:'abstain',reasonCode:reason}:{kind:'select-choice',token:r[0].choice.token}}
function category(p){if([PRINT.quick,PRINT.letter,PRINT.darkPatch,PRINT.boost,PRINT.escape,PRINT.rod,PRINT.vs,PRINT.vip].some(x=>matches(p,x)))return'item';if([PRINT.float,PRINT.forest,PRINT.muscle].some(x=>matches(p,x)))return'tool';if([PRINT.guzma,PRINT.marnie,PRINT.carmine].some(x=>matches(p,x)))return'supporter';if([PRINT.shopping,PRINT.temple].some(x=>matches(p,x)))return'stadium';return null}
function secretBoxTargets(p,choices,o){if(!p.publicMetadata?.selectionType)return{kind:'abstain',reasonCode:'SECRET_BOX_MULTI_SELECT_UNSUPPORTED'};const best=new Map();for(const c of choices){if(owner(c)!=='actor'||zone(c)!=='deck')continue;const cat=category(textOf(c));if(!cat)continue;const s=cardSearchScore(c,o),old=best.get(cat);if(s>0&&(!old||s>old.score))best.set(cat,{choice:c,score:s})}const selected=['item','tool','supporter','stadium'].map(k=>best.get(k)?.choice).filter(Boolean),min=Number.isSafeInteger(p.publicMetadata.minimumCount)?p.publicMetadata.minimumCount:4,max=Number.isSafeInteger(p.publicMetadata.maximumCount)?p.publicMetadata.maximumCount:4;if(selected.length<min)return{kind:'abstain',reasonCode:'SECRET_BOX_CATEGORY_SET_INCOMPLETE'};return{kind:'select-choices',tokens:selected.slice(0,max).map(c=>c.token)}}
function promptDecision(req){const p=req.prompt,o=req.observation,cs=list(p?.choices),src=[p?.source?.sourcePrinting??'',p?.source?.effectName??'',p?.source?.copiedAttackName??'',p?.description??''].join(' ').toLowerCase();if(p.promptType==='ChooseCardsPrompt'){const hand=cs.filter(c=>owner(c)==='actor'&&zone(c)==='hand'),deck=cs.filter(c=>owner(c)==='actor'&&zone(c)==='deck'),discard=cs.filter(c=>owner(c)==='actor'&&zone(c)==='discard'),multi=Boolean(p.publicMetadata?.selectionType);if(/claw of darkness/.test(src))return singleChoice(p,cs.filter(c=>owner(c)==='opponent'&&zone(c)==='hand'),c=>opponentHandDiscardScore(c,o),'NO_REVEALED_OPPONENT_HAND_CARD');if(/call for family/.test(src))return multi?multiSelect(p,deck,c=>callFamilyScore(c,o),'NO_CALL_FOR_FAMILY_BASIC'):singleChoice(p,deck,c=>callFamilyScore(c,o),'NO_CALL_FOR_FAMILY_BASIC');if(/motivate/.test(src))return multi?multiSelect(p,discard,c=>matches(c,PRINT.dark)?180:0,'NO_MOTIVATE_ENERGY'):singleChoice(p,discard,c=>matches(c,PRINT.dark)?180:0,'NO_MOTIVATE_ENERGY');if(/quick ball/.test(src)&&hand.length)return multi?multiSelect(p,hand,c=>discardScore(c,o),'NO_SAFE_QUICK_BALL_DISCARD'):singleChoice(p,hand,c=>discardScore(c,o),'NO_SAFE_QUICK_BALL_DISCARD');if(/secret box/.test(src)&&hand.length)return multiSelect(p,hand,c=>discardScore(c,o),'SECRET_BOX_DISCARD_COST_UNAVAILABLE');if(/battle vip pass/.test(src))return multi?multiSelect(p,deck,c=>basicScore(c,o),'NO_VIP_PASS_BASICS'):singleChoice(p,deck,c=>basicScore(c,o),'NO_VIP_PASS_BASIC');if(/back order/.test(src))return multi?multiSelect(p,deck,c=>toolScore(c,o),'NO_BACK_ORDER_TOOLS'):singleChoice(p,deck,c=>toolScore(c,o),'NO_BACK_ORDER_TOOL');if(/professor.?s letter/.test(src))return multi?multiSelect(p,deck,c=>matches(c,PRINT.dark)?180:0,'NO_DARKNESS_ENERGY_IN_DECK'):singleChoice(p,deck,c=>matches(c,PRINT.dark)?160:0,'NO_DARKNESS_ENERGY_IN_DECK');if(/boost shake/.test(src))return singleChoice(p,deck,c=>matches(c,PRINT.garbodor)&&hasTrubbish(o)&&!hasGarbodor(o)?300:0,'NO_GARBODOR_EVOLUTION_TARGET');if(/star alchemy|forest seal stone/.test(src))return singleChoice(p,deck,c=>cardSearchScore(c,o),'NO_STAR_ALCHEMY_TARGET');if(/wonder tag/.test(src))return singleChoice(p,deck,c=>matches(c,PRINT.guzma)&&supporterAvailable(o)&&benchCount(o.opponentPublic)>0?260:matches(c,PRINT.marnie)&&opponentHandCount(o)>=4?210:matches(c,PRINT.carmine)&&handCount(o)<=4?170:0,'NO_WONDER_TAG_SUPPORTER');if(/vs seeker/.test(src))return singleChoice(p,discard,c=>matches(c,PRINT.guzma)&&supporterAvailable(o)&&benchCount(o.opponentPublic)>0?260:matches(c,PRINT.marnie)&&opponentHandCount(o)>=4?210:matches(c,PRINT.carmine)?160:0,'NO_VS_SEEKER_SUPPORTER');if(/super rod/.test(src))return multi?multiSelect(p,discard,c=>[PRINT.mega,PRINT.trubbish,PRINT.garbodor,PRINT.oranguru,PRINT.dark].some(x=>matches(c,x))?120:0,'NO_SUPER_ROD_RECOVERY_TARGETS'):singleChoice(p,discard,c=>[PRINT.mega,PRINT.trubbish,PRINT.garbodor,PRINT.oranguru,PRINT.dark].some(x=>matches(c,x))?120:0,'NO_SUPER_ROD_TARGET');if(/secret box/.test(src))return secretBoxTargets(p,deck,o);if(/quick ball/.test(src))return singleChoice(p,deck,c=>basicScore(c,o),'NO_QUICK_BALL_BASIC');if(/dark patch/.test(src))return singleChoice(p,cs,c=>owner(c)==='actor'&&zone(c)==='discard'&&matches(c,PRINT.dark)?180:0,'NO_DARKNESS_ENERGY_TO_ATTACH');return{kind:'abstain',reasonCode:'UNSUPPORTED_CARD_PROMPT'}}
if(p.promptType==='ChoosePokemonPrompt'){if(/motivate/.test(src))return singleChoice(p,cs.filter(c=>owner(c)==='actor'&&zone(c)==='bench'),c=>{const r=ownPokemon(c,o);return r&&matches(r.pokemon.printing,PRINT.mega)&&energyCount(r.pokemon)<3?250:0},'NO_MOTIVATE_TARGET');if(/guzma/.test(src)){const op=cs.filter(c=>owner(c)==='opponent');if(op.length)return singleChoice(p,op,c=>opponentTargetScore(c,o,220),'NO_GUZMA_TARGET');return singleChoice(p,cs.filter(c=>owner(c)==='actor'),c=>ownSwitchScore(c,o),'NO_GUZMA_SWITCH_TARGET')}if(/dark patch/.test(src))return singleChoice(p,cs.filter(c=>owner(c)==='actor'&&zone(c)==='bench'),c=>{const r=ownPokemon(c,o);return r&&matches(r.pokemon.printing,PRINT.mega)&&energyCount(r.pokemon)<3?220:0},'NO_DARK_PATCH_BENCH_TARGET');if(/float stone|forest seal stone|muscle band/.test(src))return singleChoice(p,cs.filter(c=>owner(c)==='actor'),c=>{const r=ownPokemon(c,o);if(!r||r.pokemon.tools.length>0)return 0;if(/float stone/.test(src)&&matches(r.pokemon.printing,PRINT.trubbish)&&!hasGarbodor(o))return 260;if(/forest seal stone/.test(src)&&/Oranguru V|Crobat V/i.test(r.pokemon.printing))return 240;if(/muscle band/.test(src)&&matches(r.pokemon.printing,PRINT.mega))return 220;return 0},'NO_TOOL_ATTACHMENT_TARGET');if(/escape rope/.test(src))return singleChoice(p,cs.filter(c=>owner(c)==='actor'),c=>ownSwitchScore(c,o),'NO_ESCAPE_ROPE_SWITCH_TARGET');return{kind:'abstain',reasonCode:'UNSUPPORTED_POKEMON_PROMPT'}}
if(['ConfirmPrompt','SelectPrompt','SelectOptionPrompt'].includes(p.promptType)){const yes=cs.find(c=>/^(yes|true|confirm)$/i.test(c.label??'')),no=cs.find(c=>/^(no|false|decline|cancel)$/i.test(c.label??'')),accept=(/dark asset/.test(src)&&handCount(o)<6&&deckCount(o)>0)||(/squawk and seize/.test(src)&&o.globalTurn<=2&&handCount(o)<=2&&safeToDiscardHand(o));if(accept&&yes)return{kind:'select-choice',token:yes.token};if(no)return{kind:'select-choice',token:no.token};return{kind:'abstain',reasonCode:'UNSUPPORTED_OPTIONAL_PROMPT'}}
return{kind:'abstain',reasonCode:'UNSUPPORTED_PROMPT_TYPE'}}
function bestAction(req){const items=list(req.actionFrontier?.items).filter(i=>EXECUTABLE.has(i.kind));if(!items.length)return{kind:'abstain',reasonCode:'NO_EXECUTABLE_ACTION'};let best=null,score=0;for(const i of items){const s=scoreAction(i,req);if(s>score){best=i;score=s}}if(best)return{kind:'select-action',token:best.token};const pass=items.find(i=>i.kind==='pass');return pass?{kind:'select-action',token:pass.token}:{kind:'abstain',reasonCode:'NO_SUPPORTED_ACTION'}}

/* v2: use public slots, not optional synthetic attack metadata. */
function darkCount(p){return list(p?.energies).filter(e=>matches(e,PRINT.dark)).length}
function toolLive(o){return ![o.ownPublic,o.opponentPublic].some(p=>p?.publicTurnRestrictions?.stadiumAndToolHaveNoEffectTurnsRemaining>0)&&![...list(o.ownPublic?.stadium),...list(o.opponentPublic?.stadium)].some(s=>/Jamming Tower/i.test(textOf(s)))}
function knownTarget(p){return /^(Shadow Rider Calyrex V(?:MAX)? CRE (?:74|75)|Trevenant & Dusknoir-GX (?:SMP|SM-P) 217|Latias ex SSP 76|Marshadow UNB 81|Tapu Lele-GX GRI 60|Radiant Eternatus CRZ 105|Dialga-GX UPR 100|Lillie's Clefairy ex JTG 56|Girafarig LOT 94|Mimikyu GRI 58)\b/i.test(p?.printing??'')}
function cleanStrike(a,t,o){
 if(!a||!t||!knownTarget(t)||remainingHp(t)<=0||!Array.isArray(a.specialConditions)||a.specialConditions.length)return false;
 if(!list(a.energies).every(e=>matches(e,PRINT.dark)))return false;
 if(t.publicDamageEffects!=null||a.publicDamageEffects!=null)return false;
 if(list(t.tools).some(x=>!matches(x,PRINT.float)&&!matches(x,PRINT.forest)&&!matches(x,PRINT.stealthyHood)))return false;
 if(o.ownPublic?.publicTurnRestrictions?.attackLockTurnsRemaining>0)return false;
 if(list(t.energies).some(e=>!matches(e,PRINT.psychicEnergy)))return false;
 if([o.ownPublic,o.opponentPublic].some(p=>list(p?.bench).filter(Boolean).some(x=>p===o.opponentPublic&&!knownTarget(x))))return false;
 return true;
}
function strike(a,t,o,name){
 if(!matches(a?.printing,PRINT.mega)||!cleanStrike(a,t,o))return 0;
 const ar=a.publicRestrictions??{},pr=o.ownPublic?.publicTurnRestrictions??{};
 if(ar.cannotAttackNextTurn||ar.attackCostIncreaseNextTurn>0||ar.attackCostIncreaseWhileActive>0||pr.attackMaxEnergy!=null)return 0;
 const legalName=x=>!list(ar.cannotUseAttacksNextTurn).includes(x)&&ar.blockedAttackNameNextTurn!==x&&ar.blockedAttackNameUntilLeavesActive!==x&&(!ar.onlyAllowedAttackNameNextTurn||ar.onlyAllowedAttackNameNextTurn===x);
 const n=darkCount(a);if(n>=2&&legalName('Terminal Period')&&t.damage===60&&(!name||name==='Terminal Period'))return remainingHp(t);
 if(n<3||!legalName('Claw of Darkness')||(name&&name!=='Claw of Darkness'))return 0;
 if(!Array.isArray(t.printed?.weakness)||!Array.isArray(t.printed?.resistance))return 0;
 const weak=t.printed.weakness.find(x=>/^(DARKNESS|DARK)$/i.test(x?.type??x?.energyType??'')), resist=t.printed.resistance.find(x=>/^(DARKNESS|DARK)$/i.test(x?.type??x?.energyType??''));
 const mult=weak?2:1;
 const penalty=resist?Math.abs(Number(resist.value??30)):0;
 if(!Number.isFinite(penalty))return 0;
 return Math.max(0,200*mult-penalty);
}
function ko(a,t,o,name){return remainingHp(t)>0&&strike(a,t,o,name)>=remainingHp(t)}
function gustValue(t,o){if(!t)return 0;return slots(o.ownPublic).some(r=>r.zone==='bench'&&ko(r.pokemon,t,o))?500+prizeLiability(t)*100+energyCount(t)*10:0}
function targetRow(i,o){const m=i.publicMetadata??{},z=m.targetZone??m.zone;const idx=m.targetIndex??m.benchIndex;if(m.targetSeat&&m.targetSeat!=='actor')return null;if(z==='active'){const a=o.ownPublic?.active;return a&&(!i.targetPrinting||a.printing===i.targetPrinting)?{zone:'active',index:0,pokemon:a}:null}if(z==='bench'&&Number.isSafeInteger(idx)){const a=o.ownPublic?.bench?.[idx];return a&&(!i.targetPrinting||a.printing===i.targetPrinting)?{zone:'bench',index:idx,pokemon:a}:null}const f=slots(o.ownPublic).filter(r=>r.pokemon.printing===i.targetPrinting);return f.length===1?f[0]:null}
function benchedMegaNeed(o){return slots(o.ownPublic).some(r=>r.zone==='bench'&&matches(r.pokemon.printing,PRINT.mega)&&darkCount(r.pokemon)<3)}
function paymentV2(c,o){if(matches(c,PRINT.dark)&&benchedMegaNeed(o)&&list(o.ownHand).some(x=>matches(x,PRINT.darkPatch))&&(o.ownTurnResources?.energyPlayedTurn===true||list(o.ownHand).filter(x=>matches(x,PRINT.dark)).length>=2))return 100;return discardScore(c,o)}
function withoutPlayed(hand,i){const h=hand.slice(),j=Number.isSafeInteger(i.publicMetadata?.handIndex)?i.publicMetadata.handIndex:h.findIndex(x=>textOf(x)===i.actorPrinting);if(j>=0&&j<h.length&&textOf(h[j])===i.actorPrinting)h.splice(j,1);return h}
function usefulTool(i,o){const r=targetRow(i,o);if(!r||list(r.pokemon.tools).length)return 0;const p=r.pokemon, lock=matches(p.printing,PRINT.garbodor)||matches(p.printing,PRINT.trubbish)&&!hasGarbodor(o);
 if(matches(i.actorPrinting,PRINT.float))return lock?360:matches(p.printing,PRINT.oranguru)&&r.zone==='active'?180:0;
 if(matches(i.actorPrinting,PRINT.forest)){const v=matches(p.printing,PRINT.oranguru)||matches(p.printing,PRINT.crobat);return v&&!o.ownTurnResources?.vstarUsed&&!o.ownPublic?.publicTurnRestrictions?.vstarUsed?285:lock&&!list(o.ownHand).some(x=>matches(x,PRINT.float))?260:0}
 if(matches(i.actorPrinting,PRINT.muscle))return matches(p.printing,PRINT.mega)?180:lock&&!list(o.ownHand).some(x=>matches(x,PRINT.float))?250:0;
 return 0;
}

/* Joint continuation values: a turn-ending action is a plan, not an isolated score. */
function held(o,p){return list(o.ownHand).filter(c=>matches(c,p)).length}
function lockHolder(o){return slots(o.ownPublic).filter(r=>matches(r.pokemon.printing,PRINT.garbodor)||(!hasGarbodor(o)&&matches(r.pokemon.printing,PRINT.trubbish)))}
function liveLock(o){return toolLive(o)&&lockHolder(o).some(r=>matches(r.pokemon.printing,PRINT.garbodor)&&list(r.pokemon.tools).length>0)}
function lockToolNeed(o){return lockHolder(o).some(r=>list(r.pokemon.tools).length===0)}
function vstarSpent(o){return o.ownTurnResources?.vstarUsed===true||o.ownPublic?.publicTurnRestrictions?.vstarUsed===true}
function liveV(o){return slots(o.ownPublic).some(r=>matches(r.pokemon.printing,PRINT.oranguru)||matches(r.pokemon.printing,PRINT.crobat))}
function plannedBasic(c,o,directBench=false){
 if(owner(c)!=='actor'||zone(c)!=='deck')return 0;
 const p=textOf(c),own=o.ownPublic,b=benchCount(own),hasT=hasTrubbish(o)||hasGarbodor(o),hasM=hasMegaAbsol(o),active=own.active;
 if(matches(p,PRINT.trubbish))return !hasT?410:!hasGarbodor(o)&&count(own,PRINT.trubbish)===1&&b<3&&hasM?95:0;
 if(matches(p,PRINT.mega))return !hasM?400:count(own,PRINT.mega)<2&&b<3&&hasT?175:0;
 if(matches(p,PRINT.oranguru))return !liveV(o)&&!vstarSpent(o)&&b<3?240:0;
 if(matches(p,PRINT.latias))return !hasLatias(o)&&!liveLock(o)&&b<3&&!matches(active?.printing,PRINT.oranguru)&&!hasM?180:0;
 if(matches(p,PRINT.squawk))return o.globalTurn<=2&&!liveLock(o)&&handCount(o)<=3&&b<3&&count(own,PRINT.squawk)===0?100:0;
 if(directBench)return 0;
 if(matches(p,PRINT.crobat))return !liveLock(o)&&handCount(o)<=3&&b<4&&count(own,PRINT.crobat)===0?210:0;
 if(matches(p,PRINT.tapu))return !liveLock(o)&&supporterAvailable(o)&&b<4&&count(own,PRINT.tapu)===0?180:0;
 return 0;
}
function searchPlanScore(c,o){
 const p=textOf(c),own=o.ownPublic,hand=list(o.ownHand);
 if(owner(c)!=='actor'||zone(c)!=='deck')return 0;
 const ready=lockHolder(o).some(r=>matches(r.pokemon.printing,PRINT.trubbish)&&list(r.pokemon.tools).length>0);
 if(matches(p,PRINT.boost))return !hasGarbodor(o)&&hasTrubbish(o)&&ready&&!held(o,PRINT.boost)&&(!held(o,PRINT.garbodor)||o.globalTurn<=2)?500:0;
 if(matches(p,PRINT.garbodor))return !hasGarbodor(o)&&hasTrubbish(o)&&!held(o,PRINT.garbodor)&&o.globalTurn>2?425:0;
 if(matches(p,PRINT.vip))return o.globalTurn<=2&&benchCount(own)<5&&!held(o,PRINT.vip)&&(!hasTrubbish(o)||!hasMegaAbsol(o))?470:0;
 if(matches(p,PRINT.float))return lockToolNeed(o)&&!held(o,PRINT.float)?460:!liveLock(o)&&!held(o,PRINT.float)&&matches(own.active?.printing,PRINT.oranguru)&&!hasLatias(o)?175:0;
 if(matches(p,PRINT.forest))return !vstarSpent(o)&&!held(o,PRINT.forest)&&slots(own).some(r=>(matches(r.pokemon.printing,PRINT.oranguru)||matches(r.pokemon.printing,PRINT.crobat))&&list(r.pokemon.tools).length===0)?300:lockToolNeed(o)&&!held(o,PRINT.float)?200:0;
 if(matches(p,PRINT.muscle))return slots(own).some(r=>matches(r.pokemon.printing,PRINT.mega)&&list(r.pokemon.tools).length===0)&&!held(o,PRINT.muscle)?190:0;
 if(matches(p,PRINT.darkPatch))return benchedMegaNeed(o)&&discardHas(own,PRINT.dark)&&!held(o,PRINT.darkPatch)?360:0;
 if(matches(p,PRINT.dark))return o.ownTurnResources?.energyPlayedTurn!==true&&held(o,PRINT.dark)===0?350:0;
 if(matches(p,PRINT.letter))return held(o,PRINT.dark)===0&&!held(o,PRINT.letter)?340:0;
 if(matches(p,PRINT.quick))return (!hasTrubbish(o)||!hasMegaAbsol(o))&&!held(o,PRINT.quick)&&hand.some(x=>paymentV2(x,o)>0)?360:0;
 if(matches(p,PRINT.guzma))return !held(o,PRINT.guzma)&&supporterAvailable(o)?Math.max(0,...slots(o.opponentPublic).filter(r=>r.zone==='bench').map(r=>gustValueV2(r.pokemon,o))):0;
 if(matches(p,PRINT.marnie))return supporterAvailable(o)&&!held(o,PRINT.marnie)&&(handCount(o)<=3||opponentHandCount(o)>=4)?300:0;
 if(matches(p,PRINT.carmine))return supporterAvailable(o)&&!held(o,PRINT.carmine)&&handCount(o)<=3&&!ready?260:0;
 if(matches(p,PRINT.shopping))return !held(o,PRINT.shopping)&&!hasGarbodor(o)&&hasTrubbish(o)&&!list(own.stadium).some(x=>matches(x,PRINT.shopping))?80:0;
 if(matches(p,PRINT.temple))return list(o.opponentPublic?.stadium).length>0&&!held(o,PRINT.temple)?110:0;
 return plannedBasic(c,o,false)||cardSearchScore(c,o);
}
function orderedDistinct(p,choices,scorer,reason){
 const ranked=choices.map(c=>({c,s:scorer(c)})).filter(x=>x.s>0).sort((a,b)=>b.s-a.s);
 const bounds=p.publicMetadata??{},max=bounds.maximumCount??1,min=bounds.minimumCount??1,out=[],used=new Set();
 for(const {c} of ranked){if(out.length>=max)break;const name=textOf(c);if(used.has(name))continue;used.add(name);out.push(c.token)}
 if(out.length>=min&&out.length)return {kind:'select-choices',tokens:out};
 const e=choices.find(c=>c.kind==='empty-selection');if(min===0&&e)return {kind:'select-choice',token:e.token};
 return {kind:'abstain',reasonCode:reason};
}
function lockPlanReady(o){return hasTrubbish(o)&&!hasGarbodor(o)&&held(o,PRINT.boost)>0&&(lockHolder(o).some(r=>list(r.pokemon.tools).length>0)||held(o,PRINT.float)>0)}
function safeBeforeAttack(i,o){
 if(i.kind!=='play-card')return false;
 const c=i.actorPrinting??'';
 if(matches(c,PRINT.garbodor)&&!hasGarbodor(o)){const row=targetRow(i,o);return !!row&&matches(row.pokemon.printing,PRINT.trubbish)&&list(row.pokemon.tools).length>0}
 if([PRINT.float,PRINT.forest,PRINT.muscle].some(p=>matches(c,p))){
  const row=targetRow(i,o);return !!row&&matches(row.pokemon.printing,PRINT.garbodor)&&list(row.pokemon.tools).length===0&&toolLive(o)
 }
 if(matches(c,PRINT.dark)){const row=targetRow(i,o);return !!row&&row.zone==='bench'&&matches(row.pokemon.printing,PRINT.mega)&&darkCount(row.pokemon)<3}
 return false;
}
function shoppingDonor(r,o){if(!r||!list(r.pokemon.tools).length)return 0;const tool=r.pokemon.tools[0];
 if(matches(r.pokemon.printing,PRINT.garbodor)||matches(r.pokemon.printing,PRINT.trubbish))return 0;
 if(!lockToolNeed(o)||held(o,PRINT.float)||held(o,PRINT.forest)||held(o,PRINT.muscle))return 0;
 if(matches(tool,PRINT.forest)&&vstarSpent(o))return 240;
 if(matches(tool,PRINT.float)&&r.zone==='bench')return 160;
 return 0
}


/* Guzma has a mandatory own switch. A funded return through an existing
   legal-cost pivot is a separate plan from simply having a powered bench. */
function retreatPayment(p,o){
 if(!p||o.ownTurnResources?.retreatedTurn!==0||list(p.specialConditions).length)return null;
 const r=p.publicRestrictions??{};if(r.cannotRetreat||r.cannotRetreatNextTurn||r.cannotRetreatWhileActive)return null;
 if(!Array.isArray(p.printed?.retreatCost))return null;
 if(toolLive(o)&&list(p.tools).some(x=>matches(x,PRINT.float)))return 0;
 if(!list(p.energies).every(x=>matches(x,PRINT.dark)))return null;
 return p.printed.retreatCost.length<=darkCount(p)?p.printed.retreatCost.length:null
}
function gustSwitchValue(r,t,o){
 if(!r||r.zone!=='bench'||!t)return 0;
 if(ko(r.pokemon,t,o))return 300+darkCount(r.pokemon);
 const old=o.ownPublic?.active,cost=retreatPayment(r.pokemon,o);
 if(cost!==null&&ko(old,t,o))return 250-20*cost;
 return 0
}
function gustValueV2(t,o){
 if(!t)return 0;
 const value=Math.max(0,...slots(o.ownPublic).filter(r=>r.zone==='bench').map(r=>gustSwitchValue(r,t,o)));
 return value>0?500+prizeLiability(t)*100+energyCount(t)*10+value/100:0
}
/* Payment is evaluated as a set. Individual discard scores cannot tell
   whether the same hand has lost all attachable energy or the only lock tool. */
function jointPayment(candidates,o,n){
 if(n!==1&&n!==3)return null;
 if(candidates.length<n||candidates.length>80)return null;
 const names=candidates.map(textOf),hand=list(o.ownHand),counts=new Map();
 for(const x of hand){const k=textOf(x);counts.set(k,(counts.get(k)??0)+1)}
 const weight=c=>{const p=textOf(c),base=paymentV2(c,o);if(base>0)return base;
  const duplicates=counts.get(p)??0;
  if(duplicates>1){
   if(matches(p,PRINT.vip))return 50;
   if(matches(p,PRINT.garbodor)||matches(p,PRINT.trubbish)||matches(p,PRINT.mega)||matches(p,PRINT.oranguru))return 35;
   if(matches(p,PRINT.float)||matches(p,PRINT.forest)||matches(p,PRINT.boost)||matches(p,PRINT.quick)||matches(p,PRINT.darkPatch))return 40;
  }
  if(matches(p,PRINT.garbodor)&&hasGarbodor(o))return 45;
  if(matches(p,PRINT.trubbish)&&hasGarbodor(o))return 55;
  if(matches(p,PRINT.forest)&&vstarSpent(o)&&!lockToolNeed(o))return 65;
  if(matches(p,PRINT.muscle)&&!hasMegaAbsol(o)&&hasTrubbish(o)&&held(o,PRINT.float))return 20;
  if(matches(p,PRINT.shopping)&&!lockToolNeed(o))return 35;
  if(matches(p,PRINT.tapu)&&liveLock(o))return 45;
  if(matches(p,PRINT.crobat)&&liveLock(o))return 40;
  return 0
 };
 const values=candidates.map(weight),protectedGroups=[
  {match:PRINT.dark,needed:o.ownTurnResources?.energyPlayedTurn!==true},
  {match:PRINT.boost,needed:!hasGarbodor(o)&&hasTrubbish(o)&&o.globalTurn<=2},
  {match:PRINT.garbodor,needed:!hasGarbodor(o)&&o.globalTurn>2},
  {match:PRINT.trubbish,needed:!hasGarbodor(o)&&!hasTrubbish(o)},
  {match:PRINT.mega,needed:!hasMegaAbsol(o)},
  {match:PRINT.float,needed:lockToolNeed(o)&&!held(o,PRINT.forest)&&!held(o,PRINT.muscle)},
  {match:PRINT.quick,needed:!hasMegaAbsol(o)||!hasTrubbish(o)&&!hasGarbodor(o)}
 ].filter(x=>x.needed).map(x=>({match:x.match,count:hand.filter(c=>matches(c,x.match)).length})).filter(x=>x.count>0);
 let best=null,bestScore=-Infinity;
 function walk(start,picked,score){
  if(picked.length===n){
   if(protectedGroups.some(g=>picked.filter(i=>matches(names[i],g.match)).length>=g.count))return;
   // Dark Patch only converts a discard to attachment if a Patch survives.
   const patchUsed=hand.filter(x=>matches(x,PRINT.darkPatch)).length;
   if(picked.some(i=>matches(names[i],PRINT.dark)&&values[i]===100)&&picked.filter(i=>matches(names[i],PRINT.darkPatch)).length>=patchUsed)return;
   if(score>bestScore){bestScore=score;best=picked.slice()}return
  }
  for(let i=start;i<=candidates.length-(n-picked.length);i++)if(values[i]>0){picked.push(i);walk(i+1,picked,score+values[i]);picked.pop()}
 }
 walk(0,[],0);return best?best.map(i=>candidates[i]):null
}

function rootV2(i,req){
 const o=req.observation,p=o.ownPublic,t=o.opponentPublic?.active,c=i.actorPrinting??'',m=i.publicMetadata??{};
 if(i.kind==='attack'){
  if(m.attackCostPayable!==true)return 0;
  if(i.attackName==='Terminal Period')return ko(p.active,t,o,'Terminal Period')?900:0;
  if(i.attackName==='Claw of Darkness')return ko(p.active,t,o,'Claw of Darkness')?880:210;
  return scoreAttack(i,o);
 }
 if(i.kind==='retreat'){
  const r=targetRow(i,o);if(!r||r.zone!=='bench')return 0;
  if(ko(r.pokemon,t,o))return 810;
  return matches(r.pokemon.printing,PRINT.mega)&&darkCount(r.pokemon)>=3?220:0;
 }
 if(i.kind==='use-stadium'&&matches(c,PRINT.shopping))return toolLive(o)&&!o.ownTurnResources?.stadiumUsedTurn?Math.max(0,...slots(p).map(r=>shoppingDonor(r,o))):0;
 if(i.kind==='play-card'){
  if(matches(c,PRINT.shopping))return !list(p.stadium).some(x=>matches(x,PRINT.shopping))&&!list(o.opponentPublic?.stadium).some(x=>matches(x,PRINT.shopping))&&toolLive(o)&&slots(p).some(r=>shoppingDonor(r,o)>0)?155:0;
  if(matches(c,PRINT.vip))return o.globalTurn<=2&&benchCount(p)<5&&(!hasTrubbish(o)||!hasMegaAbsol(o)||!liveV(o))?245:0;
  if(matches(c,PRINT.marnie))return supporterAvailable(o)&&(handCount(o)<=3||opponentHandCount(o)>=4)&&!lockPlanReady(o)?175:0;
  if(matches(c,PRINT.carmine))return supporterAvailable(o)&&!lockPlanReady(o)&&handCount(o)<=3&&(safeToDiscardHand(o)||(!hasTrubbish(o)&&!hasMegaAbsol(o)&&handCount(o)<=2))?150:0;
  if([PRINT.float,PRINT.forest,PRINT.muscle].some(x=>matches(c,x)))return usefulTool(i,o);
  if(matches(c,PRINT.guzma))return supporterAvailable(o)?Math.max(0,...slots(o.opponentPublic).filter(r=>r.zone==='bench').map(r=>gustValueV2(r.pokemon,o))):0;
  if(matches(c,PRINT.boost)){
   if(hasGarbodor(o)||!toolLive(o))return 0;
   const ready=slots(p).some(r=>matches(r.pokemon.printing,PRINT.trubbish)&&list(r.pokemon.tools).length>0);
   return ready?165:0;
  }
  if(matches(c,PRINT.quick)||matches(c,PRINT.secret)){
   const h=withoutPlayed(list(o.ownHand),i),n=matches(c,PRINT.secret)?3:1;
   if(!jointPayment(h,{...o,ownHand:h},n))return 0;
   if(matches(c,PRINT.secret))return deckCount(o)>0&&(!hasGarbodor(o)||benchedMegaNeed(o)||handCount(o)<=5)?210:0;
   return benchCount(p)<5&&deckCount(o)>0&&(!hasTrubbish(o)&&!hasGarbodor(o)||!hasMegaAbsol(o)||!liveV(o)||handCount(o)<=3&&!liveLock(o))?185:0;
  }
  if(matches(c,PRINT.dark)){const r=targetRow(i,o);if(!r)return 0;return matches(r.pokemon.printing,PRINT.mega)&&darkCount(r.pokemon)<3?260:matches(r.pokemon.printing,PRINT.squawk)&&darkCount(r.pokemon)===0?180:matches(r.pokemon.printing,PRINT.trubbish)&&r.zone==='active'&&darkCount(r.pokemon)===0?125:0}
 }
 return scoreAction(i,req)
}
function bestActionV2(req){
 const o=req.observation,items=list(req.actionFrontier?.items).filter(i=>EXECUTABLE.has(i.kind));
 const direct=items.filter(i=>i.kind==='attack'&&i.publicMetadata?.attackCostPayable===true&&ko(o.ownPublic?.active,o.opponentPublic?.active,o,i.attackName));
 if(direct.length&&(prizeLiability(o.opponentPublic.active)>=o.ownPublic.prizeCount||benchCount(o.opponentPublic)===0)){
  const i=direct.find(i=>i.attackName==='Terminal Period')??direct[0];return {kind:'select-action',token:i.token}
 }
 const directPrize=direct.length?prizeLiability(o.opponentPublic.active):0;
 const gust=items.find(i=>i.kind==='play-card'&&matches(i.actorPrinting,PRINT.guzma)&&supporterAvailable(o));
 if(gust&&slots(o.opponentPublic).some(r=>r.zone==='bench'&&gustValueV2(r.pokemon,o)>0&&(prizeLiability(r.pokemon)>=o.ownPublic.prizeCount||prizeLiability(r.pokemon)>directPrize)))return {kind:'select-action',token:gust.token};
 if(direct.length){const useful=items.filter(i=>safeBeforeAttack(i,o)).sort((a,b)=>rootV2(b,req)-rootV2(a,req));if(useful.length&&rootV2(useful[0],req)>0)return{kind:'select-action',token:useful[0].token}}
 let b=null,s=0;for(const i of items){const n=rootV2(i,req);if(n>s){s=n;b=i}}return b?{kind:'select-action',token:b.token}:items.some(i=>i.kind==='pass')?{kind:'select-action',token:items.find(i=>i.kind==='pass').token}:{kind:'abstain',reasonCode:'NO_SUPPORTED_ACTION'}
}
function setupV2(p,o){
 const m=p.publicMetadata??{},cs=list(p.choices),min=m.minimumCount,max=m.maximumCount;
 if(m.sourceZone!=='hand'||m.ownerSeat!=='actor'||m.isOwnerVisible!==true||m.selectionType!=='card-combination'||![0,1].includes(min)||!Number.isSafeInteger(max)||max<min||max>6)return {kind:'abstain',reasonCode:'UNTRUSTED_SETUP'};
 const rows=cs.filter(c=>c.kind==='card'&&owner(c)==='actor'&&zone(c)==='hand'&&c.publicMetadata?.isOwnerVisible===true);
 const basic=c=>[PRINT.mega,PRINT.trubbish,PRINT.oranguru,PRINT.latias,PRINT.tapu,PRINT.crobat,PRINT.squawk].some(x=>matches(c,x));
 if(rows.some(c=>!basic(c)))return {kind:'abstain',reasonCode:'UNRECOGNIZED_SETUP_BASIC'};
 const rank=c=>matches(c,PRINT.oranguru)?100:matches(c,PRINT.squawk)?80:matches(c,PRINT.trubbish)?70:matches(c,PRINT.mega)?60:matches(c,PRINT.latias)?40:10;
 const ordered=rows.slice().sort((a,b)=>rank(b)-rank(a)),out=[],board=slots(o.ownPublic).map(r=>r.pokemon.printing);
 if(min===1){if(!ordered.length)return {kind:'abstain',reasonCode:'EMPTY_INITIAL_SETUP'};out.push(ordered.shift());board.push(textOf(out[0]))}
 else if(!o.ownPublic?.active)return {kind:'abstain',reasonCode:'NO_ACTIVE_FOR_BONUS'};
 const limit=Math.min(max-out.length,Math.max(0,3-benchCount(o.ownPublic)));
 let added=0;
 for(const k of [PRINT.trubbish,PRINT.mega,PRINT.latias]){if(added>=limit||board.some(x=>matches(x,k)))continue;const c=ordered.find(c=>matches(c,k)&&!out.includes(c));if(c){out.push(c);board.push(textOf(c));added++}}
 if(min===1&&added===0&&matches(out[0],PRINT.trubbish)&&limit>0){const c=ordered.find(c=>!out.includes(c));if(c)out.push(c)}
 if(!out.length){const e=cs.find(c=>c.kind==='empty-selection');return e?{kind:'select-choice',token:e.token}:{kind:'abstain',reasonCode:'NO_EMPTY_SETUP_CHOICE'}}
 return {kind:'select-choices',tokens:out.map(c=>c.token)}
}
function promptV2(req){
 const p=req.prompt,o=req.observation,cs=list(p.choices),src=[p.source?.sourcePrinting,p.source?.effectName,p.description].join(' ').toLowerCase();
 if(p.source?.sourceKind==='engine'&&o.phase===1&&p.source.sourcePrinting===null&&p.source.effectName===p.description){
  if(p.promptType==='ChooseCardsPrompt'&&/choose_starting_pokemons/.test(src))return setupV2(p,o);
  if(p.promptType==='ConfirmPrompt'&&/go_first/.test(src)){const y=cs.find(c=>/^yes$/i.test(c.label??''));if(y)return {kind:'select-choice',token:y.token}}
  if(p.promptType==='SelectPrompt'&&/want_to_draw_cards/.test(src))return singleChoice(p,cs,c=>{const n=Number(c.publicMetadata?.value??c.label);return Number.isSafeInteger(n)&&n>=0?n+1:0},'UNKNOWN_BONUS_CHOICE')
 }
 if(p.promptType==='ChooseCardsPrompt'&&/battle vip pass|call for family|back order/.test(src)){
  const score=/back order/.test(src)?c=>searchPlanScore(c,o):c=>plannedBasic(c,o,true);
  return orderedDistinct(p,cs.filter(c=>c.kind==='empty-selection'||(owner(c)==='actor'&&zone(c)==='deck')),score,'NO_SAFE_SEARCH_TARGET');
 }
 if(p.promptType==='ChooseCardsPrompt'&&/star alchemy|forest seal stone/.test(src))return multiSelect(p,cs.filter(c=>owner(c)==='actor'&&zone(c)==='deck'),c=>searchPlanScore(c,o),'NO_STAR_ALCHEMY_TARGET');
 if(p.promptType==='ChooseCardsPrompt'&&/quick ball/.test(src)&&!cs.some(c=>owner(c)==='actor'&&zone(c)==='hand'))return multiSelect(p,cs.filter(c=>owner(c)==='actor'&&zone(c)==='deck'),c=>plannedBasic(c,o,false),'NO_QUICK_BALL_BASIC');
 if(p.promptType==='ChooseCardsPrompt'&&/secret box/.test(src)&&!cs.some(c=>owner(c)==='actor'&&zone(c)==='hand')){
  const best=new Map();for(const c of cs){const cat=category(c),n=searchPlanScore(c,o);if(cat&&n>0&&(!best.has(cat)||best.get(cat).n<n))best.set(cat,{c,n})}
  return multiSelect(p,[...best.values()].map(x=>x.c),c=>searchPlanScore(c,o),'SECRET_BOX_CATEGORY_SET_INCOMPLETE');
 }
 if(p.promptType==='ChoosePokemonPrompt'&&/shopping center/.test(src))return singleChoice(p,cs.filter(c=>owner(c)==='actor'),c=>shoppingDonor(ownPokemon(c,o),o),'NO_TOOL_TARGET');
 if(p.promptType==='ChooseCardsPrompt'&&/quick ball|secret box/.test(src)&&cs.some(c=>owner(c)==='actor'&&zone(c)==='hand')){const choices=cs.filter(c=>owner(c)==='actor'&&zone(c)==='hand'),n=/secret box/.test(src)?3:1,chosen=jointPayment(choices,o,n);return chosen?{kind:'select-choices',tokens:chosen.map(c=>c.token)}:{kind:'abstain',reasonCode:'NO_SAFE_PAYMENT'}}
 if(p.promptType==='ChoosePokemonPrompt'&&/boost shake/.test(src))return singleChoice(p,cs.filter(c=>owner(c)==='actor'),c=>{const r=ownPokemon(c,o);return r&&matches(r.pokemon.printing,PRINT.trubbish)?100+100*Number(list(r.pokemon.tools).length>0)+Number(r.zone==='bench'):0},'NO_TRUBBISH_TARGET');
 if(p.promptType==='ChoosePokemonPrompt'&&/guzma/.test(src)){
  const op=cs.filter(c=>owner(c)==='opponent');if(op.length)return singleChoice(p,op,c=>gustValueV2(opponentPokemon(c,o)?.pokemon,o),'NO_FUNDED_GUST');
  return singleChoice(p,cs.filter(c=>owner(c)==='actor'),c=>{const r=ownPokemon(c,o);return gustSwitchValue(r,o.opponentPublic?.active,o)},'NO_FUNDED_SWITCH')
 }
 if(p.promptType==='ChoosePokemonPrompt'&&/float stone|forest seal stone|muscle band/.test(src))return singleChoice(p,cs.filter(c=>owner(c)==='actor'),c=>{const r=ownPokemon(c,o);return r?usefulTool({actorPrinting:p.source?.sourcePrinting,targetPrinting:r.pokemon.printing,publicMetadata:{targetZone:r.zone,targetIndex:r.index,targetSeat:'actor'}},o):0},'NO_TOOL_TARGET');
 if(p.promptType==='ConfirmPrompt'&&/wonder tag/.test(src)){const y=cs.find(c=>/^yes$/i.test(c.label??'')),n=cs.find(c=>/^no$/i.test(c.label??''));const c=supporterAvailable(o)&&deckCount(o)>0?y:n;if(c)return{kind:'select-choice',token:c.token}}
 return promptDecision(req)
}

function decisionV2(req){const d=promptV2(req),p=req.prompt;if(d.kind==='select-choice'&&['card-combination','pokemon','energy-payment','prize-slots','card-order'].includes(p.publicMetadata?.selectionType)){const c=list(p.choices).find(c=>c.token===d.token);if(c&&c.kind!=='cancel'&&c.kind!=='empty-selection')return {kind:'select-choices',tokens:[d.token]}}return d}
const KNOWN_ABSTENTION_CODES=new Set(["AMBIGUOUS_SIMPLE_PROMPT","ARVEN_ITEM_TOOL_PAIR_UNAVAILABLE","BAD_CARD_SELECTION_BOUNDS","BAD_GO_FIRST_CONFIRM_CHOICES","BAD_GO_FIRST_SETUP_PROMPT","BAD_MULLIGAN_DRAW_CHOICE_INDEX","BAD_MULLIGAN_DRAW_SETUP_PROMPT","BAD_POKEMON_SELECTION_BOUNDS","BAD_STARTING_POKEMON_EMPTY_CHOICE","BAD_STARTING_POKEMON_SETUP_PROMPT","CARD_ORDER_COUNT_MISMATCH","DECISION_KIND_MISMATCH","ENERGY_COST_EXCEEDS_VISIBLE_CHOICES","HIDDEN_PRIZE_IDENTITY","INCOMPLETE_MULLIGAN_DRAW_INDEXES","INCOMPLETE_MULLIGAN_DRAW_OPTIONS","INSUFFICIENT_STARTING_POKEMON_CHOICES","INVALID_GO_FIRST_CONFIRMATION","INVALID_MULLIGAN_DRAW_INDEX","INVALID_MULLIGAN_DRAW_OPTIONS","INVALID_STARTING_POKEMON_PROMPT","MISSING_ACTIVE_FOR_EXTRA_BENCH","MISSING_PUBLIC_BENCH_FOR_SETUP","MULLIGAN_DRAW_LABEL_INDEX_MISMATCH","NO_COPY_ATTACK_CHOICE","NO_EMPTY_BENCH_SELECTION","NO_EMPTY_PRIZE_CHOICE","NO_EXECUTABLE_ACTION","NO_LEGAL_CARD_SET","NO_LEGAL_PRIZE_SELECTION","NO_MULLIGAN_DRAW_OPTION","NO_POKEMON_SELECTION","NO_STARTING_POKEMON_CHOICE","NO_SUPPORTED_ACTION","NO_SUPPORTED_ATTACK_CHOICE","NO_SUPPORTED_CARD_ORDER","NO_SUPPORTED_CARD_SELECTION","NO_SUPPORTED_ENERGY_PAYMENT","NO_SUPPORTED_POKEMON_CHOICE","NO_SUPPORTED_PRIZE_SELECTION","NO_SUPPORTED_ROOT_ACTION","NO_USEFUL_CARD_CHOICE","NO_VISIBLE_ATTACK_CHOICE","NO_VISIBLE_ENERGY_CHOICE","NO_VISIBLE_POKEMON_TARGET","NO_VISIBLE_PRIZE_SLOT","NO_VISIBLE_STARTING_POKEMON","ROLE_SEAT_BINDING_MISMATCH","ROLE_SEAT_OBSERVATION_MISMATCH","UNCLASSIFIED_POKEMON_PROMPT","UNEXPECTED_MULLIGAN_DRAW_CHOICE","UNEXPECTED_STARTING_POKEMON_CHOICE","UNORDERED_STARTING_POKEMON_CHOICES","UNRECOGNIZED_GO_FIRST_CHOICES","UNRECOGNIZED_SIMPLE_PROMPT","UNSUPPORTED_ATTACK_CHOICE_SOURCE","UNSUPPORTED_CARD_COMBINATION_SOURCE","UNSUPPORTED_CARD_ORDER","UNSUPPORTED_CONFIRMATION_SOURCE","UNSUPPORTED_ENGINE_SETUP_PHASE","UNSUPPORTED_ENGINE_SETUP_PROMPT","UNSUPPORTED_POKEMON_PROMPT","UNSUPPORTED_PRIZE_SELECTION","UNSUPPORTED_PROMPT_TYPE","UNSUPPORTED_STARTING_POKEMON_CARDINALITY","UNTRUSTED_CARD_SELECTION","UNTRUSTED_ENERGY_SELECTION","UNTRUSTED_ENGINE_SETUP_PROMPT","UNTRUSTED_PROMPT","UNTRUSTED_PROMPT_SOURCE","UNTRUSTED_STARTING_POKEMON_CHOICE"]);
function normalizeDecision(d){return d.kind==='abstain'&&!KNOWN_ABSTENTION_CODES.has(d.reasonCode)?{kind:'abstain',reasonCode:'NO_SUPPORTED_CARD_SELECTION'}:d}
function createPolicy({role,seat,policyVersion,config}){if(role!=='opponent'||(seat!==0&&seat!==1)||policyVersion!==POLICY_VERSION||!config||Array.isArray(config)||Object.keys(config).length!==0)throw new Error('AGENT31_RANK11_POLICY_INIT_MISMATCH');return Object.freeze({decide(req){if(!req||req.role!=='opponent'||req.seat!==seat||req.observation?.actorSeat!==seat)return{kind:'abstain',reasonCode:'ROLE_SEAT_BINDING_MISMATCH'};return normalizeDecision(req.prompt!=null?decisionV2(req):bestActionV2(req))}})}
module.exports={POLICY_VERSION,SOURCE_RANK,SOURCE_LIST_BLOB_SHA1,SOURCE_ENTRY_JSON_SHA256,CANDIDATE_ENTRY_JSON_SHA256,ENGINE_PIN,WORKER_PROTOCOL_BLOB_SHA1,SOURCE_INVENTORY,createPolicy,scoreAction:rootV2,scoreAttack,promptDecision:decisionV2,bestAction:bestActionV2,strike,ko,basicScore,cardSearchScore,discardScore,opponentHandDiscardScore,callFamilyScore};
