'use strict';
(function rank26(module){
  const VERSION='agent21-rank26-meloetta-opponent-v1';
  const SOURCE_RANK=26, SOURCE_LIST_BLOB_SHA1='ae773f6201d7aa69d31914dbfee66f3fba692200';
  const ENGINE_PIN='a9905a76a6c4103ba4b6cb9a49e86bad795c5c05';
  const PROTOCOL_BLOB='468f957b17656f41cf9af8c77e6954bb79ea5695';
  // Name matching is limited to the exact rank26 roster, including native Koko name aliases.
  const P={M:/^Meloetta ex\b/i,K:/^Tapu Koko (?:[◇♢♦]|Prism Star)(?:\s|$)/i,U:/^Unown\b/i,E:/^Exeggcute\b/i,B:/^Bunnelby\b/i,S:/^Squawkabilly ex\b/i,C:/^Crobat V\b/i,D:/^Dedenne-GX\b/i,L:/^(?:Basic )?Lightning Energy\b/i,DCE:/^Double Colorless Energy\b/i,TM:/^Technical Machine: Crisis Punch\b/i,R:/^Risky Ruins\b/i, QB:/^Quick Ball\b/i,VIP:/^Battle VIP Pass\b/i,BC:/^Battle Compressor\b/i,DP:/^Damage Pump\b/i,MAIL:/^Trainers' Mail\b/i,PAD:/^Order Pad\b/i,HB:/^Hisuian Heavy Ball\b/i,BI:/^Bicycle\b/i,RC:/^Rescue Carrier\b/i,TK:/^Redeemable Ticket\b/i,COL:/^Canceling Cologne\b/i,NAV:/^Stadium Nav\b/i,ROPE:/^Escape Rope\b/i,DM:/^Dowsing Machine\b/i,CC:/^Counter Catcher\b/i,RED:/^Special Red Card\b/i,FSS:/^Forest Seal Stone\b/i,FLOAT:/^Float Stone\b/i,CAR:/^Carmine\b/i,IONO:/^Iono\b/i};
  const BASIC=new Set(['M','K','U','E','B','S','C','D']);
  const ITEM=new Set(['QB','VIP','BC','DP','MAIL','PAD','HB','BI','RC','TK','COL','NAV','ROPE','DM','CC','RED']);
  const EXEC=new Set(['play-card','attack','retreat','use-ability','use-stadium','pass']);
  const arr=x=>Array.isArray(x)?x:[];
  const printing=x=>typeof x==='string'?x:typeof x?.printing==='string'?x.printing:typeof x?.actorPrinting==='string'?x.actorPrinting:'';
  const kind=x=>Object.keys(P).find(k=>P[k].test(printing(x)))||'';
  const meta=x=>x?.publicMetadata??{};
  const has=(a,k)=>arr(a).some(x=>kind(x)===k);
  const n=(a,k)=>arr(a).filter(x=>kind(x)===k).length;
  const slots=p=>[{zone:'active',index:0,p:p?.active},...arr(p?.bench).map((p,index)=>({zone:'bench',index,p}))].filter(x=>x.p&&!x.p.concealed);
  const slot=(p,z,i)=>z==='active'&&i===0?p?.active:z==='bench'&&Number.isSafeInteger(i)?p?.bench?.[i]:null;
  const own=o=>o.ownPublic??{};
  const opp=o=>o.opponentPublic??{};
  const hand=o=>arr(o.ownHand);
  const board=o=>slots(own(o));
  const find=(o,k)=>board(o).find(x=>kind(x.p)===k);
  const countBoard=(o,k)=>board(o).filter(x=>kind(x.p)===k).length;
  const discard=o=>arr(own(o).discard);
  const benchRoom=o=>Math.max(0,5-arr(own(o).bench).filter(Boolean).length);
  const target=(a,o)=>meta(a).targetSeat==='actor'&&meta(a).isOwnerVisible===true?slot(own(o),meta(a).targetZone,meta(a).targetIndex):null;
  const source=(a,o)=>meta(a).sourceSeat==='actor'?slot(own(o),meta(a).sourceZone,meta(a).sourceIndex):null;
  const on=x=>x===true;
  const itemOpen=o=>!on(o.ownTurnResources?.itemPlayLocked)&&!on(own(o).publicTurnRestrictions?.itemPlayLocked);
  const toolLive=o=>Number(own(o).publicTurnRestrictions?.stadiumAndToolHaveNoEffectTurnsRemaining??0)===0&&!slots(own(o)).some(x=>false)&&!([...arr(own(o).stadium),...arr(opp(o).stadium)].some(x=>/^Jamming Tower\b/i.test(printing(x))));
  const stadium=o=>[...arr(own(o).stadium),...arr(opp(o).stadium)];
  const ruins=o=>has(stadium(o),'R')&&Number(own(o).publicTurnRestrictions?.stadiumAndToolHaveNoEffectTurnsRemaining??0)===0;
  const energy=p=>arr(p?.energies).reduce((s,e)=>s+(kind(e)==='DCE'?2:kind(e)==='L'?1:0),0);
  const suppression=(p,name)=>arr(p?.abilitySuppressions).find(x=>x.abilityName===name)?.suppressed;
  const activeOpponentLock=o=>/^(?:Wobbuffet|Galarian Weezing|Iron Thorns ex|Klefki|Flutter Mane)\b/i.test(printing(opp(o).active));
  const goal=o=>find(o,'M')??find(o,'B');
  const readyTarget=o=>board(o).find(x=>['M','B'].includes(kind(x.p))&&has(x.p.tools,'TM')&&energy(x.p)>=3&&toolLive(o));
  const publicRemaining=p=>Number.isFinite(p?.hp)&&Number.isFinite(p?.damage)?p.hp-p.damage:null;
  const chooseAction=token=>({kind:'select-action',token});
  const chooseChoice=token=>({kind:'select-choice',token});
  const chooseChoices=tokens=>({kind:'select-choices',tokens});
  const abstain=reasonCode=>({kind:'abstain',reasonCode});
  const empty=p=>arr(p.choices).find(x=>x.kind==='empty-selection');
  const cancel=p=>arr(p.choices).find(x=>x.kind==='cancel');
  function pick(p,scorer,{want=null,allowEmpty=false}={}){
    const m=meta(p), list=arr(p.choices).filter(x=>!['cancel','empty-selection'].includes(x.kind));
    const min=m.minimumCount??(m.selectionType==='prize-slots'?m.requiredCount:1);
    const max=Math.min(list.length,m.maximumCount??(m.selectionType==='prize-slots'?m.requiredCount:1));
    if(!Number.isSafeInteger(min)||!Number.isSafeInteger(max)||min<0||max<min)return abstain('BAD_CARD_SELECTION_BOUNDS');
    const rows=list.map((c,i)=>({c,i,s:scorer(c)})).filter(x=>Number.isFinite(x.s)&&x.s>0).sort((a,b)=>b.s-a.s||a.i-b.i);
    const take=Math.min(max,want??rows.length);
    const selected=rows.slice(0,take);
    if(selected.length<min)return abstain('NO_LEGAL_CARD_SET');
    if(!selected.length)return allowEmpty&&empty(p)?chooseChoice(empty(p).token):abstain('NO_USEFUL_CARD_CHOICE');
    return chooseChoices(selected.map(x=>x.c.token));
  }
  const visible=(c,z)=>meta(c).ownerSeat==='actor'&&meta(c).isOwnerVisible===true&&meta(c).sourceZone===z&&typeof c.printing==='string';
  const setupPriority={U:100,B:90,E:80,M:70,C:60,D:50,S:40,K:30};
  function setup(p,o){
    const m=meta(p),desc=p.description;
    if(desc==='GO_FIRST'&&m.selectionType==='confirm'){
      const yes=arr(p.choices).filter(c=>c.kind==='confirm'&&c.label==='Yes');
      return yes.length===1?chooseChoice(yes[0].token):abstain('BAD_GO_FIRST_CONFIRM_CHOICES');
    }
    if(desc==='WANT_TO_DRAW_CARDS'&&m.selectionType==='option'){
      const choices=arr(p.choices).map(c=>({c,v:/^Draw (\d+) card\(s\)$/.exec(c.label??'')})).filter(x=>x.c.kind==='option'&&x.v&&Number(x.v[1])===m.count-1-meta(x.c).choiceIndex);
      choices.sort((a,b)=>Number(b.v[1])-Number(a.v[1]));
      return choices.length?chooseChoice(choices[0].c.token):abstain('NO_MULLIGAN_DRAW_OPTION');
    }
    if(desc!=='CHOOSE_STARTING_POKEMONS'||m.selectionType!=='card-combination'||![0,1].includes(m.minimumCount))return abstain('UNSUPPORTED_ENGINE_SETUP_PROMPT');
    const choices=arr(p.choices).filter(c=>c.kind==='card'&&visible(c,'hand')&&BASIC.has(kind(c))).sort((a,b)=>setupPriority[kind(b)]-setupPriority[kind(a)]||meta(a).selectionIndex-meta(b).selectionIndex);
    if(m.minimumCount===1){
      if(!choices.length)return abstain('NO_STARTING_POKEMON_CHOICE');
      const selected=[choices[0]];
      // No entry-trigger support during setup. Only put down a single low-opportunity-cost backup;
      // spare Eggs and Unown are better placed under Ruins during the turn.
      const spare=choices.slice(1).find(c=>['U','B','E','M'].includes(kind(c)));
      if(spare&&m.maximumCount>=2)selected.push(spare);
      return chooseChoices(selected.map(c=>c.token));
    }
    if(!own(o).active)return abstain('MISSING_ACTIVE_FOR_EXTRA_BENCH');
    if(arr(own(o).bench).some(Boolean)||!choices.length||m.maximumCount===0)return empty(p)?chooseChoice(empty(p).token):abstain('NO_EMPTY_BENCH_SELECTION');
    // Avoid a forced singleton when possible; retain Crobat/Dedenne/Squawk triggers if another backup exists.
    return chooseChoices([choices[0].token]);
  }
  function needLightning(o){return !has(discard(o),'L')&&!board(o).some(x=>kind(x.p)==='M'&&has(x.p.energies,'L'));}
  function needEgg(o){return countBoard(o,'E')+n(hand(o),'E')<2;}
  function discardValue(o,k){
    if(k==='E')return 120;
    if(k==='L'&&needLightning(o))return 115;
    if(k==='VIP'&&Number(o.globalTurn)>2)return 105;
    if(k==='R'&&(has(stadium(o),'R')||n(hand(o),'R')>1))return 95;
    if(k==='BC'&&has(discard(o),'L')&&n(hand(o),'BC')>1)return 85;
    if(['CAR','IONO'].includes(k)&&Number(o.ownTurnResources?.supporterPlayedTurn)>0)return 80;
    if(['PAD','MAIL','BI','QB','NAV','RED','CC'].includes(k)&&n(hand(o),k)>1)return 65;
    if(k==='U'&&has(hand(o),'RC')&&n(hand(o),'U')>1)return 55;
    if(k==='TM'&&n(hand(o),'TM')>1)return 45;
    if(k==='L'&&n(hand(o),'L')>1)return 40;
    // Protect singular power/mobility and donation resources. Abstain rather than silently burn them.
    return 0;
  }
  function basicScore(o,k,fromDeckDirect=false){
    if(k==='M'&&!find(o,'M')&&!has(hand(o),'M'))return 300;
    if(k==='K'&&!find(o,'K')&&!has(hand(o),'K')&&!has(own(o).lostZone,'K'))return 260;
    if(k==='E'&&needEgg(o))return 180;
    if(k==='B'&&!find(o,'B')&&!has(hand(o),'B')&&!find(o,'M'))return 140;
    if(k==='U'&&countBoard(o,'U')+n(hand(o),'U')<2)return 100;
    if(!fromDeckDirect&&k==='C'&&!find(o,'C')&&!has(hand(o),'C')&&hand(o).length<=4)return 165;
    if(!fromDeckDirect&&k==='D'&&!find(o,'D')&&!has(hand(o),'D')&&hand(o).length<=3)return 145;
    if(!fromDeckDirect&&k==='S'&&!find(o,'S')&&!has(hand(o),'S')&&Number(o.globalTurn)<=2&&hand(o).length<=3)return 140;
    return 0;
  }
  function trainerScore(o,k){
    if(k==='R'&&!ruins(o))return 260;
    if(k==='TM'&&!board(o).some(x=>has(x.p.tools,'TM'))&&!has(hand(o),'TM'))return 255;
    if(k==='COL'&&activeOpponentLock(o)&&!has(hand(o),'COL'))return 250;
    if(k==='BC'&&needLightning(o))return 240;
    if(k==='QB'&&(!find(o,'M')&&!has(hand(o),'M')||!find(o,'K')&&!has(hand(o),'K')))return 225;
    if(k==='VIP'&&Number(o.globalTurn)<=2&&benchRoom(o)>=1)return 215;
    if(k==='RC'&&(has(discard(o),'E')||has(discard(o),'U')))return 190;
    if(k==='DP'&&n(hand(o),'DP')<3&&opp(o).prizeCount>1)return 180;
    if(k==='ROPE'&&!has(hand(o),'ROPE')&&kind(own(o).active)!=='M')return 175;
    if(k==='FLOAT'&&!has(hand(o),'FLOAT')&&kind(own(o).active)!=='M')return 170;
    if(k==='BI'&&hand(o).length<=4)return 155;
    if(k==='MAIL'||k==='PAD')return 115;
    if(k==='NAV'&&!ruins(o)&&!has(hand(o),'R'))return 110;
    if(k==='CAR'&&hand(o).length<=3)return 100;
    if(k==='IONO'&&hand(o).length<=3&&Number(o.globalTurn)>1)return 95;
    return 0;
  }
  function scoreAttack(a,o){
    const name=a.attackName, m=meta(a), active=own(o).active, rem=publicRemaining(opp(o).active);
    if(m.attackCostPayable!==true)return 0;
    if(name==='Crisis Punch'&&m.attackSource?.sourceKind==='active-tool'&&kind(m.attackSource.sourceCardFullName)==='TM'&&opp(o).prizeCount===1&&has(active?.tools,'TM')&&toolLive(o)){
      // Native legal root establishes attack availability, not effect correctness. Prioritize proven
      // terminal damage where supplied; otherwise the attack is a high-value heuristic, not a proof.
      const dmg=m.damageAfterResistance??m.damageAfterWeakness;
      if(Number.isFinite(dmg)&&Number.isFinite(rem)&&dmg>=rem&&m.hasUnmodeledModifier===false&&m.hasPrevention===false&&slots(opp(o)).length===1)return 100000;
      return 3000;
    }
    if(name==='Echoed Voice'&&kind(active)==='M')return 400;
    if(name==='Hidden Power'&&kind(active)==='U')return rem!==null&&rem<=10?600:45;
    if(name==='Rototiller'&&kind(active)==='B'&&discard(o).some(c=>['DCE','L','TM','DP','RC','R'].includes(kind(c))))return 55;
    if(name==='Burrow'&&kind(active)==='B')return opp(o).deckCount<=2?500:40;
    return 0;
  }
  function scoreRoot(a,o){
    const k=kind(a.actorPrinting), m=meta(a), h=hand(o), active=own(o).active, g=goal(o), room=benchRoom(o);
    if(a.kind==='attack')return scoreAttack(a,o);
    if(a.kind==='use-ability'){
      const ab=m.abilityName, s=source(a,o);
      if(ab==='Dance of the Ancients')return 0; // Current host rejects this AttachEnergyPrompt source.
      if(ab==='Propagation'&&k==='E'&&needEgg(o)&&room>0)return 560;
      if(ab==='Farewell Letter'&&s&&kind(s)==='U'&&m.sourceZone==='bench'&&energy(s)===0&&!arr(s.tools).length&&own(o).deckCount>0&&s.damage===0&&(h.length<=5||room===0))return 350;
      if(ab==='Squawk and Seize'&&s&&kind(s)==='S'&&h.length<=3&&!h.some(x=>['DCE','K','M','TM'].includes(kind(x))))return 350;
      if(ab==='Star Alchemy'&&h.length<=5&&!own(o).publicTurnRestrictions?.vstarUsed&&!o.ownTurnResources?.vstarUsed)return 470;
      return 0;
    }
    if(a.kind==='retreat'){
      const t=target(a,o);
      // With printed Float Stone or zero retreat, move to a truly funded attacker.
      if(t&&kind(t)==='M'&&has(t.tools,'TM')&&energy(t)>=3&&toolLive(o)&&opp(o).prizeCount===1&&
          (has(active?.tools,'FLOAT')||arr(active?.printed?.retreatCost).length===0))return 1800;
      return 0;
    }
    if(a.kind!=='play-card')return 0;
    if(BASIC.has(k)){
      if(room<=0)return 0;
      if(k==='M'&&!find(o,'M'))return 620;
      if(k==='K'&&!find(o,'K')&&!has(own(o).lostZone,'K')&&find(o,'M')&&find(o,'M').zone==='bench'&&has(discard(o),'L'))return 250;
      if(k==='C'&&!find(o,'C')&&h.length<=5&&room>=2)return 530;
      if(k==='D'&&!find(o,'D')&&h.length<=3&&room>=2&&!h.some(x=>['DCE','K','M','TM'].includes(kind(x))))return 520;
      if(k==='S'&&!find(o,'S')&&Number(o.globalTurn)<=2&&h.length<=3&&room>=2)return 420;
      if(k==='E'&&ruins(o)&&countBoard(o,'E')<2&&room>=2)return 190;
      if(k==='U'&&room>=2&&h.length<=5&&(!ruins(o)||countBoard(o,'U')<1))return 220;
      if(k==='B'&&!find(o,'B')&&!find(o,'M')&&room>=2)return 160;
      return 0;
    }
    if(k==='L'||k==='DCE'){
      const t=target(a,o);
      if(!t||!['M','B'].includes(kind(t))||energy(t)>=3)return 0;
      if(k==='DCE'&&!has(t.energies,'DCE'))return 690;
      if(k==='L'&&has(t.energies,'DCE'))return 710;
      return 0;
    }
    if(k==='TM'){
      const t=target(a,o);
      return t&&['M','B'].includes(kind(t))&&!arr(t.tools).length&&
        (energy(t)>=2||opp(o).prizeCount===1)&&toolLive(o)?640:0;
    }
    if(k==='FLOAT'){
      const t=target(a,o);
      return t===active&&kind(t)!=='M'&&g?.zone==='bench'&&!arr(t.tools).length&&toolLive(o)?440:0;
    }
    if(k==='FSS'){
      const t=target(a,o);
      return t&&kind(t)==='C'&&!arr(t.tools).length&&toolLive(o)&&!own(o).publicTurnRestrictions?.vstarUsed?400:0;
    }
    if(k==='R')return !ruins(o)&&!has(stadium(o),'R')?650:0;
    if(ITEM.has(k)&&!itemOpen(o))return 0;
    if(k==='DP'||k==='HB'||k==='TK')return 0; // Current host lacks damage movement / revealed-prize / ticket reordering contracts.
    if(k==='COL')return activeOpponentLock(o)&&g?.zone==='bench'&&has(discard(o),'L')&&find(o,'K')?150:0;
    if(k==='BC')return needLightning(o)||needEgg(o)&&!activeOpponentLock(o)?590:0;
    if(k==='QB'&&room>0&&h.some(x=>discardValue(o,kind(x))>0)&&(!find(o,'M')&&!has(h,'M')||!find(o,'K')&&!has(h,'K')||h.length<=3))return 570;
    if(k==='VIP'&&Number(o.globalTurn)<=2&&room>0&&(!find(o,'M')&&!has(h,'M')||!find(o,'K')&&!has(h,'K')))return 600;
    if(k==='BI')return h.length<=4?470:0;
    if(k==='MAIL'||k==='PAD')return h.length<=6?390:0;
    if(k==='NAV')return !ruins(o)&&!has(h,'R')?480:0;
    if(k==='RC')return room>0&&has(discard(o),'E')&&needEgg(o)||room>=2&&has(discard(o),'U')&&h.length<=4?310:0;
    if(k==='DM')return h.filter(x=>discardValue(o,kind(x))>0).length>=2&&discard(o).some(x=>trainerScore(o,kind(x))>=175)?300:0;
    if(k==='ROPE')return slots(opp(o)).length===1&&g?.zone==='bench'&&readyTarget(o)?.zone==='bench'&&opp(o).prizeCount===1?1750:0;
    if(k==='CC')return opp(o).prizeCount<own(o).prizeCount&&slots(opp(o)).length>1&&readyTarget(o)?.zone==='active'&&opp(o).prizeCount===1?1400:0;
    if(k==='RED')return opp(o).prizeCount<=3&&opp(o).handCount>3?120:0;
    if(k==='CAR'||k==='IONO')return h.length<=3&&!h.some(x=>['DCE','K','M','TM'].includes(kind(x)))&&own(o).deckCount>=6?380:0;
    return 0;
  }
  function root(req){
    const o=req.observation;
    const rows=arr(req.actionFrontier?.items).filter(a=>EXEC.has(a.kind));
    const ranked=rows.map((a,i)=>({a,i,s:scoreRoot(a,o)})).filter(x=>x.s>0).sort((a,b)=>b.s-a.s||a.i-b.i);
    if(ranked.length)return chooseAction(ranked[0].a.token);
    // Do not mislabel a blocked archetype-critical action as a deliberate pass.
    if(rows.some(a=>kind(a.actorPrinting)==='DP'||meta(a).abilityName==='Dance of the Ancients'))return abstain('NO_SUPPORTED_ROOT_ACTION');
    const pass=rows.find(a=>a.kind==='pass');
    return pass?chooseAction(pass.token):abstain('NO_SUPPORTED_ROOT_ACTION');
  }
  function prompt(req){
    const p=req.prompt,o=req.observation,m=meta(p),sk=kind(p.source?.sourcePrinting),effect=p.source?.effectName??'';
    if(p.source?.sourceKind==='engine')return setup(p,o);
    if(p.source?.sourceKind!=='card-effect')return abstain('UNTRUSTED_PROMPT_SOURCE');
    if(p.promptType==='ChooseCardsPrompt'){
      const z=m.sourceZone;
      if(m.ownerSeat!=='actor'||m.isOwnerVisible!==true)return abstain('UNTRUSTED_CARD_SELECTION');
      if((sk==='QB'||sk==='DM')&&z==='hand')return pick(p,c=>visible(c,'hand')?discardValue(o,kind(c)):0,{want:sk==='QB'?1:2});
      if(sk==='QB'&&z==='deck')return pick(p,c=>visible(c,'deck')?basicScore(o,kind(c)):0,{want:1,allowEmpty:true});
      if(sk==='VIP'&&z==='deck')return pick(p,c=>visible(c,'deck')?basicScore(o,kind(c),true):0,{want:Math.min(2,benchRoom(o)),allowEmpty:true});
      if(sk==='BC'&&z==='deck'){
        // Select physical rows, not duplicate identities by name. One Lightning is sufficient.
        let light=needLightning(o)?1:0,eggs=!activeOpponentLock(o)?Math.max(0,2-n(hand(o),'E')-n(discard(o),'E')-countBoard(o,'E')):0;
        return pick(p,c=>{if(!visible(c,'deck'))return 0;const k=kind(c);if(k==='L'&&light>0){light--;return 300;}if(k==='E'&&eggs>0){eggs--;return 200;}return 0;},{want:3,allowEmpty:true});
      }
      if(sk==='RC'&&z==='discard')return pick(p,c=>visible(c,'discard')?(kind(c)==='E'&&needEgg(o)?300:kind(c)==='U'&&benchRoom(o)>=1?180:kind(c)==='B'&&!find(o,'B')?80:0):0,{want:2,allowEmpty:true});
      if(sk==='DM'&&z==='discard')return pick(p,c=>visible(c,'discard')?trainerScore(o,kind(c)):0,{want:1});
      if(sk==='MAIL'||sk==='PAD'||sk==='NAV'||effect==='Star Alchemy'){
        if(z!=='deck')return abstain('UNTRUSTED_CARD_SELECTION');
        return pick(p,c=>{
          if(!visible(c,'deck'))return 0;
          const k=kind(c);
          if(sk==='NAV')return k==='R'&&!ruins(o)?300:0;
          if(sk==='PAD'&&!ITEM.has(k))return 0;
          if(effect==='Star Alchemy'&&k==='DCE'&&!has(hand(o),'DCE')&&!board(o).some(x=>has(x.p.energies,'DCE')))return 400;
          return Math.max(trainerScore(o,k),effect==='Star Alchemy'?basicScore(o,k):0);
        },{want:sk==='NAV'?Math.min(2,m.maximumCount):1,allowEmpty:true});
      }
      if(effect==='Rototiller'&&z==='discard')return pick(p,c=>visible(c,'discard')?(['DCE','L','DP','TM','RC','R'].includes(kind(c))?200:0):0,{want:1});
      return abstain('UNSUPPORTED_CARD_COMBINATION_SOURCE');
    }
    if(p.promptType==='ChoosePokemonPrompt'){
      if(sk!=='ROPE'&&sk!=='CC')return abstain('UNSUPPORTED_POKEMON_PROMPT');
      const oppChoice=arr(p.choices).some(c=>meta(c).ownerSeat==='opponent');
      return pick(p,c=>{
        const cm=meta(c); if(cm.isOwnerVisible!==true||cm.targetZone!=='bench')return 0;
        const i=Number.isSafeInteger(cm.benchIndex)?cm.benchIndex:Number((/bench (\d+)/i.exec(c.label??'')??[])[1])-1;
        const t=slot(oppChoice?opp(o):own(o),'bench',i);
        if(!t||printing(t)!==c.printing||cm.ownerSeat!==(oppChoice?'opponent':'actor'))return 0;
        if(!oppChoice)return kind(t)==='M'&&has(t.tools,'TM')&&energy(t)>=3?300:0;
        return publicRemaining(t)!==null&&publicRemaining(t)<=280?400-publicRemaining(t):0;
      },{want:1});
    }
    if(p.promptType==='ConfirmPrompt'){
      const yes=arr(p.choices).find(c=>c.kind==='confirm'&&c.label==='Yes');
      const no=arr(p.choices).find(c=>c.kind==='confirm'&&c.label==='No');
      if(!yes||!no)return abstain('AMBIGUOUS_SIMPLE_PROMPT');
      if(effect==='Dark Asset'&&sk==='C')return chooseChoice(hand(o).length<6?yes.token:no.token);
      if(effect==='Dedechange'&&sk==='D')return chooseChoice(hand(o).length<=3&&!hand(o).some(x=>['DCE','K','M','TM'].includes(kind(x)))?yes.token:no.token);
      if(effect==='Squawk and Seize'&&sk==='S')return chooseChoice(hand(o).length<=3&&!hand(o).some(x=>['DCE','K','M','TM'].includes(kind(x)))?yes.token:no.token);
      return abstain('UNSUPPORTED_CONFIRMATION_SOURCE');
    }
    if(p.promptType==='ChoosePrizePrompt'&&m.ownerSeat==='actor'&&sk!=='HB'&&sk!=='TK'){
      const cs=arr(p.choices).filter(c=>c.kind==='prize'&&meta(c).ownerSeat==='actor');
      const required=m.requiredCount;
      return Number.isSafeInteger(required)&&required>0&&cs.length>=required?chooseChoices(cs.slice(0,required).map(c=>c.token)):abstain('NO_LEGAL_PRIZE_SELECTION');
    }
    return abstain('UNSUPPORTED_PROMPT_TYPE');
  }
  function createPolicy({role,seat,policyVersion,config}){
    if(role!=='opponent'||![0,1].includes(seat)||policyVersion!==VERSION||!config||typeof config!=='object'||Array.isArray(config)||Object.keys(config).length)throw Error('RANK26_POLICY_INIT_MISMATCH');
    return Object.freeze({decide(req){
      if(req?.role!=='opponent'||req.seat!==seat||req.observation?.actorSeat!==seat)return abstain('ROLE_SEAT_BINDING_MISMATCH');
      if(req.prompt&&req.prompt.actingSeat!==seat)return abstain('ROLE_SEAT_BINDING_MISMATCH');
      return req.prompt?prompt(req):root(req);
    }});
  }
  module.exports={POLICY_VERSION:VERSION,SOURCE_RANK,SOURCE_LIST_BLOB_SHA1,ENGINE_PIN,WORKER_PROTOCOL_BLOB_SHA1:PROTOCOL_BLOB,createPolicy,scoreRoot,scoreAttack,kind,root,prompt};
})(module);
