'use strict';

const assert=require('node:assert/strict');

const VERSION='agent44-firstturn-box-flexible-k0-v1';
const TOOLS=['Float Stone','Muscle Band'];
const SEARCHERS=[
  {name:'Quick Ball',payment:1},
  {name:'Ultra Ball',payment:2}
];
const DISCARD_ORDER=[
  'Battle VIP Pass','Dark Patch','Quick Ball','VS Seeker',
  'Mysterious Treasure','Iono','Carmine','Ultra Ball'
];

/**
 * Choose a physically payable firstturn Box -> Shake setup offer, using
 * solely this player's already held card names and public Pokémon.
 * Missing Basic can be found by a preserved held Quick/Ultra Ball; Tool
 * can be fetched with Box. Does not count future Box search outputs
 * as resources for its own upfront three-card payment.
 *
 * @param {{turn:number,handNames:string[],benchNames:(string|null)[],activeName?:string|null,itemLocked:boolean,toolLocked:boolean}} view
 * @returns {object} Detached K0 plan or explicit exclusion.
 */
function flexibleFirstTurnBoxOffer(view){
  assert.ok(Array.isArray(view.handNames)&&Array.isArray(view.benchNames));
  const reject=reason=>({eligible:false,reason,discardNames:[],
    toolName:null,trubbishMode:null,basicSearcher:null,
    laterBasicSearcherPayment:0});
  const {handNames:names}=view;
  if(!Number.isSafeInteger(view.turn)||view.turn<1||view.turn>2)
    return reject('NOT_FIRST_OWNER_TURN');
  if(view.itemLocked||view.toolLocked)return reject('PUBLIC_ITEM_OR_TOOL_LOCK');
  if(!names.includes('Secret Box')||names.includes('Boost Shake'))
    return reject('NO_BOX_TO_FETCH_SHAKE');
  const inPlay=view.activeName==='Trubbish'||view.benchNames.includes('Trubbish');
  const held=names.includes('Trubbish');
  const hasBenchSlot=view.benchNames.includes(null);
  if(!inPlay&&!hasBenchSlot)return reject('NO_TRUBBISH_BENCH_CAPACITY');
  const searcher=!inPlay&&!held?
    SEARCHERS.find(row=>names.includes(row.name))??null:null;
  if(!inPlay&&!held&&!searcher)return reject('NO_HELD_TRUBBISH_OR_BASIC_SEARCHER');
  const toolName=TOOLS.find(name=>names.includes(name))??null;
  const trubbishMode=inPlay?'already-in-play':held?'held-basic':'held-searcher';
  const reserved=new Set();
  function reserve(name){
    const ix=names.findIndex((n,i)=>n===name&&!reserved.has(i));
    if(ix<0)return false;
    reserved.add(ix);
    return true;
  }
  assert.equal(reserve('Secret Box'),true);
  if(held&&!inPlay)assert.equal(reserve('Trubbish'),true);
  if(toolName)assert.equal(reserve(toolName),true);
  if(searcher)assert.equal(reserve(searcher.name),true);
  const free=names.map((name,index)=>({name,index}))
    .filter(card=>!reserved.has(card.index));
  // This is physical, not a DCI proof; preserve protected line pieces.
  const priority=name=>{
    const i=DISCARD_ORDER.indexOf(name);
    return i<0?DISCARD_ORDER.length:i;
  };
  free.sort((a,b)=>priority(a.name)-priority(b.name)||a.index-b.index);
  if(free.length<3)return reject('NO_BOX_UPFRONT_THREE_DISCARDS');
  const laterCost=searcher?.payment??0;
  if(free.length-3<laterCost)
    return reject('NO_HELD_LATER_BASIC_SEARCH_PAYMENT');
  return {eligible:true,reason:'K0_PHYSICALLY_FUNDED_BOX_SHAKE',
    discardNames:free.slice(0,3).map(card=>card.name),
    toolName,trubbishMode,basicSearcher:searcher?.name??null,
    laterBasicSearcherPayment:laterCost,
    K1UnprizedTargetsUnverified:true,
    normalOriginalOwnerOnly:true};
}

module.exports={VERSION,TOOLS,SEARCHERS,DISCARD_ORDER,
  flexibleFirstTurnBoxOffer};
