'use strict';
/*
 * Exact Aichi rank18 Regidrago opponent-role developmental policy.
 * Reuses rank27's source-bounded common Regidrago decisions, but independently
 * binds rank18's 60 and implements rank18-specific VIP/Sky Field/Squawk setup,
 * Goodra donor, Sky Field Bench constraints, source search, hand costs.
 * All requests/action tokens are actor-only. No native full-game admission.
 */
const common=require('./agent2-rank27-regidrago-opponent-policy.cjs');
const base=require('./agent43-rank10-regidrago-opponent-policy.cjs');
const {choosePhantomDiveAllocation}=require('./agent43-phantom-dive-allocation.cjs');
const POLICY_VERSION='agent2-rank18-regidrago-source-v1';
const SOURCE_RANK=18;
const SOURCE_BLOB_SHA1='ae773f6201d7aa69d31914dbfee66f3fba692200';
const SOURCE_PRINTINGS=Object.freeze([["Regidrago V SIT 135",3],["Regidrago VSTAR SIT 136",3],["Dedenne-GX UNB 57",2],["Tapu Lele-GX GRI 60",2],["Dialga-GX UPR 100",1],["Dragapult ex TWM 130",1],["Hisuian Goodra VSTAR LOR 136",1],["Koraidon ex TEF 120",1],["Kyurem SFA 47",1],["Squawkabilly ex PAL 169",1],["Latias ex SSP 76",1],["Mega Kangaskhan ex MEG 104",1],["Sudowoodo GRI 66",1],["Marshadow UNB 81",1],["Budew ASC 16",1],["Guzma BUS 115",3],["Carmine TWM 145",2],["Pokémon Ranger STS 104",1],["Raihan EVS 152",1],["Marnie SSH 169",1],["Battle VIP Pass FST 225",4],["Mysterious Treasure FLI 113",4],["Quick Ball FST 237",3],["Hisuian Heavy Ball ASR 146",2],["VS Seeker PHF 109",2],["Ultra Ball MEG 131",1],["Super Rod PAL 188",1],["Prime Catcher TEF 157",1],["Muscle Band XY 121",2],["Sky Field ROS 89",3],["Double Dragon Energy ROS 97",4],["Grass Energy MEE 9",2],["Fire Energy MEE 10",2]]);
const SOURCE_SET=new Set(SOURCE_PRINTINGS.map(([p])=>p));
const ALIAS=new Map();
for(const [p] of SOURCE_PRINTINGS){
  const short=p.replace(/ [0-9][A-Za-z0-9/-]*$/,'');
  if(short===p || (ALIAS.has(short)&&ALIAS.get(short)!==p))
    throw Error('R18_AMBIGUOUS_NATIVE_SOURCE');
  ALIAS.set(short,p);
}
const P=Object.freeze({
  v:'Regidrago V SIT 135',star:'Regidrago VSTAR SIT 136',
  dedenne:'Dedenne-GX UNB 57',squawk:'Squawkabilly ex PAL 169',
  tapu:'Tapu Lele-GX GRI 60',budew:'Budew ASC 16',
  kang:'Mega Kangaskhan ex MEG 104',sudowoodo:'Sudowoodo GRI 66',
  sky:'Sky Field ROS 89',vip:'Battle VIP Pass FST 225',
  quick:'Quick Ball FST 237',treasure:'Mysterious Treasure FLI 113',
  ultra:'Ultra Ball MEG 131',heavy:'Hisuian Heavy Ball ASR 146',
  goodra:'Hisuian Goodra VSTAR LOR 136',
  ranger:'Pokémon Ranger STS 104',prime:'Prime Catcher TEF 157',
  sycamore:'Professor Sycamore BKP 107',guzma:'Guzma BUS 115',
  marshadow:'Marshadow UNB 81',latias:'Latias ex SSP 76'
});
const BASIC=new Set([
 P.v,P.dedenne,P.squawk,P.tapu,P.budew,P.kang,P.sudowoodo,
 P.marshadow,P.latias,'Dialga-GX UPR 100','Koraidon ex TEF 120',
 'Kyurem SFA 47'
]);
const PSYCHIC_DRAGON=new Set([
 P.v,P.star,P.tapu,P.marshadow,P.latias,'Dialga-GX UPR 100',
 'Koraidon ex TEF 120','Kyurem SFA 47','Dragapult ex TWM 130',P.goodra
]);
const DRAGON_PAYLOADS=new Set([
 'Dialga-GX UPR 100','Dragapult ex TWM 130',P.goodra,
 'Koraidon ex TEF 120','Kyurem SFA 47',P.v
]);
const EXECUTABLE=new Set(['play-card','attack','retreat','use-ability','use-stadium','pass']);
const arr=x=>Array.isArray(x)?x:[];
function raw(x){return typeof x==='string'?x:
  (x?.printing??x?.fullName??x?.actorPrinting??x?.publicMetadata?.sourcePrinting??x?.label??'');}
