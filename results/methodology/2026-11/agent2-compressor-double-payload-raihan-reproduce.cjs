'use strict';
// Research-only source-worker differential regression. No engine/CI/game.
const BATTLE='Battle Compressor PHF 92',SEEKER='VS Seeker PHF 109';
const RAIHAN='Raihan EVS 152',TEAMMATES='Teammates PRC 141';
const ENERGY='Psychic Energy MEE';
const ANCHORS={
 helper:'function compressorRaihanFuelNeed(view,receipt) {',
 root:'const needed=Math.max(seeker,raihanFuel,stretcherFuel,stretcherPokemon);',
 pair:'      compressorStretcherEnergyNeed(view,receipt));\n    rows = choices.map(choice => {',
 rows:"        isPsychic&&Number.isFinite(fuel)?2000+fuel:-Infinity,\n        -discardValue(view,choice.printing,receipt))",
 selection:"    selected = ranked.filter(row=>Number.isFinite(row.score)&&row.score>0)\n      .slice(0,Math.min(1,maximum)).map(row=>row.choice);"
};
function replaceOne(src,needle,replacement){
 if(typeof src!=='string'||src.split(needle).length!==2)
   throw Error('Missing or ambiguous exact worker source anchor: '+needle.slice(0,40));
 return src.replace(needle,replacement);
}
function patchWorker(src){
 const helper=[
 'function compressorRaihanDoubleDumpNeed(view,receipt){',
 ' if(receipt?.priorOpponentTurnKO?.any!==true||!supporterAvailable(view)||',
 "  energyAvailableNow(view)||!handHas(view,'VS Seeker')||handHas(view,'Raihan')||",
 "  discardHas(view,'Raihan')||discardHas(view,'Psychic Energy')||",
 "  knownFullyPrized(view,'Raihan')||view.ownPublic.deckCount<3||",
 "  (view.ownPublic.lostZone??[]).some(p=>hasName(p,'Raihan')))return -Infinity;",
 " const projected=viewAfterPsychicAttachment(view,'active',0,'Psychic Energy MEE');",
 " return projected&&publicFinalAttack(projected,new Set(['Max Geist']))?160:-Infinity;",
 '}'
 ].join('\n')+'\n';
 let out=replaceOne(src,ANCHORS.helper,helper+ANCHORS.helper);
 out=replaceOne(out,ANCHORS.root,
  'const needed=Math.max(seeker,raihanFuel,stretcherFuel,stretcherPokemon,compressorRaihanDoubleDumpNeed(view,receipt));');
 out=replaceOne(out,ANCHORS.pair,[
 '      compressorStretcherEnergyNeed(view,receipt));',
 '    const pair=compressorRaihanDoubleDumpNeed(view,receipt);',
 '    const pairEligible=Number.isFinite(pair)&&prompt.publicMetadata?.maximumCount>=2&&',
 "      choices.some(choice=>hasName(choice.printing,'Raihan'))&&",
 "      choices.some(choice=>isBasicEnergyPrinting(choice.printing)&&hasName(choice.printing,'Psychic Energy'));",
 '    rows = choices.map(choice => {'
 ].join('\n'));
 out=replaceOne(out,ANCHORS.rows,[
 '        isPsychic&&Number.isFinite(fuel)?2000+fuel:-Infinity,',
 "        pairEligible&&(hasName(choice.printing,'Raihan')||isPsychic)?2000+pair:-Infinity,",
 '        -discardValue(view,choice.printing,receipt))'
 ].join('\n'));
 out=replaceOne(out,ANCHORS.selection,[
 '    const pair=compressorRaihanDoubleDumpNeed(view,receipt);',
 "    const raihan=ranked.find(row=>hasName(row.choice.printing,'Raihan'));",
 "    const psychic=ranked.find(row=>isBasicEnergyPrinting(row.choice.printing)&&hasName(row.choice.printing,'Psychic Energy'));",
 '    if(Number.isFinite(pair)&&raihan&&psychic&&raihan.choice.token!==psychic.choice.token&&maximum>=2)',
 '      selected=[raihan.choice,psychic.choice];',
 '    else selected=ranked.filter(row=>Number.isFinite(row.score)&&row.score>0)',
 '      .slice(0,Math.min(1,maximum)).map(row=>row.choice);'
 ].join('\n'));
 return out;
}
function load(source){
 const module={exports:{}};
 new Function('module','exports',source)(module,module.exports);
 return module.exports;
}
function pokemon(printing,o={}){
 return {printing,hp:o.hp??210,damage:o.damage??0,abilities:o.abilities??[],
 abilitySuppressions:[],energies:o.energies??[],tools:[],attacks:o.attacks??[],
 specialConditions:[],publicRestrictions:{},printed:{types:o.types??['Psychic'],
 subtypes:o.subtypes??['Basic'],stage:'BASIC',
 retreatCost:[],weakness:[],resistance:[]}};
}
const vmax=()=>pokemon('Shadow Rider Calyrex VMAX CRE',{
 hp:320,subtypes:['V','VMAX'],energies:[ENERGY,ENERGY],abilities:['Underworld Door'],
 attacks:[{name:'Max Geist',cost:['Colorless','Colorless','Colorless'],damage:'10+'}]});
