'use strict';
// Direct terminal conditional Spiky retaliation; actor-visible policy source test.
const SOURCE_ENERGIES=Object.freeze(['Spiky Energy JTG 159','Spiky Energy JTG 190']);
const INJECT_BEFORE='function directTerminalSafeStadium(stadium,view){';
const PREDICATE='(direct && directTerminalSafeSpecialEnergy(p,slot))))&&';
function replaceOne(src,oldText,newText) {
 if(typeof src!=='string'||src.split(oldText).length!==2)
   throw new Error('Missing/duplicate exact source patch anchor: '+oldText.slice(0,80));
 return src.replace(oldText,newText);
}
function patchWorker(source){
 const helper=[
 "const SOURCE_SPIKY_ENERGIES = Object.freeze("+JSON.stringify(SOURCE_ENERGIES)+");",
 "function spikyEnergyDirectFinalSafe(energy,slot,view){",
 " if(!SOURCE_SPIKY_ENERGIES.includes(energy))return false;",
 " if(slot!==view.opponentPublic.active)return true;",
 " const active=view.ownPublic.active;",
 " if(!Number.isFinite(active?.hp)||!Number.isFinite(active?.damage))return false;",
 " const copies=(slot.energies??[]).filter(e=>SOURCE_SPIKY_ENERGIES.includes(e)).length;",
 " return copies>0&&active.hp-active.damage>20*copies;",
 "}"
 ].join('\n')+'\n';
 return replaceOne(replaceOne(source,INJECT_BEFORE,helper+INJECT_BEFORE),
  PREDICATE,
  '(direct && (directTerminalSafeSpecialEnergy(p,slot)||spikyEnergyDirectFinalSafe(p,slot,view)))))&&');
}
function compile(source){
 const module={exports:{}};
 new Function('module','exports',source)(module,module.exports);
 return module.exports;
}
const ENERGY='Psychic Energy MEE',SPIKY=SOURCE_ENERGIES[0];
function pokemon(printing,o={}){
 return {printing,hp:o.hp??230,damage:o.damage??0,abilities:o.abilities??[],
 abilitySuppressions:[],energies:o.energies??[],tools:o.tools??[],
 specialConditions:[],attacks:o.attacks??[],publicRestrictions:{},
 printed:{types:o.types??['Lightning'],subtypes:o.subtypes??['Basic','ex'],
 stage:'BASIC',retreatCost:[],weakness:[],resistance:[]}};
}
const vmax=(damage=0)=>pokemon('Shadow Rider Calyrex VMAX CRE',{
 hp:320,damage,types:['Psychic'],subtypes:['VMAX','V'],
 energies:[ENERGY,ENERGY,ENERGY],abilities:['Underworld Door'],
 attacks:[{name:'Max Geist',cost:['Colorless','Colorless','Colorless'],damage:'10+'}]});
const v=()=>pokemon('Shadow Rider Calyrex V CRE',{
 hp:210,types:['Psychic'],subtypes:['Basic','V']});
const thorns=(damage=150,energies=[SPIKY])=>pokemon('Iron Thorns ex TWM',{
 hp:230,damage,abilities:['Initialization'],energies});
const regidrago=()=>pokemon('Regidrago VSTAR SIT',{
 hp:280,subtypes:['VSTAR'],types:['Dragon'],abilities:['Legacy Star']});
