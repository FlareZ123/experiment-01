'use strict';
// Research-only: compile trusted candidate worker exactly as supplied, then a
// bounded in-memory free-retreat-after-Guzma projection. No engine or CI runs.
const ANCHORS=Object.freeze({
 helper:'function guzmaPlans(view,receipt=null) {',
 terminal:'      const terminal=guzmaProjectedFinalAttack(moved);\n      if(terminal){\n        const prizes=prizeLiability(target);\n        const score=prizes*1500+attackScore(attacker,terminal.attack,moved,target,{requirePayable:true})-prizeLiability(attacker)*100;',
 own:'      return {...row,terminal:!!guzmaProjectedFinalAttack(moved),score:guzmaPivotScore(view,moved,row.target.index,receipt)};'
});
function replaceOne(src,anchor,replacement){
 if(typeof src!=='string'||src.split(anchor).length!==2)throw Error('Absent or duplicate source anchor');
 return src.replace(anchor,replacement);
}
function patchWorker(src){
 const helper=[
 'function guzmaFreePivotFinal(before,after,index){',
 ' if(index<0||!retreatAvailableNow(after)||ownRetreatCost(after)!==0)return null;',
 ' const original=before.ownPublic.active,benched=after.ownPublic.bench[index];',
 ' if(!original||!benched||benched.printing!==original.printing)return null;',
 " const returned=guzmaSwitch(after,'ownPublic',index);",
 ' const projected={...returned,ownTurnResources:{...returned.ownTurnResources,retreatedTurn:returned.globalTurn}};',
 ' const final=guzmaProjectedFinalAttack(projected);',
 ' return final?{final,projected}:null;',
 '}'].join('\n')+'\n';
 let out=replaceOne(src,ANCHORS.helper,helper+ANCHORS.helper);
 out=replaceOne(out,ANCHORS.terminal,[
 '      const direct=guzmaProjectedFinalAttack(moved);',
 '      const freePivot=direct?null:guzmaFreePivotFinal(view,moved,ownIndex);',
 '      const terminal=direct??freePivot?.final;',
 '      if(terminal){',
 '        const projected=freePivot?.projected??moved,terminalAttacker=projected.ownPublic.active;',
 '        const prizes=prizeLiability(target);',
 '        const score=prizes*1500+attackScore(terminalAttacker,terminal.attack,projected,target,{requirePayable:true})-prizeLiability(terminalAttacker)*100;'
 ].join('\n'));
 out=replaceOne(out,ANCHORS.own,[
 '      const direct=guzmaProjectedFinalAttack(moved);',
 '      const freePivot=direct?null:guzmaFreePivotFinal(view,moved,row.target.index);',
 '      const terminal=!!(direct||freePivot?.final);',
 '      return {...row,terminal,score:terminal?30000:guzmaPivotScore(view,moved,row.target.index,receipt)};'
 ].join('\n'));
 return out;
}
function compile(src){
 const module={exports:{}};
 new Function('module','exports',src)(module,module.exports);
 return module.exports;
}
const P='Psychic Energy MEE',GUZMA='Guzma BUS';
function pokemon(printing,o={}){
 return {printing,hp:o.hp??210,damage:o.damage??0,
 abilities:o.abilities??[],abilitySuppressions:o.supp??[],energies:o.energies??[],
 tools:o.tools??[],specialConditions:[],attacks:o.attacks??[],
 publicRestrictions:{},printed:{types:o.types??['Psychic'],
 subtypes:o.subtypes??['Basic'],stage:'BASIC',
 retreatCost:o.retreat??[],weakness:[],resistance:[]}};
}
const vmax=(count=3)=>pokemon('Shadow Rider Calyrex VMAX CRE',{
 hp:320,subtypes:['VMAX','V'],energies:Array(count).fill(P),abilities:['Underworld Door'],
 retreat:['Colorless','Colorless'],attacks:[{name:'Max Geist',cost:['Colorless','Colorless','Colorless'],damage:'10+'}]});
const latias=o=>pokemon('Latias ex SSP',{
 hp:210,abilities:['Skyliner'],subtypes:['Basic','ex'],retreat:['Colorless'],...o});
const regidrago=(damage=0)=>pokemon('Regidrago VSTAR SIT',{
 hp:280,damage,abilities:['Legacy Star'],subtypes:['VSTAR'],types:['Dragon']});
const dedenne=(damage=80)=>pokemon('Dedenne-GX UNB',{
 hp:160,damage,abilities:['Dedechange'],subtypes:['Basic','GX']});
const ordinary=()=>pokemon('Shadow Rider Calyrex V CRE',{
 hp:210,subtypes:['Basic','V'],retreat:['Colorless','Colorless']});
