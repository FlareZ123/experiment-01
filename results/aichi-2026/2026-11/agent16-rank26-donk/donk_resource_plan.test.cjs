'use strict';
const test=require('node:test');const assert=require('node:assert/strict');
const {planDonationResources:p}=require('./donk_resource_plan.cjs');
const e=(id,zone,counters=0)=>({id,zone,counters});
const base=over=>({finishReady:true,itemsPlayable:true,riskyRuinsActive:true,opponentBenchCount:0,
  propagationAvailable:true,farewellAvailable:true,opponentPrizes:6,pumps:3,carriers:1,drawCapacity:20,
  eggs:[e('e0','H'),e('e1','H')],unown:[e('u0','H')],fixed:[e('m','A')],handDonors:[],...over});
test('one physical Unown recycled through Carrier provides both pair donors',()=>{
 const r=p(base());assert.equal(r.status,'solved');assert.equal(r.pumpsUsed,3);assert.equal(r.carriersUsed,1);assert.equal(r.drawsIgnored,1);assert.equal(r.donated,5);
 assert.equal(r.actions.filter(a=>a.kind==='bench'&&a.id==='u0').length,2);
});
test('single donor with no Carrier cannot provide two pair donor events',()=>assert.equal(p(base({carriers:0})).status,'unreachable-under-model'));
test('two physical Unown, no Carrier, three Pumps',()=>{const r=p(base({carriers:0,unown:[e('u0','H'),e('u1','H')]}));assert.equal(r.status,'solved');assert.equal(r.pumpsUsed,3);});
test('partly loaded board uses Farewell Letter to free a slot',()=>{const r=p(base({carriers:0,unown:[e('u0','B',0),e('u1','H')],fixed:[e('m','A',2),e('x','B'),e('y','B')]}));assert.equal(r.status,'solved');assert.ok(r.actions.some(a=>a.kind==='farewell-letter'));});
test('farewell blocked disables reuse',()=>assert.equal(p(base({farewellAvailable:false})).status,'unreachable-under-model'));
test('zero draw capacity conservatively disallows Farewell Letter',()=>assert.equal(p(base({drawCapacity:0})).status,'unreachable-under-model'));
test('Darkness hand donor gains no Ruins counters',()=>assert.equal(p(base({unown:[],fixed:[e('m','A',2)],handDonors:[{...e('crobat','H'),darkness:true}]})).status,'unreachable-under-model'));
test('non-Darkness hand donor supplies missing pair counters',()=>{const r=p(base({unown:[],fixed:[e('m','A',2)],handDonors:[{...e('squawk','H'),darkness:false}]}));assert.equal(r.status,'solved');assert.equal(r.pumpsUsed,3);});
test('no Propagation: two Carriers can restore both pair KOs with fixed donors',()=>{const r=p(base({propagationAvailable:false,carriers:2,unown:[],fixed:[e('m','A',2),e('other','B',2)]}));assert.equal(r.status,'solved');assert.equal(r.carriersUsed,2);});
test('mixed Carrier recovery considers Egg and Unown together',()=>{const r=p(base({opponentPrizes:3,pumps:1,carriers:1,propagationAvailable:false,eggs:[e('e0','D'),e('e1','B',2)],unown:[e('u0','D')]}));assert.equal(r.status,'solved');assert.ok(r.actions.some(a=>a.kind==='rescue-carrier'&&a.ids.includes('e0')&&a.ids.includes('u0')));});
test('cap is reported, not misrepresented as impossibility',()=>assert.equal(p(base({maxStates:1})).status,'limit'));
test('no sixth prize: one remaining stops with no actions',()=>assert.deepEqual(p(base({opponentPrizes:1})).actions,[]));
test('opponent bench and malformed identities rejected',()=>{assert.equal(p(base({opponentBenchCount:1})).status,'invalid');assert.equal(p(base({eggs:[e('e0','H'),e('e0','H')]})).status,'invalid');});
const t=(id,hpRemaining=210,prizes=2)=>({id,hpRemaining,prizes,damagePerPunch:280});
const cert=over=>({attacker:'Bunnelby PRC 121',attackerId:'m',firstTurnGoingFirst:false,barrageEffective:true,
  toolEffective:true,attackReady:true,stableAttackConditions:true,energyUnits:3,ownPrizes:6,
  opponentActive:t('a'),opponentBench:[t('b')],...over});
test('Bunnelby going second expands donation gate only for guaranteed two-hit terminal',()=>{
 const r=p(base({opponentBenchCount:1,terminalAttack:cert()}));assert.equal(r.status,'solved');assert.equal(r.certificate.maxAttacks,2);
 assert.equal(p(base({opponentBenchCount:1,terminalAttack:cert({opponentBench:[t('b',320,3)]})})).status,'invalid');
 assert.equal(p(base({opponentBenchCount:1,terminalAttack:cert({firstTurnGoingFirst:true})})).status,'invalid');
});
test('certificate must match board size and actual attacker ID',()=>{
 assert.equal(p(base({opponentBenchCount:1,terminalAttack:cert({opponentBench:[]})})).status,'invalid');
 assert.equal(p(base({opponentBenchCount:1,terminalAttack:cert({attackerId:'other'})})).status,'invalid');
});
test('one accessible Egg, four Pumps and one Unown KO can donate five',()=>{
 const r=p(base({allowUnownKO:true,pumps:4,carriers:0,eggs:[e('e0','H'),e('e1','X')],
   unown:[e('u0','H'),e('u1','H')],fixed:[e('m','A',2),e('s','B',2),e('d','B',2)]}));
 assert.equal(r.status,'solved');assert.equal(r.pumpsUsed,4);assert.equal(r.donated,5);
 assert.equal(r.actions.filter(a=>a.kind==='damage-pump').flatMap(a=>a.knocked).filter(id=>id.startsWith('u')).length,1);
});
test('one accessible Egg, three Pumps and fresh Unown cannot donate five',()=>{
 const r=p(base({allowUnownKO:true,pumps:3,carriers:0,eggs:[e('e0','H'),e('e1','X')],
   unown:[e('u0','H'),e('u1','H')],fixed:[e('m','A',2),e('s','B',2),e('d','B',2)]}));
 assert.equal(r.status,'unreachable-under-model');
});
