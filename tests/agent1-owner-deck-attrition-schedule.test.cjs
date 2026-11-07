'use strict';

const assert=require('node:assert/strict');
const test=require('node:test');
const {
  futureOwnerStartsUnderSchedule
}=require('../simulation/evaluation/agent1-owner-deck-attrition-schedule.cjs');
const {
  futureOwnerStarts:stationaryOwnerStarts
}=require('../simulation/evaluation/agent2-owner-deck-attrition-horizon.cjs');

/** @param {number} remaining @param {object[]} schedule @param {object} tail */
function literalOwnerStarts(remaining,schedule,tail){
  let deck=remaining,starts=0,turn=0;
  while(deck>0){
    const row=schedule[turn]??tail;
    deck=Math.max(0,deck-row.ownerDraw);
    deck=Math.max(0,deck-row.opponentMill);
    if(deck===0)return starts;
    deck--;
    starts++;
    turn++;
  }
  return starts;
}

/** @returns {object[]} All nine draw/mill pairs from zero through two. */
function smallRows(){
  const rows=[];
  for(let ownerDraw=0;ownerDraw<=2;ownerDraw++)
    for(let opponentMill=0;opponentMill<=2;opponentMill++)
      rows.push({ownerDraw,opponentMill});
  return rows;
}

/** @param {number} length @returns {object[][]} */
function allSchedules(length){
  const rows=smallRows();
  let schedules=[[]];
  for(let i=0;i<length;i++)
    schedules=schedules.flatMap(prefix=>
      rows.map(row=>[...prefix,row]));
  return schedules;
}

test('stationary tails reproduce Agent2 closed-form horizons for 4,941 cases',()=>{
  for(let deck=0;deck<=60;deck++)
    for(let draw=0;draw<=8;draw++)
      for(let mill=0;mill<=8;mill++){
        const result=futureOwnerStartsUnderSchedule(deck,[],{
          ownerDraw:draw,opponentMill:mill
        });
        assert.equal(result.futureOwnerStarts,
          stationaryOwnerStarts(deck,draw,mill),
          JSON.stringify({deck,draw,mill}));
      }
});

test('finite schedules match a literal mandatory-draw recurrence',()=>{
  let checked=0;
  const tails=smallRows();
  for(let deck=0;deck<=20;deck++)
    for(let length=0;length<=2;length++)
      for(const schedule of allSchedules(length))
        for(const tail of tails){
          const result=futureOwnerStartsUnderSchedule(deck,schedule,tail);
          assert.equal(result.futureOwnerStarts,
            literalOwnerStarts(deck,schedule,tail),
            JSON.stringify({deck,schedule,tail}));
          checked++;
        }
  assert.equal(checked,17199);
});

test('one Filch followed by passing has a different budget from repeated Filch',()=>{
  const repeatFilch=futureOwnerStartsUnderSchedule(23,[],{
    ownerDraw:2,opponentMill:0
  });
  const repeatPass=futureOwnerStartsUnderSchedule(23,[],{
    ownerDraw:0,opponentMill:0
  });
  const oneFilchThenPass=futureOwnerStartsUnderSchedule(23,[{
    ownerDraw:2,opponentMill:0
  }],{ownerDraw:0,opponentMill:0});
  assert.equal(repeatFilch.futureOwnerStarts,7);
  assert.equal(repeatPass.futureOwnerStarts,23);
  assert.equal(oneFilchThenPass.futureOwnerStarts,21);
});

test('sustained double-Burrow pressure changes the repeated-draw horizon',()=>{
  const repeatedFilch=futureOwnerStartsUnderSchedule(23,[],{
    ownerDraw:2,opponentMill:2
  });
  const repeatedPass=futureOwnerStartsUnderSchedule(23,[],{
    ownerDraw:0,opponentMill:2
  });
  const oneFilchThenPass=futureOwnerStartsUnderSchedule(23,[{
    ownerDraw:2,opponentMill:2
  }],{ownerDraw:0,opponentMill:2});
  assert.equal(repeatedFilch.futureOwnerStarts,4);
  assert.equal(repeatedPass.futureOwnerStarts,7);
  assert.equal(oneFilchThenPass.futureOwnerStarts,7);

  const criticalFilch=futureOwnerStartsUnderSchedule(4,[],{
    ownerDraw:2,opponentMill:2
  });
  const criticalPass=futureOwnerStartsUnderSchedule(4,[],{
    ownerDraw:0,opponentMill:2
  });
  assert.equal(criticalFilch.futureOwnerStarts,0);
  assert.equal(criticalPass.futureOwnerStarts,1);
});

test('a one-turn double-Burrow burst is represented without assuming it repeats',()=>{
  const repeatedFilchAfterBurst=futureOwnerStartsUnderSchedule(15,[{
    ownerDraw:2,opponentMill:2
  }],{ownerDraw:2,opponentMill:0});
  const passAfterBurst=futureOwnerStartsUnderSchedule(15,[{
    ownerDraw:0,opponentMill:2
  }],{ownerDraw:0,opponentMill:0});
  const oneFilchThenPass=futureOwnerStartsUnderSchedule(15,[{
    ownerDraw:2,opponentMill:2
  }],{ownerDraw:0,opponentMill:0});
  assert.equal(repeatedFilchAfterBurst.futureOwnerStarts,4);
  assert.equal(passAfterBurst.futureOwnerStarts,13);
  assert.equal(oneFilchThenPass.futureOwnerStarts,11);
  assert.deepEqual(repeatedFilchAfterBurst.ledger,[{
    scheduledOwnerTurn:1,
    ownerDrawRequested:2,
    ownerCardsDrawn:2,
    opponentMillRequested:2,
    opponentCardsMilled:2,
    mandatoryDrawForNextOwnerTurn:1,
    deckAfterMandatoryDraw:10,
    nextOwnerTurnStarts:true
  }]);
});

test('empty deck before the next mandatory draw does not create a future turn',()=>{
  const result=futureOwnerStartsUnderSchedule(4,[{
    ownerDraw:2,opponentMill:2
  }]);
  assert.equal(result.futureOwnerStarts,0);
  assert.equal(result.scheduleTerminatedBeforeNextOwnerTurn,true);
  assert.equal(result.ledger[0].mandatoryDrawForNextOwnerTurn,0);
  assert.equal(result.ledger[0].nextOwnerTurnStarts,false);
});

test('invalid counts and malformed schedules are rejected',()=>{
  assert.throws(()=>futureOwnerStartsUnderSchedule(-1,[]),/feasible/);
  assert.throws(()=>futureOwnerStartsUnderSchedule(12,[{
    ownerDraw:2,opponentMill:61
  }]),/feasible/);
  assert.throws(()=>futureOwnerStartsUnderSchedule(12,[null]),/scenario objects/);
  assert.throws(()=>futureOwnerStartsUnderSchedule(12,[],{
    ownerDraw:0,opponentMill:-1
  }),/feasible/);
});
