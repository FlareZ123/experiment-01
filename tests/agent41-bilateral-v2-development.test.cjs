'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {developmentTrials,commonPayloadOption,firstPostSourceDecision,sourceLineReplyPacket,
  candidatePostChoicePassEvidence,candidateRepliesAfterSourceAttacks,
  scopedSpecialEnergyActorSeat}=require(
  '../simulation/evaluation/agent41-bilateral-v2-development.cjs');

test('only historical source streams enter the policy development packet',()=>{
  const rows=developmentTrials();
  assert.equal(rows.length,4);
  assert.deepEqual(rows.map(row=>row.id).sort(),[
    '11:2:B:champion-reference',
    '11:2:B:new-moon-lockbreaker-v1',
    '6:0:A:champion-reference',
    '6:0:A:new-moon-lockbreaker-v1'
  ].sort());
  const seeds=new Set(rows.map(row=>[row.rank,row.repeat,row.candidateSlot,
    row.seed].join(':')));
  assert.equal(seeds.size,2,'Each source stream has two dependent candidates');
  assert.ok(rows.every(row=>[6,11].includes(row.rank)));
});

test('identical optional payload search is seat scoped and default inert',()=>{
  assert.deepEqual(commonPayloadOption(0,false),{});
  assert.deepEqual(commonPayloadOption(1,false),{});
  assert.deepEqual(commonPayloadOption(0,true),{
    newMoonAttackPayloadCompressorSeat:0
  });
  assert.deepEqual(commonPayloadOption(1,true),{
    newMoonAttackPayloadCompressorSeat:1
  });
  assert.deepEqual(commonPayloadOption(1,true,true),{
    newMoonAttackPayloadCompressorLateSeat:1
  });
  assert.deepEqual(commonPayloadOption(0,false,true),{});
  assert.deepEqual(commonPayloadOption(0,true,false,true),{
    newMoonAttackPayloadCompressorAnyTurnSeat:0
  });
  assert.deepEqual(commonPayloadOption(1,true,true,true),{
    newMoonAttackPayloadCompressorAnyTurnSeat:1
  },'Explicit any-turn override supersedes archived turn14 gate');
  assert.deepEqual(commonPayloadOption(0,false,false,true),{},
    'A disabled candidate policy must stay inert');
  assert.throws(()=>commonPayloadOption(2,true),{name:'AssertionError'});
});

test('no seed or candidate appears outside the immutable v1 manifest',()=>{
  const {scheduledArms}=require(
    '../simulation/evaluation/agent41-crossrank-actual-decisions.cjs');
  const idToSeed=new Map(scheduledArms().map(row=>[row.id,row.seed]));
  for(const row of developmentTrials()) {
    assert.equal(row.seed,idToSeed.get(row.id));
  }
});

test('rank11 null opportunity never becomes a fictitious first candidate reply',()=>{
  const roots=[
    {playerSlot:1,turnBefore:1,actionOrdinal:20,action:'PassTurnAction'},
    {playerSlot:1,turnBefore:3,actionOrdinal:43,action:'PlayCardAction'}
  ];
  const noLine=firstPostSourceDecision(roots,11,
    {opportunityTurn:null,completed:false},1);
  assert.deepEqual(noLine,{
    root:null,status:'no-completed-source-line',sourceTurn:null
  });
  const aborted=firstPostSourceDecision(roots,11,
    {opportunityTurn:2,completed:false},1);
  assert.equal(aborted.root,null);
  const completed=firstPostSourceDecision(roots,11,
    {opportunityTurn:2,completed:true},1);
  assert.equal(completed.root?.actionOrdinal,43);
  assert.equal(completed.status,'candidate-root-after-source-line');
});

