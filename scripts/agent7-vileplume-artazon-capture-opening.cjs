'use strict';

/**
 * Agent 7: reproducible, deliberately bounded Bunnelby double-TM opening
 * screen for the two original Aichi Vileplume lists.
 * Monte Carlo probabilities describe paper-card availability only.
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createHash}=require('node:crypto');

const SOURCE='results/aichi-2026/full-decklists.json';
const SOURCE_SHA='ae773f6201d7aa69d31914dbfee66f3fba692200';
const NAMES=['OTHER','B','O','P','TC','GH','A','C','TM',
  'Gloom','Pidgeotto','VileplumeAOR','Pidgeot'];
const ID=Object.freeze(Object.fromEntries(NAMES.map((s,i)=>[s,i])));
const EXPECTED=Object.freeze({
  2:{B:2,O:2,P:2,TC:4,GH:4,A:2,C:2,TM:2,
    Gloom:2,Pidgeotto:2,VileplumeAOR:2,Pidgeot:2},
  15:{B:2,O:2,P:2,TC:4,GH:3,A:2,C:1,TM:2,
    Gloom:2,Pidgeotto:2,VileplumeAOR:2,Pidgeot:2}
});
const BASIC_NAMES=Object.freeze({
  2:['Pidgey','Oddish','Lillipup','Bunnelby','Fan Rotom',
    'Relicanth','Mr. Mime','Girafarig','Budew','Jirachi'],
  15:['Oddish','Buneary','Pidgey','Bunnelby','Fan Rotom',
    'Budew','Eldegoss V','Tatsugiri']
});

/** @param {object} card @returns {number} */
function classify(card){
  if(card.name==='Vileplume')return card.printing?.set==='AOR' &&
    String(card.printing?.number)==='3'?ID.VileplumeAOR:ID.OTHER;
  const map={'Bunnelby':'B','Oddish':'O','Pidgey':'P',
    'Tag Call':'TC','Guzma & Hala':'GH','Artazon':'A',
    'Capture Energy':'C','Technical Machine: Evolution':'TM',
    'Gloom':'Gloom','Pidgeotto':'Pidgeotto','Pidgeot ex':'Pidgeot'};
  return ID[map[card.name]??'OTHER'];
}

/** @param {object} source Original printed source deck, rank 2 or 15. */
function makePool(source){
  const expected=EXPECTED[source.rank];
  assert.ok(expected,'Unsupported original rank');
  const cards=source.cards;
  assert.equal(cards.reduce((n,c)=>n+c.count,0),60);
  const pool=[];
  for(const c of cards)for(let j=0;j<c.count;j++)pool.push(classify(c));
  assert.equal(pool.length,60);
  for(const [name,quantity] of Object.entries(expected)){
    assert.equal(pool.filter(x=>x===ID[name]).length,quantity,
      'Source printing/count changed for '+name);
  }
  const names=new Map();
  for(const c of cards)names.set(c.name,(names.get(c.name)??0)+c.count);
  assert.equal(BASIC_NAMES[source.rank].reduce((v,n)=>v+(names.get(n)??0),0),
    14,'Original eligible Basic count changed');
  return Uint8Array.from(pool);
}

/** @param {number} n @param {number} k @returns {bigint} */
function choose(n,k){
  let v=1n;
  for(let j=1;j<=k;j++)v=v*BigInt(n-j+1)/BigInt(j);
  return v;
}
const VALID_OPENING=1-Number(choose(46,7))/Number(choose(60,7));

/** @param {number} seed @returns {()=>number} */
function generator(seed){
  assert.ok(Number.isSafeInteger(seed)&&seed>0&&seed<=0xffffffff);
  let state=seed>>>0;
  return ()=>{
    state^=state<<13;
    state^=state>>>17;
    state^=state<<5;
    return (state>>>0)/4294967296;
  };
}

/**
 * Physical layout: 0..6 initial hand, 7..12 Prizes, 13 first turn draw,
 * 14..59 remaining deck. Starting Active must be in 0..6.
 * No opponent mulligans, attacks, locks, hand effects or prior searches.
 * @param {Uint8Array} cards A full physical arrangement.
 * @returns {{connector:boolean,ready:boolean,missingGH:boolean,resources:boolean,stages:boolean}}
 */
function evaluate(cards){
  assert.equal(cards.length,60);
  const hand=new Int16Array(NAMES.length);
  const deck=new Int16Array(NAMES.length);
  for(let j=0;j<7;j++)hand[cards[j]]++;
  const starter=hand[ID.B]>0;
  for(let j=13;j<14;j++)hand[cards[j]]++;
  for(let j=14;j<60;j++)deck[cards[j]]++;
  const connector=starter&&(hand[ID.GH]+hand[ID.TC]>0);
  const gh=hand[ID.GH]>0||(hand[ID.TC]>0&&deck[ID.GH]>0);
  const resources=['O','P','A','C','TM'].every(k=>
    hand[ID[k]]+deck[ID[k]]>0);
  const stages=['Gloom','Pidgeotto','VileplumeAOR','Pidgeot'].every(k=>
    deck[ID[k]]>0);
  return {connector,ready:connector&&gh&&resources&&stages,
    missingGH:connector&&!gh,resources,stages};
}

/**
 * Deterministic partial Fisher-Yates, reversed after each independent draw.
 * @param {Uint8Array} sourcePool
 * @param {number} samples
 * @param {number} seed
 */
function simulate(sourcePool,samples,seed){
  assert.ok(Number.isSafeInteger(samples)&&samples>0);
  const cards=Uint8Array.from(sourcePool);
  const random=generator(seed);
  const swaps=new Uint8Array(14);
  let connectors=0,ready=0,ghMissing=0,resourceQualified=0,
    missingStage=0;
  for(let i=0;i<samples;i++){
    for(let j=0;j<14;j++){
      const k=j+Math.floor(random()*(60-j));
      swaps[j]=k;
      const t=cards[j];cards[j]=cards[k];cards[k]=t;
    }
    const result=evaluate(cards);
    if(result.connector){
      connectors++;
      if(result.ready)ready++;
      if(result.missingGH)ghMissing++;
      if(result.resources)resourceQualified++;
      if(!result.stages)missingStage++;
    }
    for(let j=13;j>=0;j--){
      const k=swaps[j],t=cards[j];cards[j]=cards[k];cards[k]=t;
    }
  }
  const raw=ready/samples;
  const confidenceHalfWidth=1.96*
    Math.sqrt(raw*(1-raw)/samples)/VALID_OPENING;
  return {samples,seed,connectors,ready,ghMissing,
    resourceQualified,missingStage,
    connectorConditional:connectors/samples/VALID_OPENING,
    readyConditional:raw/VALID_OPENING,
    approximate95HalfWidth:confidenceHalfWidth};
}

function loadSource(root){
  const bytes=fs.readFileSync(path.join(root,SOURCE));
  const sha=createHash('sha1').update('blob '+bytes.length+'\0')
    .update(bytes).digest('hex');
  assert.equal(sha,SOURCE_SHA,'Authenticated 29-original source blob changed');
  return JSON.parse(bytes.toString('utf8'));
}

if(require.main===module){
  const count=Number(process.argv[2]??1000000);
  const source=loadSource(path.resolve(__dirname,'..'));
  for(const rank of [2,15]){
    const deck=source.decks.find(d=>d.rank===rank);
    const data=simulate(makePool(deck),count,12345678+rank);
    process.stdout.write(JSON.stringify({rank,...data})+'\n');
  }
}
module.exports={ID,EXPECTED,makePool,choose,VALID_OPENING,generator,
  evaluate,simulate,loadSource};
