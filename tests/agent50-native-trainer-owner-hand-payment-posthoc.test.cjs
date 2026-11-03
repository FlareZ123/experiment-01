'use strict';

const assert=require('node:assert/strict');
const test=require('node:test');
const {COSTED,sameCards,withoutCards,costedTrainerHandAudit,
  summarizeArchive}=require('../simulation/evaluation/agent50-native-trainer-owner-hand-payment-posthoc.cjs');

/** @param {number} seat @param {string[]} cards */
const hand=(seat,cards)=>({
  perspectiveSeat:seat,ownHandPrintings:cards.slice()
});
/** @param {number} seat @param {string[]} cards @param {object} fields */
function action(seat,cards,fields){
  return {turnBefore:2,playerSlot:seat,decisionHandBefore:hand(seat,cards),
    ...fields};
}
/** @param {object[]} trace @param {object} receipt */
function cohort(trace,receipt){
  return {repeat:1,slot:'B',source5Seat:1,
    results:[{},{
      game:{decisionTrace:trace},
      summary:{fallbackReceipts:[receipt]}
    },{}]};
}

test('exact multiset arithmetic respects duplicate physical print copies',()=>{
  assert.equal(sameCards(['A','B','A'],['A','A','B']),true);
  assert.equal(sameCards(['A','A'],['A','B']),false);
  assert.deepEqual(withoutCards(['A','B','A'],['A','B']),['A']);
  assert.equal(withoutCards(['A'],['B']),null);
  assert.equal(Object.hasOwn(COSTED,'Ultra Ball MEG'),false);
});

test('Quick Ball real-style one-card discard and own-deck Basic search custody',()=>{
  const card='Quick Ball FST',donor='Escape Rope BST',target='Crobat V DAA';
  const trace=[
    action(1,[donor,card],{
      actionOrdinal:11,action:'PlayCardAction',card:'Quick Ball'
    }),
    action(1,[donor],{
      actionOrdinal:12,action:'ResolvePromptAction',
      cardSelection:{
        message:'CHOOSE_CARD_TO_DISCARD',
        nativePromptMin:1,nativePromptMax:1,
        nativePromptAllowCancel:false,selectedCards:[donor]
      }
    }),
    action(1,[],{
      actionOrdinal:13,action:'ResolvePromptAction',
      cardSelection:{
        message:'CHOOSE_CARD_TO_HAND',sourceZone:'deck',
        sourcePlayerSlot:1,nativePromptMax:1,
        unmappedSelectedCards:0,selectedCards:[target]
      }
    }),
    action(1,[target],{
      actionOrdinal:14,action:'PlayCardAction',card:'Crobat V'
    })
  ];
  const [r]=costedTrainerHandAudit(cohort(trace,{
    seat:1,globalTurn:2,printing:card,handIndex:1
  }));
  assert.equal(r.rootOrdinal,11);
  assert.equal(r.promptedCorrectCost,true);
  assert.equal(r.ownerHandCostConserved,true);
  assert.equal(r.deckSearchPromptMatched,true);
  assert.equal(r.ownerHandSearchConserved,true);
  assert.equal(r.exactOwnerHandPromptChain,true);
  assert.equal(r.physicalDiscardZoneVerified,false);
  assert.deepEqual(r.selectedNativeCostCards,[donor]);
});

test('Secret Box three physical hand removals and four owner-deck search copies',()=>{
  const handBefore=[
    'Special Charge STS','Mew VMAX FST','Quick Ball FST',
    'Ultra Ball MEG','Secret Box TWM'
  ];
  const paid=['Special Charge STS','Quick Ball FST','Ultra Ball MEG'];
  const searched=['Guzma BUS','Battle VIP Pass FST','Float Stone BKT',
    'Path to the Peak CRE'];
  const trace=[
    action(1,handBefore,{actionOrdinal:40,
      action:'PlayCardAction',card:'Secret Box'}),
    action(1,handBefore.slice(0,-1),{
      action:'ResolvePromptAction',
      cardSelection:{message:'CHOOSE_CARD_TO_DISCARD',
        nativePromptMin:3,nativePromptMax:3,nativePromptAllowCancel:false,
        selectedCards:paid}
    }),
    action(1,['Mew VMAX FST'],{
      action:'ResolvePromptAction',
      cardSelection:{message:'CHOOSE_CARD_TO_HAND',
        sourceZone:'deck',sourcePlayerSlot:1,nativePromptMax:4,
        unmappedSelectedCards:0,selectedCards:searched}
    }),
    action(1,['Mew VMAX FST',...searched],{
      action:'PlayCardAction',card:'Float Stone'
    })
  ];
  const [r]=costedTrainerHandAudit(cohort(trace,{
    seat:1,globalTurn:2,printing:'Secret Box TWM',handIndex:4
  }));
  assert.equal(r.exactOwnerHandPromptChain,true);
  assert.deepEqual(r.selectedNativeCostCards,paid);
  assert.deepEqual(r.selectedNativeSearchCards,searched);
  assert.equal(r.targetTypePaperVerified,false);
  assert.equal(r.physicalDiscardZoneVerified,false);
});

