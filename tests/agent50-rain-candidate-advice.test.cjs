'use strict';
function runCases(defense,board,advice){
 const slot=(printing,hp,energies=[],tools=[])=>({printing,hp,damage:0,energies,tools});
 const target=(id,hp,prizes,sightEligible)=>({id,remainingHp:hp,prizes,sightEligible,damageAllowed:true,flatDamageModifier:0});
 let n=0;const ok=(cond,label)=>{if(!cond)throw Error(label);n++;};
 const v1=target('v1',320,3,true),v2=target('v2',320,3,true),g=target('g',90,1,false);
 const exposure=board.analyzeRainBoard({modifiersComplete:true,attackerPrizes:6,sight:true,board:[v1,v2,g],activeId:'g'});
 ok(exposure.current.terminalHits===20,'bench VMAX pair 20');
 ok(exposure.safestPotentialActive.terminalHits===21,'active VMAX 21');
 const r='Reversal Energy PAL',c='Counter Energy CIN',u='Unit Energy LPM UPR',discard=[r,r,c,c,u,u];
 const view={ownPublic:{prizeCount:6,active:slot('Girafarig LOT',90),bench:[slot('Shadow Rider Calyrex VMAX CRE',320),slot('Shadow Rider Calyrex VMAX CRE',320)]},opponentPublic:{prizeCount:6,active:slot('Alolan Raichu UNM',110,[],['Telescopic Sight VIV']),bench:[slot('Electrode-GX CES',190),slot('Electrode-GX CES',190)],discard,lostZone:[]}};
 for(const seat of [0,1]){
  const rows=discard.map((printing,index)=>({printing,index,token:'seat'+seat+'-opaque'+index}));
  const a=advice.rankRainGetLostAdvice({...view,physicalSeat:seat},rows,defense.planLostZoneDefense);
  ok(a?.upperBefore.terminal===true,'upper before');
  ok(a.best.upperAfter.terminal===false,'upper denial');
  ok(a.best.rows.every(row=>row.printing===r),'two Reversal');
  ok(a.best.rows.map(row=>row.token).join(',')===rows.slice(0,2).map(row=>row.token).join(','),'opaque physical tokens');
  ok(advice.rankRainGetLostAdvice(view,rows.slice(0,2),defense.planLostZoneDefense)===null,'incomplete prompt declines');
  ok(advice.rankRainGetLostAdvice({...view,opponentPublic:{...view.opponentPublic,bench:[]}},rows,defense.planLostZoneDefense)===null,'unobserved Bomb declines');
 }
 return {assertions:n};
}
module.exports={runCases};
if(typeof require==='function'&&require.main===module)console.log(runCases(require('../simulation/evaluation/2026-11/agent50-rain-lost-zone-defense.cjs'),require('../simulation/evaluation/2026-11/agent50-rain-board-exposure.cjs'),require('../simulation/evaluation/2026-11/agent50-rain-candidate-advice.cjs')));
