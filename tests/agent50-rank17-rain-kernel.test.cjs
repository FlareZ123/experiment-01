'use strict';

// Pure arithmetic/strategy unit tests. No simulated games, no native Store,
// no alternate evaluator. Targets must already be normalized by a trusted
// actor-visible tactical window; the production worker cannot dispatch Rain.
function runCases(worker) {
  const P=worker.planRainTurn,E=worker.energyProvision;
  let count=0;
  const same=(x,y,msg)=>{if(JSON.stringify(x)!==JSON.stringify(y))throw Error(msg+': '+JSON.stringify(x)+' != '+JSON.stringify(y));count++;};
  const card=(k,i)=>({printing:{r:'Reversal Energy PAL 192',c:'Counter Energy CIN 100',u:'Unit Energy LPM UPR 138'}[k],token:k+i});
  const cards=(s)=>s.split('').map((k,i)=>card(k,i));
  const target=(id,hp,prizes,over={})=>({id,remainingHp:hp,prizes,threat:0,damageAllowed:true,
    flatDamageModifier:0,requiresNoSpecialAttached:false,minRemainingEnergy:0,...over});
  const input=(over={})=>({attackWindowKnown:true,modifiersComplete:true,temple:false,ownPrizes:6,
    opponentPrizes:6,availableBombs:0,attached:[],discard:[],targets:[target('a',320,3)],...over});
  same(E('Counter Energy CIN 100',6,4,false),{lightning:2,total:2},'direct official Counter ruling');
  same(E('Reversal Energy PAL 192',6,4,false),{lightning:3,total:3},'rule-derived Reversal provision');
  same(E('Reversal Energy PAL 192',4,4,false),{lightning:0,total:1},'tie disables Reversal');
  same(E('Unit Energy LPM UPR 138',4,4,false),{lightning:1,total:1},'Unit unconditional');
  same(E('Counter Energy CIN 100',6,4,true),{lightning:0,total:1},'Temple suppresses special types and quantity');
  same(E('Reversal Energy PAL 193',6,4,false),null,'wrong source printing');
  let a=P(input({availableBombs:1,discard:cards('rrrrc'),targets:[target('a',320,3),target('b',110,1)]}));
  same(a.win,false,'14 units cannot KO 320 + 110 (11+4)');
  same(a.prizesTaken,3,'take 3 prizes at 11 hits');
  same(a.bombsUsed,1,'Bomb when favorable net Prize swing');
  same(a.discardTokens.length,4,'four Reversal conserve Counter');
  same(a.lightningUnits,12,'12 units used, not four');
  a=P(input({availableBombs:1,discard:cards('rrrrc'),targets:[target('a',320,3,{flatDamageModifier:30}),target('b',110,1)]}));
  same(a.win,true,'one flat +30 reduces 320 threshold to 10, two targets KO');
  same(a.prizesTaken,4,'board-out terminal even with six Prizes remaining');
  same(a.lightningUnits,14,'all 14 selections');
  same(a.allocation,[{targetId:'a',hits:10},{targetId:'b',hits:4}],'flat damage modifier once per selected target');
  a=P(input({availableBombs:2,discard:cards('rrrrccccuu'),targets:[target('a',320,3),target('b',320,3,{flatDamageModifier:30})]}));
  same(a.win,true,'two Bombs fund two VMAX KOs');
  same(a.bombsUsed,2,'need two Bombs');
  same(a.opponentPrizesAfterBomb,2,'opponent takes four Prizes');
  same(a.attachTokens.length,10,'ten cards attached in two Bombs');
  same(a.prizesTaken,6,'six Prize terminal');
  same(a.lightningUnits,21,'at least 21 hits, use exact minimum compatible card subset');
  a=P(input({availableBombs:1,opponentPrizes:2,discard:cards('rrrrc'),targets:[target('a',30,1)]}));
  same(a.status,'no-favorable-immediate-ko','no suicide when opponent has two Prizes');
  a=P(input({availableBombs:1,ownPrizes:2,opponentPrizes:4,discard:cards('rrrcu'),targets:[target('a',60,2)]}));
  same(a.status,'no-favorable-immediate-ko','post-Bomb Prize tie: only Unit supplies Lightning');
  a=P(input({availableBombs:1,ownPrizes:3,opponentPrizes:4,discard:cards('rrrcu'),targets:[target('a',60,2),target('b',400,3)]}));
  same(a.status,'no-favorable-immediate-ko','not a favorable two-for-two Bomb');
  a=P(input({availableBombs:1,ownPrizes:2,opponentPrizes:4,discard:cards('u'),targets:[target('a',30,2)]}));
  same(a.win,true,'fewer than five eligible cards: attach the sole Unit and win');
  same(a.attachTokens.length,1,'exact min(5,eligible)');
  a=P(input({availableBombs:1,attached:cards('u'),discard:[card('r',1)],targets:[target('a',30,1)]}));
  same(a.bombsUsed,0,'already funded board-out: preserve Electrode');
  a=P(input({temple:true,availableBombs:1,discard:cards('rrrrc'),targets:[target('a',30,1)]}));
  same(a.status,'no-lightning-under-temple','Temple hard stop');
  a=P(input({ownPrizes:3,opponentPrizes:2,attached:cards('rcc'),targets:[target('a',30,1),target('protected',60,2,{damageAllowed:false})]}));
  same(a.win,false,'protected target cannot be chosen as guaranteed KO');
  same(a.prizesTaken,1,'only accessible prize');
  same(a.allocation[0].targetId,'a','never allocate to Bench Barrier protected KO');
  a=P(input({ownPrizes:3,opponentPrizes:2,attached:cards('r'),targets:[target('a',60,2,{flatDamageModifier:30}),target('b',60,1)]}));
  same(a.win,true,'Sight bonus on a targeted eligible V/GX only; 1+2 hits');
  same(a.allocation,[{targetId:'a',hits:1},{targetId:'b',hits:2}],'flat +30 exactly once');
  a=P(input({ownPrizes:3,opponentPrizes:2,attached:cards('r'),targets:[target('a',120,2,{flatDamageModifier:30})]}));
  same(a.win,true,'90+30=120');
  a=P(input({ownPrizes:3,opponentPrizes:2,attached:cards('r'),targets:[target('a',150,2,{flatDamageModifier:30})]}));
  same(a.status,'no-favorable-immediate-ko','90+30 is not 180');
  a=P(input({ownPrizes:3,opponentPrizes:2,attached:cards('ru'),targets:[target('a',90,2,{requiresNoSpecialAttached:true})]}));
  same(a.win,true,'post-discard Xurkitree style condition: discard all specials');
  same(a.discardTokens.length,2,'discard extra Unit to clear immunity');
  a=P(input({ownPrizes:3,opponentPrizes:2,attached:cards('ru'),targets:[target('a',30,2,{minRemainingEnergy:3})]}));
  same(a.win,true,'Shuckle-style condition: keep at least three Energy');
  same(a.discardTokens,['u1'],'discard Unit while preserving triple Energy');
  a=P(input({ownPrizes:3,opponentPrizes:2,attached:cards('r'),targets:[target('a',30,2,{minRemainingEnergy:3})]}));
  same(a.status,'no-favorable-immediate-ko','no remaining 3 Energy after discard');
  same(P(input({modifiersComplete:false})).status,'unsupported-public-window','unknown damage modifier fails closed');
  same(P(input({attackWindowKnown:false})).status,'unsupported-public-window','unknown mobility or attack legality fails closed');
  same(P(input({attached:cards('rrrrr')})).status,'unsupported-public-window','source inventory max four each');
  same(P(input({attached:[card('r',0)],discard:[card('r',0)]})).status,'unsupported-public-window','no double counting physical card');
  same(P(input({attached:[{printing:'Unknown Energy',token:'a'}]})).status,'unsupported-public-window','unknown printing fails closed');
  return {assertions:count};
}
module.exports={runCases};
if(typeof require==='function'&&require.main===module){
  process.stdout.write(JSON.stringify(runCases(require('../simulation/evaluation/2026-11/agent50-rank17-raichu-electrode-opponent-policy.cjs')))+'\n');
}
