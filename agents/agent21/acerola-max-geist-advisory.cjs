"use strict";

// Agent21 advisory for approved common two-profile successor; detached verified actor resources only.
function acerolaMaxGeist(input, maxStates = 40000, firstActionAllowed = () => true, options = {}) {
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
  const printed=input.attackModel==='candidate-printed-v1';
  const kinds=['v','vmax','wob','clefairy','lele','trev','latias','dialga','mimikyu','girafarig','marshadow','radiant'];
  if(input.attackModel&&!printed)return fail('unknown candidate attack model');
  if(printed&&(!input.opponents||board.some(x=>!kinds.includes(x.kind)||x.vmax!==(x.kind==='vmax'))||
    targets.some(t=>!int(t.damage,0,1000)||!int(t.energyUnits,0,100)||
      !['ultraBeast','counterBlockedActive','counterBlockedBench'].every(k=>bool(t[k]))||
      !int(t.counterPrizesOnKO,0,6)||
      (t.damageReductionAllKindsCertified!==true&&
        board.some(x=>!int(t.damageReductionByKind?.[x.kind],0,1000))))))
    return fail('unverified candidate damage/counter envelope');
  const dynamic=input.dynamicEffects?.kind==='thorns-wobbuffet-v1';
  if(input.dynamicEffects&&!dynamic)return fail('unknown dynamic effect model');
  if(dynamic&&(!input.dynamicEffects.otherEffectsStable||input.dynamicEffects.toolsEffective!==true||
    board.some(x=>!['wobbuffet','latias','fairyZone','basic','ruleBox','future'].every(k=>bool(x[k]))||
      !['none','hood','float','other'].includes(x.tool)||
      (x.wobbuffet&&(!x.basic||x.ruleBox||!x.psychic))||
      ((x.latias||x.fairyZone)&&(!x.basic||!x.ruleBox||!x.psychic)))||
    targets.some(x=>!['thorns','dragon','hood'].every(k=>bool(x[k])))))
    return fail('unverified dynamic lock envelope');
  const hoodCount=input.hoodCount??0,floatCount=input.floatStoneCount??0,blowerCount=input.fieldBlowerCount??0;
  if(!int(hoodCount,0,2)||!int(floatCount,0,1)||!int(blowerCount,0,1)||
    ['toolPlayAllowed','valleyHeld','valleyPlayAllowed'].some(k=>input[k]!==undefined&&!bool(input[k]))||
    (!dynamic&&(hoodCount||floatCount||blowerCount||input.valleyHeld))||
    (dynamic&&(hoodCount+board.filter(x=>x.tool==='hood').length>2||floatCount+board.filter(x=>x.tool==='float').length>1)))
    return fail('unverified Tool/Stadium resources');
  const n=board.length,ids=board.map(x=>x.id),bit=i=>1<<i;
  const mask=(xs,p)=>xs.reduce((m,x,i)=>p(x)?m|bit(i):m,0);
  const initial={live:(1<<n)-1,a:active,o:startOpponent,e:board.map(x=>x.energy),
    h:input.handPsychic,m:!input.manualAvailable,r:!input.retreatAvailable,d:0,
    sup:"",b:-1,deck:input.deckCount,draws:0,dp,kp,vs,fog,ns,
    ha:input.acerolaHeld,hg:!!input.guzmaHeld,hr:!!input.rangerHeld,
    da:!!input.acerolaDiscard,dg:!!input.guzmaDiscard,dr:!!input.rangerDiscard,
    item:input.itemPlayAllowed===true,valley:input.dimensionValley,heldValley:!!input.valleyHeld,
    hood:mask(board,x=>x.tool==='hood'),flt:mask(board,x=>x.tool==='float'),otherTool:mask(board,x=>x.tool==='other'),
    oppHood:mask(targets,x=>x.hood),hc:hoodCount,fc:floatCount,bc:blowerCount,path:[]};
  const live=(s,i)=>Boolean(s.live&bit(i));
  const living=s=>board.map((_,i)=>i).filter(i=>live(s,i));
  const key=s=>[s.live,s.a,s.o,s.e.join(","),s.h,+s.m,+s.r,s.d,s.sup,s.b,s.deck,s.draws,
     s.dp,s.kp,s.vs,s.fog,s.ns,+s.ha,+s.hg,+s.hr,+s.da,+s.dg,+s.dr,+s.item,+s.valley,+s.heldValley,
     s.hood,s.flt,s.otherTool,s.oppHood,s.hc,s.fc,s.bc].join("|");
  const queue=[initial],seen=new Set([key(initial)]),best=new Map();
  let capped=false,head=0,stoppedEarly=false,foundWitness=false;
  function push(s,changes,action){
    if(!s.path.length&&!firstActionAllowed(action))return;
    const next={...s,...changes,path:[...s.path,action]},k=key(next);
    if(seen.has(k))return;
    if(seen.size>=maxStates){capped=true;return;}
    seen.add(k);queue.push(next);
  }
  function setEnergy(s,i,value){const e=s.e.slice();e[i]=value;return e;}
  const totalEnergy=s=>living(s).reduce((sum,i)=>sum+s.e[i],0);
  // Named dynamic model only: no other lock source or damage effect may change
  // across the planned transitions. Wobbuffet is Psychic and non-Rule Box;
  // it suppresses non-Psychic opposing Thorns unless the latter has live Hood.
  const thornsLive=s=>dynamic&&targets[s.o].thorns&&
    (!board[s.a].wobbuffet||!!(s.oppHood&bit(s.o)));
  const ownAbilityLive=(s,i)=>live(s,i)&&(!dynamic||!thornsLive(s)||!board[i].ruleBox||
    board[i].future||!!(s.hood&bit(i)));
  const retreatCost=s=>dynamic&&((s.flt&bit(s.a))||
    (board[s.a].basic&&living(s).some(i=>board[i].latias&&ownAbilityLive(s,i))))?0:board[s.a].retreatCost;
  const weakness=s=>dynamic&&targets[s.o].dragon&&!(s.oppHood&bit(s.o))&&
    living(s).some(i=>board[i].fairyZone&&ownAbilityLive(s,i))?2:targets[s.o].weaknessMultiplier;
  function record(s){
    const attacker=board[s.a];
    if(!attacker.canAttack)return;
    const total=totalEnergy(s),t=targets[s.o],energy=s.e[s.a],attackRows=[];
    const add=(name,p,c,raw,bypass=false)=>{
      const cost=p+Math.max(0,c-(s.valley&&attacker.psychic?1:0));
      if(energy<cost)return;
      const reduction=printed&&t.damageReductionAllKindsCertified!==true?
        t.damageReductionByKind[attacker.kind]:t.damageReduction;
      const damage=Math.max(0,Math.max(0,bypass?raw:raw*weakness(s)-t.resistance)-reduction);
      attackRows.push({name,indices:[s.o],damages:[damage],counters:false});
    };
    if(attacker.vmax)add('Max Geist',0,3,10+30*total);
    if(printed){
      switch(attacker.kind){
        case 'v':
          add('Shadow Mist',1,0,10);
          if(energy>=3-(s.valley?1:0)){
            const picks=targets.length===1?[[0]]:targets.flatMap((_,i)=>targets.slice(i+1).map((__,j)=>[i,i+j+1]));
            for(const is of picks)attackRows.push({name:'Astral Barrage',indices:is,counters:true,
              damages:is.map(i=>(i===s.o?targets[i].counterBlockedActive:targets[i].counterBlockedBench)?0:50)});
          }
          break;
        case 'wob':add('Psychic Assault',1,1,10+t.damage);break;
        case 'clefairy':add('Full Moon Rondo',1,1,20+20*(living(s).length-1+targets.length-1));break;
        case 'lele':add('Energy Drive',0,2,20*(energy+t.energyUnits),true);break;
        case 'trev':add('Night Watch',3,0,150);break;
        case 'latias':add('Eon Blade',2,1,200);break;
        case 'girafarig':add('Mind Shock',0,3,70,true);break;
        case 'marshadow':add('Red Knuckles',0,1,t.ultraBeast?70:10);break;
        // These candidate lists have only Basic Psychic. Dialga and Radiant
        // cannot pay printed colored costs. Copycat requires a distinct exact
        // prior attack and effect recipe, deliberately not guessed here.
      }
    }
    for(const row of attackRows){
      const knocked=row.indices.filter((i,j)=>row.damages[j]>=targets[i].remainingHP);
      const prizes=knocked.reduce((n,i)=>n+(row.counters?targets[i].counterPrizesOnKO:targets[i].prizesOnKO),0);
      const wins=knocked.length>0&&(prizes>=prizesRemaining||
        knocked.length===targets.length&&targets.length===t.opponentBoardCount);
      const cappedDamage=row.indices.reduce((n,i,j)=>n+Math.min(row.damages[j],targets[i].remainingHP),0);
      const damage=row.damages.reduce((n,x)=>n+x,0);
      const attack={kind:"attack",name:row.name,source:ids[s.a],target:t.id,
        ...(row.indices.length>1||row.counters?{targets:row.indices.map(i=>targets[i].id)}:{})};
      if(!s.path.length&&!firstActionAllowed(attack))continue;
      const score=[+wins,prizes,cappedDamage,-s.path.length,total,s.h];
      const branch=s.sup==="acerola"?ids[s.b]:s.sup==="guzma"?"guzma:"+t.id:s.sup==="ranger"?"ranger":"no-acerola";
      const previous=best.get(branch);
      const better=!previous||score.some((x,j)=>x!==previous.score[j]&&
        score.slice(0,j).every((v,k)=>v===previous.score[k])&&x>previous.score[j]);
      if(wins)foundWitness=true;
      if(better)best.set(branch,{score,branch,supporter:s.sup||null,attacker:ids[s.a],target:t.id,
        attackName:row.name,damage,prizes,wins,boardPsychic:total,handPsychic:s.h,
        ...(row.counters?{damageCounters:true,damageByTarget:row.indices.map((i,j)=>({target:targets[i].id,damage:row.damages[j]}))}:{}),
        actions:[...s.path,attack],unknownDrawsIgnored:s.draws});
    }
  }
  while(head<queue.length){
    const s=queue[head++],own=living(s),bench=own.filter(i=>i!==s.a);
    record(s);
    if(options.witnessOnly===true&&foundWitness){stoppedEarly=true;break;}
    if(s.h>0&&!s.m&&input.manualAttachmentAllowed){
      for(const i of own)push(s,{e:setEnergy(s,i,s.e[i]+1),h:s.h-1,m:true},
        {kind:"manual-attach",target:ids[i]});
    }
    if(s.h>0){
      for(const j of own){
        if(!board[j].doorAvailable||(s.d&bit(j))||!ownAbilityLive(s,j))continue;
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
    if(!s.r&&board[s.a].canRetreat&&s.e[s.a]>=retreatCost(s)){
      const cost=retreatCost(s);
      for(const i of bench)push(s,{a:i,r:true,e:setEnergy(s,s.a,s.e[s.a]-cost),dp:s.dp+cost},
        {kind:"retreat",source:ids[s.a],target:ids[i],discardPsychic:cost});
    }
    if(dynamic){
      if(input.toolPlayAllowed===true&&(s.hc||s.fc))for(const i of own){
        if((s.hood|s.flt|s.otherTool)&bit(i))continue;
        if(s.hc)push(s,{hc:s.hc-1,hood:s.hood|bit(i)},{kind:'attach-hood',target:ids[i]});
        if(s.fc)push(s,{fc:s.fc-1,flt:s.flt|bit(i)},{kind:'attach-float',target:ids[i]});
      }
      if(s.heldValley&&!s.valley&&input.valleyPlayAllowed===true)
        push(s,{heldValley:false,valley:true},{kind:'play-valley'});
      if(s.item&&s.bc){
        // A single opposing Hood or own occupied Tool is a sufficient modeled
        // Field Blower choice; the broader up-to-two effect is not assumed.
        for(let j=0;j<targets.length;j++)if(s.oppHood&bit(j))
          push(s,{bc:s.bc-1,oppHood:s.oppHood&~bit(j)},{kind:'field-blower',targetSeat:'opponent',target:targets[j].id,tool:'hood'});
        for(const i of own)if((s.hood|s.flt|s.otherTool)&bit(i))
          push(s,{bc:s.bc-1,hood:s.hood&~bit(i),flt:s.flt&~bit(i),otherTool:s.otherTool&~bit(i)},
            {kind:'field-blower',targetSeat:'actor',target:ids[i],tool:(s.hood&bit(i))?'hood':(s.flt&bit(i))?'float':'other'});
      }
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
            push(s,{live:s.live&~bit(i),a:promotion,sup:"acerola",b:i,ha:false,da:true,h:s.h+s.e[i],e:setEnergy(s,i,0),
                hood:s.hood&~bit(i),flt:s.flt&~bit(i),otherTool:s.otherTool&~bit(i),
                hc:s.hc+((s.hood&bit(i))?1:0),fc:s.fc+((s.flt&bit(i))?1:0)},
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
  return {advisory:true,states:seen.size,completeWithinModel:!capped&&!stoppedEarly,witnessSearchStopped:stoppedEarly,
    decision:winner?{kind:"immediate-win-certificate",firstAction:winner.actions[0],plan:winner}:null,plans,
    boundary:"Positive known-resource certificate only. No opponent turn, unmodeled Trainers/attacks, returned Pokémon/other Tools replay, new draw identities, or dynamic lock/status/cost changes outside the optional named Thorns/Wobbuffet/Hood/Skyliner/Fairy Zone/Valley model and certified Ranger Item unlock. Revalidate every actual native root/prompt and replan after draws. Absence of a certificate does not prove absence of a winning line."};
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


/**
 * Root bridge for the detached actor-only policy protocol.
 * The effect certifier remains responsible for ALL stable future permissions and
 * modifiers. This function binds its proposed geometry to today's actor view
 * and searches only through first actions that the engine offered.
 * Does not dispatch a command, carry a token to a later prompt, or resolve prompts.
 */
function selectCertificateRoot(request,input,binding,maxStates=40000){
  const reject=reason=>({advisory:true,decision:null,reason});
  try{
    const v=request?.observation,f=request?.actionFrontier;
    if(request?.schema!=="aichi-policy-request-v2"||
       request.observationSchema!=="aichi-actor-observation-v4-ability-lock-order"||
       request.prompt!=null||v?.decisionKind!=="owner-root"||
       request.seat!==v.actorSeat||v.actorSeat!==v.turnSeat||
       !Number.isSafeInteger(v.globalTurn)||v.globalTurn<=1||
       f?.schema!=="aichi-action-frontier-v1"||!Array.isArray(f.items))
      return reject("not a current actor root");
    const check=(c,m)=>{if(!c)throw Error(m)};
    check(input.stablePublicEffects===true&&input.noUnmodeledTerminalEffects===true,
      "unverified stable effect envelope");
    const own=v.ownPublic,opp=v.opponentPublic,res=v.ownTurnResources;
    const event=request.publicEventReceipt;
    check(event?.version==="agent8-public-event-receipt-v3-turn-stamped"&&
          event.turn===v.globalTurn&&event.actorSeat===v.actorSeat,"missing current event receipt");
    const slots=(side)=>[...(side.active?[{zone:"active",index:0,p:side.active}]:[]),
      ...side.bench.flatMap((p,index)=>p?[{zone:"bench",index,p}]:[])];
    const actualOwn=slots(own),actualOpp=slots(opp),map=new Map();
    const catalog=binding?.basicPsychicPrintings;
    check(Array.isArray(catalog)&&catalog.length&&catalog.every(x=>typeof x==="string"&&x.length),"missing exact Psychic printing whitelist");
    const isP=x=>catalog.includes(x);
    const trainers={"acerola":"Acerola","guzma":"Guzma","pokemon-ranger":"Pokémon Ranger",
      "vs-seeker":"VS Seeker","night-stretcher":"Night Stretcher","fog-crystal":"Fog Crystal",
      ...(input.dynamicEffects?{"attach-hood":"Stealthy Hood","attach-float":"Float Stone","field-blower":"Field Blower","play-valley":"Dimension Valley"}:{})};
    const printMap=binding.trainerPrintings;
    check(printMap&&Object.values(trainers).every(n=>Array.isArray(printMap[n])&&printMap[n].every(x=>typeof x==="string")),"missing exact trainer printing whitelist");
    const isT=(p,n)=>printMap[n].includes(p);
    const count=(xs,pred)=>xs.filter(pred).length;
    const hand=v.ownHand,discard=own.discard;
    check(Array.isArray(hand)&&Array.isArray(discard)&&hand.every(x=>typeof x==="string")&&discard.every(x=>typeof x==="string"),"invalid owner zones");
    check(input.handPsychic===count(hand,isP)&&(input.discardPsychic??0)===count(discard,isP),
      "Psychic hand/discard mismatch");
    for(const [prop,n] of [["acerolaHeld","Acerola"],["guzmaHeld","Guzma"],["rangerHeld","Pokémon Ranger"]]){
      check((input[prop]===true)===(count(hand,x=>isT(x,n))>0),"held Supporter mismatch "+n);
    }
    for(const [prop,n] of [["acerolaDiscard","Acerola"],["guzmaDiscard","Guzma"],["rangerDiscard","Pokémon Ranger"]]){
      check((input[prop]===true)===(count(discard,x=>isT(x,n))>0),"discard Supporter mismatch "+n);
    }
    for(const [prop,n] of [["vsSeekerCount","VS Seeker"],["nightStretcherCount","Night Stretcher"],["fogCount","Fog Crystal"]]){
      check((input[prop]??0)===count(hand,x=>isT(x,n)),"Item count mismatch "+n);
    }
    if(input.dynamicEffects){
      for(const [prop,n] of [["hoodCount","Stealthy Hood"],["floatStoneCount","Float Stone"],["fieldBlowerCount","Field Blower"]])
        check((input[prop]??0)===count(hand,x=>isT(x,n)),"dynamic Tool/Item count mismatch "+n);
      check(!!input.valleyHeld===(count(hand,x=>isT(x,"Dimension Valley"))>0),"held Valley mismatch");
      check(!input.toolPlayAllowed||!res.toolPlayLocked,"Tool play forbidden");
      check(!input.valleyPlayAllowed||(!res.stadiumPlayLocked&&res.stadiumPlayedTurn!==v.globalTurn),"Stadium unavailable");
    }
    check(input.deckCount===own.deckCount&&input.prizesRemaining===own.prizeCount,"owner deck/prize mismatch");
    check(Number.isSafeInteger(res.energyPlayedTurn)&&Number.isSafeInteger(res.retreatedTurn)&&Number.isSafeInteger(res.supporterPlayedTurn),
      "unknown turn counters");
    check(!input.manualAvailable||res.energyPlayedTurn!==v.globalTurn,"attachment already spent");
    check(!input.retreatAvailable||res.retreatedTurn!==v.globalTurn,"retreat already spent");
    check(!input.supportAvailable||(res.supporterPlayedTurn===0&&!res.supporterPlayLocked),"Supporter unavailable");
    check(!input.manualAttachmentAllowed||!res.energyPlayLocked,"attachment forbidden");
    check(!input.itemPlayAllowed||!res.itemPlayLocked,"Item lock active");
    const kp=input.knownDeckPsychic??0;
    if(kp){
      const k=v.ownerK1,rows=k?.knownPrintings;
      check(k?.exactMembershipKnown===true&&Array.isArray(rows)&&
        rows.every(x=>typeof x.printing==="string"&&Number.isSafeInteger(x.copies)&&x.copies>0)&&
        new Set(rows.map(x=>x.printing)).size===rows.length&&
        rows.reduce((a,x)=>a+x.copies,0)===own.deckCount&&
        rows.reduce((a,x)=>a+(isP(x.printing)?x.copies:0),0)>=kp,
        "certified K1 lower bound absent");
    }
    const targets=input.opponents??[{id:"active",...input.target}];
    function bind(rows,actual,owner,activeIndex){
      check(rows.length===actual.length,"incomplete board geometry");
      for(const row of rows){
        const loc=binding.slots?.[row.id];
        check(loc?.owner===owner&&["active","bench"].includes(loc.zone)&&Number.isSafeInteger(loc.index),"slot mapping absent");
        const a=actual.find(x=>x.zone===loc.zone&&x.index===loc.index);
        check(a?.p?.printing===loc.printing&&!a.p.concealed,"slot printing mismatch");
        const key=owner+":"+loc.zone+":"+loc.index;
        check(![...map.values()].some(x=>x.key===key)&&!map.has(row.id),"duplicate slot binding");
        map.set(row.id,{...loc,key,p:a.p});
        if(owner){
          check(Array.isArray(a.p.energies)&&a.p.energies.every(isP)&&row.energy===a.p.energies.length&&row.damage===a.p.damage,
            "own board energy/damage mismatch");
          check(row.vmax===a.p.printing.startsWith("Shadow Rider Calyrex VMAX "),"VMAX identity mismatch");
          if(input.attackModel){
            const candidateNames={v:'Shadow Rider Calyrex V ',vmax:'Shadow Rider Calyrex VMAX ',wob:'Wobbuffet ',
              clefairy:"Lillie's Clefairy ex ",lele:'Tapu Lele-GX ',trev:'Trevenant & Dusknoir-GX ',latias:'Latias ex ',
              dialga:'Dialga-GX ',mimikyu:'Mimikyu ',girafarig:'Girafarig ',marshadow:'Marshadow ',radiant:'Radiant Eternatus '};
            check(typeof candidateNames[row.kind]==='string'&&a.p.printing.startsWith(candidateNames[row.kind]),"candidate attack identity mismatch");
          }
          if(input.dynamicEffects){
            check(row.wobbuffet===a.p.printing.startsWith("Wobbuffet ")&&
              row.latias===a.p.printing.startsWith("Latias ex ")&&
              row.fairyZone===a.p.printing.startsWith("Lillie\'s Clefairy ex "),"dynamic own identity mismatch");
            const tool=a.p.tools??[];
            check(tool.length<=1&&row.tool===(tool.length?(isT(tool[0],"Stealthy Hood")?"hood":isT(tool[0],"Float Stone")?"float":"other"):"none"),"own Tool mismatch");
          }
          if(row.doorAvailable){
            const rec=loc.zone==="active"?event.ownerActive:event.ownerBench?.[loc.index];
            const use=rec?.knownAbilityUse?.filter(x=>x.name==="Underworld Door");
            check(rec?.printing===loc.printing&&use?.length===1&&use[0].usedThisTurn===false,
              "Door use not positively unused");
          }
        }else{
          check(row.remainingHP===a.p.hp-a.p.damage,"opponent HP mismatch");
          if(input.attackModel)check(row.damage===a.p.damage,"opponent damage-counter mismatch");
          if(input.dynamicEffects)check(row.thorns===a.p.printing.startsWith("Iron Thorns ex ")&&
            row.hood===(a.p.tools??[]).some(x=>isT(x,"Stealthy Hood")),"opponent lock/Tool mismatch");
        }
      }
      check(map.get(rows[activeIndex].id)?.zone==="active","wrong active binding");
    }
    bind(input.board,actualOwn,true,input.active);
    bind(targets,actualOpp,false,input.activeOpponent??0);
    check(new Set(f.items.map(x=>x.token)).size===f.items.length&&
      f.items.every(x=>typeof x.token==="string"&&x.token.length),"invalid root tokens");
    const slotMatch=(meta,kind,id)=>{
      const loc=map.get(id);
      return loc?.owner===true&&meta[kind+"Seat"]==="actor"&&meta[kind+"Zone"]===loc.zone&&
        (meta[kind+"Index"]??0)===loc.index;
    };
    function matches(a,item){
      const m=item.publicMetadata??{},p=item.actorPrinting;
      if(a.kind==="attack")return item.kind==="attack"&&item.attackName===a.name&&
        p===map.get(a.source)?.printing&&m.attackCostPayable===true&&
        m.attackSource?.sourceKind==="active-pokemon"&&m.attackSource.sourceCardFullName===p&&
        m.attackSource.attackName===a.name;
      if(a.kind==="retreat")return item.kind==="retreat"&&p===map.get(a.source)?.printing&&
        item.targetPrinting===map.get(a.target)?.printing&&slotMatch(m,"target",a.target);
      if(a.kind==="underworld-door")return item.kind==="use-ability"&&m.abilityName==="Underworld Door"&&
        p===map.get(a.source)?.printing&&slotMatch(m,"source",a.source);
      if(item.kind!=="play-card"||!Number.isSafeInteger(m.handIndex)||hand[m.handIndex]!==p)return false;
      if(a.kind==="manual-attach")return isP(p)&&m.cardType==="energy"&&slotMatch(m,"target",a.target)&&
        item.targetPrinting===map.get(a.target)?.printing;
      const n=trainers[a.kind];
      if(!n||!isT(p,n)||m.cardType!=="trainer")return false;
      if(a.kind==="attach-hood"||a.kind==="attach-float")return slotMatch(m,"target",a.target)&&item.targetPrinting===map.get(a.target)?.printing;
      return true;
    }
    const match=a=>{
      const found=f.items.filter(i=>matches(a,i));
      if(found.length===1)return found[0];
      if(found.length>1&&found.every(i=>i.kind==="play-card"&&i.actorPrinting===found[0].actorPrinting&&
        i.publicMetadata?.targetSeat===found[0].publicMetadata?.targetSeat&&
        i.publicMetadata?.targetZone===found[0].publicMetadata?.targetZone&&
        i.publicMetadata?.targetIndex===found[0].publicMetadata?.targetIndex))
        return found.sort((a,b)=>a.publicMetadata.handIndex-b.publicMetadata.handIndex)[0];
      return null;
    };
    const result=acerolaMaxGeist(input,maxStates,a=>!!match(a));
    if(!result.decision)return result;
    const root=match(result.decision.firstAction);
    if(!root)return reject("no legal root token");
    return {...result,root:{kind:root.kind,token:root.token},sourceTurn:v.globalTurn,
      continuation:"Intent only: validate the exact subsequent prompt and replan from fresh actor observations; never reuse this root token."};
  }catch(e){return reject(String(e.message??e));}
}
function frontierSelfTest(){
  const assert=(c,m)=>{if(!c)throw Error(m)};
  const energy="Psychic Energy SVE",vmax="Shadow Rider Calyrex VMAX CRE";
  const a=(id,e,d=0,door=false)=>({id,energy:e,damage:d,psychic:true,vmax:true,doorAvailable:door,retreatCost:2,canRetreat:false,canAttack:true});
  const t=(id,hp)=>({id,remainingHP:hp,prizesOnKO:2,opponentBoardCount:2,weaknessMultiplier:1,resistance:0,damageReduction:0});
  const input={stablePublicEffects:true,noUnmodeledTerminalEffects:true,board:[a("a",3),a("b",2,0,true)],active:0,
    handPsychic:1,deckCount:20,manualAvailable:true,retreatAvailable:true,supportAvailable:true,acerolaHeld:false,
    manualAttachmentAllowed:true,dimensionValley:false,prizesRemaining:2,opponents:[t("oa",190),t("ob",230)]};
  const poke=(printing,hp,e=0,damage=0)=>({printing,hp,damage,energies:Array(e).fill(energy)});
  const p=poke(vmax,320,3),q=poke(vmax,320,2),op=poke("Dedenne-GX UNB",190),oq=poke("Iron Thorns ex TWM",230);
  const req={schema:"aichi-policy-request-v2",observationSchema:"aichi-actor-observation-v4-ability-lock-order",seat:0,prompt:null,
    observation:{decisionKind:"owner-root",actorSeat:0,turnSeat:0,globalTurn:5,ownHand:[energy],
      ownPublic:{active:p,bench:[null,q],discard:[],deckCount:20,prizeCount:2},
      opponentPublic:{active:op,bench:[oq]},ownTurnResources:{energyPlayedTurn:3,retreatedTurn:3,supporterPlayedTurn:0}},
    publicEventReceipt:{version:"agent8-public-event-receipt-v3-turn-stamped",turn:5,actorSeat:0,ownerActive:{printing:vmax,knownAbilityUse:[]},
      ownerBench:[null,{printing:vmax,knownAbilityUse:[{name:"Underworld Door",usedThisTurn:false}]}]},
    actionFrontier:{schema:"aichi-action-frontier-v1",items:[]}};
  const binding={basicPsychicPrintings:[energy],trainerPrintings:{"Acerola":["Acerola BUS"],"Guzma":["Guzma BUS"],
    "Pokémon Ranger":["Pokémon Ranger STS"],"VS Seeker":["VS Seeker PHF"],"Night Stretcher":["Night Stretcher SFA"],"Fog Crystal":["Fog Crystal CRE"]},
    slots:{a:{owner:true,zone:"active",index:0,printing:vmax},b:{owner:true,zone:"bench",index:1,printing:vmax},
      oa:{owner:false,zone:"active",index:0,printing:op.printing},ob:{owner:false,zone:"bench",index:0,printing:oq.printing}}};
  const rootDoor={kind:"use-ability",token:"door-b",actorPrinting:vmax,publicMetadata:{abilityName:"Underworld Door",sourceSeat:"actor",sourceZone:"bench",sourceIndex:1}};
  const rootAttach={kind:"play-card",token:"attach-a",actorPrinting:energy,targetPrinting:vmax,publicMetadata:{cardType:"energy",handIndex:0,targetSeat:"actor",targetZone:"active",targetIndex:0}};
  const R=(items,changes={})=>({...req,...changes,actionFrontier:{...req.actionFrontier,items}});
  const checks=[];
  function check(name,r,expected){
    assert((r.root?.token??null)===expected,name+": "+JSON.stringify(r));
    checks.push({name,token:expected,reason:r.reason??null});
  }
  check("native Door offered, attach absent: use alternate winning first step",selectCertificateRoot(R([rootDoor]),input,binding),"door-b");
  check("native attach offered",selectCertificateRoot(R([rootAttach]),input,binding),"attach-a");
  check("no legal root action: abstain",selectCertificateRoot(R([]),input,binding),null);
  check("wrong Door bench slot",selectCertificateRoot(R([{...rootDoor,publicMetadata:{...rootDoor.publicMetadata,sourceIndex:0}}]),input,binding),null);
  check("wrong hand index",selectCertificateRoot(R([{...rootAttach,publicMetadata:{...rootAttach.publicMetadata,handIndex:1}}]),input,binding),null);
  check("foreign actor request",selectCertificateRoot(R([rootDoor],{seat:1}),input,binding),null);
  check("stale event receipt",selectCertificateRoot(R([rootDoor],{publicEventReceipt:{...req.publicEventReceipt,turn:3}}),input,binding),null);
  check("spent Door is not positive evidence",selectCertificateRoot(R([rootDoor],{publicEventReceipt:{...req.publicEventReceipt,
    ownerBench:[null,{printing:vmax,knownAbilityUse:[{name:"Underworld Door",usedThisTurn:true}]}]}}),input,binding),null);
  check("invented hand resource",selectCertificateRoot(R([rootDoor]),{...input,handPsychic:2},binding),null);
  check("changed prize count",selectCertificateRoot(R([rootDoor]),{...input,prizesRemaining:1},binding),null);
  check("empty prompt not owner root",selectCertificateRoot(R([rootDoor],{prompt:{kind:"choose"}}),input,binding),null);
  const directInput={...input,handPsychic:0,board:[a("a",4),a("b",2)],manualAvailable:false};
  const directReq={...req,observation:{...req.observation,ownHand:[],ownPublic:{...req.observation.ownPublic,active:poke(vmax,320,4)}}};
  const attack={kind:"attack",token:"attack-now",actorPrinting:vmax,attackName:"Max Geist",
    publicMetadata:{attackCostPayable:true,attackSource:{sourceKind:"active-pokemon",sourceCardFullName:vmax,attackName:"Max Geist"}}};
  check("exact native attack token",selectCertificateRoot({...directReq,actionFrontier:{...req.actionFrontier,items:[attack]}},directInput,binding),"attack-now");
  check("bench-copy attack must not bind",selectCertificateRoot({...directReq,actionFrontier:{...req.actionFrontier,items:[{...attack,
    publicMetadata:{...attack.publicMetadata,attackSource:{...attack.publicMetadata.attackSource,sourceKind:"bench-pokemon"}}}]}},directInput,binding),null);
  return checks;
}


function dynamicSelfTest(){
  const assert=(c,m)=>{if(!c)throw Error(m)};
  const v=(id,e,door=true,extra={})=>({id,energy:e,damage:0,psychic:true,vmax:true,doorAvailable:door,retreatCost:2,canRetreat:true,canAttack:true,
    wobbuffet:false,latias:false,fairyZone:false,basic:false,ruleBox:true,future:false,tool:"none",...extra});
  const w=(id,extra={})=>v(id,0,false,{vmax:false,basic:true,ruleBox:false,wobbuffet:true,...extra});
  const l=(id,extra={})=>v(id,0,false,{vmax:false,basic:true,latias:true,...extra});
  const c=(id,extra={})=>v(id,0,false,{vmax:false,basic:true,fairyZone:true,retreatCost:1,...extra});
  const th=(id,hood=false)=>({id,remainingHP:230,prizesOnKO:2,opponentBoardCount:2,weaknessMultiplier:1,
    resistance:0,damageReduction:0,thorns:true,dragon:false,hood});
  const f=(board,extra={})=>({stablePublicEffects:true,noUnmodeledTerminalEffects:true,
    dynamicEffects:{kind:"thorns-wobbuffet-v1",toolsEffective:true,otherEffectsStable:true},board,active:0,handPsychic:2,deckCount:20,
    manualAvailable:true,retreatAvailable:true,supportAvailable:true,acerolaHeld:false,guzmaHeld:true,manualAttachmentAllowed:true,
    dimensionValley:false,itemPlayAllowed:true,toolPlayAllowed:true,prizesRemaining:2,opponents:[th("oa"),th("ob")],...extra});
  const checks=[];
  function check(name,input,expected,extra=()=>true){
    const r=acerolaMaxGeist(input);
    assert((r.decision?.plan.branch??null)===expected&&extra(r),name+": "+JSON.stringify(r));
    checks.push({name,branch:expected,damage:r.decision?.plan.damage??null,actions:r.decision?.plan.actions??[]});
  }
  const lock=f([v("a",3),v("b",3),w("w",{tool:"float"})]);
  check("Lockbridge Wob pivot turns on both Doors through Thorns",lock,"guzma:ob",
    r=>r.decision.plan.actions.some(x=>x.kind==="guzma"&&x.ownPromotion==="w")&&
      r.decision.plan.actions.filter(x=>x.kind==="underworld-door").length>=1&&
      r.decision.plan.actions.some(x=>x.kind==="retreat"&&x.source==="w"&&x.discardPsychic===0)&&
      r.decision.plan.damage===250);
  check("no Wob pivot without Float or live Skyliner",f([v("a",3),v("b",3),w("w")]),null);
  check("Skyliner reactivates when Wob suppresses Thorns",f([v("a",3),v("b",3),w("w"),l("l")]),"guzma:ob",
    r=>r.decision.plan.actions.some(x=>x.kind==="retreat"&&x.source==="w"&&x.discardPsychic===0));
  check("protected opposing Thorns cannot be switched off by Wob",f(lock.board,{opponents:[th("oa",true),th("ob",true)]}),null);
  check("Field Blower removes opposing target Hood before Door",f(lock.board,{opponents:[th("oa",true),th("ob",true)],fieldBlowerCount:1}),"guzma:ob",
    r=>r.decision.plan.actions.some(x=>x.kind==="field-blower"&&x.target==="ob"));
  check("Item lock removes protected-Thorns Blower route",f(lock.board,{opponents:[th("oa",true),th("ob",true)],fieldBlowerCount:1,itemPlayAllowed:false}),null);
  check("held Hood unlocks one Door and a manual P without Wob",f([v("a",3),v("b",3)],{hoodCount:1,guzmaHeld:false}),"no-acerola",
    r=>r.decision.plan.actions.some(x=>x.kind==="attach-hood")&&r.decision.plan.damage===250);
  check("Tool play lock removes held-Hood route",f([v("a",3),v("b",3)],{hoodCount:1,guzmaHeld:false,toolPlayAllowed:false}),null);
  const dr={...th("oa"),thorns:false,dragon:true,remainingHP:280}, drb={...th("ob"),thorns:false,dragon:true};
  check("Fairy Zone live gives Dragon weakness",f([v("a",3),v("b",2),c("c",{damage:90})],{handPsychic:0,guzmaHeld:false,acerolaHeld:true,opponents:[dr,drb]}),"no-acerola",
    r=>r.decision.plan.damage===320&&r.plans.find(x=>x.branch==="c")?.wins===false);
  check("opponent Hood prevents Fairy Zone",f([v("a",3),v("b",2),c("c")],{handPsychic:0,guzmaHeld:false,opponents:[{...dr,hood:true},drb]}),null);
  check("held Valley makes two-energy VMAX attack payable",f([v("a",2,false),v("b",3,false,{canAttack:false})],{handPsychic:0,guzmaHeld:false,
    valleyHeld:true,valleyPlayAllowed:true,opponents:[{...dr,dragon:false,remainingHP:160},drb]}),"no-acerola",
    r=>r.decision.plan.actions[0].kind==="play-valley");
  return checks;
}


function attackSelfTest(){
  const assert=(c,m)=>{if(!c)throw Error(m)};
  const b=(id,kind,e,extra={})=>({id,kind,energy:e,damage:0,psychic:!['dialga','radiant'].includes(kind),
    vmax:kind==='vmax',doorAvailable:false,retreatCost:2,canAttack:true,canRetreat:false,...extra});
  const t=(id,hp,extra={})=>({id,remainingHP:hp,prizesOnKO:1,opponentBoardCount:1,weaknessMultiplier:1,resistance:0,
    damageReduction:0,damage:0,energyUnits:0,ultraBeast:false,counterBlockedActive:false,counterBlockedBench:false,
    counterPrizesOnKO:1,damageReductionAllKindsCertified:true,...extra});
  const f=(board,targets,extra={})=>({stablePublicEffects:true,noUnmodeledTerminalEffects:true,attackModel:'candidate-printed-v1',
    board,active:0,handPsychic:0,deckCount:20,manualAvailable:true,retreatAvailable:true,supportAvailable:true,
    acerolaHeld:false,manualAttachmentAllowed:true,dimensionValley:false,prizesRemaining:1,
    opponents:targets.map(x=>({...x,opponentBoardCount:targets.length})),...extra});
  const checks=[];
  function check(name,input,attack,extra=()=>true){
    const r=acerolaMaxGeist(input);
    assert((r.decision?.plan.attackName??null)===attack&&extra(r),name+": "+JSON.stringify(r));
    checks.push({name,attack,damage:r.decision?.plan.damage??null,prizes:r.decision?.plan.prizes??null,actions:r.decision?.plan.actions??[]});
  }
  check("Latias Eon Blade attack-through",f([b("l","latias",2)],[t("a",200)],{dimensionValley:true}),"Eon Blade");
  check("Latias with 2P and no Valley cannot pay Eon Blade",f([b("l","latias",2)],[t("a",200)]),null);
  check("Night Watch has no Valley discount",f([b("t","trev",2)],[t("a",150)],{dimensionValley:true}),null);
  check("Night Watch 3P terminal",f([b("t","trev",3)],[t("a",150)]),"Night Watch");
  const clefBoard=[b("c","clefairy",1),b("a","vmax",0),b("b","vmax",0),b("d","v",0)];
  check("Clefairy six combined Bench Rondo for 140",f(clefBoard,[t("a",140),t("b",200),t("c",200),t("d",200)],{dimensionValley:true}),
    "Full Moon Rondo",r=>r.decision.plan.damage===140);
  const atr=f([b("v","v",2)],[t("a",230),t("b",50,{damage:10}),t("c",50,{damage:20})],
    {dimensionValley:true,prizesRemaining:2});
  check("Astral Barrage final two Prizes on Benched targets",atr,"Astral Barrage",
    r=>r.decision.plan.prizes===2&&r.decision.plan.actions.at(-1).targets.join(",")==="b,c");
  check("Mist-protected Benched target blocks double Astral win",{...atr,opponents:atr.opponents.map(x=>x.id==="c"?{...x,counterBlockedBench:true}:x)},null);
  check("Counter KO uses counter-specific Prize geometry",{...atr,opponents:atr.opponents.map(x=>x.id==="c"?{...x,counterPrizesOnKO:0}:x)},null);
  check("Astral Barrage one remaining Pokémon board-out",f([b("v","v",2)],[t("a",50)],{dimensionValley:true,prizesRemaining:6}),"Astral Barrage");
  check("Psychic Assault uses existing damage",f([b("w","wob",1)],[t("a",70,{damage:80})],{dimensionValley:true}),"Psychic Assault",r=>r.decision.plan.damage===90);
  check("Lele Energy Drive ignores W/R",f([b("l","lele",2)],[t("a",160,{energyUnits:6,weaknessMultiplier:2,resistance:30})]),"Energy Drive",r=>r.decision.plan.damage===160);
  check("Marshadow free Red Knuckles under Valley against Ultra Beast",f([b("m","marshadow",0)],[t("a",70,{ultraBeast:true})],{dimensionValley:true}),"Red Knuckles");
  check("Mind Shock ignores W/R",f([b("g","girafarig",2)],[t("a",70,{weaknessMultiplier:2,resistance:30})],{dimensionValley:true}),"Mind Shock",r=>r.decision.plan.damage===70);
  check("Dialga cannot pay Metal costs with Psychic",f([b("d","dialga",5)],[t("a",50)]),null);
  check("Radiant Eternatus cannot pay Fire/Dark with Psychic",f([b("r","radiant",5)],[t("a",50)]),null);
  const immune=f([b("a","vmax",4),b("w","wob",2)],[t("a",70,{damage:80,damageReductionAllKindsCertified:false,
    damageReductionByKind:{vmax:1000,wob:0}})],{retreatAvailable:true});
  immune.board[0].canRetreat=true;
  check("Pay retreat into non-Rule Box attacker when VMAX damage prevented",immune,"Psychic Assault",r=>r.decision.plan.actions[0].kind==="retreat");
  return checks;
}

module.exports={acerolaMaxGeist,selfTest,trainerSelfTest,selectCertificateRoot,frontierSelfTest,dynamicSelfTest,attackSelfTest};
if(require.main===module)console.log(JSON.stringify({base:selfTest(),trainers:trainerSelfTest(),frontier:frontierSelfTest(),dynamic:dynamicSelfTest(),attacks:attackSelfTest()},null,2));