function player(active,bench=[],prizes=6){
 return {active,bench:[...bench,...Array(Math.max(0,5-bench.length)).fill(null)],
 prizeCount:prizes,handCount:1,deckCount:15,stadium:[],discard:[],lostZone:[],
 publicTurnRestrictions:{gxUsed:false,vstarUsed:false}};
}
const PROFILES=[
 {schema:'agent46-candidate-profile-v1',profileId:'hood-shield-shadow-rider-v1',
 deckSha256:'1cc3d2080b40c7a9e0c61297439ba5d1ae34f9211ba9b24fcffffb2786a3e924'},
 {schema:'agent46-candidate-profile-v1',profileId:'lockbridge-shadow-rider-v1',
 deckSha256:'011cb8481b473c8566935d6835fc9a2a5762e4f09349f23c8284ec19b0cac642'}
];
function fixtures() {return [
 {label:'one Spiky active and full-health attacker',opp:thorns(),bench:[regidrago()],ownDamage:0,expected:['energy','max']},
 {label:'two Spiky active and full-health attacker',opp:thorns(150,[SPIKY,SPIKY]),bench:[regidrago()],ownDamage:0,expected:['energy','max']},
 {label:'one Spiky active, attacker HP30',opp:thorns(),bench:[regidrago()],ownDamage:290,expected:['energy','max']},
 {label:'one Spiky active, attacker HP20',opp:thorns(),bench:[regidrago()],ownDamage:300,expected:['energy','energy']},
 {label:'two Spiky active, attacker HP30',opp:thorns(150,[SPIKY,SPIKY]),bench:[regidrago()],ownDamage:290,expected:['energy','energy']},
 {label:'two Spiky active, attacker HP40',opp:thorns(150,[SPIKY,SPIKY]),bench:[regidrago()],ownDamage:280,expected:['energy','energy']},
 {label:'two Spiky active, attacker HP50',opp:thorns(150,[SPIKY,SPIKY]),bench:[regidrago()],ownDamage:270,expected:['energy','max']},
 {label:'one alternate Spiky JTG 190 active',opp:thorns(150,[SOURCE_ENERGIES[1]]),bench:[regidrago()],ownDamage:0,expected:['energy','max']},
 {label:'one Spiky only on Bench; attacker HP10',opp:thorns(150,[ENERGY]),bench:[{...regidrago(),energies:[SPIKY]}],ownDamage:310,expected:['energy','max']},
 {label:'active unknown Spiky printing fails closed',opp:thorns(150,['Spiky Energy XYZ 999']),bench:[regidrago()],ownDamage:0,expected:['energy','energy']},
 {label:'active Horror Psychic Energy remains unadmitted',opp:thorns(150,['Horror Psychic Energy RCL 172']),bench:[regidrago()],ownDamage:0,expected:['energy','energy']},
 {label:'full HP Iron Thorns cannot be Knocked Out',opp:thorns(0,[SPIKY]),bench:[regidrago()],ownDamage:0,expected:['energy','energy']},
 {label:'ordinary Psychic Energy already allowed',opp:thorns(150,[ENERGY]),bench:[regidrago()],ownDamage:0,expected:['max','max']},
 {label:'unknown non-Rule-Box Benched Sturdy remains veto',opp:thorns(),bench:[pokemon('Crustle BLK 14',{hp:130,abilities:['Sturdy'],subtypes:['Stage 1']})],ownDamage:0,expected:['energy','energy']}
];}
function request(seat,row){
 const active=vmax(row.ownDamage),view={actorSeat:seat,globalTurn:3,phase:2,
 decisionKind:'owner-root',ownHand:[ENERGY],ownPublic:player(active,[v()],2),
 opponentPublic:player(row.opp,row.bench),ownerK1:null,
 ownTurnResources:{supporterPlayedTurn:0,energyPlayedTurn:0,retreatedTurn:0,vstarUsed:false}};
 return {role:'candidate',seat,observation:view,prompt:null,
 actionFrontier:{items:[
  {token:'energy',kind:'play-card',actorPrinting:ENERGY,targetPrinting:active.printing,
   publicMetadata:{targetSeat:'actor',targetZone:'active',targetIndex:0}},
  {token:'max',kind:'attack',attackName:'Max Geist'},
  {token:'pass',kind:'pass'}]}};
}
function run(source){
 const baseline=compile(source),patched=compile(patchWorker(source));
 let paired=0,changed=0;const errors=[];
 for(const seat of [0,1])for(const config of PROFILES)
  for(const row of fixtures()){
   const req=request(seat,row);
   const decisions=[baseline,patched].map(w=>
    w.createPolicy({role:'candidate',seat,policyVersion:w.POLICY_VERSION,config}).decide(req).token);
   paired++;if(decisions[0]!==decisions[1])changed++;
   if(decisions.join('|')!==row.expected.join('|'))
    errors.push({seat,profile:config.profileId,label:row.label,expected:row.expected,decisions});
  }
 const result={schema:'agent2-spiky-conditional-final-v1',
  exactSourcePrintings:SOURCE_ENERGIES,scenarios:fixtures().length,
  pairedGroups:paired,workerDecisions:2*paired,changed,unchanged:paired-changed,
  allMatched:errors.length===0,errors};
 if(errors.length)throw Error(JSON.stringify(result));
 return result;
}
module.exports={patchWorker,run};
