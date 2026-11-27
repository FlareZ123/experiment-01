'use strict';
// Public-only adapter for the existing Get Lost root and prompt. Inject
// planLostZoneDefense; no rank label, hidden hand, or engine access.
function rankRainGetLostAdvice(view,rows,planLostZoneDefense){
 const own=view?.ownPublic,opp=view?.opponentPublic;
 if(!own||!opp||!Array.isArray(own.bench)||!Array.isArray(opp.bench)||
 !Array.isArray(opp.discard)||!Array.isArray(rows)||rows.length<2||
 typeof planLostZoneDefense!=='function')return null;
 const ownBoard=[own.active,...own.bench].filter(Boolean),oppBoard=[opp.active,...opp.bench].filter(Boolean);
 const name=p=>typeof p==='string'?p:p?.printing||'';
 const match=(p,re)=>re.test(name(p));
 const energyKey=p=>match(p,/^Reversal Energy PAL(?: \d+)?$/)?'reversal':
 match(p,/^Counter Energy CIN(?: \d+)?$/)?'counter':
 match(p,/^Unit Energy LPM UPR(?: \d+)?$/)?'unit':null;
 const raichu=oppBoard.find(p=>match(p,/^Alolan Raichu UNM(?: \d+)?$/));
 const bombs=oppBoard.filter(p=>match(p,/^Electrode-GX CES(?: \d+)?$/));
 // Escalate only for a visible evolved combo. Future mobility and lock
 // changes are not guaranteed; this is conditional pressure, not a win rate.
 if(!raichu||!bombs.length||!ownBoard.length||!Array.isArray(raichu.energies)||
 !Array.isArray(raichu.tools)||raichu.energies.some(c=>!energyKey(c)))return null;
 if(opp.discard.filter(c=>energyKey(c)).length+raichu.energies.length<2)return null;
 const candidatePrints=[
 [/^Shadow Rider Calyrex VMAX CRE(?: \d+)?$/,3,true],
 [/^Shadow Rider Calyrex V CRE(?: \d+)?$/,2,true],
 [/^Lillie.s Clefairy ex JTG(?: \d+)?$/,2,false],
 [/^Tapu Lele-GX GRI(?: \d+)?$/,2,true],
 [/^Trevenant & Dusknoir-GX SMP(?: \d+)?$/,3,true],
 [/^Latias ex SSP(?: \d+)?$/,2,false],
 [/^Dialga-GX UPR(?: \d+)?$/,2,true],
 [/^Mimikyu GRI(?: \d+)?$/,1,false],
 [/^Girafarig LOT(?: \d+)?$/,1,false],
 [/^Marshadow UNB(?: \d+)?$/,1,false],
 [/^Radiant Eternatus CRZ(?: \d+)?$/,1,false],
 [/^Wobbuffet PHF(?: \d+)?$/,1,false]
 ];
 const sight=raichu.tools.some(c=>match(c,/^Telescopic Sight VIV(?: \d+)?$/));
 const targets=[];
 for(let i=0;i<ownBoard.length;i++){
  const slot=ownBoard[i],row=candidatePrints.find(([re])=>match(slot,re));
  if(!row||!Number.isInteger(slot.hp)||!Number.isInteger(slot.damage)||slot.hp<=slot.damage||
   !Array.isArray(slot.tools)||slot.tools.some(c=>!match(c,/^(Stealthy Hood UNB|Float Stone BKT|Forest Seal Stone SIT)(?: \d+)?$/)))return null;
  targets.push({id:'own'+i,remainingHp:slot.hp-slot.damage,prizes:row[1],damageAllowed:true,
   flatDamageModifier:i>0&&sight&&row[2]?30:0});
 }
 // Match distinct occurrences by exact printing. Preserve the originating
 // row, including its opaque prompt token or root public index.
 const remaining=opp.discard.map((printing,index)=>({printing,index,used:false}));
 const choices=[];
 for(const row of rows){
  if(typeof row?.printing!=='string')return null;
  const hit=remaining.find(r=>!r.used&&r.printing===row.printing);
  if(!hit)return null;hit.used=true;
  choices.push({token:'discard'+hit.index,printing:row.printing,row});
 }
 if(choices.length!==opp.discard.length)return null;
 const attached=raichu.energies.map((printing,i)=>({token:'attached'+i,printing}));
 const count={reversal:0,counter:0,unit:0};
 for(const printing of [...opp.discard,...(opp.lostZone||[]),...oppBoard.flatMap(p=>p.energies||[])]){
  const k=energyKey(printing);if(k)count[k]++;
 }
 if(Object.values(count).some(n=>n>4))return null;
 const unseenUpper=Object.fromEntries(Object.entries(count).map(([k,n])=>[k,4-n]));
 const common={modifiersComplete:true,attackWindowKnown:true,ownPrizes:opp.prizeCount,opponentPrizes:own.prizeCount,
  availableBombs:Math.min(2,bombs.length),manualAvailable:false,temple:false,discard:choices,attached,targets};
 // Two envelopes: current public loaded cards, and all possible remaining
 // copies of these three Energy names. Ignore current Temple in the
 // worst case because future removal is possible. No other types modeled.
 const loaded=planLostZoneDefense({...common,additionalDiscardCapacity:0,unseenUpper:{reversal:0,counter:0,unit:0}});
 const upper=planLostZoneDefense({...common,manualAvailable:true,additionalDiscardCapacity:12,unseenUpper});
 if(loaded.status!=='bounded-defense-plan'||upper.status!=='bounded-defense-plan')return null;
 const upperMap=new Map(upper.alternatives.map(a=>[a.tokens.slice().sort().join('|'),a.after]));
 const rank=[];
 for(const a of loaded.alternatives){
  const b=upperMap.get(a.tokens.slice().sort().join('|'));if(!b)continue;
  const loadedTerminal=Number(loaded.baseline.terminal&&!a.after.terminal),
   upperTerminal=Number(upper.baseline.terminal&&!b.terminal);
  const loadedNet=Math.max(0,loaded.baseline.net-a.after.net),
   upperNet=Math.max(0,upper.baseline.net-b.net),
   unitCut=Math.max(0,upper.baseline.units-b.units);
  const score=loadedTerminal*5000+upperTerminal*3200+loadedNet*1100+upperNet*400+unitCut*80;
  rank.push({rows:a.tokens.map(t=>choices.find(c=>c.token===t).row),score,loadedAfter:a.after,upperAfter:b});
 }
 rank.sort((a,b)=>b.score-a.score);
 if(!rank.length||rank[0].score<=0)return null;
 return {best:rank[0],alternatives:rank,loadedBefore:loaded.baseline,upperBefore:upper.baseline,
  assumption:'visible evolved combo; these three named Energy types only; future mobility and removal possible'};
}
module.exports={rankRainGetLostAdvice};
