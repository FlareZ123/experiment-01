'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {chooseOpeningDiscards,planOpeningHand,
  missingTagCallK1Requirements,dceHandAttachmentBlocked}=
  require('../simulation/twinleaf/rank6-broad-thorns-policy.cjs');

/** @param {string[]} names */
const hand=names=>names.map(name=>({name}));

test('direct DCE and Thunder route consumes no Supporter',()=>{
  const plan=planOpeningHand(hand([
    'Iron Thorns ex','Double Colorless Energy','Thunder Mountain Prism Star'
  ]));
  assert.deepEqual(plan,{channel:'direct',needDce:false,
    needThunder:false,discardCount:0});
});

test('G&H finds missing Thunder and DCE from one legal prompted search',()=>{
  const h=hand(['Iron Thorns ex','Guzma & Hala',
    'Camping Gear','Crushing Hammer','VS Seeker']);
  assert.deepEqual(planOpeningHand(h),{
    channel:'held-guzma-hala',needDce:true,
    needThunder:true,discardCount:2
  });
  assert.deepEqual(chooseOpeningDiscards(h).map(c=>c.name),
    ['Camping Gear','Crushing Hammer']);
});

test('Tag Call is a K0 connector when G&H is absent',()=>{
  const h=hand(['Iron Thorns ex','Tag Call','Plumeria',
    'Crushing Hammer','Palace Book']);
  assert.equal(planOpeningHand(h)?.channel,'tag-call-to-guzma-hala');
});

test('held DCE with missing Stadium can search without discards',()=>{
  assert.deepEqual(planOpeningHand(hand([
    'Iron Thorns ex','Guzma & Hala','Double Colorless Energy'
  ])),{
    channel:'held-guzma-hala',needDce:false,
    needThunder:true,discardCount:0
  });
});

test('in-play Thunder Mountain removes the Stadium search need',()=>{
  const h=hand(['Iron Thorns ex','Double Colorless Energy','Tag Call']);
  assert.deepEqual(planOpeningHand(h,true),{
    channel:'direct',needDce:false,needThunder:false,discardCount:0
  });
});

test('decline when no supporter connector or insufficient discard material',()=>{
  assert.equal(planOpeningHand(hand([
    'Iron Thorns ex','Crushing Hammer','Plumeria'
  ])),null);
  assert.equal(planOpeningHand(hand([
    'Iron Thorns ex','Guzma & Hala','Thunder Mountain Prism Star',
    'Double Dragon Energy','VS Seeker','Megaton Blower'
  ])),null);
});

test('exclude physical ACE SPEC and DCE from discard payments',()=>{
  const h=hand(['Megaton Blower','Double Colorless Energy',
    'Thunder Mountain Prism Star','Guzma & Hala','Tag Call',
    'Tropical Beach','Crushing Hammer']);
  const paid=chooseOpeningDiscards(h);
  assert.deepEqual(paid.map(c=>c.name),['Tropical Beach','Crushing Hammer']);
  assert.ok(paid.every(c=>h.includes(c)));
});

test('source hand can preserve Eri and Faba by spending held alternate cards',()=>{
  const h=hand(['Faba','Speed Lightning Energy','Guzma & Hala',
    'Eri','Tag Call','Captivating Poké Puff','Iron Thorns ex']);
  const priority=['Captivating Poké Puff','Tag Call'];
  assert.deepEqual(chooseOpeningDiscards(h).map(c=>c.name),
    ['Eri','Faba']);
  const protectedPair=chooseOpeningDiscards(h,priority);
  assert.deepEqual(protectedPair.map(c=>c.name),priority);
  assert.equal(new Set(protectedPair).size,2);
  assert.ok(protectedPair.every(card=>h.includes(card)));
  assert.deepEqual(planOpeningHand(h,false,priority),{
    channel:'held-guzma-hala',needDce:true,
    needThunder:true,discardCount:2
  });
});

test('duplicate priority labels never spend one physical hand card twice',()=>{
  const h=hand(['Guzma & Hala','Eri','Tag Call']);
  assert.deepEqual(chooseOpeningDiscards(h,['Tag Call','Tag Call']),
    []);
  assert.equal(planOpeningHand(h,false,['Tag Call','Tag Call']),null);
});

