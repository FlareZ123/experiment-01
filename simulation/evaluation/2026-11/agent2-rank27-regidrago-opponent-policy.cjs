'use strict';

/*
 * Rank 27 source-bound Regidrago opponent-policy prototype.
 * Runs exclusively on actor-visible public state and authenticated host
 * action/prompt tokens. This is a developmental opponent, not a competitive
 * full-game, native-verified, or benchmark-qualified agent.
 */
const base = require('./agent43-rank10-regidrago-opponent-policy.cjs');
const { evaluateApexAttackChoice } = require('./agent43-regidrago-apex-choice.cjs');
const { choosePhantomDiveAllocation } = require('./agent43-phantom-dive-allocation.cjs');

const POLICY_VERSION='agent2-rank27-regidrago-source-v2';
const SOURCE_RANK=27;
const SOURCE_BLOB_SHA1='ae773f6201d7aa69d31914dbfee66f3fba692200';
const SOURCE_PRINTINGS=Object.freeze([["Regidrago V SIT 135",4],["Regidrago VSTAR SIT 136",3],["Dialga-GX UPR 100",2],["Dragapult ex TWM 130",1],["Koraidon ex TEF 120",1],["Noivern ex PAL 153",1],["Kyurem SFA 47",1],["Dedenne-GX UNB 57",1],["Crobat V DAA 104",1],["Tapu Lele-GX GRI 60",1],["Eldegoss V RCL 19",1],["Latias ex SSP 76",1],["Budew ASC 16",1],["Marshadow UNB 81",1],["Professor Sycamore BKP 107",2],["Guzma BUS 115",2],["Carmine TWM 145",1],["Marnie SSH 169",1],["N FCO 105",1],["Raihan EVS 152",1],["Crispin SCR 133",1],["Mysterious Treasure FLI 113",4],["Quick Ball FST 237",4],["VS Seeker PHF 109",2],["Hisuian Heavy Ball ASR 146",1],["Ultra Ball MEG 131",1],["Net Ball LOT 187",1],["Battle Compressor PHF 92",1],["Super Rod PAL 188",1],["Echoing Horn CRE 136",1],["Prime Catcher TEF 157",1],["Muscle Band XY 121",2],["Parallel City BKT 145",1],["Path to the Peak CRE 148",1],["Double Dragon Energy ROS 97",4],["Grass Energy MEE 9",4],["Fire Energy MEE 10",2]]);
const SOURCE_SET=new Set(SOURCE_PRINTINGS.map(([name])=>name));
const PREFIX=Object.freeze({
  regidragoV:'Regidrago V SIT 135',
  regidragoVstar:'Regidrago VSTAR SIT 136',
  budew:'Budew ASC 16',
  dedenne:'Dedenne-GX UNB 57',
  crobat:'Crobat V DAA 104',
  eldegoss:'Eldegoss V RCL 19',
  tapu:'Tapu Lele-GX GRI 60',
  latias:'Latias ex SSP 76',
  marshadow:'Marshadow UNB 81',
  netBall:'Net Ball LOT 187',
  path:'Path to the Peak CRE 148',
  quickBall:'Quick Ball FST 237',
  ultraBall:'Ultra Ball MEG 131',
  treasure:'Mysterious Treasure FLI 113',
  compressor:'Battle Compressor PHF 92',
  prime:'Prime Catcher TEF 157',
  dialga:'Dialga-GX UPR 100',
  dragapult:'Dragapult ex TWM 130',
  koraidon:'Koraidon ex TEF 120',
  noivern:'Noivern ex PAL 153',
  kyurem:'Kyurem SFA 47',
  n:'N FCO 105',
  marnie:'Marnie SSH 169',
  sycamore:'Professor Sycamore BKP 107',
  raihan:'Raihan EVS 152',
  crispin:'Crispin SCR 133'
});
const DRAGON_PAYLOADS=new Set([
  PREFIX.regidragoV,PREFIX.dialga,PREFIX.dragapult,
  PREFIX.koraidon,PREFIX.noivern,PREFIX.kyurem
]);
const EXECUTABLE=new Set([
  'play-card','attack','retreat','use-ability','use-stadium','pass'
]);
function arr(value){return Array.isArray(value)?value:[];}
function name(value){return typeof value==='string'?value:
  (value?.printing??value?.fullName??value?.actorPrinting??value?.targetPrinting??'');}
