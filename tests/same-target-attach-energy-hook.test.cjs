'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {sameTarget,repairSameTargetSelection,
  withSameTargetAttachEnergySelection}=
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

/**
 * The production wrapper preserves a native bot method's descriptor and
 * reports real corrected prompt proposals, including on later game aborts.
 * Fake classes exercise the actual wrapper without loading compiled vendor.
 */
test('opt-in wrapper repairs both-seat native results and restores method',()=>{
  class FakeAttachEnergyPrompt {
    constructor(id){this.id=id;this.message='Attach Energy';
      this.options={sameTarget:true};}
    validate(value){return prompt().validate(value);}
  }
  class FakeAttachEnergyPromptResolver {
    getPromptResult(){return [{card:{id:1},to:a},{card:{id:2},to:b}];}
  }
  const original=Object.getOwnPropertyDescriptor(
    FakeAttachEnergyPromptResolver.prototype,'getPromptResult');
  const run=()=>[0,1].map(seat=>{
    const resolver=new FakeAttachEnergyPromptResolver();
    const actual=resolver.getPromptResult({},new FakeAttachEnergyPrompt(seat));
    assert.equal(sameTarget(actual[0].to,actual[1].to),true);
    return {seat,actual};
  });
  const wrapped=withSameTargetAttachEnergySelection(run,{
    AttachEnergyPromptResolver:FakeAttachEnergyPromptResolver,
    AttachEnergyPrompt:FakeAttachEnergyPrompt
  });
  assert.equal(wrapped.result.length,2);
  assert.equal(wrapped.audit.repairedPromptCount,2);
  assert.deepEqual(wrapped.audit.events.map(x=>x.promptId),[0,1]);
  assert.deepEqual(Object.getOwnPropertyDescriptor(
    FakeAttachEnergyPromptResolver.prototype,'getPromptResult'),original);
});

test('native abort carries correction audit and restores method',()=>{
  class FakeAttachEnergyPrompt {
    constructor(){this.id=135;this.message='Attach Energy';
      this.options={sameTarget:true};}
    validate(value){return prompt().validate(value);}
  }
  class FakeAttachEnergyPromptResolver {
    getPromptResult(){return [{card:{id:1},to:a},{card:{id:2},to:b}];}
  }
  const original=Object.getOwnPropertyDescriptor(
    FakeAttachEnergyPromptResolver.prototype,'getPromptResult');
  const failure=new Error('native Store rejected later action');
  assert.throws(()=>withSameTargetAttachEnergySelection(()=>{
    const proposal=new FakeAttachEnergyPromptResolver()
      .getPromptResult({},new FakeAttachEnergyPrompt());
    assert.equal(sameTarget(proposal[0].to,proposal[1].to),true);
    throw failure;
  },{AttachEnergyPromptResolver:FakeAttachEnergyPromptResolver,
    AttachEnergyPrompt:FakeAttachEnergyPrompt}),error=>{
    assert.equal(error,failure);
    assert.equal(error.nativeSameTargetEnergyEvidence.repairedPromptCount,1);
    assert.equal(error.nativeSameTargetEnergyEvidence.events[0].promptId,135);
    assert.equal(error.nativeSameTargetEnergyEvidence.competitiveStrengthQualified,false);
    return true;
  });
  assert.deepEqual(Object.getOwnPropertyDescriptor(
    FakeAttachEnergyPromptResolver.prototype,'getPromptResult'),original);
});
