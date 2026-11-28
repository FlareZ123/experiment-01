'use strict';
// Research-only, no dependency, no native simulations. Supply trusted worker source.
// Node usage:
// node -e "const fs=require('fs');const h=require('./results/methodology/2026-11/agent2-direct-terminal-causal-scope-reproduce.cjs');console.log(h.run(fs.readFileSync(process.argv[1],'utf8')))" path/to/agent46-two-profile-candidate-policy.cjs
const EFFECT_ROWS=Object.freeze([
  ['Kyurem SFA','Plasma Bane'],
  ['Hisuian Goodra VSTAR LOR','Moisture Star'],
  ['Galarian Stunfisk SSH','Snap Trap'],
  ['Rotom V LOR','Instant Charge'],
  ['Articuno-GX CES','Legendary Ascent'],
  ['Snorlax PGO','Block'],
  ['Dusknoir PRE','Cursed Blast'],
  ['Dusclops PRE','Cursed Blast'],
  ['Dusknoir BCR','Sinister Hand'],
  ['Radiant Alakazam SIT','Painful Spoons'],
  ['Bloodmoon Ursaluna ex TWM','Seasoned Skill'],
  ['Vileplume-GX CEC','Fragrant Flower Garden'],
  ['Gloom UNB','Irresistible Aroma'],
  ['Meloetta ex BLK','Debut Performance'],
  ['Pikachu LOR','Pika Dash'],
  ['Mr. Mime PLF','Bench Barrier'],
  ['Koffing CEC','Blow-Away Bomb'],
  ['Oranguru V ASR','Back Order'],
  ['Oricorio-GX CEC','Dance of Tribute']
]);
const MARKER='function cleanPublicTerminalView(view,direct=false,extraHarmlessAbility=null){';
const PREDICATE='(direct&&directTerminalHarmlessAbility(slot,a)) ||';
function patchWorker(src){
  if(typeof src!=='string'||src.split(MARKER).length!==2||src.split(PREDICATE).length!==2)
    throw new Error('Worker implementation anchor missing or duplicated: no patch applied');
  const helper=[
    'const SOURCE_ABILITY_DIRECT_FINAL_SAFE = Object.freeze('+JSON.stringify(EFFECT_ROWS)+');',
    'function sourceAbilityDirectFinalHarmless(slot,a,view){',
    " if(a==='Safeguard'&&hasName(slot?.printing,'Mimikyu PAL'))return slot!==view.opponentPublic.active;",
    ' return SOURCE_ABILITY_DIRECT_FINAL_SAFE.some(row=>row[1]===a&&hasName(slot?.printing,row[0]));',
    '}'
  ].join('\n')+'\n';
  return src.replace(MARKER,helper+MARKER).replace(PREDICATE,
    PREDICATE+'\n    (direct&&sourceAbilityDirectFinalHarmless(slot,a,view)) ||');
}
function compileWorker(source){
  const module={exports:{}};
  new Function('module','exports',source)(module,module.exports);
  if(typeof module.exports.createPolicy!=='function')throw new Error('No policy function exported');
  return module.exports;
}
const ENERGY='Psychic Energy SVE';
function pokemon(printing,hp=150,damage=0,ability=null,options={}){
  return {printing,name:printing.replace(/\s+[A-Z0-9]+\s+\d+$/,''),
    hp,damage,abilities:ability?[ability]:[],abilitySuppressions:[],
    energies:options.energies??[],tools:[],specialConditions:[],publicRestrictions:{},
    printed:{types:options.types??['Psychic'],subtypes:options.subtypes??['Basic'],
      stage:'BASIC',retreatCost:[],weakness:[],resistance:[]},attacks:options.attacks??[]};
}
function vmax(){
  return pokemon('Shadow Rider Calyrex VMAX CRE 75',320,0,'Underworld Door',{
    subtypes:['VMAX','V'],energies:[ENERGY,ENERGY,ENERGY],
    attacks:[{name:'Max Geist',cost:['Colorless','Colorless','Colorless'],damage:'10+'}]});
}
const basic=()=>pokemon('Shadow Rider Calyrex V CRE 74',210);
const reg=(damage=200)=>pokemon('Regidrago VSTAR SIT 136',280,damage,'Legacy Star',{types:['Dragon'],subtypes:['VSTAR']});
const mimic=()=>pokemon('Mimikyu PAL 97',70,0,'Safeguard');
const m=(p,a,h=150,d=0)=>pokemon(p,h,d,a);
function player(active,bench=[],prizes=6){
  return {active,bench:[...bench,...Array(Math.max(0,5-bench.length)).fill(null)],
    stadium:[],discard:[],lostZone:[],handCount:5,deckCount:20,prizeCount:prizes,
    publicTurnRestrictions:{gxUsed:false,vstarUsed:false}};
}
const PROFILES=[
 {schema:'agent46-candidate-profile-v1',profileId:'hood-shield-shadow-rider-v1',
  deckSha256:'1cc3d2080b40c7a9e0c61297439ba5d1ae34f9211ba9b24fcffffb2786a3e924'},
 {schema:'agent46-candidate-profile-v1',profileId:'lockbridge-shadow-rider-v1',
  deckSha256:'011cb8481b473c8566935d6835fc9a2a5762e4f09349f23c8284ec19b0cac642'}
];
function fixtures(){
  return [
    ['Regidrago + Kyurem + Goodra',reg(),
      [m('Kyurem SFA 47','Plasma Bane'),m('Hisuian Goodra VSTAR LOR 136','Moisture Star')],['energy','max']],
    ['reactive Snap Trap target',m('Galarian Stunfisk SSH 132','Snap Trap',120,50),
      [basic()],['energy','max']],
    ['rank3 compound source board',m('Galarian Stunfisk SSH 132','Snap Trap',120,50),
      [m('Snorlax PGO 55','Block'),mimic(),m('Rotom V LOR 58','Instant Charge'),
       m('Articuno-GX CES 31','Legendary Ascent')],['energy','max']],
    ['rank31 five-Pokemon board',m('Bloodmoon Ursaluna ex TWM 141','Seasoned Skill',260,190),
      [m('Dusknoir PRE 37','Cursed Blast'),m('Dusclops PRE 36','Cursed Blast'),
       m('Dusknoir BCR 63','Sinister Hand'),m('Radiant Alakazam SIT 59','Painful Spoons')],
      ['energy','max']],
    ['rank2 Gloom and Bench Barrier',reg(),
      [m('Gloom UNB 7','Irresistible Aroma'),m('Mr. Mime PLF 47','Bench Barrier')],
      ['energy','max']],
    ['rank26 Meloetta ex',m('Meloetta ex BLK 44','Debut Performance',190,120),
      [basic()],['energy','max']],
    ['Active Mimikyu PAL Safeguard',mimic(),[basic()],['energy','energy']],
    ['unknown reactive Sturdy',reg(),[m('Crustle BLK 14','Sturdy')],['energy','energy']],
    ['unadmitted Stone Fighting Energy',reg(),
      [{...mimic(),energies:['Stone Fighting Energy VIV']}],['energy','energy']],
    ['nonlethal Regidrago',reg(0),[m('Kyurem SFA 47','Plasma Bane')],['energy','energy']],
    ['already harmless ordinary bench',reg(),[basic()],['max','max']]
  ];
}
function request(seat,opp,bench){
  const active=vmax();
  return {role:'candidate',seat,prompt:null,publicEventReceipt:null,
    observation:{actorSeat:seat,globalTurn:3,phase:2,decisionKind:'owner-root',
      ownHand:[ENERGY],ownPublic:player(active,[basic()],1),opponentPublic:player(opp,bench),
      ownTurnResources:{supporterPlayedTurn:0,energyPlayedTurn:false,
        retreatedTurn:0,vstarUsed:false},ownerK1:null},
    actionFrontier:{items:[
      {kind:'attack',token:'max',attackName:'Max Geist'},
      {kind:'play-card',token:'energy',actorPrinting:ENERGY,targetPrinting:active.printing,
        publicMetadata:{targetSeat:'actor',targetZone:'active',targetIndex:0}},
      {kind:'pass',token:'pass'}]}};
}
function run(workerSource){
  const baseline=compileWorker(workerSource),patched=compileWorker(patchWorker(workerSource));
  let groups=0,changed=0;const errors=[];
  for(const seat of [0,1])for(const config of PROFILES)
    for(const [label,op,bench,expected] of fixtures()){
      const req=request(seat,op,bench);
      const received=[baseline,patched].map(worker=>
        worker.createPolicy({role:'candidate',seat,policyVersion:worker.POLICY_VERSION,config})
          .decide(req).token);
      groups++;
      if(received[0]!==received[1])changed++;
      if(received.join('|')!==expected.join('|'))
        errors.push({seat,profile:config.profileId,label,expected,received});
    }
  const summary={schema:'agent2-direct-terminal-causal-scope-v1',
    workerBytes:workerSource.length,sourceQualifiedRows:EFFECT_ROWS.length+1,
    groups,pairedWorkerDecisions:groups*2,changed,unchanged:groups-changed,
    allMatched:errors.length===0,errors};
  if(errors.length)throw new Error(JSON.stringify(summary));
  return summary;
}
module.exports={EFFECT_ROWS,patchWorker,run};
