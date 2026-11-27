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
        !cat[p]&&development.fodderCertified===true),"unverified exact discard fodder");
    const firstAllowed=options.firstActionAllowed??(()=>true);
    const maxNodes=options.maxDevelopmentNodes??250,maxStates=options.maxStatesPerNode??6000,maxDepth=options.maxDevelopmentDepth??4;
    check(int(maxNodes,1,10000)&&int(maxStates,1,1000000)&&int(maxDepth,0,12),"invalid development budget");
    const alter=(inv,p,d)=>({...inv,[p]:(inv[p]??0)+d});
    const norm=x=>Object.fromEntries(Object.entries(x).filter(([,v])=>v).sort((a,b)=>a[0].localeCompare(b[0])));
    const start={input,hand:development.handPokemon??{},known:development.knownDeckPokemon??{},discard:development.discardPokemon??{},
      treasure:development.treasureCount??0,quick:development.quickCount??0,fodder:development.fodder??[],path:[],depth:0,serial:0};
    const stats={nodes:0,boardStates:0,expanded:0,duplicate:0,capped:false,ignoredDraws:0};
    const queue=[start],seen=new Set();
    const key=z=>JSON.stringify([z.input,norm(z.hand),norm(z.known),norm(z.discard),z.treasure,z.quick,[...z.fodder].sort(),z.depth]);
    seen.add(key(start));
    let head=0;
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
      let hand={...z.hand};
      // Acerola returns the whole visible Pokémon stack. Keep only explicitly
      // known stack identities, excluding any unmodeled other cards.
      for(const a of path)if(a.kind==="acerola"){
        const old=z.input.board.find(b=>b.id===a.target);
        for(const p of old?.stackPrintings??[])if(cat[p])hand=alter(hand,p,1);
      }
      // Core snapshot preserves actual identities of remaining Pokémon.
      return {...z,input:snapshot,known,hand,path:[...z.path,...path]};
    }
    function develop(z){
      if(z.depth>=maxDepth){stats.capped=true;return}
      const x=z.input;
      const canBench=development.pokemonPlayAllowed&&x.board.length<=development.maxBench;
      const available=(p)=>z.hand[p]>0;
      const toolRow=(c,id)=>({id,printing:c.printing,kind:c.kind,energy:0,damage:0,psychic:c.psychic,vmax:c.kind==="vmax",
        doorAvailable:false,retreatCost:c.retreatCost,canAttack:c.canAttack,canRetreat:c.canRetreat,
        wobbuffet:c.kind==="wob",latias:c.kind==="latias",fairyZone:c.kind==="clefairy",basic:c.basic,
        ruleBox:c.ruleBox,future:c.future,tool:"none",stackCount:1,stackPrintings:[c.printing],evolutionEligible:false});
      for(const [p,c] of Object.entries(cat)){
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
        {witnessOnly:true,onReachableState:({input:snapshot,path})=>prefixStates.push({snapshot,path})});
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
        develop(next);
      }
    }
    return {advisory:true,decision:null,stats,lowerBound:0,upperBound:stats.capped?1:0,
      boundary:"No positive witness in bounded development model; does not rule out legal wins."};
  }catch(e){return reject(e.message)}
}
module.exports={developmentTerminal};
