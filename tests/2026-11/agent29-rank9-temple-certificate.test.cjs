'use strict';
const cert=require('../../simulation/evaluation/2026-11/agent29-rank9-temple-certificate.cjs');
console.log('passed '+(function tests(cert){
 const D='Darkness Energy MEE 15',P='Psychic Energy MEE 13',lab='Silent Lab PRC 140',path='Path to the Peak CRE 148',stop='PokéStop PGO 68';
 const pr={stadiumAndToolHaveNoEffectTurnsRemaining:0,attackLockTurnsRemaining:0,attackMaxEnergyTurnsRemaining:0};
 const opponent={printing:'Unown AOR 30',hp:60,damage:0,printed:{resistance:[]},tools:[]};
 const mk=(n=3,e=11,deck=5)=>({ownPublic:{active:{printing:'Shadow Rider Calyrex VMAX CRE 75',hp:320,damage:0,energies:Array(e).fill(P),specialConditions:[],publicRestrictions:{}},bench:[],stadium:['Temple of Sinnoh ASR 155'],prizeCount:n,deckCount:deck,publicTurnRestrictions:pr},opponentPublic:{active:opponent,bench:[{printing:'Mega Absol ex MEG 86',hp:280,damage:0,printed:{resistance:[]},tools:[]}],stadium:[],discard:[lab,lab,path,stop],lostZone:[D,D],prizeCount:6,publicTurnRestrictions:pr}});
 let n=0;
 function a(x,label){if(!x)throw Error(label);n++}
 let o=mk();a(cert(o).certified&&cert(o).minimumFinalAttackDamage===280,'3-Prize robust');
 a(cert(mk(2,10,2)).certified,'2-Prize robust');
 a(cert(mk(1,9,0)).certified,'one attack no draw');
 a(cert(mk(3,10,5)).reason==='PLUMERIA_MARGIN','two Plumeria margin');
 a(cert(mk(3,11,4)).reason==='IONO_AND_DRAW_MARGIN','Iono+draw margin');
 o=mk();o.opponentPublic.lostZone.pop();a(cert(o).reason==='BASIC_DARKNESS_NOT_EXHAUSTED','one Dark enables Lode Search');
 o=mk();o.opponentPublic.discard.pop();a(cert(o).reason==='STADIUM_OUT_REMAINS','four outs needed');
 o=mk();o.ownPublic.active.damage=240;a(cert(o).reason==='DAMAGE_MARGIN','80 incoming exact KO');
 o=mk();o.ownPublic.active.damage=230;a(cert(o).certified,'90 HP > 80 damage');
 o=mk();o.ownPublic.bench=[{printing:'Latias ex SSP 76'}];a(cert(o).reason==='BENCH_GUST_EXPOSURE','gust exposure');
 o=mk();o.ownPublic.publicTurnRestrictions={...pr,stadiumAndToolHaveNoEffectTurnsRemaining:1};a(cert(o).reason==='STADIUM_EFFECT_NOT_CERTAIN','Temple suppressed');
 o=mk();o.opponentPublic.bench[0].printed.resistance=[{type:'Psychic',value:'-30'}];a(cert(o).reason==='PSYCHIC_RESISTANCE','unmodeled resistance');
 o=mk();o.ownPublic.active.energies=Array(6).fill(P);o.ownPublic.bench=[{...o.ownPublic.active,energies:Array(5).fill(P)}];a(cert(o).certified,'two gust-safe VMAXs with 6+5');
 o=mk(2,10,2);o.ownPublic.active.energies=Array(6).fill(P);o.ownPublic.bench=[{...o.ownPublic.active,energies:Array(4).fill(P)}];a(cert(o).certified,'two gust-safe VMAXs with 6+4');
 o.ownPublic.active.energies=Array(7).fill(P);o.ownPublic.bench[0].energies=Array(3).fill(P);a(cert(o).reason==='GUST_PAYMENT_MARGIN','Plumeria then gust can deny CCC');
 o=mk();o.ownPublic.active.energies=Array(6).fill(P);o.ownPublic.bench=[{...o.ownPublic.active,energies:Array(5).fill(P),damage:240}];a(cert(o).reason==='DAMAGE_MARGIN','gust exposed damaged VMAX');
 return n;
})(cert)+' Temple resource-cut assertions');
