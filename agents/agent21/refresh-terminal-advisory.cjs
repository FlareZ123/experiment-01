"use strict";

// Detached actor-visible, exact K1 role-multiset refresh planner.
// The terminal helper is injected so this can be bundled into a pure worker;
// no Store, hidden order, opponent hand, native dispatch, or engine imports.
const REFRESH_ROLES=["P","fog","stretcher","vs","acerola","guzma","ranger","lillie","iono","stamp","other"];
const ROLE_LIMITS={P:11,fog:4,stretcher:1,vs:2,acerola:1,guzma:1,ranger:1,lillie:2,iono:1,stamp:1,other:60};
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
      const attached=k==="P"?input.board.reduce((a,x)=>a+x.energy,0):0;
      require(h[i]+d[i]+discarded+attached<=ROLE_LIMITS[k],"role copy conservation: "+k);
    }
    require(input.acerolaHeld===(h[idx("acerola")]>0)&&
      !!input.guzmaHeld===(h[idx("guzma")]>0)&&!!input.rangerHeld===(h[idx("ranger")]>0)&&
      (input.vsSeekerCount??0)===h[idx("vs")]&&(input.fogCount??0)===h[idx("fog")]&&
      (input.nightStretcherCount??0)===h[idx("stretcher")],"terminal hand roles inconsistent");
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
  return results;
}
module.exports={exactRefreshTerminal,refreshSelfTest,drawVectors,chooseBig};
if(require.main===module){
  const {acerolaMaxGeist}=require("./acerola-max-geist-advisory.cjs");
  console.log(JSON.stringify(refreshSelfTest(acerolaMaxGeist),null,2));
}
