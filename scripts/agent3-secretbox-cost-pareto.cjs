'use strict';

/**
 * Exhaustive package-copy Pareto experiment using the exact Secret Box
 * first-turn enumerator. Outside the 4 Frillish + 4 Arven + 1 Secret Box
 * shell, all four evolution/Item/Tool/Stadium resource categories vary 1..4.
 * Assumes a 12-Basic deck and puts each saved slot into a cheap-discard pool
 * of the 60-card deck while holding 23 non-connector cards protected.
 * If Secret Box is selected, THREE cheap discard cards must already be in
 * hand by the ordinary first-turn draw. Fixed source start probability is a
 * modeling choice, not evidence of actual tournament seat frequencies.
 */
const {exactSecretBoxShield}=require('./agent3-jellicent-secret-box-shield-access.cjs');

/**
 * @param {{baseCheap?:number,sourceFirstWeight?:number}} [options]
 * @returns {{selected:Array<{namedSlots:number,jellicent:number,boostShake:number,
 * stealthyHood:number,silentLab:number,cheapDiscards:number,
 * goingFirst:number,goingSecond:number,weighted:number}>,
 * bestOverall:{namedSlots:number,weighted:number}}}
 */
function optimize(options={}){
  const baseCheap=options.baseCheap??12;
  const sourceFirstWeight=options.sourceFirstWeight??0.5;
  if(!Number.isInteger(baseCheap)||baseCheap<0||baseCheap>35)
    throw new RangeError('baseCheap must be 0..35');
  if(!Number.isFinite(sourceFirstWeight)||sourceFirstWeight<0||
    sourceFirstWeight>1)
    throw new RangeError('sourceFirstWeight must be 0..1');
  /** @type {Map<number,{
   * namedSlots:number,jellicent:number,boostShake:number,
   * stealthyHood:number,silentLab:number,cheapDiscards:number,
   * goingFirst:number,goingSecond:number,weighted:number
   * }>} */
  const selected=new Map();
  for(let jellicent=1;jellicent<=4;jellicent++){
    for(let boostShake=1;boostShake<=4;boostShake++){
      for(let stealthyHood=1;stealthyHood<=4;stealthyHood++){
        for(let silentLab=1;silentLab<=4;silentLab++){
          const namedSlots=9+jellicent+boostShake+stealthyHood+silentLab;
          const cheapDiscards=baseCheap+25-namedSlots;
          const common={jellicent,boostShake,stealthyHood,silentLab,
            arven:4,secretBox:1,cheapDiscards,minCheapDiscards:3};
          const goingSecond=exactSecretBoxShield({
            ...common,goingSecond:true
          }).conditionalValidBasic;
          const goingFirst=exactSecretBoxShield({
            ...common,goingSecond:false
          }).conditionalValidBasic;
          const weighted=sourceFirstWeight*goingSecond+
            (1-sourceFirstWeight)*goingFirst;
          const item={namedSlots,jellicent,boostShake,stealthyHood,
            silentLab,cheapDiscards,goingFirst,goingSecond,weighted};
          if((selected.get(namedSlots)?.weighted??-1)<weighted)
            selected.set(namedSlots,item);
        }
      }
    }
  }
  const result=[...selected.values()].sort((x,y)=>x.namedSlots-y.namedSlots);
  const best=result.reduce((a,b)=>a.weighted>b.weighted?a:b);
  return {selected:result,bestOverall:{
    namedSlots:best.namedSlots,weighted:best.weighted
  }};
}

module.exports={optimize};
if(require.main===module){
  const output=optimize();
  process.stdout.write(JSON.stringify(output,null,2)+'\n');
}
