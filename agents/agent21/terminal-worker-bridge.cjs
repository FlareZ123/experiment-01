"use strict";

// Advisory only. A caller must supply actor-visible residual effect certificates.
// The bridge deliberately does not derive hidden state or certify unknown card effects.
const OWN={
 "Shadow Rider Calyrex V CRE":"v","Shadow Rider Calyrex VMAX CRE":"vmax",
 "Wobbuffet PHF":"wob","Lillie's Clefairy ex JTG":"clefairy","Tapu Lele-GX GRI":"lele",
 "Trevenant & Dusknoir-GX SMP":"trev","Latias ex SSP":"latias","Dialga-GX UPR":"dialga",
 "Mimikyu GRI":"mimikyu","Girafarig LOT":"girafarig","Marshadow UNB":"marshadow","Radiant Eternatus CRZ":"radiant"
};
const ROLES={"Acerola":"acerola","Guzma":"guzma","Pokémon Ranger":"ranger","VS Seeker":"vs",
 "Night Stretcher":"stretcher","Fog Crystal":"fog","Lillie's Determination":"lillie","Iono":"iono",
 "Unfair Stamp":"stamp","Stealthy Hood":"hood","Float Stone":"float","Field Blower":"blower","Dimension Valley":"valley"};
const count=(xs,p)=>xs.filter(p).length;
const isInt=(x,min,max)=>Number.isSafeInteger(x)&&x>=min&&x<=max;
const check=(ok,msg)=>{if(!ok)throw Error(msg)};
const eq=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const fail=reason=>({advisory:true,decision:null,reason});
const records=(side,owner)=>[
 {id:owner?"a":"oa",owner,zone:"active",index:0,p:side.active},
 ...side.bench.flatMap((p,i)=>p?[{id:(owner?"b":"ob")+i,owner,zone:"bench",index:i,p}]:[])
];
function projectTerminalInput(request,profile,certificate){
  try{
    const v=request.observation,e=request.publicEventReceipt,turn=v.globalTurn,
      own=v.ownPublic,opp=v.opponentPublic,r=v.ownTurnResources;
    check(request.schema==="aichi-policy-request-v2"&&request.observationSchema==="aichi-actor-observation-v4-ability-lock-order"&&
      request.prompt==null&&v.decisionKind==="owner-root"&&request.seat===v.actorSeat&&v.turnSeat===v.actorSeat&&turn>1,"actor root required");
    check(e?.version==="agent8-public-event-receipt-v3-turn-stamped"&&e.actorSeat===v.actorSeat&&e.turn===turn,"fresh actor receipt required");
    check(certificate?.stablePublicEffects===true&&certificate.noUnmodeledTerminalEffects===true&&
      certificate.actorSeat===v.actorSeat&&certificate.turn===turn,"current public effect envelope required");
    check(certificate.dynamic===true&&certificate.otherEffectsStable===true&&certificate.toolsEffective===true,
      "only named dynamic model supported");
    check(Array.isArray(profile?.basicPsychicPrintings)&&profile.basicPsychicPrintings.length>0&&
      profile.trainerPrintings&&Object.keys(ROLES).every(n=>Array.isArray(profile.trainerPrintings[n])),"profile printing map missing");
    const cat=profile.trainerPrintings,isP=x=>profile.basicPsychicPrintings.includes(x),
      isT=(p,n)=>cat[n]?.includes(p)===true;
    const exactRole=p=>{
      if(isP(p))return "P";
      const roles=Object.entries(ROLES).filter(([n])=>isT(p,n));
      check(roles.length<=1,"ambiguous role map");
      return roles[0]?.[1]??"other";
    };
    const roleCount=xs=>{
      const out={};
      for(const p of xs){check(typeof p==="string"&&p.length,"invalid printing");const k=exactRole(p);out[k]=(out[k]??0)+1}
      return out;
    };
    const slots={},board=[],opponents=[],hand=v.ownHand,discard=own.discard,counts=roleCount(hand),
      dc=roleCount(discard);
    const all=[...records(own,true),...records(opp,false)];
    const targetCert=certificate.targets??{}, ownCert=certificate.ownSlots??{};
    for(const loc of all){
      const {id,p,owner,zone,index}=loc;
      check(p&&!p.concealed&&typeof p.printing==="string"&&isInt(p.damage,0,1000)&&Array.isArray(p.energies)&&
        Array.isArray(p.tools)&&p.tools.length<=1,"unsupported visible slot "+id);
      check(Array.isArray(p.specialConditions)&&p.specialConditions.length===0,"special conditions unsupported: "+id);
      slots[id]={owner,zone,index,printing:p.printing,energies:[...p.energies],tools:[...p.tools],damage:p.damage,
        stack:[...(p.evolutionPrintings??[])],lastPlayedOrEvolvedTurn:p.lastPlayedOrEvolvedTurn??null};
      if(owner){
        const k=OWN[p.printing],c=ownCert[id],rec=zone==="active"?e.ownerActive:e.ownerBench?.[index];
        check(k&&c?.printing===p.printing&&c.attackPermissionCertified===true&&c.retreatPermissionCertified===true&&
          typeof c.canAttack==="boolean"&&typeof c.canRetreat==="boolean"&&isInt(c.retreatCost,0,11),
          "unmodeled own slot or permission: "+id);
        check(p.energies.every(isP),"non-basic-Psychic own Energy");
        check(Array.isArray(p.evolutionPrintings)&&p.evolutionPrintings.length>=1,"unknown stack size");
        const rr=p.publicRestrictions??{};
        check(!c.canAttack||(!rr.cannotAttackNextTurn&&!(rr.cannotUseAttacksNextTurn?.length)&&!rr.blockedAttackNameNextTurn&&
          !rr.blockedAttackNameUntilLeavesActive&&!rr.onlyAllowedAttackNameNextTurn&&!rr.attackCostIncreaseNextTurn&&!rr.attackCostIncreaseWhileActive),
          "contradictory attack restriction");
        check(!c.canRetreat||!(rr.cannotRetreat||rr.cannotRetreatNextTurn||rr.cannotRetreatWhileActive),"contradictory retreat restriction");
        const psych=!["dialga","radiant"].includes(k); // All other fixed-list Pokémon are Psychic.
        const marker=rec?.knownAbilityUse?.filter(x=>x.name==="Underworld Door");
        check(k!=="vmax"||(rec?.printing===p.printing&&marker?.length===1&&typeof marker[0].usedThisTurn==="boolean"),"unknown Door use");
        board.push({id,kind:k,energy:p.energies.length,damage:p.damage,psychic:psych,vmax:k==="vmax",
          doorAvailable:k==="vmax"&&!marker[0].usedThisTurn,retreatCost:c.retreatCost,canAttack:c.canAttack,canRetreat:c.canRetreat,
          wobbuffet:k==="wob",latias:k==="latias",fairyZone:k==="clefairy",basic:k!=="vmax",
          ruleBox:["v","vmax","clefairy","lele","trev","latias","dialga","radiant"].includes(k),future:false,
          tool:p.tools.length?(isT(p.tools[0],"Stealthy Hood")?"hood":isT(p.tools[0],"Float Stone")?"float":"other"):"none",
          stackCount:p.evolutionPrintings.length});
      }else{
        const c=targetCert[id];
        check(c?.printing===p.printing&&c.damageAndPrizeGeometryCertified===true&&
          c.remainingHP===p.hp-p.damage&&isInt(c.prizesOnKO,0,6)&&isInt(c.counterPrizesOnKO,0,6)&&
          [1,2].includes(c.weaknessMultiplier)&&isInt(c.resistance,0,1000)&&isInt(c.energyUnits,0,100)&&
          typeof c.ultraBeast==="boolean"&&typeof c.dragon==="boolean"&&typeof c.counterBlockedActive==="boolean"&&
          typeof c.counterBlockedBench==="boolean"&&isInt(c.damageReduction,0,1000)&&
          (c.damageReductionAllKindsCertified===true||c.damageReductionByKind),"target effects not certified: "+id);
        opponents.push({...c,id,damage:p.damage,opponentBoardCount:opp.bench.filter(Boolean).length+1,
          thorns:p.printing.startsWith("Iron Thorns ex ")&&p.abilities?.includes("Initialization"),
          hood:p.tools.some(t=>isT(t,"Stealthy Hood"))});
      }
    }
    check(all.length===board.length+opponents.length&&opponents.length>0,"incomplete board");
    check(["energyPlayedTurn","retreatedTurn","supporterPlayedTurn","stadiumPlayedTurn"].every(k=>Number.isSafeInteger(r[k])),
      "turn resource markers unknown");
    check(["itemPlayLocked","supporterPlayLocked","energyPlayLocked","toolPlayLocked","stadiumPlayLocked"].every(k=>typeof r[k]==="boolean"),
      "turn locks unknown");
    check(["itemPlayAllowed","supportAllowed","manualAttachmentAllowed","toolPlayAllowed","valleyPlayAllowed",
      "dimensionValley","itemPlayAllowedAfterRanger","guzmaWithoutOwnBenchAllowed"].every(k=>typeof certificate[k]==="boolean"),
      "residual permission missing");
    check(!certificate.dimensionValley||[...own.stadium,...opp.stadium].some(x=>isT(x,"Dimension Valley")),"Valley absent");
    let known={},exact=false;
    const k=v.ownerK1;
    if(k?.exactMembershipKnown===true){
      const rows=k.knownPrintings;
      check(Array.isArray(rows)&&rows.every(x=>typeof x.printing==="string"&&isInt(x.copies,1,60))&&
        new Set(rows.map(x=>x.printing)).size===rows.length&&rows.reduce((a,x)=>a+x.copies,0)===own.deckCount,"invalid K1 ledger");
      exact=true;
      known=roleCount(rows.flatMap(x=>Array(x.copies).fill(x.printing)));
    }
    const input={stablePublicEffects:true,noUnmodeledTerminalEffects:true,attackModel:"candidate-printed-v1",
      dynamicEffects:{kind:"thorns-wobbuffet-v1",otherEffectsStable:true,toolsEffective:true},
      board,active:0,opponents,activeOpponent:0,handPsychic:counts.P??0,discardPsychic:dc.P??0,
      deckCount:own.deckCount,knownDeckPsychic:known.P??0,knownDeckPsychicCertified:exact,
      prizesRemaining:own.prizeCount,manualAvailable:r.energyPlayedTurn!==turn,retreatAvailable:r.retreatedTurn!==turn,
      supportAvailable:r.supporterPlayedTurn===0&&!r.supporterPlayLocked&&certificate.supportAllowed,
      manualAttachmentAllowed:!r.energyPlayLocked&&certificate.manualAttachmentAllowed,
      itemPlayAllowed:!r.itemPlayLocked&&certificate.itemPlayAllowed,
      itemPlayAllowedAfterRanger:certificate.itemPlayAllowedAfterRanger,guzmaWithoutOwnBenchAllowed:certificate.guzmaWithoutOwnBenchAllowed,
      toolPlayAllowed:!r.toolPlayLocked&&certificate.toolPlayAllowed,
      valleyPlayAllowed:!r.stadiumPlayLocked&&r.stadiumPlayedTurn!==turn&&certificate.valleyPlayAllowed,
      dimensionValley:certificate.dimensionValley,valleyHeld:!!counts.valley,
      acerolaHeld:!!counts.acerola,guzmaHeld:!!counts.guzma,rangerHeld:!!counts.ranger,
      acerolaDiscard:!!dc.acerola,guzmaDiscard:!!dc.guzma,rangerDiscard:!!dc.ranger,
      vsSeekerCount:counts.vs??0,fogCount:counts.fog??0,nightStretcherCount:counts.stretcher??0,
      hoodCount:counts.hood??0,floatStoneCount:counts.float??0,fieldBlowerCount:counts.blower??0};
    const context={exactMembershipKnown:exact,rolesAreExact:exact,handCounts:counts,deckCounts:known,
      refreshDiscard:{lillie:dc.lillie??0,iono:dc.iono??0},
      oldDeckExchangeable:certificate.oldDeckExchangeable===true,
      refreshLegal:certificate.refreshLegal,ownPokemonKOdLastOpponentTurn:e.priorOpponentTurnKO?.any===true,
      opponentHandPositive:opp.handCount>0,opponentDeckPositive:opp.deckCount>0};
    if(certificate.deckBlocksActorCertified===true){
      context.deckBlocksActorCertified=true;context.deckBlocks=certificate.deckBlocks;
    }
    return {input,context,binding:{basicPsychicPrintings:profile.basicPsychicPrintings,trainerPrintings:cat,slots}};
  }catch(e){return fail(e.message)}
}
// Only the first committed action gets an intent. Replan at every next root.
function chooseTerminalRoot(request,profile,certificate,terminal,matcher,adaptive,options={}){
  const p=projectTerminalInput(request,profile,certificate);
  if(!p.input)return p;
  const m=matcher(request,p.input,p.binding);
  if(!m.match)return m;
  const allowed=a=>!!m.match(a);
  const d=terminal(p.input,options.maxStates??10000,allowed,{witnessOnly:true});
  const search=d.decision?{...d,lowerBound:1,upperBound:1}:
    p.context.exactMembershipKnown&&typeof adaptive==="function"?adaptive(terminal,p.input,p.context,{...options,firstActionAllowed:allowed}):d;
  const action=search.decision?.firstAction,root=action&&m.match(action);
  if(!root)return {...search,decision:null};
  const lower=search.lowerBound??0;
  // Noncertain terminal advice needs explicit caller permission/threshold: this is
  // not a full-game value function and may be inferior to developing the board.
  if(lower<1&&!(typeof options.minimumChance==="number"&&options.minimumChance>0&&lower>=options.minimumChance))
    return {...search,decision:null,reason:"chance threshold not authorized"};
  return {advisory:true,decision:{kind:"select-action",token:root.token},search,
    intent:{schema:"agent21-terminal-intent-v1",actorSeat:request.seat,turn:m.sourceTurn,action,
      rootPrinting:root.actorPrinting,slots:p.binding.slots,profile:p.binding,promptStages:[]}};
}
const sameSlot=(v,loc)=>{
  const p=(loc.owner?v.ownPublic:v.opponentPublic);
  const q=loc.zone==="active"?p.active:p.bench[loc.index];
  return q?.printing===loc.printing&&!q.concealed;
};
const choiceSeat=(c)=>c.publicMetadata?.ownerSeat;
function pokemonChoice(c,v,loc){
  const m=c.publicMetadata;
  return c.kind==="pokemon"&&m?.isOwnerVisible===true&&m.ownerSeat===(loc.owner?"actor":"opponent")&&
    m.targetZone===loc.zone&&(loc.zone==="bench"?m.benchIndex===loc.index:m.slotIndex===0)&&
    c.printing===loc.printing&&sameSlot(v,loc);
}
function continueTerminalPrompt(intent,request){
  try{
    const p=request.prompt,v=request.observation,a=intent.action,s=p.source,
      meta=p.publicMetadata,stages=intent.promptStages,profile=intent.profile;
    check(intent.schema==="agent21-terminal-intent-v1"&&request.schema==="aichi-policy-request-v2"&&
      request.observationSchema==="aichi-actor-observation-v4-ability-lock-order"&&request.seat===intent.actorSeat&&
      v.actorSeat===intent.actorSeat&&v.turnSeat===intent.actorSeat&&v.globalTurn===intent.turn&&
      v.decisionKind==="owner-prompt"&&p.actingSeat===intent.actorSeat&&s.classification==="actor-choice",
      "stale or wrong actor intent");
    check(Array.isArray(p.choices)&&new Set(p.choices.map(x=>x.token)).size===p.choices.length&&
      p.choices.every(x=>typeof x.token==="string"&&x.token.length),"invalid choice tokens");
    const one=(cs)=>{check(cs.length>0,"intended option unavailable");return cs[0]};
    const unique=(cs)=>{check(cs.length===1,"ambiguous or unavailable intended option");return cs[0]};
    const done=(decision,stage)=>({advisory:true,decision,intent:{...intent,promptStages:[...stages,stage]}});
    const stage=(name)=>check(!stages.includes(name),"repeated stage");
    const src=(effect)=>check(s.sourceKind==="card-effect"&&s.sourcePrinting===intent.rootPrinting&&s.effectName===effect,
      "unexpected prompt provenance");
    const combo=(cs,name)=>{
      check(isInt(meta.minimumCount,0,60)&&isInt(meta.maximumCount,0,60)&&cs.length>=meta.minimumCount&&cs.length<=meta.maximumCount&&
        new Set(cs.map(c=>c.token)).size===cs.length&&cs.length>0,"illegal choice cardinality");
      stage(name);return done({kind:"select-choices",tokens:cs.map(c=>c.token)},name);
    };
    const loc=id=>{const q=intent.slots[id];check(q,"intent target missing");return q};
    const selectPokemon=(ids,name)=>{
      check(p.promptType==="ChoosePokemonPrompt"&&meta.selectionType==="pokemon","not a Pokémon choice");
      return combo(ids.map(id=>unique(p.choices.filter(c=>pokemonChoice(c,v,loc(id))))),name);
    };
    const card=(role,zone,name)=>{
      check(p.promptType==="ChooseCardsPrompt"&&meta.selectionType==="card-combination"&&meta.sourceZone===zone&&
        meta.ownerSeat==="actor"&&meta.isOwnerVisible===true,"wrong card collection");
      const printings=role==="P"?profile.basicPsychicPrintings:profile.trainerPrintings[role];
      check(Array.isArray(printings),"unknown card role");
      const candidates=p.choices.filter(c=>c.kind==="card"&&printings.includes(c.printing)&&
        c.publicMetadata?.ownerSeat==="actor"&&c.publicMetadata.sourceZone===zone&&c.publicMetadata.isOwnerVisible===true);
      const selected=one(candidates);
      if(zone==="discard")check(v.ownPublic.discard.includes(selected.printing),"discard target absent");
      return combo([selected],name);
    };
    if(a.kind==="underworld-door"){
      src("Underworld Door");stage("door");
      check(p.promptType==="AttachEnergyPrompt"&&meta.selectionType==="energy-attachment"&&meta.sourceZone==="hand"&&
        meta.ownerSeat==="actor"&&meta.isOwnerVisible===true&&meta.minimumCount===1&&meta.maximumCount===1&&
        meta.energyType==="BASIC"&&meta.zone==="bench","wrong Door prompt");
      const t=loc(a.target);
      check(t.owner&&t.zone==="bench"&&sameSlot(v,t),"Door target moved");
      const c=one(p.choices.filter(c=>c.kind==="energy"&&profile.basicPsychicPrintings.includes(c.printing)&&
        v.ownHand.includes(c.printing)&&c.publicMetadata?.ownerSeat==="actor"&&c.publicMetadata.sourceZone==="hand"&&
        c.publicMetadata.isOwnerVisible===true&&c.publicMetadata.energyType==="BASIC"&&
        c.publicMetadata.zone==="bench"&&c.publicMetadata.benchIndex===t.index));
      return done({kind:"select-choice",token:c.token},"door");
    }
    if(a.kind==="fog-crystal"){src("Fog Crystal");return card("P","deck","fog")}
    if(a.kind==="night-stretcher"){src("Night Stretcher");return card("P","discard","stretcher")}
    if(a.kind==="vs-seeker"){src("VS Seeker");return card(a.target,"discard","vs")}
    if(a.kind==="guzma"){
      src("Guzma");
      return !stages.includes("gust")?selectPokemon([a.opponentTarget],"gust"):
        selectPokemon([a.ownPromotion],"own-promotion");
    }
    if(a.kind==="acerola"){
      src("Acerola");
      if(!stages.includes("bounce"))return selectPokemon([a.target],"bounce");
      check(a.promotion&&v.ownPublic.active==null,"Acerola promotion not pending");
      return selectPokemon([a.promotion],"own-promotion");
    }
    if(a.kind==="attack"&&a.name==="Astral Barrage"){
      src("Astral Barrage");
      return selectPokemon(a.targets,"astral");
    }
    return fail("unmodeled continuation; discard intent and use ordinary policy");
  }catch(e){return fail(e.message)}
}
module.exports={projectTerminalInput,chooseTerminalRoot,continueTerminalPrompt};
