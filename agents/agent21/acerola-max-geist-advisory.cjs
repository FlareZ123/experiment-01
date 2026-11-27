"use strict";

// Agent21 advisory for approved common two-profile successor; detached verified actor resources only.
function acerolaMaxGeist(input, maxStates = 40000) {
  // Positive known-resource certificates only. Public permissions and damage modifiers
  // must be valid across all enumerated switches/removals; Ranger is the one explicit
  // attack-effect Item-lock transition. Unverified or dynamic effects require abstention.
  const fail=reason=>({advisory:true,decision:null,reason});
  if(!input||input.stablePublicEffects!==true||input.noUnmodeledTerminalEffects!==true)
    return fail("dynamic or unverified effects");
  const {board,active,prizesRemaining}=input;
  const int=(n,lo,hi)=>Number.isInteger(n)&&n>=lo&&n<=hi;
  const bool=x=>typeof x==="boolean";
  if(!Array.isArray(board)||!int(board.length,1,9)||!int(active,0,board.length-1)||
     !int(prizesRemaining,1,6)||!int(maxStates,1,1000000))return fail("invalid board or bound");
  if(!int(input.handPsychic,0,11)||!int(input.deckCount,0,60)||
     !["manualAvailable","retreatAvailable","supportAvailable","acerolaHeld","manualAttachmentAllowed","dimensionValley"].every(k=>bool(input[k])))
    return fail("unverified turn resources");
  const targets=input.opponents??[{id:"active",...input.target}];
  const startOpponent=input.activeOpponent??0;
  if(!Array.isArray(targets)||!int(targets.length,1,9)||!int(startOpponent,0,targets.length-1)||
     new Set(targets.map(x=>x.id)).size!==targets.length||
     targets.some(x=>typeof x.id!=="string"||!x.id||
       !int(x.remainingHP,10,1000)||!int(x.prizesOnKO,0,6)||
       !int(x.opponentBoardCount,1,9)||![1,2].includes(x.weaknessMultiplier)||
       !int(x.resistance,0,1000)||!int(x.damageReduction,0,1000))||
     (input.opponents&&targets.some(x=>x.opponentBoardCount!==targets.length)))
    return fail("unverified damage or prize geometry");
  if(new Set(board.map(x=>x.id)).size!==board.length||
      board.some(x=>typeof x.id!=="string"||!x.id||!int(x.energy,0,11)||
        !int(x.damage,0,1000)||!int(x.retreatCost,0,11)||
        !["psychic","vmax","doorAvailable","canAttack","canRetreat"].every(k=>bool(x[k]))||
        (x.vmax&&!x.psychic)||(x.doorAvailable&&!x.vmax)))
    return fail("invalid or unsupported physical board");
  const optionalBools=["guzmaHeld","guzmaDiscard","acerolaDiscard","rangerHeld","rangerDiscard","itemPlayAllowed","itemPlayAllowedAfterRanger","guzmaWithoutOwnBenchAllowed"];
  if(optionalBools.some(k=>input[k]!==undefined&&!bool(input[k])))
    return fail("unverified optional Trainer permission");
  const vs=input.vsSeekerCount??0, fog=input.fogCount??0, ns=input.nightStretcherCount??0;
  const dp=input.discardPsychic??0, kp=input.knownDeckPsychic??0;
  if(!int(vs,0,2)||!int(fog,0,4)||!int(ns,0,1)||!int(dp,0,11)||!int(kp,0,11)||
     kp>input.deckCount||(kp>0&&input.knownDeckPsychicCertified!==true)||
     input.handPsychic+dp+kp+board.reduce((a,x)=>a+x.energy,0)>11||
     (input.acerolaHeld&&input.acerolaDiscard)||(input.guzmaHeld&&input.guzmaDiscard)||
     (input.rangerHeld&&input.rangerDiscard))
    return fail("resource conservation or K1 evidence failure");
  const n=board.length,ids=board.map(x=>x.id),bit=i=>1<<i;
  const initial={live:(1<<n)-1,a:active,o:startOpponent,e:board.map(x=>x.energy),
    h:input.handPsychic,m:!input.manualAvailable,r:!input.retreatAvailable,d:0,
    sup:"",b:-1,deck:input.deckCount,draws:0,dp,kp,vs,fog,ns,
    ha:input.acerolaHeld,hg:!!input.guzmaHeld,hr:!!input.rangerHeld,
    da:!!input.acerolaDiscard,dg:!!input.guzmaDiscard,dr:!!input.rangerDiscard,
    item:input.itemPlayAllowed===true,path:[]};
  const live=(s,i)=>Boolean(s.live&bit(i));
  const living=s=>board.map((_,i)=>i).filter(i=>live(s,i));
  const key=s=>[s.live,s.a,s.o,s.e.join(","),s.h,+s.m,+s.r,s.d,s.sup,s.b,s.deck,s.draws,
     s.dp,s.kp,s.vs,s.fog,s.ns,+s.ha,+s.hg,+s.hr,+s.da,+s.dg,+s.dr,+s.item].join("|");
  const queue=[initial],seen=new Set([key(initial)]),best=new Map();
  let capped=false,head=0;
  function push(s,changes,action){
    const next={...s,...changes,path:[...s.path,action]},k=key(next);
    if(seen.has(k))return;
    if(seen.size>=maxStates){capped=true;return;}
    seen.add(k);queue.push(next);
  }
  function setEnergy(s,i,value){const e=s.e.slice();e[i]=value;return e;}
  const totalEnergy=s=>living(s).reduce((sum,i)=>sum+s.e[i],0);
  function record(s){
    if(!board[s.a].vmax||!board[s.a].canAttack||s.e[s.a]<(input.dimensionValley?2:3))return;
    const t=targets[s.o],total=totalEnergy(s),raw=10+30*total;
    const damage=Math.max(0,Math.max(0,raw*t.weaknessMultiplier-t.resistance)-t.damageReduction);
    const ko=damage>=t.remainingHP,prizes=ko?t.prizesOnKO:0;
    const wins=ko&&(prizes>=prizesRemaining||t.opponentBoardCount===1);
    const score=[+wins,prizes,Math.min(damage,t.remainingHP),-s.path.length,total,s.h];
    const branch=s.sup==="acerola"?ids[s.b]:s.sup==="guzma"?"guzma:"+t.id:s.sup==="ranger"?"ranger":"no-acerola";
    const previous=best.get(branch);
    const better=!previous||score.some((x,j)=>x!==previous.score[j]&&
      score.slice(0,j).every((v,k)=>v===previous.score[k])&&x>previous.score[j]);
    if(better)best.set(branch,{score,branch,supporter:s.sup||null,attacker:ids[s.a],target:t.id,damage,prizes,wins,
      boardPsychic:total,handPsychic:s.h,actions:[...s.path,{kind:"attack",name:"Max Geist",source:ids[s.a],target:t.id}],
      unknownDrawsIgnored:s.draws});
  }
  while(head<queue.length){
    const s=queue[head++],own=living(s),bench=own.filter(i=>i!==s.a);
    record(s);
    if(s.h>0&&!s.m&&input.manualAttachmentAllowed){
      for(const i of own)push(s,{e:setEnergy(s,i,s.e[i]+1),h:s.h-1,m:true},
        {kind:"manual-attach",target:ids[i]});
    }
    if(s.h>0){
      for(const j of own){
        if(!board[j].doorAvailable||(s.d&bit(j)))continue;
        for(const i of bench){
          if(!board[i].psychic)continue;
          const count=Math.min(2,s.deck);
          // Unknown draws can consume every known copy up to draw count. Never let
          // them fund any later action; a later real observation can replan.
          push(s,{e:setEnergy(s,i,s.e[i]+1),h:s.h-1,d:s.d|bit(j),deck:s.deck-count,draws:s.draws+count,kp:Math.max(0,s.kp-count)},
            {kind:"underworld-door",source:ids[j],target:ids[i],drawIgnored:count});
        }
      }
    }
    if(!s.r&&board[s.a].canRetreat&&s.e[s.a]>=board[s.a].retreatCost){
      const cost=board[s.a].retreatCost;
      for(const i of bench)push(s,{a:i,r:true,e:setEnergy(s,s.a,s.e[s.a]-cost),dp:s.dp+cost},
        {kind:"retreat",source:ids[s.a],target:ids[i],discardPsychic:cost});
    }
    if(s.item){
      if(s.ns&&s.dp)push(s,{ns:s.ns-1,dp:s.dp-1,h:s.h+1},{kind:"night-stretcher",target:"Basic Psychic Energy"});
      if(s.fog&&s.kp&&s.deck)push(s,{fog:s.fog-1,kp:s.kp-1,deck:s.deck-1,h:s.h+1},
        {kind:"fog-crystal",target:"Basic Psychic Energy"});
      if(s.vs&&!s.sup&&input.supportAvailable){
        if(s.da&&!s.ha)push(s,{vs:s.vs-1,da:false,ha:true},{kind:"vs-seeker",target:"Acerola"});
        if(s.dg&&!s.hg)push(s,{vs:s.vs-1,dg:false,hg:true},{kind:"vs-seeker",target:"Guzma"});
        if(s.dr&&!s.hr)push(s,{vs:s.vs-1,dr:false,hr:true},{kind:"vs-seeker",target:"Pokémon Ranger"});
      }
    }
    if(!s.sup&&input.supportAvailable){
      if(s.ha&&own.length>1){
        for(const i of own){
          if(board[i].damage===0)continue;
          for(const promotion of i===s.a?bench:[s.a]){
            push(s,{live:s.live&~bit(i),a:promotion,sup:"acerola",b:i,ha:false,da:true,h:s.h+s.e[i],e:setEnergy(s,i,0)},
              {kind:"acerola",target:ids[i],promotion:i===s.a?ids[promotion]:null,returnedPsychic:s.e[i]});
          }
        }
      }
      if(s.hg&&targets.length>1){
        for(let j=0;j<targets.length;j++){
          if(j===s.o)continue;
          for(const i of bench.length?bench:(input.guzmaWithoutOwnBenchAllowed===true?[s.a]:[])){
            push(s,{a:i,o:j,sup:"guzma",hg:false,dg:true},
              {kind:"guzma",opponentTarget:targets[j].id,ownPromotion:i===s.a?null:ids[i]});
          }
        }
      }
      // Explicitly certified attack-only Item lock transition. Ranger cannot remove
      // a continuous Ability lock or create a second Supporter allowance.
      if(s.hr&&!s.item&&input.itemPlayAllowedAfterRanger===true)
        push(s,{sup:"ranger",hr:false,dr:true,item:true},{kind:"pokemon-ranger"});
    }
  }
  const plans=[...best.values()].map(({score,...x})=>x);
  const baseline=plans.find(x=>!x.supporter&&x.wins);
  const supportWin=plans.filter(x=>x.supporter&&x.wins).sort((a,b)=>a.actions.length-b.actions.length||
    b.boardPsychic-a.boardPsychic||a.branch.localeCompare(b.branch))[0];
  const winner=baseline||supportWin;
  return {advisory:true,states:seen.size,completeWithinModel:!capped,
    decision:winner?{kind:"immediate-win-certificate",firstAction:winner.actions[0],plan:winner}:null,plans,
    boundary:"Positive known-resource certificate only. No opponent turn, other Trainers/attacks, returned Pokémon/Tools replay, new draw identities, or dynamic lock/status/cost changes beyond certified Ranger Item unlock. Revalidate every actual native root/prompt and replan after draws. Absence of a certificate does not prove absence of a winning line."};
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

function trainerSelfTest(){
  const assert=(c,m)=>{if(!c)throw new Error(m)};
  const v=(id,energy,damage=0,doorAvailable=false)=>({id,energy,damage,psychic:true,vmax:true,doorAvailable,retreatCost:2,canRetreat:false,canAttack:true});
  const b=(id,energy=0,damage=0)=>({...v(id,energy,damage),vmax:false});
  const t=(id,hp,count=2)=>({id,remainingHP:hp,prizesOnKO:2,opponentBoardCount:count,weaknessMultiplier:1,resistance:0,damageReduction:0});
  const f=(board,hp,extra={})=>({stablePublicEffects:true,noUnmodeledTerminalEffects:true,board,active:0,
    handPsychic:0,deckCount:20,manualAvailable:true,retreatAvailable:true,supportAvailable:true,acerolaHeld:false,
    manualAttachmentAllowed:true,dimensionValley:false,prizesRemaining:2,target:t("active",hp),...extra});
  const checks=[];
  function check(name,input,expected,extra=()=>true){
    const r=acerolaMaxGeist(input);
    assert(r.completeWithinModel,name+": capped or unsupported");
    assert((r.decision?.plan.branch??null)===expected,name+": unexpected "+JSON.stringify(r));
    assert(extra(r),name+": route check");
    checks.push({name,states:r.states,branch:expected,actions:r.decision?.plan.actions??[]});
  }
  const gust=f([v("a",4,220),v("b",2),b("c")],320,{acerolaHeld:true,guzmaHeld:true,handPsychic:1,
    opponents:[t("active",320),t("Dedenne",160)]});
  check("Guzma wins on a weaker target instead of Acerola",gust,"guzma:Dedenne",
    r=>r.decision.plan.actions.some(x=>x.kind==="guzma")&&r.decision.plan.actions.every(x=>x.kind!=="acerola"));
  const vs={...gust,guzmaHeld:false,guzmaDiscard:true,vsSeekerCount:1,itemPlayAllowed:true};
  check("VS Seeker recovers final gust",vs,"guzma:Dedenne",
    r=>r.decision.plan.actions.some(x=>x.kind==="vs-seeker"&&x.target==="Guzma"));
  check("Item lock blocks the VS Seeker gust chain",{...vs,itemPlayAllowed:false},null);
  check("spent Supporter prevents all gust and bounce routes",{...vs,supportAvailable:false},null);
  const ranger=f([v("a",3),v("b",2)],190,{rangerHeld:true,fogCount:1,knownDeckPsychic:1,knownDeckPsychicCertified:true,
    itemPlayAllowed:false,itemPlayAllowedAfterRanger:true});
  check("Hood-only Ranger clears Budew, Fog finds sixth Psychic",ranger,"ranger",
    r=>r.decision.plan.actions.map(x=>x.kind).join(",")==="pokemon-ranger,fog-crystal,manual-attach,attack");
  check("Lockbridge without Ranger cannot use this Item-locked route",{...ranger,rangerHeld:false},null);
  check("Ranger in discard cannot be reached by VS Seeker during Item lock",{...ranger,rangerHeld:false,rangerDiscard:true,vsSeekerCount:1},null);
  check("Ranger does not cure continuous Ability Item lock",{...ranger,itemPlayAllowedAfterRanger:false},null);
  const night=f([{...b("a",2),canRetreat:true},v("b",4)],160,{nightStretcherCount:1,itemPlayAllowed:true});
  check("paid retreat followed by Night Stretcher funds exact KO",night,"no-acerola",
    r=>r.decision.plan.actions.map(x=>x.kind).join(",")==="retreat,night-stretcher,manual-attach,attack");
  check("remove Stretcher and the paid-retreat KO disappears",{...night,nightStretcherCount:0},null);
  const fogFirst=f([v("a",3),v("b",1,0,true)],190,{handPsychic:1,fogCount:1,knownDeckPsychic:1,
    knownDeckPsychicCertified:true,itemPlayAllowed:true});
  check("known Fog search precedes Door that can draw its only target",fogFirst,"no-acerola",
    r=>r.decision.plan.actions.findIndex(x=>x.kind==="fog-crystal")<r.decision.plan.actions.findIndex(x=>x.kind==="underworld-door"));
  assert(acerolaMaxGeist({...fogFirst,knownDeckPsychicCertified:false}).decision===null,"uncertified K1 must abstain");
  assert(acerolaMaxGeist({...fogFirst,knownDeckPsychic:11}).decision===null,"must conserve candidate Psychic copies");
  return checks;
}

module.exports={acerolaMaxGeist,selfTest,trainerSelfTest};
if(require.main===module)console.log(JSON.stringify({base:selfTest(),trainers:trainerSelfTest()},null,2));
