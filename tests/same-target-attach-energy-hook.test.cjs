'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {sameTarget,repairSameTargetSelection}=
  require('../simulation/twinleaf/same-target-attach-energy-hook.cjs');

const a={player:2,slot:2,index:0};
const b={player:2,slot:2,index:1};
/** @param {boolean} enabled */
function prompt(enabled=true){
  return {options:{sameTarget:enabled},
    validate:chosen=>Array.isArray(chosen)&&chosen.length===2 &&
      (!enabled||chosen.every(x=>sameTarget(x.to,chosen[0].to)))};
}

test('same-Pokemon requirement repairs genuine two-card split choice',()=>{
  const cards=[{name:'Darkness Energy 1'},{name:'Darkness Energy 2'}];
  const proposed=[{card:cards[0],to:a},{card:cards[1],to:b}];
  assert.equal(prompt().validate(proposed),false);
  const {value,changed}=repairSameTargetSelection(prompt(),proposed);
  assert.equal(changed,true);
  assert.equal(prompt().validate(value),true);
  assert.equal(value[0].card,cards[0]);
  assert.equal(value[1].card,cards[1]);
  assert.equal(value[0].to,a);
  assert.equal(value[1].to,a);
  assert.equal(proposed[1].to,b);
});

test('ordinary, already legal and single-card results are unchanged',()=>{
  const already=[{card:{},to:a},{card:{},to:a}];
  assert.deepEqual(repairSameTargetSelection(prompt(),already),
    {value:already,changed:false});
  const normal=[{card:{},to:a},{card:{},to:b}];
  assert.deepEqual(repairSameTargetSelection(prompt(false),normal),
    {value:normal,changed:false});
  const single=[{card:{},to:a}];
  assert.deepEqual(repairSameTargetSelection(prompt(),single),
    {value:single,changed:false});
  assert.deepEqual(repairSameTargetSelection(prompt(),null),
    {value:null,changed:false});
});

test('fail-closed if stronger prompt constraints still reject correction',()=>{
  const invalid={options:{sameTarget:true},validate:()=>false};
  const original=[{card:{},to:a},{card:{},to:b}];
  const result=repairSameTargetSelection(invalid,original);
  assert.equal(result.changed,false);
  assert.equal(result.value,original);
});

test('target identity includes player, slot and index',()=>{
  assert.equal(sameTarget(a,{...a}),true);
  assert.equal(sameTarget(a,{...a,player:1}),false);
  assert.equal(sameTarget(a,{...a,slot:1}),false);
  assert.equal(sameTarget(a,{...a,index:2}),false);
});
