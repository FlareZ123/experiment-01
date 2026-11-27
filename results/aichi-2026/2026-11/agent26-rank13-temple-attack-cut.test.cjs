'use strict';
const {planTempleDenial}=require('./agent26-rank13-temple-attack-cut.cjs');
function regression(plan){
 const checks=[];function ck(n,c){if(!c)throw Error("FAIL "+n);checks.push(n);}
 const base={templeInPlay:true,discard:["Megaton Blower","Crispin","Dialga-GX","Kyurem"],lost:["Silent Lab","Parallel City"],targets:[{id:"drago",G:1,F:0,D:1}],legacyPossible:true,vsSeekerPossible:true,mistPossible:true,getLostPossible:true};
 const a=plan(base);ck("unique dual cut",a.denying.length===1&&a.denying[0].cards.join("/")=="Megaton Blower/Crispin");
 ck("Mist allows Megaton",a.options[0].escapes.some(x=>x.removal==="Megaton Blower"));
 ck("payload pair fails",!a.options.find(x=>x.cards.join("/")=="Dialga-GX/Kyurem").deniesApex);
 ck("Megaton cut alone permits Crispin",a.options.find(x=>x.cards.join("/")=="Megaton Blower/Dialga-GX").escapes.some(x=>x.supporter==="Crispin"));
 const bs={...base,discard:["Dialga-GX","Kyurem"],lost:["Megaton Blower","Crispin","Silent Lab"]},b=plan(bs);
 ck("Mist uniquely blocks unspent Stadium",b.denying.length===1&&b.denying[0].action==="Shadow Mist"&&b.options[1].escapes.some(x=>x.removal==="Parallel City"));
 const c=plan({...base,lost:["Silent Lab"],discard:["Megaton Blower","Dialga-GX","Kyurem"]});ck("both removal channels defeat either attack",c.denying.length===0);
 const ds={...base,lost:["Silent Lab","Parallel City","Megaton Blower","Crispin"],discard:["Dialga-GX","Kyurem"]},d=plan(ds);ck("both actions deny with exhausted routes",d.denying.length===2);
 ck("two Grass permit manual Fire",plan({...base,targets:[{G:2,F:0,D:1}]}).denying.length===0);
 const e=plan({...base,targets:[{G:0,F:0,D:1}]});ck("zero colored Basics only Megaton cut required",e.denying.length===3&&e.denying.every(x=>x.cards.includes("Megaton Blower")));
 const f={...base,discard:["Crispin","Dialga-GX"],lost:["Megaton Blower","Silent Lab","Parallel City"],targets:[{G:0,F:1,D:1}],manualTypes:[]};
 ck("Crispin cannot fetch two Grass",plan(f).options[0].deniesApex);
 ck("independent Grass permits double Grass",!plan({...f,manualTypes:["G"]}).options[0].deniesApex);
 ck("one attached Grass and Crispin pay GGF",!plan({...f,targets:[{G:1,F:0,D:1}]}).options[0].deniesApex);
 ck("one Basic type cannot accelerate",plan({...f,targets:[{G:1,F:0,D:1}],crispinDeckTypes:["G"]}).options[0].deniesApex);
 ck("spent Legacy and absent VS cut both recoveries",plan({...base,legacyPossible:false,vsSeekerPossible:false}).options[0].deniesApex);
 ck("VS alone recovers Crispin",plan({...base,legacyPossible:false,vsSeekerPossible:true}).options[0].escapes.some(x=>x.supporter==="Crispin"));
 ck("Mist KO enables Raihan on survivor",!plan({...ds,mistKO:true,afterMistTargets:[{G:1,F:0,D:1}]}).options[0].deniesApex);
 ck("Raihan off after nonKO",d.options[0].deniesApex);
 ck("second attacker defeats cut",plan({...base,targets:[{G:1,F:0,D:1},{G:2,F:0,D:0}]}).denying.length===0);
 ck("unoffered Get Lost excluded",plan({...base,getLostPossible:false}).denying.length===0);
 ck("unoffered Mist excluded",plan({...bs,mistPossible:false}).denying.length===0);
 ck("single discard target",plan({...base,discard:["Megaton Blower"],lost:["Silent Lab","Parallel City","Crispin"]}).denying[0].cards.length===1);
 const g=plan({...bs,targets:[{G:1,F:0,D:0}],manualTypes:["D"]});ck("Mist blocks new DDE",g.options[0].deniesApex&&!g.options[1].deniesApex);
 ck("new DDE under Temple cannot pay colors",plan({...ds,targets:[{G:1,F:0,D:0}],manualTypes:["D"]}).denying.length===2);
 ck("unseen singleton remains possible",plan({...ds,lost:["Silent Lab","Parallel City","Crispin"]}).denying.length===0);
 let threw=false;try{plan({...base,templeInPlay:false})}catch{threw=true}ck("no Temple fails closed",threw);
 return {checks,caseA:a,caseB:b,caseC:c,caseD:d,caseE:e};
}
console.log(JSON.stringify(regression(planTempleDenial),null,2));
