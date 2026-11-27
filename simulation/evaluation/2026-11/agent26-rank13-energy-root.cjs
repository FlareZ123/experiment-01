'use strict';
// Research-owned adapter proposal for Agent24's exact rank-13 policy.
// Only scores already-validated actor-owned PlayCardAction Energy tokens.
// No hidden state, simulated draws, additional frontier actions or dispatch.
const G='Grass Energy MEE 9', F='Fire Energy MEE 10', D='Double Dragon Energy ROS 97';
const V='Regidrago V SIT 135', S='Regidrago VSTAR SIT 136', DIA='Dialga-GX UPR 100';
const PAYLOADS=new Set(['Noivern ex PAL 153','Dialga-GX UPR 100','Salamence ex JTG 114','Kyurem SFA 47',V]);
const list=x=>Array.isArray(x)?x:[];
function energyKind(p){
  if(p===G || /^Basic Grass Energy\b/.test(p))return 'G';
  if(p===F || /^Basic Fire Energy\b/.test(p))return 'F';
  if(p===D)return 'D';
  return null;
}
function energyUnits(cards,temple=false){
  const e={grass:0,fire:0,wild:0,colorless:0};
  if(!Array.isArray(cards))return null;
  for(const c of cards){
    switch(energyKind(c)){
      case 'G':e.grass++;break;
      case 'F':e.fire++;break;
      case 'D':if(temple)e.colorless++;else e.wild+=2;break;
      default:return null;
    }
  }
  return e;
}
// Each DDE supplies two assignable units, not two of every type simultaneously.
function apexGap(e){return e?Math.max(0,Math.max(0,2-e.grass)+Math.max(0,1-e.fire)-e.wild):null;}
function dialgaGap(e,metal,total){return e?Math.max(0,metal-e.wild,total-e.grass-e.fire-e.wild-e.colorless):null;}
function isRegi(p){return p?.printing===V||p?.printing===S;}
function hasPayload(o){return list(o.ownPublic?.discard).some(x=>PAYLOADS.has(x));}
function templeLive(o){
  const stadiums=[...list(o.ownPublic?.stadium),...list(o.opponentPublic?.stadium)];
  if(!stadiums.some(x=>/^Temple of Sinnoh ASR 155\b/.test(x)))return false;
  // A suppressed Stadium cannot blank DDE. Unknown suppression => conservative live.
  return ![o.ownPublic,o.opponentPublic].some(p=>(p?.publicTurnRestrictions?.stadiumAndToolHaveNoEffectTurnsRemaining??0)>0);
}
function actionTarget(item,o){
  const m=item?.publicMetadata;
  if(item?.kind!=='play-card'||m?.cardType!=='energy'||m.targetSeat!=='actor'||
    m.isOwnerVisible!==true||typeof item.token!=='string'||!energyKind(item.actorPrinting))return null;
  if(!Number.isSafeInteger(m.handIndex)||m.handIndex<0||
    list(o.ownHand)[m.handIndex]!==item.actorPrinting)return null;
  let p;
  if(m.targetZone==='active'){
    if(m.targetIndex!==undefined&&m.targetIndex!==0)return null;
    p=o.ownPublic?.active;
  }else if(m.targetZone==='bench'&&Number.isSafeInteger(m.targetIndex)&&m.targetIndex>=0){
    p=list(o.ownPublic?.bench)[m.targetIndex];
  }else return null;
  if(!p||p.printing!==item.targetPrinting||
    !list(p.printed?.types).includes('Dragon'))return null;
  return {p,active:m.targetZone==='active'};
}
function assessment(item,request){
  const o=request?.observation;
  if(!o||request.prompt!=null||request.role!=='opponent'||request.seat!==o.actorSeat)return null;
  const tr=o.ownTurnResources, pr=o.ownPublic?.publicTurnRestrictions;
  if(!tr||tr.energyPlayedTurn!==false||tr.energyPlayLocked===true||pr?.energyPlayLocked===true||
      ((tr.specialEnergyPlayLocked===true||pr?.specialEnergyPlayLocked===true)&&energyKind(item?.actorPrinting)==='D'))return null;
  const target=actionTarget(item,o);
  if(!target)return null;
  const {p,active}=target, temple=templeLive(o);
  const before=energyUnits(p.energies,temple), after=energyUnits([...list(p.energies),item.actorPrinting],temple);
  if(!before||!after)return null;
  const basicBonus=energyKind(item.actorPrinting)==='D'?0:3;
  if(isRegi(p)){
    const old=apexGap(before), next=apexGap(after), improvement=old-next;
    if(improvement<=0)return null; // Never stack unnecessary Energy on an already-ready Regidrago.
    const current=o.ownPublic.active;
    const activeEnergy=isRegi(current)?energyUnits(current.energies,temple):null;
    const activeReady=activeEnergy!==null&&apexGap(activeEnergy)===0;
    let score;
    if(active&&p.printing===S&&next===0)score=hasPayload(o)?272:228;
    else if(active&&next===0)score=list(o.ownHand).includes(S)?246:239;
    else if(active)score=next===1?230:210;
    else if(activeReady)score=190; // Preserve a ready active attack over backup investment.
    else if(current?.printing==='Budew ASC 16')score=next<=1?235:229;
    else score=next===0?236:next===1?224:207;
    // Finishing with Basic Energy conserves scarce DDE. For partial setup
    // prioritize actual cost-unit improvement over conserving a card.
    score+=next===0?basicBonus:improvement*4;
    return {token:item.token,score,oldGap:old,newGap:next,active,reason:next===0?'APEX_COST_COMPLETE':'APEX_COST_PROGRESS'};
  }
  // Rank 13's direct Dialga fallback: only if no Regidrago is established.
  if(p.printing===DIA&&active&&![o.ownPublic.active,...list(o.ownPublic.bench)].some(isRegi)){
    const old=dialgaGap(before,1,3), next=dialgaGap(after,1,3);
    const oldGX=dialgaGap(before,3,5), nextGX=dialgaGap(after,3,5);
    const gxUnused=pr?.gxUsed===false&&pr?.cannotUseGXAttacks!==true;
    if(gxUnused&&oldGX>0&&nextGX===0)return {token:item.token,score:263+basicBonus,oldGap:oldGX,newGap:nextGX,active,reason:'DIRECT_TIMELESS_COST_COMPLETE'};
    if(old>0&&next===0)return {token:item.token,score:239+basicBonus,oldGap:old,newGap:next,active,reason:'DIRECT_SHRED_COST_COMPLETE'};
    if(old>next&&(after.wild>0||list(o.ownHand).includes(D)))return {token:item.token,score:193+(old-next)*4,oldGap:old,newGap:next,active,reason:'DIRECT_SHRED_COST_PROGRESS'};
  }
  return null;
}
function rank13EnergyCandidates(request){
  return list(request?.actionFrontier?.items).map((item,index)=>({row:assessment(item,request),index}))
    .filter(x=>x.row!==null).sort((a,b)=>b.row.score-a.row.score||a.index-b.index).map(x=>x.row);
}
// Compose with the current policy instead of rewriting its attack/prompt logic.
// Return the original decision unless an eligible attachment beats that root's score.
function chooseRank13WithEnergy(request,basePolicy){
  const original=basePolicy.bestAction(request);
  if(request?.prompt!=null)return original;
  const chosen=list(request?.actionFrontier?.items).find(x=>x.token===original.token);
  if(original.kind!=='select-action'||!chosen)return original;
  const candidate=rank13EnergyCandidates(request)[0];
  if(!candidate)return original;
  const oldScore=basePolicy.scoreAction(chosen,request);
  if(!Number.isFinite(oldScore)||candidate.score<=oldScore)return original;
  return {kind:'select-action',token:candidate.token};
}
module.exports={G,F,D,V,S,DIA,energyUnits,apexGap,dialgaGap,assessment,rank13EnergyCandidates,chooseRank13WithEnergy};