test('rank6 completed source-turn gate skips abort-only source actions',()=>{
  const roots=[
    {playerSlot:0,turnBefore:3,actionOrdinal:50},
    {playerSlot:0,turnBefore:4,actionOrdinal:68}
  ];
  assert.equal(firstPostSourceDecision(roots,6,{
    turn2:{started:true,completed:false},
    turn3:{started:true,completed:false}
  },0).root,null);
  const completed=firstPostSourceDecision(roots,6,{
    turn2:{started:false,completed:false},
    turn3:{started:true,completed:true}
  },0);
  assert.equal(completed.root?.actionOrdinal,68);
  assert.equal(completed.sourceTurn,3);
});

test('completed source with no later candidate root stays explicitly missing',()=>{
  const x=firstPostSourceDecision([],11,{
    opportunityTurn:2,completed:true
  },0);
  assert.deepEqual(x,{
    root:null,status:'no-candidate-root-on-immediate-next-turn',sourceTurn:2
  });
});

test('late root after an intervening source turn is not the immediate reply',()=>{
  const roots=[
    {playerSlot:0,turnBefore:4,actionOrdinal:40,action:'PlayCardAction'},
    {playerSlot:1,turnBefore:5,actionOrdinal:50,action:'PlayCardAction'}
  ];
  const out=firstPostSourceDecision(roots,11,{
    opportunityTurn:2,completed:true
  },1);
  assert.equal(out.root,null);
  assert.equal(out.status,'no-candidate-root-on-immediate-next-turn');
});

test('opponent prompt completion cannot count as an independent candidate reply',()=>{
  const roots=[
    {playerSlot:0,turnBefore:3,actionOrdinal:20,
      action:'ResolvePromptAction'},
    {playerSlot:0,turnBefore:3,actionOrdinal:21,
      action:'AttachEnergyAction'}
  ];
  const completed=firstPostSourceDecision(roots,6,{
    turn2:{completed:true}
  },0);
  assert.equal(completed.root?.actionOrdinal,21);
  const onlyPrompt=firstPostSourceDecision(roots.slice(0,1),6,{
    turn2:{completed:true}
  },0);
  assert.equal(onlyPrompt.root,null);
  assert.equal(onlyPrompt.status,'no-candidate-root-on-immediate-next-turn');
});

/** @returns {object} Minimal authentic-Store-shaped prompt-closed root fixture. */
function promptClosedSourceGame(){
  const roots=[
    {actionOrdinal:0,turnBefore:2,turnAfter:2,playerSlot:1,
      action:'AttackAction',attack:'Volt Cyclone',initiatingRootActionOrdinal:0},
    {actionOrdinal:1,turnBefore:2,turnAfter:3,playerSlot:1,
      action:'ResolvePromptAction',initiatingRootActionOrdinal:0},
    {actionOrdinal:2,turnBefore:3,turnAfter:4,playerSlot:0,
      action:'PassTurnAction',initiatingRootActionOrdinal:2},
    {actionOrdinal:3,turnBefore:4,turnAfter:5,playerSlot:1,
      action:'PassTurnAction',initiatingRootActionOrdinal:3}
  ];
  const clean=[
    {active:{name:'Trevenant & Dusknoir-GX',damage:0}},
    {active:{name:'Iron Thorns ex',damage:0}}
  ];
  const hit=[
    {active:{name:'Trevenant & Dusknoir-GX',damage:140}},
    {active:{name:'Iron Thorns ex',damage:0}}
  ];
  return {
    actions:roots.length,rootActionLedger:roots,
    rootActionLedgerProtocol:'actual-store-root-action-ledger-v1',
    attackDeclarationTraceProtocol:'real-store-attack-log-declarations-v1',
    attackDeclarationTrace:[{
      actionOrdinal:0,turnBefore:2,turnAfter:2,playerSlot:1,
      triggerAction:'AttackAction',triggerPlayerSlot:1,
      attackName:'Volt Cyclone',playerName:'research-B'
    }],
    publicAttackTransitionsProtocol:'actual-store-public-attack-transitions-v1',
    publicAttackTransitions:[{
      actionOrdinal:0,turnBefore:2,turnAfter:2,
      triggerAction:'AttackAction',triggerPlayerSlot:1,
      initiatingRootActionOrdinal:0,
      declarations:[{attackName:'Volt Cyclone',playerName:'research-B'}],
      before:clean,after:clean,promptPendingAfter:true,
      settled:{completionRootActionOrdinal:1,after:hit,
        prizesRemaining:[6,6],deckRemaining:[35,31]}
    }],
    finished:false
  };
}

