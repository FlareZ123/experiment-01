'use strict';

const assert=require('node:assert/strict');

const VERSION='agent22-sparse-owner-bundles-v1';

/**
 * Find one complete native-valid owner-search bundle without materializing
 * every valid combination. Intended only for the existing bounded
 * owner-visible ChooseCardsPrompt search-to-hand fallback.
 *
 * Native validation remains authoritative. A false/no eligible option
 * returns null and delegates to the unchanged bot. The menu is inert,
 * printing-only and independent of the hidden physical deck order.
 *
 * @param {{cards:{cards:{fullName:string}[]},validate:(cards:object[])=>boolean}} prompt
 * @param {1|2|3} max
 * @param {(names:readonly string[])=>number|null} [scoreBundle]
 * @param {number} [minSelection] Paper-aware minimum, native validation still required.
 * @returns {ReadonlyArray<{printings:ReadonlyArray<string>}>|null}
 */
function firstNativeValidBundle(prompt,max,scoreBundle=null,minSelection=0){
  assert.ok(Number.isInteger(max)&&max>=1&&max<=3);
  assert.ok(scoreBundle===null||typeof scoreBundle==='function');
  assert.ok(Number.isInteger(minSelection)&&minSelection>=0&&
    minSelection<=max);
  const cards=prompt.cards.cards;
  assert.ok(Array.isArray(cards));
  // Caller authenticates a live, owned deck/discard prompt. Native validation
  // alone decides eligibility; scores see sorted printing names only.
  const ordered=cards.slice().sort((a,b)=>
    a.fullName<b.fullName?-1:a.fullName>b.fullName?1:0);
  let best=null,bestScore=-Infinity;
  const consider=selected=>{
    if(!prompt.validate(selected))return false;
    const names=selected.map(card=>card.fullName);
    if(scoreBundle===null){
      best=names;
      return true;
    }
    const score=scoreBundle(Object.freeze([...names]));
    assert.ok(Number.isFinite(score),'Bundle score must be finite');
    // Equal-valued bundles retain a predictable longest/lexical order.
    const newer=score>bestScore||score===bestScore&&(
      best===null||names.length>best.length||(
        names.length===best.length&&
        JSON.stringify(names)<JSON.stringify(best)));
    if(newer){best=names;bestScore=score;}
    return false;
  };
  // The unscored route retains the original first native-valid max-size
  // lexicographic bundle. In scored mode, an empty optional search is a
  // legitimate alternative when the native prompt permits it.
  for(let size=Math.min(max,ordered.length);size>=
      Math.max(scoreBundle?0:1,minSelection);
      size--){
    if(size===0){consider([]);continue;}
    const selected=[];
    const find=next=>{
      if(selected.length===size)return consider(selected);
      const needed=size-selected.length;
      for(let i=next;i<=ordered.length-needed;i++){
        selected.push(ordered[i]);
        if(find(i+1))return true;
        selected.pop();
      }
      return false;
    };
    if(find(0))break;
  }
  return best===null?null:Object.freeze([
    Object.freeze({printings:Object.freeze(best)})
  ]);
}

module.exports={VERSION,firstNativeValidBundle};
