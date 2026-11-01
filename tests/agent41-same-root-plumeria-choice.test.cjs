'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {
  PROPOSERS,collectAndChooseOwnerRoot,structurallySupported
}=require('../simulation/twinleaf/agent41-same-root-proposal-choice.cjs');

function ownerRoot(){
  return {
    decisionKind:'owner-root',globalTurn:2,
    ownHand:['Team Flare Grunt XY','Plumeria BUS',
      'Psychic Energy SVE 5','Grass Energy SVE 1'],
    ownTurnResources:{supporterPlayedTurn:0,supporterPlayLocked:false,
      energyPlayedTurn:0,itemPlayLocked:false,stadiumPlayedTurn:0},
    ownPublic:{
      active:{printing:'Iron Thorns ex TWM',attacks:[],tools:[],energies:[]},
      bench:[null],publicTurnRestrictions:{},
      prizeCount:6},
    opponentPublic:{
      active:{printing:'Opponent Active',
        energies:['Psychic Energy SVE 5','Psychic Energy SVE 5']},
      bench:[{printing:'Other Opponent Pokemon',energies:[]}]}
  };
}

test('original owner root exposes and selects a grouped native Plumeria payment',()=>{
  const view=ownerRoot();
  const out=collectAndChooseOwnerRoot(view,{},{kind:'pass'},{
    sameRootChoiceApply:true,nativePlumeriaChoice:true
  });
  assert.equal(out.intent.kind,'play-plumeria-payment-menu');
  assert.equal(out.intent.printing,'Plumeria BUS');
  assert.equal(out.intent.handIndex,1);
  assert.equal(out.intent.paymentPairs.length,3);
  assert.equal(out.receipt.selectedSource,'grouped-plumeria-payments');
  assert.equal(out.receipt.changed,true);
  const offer=out.receipt.offers.find(x=>x.source==='grouped-plumeria-payments');
  assert.equal(offer.nativeDispatchImplemented,true);
  assert.equal(offer.nativePlayability,'unverified');
});

test('same-root Plumeria is absent unless experimental dispatch is enabled',()=>{
  const view=ownerRoot();
  const out=collectAndChooseOwnerRoot(view,{},{kind:'pass'},{
    sameRootChoiceApply:true
  });
  assert.equal(out.intent.kind,'pass');
  assert.equal(out.receipt.supportedAlternativeCount,0);
  const observe=collectAndChooseOwnerRoot(view,{},{kind:'pass'},{
    sameRootProbeAll:true
  });
  const proposed=observe.receipt.offers.find(x=>
    x.source==='grouped-plumeria-payments');
  assert.equal(proposed.nativeDispatchImplemented,false);
  assert.equal(proposed.score,-1000);
  assert.equal(observe.intent.kind,'pass');
});

test('one opposing Active Energy is insufficient for this conservative intervention',()=>{
  const view=ownerRoot();
  view.opponentPublic.active.energies.pop();
  const out=collectAndChooseOwnerRoot(view,{},{kind:'pass'},{
    sameRootChoiceApply:true,nativePlumeriaChoice:true
  });
  assert.equal(out.receipt.supportedAlternativeCount,1);
  assert.equal(out.intent.kind,'pass');
});

test('spent Supporter quota excludes all grouped Plumeria copies',()=>{
  const view=ownerRoot();
  view.ownTurnResources.supporterPlayedTurn=2;
  const out=collectAndChooseOwnerRoot(view,{},{kind:'pass'},{
    sameRootChoiceApply:true,nativePlumeriaChoice:true
  });
  assert.equal(out.receipt.supportedAlternativeCount,0);
  assert.equal(out.intent.kind,'pass');
});

test('Plumeria payment menu cannot spend the physical Plumeria card itself',()=>{
  const view=ownerRoot();
  const proposer=PROPOSERS.find(x=>x.name==='grouped-plumeria-payments');
  const [offer]=proposer.propose(view,{},{
    nativePlumeriaChoice:true
  });
  assert.equal(structurallySupported(view,offer),false);
  const attached={...offer,paymentTargets:[{
    slot:'active',index:0,pokemonPrinting:'Opponent Active',
    energyIndex:0,energyPrinting:'Psychic Energy SVE 5'
  }]};
  assert.equal(structurallySupported(view,attached),true);
  const bad={...attached,paymentPairs:[{
    handIndices:[1,2],printings:['Plumeria BUS','Psychic Energy SVE 5']
  }]};
  assert.equal(structurallySupported(view,bad),false);
});