test('completed rank6 source line carries independently closed public damage',()=>{
  const packet=sourceLineReplyPacket(promptClosedSourceGame(),6,{
    turn2:{completed:true},turn3:{completed:false}
  },1);
  assert.equal(packet.executedSourceRoot.action,'AttackAction');
  assert.equal(packet.matchingSourceAttackDeclared,true);
  assert.equal(packet.firstCandidateNextTurnRoot.action,'PassTurnAction');
  assert.equal(packet.nextSourceTurnRoot.turn,4);
  assert.equal(packet.sourceImmediatePublicAttackTransition.after[0].active.damage,0);
  assert.equal(packet.sourceImmediatePublicAttackTransition.settled.after[0].active.damage,140);
  assert.equal(packet.sourceEffectVerified,false);
  assert.equal(packet.qualifiedCompetitiveGame,false);
});

test('an incomplete autonomous source line cannot create a tactical packet',()=>{
  assert.equal(sourceLineReplyPacket({},6,{
    turn2:{completed:false},turn3:{completed:false}
  },1),null);
  assert.equal(sourceLineReplyPacket({},11,{
    completed:false,opportunityTurn:2
  },1),null);
});

test('rank11 completed Boost Shake is counted as a real Item, never an attack',()=>{
  const game=promptClosedSourceGame();
  game.rootActionLedger[0].action='PlayCardAction';
  delete game.rootActionLedger[0].attack;
  game.rootActionLedger[0].card='Boost Shake';
  game.rootActionLedger[0].turnAfter=2;
  game.attackDeclarationTrace=[];
  game.publicAttackTransitions=[];
  const packet=sourceLineReplyPacket(game,11,{
    completed:true,opportunityTurn:2
  },1);
  assert.equal(packet.executedSourceRoot.card,'Boost Shake');
  assert.equal(packet.matchingSourceAttackDeclared,false);
  assert.equal(packet.sourceImmediatePublicAttackTransition,null);
  assert.equal(packet.sourceEffectVerified,false);
});

test('bounded post-choice pass probe scopes exclusively to candidate slot',()=>{
  const rows=[
    {playerSlot:1,action:'PassTurnAction',turnBefore:3,actionOrdinal:21,
      attackPassProbe:{activePokemon:'Iron Thorns ex',tested:[{
        name:'Volt Cyclone',source:'printed',engineAcceptedAnnouncement:true
      }]}},
    {playerSlot:0,action:'PassTurnAction',turnBefore:4,actionOrdinal:28,
      attackPassProbe:{activePokemon:'Gengar & Mimikyu-GX',tested:[{
        name:'Poltergeist',source:'printed',engineAcceptedAnnouncement:true
      }]}},
    {playerSlot:0,action:'PlayCardAction',turnBefore:4,actionOrdinal:29},
    {playerSlot:0,action:'PassTurnAction',turnBefore:6,actionOrdinal:34}
  ];
  const out=candidatePostChoicePassEvidence(rows,0);
  assert.equal(out.summary.observedCandidatePasses,2);
  assert.equal(out.summary.boundedProbeCount,1);
  assert.equal(out.summary.unprobedCandidatePasses,1);
  assert.equal(out.summary.cloneAcceptedPasses,1);
  assert.equal(out.summary.boundedAndIncomplete,true);
  assert.equal(out.samples[0].ordinal,28);
  assert.equal(out.samples[0].tested[0].name,'Poltergeist');
  assert.equal(JSON.stringify(out).includes('Iron Thorns'),false);
});

