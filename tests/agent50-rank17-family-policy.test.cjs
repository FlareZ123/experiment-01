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
      targetIndex:target.index}: {})},...(target?{targetPrinting:target.printing}: {})});
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
