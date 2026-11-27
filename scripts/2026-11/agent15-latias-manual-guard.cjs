'use strict';
/**
 * Exact conditional payment reliability for an Active Latias ex with one
 * Psychic attached and Dimension Valley in play: Eon Blade still needs one
 * normal hand attachment. Underworld Door may attach only to a Benched
 * Psychic Pokémon, never the Active Latias. The model is deliberately a
 * one-turn card-resource subproblem, not a Pokémon game or a policy engine.
 *
 * The supplied 60-card conditional state is physical: in play are Radiant
 * Eternatus, two Rider VMAX, Latias ex, Clefairy ex, and one attached Psychic (6 cards);
 * six Prizes (one Psychic), seven-card hand (one Psychic, zero Fog), and
 * 41-card deck (eight Psychic, four Fog Crystal, twenty-nine other cards).
 * No resources are discarded/lost. Every Door has a legal Bench recipient;
 * all three needed Abilities/effects are active. Door draws exactly two.
 */
const DEFAULT = Object.freeze({ deckP: 8, deckFog: 4, deckOther: 29, handP: 1, handFog: 0 });
function choose(n,k){
  if (k<0 || k>n) return 0;
  k=Math.min(k,n-k);let v=1;
  for (let i=1;i<=k;i++)v=v*(n-k+i)/i;
  return v;
}
function drawBranches(p,f,o,n){
  const N=p+f+o,k=Math.min(n,N),den=choose(N,k),ans=[];
  if (!den) return [{p:0,f:0,o:0,prob:1}];
  for(let x=0;x<=Math.min(p,k);x++)for(let y=0;y<=Math.min(f,k-x);y++){
    const z=k-x-y;if(z<0||z>o)continue;
    ans.push({p:x,f:y,o:z,prob:choose(p,x)*choose(f,y)*choose(o,z)/den});
  }
  return ans;
}
function exactDoorFirst({deckP,deckFog,deckOther,handP,handFog},doorLimit,allowFog){
  const memo=new Map();
  function recur(p,f,o,hp,hf,doors){
    const key=[p,f,o,hp,hf,doors].join(',');
    if(memo.has(key))return memo.get(key);
    // When no more Door activations are possible, see whether a manual
    // Psychic attachment can be paid. A legal Fog can acquire a deck P.
    if(!doors || (!hp && !(allowFog && hf && p))){
      const answer=Number(Boolean(hp || (allowFog && hf && p)));
      memo.set(key,answer);return answer;
    }
    // Greedy Door-first uses a Fog only when no Psychic is already held;
    // its use removes one card from both the hand and deck.
    if(!hp){hf--;hp++;p--;}
    hp--;doors--;
    let result=0;
    for(const b of drawBranches(p,f,o,2)){
      result+=b.prob*recur(p-b.p,f-b.f,o-b.o,hp+b.p,hf+b.f,doors);
    }
    memo.set(key,result);return result;
  }
  return recur(deckP,deckFog,deckOther,handP,handFog,doorLimit);
}
function manualFirst({deckP,handP,handFog},allowFog){
  // Active is one Psychic short. Attach from hand now; if necessary,
  // obtain the Psychic by Fog before Door actions.
  return Number(Boolean(handP || (allowFog && handFog && deckP)));
}
function demo(){
  const rows=[];
  for(const allowFog of [false,true])for(const doors of [0,1,2]){
    rows.push({allowFog,doors,manualFirst:manualFirst(DEFAULT,allowFog),
      greedyDoorFirst:exactDoorFirst(DEFAULT,doors,allowFog)});
  }
  return rows;
}
module.exports={DEFAULT,choose,drawBranches,exactDoorFirst,manualFirst,demo};
if(require.main===module)console.log(JSON.stringify(demo(),null,2));