test('a cloned rejected attack never becomes a resolved tactical effect',()=>{
  const rows=[{playerSlot:1,action:'PassTurnAction',turnBefore:3,
    actionOrdinal:17,attackPassProbe:{
      activePokemon:'Mewtwo & Mew-GX',auditError:null,
      tested:[{name:'Miraculous Duo-GX',engineAcceptedAnnouncement:false}]
    }}];
  const out=candidatePostChoicePassEvidence(rows,1);
  assert.equal(out.summary.cloneAcceptedPasses,0);
  assert.equal(out.samples[0].tested[0].engineAcceptedAnnouncement,false);
  assert.equal(out.summary.boundedAndIncomplete,true);
});

test('candidate Perfection sampled menu is a separate cloned Ability channel',()=>{
  const rows=[
    {playerSlot:0,action:'PassTurnAction',turnBefore:1,actionOrdinal:20,
      publicBoardBeforePass:[{active:{name:'Mewtwo & Mew-GX'}},
        {active:{name:'Mega Absol ex'}}],
      perfectionPassProbe:{
        evidenceType:'post-choice-cloned-perfection-attack-menu-v1',
        activationAccepted:true,choicePromptObserved:true,
        validAttackNames:['Horror House-GX'],
        validAttackSources:[{source:'Gengar & Mimikyu-GX',attack:'Horror House-GX'}]
      }},
    {playerSlot:0,action:'PassTurnAction',turnBefore:3,actionOrdinal:31,
      perfectionPassProbe:{
        evidenceType:'post-choice-cloned-perfection-attack-menu-v1',
        activationAccepted:false,choicePromptObserved:false,
        validAttackNames:[],validAttackSources:[]
      }},
    {playerSlot:1,action:'PassTurnAction',turnBefore:4,actionOrdinal:42,
      perfectionPassProbe:{
        activationAccepted:true,validAttackNames:['Poltergeist']
      }}
  ];
  const out=candidatePostChoicePassEvidence(rows,0);
  assert.equal(out.summary.observedCandidatePasses,2);
  assert.equal(out.summary.observedPerfectionPasses,2);
  assert.equal(out.summary.acceptedPerfectionActivations,1);
  assert.equal(out.summary.nonemptyCopiedAttackMenus,1);
  assert.equal(out.perfectionSamples[0].validAttackNames[0],'Horror House-GX');
  assert.equal(out.perfectionSamples[0].publicBoardBeforePass[1].active.name,
    'Mega Absol ex');
  assert.equal(out.samples.length,0);
  assert.equal(JSON.stringify(out).includes('Poltergeist'),false);
});


test('source attack replies reveal owner-only late Pass frontier, retaining all failures',()=>{
  const native=[
    {playerSlot:1,actionOrdinal:115,turnBefore:24,
      action:'PassTurnAction',
      decisionHandBefore:{perspectiveSeat:1,ownHandPrintings:[
        'Psychic Energy MEE','Ultra Ball SUM'
      ],opponentHandSize:4},
      publicBoardBeforePass:[{active:{name:'Iron Thorns ex'}},
        {active:{name:'Trevenant & Dusknoir-GX',energyCards:[]}}],
      printedBasicEnergyBeforePass:{count:0}},
    {playerSlot:0,actionOrdinal:116,turnBefore:25,
      action:'PassTurnAction',decisionHandBefore:{
        perspectiveSeat:0,ownHandPrintings:['forbidden source hand']}},
    {playerSlot:1,actionOrdinal:124,turnBefore:26,
      action:'PassTurnAction',decisionHandBefore:{perspectiveSeat:0,
        ownHandPrintings:['invalid opponent-perspective evidence']}}
  ];
  const attacks={attacks:[
    {actionOrdinal:111,turnBefore:23,attackName:'Volt Cyclone',
      nextSourceSameEpochProven:true,nextSourceRoot:{
        ordinal:115,turn:24,action:'PassTurnAction'}},
    {actionOrdinal:118,turnBefore:25,attackName:'Volt Cyclone',
      nextSourceSameEpochProven:true,nextSourceRoot:{
        ordinal:124,turn:26,action:'PassTurnAction'}},
    {actionOrdinal:127,turnBefore:27,attackName:'Volt Cyclone',
      nextSourceSameEpochProven:false,nextSourceRoot:{
        ordinal:131,turn:28,action:'PassTurnAction'}},
    {actionOrdinal:134,turnBefore:29,attackName:'Volt Cyclone',
      nextSourceSameEpochProven:false,nextSourceRoot:null}
  ]};
  const rows=candidateRepliesAfterSourceAttacks(native,attacks,1);
  assert.equal(rows.length,4);
  assert.equal(rows[0].status,'candidate-passed');
  assert.deepEqual(rows[0].ownerHandAfterDecision,[
    'Psychic Energy MEE','Ultra Ball SUM'
  ]);
  assert.equal(rows[0].publicBoardBeforePass[1].active.name,
    'Trevenant & Dusknoir-GX');
  assert.equal(rows[0].printedBasicEnergyBeforePass.count,0);
  assert.equal(rows[1].ownerHandAfterDecision,null,
    'A forged mismatched actor perspective must never supply card identities');
  assert.equal(rows[2].status,'unverified-epoch');
  assert.equal(rows[2].ownerHandAfterDecision,null);
  assert.equal(rows[3].status,'no-followup-root');
  assert.equal(JSON.stringify(rows).includes('forbidden source hand'),false);
});

