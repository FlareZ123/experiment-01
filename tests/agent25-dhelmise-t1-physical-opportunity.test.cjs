'use strict';
const assert=require('node:assert/strict');
const test=require('node:test');
const path=require('node:path');
const {choose,exactOpportunity,DEFAULT_COUNTS}=
  require('../scripts/agent25-dhelmise-t1-physical-opportunity.cjs');
const deck=require('../results/als/agent25-dhelmise-stage1-discard-v0.json');
const root=path.resolve(__dirname,'../resources/cards/en');
const fs=require('node:fs');

function combinations(items,k,start=0,prefix=[]){
  if(k===0)return [prefix];
  const out=[];
  for(let i=start;i<=items.length-k;i++)
    out.push(...combinations(items,k-1,i+1,[...prefix,items[i]]));
  return out;
}
function brute(counts,opening,prizes,need,usePair){
  const cards=counts.flatMap((n,i)=>Array.from({length:n},()=>i));
  let wins=0,worlds=0;
  for(const original of combinations(cards.map((_,i)=>i),opening)){
    const starting=original.map(i=>cards[i]);
    const remaining=cards.map((_,i)=>i).filter(i=>!original.includes(i));
    for(const next of remaining){
      const hand=[...starting,cards[next]];
      const possiblePrizes=remaining.filter(i=>i!==next);
      for(const selected of combinations(possiblePrizes,prizes)){
        worlds++;
        if(!starting.includes(0)||!hand.includes(2))continue;
        const prizeCards=selected.map(i=>cards[i]);
        if(counts[1]-hand.filter(i=>i===1).length-
          prizeCards.filter(i=>i===1).length<need)continue;
        if(!hand.includes(5)&&
          counts[5]-prizeCards.filter(i=>i===5).length===0)continue;
        const blenderInDeck=counts[4]-hand.filter(i=>i===4).length-
          prizeCards.filter(i=>i===4).length>0;
        if(hand.includes(4)||(hand.includes(3)&&blenderInDeck)||
          (usePair&&hand.filter(i=>i===6).length>=2))wins++;
      }
    }
  }
  return {wins:BigInt(wins),worlds:BigInt(worlds)};
}

test('all 60 cards exist as exactly keyed printed English source copies',()=>{
  const bySet=new Map(),byName=new Map();
  let full=0,basic=0,ace=0,hns=0;
  for(const entry of deck.cards){
    const [set]=entry.id.split('-');
    if(!bySet.has(set)){
      const contents=JSON.parse(fs.readFileSync(path.join(root,set+'.json')));
      bySet.set(set,new Map(contents.map(card=>[card.id,card])));
    }
    const card=bySet.get(set).get(entry.id);
    assert.ok(card,'missing printed '+entry.id);
    assert.equal(card.name,entry.name);
    assert.equal(card.supertype,entry.category);
    assert.ok(entry.count>=1&&entry.count<=4||
      entry.name==='Basic Psychic Energy'&&entry.count===6);
    full+=entry.count;
    if(entry.category==='Pokémon'&&card.subtypes.includes('Basic'))
      basic+=entry.count;
    if(card.subtypes.includes('ACE SPEC'))ace+=entry.count;
    if(card.abilities?.some(a=>a.name==="Hide 'n' Sneak"))
      hns+=entry.count;
    byName.set(entry.name,(byName.get(entry.name)??0)+entry.count);
  }
  assert.equal(full,60);
  assert.equal(basic,12);
  assert.equal(ace,1);
  assert.equal(hns,8);
  assert.equal(byName.get('Banette'),4);
  assert.equal(byName.get('Sinistcha'),4);
  assert.equal(byName.get('Shuppet')??0,0);
  assert.equal(byName.get('Poltchageist')??0,0);
  assert.equal(byName.get('Dhelmise'),4);
  assert.equal(byName.get('Battle Compressor Team Flare Gear'),4);
  assert.equal(byName.get('Telepathic Psychic Energy'),4);
});

test('actual printed attack, donor, weakness, Tele and farewell texts',()=>{
  const files=['me5','sv9','me3','xy7'];
  const byId=new Map(files.flatMap(set=>
    JSON.parse(fs.readFileSync(path.join(root,set+'.json')))
      .map(c=>[c.id,c])));
  const attack=byId.get('me5-39').attacks.find(a=>a.name==='Vengeful Anchor');
  assert.deepEqual(attack.cost,['Psychic']);
  assert.equal(attack.damage,'30+');
  assert.match(attack.text,/4 or more Pokémon.*Hide 'n' Sneak/);
  assert.match(byId.get('sv9-56').abilities[0].text,/Dragon.*Psychic/);
  assert.match(byId.get('me3-88').rules.join(' '),/up to 2 Basic Psychic/);
  assert.equal(byId.get('xy7-30').abilities[0].name,'Farewell Letter');
});

test('BigInt exact fractions from 60 including independent Compressor',()=>{
  assert.deepEqual(DEFAULT_COUNTS,[4,8,4,4,1,2,4,33]);
  const a=exactOpportunity({basicCount:12});
  const b=exactOpportunity({basicCount:12,allowCompressorPair:false});
  assert.equal(a.fraction,'89836718226797/1240231753460700');
  assert.equal(b.fraction,'82354489728457/1240231753460700');
  assert.equal(a.favorable,a.favorableViaBlender+
    a.favorableViaCompressorOnly);
  assert.equal(b.favorableViaCompressorOnly,0n);
  assert.ok(Math.abs(a.conditionalBasicValidProbability*100-
    8.94979085479096)<1e-10);
  assert.equal(a.competitiveGameQualified,false);
});

test('Basic HNS donors affect validity conditioning and mulligan, not raw event',()=>{
  const stage=exactOpportunity({basicCount:12});
  const mixed=exactOpportunity({basicCount:16});
  const basics=exactOpportunity({basicCount:20});
  assert.equal(stage.favorable,mixed.favorable);
  assert.equal(stage.favorable,basics.favorable);
  assert.ok(stage.basicValidOpeningProbability<
    mixed.basicValidOpeningProbability);
  assert.ok(mixed.basicValidOpeningProbability<
    basics.basicValidOpeningProbability);
  assert.ok(stage.conditionalBasicValidProbability>
    mixed.conditionalBasicValidProbability);
  assert.ok(mixed.conditionalBasicValidProbability>
    basics.conditionalBasicValidProbability);
});

test('independent exhaustive physical worlds versus exact combinatorics',()=>{
  const cases=[
    {counts:[2,2,1,1,1,1,2,2],opening:3,prizes:2,
      requiredDonors:1,basicCount:3,allowCompressorPair:false},
    {counts:[2,2,1,1,1,1,2,2],opening:3,prizes:2,
      requiredDonors:1,basicCount:3,allowCompressorPair:true},
    {counts:[1,3,2,1,1,1,2,1],opening:3,prizes:2,
      requiredDonors:2,basicCount:2,allowCompressorPair:true}
  ];
  for(const o of cases){
    const result=exactOpportunity(o);
    const ground=brute(o.counts,o.opening,o.prizes,
      o.requiredDonors,o.allowCompressorPair);
    assert.equal(result.favorable,ground.wins);
    assert.equal(result.denominator,ground.worlds);
  }
});

test('rejects unsupported sampling or invalid count assumption',()=>{
  assert.equal(choose(60,60),1n);
  assert.equal(choose(60,61),0n);
  assert.throws(()=>exactOpportunity({draws:2}),/exactly one/);
  assert.throws(()=>exactOpportunity({basicCount:1}));
  assert.throws(()=>exactOpportunity({counts:[4,8]}));
});

