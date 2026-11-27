'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const mod=require('../../simulation/evaluation/2026-11/agent23-rank19-raging-bolt-opponent-policy-v3-moltres.cjs');
const M='Galarian Moltres V CRE',V='Shadow Rider Calyrex V CRE',MAX='Shadow Rider Calyrex VMAX CRE',D='Darkness Energy MEE',L='Lightning Energy MEE',F='Fighting Energy MEE';
const mon=(printing,hp,energies=[],damage=0,tools=[])=>({printing,hp,damage,energies,tools,printed:{retreatCost:['Colorless']},abilitySuppressions:[]});
const molt=(energies=[D,D,L],damage=0)=>mon(M,220,energies,damage);
const vmax=()=>mon(MAX,320), v=()=>mon(V,210);
const adp=()=>mon('Arceus & Dialga & Palkia GX CEC',280);
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
function retreat(seat,index=0){return root('pivot','retreat',{actorPrinting:'Arceus & Dialga & Palkia GX CEC',targetPrinting:M,publicMetadata:{targetSeat:seat,targetZone:'bench',targetIndex:index}});}
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
   r.prompt.publicMetadata={minimumCount:0,maximumCount:1,allowCancel:true};
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

for(const seat of [0,1]){
 test('seat '+seat+' prioritize terminal gust over free pivot to a two-Prize target',()=>{
   const r=request(seat,adp(),benchSlot(molt(),latias()),v(),benchSlot(vmax()),[retreat(seat),gust,pass]);
   r.observation.ownPublic.prizeCount=3;
   assert.deepEqual(mod.tacticalRoot(r),sel('guzma'));
   r.observation.ownPublic.prizeCount=2;
   assert.deepEqual(mod.tacticalRoot(r),sel('pivot'));
 });
 test('seat '+seat+' active Moltres gust and return wins three-Prize target if retreat remains',()=>{
   const r=request(seat,molt(),benchSlot(latias()),v(),benchSlot(vmax()),[burn,gust,pass]);
   r.observation.ownPublic.prizeCount=3;
   r.observation.globalTurn=7;
   r.observation.ownTurnResources={retreatedTurn:0};
   assert.deepEqual(mod.tacticalRoot(r),sel('guzma'));
   r.prompt=prompt('ChoosePokemonPrompt','Guzma','Guzma BUS',[pick('max',MAX,'opponent',0)]);
   assert.deepEqual(mod.tacticalPrompt(r),choices('max'));
   r.observation.opponentPublic.active=vmax();
   r.prompt=prompt('ChoosePokemonPrompt','Guzma','Guzma BUS',[pick('latias','Latias ex SSP','actor',0)]);
   assert.deepEqual(mod.tacticalPrompt(r),choices('latias'));
   delete r.prompt;
   r.observation.ownPublic.active=latias();
   r.observation.ownPublic.bench=benchSlot(molt());
   r.actionFrontier.items=[retreat(seat),pass];
   assert.deepEqual(mod.tacticalRoot(r),sel('pivot'));
 });
 test('seat '+seat+' no terminal gust-return when retreat has already been used',()=>{
   const r=request(seat,molt(),benchSlot(latias()),v(),benchSlot(vmax()),[burn,gust,pass]);
   r.observation.ownPublic.prizeCount=3;
   r.observation.globalTurn=7;
   r.observation.ownTurnResources={retreatedTurn:7};
   assert.deepEqual(mod.tacticalRoot(r),sel('burn'));
 });
 test('seat '+seat+' fixed-source set-only printing adapter activates historical roots without mutating request',()=>{
   const r=request(seat,adp(),[],v(),[],[root('dde','play-card',{actorPrinting:'Double Dragon Energy ROS',targetPrinting:'Arceus & Dialga & Palkia GX CEC',publicMetadata:{targetSeat:seat,targetZone:'active',targetIndex:0}}),pass]);
   const snapshot=JSON.stringify(r);
   const mapped=mod.v2Request(r);
   assert.equal(mapped.actionFrontier.items[0].actorPrinting,'Double Dragon Energy ROS 97');
   assert.equal(mapped.actionFrontier.items[0].publicMetadata.targetPrinting,'Arceus & Dialga & Palkia-GX CEC 156');
   assert.equal(mapped.observation.ownPublic.active.printing,'Arceus & Dialga & Palkia-GX CEC 156');
   assert.equal(mapped.actionFrontier.items[0].token,'dde');
   assert.equal(JSON.stringify(r),snapshot);
   const policy=mod.createPolicy({role:'opponent',seat,policyVersion:mod.POLICY_VERSION,config:{}});
   assert.deepEqual(policy.decide(r),sel('dde'));
 });
}

