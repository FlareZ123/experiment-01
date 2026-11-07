'use strict';

const assert=require('node:assert/strict');
const test=require('node:test');
const {runMatch}=require('../simulation/twinleaf/headless.cjs');
const {planAichi}=require('../simulation/evaluation/aichi-pilot.cjs');
const {withActorBattleVipAfterPass}=require(
  '../simulation/twinleaf/agent9-battle-vip-owner-after-pass-v4.cjs'
);

test('rank9 original Aichi deck exposes native natural and intervention VIP root ordinals',()=>{
  const plan=planAichi(9,{
    allowEquivalentBasicEnergies:true,
    allowBasicEnergyMirrorPrintings:true,
    allowJapanesePromoHooks:true
  });
  const source=plan.opponents.find(row=>row.rank===9);
  assert.equal(source?.status,'ready');
  const deck=source.cards;
  assert.equal(deck.length,60);
  assert.equal(deck.filter(name=>name==='Battle VIP Pass FST').length,4);

  const seeds=[
    3060075246,690229661,20261107,20261108,
    20261109,20261110,20261111,20261112
  ];
  const rows=[];
  for(const seed of seeds){
    const observed=withActorBattleVipAfterPass(()=>runMatch({
      label:'agent10-rank9-vip-root-ordinal-probe-'+seed,
      deckA:deck,deckB:deck,seed,maxActions:160,captureDecisionTrace:true
    }));
    const result=observed.result;
    const audit=observed.audit;
    assert.equal(audit.rootOrdinalInitialized,true);
    assert.equal(audit.dispatchRootCount,result.actions);
    assert.equal(result.rootActionLedger.length,result.actions);
    const allVipRoots=result.rootActionLedger.filter(root=>
      root.action==='PlayCardAction'&&root.card==='Battle VIP Pass');
    const interventionItemOrdinals=new Set(audit.examples.filter(event=>
      event.kind==='vip-item'&&event.accepted===true&&
      Number.isSafeInteger(event.itemRootOrdinal))
      .map(event=>event.itemRootOrdinal));
    const naturalVipRoots=allVipRoots.filter(root=>
      !interventionItemOrdinals.has(root.actionOrdinal));
    const interventionEvents=audit.examples.map(event=>({
      ...event,
      itemRoot:event.itemRootOrdinal===undefined?null:
        result.rootActionLedger[event.itemRootOrdinal]??null,
      searchRoot:event.searchRootOrdinal===undefined?null:
        result.rootActionLedger[event.searchRootOrdinal]??null
    }));
    rows.push({
      seed,actions:result.actions,finished:result.finished,winner:result.winner,
      hookDispatchRootCount:audit.dispatchRootCount,
      rootLedgerRows:result.rootActionLedger.length,
      acceptedItems:audit.acceptedItems,acceptedSearches:audit.acceptedSearches,
      rejectedItems:audit.rejectedItems,rejectedSearches:audit.rejectedSearches,
      allVipRoots:allVipRoots.map(root=>({
        actionOrdinal:root.actionOrdinal,playerSlot:root.playerSlot,
        turnBefore:root.turnBefore,card:root.card
      })),
      naturalVipRoots:naturalVipRoots.map(root=>{
        const prompt=result.rootActionLedger.find(candidate=>
          candidate.action==='ResolvePromptAction'&&
          candidate.initiatingRootActionOrdinal===root.actionOrdinal);
        return {
          actionOrdinal:root.actionOrdinal,playerSlot:root.playerSlot,
          turnBefore:root.turnBefore,card:root.card,
          promptActionOrdinal:prompt?.actionOrdinal??null
        };
      }),
      interventionEvents,
      competitiveGameQualified:false
    });
  }
  console.log('NATIVE_RANK9_VIP_ORDINAL_PROBE',JSON.stringify({
    engine:plan.engineRevision,seeds,rows
  }));
  assert.equal(rows.length,seeds.length);
});