const weakBasic=()=>pokemon('Bunnelby PRC',{hp:90});
function player(active,bench=[],prizeCount=6,toolState=0){
 return {active,bench:[...bench,...Array(Math.max(0,5-bench.length)).fill(null)],
 prizeCount,handCount:1,deckCount:20,stadium:[],discard:[],lostZone:[],
 publicTurnRestrictions:{gxUsed:false,vstarUsed:false,
 attackLockTurnsRemaining:0,attackMaxEnergyTurnsRemaining:0,
 stadiumAndToolHaveNoEffectTurnsRemaining:toolState}};
}
const PROFILES=Object.freeze([
 {schema:'agent46-candidate-profile-v1',profileId:'hood-shield-shadow-rider-v1',
 deckSha256:'1cc3d2080b40c7a9e0c61297439ba5d1ae34f9211ba9b24fcffffb2786a3e924'},
 {schema:'agent46-candidate-profile-v1',profileId:'lockbridge-shadow-rider-v1',
 deckSha256:'011cb8481b473c8566935d6835fc9a2a5762e4f09349f23c8284ec19b0cac642'}
]);
function fixtures(){
 return [
 {label:'live Skyliner one Bench, 2 final Prizes',bench:[latias()],opp:regidrago(),oppBench:[dedenne()],ownPrizes:2,stamp:0,expected:['max','guzma']},
 {label:'live Skyliner two Bench, nonfree second VMAX',bench:[latias(),vmax(0)],opp:regidrago(),oppBench:[dedenne(),weakBasic()],ownPrizes:2,stamp:0,expected:['max','guzma']},
 {label:'retreat already used',bench:[latias()],opp:regidrago(),oppBench:[dedenne()],ownPrizes:2,stamp:3,expected:['max','max']},
 {label:'Skyliner suppressed',bench:[latias({supp:[{abilityName:'Skyliner',suppressed:true,sourcePrinting:'Silent Lab'}]})],opp:regidrago(),oppBench:[dedenne()],ownPrizes:2,stamp:0,expected:['max','max']},
 {label:'suppressed Skyliner with free Float Stone pivot',bench:[latias({supp:[{abilityName:'Skyliner',suppressed:true,sourcePrinting:'Silent Lab'}],tools:['Float Stone BKT']})],opp:regidrago(),oppBench:[dedenne()],ownPrizes:2,stamp:0,expected:['max','guzma']},
 {label:'Float Stone effect disabled and Skyliner suppressed',bench:[latias({supp:[{abilityName:'Skyliner',suppressed:true,sourcePrinting:'Silent Lab'}],tools:['Float Stone BKT']})],opp:regidrago(),oppBench:[dedenne()],ownPrizes:2,stamp:0,toolState:1,expected:['max','max']},
 {label:'Dedenne full HP, Max Geist nonlethal',bench:[latias()],opp:regidrago(),oppBench:[dedenne(0)],ownPrizes:2,stamp:0,expected:['max','max']},
 {label:'two-Prize Dedenne does not take last three Prizes',bench:[latias()],opp:regidrago(),oppBench:[dedenne()],ownPrizes:3,stamp:0,expected:['max','max']},
 {label:'only unfunded and nonfree Shadow Rider V pivot',bench:[ordinary()],opp:regidrago(),oppBench:[dedenne()],ownPrizes:2,stamp:0,expected:['max','max']},
 {label:'already-direct last-Prize active Dedenne',bench:[latias()],opp:dedenne(),oppBench:[regidrago()],ownPrizes:2,stamp:0,expected:['max','max']},
 {label:'Safeguard protects Benched target after gust',bench:[latias()],opp:regidrago(),oppBench:[pokemon('Mimikyu PAL 97',{hp:70,abilities:['Safeguard']})],ownPrizes:1,stamp:0,expected:['max','max']}
 ];
}
function viewFor(seat,c){
 const toolState=c.toolState??0;
 return {actorSeat:seat,globalTurn:3,phase:2,decisionKind:'owner-root',
 ownHand:[GUZMA],ownPublic:player(vmax(),c.bench,c.ownPrizes,toolState),
 opponentPublic:player(c.opp,c.oppBench,6,toolState),
 ownTurnResources:{supporterPlayedTurn:0,energyPlayedTurn:0,retreatedTurn:c.stamp,vstarUsed:false},
 ownerK1:null};
}
function root(seat,view,items){
 return {role:'candidate',seat,observation:{...view,decisionKind:'owner-root'},
 prompt:null,publicEventReceipt:null,actionFrontier:{items}};
}
function guzmaAttackActions(){
 return [{kind:'play-card',token:'guzma',actorPrinting:GUZMA},
 {kind:'attack',token:'max',attackName:'Max Geist'},
 {kind:'pass',token:'pass'}];
}
function rootToken(worker,profile,seat,view,items=guzmaAttackActions()){
 return worker.createPolicy({role:'candidate',seat,policyVersion:worker.POLICY_VERSION,config:profile}).decide(root(seat,view,items)).token;
}
function promptView(view,seat,ownerSeat){
 const choices=(ownerSeat==='actor'?view.ownPublic:view.opponentPublic).bench
 .flatMap((slot,index)=>slot?[{kind:'pokemon',token:ownerSeat+'-'+index,printing:slot.printing,
 label:'Bench '+(index+1),publicMetadata:{ownerSeat,targetZone:'bench',benchIndex:index,
 isOwnerVisible:true,selectionType:'pokemon',selectionIndex:index}}]:[]);
 const prompt={actingSeat:seat,promptType:'ChoosePokemonPrompt',description:null,
 source:{classification:'actor-choice',sourceKind:'card-effect',sourcePrinting:GUZMA,effectName:'Guzma'},
 choices,publicMetadata:{minimumCount:1,maximumCount:1,allowCancel:false,isSecret:false,
 selectionType:'pokemon',targetZone:'bench'}};
 return {role:'candidate',seat,observation:{...view,actorSeat:seat,decisionKind:'owner-prompt',pendingPromptType:'ChoosePokemonPrompt'},
 prompt,publicEventReceipt:null};
}
function promptToken(worker,profile,seat,view,ownerSeat){
 const outcome=worker.createPolicy({role:'candidate',seat,policyVersion:worker.POLICY_VERSION,config:profile}).decide(promptView(view,seat,ownerSeat));
 return outcome.kind==='select-choices'&&outcome.tokens.length===1?outcome.tokens[0]:JSON.stringify(outcome);
}
function run(source){
 const original=compile(source),patched=compile(patchWorker(source));
 let groups=0,changes=0;const errors=[];
 for(const seat of [0,1])for(const config of PROFILES)for(const c of fixtures()){
  const view=viewFor(seat,c);
  const decisions=[original,patched].map(w=>rootToken(w,config,seat,view));
  groups++;if(decisions[0]!==decisions[1])changes++;
  if(decisions.join('|')!==c.expected.join('|'))
   errors.push({where:'root',seat,profile:config.profileId,label:c.label,decisions,expected:c.expected});
 }
 let continuations=0;
 // Positive two-Bench source line. Check source target, actor pivot,
 // actual now-offered retreat, and actual now-offered direct final attack.
 for(const seat of [0,1])for(const config of PROFILES){
  const base=viewFor(seat,fixtures()[1]);
  const opponentChoice=promptToken(patched,config,seat,base,'opponent');
  continuations++;
  if(opponentChoice!=='opponent-0')errors.push({where:'opponent-choice',seat,profile:config.profileId,got:opponentChoice});
  const gusted={...base,ownHand:[],ownPublic:{...base.ownPublic,handCount:0,discard:[...base.ownPublic.discard,GUZMA]},ownTurnResources:{...base.ownTurnResources,supporterPlayedTurn:1},
   opponentPublic:{...base.opponentPublic,active:base.opponentPublic.bench[0],
   bench:base.opponentPublic.bench.map((p,i)=>i===0?base.opponentPublic.active:p)}};
  const actorChoice=promptToken(patched,config,seat,gusted,'actor');
  continuations++;
  if(actorChoice!=='actor-0')errors.push({where:'actor-choice',seat,profile:config.profileId,got:actorChoice});
  const switched={...gusted,ownPublic:{...gusted.ownPublic,active:gusted.ownPublic.bench[0],
   bench:gusted.ownPublic.bench.map((p,i)=>i===0?gusted.ownPublic.active:p)}};
  const retreat=rootToken(patched,config,seat,switched,
   [{kind:'retreat',token:'return-vmax',targetPrinting:switched.ownPublic.bench[0].printing,
     publicMetadata:{benchIndex:0}},{kind:'pass',token:'pass'}]);
  continuations++;
  if(retreat!=='return-vmax')errors.push({where:'retreat',seat,profile:config.profileId,got:retreat});
  const ready={...switched,ownTurnResources:{...switched.ownTurnResources,retreatedTurn:switched.globalTurn},
   ownPublic:{...switched.ownPublic,active:switched.ownPublic.bench[0],
   bench:switched.ownPublic.bench.map((p,i)=>i===0?switched.ownPublic.active:p)}};
  const final=rootToken(patched,config,seat,ready,
   [{kind:'attack',token:'max',attackName:'Max Geist'},{kind:'pass',token:'pass'}]);
  continuations++;
  if(final!=='max')errors.push({where:'final-attack',seat,profile:config.profileId,got:final});
 }
 const result={schema:'agent2-guzma-free-pivot-final-v1',sourceBytes:source.length,
  pairedRootGroups:groups,rootPolicyCalls:groups*2,changedRoot:changes,
  unchangedRoot:groups-changes,promptAndRetreatChecks:continuations,
  allMatched:errors.length===0,errors};
 if(errors.length)throw Error(JSON.stringify(result));
 return result;
}
module.exports={patchWorker,run};
