'use strict';
/**
 * Research-only Cursed Blast *immediate* finish from an actual actor frontier.
 * Opponent Active last in play OR prize-valued Active/Bench KO closes our
 * Prize count. Require Bench Dusk source, surviving own Active, opponent
 * >=2 Prizes (Dusk selfKO must not hand opponent the game), visible no-Tool
 * target, known exact printed prize class when >=2 are necessary.
 * Actual PlaceDamageCountersEffect can still be prevented by effects not
 * represented in actor view: proposals are conditional, not game receipts.
 */
const {abilitySource,DIRECT_GUST_TARGETS}=require('./agent22-newmoon-countercatcher-actor-sequence.cjs');
const int=x=>Number.isSafeInteger(x)&&x>=0;
const has=(x,s)=>typeof x==='string'&&x.includes(s);
function targetPrizeValue(t){
 if(!t||typeof t.printing!=='string'||!int(t.hp))return null;
 const pair=DIRECT_GUST_TARGETS.find(([name,hp])=>has(t.printing,name)&&t.hp===hp);
 return pair?pair[2]:null;
}
function qualifyingTarget(t,ownPrizes,opponentBenchEmpty,active){
 if(!t||typeof t.printing!=='string'||!int(t.hp)||
    !int(t.damage)||t.damage>=t.hp||t.hp-t.damage>130||
    !Array.isArray(t.tools)||t.tools.length!==0)return null;
 if(opponentBenchEmpty&&active)
   return {mode:'no-opponent-pokemon',prizes:targetPrizeValue(t)};
 const prize=targetPrizeValue(t);
 if(ownPrizes===1||prize!==null&&prize>=ownPrizes)
   return {mode:'all-prizes',prizes:prize};
 return null;
}
function createAbilityTerminalSlice({seat}){
 if(seat!==0&&seat!==1)throw Error('ACTOR_SEAT_REQUIRED');
 let pending=null;
 const peek=()=>pending?{...pending}:null,reset=()=>{pending=null;};
 function decide(req){
  const v=req?.observation;
  if(req?.role!=='candidate'||req.seat!==seat||v?.actorSeat!==seat||
     !int(v?.globalTurn)||!v?.ownPublic||!v?.opponentPublic){
   reset();return null;
  }
  const own=v.ownPublic,opp=v.opponentPublic;
  if(!int(own.prizeCount)||own.prizeCount<1||own.prizeCount>6||
     !int(opp.prizeCount)||opp.prizeCount<2||opp.prizeCount>6||
     !Array.isArray(opp.bench)||!Array.isArray(own.bench)||
     !own.active?.printing){reset();return null;}
  if(pending&&pending.turn!==v.globalTurn){reset();return null;}
  if(v.decisionKind==='owner-prompt'){
   if(!pending||req.actionFrontier!==null||
      req.prompt?.actingSeat!==seat||
      req.prompt.promptType!=='ChoosePokemonPrompt'||
      req.prompt.source?.classification!=='actor-choice'||
      req.prompt.source.sourceKind!=='card-effect'||
      req.prompt.source.effectName!=='Cursed Blast'||
      !has(req.prompt.source.sourcePrinting,'Dusknoir')||
      req.prompt.publicMetadata?.selectionType!=='pokemon'||
      req.prompt.publicMetadata?.minimumCount!==1||
      req.prompt.publicMetadata?.maximumCount!==1||
      !Array.isArray(req.prompt.choices)){reset();return null;}
   const t=pending.zone==='active'?opp.active:opp.bench[pending.index];
   if(!t||t.printing!==pending.printing||t.hp!==pending.hp||
      t.damage!==pending.damage||!Array.isArray(t.tools)||t.tools.length||
      // State may alter between root and prompt; no speculative KO.
      !qualifyingTarget(t,own.prizeCount,
        opp.bench.filter(Boolean).length===0,pending.zone==='active')){
     reset();return null;
   }
   const selection=req.prompt.choices.find(c=>c.kind==='pokemon'&&
     c.printing===pending.printing&&c.publicMetadata?.ownerSeat==='opponent'&&
     c.publicMetadata.isOwnerVisible===true&&
     c.publicMetadata.targetZone===pending.zone&&
     (pending.zone==='active'||c.publicMetadata.benchIndex===pending.index));
   if(!selection){reset();return null;}
   const mode=pending.mode;reset();
   return {decision:{kind:'select-choices',tokens:[selection.token]},
    reason:mode==='no-opponent-pokemon'?
      'A22_BLAST_LAST_OPPONENT_POKEMON_WIN_PROMPT':
      'A22_BLAST_FINAL_PRIZE_WIN_PROMPT'};
  }
  if(v.decisionKind!=='owner-root'||req.prompt!==null||
     !Array.isArray(req.actionFrontier?.items)){reset();return null;}
  if(pending){reset();return null;}
  const a=abilitySource(own,req.actionFrontier.items);
  if(!a)return null;
  const benchEmpty=opp.bench.filter(Boolean).length===0;
  const targets=[];
  const collect=(t,zone,index)=>{
   const d=qualifyingTarget(t,own.prizeCount,benchEmpty,zone==='active');
   if(d)targets.push({target:t,zone,index,mode:d.mode});
  };
  collect(opp.active,'active',0);
  opp.bench.forEach((t,i)=>collect(t,'bench',i));
  if(!targets.length)return null;
  targets.sort((a,b)=>
    Number(a.mode!=='all-prizes')-Number(b.mode!=='all-prizes')||
    Number(a.zone!=='active')-Number(b.zone!=='active')||
    a.target.hp-a.target.damage-(b.target.hp-b.target.damage)||
    a.index-b.index);
  const best=targets[0];
  pending={turn:v.globalTurn,zone:best.zone,index:best.index,
   printing:best.target.printing,hp:best.target.hp,
   damage:best.target.damage,mode:best.mode};
  return {decision:{kind:'select-action',token:a.token},
   reason:best.mode==='no-opponent-pokemon'?
     'A22_BLAST_LAST_OPPONENT_POKEMON_WIN':
     'A22_BLAST_FINAL_PRIZE_WIN',
   target:pending.printing,
   projectedTerminalMode:best.mode,
   note:'Conditional: native damage-counter placement and self-KO resolution untested'};
 }
 return {decide,peek,reset};
}
module.exports={createAbilityTerminalSlice,targetPrizeValue,qualifyingTarget};
