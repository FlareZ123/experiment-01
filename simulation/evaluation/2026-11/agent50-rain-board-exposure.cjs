'use strict';
// Board-exposure analysis for Electro Rain (30 damage per Lightning unit).
// Public, explicit modifiers only. This ranks potential destinations, not
// legal retreat actions or overall win probability.
function validate(input){
 if(!input||input.modifiersComplete!==true||!Number.isInteger(input.attackerPrizes)||
 input.attackerPrizes<1||input.attackerPrizes>6||typeof input.sight!=='boolean'||
 !Array.isArray(input.board)||input.board.length<1||input.board.length>9||
 typeof input.activeId!=='string')return false;
 const ids=new Set();
 for(const p of input.board){
  if(!p||typeof p.id!=='string'||ids.has(p.id)||!Number.isInteger(p.remainingHp)||p.remainingHp<1||
   !Number.isInteger(p.prizes)||p.prizes<0||p.prizes>6||typeof p.sightEligible!=='boolean'||
   typeof p.damageAllowed!=='boolean'||!Number.isInteger(p.flatDamageModifier)||
   p.requiresNoSpecialAttached===true||Number(p.minRemainingEnergy||0)>0)return false;
  ids.add(p.id);
 }
 return ids.has(input.activeId);
}
function threshold(board,activeId,prizes,sight){
 const rows=board.map(p=>({...p,hits:p.damageAllowed?Math.max(1,Math.ceil((p.remainingHp-p.flatDamageModifier-
 (sight&&p.sightEligible&&p.id!==activeId?30:0))/30)):Infinity}));
 let best=null;
 for(let mask=1;mask<(1<<rows.length);mask++){
  const selected=rows.filter((_,i)=>mask&(1<<i));
  const p=selected.reduce((n,x)=>n+x.prizes,0),boardOut=selected.length===rows.length;
  if(p<prizes&&!boardOut)continue;
  const hits=selected.reduce((n,x)=>n+x.hits,0);
  if(!Number.isFinite(hits))continue;
  if(!best||hits<best.hits||hits===best.hits&&selected.length<best.targetIds.length)
   best={hits,prizes:Math.min(prizes,p),boardOut,targetIds:selected.map(x=>x.id),
    allocation:selected.map(x=>({targetId:x.id,hits:x.hits}))};
 }
 return {activeId,terminalHits:best?.hits??null,terminalRoute:best};
}
function compare(a,b){return (b.terminalHits??Infinity)-(a.terminalHits??Infinity);}
function analyzeRainBoard(input){
 if(!validate(input))return {status:'unsupported-public-board'};
 const {board,activeId,attackerPrizes,sight}=input;
 const placements=board.map(p=>threshold(board,p.id,attackerPrizes,sight));
 placements.sort((a,b)=>compare(a,b)||Number(b.activeId===activeId)-Number(a.activeId===activeId));
 const current=placements.find(p=>p.activeId===activeId);
 const additional=[];
 for(const p of input.possibleBenches||[]){
  if(board.length>=9||!validate({...input,board:[...board,p]}))continue;
  const after=threshold([...board,p],activeId,attackerPrizes,sight);
  additional.push({id:p.id,terminalHits:after.terminalHits,
   change:current.terminalHits!==null&&after.terminalHits!==null?after.terminalHits-current.terminalHits:null,
   terminalRoute:after.terminalRoute});
 }
 return {status:'board-exposure-analysis',current,safestPotentialActive:placements[0],placements,additional,
  assumption:'static fully specified damage modifiers; no action legality or setup-value inference'};
}
module.exports={analyzeRainBoard};
