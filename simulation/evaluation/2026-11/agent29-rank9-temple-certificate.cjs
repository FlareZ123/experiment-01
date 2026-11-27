'use strict';
module.exports=function templeCertificate(view){
  // Candidate actor-relative state. Sufficient conditions only; caller must
  // be using the unchanged Lockbridge list against the exact rank-nine 60.
  const fail=reason=>({certified:false,reason});
  const own=view?.ownPublic,opp=view?.opponentPublic,active=own?.active;
  const name=x=>typeof x==='string'?x:x?.printing??'';
  const list=x=>Array.isArray(x)?x:[];
  const has=(x,re)=>re.test(name(x));
  const count=(xs,re)=>list(xs).filter(x=>has(x,re)).length;
  if(!own||!opp||!active||!has(active,/^Shadow Rider Calyrex VMAX CRE 75\b/i))return fail('ACTIVE_NOT_SHADOW_RIDER_VMAX');
  const board=[active,...list(own.bench).filter(Boolean)];
  if(board.some(p=>!has(p,/^Shadow Rider Calyrex VMAX CRE 75\b/i)))return fail('BENCH_GUST_EXPOSURE');
  const n=own.prizeCount;
  if(!Number.isSafeInteger(n)||n<1||n>3)return fail('PRIZE_BUDGET');
  if(!Number.isSafeInteger(opp.prizeCount)||opp.prizeCount<1||opp.prizeCount>6)return fail('UNKNOWN_OPPONENT_PRIZE_COUNT');
  const stadiums=[...list(own.stadium),...list(opp.stadium)];
  if(stadiums.length!==1||!has(stadiums[0],/^Temple of Sinnoh ASR 155\b/i))return fail('TEMPLE_NOT_LIVE');
  if(own.publicTurnRestrictions?.stadiumAndToolHaveNoEffectTurnsRemaining!==0||opp.publicTurnRestrictions?.stadiumAndToolHaveNoEffectTurnsRemaining!==0)return fail('STADIUM_EFFECT_NOT_CERTAIN');
  if(count(opp.lostZone,/^Darkness Energy MEE 15\b/i)!==2)return fail('BASIC_DARKNESS_NOT_EXHAUSTED');
  const spent=[...list(opp.discard),...list(opp.lostZone)];
  for(const [re,k] of [[/^Silent Lab PRC 140\b/i,2],[/^Path to the Peak CRE 148\b/i,1],[/^PokéStop PGO 68\b/i,1]]){
    if(count(spent,re)!==k)return fail('STADIUM_OUT_REMAINS');
  }
  // Every possible rank-nine attack under Temple without basic Darkness
  // is at most 20 printed damage, +20 from its one Muscle Band.
  // The opponent can play at most one Plumeria between attacks. Iono is
  // pessimistically allowed in those same turns for independent deck budget.
  const energies=board.map(p=>count(p.energies,/^(?:Basic )?Psychic Energy\b/i));
  const energyCount=energies.reduce((a,b)=>a+b,0);
  if(energyCount>11||board.some((p,i)=>energies[i]!==list(p.energies).length))return fail('UNMODELED_ENERGY');
  const energyRequired=9+(n-1),perAttackerRequired=3+(n-1);
  if(energyCount<energyRequired)return fail('PLUMERIA_MARGIN');
  // Guzma and Escape Rope may change the Active. Even if all Plumeria
  // discards hit that new attacker, its CCC cost must remain payable.
  if(energies.some(e=>e<perAttackerRequired))return fail('GUST_PAYMENT_MARGIN');
  if(board.some(p=>p.hp!==320||!Number.isFinite(p.damage)||p.damage<0||320-p.damage<=40*(n-1)))return fail('DAMAGE_MARGIN');
  if(board.some(p=>list(p.specialConditions).length!==0))return fail('SPECIAL_CONDITION');
  const blocked=p=>{const r=p.publicRestrictions;return !r||r.cannotAttackNextTurn||list(r.cannotUseAttacksNextTurn).includes('Max Geist')||r.blockedAttackNameNextTurn==='Max Geist'||r.blockedAttackNameUntilLeavesActive==='Max Geist'||r.onlyAllowedAttackNameNextTurn&&r.onlyAllowedAttackNameNextTurn!=='Max Geist'||r.attackCostIncreaseNextTurn||r.attackCostIncreaseWhileActive;};
  if(board.some(blocked)||own.publicTurnRestrictions?.attackLockTurnsRemaining!==0||own.publicTurnRestrictions?.attackMaxEnergyTurnsRemaining!==0)return fail('ATTACK_RESTRICTION');
  const deckRequired=(n-1)*(n+2)/2;
  if(!Number.isSafeInteger(own.deckCount)||own.deckCount<deckRequired)return fail('IONO_AND_DRAW_MARGIN');
  const target=opp.active;
  if(!target||!Number.isFinite(target.hp)||!Number.isFinite(target.damage)||target.hp-target.damage<1||target.hp>280)return fail('UNKNOWN_TARGET');
  // Rank-nine listed cards have no direct defensive ability, Tool or attack
  // effect reducing incoming Max Geist. Any unexpected board printing
  // invalidates this source-specific certificate.
  const allowed=[
    /^Unown AOR 30\b/i,/^Voltorb ROS 21\b/i,/^Electrode-GX CES 48\b/i,
    /^Toedscool PAR 16\b/i,/^Toedscruel PAR 17\b/i,/^Mega Absol ex MEG 86\b/i,
    /^Sableye V SSH 120\b/i,/^Gengar & Mimikyu-GX TEU 53\b/i,
    /^Dedenne-GX UNB 57\b/i,/^Squawkabilly ex PAL 169\b/i
  ];
  for(const p of [target,...list(opp.bench).filter(Boolean)]){
    if(!allowed.some(re=>has(p,re))||!Number.isFinite(p.hp)||p.hp>280||list(p.tools).some(t=>![/^Float Stone BKT 137\b/i,/^Muscle Band XY 121\b/i,/^Forest Seal Stone SIT 156\b/i].some(re=>has(t,re))))return fail('UNMODELED_OPPONENT_BOARD');
    // One resistance could break the raw 280 damage threshold.
    if(list(p.printed?.resistance).some(x=>/^psychic$|^p$/i.test(String(x.type))))return fail('PSYCHIC_RESISTANCE');
  }
  return {certified:true,action:'Max Geist',maxAttacks:n,energyRequired,perAttackerRequired,energyCount,deckRequired,maxIncomingDamage:40*(n-1),minimumFinalAttackDamage:10+30*(energyCount-(n-1)),
    rationale:'Temple persists; all possible Active VMAXs stay funded; both basic Darkness Lost Zoned; no Stadium recovery; 1 Plumeria/turn + conservative Iono deck budget.'};
};