const v=()=>pokemon('Shadow Rider Calyrex V CRE',{hp:210,subtypes:['Basic','V']});
const dedenne=damage=>pokemon('Dedenne-GX UNB',{
 hp:160,damage,subtypes:['Basic','GX'],abilities:['Dedechange']});
const regidrago=()=>pokemon('Regidrago VSTAR SIT',{
 hp:280,subtypes:['VSTAR'],types:['Dragon'],abilities:['Legacy Star']});
function player(active,bench=[],prizeCount=6,discard=[]){
 return {active,bench:[...bench,...Array(Math.max(0,5-bench.length)).fill(null)],
 prizeCount,handCount:0,deckCount:28,discard,lostZone:[],stadium:[],
 publicTurnRestrictions:{gxUsed:false,vstarUsed:false,stadiumAndToolHaveNoEffectTurnsRemaining:0,
 attackLockTurnsRemaining:0,attackMaxEnergyTurnsRemaining:0}};
}
const PROFILES=[
 {schema:'agent46-candidate-profile-v1',profileId:'hood-shield-shadow-rider-v1',
 deckSha256:'1cc3d2080b40c7a9e0c61297439ba5d1ae34f9211ba9b24fcffffb2786a3e924'},
 {schema:'agent46-candidate-profile-v1',profileId:'lockbridge-shadow-rider-v1',
 deckSha256:'011cb8481b473c8566935d6835fc9a2a5762e4f09349f23c8284ec19b0cac642'}
];
function view(seat,o={}){
 const hand=o.hand??[SEEKER],discard=o.discard??[BATTLE];
 const active=o.active??vmax(),defender=o.defender??dedenne(o.damage??80);
 const own=player(active,[v()],o.prizes??2,discard);
 const opp=player(defender,[regidrago()]);
 own.handCount=hand.length;own.deckCount=o.deckCount??28;
 if(o.lostZone)own.lostZone=o.lostZone;
 return {actorSeat:seat,globalTurn:3,phase:2,decisionKind:'owner-prompt',
 ownHand:hand,ownPublic:own,opponentPublic:opp,
 ownTurnResources:{supporterPlayedTurn:0,energyPlayedTurn:o.stamp??3,
 retreatedTurn:0,vstarUsed:false},ownerK1:null};
}
function choice(printing,i){
 return {token:'c'+i,kind:'card',printing,
 publicMetadata:{ownerSeat:'actor',isOwnerVisible:true}};
}
function battlePrompt(seat,rows,max=3){
 return {actingSeat:seat,promptType:'ChooseCardsPrompt',description:null,
 source:{classification:'actor-choice',sourceKind:'card-effect',sourcePrinting:BATTLE,effectName:'Battle Compressor'},
 publicMetadata:{selectionType:'card-combination',ownerSeat:'actor',isOwnerVisible:true,
 sourceZone:'deck',minimumCount:0,maximumCount:max},
 choices:[...rows.map(choice),{kind:'empty-selection',token:'empty'}]};
}
function request(seat,observation,prompt,receipt={priorOpponentTurnKO:{any:true}}){
 return {role:'candidate',seat,observation:{...observation,
 decisionKind:prompt?'owner-prompt':'owner-root',
 pendingPromptType:prompt?.promptType??null},
 prompt,publicEventReceipt:receipt,...(prompt?{}:{actionFrontier:{items:[]}})};
}
function workerDecide(w,config,seat,observation,prompt,receipt){
 return w.createPolicy({role:'candidate',seat,policyVersion:w.POLICY_VERSION,config})
   .decide(request(seat,observation,prompt,receipt));
}
const CASES=[
 {label:'two cards jointly unlock spent-manual terminal',rows:[RAIHAN,ENERGY,TEAMMATES,'Sky Field ROS 89'],positive:true},
 {label:'two cards with duplicate Basic Psychic',rows:[RAIHAN,ENERGY,ENERGY,TEAMMATES],positive:true},
 {label:'Raihan and Psychic only, still pair',rows:[RAIHAN,ENERGY,'Sky Field ROS 89'],positive:true},
 {label:'manual attachment available: Teammates dominates pair',rows:[RAIHAN,ENERGY,TEAMMATES],overrides:{stamp:0}},
 {label:'no previous opposing-turn KO',rows:[RAIHAN,ENERGY,TEAMMATES],receipt:{priorOpponentTurnKO:{any:false}}},
 {label:'no VS Seeker held',rows:[RAIHAN,ENERGY,TEAMMATES],overrides:{hand:[]}},
 {label:'Raihan already held, one Psychic sufficient',rows:[RAIHAN,ENERGY,TEAMMATES],overrides:{hand:[SEEKER,RAIHAN]}},
 {label:'Raihan already in discard, one Psychic sufficient',rows:[RAIHAN,ENERGY,TEAMMATES],overrides:{discard:[BATTLE,RAIHAN]}},
 {label:'Psychic already in discard, one Raihan sufficient',rows:[RAIHAN,ENERGY,TEAMMATES],overrides:{discard:[BATTLE,ENERGY]}},
 {label:'Raihan missing from revealed legal deck choices',rows:[ENERGY,TEAMMATES,'Sky Field ROS 89']},
 {label:'Psychic missing from revealed deck choices',rows:[RAIHAN,TEAMMATES,'Sky Field ROS 89']},
 {label:'maximumCount one, pair illegal',rows:[RAIHAN,ENERGY,TEAMMATES],maximum:1},
 {label:'opposing Dedenne undamaged, not a terminal attack',rows:[RAIHAN,ENERGY,TEAMMATES],overrides:{damage:0}},
 {label:'three own Prizes remain: Dedenne 2 insufficient',rows:[RAIHAN,ENERGY,TEAMMATES],overrides:{prizes:3}},
 {label:'deck too small to discard 2 and search after Raihan',rows:[RAIHAN,ENERGY,TEAMMATES],overrides:{deckCount:2}},
 {label:'Raihan in Lost Zone',rows:[RAIHAN,ENERGY,TEAMMATES],overrides:{lostZone:[RAIHAN]}}
];
function root(seat,observation,frontier,receipt={priorOpponentTurnKO:{any:true}}){
 const q=request(seat,observation,null,receipt);
 q.actionFrontier={items:frontier};
 return q;
}
function nextAction(w,profile,seat,observation,frontier,receipt){
 return w.createPolicy({role:'candidate',seat,policyVersion:w.POLICY_VERSION,config:profile})
  .decide(root(seat,observation,frontier,receipt));
}
function run(source){
 const original=load(source),patched=load(patchWorker(source));
 let promptGroups=0,changed=0;const errors=[];
 for(const seat of [0,1])for(const profile of PROFILES)for(const c of CASES){
  const vb=view(seat,c.overrides??{});
  const prompt=battlePrompt(seat,c.rows,c.maximum??3);
  const decisions=[original,patched].map(w=>workerDecide(w,profile,seat,vb,prompt,c.receipt));
  const before=JSON.stringify(decisions[0]),after=JSON.stringify(decisions[1]);
  promptGroups++;if(before!==after)changed++;
  if(c.positive){
   const expected=['c0','c1'];
   if(JSON.stringify(decisions[1].tokens)!==JSON.stringify(expected)||
     decisions[0].tokens?.length!==1)
    errors.push({where:'positive-prompt',seat,profile:profile.profileId,label:c.label,decisions});
  }else if(before!==after)
   errors.push({where:'control-changed',seat,profile:profile.profileId,label:c.label,decisions});
 }
 let continuationChecks=0;
 // Real sequence: Item root -> two-card deck discard prompt -> VS Seeker
 // root and discard selection -> Raihan Supporter root -> attach to powered
 // Active from discard (normal attachment already consumed) -> final attack.
 for(const seat of [0,1])for(const profile of PROFILES){
  const initial=view(seat,{hand:[BATTLE,SEEKER],discard:[]});
  const itemRoot=nextAction(patched,profile,seat,initial,
    [{kind:'play-card',token:'compressor',actorPrinting:BATTLE},
     {kind:'play-card',token:'seeker',actorPrinting:SEEKER},
     {kind:'pass',token:'pass'}],{priorOpponentTurnKO:{any:true}});
  continuationChecks++;
  if(itemRoot.token!=='compressor')errors.push({where:'item-root',seat,profile:profile.profileId,got:itemRoot});
  const postDiscard=view(seat,{hand:[SEEKER],discard:[BATTLE,RAIHAN,ENERGY],deckCount:26});
  const seekerRoot=nextAction(patched,profile,seat,postDiscard,
    [{kind:'play-card',token:'seeker',actorPrinting:SEEKER},
     {kind:'pass',token:'pass'}],{priorOpponentTurnKO:{any:true}});
  continuationChecks++;
  if(seekerRoot.token!=='seeker')errors.push({where:'seeker-root',seat,profile:profile.profileId,got:seekerRoot});
  const seekerPrompt={actingSeat:seat,promptType:'ChooseCardsPrompt',description:null,
    source:{classification:'actor-choice',sourceKind:'card-effect',sourcePrinting:SEEKER,effectName:'VS Seeker'},
    publicMetadata:{selectionType:'card-combination',ownerSeat:'actor',isOwnerVisible:true,
     sourceZone:'discard',minimumCount:1,maximumCount:1},
    choices:[choice(RAIHAN,0),choice(ENERGY,1),choice(BATTLE,2)]};
  const retrieved=workerDecide(patched,profile,seat,postDiscard,seekerPrompt,{priorOpponentTurnKO:{any:true}});
  continuationChecks++;
  if(JSON.stringify(retrieved.tokens)!=='["c0"]')errors.push({where:'seeker-prompt',seat,profile:profile.profileId,got:retrieved});
  const postSeeker=view(seat,{hand:[RAIHAN],discard:[BATTLE,SEEKER,ENERGY],deckCount:26});
  const raihanRoot=nextAction(patched,profile,seat,postSeeker,
    [{kind:'play-card',token:'raihan',actorPrinting:RAIHAN},
     {kind:'pass',token:'pass'}],{priorOpponentTurnKO:{any:true}});
  continuationChecks++;
  if(raihanRoot.token!=='raihan')errors.push({where:'raihan-root',seat,profile:profile.profileId,got:raihanRoot});
  const attachmentPrompt={actingSeat:seat,promptType:'AttachEnergyPrompt',description:null,
   source:{classification:'actor-choice',sourceKind:'card-effect',sourcePrinting:RAIHAN,effectName:'Raihan'},
   publicMetadata:{selectionType:'energy-attachment',ownerSeat:'actor',sourceZone:'discard',isOwnerVisible:true,
     minimumCount:1,maximumCount:1,energyType:'BASIC',allowCancel:false},
   choices:[{kind:'energy',token:'attach-active',printing:ENERGY,
    publicMetadata:{ownerSeat:'actor',sourceZone:'discard',isOwnerVisible:true,energyType:'BASIC',zone:'active'}},
    {kind:'energy',token:'attach-bench',printing:ENERGY,
    publicMetadata:{ownerSeat:'actor',sourceZone:'discard',isOwnerVisible:true,energyType:'BASIC',zone:'bench',benchIndex:0}}]};
  const attach=workerDecide(patched,profile,seat,postSeeker,attachmentPrompt,{priorOpponentTurnKO:{any:true}});
  continuationChecks++;
  if(attach.token!=='attach-active')errors.push({where:'raihan-energy-target',seat,profile:profile.profileId,got:attach});
  const afterAttachment=view(seat,{hand:[],discard:[BATTLE,SEEKER,RAIHAN],deckCount:25});
  afterAttachment.ownPublic.active.energies.push(ENERGY);
  afterAttachment.ownTurnResources.supporterPlayedTurn=1;
  const win=nextAction(patched,profile,seat,afterAttachment,
    [{kind:'attack',token:'max',attackName:'Max Geist'},
     {kind:'pass',token:'pass'}],{priorOpponentTurnKO:{any:true}});
  continuationChecks++;
  if(win.token!=='max')errors.push({where:'final-max-geist',seat,profile:profile.profileId,got:win});
 }
 const result={schema:'agent2-double-payload-compressor-raihan-v1',
  workerBytes:source.length,promptGroups,pairedPromptCalls:promptGroups*2,
  changed,unchanged:promptGroups-changed,continuationChecks,
  allMatched:errors.length===0,errors};
 if(errors.length)throw Error(JSON.stringify(result));
 return result;
}
module.exports={patchWorker,run};
