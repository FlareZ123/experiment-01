'use strict';
// One legal manual attachment to the Active can enable a better immediate attack.
// No future draws, hypothetical Energy acceleration, or invented attack roots.
const mobility=require('./agent23-rank19-mobility.cjs');
const bolt=require('./agent23-rank19-bellowing-thunder-draft.cjs');
const opening=require('./agent23-rank19-opening.cjs');
const list=x=>Array.isArray(x)?x:[];
const name=x=>typeof x==='string'?x:x?.printing??x?.fullName??'';
const DDE=/^Double Dragon Energy ROS(?: 97)?$/;
function root(r,caps={discard:false,attach:false},terminalOnly=false){
 const o=r?.observation,own=o?.ownPublic,active=own?.active,h=o?.ownHand,foe=o?.opponentPublic;
 if(r?.role!=='opponent'||r.seat!==o?.actorSeat||!active||!foe?.active||!Array.isArray(h)||!Array.isArray(active.energies)||!Array.isArray(active.specialConditions)||active.specialConditions.length)return null;
 const turn=o.globalTurn,spent=o.ownTurnResources?.energyPlayedTurn;
 if(!Number.isSafeInteger(turn)||turn<2||!Number.isSafeInteger(spent)||spent>=turn||(o.turnSeat!==undefined&&o.turnSeat!==o.actorSeat))return null;
 const k=opening.kind(active);
 if(!['adp','bolt','moltres','sandy','bird','lele','sudo'].includes(k))return null;
 const before=mobility.bestAttack(o,own,foe.active,caps);
 if(before?.terminal)return null;
 const plans=[];
 for(const a of list(r.actionFrontier?.items)){
  const m=a.publicMetadata??{},i=m.handIndex,e=name(a.actorPrinting),card=name(h[i]);
  if(a.kind!=='play-card'||typeof a.token!=='string'||!Number.isSafeInteger(i)||i<0||i>=h.length||m.targetSeat!=='actor'||m.targetZone!=='active'||m.targetIndex!==0||opening.kind(a.targetPrinting)!==k)continue;
  if(DDE.test(e)){if(!DDE.test(card)||!['adp','bolt'].includes(k))continue;}
  else if(!bolt.basic(e)||bolt.basic(e)!==bolt.basic(card))continue;
  const next={...own,active:{...active,energies:[...active.energies,card]}};
  const p=mobility.bestAttack({...o,ownPublic:next},next,foe.active,caps);
  if(!p||p.score<=(before?.score??0)||!p.terminal&&(terminalOnly||!p.lethal||p.nativeTerminalReply||p.copycatReply))continue;
  plans.push({a,p,s:p.score,special:Number(DDE.test(e))});
 }
 plans.sort((a,b)=>b.s-a.s||a.special-b.special);
 return plans.length?{kind:'select-action',token:plans[0].a.token}:null;
}
module.exports={root};
