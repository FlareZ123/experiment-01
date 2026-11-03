'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {ownerTrainerOpportunity}=
  require('../simulation/twinleaf/agent5-generic-owner-trainer-opportunity.cjs');
const {ownerMukGustFrontier}=
  require('../simulation/twinleaf/agent43-muk-gust-owner-frontier.cjs');

const itemCatalog=new Map([
  ['Escape Rope BST',{name:'Escape Rope',type:'Item'}],
  ['Counter Catcher PAR',{name:'Counter Catcher',type:'Item'}],
  ['Canceling Cologne ASR',{name:'Canceling Cologne',type:'Item'}]
]);
const muk=()=>({name:'Alolan Muk',abilities:['Power of Alchemy']});
const luna=()=>({name:'Lunatone',abilities:[]});

/**
 * Exact structure of existing ActorObservation's relevant public fields.
 * Never creates a fake hidden deck or an opponent hand.
 * @param {{activeMuk?:boolean,bench?:object[],ownPrize?:number,
 * opponentPrize?:number,itemLocked?:boolean,hand?:string[],
 * sourceEggDiscard?:boolean}} [options]
 * @returns {object}
 */
function view(options={}) {
  const {
    activeMuk=false,bench=[muk()],ownPrize=6,opponentPrize=6,
    itemLocked=false,
    hand=['Escape Rope BST','Counter Catcher PAR','Canceling Cologne ASR'],
    sourceEggDiscard=true
  }=options;
  return {
    decisionKind:'owner-root',actorSeat:0,globalTurn:3,ownHand:hand,
    ownPublic:{
      active:null,bench:[],stadium:[],discard:sourceEggDiscard?['Exeggcute PLF']:[],
      prizeCount:ownPrize
    },
    opponentPublic:{
      active:activeMuk?muk():luna(),bench,stadium:[],prizeCount:opponentPrize
    },
    ownTurnResources:{
      itemPlayLocked:itemLocked,supporterPlayLocked:false,
      supporterPlayedTurn:0,stadiumPlayLocked:false,
      stadiumPlayedTurn:0,toolPlayLocked:false
    }
  };
}
/**
 * Feed the existing generic owner Trainer opportunity function, retaining
 * all independently held physical card indices.
 * @param {object} v
 */
function run(v) {
  return ownerMukGustFrontier(v,ownerTrainerOpportunity(v,itemCatalog));
}
const available=(result,key)=>result.options.find(x=>x.key===key);

test('owner held all three Items; equal prizes and sole Benched Muk',()=>{
  const r=run(view());
  assert.equal(available(r,'direct-cologne').availableOnPublicPrintedPrerequisites,false);
  assert.equal(available(r,'rope-plus-cologne').availableOnPublicPrintedPrerequisites,true);
  assert.equal(available(r,'catcher-plus-cologne').blocker,'source-not-behind-on-prizes');
  assert.equal(available(r,'rope-plus-cologne').aloneDisablesKnownPowerOfAlchemy,true);
  assert.deepEqual(r.heldPhysical,{rope:1,catcher:1,cologne:1});
  assert.equal(r.qualification.competitiveGameQualified,false);
});

test('opposing second Bench denies source-guaranteed Rope targeting',()=>{
  const r=run(view({bench:[muk(),luna()]}));
  assert.equal(available(r,'rope-plus-cologne').blocker,
    'opponent-has-alternate-bench-promotion');
  assert.equal(available(r,'catcher-plus-cologne').blocker,
    'source-not-behind-on-prizes');
  assert.equal(r.opponentOtherBenchCount,1);
});

test('source behind on Prizes enables owner-selected Catcher target',()=>{
  const r=run(view({bench:[muk(),luna()],opponentPrize:5}));
  assert.equal(available(r,'catcher-plus-cologne').availableOnPublicPrintedPrerequisites,true);
  assert.equal(available(r,'catcher-plus-cologne').targeting,'source-chooses-promoted-bench');
  assert.equal(available(r,'rope-plus-cologne').availableOnPublicPrintedPrerequisites,false);
  assert.equal(r.ownDiscardExeggcuteObservable,true);
});

test('Active Muk offers direct Cologne with no gust',()=>{
  const r=run(view({activeMuk:true,bench:[luna()]}));
  assert.equal(available(r,'direct-cologne').availableOnPublicPrintedPrerequisites,true);
  assert.equal(available(r,'rope-plus-cologne').availableOnPublicPrintedPrerequisites,false);
  assert.equal(available(r,'catcher-plus-cologne').availableOnPublicPrintedPrerequisites,false);
});

test('two Muk leave a Basic lock after only one Cologne target',()=>{
  const r=run(view({bench:[muk(),muk()],opponentPrize:5}));
  assert.equal(r.opponentVisibleMukCount,2);
  assert.equal(available(r,'catcher-plus-cologne').availableOnPublicPrintedPrerequisites,true);
  assert.equal(available(r,'catcher-plus-cologne').aloneDisablesKnownPowerOfAlchemy,false);
});

test('Item lock and missing card are distinct public reasons',()=>{
  const locked=run(view({itemLocked:true,opponentPrize:5}));
  assert.ok(locked.options.every(x=>!x.availableOnPublicPrintedPrerequisites));
  assert.ok(locked.options.every(x=>x.blocker==='public-item-lock'||x.blocker==='muk-not-active'));
  const absent=run(view({hand:['Counter Catcher PAR'],opponentPrize:5}));
  assert.equal(available(absent,'catcher-plus-cologne').blocker,
    'missing-unblocked-held-item');
  assert.equal(available(absent,'catcher-plus-cologne').availableOnPublicPrintedPrerequisites,false);
});

test('physical duplicate hand copies cannot be merged',()=>{
  const r=run(view({hand:['Escape Rope BST','Escape Rope BST',
    'Counter Catcher PAR','Canceling Cologne ASR'],opponentPrize:5}));
  assert.deepEqual(r.heldPhysical,{rope:2,catcher:1,cologne:1});
  assert.deepEqual(available(r,'rope-plus-cologne').originalHandIndices,[[0,1],[3]]);
  assert.deepEqual(available(r,'catcher-plus-cologne').originalHandIndices,[[2],[3]]);
  assert.equal(r.resourceCompetition.oneCologneCannotFundMultipleSimultaneousBranches,true);
});

console.log('AGENT43_MUK_GUST_OWNER_FRONTIER_PURE_DONE');