test('source-attack reply join distinguishes same-epoch non-Pass and missing trace',()=>{
  const seen=[{playerSlot:0,actionOrdinal:9,
    action:'PlayCardAction',turnBefore:3,decisionHandBefore:{
      perspectiveSeat:0,ownHandPrintings:['Unown']}}];
  const attacks={attacks:[
    {actionOrdinal:1,turnBefore:2,attackName:'Psychic',
      nextSourceSameEpochProven:true,nextSourceRoot:{
        ordinal:9,turn:3,action:'PlayCardAction'}},
    {actionOrdinal:2,turnBefore:4,attackName:'Psychic',
      nextSourceSameEpochProven:true,nextSourceRoot:{
        ordinal:20,turn:5,action:'PassTurnAction'}}
  ]};
  const rows=candidateRepliesAfterSourceAttacks(seen,attacks,0);
  assert.equal(rows[0].status,'candidate-other-action');
  assert.equal(rows[0].ownerHandAfterDecision,null);
  assert.equal(rows[1].status,'trace-row-missing');
  assert.equal(rows[1].ownerHandAfterDecision,null);
  assert.throws(()=>candidateRepliesAfterSourceAttacks([],attacks,3),
    {name:'AssertionError'});
});

test('later Pass after candidate Play on the immediate reply turn is the first actionable omission',()=>{
  const trace=[
    {playerSlot:1,actionOrdinal:107,turnBefore:22,
      action:'PlayCardAction',decisionHandBefore:{
        perspectiveSeat:1,ownHandPrintings:['Unown AOR']}},
    {playerSlot:1,actionOrdinal:108,turnBefore:22,
      action:'PassTurnAction',decisionHandBefore:{
        perspectiveSeat:1,ownHandPrintings:['Telepath [P] Energy M3']},
      publicBoardBeforePass:[{active:{name:'Iron Thorns ex'}},
        {active:{name:'Trevenant & Dusknoir-GX',energyCards:[]}}]}
  ];
  const roots=[
    {playerSlot:0,actionOrdinal:101,turnBefore:21,action:'AttackAction',
      pendingPrompt:null},
    {playerSlot:1,actionOrdinal:107,turnBefore:22,action:'PlayCardAction',
      card:'Unown',pendingPrompt:null},
    {playerSlot:1,actionOrdinal:108,turnBefore:22,action:'PassTurnAction',
      pendingPrompt:null},
    {playerSlot:1,actionOrdinal:109,turnBefore:22,action:'ResolvePromptAction',
      pendingPrompt:'WaitPrompt'},
    {playerSlot:0,actionOrdinal:110,turnBefore:23,action:'ResolvePromptAction',
      pendingPrompt:'WaitPrompt'},
    {playerSlot:0,actionOrdinal:111,turnBefore:23,action:'AttackAction',
      pendingPrompt:null}
  ];
  const row=candidateRepliesAfterSourceAttacks(trace,{attacks:[{
    actionOrdinal:101,turnBefore:21,attackName:'Volt Cyclone',
    nextSourceSameEpochProven:true,nextSourceRoot:{
      ordinal:107,turn:22,action:'PlayCardAction'}
  }]},1,roots)[0];
  assert.equal(row.status,'candidate-other-action');
  assert.deepEqual(row.candidateReplyTurnRootSequence,[
    {ordinal:107,action:'PlayCardAction',card:'Unown',attack:null},
    {ordinal:108,action:'PassTurnAction',card:null,attack:null}
  ]);
  assert.equal(row.candidateReplyTurnFinalPass.ordinal,108);
  assert.deepEqual(row.candidateReplyTurnFinalPass.ownerHandAfterDecision,
    ['Telepath [P] Energy M3']);
  assert.equal(row.candidateReplyTurnFinalPass.publicBoardBeforePass[1]
    .active.name,'Trevenant & Dusknoir-GX');
  assert.equal(JSON.stringify(row).includes('Iron Thorns ex'),true);
  assert.equal(JSON.stringify(row).includes('WaitPrompt'),false);
});

