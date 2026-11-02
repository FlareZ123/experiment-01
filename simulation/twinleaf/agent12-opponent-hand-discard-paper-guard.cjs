'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');

const VERSION='agent12-aichi-opponent-hand-printed-targets-v1';
const TARGET_PRINTINGS=new Set(['Sidney FST 241','Team Skull Grunt SUM']);

/**
 * Paper-valid eligibility for original-source opponent-hand discard Supporters.
 * Requires exact physical objects, printed target type and fixed-count Skull
 * selection where possible. Source filter on the native prompt is checked
 * additionally with its own validate method.
 *
 * @param {object} prompt Actual source-stamped ChooseCardsPrompt.
 * @param {unknown} selected ResolvePromptAction result.
 * @param {object} state Native state, including both physical player hands.
 * @param {{SuperType:object}} types Native card-type enum.
 * @returns {string|null}
 */
function handDiscardPaperViolation(prompt,selected,state,types){
  if(!Array.isArray(selected))
    return 'SELECTION_MUST_BE_ARRAY';
  if(new Set(selected).size!==selected.length)
    return 'SELECTION_MUST_USE_DISTINCT_PHYSICAL_CARDS';
  const owner=state?.players?.find(p=>p.id===prompt?.playerId);
  const opponent=state?.players?.find(p=>p.id!==prompt?.playerId);
  if(!owner||!opponent||prompt.cards!==opponent.hand)
    return 'TARGET_MUST_BE_OPPONENT_PHYSICAL_HAND';
  if(selected.some(c=>!opponent.hand.cards.includes(c)))
    return 'CARD_NOT_IN_OPPONENT_HAND';
  const printing=prompt.sourceCard?.fullName;
  if(printing==='Team Skull Grunt SUM'){
    const eligible=opponent.hand.cards.filter(
      c=>c.superType===types.SuperType.ENERGY).length;
    if(selected.length!==Math.min(2,eligible))
      return 'TEAM_SKULL_MUST_DISCARD_UP_TO_TWO_AVAILABLE_ENERGY';
  }
  if(!prompt.validate(selected,state))
    return 'PINNED_PRINTED_TARGET_FILTER_OR_COUNT_INVALID';
  return null;
}

/**
 * Default-off reversible mandatory target guard for original rank6/24/29
 * opponent-hand denial Supporters. Leave existing frozen game profiles intact.
 * @template T
 * @param {()=>T} work
 * @param {{Store?:Function,types?:object}} [deps] Optional unit-test injection.
 * @returns {{result:T,audit:object}}
 */
function withPaperOpponentHandDiscards(work,deps={}){
  assert.equal(typeof work,'function');
  const output=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
  const Store=deps.Store??require(path.join(output,'game/store/store')).Store;
  const types=deps.types??require(path.join(output,'game/store/card/card-types'));
  const previous=Object.getOwnPropertyDescriptor(Store.prototype,'dispatch');
  assert.equal(typeof previous?.value,'function');
  const audit={version:VERSION,inspected:0,vetoed:0,accepted:0,
    byPrint:{},qualifiedCompetitiveGames:0};
  function dispatch(action,...args){
    if(action?.constructor?.name==='ResolvePromptAction'){
      const p=this.state?.prompts?.find(q=>
        q.id===action.id&&q.result===undefined);
      if(p?.constructor?.name==='ChooseCardsPrompt'&&
         p.message==='CHOOSE_CARD_TO_DISCARD'&&
         TARGET_PRINTINGS.has(p.sourceCard?.fullName)){
        const printing=p.sourceCard.fullName;
        audit.inspected++;
        const bucket=audit.byPrint[printing]??={inspected:0,vetoed:0,accepted:0};
        bucket.inspected++;
        const error=handDiscardPaperViolation(p,action.result,this.state,types);
        if(error){
          audit.vetoed++;bucket.vetoed++;
          throw Error('PAPER_OPPONENT_HAND_TARGET_INVALID:'+printing+':'+error);
        }
        audit.accepted++;bucket.accepted++;
      }
    }
    return previous.value.call(this,action,...args);
  }
  Object.defineProperty(Store.prototype,'dispatch',{...previous,value:dispatch});
  try{return {result:work(),audit};}
  finally{
    assert.strictEqual(Store.prototype.dispatch,dispatch);
    Object.defineProperty(Store.prototype,'dispatch',previous);
  }
}
module.exports={VERSION,TARGET_PRINTINGS,handDiscardPaperViolation,
  withPaperOpponentHandDiscards};
