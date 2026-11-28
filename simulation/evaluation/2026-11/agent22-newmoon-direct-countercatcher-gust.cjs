'use strict';
/**
 * Research-only direct gust-and-attack FINISHER for unchanged New Moon v3.
 * Unlike Dusknoir self-KO's tied-Prize conversion, here Counter Catcher is
 * ALREADY LEGAL (own Prizes > opponent Prizes), so Dusk is not expended.
 *
 * Native actor-root Item -> owner ChoosePokemonPrompt -> new native root
 * printed Miraculous Duo-GX or UseAbility/Perfection -> ChooseAttackPrompt.
 * No hidden zone reads, guessed tokens or actual native game claims.
 */
const {
 offeredMewtwoAttack,ownerBenchChoice,ownerPerfectionNightWatchPrompt,
 visiblePrintedDuoDamage,psychicCostPhysicallyReady,nightWatchDonor,
 certifiedDamage
}=require('./agent22-newmoon-countercatcher-actor-sequence.cjs');
const int=x=>Number.isSafeInteger(x)&&x>=0;
const has=(x,s)=>typeof x==='string'&&x.includes(s);
const select=(x,reason)=>({decision:{kind:'select-action',token:x.token},reason});
function targetPrizesAndHp(t){
 if(!t||!int(t.hp)||!int(t.damage)||t.damage>=t.hp||
    !Array.isArray(t.tools)||t.tools.length)return null;
 const known=[
  ['Mega Lopunny ex',330,3],['Mega Kangaskhan ex',300,3],
  ['Mega Absol ex',280,3],['Mega Dragonite ex',370,3],
  ['Regidrago VSTAR',280,2]];
 const k=known.find(([n,h])=>has(t.printing,n)&&t.hp===h);
 return k?{prize:k[2],remaining:t.hp-t.damage}:null;
}
function choosePotentialFinish(own,opp,items,t){
 const current=targetPrizesAndHp(t);
 if(!current||!int(own?.prizeCount)||current.prize<own.prizeCount)return null;
 const night=offeredMewtwoAttack(own,items,'Night Watch',opp);
 if(night&&current.remaining<=150)
   return {attackName:'Night Watch',rootAction:night,requiredDamage:150};
 const printed=offeredMewtwoAttack(own,items,'Miraculous Duo-GX',opp);
 const amount=visiblePrintedDuoDamage(own,opp,t);
 if(printed&&Number.isFinite(amount)&&amount>=current.remaining)
   return {attackName:'Miraculous Duo-GX',rootAction:printed,
    requiredDamage:current.remaining,projectedDamage:amount};
 return null;
}
function itemFromOwnHand(view,items){
 if(!Array.isArray(view?.ownHand)||!Array.isArray(items))return null;
 return items.find(x=>x.kind==='play-card'&&
   has(x.actorPrinting,'Counter Catcher')&&
   x.publicMetadata?.cardType==='trainer'&&
   int(x.publicMetadata.handIndex)&&
   has(view.ownHand[x.publicMetadata.handIndex],'Counter Catcher'))??null;
}
function createDirectGustSlice({seat}){
 if(seat!==0&&seat!==1)throw Error('ACTOR_SEAT_REQUIRED');
 let state=null;
 const peek=()=>state?{...state}:null;
 const reset=()=>{state=null;};
 function decide(req){
  const v=req?.observation,items=req?.actionFrontier?.items;
  if(req?.role!=='candidate'||req.seat!==seat||v?.actorSeat!==seat||
     !int(v?.globalTurn)||!v.ownPublic||!v.opponentPublic){
   reset();return null;
  }
  const own=v.ownPublic,opp=v.opponentPublic;
  if(!int(own.prizeCount)||!int(opp.prizeCount)||
     !Array.isArray(own.bench)||!Array.isArray(opp.bench)){
   reset();return null;
  }
  if(state&&state.turn!==v.globalTurn){reset();return null;}
  if(v.decisionKind==='owner-prompt'){
   if(!state||req.actionFrontier!==null){reset();return null;}
   if(state.phase==='gust-target'){
    const t=opp.bench[state.index];
    if(t?.printing!==state.printing||t.hp!==state.hp||
       t.damage!==state.initialDamage){reset();return null;}
    const item=ownerBenchChoice(req.prompt,seat,'Counter Catcher',
      state.printing,state.index);
    if(!item){reset();return null;}
    state.phase='post-gust';
    return {decision:{kind:'select-choices',tokens:[item.token]},
     reason:'A22_DIRECT_CC_SELECT_PRIZE_CARRIER'};
   }
   if(state.phase==='perfection-attack-prompt'){
    const t=opp.active;
    if(t?.printing!==state.printing||t.hp!==state.hp||
       t.hp-t.damage>150||!psychicCostPhysicallyReady(own,opp)||
       !nightWatchDonor(own)){reset();return null;}
    const a=ownerPerfectionNightWatchPrompt(req.prompt,seat,own,
      state.printing);
    if(!a){reset();return null;}
    reset();
    return {decision:{kind:'select-choice',token:a.token},
     reason:'A22_DIRECT_CC_PERFECTION_SELECT_PAID_NIGHT_WATCH'};
   }
   reset();return null;
  }
  if(v.decisionKind!=='owner-root'||req.prompt!==null||
     !Array.isArray(items)){reset();return null;}
  if(state){
   if(state.phase!=='post-gust'||own.prizeCount!==state.ownPrizes||
      opp.prizeCount!==state.opponentPrizes||
      own.active?.printing!==state.actorPrinting||
      opp.active?.printing!==state.printing||opp.active.hp!==state.hp||
      opp.active.damage<state.initialDamage||!int(opp.active.damage)||
      opp.active.damage>=opp.active.hp||
      !Array.isArray(opp.active.tools)||opp.active.tools.length){
     reset();return null;
   }
   const action=offeredMewtwoAttack(own,items,state.attackName,opp);
   if(!action){reset();return null;}
   if(state.attackName==='Night Watch'){
    if(opp.active.hp-opp.active.damage>150){reset();return null;}
    state.phase='perfection-attack-prompt';
    return select(action,'A22_DIRECT_CC_USE_NATIVE_PERFECTION');
   }
   if(!certifiedDamage(action,opp.active,own,opp)){reset();return null;}
   const reason=Number.isFinite(action.publicMetadata?.damageAfterResistance)?
      'A22_DIRECT_CC_NATIVE_ANNOTATED_GX_TERMINAL':
      'A22_DIRECT_CC_PRINTED_GX_CONDITIONAL_TERMINAL';
   reset();return select(action,reason);
  }
  // Item must actually be PLAYABLE before choosing this branch. Physically
  // inferior Prize counts cannot be inferred from a card in hand.
  if(own.prizeCount<=opp.prizeCount||own.prizeCount>3||
     own.prizeCount<2)return null;
  const item=itemFromOwnHand(v,items);
  if(!item)return null;
  const alternatives=[];
  for(let i=0;i<opp.bench.length;i++){
   const t=opp.bench[i],choice=choosePotentialFinish(own,opp,items,t);
   if(!choice)continue;
   alternatives.push({index:i,target:t,choice});
  }
  if(!alternatives.length)return null;
  // Prefer no-GX donor attack if already payable, then target more Prizes,
  // stable physical Bench index.
  alternatives.sort((a,b)=>
    Number(a.choice.attackName!=='Night Watch')-
    Number(b.choice.attackName!=='Night Watch')||
    b.target.hp-a.target.hp||a.index-b.index);
  const picked=alternatives[0];
  state={turn:v.globalTurn,phase:'gust-target',
   index:picked.index,printing:picked.target.printing,hp:picked.target.hp,
   initialDamage:picked.target.damage,
   actorPrinting:own.active.printing,
   ownPrizes:own.prizeCount,opponentPrizes:opp.prizeCount,
   attackName:picked.choice.attackName};
  return select(item,'A22_DIRECT_CC_GUST_NO_DUSK_SELF_KO_TERMINAL');
 }
 return {decide,peek,reset};
}
module.exports={createDirectGustSlice,targetPrizesAndHp,
 choosePotentialFinish,itemFromOwnHand};