test('unverified next epoch does not open candidate turn trace',()=>{
  const result=candidateRepliesAfterSourceAttacks([
    {playerSlot:1,actionOrdinal:25,action:'PassTurnAction'}
  ],{attacks:[{actionOrdinal:20,turnBefore:3,attackName:'Volt Cyclone',
    nextSourceSameEpochProven:false,
    nextSourceRoot:{ordinal:25,turn:4,action:'PassTurnAction'}}]},1,[
    {playerSlot:1,actionOrdinal:25,turnBefore:4,action:'PassTurnAction',
      pendingPrompt:null}
  ])[0];
  assert.deepEqual(result.candidateReplyTurnRootSequence,[]);
  assert.equal(result.candidateReplyTurnFinalPass,null);
});

test('single-actor Special Energy treatment maps candidate and source oppositely',()=>{
  assert.equal(scopedSpecialEnergyActorSeat('none','A'),null);
  assert.equal(scopedSpecialEnergyActorSeat('none','B'),null);
  assert.equal(scopedSpecialEnergyActorSeat('candidate','A'),0);
  assert.equal(scopedSpecialEnergyActorSeat('source','A'),1);
  assert.equal(scopedSpecialEnergyActorSeat('candidate','B'),1);
  assert.equal(scopedSpecialEnergyActorSeat('source','B'),0);
  assert.throws(()=>scopedSpecialEnergyActorSeat('both','B'),
    {name:'AssertionError'});
  assert.throws(()=>scopedSpecialEnergyActorSeat('candidate','C'),
    {name:'AssertionError'});
});

test('generic original source ranks have no fabricated rank6/11 source-line packet',()=>{
  const root=[{actionOrdinal:1,turnBefore:2,playerSlot:1,
    action:'PlayCardAction',card:'Muscle Band'}];
  const out=firstPostSourceDecision(root,21,null,0);
  assert.deepEqual(out,{
    root:null,status:'source-line-not-applicable-to-rank',sourceTurn:null
  });
  assert.equal(sourceLineReplyPacket({rootActionLedger:root},21,null,1),null);
});

test('canonical bilateral Tool apply fails closed without shared active selector',()=>{
  const {runDevelopment}=require(
    '../simulation/evaluation/agent41-bilateral-v2-development.cjs');
  const invalid=[
    {nativeToolAttachRoot:true},
    {actorOnlyComposition:true,nativeToolAttachRoot:true},
    {actorOnlyComposition:true,sameRootProposalChoice:true,
      nativeToolAttachRoot:true},
    {actorOnlyComposition:true,sameRootProposalChoice:true,
      sameRootChoiceApply:true,sameRootProbeAll:true,nativeToolAttachRoot:true}
  ];
  for(const flags of invalid){
    assert.throws(()=>runDevelopment(flags),/Native Tool selection requires/);
  }
});
