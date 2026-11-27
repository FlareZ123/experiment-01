'use strict';
// Rank 13: unlock the existing DDE board against Lockbridge's Temple.
// Only choose an already offered root action. Parallel City is intentionally
// excluded until its orientation continuation is established.
const {S,energyUnits,apexGap,chooseRank13WithEnergy}=require('./agent26-rank13-energy-root.cjs');
const LAB='Silent Lab PRC 140', BLOWER='Megaton Blower SSP 182', TEMPLE='Temple of Sinnoh ASR 155';
const arr=x=>Array.isArray(x)?x:[];
function templeBreak(request,base){
 const o=request?.observation, own=o?.ownPublic, opp=o?.opponentPublic, a=own?.active;
 if(request?.prompt!=null||request?.role!=='opponent'||request?.seat!==o?.actorSeat||a?.printing!==S)return null;
 const stadiums=[...arr(own.stadium),...arr(opp?.stadium)];
 if(stadiums.length!==1||stadiums[0]!==TEMPLE)return null;
 if([own,opp].some(p=>(p?.publicTurnRestrictions?.stadiumAndToolHaveNoEffectTurnsRemaining??0)>0))return null;
 if(!base.hasDragonPayload(o))return null;
 const locked=apexGap(energyUnits(a.energies,true)), unlocked=apexGap(energyUnits(a.energies,false));
 if(locked===null||locked<=0||unlocked!==0)return null;
 const items=arr(request.actionFrontier?.items);
 // If Apex is already offered, do not infer an energy lock from our model.
 if(items.some(x=>x.kind==='attack'&&x.attackName==='Apex Dragon'))return null;
 const available=items.filter(x=>x.kind==='play-card'&&x.publicMetadata?.cardType==='trainer'&&
   Number.isSafeInteger(x.publicMetadata.handIndex)&&x.publicMetadata.handIndex>=0&&
   arr(o.ownHand)[x.publicMetadata.handIndex]===x.actorPrinting&&
   [LAB,BLOWER].includes(x.actorPrinting)&&typeof x.token==='string');
 const lab=available.find(x=>x.actorPrinting===LAB), blower=available.find(x=>x.actorPrinting===BLOWER);
 // Prefer spending the ordinary Stadium where the ACE SPEC would only remove Temple.
 const tools=[opp?.active,...arr(opp?.bench)].filter(Boolean).some(p=>arr(p.tools).length>0);
 const chosen=tools&&blower?blower:lab??blower;
 if(!chosen)return null;
 return {token:chosen.token,lockedGap:locked,unlockedGap:unlocked,
   reason:chosen===lab?'REPLACE_TEMPLE_SAVE_ACE_SPEC':'REMOVE_TEMPLE_WITH_MEGATON'};
}
function chooseRank13WithTempleBreak(request,base){
 const choice=templeBreak(request,base);
 if(choice)return {kind:'select-action',token:choice.token};
 return chooseRank13WithEnergy(request,base);
}
module.exports={LAB,BLOWER,TEMPLE,templeBreak,chooseRank13WithTempleBreak};
