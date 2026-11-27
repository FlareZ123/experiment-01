'use strict';
// Development-only actor-visible tactical slice; see accompanying report.
module.exports = (function build() {
  const POLICY_VERSION = 'agent29-rank9-tactical-slice-v2';
  const SOURCE_RANK = 9;
  const SOURCE_LIST_BLOB_SHA1 = 'ae773f6201d7aa69d31914dbfee66f3fba692200';
  const ENGINE_PIN = 'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05';
  const L = x => Array.isArray(x) ? x : [];
  const M = x => x?.publicMetadata ?? {};
  const name = x => typeof x === 'string' ? x : x?.printing ?? x?.actorPrinting ?? x?.targetPrinting ?? '';
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
  function energyUnits(e,p) {
    const s=name(e);
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
  function payable(p,cost,removed=-1) {
    if(!Array.isArray(cost)||cost.length===0) return null;
    const req=cost.map(type);
    if(req.some(x=>!['darkness','psychic','colorless','lightning','grass','fire','water','fighting','metal','fairy','dragon'].includes(x))) return null;
    const parts=L(p?.energies).filter((_,i)=>i!==removed).map(e=>energyUnits(e,p));
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
  function usable(p,attack) {
    if(!p)return false;
    if(L(p.specialConditions).some(x=>/asleep|paralyzed|confused/i.test(String(x))))return false;
    const a=p.publicRestrictions??{};
    if(a.cannotAttackNextTurn||L(a.cannotUseAttacksNextTurn).includes(attack)||a.blockedAttackNameNextTurn===attack||a.blockedAttackNameUntilLeavesActive===attack||a.onlyAllowedAttackNameNextTurn&&a.onlyAllowedAttackNameNextTurn!==attack)return false;
    if(a.attackCostIncreaseNextTurn||a.attackCostIncreaseWhileActive)return false;
    const cost=attack==='Terminal Period'?['darkness','colorless']:attack==='Claw of Darkness'?['darkness','darkness','colorless']:attack==='Crazy Claws'?['darkness','darkness']:null;
    return cost!==null&&payable(p,cost)===true;
  }
  function knockoutScore(o,attacker,target,attack) {
    const d=printedDamage(o,attacker,target,attack);
    if(d===null||d<remaining(target))return 0;
    const p=prize(target), need=o.ownPublic?.prizeCount;
    return num(need)&&p>=need?1000:400+70*p;
  }
  function bestAttackAgainst(o,attacker,target) {
    const names=mega(attacker)?['Terminal Period','Claw of Darkness']:sableye(attacker)?['Crazy Claws']:[];
    return Math.max(0,...names.filter(a=>usable(attacker,a)).map(a=>knockoutScore(o,attacker,target,a)));
  }
  function rootAttack(item,o) {
    if(item.kind!=='attack'||M(item).attackCostPayable===false||M(item).hasUnmodeledModifier===true)return 0;
    const a=item.attackName??M(item).attackName;
    const own=o.ownPublic?.active, opp=o.opponentPublic?.active;
    if(!(mega(own)&&['Terminal Period','Claw of Darkness'].includes(a)||sableye(own)&&a==='Crazy Claws'))return 0;
    if(a==='Terminal Period'&&opp?.damage!==60)return 0;
    if(a!=='Terminal Period'&&(M(item).hasPrevention===true||Number(M(item).damagePrevented)>0))return 0;
    const ko=knockoutScore(o,own,opp,a);
    if(ko)return ko+(a==='Claw of Darkness'?2:a==='Terminal Period'?1:0);
    const d=printedDamage(o,own,opp,a);
    return a!=='Terminal Period'&&d>0?100+Math.min(d,300)/10:0;
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
  function threatAttacks(o,p) {
    if(!p||L(p.specialConditions).some(x=>/asleep|paralyzed/i.test(String(x))))return [];
    const hp=remaining(o.ownPublic?.active);
    return L(p.attacks).filter(a=>!a.gxAttack||!o.opponentPublic?.publicTurnRestrictions?.gxUsed)
      .filter(a=>{
        const n=Number(a.damage);
        // Only direct printed numerical lethal attacks. Scaling and effects
        // require a separate model; never treat an unknown as proven denied.
        return Number.isFinite(n)&&n>0&&n>=hp;
      }).filter(a=>payable(p,a.cost)===true);
  }
  function denial(o,row) {
    const p=row?.p;
    if(!p||!L(p.energies).length)return null;
    const attacks=threatAttacks(o,p);
    if(!attacks.length)return null;
    // Do not call removal a guaranteed turn denial: fresh attachments,
    // acceleration, switches and hand contents remain unknown.
    const eligible=L(p.energies).map((e,i)=>({printing:name(e),i})).filter(({i})=>attacks.every(a=>payable(p,a.cost,i)===false));
    if(!eligible.length)return null;
    return {row,energy:eligible[0].printing,score:(row.zone==='active'?220:150)+20*prize(o.ownPublic?.active)};
  }
  function select(prompt,choices,n,reason) {
    if(!choices.length||choices.length!==n)return {kind:'abstain',reasonCode:reason};
    const m=M(prompt), multi=['pokemon','card-combination','prize-slots','energy-payment','card-order'].includes(m.selectionType);
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
  function createPolicy({role,seat,policyVersion,config}) {
    if(role!=='opponent'||![0,1].includes(seat)||policyVersion!==POLICY_VERSION||!config||Array.isArray(config)||Object.keys(config).length)throw Error('RANK9_INIT_MISMATCH');
    let chain=null;
    function root(r) {
      const o=r.observation;chain=null;
      const items=L(r.actionFrontier?.items), own=o.ownPublic, opp=o.opponentPublic;
      const direct=best(items,x=>rootAttack(x,o)), directScore=direct?rootAttack(direct,o):0;
      // A direct final-Prize KO beats spending any connector.
      if(directScore>=1000)return {kind:'select-action',token:direct.token};
      const ret=best(items.filter(x=>x.kind==='retreat'),x=>{
        const m=M(x), i=m.targetIndex??m.benchIndex;
        if(!Number.isSafeInteger(i))return 0;
        const p=own?.bench?.[i];
        if(!p||m.freeRetreat!==true&&m.isFreeRetreat!==true)return 0;
        return bestAttackAgainst(o,p,opp?.active);
      });
      const retScore=ret?bestAttackAgainst(o,own.bench[M(ret).targetIndex??M(ret).benchIndex],opp?.active):0;
      // Guzma forces an own switch if a Bench exists. Only evaluate a powered
      // Benched attacker, never assume the current Active can stay in place.
      const g=items.find(x=>x.kind==='play-card'&&guzma(x));
      const targets=slots(opp).filter(x=>x.zone==='bench');
      const ownBench=slots(own).filter(x=>x.zone==='bench');
      const pairs=targets.flatMap(t=>ownBench.map(a=>({t,a,score:bestAttackAgainst(o,a.p,t.p)})));
      const pair=best(pairs,x=>x.score);
      const supporterFree=o.ownTurnResources?.supporterPlayedTurn===0&&!o.ownTurnResources?.supporterPlayLocked&&!own?.publicTurnRestrictions?.supporterPlayLocked;
      if(supporterFree&&g&&pair&&pair.score>Math.max(directScore,retScore)){
        chain={kind:'guzma',stage:1,turn:o.globalTurn,sequence:r.sequence,target:pair.t.index,attacker:pair.a.index,attackerPrinting:name(pair.a.p)};
        return {kind:'select-action',token:g.token};
      }
      if(retScore>directScore&&ret)return {kind:'select-action',token:ret.token};
      if(directScore>=400)return {kind:'select-action',token:direct.token};
      const p=items.find(x=>x.kind==='play-card'&&plumeria(x));
      const denialRow=best(slots(opp),row=>denial(o,row)?.score??0);
      const d=denial(o,denialRow);
      if(p&&supporterFree&&d&&safeCosts(L(o.ownHand).map(printing=>({printing})),o,2,name(p)).length===2){
        chain={kind:'plumeria',stage:1,turn:o.globalTurn,sequence:r.sequence};
        return {kind:'select-action',token:p.token};
      }
      const i=items.find(x=>x.kind==='play-card'&&iono(x));
      if(i&&supporterFree&&L(o.ownHand).length<=2&&Number(own?.prizeCount)>=3&&Number(own?.deckCount)>=Number(own?.prizeCount)&&directScore<400)return {kind:'select-action',token:i.token};
      if(direct)return {kind:'select-action',token:direct.token};
      return {kind:'abstain',reasonCode:'NO_SUPPORTED_ROOT_ACTION'};
    }
    function prompt(r) {
      const o=r.observation,p=r.prompt,source=name(p.source?.sourcePrinting);
      const choices=L(p.choices).filter(x=>typeof x.token==='string');
      const fail=code=>{chain=null;return {kind:'abstain',reasonCode:code};};
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
  return {POLICY_VERSION,SOURCE_RANK,SOURCE_LIST_BLOB_SHA1,ENGINE_PIN,createPolicy,printedDamage,payable,rootAttack,denial,prize,safeCosts};
})();
