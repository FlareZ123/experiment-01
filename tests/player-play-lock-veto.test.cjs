'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {playerPlayLockVeto,visiblePlayLockGuardSeat}=
  require('../simulation/twinleaf/player-play-lock-veto.cjs');

const enums={superTrainer:2,superEnergy:3,item:0,supporter:1,stadium:2,tool:3,specialEnergy:1};
const stadium={fullName:'Thunder Mountain Prism Star LOT',
  superType:2,trainerType:2};
const dce={fullName:'Double Colorless Energy SUM',
  superType:3,energyType:1};
const basic={fullName:'Basic Darkness Energy SVE',
  superType:3,energyType:0};
const supporter={fullName:"Lillie's Determination M1L",
  superType:2,trainerType:1};
const item={fullName:'Field Blower GRI',superType:2,trainerType:0};
const tool={fullName:'Float Stone BKT',superType:2,trainerType:3};
function player(stadiumLocked=false,specialEnergyLocked=false){
  return {id:202,cannotPlayStadiumCards:stadiumLocked,
    cannotPlaySpecialEnergyCards:specialEnergyLocked,
    hand:{cards:[stadium,dce,basic,supporter,item,tool]}};
}
const play=index=>({type:'PLAY_CARD_ACTION',id:202,handIndex:index});

test('Shadow Mist denies Stadium proposals from own hand',()=>{
  assert.equal(playerPlayLockVeto(player(true,true),play(0),enums),
    'stadium-lock');
});

test('Shadow Mist denies Special Energy but permits Basic Energy',()=>{
  const p=player(true,true);
  assert.equal(playerPlayLockVeto(p,play(1),enums),
    'special-energy-lock');
  assert.equal(playerPlayLockVeto(p,play(2),enums),null);
});

test('Shadow Mist does not deny a legal Supporter',()=>{
  assert.equal(playerPlayLockVeto(player(true,true),play(3),enums),null);
});

test('restriction is lifted when printed player-level flags clear',()=>{
  const p=player(false,false);
  assert.equal(playerPlayLockVeto(p,play(0),enums),null);
  assert.equal(playerPlayLockVeto(p,play(1),enums),null);
});

test('attack, opposing action and missing cards are left alone',()=>{
  const p=player(true,true);
  assert.equal(playerPlayLockVeto(p,{type:'ATTACK_ACTION',id:202},enums),null);
  assert.equal(playerPlayLockVeto(p,{...play(0),id:101},enums),null);
  assert.equal(playerPlayLockVeto(p,play(8),enums),null);
});

test('the two printed lock flags are independent',()=>{
  assert.equal(playerPlayLockVeto(player(true,false),play(1),enums),null);
  assert.equal(playerPlayLockVeto(player(false,true),play(0),enums),null);
});

test('both-actor lock guard selects the actual active seat',()=>{
  const request={enforceVisiblePlayLockBothSeats:true};
  assert.equal(visiblePlayLockGuardSeat(request,0),0);
  assert.equal(visiblePlayLockGuardSeat(request,1),1);
});

test('historical single-actor guard remains confined to its physical seat',()=>{
  const request={enforceVisiblePlayLockSeat:1};
  assert.equal(visiblePlayLockGuardSeat(request,0),1);
  assert.equal(visiblePlayLockGuardSeat(request,1),1);
  assert.equal(visiblePlayLockGuardSeat({},0),undefined);
});

test('Item, Supporter and Tool play locks remain category-specific',()=>{
  const p=player();
  p.cannotPlayItemCards=true;
  p.cannotPlaySupporterCards=true;
  p.cannotPlayToolCards=true;
  assert.equal(playerPlayLockVeto(p,play(4),enums),'item-lock');
  assert.equal(playerPlayLockVeto(p,play(3),enums),'supporter-lock');
  assert.equal(playerPlayLockVeto(p,play(5),enums),'tool-lock');
  assert.equal(playerPlayLockVeto(p,play(2),enums),null);
  assert.equal(playerPlayLockVeto(p,play(0),enums),null);
});

test('global Energy lock takes precedence over Special Energy lock',()=>{
  const p=player(false,true);
  p.cannotPlayEnergyCards=true;
  assert.equal(playerPlayLockVeto(p,play(1),enums),'energy-lock');
  assert.equal(playerPlayLockVeto(p,play(2),enums),'energy-lock');
  p.cannotPlayEnergyCards=false;
  assert.equal(playerPlayLockVeto(p,play(1),enums),'special-energy-lock');
  assert.equal(playerPlayLockVeto(p,play(2),enums),null);
});

test('a lock on another category or owner never vetoes this action',()=>{
  const p=player();
  p.cannotPlayToolCards=true;
  assert.equal(playerPlayLockVeto(p,play(4),enums),null);
  assert.equal(playerPlayLockVeto(p,{...play(5),id:999},enums),null);
  assert.equal(playerPlayLockVeto(p,{...play(5),type:'RETREAT_ACTION'},enums),null);
});

test('legacy caller without extra category enum values preserves old scope',()=>{
  const p=player();
  p.cannotPlayItemCards=true;
  p.cannotPlayToolCards=true;
  p.cannotPlaySupporterCards=true;
  const old={superTrainer:2,superEnergy:3,stadium:2,specialEnergy:1};
  assert.equal(playerPlayLockVeto(p,play(3),old),null);
  assert.equal(playerPlayLockVeto(p,play(4),old),null);
  assert.equal(playerPlayLockVeto(p,play(5),old),null);
  p.cannotPlayStadiumCards=true;
  assert.equal(playerPlayLockVeto(p,play(0),old),'stadium-lock');
});
