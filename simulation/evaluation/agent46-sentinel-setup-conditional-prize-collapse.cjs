'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const CANDIDATE=path.resolve(__dirname,'../../results/aichi-2026/candidate-sentinel-lopunny-vileplume-v1.json');
const BASIC_NAMES=Object.freeze(['Budew','Buneary','Bunnelby','Fan Rotom',
  'Girafarig','Lillipup','Oddish','Pidgey','Relicanth']);
const SCHEMA='agent46-sentinel-exact-setup-conditional-prize-collapse-v1';

/** @param {number} n @param {number} k @returns {bigint} */
function choose(n,k){
  assert.ok(Number.isSafeInteger(n)&&n>=0&&Number.isSafeInteger(k));
  if(k<0||k>n)return 0n;
  let v=1n;
  const m=Math.min(k,n-k);
  for(let i=1;i<=m;i++)v=v*BigInt(n-m+i)/BigInt(i);
  return v;
}

/**
 * Joint count of (unordered initial seven, disjoint six Prizes) when the
 * opening seven contains a Basic, and every specifically required physical
 * card lies in the six Prizes. The initial hand is dealt before Prizes.
 * @param {{total:number,basic:number,opening:number,prizes:number,
 *   forcedBasic:number,forcedOther:number}} p
 * @returns {{numerator:bigint,denominator:bigint}}
 */
function conditionalEvent(p){
  const {total,basic,opening,prizes,forcedBasic,forcedOther}=p;
  for(const [name,n] of Object.entries(p))
    assert.ok(Number.isSafeInteger(n)&&n>=0,name+': expected integer');
  assert.ok(total>=opening+prizes&&basic>0&&basic<=total);
  assert.ok(forcedBasic<=basic&&forcedOther<=total-basic);
  const need=forcedBasic+forcedOther;
  const denominator=(choose(total,opening)-choose(total-basic,opening))*
    choose(total-opening,prizes);
  assert.ok(denominator>0n);
  if(need>prizes)return {numerator:0n,denominator};
  let numerator=0n;
  for(let j=0;j<=prizes-need;j++){
    const prizeBasic=forcedBasic+j;
    const other=prizes-need-j;
    const prizeSets=choose(basic-forcedBasic,j)*
      choose(total-basic-forcedOther,other);
    const remainingBasics=basic-prizeBasic;
    const otherHands=choose(total-prizes,opening)-
      choose(total-prizes-remainingBasics,opening);
    numerator+=prizeSets*otherHands;
  }
  assert.ok(numerator>=0n&&numerator<=denominator);
  return {numerator,denominator};
}

/**
 * Exact inclusion-exclusion over Stage/card-name groups.
 * Every event requires the only Gladion and ALL copies of one listed stage
 * to be Prized, representing an immediate absent non-Prize supply line.
 * @param {object} config
 * @returns {{numerator:bigint,denominator:bigint}}
 */
function collapseUnion(config){
  const entries=new Map(config.cards.map(c=>[c.name,c.count]));
  assert.equal(entries.size,config.cards.length);
  assert.equal(config.cards.reduce((v,c)=>v+c.count,0),config.total);
  const basics=new Set(config.basicNames);
  assert.equal(config.cards.filter(c=>basics.has(c.name)).
    reduce((v,c)=>v+c.count,0),config.basic);
  assert.equal(entries.get(config.recoveryName),1);
  assert.ok(config.stageNames.length>0&&config.stageNames.length<=16);
  assert.equal(new Set(config.stageNames).size,config.stageNames.length);
  assert.ok(config.stageNames.every(n=>entries.has(n)));
  const denominator=conditionalEvent({...config,forcedBasic:0,forcedOther:0})
    .denominator;
  let numerator=0n;
  for(let mask=1;mask<(1<<config.stageNames.length);mask++){
    const needed=new Set([config.recoveryName]);
    for(let i=0;i<config.stageNames.length;i++)
      if(mask & (1<<i))needed.add(config.stageNames[i]);
    let fb=0,fo=0;
    for(const name of needed)
      if(basics.has(name))fb+=entries.get(name);
      else fo+=entries.get(name);
    const q=conditionalEvent({...config,
      forcedBasic:fb,forcedOther:fo}).numerator;
    const odd=mask.toString(2).replace(/0/g,'').length%2===1;
    numerator+=odd?q:-q;
  }
  assert.ok(numerator>=0n&&numerator<=denominator);
  return {numerator,denominator};
}

