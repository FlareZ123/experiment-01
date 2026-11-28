'use strict';
/*
 * Agent40 rank16 source-bound actor-only development worker.
 * Exact original Aichi source list: results/aichi-2026/full-decklists.json rank 16.
 * This is an intentionally narrow playable slice with explicit abstention;
 * no native-run, full-game competence, merge, or benchmark admission claim.
 */
const POLICY_VERSION='agent40-rank16-budew-garbotoxin-opponent-v0';
const SOURCE_RANK=16;
const SOURCE_LIST_BLOB_SHA1='ae773f6201d7aa69d31914dbfee66f3fba692200';
const ENGINE_PIN='a9905a76a6c4103ba4b6cb9a49e86bad795c5c05';
const SOURCE_INVENTORY=Object.freeze([["Mega Absol ex MEG 86",2],["Trubbish CRI 56",2],["Garbodor LTR 68",2],["Garbodor BKP 57",1],["Budew ASC 16",2],["Crobat V DAA 104",2],["Tapu Lele-GX GRI 60",1],["Dedenne-GX UNB 57",1],["Squawkabilly ex PAL 169",1],["Marnie SSH 169",2],["Lillie's Determination MEG 119",1],["Carmine TWM 145",1],["Guzma BUS 115",1],["Plumeria BUS 120",1],["Karen XYP 177",1],["Quick Ball FST 237",4],["Ultra Ball MEG 131",3],["Trainers' Mail ROS 92",3],["VS Seeker PHF 109",3],["Dark Patch ASR 139",3],["Battle Compressor PHF 92",3],["Battle VIP Pass FST 225",2],["Boost Shake EVS 142",2],["Secret Box TWM 163",1],["Float Stone BKT 137",4],["Muscle Band XY 121",1],["Forest Seal Stone SIT 156",1],["Temple of Sinnoh ASR 155",2],["Darkness Energy MEE 15",7]]);
const PRINT=Object.freeze({
 mega:/^Mega Absol ex MEG 86\b/i,
 trubbish:/^Trubbish CRI 56\b/i,
 garbodor:/^Garbodor (?:LTR 68|BKP 57)\b/i,
 budew:/^Budew ASC 16\b/i,
 crobat:/^Crobat V DAA 104\b/i,
 tapu:/^Tapu Lele-GX GRI 60\b/i,
 dedenne:/^Dedenne-GX UNB 57\b/i,
 squawk:/^Squawkabilly ex PAL 169\b/i,
 float:/^Float Stone BKT 137\b/i,
 muscle:/^Muscle Band XY 121\b/i,
 forest:/^Forest Seal Stone SIT 156\b/i,
 boost:/^Boost Shake EVS 142\b/i,
 dark:/^Darkness Energy MEE 15\b/i,
 patch:/^Dark Patch ASR 139\b/i,
 vip:/^Battle VIP Pass FST 225\b/i,
 quick:/^Quick Ball FST 237\b/i,
 ultra:/^Ultra Ball MEG 131\b/i,
 mail:/^Trainers' Mail ROS 92\b/i,
 compressor:/^Battle Compressor PHF 92\b/i,
 secret:/^Secret Box TWM 163\b/i,
 vs:/^VS Seeker PHF 109\b/i,
 marnie:/^Marnie SSH 169\b/i,
 lillie:/^Lillie's Determination MEG 119\b/i,
 carmine:/^Carmine TWM 145\b/i,
 guzma:/^Guzma BUS 115\b/i,
 plumeria:/^Plumeria BUS 120\b/i,
 karen:/^Karen XYP 177\b/i,
 temple:/^Temple of Sinnoh ASR 155\b/i,
 jamming:/^Jamming Tower TWM 153\b/i,
 dimensionValley:/^Dimension Valley\b/i,
 thunderMountain:/^Thunder Mountain\b/i
});
const ROOT_KINDS=new Set(['play-card','use-ability','attack','retreat','use-stadium','pass']);
const list=x=>Array.isArray(x)?x:[];
const name=x=>typeof x==='string'?x:(typeof x?.printing==='string'?x.printing:'');
const match=(x,rx)=>rx.test(name(x));
const slots=p=>[{zone:'active',index:0,pokemon:p?.active},...list(p?.bench).map((pokemon,index)=>({zone:'bench',index,pokemon}))].filter(x=>x.pokemon&&x.pokemon.concealed!==true);
const onBoard=(p,rx)=>slots(p).some(x=>match(x.pokemon.printing,rx));
const benchCount=p=>list(p?.bench).filter(Boolean).length;
const handCount=o=>list(o?.ownHand).length;
const deckCount=o=>Number.isSafeInteger(o?.ownPublic?.deckCount)?o.ownPublic.deckCount:0;
const owner=c=>c?.publicMetadata?.ownerSeat;
const zone=c=>c?.publicMetadata?.targetZone??c?.publicMetadata?.sourceZone??c?.publicMetadata?.zone;
const bounds=p=>({min:p?.publicMetadata?.minimumCount,max:p?.publicMetadata?.maximumCount,kind:p?.publicMetadata?.selectionType});
function ownTarget(action,o){
 const meta=action.publicMetadata||{};
 if(meta.targetSeat!=='actor') return null;
 const rows=slots(o.ownPublic);
 if(meta.targetZone==='active') return rows.find(x=>x.zone==='active')||null;
 if(meta.targetZone==='bench'&&Number.isSafeInteger(meta.targetIndex))return rows.find(x=>x.zone==='bench'&&x.index===meta.targetIndex)||null;
 if(meta.targetZone==='bench'&&Number.isSafeInteger(meta.benchIndex))return rows.find(x=>x.zone==='bench'&&x.index===meta.benchIndex)||null;
 return null;
}
function toolEnabled(o){
 const stadium=[...list(o?.ownPublic?.stadium),...list(o?.opponentPublic?.stadium)];
 if(stadium.some(x=>match(x,PRINT.jamming)))return false;
 const n=o?.ownPublic?.publicTurnRestrictions?.stadiumAndToolHaveNoEffectTurnsRemaining;
 return n===null||n===undefined||n===0;
}
function garbotoxinStatusForSide(o,player){
 if(!toolEnabled(o))return 'inactive';
 let unknown=false;
 for(const {pokemon:p} of slots(player)){
  if(!match(p.printing,PRINT.garbodor)||list(p.tools).length===0)continue;
  const suppression=list(p.abilitySuppressions).find(x=>x.abilityName==='Garbotoxin');
  if(suppression?.suppressed===false)return 'live';
  if(!suppression||suppression.suppressed===null||suppression.suppressed===undefined)unknown=true;
 }
 return unknown?'unknown':'inactive';
}
function garbotoxinStatus(o){return garbotoxinStatusForSide(o,o.ownPublic);}
function opponentGarbotoxinStatus(o){return garbotoxinStatusForSide(o,o.opponentPublic);}
function liveGarbotoxin(o){return garbotoxinStatus(o)==='live';}
function usableOwnAbilities(o){
 // Either equipped Garbodor shuts off Rule-Box draw / Star Alchemy.
 // Unknown opposing suppression must not be treated as safely inactive.
 return garbotoxinStatus(o)==='inactive'&&opponentGarbotoxinStatus(o)==='inactive';
}
function activeOpponentAbilityWorking(o,printing,abilityName){
 const p=o.opponentPublic?.active;
 if(!match(p?.printing,printing))return false;
 // Reuse the same Garbotoxin / Stealthy Hood / typed-suppression matrix as
 // Vileplume and Stoutland. In particular, Snorlax Block cannot forbid a
 // retreat when our equipped Garbodor visibly suppresses its Ability.
 return opponentLockAbilityLive(o,p,abilityName);
}
function opponentLockAbilityLive(o,pokemon,abilityName){
 const suppression=list(pokemon?.abilitySuppressions).find(x=>x.abilityName===abilityName);
 if(suppression?.suppressed===true)return false;
 if(suppression?.suppressed===false)return true;
 const hood=toolEnabled(o)&&list(pokemon?.tools).some(x=>
  /^Stealthy Hood UNB 186\b/i.test(name(x)));
 // Once our own equipped Garbotoxin is confirmed active it suppresses
 // the opponent's automatic lock except where Stealthy Hood protects it.
 return !((liveGarbotoxin(o)||opponentGarbotoxinStatus(o)==='live')&&!hood);
}
function opponentVileplumeItemLock(o){
 const explicit=o.ownPublic?.publicTurnRestrictions?.itemPlayLocked===true;
 if(explicit)return true;
 return slots(o.opponentPublic).some(x=>
  /^Vileplume AOR 3\b/i.test(name(x.pokemon.printing))&&
  opponentLockAbilityLive(o,x.pokemon,'Irritating Pollen'));
}
function opponentStoutlandSupporterLock(o){
 if(o.ownPublic?.publicTurnRestrictions?.supporterPlayLocked===true)return true;
 const p=o.opponentPublic?.active;
 return /^Stoutland BCR 122\b/i.test(name(p?.printing))&&
  opponentLockAbilityLive(o,p,'Sentinel');
}
function sourceItem(printing){
 return [PRINT.quick,PRINT.ultra,PRINT.mail,PRINT.compressor,PRINT.vs,
  PRINT.patch,PRINT.vip,PRINT.boost,PRINT.secret].some(x=>match(printing,x));
}
function drawSupporterScore(printing,o){
 const own=o.ownPublic,opp=o.opponentPublic;
 if(o.ownTurnResources?.supporterPlayedTurn!==0||
    own?.publicTurnRestrictions?.supporterPlayLocked===true||
    handCount(o)>3||opponentStoutlandSupporterLock(o))return 0;
 const oppHand=Number.isSafeInteger(opp?.handCount)?opp.handCount:null;
 const coreMissing=!onBoard(own,PRINT.mega)||!onBoard(own,PRINT.garbodor)||
   !onBoard(own,PRINT.budew);
 if(match(printing,PRINT.lillie)){
  if(own?.prizeCount===6&&coreMissing)return 360; // draw 8 rather than 6
  return handCount(o)<=2?280:230;
 }
 if(match(printing,PRINT.marnie)){
  if(oppHand!==null&&oppHand>=8)return 390;
  if(oppHand!==null&&oppHand>=6)return 315;
  return coreMissing?225:270;
 }
 if(match(printing,PRINT.carmine)){
  if(hasProtectedHand(o))return 0;
  return handCount(o)<=2?245:215;
 }
 return 0;
}
function sourceSupporter(printing){
 return [PRINT.marnie,PRINT.lillie,PRINT.carmine,PRINT.guzma,
  PRINT.plumeria,PRINT.karen].some(x=>match(printing,x));
}
function opponentSnorlaxBlock(o){
 return activeOpponentAbilityWorking(o,/^Snorlax PGO 55\b/i,'Block');
}
function benchSupportAbilityUsable(printing,o){
 if(!usableOwnAbilities(o))return false;
 if(activeOpponentAbilityWorking(o,/^Iron Thorns ex TWM 77\b/i,'Initialization'))return false;
 if(activeOpponentAbilityWorking(o,/^Wobbuffet PHF 36\b/i,'Bide Barricade')){
  return match(printing,PRINT.tapu); // Psychic Tapu Lele-GX escapes Bide Barricade
 }
 return true;
}
function forestSealLinePending(o){
 if(o.ownTurnResources?.vstarUsed||!benchSupportAbilityUsable('Crobat V DAA 104',o))return false;
 const crobat=slots(o.ownPublic).find(x=>match(x.pokemon.printing,PRINT.crobat)&&
  list(x.pokemon.tools).length===0);
 return Boolean(crobat)&&list(o.ownHand).some(c=>match(c,PRINT.forest));
}
function benchSupportOnceThisTurnAlreadyUsed(printing,o){
 if(!match(printing,PRINT.crobat)&&!match(printing,PRINT.dedenne)&&!match(printing,PRINT.squawk))return false;
 return slots(o.ownPublic).some(r=>name(r.pokemon.printing)===name(printing)&&
  r.pokemon.lastPlayedOrEvolvedTurn===o.globalTurn);
}
function benchSupportFits(o){
 const p=o.ownPublic;
 let required=0;
 if(!onBoard(p,PRINT.mega))required++;
 if(!onBoard(p,PRINT.trubbish)&&!onBoard(p,PRINT.garbodor))required++;
 if(!onBoard(p,PRINT.budew))required++;
 return 5-benchCount(p)>required;
}
function hasProtectedHand(o){
 const h=list(o.ownHand),p=o.ownPublic;
 if(h.some(c=>match(c,PRINT.secret)))return true;
 if(!onBoard(p,PRINT.mega)&&h.some(c=>match(c,PRINT.mega)))return true;
 if(onBoard(p,PRINT.trubbish)&&!onBoard(p,PRINT.garbodor)&&h.some(c=>match(c,PRINT.garbodor)))return true;
 if(onBoard(p,PRINT.garbodor)&&!liveGarbotoxin(o)&&h.some(c=>match(c,PRINT.float)))return true;
 if(h.some(c=>match(c,PRINT.forest))&&!o.ownTurnResources?.vstarUsed)return true;
 return false;
}
function canRiskFullHandDiscard(o){
 return handCount(o)<=3&&!hasProtectedHand(o)&&deckCount(o)>0;
}
function setupAbilityPending(items,o){
 if(!usableOwnAbilities(o))return false;
 const h=handCount(o),turn=o.globalTurn;
 return list(items).some(i=>i.kind==='use-ability'&&(
  (/^Dedechange$/i.test(i.publicMetadata?.abilityName||'')&&canRiskFullHandDiscard(o))||
  (/^Dark Asset$/i.test(i.publicMetadata?.abilityName||'')&&h<=4)||
  (/^Wonder Tag$/i.test(i.publicMetadata?.abilityName||'')&&o.ownTurnResources?.supporterPlayedTurn===0)||
  (/^Squawk and Seize$/i.test(i.publicMetadata?.abilityName||'')&&turn<=2&&canRiskFullHandDiscard(o))
 ));
}
function hasFundedAttack(items){
 return list(items).some(x=>x.kind==='attack'&&x.publicMetadata?.attackCostPayable===true);
}
function urgentBudewSearch(o){
 return !onBoard(o.ownPublic,PRINT.budew)&&o.globalTurn<=2&&readyToPivotIntoBudew(o);
}
function safeDiscardRows(rows,o,n){
 const eligible=rows.filter(c=>owner(c)==='actor'&&zone(c)==='hand');
 const darks=eligible.filter(c=>match(c,PRINT.dark)).length;
 const floats=eligible.filter(c=>match(c,PRINT.float)).length;
 const unfundedMega=slots(o.ownPublic).some(x=>match(x.pokemon.printing,PRINT.mega)&&
  list(x.pokemon.energies).length<3);
 const keepDark=!o.ownTurnResources?.energyPlayedTurn&&unfundedMega&&!urgentBudewSearch(o);
 const existingLockTool=slots(o.ownPublic).some(x=>
  (match(x.pokemon.printing,PRINT.trubbish)||match(x.pokemon.printing,PRINT.garbodor))&&
  list(x.pokemon.tools).some(y=>match(y,PRINT.float)));
 const keepFloat=!existingLockTool;
 const ranked=eligible.map(x=>({x,score:discardScore(x,o)})).filter(r=>r.score>0)
  .sort((a,b)=>b.score-a.score);
 const selected=[];
 let discardDark=0,discardFloat=0;
 for(const {x} of ranked){
  if(selected.length>=n)break;
  if(match(x,PRINT.dark)&&discardDark>=darks-(keepDark?1:0))continue;
  if(match(x,PRINT.float)&&discardFloat>=floats-(keepFloat?1:0))continue;
  selected.push(x);
  if(match(x,PRINT.dark))discardDark++;
  if(match(x,PRINT.float))discardFloat++;
 }
 return selected.length===n?selected:null;
}
function handCanPay(o,played,n){
 const copy=list(o.ownHand).slice();
 const i=copy.findIndex(x=>name(x)===name(played));
 if(i>=0)copy.splice(i,1);
 const rows=copy.map(x=>({kind:'card',printing:name(x),
  publicMetadata:{ownerSeat:'actor',sourceZone:'hand'}}));
 return safeDiscardRows(rows,o,n)!==null;
}
function sourceBasicChoices(rows,o,max){
 const mine=o.ownPublic;
 const selected=[],present=new Set();
 // VIP can place Budew directly when Float on the initial non-Budew
 // Active makes an immediate zero-Energy Item-lock attack reachable.
 // A fixed Trubbish+Mega ordering otherwise consumes both VIP slots.
 const urgency=readyToPivotIntoBudew(o)&&!onBoard(mine,PRINT.budew);
 const priority=urgency?
  [PRINT.budew,PRINT.trubbish,PRINT.mega,PRINT.crobat,PRINT.tapu,PRINT.dedenne,PRINT.squawk]:
  [PRINT.trubbish,PRINT.mega,PRINT.budew,PRINT.crobat,PRINT.tapu,PRINT.dedenne,PRINT.squawk];
 for(const printing of priority){
  if(selected.length>=max)break;
  if(slots(mine).some(x=>match(x.pokemon.printing,printing)))continue;
  const c=rows.find(c=>!selected.includes(c)&&match(c,printing));
  if(c){selected.push(c);present.add(printing)}
 }
 return selected;
}
function basicSearchDemand(o){
 const p=o.ownPublic;
 if(benchCount(p)>=5)return false;
 if(!onBoard(p,PRINT.mega)||!onBoard(p,PRINT.budew)||
    !onBoard(p,PRINT.trubbish)&&!onBoard(p,PRINT.garbodor))return true;
 if(benchSupportFits(o)&&handCount(o)<=3&&
    benchSupportAbilityUsable('Crobat V DAA 104',o))return true;
 return false;
}
function ultraSearchDemand(o){
 const p=o.ownPublic;
 if(onBoard(p,PRINT.trubbish)&&!onBoard(p,PRINT.garbodor))return true;
 if(basicSearchDemand(o))return true;
 return false;
}
function hasFundedDarkPatchRecipient(o){
 return slots(o.ownPublic).some(({zone,pokemon})=>
  zone==='bench'&&match(pokemon.printing,PRINT.mega)&&list(pokemon.energies).length<3);
}
function sourceCardCategory(value){
 if([PRINT.marnie,PRINT.lillie,PRINT.carmine,PRINT.guzma,PRINT.plumeria,PRINT.karen].some(x=>match(value,x)))return 'supporter';
 if(match(value,PRINT.temple))return 'stadium';
 if([PRINT.float,PRINT.muscle,PRINT.forest].some(x=>match(value,x)))return 'tool';
 if([PRINT.quick,PRINT.ultra,PRINT.mail,PRINT.vs,PRINT.patch,PRINT.compressor,PRINT.vip,PRINT.boost].some(x=>match(value,x)))return 'item';
 return null;
}
function regidragoPayloadCount(o){
 const board=slots(o.opponentPublic);
 const seen=board.some(x=>/^Regidrago (?:VSTAR|V)\b/i.test(name(x.pokemon.printing)));
 const payload=/^(?:Dialga-GX UPR 100|Dragapult ex TWM 130|Kyurem SFA 47|Noivern ex PAL 153|Hisuian Goodra VSTAR LOR 136|Mega Dragonite ex ASC 152|Koraidon ex TEF 120|Salamence ex JTG 114)\b/i;
 const n=list(o.opponentPublic?.discard).filter(x=>payload.test(name(x))).length;
 if(seen)return n;
 // In the authenticated Aichi source field, two discarded Dragon payload
 // printings distinguish a developing Regidrago line even before its first
 // Regidrago Basic reaches play. Do not ascribe the same signal to a board
 // showing an incompatible fully-developed opposing archetype.
 const rivalCore=/^(?:Shadow Rider Calyrex VMAX|Iron Thorns ex|Mega Absol ex|Mew VMAX|Vileplume AOR 3|Stoutland BCR 122|Raging Bolt ex|Lillie's Clefairy ex|Meloetta ex)\b/i;
 if(n>=2&&!board.some(x=>rivalCore.test(name(x.pokemon.printing))))return n;
 return 0;
}
function templeStrandsIronThorns(o){
 const active=o.opponentPublic?.active;
 if(!match(active?.printing,/^Iron Thorns ex\b/i))return false;
 const energies=list(active.energies);
 const basicLightning=energies.filter(e=>
  /^(?:Basic )?Lightning Energy\b/i.test(name(e))).length;
 const otherBasic=energies.filter(e=>
  /^(?:Basic )?(?:Grass|Fire|Water|Psychic|Fighting|Darkness|Metal) Energy\b/i.test(name(e))).length;
 const dce=energies.filter(e=>/^Double Colorless Energy\b/i.test(name(e))).length;
 const speed=energies.filter(e=>/^Speed Lightning Energy\b/i.test(name(e))).length;
 if(!dce&&!speed)return false;
 const otherSpecial=energies.length-basicLightning-otherBasic-dce-speed;
 const stadium=[...list(o.ownPublic?.stadium),...list(o.opponentPublic?.stadium)];
 const mountain=stadium.some(x=>match(x,PRINT.thunderMountain));
 const beforeTotal=basicLightning+otherBasic+2*dce+speed+otherSpecial;
 const beforeRequired=mountain?2:3;
 const beforeTypes=mountain||basicLightning+speed>=1;
 const afterTotal=energies.length; // all Special Energy provide one Colorless
 const afterTypes=basicLightning>=1;
 return beforeTypes&&beforeTotal>=beforeRequired&&
  (!afterTypes||afterTotal<3);
}
function templeStrandsApexDragon(o){
 const opponent=o.opponentPublic,active=opponent?.active;
 if(!match(active?.printing,/^Regidrago VSTAR SIT 136\b/i))return false;
 const energies=list(active.energies);
 if(!energies.some(e=>/^Double Dragon Energy\b/i.test(name(e))))return false;
 const grass=energies.filter(e=>/^(?:Basic )?Grass Energy\b/i.test(name(e))).length;
 const fire=energies.filter(e=>/^(?:Basic )?Fire Energy\b/i.test(name(e))).length;
 // Apex Dragon needs G G R; Temple removes all special effects and leaves Colorless.
 return grass<2||fire<1;
}
function plumeriaTargetScore(pokemon,zoneName){
 if(!pokemon)return 0;
 const energies=list(pokemon.energies),n=energies.length;
 if(n===0)return 0;
 const source=name(pokemon.printing);
 const dde=energies.some(e=>/^Double Dragon Energy\b/i.test(name(e)));
 const dce=energies.some(e=>/^Double Colorless Energy\b/i.test(name(e)));
 if(/^Regidrago VSTAR\b/i.test(source)&&dde)return zoneName==='active'?(n<=2?690:565):455;
 if(/^Iron Thorns ex\b/i.test(source)&&dce)return zoneName==='active'?(n<=2?650:515):435;
 if(zoneName==='active'&&n===1)return 510;
 if(zoneName==='active')return 390;
 return n===1?340:260;
}
function plumeriaDenialScore(o){
 return slots(o.opponentPublic).reduce((best,x)=>Math.max(best,
  plumeriaTargetScore(x.pokemon,x.zone)),0);
}
function battleCompressorKarenLineScore(o){
 if(o.ownTurnResources?.supporterPlayedTurn!==0||
    o.ownPublic?.publicTurnRestrictions?.supporterPlayLocked===true||
    !list(o.ownHand).some(c=>match(c,PRINT.vs))||
    list(o.ownHand).some(c=>match(c,PRINT.karen))||
    list(o.ownPublic?.discard).some(c=>match(c,PRINT.karen))||
    regidragoPayloadCount(o)<2)return 0;
 // Karen may be Prized: this is only a feasible *attempt*. Native deck
 // search will reveal offered cards; a missing Karen is not fabricated.
 return 690;
}
function vsSeekerDenialScore(o,items){
 if(o.ownTurnResources?.supporterPlayedTurn!==0||
    o.ownPublic?.publicTurnRestrictions?.supporterPlayLocked===true||
    o.ownTurnResources?.supporterPlayLocked===true)return 0;
 const discards=list(o.ownPublic?.discard);
 if(discards.some(x=>match(x,PRINT.karen))&&
    !list(o.ownHand).some(x=>match(x,PRINT.karen))){
  const karen=karenDenialScore(o,items);
  if(karen>=540)return Math.max(0,karen-10);
 }
 if(discards.some(x=>match(x,PRINT.plumeria))&&
    !list(o.ownHand).some(x=>match(x,PRINT.plumeria))){
  const remaining=list(o.ownHand).filter(x=>!match(x,PRINT.vs));
  const pay=remaining.map(x=>({kind:'card',printing:name(x),
   publicMetadata:{ownerSeat:'actor',sourceZone:'hand'}}));
  if(safeDiscardRows(pay,o,2))return Math.max(0,plumeriaDenialScore(o)-55);
 }
 return 0;
}
function karenOwnRecoveryScore(o){
 const own=o.ownPublic,discards=list(own?.discard),hand=list(o.ownHand);
 const critical=[
  {print:PRINT.mega,copies:2,score:685},
  {print:PRINT.trubbish,copies:2,score:640},
  {print:PRINT.budew,copies:2,score:540},
  {print:PRINT.garbodor,copies:3,score:575}
 ];
 let best=0;
 for(const target of critical){
  const physicallyDiscarded=discards.filter(c=>match(c,target.print)).length;
  if(physicallyDiscarded<target.copies)continue;
  if(onBoard(own,target.print)||hand.some(c=>match(c,target.print)))continue;
  best=Math.max(best,target.score);
 }
 return best;
}
function karenDenialScore(o,items){
 const n=regidragoPayloadCount(o);
 if(n===0)return karenOwnRecoveryScore(o);
 const canItemLock=list(items).some(x=>x.kind==='attack'&&x.attackName==='Itchy Pollen'&&x.publicMetadata?.attackCostPayable===true);
 const alreadyLocked=o.opponentPublic?.publicTurnRestrictions?.itemPlayLocked===true;
 const activeVstar=match(o.opponentPublic?.active?.printing,/^Regidrago VSTAR\b/i);
 if((canItemLock||alreadyLocked)&&n>=2)return liveGarbotoxin(o)?765:710;
 if((canItemLock||alreadyLocked)&&n===1)return 595;
 return Math.max(karenOwnRecoveryScore(o),activeVstar&&n>=2?445:(n>=2?325:155));
}
function supportChoiceScore(choice,o){
 if(owner(choice)!=='actor'||zone(choice)!=='discard')return 0;
 if(match(choice,PRINT.lillie))return handCount(o)<=3?210:110;
 if(match(choice,PRINT.marnie))return handCount(o)<=3?200:125;
 if(match(choice,PRINT.guzma))return benchCount(o.opponentPublic)>0?180:35;
 if(match(choice,PRINT.karen))return Math.max(karenOwnRecoveryScore(o)>=540?290:0,regidragoPayloadCount(o)>=2?260:
  regidragoPayloadCount(o)===1?170:20,
  list(o.ownPublic?.discard).some(x=>[PRINT.mega,PRINT.trubbish,PRINT.garbodor,PRINT.budew]
   .some(p=>match(x,p)))?160:20);
 if(match(choice,PRINT.carmine))return handCount(o)<=3&&!hasProtectedHand(o)?150:0;
 if(match(choice,PRINT.plumeria))return Math.min(245,Math.round(plumeriaDenialScore(o)/2));
 return 0;
}
function secretBoxSearch(prompt,cards,min,max,o){
 if(max<=1)return pickRows(prompt,cards,min,max,c=>cardScore(c,o));
 const groups=new Map();
 for(const c of cards){
  const category=sourceCardCategory(c);
  if(!category)continue;
  const n=cardScore(c,o);
  if(n<=0)continue;
  const old=groups.get(category);
  if(!old||n>old.score)groups.set(category,{choice:c,score:n});
 }
 const order=['item','tool','supporter','stadium'];
 const chosen=order.map(x=>groups.get(x)?.choice).filter(Boolean).slice(0,max);
 if(chosen.length<min)return{kind:'abstain',reasonCode:'NO_SUPPORTED_CARD_SELECTION'};
 return chosen.length?
  {kind:'select-choices',tokens:chosen.map(c=>c.token)}:
  pickRows(prompt,[],min,max,()=>0);
}
function activeMimikyuSafeguard(o){
 const p=o.opponentPublic?.active;
 if(!match(p?.printing,/^Mimikyu PAL 97\b/i))return false;
 // PAL97 Safeguard is an Ability, not immunity independent of Garbotoxin.
 // It fails under either side's live equipped Garbodor unless Stealthy Hood
 // protects Mimikyu. A typed suppressed flag takes precedence.
 return opponentLockAbilityLive(o,p,'Safeguard');
}
function projectedClawDamage(action,o){
 const meta=action.publicMetadata||{},active=o.ownPublic?.active,target=o.opponentPublic?.active;
 if(!active||!match(active.printing,PRINT.mega)||!target||
    meta.attackCostPayable!==true||meta.hasPrevention===true||
    meta.hasUnmodeledModifier===true)return null;
 if(activeMimikyuSafeguard(o))return 0;
 if(Number.isFinite(meta.damageAfterWeakness))return meta.damageAfterWeakness;
 let d=Number.isFinite(meta.damage)?meta.damage:200;
 if(!Number.isFinite(meta.damage)&&toolEnabled(o)&&
    list(active.tools).some(x=>match(x,PRINT.muscle)))d+=20;
 const weakness=list(target.printed?.weakness).find(x=>x.type==='Darkness');
 const multiplier=Number(String(weakness?.value||'').replace(/[^0-9.]/g,''))||1;
 if(multiplier>1&&multiplier<=4)d*=multiplier;
 const resistance=list(target.printed?.resistance).find(x=>x.type==='Darkness');
 const amount=Number(String(resistance?.value||'').replace(/[^0-9.]/g,''))||0;
 if(amount>0)d=Math.max(0,d-amount);
 return d;
}
function prizeYield(p){
 if(!p)return 1;
 const attrs=list(p.printed?.subtypes).join(' ').toLowerCase();
 const printing=name(p.printing),title=printing.replace(/ [A-Z0-9]{2,6} [A-Z0-9♢-]+$/,'');
 if(/\b(?:vmax|v-union|tag team)\b/i.test(attrs)||
    /\b(?:VMAX|V-UNION)\b/i.test(title)||
    /\b.*\s&\s.*GX\b/i.test(title)||
    /^Mega .+ ex\b/i.test(title))return 3;
 if(/\b(?:vstar|pokemon v|pokemon ex|pokemon gx|ex|gx)\b/i.test(attrs)||
    /\b(?:VSTAR|V|ex|GX|EX)\b/i.test(title))return 2;
 return 1;
}
function clawProjectedKnockoutScore(action,o){
 const damage=projectedClawDamage(action,o),target=o.opponentPublic?.active;
 const hp=target&&Number.isFinite(target.hp)&&Number.isFinite(target.damage)?target.hp-target.damage:null;
 if(activeMimikyuSafeguard(o))return 145; // Claw's hand discard may still resolve
 if(damage===null||hp===null||hp<=0||damage<hp)return 295;
 const liability=prizeYield(target);
 if(liability>=o.ownPublic?.prizeCount)return 965;
 return liability===3?905:(liability===2?845:770);
}
function attackingBenchedMega(o,minimumEnergy=3){
 return slots(o.ownPublic).filter(r=>r.zone==='bench'&&match(r.pokemon.printing,PRINT.mega)&&
  list(r.pokemon.energies).length>=minimumEnergy);
}
function terminalPeriodBenchTargetAvailable(o){
 return slots(o.opponentPublic).some(r=>r.zone==='bench'&&r.pokemon.damage===60);
}
function guzmaTargetScore(target,mega,o){
 const rem=Number.isFinite(target?.hp)&&Number.isFinite(target?.damage)?
  target.hp-target.damage:null;
 if(rem===null||rem<=0||!mega||!match(mega.printing,PRINT.mega))return 0;
 const liab=prizeYield(target);
 const fauxObservation={...o,ownPublic:{...o.ownPublic,active:mega},
  opponentPublic:{...o.opponentPublic,active:target}};
 if(target.damage===60&&list(mega.energies).length>=2){
  return liab>=o.ownPublic.prizeCount?985:940;
 }
 // Only Terminal Period is payable with two Basic Darkness. The opponent
 // cannot be Clawed without the third Energy attached to Mega Absol.
 if(list(mega.energies).length<3)return 0;
 const claw=clawProjectedKnockoutScore({
  publicMetadata:{attackCostPayable:true},attackName:'Claw of Darkness'
 },fauxObservation);
 if(claw>=770)return liab>=o.ownPublic.prizeCount?980:claw;
 // A gust does not count as a knockout. Only accept it as tactical repositioning
 // when the main attacker is ready and the target is meaningfully vulnerable.
 if(rem<=200)return 310+liab*38;
 const energy=list(target.energies).length;
 return energy>0?175+Math.min(energy,3)*20:85;
}
function canGuzmaLeadToFundedAttack(o){
 const terminal=terminalPeriodBenchTargetAvailable(o);
 const need=terminal?2:3;
 if(attackingBenchedMega(o,need).length>0)return true;
 // If current Mega is active, Guzma switches it to Bench. Re-entry requires
 // a legal retreat from an *already equipped* pivot and an unused retreat.
 const active=o.ownPublic?.active;
 if(!match(active?.printing,PRINT.mega)||list(active.energies).length<need||
    o.ownTurnResources?.retreatedTurn===o.globalTurn||!toolEnabled(o))return false;
 return slots(o.ownPublic).some(r=>r.zone==='bench'&&
  list(r.pokemon.tools).some(x=>match(x,PRINT.float)));
}
function guzmaRootScore(o){
 // Guzma's first switch must select an opposing Benched Pokémon. Without
 // one, the conditional own switch cannot occur even through Snorlax Block.
 if(benchCount(o.opponentPublic)===0)return 0;
 if(o.ownTurnResources?.supporterPlayedTurn!==0||o.ownPublic?.publicTurnRestrictions?.supporterPlayLocked===true||
    o.ownTurnResources?.supporterPlayLocked===true||!canGuzmaLeadToFundedAttack(o)&&!opponentSnorlaxBlock(o))return 0;
 const bestMega=attackingBenchedMega(o,terminalPeriodBenchTargetAvailable(o)?2:3)[0]?.pokemon??o.ownPublic?.active;
 if(opponentSnorlaxBlock(o)&&
  !match(o.ownPublic?.active?.printing,PRINT.budew)&&
  slots(o.ownPublic).some(x=>x.zone==='bench'&&match(x.pokemon.printing,PRINT.budew)))
  return 550;
 if(!bestMega||!match(bestMega.printing,PRINT.mega))return 0;
 return slots(o.opponentPublic).filter(r=>r.zone==='bench').reduce((score,r)=>
  Math.max(score,guzmaTargetScore(r.pokemon,bestMega,o)),0);
}
function score(action,req){
 const o=req.observation,own=o.ownPublic,opp=o.opponentPublic||{},p=name(action.actorPrinting),t=ownTarget(action,o),meta=action.publicMetadata||{};
 const items=req.actionFrontier?.items;
 const canTool=toolEnabled(o);
 if(!ROOT_KINDS.has(action.kind))return 0;
 if(action.kind==='pass')return 0;
 if(action.kind==='use-ability'){
  if(!usableOwnAbilities(o))return 0;
  const a=meta.abilityName||'';
  if(/^Dedechange$/i.test(a)&&canRiskFullHandDiscard(o))return 675;
  if(/^Dark Asset$/i.test(a)&&handCount(o)<=4&&deckCount(o)>0)return 660;
  if(/^Wonder Tag$/i.test(a)&&o.ownTurnResources?.supporterPlayedTurn===0&&deckCount(o)>0)return 610;
  if(/^Squawk and Seize$/i.test(a)&&o.globalTurn<=2&&canRiskFullHandDiscard(o))return 625;
  if(/^Star Alchemy$/i.test(a)&&!o.ownTurnResources?.vstarUsed&&deckCount(o)>0&&
     toolEnabled(o)&&benchSupportAbilityUsable('Crobat V DAA 104',o)&&
     slots(own).some(x=>match(x.pokemon.printing,PRINT.crobat)&&
      list(x.pokemon.tools).some(t=>match(t,PRINT.forest))))return 650;
  return 0;
 }
 if(action.kind==='attack'){
  if(meta.attackCostPayable!==true)return 0;
  const a=action.attackName||'';
  const target=opp.active;
  const hp=Number.isFinite(target?.hp)&&Number.isFinite(target?.damage)?target.hp-target.damage:null;
  const payable=meta.attackCostPayable===true;
  if(!payable)return 0;
  if(a==='Terminal Period'&&target?.damage===60)return 1000;
  if(a==='Claw of Darkness')return clawProjectedKnockoutScore(action,o);
  if(a==='Acid Spray'&&match(own.active?.printing,PRINT.trubbish)){
   const energies=list(opp.active?.energies);
   if(!energies.length)return 65;
   const hasDde=energies.some(x=>/^Double Dragon Energy\b/i.test(name(x)));
   const hasDce=energies.some(x=>/^Double Colorless Energy\b/i.test(name(x)));
   if(hasDde&&match(opp.active?.printing,/^Regidrago VSTAR\b/i))return 485;
   if(hasDce&&match(opp.active?.printing,/^Iron Thorns ex\b/i))return 480;
   return energies.length===1?350:245;
  }
  if(a==='Itchy Pollen'&&match(own.active?.printing,PRINT.budew)){
   return opp.publicTurnRestrictions?.itemPlayLocked===true?270:530;
  }
  return 0;
 }
 if(action.kind==='retreat'){
  if(opponentSnorlaxBlock(o))return 0;
  const target=name(action.targetPrinting);
  if(match(target,PRINT.budew)&&!match(own.active?.printing,PRINT.budew)){
   // Only a mobility preference; does not assert that Itchy Pollen will be funded.
   return o.globalTurn<=4?700:(liveGarbotoxin(o)&&!hasFundedAttack(items)?490:285);
  }
  if(match(target,PRINT.mega))return 330;
  return 0;
 }
 if(action.kind==='use-stadium')return 0;
 if(action.kind!=='play-card')return 0;
 if(opponentVileplumeItemLock(o)&&sourceItem(p))return 0;
 if(opponentStoutlandSupporterLock(o)&&sourceSupporter(p))return 0;
 if(match(p,PRINT.crobat)||match(p,PRINT.dedenne)||match(p,PRINT.tapu)||match(p,PRINT.squawk)){
  if(!benchSupportFits(o)||!benchSupportAbilityUsable(p,o)||
    benchSupportOnceThisTurnAlreadyUsed(p,o)||
    own.publicTurnRestrictions?.abilityPokemonPlayLocked===true)return 0;
  if(match(p,PRINT.crobat))return handCount(o)<=4&&deckCount(o)>0?710:0;
  if(match(p,PRINT.tapu))return o.ownTurnResources?.supporterPlayedTurn===0&&deckCount(o)>0?645:0;
  if(match(p,PRINT.dedenne))return canRiskFullHandDiscard(o)?705:0;
  if(match(p,PRINT.squawk))return o.globalTurn<=2&&canRiskFullHandDiscard(o)?655:0;
 }
 if(match(p,PRINT.garbodor)){
  if(!onBoard(own,PRINT.trubbish)||onBoard(own,PRINT.garbodor))return 0;
  const equipped=slots(own).some(x=>match(x.pokemon.printing,PRINT.trubbish)&&
    list(x.pokemon.tools).length>0);
  // Playing Garbodor on an already equipped Trubbish immediately switches
  // off our own on-board setup Abilities, unlike simply equipping Trubbish.
  if(equipped&&(setupAbilityPending(items,o)||forestSealLinePending(o)))return 140;
  return 620;
 }
 if(match(p,PRINT.trubbish))return benchCount(own)<5&&!onBoard(own,PRINT.trubbish)?555:20;
 if(match(p,PRINT.budew))return benchCount(own)<5&&!onBoard(own,PRINT.budew)?300:25;
 if(match(p,PRINT.mega))return benchCount(own)<5&&!onBoard(own,PRINT.mega)?300:15;
 if(match(p,PRINT.float)||match(p,PRINT.muscle)||match(p,PRINT.forest)){
  if(!t||list(t.pokemon.tools).length!==0)return 0;
  if(match(p,PRINT.forest)){
   return canTool&&match(t.pokemon.printing,PRINT.crobat)&&!o.ownTurnResources?.vstarUsed&&benchSupportAbilityUsable(p,o)?570:0;
  }
  if(match(p,PRINT.float)&&t.zone==='active'&&!opponentSnorlaxBlock(o)&&!match(t.pokemon.printing,PRINT.budew)&&
     o.globalTurn<=4&&canTool&&onBoard(own,PRINT.budew)&&
     o.ownTurnResources?.retreatedTurn!==o.globalTurn&&
     t.pokemon.publicRestrictions?.cannotRetreat!==true){
   const paid=items.some(a=>a.kind==='retreat'&&match(a.targetPrinting,PRINT.budew));
   const cost=Array.isArray(t.pokemon.printed?.retreatCost)?t.pokemon.printed.retreatCost.length:null;
   const missingPayment=cost!==null&&list(t.pokemon.energies).length<cost;
   if(!paid||missingPayment)return 740;
  }
  if(match(t.pokemon.printing,PRINT.garbodor)&&canTool&&!liveGarbotoxin(o)){
   return setupAbilityPending(items,o)?130:600;
  }
  if(match(t.pokemon.printing,PRINT.trubbish)&&canTool&&match(p,PRINT.float))return 240;
  if(match(t.pokemon.printing,PRINT.mega)&&match(p,PRINT.muscle)&&canTool)return 200;
  return 0;
 }
 if(match(p,PRINT.dark)&&t&&match(t.pokemon.printing,PRINT.mega))
  return list(t.pokemon.energies).length<3?425:30;
 if(match(p,PRINT.patch))return hasFundedDarkPatchRecipient(o)&&list(own.discard).some(x=>match(x,PRINT.dark))?430:0;
 if(match(p,PRINT.boost)){
  // Boost Shake explicitly ENDS THE TURN. Protect any funded Budew lock or
  // unspent Darkness attachment that will power up the next Mega turn.
  const ready=slots(own).some(x=>match(x.pokemon.printing,PRINT.trubbish)&&list(x.pokemon.tools).length>0);
  if(!ready||setupAbilityPending(items,o)||onBoard(own,PRINT.garbodor))return 0;
  if(items.some(i=>i.kind==='attack'&&i.publicMetadata?.attackCostPayable===true&&
     (i.attackName==='Itchy Pollen'||i.attackName==='Terminal Period')))return 0;
  const canAttach=own.publicTurnRestrictions?.energyPlayLocked!==true&&
     o.ownTurnResources?.energyPlayedTurn!==true&&
     list(o.ownHand).some(x=>match(x,PRINT.dark))&&
     slots(own).some(x=>match(x.pokemon.printing,PRINT.mega)&&
        list(x.pokemon.energies).length<3);
  if(canAttach)return 0;
  if(items.some(i=>i.kind==='attack'&&i.publicMetadata?.attackCostPayable===true&&
    i.attackName==='Claw of Darkness')){
   return 255;
  }
  return 350;
 }
 if(match(p,PRINT.vip))return o.globalTurn<=2&&benchCount(own)<=3?420:0;
 if(match(p,PRINT.mail))return deckCount(o)>0?255:0;
 if(match(p,PRINT.compressor))return deckCount(o)>0?Math.max(260,battleCompressorKarenLineScore(o)):0;
 if(match(p,PRINT.quick)||match(p,PRINT.ultra)){
  const n=match(p,PRINT.ultra)?2:1;
  const demand=n===2?ultraSearchDemand(o):basicSearchDemand(o);
  return demand&&handCanPay(o,p,n)&&deckCount(o)>0?275:0;
 }
 if(match(p,PRINT.secret))return handCanPay(o,p,3)&&deckCount(o)>0?300:0;
 if(match(p,PRINT.vs))return o.ownTurnResources?.supporterPlayedTurn===0&&list(own.discard).some(x=>/Marnie|Carmine|Guzma|Plumeria|Karen|Determination/i.test(name(x)))?Math.max(190,vsSeekerDenialScore(o,items)):0;
 if(match(p,PRINT.karen)&&o.ownTurnResources?.supporterPlayedTurn===0)return karenDenialScore(o,items);
 if(match(p,PRINT.plumeria)&&o.ownTurnResources?.supporterPlayedTurn===0&&handCanPay(o,p,2))
  return plumeriaDenialScore(o);
 if(match(p,PRINT.marnie)||match(p,PRINT.lillie)||match(p,PRINT.carmine))
  return drawSupporterScore(p,o);
 if(match(p,PRINT.guzma))return guzmaRootScore(o);
 if(match(p,PRINT.temple)){
  const opposingStadium=[...list(opp.stadium),...list(own.stadium)];
  const suppressedGarbodor=opposingStadium.some(x=>match(x,PRINT.jamming))&&
   slots(own).some(x=>match(x.pokemon.printing,PRINT.garbodor)&&
    list(x.pokemon.tools).length>0);
  if(suppressedGarbodor)return 810;
  if(templeStrandsApexDragon(o))return 670;
  if(templeStrandsIronThorns(o))return 665;
  if(opposingStadium.some(x=>match(x,PRINT.dimensionValley)))return 255;
  const special=slots(opp).some(({pokemon})=>list(pokemon.energies).some(x=>!/^(?:Basic )?(?:Grass|Fire|Water|Lightning|Psychic|Fighting|Darkness|Metal) Energy\b/i.test(name(x))));
  return special?245:0;
 }
 return 0;
}
function bestAction(req){
 const items=list(req.actionFrontier?.items).filter(i=>ROOT_KINDS.has(i.kind));
 if(!items.length)return {kind:'abstain',reasonCode:'NO_EXECUTABLE_ACTION'};
 const ranked=items.map(i=>({i,score:score(i,req)}));
 // Boost Shake itself ends the turn. Its 350-point local value must not
 // preempt an available safe Item/search, Tool, Stadium or needed Basic
 // placement that can be performed first without losing Boost Shake.
 // Avoid forcing full-hand-replacement Supporters such as Carmine/Marnie:
 // they would shuffle/discard the very Boost Shake being sequenced.
 const preBoost=ranked.some(x=>{
  if(x.i.kind!=='play-card'||x.score<200)return false;
  const p=x.i.actorPrinting;
  return !match(p,PRINT.boost)&&(sourceItem(p)||
   [PRINT.float,PRINT.muscle,PRINT.forest,PRINT.temple,
    PRINT.trubbish,PRINT.mega,PRINT.budew,PRINT.dark].some(rx=>match(p,rx)));
 });
 if(preBoost)for(const x of ranked)if(x.i.kind==='play-card'&&
  match(x.i.actorPrinting,PRINT.boost))x.score=0;
 // Every attack ends the current turn. Do not announce an ordinary attack
 // while another realistically useful, executable non-turn-ending setup
 // action is still offered. This is much stronger than local score sorting.
 const pendingSetup=ranked.some(x=>x.i.kind!=='attack'&&x.i.kind!=='pass'&&
   !(x.i.kind==='play-card'&&match(x.i.actorPrinting,PRINT.boost))&&
   x.score>=200);
 if(pendingSetup){
  for(const x of ranked)if(x.i.kind==='attack'&&x.score<965)x.score=0;
 }
 ranked.sort((a,b)=>b.score-a.score);
 if(ranked[0]?.score>0)return {kind:'select-action',token:ranked[0].i.token};
 const pass=items.find(i=>i.kind==='pass');
 return pass?{kind:'select-action',token:pass.token}:{kind:'abstain',reasonCode:'NO_SUPPORTED_ACTION'};
}
function pickRows(prompt,rows,min,max,rank){
 if(!Number.isSafeInteger(min)||!Number.isSafeInteger(max)||min<0||max<min)return {kind:'abstain',reasonCode:'BAD_CARD_SELECTION_BOUNDS'};
 const sorted=rows.map(x=>({x,n:rank(x)})).filter(r=>r.n>0).sort((a,b)=>b.n-a.n);
 const selected=sorted.slice(0,max).map(r=>r.x);
 if(selected.length<min)return {kind:'abstain',reasonCode:'NO_SUPPORTED_CARD_SELECTION'};
 if(!selected.length){
  const empty=list(prompt.choices).find(c=>c.kind==='empty-selection');
  return empty?{kind:'select-choice',token:empty.token}:{kind:'abstain',reasonCode:'NO_EMPTY_BENCH_SELECTION'};
 }
 return {kind:'select-choices',tokens:selected.map(c=>c.token)};
}
function readyToPivotIntoBudew(o){
 if(opponentSnorlaxBlock(o))return false;
 const active=o.ownPublic?.active;
 if(!active||match(active.printing,PRINT.budew)||o.globalTurn>4||
    o.ownTurnResources?.retreatedTurn===o.globalTurn||
    active.publicRestrictions?.cannotRetreat===true)return false;
 if(list(active.tools).some(x=>match(x,PRINT.float))&&toolEnabled(o))return true;
 if(list(active.tools).length>0)return false;
 return toolEnabled(o)&&list(o.ownHand).some(x=>match(x,PRINT.float));
}
function cardScore(c,o){
 if(owner(c)!=='actor')return 0;
 if(match(c,PRINT.trubbish))return onBoard(o.ownPublic,PRINT.trubbish)?5:120;
 if(match(c,PRINT.garbodor))return onBoard(o.ownPublic,PRINT.trubbish)?135:15;
 if(match(c,PRINT.mega))return onBoard(o.ownPublic,PRINT.mega)?10:105;
 if(match(c,PRINT.budew))return onBoard(o.ownPublic,PRINT.budew)?15:(readyToPivotIntoBudew(o)?200:100);
 if(match(c,PRINT.float))return onBoard(o.ownPublic,PRINT.garbodor)?100:45;
 if(match(c,PRINT.forest))return onBoard(o.ownPublic,PRINT.crobat)&&!o.ownTurnResources?.vstarUsed?145:25;
 if(match(c,PRINT.muscle))return onBoard(o.ownPublic,PRINT.mega)?80:20;
 if(match(c,PRINT.temple))return slots(o.opponentPublic).some(x=>list(x.pokemon.energies).some(e=>!/^(?:Basic )?(?:Grass|Fire|Water|Lightning|Psychic|Fighting|Darkness|Metal) Energy\b/i.test(name(e))))?95:25;
 if(match(c,PRINT.guzma))return benchCount(o.opponentPublic)>0?80:20;
 if(match(c,PRINT.karen))return list(o.ownPublic?.discard).some(x=>[PRINT.mega,PRINT.trubbish,PRINT.garbodor].some(p=>match(x,p)))?70:18;
 if(match(c,PRINT.ultra))return onBoard(o.ownPublic,PRINT.trubbish)&&!onBoard(o.ownPublic,PRINT.garbodor)?95:42;
 if(match(c,PRINT.dark))return onBoard(o.ownPublic,PRINT.mega)?70:40;
 if(match(c,PRINT.patch))return list(o.ownPublic?.discard).some(x=>match(x,PRINT.dark))?80:10;
 if(match(c,PRINT.boost))return onBoard(o.ownPublic,PRINT.trubbish)&&!onBoard(o.ownPublic,PRINT.garbodor)?90:5;
 if(match(c,PRINT.quick))return 58;
 if(match(c,PRINT.compressor))return 55;
 if(match(c,PRINT.crobat)||match(c,PRINT.dedenne)||match(c,PRINT.tapu))return handCount(o)<=3?70:20;
 if(match(c,PRINT.lillie)||match(c,PRINT.marnie))return handCount(o)<=3?65:20;
 return 0;
}
function opponentHandDiscardScore(c,o){
 if(c.kind!=='card'||owner(c)!=='opponent'||zone(c)!=='hand'||
   c.publicMetadata?.isOwnerVisible!==true)return 0;
 const p=name(c);
 if(/^Battle VIP Pass\b/i.test(p))return o.globalTurn>2?3:205;
 if(/^(?:Computer Search|Secret Box|Prime Catcher|Brilliant Blender|Dowsing Machine)\b/i.test(p))return 250;
 if(/^(?:Crobat V|Dedenne-GX|Tapu Lele-GX|Squawkabilly ex)\b/i.test(p))
  return garbotoxinStatus(o)==='live'?20:210;
 if(/^Regidrago VSTAR\b/i.test(p)&&onBoard(o.opponentPublic,/^Regidrago V\b/i))return 235;
 if(/^Vileplume\b/i.test(p)&&onBoard(o.opponentPublic,/^Oddish\b/i))return 235;
 if(/^Shadow Rider Calyrex VMAX\b/i.test(p)&&onBoard(o.opponentPublic,/^Shadow Rider Calyrex V\b/i))return 235;
 if(/^Forest Seal Stone\b/i.test(p)&&slots(o.opponentPublic).some(x=>/\bV\b/i.test(name(x.pokemon.printing))))return 220;
 if(/^(?:Double Dragon Energy|Double Colorless Energy|Double Turbo Energy)\b/i.test(p))return 205;
 if(/^(?:Guzma|Boss.s Orders|Counter Catcher|Serena)\b/i.test(p))return 190;
 if(/^(?:Arven|Crispin|Guzma & Hala|Steven.s Resolve)\b/i.test(p))return 185;
 if(/\bEnergy\b/i.test(p)&&onBoard(o.opponentPublic,/^Shadow Rider Calyrex\b/i))return 155;
 if(/^(?:Ultra Ball|Quick Ball|Battle Compressor|VS Seeker|Dark Patch)\b/i.test(p))return 145;
 if(/\bEnergy\b/i.test(p))return 110;
 if(/^(?:Marnie|Iono|Professor.s Research)\b/i.test(p))return 135;
 return 65;
}
function discardScore(c,o){
 if(owner(c)!=='actor'||zone(c)!=='hand')return 0;
 if(match(c,PRINT.vip))return o.globalTurn>2?200:0;
 if(match(c,PRINT.dark)&&list(o.ownPublic?.discard).filter(x=>match(x,PRINT.dark)).length<3)return 160;
 if(match(c,PRINT.float)){
  const held=list(o.ownHand).filter(x=>match(x,PRINT.float)).length;
  const alreadyAttached=slots(o.ownPublic).some(x=>
   (match(x.pokemon.printing,PRINT.trubbish)||match(x.pokemon.printing,PRINT.garbodor))&&
   list(x.pokemon.tools).some(y=>match(y,PRINT.float)));
  return alreadyAttached?95:(held>=2?65:0);
 }
 if(match(c,PRINT.garbodor)&&onBoard(o.ownPublic,PRINT.garbodor))return 75;
 if(match(c,PRINT.mega)&&onBoard(o.ownPublic,PRINT.mega))return 55;
 return 0;
}
function promptDecision(req){
 const p=req.prompt,o=req.observation,cs=list(p?.choices);
 const src=(name(p?.source?.sourcePrinting)+' '+(p?.source?.effectName||'')).toLowerCase();
 const bd=bounds(p);
 const isMulti=bd.kind==='card-combination'||bd.kind==='pokemon'||bd.kind==='energy-payment';
 if(p?.source?.sourceKind==='engine'&&o.phase===1&&p.source.sourcePrinting===null){
  if(p.promptType==='ChooseCardsPrompt'&&p.source.effectName==='CHOOSE_STARTING_POKEMONS'){
   if(bd.kind!=='card-combination'||bd.min>1||bd.max>6||bd.min<0||!o.ownPublic)return {kind:'abstain',reasonCode:'UNSUPPORTED_ENGINE_SETUP_PROMPT'};
   const candidates=cs.filter(c=>c.kind==='card'&&owner(c)==='actor'&&zone(c)==='hand'&&c.publicMetadata?.isOwnerVisible===true);
   const basic=[PRINT.budew,PRINT.mega,PRINT.trubbish,PRINT.crobat,PRINT.tapu,PRINT.dedenne,PRINT.squawk];
   if(candidates.some(c=>!basic.some(re=>match(c,re))))return {kind:'abstain',reasonCode:'UNSUPPORTED_ENGINE_SETUP_PROMPT'};
   const search=list(o.ownHand).some(x=>match(x,PRINT.quick)||match(x,PRINT.vip));
   const holdFloat=list(o.ownHand).some(x=>match(x,PRINT.float));
   const hasBudew=candidates.some(c=>match(c,PRINT.budew));
   const reserveActiveTrubbish=!hasBudew&&holdFloat&&search&&candidates.some(c=>match(c,PRINT.trubbish));
   // A Trubbish with Float can retreat into a fetched Budew; Float stays to enable Garbotoxin next turn.
   const preference=c=>match(c,PRINT.budew)?120:
    match(c,PRINT.trubbish)&&reserveActiveTrubbish?110:
    match(c,PRINT.mega)?75:match(c,PRINT.trubbish)?70:match(c,PRINT.squawk)?35:10;
   const selected=[];
   if(bd.min===1){
    const active=candidates.slice().sort((a,b)=>preference(b)-preference(a))[0];
    if(!active)return {kind:'abstain',reasonCode:'NO_STARTING_POKEMON_CHOICE'};
    selected.push(active);
   }else if(!o.ownPublic.active)return {kind:'abstain',reasonCode:'MISSING_ACTIVE_FOR_EXTRA_BENCH'};
   const used=slots(o.ownPublic).map(x=>x.pokemon.printing);
   const maxBench=Math.min(5-benchCount(o.ownPublic),3);
   const reserve=[PRINT.trubbish,PRINT.mega,PRINT.budew];
   for(const re of reserve){
    if(selected.length>=bd.max||selected.length-(bd.min===1?1:0)>=maxBench)break;
    if(used.some(x=>match(x,re))||selected.some(x=>match(x,re)))continue;
    const c=candidates.find(x=>!selected.includes(x)&&match(x,re));if(c)selected.push(c);
   }
   if(!selected.length){
    const empty=cs.find(c=>c.kind==='empty-selection');
    return empty?{kind:'select-choice',token:empty.token}:{kind:'abstain',reasonCode:'NO_EMPTY_BENCH_SELECTION'};
   }
   return {kind:'select-choices',tokens:selected.map(x=>x.token)};
  }
 }
 if(p.promptType==='ChooseCardsPrompt'){
  if(/claw of darkness/.test(src)){
   return pickRows(p,cs.filter(c=>owner(c)==='opponent'&&zone(c)==='hand'),bd.min,bd.max,
    c=>opponentHandDiscardScore(c,o));
  }
  const cards=cs.filter(c=>c.kind==='card'&&owner(c)==='actor');
  if(/quick ball|ultra ball|secret box/.test(src)&&cards.some(c=>zone(c)==='hand')){
   const n=/secret box/.test(src)?3:(/ultra ball/.test(src)?2:1);
   const chosen=safeDiscardRows(cards.filter(c=>zone(c)==='hand'),o,n);
   return chosen?{kind:'select-choices',tokens:chosen.map(c=>c.token)}:
    {kind:'abstain',reasonCode:'NO_SUPPORTED_CARD_SELECTION'};
  }
  if(/plumeria/.test(src)&&cards.some(c=>zone(c)==='hand')){
   const chosen=safeDiscardRows(cards.filter(c=>zone(c)==='hand'),o,2);
   return chosen?{kind:'select-choices',tokens:chosen.map(c=>c.token)}:
    {kind:'abstain',reasonCode:'NO_SUPPORTED_CARD_SELECTION'};
  }
  if(/dark patch/.test(src)){
   return pickRows(p,cards.filter(c=>zone(c)==='discard'),bd.min,bd.max,c=>match(c,PRINT.dark)?200:0);
  }
  if(/vs seeker/.test(src)){
   return pickRows(p,cards.filter(c=>zone(c)==='discard'),bd.min,bd.max,c=>supportChoiceScore(c,o));
  }
  if(/battle vip pass|quick ball|ultra ball|boost shake|star alchemy|trainers' mail|secret box/.test(src)){
   const pool=cards.filter(c=>zone(c)==='deck');
   if(/battle vip pass/.test(src)){
    const chosen=sourceBasicChoices(pool,o,bd.max);
    if(chosen.length>=bd.min)return{kind:'select-choices',tokens:chosen.map(c=>c.token)};
    return {kind:'abstain',reasonCode:'NO_SUPPORTED_CARD_SELECTION'};
   }
   if(/secret box/.test(src))return secretBoxSearch(p,pool,bd.min,bd.max,o);
   return pickRows(p,pool,bd.min,bd.max,c=>cardScore(c,o));
  }
  if(/battle compressor/.test(src)){
   const hasVS=list(o.ownHand).some(c=>match(c,PRINT.vs));
   const deny=regidragoPayloadCount(o)>=2&&hasVS&&
     !list(o.ownPublic?.discard).some(c=>match(c,PRINT.karen));
   const s=c=>deny&&match(c,PRINT.karen)?330:
    match(c,PRINT.dark)?100:match(c,PRINT.vip)&&o.globalTurn>2?90:0;
   return pickRows(p,cards.filter(c=>zone(c)==='deck'),bd.min,bd.max,s);
  }
 }
 if(p.promptType==='ChoosePokemonPrompt'){
  const rows=cs.filter(c=>c.kind==='pokemon'&&owner(c)==='actor');
  let rank=()=>0;
  if(/float stone|muscle band|forest seal stone/.test(src)){
   rank=c=>{
    const q=slots(o.ownPublic).find(x=>x.zone===zone(c)&&x.pokemon.printing===name(c)&&
      (zone(c)!=='bench'||x.index===(c.publicMetadata?.benchIndex??c.publicMetadata?.targetIndex)));
    if(!q||list(q.pokemon.tools).length!==0)return 0;
    if(/forest seal/.test(src))return toolEnabled(o)&&match(q.pokemon.printing,PRINT.crobat)?200:0;
    if(/float stone/.test(src)){
     if(!toolEnabled(o))return 0;
     // This native target prompt follows playing Float Stone: the Tool is
     // no longer in ownHand, so readyToPivotIntoBudew() cannot be used here.
     // Match the earlier root action's reachable pivot using only board state.
     const active=q.zone==='active';
     const cost=q.pokemon.printed?.retreatCost;
     const needsFloat=Array.isArray(cost)&&
      list(q.pokemon.energies).length<cost.length;
     const pivot=active&&!match(q.pokemon.printing,PRINT.budew)&&
      o.globalTurn<=4&&onBoard(o.ownPublic,PRINT.budew)&&
      o.ownTurnResources?.retreatedTurn!==o.globalTurn&&
      q.pokemon.publicRestrictions?.cannotRetreat!==true&&
      !opponentSnorlaxBlock(o)&&needsFloat;
     if(pivot)return match(q.pokemon.printing,PRINT.trubbish)?330:300;
     if(match(q.pokemon.printing,PRINT.garbodor))return 180;
     // An unevolved Trubbish may become a Garbotoxin user next turn.
     if(match(q.pokemon.printing,PRINT.trubbish))return 165;
     return 0;
    }
    if(match(q.pokemon.printing,PRINT.mega)&&/muscle band/.test(src)&&toolEnabled(o))return 80;
    return 0;
   };
  }else if(/boost shake/.test(src)){
   rank=c=>match(c,PRINT.trubbish)?150:0;
  }else if(/plumeria/.test(src)){
   const opponent=cs.filter(c=>c.kind==='pokemon'&&owner(c)==='opponent');
   return pickRows(p,opponent,bd.min,bd.max,c=>{
    const idx=c.publicMetadata?.benchIndex;
    const zoneName=zone(c);
    const target=slots(o.opponentPublic).find(x=>x.zone===zoneName&&
     (zoneName==='active'||x.index===idx)&&name(x.pokemon.printing)===name(c));
    return target?plumeriaTargetScore(target.pokemon,target.zone):0;
   });
  }else if(/dark patch/.test(src)){
   rank=c=>{
    if(zone(c)!=='bench'||!match(c,PRINT.mega))return 0;
    const b=c.publicMetadata?.benchIndex;
    const target=slots(o.ownPublic).find(x=>x.zone==='bench'&&x.index===b&&match(x.pokemon.printing,PRINT.mega));
    if(!target)return 0;
    return Math.max(0,3-list(target.pokemon.energies).length)*85;
   };
  }else if(/guzma/.test(src)){
   if(cs.some(c=>c.kind==='pokemon'&&owner(c)==='opponent')){
    const bestMega=attackingBenchedMega(o,terminalPeriodBenchTargetAvailable(o)?2:3)[0]?.pokemon??o.ownPublic?.active;
    return pickRows(p,cs.filter(c=>c.kind==='pokemon'&&owner(c)==='opponent'),bd.min,bd.max,c=>{
     const target=slots(o.opponentPublic).find(r=>r.zone===zone(c)&&
      (r.zone==='active'||r.index===c.publicMetadata?.benchIndex)&&r.pokemon.printing===name(c));
     if(!target)return 0;
     const tactical=guzmaTargetScore(target.pokemon,bestMega,o);
     return Math.max(tactical,opponentSnorlaxBlock(o)&&
      slots(o.ownPublic).some(x=>x.zone==='bench'&&match(x.pokemon.printing,PRINT.budew))?
      150-Math.min(100,target.pokemon.damage||0)/10:0);
    });
   }
   rank=c=>{
    const self=slots(o.ownPublic).find(r=>r.zone===zone(c)&&
     (r.zone==='active'||r.index===c.publicMetadata?.benchIndex)&&r.pokemon.printing===name(c));
    if(!self)return 0;
    const blockEscape=opponentSnorlaxBlock(o)||activeMimikyuSafeguard(o);
    // When Guzma is the only escape from a live Snorlax retreat trap,
    // promoting funded Mega instead of offered Budew loses the Item-lock
    // attack. The native two-stage prompt may expose Snorlax before or the
    // Safeguarded Mimikyu after the opponent's swap; handle both views.
    // Terminal Period directly Knocks Out a target with six counters. PAL97
    // Safeguard prevents attack DAMAGE, not this conditional Knock Out effect.
    // A ready two-Energy Terminal must therefore outrank defensive Budew.
    if(match(self.pokemon.printing,PRINT.mega)&&
       list(self.pokemon.energies).length>=2&&
       o.opponentPublic?.active?.damage===60)return 785;
    if(match(self.pokemon.printing,PRINT.budew)&&blockEscape)return 620;
    if(match(self.pokemon.printing,PRINT.mega)&&list(self.pokemon.energies).length>=3)return 480;
    if(match(self.pokemon.printing,PRINT.budew))return 220;
    if(list(self.pokemon.tools).some(x=>match(x,PRINT.float))&&toolEnabled(o))return 185;
    return 15;
   };
  }
  return pickRows(p,rows,bd.min,bd.max,rank);
 }
 if(p.promptType==='SelectPrompt'&&p.source?.sourceKind==='engine'&&
   o.phase===1&&p.source?.effectName==='WANT_TO_DRAW_CARDS'){
  const options=cs.filter(c=>c.kind==='option'&&Number.isSafeInteger(c.publicMetadata?.choiceIndex));
  const deck=deckCount(o);
  const affordable=options.map(c=>({c,value:Number(c.label)}))
   .filter(r=>Number.isSafeInteger(r.value)&&r.value>=0&&r.value<=deck)
   .sort((a,b)=>b.value-a.value);
  if(affordable.length)return{kind:'select-choice',token:affordable[0].c.token};
  // Pinned native lists optional draws in decreasing count by index.
  if(deck>=options.length-1&&options.length>0){
   const sorted=options.slice().sort((a,b)=>a.publicMetadata.choiceIndex-b.publicMetadata.choiceIndex);
   return{kind:'select-choice',token:sorted[0].token};
  }
  return{kind:'abstain',reasonCode:'NO_MULLIGAN_DRAW_OPTION'};
 }
 if(p.promptType==='ChooseAttackPrompt'&&bd.kind==='attack'){
  const attacks=cs.filter(c=>c.kind==='attack');
  const sourcePrinting=p.source?.sourcePrinting||'';
  if(!match(sourcePrinting,PRINT.mega)&&!match(sourcePrinting,PRINT.budew)&&!match(sourcePrinting,PRINT.trubbish)){
   return{kind:'abstain',reasonCode:'UNSUPPORTED_ATTACK_CHOICE_SOURCE'};
  }
  const pr=attacks.slice().sort((a,b)=>{
   const rank=c=>/terminal period/i.test(c.publicMetadata?.sourceAttack||'')?
    (o.opponentPublic?.active?.damage===60?100:0):
    /claw of darkness/i.test(c.publicMetadata?.sourceAttack||'')?65:
    /itchy pollen/i.test(c.publicMetadata?.sourceAttack||'')?80:
    /acid spray/i.test(c.publicMetadata?.sourceAttack||'')?50:0;
   return rank(b)-rank(a);
  });
  const wanted=pr[0];
  if(wanted&&(/^(Terminal Period|Claw of Darkness|Itchy Pollen|Acid Spray)$/i).test(wanted.publicMetadata?.sourceAttack||'')){
   return{kind:'select-choice',token:wanted.token};
  }
  return{kind:'abstain',reasonCode:'NO_SUPPORTED_ATTACK_CHOICE'};
 }
 if(p.promptType==='ChoosePrizePrompt'&&bd.kind==='prize-slots'){
  const required=p.publicMetadata?.requiredCount;
  const eligible=cs.filter(c=>c.kind==='prize'&&c.publicMetadata?.ownerSeat==='actor');
  if(Number.isSafeInteger(required)&&required>=1&&eligible.length>=required){
   return{kind:'select-choices',tokens:eligible.slice(0,required).map(c=>c.token)};
  }
  return{kind:'abstain',reasonCode:'NO_SUPPORTED_PRIZE_SELECTION'};
 }
 if(p.promptType==='ChooseEnergyPrompt'&&bd.kind==='energy-payment'&&/plumeria|acid spray/.test(src)){
  const candidates=cs.filter(c=>c.kind==='energy'&&owner(c)==='opponent'&&
   c.publicMetadata?.isOwnerVisible===true);
  const rank=c=>/^Double Dragon Energy\b/i.test(name(c))?270:
   /^Double Colorless Energy\b/i.test(name(c))?260:
   /^Double Turbo Energy\b/i.test(name(c))?240:
   /^(?:Basic )?(?:Grass|Fire) Energy\b/i.test(name(c))?145:
   /\bEnergy\b/i.test(name(c))?120:0;
  const ranked=candidates.map(c=>({c,v:rank(c)})).sort((a,b)=>b.v-a.v);
  return ranked[0]?.v>0?{kind:'select-choices',tokens:[ranked[0].c.token]}:
   {kind:'abstain',reasonCode:'NO_SUPPORTED_OPPONENT_ENERGY'};
 }
 if(p.promptType==='ConfirmPrompt'){
  if(p.source?.sourceKind==='engine'&&o.phase===1&&p.source?.effectName==='GO_FIRST'){
   // The source is built to attack for zero Energy with Budew on its first turn going second.
   const no=cs.find(c=>c.kind==='confirm'&&/^no$/i.test(c.label||''));
   if(no)return{kind:'select-choice',token:no.token};
   return{kind:'abstain',reasonCode:'BAD_GO_FIRST_CONFIRM_CHOICES'};
  }
  const yes=cs.find(c=>/^yes|confirm|true$/i.test(c.label||''));
  const no=cs.find(c=>/^no|decline|false$/i.test(c.label||''));
  if(/wonder tag|dark asset|dedechange|squawk and seize|star alchemy/.test(src)){
   const choice=usableOwnAbilities(o)&&deckCount(o)>0&&(!/dedechange|squawk and seize/.test(src)||canRiskFullHandDiscard(o))?yes:no;
   return choice?{kind:'select-choice',token:choice.token}:{kind:'abstain',reasonCode:'UNSUPPORTED_CONFIRMATION_SOURCE'};
  }
 }
 return {kind:'abstain',reasonCode:'UNSUPPORTED_PROMPT_TYPE'};
}
function createPolicy({role,seat,policyVersion,config}){
 if(role!=='opponent'||(seat!==0&&seat!==1)||policyVersion!==POLICY_VERSION||!config||Array.isArray(config)||Object.keys(config).length!==0)
  throw Error('AGENT40_RANK16_POLICY_INIT_MISMATCH');
 return Object.freeze({decide(req){
  if(!req||req.role!=='opponent'||req.seat!==seat||req.observation?.actorSeat!==seat)
   return {kind:'abstain',reasonCode:'ROLE_SEAT_BINDING_MISMATCH'};
  return req.prompt==null?bestAction(req):promptDecision(req);
 }});
}
module.exports={POLICY_VERSION,SOURCE_RANK,SOURCE_LIST_BLOB_SHA1,ENGINE_PIN,SOURCE_INVENTORY,createPolicy,bestAction,promptDecision,score,projectedClawDamage,clawProjectedKnockoutScore,prizeYield,activeMimikyuSafeguard,regidragoPayloadCount,karenOwnRecoveryScore,karenDenialScore,vsSeekerDenialScore,battleCompressorKarenLineScore,plumeriaDenialScore,templeStrandsApexDragon,templeStrandsIronThorns,guzmaRootScore,guzmaTargetScore,benchSupportAbilityUsable,benchSupportFits,benchSupportOnceThisTurnAlreadyUsed,forestSealLinePending,drawSupporterScore,opponentVileplumeItemLock,opponentStoutlandSupporterLock,opponentSnorlaxBlock,basicSearchDemand,ultraSearchDemand,toolEnabled,garbotoxinStatus,opponentGarbotoxinStatus,liveGarbotoxin};
