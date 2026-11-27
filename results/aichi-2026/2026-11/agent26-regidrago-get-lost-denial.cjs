'use strict';
// Source-inventory-specific paper Get Lost analysis. Not a policy or game.
const {plan,PAYLOADS}=require('./agent26-rank13-extra-turn-prize-planner.cjs');
const INVENTORY=Object.freeze({
  "10": {
    "Regidrago V SIT 135": 4,
    "Dragapult ex TWM 130": 1,
    "Dialga-GX UPR 100": 1,
    "Koraidon ex TEF 120": 1,
    "Kyurem SFA 47": 1,
    "Hisuian Goodra VSTAR LOR 136": 1
  },
  "12": {
    "Regidrago V SIT 135": 4,
    "Dialga-GX UPR 100": 2,
    "Dragapult ex TWM 130": 1,
    "Noivern ex PAL 153": 1,
    "Koraidon ex TEF 120": 1,
    "Kyurem SFA 47": 1
  },
  "13": {
    "Regidrago V SIT 135": 4,
    "Salamence ex JTG 114": 1,
    "Dragapult ex TWM 130": 1,
    "Noivern ex PAL 153": 1,
    "Dialga-GX UPR 100": 1,
    "Kyurem SFA 47": 1
  },
  "14": {
    "Regidrago V SIT 135": 4,
    "Dialga-GX UPR 100": 1,
    "Mega Dragonite ex ASC 152": 1,
    "Dragapult ex TWM 130": 1,
    "Noivern ex PAL 153": 1,
    "Hisuian Goodra VSTAR LOR 136": 1,
    "Kyurem SFA 47": 1
  },
  "18": {
    "Regidrago V SIT 135": 3,
    "Dialga-GX UPR 100": 1,
    "Dragapult ex TWM 130": 1,
    "Hisuian Goodra VSTAR LOR 136": 1,
    "Koraidon ex TEF 120": 1,
    "Kyurem SFA 47": 1
  },
  "20": {
    "Regidrago V SIT 135": 4,
    "Dialga-GX UPR 100": 1,
    "Dragapult ex TWM 130": 1,
    "Mega Dragonite ex ASC 152": 1,
    "Noivern ex PAL 153": 1,
    "Kyurem SFA 47": 1
  },
  "21": {
    "Regidrago V SIT 135": 3,
    "Dialga-GX UPR 100": 1,
    "Dragapult ex TWM 130": 1,
    "Hisuian Goodra VSTAR LOR 136": 1,
    "Noivern ex PAL 153": 1,
    "Koraidon ex TEF 120": 1,
    "Kyurem SFA 47": 1
  },
  "27": {
    "Regidrago V SIT 135": 4,
    "Dialga-GX UPR 100": 2,
    "Dragapult ex TWM 130": 1,
    "Koraidon ex TEF 120": 1,
    "Noivern ex PAL 153": 1,
    "Kyurem SFA 47": 1
  },
  "32": {
    "Regidrago V SIT 135": 4,
    "Dialga-GX UPR 100": 1,
    "Noivern ex PAL 153": 1,
    "Dragapult ex TWM 130": 1,
    "Hisuian Goodra VSTAR LOR 136": 1,
    "Kyurem SFA 47": 1,
    "Mega Dragonite ex ASC 152": 1
  }
});
const assert=(condition,message)=>{if(!condition)throw Error(message);};
function copies(rank){
 assert(Object.hasOwn(INVENTORY,String(rank)),'rank not an authenticated Regidrago source');
 return Object.entries(INVENTORY[rank]).flatMap(([p,n])=>Array(n).fill(p));
}
function subtract(cards,removed){
 const left=cards.slice();
 for(const p of removed){
  if(!Object.hasOwn(PAYLOADS,p))continue;
  const i=left.indexOf(p);assert(i>=0,'payload copy exceeds exact source or not available: '+p);left.splice(i,1);
 }
 return left;
}
function summary(r){
 const row=r.selected==='extra-turn'?r.extraTurn:r.selected==='single-attack'?r.direct:null;
 return row?{win:row.win,potentialPrizes:row.prizes,selected:r.selected,attack:row.attack,
 ...(r.selected==='extra-turn'?{firstTarget:row.firstTarget,firstGust:row.firstGust,responses:row.responses.map(x=>({promoted:x.promoted,attack:x.second?.attack,targets:x.second?.targets,gust:x.second?.gust,potentialPrizes:x.prizes,win:x.win}))}:{target:row.active,targets:row.targets,gust:row.gust})}
 :{win:false,potentialPrizes:0,selected:'no-modeled-attack'};
}
function exactPairs(cards){
 if(cards.length===0)return [];
 if(cards.length===1)return [{indices:[0],cards:cards.slice()}];
 const out=[],seen=new Set();
 for(let i=0;i<cards.length;i++)for(let j=i+1;j<cards.length;j++){
  const key=JSON.stringify([cards[i],cards[j]].sort());
  if(seen.has(key))continue;seen.add(key);out.push({indices:[i,j],cards:[cards[i],cards[j]]});
 }
 return out;
}
function analyze({rank,state,lost=[],locked=['Regidrago V SIT 135']}){
 assert(Array.isArray(lost)&&Array.isArray(locked),'invalid known removed inventory');
 assert(locked.includes('Regidrago V SIT 135'),'reserve the active VSTAR evolution base');
 const full=copies(rank),possible=subtract(full,[...lost,...locked]);
 // This call validates physical multiplicity of visible payloads.
 subtract(possible,state.discard);
 const compute=discard=>summary(plan({...state,discard}));
 const baseline={current:compute(state.discard),envelope:compute(possible)};
 const rows=exactPairs(state.discard).map(pair=>{
  const afterCurrent=state.discard.filter((_,i)=>!pair.indices.includes(i));
  const afterEnvelope=subtract(possible,pair.cards);
  const permanentlyExhausted=Object.keys(INVENTORY[rank]).filter(p=>possible.includes(p)&&!afterEnvelope.includes(p)&&!locked.includes(p));
  return {...pair,current:compute(afterCurrent),envelope:compute(afterEnvelope),permanentlyExhausted};
 });
 rows.sort((a,b)=>Number(a.current.win)-Number(b.current.win)||Number(a.envelope.win)-Number(b.envelope.win)||
 a.current.potentialPrizes-b.current.potentialPrizes||a.envelope.potentialPrizes-b.envelope.potentialPrizes||
 b.permanentlyExhausted.length-a.permanentlyExhausted.length||a.indices[0]-b.indices[0]);
 return {rank,baseline,totalDistinctPairs:rows.length,safeCurrent:rows.filter(x=>!x.current.win),safeEnvelope:rows.filter(x=>!x.envelope.win),rows,
   qualification:'constructed post-Get-Lost board; envelope grants all nonlost/unreserved payloads, NOT a probability or full opponent-turn solver'};
}
module.exports={INVENTORY,copies,analyze,summary};
