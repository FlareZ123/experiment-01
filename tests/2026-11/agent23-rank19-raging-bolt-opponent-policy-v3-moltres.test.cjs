'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const mod=require('../../simulation/evaluation/2026-11/agent23-rank19-raging-bolt-opponent-policy-v3-moltres.cjs');
const M='Galarian Moltres V CRE',V='Shadow Rider Calyrex V CRE',MAX='Shadow Rider Calyrex VMAX CRE',D='Darkness Energy MEE',L='Lightning Energy MEE',F='Fighting Energy MEE';
const mon=(printing,hp,energies=[],damage=0,tools=[])=>({printing,hp,damage,energies,tools,printed:{retreatCost:['Colorless']},abilitySuppressions:[]});
const molt=(energies=[D,D,L],damage=0)=>mon(M,220,energies,damage);
const vmax=()=>mon(MAX,320), v=()=>mon(V,210);
const adp=()=>mon('Arceus & Dialga & Palkia-GX CEC',280);
const latias=()=>({...mon('Latias ex SSP',210),abilitySuppressions:[{abilityName:'Skyliner',suppressed:false}]});
const root=(token,kind,fields={})=>({token,kind,...fields});
const burn=root('burn','attack',{actorPrinting:M,attackName:'Aura Burn',publicMetadata:{attackCostPayable:true}});
const gust=root('guzma','play-card',{actorPrinting:'Guzma BUS'});
const hand=root('carmine','play-card',{actorPrinting:'Carmine TWM'});
const pass=root('pass','pass');
const benchSlot=(a,b,c)=>[a,b,c,null,null];
function request(seat,active,bench,defender,oppBench,items,extra={}){
 return {role:'opponent',seat,observation:{actorSeat:seat,ownHand:extra.hand??[],ownPublic:{active,bench,discard:extra.discard??[]},opponentPublic:{active:defender,bench:oppBench}},actionFrontier:{items},...extra.request};
}
function wing(seat,index=0){return root('wings','use-ability',{actorPrinting:M,publicMetadata:{abilityName:'Direflame Wings',sourceSeat:seat,sourceZone:'bench',sourceIndex:index}});}
function attach(token,seat,energy,index=0){return root(token,'play-card',{actorPrinting:energy,targetPrinting:M,publicMetadata:{targetSeat:seat,targetZone:'bench',targetIndex:index}});}
function retreat(seat,index=0){return root('pivot','retreat',{actorPrinting:'Arceus & Dialga & Palkia-GX CEC',targetPrinting:M,publicMetadata:{targetSeat:seat,targetZone:'bench',targetIndex:index}});}
const pick=(token,printing,ownerSeat,benchIndex)=>({kind:'pokemon',token,printing,publicMetadata:{ownerSeat,targetZone:'bench',benchIndex,isOwnerVisible:true}});
function prompt(type,effect,printing,choices){return {promptType:type,source:{effectName:effect,sourcePrinting:printing},choices,publicMetadata:{minimumCount:1,maximumCount:1}};}
const sel=token=>({kind:'select-action',token}), choices=token=>({kind:'select-choices',tokens:[token]});
for(const seat of [0,1]){
 test('seat '+seat+' paid Aura Burn wins direct three-Prize target before Guzma or draw',()=>{
   assert.deepEqual(mod.tacticalRoot(request(seat,molt(),[],vmax(),[v()], [hand,gust,burn,pass])),sel('burn'));
 });
 test('seat '+seat+' prioritize Wings then fill Colorless without spending Darkness',()=>{
   const first=request(seat,adp(),benchSlot(molt([D,L])),vmax(),[],[attach('manual',seat,D),wing(seat),pass],{discard:[D]});
   assert.deepEqual(mod.tacticalRoot(first),sel('wings'));
   const second=request(seat,adp(),benchSlot(molt([D,D])),vmax(),[],[attach('dark',seat,D),attach('fight',seat,F),pass]);
   assert.deepEqual(mod.tacticalRoot(second),sel('fight'));
 });
 test('seat '+seat+' missing Darkness is not substituted by extra Fighting',()=>{
   const r=request(seat,adp(),benchSlot(molt([D,L])),vmax(),[],[attach('fight',seat,F),attach('dark',seat,D),pass]);
   assert.deepEqual(mod.tacticalRoot(r),sel('dark'));
 });
 test('seat '+seat+' use only native free pivot to ready Moltres',()=>{
   const r=request(seat,adp(),benchSlot(molt(),latias()),vmax(),[],[retreat(seat),pass]);
   assert.deepEqual(mod.tacticalRoot(r),sel('pivot'));
   r.observation.ownPublic.bench[1].abilitySuppressions[0].suppressed=true;
   assert.equal(mod.tacticalRoot(r),null);
 });
 test('seat '+seat+' Guzma root and both exact recipient prompts',()=>{
   const r=request(seat,adp(),benchSlot(molt()),v(),benchSlot(v(),vmax()),[hand,gust,pass]);
   assert.deepEqual(mod.tacticalRoot(r),sel('guzma'));
   r.prompt=prompt('ChoosePokemonPrompt','Guzma','Guzma BUS',[pick('v',V,'opponent',0),pick('max',MAX,'opponent',1)]);
   assert.deepEqual(mod.tacticalPrompt(r),choices('max'));
   r.observation.opponentPublic.active=vmax();
   r.prompt=prompt('ChoosePokemonPrompt','Guzma','Guzma BUS',[pick('own',M,'actor',0)]);
   assert.deepEqual(mod.tacticalPrompt(r),choices('own'));
 });
 test('seat '+seat+' Darkness prompt excludes wrong zones and wrong ownership',()=>{
   const r=request(seat,adp(),benchSlot(molt([D])),vmax(),[],[]);
   const c=(token,printing,ownerSeat,sourceZone)=>({token,kind:'card',printing,publicMetadata:{ownerSeat,sourceZone,isOwnerVisible:true}});
   r.prompt=prompt('ChooseCardsPrompt','Direflame Wings',M,[c('wrong','Darkness Energy MEE','opponent','discard'),c('hand',D,'actor','hand'),c('light',L,'actor','discard'),c('good',D,'actor','discard')]);
   assert.deepEqual(mod.tacticalPrompt(r),choices('good'));
 });
 test('seat '+seat+' wrong seat/index, unknown tool, self-KO, or no paid attack suppress tactical override',()=>{
   assert.equal(mod.tacticalRoot(request(seat,molt([D,D,L],190),[],vmax(),[],[burn,pass])),null);
   const protectedMax=mon(MAX,320,[],0,['Unknown defensive Tool']);
   assert.equal(mod.tacticalRoot(request(seat,molt(),[],protectedMax,[],[burn,pass])),null);
   assert.equal(mod.tacticalRoot(request(seat,adp(),benchSlot(molt([D,D])),vmax(),[],[attach('other',1-seat,L),attach('wrong-index',seat,L,2),pass])),null);
   assert.equal(mod.tacticalRoot(request(seat,molt(),[],vmax(),[],[{...burn,publicMetadata:{attackCostPayable:false}},pass])),null);
 });
 test('seat '+seat+' no gratuitous attachment to funded Moltres and no off-target tactical override',()=>{
   assert.equal(mod.tacticalRoot(request(seat,adp(),benchSlot(molt()),vmax(),[],[attach('extra',seat,D),pass])),null);
   assert.equal(mod.tacticalRoot(request(seat,molt(),[],adp(),[],[burn,pass])),null);
 });
}
test('accepts numbered fixed printings in addition to native set-only aliases',()=>{
 assert.equal(mod.targetValue(mon('Shadow Rider Calyrex VMAX CRE 75',320)),3);
 assert.equal(mod.targetValue(mon('Shadow Rider Calyrex V CRE 74',210)),2);
 assert.equal(mod.targetValue(mon('Shadow Rider Calyrex V CRE 75',210)),0);
 assert.equal(mod.ready(mon('Galarian Moltres V CRE 97',220,['Darkness Energy MEE 15','Darkness Energy MEE 15','Fighting Energy MEE 14'])),true);
});
test('wrong owner role fails closed before fallback',()=>{
 const policy=mod.createPolicy({role:'opponent',seat:0,policyVersion:mod.POLICY_VERSION,config:{}});
 assert.deepEqual(policy.decide({role:'candidate',seat:0,observation:{actorSeat:0}}),{kind:'abstain',reasonCode:'ROLE_SEAT_BINDING_MISMATCH'});
});
