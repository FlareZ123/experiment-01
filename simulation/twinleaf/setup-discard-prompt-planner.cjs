'use strict';
const assert=require('node:assert/strict');
/**
 * Discard target selector for an actual owner-deck ChooseCardsPrompt.
 * Utilities describe DISCARD value, never hand-access value. The caller
 * must first legally initiate the deck search without inspecting its cards.
 * @param {object} prompt Native prompt after Item use.
 * @param {object} owner Actual searching player.
 * @param {{printing:string,value:number,maxCopies?:number}[]} goals
 * @param {number} fallback Cost of unlisted discards.
 * @returns {{cards:object[],printings:string[],utility:number,offPlan:boolean}|null}
 */
function chooseSetupDeckDiscards(prompt,owner,goals,fallback=-100){
  assert.strictEqual(prompt.player,owner);
  assert.strictEqual(prompt.cards,owner.deck);
  const min=prompt.options.min,max=Math.min(prompt.options.max,prompt.cards.cards.length);
  assert.ok(min>=1&&min<=max&&max<=3);
  const goal=new Map(goals.map(g=>[g.printing,g]));
  assert.equal(goal.size,goals.length);
  const blocked=new Set(prompt.options.blocked||[]);
  const list=prompt.cards.cards.map((card,i)=>({
    card,name:card.fullName,index:i,value:goal.get(card.fullName)?.value??fallback
  })).filter(row=>!blocked.has(row.index));
  list.sort((a,b)=>b.value-a.value||a.name.localeCompare(b.name)||a.index-b.index);
  let best=null;
  const visit=(chosen,start,value)=>{
    const cards=chosen.map(x=>x.card);
    if(chosen.length>=min&&prompt.validate(cards)===true){
      const printings=chosen.map(x=>x.name).sort();
      const key=printings.join('|');
      if(best===null||value>best.utility||
        (value===best.utility&&(cards.length<best.cards.length||
        (cards.length===best.cards.length&&key<best.key)))){
        best={cards,printings,utility:value,key};
      }
    }
    if(chosen.length===max)return;
    for(let i=start;i<list.length;i++){
      const x=list[i],cap=goal.get(x.name)?.maxCopies??1;
      if(goal.has(x.name)&&chosen.filter(y=>y.name===x.name).length>=cap)continue;
      visit([...chosen,x],i+1,value+x.value);
    }
  };
  visit([],0,0);
  if(!best)return null;
  const hits=best.printings.filter(name=>goal.has(name)).length;
  return {cards:best.cards,printings:best.printings,utility:best.utility,
    selectedGoals:hits,forcedOffPlan:hits<min};
}
module.exports={chooseSetupDeckDiscards};
