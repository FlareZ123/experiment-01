"use strict";

// Agent21 advisory for the approved common candidate-policy successor.
// Inputs are detached, explicitly verified public/owner-held resources, never native Store or hidden zones.
function acerolaMaxGeist(input, maxStates = 40000) {
  // A bounded, actor-visible, known-Energy certificate. Not a complete rules engine.
  // The caller must certify that the supplied permissions/costs/damage modifiers remain
  // valid for EVERY enumerated removal and promotion. Otherwise abstain.
  const fail = reason => ({advisory:true, decision:null, reason});
  if (!input || input.stablePublicEffects !== true || input.noUnmodeledTerminalEffects !== true)
    return fail("dynamic or unverified effects");
  const {board, active, target, prizesRemaining} = input;
  if (!Array.isArray(board) || board.length < 1 || board.length > 9 ||
      !Number.isInteger(active) || active < 0 || active >= board.length ||
      !Number.isInteger(prizesRemaining) || prizesRemaining < 1 || prizesRemaining > 6 ||
      !Number.isInteger(maxStates) || maxStates < 1) return fail("invalid board or bound");
  const int = (n, lo, hi) => Number.isInteger(n) && n >= lo && n <= hi;
  const bool = x => typeof x === "boolean";
  if (!int(input.handPsychic,0,11) || !int(input.deckCount,0,60) ||
      !["manualAvailable","retreatAvailable","supportAvailable","acerolaHeld","manualAttachmentAllowed","dimensionValley"].every(k=>bool(input[k])))
    return fail("unverified turn resources");
  if (!target || !int(target.remainingHP,10,1000) || !int(target.prizesOnKO,0,6) ||
      !int(target.opponentBoardCount,1,9) || ![1,2].includes(target.weaknessMultiplier) ||
      !int(target.resistance,0,1000) || !int(target.damageReduction,0,1000))
    return fail("unverified damage or prize geometry");
  if (new Set(board.map(x=>x.id)).size !== board.length ||
      board.some(x=>typeof x.id!=="string" || !x.id ||
        !int(x.energy,0,11) || !int(x.damage,0,1000) || !int(x.retreatCost,0,11) ||
        !["psychic","vmax","doorAvailable","canAttack","canRetreat"].every(k=>bool(x[k])) ||
        (x.vmax&&!x.psychic) || (x.doorAvailable&&!x.vmax)) ||
      input.handPsychic+board.reduce((a,x)=>a+x.energy,0)>11)
    return fail("invalid or unsupported physical board");
  const n=board.length, ids=board.map(x=>x.id), bit=i=>1<<i;
  const initial={live:(1<<n)-1, a:active, e:board.map(x=>x.energy), h:input.handPsychic,
    m:!input.manualAvailable, r:!input.retreatAvailable, d:0, b:-1, deck:input.deckCount,
    path:[]};
  const live=(s,i)=>Boolean(s.live&bit(i));
  const living=s=>board.map((_,i)=>i).filter(i=>live(s,i));
  const key=s=>[s.live,s.a,s.e.join(","),s.h,+s.m,+s.r,s.d,s.b,s.deck].join("|");
  const queue=[initial], seen=new Set([key(initial)]), best=new Map();
  let capped=false, head=0;
  function push(s,changes,action) {
    const next={...s,...changes,path:[...s.path,action]};
    const k=key(next);
    if(seen.has(k))return;
    if(seen.size>=maxStates){capped=true;return;}
    seen.add(k);queue.push(next);
  }
  function setEnergy(s,i,value){const e=s.e.slice();e[i]=value;return e;}
  const totalEnergy=s=>living(s).reduce((sum,i)=>sum+s.e[i],0);
  function record(s) {
    if (!board[s.a].vmax || !board[s.a].canAttack ||
        s.e[s.a]<(input.dimensionValley?2:3)) return;
    const total=totalEnergy(s);
    const raw=10+30*total;
    const damage=Math.max(0,Math.max(0,raw*target.weaknessMultiplier-target.resistance)-target.damageReduction);
    const ko=damage>=target.remainingHP;
    const prizes=ko?target.prizesOnKO:0;
    const wins=ko&&(prizes>=prizesRemaining||target.opponentBoardCount===1);
    // Prefer fewer actions for equal terminal payoff; do not claim general utility.
    const score=[+wins,prizes,Math.min(damage,target.remainingHP),-s.path.length,total,s.h];
    const branch=s.b<0?"no-acerola":ids[s.b];
    const previous=best.get(branch);
    const better=!previous||score.some((x,j)=>x!==previous.score[j]&&
       score.slice(0,j).every((v,k)=>v===previous.score[k])&&x>previous.score[j]);
    if(better)best.set(branch,{score,branch,attacker:ids[s.a],damage,prizes,wins,
      boardPsychic:total,handPsychic:s.h,actions:[...s.path,{kind:"attack",name:"Max Geist",source:ids[s.a]}],
      unknownDrawsIgnored:input.deckCount-s.deck});
  }
  while(head<queue.length){
    const s=queue[head++], own=living(s);
    record(s);
    if(s.h>0&&!s.m&&input.manualAttachmentAllowed){
      for(const i of own)push(s,{e:setEnergy(s,i,s.e[i]+1),h:s.h-1,m:true},
        {kind:"manual-attach",target:ids[i]});
    }
    if(s.h>0){
      for(const j of own){
        if(!board[j].doorAvailable||(s.d&bit(j)))continue;
        for(const i of own){
          if(i===s.a||!board[i].psychic)continue;
          const count=Math.min(2,s.deck);
          push(s,{e:setEnergy(s,i,s.e[i]+1),h:s.h-1,d:s.d|bit(j),deck:s.deck-count},
            {kind:"underworld-door",source:ids[j],target:ids[i],drawIgnored:count});
        }
      }
    }
    if(!s.r&&board[s.a].canRetreat&&s.e[s.a]>=board[s.a].retreatCost){
      const cost=board[s.a].retreatCost;
      for(const i of own)if(i!==s.a)push(s,{a:i,r:true,e:setEnergy(s,s.a,s.e[s.a]-cost)},
        {kind:"retreat",source:ids[s.a],target:ids[i],discardPsychic:cost});
    }
    if(s.b<0&&input.supportAvailable&&input.acerolaHeld&&own.length>1){
      for(const i of own){
        if(board[i].damage===0)continue;
        for(const promotion of i===s.a?own.filter(j=>j!==i):[s.a]){
          push(s,{live:s.live&~bit(i),a:promotion,b:i,h:s.h+s.e[i],e:setEnergy(s,i,0)},
            {kind:"acerola",target:ids[i],promotion:i===s.a?ids[promotion]:null,returnedPsychic:s.e[i]});
        }
      }
    }
  }
  const plans=[...best.values()].map(({score,...x})=>x);
  const baseline=plans.find(x=>x.branch==="no-acerola"&&x.wins);
  const bounce=plans.filter(x=>x.branch!=="no-acerola"&&x.wins)
    .sort((a,b)=>a.actions.length-b.actions.length||b.boardPsychic-a.boardPsychic||a.branch.localeCompare(b.branch))[0];
  const winner=baseline||bounce;
  return {advisory:true, states:seen.size, completeWithinModel:!capped,
    decision:winner?{kind:"immediate-win-certificate",firstAction:winner.actions[0],plan:winner}:null,
    plans, boundary:"Positive known-resource certificate only. No opponent turn, other Trainers, other attacks, rebenching returned cards, new draw identities, dynamic lock/status/cost changes or native legality checks. Revalidate root and every prompt; replan after draws. Absence of a certificate does not prove absence of a winning line."};
}