/** @param {{numerator:bigint,denominator:bigint}} value @returns {string} */
function percentage6(value){
  const scaled=(value.numerator*200000000n+value.denominator)/
    (2n*value.denominator);
  return (scaled/1000000n).toString()+'.'+
    (scaled%1000000n).toString().padStart(6,'0')+'%';
}

/** @returns {object} */
function sentinelReport(){
  const source=JSON.parse(fs.readFileSync(CANDIDATE,'utf8'));
  const cards=source.cards.map(c=>({name:c.name,count:c.count}));
  const basic=cards.filter(c=>BASIC_NAMES.includes(c.name))
    .reduce((v,c)=>v+c.count,0);
  assert.equal(basic,14);
  const args={total:60,basic,opening:7,prizes:6,cards,
    basicNames:[...BASIC_NAMES],recoveryName:'Gladion'};
  const lines={
    stoutland:['Lillipup','Herdier','Stoutland'],
    vileplume:['Oddish','Gloom','Vileplume'],
    eitherLock:['Lillipup','Herdier','Stoutland','Oddish','Gloom','Vileplume'],
    eitherLockOrGrandTree:['Grand Tree','Lillipup','Herdier',
      'Stoutland','Oddish','Gloom','Vileplume'],
    allNamedSupportPaths:['Grand Tree','Lillipup','Herdier',
      'Stoutland','Oddish','Gloom','Vileplume','Buneary',
      'Mega Lopunny ex','Pidgey','Pidgeotto','Pidgeot ex']
  };
  const events=['Grand Tree','Stoutland','Herdier','Lillipup',
    'Oddish','Gloom','Vileplume'].map(name=>{
    const q=collapseUnion({...args,stageNames:[name]});
    return {name,prizedCopies:cards.find(c=>c.name===name).count,
      percent:percentage6(q),numerator:q.numerator.toString(),
      denominator:q.denominator.toString()};
  });
  const unions=Object.entries(lines).map(([name,stageNames])=>{
    const q=collapseUnion({...args,stageNames});
    return {name,stageNames,percent:percentage6(q),
      numerator:q.numerator.toString(),denominator:q.denominator.toString()};
  });
  return {schema:SCHEMA,source:'results/aichi-2026/candidate-sentinel-lopunny-vileplume-v1.json',
    totalCards:60,basic,opening:7,prizes:6,
    validStartingHandNumerator:(choose(60,7)-choose(60-basic,7)).toString(),
    allStartingHandDenominator:choose(60,7).toString(),
    singleStageCollapseWithGladionPrized:events,
    unionStageCollapseWithGladionPrized:unions,
    interpretation:'Exact probability conditional on a valid original seven. '+
      'Each named stage has all copies Prized together with the sole Gladion. '+
      'Until taking Prizes, that stage is absent from deck/hand and cannot '+
      'be recovered with Gladion.',
    limitations:['This is an initial access event, not an automatic loss',
      'Opening seven is Basic-valid; opponent mulligan bonus draws omitted',
      'A player may win via other attacks or later uncover Prize cards',
      'No simulation or competitive win-rate estimate'],
    competitivelyQualifiedGames:0};
}
if(require.main===module)console.log(JSON.stringify(sentinelReport(),null,2));
module.exports={SCHEMA,BASIC_NAMES,choose,conditionalEvent,
  collapseUnion,percentage6,sentinelReport};
