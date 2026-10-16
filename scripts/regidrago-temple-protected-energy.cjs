'use strict';
const field=require('../results/aichi-2026/full-decklists.json');
const {choose,regidragoTempleResponses}=require('./regidrago-temple-answers.cjs');

/**
 * Exact conditional first-eight Temple response with six hidden Prizes.
 * Q pays with another Q or Energy surplus above retained Grass and Fire;
 * DDE remains fully protected unless allowSpareDde is true, in which case
 * one DDE copy is retained. Discard utility and actual play are not modeled.
 *
 * @param {{size?:number,opening?:number,prizes?:number,basics:number,
 * outs:number,marshadow:number,searchers:number,grass:number,fire:number,
 * dde:number,allowSpareDde?:boolean}} input
 */
function protectedTempleAccess(input) {
  const {size=60,opening=7,prizes=6,basics,outs,marshadow,searchers,
    grass,fire,dde,allowSpareDde=false}=input;
  const ns=[size,opening,prizes,basics,outs,marshadow,searchers,grass,fire,dde];
  if(!ns.every(Number.isInteger)||size<=opening+prizes||opening<1||prizes<0||
      basics<1||marshadow<0||marshadow>1||marshadow>basics||
      [outs,searchers,grass,fire,dde].some(x=>x<0)||
      basics+outs+searchers+grass+fire+dde>size)throw RangeError('counts');
  const counts=[outs,marshadow,searchers,basics-marshadow,grass,fire,dde,
    size-basics-outs-searchers-grass-fire-dde];
  const rem=BigInt(size-opening-1),unprized=rem-BigInt(prizes);
  let valid=0n,den=0n,num=0n;
  const visit=(i,remaining,seen,ways)=>{
    if(i===counts.length-1){
      if(remaining>counts[i]||seen[1]+seen[3]===0)return;
      const hand=[...seen,remaining],weight=ways*choose(counts[i],remaining);
      valid+=weight;
      for(let next=0;next<counts.length;next++){
        const count=counts[next]-hand[next];
        if(count<=0)continue;
        const w=weight*BigInt(count),at=j=>hand[j]+Number(next===j);
        den+=w*rem;
        const direct=at(0)>0||(hand[1]>0&&hand[3]>0)||next===1;
        const payable=at(2)>1||at(4)>1||at(5)>1||
          (allowSpareDde&&at(6)>1);
        if(direct)num+=w*rem;
        else if(marshadow===1&&hand[1]===0&&next!==1&&
          at(2)>0&&payable)num+=w*unprized;
      }
      return;
    }
    for(let x=0;x<=Math.min(remaining,counts[i]);x++)
      visit(i+1,remaining-x,[...seen,x],ways*choose(counts[i],x));
  };
  visit(0,opening,[],1n);
  const expected=choose(size,opening)-choose(size-basics,opening);
  if(valid!==expected||den!==valid*BigInt(size-opening)*rem)
    throw Error('partition');
  return {numerator:num.toString(),denominator:den.toString(),
    probability:Number(num)/Number(den)};
}

/** @returns {object[]} Source-printed nine-Regidrago resource scenarios. */
function aichiProtectedTempleAccess() {
  return regidragoTempleResponses().rows.map(row=>{
    const deck=field.decks.find(x=>x.rank===row.rank);
    const count=name=>deck.cards.filter(x=>x.name===name)
      .reduce((sum,x)=>sum+x.count,0);
    const params={basics:row.basics,outs:row.stadiums+row.removalItems,
      marshadow:row.marshadow,
      searchers:count('Quick Ball')+count('Mysterious Treasure'),
      grass:count('Grass Energy'),fire:count('Fire Energy'),
      dde:count('Double Dragon Energy')};
    return {...params,rank:row.rank,
      protectEveryDde:protectedTempleAccess(params).probability,
      protectOneDde:protectedTempleAccess({...params,allowSpareDde:true}).probability};
  });
}
if(require.main===module)
  process.stdout.write(JSON.stringify(aichiProtectedTempleAccess(),null,2)+'\n');
module.exports={protectedTempleAccess,aichiProtectedTempleAccess};
