"use strict";

// Known-resource positive terminal witness using the existing board-action BFS.
// This expands Pokémon development transitions rather than reimplementing attack
// damage, Trainer effects or lock mechanics. Draws are ignored conservatively.
function developmentTerminal(terminal,input,development,options={}){
  const reject=reason=>({advisory:true,decision:null,reason});
  try{
    const check=(x,m)=>{if(!x)throw Error(m)};
    const int=(x,a,b)=>Number.isSafeInteger(x)&&x>=a&&x<=b;
    check(input?.stablePublicEffects===true&&input.noUnmodeledTerminalEffects===true&&
      input.attackModel==="candidate-printed-v1"&&input.dynamicEffects?.kind==="thorns-wobbuffet-v1",
      "named certified attack/effect envelope required");
    check(development?.permissionsCertified===true&&development.noBenchCapacityChange===true&&
      int(development.maxBench,1,8)&&input.board.length<=development.maxBench+1,
      "unverified development or Bench capacity");
    const cat=development.catalog;
    check(cat&&Object.keys(cat).length&&Object.entries(cat).every(([p,c])=>
      typeof p==="string"&&c.printing===p&&c.entryCertified===true&&typeof c.kind==="string"&&
      typeof c.basic==="boolean"&&typeof c.psychic==="boolean"&&typeof c.dragon==="boolean"&&
      typeof c.ruleBox==="boolean"&&typeof c.future==="boolean"&&
      typeof c.canAttack==="boolean"&&typeof c.canRetreat==="boolean"&&int(c.retreatCost,0,11)&&
      typeof c.onPlayChoiceRequired==="boolean"&&int(c.copyLimit,1,4)),"invalid development catalog");
    const inventories=["handPokemon","knownDeckPokemon","discardPokemon"];
    for(const k of inventories){
      const h=development[k]??{};
      check(Object.entries(h).every(([p,n])=>cat[p]&&int(n,0,cat[p].copyLimit)),"invalid "+k);
    }
    check(development.knownDeckPokemonCertified===true||
      !Object.values(development.knownDeckPokemon??{}).some(Boolean),"unknown deck Pokémon");
    check(Object.entries(development.knownDeckPokemon??{}).reduce((a,[_,n])=>a+n,0)<=input.deckCount,"deck lower bounds exceed size");
    for(const [p,c] of Object.entries(cat)){
      const stacks=input.board.reduce((n,b)=>n+(b.stackPrintings??[]).filter(x=>x===p).length,0);
      check(stacks+inventories.reduce((n,k)=>n+(development[k]?.[p]??0),0)<=c.copyLimit,"copy conservation "+p);
    }
    check(input.board.every(b=>typeof b.printing==="string"&&cat[b.printing]?.kind===b.kind&&
      Array.isArray(b.stackPrintings)&&b.stackPrintings.length===b.stackCount&&
      typeof b.evolutionEligible==="boolean"),"board development identity incomplete");
    check(["pokemonPlayAllowed","abilityPokemonPlayAllowed","evolutionAllowed"].every(k=>typeof development[k]==="boolean"),"permissions unknown");
    check(int(development.treasureCount??0,0,4)&&int(development.quickCount??0,0,1)&&
      Array.isArray(development.fodder??[])&&(development.fodder??[]).every(p=>typeof p==="string"&&
        !cat[p]&&development.fodderCertified===true&&development.fodderDisjointFromModeledResources===true),"unverified exact discard fodder");
    // Extra tutor roles are disjoint from Pokémon inventory and the core's
    // exact held-resource counters. Each role binds to one fixed printing.
    const tutor=development.tutors??null;
    const coreRoles={P:"handPsychic",fog:"fogCount",stretcher:"nightStretcherCount",vs:"vsSeekerCount",
      acerola:"acerolaHeld",guzma:"guzmaHeld",ranger:"rangerHeld",hood:"hoodCount",float:"floatStoneCount",
      blower:"fieldBlowerCount",valley:"valleyHeld"};
    const extras=["arven","raihan","teammates","forest"];
    const allRoles=[...Object.keys(coreRoles),"treasure","quick",...extras];
    const boolRoles=new Set(["acerola","guzma","ranger","valley"]);
    const rolePrints=tutor?.rolePrintings??{};
    if(tutor){
      check(tutor.certified===true&&tutor.knownDeckRolesCertified===true&&typeof tutor.priorKO==="boolean"&&
        typeof tutor.starAlchemyAllowed==="boolean"&&typeof tutor.vstarAvailable==="boolean"&&
        Object.entries(rolePrints).every(([k,p])=>allRoles.includes(k)&&typeof p==="string"&&!cat[p])&&
        new Set(Object.values(rolePrints)).size===Object.keys(rolePrints).length,"unverified exact tutor role map");
      for(const key of ["knownDeckRoles","heldExtra","discardExtra"]){
        check(Object.entries(tutor[key]??{}).every(([k,n])=>rolePrints[k]&&int(n,0,k==="P"?11:k==="arven"?2:k==="fog"||k==="treasure"?4:k==="vs"||k==="hood"?2:1)&&
          (key==="knownDeckRoles"?k!=="P":extras.includes(k))),"invalid "+key);
      }
      check((input.knownDeckPsychic??0)+Object.values(development.knownDeckPokemon??{}).reduce((n,x)=>n+x,0)+
        Object.values(tutor.knownDeckRoles??{}).reduce((n,x)=>n+x,0)<=input.deckCount,"tutor deck bounds exceed size");
      check(input.board.every(b=>b.tool!=="other"||typeof b.toolPrinting==="string"),"other Tool identity required for tutor model");
    }
    const firstAllowed=options.firstActionAllowed??(()=>true);
    const maxNodes=options.maxDevelopmentNodes??250,maxStates=options.maxStatesPerNode??6000,maxDepth=options.maxDevelopmentDepth??4;
    check(int(maxNodes,1,10000)&&int(maxStates,1,1000000)&&int(maxDepth,0,12),"invalid development budget");
    const alter=(inv,p,d)=>({...inv,[p]:(inv[p]??0)+d});
    const norm=x=>Object.fromEntries(Object.entries(x).filter(([,v])=>v).sort((a,b)=>a[0].localeCompare(b[0])));
    const start={input,hand:development.handPokemon??{},known:development.knownDeckPokemon??{},discard:development.discardPokemon??{},
      treasure:development.treasureCount??0,quick:development.quickCount??0,fodder:development.fodder??[],path:[],depth:0,serial:0,otherReturned:0,
      knownRoles:tutor?.knownDeckRoles??{},extra:tutor?.heldExtra??{},extraDiscard:tutor?.discardExtra??{},starUsed:tutor?!tutor.vstarAvailable:true};
    const stats={nodes:0,boardStates:0,expanded:0,duplicate:0,capped:false,ignoredDraws:0};
    const queue=[start],seen=new Set();
    const key=z=>JSON.stringify([z.input,norm(z.hand),norm(z.known),norm(z.discard),z.treasure,z.quick,[...z.fodder].sort(),z.depth,norm(z.knownRoles),norm(z.extra),norm(z.extraDiscard),z.starUsed]);
    seen.add(key(start));
    let head=0;
    const callbackState=z=>({input:z.input,path:z.path,developmentState:{hand:z.hand,known:z.known,discard:z.discard,treasure:z.treasure,quick:z.quick,fodder:z.fodder,otherReturned:z.otherReturned,knownRoles:z.knownRoles,extra:z.extra,extraDiscard:z.extraDiscard,starUsed:z.starUsed}});
    function push(z,action,next){
      if(!z.path.length&&!firstAllowed(action))return;
      const n={...z,...next,path:[...z.path,action],depth:z.depth+1},k=key(n);
      if(seen.has(k)){stats.duplicate++;return}
      if(queue.length>=maxNodes){stats.capped=true;return}
      seen.add(k);queue.push(n);stats.expanded++;
    }
    // Apply the core's deterministic prefix snapshot. Unseen draw identities
    // cannot supply any new resource, and may reduce every deck lower bound.
    function afterCore(z,snapshot,path){
      const draws=path.reduce((n,a)=>n+(a.drawIgnored??0),0);
      const known=Object.fromEntries(Object.entries(z.known).map(([p,n])=>[p,Math.max(0,n-draws)]));
      const knownRoles=Object.fromEntries(Object.entries(z.knownRoles).map(([p,n])=>[p,Math.max(0,n-draws)]));
      let hand={...z.hand},otherReturned=z.otherReturned,extra={...z.extra};
      // Acerola returns the whole visible Pokémon stack. Keep only explicitly
      // known stack identities, excluding any unmodeled other cards.
      for(const a of path)if(a.kind==="acerola"){
        const old=z.input.board.find(b=>b.id===a.target);
        for(const p of old?.stackPrintings??[])if(cat[p])hand=alter(hand,p,1);else otherReturned++;
        if(old?.tool==="other"&&!path.slice(0,path.indexOf(a)).some(q=>q.kind==="field-blower"&&q.targetSeat==="actor"&&q.target===a.target)){
          if(tutor&&old.toolPrinting===rolePrints.forest)extra=alter(extra,"forest",1);else otherReturned++;
        }
      }
      // Core snapshot preserves actual identities of remaining Pokémon.
      return {...z,input:snapshot,known,knownRoles,hand,extra,otherReturned,path:[...z.path,...path]};
    }
    function tutorTargets(z,filter=()=>true){
      const targets=[];
      for(const [p,n] of Object.entries(z.known))if(n>0)targets.push({printing:p,kind:"pokemon",copies:n});
      if(z.input.knownDeckPsychic>0&&rolePrints.P)targets.push({printing:rolePrints.P,kind:"energy",role:"P",copies:z.input.knownDeckPsychic});
      for(const [role,n] of Object.entries(z.knownRoles))if(n>0){
        const kind=["fog","stretcher","vs","blower","treasure","quick"].includes(role)?"item":
          ["hood","float","forest"].includes(role)?"tool":role==="valley"?"stadium":"supporter";
        targets.push({printing:rolePrints[role],kind,role,copies:n});
      }
      return targets.filter(filter);
    }
    // Allocate exact physical copies jointly, so one tutor cannot supply the
    // same singleton to two independent channels.
    function retrieve(z,targets){
      let x={...z.input},hand={...z.hand},known={...z.known},knownRoles={...z.knownRoles},
        extra={...z.extra},treasure=z.treasure,quick=z.quick;
      for(const target of targets){
        if(x.deckCount<=0)return null;
        if(target.kind==="pokemon"){
          if(!(known[target.printing]>0))return null;
          known=alter(known,target.printing,-1);hand=alter(hand,target.printing,1);
        }else if(target.role==="P"){
          if(!(x.knownDeckPsychic>0))return null;
          x.knownDeckPsychic--;x.handPsychic++;
        }else{
          const k=target.role;
          if(!(knownRoles[k]>0))return null;
          knownRoles=alter(knownRoles,k,-1);
          if(coreRoles[k]){
            if(boolRoles.has(k)&&x[coreRoles[k]])return null;
            x[coreRoles[k]]=boolRoles.has(k)?true:(x[coreRoles[k]]??0)+1;
          }else if(k==="treasure")treasure++;
          else if(k==="quick")quick++;
          else extra=alter(extra,k,1);
        }
        x.deckCount--;
        x.knownDeckPsychic=Math.min(x.knownDeckPsychic??0,x.deckCount);
      }
      return {input:x,hand,known,knownRoles,extra,treasure,quick};
    }
    function tutorDevelop(z){
      if(!tutor)return;
      const x=z.input;
      const targets=tutorTargets(z);
      const source=(role)=>rolePrints[role];
      const play=(role,targets,changes={},actionFields={})=>{
        const take=retrieve(z,targets);if(!take)return;
        if(!(take.extra[role]>0))return;
        const action={kind:role,printing:source(role),targets:targets.map(t=>t.printing),...actionFields};
        push(z,action,{...take,...changes,input:{...take.input,...(changes.input??{}),supportAvailable:false},
          extra:alter(take.extra,role,-1),extraDiscard:alter(z.extraDiscard,role,1)});
      };
      if(x.supportAvailable&&x.itemPlayAllowed&&x.vsSeekerCount>0)for(const role of ["arven","raihan","teammates"]){
        if(!(z.extraDiscard[role]>0)||z.extra[role]>0)continue;
        push(z,{kind:"vs-seeker",targetPrinting:source(role),target:role},
          {input:{...x,vsSeekerCount:x.vsSeekerCount-1},extra:alter(z.extra,role,1),extraDiscard:alter(z.extraDiscard,role,-1)});
      }
      if(x.supportAvailable&&z.extra.arven>0){
        const items=targets.filter(t=>t.kind==="item"),tools=targets.filter(t=>t.kind==="tool");
        for(const item of items)play("arven",[item]);
        for(const tool of tools)play("arven",[tool]);
        for(const item of items)for(const tool of tools)play("arven",[item,tool]);
      }
      if(x.supportAvailable&&tutor.priorKO&&z.extra.teammates>0){
        for(const t of targets)play("teammates",[t]);
        for(let i=0;i<targets.length;i++)for(let j=i;j<targets.length;j++){
          if(i===j&&targets[i].copies<2)continue;
          play("teammates",[targets[i],targets[j]]);
        }
      }
      if(x.supportAvailable&&tutor.priorKO&&z.extra.raihan>0&&(x.discardPsychic??0)>0){
        // Attach first, then one exact unrestricted tutor. With an empty deck
        // the attachment itself can be the useful part of the effect.
        const choices=x.deckCount===0?[[]]:targets.map(t=>[t]);
        // A mandatory unrestricted search does not make the attachment
        // unavailable when K0 lacks target identities, or when K1 has no
        // modeled target. Take one actual card in the owner prompt, ignore
        // its identity/value in this deterministic proof, and replan.
        // Never expose this abstract search to a stochastic deck ledger.
        const unknownSearch=x.deckCount>0&&targets.length===0&&
          options.stopBeforeChance!==true&&typeof options.onReachableState!=="function"&&typeof options.onChance!=="function";
        if(unknownSearch)choices.push([]);
        for(const [i,b] of x.board.entries())for(const ts of choices){
          const take=retrieve(z,ts);if(!take)continue;
          if(unknownSearch&&ts.length===0)take.input={...take.input,deckCount:take.input.deckCount-1,
            knownDeckPsychic:0};
          const action={kind:"raihan",printing:source("raihan"),targets:ts.map(t=>t.printing),
            attachTarget:b.id,...(unknownSearch&&ts.length===0?{unknownSearch:true}:{})};
          push(z,action,{...take,input:{...take.input,supportAvailable:false,discardPsychic:x.discardPsychic-1,
            board:x.board.map((q,j)=>i===j?{...q,energy:q.energy+1}:q)},
            extra:alter(take.extra,"raihan",-1),extraDiscard:alter(z.extraDiscard,"raihan",1)});
        }
      }
      if(x.toolPlayAllowed&&z.extra.forest>0&&source("forest"))for(const [i,b] of x.board.entries()){
        if(b.tool!=="none"||!["v","vmax"].includes(b.kind))continue;
        push(z,{kind:"attach-forest-seal",printing:source("forest"),target:b.id},
          {input:{...x,board:x.board.map((q,j)=>i===j?{...q,tool:"other",toolPrinting:source("forest")}:q)},
            extra:alter(z.extra,"forest",-1)});
      }
      if(!z.starUsed&&tutor.starAlchemyAllowed)for(const b of x.board){
        if(b.tool!=="other"||b.toolPrinting!==source("forest")||!["v","vmax"].includes(b.kind))continue;
        for(const t of targets){
          const take=retrieve(z,[t]);if(!take)continue;
          push(z,{kind:"star-alchemy",source:b.id,targetPrinting:t.printing},{...take,starUsed:true});
        }
      }
    }
    function develop(z){
      if(z.depth>=maxDepth){stats.capped=true;return}
      const x=z.input;
      tutorDevelop(z);
      const canBench=development.pokemonPlayAllowed&&x.board.length<=development.maxBench;
      const available=(p)=>z.hand[p]>0;
      const toolRow=(c,id)=>({id,printing:c.printing,kind:c.kind,energy:0,damage:0,psychic:c.psychic,vmax:c.kind==="vmax",
        doorAvailable:false,retreatCost:c.retreatCost,canAttack:c.canAttack,canRetreat:c.canRetreat,
        wobbuffet:c.kind==="wob",latias:c.kind==="latias",fairyZone:c.kind==="clefairy",basic:c.basic,
        ruleBox:c.ruleBox,future:c.future,tool:"none",stackCount:1,stackPrintings:[c.printing],evolutionEligible:false});
      for(const [p,c] of Object.entries(cat)){
        // Wonder Tag is a bench-on-play choice; its search is a separate
        // resource from the once-per-turn Supporter. Do not assume it works
        // through opposing Initialization.
        if(tutor&&available(p)&&c.kind==="lele"&&canBench&&development.abilityPokemonPlayAllowed&&c.onPlayChoiceRequired){
          const active=x.board[x.active],op=x.opponents[x.activeOpponent??0];
          const lock=op?.thorns&&(!active.wobbuffet||op.hood);
          if(!lock)for(const t of tutorTargets(z,q=>q.kind==="supporter")){
            const take=retrieve(z,[t]);if(!take)continue;
            const id="dev"+z.serial;
            push(z,{kind:"bench-pokemon",printing:p,target:id,wonderTagTarget:t.printing},
              {...take,input:{...take.input,board:[...x.board,toolRow(c,id)]},
               hand:alter(take.hand,p,-1),serial:z.serial+1});
          }
        }
        if(available(p)&&c.basic&&canBench&&!c.onPlayChoiceRequired&&(!c.hasAbility||development.abilityPokemonPlayAllowed)){
          const id="dev"+z.serial;
          const action={kind:"bench-pokemon",printing:p,target:id};
          push(z,action,{input:{...x,board:[...x.board,toolRow(c,id)]},hand:alter(z.hand,p,-1),serial:z.serial+1});
        }
        if(available(p)&&!c.basic&&c.kind==="vmax"&&development.evolutionAllowed){
          for(const [i,b] of x.board.entries())if(b.kind==="v"&&b.evolutionEligible){
            const action={kind:"evolve-pokemon",printing:p,target:b.id};
            const evo={...b,printing:p,kind:"vmax",vmax:true,basic:false,ruleBox:true,future:false,
              retreatCost:c.retreatCost,canAttack:c.canAttack,canRetreat:c.canRetreat,doorAvailable:true,
              stackCount:b.stackCount+1,stackPrintings:[...b.stackPrintings,p],evolutionEligible:false};
            push(z,action,{input:{...x,board:x.board.map((q,j)=>i===j?evo:q)},hand:alter(z.hand,p,-1)});
          }
        }
        if(x.itemPlayAllowed&&z.discard[p]>0&&x.nightStretcherCount>0){
          const action={kind:"night-stretcher",targetPrinting:p,target:"pokemon"};
          push(z,action,{input:{...x,nightStretcherCount:x.nightStretcherCount-1},hand:alter(z.hand,p,1),discard:alter(z.discard,p,-1)});
        }
        if(!x.itemPlayAllowed||!(z.known[p]>0)||x.deckCount<1)continue;
        const next={input:{...x,deckCount:x.deckCount-1,knownDeckPsychic:Math.min(x.knownDeckPsychic??0,x.deckCount-1)},
          known:alter(z.known,p,-1),hand:alter(z.hand,p,1)};
        if(c.basic&&c.psychic&&x.fogCount>0)
          push(z,{kind:"fog-crystal",target:"pokemon",targetPrinting:p},{...next,input:{...next.input,fogCount:x.fogCount-1}});
        if((c.psychic||c.dragon)&&z.treasure>0&&z.fodder.length>0)
          push(z,{kind:"mysterious-treasure",targetPrinting:p,discardPrinting:z.fodder[0]},
            {...next,treasure:z.treasure-1,fodder:z.fodder.slice(1)});
        if(c.basic&&z.quick>0&&z.fodder.length>0)
          push(z,{kind:"quick-ball",targetPrinting:p,discardPrinting:z.fodder[0]},
            {...next,quick:z.quick-1,fodder:z.fodder.slice(1)});
      }
    }
    while(head<queue.length){
      const z=queue[head++];stats.nodes++;
      // Collect deterministic board prefixes and conservative post-Door states.
      // If a direct win appears, no external development is necessary.
      const prefixStates=[];
      const result=terminal(z.input,maxStates,z.path.length?()=>true:firstAllowed,
        {witnessOnly:true,stopBeforeChance:options.stopBeforeChance===true,
          onReachableState:({input:snapshot,path})=>prefixStates.push({snapshot,path}),
          onChance:({input:snapshot,path,drawCount})=>{
            if(typeof options.onChance==="function")options.onChance({...callbackState(afterCore(z,snapshot,path)),drawCount});
          }});
      stats.boardStates+=result.states??0;
      if(result.decision){
        const path=[...z.path,...result.decision.plan.actions];
        return {advisory:true,decision:{kind:"development-terminal-witness",firstAction:path[0],prefix:path,
          plan:{...result.decision.plan,actions:path}},lowerBound:1,upperBound:1,stats,
          boundary:"Positive known-resource development witness; replan after every native root and actual draw."};
      }
      if(result.completeWithinModel!==true)stats.capped=true;
      for(const {snapshot,path} of prefixStates){
        const next=afterCore(z,snapshot,path);
        if(typeof options.onReachableState==="function")options.onReachableState(callbackState(next));
        develop(next);
      }
    }
    return {advisory:true,decision:null,stats,completeWithinModel:!stats.capped,lowerBound:0,upperBound:stats.capped?1:0,
      boundary:"No positive witness in bounded development model; does not rule out legal wins."};
  }catch(e){return reject(e.message)}
}
function developmentSelfTest(terminal){
 const assert=(x,m)=>{if(!x)throw Error(m)};
 const V="Shadow Rider Calyrex V CRE",M="Shadow Rider Calyrex VMAX CRE",C="Lillie's Clefairy ex JTG",W="Wobbuffet PHF",L="Latias ex SSP";
 const c=(printing,kind,basic,retreatCost,ruleBox=true)=>({printing,kind,basic,retreatCost,ruleBox,psychic:true,dragon:false,future:false,
  canAttack:true,canRetreat:true,onPlayChoiceRequired:false,hasAbility:kind!=="v",copyLimit:kind==="v"||kind==="vmax"?4:1,entryCertified:true});
 const catalog={[V]:c(V,"v",true,2),[M]:c(M,"vmax",false,2),[C]:c(C,"clefairy",true,1),[W]:c(W,"wob",true,2,false),[L]:c(L,"latias",true,1)};
 const row=(id,p,energy,eligible=false)=>{const q=catalog[p];return {id,printing:p,kind:q.kind,energy,damage:0,psychic:true,
  vmax:q.kind==="vmax",doorAvailable:false,retreatCost:q.retreatCost,canAttack:true,canRetreat:true,wobbuffet:q.kind==="wob",
  latias:q.kind==="latias",fairyZone:q.kind==="clefairy",basic:q.basic,ruleBox:q.ruleBox,future:false,tool:"none",stackCount:1,
  stackPrintings:[p],evolutionEligible:eligible}};
 const opp=(id,hp,dragon=false)=>({id,remainingHP:hp,damage:0,energyUnits:0,ultraBeast:false,prizesOnKO:2,counterPrizesOnKO:2,
  opponentBoardCount:2,weaknessMultiplier:1,resistance:0,damageReduction:0,damageReductionAllKindsCertified:true,
  counterBlockedActive:false,counterBlockedBench:false,thorns:false,dragon,hood:false});
 const input=(board,hp,dragon=false)=>({stablePublicEffects:true,noUnmodeledTerminalEffects:true,attackModel:"candidate-printed-v1",
  dynamicEffects:{kind:"thorns-wobbuffet-v1",otherEffectsStable:true,toolsEffective:true},board,active:0,
  opponents:[opp("oa",hp,dragon),opp("ob0",320)],activeOpponent:0,handPsychic:0,deckCount:10,knownDeckPsychic:0,
  knownDeckPsychicCertified:true,prizesRemaining:2,manualAvailable:true,retreatAvailable:false,supportAvailable:true,
  manualAttachmentAllowed:true,itemPlayAllowed:true,acerolaHeld:false,dimensionValley:false});
 const dev=(handPokemon,knownDeckPokemon={},extra={})=>({permissionsCertified:true,noBenchCapacityChange:true,maxBench:5,catalog,
  handPokemon,knownDeckPokemon,knownDeckPokemonCertified:true,discardPokemon:{},pokemonPlayAllowed:true,
  abilityPokemonPlayAllowed:true,evolutionAllowed:true,...extra});
 const cases=[];
 function test(name,x,y,kind,damage,opts={}){
  const z=developmentTerminal(terminal,x,y,opts);
  assert((z.decision?.firstAction.kind??null)===kind,name+" wrong first action: "+JSON.stringify(z));
  if(kind)assert(z.decision.plan.damage===damage,name+" wrong damage");
  cases.push({name,kind,damage:kind?z.decision.plan.damage:null,actions:z.decision?.prefix??[],stats:z.stats});
 }
 const evo=input([row("a",V,3,true),row("b",M,3)],190);
 const dragon=input([row("a",M,3),row("b",V,2)],320,true);
 test("held VMAX evolves established V",evo,dev({[M]:1}),"evolve-pokemon",190);
 test("newly played V cannot evolve",input([row("a",V,3,false),row("b",M,3)],190),dev({[M]:1}),null);
 test("evolution lock forbids same",evo,dev({[M]:1},{},{evolutionAllowed:false}),null);
 test("Clefairy bench doubles Max Geist",dragon,dev({[C]:1}),"bench-pokemon",320);
 test("full Bench excludes Fairy Zone",dragon,dev({[C]:1},{},{maxBench:1}),null);
 test("Ability Pokémon lock excludes Fairy Zone",dragon,dev({[C]:1},{},{abilityPokemonPlayAllowed:false}),null);
 test("Fog -> Clefairy -> 320", {...dragon,fogCount:1},dev({}, {[C]:1}),"fog-crystal",320);
 test("no unseen Fog target inferred",{...dragon,fogCount:1},dev({}, {},{knownDeckPokemonCertified:false}),null);
 test("Night Stretcher -> VMAX -> 190",{...evo,nightStretcherCount:1},dev({}, {},{discardPokemon:{[M]:1}}),"night-stretcher",190);
 test("Mysterious Treasure spends exact disjoint fodder",evo,dev({}, {[M]:1},
  {treasureCount:1,fodder:["Other"],fodderCertified:true,fodderDisjointFromModeledResources:true}),"mysterious-treasure",190);
 test("Mysterious Treasure lacks discard",evo,dev({}, {[M]:1},{treasureCount:1}),null);
 test("unsupported root excluded",dragon,dev({[C]:1}),null,undefined,{firstActionAllowed:a=>a.kind!=="bench-pokemon"});
 test("Quick Ball -> Clefairy -> 320",dragon,dev({}, {[C]:1},{quickCount:1,fodder:["Other"],
  fodderCertified:true,fodderDisjointFromModeledResources:true}),"quick-ball",320);
 // Underworld Door consumes one held P and may draw the only known VMAX.
 // With an exact single remaining copy, a later tutor must not guarantee it.
 const delayed={...evo,board:[row("a",V,2,true),{...row("b",M,3),doorAvailable:true}],handPsychic:1,manualAvailable:false};
 test("unknown Door draw can consume a tutor target",delayed,dev({}, {[M]:1},{treasureCount:1,fodder:["Other"],
  fodderCertified:true,fodderDisjointFromModeledResources:true}),null,undefined,{firstActionAllowed:a=>a.kind==="underworld-door"});
 return cases;
}

