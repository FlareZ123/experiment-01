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
 * @returns {ReadonlyArray<{printings:ReadonlyArray<string>}>|null}
 */
function firstNativeValidBundle(prompt,max){
  assert.ok(Number.isInteger(max)&&max>=1&&max<=3);
  const cards=prompt.cards.cards;
  assert.ok(Array.isArray(cards));
  // Caller must authenticate an owner deck/discard search on the live Store.
  const ordered=cards.slice().sort((a,b)=>
    a.fullName<b.fullName?-1:a.fullName>b.fullName?1:0);
  // A full 60-card pool has at most 36,050 size-three combinations,
  // 1,770 size-two combinations and 60 singleton trials.
  for(let size=Math.min(max,ordered.length);size>=1;size--){
    const selected=[];
    const find=next=>{
      if(selected.length===size)
        return prompt.validate(selected)?selected.map(c=>c.fullName):null;
      const needed=size-selected.length;
      for(let i=next;i<=ordered.length-needed;i++){
        selected.push(ordered[i]);
        const names=find(i+1);
        if(names)return names;
        selected.pop();
      }
      return null;
    };
    const names=find(0);
    if(names)return Object.freeze([
      Object.freeze({printings:Object.freeze(names)})
    ]);
  }
  return null;
}

module.exports={VERSION,firstNativeValidBundle};
