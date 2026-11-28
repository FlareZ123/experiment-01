'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {planJointKnownTurn}=require('./joint_turn_search.cjs');
const b=(kind,active)=>({id:kind,kind,active,tool:'',energy:[],counters:0});
const h=kind=>({id:kind,kind});
const e=(id,zone,counters=0)=>({id,zone,counters});
const empty=()=>({tm:0,float:0,col:0,rope:0,pump:0,carrier:0});
function scenario({float=false,twoEggs=false,carrier=false}={}){
 const powerInput={firstTurnGoingFirst:true,ropeSafe:true,wobLocked:false,
  itemsPlayable:true,toolsPlayable:true,ruins:true,manualAvailable:true,
  retreatAvailable:true,dowsingAvailable:true,debutEffective:true,fodder:2,
  lightningHand:0,lightningDiscard:1,dceHand:1,attackerId:'M',
  board:[b('M',true)],handBasics:[h('K'),h('S')],
  trainersHand:{tm:1,rope:1,...(float?{float:1}:{})},maxStates:100000};
 const physical={hand:{...empty(),tm:1,rope:1,pump:4,
    ...(float?{float:1}:{}),...(carrier?{carrier:1}:{})},
  discard:empty(),dowsingAvailable:true,fodder:2,kokoId:'K'};
 const makeDonationInput=final=>({
  finishReady:true,itemsPlayable:true,riskyRuinsActive:true,opponentBenchCount:0,
  propagationAvailable:true,farewellAvailable:true,opponentPrizes:6,
  carriers:carrier?1:0,drawCapacity:20,
  eggs:[e('e0','H'),e('e1',twoEggs?'H':'X')],unown:[e('u0','H'),...(twoEggs?[]:[e('u1','H')])],
  fixed:[e('M','A',final.board.find(x=>x.id==='M').counters),
         e('S','B',final.board.find(x=>x.id==='S').counters)],
  handDonors:[],maxStates:100000
 });
 return {powerInput,physical,makeDonationInput};
}
test('two-Rope route and one Egg is rejected: five Pumps need already spent Dowsing',()=>{
 const r=planJointKnownTurn(scenario());
 assert.equal(r.status,'no-verified-joint-resource-trace');
 assert.ok(r.checks.some(c=>c.phase==='joint-physical'&&
   c.reason==='DOWSING_ALREADY_SPENT'&&c.donationPumps===5));
});
test('source Float pivot preserves Dowsing and makes one-Egg five-Pump route payable',()=>{
 const r=planJointKnownTurn(scenario({float:true}));
 assert.equal(r.status,'feasible-joint-resource-trace');
 assert.equal(r.power.dowsingUsed,false);
 assert.equal(r.donation.pumpsUsed,5);
 assert.equal(r.physical.dowsingUsed,true);
 assert.equal(r.physical.spent.pump,5);
});
test('two accessible Eggs plus one Carrier give an alternative with Dowsing spent on Rope',()=>{
 const r=planJointKnownTurn(scenario({twoEggs:true,carrier:true}));
 assert.equal(r.status,'feasible-joint-resource-trace');
 assert.equal(r.power.dowsingUsed,true);
 assert.equal(r.donation.pumpsUsed,3);
 assert.equal(r.physical.spent.carrier,1);
 assert.equal(r.physical.spent.pump,3);
});
test('never accepts mismatch between physical Dowsing and power planner',()=>{
 const s=scenario();s.physical.dowsingAvailable=false;
 assert.equal(planJointKnownTurn(s).status,'invalid');
});

test('partial-Prize state needs zero donated Prizes and burns no Pump or Dowsing',()=>{
 const s=scenario({float:true});const original=s.makeDonationInput;
 s.makeDonationInput=(final,actions)=>({...original(final,actions),opponentPrizes:1});
 const r=planJointKnownTurn(s);
 assert.equal(r.status,'feasible-joint-resource-trace');
 assert.equal(r.pumpBudget,0);
 assert.equal(r.donation.actions.length,0);
 assert.equal(r.physical.spent.pump??0,0);
 assert.equal(r.physical.dowsingUsed,false);
});

test('donation projection cannot omit real Bench occupant and invent free space',()=>{
 const s=scenario({float:true});const orig=s.makeDonationInput;
 s.makeDonationInput=(final,actions)=>{
  const d=orig(final,actions);d.fixed=d.fixed.filter(x=>x.id!=='S');return d;
 };
 const r=planJointKnownTurn(s);
 assert.equal(r.status,'no-verified-joint-resource-trace');
 assert.ok(r.checks.some(x=>x.reason==='MISSING_POST_POWER_BOARD_CARD'));
});
test('donation projection cannot fabricate a benched two-counter donor',()=>{
 const s=scenario({float:true});const orig=s.makeDonationInput;
 s.makeDonationInput=(final,actions)=>{
  const d=orig(final,actions);d.fixed.push(e('phantom','B',2));return d;
 };
 const r=planJointKnownTurn(s);
 assert.equal(r.status,'no-verified-joint-resource-trace');
 assert.ok(r.checks.some(x=>x.reason==='INVENTED_POST_POWER_BOARD_CARD'));
});

test('Koko cannot be revived as a donor from hand after Dance sent it to the Lost Zone',()=>{
 const s=scenario({float:true});const orig=s.makeDonationInput;
 s.makeDonationInput=(final,actions)=>{
  const d=orig(final,actions);
  d.handDonors.push({id:'K',zone:'H',counters:0,darkness:false});
  return d;
 };
 const r=planJointKnownTurn(s);
 assert.equal(r.status,'no-verified-joint-resource-trace');
 assert.ok(r.checks.some(x=>x.reason==='POST_POWER_LOST_ZONE_RESURRECTION'));
});
