'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {paperPutDamageRejectReason}=
  require('../simulation/twinleaf/put-damage-zero-cap-paper-hook.cjs');
const {assertValidPromptAction}=
  require('../simulation/twinleaf/prompt-integrity.cjs');

class ResolvePromptAction{
  /** @param {number} id @param {unknown} result */
  constructor(id,result){this.id=id;this.result=result;}
}

class PutDamagePrompt{
  /** @param {number} damage @param {boolean} partial */
  constructor(damage,partial){
    this.id=46;
    this.result=undefined;
    this.damage=damage;
    this.options={
      allowCancel:false,allowPlacePartialDamage:partial,damageMultiple:10
    };
    this.maxAllowedDamage=[
      {target:{player:2,slot:1,index:0},damage:190},
      {target:{player:2,slot:2,index:0},damage:0}
    ];
  }
  /**
   * Reproduce the pinned PutDamagePrompt.validate budget decision.
   * Native validation omits the upper bound when partial=true.
   * @param {unknown} answer
   * @returns {boolean}
   */
  validate(answer){
    if(answer===null)return this.options.allowCancel;
    const total=answer.reduce((sum,row)=>sum+row.damage,0);
    if(this.damage!==total&&!this.options.allowPlacePartialDamage)
      return false;
    return answer.every(row=>
      (row.target.player===2&&row.target.slot===1&&
        row.target.index===0)||
      (row.target.player===2&&row.target.slot===2&&
        row.target.index===0));
  }
}

const active={player:2,slot:1,index:0};
const forbidden={player:2,slot:2,index:0};

/** @param {number} count @param {boolean} partial */
function scenario(count,partial=true){
  const prompt=new PutDamagePrompt(count,partial);
  return {prompt,state:{prompts:[prompt]}};
}

/** @param {object} scenarioInput @param {unknown} answer */
function strict(scenarioInput,answer){
  return assertValidPromptAction(scenarioInput.state,
    new ResolvePromptAction(46,answer));
}

test('original Froslass UNM self-damage up to 70 cannot allocate 80',()=>{
  const s=scenario(70);
  const proposed=[{target:active,damage:80}];
  assert.equal(s.prompt.validate(proposed,s.state),true,
    'Original pinned optional validator accepts 80 from an up-to-70 effect');
  assert.equal(paperPutDamageRejectReason(s.prompt,proposed,s.state),
    'EXCEEDS_PRINTED_PARTIAL_DAMAGE_BUDGET');
  assert.throws(()=>strict(s,proposed),
    /EXCEEDS_PRINTED_PARTIAL_DAMAGE_BUDGET/);
  for(const legal of [[],[{target:active,damage:30}],
      [{target:active,damage:70}]]){
    assert.equal(paperPutDamageRejectReason(s.prompt,legal,s.state),null);
    assert.doesNotThrow(()=>strict(s,legal));
  }
});

test('Walking Wake TWM up-to-90 and Banette CRE up-to-70 bounds',()=>{
  for(const [budget,illegal] of [[90,100],[70,80]]){
    const s=scenario(budget);
    const submitted=[{target:active,damage:illegal}];
    assert.equal(s.prompt.validate(submitted,s.state),true);
    assert.throws(()=>strict(s,submitted),
      /EXCEEDS_PRINTED_PARTIAL_DAMAGE_BUDGET/);
    assert.doesNotThrow(()=>strict(s,[{target:active,damage:budget}]));
  }
});

test('mandatory allocation still follows native equality check',()=>{
  const s=scenario(70,false);
  assert.equal(s.prompt.validate([{target:active,damage:60}],s.state),false);
  assert.equal(paperPutDamageRejectReason(s.prompt,
    [{target:active,damage:60}],s.state),
    'NATIVE_PROMPT_VALIDATE_FALSE');
  assert.doesNotThrow(()=>strict(s,[{target:active,damage:70}]));
});

test('budget guard composes with original whole-packet and zero-cap guards',()=>{
  const s=scenario(70);
  assert.equal(paperPutDamageRejectReason(s.prompt,
    [{target:active,damage:15}],s.state),
    'INVALID_PRINTED_DAMAGE_PACKET');
  assert.equal(paperPutDamageRejectReason(s.prompt,
    [{target:forbidden,damage:10}],s.state),
    'PRINTED_TARGET_ZERO_CAP');
  assert.equal(paperPutDamageRejectReason(s.prompt,
    [{target:active,damage:-10}],s.state),
    'INVALID_DAMAGE_AMOUNT');
  assert.equal(paperPutDamageRejectReason(s.prompt,
    [{target:active,damage:Number.MAX_SAFE_INTEGER},
      {target:active,damage:10}],s.state),
    'INVALID_DAMAGE_TOTAL');
});

test('guard uses only prompt terms, answer, and public target geometry',()=>{
  const s=scenario(70);
  const before=JSON.stringify(s.state);
  const answer=[{target:active,damage:80}];
  const hiddenStateA={...s.state,opponentHand:['unknown A']};
  const hiddenStateB={...s.state,opponentHand:['unknown B']};
  assert.equal(paperPutDamageRejectReason(s.prompt,answer,hiddenStateA),
    paperPutDamageRejectReason(s.prompt,answer,hiddenStateB));
  assert.equal(JSON.stringify(s.state),before);
});