function selfTest() {
  const assert=(c,m)=>{if(!c)throw new Error(m)};
  const v=(id,energy,damage=0,doorAvailable=false)=>({id,energy,damage,psychic:true,vmax:true,doorAvailable,retreatCost:2,canRetreat:false,canAttack:true});
  const b=(id,energy=0,damage=0)=>({...v(id,energy,damage),vmax:false});
  const fixture=(board,hp,extra={})=>({stablePublicEffects:true,noUnmodeledTerminalEffects:true,board,active:0,
    handPsychic:0,deckCount:20,manualAvailable:true,retreatAvailable:true,supportAvailable:true,acerolaHeld:true,
    manualAttachmentAllowed:true,dimensionValley:false,prizesRemaining:2,
    target:{remainingHP:hp,prizesOnKO:2,opponentBoardCount:2,weaknessMultiplier:1,resistance:0,damageReduction:0},...extra});
  const results=[];
  function check(name,input,expected,extraCheck=()=>true){
    const r=acerolaMaxGeist(input);
    assert(r.completeWithinModel,name+": capped or unsupported");
    assert((r.decision?.plan.branch??null)===expected,name+": unexpected branch "+JSON.stringify(r));
    assert(extraCheck(r),name+": extra check");
    results.push({name,states:r.states,branch:r.decision?.plan.branch??null,plans:r.plans});
  }
  check("preserve six-energy lethal over damaged-active bounce",fixture([v("a",4,220),v("b",2),b("c")],190),"no-acerola",
     r=>r.plans.find(x=>x.branch==="a")?.wins===false);
  check("Acerola creates funded promotion when retreat is blocked",fixture([v("a",1,220),v("b",4),b("c")],160),"a",
     r=>r.decision.plan.actions[0].kind==="acerola"&&r.decision.plan.actions[1].kind==="manual-attach");
  check("use damaged Active Door before returning it",fixture([v("a",0,220,true),v("b",2),b("c")],100,{handPsychic:1,manualAvailable:false}),"a",
     r=>r.decision.plan.actions.map(x=>x.kind).join(",")==="underworld-door,acerola,attack"&&r.decision.plan.actions[0].target==="b");
  check("do not bounce damaged benched energy engine before lethal",fixture([v("a",3),v("b",3,230)],190),"no-acerola",
     r=>r.plans.find(x=>x.branch==="b")?.wins===false);
  check("exclude removal of sole Pokémon",fixture([v("a",2,220)],100),null,
     r=>r.plans.every(x=>x.branch==="no-acerola"));
  const retreatInput=fixture([{...b("a",2,20),canRetreat:true},v("b",4)],130);
  check("paid retreat is a legitimate alternative to spending Supporter",retreatInput,"no-acerola",
     r=>r.decision.plan.actions[0].kind==="retreat"&&r.decision.plan.actions[0].discardPsychic===2);
  check("unseen Door draws cannot fund the Active",fixture([v("a",2,0,true),b("b")],100,{handPsychic:1,manualAvailable:false}),null);
  check("Dimension Valley changes the actual cost",fixture([v("a",2),b("b",3)],160,{dimensionValley:true}),"no-acerola");
  check("weakness and resistance applied to final damage",fixture([v("a",3),b("b")],170,{target:{remainingHP:170,prizesOnKO:2,opponentBoardCount:2,weaknessMultiplier:2,resistance:30,damageReduction:0}}),"no-acerola");
  check("one remaining enemy Pokémon is a terminal route independent of Prize count",fixture([v("a",3),b("b")],100,{prizesRemaining:6,target:{remainingHP:100,prizesOnKO:1,opponentBoardCount:1,weaknessMultiplier:1,resistance:0,damageReduction:0}}),"no-acerola");
  assert(acerolaMaxGeist({...retreatInput,stablePublicEffects:false}).decision===null,"dynamic effects must abstain");
  assert(acerolaMaxGeist(retreatInput,1).completeWithinModel===false,"cap must be explicit");
  return results;
}

module.exports={acerolaMaxGeist,selfTest};
if(require.main===module)console.log(JSON.stringify(selfTest(),null,2));
