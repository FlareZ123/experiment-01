'use strict';
/** Choose a minimal printed Bellowing knockout payment using public Basic Energy cards. Caller must verify the originating native prompt and source printing. */
function chooseBellowingPayment(view,basicEnergies){
  if(view.decisionKind!=='owner-prompt'||view.ownPublic?.active?.printing!=='Raging Bolt ex TEF')return null;
  const enemy=view.opponentPublic?.active;
  if(!enemy||!Number.isSafeInteger(enemy.hp)||!Number.isSafeInteger(enemy.damage))return null;
  const k=Math.ceil((enemy.hp-enemy.damage)/70);
  if(k<1)return null;
  const own=view.ownPublic;
  const slots=[...(own.bench??[]).map((card,index)=>({card,slot:'bench',index})),{card:own.active,slot:'active',index:0}];
  const cards=slots.flatMap(({card,slot,index})=>(card?.energies??[]).flatMap((printing,energyIndex)=>basicEnergies.has(printing)?[{slot,index,energyIndex,printing}]:[]));
  return cards.length>=k?{count:k,choices:cards.slice(0,k)}:null;
}
module.exports={chooseBellowingPayment};
