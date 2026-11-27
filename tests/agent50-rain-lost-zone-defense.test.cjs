'use strict';
function runCases(module){
 const f=module.planLostZoneDefense,print={reversal:'Reversal Energy PAL',counter:'Counter Energy CIN',unit:'Unit Energy LPM UPR'};
 const cards=(r,c,u,prefix='')=>Object.entries({reversal:r,counter:c,unit:u}).flatMap(([k,n])=>Array.from({length:n},(_,i)=>({printing:print[k],token:prefix+k+i})));
 const target=(id,hp,p,flat=0)=>({id,remainingHp:hp,prizes:p,flatDamageModifier:flat,damageAllowed:true});
 const input={modifiersComplete:true,attackWindowKnown:true,ownPrizes:6,opponentPrizes:6,availableBombs:2,
  additionalDiscardCapacity:12,manualAvailable:true,temple:false,discard:cards(2,2,2),attached:[],unseenUpper:{reversal:2,counter:2,unit:2},targets:[target('a',320,3),target('b',320,3,30)]};
 let n=0;const same=(a,b,why)=>{n++;if(JSON.stringify(a)!==JSON.stringify(b))throw Error(why+': '+JSON.stringify(a)+' != '+JSON.stringify(b));};
 const a=f(input);same(a.baseline.terminal,true,'two VMAX ceiling');same(a.best.after.terminal,false,'two Reversal removal denies');same(a.best.tokens,['reversal0','reversal1'],'physical Reversal priority');
 const b=f({...input,availableBombs:1,targets:[target('g',90,1),target('t',270,3,30),target('l',170,2,30)]});
 same(b.baseline.terminal,true,'single Bomb plus manual six prize line');same(b.best.after.terminal,false,'Reversal denial');same(b.best.tokens,['reversal0','reversal1'],'same priority for different board');
 const c=f({...input,ownPrizes:1,opponentPrizes:6,targets:[target('x',90,1)]});same(c.best.after.units,2,'inactive conditional Energy');same(c.best.tokens,['unit0','unit1'],'Unit priority when conditional Energy never live');
 same(f({...input,opponentPrizes:2,manualAvailable:false}).improvement,false,'unsafe self KO prohibited');
 same(f({...input,temple:true}).baseline.units,0,'Temple suppression');
 same(f({...input,targets:[{...target('x',90,1),requiresNoSpecialAttached:true}]}).status,'unsupported-public-envelope','dynamic protection requires exact kernel');
 const attached=f({...input,ownPrizes:3,opponentPrizes:1,availableBombs:0,manualAvailable:false,attached:cards(2,2,0,'a'),discard:cards(0,0,2),unseenUpper:{reversal:0,counter:0,unit:0},targets:[target('x',90,1)]});
 same(attached.baseline.terminal,true,'already charged boardout');same(attached.improvement,false,'discard removal cannot undo attachments');
 same(f({...input,unseenUpper:{reversal:3,counter:2,unit:2}}).status,'unsupported-public-envelope','reject impossible source count');
 const depleted=f({...input,additionalDiscardCapacity:0,manualAvailable:false,discard:cards(2,2,2),targets:[target('x',320,3),target('y',170,2,30)]});
 same(depleted.baseline.terminal,false,'funded access cap rather than whole inventory');
 return {assertions:n};
}
module.exports={runCases};
if(typeof require==='function'&&require.main===module)process.stdout.write(JSON.stringify(runCases(require('../simulation/evaluation/2026-11/agent50-rain-lost-zone-defense.cjs')))+'\n');
