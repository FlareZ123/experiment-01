'use strict';

// Runnable with: node tests/agent50-rank17-family-policy.test.cjs
// The exported test function also works in an isolated JS runtime without Node.
function runCases(policy,protocol) {
  let cases=0;
  const receipts=[];
  const same=(actual,expected,label)=>{
    if(JSON.stringify(actual)!==JSON.stringify(expected))
      throw Error(label+': '+JSON.stringify(actual)+' != '+JSON.stringify(expected));
    cases++; receipts.push(label);
  };
  const A={unown:'Unown AOR',voltorb:'Voltorb ROS',pikachu:'Pikachu XY',
    electrode:'Electrode-GX CES',raichu:'Alolan Raichu UNM',gengar:'Gengar & Mimikyu-GX TEU',
    squawk:'Squawkabilly ex PAL',marshadow:'Marshadow UNB',klefki:'Klefki SVI',
    ditto:'Ditto {*} LOT',carrier:'Rescue Carrier EVS',compressor:'Battle Compressor PHF',
    vip:'Battle VIP Pass FST',research:"Professor's Research JTG",carmine:'Carmine TWM',
    mail:"Trainers' Mail ROS",secret:'Secret Box TWM',pokestop:'PokéStop PGO',
    unit:'Unit Energy LPM UPR',uturn:'U-Turn Board UNM',heavy:'Hisuian Heavy Ball ASR',
    stretcher:'Rescue Stretcher GRI'};
  const slot=(printing,over={})=>({printing,hp:60,damage:0,energies:[],tools:[],
    printed:{retreatCost:['Colorless']},abilitySuppressions:[],abilities:[],...over});
  const player=(over={})=>({active:slot(A.gengar),bench:[],discard:[],stadium:[],
    deckCount:40,prizeCount:6,handCount:4,publicTurnRestrictions:{},...over});
  const view=(seat,over={})=>({actorSeat:seat,globalTurn:seat+1,phase:2,
    decisionKind:'root-action',ownHand:[],ownTurnResources:{supporterPlayedTurn:0},
    ownPublic:player(),opponentPublic:player({active:slot('Shadow Rider Calyrex VMAX CRE',{hp:320})}),...over});
  const play=(token,printing,target=null)=>({kind:'play-card',token,actorPrinting:printing,
    publicMetadata:{cardType:'trainer',...(target?{targetSeat:'actor',targetZone:target.zone,
      targetIndex:target.index,isOwnerVisible:true}: {})},...(target?{targetPrinting:target.printing}: {})});
  const ability=(token,printing,abilityName,index=0)=>({kind:'use-ability',token,actorPrinting:printing,
    publicMetadata:{abilityName,sourceSeat:'actor',sourceZone:'bench',sourceIndex:index}});
  const pass={kind:'pass',token:'pass'};
  const choose=(...tokens)=>({kind:'select-choices',tokens});
  const action=token=>({kind:'select-action',token});
  const single=token=>({kind:'select-choice',token});
  const abstain=reasonCode=>({kind:'abstain',reasonCode});
  function init(seat) {return policy.createPolicy({role:'opponent',seat,policyVersion:policy.POLICY_VERSION,config:{}});}
  function runRoot(p,v,items) {
    const actionFrontier={schema:protocol.FRONTIER_SCHEMA,items};
    const allowed=protocol.validateFrontier(actionFrontier);
    const decision=p.decide({role:'opponent',seat:v.actorSeat,observation:v,prompt:null,actionFrontier});
    return protocol.validateDecision(decision,null,allowed);
  }
  function runPrompt(p,v,prompt) {
    protocol.validatePrompt(prompt,v.actorSeat);
    const decision=p.decide({role:'opponent',seat:v.actorSeat,observation:{...v,decisionKind:'owner-prompt',
      pendingPromptType:prompt.promptType},prompt,actionFrontier:{schema:protocol.FRONTIER_SCHEMA,items:[]}});
    return protocol.validateDecision(decision,prompt,new Set());
  }
  function cards(v,source,effect,zone,names,min=0,max=2,extra={}) {
    return {schema:protocol.PROMPT_SCHEMA,actingSeat:v.actorSeat,promptType:'ChooseCardsPrompt',
      description:effect,source:{classification:'actor-choice',sourceKind:'card-effect',sourcePrinting:source,effectName:effect},
      publicMetadata:{selectionType:'card-combination',sourceZone:zone,ownerSeat:'actor',
        isOwnerVisible:true,isSecret:false,allowCancel:false,minimumCount:min,maximumCount:max},
      choices:[...names.map((printing,i)=>({token:'c'+i,kind:'card',printing,label:printing,
        publicMetadata:{selectionIndex:i,selectedCount:1,sourceZone:zone,ownerSeat:'actor',isOwnerVisible:true}})),
        ...(min===0?[{token:'empty',kind:'empty-selection',label:'Choose no items'}]:[])],...extra};
  }
  // Synthetic certified own-deck membership; face-down slots stay opaque.
  const full={...A,rope:'Escape Rope BST',ticket:'Redeemable Ticket JTG',sight:'Telescopic Sight VIV',reversal:'Reversal Energy PAL',counter:'Counter Energy CIN'};
  const counts={unown:4,voltorb:2,electrode:3,pikachu:1,raichu:2,squawk:2,gengar:1,marshadow:1,klefki:1,ditto:1,research:3,carmine:1,vip:4,compressor:4,carrier:4,stretcher:3,rope:3,mail:2,ticket:1,secret:1,heavy:1,uturn:1,sight:1,pokestop:1,reversal:4,counter:4,unit:4};
  const allCards=Object.entries(counts).flatMap(([k,n])=>Array(n).fill(full[k]));
  function exact(seat,{h=[],bench=[],activeCard=A.gengar,discard=[],lost=[],prizes=[],activeOver={}}={}){
    const a=slot(activeCard,{evolutionPrintings:[activeCard],...activeOver});
    const b=bench.map(c=>typeof c==='string'?slot(c,{evolutionPrintings:[c]}):c);
    const remaining=allCards.slice();
    for(const c of [...h,...discard,...lost,...prizes,...[a,...b].flatMap(p=>[...p.evolutionPrintings,...p.energies.filter(c=>!p.evolutionPrintings.includes(c)),...p.tools.filter(c=>!p.evolutionPrintings.includes(c))])]){
      const i=remaining.indexOf(c);if(i<0)throw Error('fixture exceeds inventory: '+c);remaining.splice(i,1);
    }
    const unique=[...new Set(remaining)].map(printing=>({printing,copies:remaining.filter(c=>c===printing).length}));
    return view(seat,{decisionKind:'owner-root',pendingPromptType:null,ownHand:h,
      ownerK1:{exactMembershipKnown:true,invalidationReason:null,epoch:7,knownPrintings:unique},
      ownPublic:player({active:a,bench:b,discard,lostZone:lost,resolvingSupporter:[],stadium:[],
        handCount:h.length,deckCount:remaining.length,prizeCount:prizes.length,prizeSlots:prizes.map((_,index)=>({index}))})});
  }
  same(policy.SOURCE_RANK,17,'profile rank');
  same(policy.PROFILE.familyBaseBlobSha1,'6897cd7f73ad8be8c01eafb97295fed6d74d376e','base identity');
  same(policy.PROFILE.sourceEntryJsonSha256,'41743dd93f080bff72981d0245b24df7615be3b1d3a03900e673a0dc2b6a2083','source identity');
  for(const seat of [0,1]) {
    const p=init(seat),tag='seat'+seat+' ';
    let v=view(seat,{ownHand:[A.compressor,A.carrier]});
    // Actual rank17-specific root -> deck selection -> discard recovery ->
    // hand placement. Transitions are synthetic, not native Store effects.
    same(runRoot(p,v,[play('compress',A.compressor),play('carrier',A.carrier),pass]),action('compress'),tag+'compressor with carrier plan');
    same(runPrompt(p,v,cards(v,A.compressor,'Battle Compressor','deck',
      [A.unit,A.unown,A.pikachu,A.voltorb,A.electrode,A.ditto],0,3)),choose('c3','c2'),tag+'compressor two missing starters not unsupported Energy');
    v={...v,ownHand:[A.carrier],ownPublic:player({discard:[A.voltorb,A.pikachu]})};
    same(runRoot(p,v,[play('carrier',A.carrier),pass]),action('carrier'),tag+'carrier root');
    same(runPrompt(p,v,cards(v,A.carrier,'Rescue Carrier','discard',
      [A.unown,A.pikachu,A.voltorb,A.electrode,A.ditto],0,2)),choose('c2','c1'),tag+'carrier two distinct starters');

    const carrierTemple=view(seat,{ownHand:[A.carrier],
      ownPublic:player({discard:[A.voltorb,A.pikachu,A.marshadow]}),
      opponentPublic:player({active:slot('Shadow Rider Calyrex VMAX CRE',{hp:320}),
        stadium:['Temple of Sinnoh ASR']})});
    same(runPrompt(p,carrierTemple,cards(carrierTemple,A.carrier,'Rescue Carrier','discard',
      [A.voltorb,A.pikachu,A.marshadow],0,2)),choose('c2','c0'),
      tag+'Carrier reserves one slot for urgent discarded Marshadow');

    const compressMarshadow=view(seat,{globalTurn:4,ownHand:[A.compressor,A.carrier],
      ownPublic:player({bench:[slot(A.voltorb),slot(A.pikachu)],discard:[],deckCount:30}),
      opponentPublic:player({active:slot('Shadow Rider Calyrex VMAX CRE',{hp:320}),
        stadium:['Temple of Sinnoh ASR']})});
    same(runRoot(p,compressMarshadow,[play('compress-marshadow',A.compressor),play('carrier-later',A.carrier),pass]),
      action('compress-marshadow'),tag+'Compressor starts deck-to-Carrier Stadium-answer route');
    same(runPrompt(p,compressMarshadow,cards(compressMarshadow,A.compressor,'Battle Compressor','deck',
      [A.unown,A.marshadow,A.unit],0,3)),choose('c1'),tag+'Compressor deliberately discards Marshadow for Carrier');
    const compressedMarshadow={...compressMarshadow,ownHand:[A.carrier],
      ownPublic:{...compressMarshadow.ownPublic,discard:[A.marshadow]}};
    same(runRoot(p,compressedMarshadow,[play('carrier-marshadow',A.carrier),pass]),action('carrier-marshadow'),
      tag+'Carrier completes Compressor Stadium-answer connector');
    same(runPrompt(p,compressedMarshadow,cards(compressedMarshadow,A.carrier,'Rescue Carrier','discard',
      [A.marshadow],0,2)),choose('c0'),tag+'Carrier retrieves compressed Marshadow');
    const stretcherTemple={...carrierTemple,ownHand:[A.stretcher,A.raichu],
      ownPublic:{...carrierTemple.ownPublic,discard:[A.raichu,A.marshadow]}};
    same(runPrompt(p,stretcherTemple,cards(stretcherTemple,A.stretcher,'Rescue Stretcher','discard',
      [A.raichu,A.marshadow],0,1)),choose('c1'),
      tag+'Stretcher recovers Stadium answer before stranded evolution');
    v={...v,ownHand:[A.pikachu,A.voltorb],ownPublic:player()};
    same(runRoot(p,v,[play('pikachu',A.pikachu),play('voltorb',A.voltorb),pass]),action('voltorb'),tag+'bench Voltorb');
    v={...v,ownHand:[A.pikachu],ownPublic:player({bench:[slot(A.voltorb)]})};
    same(runRoot(p,v,[play('pikachu',A.pikachu),pass]),action('pikachu'),tag+'bench Pikachu');
    // Once starters established, recycle two Unown and spend them one at a
    // time. The ability root must not spend a tool-bearing or Active Unown.
    v=view(seat,{ownHand:[A.carrier],ownPublic:player({bench:[slot(A.voltorb),slot(A.pikachu)],
      discard:[A.unown,A.unown,A.ditto]})});
    same(runRoot(p,v,[play('carrier',A.carrier),pass]),action('carrier'),tag+'Unown recycle root');
    same(runPrompt(p,v,cards(v,A.carrier,'Rescue Carrier','discard',
      [A.ditto,A.unown,A.unown],0,2)),choose('c1','c2'),tag+'two Unown not lost-zone Ditto');
    v={...v,ownHand:[A.unown,A.unown],ownPublic:player({bench:[slot(A.voltorb),slot(A.pikachu)]})};
    same(runRoot(p,v,[play('bench-unown',A.unown),pass]),action('bench-unown'),tag+'bench recyclable Unown');
    v={...v,ownHand:[A.unown,A.research],ownPublic:player({bench:[slot(A.voltorb),slot(A.pikachu),slot(A.unown)]})};
    same(runRoot(p,v,[play('second-unown',A.unown),play('research',A.research),
      ability('letter',A.unown,'Farewell Letter',2),pass]),action('letter'),tag+'Farewell before destructive hand draw');
    const withTool={...v,ownPublic:player({bench:[slot(A.voltorb),slot(A.pikachu),slot(A.unown,{tools:[A.uturn]})]})};
    same(runRoot(p,withTool,[ability('letter',A.unown,'Farewell Letter',2),pass]),action('letter'),tag+'U-Turn recycles through Farewell');
    const unknownTool={...v,ownPublic:player({bench:[slot(A.voltorb),slot(A.pikachu),slot(A.unown,{tools:['Float Stone BKT']})]})};
    same(runRoot(p,unknownTool,[ability('letter',A.unown,'Farewell Letter',2),pass]),action('pass'),tag+'other Tool guarded');
    const withEnergy={...v,ownPublic:player({bench:[slot(A.voltorb),slot(A.pikachu),slot(A.unown,{energies:[A.unit]})]})};
    same(runRoot(p,withEnergy,[ability('letter',A.unown,'Farewell Letter',2),pass]),action('pass'),tag+'do not discard attached Energy');
    const withKlefki={...v,ownPublic:player({active:slot(A.klefki),bench:[slot(A.unown)]})};
    same(runRoot(p,withKlefki,[ability('letter',A.unown,'Farewell Letter',0),play('bench-unown',A.unown),pass]),action('pass'),tag+'Klefki self-lock');
    const nearDeckout={...v,ownPublic:player({deckCount:1,bench:[slot(A.unown)]})};
    same(runRoot(p,nearDeckout,[ability('letter',A.unown,'Farewell Letter',0),pass]),action('pass'),tag+'preserve next mandatory draw');
    const useStop={kind:'use-stadium',token:'use-stop',actorPrinting:A.pokestop,
      publicMetadata:{stadiumEffectLive:true}};
    const certifyStop=v=>{
      const known=v.ownerK1.knownPrintings.flatMap(row=>row.printing===A.pokestop?
        (row.copies>1?[{...row,copies:row.copies-1}]:[]):[row]);
      return {...v,ownerK1:{...v.ownerK1,knownPrintings:known},
        ownPublic:{...v.ownPublic,stadium:[A.pokestop],deckCount:v.ownPublic.deckCount-1}};
    };
    let stopDitto=certifyStop(exact(seat,{h:[A.raichu],lost:[A.pikachu]}));
    same(runRoot(p,stopDitto,[useStop,pass]),action('pass'),
      tag+'Pokestop preserves only compatible Ditto evolution path');
    let stopNatural=certifyStop(exact(seat,{h:[A.raichu]}));
    same(runRoot(p,stopNatural,[useStop,pass]),action('use-stop'),
      tag+'Pokestop remains usable while natural base remains in deck');
    const wrongActor={...ability('letter',A.unown,'Farewell Letter',2),publicMetadata:{abilityName:'Farewell Letter',sourceSeat:'opponent',sourceZone:'bench',sourceIndex:2}};
    same(runRoot(p,v,[wrongActor,pass]),action('pass'),tag+'reject wrong actor source');
    const wrongPrint={...ability('letter','Unown AOR 31','Farewell Letter',2)};
    same(runRoot(p,v,[wrongPrint,pass]),action('pass'),tag+'reject wrong explicit printing');
    const locked={...v,ownPublic:player({bench:[slot(A.voltorb),slot(A.pikachu),slot(A.unown)],discard:[A.unown],
      publicTurnRestrictions:{itemPlayLocked:true}})};
    same(runRoot(p,locked,[play('carrier',A.carrier),ability('letter',A.unown,'Farewell Letter',2),pass]),action('letter'),tag+'Item lock still permits Ability');
    const toolView=view(seat,{ownPublic:player({bench:[slot(A.pikachu)],publicTurnRestrictions:{itemPlayLocked:true}})});
    same(runRoot(p,toolView,[play('uturn',A.uturn,{zone:'active',index:0,printing:A.gengar}),pass]),action('uturn'),tag+'Tool not Item under lock');
    // Rank17 has four VIP Pass. The second player's first turn is turn 2.
    v=view(seat,{ownHand:[A.vip]});
    same(runRoot(p,v,[play('vip',A.vip),pass]),action('vip'),tag+'VIP own first turn');
    same(runPrompt(p,v,cards(v,A.vip,'Battle VIP Pass','deck',
      [A.unown,A.voltorb,A.pikachu,A.squawk,A.voltorb],0,2)),choose('c1','c2'),tag+'VIP two distinct starters');
    same(runRoot(p,{...v,globalTurn:3},[play('vip',A.vip),pass]),action('pass'),tag+'dead VIP after first turn');
    const wrongZone=cards(v,A.vip,'Battle VIP Pass','deck',[A.voltorb,A.pikachu],0,2);
    wrongZone.choices[0].publicMetadata.ownerSeat='opponent';
    same(runPrompt(p,v,wrongZone),choose('c1'),tag+'no opponent choice accepted');
    // Trainers' Mail picks an actually useful recovery card.
    v=view(seat,{ownHand:[A.mail],ownPublic:player({discard:[A.voltorb]})});
    same(runRoot(p,v,[play('mail',A.mail),pass]),action('mail'),tag+'Mail root');
    same(runPrompt(p,v,cards(v,A.mail,"Trainers' Mail",'deck',[A.mail,A.carrier,A.research,A.vip],0,1)),choose('c1'),tag+'Mail selects live Carrier');
    const mailSecret=view(seat,{globalTurn:4,ownHand:[A.mail,A.vip,A.vip,A.unit,A.unit],
      ownPublic:player({active:slot(A.raichu,{hp:110}),deckCount:30})});
    same(runPrompt(p,mailSecret,cards(mailSecret,A.mail,"Trainers' Mail",'deck',[A.secret,A.research,A.carrier],0,1)),choose('c0'),tag+'Mail selects payable Secret Box');
    const mailNoPay=view(seat,{globalTurn:4,ownHand:[A.mail,A.unit],
      ownPublic:player({active:slot(A.raichu,{hp:110}),deckCount:30})});
    same(runPrompt(p,mailNoPay,cards(mailNoPay,A.mail,"Trainers' Mail",'deck',[A.secret,A.research],0,1)),choose('c1'),tag+'Mail rejects unpayable Secret Box');
    // Rank17 root cannot invoke unsupported core prompt paths.
    v=view(seat,{ownPublic:player({bench:[slot(A.electrode)]})});
    same(runRoot(p,v,[ability('bomb',A.electrode,'Extra Energy Bomb',0),pass]),abstain('NO_SUPPORTED_ROOT_ACTION'),tag+'explicit Bomb abstention');
    same(runRoot(p,v,[{token:'rain',kind:'attack',actorPrinting:A.raichu,attackName:'Electro Rain'},pass]),
      abstain('NO_SUPPORTED_ROOT_ACTION'),tag+'explicit Electro Rain abstention');
    // Temple counterplay uses the actual rank17 Marshadow, not rank4 Sky Field.
    v=view(seat,{ownPublic:player({bench:[slot(A.marshadow)]}),opponentPublic:player({stadium:['Temple of Sinnoh ASR']})});
    same(runRoot(p,v,[ability('reset',A.marshadow,'Resetting Hole',0),pass]),action('reset'),tag+'Temple removal ability');
    const noTemple={...v,opponentPublic:player()};
    same(runRoot(p,noTemple,[ability('reset',A.marshadow,'Resetting Hole',0),pass]),action('pass'),tag+'no gratuitous Resetting Hole');
    const pathLock=view(seat,{ownHand:[A.pokestop],
      ownPublic:player({bench:[slot(A.marshadow),slot(A.electrode,{hp:190,abilities:['Extra Energy Bomb']})]}),
      opponentPublic:player({stadium:['Path to the Peak CRE']})});
    same(policy.abilityBlocked(pathLock,'electrode',pathLock.ownPublic.bench[1],'Extra Energy Bomb'),true,tag+'Path visibly blocks Electrode');
    same(runRoot(p,pathLock,[ability('reset',A.marshadow,'Resetting Hole',0),play('pokestop',A.pokestop),pass]),action('reset'),tag+'Resetting Hole removes Path before Bomb');
    const resetConfirm={schema:protocol.PROMPT_SCHEMA,actingSeat:seat,promptType:'ConfirmPrompt',
      description:'Resetting Hole',source:{classification:'actor-choice',sourceKind:'card-effect',
        sourcePrinting:A.marshadow,effectName:'Resetting Hole'},
      publicMetadata:{selectionType:'confirm',allowCancel:false,isSecret:false},
      choices:[{token:'yes',kind:'confirm',label:'Yes',publicMetadata:{choiceIndex:0}},
        {token:'no',kind:'confirm',label:'No',publicMetadata:{choiceIndex:1}}]};
    same(runPrompt(p,pathLock,resetConfirm),single('yes'),tag+'Resetting Hole Path continuation confirms removal');
    const noMarshadowPath={...pathLock,ownPublic:player({bench:[slot(A.electrode,{hp:190,abilities:['Extra Energy Bomb']})]})};
    same(runRoot(p,noMarshadowPath,[play('pokestop',A.pokestop),pass]),action('pokestop'),tag+'Pokestop replaces Path blocking live Electrode');
    const pathNoBomb={...pathLock,ownPublic:player({bench:[slot(A.marshadow)]})};
    same(runRoot(p,pathNoBomb,[ability('reset',A.marshadow,'Resetting Hole',0),pass]),action('pass'),tag+'do not spend Marshadow on Path without live blocked engine');
    const powerLock={...pathLock,opponentPublic:player({stadium:['Power Plant UNB']})};
    same(runRoot(p,powerLock,[ability('reset',A.marshadow,'Resetting Hole',0),pass]),action('reset'),tag+'Resetting Hole removes Power Plant blocking Electrode');
    const silentDitto=view(seat,{globalTurn:4,ownHand:[A.pokestop,A.raichu],
      ownPublic:player({bench:[slot(A.ditto,{abilities:['Almighty Evolution']})],deckCount:5}),
      opponentPublic:player({stadium:['Silent Lab PRC']})});
    same(runRoot(p,silentDitto,[play('stop-silent',A.pokestop),
      ability('ditto-silent',A.ditto,'Almighty Evolution',0),pass]),action('stop-silent'),
      tag+'Pokestop replaces Silent Lab before funded Ditto evolution');
    const silentIdle={...silentDitto,ownHand:[A.pokestop],
      ownPublic:player({bench:[slot(A.marshadow,{abilities:['Resetting Hole']})],deckCount:5})};
    same(runRoot(p,silentIdle,[play('stop-idle',A.pokestop),
      ability('reset-silent',A.marshadow,'Resetting Hole',0),pass]),action('pass'),
      tag+'do not spend Pokestop on Silent Lab without blocked engine line');
    const silentKlefki=view(seat,{globalTurn:4,ownHand:[A.pokestop],
      ownPublic:player({active:slot(A.klefki,{hp:70,abilities:['Mischievous Lock']}),
        bench:[slot(A.electrode,{hp:190,abilities:['Extra Energy Bomb']})],deckCount:5}),
      opponentPublic:player({active:slot('Wobbuffet PHF 36',{hp:110,abilities:['Bide Barricade']}),
        stadium:['Silent Lab PRC'],prizeCount:6})});
    same(policy.liveBombs(silentKlefki).length,1,
      tag+'Silent Lab already suppresses Wobbuffet and exposes Bomb');
    same(runRoot(p,silentKlefki,[play('stop-klefki',A.pokestop),pass]),action('pass'),
      tag+'do not replace Silent Lab solely for Klefki Wobbuffet interaction');
    const silentKlefkiCleared={...silentKlefki,
      opponentPublic:{...silentKlefki.opponentPublic,stadium:[]}};
    same(policy.liveBombs(silentKlefkiCleared).length,1,
      tag+'after Silent Lab leaves Klefki itself suppresses Wobbuffet');
    const dittoPath=view(seat,{globalTurn:4,ownHand:[A.raichu],
      ownPublic:player({bench:[slot(A.marshadow),slot(A.ditto,{abilities:['Almighty Evolution']})]}),
      opponentPublic:player({stadium:['Path to the Peak CRE']})});
    same(policy.abilityBlocked(dittoPath,'ditto',dittoPath.ownPublic.bench[1],'Almighty Evolution'),true,tag+'Path blocks Prism Star Ditto Rule Box Ability');
    same(runRoot(p,dittoPath,[ability('reset',A.marshadow,'Resetting Hole',0),ability('ditto-evo',A.ditto,'Almighty Evolution',1),pass]),action('reset'),tag+'remove Path before funded Ditto evolution');
    const sky={...v,ownPublic:player({bench:Array.from({length:6},()=>slot(A.unown))}),opponentPublic:player({stadium:['Sky Field ROS']})};
    same(runRoot(p,sky,[play('pokestop',A.pokestop),pass]),action('pass'),tag+'do not collapse own six-Bench Sky Field');
    // Exact current protocol, including multi-select and empty token semantics.
    v=view(seat,{ownPublic:player({discard:[A.ditto]})});
    same(runPrompt(p,v,cards(v,A.carrier,'Rescue Carrier','discard',[A.ditto],0,2)),single('empty'),tag+'empty token not zero-length multiselect');
    // Rescue Stretcher shuffle-three is reserved for a real low-deck
    // survival window, not speculative midgame recycling.
    const lowDeck=view(seat,{ownHand:[A.stretcher],
      ownPublic:player({active:slot(A.unown),discard:[A.squawk,A.klefki,A.marshadow],deckCount:1})});
    same(runRoot(p,lowDeck,[play('stretcher-low',A.stretcher),pass]),action('stretcher-low'),tag+'low deck plays Stretcher to prevent deckout');
    const stretcherMode={schema:protocol.PROMPT_SCHEMA,actingSeat:seat,promptType:'SelectOptionPrompt',
      description:'Rescue Stretcher',source:{classification:'actor-choice',sourceKind:'card-effect',
        sourcePrinting:A.stretcher,effectName:'Rescue Stretcher'},
      publicMetadata:{selectionType:'option',allowCancel:false,isSecret:false},
      choices:[{token:'to-hand',kind:'option',label:'Put 1 Pokémon into your hand',publicMetadata:{choiceIndex:0}},
        {token:'shuffle-three',kind:'option',label:'Shuffle 3 Pokémon into your deck',publicMetadata:{choiceIndex:1}}]};
    same(runPrompt(p,lowDeck,stretcherMode),single('shuffle-three'),tag+'low deck chooses Stretcher shuffle-three mode');
    const shufflePrompt=cards(lowDeck,A.stretcher,'Rescue Stretcher','discard',
      [A.squawk,A.klefki,A.marshadow],3,3);
    same(runPrompt(p,lowDeck,shufflePrompt),choose('c2','c1','c0'),tag+'shuffle exactly three recoverable Pokémon');
    const safeDeck={...lowDeck,ownPublic:{...lowDeck.ownPublic,deckCount:12}};
    same(runRoot(p,safeDeck,[play('stretcher-safe',A.stretcher),pass]),action('pass'),tag+'do not speculative shuffle-three with healthy deck');
    const mailLowDeck={...lowDeck,ownHand:[A.mail],ownPublic:{...lowDeck.ownPublic,handCount:1}};
    same(runPrompt(p,mailLowDeck,cards(mailLowDeck,A.mail,"Trainers' Mail",'deck',
      [A.research,A.stretcher],0,1)),choose('c1'),tag+'Mail finds Stretcher over draw in deckout window');
    // Secret Box must not burn unique core or count itself as payment.
    v=view(seat,{globalTurn:4,ownHand:[A.secret,A.vip,A.vip,A.unit,A.pikachu]});
    same(runRoot(p,v,[play('secret',A.secret),pass]),action('pass'),tag+'cannot pay three safe discards');
    v={...v,ownHand:[A.secret,A.vip,A.vip,A.unit,A.unit,A.pikachu]};
    same(runRoot(p,v,[play('secret',A.secret),pass]),action('secret'),tag+'three safe discards');
    const pay={...v,ownHand:[A.vip,A.vip,A.unit,A.unit,A.pikachu]};
    same(runPrompt(p,pay,cards(pay,A.secret,'Secret Box','hand',[A.vip,A.vip,A.unit,A.unit,A.pikachu],3,3)),choose('c0','c1','c2'),tag+'preserve singleton core payment');

    // Connector contention: a live Unown in discard is not a reason to
    // spend the only Carrier before Compressor establishes missing starters.
    v=view(seat,{ownHand:[A.compressor,A.carrier],ownPublic:player({discard:[A.unown]})});
    same(runRoot(p,v,[play('compress',A.compressor),play('carrier',A.carrier),pass]),action('compress'),tag+'preserve Carrier for missing core instead of Unown draw');
    v={...v,ownPublic:player({discard:[A.voltorb,A.unown]})};
    same(runRoot(p,v,[play('compress',A.compressor),play('carrier',A.carrier),pass]),action('compress'),tag+'Compressor finds missing second starter');
    same(runPrompt(p,v,cards(v,A.compressor,'Battle Compressor','deck',
      [A.unown,A.voltorb,A.pikachu,A.electrode],0,3)),choose('c2'),tag+'do not discard duplicate already-recoverable starter');
    v={...v,ownPublic:player({discard:[A.voltorb,A.pikachu,A.unown]})};
    same(runRoot(p,v,[play('compress',A.compressor),play('carrier',A.carrier),pass]),action('carrier'),tag+'already funded Carrier dominates Compressor');
    // Stage 1 access is a separate funded route from Carrier. A complete
    // Compressor prompt can establish both Basics and one evolution.
    v=view(seat,{ownHand:[A.compressor,A.stretcher],ownPublic:player({bench:[slot(A.pikachu)]})});
    same(runRoot(p,v,[play('compress',A.compressor),play('recover',A.stretcher),pass]),action('compress'),tag+'Stretcher-funded evolution root');
    same(runPrompt(p,v,cards(v,A.compressor,'Battle Compressor','deck',[A.voltorb,A.raichu,A.electrode],0,3)),choose('c1'),tag+'search only funded evolution');
    v={...v,ownHand:[A.stretcher],ownPublic:player({bench:[slot(A.pikachu)],discard:[A.raichu]})};
    same(runRoot(p,v,[play('recover',A.stretcher),pass]),action('recover'),tag+'funded evolution recovery root');
    same(runPrompt(p,v,cards(v,A.stretcher,'Rescue Stretcher','discard',[A.electrode,A.raichu,A.unown],0,1)),choose('c1'),tag+'recover compatible evolution');
    v=view(seat,{ownHand:[A.compressor,A.carrier,A.stretcher]});
    same(runPrompt(p,v,cards(v,A.compressor,'Battle Compressor','deck',[A.voltorb,A.pikachu,A.electrode,A.raichu],0,3)),choose('c0','c1','c3'),tag+'two separate recovery budgets');
    v=view(seat,{ownHand:[A.compressor,A.stretcher],ownPublic:player({bench:[slot(A.pikachu),slot(A.voltorb)],discard:[A.raichu]})});
    same(runRoot(p,v,[play('compress',A.compressor),play('recover',A.stretcher),pass]),action('recover'),tag+'existing Stage 1 consumes sole Stretcher capacity');
    v={...v,ownHand:[A.compressor,A.stretcher,A.stretcher]};
    same(runPrompt(p,v,cards(v,A.compressor,'Battle Compressor','deck',[A.raichu,A.electrode,A.pikachu],0,3)),choose('c1'),tag+'second Stretcher funds missing second evolution');
    v=view(seat,{ownHand:[A.compressor,A.stretcher,A.stretcher],ownPublic:player({bench:[slot(A.ditto)]})});
    same(runPrompt(p,v,cards(v,A.compressor,'Battle Compressor','deck',[A.raichu,A.electrode],0,3)),choose('c0'),tag+'single Ditto cannot supply two evolutions');
    v={...v,ownPublic:player({active:slot(A.klefki),bench:[slot(A.ditto)]})};
    same(runPrompt(p,v,cards(v,A.compressor,'Battle Compressor','deck',[A.raichu,A.electrode,A.voltorb,A.pikachu],0,3)),choose('c3','c0'),tag+'locked Ditto cannot supply a base; recover actual Pikachu and Raichu');
    v=view(seat,{ownHand:[A.carrier,A.stretcher],ownPublic:player({discard:[A.pikachu]})});
    same(runRoot(p,v,[play('recover',A.stretcher),play('carrier',A.carrier),pass]),action('carrier'),tag+'reserve Stretcher when Carrier can recover Basic');
    // Count-aware recovery and safe two-Bomb window.
    v=view(seat,{ownHand:[A.compressor,A.carrier],ownPublic:player({bench:[slot(A.pikachu),slot(A.voltorb)]})});
    same(runPrompt(p,v,cards(v,A.compressor,'Battle Compressor','deck',[A.voltorb,A.electrode],0,3)),choose('c0'),tag+'second Bomb uses second physical Voltorb');
    const unsafeBomb={...v,opponentPublic:{...v.opponentPublic,prizeCount:4}};
    same(runPrompt(p,unsafeBomb,cards(unsafeBomb,A.compressor,'Battle Compressor','deck',[A.voltorb,A.electrode],0,3)),single('empty'),tag+'four opposing Prizes: no second Bomb search');
    v=view(seat,{ownHand:[A.compressor,A.carrier,A.carrier]});
    same(runPrompt(p,v,cards(v,A.compressor,'Battle Compressor','deck',[A.voltorb,A.voltorb,A.pikachu],0,3)),choose('c0','c2','c1'),tag+'two Carriers fund three physical bases');
    v=view(seat,{ownHand:[A.carrier],ownPublic:player({bench:[slot(A.pikachu)],discard:[A.voltorb,A.voltorb]})});
    same(runPrompt(p,v,cards(v,A.carrier,'Rescue Carrier','discard',[A.voltorb,A.voltorb],0,2)),choose('c0','c1'),tag+'one Carrier recovers both physical Voltorb');
    v=view(seat,{ownHand:[A.compressor,A.stretcher,A.stretcher],ownPublic:player({bench:[slot(A.raichu),slot(A.voltorb),slot(A.voltorb)]})});
    same(runPrompt(p,v,cards(v,A.compressor,'Battle Compressor','deck',[A.electrode,A.electrode,A.raichu],0,3)),choose('c0','c1'),tag+'two Stretcher recover two funded Electrode');
    const noSecond={...v,opponentPublic:{...v.opponentPublic,prizeCount:4}};
    same(runPrompt(p,noSecond,cards(noSecond,A.compressor,'Battle Compressor','deck',[A.electrode,A.electrode],0,3)),choose('c0'),tag+'no gratuitous second liability');
    v=view(seat,{ownHand:[A.raichu,A.electrode],ownPublic:player({bench:[slot(A.ditto)]})});
    const exclusive=policy.planCoreAccess(v);
    same([exclusive.readyR,exclusive.readyE],[1,0],tag+'one Ditto cannot be assigned twice');
    v=view(seat,{ownHand:[A.voltorb],ownPublic:player({bench:[slot(A.pikachu),slot(A.voltorb)]})});
    same(runRoot(p,v,[play('second-voltorb',A.voltorb),pass]),action('second-voltorb'),tag+'play second Voltorb after attacker base');
    same(runRoot(p,{...v,opponentPublic:{...v.opponentPublic,prizeCount:4}},[play('second-voltorb',A.voltorb),pass]),action('pass'),tag+'do not reserve useless dual Bomb Bench');
    v=view(seat,{ownHand:[A.vip],ownPublic:player({bench:[slot(A.pikachu)]})});
    same(runPrompt(p,v,cards(v,A.vip,'Battle VIP Pass','deck',[A.voltorb,A.voltorb,A.unown],0,2)),choose('c0','c1'),tag+'VIP takes both Voltorb after Pikachu secured');
    v=view(seat,{ownHand:[A.electrode],ownPublic:player({bench:[slot(A.raichu),slot(A.electrode),slot(A.voltorb)]})});
    same(runRoot(p,v,[play('second-electrode',A.electrode,{zone:'bench',index:2,printing:A.voltorb}),pass]),action('second-electrode'),tag+'evolve second Electrode in safe window');
    same(runRoot(p,{...v,opponentPublic:{...v.opponentPublic,prizeCount:4}},[play('second-electrode',A.electrode,{zone:'bench',index:2,printing:A.voltorb}),pass]),action('pass'),tag+'preserve one-Prize base after window closes');
    // Pinned setup reducer uses the first selection as Active.
    const setupSource={classification:'actor-choice',sourceKind:'engine',sourcePrinting:null,effectName:'CHOOSE_STARTING_POKEMONS'};
    const setup=(v,names,min=1,max=6)=>cards(v,null,'CHOOSE_STARTING_POKEMONS','hand',names,min,max,{source:setupSource});
    v=view(seat,{phase:1,turnSeat:1-seat,ownHand:[A.unown,A.pikachu,A.gengar,A.unit,A.voltorb,A.voltorb],
      ownPublic:player({active:null,bench:[],prizeCount:0})});
    const setupNames=[A.unown,A.pikachu,A.gengar,A.voltorb,A.voltorb];
    same(runPrompt(p,v,setup(v,setupNames)),choose('c2','c1','c3','c4','c0'),tag+'going second ready Horror House Active');
    const first={...v,turnSeat:seat};
    same(runPrompt(p,first,setup(first,setupNames)),choose('c0','c1','c3','c4'),tag+'going first protect three-Prize Gengar');
    const klefki={...first,ownHand:[A.klefki,A.unown,A.pikachu,A.voltorb]};
    same(runPrompt(p,klefki,setup(klefki,[A.klefki,A.unown,A.pikachu,A.voltorb])),choose('c1','c2','c3'),tag+'avoid own Unown lock without mobility');
    const mobile={...klefki,ownHand:[...klefki.ownHand,A.rope||'Escape Rope BST']};
    same(runPrompt(p,mobile,setup(mobile,[A.klefki,A.unown,A.pikachu,A.voltorb])),choose('c0','c2','c3'),tag+'mobile Klefki lock preserves Unown');
    const extraBench={...v,ownPublic:player({active:slot(A.unown),bench:[slot(A.pikachu)],prizeCount:0}),ownHand:[A.voltorb,A.voltorb,A.squawk]};
    same(runPrompt(p,extraBench,setup(extraBench,[A.voltorb,A.voltorb,A.squawk],0,3)),choose('c0','c1'),tag+'optional extra Bench establishes dual Bomb, not Squawk');
    // Certified own inventory permits aggregate Prize inference, never slot mapping.
    const ticket=full.ticket;
    v=exact(seat,{h:[ticket,A.compressor,A.stretcher],bench:[A.pikachu],prizes:[A.raichu,A.raichu,A.unown,A.unit,A.vip,A.research]});
    const known=policy.knownOwnZones(v);
    same(known.prizes.raichu,2,tag+'two copies inferred in own Prizes');
    same(known.deck.raichu||0,0,tag+'no Raichu in known deck');
    same(policy.ticketPlan(v),{target:'raichu',followup:'compressor-stretcher',epoch:7},tag+'Ticket recovers blocked Stage 1 with funded route');
    same(runRoot(p,v,[play('ticket',ticket),play('compress',A.compressor),pass]),action('ticket'),tag+'Ticket precedes otherwise empty evolution search');
    const noCert={...v,ownerK1:null};
    same(policy.knownOwnZones(noCert),null,tag+'no K0 inference');
    same(runRoot(p,noCert,[play('ticket',ticket),pass]),action('pass'),tag+'K0 cannot spend Ticket');
    const stale={...v,ownerK1:{...v.ownerK1,invalidationReason:'draw'}};
    same(policy.ticketPlan(stale),null,tag+'invalidated membership cannot fund Ticket');
    const partial={...v,ownerK1:{...v.ownerK1,knownPrintings:v.ownerK1.knownPrintings.slice(1)}};
    same(policy.knownOwnZones(partial),null,tag+'deck count mismatch fails closed');
    const dupSlot={...v,ownPublic:{...v.ownPublic,prizeSlots:[{index:0},{index:0},...v.ownPublic.prizeSlots.slice(2)]}};
    same(policy.knownOwnZones(dupSlot),null,tag+'duplicate prize index rejected');
    const wrongFace={...v,ownPublic:{...v.ownPublic,prizeSlots:[{index:0,printing:A.voltorb},...v.ownPublic.prizeSlots.slice(1)]}};
    same(policy.knownOwnZones(wrongFace),null,tag+'face-up contradiction fails closed');
    v=exact(seat,{h:[ticket,A.compressor],bench:[A.pikachu],prizes:[A.raichu,A.raichu]});
    same(policy.ticketPlan(v),null,tag+'Ticket not draw-to-hand; no Stretcher');
    v=exact(seat,{h:[ticket,A.compressor,A.stretcher],bench:[A.pikachu,A.voltorb],discard:[A.electrode],prizes:[A.raichu,A.raichu]});
    same(policy.ticketPlan(v),null,tag+'existing evolution recovery reserves Stretcher');
    v=exact(seat,{h:[ticket,A.compressor,A.stretcher,A.stretcher],bench:[A.pikachu,A.voltorb],discard:[A.electrode],prizes:[A.raichu,A.raichu]});
    same(policy.ticketPlan(v)?.target,'raichu',tag+'second Stretcher funds isolated Stage 1');
    v=exact(seat,{h:[ticket,A.compressor,A.carrier],lost:[A.ditto],prizes:[A.pikachu]});
    same(policy.ticketPlan(v)?.followup,'compressor-carrier',tag+'singleton Pikachu rescue with funded Carrier');
    v=exact(seat,{h:[ticket,A.compressor,A.carrier,A.heavy],lost:[A.ditto],prizes:[A.pikachu]});
    same(policy.ticketPlan(v),null,tag+'Heavy Ball cheaper than rerolling Prizes');

    let heavyTemple=exact(seat,{h:[A.heavy],bench:[A.voltorb,A.pikachu],prizes:[A.marshadow]});
    heavyTemple={...heavyTemple,opponentPublic:player({active:slot('Shadow Rider Calyrex VMAX CRE',{hp:320}),
      stadium:['Temple of Sinnoh ASR']})};
    same(runRoot(p,heavyTemple,[play('heavy-temple',A.heavy),pass]),action('heavy-temple'),
      tag+'K1 Heavy Ball recovers Prized singleton Temple answer');
    same(runPrompt(p,heavyTemple,cards(heavyTemple,A.heavy,'Hisuian Heavy Ball','prizes',
      [A.unown,A.marshadow],0,1)),choose('c1'),tag+'Heavy Ball selects Marshadow over generic Basic under Temple');
    const heavyNoTemple={...heavyTemple,opponentPublic:player({active:slot('Shadow Rider Calyrex VMAX CRE',{hp:320})})};
    same(runRoot(p,heavyNoTemple,[play('heavy-idle',A.heavy),pass]),action('pass'),
      tag+'do not spend Heavy Ball on Prized Marshadow without Stadium need');

    let ticketTemple=exact(seat,{h:[ticket,A.compressor,A.carrier],bench:[A.voltorb,A.pikachu],
      prizes:[A.marshadow]});
    ticketTemple={...ticketTemple,opponentPublic:player({
      active:slot('Shadow Rider Calyrex VMAX CRE',{hp:320}),stadium:['Temple of Sinnoh ASR']})};
    same(policy.ticketPlan(ticketTemple),
      {target:'marshadow',followup:'compressor-carrier',epoch:7},
      tag+'Ticket rerolls isolated Marshadow only with funded Carrier route');
    same(runRoot(p,ticketTemple,[play('ticket-marshadow',ticket),play('compress-after-ticket',A.compressor),pass]),
      action('ticket-marshadow'),tag+'Ticket starts isolated Stadium-answer recovery');
    const ticketHeavy={...ticketTemple,ownHand:[ticket,A.compressor,A.carrier,A.heavy],
      ownPublic:{...ticketTemple.ownPublic,handCount:4}};
    same(policy.ticketPlan(ticketHeavy),null,tag+'Heavy Ball dominates Ticket for still-Prized Marshadow');

    v=exact(seat,{h:[ticket,A.compressor,A.stretcher,A.raichu],lost:[A.ditto],prizes:[A.pikachu]});
    same(policy.ticketPlan(v)?.followup,'compressor-stretcher',tag+'single Stretcher can fund held Stage 1 base');
    v=view(seat,{ownHand:[A.compressor,A.stretcher,A.raichu]});
    same(runPrompt(p,v,cards(v,A.compressor,'Battle Compressor','deck',[A.voltorb,A.pikachu,A.electrode],0,3)),choose('c1'),tag+'surplus Stretcher prefers Basic for held evolution');
    v=view(seat,{ownHand:[A.compressor,A.stretcher,A.raichu],ownPublic:player({bench:[slot(A.ditto)]})});
    same(runPrompt(p,v,cards(v,A.compressor,'Battle Compressor','deck',[A.electrode,A.voltorb],0,3)),choose('c1'),tag+'held evolution reserves Ditto, search alternative base');
    v=exact(seat,{h:[ticket],activeCard:A.gengar,activeOver:{evolutionPrintings:[A.gengar,A.unit,A.uturn],energies:[A.unit],tools:[A.uturn]},prizes:[A.pikachu]});
    same(policy.knownOwnZones(v)?.prizes.pikachu,1,tag+'count duplicate attachment projections once');
    const inconsistent={...v,ownPublic:{...v.ownPublic,active:{...v.ownPublic.active,energies:[full.counter]}}};
    same(policy.knownOwnZones(inconsistent),null,tag+'contradictory attachment projection fails closed');
    // First-turn Horror House route: the energy-bearing Gengar is on the
    // Bench and the Active cannot retreat for free. Rope first, opponent
    // switches (external), then own correctly scoped target prompt.
    const rope='Escape Rope BST';
    const pivot=slot(A.unown),g=slot(A.gengar,{hp:240,energies:[A.unit]});
    const firstSecond={...view(seat),globalTurn:2,ownHand:[rope],
      ownPublic:player({active:pivot,bench:[slot(A.voltorb),g]}),
      opponentPublic:player({active:slot('Shadow Rider Calyrex V CRE',{hp:210})})};
    same(runRoot(p,firstSecond,[play('rope',rope),pass]),action('rope'),tag+'Rope unlocks first-turn Horror House');
    const switchPrompt={schema:protocol.PROMPT_SCHEMA,actingSeat:seat,promptType:'ChoosePokemonPrompt',
      description:'CHOOSE_POKEMON_TO_SWITCH',source:{classification:'actor-choice',sourceKind:'card-effect',
        sourcePrinting:rope,effectName:'Escape Rope'},
      publicMetadata:{selectionType:'pokemon',targetZone:'bench',minimumCount:1,maximumCount:1,allowCancel:false,isSecret:false},
      choices:[{token:'voltorb',kind:'pokemon',printing:A.voltorb,label:'Your bench 1',
        publicMetadata:{selectionIndex:0,selectedCount:1,selectionType:'pokemon',ownerSeat:'actor',targetZone:'bench',benchIndex:0,isOwnerVisible:true}},
        {token:'gengar',kind:'pokemon',printing:A.gengar,label:'Your bench 2',
        publicMetadata:{selectionIndex:1,selectedCount:1,selectionType:'pokemon',ownerSeat:'actor',targetZone:'bench',benchIndex:1,isOwnerVisible:true}}]};
    same(runPrompt(p,firstSecond,switchPrompt),choose('gengar'),tag+'Rope continuation chooses charged Gengar');
    const afterRope={...firstSecond,ownPublic:player({active:g,bench:[slot(A.voltorb),pivot]})};
    same(runRoot(p,afterRope,[{token:'horror',kind:'attack',actorPrinting:A.gengar,attackName:'Horror House-GX'},pass]),action('horror'),tag+'Horror House terminal turn action');
    const free={kind:'retreat',token:'free',targetPrinting:A.gengar,
      publicMetadata:{targetSeat:'actor',targetZone:'bench',targetIndex:1,freeRetreat:true,isOwnerVisible:true}};
    same(runRoot(p,firstSecond,[play('rope',rope),free,pass]),action('free'),tag+'free retreat dominates Rope');
    const paid={...free,token:'paid',publicMetadata:{...free.publicMetadata,freeRetreat:false,retreatEnergyCost:1}};
    same(runRoot(p,firstSecond,[play('rope',rope),paid,pass]),action('rope'),tag+'avoid unsupported paid-retreat continuation');
    same(runRoot(p,{...firstSecond,globalTurn:1},[play('rope',rope),pass]),action('pass'),tag+'no first-player attack route');
    same(runRoot(p,{...firstSecond,opponentPublic:player({prizeCount:3})},[play('rope',rope),pass]),action('pass'),tag+'do not expose final three Prizes');
    same(runRoot(p,{...firstSecond,opponentPublic:player({stadium:['Temple of Sinnoh ASR']})},[play('rope',rope),pass]),action('pass'),tag+'Temple invalidates Unit for Horror House');
    same(runRoot(p,{...firstSecond,opponentPublic:player({active:slot('Shadow Rider Calyrex VMAX CRE',{energies:[A.unit,A.unit]})})},[play('rope',rope),pass]),action('pass'),tag+'do not expose Gengar to charged board');
    const invalid={...switchPrompt,choices:[switchPrompt.choices[0],{...switchPrompt.choices[1],publicMetadata:{...switchPrompt.choices[1].publicMetadata,ownerSeat:'opponent'}}]};
    same(runPrompt(p,firstSecond,invalid),choose('voltorb'),tag+'never choose opponent switch target');
    // Ordinary card-effect Prize collection is opaque; exact requiredCount
    // and physical slot tokens, not a fabricated identity or min/max.
    const prizes={schema:protocol.PROMPT_SCHEMA,actingSeat:seat,promptType:'ChoosePrizePrompt',
      description:'CHOOSE_PRIZE_CARD',source:{classification:'actor-choice',sourceKind:'card-effect',sourcePrinting:A.raichu,effectName:'Electric Ball'},
      publicMetadata:{selectionType:'prize-slots',sourceZone:'prizes',ownerSeat:'actor',isOwnerVisible:false,
        count:4,requiredCount:2,allowCancel:false,isSecret:false},
      choices:Array.from({length:4},(_,i)=>({token:'p'+i,kind:'prize',label:'Your Prize slot '+(i+1),
        publicMetadata:{selectionIndex:i,selectedCount:1,sourceZone:'prizes',ownerSeat:'actor',isOwnerVisible:false,requiredCount:2}}))};
    same(runPrompt(p,firstSecond,prizes),choose('p0','p1'),tag+'opaque Prize taking exact required count');

    // Visible board lock and load pressure; no rank-labelled opponent.
    const W='Wobbuffet PHF',H='Stealthy Hood UNB',T='Temple of Sinnoh ASR',
      V='Shadow Rider Calyrex VMAX CRE',D='Trevenant & Dusknoir-GX SMP',
      L='Tapu Lele-GX GRI',R=full.reversal,C=full.counter,U=A.unit;
    const wob=slot(W,{hp:110,abilities:['Bide Barricade']}),
      elec=slot(A.electrode,{hp:190,abilities:['Extra Energy Bomb']}),
      rain=slot(A.raichu,{hp:110,tools:[full.sight]}),
      klef=slot(A.klefki,{hp:70,abilities:['Mischievous Lock'],tools:[A.uturn]});
    const opp=player({active:wob,bench:[slot(D,{hp:270}),slot(L,{hp:170})]});
    const rainV=view(seat,{globalTurn:4,ownHand:[rope],
      ownPublic:player({active:pivot,bench:[rain,elec],discard:[R,R,R,R,C]}),opponentPublic:opp});
    same(policy.wobbuffetLive(rainV),true,tag+'opposing Wob live');
    same(policy.liveBombs(rainV).length,0,tag+'Wob blocks Electrode');
    same(policy.abilityBlocked(rainV,'unown'),false,tag+'Wob permits Psychic Unown');
    same(policy.abilityBlocked(rainV,'marshadow'),false,tag+'Wob permits Psychic Marshadow');
    same(policy.abilityBlocked(rainV,'squawk'),true,tag+'Wob blocks Squawk');
    same(policy.abilityBlocked(rainV,'ditto'),true,tag+'Wob blocks Ditto');
    const kView={...rainV,ownPublic:{...rainV.ownPublic,active:klef}};
    same(policy.wobbuffetLive(kView),false,tag+'Psychic Klefki suppresses opposing Wob');
    same(policy.liveBombs(kView).length,1,tag+'Klefki leaves evolved Electrode live');
    same(policy.abilityBlocked(kView,'unown'),true,tag+'Klefki also blocks own Unown');
    const hooded={...kView,opponentPublic:{...opp,active:{...wob,tools:[H]}}};
    same(policy.wobbuffetLive(hooded),true,tag+'Hood shields Wob');
    same(policy.liveBombs(hooded).length,0,tag+'Hood restores Bomb lock');
    const fundedJoust={...hooded,ownPublic:{...hooded.ownPublic,
      active:{...hooded.ownPublic.active,energies:[U],tools:[A.uturn]}}};
    const joustAttack={kind:'attack',token:'joust-hood',actorPrinting:A.klefki,attackName:'Joust'};
    const retreatRainFromKlefki={kind:'retreat',token:'retreat-rain-hood',targetPrinting:A.raichu,
      publicMetadata:{targetSeat:'actor',targetZone:'bench',targetIndex:0,isOwnerVisible:true,retreatEnergyCost:0}};
    same(runRoot(p,fundedJoust,[joustAttack,retreatRainFromKlefki,pass]),action('joust-hood'),tag+'Joust Hood before abandoning Klefki connector');
    const hoodGone={...fundedJoust,opponentPublic:{...fundedJoust.opponentPublic,active:{...wob,tools:[]}}};
    same(policy.liveBombs(hoodGone).length,1,tag+'Joust Hood removal exposes live Bomb next turn');
    const garb={...rainV,opponentPublic:{...opp,bench:[...opp.bench,slot('Garbodor BKP',{tools:['Float Stone BKT'],abilities:['Garbotoxin']})]}};
    same(policy.liveBombs(garb).length,0,tag+'live Garbotoxin blocks Bomb');
    same(policy.ropeRainPlan({observation:rainV})?.plan.prizes,5,tag+'Rope worst-case five Prize projection');
    const mailForRope={...rainV,ownHand:[A.mail]};
    same(runPrompt(p,mailForRope,cards(mailForRope,A.mail,"Trainers' Mail",'deck',
      [A.research,rope],0,1)),choose('c1'),tag+'Mail values Rope by executable Rain line');
    same(runRoot(p,rainV,[play('rope',rope),pass]),action('rope'),tag+'Rope unlocks Bomb against every visible switch');
    same(policy.ropeRainPlan({observation:{...rainV,opponentPublic:{...opp,bench:[...opp.bench,wob]}}}),null,tag+'second Wob invalidates switch plan');
    same(policy.ropeRainPlan({observation:{...rainV,opponentPublic:{...opp,bench:[]}}}),null,tag+'no opposing bench cannot remove Wob');
    const temple={...rainV,opponentPublic:{...opp,stadium:[T]}};
    same(policy.ropeRainPlan({observation:temple}),null,tag+'Temple requires distinct answer');
    same(policy.ropeRainPlan({observation:{...temple,ownHand:[rope,A.pokestop]}})?.plan.prizes,5,tag+'Temple with stadium answer');
    const pathKlefki={...rainV,ownHand:[rope],
      ownPublic:player({active:pivot,bench:[rain,elec,slot(A.marshadow,{abilities:['Resetting Hole']})],discard:[R,R,R,R,C]}),
      opponentPublic:player({active:slot(A.klefki,{hp:70,abilities:['Mischievous Lock']}),bench:[slot(D,{hp:270}),slot(L,{hp:170})],stadium:['Path to the Peak CRE']})};
    same(policy.ropeRainPlan({observation:pathKlefki})?.plan.needsStadiumAnswer,'Path to the Peak CRE',tag+'Rope plans Klefki removal then Path answer');
    same(runRoot(p,pathKlefki,[play('rope',rope),pass]),action('rope'),tag+'Rope starts Klefki plus Path unlock line');
    const pathAfterRope={...pathKlefki,
      ownPublic:player({active:rain,bench:[pivot,elec,slot(A.marshadow,{abilities:['Resetting Hole']})],discard:[R,R,R,R,C]}),
      opponentPublic:player({active:slot(D,{hp:270}),bench:[slot(A.klefki,{hp:70,abilities:['Mischievous Lock']}),slot(L,{hp:170})],stadium:['Path to the Peak CRE']})};
    same(runRoot(p,pathAfterRope,[ability('reset-path',A.marshadow,'Resetting Hole',2),ability('bomb-path',A.electrode,'Extra Energy Bomb',1),pass]),action('reset-path'),tag+'after Rope clear Path before Bomb');
    same(runPrompt(p,pathAfterRope,resetConfirm),single('yes'),tag+'Klefki Path line confirms Resetting Hole');
    const pathCleared={...pathAfterRope,opponentPublic:{...pathAfterRope.opponentPublic,stadium:[]}};
    same(runRoot(p,pathCleared,[ability('bomb-path',A.electrode,'Extra Energy Bomb',1),pass]),abstain('NO_SUPPORTED_ROOT_ACTION'),tag+'after Path removal reach explicit Bomb boundary');
    const doubleKlefkiPath={...pathKlefki,opponentPublic:player({
      active:slot(A.klefki,{hp:70,abilities:['Mischievous Lock']}),
      bench:[slot(A.klefki,{hp:70,abilities:['Mischievous Lock']}),slot(D,{hp:270})],stadium:['Path to the Peak CRE']})};
    same(policy.ropeRainPlan({observation:doubleKlefkiPath}),null,tag+'second Klefki preserves Marshadow lock after Rope');
    const rainRetreat={...free,targetPrinting:A.raichu,publicMetadata:{...free.publicMetadata,targetIndex:0}};
    same(runRoot(p,kView,[rainRetreat,ability('bomb',A.electrode,'Extra Energy Bomb',1),pass]),abstain('NO_SUPPORTED_ROOT_ACTION'),tag+'keep Klefki active until Bomb resolves');
    const switched={...rainV,opponentPublic:{...opp,active:opp.bench[0],bench:[wob,opp.bench[1]]}};
    const rainPrompt={...switchPrompt,choices:[{...switchPrompt.choices[0],token:'rain',printing:A.raichu},{...switchPrompt.choices[1],token:'elec',printing:A.electrode}]};
    same(runPrompt(p,switched,rainPrompt),choose('rain'),tag+'Rope continuation chooses Raichu after Wob leaves');
    const double=player({active:slot(V,{hp:320}),bench:[slot(V,{hp:320})]});
    const loading=view(seat,{globalTurn:4,ownHand:[A.compressor],
      ownPublic:player({active:rain,bench:[elec,elec],discard:[R,R,R,R,C,C,C]}),opponentPublic:double});
    same(policy.rainProjection(loading,rain)?.terminalProjection,false,tag+'18 existing units cannot hit two VMAX');
    same(policy.activeLoadPlan(loading)?.now,['counter','unit'],tag+'minimal two-card 21-hit load');
    const legacyBase=view(seat,{globalTurn:4,
      ownPublic:player({active:slot(A.raichu,{hp:110}),bench:[elec,elec],discard:[R,R,R,R,C,C,C,C],prizeCount:6}),
      opponentPublic:player({active:slot(V,{hp:320,damage:50}),
        bench:[slot(V,{hp:320,damage:50}),slot('Solrock CES 62',{hp:90})],prizeCount:6})});
    same(policy.rainProjection(legacyBase,legacyBase.ownPublic.active)?.terminalProjection,true,
      tag+'two VMAX six Prize baseline with 20 Rain packets');
    const legacyThreat={...legacyBase,opponentPublic:{...legacyBase.opponentPublic,
      active:{...legacyBase.opponentPublic.active,energies:['Legacy Energy TWM 167']}}};
    same(policy.rainProjection(legacyThreat,legacyThreat.ownPublic.active)?.terminalProjection,false,
      tag+'Legacy denies Prize so 20 packets cannot finish three targets');
    same(policy.rainProjection({...legacyThreat,opponentPublic:{...legacyThreat.opponentPublic,active:{...legacyThreat.opponentPublic.active,energies:[]}}},legacyThreat.ownPublic.active)?.terminalProjection,true,
      tag+'removing Legacy restores terminal Rain');
    same(runRoot(p,loading,[play('compress',A.compressor),pass]),action('compress'),tag+'same-turn loader root');
    same(runPrompt(p,{...loading,ownHand:[]},cards(loading,A.compressor,'Battle Compressor','deck',
      [U,C,U,A.unown],0,3)),choose('c1','c0'),tag+'loader chooses exact two physical cards');
    same(policy.activeLoadPlan({...loading,ownPublic:{...loading.ownPublic,bench:[]}}),null,tag+'do not dump before live Bomb');
    same(policy.activeLoadPlan({...loading,globalTurn:1}),null,tag+'do not expose turn-one Energy');
    same(policy.activeLoadPlan({...loading,opponentPublic:{...double,bench:[slot('Unknown Pokemon XYZ',{hp:320})]}}),null,tag+'unknown target fails closed');

    // Exact New Moon Lockbreaker board: one Bomb gives 14 Lightning units
    // while behind (4 Reversal + Counter), enough for the published
    // Sight packet witness: TAG 7 + Lele 5 + 60-HP one-prizer 2.
    const newMoonWitness=view(seat,{globalTurn:4,
      ownPublic:player({active:slot(A.raichu,{hp:110,tools:[full.sight]}),bench:[elec],
        discard:[R,R,R,R,C],prizeCount:6}),
      opponentPublic:player({active:slot('Unown AOR 30',{hp:60}),
        bench:[slot('Gengar & Mimikyu-GX TEU 53',{hp:240,tools:['Powerglass SFA']}),
          slot('Tapu Lele-GX GRI 60',{hp:170})],prizeCount:6})});
    const newMoonPlan=policy.rainProjection(newMoonWitness,newMoonWitness.ownPublic.active);
    same(newMoonPlan?.terminalProjection,true,tag+'New Moon exact target family yields terminal Rain projection');
    same(newMoonPlan?.units,14,tag+'New Moon one-Bomb deficit yields fourteen Lightning units');
    same(newMoonPlan?.hitsRequired,14,tag+'New Moon Sight witness requires exact fourteen packets');
    same(newMoonPlan?.prizes,6,tag+'New Moon witness maps TAG plus GX plus one-prizer to six Prizes');

    const oneDusclopsParity={...newMoonWitness,
      ownPublic:{...newMoonWitness.ownPublic,prizeCount:5}};
    same(policy.rainProjection(oneDusclopsParity,oneDusclopsParity.ownPublic.active)?.units,14,
      tag+'one opposing Dusclops self-KO leaves post-Bomb deficit multipliers live');
    const twoDusclopsParity={...newMoonWitness,
      ownPublic:{...newMoonWitness.ownPublic,prizeCount:4}};
    same(policy.rainProjection(twoDusclopsParity,twoDusclopsParity.ownPublic.active),null,
      tag+'two opposing Dusclops self-KOs force post-Bomb parity and disable multipliers');

    const fundedPath=view(seat,{globalTurn:4,
      ownPublic:player({active:slot(A.raichu,{hp:110,energies:[R]}),prizeCount:2}),
      opponentPublic:player({active:slot('Duskull VIV 69',{hp:60}),prizeCount:1,
        stadium:['Path to the Peak CRE']})});
    same(policy.rainProjection(fundedPath,fundedPath.ownPublic.active)?.terminalProjection,true,
      tag+'Path is safe for already-funded zero-Bomb Rain evaluation');

    const sunbeamBoard=view(seat,{globalTurn:4,
      ownPublic:player({active:slot(A.raichu,{hp:110}),bench:[elec],discard:[R,R,R,R,C],prizeCount:6}),
      opponentPublic:player({active:slot('Lunatone OBF 92',{hp:90,abilities:['New Moon']}),
        bench:[slot('Solrock CES 62',{hp:90,abilities:['Sunbeam']})],prizeCount:6})});
    same(policy.rainProjection(sunbeamBoard,sunbeamBoard.ownPublic.active)?.hitsRequired,8,
      tag+'Sunbeam raises observed printed-HP Lunatone to 130 for Rain packets');
    const suppressedSolrock={...sunbeamBoard,opponentPublic:{...sunbeamBoard.opponentPublic,
      bench:[slot('Solrock CES 62',{hp:90,abilities:['Sunbeam'],abilitySuppressions:[
        {abilityName:'Sunbeam',suppressed:true,reasonCode:'ABILITY_LOCK',sourcePrinting:'Klefki SVI 96'}]})]}};
    same(policy.rainProjection(suppressedSolrock,suppressedSolrock.ownPublic.active)?.hitsRequired,6,
      tag+'explicit Sunbeam suppression restores printed Lunatone packet count');
    const klefkiSuppressesSunbeam={...sunbeamBoard,
      opponentPublic:player({
        active:slot(A.klefki,{hp:70,abilities:['Mischievous Lock']}),
        bench:[slot('Lunatone OBF 92',{hp:90,abilities:['New Moon']}),
          slot('Solrock CES 62',{hp:90,abilities:['Sunbeam']})],prizeCount:6})};
    same(policy.rainProjection(klefkiSuppressesSunbeam,klefkiSuppressesSunbeam.ownPublic.active)?.hitsRequired,9,
      tag+'active Klefki suppresses Sunbeam before Lunatone Rain arithmetic');
    const jammingSight=view(seat,{globalTurn:4,
      ownPublic:player({active:slot(A.raichu,{hp:110,tools:[full.sight]}),bench:[elec],
        discard:[R,R,R,R,C],prizeCount:6}),
      opponentPublic:player({active:slot('Duskull VIV 69',{hp:60}),
        bench:[slot('Gengar & Mimikyu-GX TEU 53',{hp:240})],
        stadium:['Jamming Tower TWM 153'],prizeCount:6})});
    same(policy.rainProjection(jammingSight,jammingSight.ownPublic.active)?.hitsRequired,10,
      tag+'Jamming Tower disables Telescopic Sight Rain modifier');
    const jammingSightAnswer={...jammingSight,
      ownPublic:{...jammingSight.ownPublic,
        bench:[...jammingSight.ownPublic.bench,slot(A.marshadow,{hp:80,abilities:['Resetting Hole']})],
        deckCount:5}};
    same(runRoot(p,jammingSightAnswer,[ability('reset-jam-sight',A.marshadow,'Resetting Hole',1),pass]),
      action('reset-jam-sight'),tag+'remove Jamming Tower when it suppresses useful Sight');
    const jammingHood=view(seat,{ownPublic:player({
        active:slot(A.klefki,{hp:70,abilities:['Mischievous Lock']}),
        bench:[slot(A.marshadow,{hp:80,abilities:['Resetting Hole']})],deckCount:5}),
      opponentPublic:player({active:slot('Wobbuffet PHF 36',{hp:110,abilities:['Bide Barricade'],
        tools:['Stealthy Hood UNB 186']}),stadium:['Jamming Tower TWM 153']})});
    same(policy.wobbuffetLive(jammingHood),false,
      tag+'Jamming Tower disables Hood so Klefki suppresses Wobbuffet');
    same(runRoot(p,jammingHood,[ability('reset-jam-hood',A.marshadow,'Resetting Hole',0),pass]),action('pass'),
      tag+'preserve Jamming Tower while it disables opposing Hood');
    const noSight={...loading,ownHand:[full.sight],ownPublic:{...loading.ownPublic,active:{...rain,tools:[]},discard:[R,R,R,R,C,C,C,C,U]}};
    same(runRoot(p,noSight,[play('sight',full.sight,{zone:'active',index:0,printing:A.raichu}),pass]),action('sight'),tag+'Sight crosses two-VMAX threshold');
    const manual={...loading,ownHand:[C,U],ownPublic:{...loading.ownPublic,discard:[R,R,R,R,C,C,C,U]}};
    const attachC=play('counter',C,{zone:'active',index:0,printing:A.raichu}),attachU=play('unit',U,{zone:'active',index:0,printing:A.raichu});
    same(runRoot(p,manual,[attachU,attachC,pass]),action('counter'),tag+'Counter attachment activates after Bomb');
    const joust={...hooded,ownHand:[R,C,U]};
    const toK=(token,energy)=>play(token,energy,{zone:'active',index:0,printing:A.klefki});
    same(runRoot(p,joust,[toK('reversal',R),toK('counter',C),toK('unit',U),pass]),action('unit'),tag+'cheap Unit funds Hood-removing Joust');

    // Three distinct Energy can be the correct Secret Box payment when
    // they cross a real same-turn Prize threshold. This is not a generic
    // permission to expose the singleton manual attachment.
    const secretView={...loading,ownHand:[A.secret,R,C,U],
      ownPublic:{...loading.ownPublic,discard:[R,R,R,C,C,C,U]}};
    same(policy.secretPayment(secretView.ownHand,secretView,'secret'),[R,C,U],tag+'distinct Energy payment funds terminal line');
    same(runRoot(p,secretView,[play('secret',A.secret),pass]),action('secret'),tag+'tactical Secret Box root');
    same(runPrompt(p,{...secretView,ownHand:[R,C,U]},cards(secretView,A.secret,'Secret Box','hand',[R,C,U],3,3)),choose('c0','c1','c2'),tag+'exact three-card payment');
    const secretEarly={...secretView,globalTurn:1};
    same(policy.secretPayment(secretEarly.ownHand,secretEarly,'secret'),[],tag+'no speculative distinct early Energy payment');
    const fundedSearch={...noSight,ownHand:[],ownPublic:{...noSight.ownPublic,discard:[R,R,R,R,C,C,C]}};
    const search=cards(fundedSearch,A.secret,'Secret Box','deck',[A.carrier,A.compressor,A.uturn,full.sight,A.research,A.pokestop],0,4);
    same(runPrompt(p,fundedSearch,search),choose('c1','c3','c4','c5'),tag+'joint Compressor and Sight search crosses threshold');
    const templeSecretSearch={...secretView,ownHand:[A.secret,A.pokestop],
      opponentPublic:{...secretView.opponentPublic,stadium:[T]}};
    same(runPrompt(p,templeSecretSearch,cards(templeSecretSearch,A.secret,'Secret Box','deck',
      [A.pokestop],0,4)),choose('c0'),tag+'Secret Box Temple branch uses generalized Stadium answer');

    // A lone Wobbuffet cannot be forced away. The distinct legal pivot
    // is Rope into Klefki, Bomb while Wob is suppressed, free retreat.
    const klefkiBoard={...rainV,ownHand:[rope,A.uturn],
      ownTurnResources:{...rainV.ownTurnResources,retreatedTurn:0},
      ownPublic:{...rainV.ownPublic,bench:[rain,elec,{...klef,tools:[],printed:{retreatCost:['Colorless']}}]},
      opponentPublic:{...opp,bench:[]}};
    same(policy.klefkiPivotPlan(klefkiBoard)?.route,'rope-klefki-bomb-retreat',tag+'lone Wob pivot via distinct Klefki');
    same(policy.ropeRainPlan({observation:klefkiBoard})?.plan.terminalProjection,true,tag+'board-out projection through pivot');
    same(runRoot(p,klefkiBoard,[play('uturn',A.uturn,{zone:'bench',index:2,printing:A.klefki}),play('rope',rope),pass]),action('uturn'),tag+'attach retreat Tool before pivot');
    same(runRoot(p,{...klefkiBoard,ownHand:[rope],ownPublic:{...klefkiBoard.ownPublic,bench:[rain,elec,{...klef,printed:{retreatCost:['Colorless']}}]}},[play('rope',rope),pass]),action('rope'),tag+'Rope starts Klefki route');
    same(policy.klefkiPivotPlan({...klefkiBoard,ownTurnResources:{...klefkiBoard.ownTurnResources,retreatedTurn:4}}),null,tag+'spent retreat blocks pivot');
    same(policy.klefkiPivotPlan({...klefkiBoard,opponentPublic:{...klefkiBoard.opponentPublic,active:{...wob,tools:[H]}}}),null,tag+'Hood blocks Klefki route');
    const heldK={...klefkiBoard,ownHand:[rope,A.uturn,A.klefki],ownPublic:{...klefkiBoard.ownPublic,bench:[rain,elec]}};
    same(runRoot(p,heldK,[play('klefki',A.klefki),play('rope',rope),pass]),action('klefki'),tag+'bench Klefki only for funded route');
    const klefkiPrompt={...switchPrompt,choices:[
      {...switchPrompt.choices[0],token:'rain',printing:A.raichu},
      {...switchPrompt.choices[1],token:'elec',printing:A.electrode},
      {...switchPrompt.choices[1],token:'klefki',printing:A.klefki,publicMetadata:{...switchPrompt.choices[1].publicMetadata,selectionIndex:2,benchIndex:2}}]};
    same(runPrompt(p,{...klefkiBoard,ownHand:[A.uturn]},klefkiPrompt),choose('klefki'),tag+'Rope continuation into Klefki not blocked Raichu');
    const prepared={...loading,ownTurnResources:{...loading.ownTurnResources,retreatedTurn:0},
      ownPublic:{...loading.ownPublic,active:{...pivot,printed:{retreatCost:[]}},bench:[rain,elec,elec]}};
    same(policy.readyRainAttackers(prepared).length,1,tag+'funded free pivot supports same-turn loader');
    same(policy.activeLoadPlan(prepared)?.now,['counter','unit'],tag+'load before free pivot');
    const deadPivot={...prepared,ownTurnResources:{...prepared.ownTurnResources,retreatedTurn:4}};
    same(policy.activeLoadPlan(deadPivot),null,tag+'spent retreat prevents speculative load');

    // Raw hand size is not hand utility: discard redundant Energy to
    // rebuild, but never discard the only held Stage 1 by default.
    const bricked=view(seat,{globalTurn:4,ownHand:[A.research,R,R,C,C,U,U],
      ownPublic:player({active:pivot,deckCount:30}),opponentPublic:double});
    same(policy.drawDiscardScore(bricked,7,'research')>0,true,tag+'draw from seven-card bricked hand');
    same(runRoot(p,bricked,[play('research',A.research),pass]),action('research'),tag+'Research when utility is low');
    const protectedEvolution={...bricked,ownHand:[A.research,A.raichu,R,C,U]};
    same(policy.drawDiscardScore(protectedEvolution,7,'research'),0,tag+'preserve only held evolution');
    const templeThreat={...bricked,ownHand:[A.research,A.marshadow,R,R,C,C,U],
      ownPublic:player({active:pivot,bench:[slot(A.voltorb),slot(A.pikachu),slot(A.unown),slot(A.unown),slot(A.squawk)],deckCount:30}),
      opponentPublic:player({active:slot('Shadow Rider Calyrex VMAX CRE',{hp:320}),
        bench:[slot('Girafarig LOT 94',{hp:90})],stadium:['Temple of Sinnoh ASR']})};
    same(policy.drawDiscardScore(templeThreat,7,'research'),0,tag+'preserve singleton Marshadow under visible Get Lost Temple cut');
    same(runRoot(p,templeThreat,[play('research',A.research),pass]),action('pass'),tag+'do not Research away last Temple answer into Get Lost');
    const noGetLost={...templeThreat,opponentPublic:{...templeThreat.opponentPublic,bench:[]}};
    same(policy.drawDiscardScore(noGetLost,7,'research')>0,true,tag+'no visible Get Lost keeps ordinary draw heuristic');
    const earlyAttach={...bricked,ownHand:[A.research,R,C,U],
      ownPublic:{...bricked.ownPublic,bench:[slot(A.pikachu,{hp:60})]}};
    same(runRoot(p,earlyAttach,[play('research',A.research),play('reversal',R,{zone:'bench',index:0,printing:A.pikachu}),pass]),action('reversal'),tag+'manual before full-hand discard even tied Prizes');
    const gengar=slot(A.gengar,{hp:240,energies:[U,U]});
    const knownHand={...bricked,ownPublic:player({active:gengar,prizeCount:2}),
      opponentPublic:player({active:slot(L,{hp:170}),bench:[slot(V,{hp:320})],
        handCount:4,publicHand:['VS Seeker PHF','Quick Ball SSH','Boss\'s Orders RCL','Professor\'s Research SSH']})};
    const polt={kind:'attack',token:'polt',actorPrinting:A.gengar,attackName:'Poltergeist'};
    same(policy.publicTrainerCount(knownHand),4,tag+'only revealed Trainer identities counted');
    same(policy.directPressure(knownHand,polt)?.terminalProjection,true,tag+'revealed hand lethal Poltergeist');
    same(runRoot(p,knownHand,[polt,play('research',A.research),pass]),action('polt'),tag+'take final Prizes instead of setup');
    const hidden={...knownHand,opponentPublic:{...knownHand.opponentPublic,publicHand:null}};
    same(policy.directPressure(hidden,polt),null,tag+'hidden hand never becomes exact lethal');

    // A terminal Electro Rain line must not be displaced by a weaker
    // supported attack merely because the mandatory Rain continuation is
    // not implemented yet. Preserve a directly terminal supported attack.
    const rainAttack={kind:'attack',token:'rain-root',actorPrinting:A.raichu,attackName:'Electro Rain'};
    const ballAttack={kind:'attack',token:'ball-root',actorPrinting:A.raichu,attackName:'Electric Ball'};
    const terminalRain=view(seat,{globalTurn:4,
      ownPublic:player({active:slot(A.raichu,{hp:110,energies:[R,R]}),prizeCount:2}),
      opponentPublic:player({active:slot('Shadow Rider Calyrex V CRE',{hp:210,damage:60}),
        bench:[slot('Girafarig LOT',{hp:90})],prizeCount:1})});
    same(runRoot(p,terminalRain,[rainAttack,ballAttack,pass]),abstain('NO_SUPPORTED_ROOT_ACTION'),tag+'terminal Rain abstains instead of weaker Ball');
    const ballLethal={...terminalRain,opponentPublic:player({
      active:slot('Shadow Rider Calyrex V CRE',{hp:210,damage:120}),
      bench:[slot('Girafarig LOT',{hp:90})],prizeCount:1})};
    same(runRoot(p,ballLethal,[rainAttack,ballAttack,pass]),action('ball-root'),tag+'direct terminal Ball beats unsupported Rain');
    const nonterminalRain={...terminalRain,opponentPublic:player({
      active:slot('Shadow Rider Calyrex V CRE',{hp:210,damage:0}),
      bench:[slot('Girafarig LOT',{hp:90})],prizeCount:1})};
    same(runRoot(p,nonterminalRain,[rainAttack,ballAttack,pass]),action('ball-root'),tag+'nonterminal Rain leaves supported Ball');
    same(runRoot(p,terminalRain,[ballAttack,pass]),action('ball-root'),tag+'absent Rain root leaves supported Ball');

    // Genuine native action projection stamps attackCostPayable but omits
    // gxAttack. The GX path must be executable from that producer shape.
    const gxWindow=view(seat,{globalTurn:4,
      ownPublic:player({active:slot(A.electrode,{hp:190,energies:[A.unit,full.reversal]}),
        prizeCount:1,publicTurnRestrictions:{gxUsed:false}}),
      opponentPublic:player({active:slot('Unown AOR 30',{hp:60,damage:40}),
        bench:[],prizeCount:4})});
    const gxRoot={kind:'attack',token:'gx-native',
      actorPrinting:A.electrode,attackName:'Crush and Burn-GX',
      publicMetadata:{attackCostPayable:true}};
    same(runRoot(init(seat),gxWindow,[gxRoot,pass]),action('gx-native'),
      tag+'native GX root shape has no gxAttack metadata');
    const gxSpent={...gxWindow,ownPublic:{...gxWindow.ownPublic,
      publicTurnRestrictions:{gxUsed:true}}};
    same(runRoot(init(seat),gxSpent,[gxRoot,pass]),abstain('NO_SUPPORTED_ROOT_ACTION'),
      tag+'used GX ledger blocks stale native root');
    const gxUnpaid={...gxRoot,publicMetadata:{attackCostPayable:false}};
    same(runRoot(init(seat),gxWindow,[gxUnpaid,pass]),abstain('NO_SUPPORTED_ROOT_ACTION'),
      tag+'unpayable printed GX is refused');

    // Distinct support and setup provenance, never a foreign role.
    same(p.decide({role:'opponent',seat:1-seat,observation:v,prompt:null}),abstain('ROLE_SEAT_BINDING_MISMATCH'),tag+'seat bound');
  }
  let rejected=false;
  try{policy.createPolicy({role:'opponent',seat:0,policyVersion:'agent50-rank4-raichu-electrode-opponent-v2',config:{}})}catch{rejected=true;}
  same(rejected,true,'rank4 identity rejected');
  rejected=false;try{policy.createPolicy({role:'opponent',seat:0,policyVersion:policy.POLICY_VERSION,config:{rank:4}})}catch{rejected=true;}
  same(rejected,true,'nonempty config rejected');
  return {cases,receipts};
}
module.exports={runCases};
if(typeof require==='function'&&require.main===module) {
  const policy=require('../simulation/evaluation/2026-11/agent50-rank17-raichu-electrode-opponent-policy.cjs');
  const protocol=require('../simulation/evaluation/2026-11/agent49-policy-protocol.cjs');
  const result=runCases(policy,protocol);
  process.stdout.write(JSON.stringify(result,null,2)+'\n');
}