test('held G&H spends spare Tag Call only when explicitly enabled',()=>{
  const h=hand(['Iron Thorns ex','Guzma & Hala','Tag Call',
    'Tropical Beach','Thunder Mountain Prism Star']);
  assert.equal(planOpeningHand(h),null);
  assert.deepEqual(planOpeningHand(h,false,undefined,true),{
    channel:'held-guzma-hala',needDce:true,
    needThunder:false,discardCount:2
  });
  const payments=chooseOpeningDiscards(h,undefined,true);
  assert.deepEqual(payments.map(c=>c.name),['Tropical Beach','Tag Call']);
  assert.equal(new Set(payments).size,2);
});

test('one Tag Call cannot pay for its own search of G&H',()=>{
  const h=hand(['Iron Thorns ex','Tag Call',
    'Tropical Beach','Thunder Mountain Prism Star']);
  assert.equal(planOpeningHand(h,false,undefined,true),null);
  assert.equal(planOpeningHand(h,false,['Tag Call','Tropical Beach']),null);
});

test('second physical Tag Call can pay after first fetched G&H',()=>{
  const h=hand(['Iron Thorns ex','Tag Call','Tag Call',
    'Tropical Beach','Thunder Mountain Prism Star']);
  assert.equal(planOpeningHand(h),null);
  assert.deepEqual(planOpeningHand(h,false,undefined,true),{
    channel:'tag-call-to-guzma-hala',needDce:true,
    needThunder:false,discardCount:2
  });
  // Simulate the actual hand after consuming one Tag Call and obtaining G&H.
  const afterSearch=h.filter((_,i)=>i!==1);
  afterSearch.push({name:'Guzma & Hala'});
  assert.deepEqual(chooseOpeningDiscards(afterSearch,undefined,true)
    .map(c=>c.name),['Tropical Beach','Tag Call']);
});

test('opt-in extra Tag Calls are last-priority and never count twice',()=>{
  const h=hand(['Tag Call','Tag Call','Camping Gear','Eri']);
  assert.deepEqual(chooseOpeningDiscards(h,undefined,true)
    .map(c=>c.name),['Camping Gear','Eri']);
  assert.deepEqual(chooseOpeningDiscards(
    hand(['Tag Call','Tag Call']),undefined,true
  ).map(c=>c.name),['Tag Call','Tag Call']);
  assert.deepEqual(chooseOpeningDiscards(
    hand(['Tag Call']),undefined,true
  ),[]);
});

test('Shadow Mist prevents spending Tag Call and G&H on a blocked Thunder route',()=>{
  const h=hand(['Iron Thorns ex','Tag Call','Tropical Beach',
    'Crushing Hammer','Thunder Mountain Prism Star',
    'Double Colorless Energy']);
  assert.equal(planOpeningHand(h,false,undefined,false,{
    stadiumLocked:true,specialEnergyLocked:true
  }),null);
  assert.equal(planOpeningHand(h,false,undefined,false,{
    stadiumLocked:true
  }),null);
});

test('Stadium lock leaves an already established Thunder route open',()=>{
  const h=hand(['Iron Thorns ex','Double Colorless Energy']);
  assert.deepEqual(planOpeningHand(h,true,undefined,false,{
    stadiumLocked:true
  }),{
    channel:'direct',needDce:false,needThunder:false,discardCount:0
  });
  assert.equal(planOpeningHand(h,true,undefined,false,{
    specialEnergyLocked:true
  }),null);
});

test('a spent or locked Supporter vetoes G&H but not a direct paid route',()=>{
  const h=hand(['Iron Thorns ex','Guzma & Hala','Camping Gear',
    'Crushing Hammer']);
  assert.equal(planOpeningHand(h,false,undefined,false,{
    supporterLocked:true
  }),null);
  assert.equal(planOpeningHand(hand(['Double Colorless Energy',
    'Thunder Mountain Prism Star']),false,undefined,false,{
    supporterLocked:true
  })?.channel,'direct');
});

test('Item lock suppresses the Tag Call connector but permits held G&H',()=>{
  const h=hand(['Iron Thorns ex','Tag Call','Camping Gear',
    'Crushing Hammer']);
  assert.equal(planOpeningHand(h,false,undefined,false,{
    itemLocked:true
  }),null);
  h.push({name:'Guzma & Hala'});
  assert.equal(planOpeningHand(h,false,undefined,false,{
    itemLocked:true
  })?.channel,'held-guzma-hala');
});