for(const seat of [0,1]){
 const qb=root('qb','play-card',{actorPrinting:'Quick Ball FST'});
 const bc=root('bc','play-card',{actorPrinting:'Battle Compressor PHF'});
 const vip=root('vip','play-card',{actorPrinting:'Battle VIP Pass FST'});
 const card=(token,printing,sourceZone,ownerSeat='actor')=>({kind:'card',token,printing,publicMetadata:{sourceZone,ownerSeat,isOwnerVisible:true}});
 test('seat '+seat+' Compressor seeds Darkness before manual attachment',()=>{
   const r=request(seat,adp(),benchSlot(molt([D])),vmax(),[],[bc,attach('manual',seat,D),pass],{hand:[D]});
   assert.deepEqual(mod.tacticalRoot(r),sel('bc'));
   r.prompt=prompt('ChooseCardsPrompt','Battle Compressor','Battle Compressor PHF',[card('foreign',D,'deck','opponent'),card('l',L,'deck'),card('d',D,'deck'),card('d2',D,'deck'),card('f',F,'deck')]);
   r.prompt.publicMetadata={minimumCount:0,maximumCount:3};
   assert.deepEqual(mod.tacticalPrompt(r),{kind:'select-choices',tokens:['d','l','f']});
 });
 test('seat '+seat+' Quick Ball turns Darkness into Wings fuel then finds Moltres',()=>{
   const r=request(seat,adp(),benchSlot(),vmax(),[],[qb,pass],{hand:[D,L]});
   assert.deepEqual(mod.tacticalRoot(r),sel('qb'));
   r.prompt=prompt('ChooseCardsPrompt','Quick Ball','Quick Ball FST',[card('l',L,'hand'),card('foreign',D,'hand','opponent'),card('d',D,'hand')]);
   assert.deepEqual(mod.tacticalPrompt(r),choices('d'));
   r.observation.ownPublic.discard=[D];
   r.prompt=prompt('ChooseCardsPrompt','Quick Ball','Quick Ball FST',[card('bolt','Raging Bolt ex TEF','deck'),card('mol',M,'deck')]);
   r.prompt.publicMetadata={minimumCount:0,maximumCount:1};
   assert.deepEqual(mod.tacticalPrompt(r),choices('mol'));
 });
 test('seat '+seat+' VIP obtains Moltres and Latias rather than two unrelated attackers',()=>{
   const r=request(seat,adp(),benchSlot(),vmax(),[],[vip,pass],{discard:[D]});
   assert.deepEqual(mod.tacticalRoot(r),sel('vip'));
   r.prompt=prompt('ChooseCardsPrompt','Battle VIP Pass','Battle VIP Pass FST',[card('bolt','Raging Bolt ex TEF','deck'),card('mol',M,'deck'),card('latias','Latias ex SSP','deck')]);
   r.prompt.publicMetadata={minimumCount:0,maximumCount:2};
   assert.deepEqual(mod.tacticalPrompt(r),{kind:'select-choices',tokens:['mol','latias']});
 });
 test('seat '+seat+' do not discard additional Darkness once Moltres has fuel',()=>{
   const r=request(seat,adp(),benchSlot(molt([D])),vmax(),[],[qb,pass],{hand:[D],discard:[D]});
   assert.equal(mod.tacticalRoot(r),null);
   r.prompt=prompt('ChooseCardsPrompt','Quick Ball','Quick Ball FST',[card('d',D,'hand')]);
   assert.equal(mod.tacticalPrompt(r),null);
 });
}

for(const seat of [0,1]){
 const bird='Ho-Oh-EX DRX';
 const bc=root('bc','play-card',{actorPrinting:'Battle Compressor PHF'});
 const qb=root('qb','play-card',{actorPrinting:'Quick Ball FST'});
 const card=(token,printing,sourceZone='deck')=>({kind:'card',token,printing,publicMetadata:{sourceZone,ownerSeat:'actor',isOwnerVisible:true}});
 test('seat '+seat+' second Compressor completes Ho-Oh route even with three types already discarded',()=>{
  const r=request(seat,adp(),benchSlot(molt([D,D,L])),vmax(),[],[bc,pass],{discard:[D,L,F]});
  assert.deepEqual(mod.tacticalRoot(r),sel('bc'));
  r.prompt=prompt('ChooseCardsPrompt','Battle Compressor','Battle Compressor PHF',[card('bird',bird),card('d',D),card('l',L)]);
  r.prompt.publicMetadata={minimumCount:0,maximumCount:3};
  assert.deepEqual(mod.tacticalPrompt(r),choices('bird'));
 });
 test('seat '+seat+' Compressor puts Ho-Oh and two distinct Basic types in discard from empty',()=>{
  const r=request(seat,adp(),benchSlot(molt([D])),vmax(),[],[bc,pass]);
  r.prompt=prompt('ChooseCardsPrompt','Battle Compressor','Battle Compressor PHF',[card('l',L),card('d',D),card('f',F),card('bird',bird)]);
  r.prompt.publicMetadata={minimumCount:0,maximumCount:3};
  assert.deepEqual(mod.tacticalPrompt(r),{kind:'select-choices',tokens:['d','bird','l']});
 });
 test('seat '+seat+' Quick Ball discards Ho-Oh when all three types are already present',()=>{
  const r=request(seat,adp(),benchSlot(molt([D,D,L])),vmax(),[],[qb,pass],{hand:[bird,D],discard:[D,L,F]});
  assert.deepEqual(mod.tacticalRoot(r),sel('qb'));
  r.prompt=prompt('ChooseCardsPrompt','Quick Ball','Quick Ball FST',[card('d',D,'hand'),card('bird',bird,'hand')]);
  assert.deepEqual(mod.tacticalPrompt(r),choices('bird'));
 });
}
