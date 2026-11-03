'use strict';

/**
 * Original rank31 going-second first-own-turn accessible Koffing/Radiant/Roxie
 * via Fog Crystal (Basic Psychic) and Tapu Lele-GX Wonder Tag (Supporter).
 *
 * Conservative starting Active policy: require one of ten non-Koffing,
 * non-Radiant, non-Lele Basic Pokémon in the first seven and start it.
 * This keeps Koffing in hand, reserves Lele's Bench-triggered Wonder Tag
 * and leaves two Bench spaces for Lele plus Radiant without a Switch.
 *
 * Each missing Psychic Basic costs a separate held Fog Crystal. If Roxie
 * is absent, Lele must be in hand or require another Fog, and an unprized
 * Roxie must remain searchable by Wonder Tag. Six Prize card requirements
 * are evaluated simultaneously by integer inclusion-exclusion.
 *
 * This proves physical source-card access only, never selected game actions.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {choose,classify} = require('./agent15-rank31-roxie-firstdraw.cjs');

const KEYS=['koffing','radiant','lele','fog','roxie','anchorBasic','other'];

/** @param {object} deck Authenticated original rank31 source */
function inventory(deck){
  const base=classify(deck);
  for(const [name,count,set,number] of [
    ['Koffing',3,'CEC','76'],
    ['Radiant Alakazam',1,'SIT','59'],
    ['Tapu Lele-GX',1,'GRI','60'],
    ['Fog Crystal',4,'CRE','140'],
    ['Roxie',4,'CEC','205'],
  ]){
    const cards=deck.cards.filter(c=>c.name===name);
    assert.equal(cards.length,1,name+' printing count');
    assert.equal(cards[0].count,count);
    assert.deepEqual([cards[0].printing.set,String(cards[0].printing.number)],
      [set,number]);
  }
  const counts=[3,1,1,4,4,base.eligibleBasic+base.otherBasic-2,0];
  counts[6]=60-counts.slice(0,6).reduce((a,b)=>a+b,0);
  assert.deepEqual(counts,[3,1,1,4,4,10,37]);
  return counts;
}

/**
 * Number of equally likely six-Prize combinations leaving at least one
 * of every required disjoint group outside Prizes.
 * @param {number[]} groups Remaining multiplicity of required card groups
 * @returns {bigint}
 */
function successfulPrizeSets(groups){
  let sum=0n;
  for(let mask=0;mask<(1<<groups.length);mask++){
    let prizesNeeded=0;
    for(let i=0;i<groups.length;i++){
      if(mask&(1<<i))prizesNeeded+=groups[i];
    }
    const count=choose(52-prizesNeeded,6-prizesNeeded);
    sum+=mask.toString(2).replace(/0/g,'').length%2===0?count:-count;
  }
  return sum;
}

/** @param {number[]} counts Source seven-class physical inventory */
function countWonderTagChain(counts){
  assert.deepEqual(counts,[3,1,1,4,4,10,37]);
  const selection=new Array(KEYS.length).fill(0);
  const prizeCount=choose(52,6);
  let validSeven=0n;
  const totals={
    cleanAnchorOpening:0n,
    heldRoxieWithAnchor:0n,
    directHeldAllWithAnchor:0n,
    heldRoxieWithFogTargets:0n,
    heldLeleWonderTag:0n,
    fogToLeleWonderTag:0n,
    insufficientFogForMissingTargets:0n,
  };
  /** @param {number} i @param {number} left @param {bigint} ways */
  function visit(i,left,ways){
    if(i===KEYS.length){
      if(left!==0||selection[0]+selection[1]+selection[2]+selection[5]===0)return;
      validSeven+=ways;
      if(selection[5]===0)return;

      for(let draw=0;draw<KEYS.length;draw++){
        const available=counts[draw]-selection[draw];
        if(available===0)continue;
        const factor=ways*BigInt(available);
        totals.cleanAnchorOpening+=factor*prizeCount;
        const hand=selection.map((x,index)=>x+Number(index===draw));
        const [k,rad,lele,fog,roxie]=hand;
        if(roxie>0)totals.heldRoxieWithAnchor+=factor*prizeCount;
        const needK=k===0,needRad=rad===0;
        const needLele=roxie===0&&lele===0;
        const fogNeeded=Number(needK)+Number(needRad)+Number(needLele);
        if(fog<fogNeeded){
          totals.insufficientFogForMissingTargets+=factor*prizeCount;
          continue;
        }
        const requirements=[];
        if(needK)requirements.push(counts[0]-k);
        if(needRad)requirements.push(counts[1]-rad);
        if(needLele)requirements.push(counts[2]-lele);
        if(roxie===0)requirements.push(counts[4]-roxie);
        if(requirements.some(n=>n<=0))continue;
        const good=successfulPrizeSets(requirements);
        if(roxie>0){
          totals.heldRoxieWithFogTargets+=factor*good;
          if(k>0&&rad>0)totals.directHeldAllWithAnchor+=factor*good;
        }else if(lele>0){
          totals.heldLeleWonderTag+=factor*good;
        }else{
          totals.fogToLeleWonderTag+=factor*good;
        }
      }
      return;
    }
    for(let n=0;n<=Math.min(left,counts[i]);n++){
      selection[i]=n;
      visit(i+1,left-n,ways*choose(counts[i],n));
    }
  }
  visit(0,7,1n);
  const denominator=validSeven*53n*prizeCount;
  const result=Object.fromEntries(Object.entries(totals).map(([name,num])=>
    [name,{numerator:num.toString(),denominator:denominator.toString(),
      percent:Number(num)/Number(denominator)*100}]));
  const numerator=['heldRoxieWithFogTargets','heldLeleWonderTag',
    'fogToLeleWonderTag'].reduce((sum,key)=>sum+BigInt(result[key].numerator),0n);
  result.completeSourceAccess={
    numerator:numerator.toString(),denominator:denominator.toString(),
    percent:Number(numerator)/Number(denominator)*100,
  };
  return {validSeven:validSeven.toString(),denominator:denominator.toString(),
    events:result};
}

function main(){
  const data=JSON.parse(fs.readFileSync(path.join(__dirname,'..','results',
    'aichi-2026','full-decklists.json'),'utf8'));
  const deck=data.decks.find(d=>d.rank===31);
  assert(deck,'Missing original rank31');
  console.log(JSON.stringify({
    originalSourceRank:31,model:'clean other-Basic starter, 1 natural draw, Fog and Wonder Tag only',
    result:countWonderTagChain(inventory(deck)),
  },null,2));
}
if(require.main===module)main();
module.exports={inventory,successfulPrizeSets,countWonderTagChain};