function name(x){const s=raw(x);return SOURCE_SET.has(s)?s:(ALIAS.get(s)??s);}
const board=p=>[p?.active,...arr(p?.bench)].filter(Boolean);
const count=(p,printing)=>board(p).filter(x=>name(x)===printing).length;
const ownDonors=obs=>arr(obs?.ownPublic?.discard).filter(x=>DRAGON_PAYLOADS.has(name(x)));
function stadiumPresent(obs,pattern){
  return [...arr(obs?.ownPublic?.stadium),...arr(obs?.opponentPublic?.stadium)]
    .some(x=>pattern.test(name(x)));
}
function benchOpen(obs){
  const n=arr(obs?.ownPublic?.bench).filter(Boolean).length;
  const roadblock=board(obs?.opponentPublic).some(x=>name(x)===P.sudowoodo&&
    arr(x?.abilities).some(a=>/Roadblock/i.test(typeof a==='string'?a:a?.name??'')));
  const limit=roadblock?4:stadiumPresent(obs,/^Sky Field ROS(?: 89)?$/)?8:5;
  return n<limit;
}
function templeUnlocksApex(obs){
  const active=obs?.ownPublic?.active;
  if(!stadiumPresent(obs,/^Temple of Sinnoh ASR(?: 155)?$/)||
     name(active)!==P.star||ownDonors(obs).length===0)return false;
  // Rank18 includes Hisuian Goodra VSTAR, which rank27's donor set does not.
  // Reusing rank27's donor gate would miss a Goodra-only winning line.
  return common.energyCoverage(active?.energies,false)===3&&
    common.energyCoverage(active?.energies,true)<3;
}
function goal(obs){
  const own=obs?.ownPublic??{};
  return {v:count(own,P.v),star:count(own,P.star),
    hand:arr(obs?.ownHand).length,donors:ownDonors(obs).length,
    firstTurnCandidate:obs?.globalTurn<=2};
}
function sourceDiscardValue(printing,obs){
  if(!SOURCE_SET.has(printing))return -Infinity;
  const g=goal(obs);
  if(printing===P.v)return g.v+g.star===0?-Infinity:g.v+g.star>1?190:10;
  if(printing===P.star)return g.star===0?-Infinity:145;
  if(DRAGON_PAYLOADS.has(printing))
    return ownDonors(obs).some(x=>name(x)===printing)?75:330;
  if(printing===P.prime)return -Infinity;
  if(/^Double Dragon Energy ROS/.test(printing))return -Infinity;
  if(/^Grass Energy |^Fire Energy /.test(printing))return g.v+g.star>0?15:50;
  if(printing===P.vip)return g.firstTurnCandidate?-Infinity:360;
  if(printing===P.squawk)return g.firstTurnCandidate?20:210;
  if(printing===P.kang)return 180;
  if(printing===P.sky)return 95;
  if(printing===P.ranger)return 25;
  if(printing===P.sudowoodo)return 35;
  return 85;
}
function carmineScore(obs){
  // Source Carmine TWM145 discards the *rest* of the hand and draws five.
  // Unique Dragon attack payloads are often better in discard for Apex, but
  // Carmine also consumes the turn's Supporter and can burn a protected ACE,
  // scarce Double Dragon or the only Basic Regidrago V before it is benched.
  const g=goal(obs),hand=arr(obs?.ownHand).map(name);
  const other=hand.slice();
  const self=other.indexOf('Carmine TWM 145');
  if(self>=0)other.splice(self,1);
  const donorNames=new Set(ownDonors(obs).map(name));
  const payloads=new Set(other.filter(x=>DRAGON_PAYLOADS.has(x)&&
    x!==P.v&&!donorNames.has(x)));
  let score=payloads.size?320+Math.min(2,payloads.size)*18:
    g.hand<=3?245:65;
  if(other.includes(P.prime))score=Math.min(score,50);
  if(other.includes(P.v)&&g.v+g.star===0)score=Math.min(score,60);
  if(other.some(x=>/^Double Dragon Energy ROS(?: 97)?$/.test(x))&&
     !board(obs?.ownPublic).some(p=>
       (name(p)===P.v||name(p)===P.star)&&
       common.energyCoverage(p.energies,false)>=2))
    score=Math.min(score,85);
  return score;
}
function searchValue(source,printing,obs){
  if(!SOURCE_SET.has(printing))return -Infinity;
  if([P.quick,P.vip,P.heavy].includes(source)&&!BASIC.has(printing))return -Infinity;
  if(source===P.treasure&&!PSYCHIC_DRAGON.has(printing))return -Infinity;
  const g=goal(obs),own=obs.ownPublic??{};
  if(printing===P.star)return g.v>0&&g.star===0?360:g.star>1?25:125;
  if(printing===P.v)return g.v+g.star===0?345:g.v+g.star===1?240:50;
  if(printing===P.budew)return count(own,P.budew)===0?165:25;
  if(printing===P.dedenne)return g.hand<=3&&benchOpen(obs)?240:25;
  if(printing===P.squawk)return g.firstTurnCandidate&&benchOpen(obs)&&g.hand<=4?225:10;
  if(printing===P.tapu)return g.hand<=3?160:30;
  if(printing===P.sudowoodo)return benchOpen(obs)&&
    arr(obs.opponentPublic?.bench).filter(Boolean).length>=4?170:30;
  if(printing===P.kang)return 8; // three-Prize board liability, Run Errand active only
  if(printing===P.latias)return count(own,P.latias)?20:110;
  if(DRAGON_PAYLOADS.has(printing))return 40; // discard donors instead of bench
  return 35;
}
function pick(choices,fn,min,max,single=false){
  const ranked=arr(choices).map((choice,index)=>({choice,index,value:fn(choice)}))
    .filter(x=>Number.isFinite(x.value)&&x.value>0&&
      x.choice?.kind==='card'&&typeof x.choice.token==='string')
    .sort((a,b)=>b.value-a.value||a.index-b.index).slice(0,max);
  if(ranked.length<min)return {kind:'abstain',reasonCode:'NO_SUPPORTED_CARD_SELECTION'};
  if(!ranked.length){
    const empty=arr(choices).find(x=>x?.kind==='empty-selection');
    return empty?{kind:'select-choice',token:empty.token}:
      {kind:'abstain',reasonCode:'NO_SUPPORTED_CARD_SELECTION'};
  }
  return single?{kind:'select-choice',token:ranked[0].choice.token}:
    {kind:'select-choices',tokens:ranked.map(x=>x.choice.token)};
}
function validOwnerCard(choice,zone){
  const m=choice?.publicMetadata??{};
  return choice?.kind==='card'&&m.ownerSeat==='actor'&&
    m.isOwnerVisible===true&&m.sourceZone===zone;
}
function resettingHoleScore(obs){
  // Marshadow UNB81 Resetting Hole is Bench-only. Its Stadium removal
  // is the *condition* for discarding itself; it can unlock colored DDE
  // or Legacy Star but has a genuine board/Prize opportunity cost.
  const own=obs?.ownPublic??{},bench=arr(own.bench);
  if(!bench.some(x=>name(x)===P.marshadow))return -Infinity;
  const stadiums=[...arr(own.stadium),...arr(obs?.opponentPublic?.stadium)];
  if(!stadiums.length)return -Infinity;
  const sky=stadiumPresent(obs,/^Sky Field ROS(?: 89)?$/);
  if(sky&&bench.filter(Boolean).length>5)return -Infinity;
  if(templeUnlocksApex(obs))return 560;
  if(stadiumPresent(obs,/^Path to the Peak CRE(?: 148)?$/)&&
     board(own).some(x=>name(x)===P.star)&&
     own.publicTurnRestrictions?.vstarUsed!==true)return 395;
  if(sky)return 15;
  if(stadiumPresent(obs,/^Temple of Sinnoh ASR(?: 155)?$/))return 170;
  return 125;
}
function motivateScore(obs){
  if(name(obs?.ownPublic?.active)!==P.squawk)return -Infinity;
  const basic=arr(obs?.ownPublic?.discard).filter(x=>
    /^(?:Grass Energy MEE(?: 9)?|Fire Energy MEE(?: 10)?)$/.test(name(x)));
  const targets=arr(obs?.ownPublic?.bench).filter(x=>
    x&&(name(x)===P.v||name(x)===P.star)&&
    common.energyCoverage(x.energies,false)<3);
  // The 20 printed damage remains an attack even with no energy transfer,
  // but this is normally an acceleration line for the Benched Regidrago.
  return targets.length&&basic.length?205+Math.min(2,basic.length)*30:15;
}
function scoreRoot(item,request){
  const obs=request?.observation??{},own=obs.ownPublic??{},opp=obs.opponentPublic??{};
  const p=name(item?.actorPrinting??item?.publicMetadata?.sourcePrinting??item?.label);
  if(!EXECUTABLE.has(item?.kind))return -Infinity;
  const explicit=item?.actorPrinting??item?.publicMetadata?.sourcePrinting;
  // Host-frontier attack/Ability identities are not exempt from the original
  // rank18 sixty. Reject any *explicit* foreign actor before shared fallback.
  if(item.kind!=='pass'&&explicit!==undefined&&explicit!==null&&
     !SOURCE_SET.has(name(explicit)))return -Infinity;
  if(item.kind==='play-card'&&!SOURCE_SET.has(p))return -Infinity;
  const g=goal(obs);
  if(item.kind==='play-card'){
    if(p===P.vip)return benchOpen(obs)?(g.v===0?390:315):-Infinity;
    if(p===P.sky)return templeUnlocksApex(obs)?590:
      (!stadiumPresent(obs,/^Sky Field ROS(?: 89)?$/)&&
       arr(own.bench).filter(Boolean).length>=4?195:65);
    if(p===P.squawk)return benchOpen(obs)&&g.firstTurnCandidate?
      (g.hand<=3?255:90):15;
    if(p===P.sudowoodo)return benchOpen(obs)&&
      arr(opp.bench).filter(Boolean).length>=4?175:35;
    if(p===P.kang)return benchOpen(obs)?15:-Infinity;
    if(p===P.ranger)return own.publicTurnRestrictions?.itemPlayLocked===true?225:75;
    if(p===P.heavy)return 105;
    if(p==='Pokémon Ranger STS 104')return 75;
    if(p==='Lillie\'s Determination MEG 119')return g.hand<=3?235:105;
    if(p==='Iono PAL 185')return g.hand<=3?205:85;
    if(p==='Carmine TWM 145')return carmineScore(obs);
  }
  if(item.kind==='use-ability'){
    const ability=item?.publicMetadata?.sourceEffect??item?.publicMetadata?.abilityName??item?.label??'';
    if(/Squawk and Seize/i.test(ability))return g.hand<=3?320:90;
    if(/Resetting Hole/i.test(ability)&&p===P.marshadow)
      return resettingHoleScore(obs);
    if(/Run Errand/i.test(ability))return name(own.active)===P.kang?185:-Infinity;
  }
  if(item.kind==='attack'){
    const attack=item.attackName??item.publicMetadata?.sourceAttack??item.label;
    if(attack==='Motivate')return request?.config?.motivateProjection===
      'complete-choice-token-v1'?motivateScore(obs):-Infinity;
    if(attack==='Rapid-Fire Combo')return name(own.active)===P.kang?205:-Infinity;
  }
  const aliased={...item,actorPrinting:p,
    publicMetadata:{...item.publicMetadata,sourcePrinting:p}};
  const inherited=common.scoreRoot(aliased,request);
  if(Number.isFinite(inherited)&&inherited>0)return inherited;
  const fallback=base.scoreAction(aliased,request);
  return Number.isFinite(fallback)&&fallback>0?fallback:
    inherited===-Infinity?-Infinity:0;
}
function promptDecision(request){
  const prompt=request?.prompt,obs=request?.observation;
  if(!prompt||prompt.actingSeat!==request.seat)return {kind:'abstain',reasonCode:'UNTRUSTED_PROMPT'};
  const source=prompt.source??{};
  if(source.sourceKind==='engine')return common.choosePrompt(request);
  if(source.classification!=='actor-choice'||
     source.sourceKind!=='card-effect'||typeof source.effectName!=='string')
    return {kind:'abstain',reasonCode:'UNTRUSTED_PROMPT_SOURCE'};
  const sourcePrinting=name(source.sourcePrinting);
  if(!SOURCE_SET.has(sourcePrinting))
    return {kind:'abstain',reasonCode:'UNTRUSTED_PROMPT_SOURCE'};
  const p={...prompt,source:{...source,sourcePrinting}};
  const req={...request,prompt:p};
  const meta=p.publicMetadata??{},choices=arr(p.choices);
  if(p.promptType==='AttachEnergyPrompt'&&sourcePrinting===P.squawk&&
     source.effectName==='Motivate'){
    if(request?.config?.motivateProjection!=='complete-choice-token-v1'||
       meta.selectionType!=='energy-attachment'||
       meta.count!==1||meta.allowCancel!==false||
       meta.sourceZone!=='discard'||meta.ownerSeat!=='actor'||
       meta.isOwnerVisible!==true||meta.energyType!=='BASIC'||
       meta.zone!=='bench'||choices.length!==1)
      return {kind:'abstain',reasonCode:'UNSUPPORTED_PROMPT_TYPE'};
    const selected=choices[0],m=selected?.publicMetadata??{};
    const k=m.selectedCount;
    if(selected?.kind!=='energy'||typeof selected.token!=='string'||
       m.sourceZone!=='discard'||m.ownerSeat!=='actor'||
       m.isOwnerVisible!==true||m.energyType!=='BASIC'||
       m.zone!=='bench'||!Number.isSafeInteger(k)||k<0||k>2||
       meta.minimumCount!==k||meta.maximumCount!==k)
      return {kind:'abstain',reasonCode:'UNTRUSTED_ENERGY_SELECTION'};
    if(k>0){
      const target=arr(obs?.ownPublic?.bench)[m.benchIndex];
      if(!Number.isSafeInteger(m.benchIndex)||m.benchIndex<0||
         !(name(target)===P.v||name(target)===P.star))
        return {kind:'abstain',reasonCode:'UNTRUSTED_ENERGY_SELECTION'};
    }else if(m.benchIndex!==undefined){
      return {kind:'abstain',reasonCode:'UNTRUSTED_ENERGY_SELECTION'};
    }
    return {kind:'select-choice',token:selected.token};
  }
  if(p.promptType==='ConfirmPrompt'&&meta.selectionType==='confirm'&&
     sourcePrinting===P.squawk&&
     ['Squawk and Seize','Squawkabilly ex'].includes(source.effectName)){
    const yes=choices.find(x=>x.kind==='confirm'&&x.label==='Yes');
    const no=choices.find(x=>x.kind==='confirm'&&x.label==='No');
    const want=goal(obs).firstTurnCandidate&&goal(obs).hand<=4;
    const chosen=want?yes:no;
    return chosen?{kind:'select-choice',token:chosen.token}:
      {kind:'abstain',reasonCode:'UNRECOGNIZED_SIMPLE_PROMPT'};
  }
  if(p.promptType==='ChooseAttackPrompt'&&
     sourcePrinting===P.star&&source.effectName==='Apex Dragon'){
    return pickAttack(choices,obs);
  }
  if(p.promptType==='PutDamagePrompt'&&
     sourcePrinting===P.star&&source.effectName==='Apex Dragon'&&
     request.config?.phantomDiveAllocation==='complete-choice-token-v1')
    return choosePhantomDiveAllocation(choices,obs);
  if(meta.selectionType==='card-combination'){
    const min=Number.isSafeInteger(meta.minimumCount)?meta.minimumCount:1,
      max=Number.isSafeInteger(meta.maximumCount)?meta.maximumCount:min;
    if(min<0||max<min||max>7)return {kind:'abstain',reasonCode:'BAD_CARD_SELECTION_BOUNDS'};
    if([P.quick,P.treasure,P.ultra,P.vip,P.heavy].includes(sourcePrinting)){
      const zone=meta.sourceZone;
      if(meta.ownerSeat!=='actor'||meta.isOwnerVisible!==true||
         !['hand','deck','prizes'].includes(zone))
        return {kind:'abstain',reasonCode:'UNTRUSTED_CARD_SELECTION'};
      if(zone==='hand'&&[P.quick,P.treasure,P.ultra].includes(sourcePrinting))
        return pick(choices,c=>validOwnerCard(c,'hand')?
          sourceDiscardValue(name(c),obs):-Infinity,min,max);
      if(zone==='deck')
        return pick(choices,c=>validOwnerCard(c,'deck')?
          searchValue(sourcePrinting,name(c),obs):-Infinity,min,max);
      if(zone==='prizes'&&sourcePrinting===P.heavy)
        return pick(choices,c=>validOwnerCard(c,'prizes')?
          searchValue(P.heavy,name(c),obs):-Infinity,min,max);
      return {kind:'abstain',reasonCode:'UNSUPPORTED_CARD_COMBINATION_SOURCE'};
    }
    if(sourcePrinting==='VS Seeker PHF 109'&&meta.sourceZone==='discard'&&
       meta.ownerSeat==='actor'&&meta.isOwnerVisible===true){
      return pick(choices,c=>validOwnerCard(c,'discard')?
        (/Guzma|Raihan|Pokémon Ranger|Professor Sycamore/.test(name(c))?190:75):
          -Infinity,min,max);
    }
  }
  // Reuse the stricter inherited source-prompt branch for common Regidrago
  // cards. New source cards are explicitly bounded above, not silently
  // delegated to a rank10 heuristic about nonexistent source printings.
  if(common.SOURCE_PRINTINGS.some(([x])=>x===sourcePrinting))
    return common.choosePrompt(req);
  return {kind:'abstain',reasonCode:'UNSUPPORTED_PROMPT_TYPE'};
}
function pickAttack(choices,obs){
  const ranked=arr(choices).map((choice,index)=>{
    if(choice?.kind!=='attack'||typeof choice.token!=='string'||
       choice.publicMetadata?.ownerSeat!=='actor'||
       choice.publicMetadata?.isOwnerVisible!==true||
       choice.publicMetadata?.sourceZone!=='discard')
      return {choice,index,score:-Infinity};
    const donor=name(choice.printing),attack=choice.publicMetadata.sourceAttack;
    if(!DRAGON_PAYLOADS.has(donor)||
       !ownDonors(obs).some(x=>name(x)===donor))return {choice,index,score:-Infinity};
    if(donor===P.goodra&&attack==='Rolling Iron')
      return {choice,index,score:230};
    return {choice,index,score:common.donorScore(
      {...choice,printing:donor},obs)};
  }).filter(x=>Number.isFinite(x.score)&&x.score>0)
    .sort((a,b)=>b.score-a.score||a.index-b.index);
  return ranked.length?{kind:'select-choice',token:ranked[0].choice.token}:
    {kind:'abstain',reasonCode:'NO_SUPPORTED_ATTACK_CHOICE'};
}
function chooseRoot(request){
  const rows=arr(request?.actionFrontier?.items).filter(x=>
    EXECUTABLE.has(x.kind)&&typeof x.token==='string');
  const sorted=rows.map((item,index)=>({item,index,score:scoreRoot(item,request)}))
    .sort((a,b)=>b.score-a.score||a.index-b.index);
  if(sorted[0]?.score>0)return {kind:'select-action',token:sorted[0].item.token};
  const pass=rows.find(x=>x.kind==='pass');
  return pass?{kind:'select-action',token:pass.token}:
    {kind:'abstain',reasonCode:'NO_SUPPORTED_ACTION'};
}
function createPolicy({role,seat,policyVersion,config}={}){
  if(role!=='opponent'||(seat!==0&&seat!==1)||policyVersion!==POLICY_VERSION||
     !config||Object.keys(config).some(x=>!['rank','sourceBlobSha1','phantomDiveAllocation','motivateProjection'].includes(x))||
     config.rank!==SOURCE_RANK||config.sourceBlobSha1!==SOURCE_BLOB_SHA1||
     !['disabled','complete-choice-token-v1'].includes(config.phantomDiveAllocation??'disabled')||
     !['disabled','complete-choice-token-v1'].includes(config.motivateProjection??'disabled'))
    throw Error('R18_SOURCE_POLICY_INIT');
  return Object.freeze({decide(request){
    if(request?.role!=='opponent'||request.seat!==seat||
       request.observation?.actorSeat!==seat)
      return {kind:'abstain',reasonCode:'ROLE_SEAT_BINDING_MISMATCH'};
    return request.prompt?promptDecision({...request,config}):chooseRoot({...request,config});
  }});
}
module.exports={POLICY_VERSION,SOURCE_RANK,SOURCE_BLOB_SHA1,
 SOURCE_PRINTINGS,createPolicy,scoreRoot,promptDecision,searchValue,
 sourceDiscardValue,benchOpen,pickAttack,templeUnlocksApex,carmineScore,motivateScore,resettingHoleScore,resolveSourcePrinting:name};