function is(value,printing){return name(value)===printing;}
function board(player){return [player?.active,...arr(player?.bench)].filter(Boolean);}
function has(player,printing){return board(player).some(p=>is(p,printing));}
function count(player,printing){return board(player).filter(p=>is(p,printing)).length;}
function benchOpen(player){return arr(player?.bench).some(x=>x===null)||
  arr(player?.bench).length<5;}
function visibleDonors(obs){return arr(obs?.ownPublic?.discard).filter(x=>DRAGON_PAYLOADS.has(name(x)));}
function rank27Goal(obs){
  const own=obs?.ownPublic??{};
  const v=count(own,PREFIX.regidragoV),vstar=count(own,PREFIX.regidragoVstar);
  return {v,vstar,donors:visibleDonors(obs).length,
    hand:arr(obs?.ownHand).length,
    energy:board(own).reduce((sum,p)=>sum+arr(p.energies).length,0)};
}
function recoverableSourceSupporter(value){
  return /^(?:Guzma BUS 115|Crispin SCR 133|Raihan EVS 152|N FCO 105|Marnie SSH 169|Carmine TWM 145|Professor Sycamore BKP 107)(?: |$)/.test(name(value));
}
function sourceAbilityRecoveryOpen(obs){
  const own=obs?.ownPublic??{},opp=obs?.opponentPublic??{};
  if(!benchOpen(own)||has(own,PREFIX.eldegoss)||
     obs?.ownTurnResources?.pokemonPlayLocked===true||
     own.publicTurnRestrictions?.pokemonPlayLocked===true||
     obs?.ownTurnResources?.abilityPokemonPlayLocked===true||
     own.publicTurnRestrictions?.abilityPokemonPlayLocked===true)return false;
  // Path to the Peak blanks Eldegoss V's Rule Box Ability. Unknown
  // suppression of that Stadium is not a reason to assume Happy Match live.
  if([...arr(own.stadium),...arr(opp.stadium)].some(x=>is(x,PREFIX.path)))return false;
  return arr(own.discard).some(recoverableSourceSupporter);
}
function eldegossRecoveryValue(obs){
  if(!sourceAbilityRecoveryOpen(obs))return -Infinity;
  const held=arr(obs.ownHand).filter(recoverableSourceSupporter).length;
  const hasGust=arr(obs.ownPublic.discard).some(x=>is(x,'Guzma BUS 115'));
  return held>0?110:hasGust?255:220;
}
function sourceSearchTargetValue(source,printing,obs){
  const goal=rank27Goal(obs),own=obs.ownPublic;
  // The exact source printing type/stage gates remain in force even when a
  // malformed synthetic frontier includes a legal-in-deck but unsearchable
  // target. Real native Store choices are a stricter subset.
  const basic=new Set([
    PREFIX.regidragoV,PREFIX.budew,PREFIX.dialga,PREFIX.koraidon,
    PREFIX.kyurem,PREFIX.dedenne,PREFIX.crobat,PREFIX.eldegoss,
    PREFIX.tapu,PREFIX.latias,PREFIX.marshadow
  ]);
  const psychicDragon=new Set([
    PREFIX.regidragoV,PREFIX.regidragoVstar,PREFIX.dialga,
    PREFIX.dragapult,PREFIX.koraidon,PREFIX.noivern,PREFIX.kyurem,
    PREFIX.tapu,PREFIX.latias,PREFIX.marshadow
  ]);
  if(!SOURCE_SET.has(printing))return -Infinity;
  if(source===PREFIX.quickBall&&!basic.has(printing))return -Infinity;
  if(source===PREFIX.treasure&&!psychicDragon.has(printing))return -Infinity;
  if(source===PREFIX.ultraBall&&!basic.has(printing)&&
    ![PREFIX.regidragoVstar,PREFIX.dragapult,PREFIX.noivern].includes(printing))
    return -Infinity;
  if(printing===PREFIX.regidragoVstar)return goal.v>0?310:40;
  if(printing===PREFIX.regidragoV)return goal.v+goal.vstar<2?290:45;
  if(printing===PREFIX.budew)return has(own,PREFIX.budew)?20:165;
  if(printing===PREFIX.eldegoss)return eldegossRecoveryValue(obs);
  if(printing===PREFIX.dedenne||printing===PREFIX.crobat)
    return goal.hand<=3?185:20;
  if(printing===PREFIX.tapu)return goal.hand<=3?150:25;
  if(printing===PREFIX.latias)return has(own,PREFIX.latias)?15:140;
  if(printing===PREFIX.marshadow)return 45;
  // Other Dragons are Apex payloads, not normally hand-played setup.
  return DRAGON_PAYLOADS.has(printing)?65:-Infinity;
}
function sourceDiscardValue(printing,obs){
  const goal=rank27Goal(obs),own=obs.ownPublic;
  if(!SOURCE_SET.has(printing))return -Infinity;
  if(printing===PREFIX.regidragoV)
    return goal.v+goal.vstar===0?-Infinity:goal.v+goal.vstar<2?60:220;
  if(printing===PREFIX.regidragoVstar)
    return goal.vstar===0?-Infinity:180;
  if(DRAGON_PAYLOADS.has(printing))
    return visibleDonors(obs).some(x=>name(x)===printing)?85:360;
  if(printing==='Prime Catcher TEF 157')return -Infinity;
  if(printing==='Double Dragon Energy ROS 97')
    return goal.energy<3?-Infinity:45;
  if(/^Grass Energy |^Fire Energy /.test(printing))
    return goal.energy<3?15:100;
  if(recoverableSourceSupporter(printing))
    return arr(obs.ownHand).filter(recoverableSourceSupporter).length<=1?25:100;
  if(printing===PREFIX.budew&&has(own,PREFIX.budew))return 150;
  if(printing===PREFIX.eldegoss&&sourceAbilityRecoveryOpen(obs))return 20;
  return 75;
}
function ownTurnKOEligible(obs,receipt){
  const turn=receipt?.opponentLastTurnTurn,ko=receipt?.priorOpponentTurnKO;
  return Number.isSafeInteger(turn)&&turn>=0&&turn<obs.globalTurn&&
    ko?.turn===turn&&ko?.any===true;
}
function scoreRoot(item,request){
  const obs=request.observation, own=obs.ownPublic,opp=obs.opponentPublic,
    p=name(item.actorPrinting??item.publicMetadata?.sourcePrinting??item.label),
    state=rank27Goal(obs);
  if(item.kind==='play-card'&&!SOURCE_SET.has(p))return -Infinity;
  if(!EXECUTABLE.has(item.kind))return -Infinity;
  if(item.kind==='attack'){
    const attack=item.attackName??item.publicMetadata?.sourceAttack??item.label;
    if(attack==='Apex Dragon')return state.donors?420:-Infinity;
    if(attack==='Itchy Pollen')return state.donors?135:285;
    if(attack==='Celestial Roar')return own.deckCount>=4&&state.energy<3?260:50;
    if(attack==='Dragon Laser')return 150;
    if(attack==='Float Up')return state.hand<=2?55:10;
    return -Infinity;
  }
  if(item.kind==='play-card'){
    if(p===PREFIX.regidragoV)return benchOpen(own)&&state.v+state.vstar<2?320:-Infinity;
    if(p===PREFIX.regidragoVstar)return state.v>0&&state.vstar<2?330:-Infinity;
    if(p===PREFIX.quickBall)return state.v+state.vstar<2?290:90;
    if(p===PREFIX.treasure)return state.vstar<2?300:120;
    if(p===PREFIX.ultraBall)return state.vstar===0?265:70;
    if(p===PREFIX.netBall){
      // Net Ball searches a Basic Grass Pokemon or a Grass Energy. Regidrago V
      // is Dragon, not Grass, so this cannot search the main attacker.
      return !arr(obs.ownHand).some(x=>/^Grass Energy /.test(name(x)))&&
        own.deckCount>0?105:25;
    }
    if(p===PREFIX.compressor)return state.donors===0?305:
      state.donors===1?180:45;
    if(p===PREFIX.budew)return !has(own,PREFIX.budew)&&benchOpen(own)?
      (obs.globalTurn<=2?230:95):-Infinity;
    if(p===PREFIX.crobat)return benchOpen(own)&&state.hand<=3?240:15;
    if(p===PREFIX.dedenne)return benchOpen(own)&&state.hand<=3?205:15;
    if(p===PREFIX.eldegoss)return benchOpen(own)&&
      arr(own.discard).some(x=>/^(?:Guzma|Crispin|Raihan|N |Marnie|Carmine|Professor Sycamore)/.test(name(x)))?165:15;
    if(p===PREFIX.tapu)return benchOpen(own)&&state.hand<=3?145:20;
    if(p===PREFIX.path){
      // Do not voluntarily disable our own Rule Box Legacy Star while unused.
      if(own.publicTurnRestrictions?.vstarUsed!==true&&state.vstar>0)return -Infinity;
      return board(opp).some(x=>arr(x.abilities).length>0)?145:20;
    }
    if(p===PREFIX.raihan)return ownTurnKOEligible(obs,request.publicEventReceipt)?
      175:-Infinity;
    if(p===PREFIX.crispin)return state.energy<3?230:55;
    if(p===PREFIX.sycamore||p===PREFIX.marnie||p===PREFIX.n)return state.hand<=3?210:60;
    if(p===PREFIX.prime)return board(opp).some(x=>
      /^Mimikyu GRI 58/.test(name(x))||/^Lillie's Clefairy ex JTG 56/.test(name(x)))?
      255:60;
    if(p===PREFIX.marshadow)return arr(own.stadium).some(x=>/Path to the Peak|Silent Lab/.test(name(x)))||
      arr(opp.stadium).some(x=>/Path to the Peak|Silent Lab/.test(name(x)))?145:25;
  }
  if(item.kind==='use-ability'){
    const ability=item.publicMetadata?.sourceEffect??item.publicMetadata?.abilityName??item.label??'';
    if(/Legacy Star/i.test(ability))return own.publicTurnRestrictions?.vstarUsed===false&&own.deckCount>8?350:-Infinity;
    if(/Dark Asset/i.test(ability))return state.hand<=3?245:55;
    if(/Dedechange/i.test(ability))return state.hand<=3?240:35;
    if(/Happy Match/i.test(ability))return arr(own.discard).some(x=>/^(?:Guzma|Crispin|Raihan|N |Marnie|Carmine|Professor Sycamore)/.test(name(x)))?200:-Infinity;
  }
  const original=base.scoreAction(item,request);
  return Number.isFinite(original)?original:0;
}
function reason(code){return {kind:'abstain',reasonCode:code};}
function pick(choices,score,min=1,max=1,singleSelect=false){
  const ranked=arr(choices).map((c,index)=>({c,index,score:score(c)}))
    .filter(x=>Number.isFinite(x.score)&&x.score>0&&typeof x.c.token==='string')
    .sort((a,b)=>b.score-a.score||a.index-b.index).slice(0,max);
  if(ranked.length===0 && min===0){
    const empty=arr(choices).find(choice=>choice.kind==='empty-selection');
    return empty?{kind:'select-choice',token:empty.token}:
      reason('NO_SUPPORTED_CARD_SELECTION');
  }
  if(ranked.length<min)return reason('NO_SUPPORTED_CARD_SELECTION');
  // Native card-combination prompts require select-choices even for exactly
  // one card; ChooseAttackPrompt is a genuine single-select protocol.
  return singleSelect?{kind:'select-choice',token:ranked[0].c.token}:
    {kind:'select-choices',tokens:ranked.map(x=>x.c.token)};
}
function effectSource(prompt){
  const s=prompt?.source;
  return s?.classification==='actor-choice'&&s?.sourceKind==='card-effect'&&
    SOURCE_SET.has(s.sourcePrinting)&&typeof s.effectName==='string'?
    s:null;
}
function metadataOwnerVisible(choice){
  const m=choice?.publicMetadata??{};
  return m.ownerSeat==='actor'&&m.isOwnerVisible===true;
}
function donorScore(choice,obs){
  const source=choice?.printing,attack=choice?.publicMetadata?.sourceAttack??'';
  if(!DRAGON_PAYLOADS.has(source)||!visibleDonors(obs).some(x=>name(x)===source)||
      choice.kind!=='attack'||!metadataOwnerVisible(choice)||
      choice.publicMetadata?.sourceZone!=='discard')return -Infinity;
  if(attack==='Covert Flight'){
    const target=obs.opponentPublic.active;
    const isBasic=arr(target?.printed?.subtypes).includes('Basic');
    return isBasic?240:105;
  }
  if(attack==='Dominating Echo'){
    const pressure=arr(obs.opponentPublic.active?.energies).some(x=>/Double|Special/.test(name(x)))||
      arr(obs.opponentPublic.stadium).length>0;
    return pressure?265:125;
  }
  if(attack==='Jet Headbutt')return 70;
  const e=evaluateApexAttackChoice(choice,obs);
  return Number.isFinite(e.score)?e.score:-Infinity;
}
function enginePrompt(request) {
  const prompt=request.prompt,obs=request.observation,meta=prompt?.publicMetadata??{},
    source=prompt?.source;
  if(!prompt||source?.classification!=='actor-choice'||
    source?.sourceKind!=='engine'||source?.sourcePrinting!==null||
    source.effectName!==prompt.description)return reason('UNTRUSTED_PROMPT_SOURCE');
  const e=source.effectName;
  const choices=arr(prompt.choices);
  if(e==='GO_FIRST'&&obs.phase===1&&prompt.promptType==='ConfirmPrompt'){
    const no=choices.find(x=>/^(?:no|false|decline)$/i.test(x.label??''));
    return no?{kind:'select-choice',token:no.token}:
      reason('UNRECOGNIZED_GO_FIRST_CHOICES');
  }
  if(e==='WANT_TO_DRAW_CARDS'&&obs.phase===1&&prompt.promptType==='SelectPrompt'){
    // Mulligan bonus cards are optional and source-certified; take the largest
    // offered legal bonus without looking at any concealed card.
    const ranked=choices.map((choice,index)=>({
      choice,index,n:Number(choice?.publicMetadata?.value??choice?.label)
    })).filter(x=>Number.isSafeInteger(x.n)&&x.n>=0)
      .sort((a,b)=>b.n-a.n||a.index-b.index);
    return ranked.length?{kind:'select-choice',token:ranked[0].choice.token}:
      reason('NO_MULLIGAN_DRAW_OPTION');
  }
  if(e==='CHOOSE_STARTING_POKEMONS'&&obs.phase===1&&
     prompt.promptType==='ChooseCardsPrompt'){
    if(meta.selectionType!=='card-combination'||meta.sourceZone!=='hand'||
      meta.ownerSeat!=='actor'||meta.isOwnerVisible!==true||
      meta.isSecret!==false||meta.allowCancel!==false||
      (meta.minimumCount!==0&&meta.minimumCount!==1)||
      !Number.isSafeInteger(meta.maximumCount)||meta.maximumCount<1||
      meta.maximumCount>6)return reason('BAD_STARTING_POKEMON_SETUP_PROMPT');
    const boardState=rank27Goal(obs);
    const initial=meta.minimumCount===1;
    if(!initial&&!obs.ownPublic.active)return reason('MISSING_ACTIVE_FOR_EXTRA_BENCH');
    const score=choice=>{
      if(choice.kind!=='card'||!SOURCE_SET.has(choice.printing)||
        !metadataOwnerVisible(choice)||choice.publicMetadata?.sourceZone!=='hand'||
        !Number.isSafeInteger(choice.publicMetadata.selectionIndex)||
        choice.publicMetadata.selectedCount!==1)return -Infinity;
      const p=choice.printing;
      if(initial)return p===PREFIX.regidragoV?600:p===PREFIX.budew?500:
        p===PREFIX.latias?400:p===PREFIX.dedenne?200:
        p===PREFIX.crobat?150:p===PREFIX.eldegoss?130:
        p===PREFIX.tapu?100:-Infinity;
      if(!benchOpen(obs.ownPublic))return -Infinity;
      if(p===PREFIX.regidragoV&&boardState.v+boardState.vstar<2)return 500;
      if(p===PREFIX.budew&&!has(obs.ownPublic,PREFIX.budew))return 400;
      if(p===PREFIX.latias&&!has(obs.ownPublic,PREFIX.latias))return 250;
      // Dedenne, Crobat, Tapu Lele and Eldegoss must be played from hand
      // during a turn for their respective entering-the-Bench Abilities.
      return -Infinity;
    };
    const ranked=choices.map((choice,index)=>({choice,index,score:score(choice)}))
      .filter(x=>Number.isFinite(x.score)&&x.score>0)
      .sort((a,b)=>b.score-a.score||a.index-b.index);
    if(ranked.length)return {kind:'select-choices',tokens:[ranked[0].choice.token]};
    const empty=choices.find(x=>x.kind==='empty-selection');
    return !initial&&empty?{kind:'select-choice',token:empty.token}:
      reason('NO_STARTING_POKEMON_CHOICE');
  }
  if(e==='CHOOSE_NEW_ACTIVE_POKEMON'&&prompt.promptType==='ChoosePokemonPrompt'&&
     meta.selectionType==='pokemon'&&meta.minimumCount===1&&
     meta.maximumCount===1&&obs.ownPublic.active===null){
    const rated=choices.map((choice,index)=>{
      const m=choice?.publicMetadata??{};
      const slot=m.ownerSeat==='actor'&&m.targetZone==='bench'&&
        Number.isSafeInteger(m.benchIndex)?
        arr(obs.ownPublic.bench)[m.benchIndex]??null:null;
      return {choice,index,score:slot?.printing===PREFIX.regidragoVstar?
        (visibleDonors(obs).length?550:400):
        slot?.printing===PREFIX.regidragoV?300:
        slot?.printing===PREFIX.budew?200:-Infinity};
    }).filter(x=>Number.isFinite(x.score))
      .sort((a,b)=>b.score-a.score||a.index-b.index);
    return rated.length?{kind:'select-choices',tokens:[rated[0].choice.token]}:
      reason('NO_SUPPORTED_POKEMON_CHOICE');
  }
  if(e==='CHOOSE_PRIZE_CARD'&&prompt.promptType==='ChoosePrizePrompt'&&
     Number.isSafeInteger(meta.minimumCount)&&
     Number.isSafeInteger(meta.maximumCount)&&
     meta.minimumCount>=1&&meta.minimumCount<=meta.maximumCount&&
     meta.maximumCount<=6){
    // Prize identities are hidden; select only published slot tokens, never
    // infer or rank concealed card faces.
    const rows=choices.filter(x=>x.kind==='prize'&&typeof x.token==='string');
    return rows.length>=meta.minimumCount?
      {kind:'select-choices',tokens:rows.slice(0,meta.minimumCount).map(x=>x.token)}:
      reason('NO_VISIBLE_PRIZE_SLOT');
  }
  return reason('UNSUPPORTED_ENGINE_SETUP_PROMPT');
}

function choosePrompt(request){
  const prompt=request.prompt,obs=request.observation;
  if(!prompt||prompt.actingSeat!==request.seat)return reason('UNTRUSTED_PROMPT');
  const src=effectSource(prompt);
  if(!src)return enginePrompt(request);
  const choices=arr(prompt.choices);
  const meta=prompt.publicMetadata??{};
  const kind=prompt.promptType;
  if(kind==='ConfirmPrompt'&&meta.selectionType==='confirm'){
    const options={yes:choices.find(x=>x.kind==='confirm'&&x.label==='Yes'),
      no:choices.find(x=>x.kind==='confirm'&&x.label==='No')};
    const isSource=(printing,effect)=>
      src.sourcePrinting===printing&&src.effectName===effect;
    let useful=null;
    if(isSource(PREFIX.eldegoss,'Happy Match')){
      useful=arr(obs.ownPublic?.discard).some(recoverableSourceSupporter);
    }else if(isSource(PREFIX.crobat,'Dark Asset')){
      useful=arr(obs.ownHand).length<6;
    }else if(isSource(PREFIX.dedenne,'Dedechange')){
      useful=arr(obs.ownHand).length<=3;
    }else if(isSource(PREFIX.tapu,'Wonder Tag')){
      useful=!arr(obs.ownHand).some(recoverableSourceSupporter);
    }else if(isSource(PREFIX.regidragoVstar,'Legacy Star')){
      useful=obs.ownPublic?.deckCount>=7&&
        obs.ownPublic?.publicTurnRestrictions?.vstarUsed!==true;
    }else if(isSource(PREFIX.marshadow,'Resetting Hole')){
      useful=[...arr(obs.ownPublic?.stadium),...arr(obs.opponentPublic?.stadium)]
        .some(x=>is(x,PREFIX.path)||/^(?:Silent Lab PRC 140|Parallel City BKT 145)$/.test(name(x)));
    }
    if(useful!==null){
      const selected=useful?options.yes:options.no;
      return selected?{kind:'select-choice',token:selected.token}:
        reason('UNRECOGNIZED_SIMPLE_PROMPT');
    }
  }
  if(kind==='ChooseAttackPrompt'){
    if(src.sourcePrinting!==PREFIX.regidragoVstar||src.effectName!=='Apex Dragon')return reason('UNSUPPORTED_ATTACK_CHOICE_SOURCE');
    return pick(choices,c=>donorScore(c,obs),1,1,true);
  }
  if(kind==='PutDamagePrompt'){
    if(src.sourcePrinting!==PREFIX.regidragoVstar || src.effectName!=='Apex Dragon' ||
      request.config?.phantomDiveAllocation!=='complete-choice-token-v1')return reason('UNSUPPORTED_PROMPT_TYPE');
    return choosePhantomDiveAllocation(choices,obs);
  }
  if(meta.selectionType==='card-combination'){
    const min=Number.isSafeInteger(meta.minimumCount)?meta.minimumCount:1;
    const max=Number.isSafeInteger(meta.maximumCount)?meta.maximumCount:min;
    if(min<0||max<min||max>7)return reason('BAD_CARD_SELECTION_BOUNDS');
    const e=src.effectName;
    if(src.sourcePrinting===PREFIX.compressor||e==='Battle Compressor'){
      return pick(choices,c=>{
        const n=name(c),existing=visibleDonors(obs).some(x=>name(x)===n);
        return metadataOwnerVisible(c)&&DRAGON_PAYLOADS.has(n)&&
          c.publicMetadata?.sourceZone==='deck'&&!existing?
          (n===PREFIX.dialga?400:n===PREFIX.dragapult?360:
          n===PREFIX.noivern?310:n===PREFIX.koraidon?300:
          n===PREFIX.kyurem?245:80):-Infinity;
      },min,max);
    }
    if(src.sourcePrinting===PREFIX.netBall){
      return pick(choices,c=>{
        const n=name(c);
        if(!metadataOwnerVisible(c)||c.publicMetadata?.sourceZone!=='deck')
          return -Infinity;
        if(n===PREFIX.eldegoss)return eldegossRecoveryValue(obs);
        return /^Grass Energy /.test(n)?150:-Infinity;
      },min,max);
    }
    if(src.sourcePrinting===PREFIX.eldegoss&&e==='Happy Match'){
      return pick(choices,c=>metadataOwnerVisible(c)&&
        c.publicMetadata?.sourceZone==='discard'&&
        /^(?:Guzma|Crispin|Raihan|N |Marnie|Carmine|Professor Sycamore)/.test(name(c))?
        140:-Infinity,min,max);
    }
    if(src.sourcePrinting===PREFIX.quickBall||src.sourcePrinting===PREFIX.treasure||
        src.sourcePrinting===PREFIX.ultraBall){
      const zone=meta.sourceZone;
      if(meta.ownerSeat!=='actor'||meta.isOwnerVisible!==true)
        return reason('UNTRUSTED_CARD_SELECTION');
      if(zone==='hand')return pick(choices,c=>
        metadataOwnerVisible(c)&&c.publicMetadata?.sourceZone==='hand'?
          sourceDiscardValue(name(c),obs):-Infinity,min,max);
      if(zone!=='deck')return reason('UNTRUSTED_CARD_SELECTION');
      return pick(choices,c=>{
        if(!metadataOwnerVisible(c)||c.publicMetadata?.sourceZone!=='deck')
          return -Infinity;
        return sourceSearchTargetValue(src.sourcePrinting,name(c),obs);
      },min,max);
    }
  }
  // The rank-10 helper is a bounded fallback only for exact rank-27 source
  // cards. It may still abstain on unsupported native prompt forms.
  return base.promptDecision(request,{
    allowPhantomDiveAllocation:request.config?.phantomDiveAllocation==='complete-choice-token-v1'
  });
}
function chooseRoot(request){
  const rows=arr(request.actionFrontier?.items).filter(item=>
    EXECUTABLE.has(item.kind)&&typeof item.token==='string');
  if(!rows.length)return reason('NO_EXECUTABLE_ACTION');
  const ranked=rows.map((item,i)=>({item,i,score:scoreRoot(item,request)}))
    .sort((a,b)=>b.score-a.score||a.i-b.i);
  if(ranked[0].score>0)return {kind:'select-action',token:ranked[0].item.token};
  const pass=rows.find(x=>x.kind==='pass');
  return pass?{kind:'select-action',token:pass.token}:reason('NO_SUPPORTED_ACTION');
}
function createPolicy({role,seat,policyVersion,config}){
  if(role!=='opponent'||(seat!==0&&seat!==1)||
    policyVersion!==POLICY_VERSION||!config||
    Object.keys(config).some(x=>!['rank','sourceBlobSha1','phantomDiveAllocation'].includes(x))||
    config.rank!==SOURCE_RANK||config.sourceBlobSha1!==SOURCE_BLOB_SHA1||
    !['disabled','complete-choice-token-v1'].includes(config.phantomDiveAllocation??'disabled'))
    throw Error('AGENT2_RANK27_INIT_SOURCE_MISMATCH');
  return Object.freeze({decide(request){
    if(request?.role!=='opponent'||request.seat!==seat||
      request.observation?.actorSeat!==seat)return reason('ROLE_SEAT_BINDING_MISMATCH');
    return request.prompt?choosePrompt({...request,config}):chooseRoot(request);
  }});
}
module.exports={POLICY_VERSION,SOURCE_RANK,SOURCE_BLOB_SHA1,SOURCE_PRINTINGS,
  createPolicy,scoreRoot,choosePrompt,donorScore};