function tutorSelfTest(terminal){
  const V="Shadow Rider Calyrex V CRE",M="Shadow Rider Calyrex VMAX CRE",L="Tapu Lele-GX GRI";
  const c=(printing,kind,basic,retreatCost,onPlayChoiceRequired=false)=>({printing,kind,basic,retreatCost,ruleBox:true,psychic:true,
    dragon:false,future:false,canAttack:true,canRetreat:false,onPlayChoiceRequired,hasAbility:kind!=="v",copyLimit:kind==="lele"?1:4,entryCertified:true});
  const catalog={[V]:c(V,"v",true,2),[M]:c(M,"vmax",false,2),[L]:c(L,"lele",true,1,true)};
  const row=(id,p,energy,eligible=false,door=false)=>({id,printing:p,kind:catalog[p].kind,energy,damage:0,psychic:true,
    vmax:p===M,doorAvailable:door,retreatCost:2,canAttack:true,canRetreat:false,wobbuffet:false,latias:false,fairyZone:false,
    basic:p!==M,ruleBox:true,future:false,tool:"none",stackCount:1,stackPrintings:[p],evolutionEligible:eligible});
  const opp=(id,hp,thorns=false)=>({id,remainingHP:hp,damage:0,energyUnits:0,ultraBeast:false,prizesOnKO:2,counterPrizesOnKO:2,
    opponentBoardCount:2,weaknessMultiplier:1,resistance:0,damageReduction:0,damageReductionAllKindsCertified:true,
    counterBlockedActive:false,counterBlockedBench:false,thorns,dragon:false,hood:false});
  const input=(board,hp,p=0,kp=0)=>({stablePublicEffects:true,noUnmodeledTerminalEffects:true,attackModel:"candidate-printed-v1",
    dynamicEffects:{kind:"thorns-wobbuffet-v1",otherEffectsStable:true,toolsEffective:true},board,active:0,
    opponents:[opp("oa",hp),opp("ob0",320)],activeOpponent:0,handPsychic:p,deckCount:10,knownDeckPsychic:kp,
    knownDeckPsychicCertified:true,prizesRemaining:2,manualAvailable:true,retreatAvailable:false,supportAvailable:true,
    manualAttachmentAllowed:true,itemPlayAllowed:true,toolPlayAllowed:true,acerolaHeld:false,dimensionValley:false});
  const rolePrintings={P:"Psychic Energy SVE",fog:"Fog Crystal CRE",hood:"Stealthy Hood UNB",guzma:"Guzma BUS",
    arven:"Arven SVI",raihan:"Raihan EVS",teammates:"Teammates PRC",forest:"Forest Seal Stone SIT"};
  const dev=(heldExtra={},knownDeckRoles={},handPokemon={},knownDeckPokemon={},extra={},tutorExtra={})=>({
    permissionsCertified:true,noBenchCapacityChange:true,maxBench:5,catalog,handPokemon,knownDeckPokemon,knownDeckPokemonCertified:true,
    discardPokemon:{},pokemonPlayAllowed:true,abilityPokemonPlayAllowed:true,evolutionAllowed:true,...extra,
    tutors:{certified:true,knownDeckRolesCertified:true,rolePrintings,heldExtra,knownDeckRoles,discardExtra:{},priorKO:true,
      starAlchemyAllowed:true,vstarAvailable:true,...tutorExtra}});
  const results=[];
  function test(name,x,y,kind,expect){
    const z=developmentTerminal(terminal,x,y,{maxDevelopmentNodes:1000,maxDevelopmentDepth:6});
    if((z.decision?.firstAction.kind??null)!==kind||expect&&!expect(z))throw Error(name+": "+JSON.stringify(z));
    results.push({name,first:z.decision?.firstAction??null,actions:z.decision?.prefix??[],damage:z.decision?.plan.damage??null});
  }
  const r={...input([row("a",M,3),row("b",M,2)],190),discardPsychic:1,manualAvailable:false};
  test("Raihan provides independent attachment",r,dev({raihan:1},{fog:1}),"raihan",z=>z.decision.plan.damage===190);
  test("Raihan unavailable without prior KO",r,dev({raihan:1},{fog:1},{},{},{},{priorKO:false}),null);
  test("Raihan K0 can fund a terminal attack without a known tutor target",
    {...r,knownDeckPsychicCertified:false},dev({raihan:1}),"raihan",
    z=>z.decision.firstAction.unknownSearch===true&&z.decision.firstAction.targets.length===0&&z.decision.plan.damage===190);
  test("Raihan empty-deck attachment requires no search",{...r,deckCount:0},dev({raihan:1}),"raihan",
    z=>!z.decision.firstAction.unknownSearch&&z.decision.firstAction.targets.length===0);
  test("Raihan still requires an eligible discard Energy",{...r,discardPsychic:0},dev({raihan:1}),null);
  test("Unknown search cannot stand in for a missing attack resource",{...r,opponents:[opp("oa",220),opp("ob0",320)]},dev({raihan:1}),null);
  const uncertain=developmentTerminal(terminal,r,dev({raihan:1}),{stopBeforeChance:true});
  if(uncertain.decision)throw Error("abstract unrestricted search entered chance ledger");
  results.push({name:"abstract unrestricted search excluded from chance ledger",first:null,actions:[],damage:null});
  test("VS retrieves Raihan after KO",{...r,vsSeekerCount:1},dev({}, {fog:1},{},{},{},{discardExtra:{raihan:1}}),"vs-seeker",
    z=>z.decision.prefix.some(a=>a.kind==="raihan"));
  const e=input([row("a",V,2,true),row("b",M,3)],190,0,1);
  test("Teammates jointly finds VMAX and P",e,dev({teammates:1},{},{},{[M]:1}),"teammates",
    z=>z.decision.firstAction.targets.length===2&&z.decision.firstAction.targets.includes(M)&&z.decision.plan.damage===190);
  test("Teammates cannot fill two channels with only VMAX",{...e,knownDeckPsychic:0},dev({teammates:1},{},{},{[M]:1}),null);
  const th={...input([row("a",M,3),row("b",M,3,false,true)],230,1,1),opponents:[opp("oa",230,true),opp("ob0",320)]};
  test("Arven jointly accesses Fog and Hood under Thorns",th,dev({arven:1},{fog:1,hood:1}),"arven",
    z=>z.decision.firstAction.targets.length===2&&z.decision.plan.damage===250);
  test("Arven without Hood cannot enable Door",th,dev({arven:1},{fog:1}),null);
  const star=input([row("a",V,3,true),row("b",M,3)],190);
  test("attach Forest Seal then search VMAX",star,dev({forest:1},{},{},{[M]:1}),"attach-forest-seal",
    z=>z.decision.prefix.some(a=>a.kind==="star-alchemy"));
  test("spent VSTAR Power excludes Forest Seal route",star,dev({forest:1},{},{},{[M]:1},{},{vstarAvailable:false}),null);
  const attached={...star,board:[{...star.board[0],tool:"other",toolPrinting:rolePrintings.forest},star.board[1]]};
  test("attached Forest Seal directly finds VMAX",attached,dev({}, {},{}, {[M]:1}),"star-alchemy",
    z=>z.decision.plan.damage===190);
  const lele={...input([row("a",M,3),row("b",M,3)],320),opponents:[opp("oa",320),opp("ob0",190)]};
  test("Wonder Tag finds Guzma without spending Supporter",lele,dev({}, {guzma:1},{[L]:1}),"bench-pokemon",
    z=>z.decision.firstAction.wonderTagTarget===rolePrintings.guzma&&z.decision.prefix.some(a=>a.kind==="guzma"));
  test("Initialization suppresses fresh Wonder Tag",{...lele,opponents:[opp("oa",320,true),opp("ob0",190)]},dev({}, {guzma:1},{[L]:1}),null);
  return results;
}

module.exports={developmentTerminal,developmentSelfTest,tutorSelfTest};
if(require.main===module){
 const {acerolaMaxGeist}=require("./acerola-max-geist-advisory.cjs");
 console.log(JSON.stringify({development:developmentSelfTest(acerolaMaxGeist),tutors:tutorSelfTest(acerolaMaxGeist)},null,2));
}
