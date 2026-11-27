"use strict";

// Detached actor-visible, exact K1 role-multiset refresh planner.
// The terminal helper is injected so this can be bundled into a pure worker;
// no Store, hidden order, opponent hand, native dispatch, or engine imports.
const REFRESH_ROLES=["P","fog","stretcher","vs","acerola","guzma","ranger","lillie","iono","stamp","hood","float","blower","valley","other"];
const ROLE_LIMITS={P:11,fog:4,stretcher:1,vs:2,acerola:1,guzma:1,ranger:1,lillie:2,iono:1,stamp:1,hood:2,float:1,blower:1,valley:1,other:60};
function roleVector(x){
  if(!x||typeof x!=="object"||Object.keys(x).some(k=>!REFRESH_ROLES.includes(k)))throw Error("unknown role");
  const a=REFRESH_ROLES.map(k=>x[k]??0);
  if(a.some((n,i)=>!Number.isSafeInteger(n)||n<0||n>ROLE_LIMITS[REFRESH_ROLES[i]]))throw Error("invalid role count");
  return a;
}
const idx=k=>REFRESH_ROLES.indexOf(k);
const sum=a=>a.reduce((n,x)=>n+x,0);
const add=(a,b)=>a.map((x,i)=>x+b[i]);
const sub=(a,b)=>a.map((x,i)=>x-b[i]);
const change=(a,k,n)=>a.map((x,i)=>i===idx(k)?x+n:x);
function chooseBig(n,k){
  if(k<0||k>n)return 0n;
  k=Math.min(k,n-k);
  let v=1n;
  for(let i=1;i<=k;i++)v=v*BigInt(n-k+i)/BigInt(i);
  return v;
}
// Enumerate count vectors, not ordered physical cards. Each vector has exact
// multiplicity product(C(role_count, drawn_count)).
function* drawVectors(pool,n){
  const suffix=Array(pool.length+1).fill(0);
  for(let i=pool.length-1;i>=0;i--)suffix[i]=suffix[i+1]+pool[i];
  const out=Array(pool.length).fill(0);
  function* rec(i,left,w){
    if(i===pool.length){
      if(left===0)yield {draw:out.slice(),weight:w};
      return;
    }
    for(let c=Math.max(0,left-suffix[i+1]);c<=Math.min(left,pool[i]);c++){
      out[i]=c;
      yield* rec(i+1,left-c,w*chooseBig(pool[i],c));
    }
  }
  yield* rec(0,n,1n);
}
function applyRoles(base,h,d,supportSpent){
  return {...base,handPsychic:h[idx("P")],knownDeckPsychic:d[idx("P")],
    knownDeckPsychicCertified:true,deckCount:sum(d),
    acerolaHeld:h[idx("acerola")]>0,guzmaHeld:h[idx("guzma")]>0,rangerHeld:h[idx("ranger")]>0,
    vsSeekerCount:h[idx("vs")],fogCount:h[idx("fog")],nightStretcherCount:h[idx("stretcher")],
    ...(base.dynamicEffects?{hoodCount:h[idx('hood')],floatStoneCount:h[idx('float')],
      fieldBlowerCount:h[idx('blower')],valleyHeld:h[idx('valley')]>0}:{}),
    supportAvailable:base.supportAvailable&&!supportSpent};
}
function exactRefreshTerminal(terminal,input,context,options={}){
  const fail=reason=>({advisory:true,decision:null,reason});
  try{
    const require=(c,m)=>{if(!c)throw Error(m)};
    require(typeof terminal==="function"&&input?.stablePublicEffects===true&&input.noUnmodeledTerminalEffects===true,
      "missing stable terminal envelope");
    require(context?.exactMembershipKnown===true&&context.rolesAreExact===true,
      "exact owner K1 role multiset required");
    const h=roleVector(context.handCounts),d=roleVector(context.deckCounts);
    require(sum(d)===input.deckCount&&h[idx("P")]===input.handPsychic&&
      d[idx("P")]===(input.knownDeckPsychic??0)&&(!d[idx("P")]||input.knownDeckPsychicCertified===true),
      "hand/deck resource mismatch");
    const refreshDiscard={lillie:context.refreshDiscard?.lillie??0,iono:context.refreshDiscard?.iono??0};
    require(Number.isSafeInteger(refreshDiscard.lillie)&&refreshDiscard.lillie>=0&&refreshDiscard.lillie<=2&&
      Number.isSafeInteger(refreshDiscard.iono)&&refreshDiscard.iono>=0&&refreshDiscard.iono<=1,
      "invalid public refresh discard");
    for(let i=0;i<h.length;i++){
      const k=REFRESH_ROLES[i];
      const discarded=k==="P"?(input.discardPsychic??0):
        k==="acerola"?+!!input.acerolaDiscard:k==="guzma"?+!!input.guzmaDiscard:
        k==="ranger"?+!!input.rangerDiscard:(refreshDiscard[k]??0);
      const attached=k==='P'?input.board.reduce((a,x)=>a+x.energy,0):
        k==='hood'?input.board.filter(x=>x.tool==='hood').length:k==='float'?input.board.filter(x=>x.tool==='float').length:
        k==='valley'?+!!input.dimensionValley:0;
      require(h[i]+d[i]+discarded+attached<=ROLE_LIMITS[k],"role copy conservation: "+k);
    }
    require(input.acerolaHeld===(h[idx("acerola")]>0)&&
      !!input.guzmaHeld===(h[idx("guzma")]>0)&&!!input.rangerHeld===(h[idx("ranger")]>0)&&
      (input.vsSeekerCount??0)===h[idx("vs")]&&(input.fogCount??0)===h[idx("fog")]&&
      (input.nightStretcherCount??0)===h[idx("stretcher")],"terminal hand roles inconsistent");
    if(input.dynamicEffects)require((input.hoodCount??0)===h[idx('hood')]&&
      (input.floatStoneCount??0)===h[idx('float')]&&(input.fieldBlowerCount??0)===h[idx('blower')]&&
      !!input.valleyHeld===(h[idx('valley')]>0),"dynamic held roles inconsistent");
    else require(['hood','float','blower','valley'].every(k=>h[idx(k)]===0&&d[idx(k)]===0),
      "Tool/Stadium roles must be classified Other in static envelope");
    require(["lillie","iono","stamp"].every(k=>typeof context.refreshLegal?.[k]==="boolean"),"refresh legality must be certified");
    const maxStates=options.maxStatesPerOutcome??4000,maxOutcomes=options.maxOutcomesPerRoute??10000;
    require(Number.isSafeInteger(maxStates)&&maxStates>0&&maxStates<=1000000&&
      Number.isSafeInteger(maxOutcomes)&&maxOutcomes>0&&maxOutcomes<=100000,"invalid search cap");
    const firstAllowed=options.firstActionAllowed??(()=>true);
    const witness=(base,hand,deck,spent)=>terminal(applyRoles(base,hand,deck,spent),maxStates,()=>true,{witnessOnly:true});
    const deterministic=terminal(input,maxStates,firstAllowed,{witnessOnly:true});
    // A certain current legal win dominates an unnecessary shuffle.
    if(deterministic.decision)return {advisory:true,decision:{kind:"deterministic",...deterministic.decision},
      routes:[],boundary:"positive known-resource witness, no refresh necessary"};
    const start={base:input,h,d,path:[],exchangeable:context.oldDeckExchangeable===true};
    const prefixes=[start];
    // Up to one P search, then one manual bank. No hidden draw informs this prefix.
    if(input.itemPlayAllowed===true){
      if(h[idx("fog")]&&d[idx("P")]&&firstAllowed({kind:"fog-crystal",target:"Basic Psychic Energy"}))
        prefixes.push({base:input,h:change(change(h,"fog",-1),"P",1),d:change(d,"P",-1),
          path:[{kind:"fog-crystal",target:"Basic Psychic Energy"}],exchangeable:true});
      if(h[idx("stretcher")]&&(input.discardPsychic??0)>0&&firstAllowed({kind:"night-stretcher",target:"Basic Psychic Energy"}))
        prefixes.push({base:{...input,discardPsychic:input.discardPsychic-1},
          h:change(change(h,"stretcher",-1),"P",1),d,
          path:[{kind:"night-stretcher",target:"Basic Psychic Energy"}],exchangeable:start.exchangeable});
    }
    for(const p of prefixes.slice()){
      if(!p.base.manualAvailable||!p.base.manualAttachmentAllowed||p.h[idx("P")]===0)continue;
      for(let i=0;i<p.base.board.length;i++){
        const action={kind:"manual-attach",target:p.base.board[i].id};
        if(!p.path.length&&!firstAllowed(action))continue;
        prefixes.push({...p,base:{...p.base,manualAvailable:false,
          board:p.base.board.map((b,j)=>i===j?{...b,energy:b.energy+1}:b)},
          h:change(p.h,"P",-1),path:[...p.path,action]});
      }
    }
    const routes=[];
    for(const prefix of prefixes){
      for(const kind of ["lillie","iono","stamp"]){
        if(!context.refreshLegal[kind]||
          (kind==="stamp"?!(prefix.base.itemPlayAllowed&&context.ownPokemonKOdLastOpponentTurn===true):!prefix.base.supportAvailable))
          continue;
        let p=prefix;
        if(!p.h[idx(kind)]){
          // VS Seeker may recover a draw Supporter, not Unfair Stamp.
          const vsAction={kind:"vs-seeker",target:kind==="lillie"?"Lillie's Determination":"Iono"};
          if(kind==="stamp"||!p.base.itemPlayAllowed||!p.h[idx("vs")]||!refreshDiscard[kind]||
            (!p.path.length&&!firstAllowed(vsAction)))continue;
          p={...p,h:change(change(p.h,"vs",-1),kind,1),path:[...p.path,vsAction]};
        }
        const action={kind:"refresh",card:kind==="lillie"?"Lillie's Determination":kind==="iono"?"Iono":"Unfair Stamp"};
        if(!p.path.length&&!firstAllowed(action))continue;
        const rest=change(p.h,kind,-1);
        const desired=kind==="lillie"?(input.prizesRemaining===6?8:6):kind==="iono"?input.prizesRemaining:5;
        let pool,drawN,fixed=Array(h.length).fill(0),remainingOther=Array(h.length).fill(0);
        if(kind==="iono"){
          // Old deck remains on top; only the returned hand is independently shuffled.
          if(desired>=sum(p.d)){
            fixed=p.d;pool=rest;drawN=Math.min(desired-sum(p.d),sum(rest));
          }else{
            if(!p.exchangeable)continue;
            pool=p.d;drawN=desired;remainingOther=rest;
          }
        }else{
          pool=add(p.d,rest);drawN=Math.min(desired,sum(pool));
        }
        if(drawN+sum(fixed)===0)continue;
        const denominator=chooseBig(sum(pool),drawN);
        let win=0n,unknown=0n,visited=0n,outcomes=0,positive=0;
        let example=null;
        for(const {draw,weight} of drawVectors(pool,drawN)){
          if(outcomes>=maxOutcomes)break;
          outcomes++;visited+=weight;
          const newHand=add(draw,fixed),newDeck=add(sub(pool,draw),remainingOther);
          const r=witness(p.base,newHand,newDeck,kind!=="stamp");
          if(r.decision){win+=weight;positive++;if(!example)example={draw:Object.fromEntries(REFRESH_ROLES.map((k,i)=>[k,newHand[i]])),
            continuation:r.decision.plan.actions};}
          else if(!r.completeWithinModel)unknown+=weight;
        }
        unknown+=denominator-visited;
        const path=[...p.path,action];
        routes.push({kind,path,firstAction:path[0],drawCount:drawN+sum(fixed),
          knownWinningPhysicalDraws:win.toString(),physicalDraws:denominator.toString(),
          unknownPhysicalDraws:unknown.toString(),
          lowerBound:Number(win)/Number(denominator),upperBoundWithinRestrictedModel:Number(win+unknown)/Number(denominator),
          fullyEvaluated:unknown===0n,outcomes,positiveOutcomeClasses:positive,example});
      }
    }
    routes.sort((a,b)=>b.lowerBound-a.lowerBound||a.path.length-b.path.length||a.kind.localeCompare(b.kind));
    const best=routes[0];
    return {advisory:true,decision:best?.lowerBound>0?{kind:"refresh-terminal-witness",firstAction:best.firstAction,route:best}:null,
      routes,boundary:"Exact physical-draw weighting over certified K1 roles; lower bound on one-turn win from one refresh and restricted known-resource continuations. No unknown future Door draw used, no second refresh, no future turns. Upper bound is only for this restricted model, not all legal game strategies. Iono requires exchangeable old deck or complete old-deck draw; no hidden deck order. Selection maximizes witnessed immediate-win probability only, not long-run game value."};
  }catch(e){return fail(String(e.message??e));}
}
function refreshSelfTest(terminal){
  const assert=(c,m)=>{if(!c)throw Error(m)};
  const v=(id,e,door=false)=>({id,energy:e,damage:0,psychic:true,vmax:true,doorAvailable:door,retreatCost:2,canAttack:true,canRetreat:false});
  const t=(id,hp)=>({id,remainingHP:hp,prizesOnKO:2,opponentBoardCount:2,weaknessMultiplier:1,resistance:0,damageReduction:0});
  const b=(board,hand,deck,extra={})=>({stablePublicEffects:true,noUnmodeledTerminalEffects:true,board,active:0,
    handPsychic:hand.P??0,knownDeckPsychic:deck.P??0,knownDeckPsychicCertified:true,deckCount:Object.values(deck).reduce((a,x)=>a+x,0),
    manualAvailable:true,retreatAvailable:true,supportAvailable:true,acerolaHeld:!!hand.acerola,guzmaHeld:!!hand.guzma,rangerHeld:!!hand.ranger,
    fogCount:hand.fog??0,vsSeekerCount:hand.vs??0,nightStretcherCount:hand.stretcher??0,
    manualAttachmentAllowed:true,dimensionValley:false,itemPlayAllowed:true,prizesRemaining:2,
    opponents:[t("oa",190),t("ob",320)],...extra});
  const c=(h,d,e={})=>({exactMembershipKnown:true,rolesAreExact:true,handCounts:h,deckCounts:d,oldDeckExchangeable:true,
    refreshLegal:{lillie:true,iono:true,stamp:true},...e});
  const results=[];
  const route=(r,kind,bank)=>r.routes.find(x=>x.kind===kind&&(x.path.some(a=>a.kind==="manual-attach")===bank));
  let h={P:1,lillie:1},d={P:3,other:17};
  let input=b([v("a",3),v("b",1,true)],h,d);
  let r=exactRefreshTerminal(terminal,input,c(h,d));
  const now=route(r,"lillie",false),bank=route(r,"lillie",true);
  // Need >=2 P in six draws if direct; >=1 P if banked.
  const exactNow=1-Number(chooseBig(17,6)+4n*chooseBig(17,5))/Number(chooseBig(21,6));
  const exactBank=1-Number(chooseBig(17,6))/Number(chooseBig(20,6));
  assert(Math.abs(now.lowerBound-exactNow)<1e-12&&Math.abs(bank.lowerBound-exactBank)<1e-12&&bank.lowerBound>now.lowerBound,
    "prebank hypergeometric mismatch "+JSON.stringify({now,bank,exactNow,exactBank}));
  assert(r.decision.firstAction.kind==="manual-attach","bank first must win comparison");
  results.push({name:"bank before Lillie",immediate:now.lowerBound,bank:bank.lowerBound});
  h={lillie:1,stamp:1};d={P:2,guzma:1,other:7};
  input=b([v("a",3),v("b",2)],h,d,{opponents:[t("oa",320),t("ob",160)]});
  r=exactRefreshTerminal(terminal,input,c(h,d,{ownPokemonKOdLastOpponentTurn:true}));
  const stamp=route(r,"stamp",false),lillie=route(r,"lillie",false);
  const stampExact=Number(chooseBig(10,4)-chooseBig(8,4))/Number(chooseBig(11,5));
  assert(stamp.lowerBound>0&&Math.abs(stamp.lowerBound-stampExact)<1e-12&&lillie.lowerBound===0&&r.decision.route.kind==="stamp",
    "Stamp must preserve gust Supporter "+JSON.stringify({stamp,lillie,stampExact}));
  results.push({name:"Stamp preserves Guzma",stamp:stamp.lowerBound,lillie:lillie.lowerBound});
  let q=exactRefreshTerminal(terminal,input,c(h,d,{ownPokemonKOdLastOpponentTurn:false}));
  assert(!q.routes.some(x=>x.kind==="stamp"),"Stamp KO precondition");
  q=exactRefreshTerminal(terminal,{...input,itemPlayAllowed:false},c(h,d,{ownPokemonKOdLastOpponentTurn:true}));
  assert(!q.routes.some(x=>x.kind==="stamp"),"Item lock blocks Stamp");
  h={iono:1,P:1,other:7};d={P:2,other:8};
  input=b([v("a",3),v("b",1,true)],h,d);
  r=exactRefreshTerminal(terminal,input,c(h,d));
  const ionoNow=route(r,"iono",false),ionoBank=route(r,"iono",true);
  assert(Math.abs(ionoNow.lowerBound-1/45)<1e-12&&Math.abs(ionoBank.lowerBound-17/45)<1e-12,
    "Iono bottom pool mismatch "+JSON.stringify({ionoNow,ionoBank}));
  results.push({name:"Iono keeps returned hand below old deck",immediate:ionoNow.lowerBound,bank:ionoBank.lowerBound});
  q=exactRefreshTerminal(terminal,input,c(h,d,{oldDeckExchangeable:false}));
  assert(!q.routes.length,"no invented old-deck order");
  h={iono:1,P:1};d={P:1};
  input=b([v("a",3),v("b",1,true)],h,d);
  r=exactRefreshTerminal(terminal,input,c(h,d,{oldDeckExchangeable:false}));
  assert(r.decision.route.lowerBound===1,"draw entire old deck then shuffled bottom");
  results.push({name:"Iono crossing old-deck boundary",p:r.decision.route.lowerBound});
  h={vs:1,P:1};d={P:3,other:17};
  input=b([v("a",3),v("b",1,true)],h,d);
  r=exactRefreshTerminal(terminal,input,c(h,d,{refreshDiscard:{lillie:1}}));
  assert(r.decision.route.path.some(a=>a.kind==="vs-seeker"&&a.target==="Lillie's Determination"),"VS refresh path missing");
  results.push({name:"VS recovers draw Supporter",p:r.decision.route.lowerBound});
  q=exactRefreshTerminal(terminal,input,c(h,d,{refreshDiscard:{lillie:1}}),{firstActionAllowed:a=>a.kind==="vs-seeker"});
  assert(q.decision.firstAction.kind==="vs-seeker","root constrained alternate refresh");
  q=exactRefreshTerminal(terminal,input,c(h,d,{exactMembershipKnown:false}));
  assert(q.decision===null&&q.reason,"K0 must abstain");
  q=exactRefreshTerminal(terminal,input,c(h,d,{refreshDiscard:{lillie:1}}),{maxOutcomesPerRoute:1});
  assert(q.routes.some(x=>!x.fullyEvaluated&&Number(x.unknownPhysicalDraws)>0),"unvisited mass must stay unknown");
  h={P:1,lillie:1};d={other:20};
  input=b([v("a",3),v("b",2)],h,d);
  q=exactRefreshTerminal(terminal,input,c(h,d));
  assert(q.decision.kind==="immediate-win-certificate"||q.decision.kind==="deterministic","deterministic win should skip refresh");
  results.push({name:"already certain win skips refresh",kind:q.decision.kind});
  // A shuffle must not retain a held Hood that the draw did not return.
  h={hood:1,lillie:1};d={P:2,other:8};
  const dynV=(id,e)=>({...v(id,e,true),wobbuffet:false,latias:false,fairyZone:false,basic:false,ruleBox:true,future:false,tool:'none'});
  const thorns=id=>({...t(id,230),thorns:true,dragon:false,hood:false});
  input=b([dynV("a",3),dynV("b",3)],h,d,{dynamicEffects:{kind:"thorns-wobbuffet-v1",toolsEffective:true,otherEffectsStable:true},
    hoodCount:1,toolPlayAllowed:true,opponents:[thorns("oa"),thorns("ob")]});
  r=exactRefreshTerminal(terminal,input,c(h,d));
  const hoodRoute=route(r,"lillie",false),hoodExpected=Number(chooseBig(8,3))/Number(chooseBig(11,6));
  // Need both deck P and the shuffled Hood; no resource is duplicated.
  assert(Math.abs(hoodRoute.lowerBound-hoodExpected)<1e-12,"shuffled Hood is not retained "+JSON.stringify({hoodRoute,hoodExpected}));
  results.push({name:"dynamic Hood drawn after shuffle rather than retained",p:hoodRoute.lowerBound});
  return results;
}

