'use strict';
// Development-only actor-visible tactical slice; see accompanying report.
module.exports = (function build() {
  const POLICY_VERSION = 'agent29-rank9-tactical-slice-v17';
  const SOURCE_RANK = 9;
  const SOURCE_LIST_BLOB_SHA1 = 'ae773f6201d7aa69d31914dbfee66f3fba692200';
  const ENGINE_PIN = 'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05';
  const L = x => Array.isArray(x) ? x : [];
  const M = x => x?.publicMetadata ?? {};
  // Actor observations expose pinned Twinleaf card.fullName (which normally
  // omits setNumber, and for MEG 86 uses the native M1L identity). The
  // original-source policy's printed-inventory regexes include set numbers.
  // Normalize only this source's exact known public printings at the policy
  // boundary; do not alter generic observations, opponent hidden zones, or
  // source-list identities.
  const originalPrintings = Object.freeze([
    'Mega Absol ex MEG 86','Sableye V SSH 120',
    'Plumeria BUS 120','Guzma BUS 115','Iono PAL 185',
    'Electrode-GX CES 48','Prism Energy ASC 216',
    'Darkness Energy MEE 15','Telepathic Psychic Energy POR 88',
    'Shadow Rider Calyrex V CRE 74','Unown AOR 30',
    'Squawkabilly ex PAL 169','Toedscruel PAR 17',
    'Battle VIP Pass FST 225',"Trainers' Mail ROS 92",
    'Rescue Carrier EVS 154','Rescue Stretcher GRI 130',
    'Ultra Ball MEG 131','Battle Compressor PHF 92',
    'VS Seeker PHF 109','Float Stone BKT 137',
    'Muscle Band XY 121','Forest Seal Stone SIT 156',
    'Wobbuffet PHF 36','Silent Lab PRC 140',
    'Path to the Peak CRE 148','PokéStop PGO 68',
    'Secret Box TWM 163','Temple of Sinnoh ASR 155',
    'Canceling Cologne ASR 136','Dedenne-GX UNB 57',
    'Escape Rope BST 125','Gengar & Mimikyu-GX TEU 53',
    'Girafarig LOT 94','Hisuian Heavy Ball ASR 146',
    'Toedscool PAR 16','Voltorb ROS 21'
  ]);
  const printingAliases=new Map(originalPrintings.map(full=>[
    full.replace(/ [0-9]+$/,''),full
  ]));
  printingAliases.set('Mega Absol ex M1L','Mega Absol ex MEG 86');
  const originalPrinting=x=>{
    const raw=typeof x==='string'?x:x?.printing??x?.actorPrinting??x?.targetPrinting??'';
    return printingAliases.get(raw)??raw;
  };
  const name = originalPrinting;
  const mega = x => /^Mega Absol ex MEG 86\b/i.test(name(x));
  const sableye = x => /^Sableye V SSH 120\b/i.test(name(x));
  const plumeria = x => /^Plumeria BUS 120\b/i.test(name(x));
  const guzma = x => /^Guzma BUS 115\b/i.test(name(x));
  const iono = x => /^Iono PAL 185\b/i.test(name(x));
  const num = x => Number.isFinite(x);
  const slots = p => [{zone:'active',index:0,p:p?.active},...L(p?.bench).map((p,index)=>({zone:'bench',index,p}))].filter(x=>x.p && !x.p.concealed);
  const remaining = p => num(p?.hp)&&num(p?.damage) ? p.hp-p.damage : Infinity;
  const type = t => ({d:'darkness',dark:'darkness',p:'psychic',c:'colorless',l:'lightning',g:'grass',r:'fire',w:'water',f:'fighting',m:'metal',y:'fairy',n:'dragon'}[String(t).toLowerCase()] ?? String(t).toLowerCase());
  function prize(p) {
    const n=name(p), st=L(p?.printed?.subtypes).join(' ');
    if (/Mega .+ ex\b|VMAX\b|&.+-GX\b/i.test(n)||/TAG TEAM|VMAX|MEGA EVOLUTION/i.test(st)) return 3;
    if (/\bVSTAR\b|\bV\b|-GX\b|-EX\b|\bex\b/i.test(n)||/\bVSTAR\b|\bV\b|\bGX\b|\bEX\b/i.test(st)) return 2;
    return 1;
  }
  function activeStadium(o) { return [...L(o.ownPublic?.stadium),...L(o.opponentPublic?.stadium)].map(name); }
  function abilityTexts(player) {
    return slots(player).flatMap(({p})=>L(p.abilityDetails).filter(a=>!L(p.abilitySuppressions).some(s=>s.abilityName===a.name&&s.suppressed===true)).map(a=>String(a.text??'')));
  }
  function uncertainDefense(o,p,kind) {
    // These are deliberate vetoes, not a complete paper modifier engine.
    const texts=abilityTexts(o.opponentPublic);
    const attachments=slots(o.opponentPublic).flatMap(({p})=>[...L(p.tools),...L(p.energies)]).map(name);
    if (attachments.some(x=>/Life Dew|Legacy Energy|Survival Brace|Hero's Cape|Luxurious Cape/i.test(x))) return true;
    if (kind==='effect') {
      return texts.some(x=>/prevent.{0,100}effects? of attacks|isn't affected by effects of attacks/i.test(x)) ||
        attachments.some(x=>/Mist Energy|Big Parasol|Wash .*Energy|Sparkling Robe/i.test(x));
    }
    return texts.some(x=>/prevent.{0,100}damage|take[s]?.{0,35}less damage|reduce.{0,40}damage|cannot be Knocked Out|would be Knocked Out/i.test(x)) ||
      attachments.some(x=>/Eviolite|Resistance Vest|Protective Goggles|Metal Core Barrier|Stone Fighting Energy|Hard Charm|Lucky Helmet|Rock Guard|Survival Brace/i.test(x)) ||
      activeStadium(o).some(x=>/Granite Cave|Lake Acuity|Full Metal Wall/i.test(x));
  }
  function energyUnits(e,p,o=null) {
    const s=name(e);
    if(o&&liveStadium(o,/Temple of Sinnoh/i)&&/^(?:Prism|Telepathic Psychic|Double Colorless|Twin|Jet|Gift|Mist|Guard|Double Dragon|Double Turbo|Rainbow|Aurora|Luminous|Reversal|Legacy|Rapid Strike|Single Strike|Capture|Powerful Colorless) Energy\b/i.test(s))return ['colorless'];
    if (/^Prism Energy\b/i.test(s)) {
      const basic=/basic/i.test(String(p?.printed?.stage))||L(p?.printed?.subtypes).some(x=>/^basic$/i.test(x));
      return [basic?'any':'colorless'];
    }
    if (/^Telepathic Psychic Energy\b/i.test(s)) return ['psychic'];
    if (/^(?:Basic )?(Grass|Fire|Water|Lightning|Psychic|Fighting|Darkness|Metal|Fairy) Energy\b/i.test(s))
      return [type(s.match(/^(?:Basic )?(\w+) Energy\b/i)[1])];
    if (/^Double Colorless Energy\b|^Twin Energy\b/i.test(s)) return /^Double/i.test(s)?['colorless','colorless']:null;
    if (/^Jet Energy\b|^Gift Energy\b|^Mist Energy\b|^Guard Energy\b/i.test(s)) return ['colorless'];
    return null;
  }
  function payable(p,cost,removed=-1,o=null) {
    if(!Array.isArray(cost))return null;
    if(cost.length===0)return true;
    const req=cost.map(type);
    if(req.some(x=>!['darkness','psychic','colorless','lightning','grass','fire','water','fighting','metal','fairy','dragon'].includes(x))) return null;
    const parts=L(p?.energies).filter((_,i)=>i!==removed).map(e=>energyUnits(e,p,o));
    if(parts.some(x=>x===null)) return null;
    const units=parts.flat(), ordered=req.sort((a,b)=>(a==='colorless')-(b==='colorless'));
    function dfs(i,used) {
      if(i===ordered.length)return true;
      for(let j=0;j<units.length;j++)if(!used.has(j)&&(ordered[i]==='colorless'||units[j]===ordered[i]||units[j]==='any')) {
        used.add(j);if(dfs(i+1,used))return true;used.delete(j);
      }
      return false;
    }
    return dfs(0,new Set());
  }
  function printedDamage(o,attacker,target,attack) {
    if(!target||!attacker||remaining(target)<=0||!num(target.damage))return null;
    if(attack==='Terminal Period')return target.damage===60&&!uncertainDefense(o,target,'effect')?Infinity:0;
    let raw=attack==='Claw of Darkness'?200:attack==='Crazy Claws'?10+6*target.damage:null;
    if(raw===null||uncertainDefense(o,target,'damage'))return null;
    // Known source-specific modifier only; no assumption about other Tools.
    if(L(attacker.tools).some(x=>/^Muscle Band\b/i.test(name(x)))) {
      if(!activeStadium(o).some(x=>/Jamming Tower/i.test(x)) && !o.ownPublic?.publicTurnRestrictions?.stadiumAndToolHaveNoEffectTurnsRemaining) raw+=20;
    }
    const weak=L(target.printed?.weakness).filter(x=>type(x.type)==='darkness');
    const resist=L(target.printed?.resistance).filter(x=>type(x.type)==='darkness');
    for(const w of weak) { const v=String(w.value);if(/^[×x]\s*2$/i.test(v))raw*=2;else if(/^\+\d+$/.test(v))raw+=Number(v);else return null; }
    for(const r of resist) {if(!/^-\d+$/.test(String(r.value)))return null;raw+=Number(r.value);}
    return Math.max(0,raw);
  }
  const condition=(x)=>typeof x==='number'?(['paralyzed','confused','asleep','poisoned','burned'][x]??'unknown'):String(x).toLowerCase();
  function usable(p,attack,o=null) {
    if(!p)return false;
    if(L(p.specialConditions).some(x=>/asleep|paralyzed|confused|unknown/i.test(condition(x))))return false;
    const a=p.publicRestrictions??{};
    if(a.cannotAttackNextTurn||L(a.cannotUseAttacksNextTurn).includes(attack)||a.blockedAttackNameNextTurn===attack||a.blockedAttackNameUntilLeavesActive===attack||a.onlyAllowedAttackNameNextTurn&&a.onlyAllowedAttackNameNextTurn!==attack)return false;
    if(a.attackCostIncreaseNextTurn||a.attackCostIncreaseWhileActive)return false;
    const cost=attack==='Terminal Period'?['darkness','colorless']:attack==='Claw of Darkness'?['darkness','darkness','colorless']:attack==='Crazy Claws'?['darkness','darkness']:null;
    return cost!==null&&payable(p,cost,-1,o)===true;
  }
  function finishesGame(o,target){
    const need=o.ownPublic?.prizeCount;
    return !!target&&(num(need)&&prize(target)>=need||target===o.opponentPublic?.active&&Array.isArray(o.opponentPublic?.bench)&&o.opponentPublic.bench.every(x=>x==null));
  }
  function knockoutScore(o,attacker,target,attack) {
    const d=printedDamage(o,attacker,target,attack);
    if(d===null||d<remaining(target))return 0;
    const p=prize(target), need=o.ownPublic?.prizeCount;
    return finishesGame(o,target)?1000:400+70*p;
  }
  function bestAttackAgainst(o,attacker,target) {
    const names=mega(attacker)?['Terminal Period','Claw of Darkness']:sableye(attacker)?['Crazy Claws']:[];
    return Math.max(0,...names.filter(a=>usable(attacker,a,o)).map(a=>knockoutScore(o,attacker,target,a)));
  }
  function rootAttack(item,o) {
    if(item.kind!=='attack'||M(item).attackCostPayable===false||M(item).hasUnmodeledModifier===true)return 0;
    const a=item.attackName??M(item).attackName;
    const own=o.ownPublic?.active, opp=o.opponentPublic?.active;
    if(L(own?.specialConditions).some(x=>/asleep|paralyzed|unknown/i.test(condition(x))))return 0;
    const confused=L(own?.specialConditions).some(x=>condition(x)==='confused');
    if(!(mega(own)&&['Terminal Period','Claw of Darkness'].includes(a)||sableye(own)&&a==='Crazy Claws'))return confused?Math.min(399,secondaryAttackScore(o,item)*.5):secondaryAttackScore(o,item);
    if(a==='Terminal Period'&&opp?.damage!==60)return 0;
    if(a!=='Terminal Period'&&(M(item).hasPrevention===true||Number(M(item).damagePrevented)>0))return 0;
    const ko=knockoutScore(o,own,opp,a);
    if(ko){const value=ko+(a==='Claw of Darkness'?2:a==='Terminal Period'?1:0);return confused?Math.min(399,value*.5):value;}
    const d=printedDamage(o,own,opp,a);
    return a!=='Terminal Period'&&d>0?(100+Math.min(d,300)/10)*(confused?.5:1):0;
  }
  function opponentChoice(o,choice) {
    const m=M(choice);
    if(m.ownerSeat!=='opponent')return null;
    const zone=m.targetZone??m.sourceZone, idx=m.benchIndex??m.slotIndex;
    if(zone==='active')return {zone,index:0,p:o.opponentPublic?.active};
    if(zone==='bench'&&Number.isSafeInteger(idx))return {zone,index:idx,p:o.opponentPublic?.bench?.[idx]};
    return null;
  }
  function ownChoice(o,choice) {
    const m=M(choice);
    if(m.ownerSeat!=='actor'||(m.targetZone??m.sourceZone)!=='bench')return null;
    const idx=m.benchIndex??m.slotIndex;
    return Number.isSafeInteger(idx)?o.ownPublic?.bench?.[idx]:null;
  }
  function safeCosts(cards,o,n,excluded='') {
    // Use expired VIP Pass or duplicate non-Energy Trainers, never burn the sole
    // attacker, evolution, Energy or connector for this disruption slice.
    const hand=L(o.ownHand).map(name), count=new Map();
    for(const s of hand) count.set(s,(count.get(s)??0)+1);
    const out=[];
    for(const c of cards){
      const s=name(c);
      if(!s||s===excluded||M(c).ownerSeat!==undefined&&M(c).ownerSeat!=='actor')continue;
      const expired=/^Battle VIP Pass\b/i.test(s)&&o.globalTurn>2;
      const dupe=/^(Trainers' Mail|Rescue Carrier|Rescue Stretcher|Iono|Guzma|VS Seeker|Ultra Ball|Hisuian Heavy Ball|Silent Lab)\b/i.test(s)&&(count.get(s)??0)>1;
      if(expired||dupe){out.push(c);count.set(s,(count.get(s)??0)-1);}
      if(out.length===n)break;
    }
    return out.length===n?out:[];
  }
  function currentAttackCost(o,p,a){
    if(!Array.isArray(a.cost)||p.publicRestrictions?.attackCostIncreaseNextTurn||p.publicRestrictions?.attackCostIncreaseWhileActive)return null;
    const c=a.cost.slice();
    if(L(p.printed?.types).some(t=>type(t)==='psychic')&&liveStadium(o,/Dimension Valley/i)){
      const i=c.findIndex(t=>type(t)==='colorless');if(i>=0)c.splice(i,1);
    }
    return c;
  }
  function publicOpponentDamage(o,p,target,a){
    let damage=Number(a.damage);
    if(/^Max Geist$/i.test(a.name??'')&&/^Shadow Rider Calyrex VMAX\b/i.test(name(p))){
      let psychic=0;
      for(const {p:q} of slots(o.opponentPublic)){
        for(const e of L(q.energies)){
          const u=energyUnits(e,q,o);
          if(u===null)return null;
          psychic+=u.filter(x=>x==='psychic'||x==='any').length;
        }
      }
      damage=10+30*psychic;
    }
    if(!Number.isFinite(damage)||damage<=0)return null;
    const types=L(p.printed?.types).map(type);
    if(types.length===1){
      for(const w of L(target?.printed?.weakness).filter(x=>type(x.type)===types[0])){
        const v=String(w.value);
        if(/^[×x]\s*2$/i.test(v))damage*=2;else if(/^\+\d+$/.test(v))damage+=Number(v);else return null;
      }
      for(const r of L(target?.printed?.resistance).filter(x=>type(x.type)===types[0])){
        if(!/^-\d+$/.test(String(r.value)))return null;damage+=Number(r.value);
      }
    }
    return Math.max(0,damage);
  }
  function threatAttacks(o,p) {
    if(!p||L(p.specialConditions).some(x=>/asleep|paralyzed|unknown/i.test(condition(x))))return [];
    const hp=remaining(o.ownPublic?.active);
    return L(p.attacks).filter(a=>!a.gxAttack||!o.opponentPublic?.publicTurnRestrictions?.gxUsed)
      .map(a=>({...a,effectiveCost:currentAttackCost(o,p,a)}))
      .filter(a=>{const d=publicOpponentDamage(o,p,o.ownPublic?.active,a);return d!==null&&d>=hp;})
      .filter(a=>a.effectiveCost!==null&&payable(p,a.effectiveCost,-1,o)===true);
  }
  function withoutOpponentEnergy(o,row,i){
    const p={...row.p,energies:L(row.p.energies).filter((_,j)=>j!==i)};
    const opp=o.opponentPublic;
    return {...o,opponentPublic:row.zone==='active'?{...opp,active:p}:{...opp,bench:L(opp.bench).map((q,j)=>j===row.index?p:q)}};
  }
  function denial(o,row) {
    const p=row?.p;
    if(!p||!L(p.energies).length)return null;
    const immediate=threatAttacks(o,o.opponentPublic?.active);
    const local=threatAttacks(o,p);
    if(!immediate.length&&!local.length)return null;
    const eligible=L(p.energies).map((e,i)=>({printing:name(e),i})).map(e=>{
      const next=withoutOpponentEnergy(o,row,e.i);
      const reduced=row.zone==='active'?next.opponentPublic.active:next.opponentPublic.bench[row.index];
      const shutsActive=immediate.length>0&&threatAttacks(next,next.opponentPublic.active).length===0;
      const shutsLocal=local.length>0&&threatAttacks(next,reduced).length===0;
      return {...e,score:shutsActive?260+20*prize(o.ownPublic?.active):shutsLocal?150+20*prize(o.ownPublic?.active):0};
    });
    const selected=best(eligible,e=>e.score);
    // Present threat denied, not proof against a fresh attachment, gust or
    // Underworld Door next turn. Max Geist pool loss can matter off Active.
    return selected?{row,energy:selected.printing,score:selected.score}:null;
  }
  function select(prompt,choices,n,reason) {
    if(!choices.length||choices.length!==n)return {kind:'abstain',reasonCode:reason};
    const m=M(prompt), multi=['pokemon','card-combination','prize-slots','energy-payment','energy-transfers','card-order'].includes(m.selectionType);
    if(multi) {
      if(!Number.isSafeInteger(m.minimumCount)||!Number.isSafeInteger(m.maximumCount)||n<m.minimumCount||n>m.maximumCount)return {kind:'abstain',reasonCode:'BAD_CARD_SELECTION_BOUNDS'};
      return {kind:'select-choices',tokens:choices.map(c=>c.token)};
    }
    return n===1?{kind:'select-choice',token:choices[0].token}:{kind:'abstain',reasonCode:'BAD_CARD_SELECTION_BOUNDS'};
  }
  function best(rows,score) {
    let win=null,v=0;
    for(const row of rows){const s=score(row);if(s>v){win=row;v=s;}}
    return win;
  }
function bombPlanner(o,sourceBenchIndex){
  // A recommendation over publicly identified discard occurrences, NOT an
  // executable native prompt decision. Never select this via root().
  const own=o?.ownPublic,opp=o?.opponentPublic,activeSource=sourceBenchIndex===-1,source=activeSource?own?.active:own?.bench?.[sourceBenchIndex];
  if(!Number.isInteger(sourceBenchIndex)||!/^Electrode-GX CES 48\b/i.test(name(source)))return null;
  if(!Number.isSafeInteger(opp?.prizeCount)||opp.prizeCount<=2||!Number.isSafeInteger(own?.prizeCount)||own.prizeCount<1)return null;
  if(L(source.abilitySuppressions).some(x=>x.abilityName==='Extra Energy Bomb'&&x.suppressed===true))return null;
  if(liveStadium(o,/Path to the Peak/i))return null;
  const active=own.active,target=opp.active;
  if(!active||!target||activeSource&&!L(own.bench).some(p=>p&&!p.concealed))return null;
  const recipients=slots(own).filter(({p})=>mega(p)||sableye(p)||isUn(p)||isVol(p)||isToed(p)||cruel(p)||isSquawk(p));
  if(!recipients.some(r=>mega(r.p)||sableye(r.p)))return null;
  const available=L(own.discard).map((printing,index)=>({printing:name(printing),index})).filter(x=>/^(?:Prism Energy ASC 216|Darkness Energy MEE 15|Telepathic Psychic Energy POR 88)\b/i.test(x.printing));
  // Source-bound deck has at most seven Energy cards. An unexpected public
  // Energy printing, or excess copies, invalidates this model's count.
  if(L(own.discard).some(x=>/\bEnergy\b/i.test(name(x))&&!available.some(y=>y.printing===name(x))&&!/Energy (?:Switch|Retrieval|Recycler|Search|Loto|Spinner|Stadium|Reset|Recycle|Restore)\b/i.test(name(x))))return null;
  if(available.length<1||available.length>7)return null;
  for(const [pattern,cap] of [[/^Prism Energy\b/i,4],[/^Darkness Energy\b/i,2],[/^Telepathic Psychic Energy\b/i,1]])if(available.filter(e=>pattern.test(e.printing)).length>cap)return null;
  const n=Math.min(5,available.length),baseline=bombMobility(o,null)?.score??0;
  if(baseline>=1000)return null;
  const assignments=[],byRecipient=recipients.map(()=>[]);let bestPlan=null;
  const compare=(a,b)=>!b||a.score>b.score||a.score===b.score&&a.activeCount<b.activeCount;
  function examine(){
    const upgraded=recipients.map((r,i)=>({...r,p:{...r.p,energies:[...L(r.p.energies),...byRecipient[i].map(x=>x.printing)]}}));
    const upgradedBoard={...o,ownPublic:{...own,active:activeSource?null:upgraded.find(x=>x.zone==='active')?.p??active,bench:L(own.bench).map((p,j)=>j===sourceBenchIndex?null:upgraded.find(x=>x.zone==='bench'&&x.index===j)?.p??p)}};
    let next=upgradedBoard,move;
    if(activeSource){
      const promotions=slots(upgradedBoard.ownPublic).filter(x=>x.zone==='bench'&&(mega(x.p)||sableye(x.p)));
      const plans=promotions.map(p=>{
        const board={...upgradedBoard,ownPublic:{...upgradedBoard.ownPublic,active:p.p,bench:upgradedBoard.ownPublic.bench.map((q,i)=>i===p.index?null:q)}};
        const m=bombMobility(board,null);
        return m?{board,move:{...m,promotionIndex:p.index,promotionPrinting:name(p.p)}}:null;
      }).filter(Boolean);
      const selected=best(plans,p=>p.move.score);
      if(!selected)return;
      next=selected.board;move=selected.move;
    }else move=bombMobility(next,sourceBenchIndex);
    if(!move||move.score<400||move.score<=baseline)return;
    const denialLine=move.score<1000&&twoPrizeEngineDenial(next,move);
    if(move.score<1000&&(!denialLine&&(move.minPrizes<3||opp.prizeCount===3)||lethalBombReply(next,move)))return;
    const attackOriginal=activeSource&&move.zone==='active'?{zone:'bench',index:move.promotionIndex}:move;
    const backup=upgraded.filter(x=>!(x.zone===attackOriginal.zone&&x.index===attackOriginal.index)).reduce((sum,x)=>sum+(mega(x.p)&&usable(x.p,'Claw of Darkness',o)||sableye(x.p)&&usable(x.p,'Crazy Claws',o)?25:0),0);
    const activeCount=assignments.filter(x=>x.zone===attackOriginal.zone&&x.index===attackOriginal.index).length;
    // A successful direct KO is preferred to an equivalent paid switch. The
    // worst-case Prize return, not a favorable opponent Rope choice, drives
    // the mobility decision.
    const plan={sourceBenchIndex,sourceZone:activeSource?'active':'bench',required:n,score:move.score+backup,activeCount,immediateWin:move.score>=1000,tempoDenial:denialLine,mobility:move,assignments:assignments.map(x=>({...x}))};
    if(compare(plan,bestPlan))bestPlan=plan;
  }
  function visit(i,used){
    if(used===n){examine();return}
    if(i===available.length||used+available.length-i<n)return;
    visit(i+1,used);
    const e=available[i];
    for(let j=0;j<recipients.length;j++){
      const r=recipients[j];byRecipient[j].push(e);assignments.push({discardIndex:e.index,printing:e.printing,zone:r.zone,index:r.index});
      visit(i+1,used+1);assignments.pop();byRecipient[j].pop();
    }
  }
  visit(0,0);return bestPlan;
}

  function moveTarget(o,move){
    return move.targetZone==='bench'?o.opponentPublic?.bench?.[move.targetIndex]:o.opponentPublic?.active;
  }
  function replyBoard(o,move){
    if(move.kind==='rope')return null;
    const target=moveTarget(o,move),enemy=slots(o.opponentPublic).filter(x=>move.targetZone==='bench'?!(x.zone==='bench'&&x.index===move.targetIndex):x.zone!=='active').map(x=>x.p);
    const attacker=move.zone==='bench'?o.ownPublic?.bench?.[move.index]:o.ownPublic?.active;
    if(!target||!attacker)return null;
    return {target,enemy,attacker};
  }
  function currentLethalReply(o,move){
    const b=replyBoard(o,move);
    if(!b)return true;
    return b.enemy.some((p,i)=>threatAttacks({...o,ownPublic:{...o.ownPublic,active:b.attacker},opponentPublic:{...o.opponentPublic,active:p,bench:b.enemy.filter((_,j)=>j!==i)}},p).length>0);
  }
  function lethalBombReply(o,move){
    if(move.score>=1000)return false;
    const attacker=move.zone==='bench'?o.ownPublic?.bench?.[move.index]:o.ownPublic?.active;
    return Number(o.opponentPublic?.prizeCount)-2<=prize(attacker)&&currentLethalReply(o,move);
  }
  function twoPrizeEngineDenial(o,move){
    if(move.minPrizes!==2||Number(o.opponentPublic?.prizeCount)!==6||move.kind==='rope')return false;
    const b=replyBoard(o,move);
    if(!b||!/^Shadow Rider Calyrex V CRE 74\b/i.test(name(b.target)))return false;
    if(b.enemy.some(p=>/^Shadow Rider Calyrex V(?:MAX)?\b/i.test(name(p))))return false;
    return !currentLethalReply(o,move);
  }
  function bombMobility(o,excludedBenchIndex){
    const own=o.ownPublic,opp=o.opponentPublic,active=own?.active,target=opp?.active;
    const activeScore=bestAttackAgainst(o,active,target);
    const out=[];
    if(activeScore>=400)out.push({kind:'direct',zone:'active',index:0,score:activeScore,minPrizes:prize(target),cost:0});
    const attackers=slots(own).filter(x=>x.zone==='bench'&&x.index!==excludedBenchIndex&&(mega(x.p)||sableye(x.p)));
    const canRetreat=o.ownTurnResources?.retreatedTurn!==true&&(!Number.isInteger(o.ownTurnResources?.retreatedTurn)||o.ownTurnResources.retreatedTurn!==o.globalTurn);
    const rc=canRetreat?retreatCost(o,{publicMetadata:{}}):null;
    const canFloat=canRetreat&&!o.ownTurnResources?.toolPlayLocked&&!own?.publicTurnRestrictions?.toolPlayLocked&&!L(active?.tools).length&&handHas(o,x=>match(x,R.float))&&!liveStadium(o,/Jamming Tower/i)&&!own?.publicTurnRestrictions?.stadiumAndToolHaveNoEffectTurnsRemaining&&!opp?.publicTurnRestrictions?.stadiumAndToolHaveNoEffectTurnsRemaining;
    const floated=canFloat?{...o,ownPublic:{...own,active:{...active,tools:['Float Stone BKT 137']}}}:null;
    const floatCost=floated?retreatCost(floated,{publicMetadata:{}}):null;
    const support=o.ownTurnResources?.supporterPlayedTurn===0&&!o.ownTurnResources?.supporterPlayLocked&&!own?.publicTurnRestrictions?.supporterPlayLocked&&handHas(o,guzma);
    const rope=!o.ownTurnResources?.itemPlayLocked&&!own?.publicTurnRestrictions?.itemPlayLocked&&handHas(o,x=>/^Escape Rope BST 125\b/i.test(name(x)));
    const enemyBench=slots(opp).filter(x=>x.zone==='bench');
    const oppRope=enemyBench.length?enemyBench:[{zone:'active',index:0,p:target}];
    const scoreMove=(kind,a,t,fee=0,extra={})=>{
      const k=bestAttackAgainst(o,a.p,t.p);
      if(k<400)return null;
      return {kind,zone:'bench',index:a.index,targetZone:t.zone,targetIndex:t.index,minPrizes:prize(t.p),score:k>=1000?1000:Math.max(0,k-fee),cost:fee,...extra};
    };
    for(const a of attackers){
      if(rc!==null){const m=scoreMove('retreat',a,{zone:'active',index:0,p:target},35*rc,{payment:rc});if(m)out.push(m);}
      if(floatCost!==null){const m=scoreMove('float-retreat',a,{zone:'active',index:0,p:target},25+35*floatCost,{payment:floatCost});if(m)out.push(m);}
      if(support)for(const t of enemyBench){const m=scoreMove('guzma',a,t,45);if(m)out.push(m);}
    }
    if(rope&&attackers.length){
      // Opponent selects first. We may adapt our own promotion to that
      // public target, but do not assume their most favorable choice.
      const replies=oppRope.map(t=>best(attackers,a=>scoreMove('rope',a,t,30)?.score??0)).map((a,i)=>a?scoreMove('rope',a,oppRope[i],30):null);
      if(replies.every(Boolean)){
        const worst=replies.reduce((a,b)=>a.score<=b.score?a:b);
        out.push({...worst,kind:'rope',responses:replies.map(m=>({targetZone:m.targetZone,targetIndex:m.targetIndex,ownBenchIndex:m.index,score:m.score})),minPrizes:Math.min(...replies.map(m=>m.minPrizes))});
      }
    }
    return best(out,m=>m.score);
  }
  const isVol=x=>/^Voltorb ROS 21\b/i.test(name(x));
  const isToed=x=>/^Toedscool PAR 16\b/i.test(name(x));
  const isUn=x=>/^Unown AOR 30\b/i.test(name(x));
  const isDedenne=x=>/^Dedenne-GX UNB 57\b/i.test(name(x));
  const isGengar=x=>/^Gengar & Mimikyu-GX TEU 53\b/i.test(name(x));
  const isSquawk=x=>/^Squawkabilly ex PAL 169\b/i.test(name(x));
  const basic=x=>mega(x)||sableye(x)||[isVol,isToed,isUn,isDedenne,isGengar,isSquawk].some(f=>f(x));
  const benchCount=o=>L(o.ownPublic?.bench).filter(x=>x!==null&&x!==undefined).length;
  function chooseSetup(r){
    const p=r.prompt,o=r.observation,m=M(p),cs=L(p.choices);
    if(p.source?.sourceKind!=='engine'||p.source.sourcePrinting!==null||p.source.classification!=='actor-choice'||p.actingSeat!==o.actorSeat)return null;
    const no=reasonCode=>({kind:'abstain',reasonCode});
    if(o.phase===1&&p.source.effectName===p.description&&p.promptType==='ConfirmPrompt'&&p.description==='GO_FIRST'){
      // Earlier Voltorb evolution is our current source-pilot hypothesis.
      const y=cs.filter(c=>c.kind==='confirm'&&/^yes$/i.test(c.label??'')),n=cs.filter(c=>c.kind==='confirm'&&/^no$/i.test(c.label??''));
      return m.selectionType==='confirm'&&y.length===1&&n.length===1?{kind:'select-choice',token:y[0].token}:no('BAD_GO_FIRST_CONFIRM_CHOICES');
    }
    if(o.phase===1&&p.source.effectName===p.description&&p.promptType==='SelectPrompt'&&p.description==='WANT_TO_DRAW_CARDS'){
      const opts=cs.filter(c=>c.kind==='option'&&Number.isSafeInteger(M(c).choiceIndex)&&M(c).choiceIndex>=0&&M(c).choiceIndex<m.count&&c.label==='Draw '+(m.count-1-M(c).choiceIndex)+' card(s)');
      if(m.selectionType!=='option'||!Number.isSafeInteger(m.count)||m.count<1||opts.length!==m.count||new Set(opts.map(c=>M(c).choiceIndex)).size!==m.count)return no('BAD_MULLIGAN_DRAW_SETUP_PROMPT');
      return {kind:'select-choice',token:opts.find(c=>M(c).choiceIndex===0).token};
    }
    if(o.phase===1&&p.source.effectName===p.description&&p.promptType==='ChooseCardsPrompt'&&p.description==='CHOOSE_STARTING_POKEMONS'){
      const min=m.minimumCount,max=m.maximumCount;
      if(m.selectionType!=='card-combination'||m.sourceZone!=='hand'||m.ownerSeat!=='actor'||m.isOwnerVisible!==true||m.allowCancel!==false||![0,1].includes(min)||!Number.isSafeInteger(max)||max<min)return no('BAD_STARTING_POKEMON_SETUP_PROMPT');
      const candidates=cs.filter(c=>c.kind==='card'&&M(c).sourceZone==='hand'&&M(c).ownerSeat==='actor'&&M(c).isOwnerVisible===true&&basic(c));
      const board=slots(o.ownPublic).map(x=>x.p),out=[];
      if(min===1){
        if(o.ownPublic?.active!==null)return no('INVALID_STARTING_POKEMON_PROMPT');
        const secondKnown=[0,1].includes(o.turnSeat)&&o.turnSeat!==o.actorSeat,earlyFuel=L(o.ownHand).some(x=>match(x,R.psychic));
        const a=best(candidates,c=>isGengar(c)&&secondKnown&&earlyFuel?150:mega(c)?100:isUn(c)?80:isGengar(c)?70:sableye(c)?60:isToed(c)?40:isSquawk(c)?30:isDedenne(c)?20:isVol(c)?10:0);
        if(!a)return no('NO_VISIBLE_STARTING_POKEMON');
        out.push(a);board.push(a);
      }else if(!o.ownPublic?.active)return no('MISSING_ACTIVE_FOR_EXTRA_BENCH');
      const limit=Math.min(max-out.length,Math.max(0,4-benchCount(o)));
      let added=0;
      // Preserve hand-play draw engines, reserve a free Bench slot.
      for(const f of [mega,isVol,isToed,isUn,isUn]){
        const already=board.filter(f).length,cap=f===isUn?2:1;
        if(already>=cap||added>=limit)continue;
        const c=candidates.find(x=>!out.includes(x)&&f(x));
        if(c){out.push(c);board.push(c);added++;}
      }
      if(out.length)return select(p,out,out.length,'NO_STARTING_POKEMON_CHOICE');
      const empty=cs.find(c=>c.kind==='empty-selection');
      return min===0&&empty?{kind:'select-choice',token:empty.token}:no('NO_EMPTY_BENCH_SELECTION');
    }
    if(p.promptType==='ChoosePrizePrompt'&&m.selectionType==='prize-slots'){
      const n=m.requiredCount,c=cs.filter(c=>c.kind==='prize'&&M(c).ownerSeat==='actor');
      if(!Number.isSafeInteger(n)||n<1||c.length<n)return no('NO_LEGAL_PRIZE_SELECTION');
      // Deliberately blind; no assumption of Prize-location knowledge.
      return {kind:'select-choices',tokens:c.slice(0,n).map(x=>x.token)};
    }
    if(p.promptType==='ChoosePokemonPrompt'&&m.selectionType==='pokemon'&&o.ownPublic?.active===null){
      const c=best(cs,c=>{
        const q=ownChoice(o,c);if(!q)return 0;
        const ko=bestAttackAgainst(o,q,o.opponentPublic?.active);
        if(ko)return 1000+ko;
        if(mega(q)&&usable(q,'Claw of Darkness',o))return 400;
        if(isUn(q)&&!L(q.energies).length)return 150;
        if(isVol(q))return 10;
        return 60/prize(q);
      });
      return c?select(p,[c],1,'NO_SUPPORTED_POKEMON_CHOICE'):no('NO_VISIBLE_POKEMON_TARGET');
    }
    return no('UNSUPPORTED_ENGINE_SETUP_PROMPT');
  }
  function chooseClaw(r){
    const p=r.prompt,o=r.observation,cs=L(p.choices),src=p.source;
    if(p.actingSeat!==o.actorSeat||src?.classification!=='actor-choice'||src.sourceKind!=='card-effect'||!mega(src.sourcePrinting)||src.effectName!=='Claw of Darkness'||p.promptType!=='ChooseCardsPrompt')return null;
    const seen=cs.filter(c=>c.kind==='card'&&M(c).ownerSeat==='opponent'&&M(c).sourceZone==='hand'&&M(c).isOwnerVisible===true);
    if(seen.length!==cs.length)return {kind:'abstain',reasonCode:'UNTRUSTED_CARD_SELECTION'};
    const c=best(seen,c=>{
      const x=name(c),duplicates=seen.filter(y=>name(y)===x).length;
      let v=30;
      if(/Guzma|Boss's Orders|Counter Catcher|Prime Catcher/i.test(x))v=250;
      if(/Shadow Rider Calyrex VMAX/i.test(x)&&slots(o.opponentPublic).some(y=>/Shadow Rider Calyrex V\b/i.test(name(y.p))&&!/VMAX/i.test(name(y.p))))v=360;
      if(/Field Blower|Lost Vacuum|Tool Scrapper|Stealthy Hood/i.test(x)&&activeStadium(o).some(s=>/Silent Lab|Path to the Peak/i.test(s)))v=310;
      if(/Iono|Professor's Research|Lillie's Determination|Cynthia|Carmine|Colress/i.test(x))v=seen.length<=3?300:190;
      if(/Mysterious Treasure|Ultra Ball|Fog Crystal|Quick Ball|Computer Search|Secret Box/i.test(x))v=220;
      if(/\bEnergy\b/i.test(x))v=seen.filter(y=>/\bEnergy\b/i.test(name(y))).length===1&&L(o.opponentPublic?.active?.energies).length<2?240:65;
      return Math.max(1,v-45*(duplicates-1));
    });
    return c?select(p,[c],1,'NO_USEFUL_CARD_CHOICE'):{kind:'abstain',reasonCode:'NO_USEFUL_CARD_CHOICE'};
  }


  const R={
    electrode:/^Electrode-GX CES 48\b/i,cruel:/^Toedscruel PAR 17\b/i,
    vip:/^Battle VIP Pass FST 225\b/i,mail:/^Trainers' Mail ROS 92\b/i,carrier:/^Rescue Carrier EVS 154\b/i,
    stretcher:/^Rescue Stretcher GRI 130\b/i,ultra:/^Ultra Ball MEG 131\b/i,compressor:/^Battle Compressor PHF 92\b/i,
    vs:/^VS Seeker PHF 109\b/i,float:/^Float Stone BKT 137\b/i,muscle:/^Muscle Band XY 121\b/i,seal:/^Forest Seal Stone SIT 156\b/i,
    energy:/^(?:Prism Energy ASC 216|Darkness Energy MEE 15|Telepathic Psychic Energy POR 88)\b/i,
    dark:/^(?:Prism Energy ASC 216|Darkness Energy MEE 15)\b/i,psychic:/^(?:Prism Energy ASC 216|Telepathic Psychic Energy POR 88)\b/i
  };
  const match=(x,re)=>re.test(name(x));
  const ownHas=(o,pred)=>slots(o.ownPublic).some(x=>pred(x.p));
  const handHas=(o,pred)=>L(o.ownHand).some(pred);
  const has=(o,pred)=>ownHas(o,pred)||handHas(o,pred);
  const ePred=x=>match(x,R.energy);
  const elec=x=>match(x,R.electrode);
  const cruel=x=>match(x,R.cruel);
  const cap=o=>Math.max(0,5-benchCount(o));
  const first=o=>Number.isInteger(o.globalTurn)&&o.globalTurn<=2;
  const liveStadium=(o,re)=>activeStadium(o).some(x=>re.test(x))&&!o.ownPublic?.publicTurnRestrictions?.stadiumAndToolHaveNoEffectTurnsRemaining&&!o.opponentPublic?.publicTurnRestrictions?.stadiumAndToolHaveNoEffectTurnsRemaining;
  const cologne=x=>/^Canceling Cologne ASR 136\b/i.test(name(x));
  const activeWob=o=>{const p=o.opponentPublic?.active;return p&&!p.concealed&&/^Wobbuffet PHF 36\b/i.test(name(p))?p:null;};
  const bideState=o=>{const p=activeWob(o);return p?L(p.abilitySuppressions).find(s=>s.abilityName==='Bide Barricade')?.suppressed??null:true;};
  const drawEngineLive=o=>!liveStadium(o,/Silent Lab|Path to the Peak/i)&&bideState(o)===true&&Number(o.ownPublic?.deckCount)>6;
  function cologneDrawScore(o){
    // Only spend the singleton to enable a supported hand-to-Bench Dedechange
    // continuation. Never speculate that the unsupported Bomb will resolve.
    if(!activeWob(o)||bideState(o)!==false||liveStadium(o,/Silent Lab|Path to the Peak/i)||
       o.ownTurnResources?.itemPlayLocked||o.ownPublic?.publicTurnRestrictions?.itemPlayLocked||
       o.ownTurnResources?.abilityPokemonPlayLocked||o.ownPublic?.publicTurnRestrictions?.abilityPokemonPlayLocked||
       cap(o)<1||ownHas(o,isDedenne)||L(o.ownPublic?.discard).some(isDedenne)||
       Number(o.ownPublic?.deckCount)<=6)return 0;
    const h=L(o.ownHand).filter(x=>!cologne(x)),d=h.find(isDedenne);
    if(d)return h.length<=4&&protectedReset({...o,ownHand:h},name(d))?415:0;
    // Owner-certified K1 identifies the unique Dedenne as Prized: don't
    // consume the singleton Cologne for an impossible deck-search line.
    if(o.ownerK1?.exactMembershipKnown===true&&
       L(o.ownerK1.knownPrintings).some(c=>isDedenne(c)&&c.copies>0))return 0;
    // The unheld Dedenne route is supported only through an existing
    // Ultra Ball and two expendable cards; do not posit a free search.
    const ball=h.find(x=>match(x,R.ultra));
    if(!ball||!ownHas(o,mega)||!(ownHas(o,isVol)||ownHas(o,elec))||
       Number(o.ownPublic?.deckCount)<=8||h.length>5)return 0;
    const payment=safeCosts(h.filter(x=>!match(x,R.ultra)).map(printing=>({printing})),o,2,name(ball));
    return payment.length===2?375:0;
  }
  const abilityLive=(p,a)=>p&&!L(p.abilitySuppressions).some(x=>x.abilityName===a&&x.suppressed===true);
  const stadiumCard=x=>/^(?:Silent Lab PRC 140|Path to the Peak CRE 148|PokéStop PGO 68)\b/i.test(name(x));
  const basicDark=x=>/^Darkness Energy MEE 15\b/i.test(name(x));
  const darkCutRisk=o=>liveStadium(o,/Temple of Sinnoh/i)||slots(o.opponentPublic).some(x=>/^Girafarig LOT 94\b/i.test(name(x.p)));
  // The paired two-turn restricted opening model found a material cost to
  // exposing Compressor fuel before an opponent's Get Lost turn. Apply the
  // conditional decision only to the first own turn and public Girafarig,
  // not to unseen opponent cards or generic matchup assumptions.
  function deferCompressor(o){
    return first(o)&&slots(o.opponentPublic).some(x=>/^Girafarig LOT 94\b/i.test(name(x.p)))&&
      !slots(o.ownPublic).some(x=>elec(x.p)&&abilityLive(x.p,'Extra Energy Bomb')&&!liveStadium(o,/Path to the Peak/i));
  }
  function stadiumScore(c,o){
    if(!stadiumCard(c)||activeStadium(o).includes(name(c)))return 0;
    const next={...o,ownPublic:{...o.ownPublic,stadium:[name(c)]},opponentPublic:{...o.opponentPublic,stadium:[]}};
    const before=bestAttackAgainst(o,o.ownPublic?.active,o.opponentPublic?.active),after=bestAttackAgainst(next,next.ownPublic?.active,next.opponentPublic?.active);
    if(after>before)return after>=1000?950:470;
    if(liveStadium(o,/Temple of Sinnoh/i))return /^PokéStop/i.test(name(c))?345:/^Silent Lab/i.test(name(c))?285:280;
    if(liveStadium(o,/Path to the Peak/i)&&/^PokéStop/i.test(name(c))&&(has(o,elec)||handHas(o,isDedenne)))return 310;
    const opp=slots(o.opponentPublic),own=slots(o.ownPublic);
    const useful=p=>L(p.abilityDetails).some(a=>/Underworld Door|Abyssal Gate|Infernal Reign|Radiant|Intrepid Sword|Fleet-Footed|Dedechange|Wonder Tag|Set Up|Adrena-Brain|Restart/i.test(a.name??''));
    if(/^Path to the Peak/i.test(name(c))){
      const gain=opp.filter(x=>prize(x.p)>1&&useful(x.p)&&abilityLive(x.p,'Underworld Door')).length;
      const ownLoss=own.some(x=>elec(x.p)&&bombPossible(o))||handHas(o,isDedenne)||first(o)&&has(o,isSquawk);
      if(gain>0&&!ownLoss)return 340+Math.min(80,40*gain);
    }
    if(/^Silent Lab/i.test(name(c))){
      const gain=opp.filter(x=>/^basic$/i.test(x.p.printed?.stage??'')&&useful(x.p)).length;
      if(gain>0&&!own.some(x=>isUn(x.p))&&!handHas(o,isDedenne)&&!(first(o)&&has(o,isSquawk)))return 300;
    }
    return 0;
  }
  function secondaryAttackScore(o,item){
    const a=item.attackName??M(item).attackName,p=o.ownPublic?.active,target=o.opponentPublic?.active;
    if(!p||!target)return 0;
    let cost=null,raw=0,bonus=0;
    if(sableye(p)&&a==='Lode Search'){
      cost=['darkness'];bonus=Math.max(0,...L(o.ownPublic?.discard).map(c=>trainerSearch(c,o)));
      if(bonus<=0)return 0;
    }else if(isGengar(p)&&a==='Horror House-GX'){
      cost=['psychic'];if(o.ownPublic?.publicTurnRestrictions?.gxUsed===true)return 0;
      const handCount=Number(o.opponentPublic?.handCount),early=o.globalTurn<=4;
      const threat=threatAttacks(o,target).length>0;
      const evolved=slots(o.opponentPublic).filter(x=>/VMAX|VSTAR|Stage 2/i.test(name(x.p))).length;
      if(!Number.isFinite(handCount)||handCount<=0||threat&&!early)return 0;
      bonus=(early?300:140)+(evolved===0?55:0)-(threat?120:0);
      if(payable(p,['psychic','psychic'],-1,o)===true&&handCount<=2)bonus-=60;
    }else if(isGengar(p)&&a==='Poltergeist'){
      cost=['psychic','psychic'];const count=Number(o.opponentPublic?.handCount);
      if(!Number.isFinite(count)||count<=0)return 0;
      bonus=Math.min(230,50+25*count);
    }else if(isDedenne(p)&&['Static Shock','Tingly Return-GX'].includes(a)){
      cost=['lightning','colorless'];raw=50;
      if(a==='Tingly Return-GX'){
        if(o.ownPublic?.publicTurnRestrictions?.gxUsed===true||benchCount(o)===0)return 0;
        bonus=slots(o.opponentPublic).filter(x=>x.zone==='bench').length===0?130:35;
      }
    }else if(isUn(p)&&a==='Hidden Power'){cost=['colorless'];raw=10;}
    else if(isToed(p)&&a==='Kick'){cost=['colorless','colorless'];raw=20;}
    else if(isToed(p)&&a==='Absorb'){cost=['grass','colorless','colorless'];raw=40;bonus=10;}
    else if(isVol(p)&&a==='Thunder Wave'){cost=['lightning'];bonus=35;}
    else if(isVol(p)&&a==='Big Explosion'){
      cost=['lightning','colorless'];raw=60;if(benchCount(o)===0||o.opponentPublic?.prizeCount<=1)return 0;bonus=-130;
    }else return 0;
    if(L(p.printed?.types).some(t=>type(t)==='psychic')&&liveStadium(o,/Dimension Valley/i)){const i=cost.indexOf('colorless');if(i>=0)cost.splice(i,1);}
    if(payable(p,cost,-1,o)!==true)return 0;
    if(raw>0){
      if(uncertainDefense(o,target,'damage')||M(item).hasPrevention===true)return Math.max(0,bonus);
      const pt=L(p.printed?.types).map(type);
      if(L(p.tools).some(x=>match(x,R.muscle))&&!liveStadium(o,/Jamming Tower/i)&&!o.ownPublic?.publicTurnRestrictions?.stadiumAndToolHaveNoEffectTurnsRemaining)raw+=20;
      if(pt.length===1){
        for(const w of L(target.printed?.weakness).filter(x=>type(x.type)===pt[0])){if(/^[×x]2$/i.test(w.value))raw*=2;else if(/^\+\d+$/.test(w.value))raw+=Number(w.value);else return Math.max(0,bonus);}
        for(const r of L(target.printed?.resistance).filter(x=>type(x.type)===pt[0])){if(!/^-\d+$/.test(r.value))return Math.max(0,bonus);raw+=Number(r.value);}
      }
      if(raw>=remaining(target)){
        const final=finishesGame(o,target);
        if(a==='Big Explosion'&&!final)return 0;
        return final?1000:400+70*prize(target)+Math.max(0,bonus);
      }
    }
    return Math.max(0,bonus+(raw>0?60+raw:0));
  }
  function bombPossible(o){
    // A planning predicate, not authority to use the unavailable adapter.
    return Number(o.opponentPublic?.prizeCount)>2&&has(o,mega)&&
      (has(o,elec)||has(o,isVol))&&!liveStadium(o,/Path to the Peak/i);
  }
  function fundCost(cards,o,n,excluded){
    const cheap=safeCosts(cards,o,n,excluded);
    if(cheap.length===n)return cheap;
    // For search, explicitly allow useful Bomb fuel, but hold one manual
    // attachment and never discard the only strategic Pokemon to pay.
    if(!bombPossible(o))return [];
    const hand=L(o.ownHand).map(name),hs=hand.filter(ePred).length;
    const reserve=o.ownTurnResources?.energyPlayedTurn===false?1:0;
    const need=Math.max(0,5-L(o.ownPublic?.discard).filter(ePred).length);
    const es=cards.filter(c=>ePred(c)&&(!darkCutRisk(o)||!basicDark(c))&&(M(c).ownerSeat===undefined||M(c).ownerSeat==='actor')).sort((a,b)=>
      (match(b,R.dark)?1:0)-(match(a,R.dark)?1:0));
    const burn=Math.min(n,need,Math.max(0,hs-reserve),es.length);
    for(let k=burn;k>0;k--){
      const others=n-k===0?[]:safeCosts(cards.filter(c=>!ePred(c)),o,n-k,excluded);
      if(others.length===n-k)return [...others,...es.slice(0,k)];
    }
    return [];
  }
  function pokemonSearch(c,o){
    if(isGengar(c)&&!has(o,isGengar)&&horrorDesired(o))return 460;
    if(mega(c))return has(o,mega)?0:420;
    if(elec(c))return has(o,isVol)&&!has(o,elec)?365:0;
    if(isVol(c))return !has(o,isVol)&&!has(o,elec)?385:0;
    if(isToed(c))return !has(o,isToed)&&!has(o,cruel)?210:0;
    if(cruel(c))return has(o,isToed)&&!has(o,cruel)?240:0;
    if(isDedenne(c))return drawEngineLive(o)&&cap(o)>0&&!has(o,isDedenne)&&L(o.ownHand).length<=3?(activeWob(o)&&bideState(o)===true?340:230):0;
    if(isSquawk(c))return first(o)&&drawEngineLive(o)&&cap(o)>0&&!has(o,isSquawk)&&L(o.ownHand).length<=3?220:0;
    if(isUn(c))return cap(o)>0&&!liveStadium(o,/Silent Lab/i)&&Number(o.ownPublic?.deckCount)>8?175:0;
    if(sableye(c))return !has(o,sableye)&&Number(o.opponentPublic?.active?.damage)>=30?245:0;
    if(isGengar(c))return first(o)&&!has(o,isGengar)&&handHas(o,x=>match(x,R.psychic))?200:0;
    return 0;
  }
  function supporterSearch(c,o){
    if(guzma(c))return Math.max(0,...slots(o.opponentPublic).filter(t=>t.zone==='bench').flatMap(t=>slots(o.ownPublic).filter(a=>a.zone==='bench').map(a=>bestAttackAgainst(o,a.p,t.p))));
    if(plumeria(c)){
      const d=best(slots(o.opponentPublic),row=>denial(o,row)?.score??0);
      return d&&safeCosts(L(o.ownHand).map(printing=>({printing})),o,2,name(c)).length===2?denial(o,d).score:0;
    }
    if(iono(c))return ionoScore(o,name(c));
    return 0;
  }
  const heavy=c=>/^Hisuian Heavy Ball ASR 146\b/i.test(name(c));
  const secret=c=>/^Secret Box TWM 163\b/i.test(name(c));
  function heavyScore(o){
    const k=o.ownerK1;
    if(k?.exactMembershipKnown===true&&Array.isArray(k.knownPrintings)){
      return Math.max(0,...k.knownPrintings.filter(c=>c.copies>0&&basic(c)).map(c=>pokemonSearch(c,o)));
    }
    // K0: inspect Prizes only when there is an actual missing source Basic.
    return !has(o,mega)||!has(o,isVol)&&!has(o,elec)?160:0;
  }
  function secretCategory(c){
    const s=name(c);
    if(stadiumCard(c))return 'stadium';
    if([R.float,R.muscle,R.seal].some(re=>match(c,re)))return 'tool';
    if(guzma(c)||iono(c)||plumeria(c))return 'supporter';
    if(heavy(c)||[R.vip,R.mail,R.carrier,R.stretcher,R.ultra,R.compressor,R.vs].some(re=>match(c,re))||/^Escape Rope BST 125\b|^Canceling Cologne ASR 136\b/i.test(s))return 'item';
    return null;
  }
  function secretValue(c,o){
    const category=secretCategory(c);
    if(!category)return 0;
    // A category may be selected even when its effect is not immediately
    // useful; extracting a future connector costs no extra discard.
    const live=trainerSearch(c,o);
    if(live>0)return live;
    if(L(o.ownHand).some(h=>name(h)===name(c)))return 1;
    if(category==='stadium'&&darkCutRisk(o))return /^PokéStop/i.test(name(c))?90:65;
    if(category==='supporter')return iono(c)?75:guzma(c)?70:35;
    if(category==='tool')return match(c,R.float)?60:match(c,R.seal)?50:45;
    return match(c,R.vip)&&!first(o)?1:50;
  }
  function secretTargets(p,deck,o){
    const m=M(p),categories=['item','tool','supporter','stadium'],out=[];
    for(const cat of categories){
      const c=best(deck.filter(c=>secretCategory(c)===cat),c=>secretValue(c,o));
      if(c)out.push(c);
    }
    out.sort((a,b)=>secretValue(b,o)-secretValue(a,o));
    const picks=out.slice(0,m.maximumCount);
    if(picks.length<m.minimumCount)return {kind:'abstain',reasonCode:'NO_LEGAL_CARD_SET'};
    if(!picks.length){const empty=L(p.choices).find(c=>c.kind==='empty-selection');return empty&&m.minimumCount===0?{kind:'select-choice',token:empty.token}:{kind:'abstain',reasonCode:'NO_USEFUL_CARD_CHOICE'};}
    return select(p,picks,picks.length,'NO_LEGAL_CARD_SET');
  }
  function trainerSearch(c,o){
    if(cologne(c))return cologneDrawScore(o);
    if(heavy(c))return heavyScore(o);
    if(stadiumCard(c))return stadiumScore(c,o);
    if(match(c,R.vip))return first(o)&&cap(o)>0&&(!ownHas(o,mega)||!ownHas(o,isVol)&&!ownHas(o,elec))?370:0;
    if(match(c,R.ultra))return !has(o,mega)||has(o,isVol)&&!has(o,elec)||has(o,isToed)&&!has(o,cruel)?300:0;
    if(match(c,R.mail))return Number(o.ownPublic?.deckCount)>8?185:0;
    if(match(c,R.carrier))return L(o.ownPublic?.discard).some(x=>[isVol,isToed,isUn].some(f=>f(x))&&pokemonSearch(x,o)>0)?280:0;
    if(match(c,R.stretcher))return L(o.ownPublic?.discard).some(x=>pokemonSearch(x,o)>0)?260:0;
    if(match(c,R.compressor))return !deferCompressor(o)&&bombPossible(o)&&L(o.ownPublic?.discard).filter(ePred).length<3?315:0;
    if(match(c,R.vs))return L(o.ownPublic?.discard).some(x=>supporterSearch(x,o)>0)?230:0;
    if(match(c,R.float))return slots(o.ownPublic).some(x=>x.zone==='bench'&&bestAttackAgainst(o,x.p,o.opponentPublic?.active)>0)&&!L(o.ownPublic?.active?.tools).length?330:0;
    if(match(c,R.muscle))return ownHas(o,mega)?140:0;
    return supporterSearch(c,o);
  }
  function handAfter(o,exclude){
    const h=L(o.ownHand).map(name),index=h.indexOf(exclude);
    if(index>=0)h.splice(index,1);
    return h;
  }
  function protectedReset(o,exclude=''){
    const h=handAfter(o,exclude),energy=h.filter(ePred),manual=o.ownTurnResources?.energyPlayedTurn===false;
    const core=h.some(x=>mega(x)&&!ownHas(o,mega)||isVol(x)&&!ownHas(o,isVol)&&!ownHas(o,elec)||elec(x)&&ownHas(o,isVol)&&!ownHas(o,elec)||isToed(x)&&!ownHas(o,isToed)&&!ownHas(o,cruel)||cruel(x)&&ownHas(o,isToed)&&!ownHas(o,cruel)||match(x,R.vip)&&first(o)&&cap(o)>0||secret(x)||isGengar(x)&&horrorDesired(o));
    if(core||h.length>=6||energy.length&&(manual||!bombPossible(o)||energy.some(x=>darkCutRisk(o)&&basicDark(x))))return false;
    if(energy.length+L(o.ownPublic?.discard).filter(ePred).length>5)return false;
    const costly=h.filter(x=>!ePred(x)&&!(match(x,R.vip)&&!first(o))&&trainerSearch(x,o)>=250);
    return costly.length<=1&&h.length<=5;
  }
  function ionoScore(o,exclude=''){
    const own=o.ownPublic,opp=o.opponentPublic,h=handAfter(o,exclude);
    const p=Number(own?.prizeCount),q=Number(opp?.prizeCount),other=Number(opp?.handCount);
    if(!Number.isInteger(p)||p<1||p>6||!Number.isFinite(other)||!Number.isInteger(q)||q<1||q>6||Number(own?.deckCount)+h.length<p)return 0;
    if(horrorDesired(o))return 0;
    const protectedHand=h.some(x=>mega(x)&&!ownHas(o,mega)||isVol(x)&&!ownHas(o,isVol)&&!ownHas(o,elec)||elec(x)&&ownHas(o,isVol)&&!ownHas(o,elec)||cruel(x)&&ownHas(o,isToed)&&!ownHas(o,cruel)||secret(x)||ePred(x)&&o.ownTurnResources?.energyPlayedTurn===false);
    const gain=p-h.length,denial=Math.max(0,other-q);
    if(protectedHand&&gain<3)return 0;
    if(gain<1&&denial<3)return 0;
    if(gain< -2)return 0;
    return Math.max(0,120+40*gain+35*denial-(protectedHand?70:0));
  }
  function pokeStopScore(o){
    if(!liveStadium(o,/^PokéStop PGO 68\b/i)||Number(o.ownPublic?.deckCount)<7)return 0;
    if(slots(o.opponentPublic).some(x=>cruel(x.p)&&abilityLive(x.p,'Slime Mold Colony')))return 0;
    const h=L(o.ownHand),recovery=h.some(c=>match(c,R.carrier)||match(c,R.stretcher));
    if(!ownHas(o,mega)&&!recovery||!has(o,isVol)&&!ownHas(o,elec)&&!recovery)return 0;
    if(horrorDesired(o))return 0;
    const fuel=L(o.ownPublic?.discard).filter(ePred).length;
    return 155+Math.max(0,4-h.length)*25+(bombPossible(o)&&fuel<3?40:0);
  }
  function targetSlot(o,item){
    const m=M(item);
    if(m.targetSeat!=='actor'||m.isOwnerVisible!==true)return null;
    if(m.targetZone==='active')return o.ownPublic?.active;
    if(m.targetZone==='bench'&&Number.isSafeInteger(m.targetIndex))return o.ownPublic?.bench?.[m.targetIndex];
    return null;
  }
  function devScore(item,o){
    const m=M(item),x=name(item),p=targetSlot(o,item),d=L(o.ownPublic?.discard),h=L(o.ownHand);
    if(item.kind==='use-stadium'&&m.stadiumEffectLive===true&&/^PokéStop PGO 68\b/i.test(x))return pokeStopScore(o);
    if(item.kind==='use-ability'){
      const src=m.sourceZone==='active'?o.ownPublic?.active:m.sourceZone==='bench'&&Number.isSafeInteger(m.sourceIndex)?o.ownPublic?.bench?.[m.sourceIndex]:null;
      if(m.sourceSeat!=='actor'||!src||name(src)!==x||!abilityLive(src,m.abilityName))return 0;
      if(m.abilityName==='Farewell Letter'&&isUn(src)&&m.sourceZone==='bench'&&!liveStadium(o,/Silent Lab/i)&&!L(src.energies).length&&!L(src.tools).length&&Number(o.ownPublic?.deckCount)>8)return 390;
      if(m.abilityName==='Squawk and Seize'&&isSquawk(src)&&first(o)&&drawEngineLive(o)&&protectedReset(o))return 290;
      if(m.abilityName==='Star Alchemy'&&sableye(src)&&L(src.tools).some(x=>match(x,R.seal))&&!o.ownTurnResources?.vstarUsed&&(!has(o,mega)||has(o,isVol)&&!has(o,elec)||h.length<=2))return 280;
      return 0;
    }
    if(item.kind!=='play-card'||m.isLegal===false||m.canPlay===false)return 0;
    if(cologne(x))return cologneDrawScore(o);
    if(stadiumCard(x))return stadiumScore(x,o);
    if(heavy(x))return heavyScore(o);
    if(secret(x)&&fundCost(h.map(printing=>({printing})),o,3,x).length===3)return 370;
    if(ePred(x)){
      if(!p||o.ownTurnResources?.energyPlayedTurn!==false)return 0;
      const next={...p,energies:[...L(p.energies),x]};
      if(mega(p)||sableye(p)){
        const cost=mega(p)?['darkness','darkness','colorless']:['darkness','darkness'];
        const before=payable(p,cost,-1,o),after=payable(next,cost,-1,o);
        if(before===true||after===null)return 0;
        if(after===true)return 350+Math.min(100,bestAttackAgainst(o,next,o.opponentPublic?.active)/10);
        const newUnits=energyUnits(x,p,o),priorDark=L(p.energies).filter(e=>L(energyUnits(e,p,o)).some(x=>x==='darkness'||x==='any')).length;
        if(!L(newUnits).some(x=>x==='darkness'||x==='any')&&priorDark<2)return 0;
        return mega(p)?315:200;
      }
      if(isGengar(p)&&first(o)&&o.ownPublic?.publicTurnRestrictions?.gxUsed!==true&&payable(p,['psychic'],-1,o)!==true&&payable(next,['psychic'],-1,o)===true)return 300;
      return 0;
    }
    if(elec(x)&&p&&isVol(p))return 380;
    if(cruel(x)&&p&&isToed(p))return 375;
    if(basic(x)&&cap(o)>0){
      if(mega(x)&&!ownHas(o,mega))return 410;
      if(isVol(x)&&!ownHas(o,isVol)&&!ownHas(o,elec))return 395;
      if(isToed(x)&&!ownHas(o,isToed)&&!ownHas(o,cruel))return 250;
      if(isUn(x)&&!liveStadium(o,/Silent Lab/i)&&Number(o.ownPublic?.deckCount)>8)return 310;
      if(isDedenne(x)&&drawEngineLive(o)&&!ownHas(o,isDedenne)&&protectedReset(o,x))return 290;
      if(isSquawk(x)&&first(o)&&drawEngineLive(o)&&!ownHas(o,isSquawk)&&protectedReset(o,x))return 285;
      if(sableye(x)&&!ownHas(o,sableye)&&Number(o.opponentPublic?.active?.damage)>=30)return 240;
      if(isGengar(x)&&first(o)&&!ownHas(o,isGengar)&&handHas(o,x=>match(x,R.psychic)))return 230;
      return 0;
    }
    if(match(x,R.vip)&&first(o)&&cap(o)>0)return 440;
    if(match(x,R.mail)&&Number(o.ownPublic?.deckCount)>0)return 330;
    if(match(x,R.carrier)&&cap(o)>0&&d.some(c=>[isVol,isToed,isUn].some(f=>f(c))&&pokemonSearch(c,o)>0))return 320;
    if(match(x,R.stretcher)&&d.some(c=>pokemonSearch(c,o)>0))return 305;
    if(match(x,R.compressor)&&!deferCompressor(o)&&bombPossible(o)&&d.filter(ePred).length<5&&Number(o.ownPublic?.deckCount)>4)return 325;
    if(match(x,R.ultra)&&fundCost(h.map(printing=>({printing})),o,2,x).length===2){
      if(activeWob(o)&&bideState(o)===true&&drawEngineLive(o)&&!has(o,isDedenne)&&
         cap(o)>0&&ownHas(o,mega)&&(ownHas(o,isVol)||ownHas(o,elec))&&
         Number(o.ownPublic?.deckCount)>8)return 390;
      if(!has(o,mega)||has(o,isVol)&&!has(o,elec)||has(o,isToed)&&!has(o,cruel)||!has(o,isGengar)&&horrorDesired(o))return 335;
    }
    if(match(x,R.vs)&&o.ownTurnResources?.supporterPlayedTurn===0&&!o.ownTurnResources?.supporterPlayLocked&&d.some(c=>supporterSearch(c,o)>0))return 240;
    if(match(x,R.float)&&p&&p===o.ownPublic?.active&&!L(p.tools).length&&slots(o.ownPublic).some(y=>y.zone==='bench'&&bestAttackAgainst(o,y.p,o.opponentPublic?.active)>0))return 360;
    if(match(x,R.muscle)&&p&&mega(p)&&!L(p.tools).length){
      const before=bestAttackAgainst(o,p,o.opponentPublic?.active),after=bestAttackAgainst(o,{...p,tools:[x]},o.opponentPublic?.active);
      return after>before?430:0;
    }
    if(match(x,R.seal)&&p&&sableye(p)&&!L(p.tools).length&&!o.ownTurnResources?.vstarUsed)return 220;
    return 0;
  }
  function chooseDevelopment(r){
    const p=r.prompt,o=r.observation,src=p.source,m=M(p),cs=L(p.choices),x=name(src?.sourcePrinting);
    if(p.actingSeat!==o.actorSeat||src?.classification!=='actor-choice'||src.sourceKind!=='card-effect')return null;
    const no=reasonCode=>({kind:'abstain',reasonCode});
    const card=(c,z)=>c.kind==='card'&&M(c).ownerSeat==='actor'&&M(c).isOwnerVisible===true&&M(c).sourceZone===z;
    function pick(cs,score,limit=Infinity){
      const min=m.minimumCount,max=m.maximumCount;
      if(!Number.isInteger(min)||!Number.isInteger(max)||min<0||max<min)return no('BAD_CARD_SELECTION_BOUNDS');
      const out=cs.map((c,i)=>({c,i,v:score(c)})).filter(x=>x.v>0).sort((a,b)=>b.v-a.v||a.i-b.i).slice(0,Math.min(max,limit)).map(x=>x.c);
      if(out.length<min)return no('NO_USEFUL_CARD_CHOICE');
      if(out.length)return select(p,out,out.length,'NO_SUPPORTED_CARD_SELECTION');
      const empty=L(p.choices).find(c=>c.kind==='empty-selection');
      return min===0&&empty?{kind:'select-choice',token:empty.token}:no('NO_USEFUL_CARD_CHOICE');
    }
    if(p.promptType==='ChooseCardsPrompt'&&m.selectionType==='card-combination'){
      const deck=cs.filter(c=>card(c,'deck')),discard=cs.filter(c=>card(c,'discard')),hand=cs.filter(c=>card(c,'hand'));
      if(heavy(x)){
        const visible=cs.filter(c=>card(c,'prizes')&&basic(c));
        const c=best(visible,c=>pokemonSearch(c,o));
        if(c)return select(p,[c],1,'NO_USEFUL_CARD_CHOICE');
        const empty=cs.find(c=>c.kind==='empty-selection');
        return m.minimumCount===0&&empty?{kind:'select-choice',token:empty.token}:no('HIDDEN_PRIZE_IDENTITY');
      }
      if(secret(x)){
        if(hand.length)return select(p,fundCost(hand,o,3,x),3,'NO_LEGAL_CARD_SET');
        return secretTargets(p,deck,o);
      }
      if(match(x,R.vip)){
        const out=[],board=slots(o.ownPublic).map(y=>y.p);
        const order=horrorDesired(o)&&!has(o,isGengar)?[isGengar,mega,isVol,isToed,isUn,isUn]:[mega,isVol,isToed,isUn,isUn];
        for(const f of order){
          if(out.length>=Math.min(m.maximumCount,cap(o)))break;
          if(board.filter(f).length>=(f===isUn?2:1))continue;
          if(f===isVol&&board.some(elec)||f===isToed&&board.some(cruel))continue;
          const c=deck.find(c=>!out.includes(c)&&f(c));
          if(c){out.push(c);board.push(c);}
        }
        return out.length>=m.minimumCount&&out.length?select(p,out,out.length,'NO_SUPPORTED_CARD_SELECTION'):pick([],()=>0);
      }
      if(match(x,R.ultra)){
        if(hand.length)return select(p,fundCost(hand,o,2,x),2,'NO_LEGAL_CARD_SET');
        return pick(deck,c=>pokemonSearch(c,o),1);
      }
      if(match(x,R.mail))return pick(deck,c=>trainerSearch(c,o),1);
      if(match(x,R.carrier))return pick(discard.filter(c=>[isUn,isVol,isToed].some(f=>f(c))),c=>pokemonSearch(c,o),2);
      if(match(x,R.stretcher))return pick(discard,c=>pokemonSearch(c,o),m.maximumCount===3?3:1);
      if(match(x,R.vs))return pick(discard,c=>supporterSearch(c,o),1);
      if(match(x,R.compressor)){
        const e=deck.filter(c=>ePred(c)&&(!darkCutRisk(o)||!basicDark(c))),need=Math.max(0,5-L(o.ownPublic?.discard).filter(ePred).length);
        const reserve=!handHas(o,ePred)&&o.ownTurnResources?.energyPlayedTurn===false?1:0;
        const k=Math.min(need,Math.max(0,e.length-reserve),m.maximumCount,3);
        return pick(e,c=>match(c,R.dark)?100:75,k);
      }
      if(src.effectName==='Star Alchemy'&&(sableye(x)||match(x,R.seal)))return pick(deck,c=>Math.max(pokemonSearch(c,o),trainerSearch(c,o),ePred(c)&&!handHas(o,ePred)?310:0),1);
      if(/^Telepathic Psychic Energy POR 88\b/i.test(x)){
        // Direct Bench (not hand-play Abilities); choose distinct useful Basics.
        const candidates=deck.filter(c=>isUn(c)||isGengar(c));
        const out=[];
        if(!ownHas(o,isGengar)&&cap(o)>0&&m.maximumCount>0){
          const g=candidates.find(isGengar);if(g)out.push(g);
        }
        const n=Math.max(0,Math.min(m.maximumCount,cap(o))-out.length);
        out.push(...candidates.filter(isUn).slice(0,n));
        return out.length>=m.minimumCount&&out.length?select(p,out,out.length,'NO_SUPPORTED_CARD_SELECTION'):pick([],()=>0);
      }
      if(sableye(x)&&src.effectName==='Lode Search')return pick(discard,c=>trainerSearch(c,o),1);
    }
    if(p.promptType==='ConfirmPrompt'&&m.selectionType==='confirm'){
      let answer=null;
      if(isDedenne(x)&&src.effectName==='Dedechange'||isSquawk(x)&&src.effectName==='Squawk and Seize')answer=drawEngineLive(o)&&protectedReset(o);
      if(isUn(x)&&src.effectName==='Farewell Letter')answer=!liveStadium(o,/Silent Lab/i)&&Number(o.ownPublic?.deckCount)>8;
      if(answer!==null){
        const c=cs.find(c=>c.kind==='confirm'&&String(c.label).toLowerCase()===(answer?'yes':'no'));
        return c?{kind:'select-choice',token:c.token}:no('UNRECOGNIZED_SIMPLE_PROMPT');
      }
    }
    if((p.promptType==='SelectPrompt'||p.promptType==='SelectOptionPrompt')&&match(x,R.stretcher)&&m.selectionType==='option'){
      const c=cs.find(c=>c.kind==='option'&&/put.*pok[eé]mon.*hand/i.test(c.label??''));
      return c&&L(o.ownPublic?.discard).some(c=>pokemonSearch(c,o)>0)?{kind:'select-choice',token:c.token}:no('NO_USEFUL_CARD_CHOICE');
    }
    return null;
  }

  function retreatCost(o,item){
    const a=o.ownPublic?.active,m=M(item);
    if(!a||L(a.specialConditions).some(x=>/asleep|paralyzed|unknown/i.test(condition(x))))return null;
    if(a.publicRestrictions?.cannotRetreat||a.publicRestrictions?.cannotRetreatNextTurn)return null;
    const toolsLive=!liveStadium(o,/Jamming Tower/i)&&!o.ownPublic?.publicTurnRestrictions?.stadiumAndToolHaveNoEffectTurnsRemaining&&!o.opponentPublic?.publicTurnRestrictions?.stadiumAndToolHaveNoEffectTurnsRemaining;
    let cost=Array.isArray(a.printed?.retreatCost)?a.printed.retreatCost.length:null;
    if(toolsLive&&L(a.tools).some(x=>match(x,R.float)))cost=0;
    if(cost===null&&(m.freeRetreat===true||m.isFreeRetreat===true))cost=0;
    if(cost===null)return null;
    if(liveStadium(o,/Galar Mine/i))cost+=2;
    if(liveStadium(o,/Skyarrow Bridge/i)&&basic(a))cost=Math.max(0,cost-1);
    if(L(a.energies).some(e=>!ePred(e)))return null;
    return cost<=L(a.energies).length?cost:null;
  }
  function retreatPlan(o,item){
    const m=M(item),i=m.targetIndex??m.benchIndex,p=o.ownPublic?.bench?.[i],cost=retreatCost(o,item);
    if(!Number.isSafeInteger(i)||!p||cost===null||m.targetSeat!==undefined&&m.targetSeat!=='actor'||m.targetZone!==undefined&&m.targetZone!=='bench')return null;
    const ko=switchAttackScore(o,p,o.opponentPublic?.active);
    if(!ko)return null;
    return {cost,score:ko>=1000?ko:Math.max(0,ko-35*cost),index:i};
  }
  function retreatPayment(r,chain){
    const p=r.prompt,m=M(p),o=r.observation;
    if(chain.turn!==o.globalTurn||r.sequence!==chain.sequence+1||p.actingSeat!==o.actorSeat||p.source?.classification!=='actor-choice'||p.source?.sourceKind!=='engine'||p.source?.sourcePrinting!==null||p.promptType!=='ChooseEnergyPrompt'||m.selectionType!=='energy-payment')return null;
    const cost=String(m.energyType??'').split(',').map(type);
    if(cost.length!==chain.cost||cost.some(x=>x!=='colorless'))return null;
    const a=o.ownPublic?.active;
    if(name(a)!==chain.printing)return null;
    const offered=L(p.choices).filter(x=>x.kind==='energy');
    if(offered.length!==m.energyCount||m.count!==offered.length||offered.length<chain.cost)return null;
    const available=chain.energies.slice(),indexed=new Set();
    for(const c of offered){
      const cm=M(c),i=available.indexOf(name(c));
      if(cm.ownerSeat!=='actor'||cm.sourceZone!=='energy'||cm.isOwnerVisible!==true||!Number.isSafeInteger(cm.selectionIndex)||indexed.has(cm.selectionIndex)||i<0)return null;
      indexed.add(cm.selectionIndex);available.splice(i,1);
    }
    if(available.length!==0)return null;
    // One card per unit in this exact source list. Protect both real Darkness
    // and flexible Prism; prefer Telepathic after its hand-attach trigger.
    const score=c=>/^Telepathic Psychic Energy\b/i.test(name(c))?0:/^Prism Energy\b/i.test(name(c))?1:3;
    return {kind:'select-choices',tokens:offered.slice().sort((a,b)=>score(a)-score(b)).slice(0,chain.cost).map(x=>x.token)};
  }
  const ropeCard=c=>/^Escape Rope BST 125\b/i.test(name(c));
  function ropePlan(o){
    const own=slots(o.ownPublic).filter(x=>x.zone==='bench'),enemy=slots(o.opponentPublic).filter(x=>x.zone==='bench');
    const targets=enemy.length?enemy:[{zone:'active',index:0,p:o.opponentPublic?.active}];
    if(!own.length)return null;
    const replies=targets.map(t=>({t,a:best(own,x=>switchAttackScore(o,x.p,t.p))}));
    if(replies.some(x=>!x.a))return null;
    const scores=replies.map(({t,a})=>switchAttackScore(o,a.p,t.p));
    if(scores.some(x=>x<250))return null;
    return {score:Math.min(...scores),responses:replies.map(({t,a})=>({targetZone:t.zone,targetIndex:t.index,index:a.index,printing:name(a.p)}))};
  }
  function defensiveSwitch(o,p){
    const opponentBench=slots(o.opponentPublic).filter(x=>x.zone==='bench');
    const threats=opponentBench.length?opponentBench:[{zone:'active',p:o.opponentPublic?.active}];
    const targetView={...o,ownPublic:{...o.ownPublic,active:p}};
    const lethal=threats.some(({p:q})=>threatAttacks(targetView,q).length>0);
    const oppNeeds=Number(o.opponentPublic?.prizeCount);
    if(lethal&&Number.isFinite(oppNeeds)&&prize(p)>=oppNeeds)return 1;
    const essential=mega(p)?100:elec(p)?80:isVol(p)?55:cruel(p)?45:0;
    return lethal?300-70*prize(p)-essential:800+Math.min(200,remaining(p))/4+bestAttackAgainst(o,p,o.opponentPublic?.active)/20-essential/2;
  }
  function ropePrompt(r,chain){
    const o=r.observation,p=r.prompt;
    if(!ropeCard(p.source?.sourcePrinting)||p.source?.classification!=='actor-choice'||p.source?.sourceKind!=='card-effect'||p.actingSeat!==o.actorSeat||p.promptType!=='ChoosePokemonPrompt')return null;
    const cs=L(p.choices).filter(c=>ownChoice(o,c)&&name(ownChoice(o,c))===name(c));
    if(!cs.length)return {kind:'abstain',reasonCode:'NO_VISIBLE_POKEMON_TARGET'};
    if(chain){
      if(chain.kind!=='rope'||chain.turn!==o.globalTurn||chain.sequence+1!==r.sequence)return {kind:'abstain',reasonCode:'UNTRUSTED_PROMPT_SOURCE'};
      const c=best(cs,c=>switchAttackScore(o,ownChoice(o,c),o.opponentPublic?.active));
      return c?select(p,[c],1,'NO_VISIBLE_POKEMON_TARGET'):{kind:'abstain',reasonCode:'NO_VISIBLE_POKEMON_TARGET'};
    }
    if(o.turnSeat===undefined||o.turnSeat===o.actorSeat)return {kind:'abstain',reasonCode:'UNTRUSTED_PROMPT_SOURCE'};
    const c=best(cs,c=>defensiveSwitch(o,ownChoice(o,c)));
    return c?select(p,[c],1,'NO_VISIBLE_POKEMON_TARGET'):{kind:'abstain',reasonCode:'NO_VISIBLE_POKEMON_TARGET'};
  }
  function earlyHorrorScore(o,p,target){
    if(o.globalTurn!==2||!isGengar(p)||o.ownPublic?.publicTurnRestrictions?.gxUsed===true||L(p.specialConditions).some(x=>/asleep|paralyzed|confused|unknown/i.test(condition(x))))return 0;
    const r=p.publicRestrictions??{};
    if(r.cannotAttackNextTurn||r.attackCostIncreaseNextTurn||r.attackCostIncreaseWhileActive||L(r.cannotUseAttacksNextTurn).includes('Horror House-GX')||r.blockedAttackNameNextTurn==='Horror House-GX'||r.blockedAttackNameUntilLeavesActive==='Horror House-GX'||r.onlyAllowedAttackNameNextTurn&&r.onlyAllowedAttackNameNextTurn!=='Horror House-GX')return 0;
    return secondaryAttackScore({...o,ownPublic:{...o.ownPublic,active:p},opponentPublic:{...o.opponentPublic,active:target}},{attackName:'Horror House-GX',publicMetadata:{}});
  }
  function switchAttackScore(o,p,target){return Math.max(bestAttackAgainst(o,p,target),earlyHorrorScore(o,p,target));}
  function horrorDesired(o){
    if(o.globalTurn!==2||o.ownPublic?.publicTurnRestrictions?.gxUsed===true||Number(o.opponentPublic?.handCount)<=0)return false;
    const own=o.ownPublic,opp=o.opponentPublic,a=own?.active;
    const stadiumAnswer=liveStadium(o,/Temple of Sinnoh/i)&&!o.ownTurnResources?.stadiumPlayedTurn&&!o.ownTurnResources?.stadiumPlayLocked&&handHas(o,stadiumCard);
    if(liveStadium(o,/Temple of Sinnoh/i)&&!stadiumAnswer)return false;
    const candidate=slots(own).find(x=>isGengar(x.p))?.p??{printing:'Gengar & Mimikyu-GX TEU 53',hp:240,damage:0,energies:[],specialConditions:[],printed:{stage:'Basic',types:['Psychic'],weakness:[{type:'Darkness',value:'×2'}],resistance:[]}};
    const fuel=L(o.ownHand).filter(c=>match(c,R.psychic));
    const context=stadiumAnswer?{...o,ownPublic:{...own,stadium:['PokéStop PGO 68']},opponentPublic:{...opp,stadium:[]}}:o;
    const powered=payable(candidate,['psychic'],-1,context)===true;
    if(!powered&&(o.ownTurnResources?.energyPlayedTurn!==false||!fuel.length))return false;
    if(earlyHorrorScore(context,powered?candidate:{...candidate,energies:[...L(candidate.energies),name(fuel[0])]},opp?.active)<250)return false;
    if(isGengar(a))return true;
    if(!ownHas(o,isGengar)&&cap(o)<=0)return false;
    const canRetreat=o.ownTurnResources?.retreatedTurn!==true&&(!Number.isInteger(o.ownTurnResources?.retreatedTurn)||o.ownTurnResources.retreatedTurn!==o.globalTurn);
    const free=canRetreat&&retreatCost(context,{publicMetadata:{}})===0;
    const float=canRetreat&&!o.ownTurnResources?.toolPlayLocked&&!L(a?.tools).length&&!liveStadium(context,/Jamming Tower/i)&&handHas(o,x=>match(x,R.float));
    const rope=!o.ownTurnResources?.itemPlayLocked&&handHas(o,ropeCard);
    const gust=o.ownTurnResources?.supporterPlayedTurn===0&&!o.ownTurnResources?.supporterPlayLocked&&handHas(o,guzma)&&slots(opp).some(x=>x.zone==='bench');
    return free||float||rope||gust||powered&&canRetreat&&retreatCost(context,{publicMetadata:{}})!==null;
  }
  function horrorPreparation(o,item){
    if(!horrorDesired(o)||item.kind!=='play-card')return 0;
    const x=name(item),p=targetSlot(o,item);
    if(stadiumCard(x)&&liveStadium(o,/Temple of Sinnoh/i))return /^PokéStop/i.test(x)?570:560;
    if(ePred(x)&&p&&isGengar(p)&&o.ownTurnResources?.energyPlayedTurn===false&&payable(p,['psychic'],-1,o)!==true&&payable({...p,energies:[...L(p.energies),x]},['psychic'],-1,o)===true)return 550;
    if(isGengar(x)&&!ownHas(o,isGengar)&&cap(o)>0)return 540;
    if(match(x,R.vip)&&!has(o,isGengar)&&cap(o)>0)return 530;
    if(match(x,R.ultra)&&!has(o,isGengar)&&fundCost(L(o.ownHand).map(printing=>({printing})),o,2,x).length===2)return 520;
    if(match(x,R.float)&&p&&p===o.ownPublic?.active&&!isGengar(p)&&!L(p.tools).length&&ownHas(o,isGengar))return 510;
    return 0;
  }
  function prospectivePreparation(o,item){
    if(item.kind!=='play-card')return 0;
    const x=name(item),own=o.ownPublic,m=M(item),p=targetSlot(o,item);
    let next=null;
    const patch=q=>({...o,ownPublic:m.targetZone==='active'?{...own,active:q}:{...own,bench:L(own.bench).map((v,i)=>i===m.targetIndex?q:v)}});
    if(ePred(x)&&p&&o.ownTurnResources?.energyPlayedTurn===false)next={...patch({...p,energies:[...L(p.energies),x]}),ownTurnResources:{...o.ownTurnResources,energyPlayedTurn:true}};
    if(p&&(match(x,R.float)||match(x,R.muscle))&&!L(p.tools).length&&!liveStadium(o,/Jamming Tower/i)&&!own?.publicTurnRestrictions?.stadiumAndToolHaveNoEffectTurnsRemaining)next=patch({...p,tools:[x]});
    if(stadiumCard(x)&&!activeStadium(o).includes(x))next={...o,ownPublic:{...own,stadium:[x]},opponentPublic:{...o.opponentPublic,stadium:[]}};
    if(!next)return 0;
    const previous=bombMobility(o,null)?.score??0,after=bombMobility(next,null)?.score??0;
    return after>=1000&&previous<1000?1000:after>previous&&after>=400?after:0;
  }
  function knownSafeDecline(x,o){
    const n=name(x),m=M(x),a=x.attackName??m.attackName;
    if(x.kind==='pass'||x.kind==='projected-attack'||x.kind==='retreat')return true;
    if(x.kind==='play-card')return basic(n)||elec(n)||cruel(n)||ePred(n)||secret(n)||secretCategory(n)!==null;
    if(x.kind==='use-stadium')return /^PokéStop PGO 68\b/i.test(n);
    if(x.kind==='use-ability'){
      if(['Farewell Letter','Squawk and Seize','Star Alchemy'].includes(m.abilityName))return true;
      if(elec(n)&&m.abilityName==='Extra Energy Bomb'){
        // Never relabel a feasible but unsupported native transfer as a
        // strategic pass. Active Electrode's Bomb is not modeled either.
        if(m.sourceZone==='active')return bombPlanner(o,-1)===null;
        if(!Number.isInteger(m.sourceIndex))return false;
        return bombPlanner(o,m.sourceIndex)===null;
      }
      return false;
    }
    if(x.kind==='attack'){
      if(isSquawk(n)&&a==='Motivate')return false;
      if(elec(n)&&['Electro Ball','Crush and Burn-GX'].includes(a))return payable(o.ownPublic?.active,['lightning','colorless'],-1,o)===false;
      if(cruel(n)&&a==='Mushroom Drain')return payable(o.ownPublic?.active,['grass','colorless','colorless'],-1,o)===false;
      return ['Terminal Period','Claw of Darkness','Lode Search','Crazy Claws','Horror House-GX','Poltergeist','Static Shock','Tingly Return-GX','Hidden Power','Kick','Absorb','Thunder Wave','Big Explosion'].includes(a);
    }
    return false;
  }
  function createPolicy({role,seat,policyVersion,config}) {
    if(role!=='opponent'||![0,1].includes(seat)||policyVersion!==POLICY_VERSION||!config||Array.isArray(config)||Object.keys(config).length)throw Error('RANK9_INIT_MISMATCH');
    let chain=null;
    function root(r) {
      const o=r.observation;chain=null;
      const items=L(r.actionFrontier?.items), own=o.ownPublic, opp=o.opponentPublic;
      const direct=best(items,x=>rootAttack(x,o)), directScore=direct?rootAttack(direct,o):0;
      // A direct final-Prize KO beats spending any connector.
      if(directScore>=1000)return {kind:'select-action',token:direct.token};
      const ret=best(items.filter(x=>x.kind==='retreat'),x=>retreatPlan(o,x)?.score??0);
      const retPlan=ret?retreatPlan(o,ret):null,retScore=retPlan?.score??0;
      // Guzma forces an own switch if a Bench exists. Only evaluate a powered
      // Benched attacker, never assume the current Active can stay in place.
      const g=items.find(x=>x.kind==='play-card'&&guzma(x));
      const targets=slots(opp).filter(x=>x.zone==='bench');
      const ownBench=slots(own).filter(x=>x.zone==='bench');
      const pairs=targets.flatMap(t=>ownBench.map(a=>({t,a,score:switchAttackScore(o,a.p,t.p)})));
      const pair=best(pairs,x=>x.score);
      const supporterFree=o.ownTurnResources?.supporterPlayedTurn===0&&!o.ownTurnResources?.supporterPlayLocked&&!own?.publicTurnRestrictions?.supporterPlayLocked;
      const rope=items.find(x=>x.kind==='play-card'&&ropeCard(x)),rp=rope?ropePlan(o):null,ropeScore=rp?.score??0;
      const prep=best(items,x=>prospectivePreparation(o,x)),prepScore=prep?prospectivePreparation(o,prep):0;
      // This is an executable continuation, not the earlier unsupported
      // Bomb opportunity proxy. Each live root action must identify the
      // actual Electrode-GX slot whose own Prize liability will be paid.
      const bombOptions=items.filter(x=>x.kind==='use-ability'&&
        M(x).abilityName==='Extra Energy Bomb'&&
        /^Electrode-GX CES 48\b/i.test(name(x))&&
        ['bench','active'].includes(M(x).sourceZone))
        .map(action=>{
          const m=M(action),idx=m.sourceZone==='active'?-1:
            Number.isSafeInteger(m.sourceIndex)?m.sourceIndex:null;
          const plan=idx===null?null:bombPlanner(o,idx);
          return {action,plan,score:plan?.score??0};
        });
      const bomb=best(bombOptions,x=>x.score);
      const bombScore=bomb?.score??0;
      if(bomb&&bomb.plan&&prepScore<1000&&
        bombScore>Math.max(directScore,retScore,ropeScore,
          supporterFree&&g?pair?.score??0:0,prepScore,400)){
        chain={kind:'bomb',turn:o.globalTurn,sequence:r.sequence,
          required:bomb.plan.required,
          assignments:bomb.plan.assignments.map(a=>({...a})),
          sourceActive:bomb.plan.sourceZone==='active',
          promotionIndex:bomb.plan.sourceZone==='active'?
            bomb.plan.mobility?.promotionIndex:null,
          promotionPrinting:bomb.plan.sourceZone==='active'?
            bomb.plan.mobility?.promotionPrinting:null};
        return {kind:'select-action',token:bomb.action.token};
      }
      if(prepScore>=1000&&Math.max(retScore,ropeScore,supporterFree&&g?pair?.score??0:0)<1000)return {kind:'select-action',token:prep.token};
      const hh=best(items,x=>horrorPreparation(o,x)),hhScore=hh?horrorPreparation(o,hh):0;
      if(hhScore>0&&Math.max(directScore,retScore,ropeScore,supporterFree&&g?pair?.score??0:0)<400)return {kind:'select-action',token:hh.token};
      if(rope&&ropeScore>Math.max(directScore,retScore,supporterFree&&g?pair?.score??0:0)){
        chain={kind:'rope',turn:o.globalTurn,sequence:r.sequence};
        return {kind:'select-action',token:rope.token};
      }
      if(supporterFree&&g&&pair&&pair.score>Math.max(directScore,retScore)){
        chain={kind:'guzma',stage:1,turn:o.globalTurn,sequence:r.sequence,target:pair.t.index,attacker:pair.a.index,attackerPrinting:name(pair.a.p)};
        return {kind:'select-action',token:g.token};
      }
      if(retScore>directScore&&ret){
        if(retPlan.cost>0)chain={kind:'retreat',turn:o.globalTurn,sequence:r.sequence,cost:retPlan.cost,printing:name(own.active),energies:L(own.active.energies).map(name)};
        return {kind:'select-action',token:ret.token};
      }
      const development=best(items,x=>devScore(x,o)),developmentScore=development?devScore(development,o):0;
      // Non-turn-ending setup is valuable before a non-final attack, but
      // never trade away a known final-Prize action or choose a speculative
      // discard/draw reset ahead of an existing non-final KO.
      if(directScore>=400){
        if(development&&developmentScore>=375&&(development.kind==='use-ability'&&M(development).abilityName==='Farewell Letter'||development.kind==='play-card'&&(mega(development)||isVol(development)||elec(development)||cruel(development))))return {kind:'select-action',token:development.token};
        return {kind:'select-action',token:direct.token};
      }
      if(direct&&(direct.attackName??M(direct).attackName)==='Horror House-GX'&&o.globalTurn===2&&directScore>=250){
        if(development&&developmentScore>=375&&development.kind==='play-card'&&(mega(development)||isVol(development)))return {kind:'select-action',token:development.token};
        return {kind:'select-action',token:direct.token};
      }
      if(development&&developmentScore>=280)return {kind:'select-action',token:development.token};
      const p=items.find(x=>x.kind==='play-card'&&plumeria(x));
      const denialRow=best(slots(opp),row=>denial(o,row)?.score??0);
      const d=denial(o,denialRow);
      if(p&&supporterFree&&d&&safeCosts(L(o.ownHand).map(printing=>({printing})),o,2,name(p)).length===2){
        chain={kind:'plumeria',stage:1,turn:o.globalTurn,sequence:r.sequence};
        return {kind:'select-action',token:p.token};
      }
      const i=items.find(x=>x.kind==='play-card'&&iono(x));
      if(i&&supporterFree&&ionoScore(o,name(i))>Math.max(directScore,developmentScore))return {kind:'select-action',token:i.token};
      if(development&&developmentScore>directScore)return {kind:'select-action',token:development.token};
      if(direct)return {kind:'select-action',token:direct.token};
      const pass=items.find(x=>x.kind==='pass');if(pass&&items.every(x=>knownSafeDecline(x,o)))return {kind:'select-action',token:pass.token};
      return {kind:'abstain',reasonCode:'NO_SUPPORTED_ROOT_ACTION'};
    }
    function prompt(r) {
      const o=r.observation,p=r.prompt,source=name(p.source?.sourcePrinting);
      const choices=L(p.choices).filter(x=>typeof x.token==='string');
      const fail=code=>{chain=null;return {kind:'abstain',reasonCode:code};};
      if(chain?.kind==='rope'||!chain&&ropeCard(source)){
        const d=ropePrompt(r,chain);chain=null;
        return d??{kind:'abstain',reasonCode:'UNTRUSTED_PROMPT_SOURCE'};
      }
      if(chain?.kind==='retreat'){
        const d=retreatPayment(r,chain);chain=null;
        return d??{kind:'abstain',reasonCode:'UNTRUSTED_ENERGY_SELECTION'};
      }
      if(chain?.kind==='bomb'){
        const m=M(p),source=p.source;
        if(chain.turn!==o.globalTurn||r.sequence!==chain.sequence+1||
           p.promptType!=='AttachEnergyPrompt'||source?.sourceKind!=='card-effect'||
           source.classification!=='actor-choice'||
           name(source.sourcePrinting)!=='Electrode-GX CES 48'||
           source.effectName!=='Extra Energy Bomb'||m.selectionType!=='energy-transfers'||
           m.minimumCount!==chain.required||m.maximumCount!==chain.required||
           !Array.isArray(chain.assignments)||chain.assignments.length!==chain.required)
          return fail('UNTRUSTED_PROMPT_SOURCE');
        const selected=[];
        for(const assignment of chain.assignments){
          const found=choices.filter(c=>c.kind==='energy'&&
            M(c).ownerSeat==='actor'&&M(c).isOwnerVisible===true&&
            M(c).sourceZone==='discard'&&
            M(c).selectionIndex===assignment.discardIndex&&
            M(c).zone===assignment.zone&&M(c).slotIndex===assignment.index&&
            name(c)===assignment.printing);
          if(found.length!==1)return fail('UNTRUSTED_ENERGY_SELECTION');
          selected.push(found[0]);
        }
        if(new Set(selected.map(c=>c.token)).size!==chain.required)
          return fail('UNTRUSTED_ENERGY_SELECTION');
        const next=chain.sourceActive?{
          kind:'bomb-promotion',turn:chain.turn,sequence:r.sequence,
          index:chain.promotionIndex,printing:chain.promotionPrinting
        }:null;
        chain=next;
        return select(p,selected,selected.length,'UNTRUSTED_ENERGY_SELECTION');
      }
      if(chain?.kind==='bomb-promotion'){
        if(chain.turn!==o.globalTurn||r.sequence!==chain.sequence+1||
           p.promptType!=='ChoosePokemonPrompt'||
           p.source?.sourceKind!=='engine'||
           p.source?.effectName!=='CHOOSE_NEW_ACTIVE_POKEMON'||
           M(p).selectionType!=='pokemon'||M(p).minimumCount!==1||
           M(p).maximumCount!==1||M(p).allowCancel!==false||
           !Number.isSafeInteger(chain.index)||chain.index<0||
           typeof chain.printing!=='string'||!chain.printing)
          return fail('UNTRUSTED_PROMPT_SOURCE');
        const candidates=choices.filter(c=>c.kind==='pokemon'&&
          M(c).ownerSeat==='actor'&&M(c).isOwnerVisible===true&&
          M(c).targetZone==='bench'&&M(c).benchIndex===chain.index&&
          name(c)===chain.printing&&
          o.ownPublic?.bench?.[chain.index]&&
          name(o.ownPublic.bench[chain.index])===chain.printing);
        if(candidates.length!==1)return fail('NO_VISIBLE_POKEMON_TARGET');
        chain=null;
        return select(p,candidates,1,'NO_VISIBLE_POKEMON_TARGET');
      }
      if(!chain){const setup=chooseSetup(r);if(setup)return setup;const claw=chooseClaw(r);if(claw)return claw;const d=chooseDevelopment(r);if(d)return d;}
      if(!chain||chain.turn!==o.globalTurn||r.sequence!==chain.sequence+1||
         !(chain.kind==='guzma'?guzma(source):plumeria(source)))return fail('UNTRUSTED_PROMPT_SOURCE');
      chain.sequence=r.sequence;
      if(chain.kind==='guzma'){
        if(p.promptType!=='ChoosePokemonPrompt')return fail('UNSUPPORTED_POKEMON_PROMPT');
        if(chain.stage===1){
          const target=choices.find(c=>{const x=opponentChoice(o,c);return x?.zone==='bench'&&x.index===chain.target&&x.p&&name(x.p)===name(c);});
          if(!target)return fail('NO_VISIBLE_POKEMON_TARGET');
          chain.stage=2;return select(p,[target],1,'NO_VISIBLE_POKEMON_TARGET');
        }
        const ownTarget=choices.find(c=>M(c).ownerSeat==='actor'&&(M(c).targetZone??M(c).sourceZone)==='bench'&&(M(c).benchIndex??M(c).slotIndex)===chain.attacker&&name(ownChoice(o,c))===chain.attackerPrinting&&name(c)===chain.attackerPrinting);
        if(!ownTarget)return fail('NO_VISIBLE_POKEMON_TARGET');
        chain=null;return select(p,[ownTarget],1,'NO_VISIBLE_POKEMON_TARGET');
      }
      if(chain.stage===1&&p.promptType==='ChooseCardsPrompt'){
        const cards=choices.filter(c=>M(c).ownerSeat==='actor'&&M(c).sourceZone==='hand');
        const cost=safeCosts(cards,o,2,'Plumeria BUS 120');
        if(cost.length!==2)return fail('NO_LEGAL_CARD_SET');
        chain.stage=2;return select(p,cost,2,'NO_LEGAL_CARD_SET');
      }
      if(chain.stage===2&&p.promptType==='ChoosePokemonPrompt'){
        const choice=best(choices,c=>denial(o,opponentChoice(o,c))?.score??0);
        const d=choice?denial(o,opponentChoice(o,choice)):null;
        if(!d)return fail('NO_VISIBLE_POKEMON_TARGET');
        chain={...chain,stage:3,energy:d.energy,energies:L(d.row.p.energies).map(name)};
        return select(p,[choice],1,'NO_VISIBLE_POKEMON_TARGET');
      }
      if(chain.stage===3&&p.promptType==='ChooseCardsPrompt'){
        // Step 3 lacks a board-slot field. The exact prior selection and
        // consecutive source-bound prompt are mandatory; only opponent-owned
        // exposed Energy choices in the selected Pokémon's visible multiset.
        const exposed=choices.filter(c=>M(c).ownerSeat==='opponent'&&/energy/i.test(String(M(c).cardType??name(c)))&&chain.energies.includes(name(c)));
        const e=exposed.find(c=>name(c)===chain.energy);
        if(!e)return fail('UNTRUSTED_ENERGY_SELECTION');
        chain=null;return select(p,[e],1,'NO_VISIBLE_ENERGY_CHOICE');
      }
      return fail('UNSUPPORTED_PROMPT_TYPE');
    }
    return Object.freeze({decide(r){
      if(!r||r.role!=='opponent'||r.seat!==seat||r.observation?.actorSeat!==seat){chain=null;return {kind:'abstain',reasonCode:'ROLE_SEAT_BINDING_MISMATCH'};}
      return r.prompt===null?root(r):prompt(r);
    }});
  }
  return {POLICY_VERSION,SOURCE_RANK,SOURCE_LIST_BLOB_SHA1,ENGINE_PIN,createPolicy,printedDamage,payable,rootAttack,denial,prize,safeCosts,bombPlanner,stadiumScore,bombMobility,ropePlan,defensiveSwitch,horrorDesired,protectedReset,ionoScore,pokeStopScore,knownSafeDecline,deferCompressor,cologneDrawScore,originalPrinting};
})();
