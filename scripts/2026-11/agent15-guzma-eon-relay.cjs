'use strict';
/** Conditional three-KO Guzma / VS Seeker Eon route. Not a Pokémon match.
 * No searching, draws, new board development, hidden decision, or native
 * engine interaction. All supporters/items/attack sources are stipulated.
 * In-play and remaining attached-energy/HP/prizes are explicitly tracked.
 */
const REPLIES=Object.freeze({ covert:70, phantom:200, rolling:200, ryuno:330 });
function evaluate(opts={}){
  const o={dna:true,band:true,valley:true,fairy:true,skyliner:true,
           guzma:true,vs:true,items:true,secondGustDragon:true,finalGustDragon:true,
           replies:['covert','covert'],clefairyHealth:190,initialLatiasDamage:0,
           ...opts};
  const trace=[];
  let ownPrizes=0,sourcePrizes=0,latiasHP=210-o.initialLatiasDamage;
  let energyOnLatias=2,cooldown=false,retreats=0,supporters=0;
  const fail=(why)=>({success:false,why,ownPrizes,sourcePrizes,latiasHP,energyOnLatias,trace});
  const event=(label,other={})=>trace.push({label,latiasHP,ownPrizes,sourcePrizes,energyOnLatias,...other});
  if(!o.valley||!o.fairy||o.clefairyHealth<=0||latiasHP<=0)return fail('initial Valley / Fairy Zone / surviving board absent');
  function eon(targetHP,tag){
    if(cooldown)return false;
    const damage=200*2; // Dragon weakness from current Clefairy
    if(energyOnLatias<2||damage<targetHP)return false;
    ownPrizes+=2;cooldown=true;event(tag,{damage,targetHP});return true;
  }
  function reply(kind,turn){
    if(!(kind in REPLIES))return false;
    let damage=REPLIES[kind]+(o.band?20:0)-(o.dna?30:0);
    damage=Math.max(0,damage);latiasHP-=damage;event('source '+turn+' '+kind,{damage});
    if(latiasHP<=0){sourcePrizes+=2;return false;}
    return true;
  }
  function guzmaBounce(targetHP,turn){
    // Guzma first requires a Benched opponent target; after opponent switch,
    // own Latias is switched to a Benched position. It loses attack effects.
    // Clefairy Basic is promoted and voluntarily retreats under Skyliner.
    if(!o.guzma)return false;
    if(!o.skyliner)return false;
    supporters++;retreats++;cooldown=false;
    event('Guzma target + Latias-to-Bench + Clefairy free retreat A'+turn,{supporters,retreats});
    return eon(targetHP,'Eon KO A'+turn);
  }
  if(!eon(280,'Eon KO A1'))return fail('first funded Eon unavailable');
  if(!reply(o.replies[0],1))return fail('Latias knocked out by first source reply');
  if(!o.secondGustDragon)return fail('no second 2-Prize Dragon available to gust');
  if(!guzmaBounce(220,2))return fail('A2 Guzma bounce / target or Eon unavailable');
  if(!reply(o.replies[1],2))return fail('Latias knocked out by second source reply');
  if(!o.items||!o.vs)return fail('VS Seeker recovery unavailable for A3 Guzma');
  if(!o.finalGustDragon)return fail('no third 2-Prize Dragon available to gust');
  if(!guzmaBounce(220,3))return fail('A3 Guzma bounce / target or Eon unavailable');
  if(ownPrizes!==6)return fail('did not take all six Prizes');
  return {success:true,why:'conditional three-KO route',ownPrizes,sourcePrizes,
          latiasHP,energyOnLatias,trace,retreats,supporters};
}
module.exports={REPLIES,evaluate};
if(require.main===module){
  console.log(JSON.stringify([
    evaluate(),evaluate({dna:false}),evaluate({replies:['phantom','covert']}),
    evaluate({vs:false}),evaluate({finalGustDragon:false})
  ],null,2));
}