/**
 * Adaptive finite-horizon turn planner. Reuses the same deterministic
 * candidate mechanics, stopping at each random draw and maximizing AFTER
 * observing its role multiset. No action can depend on a not-yet-drawn card.
 * Draw blocks represent actor-certified exchangeable segments, not hidden order.
 */
function adaptiveTerminal(terminal,input,context,options={}){
  const reject=reason=>({advisory:true,decision:null,reason,lowerBound:0,upperBound:1});
  try{
    const require=(c,m)=>{if(!c)throw Error(m)};
    require(typeof terminal==="function"&&input?.stablePublicEffects===true&&input.noUnmodeledTerminalEffects===true,
      "stable terminal envelope required");
    require(context?.exactMembershipKnown===true&&context.rolesAreExact===true,
      "exact actor-known role membership required");
    const dev=context.development??null,devProvider=options.developmentTerminal;
    require(!dev||(typeof devProvider==="function"&&dev.permissionsCertified===true&&dev.catalog&&
      Array.isArray(dev.fodderPrintings??[])),"development prefix provider absent");
    const tutor=dev?.tutors??null,tutorExtras=tutor?["arven","raihan","teammates","forest"]:[];
    require(!tutor||tutor.certified===true&&tutor.knownDeckRolesCertified===true,"uncertified tutor roles");
    const pokemonRoles=dev?Object.keys(dev.catalog).sort().map(p=>"pk:"+p):[];
    const fodderRoles=dev?[...new Set(dev.fodderPrintings??[])].sort().map(p=>"fd:"+p):[];
    const roles=[...REFRESH_ROLES,...(dev?["treasure","quick",...tutorExtras,...pokemonRoles,...fodderRoles]:[])];
    const roleLimits={...ROLE_LIMITS,...(dev?{treasure:4,quick:1,...Object.fromEntries(tutorExtras.map(k=>[k,1])),
      ...Object.fromEntries(pokemonRoles.map(k=>[k,dev.catalog[k.slice(3)].copyLimit])),
      ...Object.fromEntries(fodderRoles.map(k=>[k,4]))}:{})};
    const ix=k=>roles.indexOf(k);
    const vec=x=>{
      require(x&&typeof x==="object"&&Object.keys(x).every(k=>roles.includes(k)),"unknown exact role");
      const out=roles.map(k=>x[k]??0);
      require(out.every((n,i)=>Number.isSafeInteger(n)&&n>=0&&n<=roleLimits[roles[i]]),"invalid exact role count");
      return out;
    };
    const shift=(a,k,n)=>a.map((x,i)=>i===ix(k)?x+n:x);
    const h0=vec(context.handCounts),d0=vec(context.deckCounts);
    const discard0={lillie:context.refreshDiscard?.lillie??0,iono:context.refreshDiscard?.iono??0};
    const checkCount=(x,max)=>Number.isSafeInteger(x)&&x>=0&&x<=max;
    require(checkCount(discard0.lillie,2)&&checkCount(discard0.iono,1),"invalid refresh discard counts");
    require(sum(h0)+sum(d0)<=60&&sum(d0)===input.deckCount&&h0[idx("P")]===input.handPsychic&&
      d0[idx("P")]===(input.knownDeckPsychic??0)&&(!d0[idx("P")]||input.knownDeckPsychicCertified===true),
      "inconsistent exact hand/deck");
    for(let i=0;i<h0.length;i++){
      const k=roles[i];
      const disc=k==='P'?(input.discardPsychic??0):
        k==='acerola'?+!!input.acerolaDiscard:k==='guzma'?+!!input.guzmaDiscard:
        k==='ranger'?+!!input.rangerDiscard:k.startsWith('pk:')?(dev?.discardPokemon?.[k.slice(3)]??0):tutorExtras.includes(k)?(tutor.discardExtra?.[k]??0):(discard0[k]??0);
      const attached=k==='P'?input.board.reduce((a,x)=>a+x.energy,0):
        k==='hood'?input.board.filter(x=>x.tool==='hood').length:
        k==='float'?input.board.filter(x=>x.tool==='float').length:k==='valley'?+!!input.dimensionValley:
        k.startsWith('pk:')?input.board.reduce((n,x)=>n+(x.stackPrintings??[]).filter(p=>p===k.slice(3)).length,0):
        k==='forest'?input.board.filter(x=>x.tool==='other'&&x.toolPrinting===tutor?.rolePrintings?.forest).length:0;
      require(h0[i]+d0[i]+disc+attached<=roleLimits[k],"role copy conservation "+k);
    }
    const expected=applyRoles(input,h0,d0,false);
    for(const k of ["acerolaHeld","guzmaHeld","rangerHeld","vsSeekerCount","fogCount","nightStretcherCount",
      ...(input.dynamicEffects?["hoodCount","floatStoneCount","fieldBlowerCount","valleyHeld"]:[])])
      require((input[k]??(typeof expected[k]==="boolean"?false:0))===expected[k],"held role mismatch "+k);
    if(!input.dynamicEffects)require(['hood','float','blower','valley'].every(k=>h0[idx(k)]===0&&d0[idx(k)]===0),
      "unmodeled Tool/Stadium roles must be Other");
    require(["lillie","iono","stamp"].every(k=>typeof context.refreshLegal?.[k]==="boolean"),
      "refresh permission certificate required");
    const limits={nodes:options.maxNodes??3000,depth:options.maxChanceDepth??6,states:options.maxStatesPerDeterministic??3000,
      routes:options.maxChanceRoutesPerNode??300,outcomes:options.maxOutcomesPerChance??1000};
    require(Object.entries(limits).every(([k,x])=>checkCount(x,k==="depth"?10:100000)&&
      (k==="depth"||x>0)),"invalid adaptive limits");
    const firstAllowed=options.firstActionAllowed??(()=>true);
    const zero=()=>Array(roles.length).fill(0);
    const totalBlocks=blocks=>blocks.reduce((a,b)=>add(a,b.counts),zero());
    const compact=blocks=>blocks.filter(b=>sum(b.counts)>0);
    const shuffled=counts=>compact([{counts,exchangeable:true}]);
    let blocks0=compact([{counts:d0,exchangeable:context.oldDeckExchangeable===true}]);
    if(context.deckBlocks!==undefined){
      require(context.deckBlocksActorCertified===true&&Array.isArray(context.deckBlocks)&&
        context.deckBlocks.every(b=>typeof b.exchangeable==="boolean"),"uncertified deck segment representation");
      blocks0=compact(context.deckBlocks.map(b=>({counts:vec(b.counts),exchangeable:b.exchangeable})));
      require(totalBlocks(blocks0).every((n,i)=>n===d0[i]),"deck blocks do not match K1 membership");
    }
    // Full preceding blocks are observed in their entirety. At most one
    // partial exchangeable block has a hypergeometric branch.
    function drawSpec(blocks,n){
      let fixed=zero(),i=0,left=Math.min(n,sum(totalBlocks(blocks)));
      while(i<blocks.length&&left>=sum(blocks[i].counts)){
        fixed=add(fixed,blocks[i].counts);left-=sum(blocks[i].counts);i++;
      }
      if(left===0)return {fixed,pool:zero(),drawN:0,tail:blocks.slice(i),denom:1n};
      const b=blocks[i];
      if(!b.exchangeable)return null;
      return {fixed,pool:b.counts,drawN:left,tail:blocks.slice(i+1),denom:chooseBig(sum(b.counts),left)};
    }
    const stats={nodes:0,memoHits:0,terminalCalls:0,prefixStates:0,chanceRoutes:0,chanceOutcomes:0,
      cappedNodes:0,cappedDepth:0,cappedPrefixes:0,cappedRoutes:0,cappedOutcomes:0,unexchangeable:0,unknownReturns:0};
    const memo=new Map();
    const unknown=(reason)=>({lo:0,hi:1,reason,path:null});
    // Convert deterministic prefix snapshot to the full hand and deck blocks.
    // The deterministic helper never uses refresh cards and never resolves
    // a random draw in this prefix mode.
    function recoverPrefix(base,h,blocks,snap,path,developmentState=null){
      let hand=h.slice();
      const roleFields={P:'handPsychic',fog:'fogCount',stretcher:'nightStretcherCount',vs:'vsSeekerCount',
        acerola:'acerolaHeld',guzma:'guzmaHeld',ranger:'rangerHeld',
        ...(base.dynamicEffects?{hood:'hoodCount',float:'floatStoneCount',blower:'fieldBlowerCount',valley:'valleyHeld'}:{})};
      for(const [role,field] of Object.entries(roleFields))hand[idx(role)]=Number(snap[field]??0);
      if(dev){
        if(!developmentState)return null;
        for(const k of pokemonRoles)hand[ix(k)]=developmentState.hand[k.slice(3)]??0;
        for(const k of fodderRoles)hand[ix(k)]=developmentState.fodder.filter(p=>p===k.slice(3)).length;
        hand[ix("treasure")]=developmentState.treasure;
        hand[ix("quick")]=developmentState.quick;
        if(tutor)for(const k of tutorExtras)hand[ix(k)]=developmentState.extra[k]??0;
        hand[idx("other")]+=developmentState.otherReturned??0;
      }
      if(!dev)for(const a of path)if(a.kind==='acerola'){
        const row=base.board.find(x=>x.id===a.target);
        // Exact actor projection must supply returned evolution stack size;
        // the candidate's attached P and modeled Tools are already tracked.
        if(base.dynamicEffects){
          if(!checkCount(row?.stackCount,3)||row.stackCount<1)return null;
          const removed=path.slice(0,path.indexOf(a)).some(x=>x.kind==='field-blower'&&
            x.targetSeat==='actor'&&x.target===a.target);
          hand[idx('other')]+=row.stackCount+(row.tool==='other'&&!removed?1:0);
        }else{
          if(!checkCount(row?.returnedOtherCount,10)||row.returnedOtherCount<1)return null;
          hand[idx('other')]+=row.returnedOtherCount;
        }
      }
      let outBlocks=blocks;
      const searches=[];
      const roleOfPrinting=p=>{
        if(dev?.catalog?.[p])return "pk:"+p;
        const match=Object.entries(tutor?.rolePrintings??{}).find(([k,x])=>x===p);
        return match?.[0]??null;
      };
      for(const a of path){
        if(["fog-crystal","mysterious-treasure","quick-ball"].includes(a.kind))
          searches.push(a.targetPrinting?roleOfPrinting(a.targetPrinting):"P");
        else if(["arven","teammates","raihan"].includes(a.kind))for(const p of a.targets??[])searches.push(roleOfPrinting(p));
        else if(a.kind==="star-alchemy")searches.push(roleOfPrinting(a.targetPrinting));
        else if(a.kind==="bench-pokemon"&&a.wonderTagTarget)searches.push(roleOfPrinting(a.wonderTagTarget));
      }
      if(searches.length){
        let total=totalBlocks(blocks);
        for(const role of searches){
          if(ix(role)<0||total[ix(role)]<1)return null;
          total=shift(total,role,-1);
        }
        outBlocks=shuffled(total);
      }
      return {h:hand,blocks:outBlocks,devDiscard:developmentState?.discard??null,
        tutorState:tutor?{discardExtra:developmentState.extraDiscard,starUsed:developmentState.starUsed}:null};
    }
    function stateKey(base,h,blocks,disc,oppPositive,depth,devDiscard,tutorState){
      return JSON.stringify([base,h,blocks,disc,oppPositive,depth,devDiscard,tutorState]);
    }
    function solve(base,h,blocks,disc,oppPositive,depth,isRoot=false,devDiscard=null,tutorState=null){
      const exactDeck=totalBlocks(blocks);
      base=applyRoles(base,h,exactDeck,false);
      const key=stateKey(base,h,blocks,disc,oppPositive,depth,devDiscard,tutorState);
      if(!isRoot&&memo.has(key)){stats.memoHits++;return memo.get(key);}
      if(stats.nodes>=limits.nodes){stats.cappedNodes++;return unknown("node budget");}
      stats.nodes++;
      const allowed=isRoot?firstAllowed:()=>true;
      stats.terminalCalls++;
      const direct=terminal(base,limits.states,allowed,{witnessOnly:true});
      if(direct.decision){
        const result={lo:1,hi:1,path:direct.decision.plan.actions,certain:true};
        if(!isRoot)memo.set(key,result);
        return result;
      }
      const candidates=new Map();
      let omitted=false,unknownGeometry=false;
      function addCandidate(c){
        if(!c.path.length)return;
        const k=JSON.stringify([c.kind,c.input,c.h,c.blocks,c.disc,c.oppPositive,c.drawCount,c.devDiscard,c.tutorState]);
        const old=candidates.get(k);
        if(old){
          if(c.path.length<old.path.length)candidates.set(k,c);
          return;
        }
        if(candidates.size>=limits.routes){omitted=true;return;}
        candidates.set(k,c);
      }
      function generateRefresh(snap,path,developmentState=null){
        const resources=recoverPrefix(base,h,blocks,snap,path,developmentState);
        if(!resources){unknownGeometry=true;return;}
        for(const kind of ['lillie','iono','stamp']){
          if(!context.refreshLegal[kind]||
            (kind==='stamp'?!(snap.itemPlayAllowed&&context.ownPokemonKOdLastOpponentTurn===true):!snap.supportAvailable))
            continue;
          let hand=resources.h.slice(),route=path.slice(),discard={...disc};
          if(!hand[idx(kind)]){
            if(kind==='stamp'||!snap.itemPlayAllowed||!hand[idx('vs')]||!discard[kind])continue;
            const vs={kind:'vs-seeker',target:kind==='lillie'?"Lillie's Determination":"Iono"};
            if(!route.length&&!allowed(vs))continue;
            route.push(vs);hand=change(change(hand,'vs',-1),kind,1);discard[kind]--;
          }
          const refresh={kind:'refresh',card:kind==='lillie'?"Lillie's Determination":kind==='iono'?'Iono':'Unfair Stamp'};
          if(!route.length&&!allowed(refresh))continue;
          route.push(refresh);hand=change(hand,kind,-1);
          // Iono draws only if at least one player put cards on bottom.
          if(kind==='iono'&&!sum(hand)&&oppPositive!==true){
            if(oppPositive===null)unknownGeometry=true;
            continue;
          }
          const nextBlocks=kind==='iono'?compact([...resources.blocks,{counts:hand,exchangeable:true}]):
            shuffled(add(totalBlocks(resources.blocks),hand));
          const desired=kind==='lillie'?(snap.prizesRemaining===6?8:6):kind==='iono'?snap.prizesRemaining:5;
          const count=Math.min(desired,sum(totalBlocks(nextBlocks)));
          if(count===0)continue;
          let nextOppPositive=oppPositive;
          if(kind==='stamp'){
            // The opponent draws 2 from shuffled old hand+deck. Only its
            // public positive-hand fact is used to establish Iono's trigger.
            nextOppPositive=oppPositive===true||context.opponentDeckPositive===true?true:
              oppPositive===false&&context.opponentDeckPositive===false?false:null;
          }
          addCandidate({kind,path:route,input:{...snap,supportAvailable:snap.supportAvailable&&kind==='stamp'},
            h:zero(),blocks:nextBlocks,disc:discard,oppPositive:nextOppPositive,drawCount:count,devDiscard:resources.devDiscard,tutorState:resources.tutorState});
        }
      }
      stats.terminalCalls++;
      const callbacks={stopBeforeChance:true,
        onReachableState:({input:snap,path,developmentState})=>{stats.prefixStates++;generateRefresh(snap,path,developmentState);},
        onChance:({input:snap,path,drawCount,developmentState})=>{
          const resources=recoverPrefix(base,h,blocks,snap,path,developmentState);
          if(!resources){unknownGeometry=true;return;}
          addCandidate({kind:'door',path,input:snap,h:resources.h,blocks:resources.blocks,
            disc,oppPositive,drawCount,devDiscard:resources.devDiscard,tutorState:resources.tutorState});
        }};
      const developmentInput=dev?{...dev,
        handPokemon:Object.fromEntries(pokemonRoles.map(k=>[k.slice(3),h[ix(k)]])),
        knownDeckPokemon:Object.fromEntries(pokemonRoles.map(k=>[k.slice(3),exactDeck[ix(k)]])),
        knownDeckPokemonCertified:true,discardPokemon:devDiscard??{},
        treasureCount:h[ix("treasure")],quickCount:h[ix("quick")],
        fodder:fodderRoles.flatMap(k=>Array(h[ix(k)]).fill(k.slice(3))),
        fodderCertified:true,fodderDisjointFromModeledResources:true,
        ...(tutor?{tutors:{...tutor,knownDeckRoles:Object.fromEntries(Object.keys(tutor.rolePrintings).filter(k=>k!=="P").map(k=>[k,exactDeck[ix(k)]??0])),
          heldExtra:Object.fromEntries(tutorExtras.filter(k=>tutor.rolePrintings[k]).map(k=>[k,h[ix(k)]])),
          discardExtra:tutorState?.discardExtra??{},vstarAvailable:!tutorState?.starUsed}}:{})}:null;
      const prefixes=dev?devProvider(terminal,base,developmentInput,{...options,...callbacks,
        maxDevelopmentNodes:options.maxDevelopmentNodes??100,maxDevelopmentDepth:options.maxDevelopmentDepth??3,
        maxStatesPerNode:limits.states,firstActionAllowed:allowed}):
        terminal(base,limits.states,allowed,callbacks);
      if(prefixes.decision){
        const result={lo:1,hi:1,path:prefixes.decision.plan.actions,certain:true};
        if(!isRoot)memo.set(key,result);
        return result;
      }
      if(!prefixes.completeWithinModel){stats.cappedPrefixes++;omitted=true;if(prefixes.reason)stats.lastPrefixRejection=prefixes.reason;}
      if(unknownGeometry){stats.unknownReturns++;omitted=true;}
      if(candidates.size>=limits.routes&&omitted)stats.cappedRoutes++;
      let best={lo:0,hi:0,path:null},upper=omitted?1:0;
      const rootOptions=[];
      for(const c of candidates.values()){
        stats.chanceRoutes++;
        let lo=0,hi=0,example=null,examined=0;
        const spec=drawSpec(c.blocks,c.drawCount);
        if(!spec){stats.unexchangeable++;hi=1;}
        else if(depth===0){stats.cappedDepth++;hi=1;}
        else{
          let visited=0n;
          for(const {draw,weight} of drawVectors(spec.pool,spec.drawN)){
            if(examined>=limits.outcomes||stats.nodes>=limits.nodes){
              stats.cappedOutcomes++;break;
            }
            examined++;stats.chanceOutcomes++;visited+=weight;
            const observed=add(c.h,add(spec.fixed,draw));
            const remainder=compact([{counts:sub(spec.pool,draw),exchangeable:true},...spec.tail]);
            const child=solve(c.input,observed,remainder,c.disc,c.oppPositive,depth-1,false,c.devDiscard,c.tutorState);
            const p=Number(weight)/Number(spec.denom);
            lo+=p*child.lo;hi+=p*child.hi;
            if(!example&&child.lo>0)example={draw:Object.fromEntries(roles.map((k,i)=>[k,observed[i]])),
              continuation:child.path,conditionalLower:child.lo};
          }
          hi+=Number(spec.denom-visited)/Number(spec.denom);
        }
        lo=Math.max(0,Math.min(1,lo));hi=Math.max(lo,Math.min(1,hi));
        upper=Math.max(upper,hi);
        const option={kind:c.kind,path:c.path,lo,hi,outcomes:examined,example};
        if(isRoot)rootOptions.push(option);
        if(lo>best.lo+1e-12||(Math.abs(lo-best.lo)<=1e-12&&lo>0&&(!best.path||c.path.length<best.path.length)))
          best=option;
        // A witnessed probability-one route is globally optimal for this
        // objective, so remaining branches cannot improve it.
        if(best.lo>=1-1e-12){best.lo=1;upper=1;break;}
      }
      const result={...best,hi:Math.max(best.lo,upper),...(isRoot?{rootOptions}:{}),certain:best.lo===1};
      if(!isRoot)memo.set(key,result);
      return result;
    }
    const oppPositive=typeof context.opponentHandPositive==="boolean"?context.opponentHandPositive:null;
    const result=solve(input,h0,blocks0,discard0,oppPositive,limits.depth,true,dev?.discardPokemon??null,tutor?{discardExtra:tutor.discardExtra??{},starUsed:!tutor.vstarAvailable}:null);
    return {advisory:true,decision:result.lo>0&&result.path?.length?{kind:result.certain?'adaptive-certain-witness':'adaptive-terminal-choice',
      firstAction:result.path[0],prefix:result.path,nextChance:result.kind??null,example:result.example??null}:null,
      lowerBound:result.lo,upperBound:result.hi,exactWithinRestrictedModel:Math.abs(result.lo-result.hi)<1e-12,
      rootOptions:result.rootOptions??[],stats,
      boundary:"Maximize probability of a current-turn terminal within modeled deterministic actions and observed Door/Lillie/Iono/Stamp draws; replan after actual observations. Exact actor-known multiset and exchangeable segments only. Bounds explicitly include unmodeled/capped chance branches within this search, not all legal Pokémon TCG actions. No opponent response, hidden order, future-turn utility, or qualified match performance."};
  }catch(e){return reject(String(e.message??e));}
}
function adaptiveSelfTest(terminal){
  const assert=(c,m)=>{if(!c)throw Error(m)};
  const v=(id,e,door=false)=>({id,energy:e,damage:0,psychic:true,vmax:true,doorAvailable:door,retreatCost:2,
    canAttack:true,canRetreat:false,returnedOtherCount:1});
  const f=(board,h,d,extra={})=>({stablePublicEffects:true,noUnmodeledTerminalEffects:true,board,active:0,
    handPsychic:h.P??0,knownDeckPsychic:d.P??0,knownDeckPsychicCertified:true,deckCount:Object.values(d).reduce((a,x)=>a+x,0),
    manualAvailable:true,retreatAvailable:true,supportAvailable:true,acerolaHeld:!!h.acerola,guzmaHeld:!!h.guzma,rangerHeld:!!h.ranger,
    fogCount:h.fog??0,vsSeekerCount:h.vs??0,nightStretcherCount:h.stretcher??0,manualAttachmentAllowed:true,dimensionValley:false,
    itemPlayAllowed:true,prizesRemaining:2,target:{remainingHP:190,prizesOnKO:2,opponentBoardCount:2,weaknessMultiplier:1,
    resistance:0,damageReduction:0},...extra});
  const c=(h,d,extra={})=>({exactMembershipKnown:true,rolesAreExact:true,handCounts:h,deckCounts:d,oldDeckExchangeable:true,
    refreshLegal:{lillie:true,iono:true,stamp:true},...extra});
  const results=[];
  function check(name,r,p,firstKind){
    assert(Math.abs(r.lowerBound-p)<1e-10&&Math.abs(r.upperBound-p)<1e-10&&r.exactWithinRestrictedModel,
      name+" probability mismatch "+JSON.stringify(r));
    if(firstKind)assert(r.decision?.firstAction.kind===firstKind,name+" first action mismatch "+JSON.stringify(r));
    results.push({name,p:r.lowerBound,action:r.decision?.firstAction??null,stats:r.stats});
  }
  let h={P:1},d={P:1,other:4},input=f([v("a",3),v("b",1,true)],h,d);
  let r=adaptiveTerminal(terminal,input,c(h,d));
  check("Door before manual creates a 2/5 winning draw",r,0.4,"underworld-door");
  check("manual-first root cannot use the unseen Psychic",adaptiveTerminal(terminal,input,c(h,d),{firstActionAllowed:a=>a.kind==="manual-attach"}),0);
  r=adaptiveTerminal(terminal,input,c(h,d,{oldDeckExchangeable:false}));
  assert(r.lowerBound===0&&r.upperBound===1&&r.stats.unexchangeable>0,"unseen order must not be invented");
  results.push({name:"unknown deck order stays interval",lo:r.lowerBound,hi:r.upperBound});
  check("actor-certified known bottom segment is not shuffled into Door draw",
    adaptiveTerminal(terminal,input,c(h,d,{deckBlocksActorCertified:true,deckBlocks:[
      {counts:{other:4},exchangeable:true},{counts:{P:1},exchangeable:true}]})),0);
  check("draw crossing into known bottom segment",
    adaptiveTerminal(terminal,input,c(h,d,{deckBlocksActorCertified:true,deckBlocks:[
      {counts:{other:1},exchangeable:false},{counts:{P:1,other:3},exchangeable:true}]})),0.25,"underworld-door");
  h={P:1,lillie:1};d={P:3,other:17};input=f([v("a",3),v("b",1,true)],h,d);
  const fixed=exactRefreshTerminal(terminal,input,c(h,d));
  r=adaptiveTerminal(terminal,input,c(h,d));
  assert(r.lowerBound>fixed.decision.route.lowerBound&&r.exactWithinRestrictedModel,
    "adaptive Door/refresh must improve fixed prebank "+JSON.stringify({r,fixed:fixed.decision}));
  results.push({name:"Door and Lillie adaptive improvement",p:r.lowerBound,fixed:fixed.decision.route.lowerBound,
    action:r.decision.firstAction,stats:r.stats});
  h={stamp:1};d={P:2,lillie:1,other:7};input=f([v("a",3),v("b",1,true)],h,d);
  const ctx=c(h,d,{ownPokemonKOdLastOpponentTurn:true,opponentHandPositive:true});
  const one=exactRefreshTerminal(terminal,input,ctx);
  r=adaptiveTerminal(terminal,input,ctx);
  assert(r.lowerBound>one.decision.route.lowerBound&&r.exactWithinRestrictedModel&&r.decision.firstAction.card==="Unfair Stamp",
    "Stamp then observed Supporter/Doors should improve "+JSON.stringify({r,one:one.decision}));
  results.push({name:"Stamp preserves adaptive Lillie and Door",p:r.lowerBound,oneRefresh:one.decision.route.lowerBound,stats:r.stats});
  r=adaptiveTerminal(terminal,input,ctx,{maxNodes:1});
  assert(r.lowerBound===0&&r.upperBound===1&&!r.exactWithinRestrictedModel,"node cap must keep unresolved mass");
  h={P:1};d={other:4};input=f([v("a",3),v("b",2)],h,d);
  check("certain manual win bypasses chance enumeration",adaptiveTerminal(terminal,input,c(h,d)),1,"manual-attach");
  h={iono:1,P:1};d={P:1,other:2};input=f([v("a",3),v("b",1,true)],h,d);
  r=adaptiveTerminal(terminal,input,c(h,d,{opponentHandPositive:true}),{firstActionAllowed:a=>a.kind==="refresh"&&a.card==="Iono"});
  // Iono draws 2 of the 3 old cards: if P is among them (2/3), Door
  // attaches it then draws remaining old card and bottomed held P.
  check("Iono bottomed Psychic can be drawn by later Door",r,2/3,"refresh");
  return results;
}