test('Professor Letter zero-discard search must add two cards to owner hand',()=>{
  const trace=[
    action(0,['Professors Letter BKT','Guzma BUS'],{
      actionOrdinal:90,action:'PlayCardAction',card:"Professor's Letter"
    }),
    action(0,['Guzma BUS'],{
      action:'ResolvePromptAction',
      cardSelection:{message:'CHOOSE_CARD_TO_HAND',sourceZone:'deck',
        sourcePlayerSlot:0,nativePromptMax:2,unmappedSelectedCards:0,
        selectedCards:['Darkness Energy MEE','Darkness Energy MEE']}
    }),
    action(0,['Guzma BUS','Darkness Energy MEE','Darkness Energy MEE'],{
      action:'PassTurnAction'
    })
  ];
  const [r]=costedTrainerHandAudit(cohort(trace,{
    seat:0,globalTurn:2,printing:'Professors Letter BKT',handIndex:0
  }));
  assert.equal(r.exactOwnerHandPromptChain,true);
  assert.equal(r.selectedNativeCostCards.length,0);
  assert.equal(r.selectedNativeSearchCards.length,2);
});

test('overpaid discards, missing hand copy or non-owner deck fail closed',()=>{
  const item='Quick Ball FST';
  const receipt={seat:1,globalTurn:2,printing:item,handIndex:0};
  const legitimate=[
    action(1,[item,'Tool Scrapper DRX'],{
      actionOrdinal:2,action:'PlayCardAction',card:'Quick Ball'
    }),
    action(1,['Tool Scrapper DRX'],{
      action:'ResolvePromptAction',
      cardSelection:{message:'CHOOSE_CARD_TO_DISCARD',
        nativePromptMin:1,nativePromptMax:1,nativePromptAllowCancel:false,
        selectedCards:['Tool Scrapper DRX','Extra Unpaid']}
    }),
    action(1,[],{action:'ResolvePromptAction',
      cardSelection:{message:'CHOOSE_CARD_TO_HAND',sourceZone:'deck',
        sourcePlayerSlot:1,nativePromptMax:1,unmappedSelectedCards:0,
        selectedCards:[]}
    }),
    action(1,[],{action:'PassTurnAction'})
  ];
  assert.equal(costedTrainerHandAudit(cohort(legitimate,receipt))[0]
    .exactOwnerHandPromptChain,false);
  legitimate[1].cardSelection.selectedCards=['Tool Scrapper DRX'];
  legitimate[2].cardSelection.sourcePlayerSlot=0;
  assert.equal(costedTrainerHandAudit(cohort(legitimate,receipt))[0]
    .exactOwnerHandPromptChain,false);
  legitimate[0].decisionHandBefore.ownHandPrintings=['Other Item'];
  assert.equal(costedTrainerHandAudit(cohort(legitimate,receipt))[0]
    .exactNativeRootMatched,false);
});

test('archive summary never confuses seven costed roots with qualified games',()=>{
  const archive={
    version:'agent50-generic-owner-native-trainer-paired-v1',
    physicalGroups:1,fullParity:true,
    cases:[cohort([],{
      seat:1,globalTurn:2,printing:'Secret Box TWM',handIndex:1
    })]
  };
  const summary=summarizeArchive(archive);
  assert.equal(summary.costedRootsObserved,1);
  assert.equal(summary.exactOwnerHandPromptChains,0);
  assert.equal(summary.unresolvedChains,1);
  assert.equal(summary.paperDiscardZoneCustodyVerified,false);
  assert.equal(summary.qualifiedPaperGames,0);
});