test('the opener will not try to replay Stadium after a Stadium this turn',()=>{
  const h=hand(['Iron Thorns ex','Guzma & Hala',
    'Double Colorless Energy']);
  assert.equal(planOpeningHand(h,false,undefined,false,{
    stadiumAlreadyPlayed:true
  }),null);
  assert.equal(planOpeningHand(h,true,undefined,false,{
    stadiumAlreadyPlayed:true
  })?.channel,'direct');
});


test('source-first attached Double Colorless satisfies Energy requirement',()=>{
  const plan=planOpeningHand(hand(['Iron Thorns ex','Guzma & Hala']),
    false,undefined,false,{activeDceAttached:true});
  assert.deepEqual(plan,{channel:'held-guzma-hala',needDce:false,
    needThunder:true,discardCount:0});
  assert.equal(planOpeningHand(hand(['Iron Thorns ex','Tag Call']),
    false,undefined,false,{activeDceAttached:true,itemLocked:true}),null);
});


test('hand-only Energy restriction does not remove attached DCE',()=>{
  assert.equal(planOpeningHand(hand([]),true,undefined,false,
    {activeDceAttached:true,specialEnergyLocked:true})?.channel,'direct');
});

test('spent manual Energy attachment blocks even held DCE and Thunder',()=>{
  const held=hand(['Iron Thorns ex','Double Colorless Energy',
    'Thunder Mountain Prism Star']);
  assert.equal(planOpeningHand(held,false,undefined,false,{
    energyAlreadyAttached:true
  }),null);
  assert.equal(planOpeningHand(held,true,undefined,false,{
    energyAlreadyAttached:true,activeDceAttached:true
  })?.channel,'direct');
});

test('general Energy hand lock vetoes costly search before consuming Supporter',()=>{
  const source=hand(['Iron Thorns ex','Guzma & Hala','Camping Gear',
    'Crushing Hammer']);
  assert.equal(planOpeningHand(source,false,undefined,false,{
    energyLocked:true
  }),null);
  assert.equal(planOpeningHand(source,false,undefined,false,{
    energyAlreadyAttached:true
  }),null);
  assert.equal(planOpeningHand(hand(['Guzma & Hala',
    'Thunder Mountain Prism Star']),false,undefined,false,{
    energyLocked:true,activeDceAttached:true
  })?.channel,'direct');
});

test('live DCE eligibility reflects pinned attachment allowance and locks',()=>{
  const state={turn:3,rules:{unlimitedEnergyAttachments:false}};
  const player={energyPlayedTurn:3};
  assert.equal(dceHandAttachmentBlocked(player,state),true);
  assert.equal(dceHandAttachmentBlocked({...player,usedDragonsWish:true},
    state),false);
  assert.equal(dceHandAttachmentBlocked(player,{
    turn:3,rules:{unlimitedEnergyAttachments:true}
  }),false);
  assert.equal(dceHandAttachmentBlocked({...player,energyPlayedTurn:2},
    state),false);
  assert.equal(dceHandAttachmentBlocked({
    ...player,usedDragonsWish:true,cannotPlayEnergyCards:true
  },state),true);
  assert.equal(dceHandAttachmentBlocked({
    ...player,usedDragonsWish:true,cannotPlaySpecialEnergyCards:true
  },state),true);
});

test('K1 acquired at Tag Call can invalidate just the missing printed target',()=>{
  const plan={needThunder:true,needDce:true};
  const ownedDeck=hand(['Guzma & Hala','Double Colorless Energy']);
  assert.deepEqual(missingTagCallK1Requirements(plan,ownedDeck,[]),[
    'Thunder Mountain Prism Star'
  ]);
  assert.deepEqual(missingTagCallK1Requirements(plan,hand([
    'Guzma & Hala','Thunder Mountain Prism Star'
  ]),[]),['Double Colorless Energy']);
  assert.deepEqual(missingTagCallK1Requirements(plan,ownedDeck,
    hand(['Thunder Mountain Prism Star'])),[]);
});

test('K1 check preserves a viable Tag Call target and needed-only scope',()=>{
  const deck=hand(['Guzma & Hala','Thunder Mountain Prism Star',
    'Double Colorless Energy']);
  assert.deepEqual(missingTagCallK1Requirements({
    needThunder:true,needDce:true
  },deck,[]),[]);
  assert.deepEqual(missingTagCallK1Requirements({
    needThunder:false,needDce:true
  },hand(['Guzma & Hala']),[]),['Double Colorless Energy']);
  assert.deepEqual(missingTagCallK1Requirements({
    needThunder:false,needDce:false
  },[],[]),[]);
});