function adaptiveDevelopmentSelfTest(terminal,developmentTerminal){
 const assert=(c,m)=>{if(!c)throw Error(m)};
 const V="Shadow Rider Calyrex V CRE",M="Shadow Rider Calyrex VMAX CRE",C="Lillie's Clefairy ex JTG";
 const c=(printing,kind,basic,retreatCost)=>({printing,kind,basic,retreatCost,ruleBox:true,psychic:true,dragon:false,future:false,
  canAttack:true,canRetreat:true,onPlayChoiceRequired:false,hasAbility:kind!=="v",copyLimit:kind==="clefairy"?1:4,entryCertified:true});
 const catalog={[V]:c(V,"v",true,2),[M]:c(M,"vmax",false,2),[C]:c(C,"clefairy",true,1)};
 const row=(id,p,n,eligible=false)=>({id,printing:p,kind:catalog[p].kind,energy:n,damage:0,psychic:true,vmax:p===M,
  doorAvailable:false,retreatCost:2,canAttack:true,canRetreat:false,wobbuffet:false,latias:false,fairyZone:p===C,basic:p!==M,
  ruleBox:true,future:false,tool:"none",stackCount:1,stackPrintings:[p],evolutionEligible:eligible});
 const opp=(id,hp,dragon=false)=>({id,remainingHP:hp,damage:0,energyUnits:0,ultraBeast:false,prizesOnKO:2,counterPrizesOnKO:2,
  opponentBoardCount:2,weaknessMultiplier:1,resistance:0,damageReduction:0,damageReductionAllKindsCertified:true,
  counterBlockedActive:false,counterBlockedBench:false,thorns:false,dragon,hood:false});
 const input=(board,hp,n,p=0,kp=0,dragon=false)=>({stablePublicEffects:true,noUnmodeledTerminalEffects:true,
  attackModel:"candidate-printed-v1",dynamicEffects:{kind:"thorns-wobbuffet-v1",otherEffectsStable:true,toolsEffective:true},
  board,active:0,opponents:[opp("oa",hp,dragon),opp("ob0",320)],activeOpponent:0,handPsychic:p,deckCount:n,
  knownDeckPsychic:kp,knownDeckPsychicCertified:true,prizesRemaining:2,manualAvailable:true,retreatAvailable:false,
  supportAvailable:true,manualAttachmentAllowed:true,itemPlayAllowed:true,acerolaHeld:false,dimensionValley:false});
 const dev={permissionsCertified:true,noBenchCapacityChange:true,maxBench:5,catalog,fodderPrintings:[],discardPokemon:{},
  pokemonPlayAllowed:true,abilityPokemonPlayAllowed:true,evolutionAllowed:true};
 const ctx=(h,deck)=>({exactMembershipKnown:true,rolesAreExact:true,handCounts:h,deckCounts:deck,oldDeckExchangeable:true,
  refreshLegal:{lillie:true,iono:true,stamp:true},development:dev});
 const opt={developmentTerminal,maxNodes:10000,maxDevelopmentNodes:100,maxDevelopmentDepth:4,maxChanceDepth:4};
 const cases=[];
 function run(name,x,ct,p,kind,extra={}){
  const z=adaptiveTerminal(terminal,x,ct,{...opt,...extra});
  assert(Math.abs(z.lowerBound-p)<1e-12&&Math.abs(z.upperBound-p)<1e-12,name+" wrong probability: "+JSON.stringify(z));
  assert((z.decision?.firstAction.kind??null)===kind,name+" wrong action");
  cases.push({name,probability:p,action:z.decision?.firstAction??null,rootOptions:z.rootOptions,stats:z.stats});return z;
 }
 const x=input([row("a",V,3,true),row("b",M,3)],190,10);
 run("draw VMAX, evolve into lethal",x,ctx({lillie:1},{["pk:"+M]:1,other:9}),.6,"refresh");
 run("same VMAX ineligible until next turn",{...x,board:[row("a",V,3,false),row("b",M,3)]},
  ctx({lillie:1},{["pk:"+M]:1,other:9}),0,null);
 const y=input([row("a",M,3),row("b",V,1,true)],190,5,1,1);
 run("evolve a fresh Door before chance",y,ctx({P:1,["pk:"+M]:1},{P:1,other:4}),.4,"evolve-pokemon");
 run("no native evolution root",y,ctx({P:1,["pk:"+M]:1},{P:1,other:4}),0,null,{firstActionAllowed:a=>a.kind!=="evolve-pokemon"});
 const z={...input([row("a",M,3),row("b",V,1)],320,10,0,1,true),fogCount:1};
 const a=run("bank either Energy or Clefairy before Lillie",z,ctx({fog:1,lillie:1},{["pk:"+C]:1,P:1,other:8}),2/3,"fog-crystal");
 assert(a.rootOptions.some(o=>o.path[0].kind==="refresh"&&Math.abs(o.lo-266/462)<1e-12),"immediate Lillie alternative wrong");
 const tutorSpec={certified:true,knownDeckRolesCertified:true,rolePrintings:{P:"Psychic Energy SVE",teammates:"Teammates PRC",forest:"Forest Seal Stone SIT"},
   heldExtra:{},knownDeckRoles:{},discardExtra:{},priorKO:true,starAlchemyAllowed:true,vstarAvailable:true};
 const tc=(h,d)=>({...ctx(h,d),ownPokemonKOdLastOpponentTurn:true,development:{...dev,tutors:tutorSpec}});
 const tx=input([row("a",V,2,true),row("b",M,3)],190,10,0,1);
 run("Stamp preserves drawn Teammates for both missing channels",tx,tc({stamp:1},{teammates:1,["pk:"+M]:1,P:1,other:7}),.5+35/252,"refresh");
 run("Lillie consumes the drawn Teammates Supporter action",tx,tc({lillie:1},{teammates:1,["pk:"+M]:1,P:1,other:7}),70/210,"refresh");
 run("Lillie draws either evolution or Forest Seal Stone",{...x,toolPlayAllowed:true},tc({lillie:1},{forest:1,["pk:"+M]:1,other:8}),1-28/210,"refresh");
 const k=adaptiveTerminal(terminal,z,{...ctx({fog:1,lillie:1},{["pk:"+C]:1,P:1,other:8}),exactMembershipKnown:false},opt);
 assert(k.decision===null,"K0 fabricated exact deck");
 return cases;
}

module.exports={exactRefreshTerminal,refreshSelfTest,drawVectors,chooseBig,adaptiveTerminal,adaptiveSelfTest,adaptiveDevelopmentSelfTest};
if(require.main===module){
  const {acerolaMaxGeist}=require("./acerola-max-geist-advisory.cjs");
  const {developmentTerminal}=require("./development-terminal-advisory.cjs");
  console.log(JSON.stringify({refresh:refreshSelfTest(acerolaMaxGeist),adaptive:adaptiveSelfTest(acerolaMaxGeist),development:adaptiveDevelopmentSelfTest(acerolaMaxGeist,developmentTerminal)},null,2));
}
