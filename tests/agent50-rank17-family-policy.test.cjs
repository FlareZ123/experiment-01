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
    same(runRoot(p,withTool,[ability('letter',A.unown,'Farewell Letter',2),pass]),action('pass'),tag+'do not discard attached Tool');
    const withEnergy={...v,ownPublic:player({bench:[slot(A.voltorb),slot(A.pikachu),slot(A.unown,{energies:[A.unit]})]})};
    same(runRoot(p,withEnergy,[ability('letter',A.unown,'Farewell Letter',2),pass]),action('pass'),tag+'do not discard attached Energy');
    const withKlefki={...v,ownPublic:player({active:slot(A.klefki),bench:[slot(A.unown)]})};
    same(runRoot(p,withKlefki,[ability('letter',A.unown,'Farewell Letter',0),play('bench-unown',A.unown),pass]),action('pass'),tag+'Klefki self-lock');
    const nearDeckout={...v,ownPublic:player({deckCount:1,bench:[slot(A.unown)]})};
    same(runRoot(p,nearDeckout,[ability('letter',A.unown,'Farewell Letter',0),pass]),action('pass'),tag+'preserve next mandatory draw');
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
    const sky={...v,ownPublic:player({bench:Array.from({length:6},()=>slot(A.unown))}),opponentPublic:player({stadium:['Sky Field ROS']})};
    same(runRoot(p,sky,[play('pokestop',A.pokestop),pass]),action('pass'),tag+'do not collapse own six-Bench Sky Field');
    // Exact current protocol, including multi-select and empty token semantics.
    v=view(seat,{ownPublic:player({discard:[A.ditto]})});
    same(runPrompt(p,v,cards(v,A.carrier,'Rescue Carrier','discard',[A.ditto],0,2)),single('empty'),tag+'empty token not zero-length multiselect');
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
    const garb={...rainV,opponentPublic:{...opp,bench:[...opp.bench,slot('Garbodor BKP',{tools:['Float Stone BKT'],abilities:['Garbotoxin']})]}};
    same(policy.liveBombs(garb).length,0,tag+'live Garbotoxin blocks Bomb');
    same(policy.ropeRainPlan({observation:rainV})?.plan.prizes,5,tag+'Rope worst-case five Prize projection');
    same(runRoot(p,rainV,[play('rope',rope),pass]),action('rope'),tag+'Rope unlocks Bomb against every visible switch');
    same(policy.ropeRainPlan({observation:{...rainV,opponentPublic:{...opp,bench:[...opp.bench,wob]}}}),null,tag+'second Wob invalidates switch plan');
    same(policy.ropeRainPlan({observation:{...rainV,opponentPublic:{...opp,bench:[]}}}),null,tag+'no opposing bench cannot remove Wob');
    const temple={...rainV,opponentPublic:{...opp,stadium:[T]}};
    same(policy.ropeRainPlan({observation:temple}),null,tag+'Temple requires distinct answer');
    same(policy.ropeRainPlan({observation:{...temple,ownHand:[rope,A.pokestop]}})?.plan.prizes,5,tag+'Temple with stadium answer');
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
    same(runRoot(p,loading,[play('compress',A.compressor),pass]),action('compress'),tag+'same-turn loader root');
    same(runPrompt(p,{...loading,ownHand:[]},cards(loading,A.compressor,'Battle Compressor','deck',
      [U,C,U,A.unown],0,3)),choose('c1','c0'),tag+'loader chooses exact two physical cards');
    same(policy.activeLoadPlan({...loading,ownPublic:{...loading.ownPublic,bench:[]}}),null,tag+'do not dump before live Bomb');
    same(policy.activeLoadPlan({...loading,globalTurn:1}),null,tag+'do not expose turn-one Energy');
    same(policy.activeLoadPlan({...loading,opponentPublic:{...double,bench:[slot('Unknown Pokemon XYZ',{hp:320})]}}),null,tag+'unknown target fails closed');
    const noSight={...loading,ownHand:[full.sight],ownPublic:{...loading.ownPublic,active:{...rain,tools:[]},discard:[R,R,R,R,C,C,C,C,U]}};
    same(runRoot(p,noSight,[play('sight',full.sight,{zone:'active',index:0,printing:A.raichu}),pass]),action('sight'),tag+'Sight crosses two-VMAX threshold');
    const manual={...loading,ownHand:[C,U],ownPublic:{...loading.ownPublic,discard:[R,R,R,R,C,C,C,U]}};
    const attachC=play('counter',C,{zone:'active',index:0,printing:A.raichu}),attachU=play('unit',U,{zone:'active',index:0,printing:A.raichu});
    same(runRoot(p,manual,[attachU,attachC,pass]),action('counter'),tag+'Counter attachment activates after Bomb');
    const joust={...hooded,ownHand:[R,C,U]};
    const toK=(token,energy)=>play(token,energy,{zone:'active',index:0,printing:A.klefki});
    same(runRoot(p,joust,[toK('reversal',R),toK('counter',C),toK('unit',U),pass]),action('unit'),tag+'cheap Unit funds Hood-removing Joust');

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
