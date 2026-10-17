'use strict';

const {choose,gcd}=require('./mega-floette-direct-window.cjs');

/**
 * Necessary physical-card possession event for a hypothetical package of
 * Floette, Prism Tower and Ange Floette, each 1x, plus at least one Psychic
 * Energy by first normal turn draw. No search, other draw or effects.
 * Valid opener means one of 15 Basic cards in first seven. Singletons
 * replace three source non-Basic/non-Energy slots, retaining 11 Psychic.
 * @returns {{fraction:string,probability:number}}
 */
function directAngeOpen() {
  const sizes=[1,14,11,1,1,32]; // Floette, other Basic, Psychic, Prism, Ange, other
  const denominator=(choose(60,7)-choose(45,7))*53n;
  let numerator=0n;
  for(let f=0;f<=1;f++)for(let b=0;b<=7;b++)
    for(let e=0;e<=7;e++)for(let p=0;p<=1;p++)
      for(let a=0;a<=1;a++) {
        const o=7-f-b-e-p-a;
        if(f+b<1||o<0||o>32)continue;
        const opening=[f,b,e,p,a,o];
        let ways=1n;
        for(let i=0;i<sizes.length;i++) ways*=choose(sizes[i],opening[i]);
        for(let next=0;next<sizes.length;next++) {
          const count=sizes[next]-opening[next];
          if(count===0)continue;
          const observed=opening.slice();
          observed[next]++;
          if(observed[0]>=1&&observed[2]>=1&&
            observed[3]>=1&&observed[4]>=1)
            numerator+=ways*BigInt(count);
        }
      }
  const d=gcd(numerator,denominator);
  return {fraction:String(numerator/d)+'/'+String(denominator/d),
    probability:Number(numerator)/Number(denominator)};
}

/**
 * Survived identical unmodified damage hits without healing.
 * A knockout happens at zero remaining HP.
 * @param {number} hp Pokémon maximum HP, after continuous HP modifiers.
 * @param {number} damage Damage to that Pokémon per attack.
 * @returns {number} Number of complete incoming hits survived.
 */
function survivingHits(hp,damage) {
  if(!Number.isInteger(hp)||!Number.isInteger(damage)||hp<=0||damage<=0)
    throw new RangeError('Positive integer HP and damage required');
  return Math.floor((hp-1)/damage);
}

if(require.main===module) {
  const report={directAngeFirstTurn:directAngeOpen(),
    printedMegaFloetteHp:250,withAngeFloetteHp:400,
    survival:[100,130,150,180,190,200,220].map(damage=>({
      damage,surviveAt250:survivingHits(250,damage),
      surviveAt400:survivingHits(400,damage)
    }))};
  process.stdout.write(JSON.stringify(report,null,2)+'\n');
}
module.exports={directAngeOpen,survivingHits};
