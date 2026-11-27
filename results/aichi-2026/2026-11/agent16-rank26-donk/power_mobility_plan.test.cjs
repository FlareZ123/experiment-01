'use strict';const {test}=require('node:test');const assert=require('node:assert/strict');
const {planPowerMobility:p}=require('./power_mobility_plan.cjs');
const b=(kind,active,tool='',energy=[])=>({id:kind,kind,active,tool,energy,counters:0});const h=kind=>({id:kind,kind});
const base=over=>({firstTurnGoingFirst:true,ropeSafe:true,wobLocked:false,itemsPlayable:true,toolsPlayable:true,ruins:true,manualAvailable:true,retreatAvailable:true,dowsingAvailable:false,debutEffective:true,fodder:0,lightningHand:0,lightningDiscard:1,dceHand:1,attackerId:'M',board:[b('S',true)],handBasics:[h('M'),h('K')],trainersHand:{float:1,tm:1},...over});
test('one Lightning, Koko second target, normal pivot',()=>{const r=p(base());assert.equal(r.status,'solved');assert.ok(r.actions.some(a=>a.kind==='dance'&&a.targets.includes('K')&&a.lightning===1));assert.equal(r.final.board.find(x=>x.id==='M').active,true);});
test('active Meloetta needs a Rope before Dance plus return mobility',()=>{const o={board:[b('M',true)],handBasics:[h('K'),h('S')]};assert.equal(p(base(o)).status,'unreachable-under-model');const r=p(base({...o,trainersHand:{rope:1,float:1,tm:1}}));assert.equal(r.status,'solved');const a=r.actions.map(a=>a.kind);assert.ok(a.indexOf('escape-rope')<a.indexOf('dance'));assert.ok(a.indexOf('dance')<a.indexOf('retreat'));});
test('active Koko requires two mobility events',()=>{const o={board:[b('K',true)],handBasics:[h('M'),h('S')]};assert.equal(p(base(o)).status,'unreachable-under-model');const r=p(base({...o,trainersHand:{rope:1,float:1,tm:1}}));assert.equal(r.status,'solved');assert.ok(r.actions.some(a=>a.kind==='escape-rope'));assert.ok(r.actions.some(a=>a.kind==='retreat'));});
test('Dowsing can recover Rope for two-switch route',()=>{const r=p(base({board:[b('M',true)],handBasics:[h('K'),h('S')],trainersHand:{rope:1,tm:1},dowsingAvailable:true,fodder:2}));assert.equal(r.status,'solved');assert.equal(r.dowsingUsed,true);assert.equal(r.actions.filter(a=>a.kind==='escape-rope').length,2);});
test('Crobat with Stone cannot also hold Float',()=>{const o={board:[b('C',true,'fss')]};assert.equal(p(base(o)).status,'unreachable-under-model');assert.equal(p(base({...o,trainersHand:{rope:1,tm:1}})).status,'solved');});
test('Wobbuffet lock blocks Dance until Cologne',()=>{assert.equal(p(base({wobLocked:true})).status,'unreachable-under-model');const r=p(base({wobLocked:true,trainersHand:{float:1,tm:1,col:1}}));assert.equal(r.status,'solved');assert.ok(r.actions.findIndex(a=>a.kind==='cologne')<r.actions.findIndex(a=>a.kind==='dance'));});
test('cannot spend DCE on retreat, cannot replace an attached tool',()=>{assert.equal(p(base({board:[b('M',true,'float')],handBasics:[h('K'),h('S')],trainersHand:{rope:1,tm:1}})).status,'unreachable-under-model');assert.equal(p(base({dceHand:0,board:[b('S',true,'',['DCE'])]})).status,'unreachable-under-model');});
test('safe Rope is an explicit precondition',()=>{assert.equal(p(base({ropeSafe:false,trainersHand:{rope:1,tm:1}})).status,'unreachable-under-model');});
test('Bunnelby only legal first turn going second',()=>{const o={attackerId:'B',handBasics:[h('B'),h('K')]};assert.equal(p(base(o)).status,'unreachable-under-model');assert.equal(p(base({...o,firstTurnGoingFirst:false})).status,'solved');});
test('already ready needs no further action',()=>{const r=p(base({board:[b('M',true,'tm',['DCE','L'])],handBasics:[],dceHand:0,lightningDiscard:0,trainersHand:{},manualAvailable:false}));assert.equal(r.status,'solved');assert.deepEqual(r.actions,[]);});
test('a locked full board with no pivot expansion fails closed',()=>{const board=[b('S',true),b('D',false),b('C',false),b('U',false),b('E',false),b('B',false)];assert.equal(p(base({board})).status,'unreachable-under-model');});
test('no falsely declared failure at state cap',()=>assert.equal(p(base({maxStates:1})).status,'limit'));
test('prepowered Benched attacker can hand off to sacrificial promotion planner',()=>{
 const r=p(base({finishMode:'sacrificial-bench',board:[b('E',true)],trainersHand:{tm:1}}));
 assert.equal(r.status,'solved');assert.equal(r.requiresPromotion,true);assert.equal(r.final.board.find(x=>x.id==='M').active,false);
 assert.equal(r.final.board.find(x=>x.id==='E').active,true);
});
test('starting Meloetta can Rope to a damaged sacrificial Egg instead of requiring Float',()=>{
 const r=p(base({finishMode:'sacrificial-bench',board:[b('M',true)],handBasics:[h('K'),h('E')],trainersHand:{rope:1,tm:1}}));
 assert.equal(r.status,'solved');assert.equal(r.final.board.find(x=>x.id==='E').active,true);
 assert.equal(r.final.board.find(x=>x.id==='E').counters,2);assert.equal(r.requiresPromotion,true);
});
