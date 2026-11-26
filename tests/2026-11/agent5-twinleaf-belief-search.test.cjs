'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {buildTwinleafBeliefInput,applySampledPartitionsToTwinleafState,createPublicDecklistPriorProvider,createPhysicalSeatDecklistPriorProvider,createTwinleafDeterminizationSampler}=require('../../simulation/twinleaf/2026-11/agent5-twinleaf-belief-input.cjs');
const {canonicalJson,observationSha256}=require('../../simulation/twinleaf/2026-11/agent5-information-set-mcts.cjs');

const throwingHiddenCard=()=>new Proxy({}, {
  get(_target,key){
    if(key==='fullName')throw new Error('concealed card identity was read');
    return undefined;
  }
});
const hiddenCards=n=>Array.from({length:n},throwingHiddenCard);
const publicView=(name,handCount,deckCount,prizeCount)=>({
  active:{printing:name,evolutionPrintings:[name,'Energy'],energies:['Energy'],tools:['Tool']},
  bench:[null,null,null,null,null],stadium:[],discard:[],lostZone:[],
  resolvingSupporter:[],handCount,deckCount,prizeCount,publicHand:null,
  prizeSlots:Array.from({length:prizeCount},(_,index)=>
    name==='OppMon'&&index===0?{index,printing:'P'}:{index})
});
const k0=()=>({verified:true,mode:'K0'});

function fixture(){
  const players=[
    {hand:{isPublic:false,cards:[{fullName:'A'},{fullName:'B'}]},
      deck:{cards:hiddenCards(50)},
      prizes:Array.from({length:6},()=>({faceUpPrize:false,cards:hiddenCards(1)}))},
    {hand:{isPublic:false,cards:hiddenCards(3)},
      deck:{cards:hiddenCards(50)},
      prizes:Array.from({length:6},(_,i)=>i===0?
        {faceUpPrize:true,cards:[{fullName:'P'}]}:
        {faceUpPrize:false,cards:hiddenCards(1)})}
  ];
  return {
    state:{players},actorSeat:0,
    observation:{actorSeat:0,ownHand:['A','B'],
      ownPublic:publicView('OwnMon',2,50,6),
      opponentPublic:publicView('OppMon',3,50,6),ownerK1:null},
    knowledgeBySeat:[k0(),k0()],
    registered:[
      ['OwnMon','A','B',...Array(50).fill('D'),...Array(6).fill('P')],
      ['OppMon',...Array(3).fill('H'),...Array(50).fill('D'),...Array(6).fill('P')]
    ]
  };
}

test('builds both seat beliefs without reading concealed hand, deck or face-down Prize identities',()=>{
  const f=fixture();
  const a=buildTwinleafBeliefInput({actorSeat:0,seat:0,
    observation:f.observation,registered60:f.registered[0],
    beliefKnowledgeBySeat:f.knowledgeBySeat});
  const b=buildTwinleafBeliefInput({actorSeat:0,seat:1,
    observation:f.observation,registered60:f.registered[1],
    beliefKnowledgeBySeat:f.knowledgeBySeat});
  assert.deepEqual(a.knownHand,['A','B']);
  assert.deepEqual(a.knownPublic,['OwnMon','Energy','Tool']);
  assert.equal(a.hiddenHandCount,0);
  assert.equal(b.knownHand,null);
  assert.equal(b.hiddenHandCount,3);
  assert.deepEqual(b.knownPublic,['OppMon','Energy','Tool']);
  assert.deepEqual(b.prizeSlots[0],{index:0,printing:'P'});
  assert.equal(b.prizeSlots.slice(1).every(x=>!Object.hasOwn(x,'printing')),true);
});

test('applies sampled card faces to a detached state while preserving opaque card IDs',()=>{
  const hidden=(id)=>new Proxy({id},{get(target,key){
    if(key==='fullName')throw new Error('original hidden face was read');
    return target[key];
  }});
  const makePlayer=(offset)=>({
    active:{cards:[{id:offset+1,fullName:'Active'}],tools:[]},bench:[],
    stadium:{cards:[]},discard:{cards:[]},lostzone:{cards:[]},supporter:{cards:[]},
    hand:{cards:[hidden(offset+2)]},deck:{cards:[hidden(offset+3),hidden(offset+4)]},
    prizes:[{faceUpPrize:false,cards:[hidden(offset+5)]},
      {faceUpPrize:false,cards:[hidden(offset+6)]}]
  });
  const state={players:[makePlayer(0),makePlayer(100)]};
  const partitions=[0,1].map(seat=>({
    hand:['KnownHand'+seat],deck:['Top'+seat,'Bottom'+seat],
    prizes:[{index:0,printing:'PrizeA'+seat},{index:1,printing:'PrizeB'+seat}]
  }));
  const result=applySampledPartitionsToTwinleafState(state,partitions,
    printing=>({id:-1,fullName:printing}));
  assert.equal(result,state);
  for(let seat=0;seat<2;seat++) {
    const player=state.players[seat];
    assert.equal(player.hand.cards[0].fullName,'KnownHand'+seat);
    assert.deepEqual(player.deck.cards.map(c=>c.fullName),['Top'+seat,'Bottom'+seat]);
    assert.deepEqual(player.prizes.map(p=>p.cards[0].fullName),
      ['PrizeA'+seat,'PrizeB'+seat]);
    assert.deepEqual(player.hand.cards.map(c=>c.id),[seat===0?2:102]);
    assert.deepEqual(player.deck.cards.map(c=>c.id),seat===0?[3,4]:[103,104]);
  }
});

test('two-seat Twinleaf determinizer replaces hidden faces from registered 60s and preserves the actor view',()=>{
  const hidden=(id,secret)=>({id,secret,get fullName(){
    throw new Error('determinizer inspected an original hidden card face');
  }});
  const card=(id,fullName)=>({id,fullName});
  const makePlayer=(seat)=>{
    const base=seat*100;
    const mon='Mon'+seat,energy='Energy'+seat,tool='Tool'+seat;
    return {
      active:{cards:[card(base+1,mon),card(base+2,energy)],
        energies:{cards:[card(base+2,energy)]},tools:[card(base+3,tool)]},
      bench:[],stadium:{cards:[]},discard:{cards:[]},lostzone:{cards:[]},supporter:{cards:[]},
      hand:{isPublic:false,cards:seat===0?[card(base+4,'HandA'),card(base+5,'HandB')]:
        [hidden(base+4,'secret1'),hidden(base+5,'secret2'),hidden(base+6,'secret3')]},
      deck:{cards:Array.from({length:seat===0?49:48},(_,i)=>hidden(base+7+i,'deck-secret-'+i))},
      prizes:Array.from({length:6},(_,i)=>({faceUpPrize:seat===1&&i===0,
        cards:[seat===1&&i===0?card(base+60,'P1'):hidden(base+60+i,'prize-secret-'+i)]}))
    };
  };
  const state={players:[makePlayer(0),makePlayer(1)],activePlayer:0,phase:'PLAY',prompts:[]};
  const observation={actorSeat:0,ownHand:['HandA','HandB'],
    ownPublic:{...publicView('Mon0',2,49,6),active:{printing:'Mon0',
      evolutionPrintings:['Mon0','Energy0'],energies:['Energy0'],tools:['Tool0']}},
    opponentPublic:{...publicView('Mon1',3,48,6),active:{printing:'Mon1',
      evolutionPrintings:['Mon1','Energy1'],energies:['Energy1'],tools:['Tool1']},
      prizeSlots:Array.from({length:6},(_,index)=>
        index===0?{index,printing:'P1'}:{index})},
    ownerK1:null};
  const decks=[
    ['Mon0','Energy0','Tool0','HandA','HandB',...Array(49).fill('D0'),...Array(6).fill('P0')],
    ['Mon1','Energy1','Tool1',...Array(3).fill('H1'),...Array(48).fill('D1'),...Array(6).fill('P1')]
  ];
  const physicalDecklistProvider=createPhysicalSeatDecklistPriorProvider({
    decklistsBySeat:[
      {id:'physical-seat-0',cards:decks[0]},
      {id:'physical-seat-1',cards:decks[1]}
    ],
    opponentPriorByActorSeat:[
      [{id:'seat-1-prior-from-seat-0',cards:decks[1],weight:1}],
      [{id:'seat-0-prior-from-seat-1',cards:decks[0],weight:1}]
    ]
  });
  const cloneState=s=>({
    ...s,players:s.players.map(p=>({
      ...p,active:{...p.active,cards:p.active.cards.slice(),
        energies:{...p.active.energies,cards:p.active.energies.cards.slice()},tools:p.active.tools.slice()},
      bench:p.bench.slice(),stadium:{...p.stadium,cards:p.stadium.cards.slice()},
      discard:{...p.discard,cards:p.discard.cards.slice()},lostzone:{...p.lostzone,cards:p.lostzone.cards.slice()},
      supporter:{...p.supporter,cards:p.supporter.cards.slice()},
      hand:{...p.hand,cards:p.hand.cards.slice()},deck:{...p.deck,cards:p.deck.cards.slice()},
      prizes:p.prizes.map(slot=>({...slot,cards:slot.cards.slice()}))
    }))
  });
  const knowledge={verified:true,mode:'K0',knownTopDeck:[],knownBottomDeck:[],
    knownBottomDeckOrder:false,knownPrizePrintings:[],ownerK1Snapshot:null};
  const rootKnowledgeCalls=[],beliefCalls=[],seatLedgerCalls=[];
  const sampler=createTwinleafDeterminizationSampler({
    actorObservation:(currentState,actorSeat,{ownerK1Snapshot})=>({
      actorSeat,
      ownHand:currentState.players[actorSeat].hand.cards.map(card=>card.fullName),
      ownPublic:actorSeat===0?observation.ownPublic:observation.opponentPublic,
      opponentPublic:actorSeat===0?observation.opponentPublic:observation.ownPublic,
      ownerK1:ownerK1Snapshot??null
    }),
    cloneState,
    rootKnowledgeBySeat:input=>{
      rootKnowledgeCalls.push(input);
      assert.equal(Object.hasOwn(input,'state'),false);
      assert.equal(input.rootSeat,0);
      return knowledge;
    },
    beliefKnowledgeBySeat:input=>{
      beliefCalls.push(input);
      assert.equal(Object.hasOwn(input,'state'),false);
      assert.equal(input.targetSeat,1-input.rootSeat);
      return knowledge;
    },
    seatKnowledgeBySeat:input=>{
      seatLedgerCalls.push(input.seat);
      if(input.previousLedger)return input.previousLedger;
      if(input.seat===0)return k0();
      const prizes=input.state.players[input.seat].prizes
        .flatMap(slot=>slot.cards.map(card=>card.fullName));
      const counts=new Map();
      for(const printing of prizes)counts.set(printing,(counts.get(printing)||0)+1);
      const knownPrizePrintings=[...counts]
        .map(([printing,copies])=>({printing,copies}))
        .sort((a,b)=>a.printing.localeCompare(b.printing));
      return {
        verified:true,mode:'K1',knownPrizePrintings,
        knownTopDeck:[],knownBottomDeck:[],knownBottomDeckOrder:false,
        ownerK1Snapshot:{
          epoch:1,exactMembershipKnown:true,
          knownPrintings:knownPrizePrintings.map(row=>({...row}))
        }
      };
    },
    decklistForSeat:(actorObservation,actorSeat,seat,random)=>{
      assert.equal(Object.hasOwn(actorObservation,'players'),false,
        'Decklist prior must not receive native State');
      return physicalDecklistProvider(actorObservation,actorSeat,seat,random);
    },
    createCard:printing=>({id:-1,fullName:printing})
  });
  const sampled=sampler(state,0,()=>0.314159);
  assert.deepEqual(sampler.metadataByState.get(sampled).decklistIds,
    ['physical-seat-0','seat-1-prior-from-seat-0']);
  assert.equal(typeof sampler.knowledgeBySeat,'function');
  const metadata=sampler.metadataByState.get(sampled);
  const capturedLedgers=metadata.knowledgeBySeat;
  assert.equal(metadata.rootBeliefBySeat[1].mode,'K0',
    'Root sampling must use only root-visible belief for the opponent');
  assert.equal(capturedLedgers[0].mode,'K0');
  assert.equal(capturedLedgers[1].mode,'K1',
    'The opponent policy receives its own sampled-world private ledger');
  const sampledOpponentPrizeCounts=new Map();
  for(const slot of sampled.players[1].prizes) {
    for(const prize of slot.cards) {
      sampledOpponentPrizeCounts.set(prize.fullName,
        (sampledOpponentPrizeCounts.get(prize.fullName)??0)+1);
    }
  }
  assert.deepEqual(capturedLedgers[1].knownPrizePrintings,
    [...sampledOpponentPrizeCounts].map(([printing,copies])=>({printing,copies}))
      .sort((a,b)=>a.printing.localeCompare(b.printing)));
  assert.equal(capturedLedgers[1].knownPrizePrintings.reduce(
    (sum,row)=>sum+row.copies,0),6);
  assert.equal(rootKnowledgeCalls.length,1);
  assert.equal(beliefCalls.length,1);
  assert.deepEqual(seatLedgerCalls.sort(),[0,1]);

  // The opponent's K1 ledger is now the acting seat's own perfect-recall
  // ledger. Re-determinizing from seat 1 must preserve that exact metadata,
  // not reconstruct it through the root-knowledge provider.
  const successor=cloneState(sampled);
  assert.equal(sampler.refreshMetadata(sampled,successor),true);
  const priorSeat1Ledger=sampler.metadataByState.get(successor).knowledgeBySeat[1];
  assert.equal(priorSeat1Ledger.mode,'K1');
  assert.equal(priorSeat1Ledger.ownerK1Snapshot.epoch,1);
  const seat1Observation={
    actorSeat:1,
    ownHand:successor.players[1].hand.cards.map(card=>card.fullName),
    ownPublic:observation.opponentPublic,
    opponentPublic:observation.ownPublic,
    ownerK1:priorSeat1Ledger.ownerK1Snapshot,
    ownerKnowledgeLedger:priorSeat1Ledger
  };
  const redeterminedForSeat1=sampler(successor,1,()=>0.271828,seat1Observation);
  assert.deepEqual(sampler.metadataByState.get(redeterminedForSeat1).decklistIds,
    ['seat-0-prior-from-seat-1','physical-seat-1']);
  const preservedSeat1Ledger=sampler.metadataByState.get(redeterminedForSeat1).knowledgeBySeat[1];
  assert.deepEqual(preservedSeat1Ledger,priorSeat1Ledger);
  assert.deepEqual(preservedSeat1Ledger.knownPrizePrintings,
    priorSeat1Ledger.knownPrizePrintings);
  assert.equal(rootKnowledgeCalls.length,1,
    'A sampled acting seat must reuse its authenticated ledger instead of reconstructing it');
  assert.equal(sampler.metadataByState.get(redeterminedForSeat1).rootSeat,1);

  const incompleteState=cloneState(successor);
  sampler.metadataByState.set(incompleteState,{knowledgeBySeat:[k0()]});
  assert.throws(()=>sampler(incompleteState,1,()=>0.141421,seat1Observation),
    /missing the acting seat private ledger/);
  assert.throws(()=>sampler.knowledgeBySeat(incompleteState,1,{rootSeat:1}),
    /missing the requested physical seat private ledger/);

  assert.equal(sampler.knowledgeBySeat(state,0,{rootSeat:0}).mode,'K0');
  assert.throws(()=>sampler.knowledgeBySeat(state,1,{rootSeat:0}),
    /only the root actor private ledger/);
  knowledge.knownTopDeck.push('Psychic Energy');
  assert.deepEqual(capturedLedgers[0].knownTopDeck,[]);
  assert.deepEqual(capturedLedgers[1].knownTopDeck,[]);
  assert.notEqual(sampled,state);
  assert.deepEqual(sampled.players[0].hand.cards.map(c=>c.fullName),['HandA','HandB']);
  assert.equal(sampled.players[1].hand.cards.length,3);
  assert.equal(sampled.players[0].deck.cards.length,49);
  assert.equal(sampled.players[1].deck.cards.length,48);
  assert.equal(sampled.players[1].prizes[0].cards[0].fullName,'P1');
  assert.deepEqual(sampled.players[0].active.cards.map(c=>c.fullName),['Mon0','Energy0']);
  assert.deepEqual(state.players[1].hand.cards.map(c=>c.secret),
    ['secret1','secret2','secret3']);
});

test('opponent decklist prior is filtered by public evidence, never the actual hidden list or hand',()=>{
  const f=fixture();
  f.state.actualDecklistId='fieldB';
  const list=(id,mon,tail)=>({id,cards:[mon,'Energy','Tool','P',...Array(56).fill(tail)],weight:1});
  const provider=createPublicDecklistPriorProvider({
    ownDecklist:{id:'own-list',cards:Array(60).fill('Own')},
    opponentPrior:[list('fieldA','OppMon','A'),list('fieldB','OtherMon','B')]
  });
  assert.equal(provider(f.observation,0,0,()=>0).id,'own-list');
  assert.equal(provider(f.observation,0,1,()=>0).id,'fieldA');
  f.state.players[1].hand.isPublic=true;
  f.state.players[1].hand.cards=[{fullName:'H'}];
  f.observation.opponentPublic.publicHand=['H'];
  const withPublicHand=createPublicDecklistPriorProvider({
    ownDecklist:{id:'own-list',cards:Array(60).fill('Own')},
    opponentPrior:[list('fieldA','OppMon','A'),
      {id:'fieldC',cards:['OppMon','Energy','Tool','P','H',...Array(55).fill('C')],weight:1}]
  });
  assert.equal(withPublicHand(f.observation,0,1,()=>0.9).id,'fieldC');
});

test('public-prior filter callback receives no determinized State and is invariant to concealed zones',()=>{
  const f=fixture();
  const list=(id,mon,tail)=>({id,cards:[mon,'Energy','Tool','P',...Array(56).fill(tail)],weight:1});
  const seen=[];
  const provider=createPublicDecklistPriorProvider({
    ownDecklist:{id:'own-list',cards:Array(60).fill('Own')},
    opponentPrior:[list('fieldA','OppMon','A'),list('fieldB','OtherMon','B')],
    ignorePublicCard:function(printing){
      assert.equal(arguments.length,1,'public filter must receive only the public printing');
      assert.equal(typeof printing,'string');
      seen.push(printing);
      return false;
    }
  });
  const before=provider(f.observation,0,1,()=>0).id;
  f.state.players[1].hand.cards=[{fullName:'SecretHandOnly'}];
  f.state.players[1].deck.cards=[{fullName:'SecretDeckOnly'}];
  f.state.players[1].prizes[1].cards=[{fullName:'SecretFaceDownPrizeOnly'}];
  const after=provider(f.observation,0,1,()=>0).id;
  assert.equal(before,'fieldA');
  assert.equal(after,before,'concealed-zone permutations must not affect public-prior filtering');
  assert.ok(seen.length>0);
});

test('K1 actor snapshot and ledger must agree on exact Prize membership',()=>{
  const f=fixture();
  const known=[{printing:'P',copies:6}];
  const snapshot={epoch:3,exactMembershipKnown:true,knownPrintings:known};
  f.observation.ownerK1=snapshot;
  f.knowledgeBySeat[0]={verified:true,mode:'K1',
    knownPrizePrintings:known,ownerK1Snapshot:snapshot};
  const result=buildTwinleafBeliefInput({actorSeat:0,seat:0,
    observation:f.observation,registered60:f.registered[0],
    beliefKnowledgeBySeat:f.knowledgeBySeat});
  assert.equal(result.exactPrizeMembership,true);
  assert.deepEqual(result.knownPrizeCards,Array(6).fill('P'));
  f.knowledgeBySeat[1]={verified:true,mode:'K1',
    knownPrizePrintings:known,
    exactPrizeSnapshot:{epoch:8,exactMembershipKnown:true,knownPrintings:known}};
  const opponent=buildTwinleafBeliefInput({actorSeat:0,seat:1,
    observation:f.observation,registered60:f.registered[1],
    beliefKnowledgeBySeat:f.knowledgeBySeat});
  assert.deepEqual(opponent.knownPrizeCards,Array(6).fill('P'),
    'opponent K1 must be validated from its own ledger without entering actor view');
  f.knowledgeBySeat[0]={verified:true,mode:'K1',
    knownPrizePrintings:[{printing:'P',copies:5},{printing:'D',copies:1}],
    ownerK1Snapshot:snapshot};
  assert.throws(()=>buildTwinleafBeliefInput({actorSeat:0,seat:0,
    observation:f.observation,registered60:f.registered[0],
    beliefKnowledgeBySeat:f.knowledgeBySeat}),
    /disagree about Prize membership/);
});

test('Ticket-like K1 invalidation requires PARTIAL knowledge and a known bottom block',()=>{
  const f=fixture();
  f.observation.ownerK1={epoch:4,exactMembershipKnown:false,knownPrintings:null,
    invalidationReason:'redeal'};
  f.knowledgeBySeat[0]={verified:true,mode:'PARTIAL',knownBottomDeck:['P','P','P','P','P','P']};
  const result=buildTwinleafBeliefInput({actorSeat:0,seat:0,
    observation:f.observation,registered60:f.registered[0],
    beliefKnowledgeBySeat:f.knowledgeBySeat});
  assert.equal(result.exactPrizeMembership,false);
  assert.equal(result.knownBottomDeck.length,6);
});

test('refuses an unverified opponent knowledge assumption',()=>{
  const f=fixture();
  f.knowledgeBySeat[1]={mode:'K0'};
  assert.throws(()=>buildTwinleafBeliefInput({actorSeat:0,seat:1,
    observation:f.observation,registered60:f.registered[1],
    beliefKnowledgeBySeat:f.knowledgeBySeat}),
    /authenticated information-state ledger/);
});

test('a public opponent hand is included as known hand rather than sampled',()=>{
  const f=fixture();
  f.state.players[1].hand.isPublic=true;
  f.state.players[1].hand.cards=[{fullName:'H'},{fullName:'H'},{fullName:'H'}];
  f.observation.opponentPublic.publicHand=['H','H','H'];
  const result=buildTwinleafBeliefInput({actorSeat:0,seat:1,
    observation:f.observation,registered60:f.registered[1],
    beliefKnowledgeBySeat:f.knowledgeBySeat});
  assert.deepEqual(result.knownHand,['H','H','H']);
  assert.equal(result.hiddenHandCount,0);
});


test('observation canonicalization rejects values that would collide or change type in policy snapshots',()=>{
  assert.equal(canonicalJson({z:1,a:[true,'x']}),'{"a":[true,"x"],"z":1}');
  assert.equal(observationSha256({a:[1,2]}),observationSha256({a:[1,2]}));
  assert.notEqual(observationSha256({a:[1,2]}),observationSha256({a:[2,1]}));
  assert.throws(()=>canonicalJson({value:undefined}),/JSON-safe/);
  assert.throws(()=>canonicalJson({value:()=>0}),/JSON-safe/);
  assert.throws(()=>canonicalJson([undefined]),/JSON-safe/);
  assert.throws(()=>canonicalJson({value:-0}),/negative zero/);
  assert.throws(()=>canonicalJson({value:NaN}),/non-finite/);
  assert.throws(()=>canonicalJson(new Array(1)),/dense/);
  const sparse=new Array(1);
  assert.throws(()=>observationSha256(sparse),/dense/);
});

test('observation canonicalization rejects hidden object properties and accessors without invoking getters',()=>{
  const symbolKey=Symbol('hidden');
  const withSymbol={visible:true};
  withSymbol[symbolKey]='secret';
  assert.throws(()=>canonicalJson(withSymbol),/symbol keys/);

  const nonEnumerable={visible:true};
  Object.defineProperty(nonEnumerable,'hidden',{value:'secret',enumerable:false});
  assert.throws(()=>canonicalJson(nonEnumerable),/enumerable data properties/);

  let getterCalls=0;
  const withGetter={};
  Object.defineProperty(withGetter,'secret',{
    enumerable:true,
    get(){getterCalls++;return 'secret';}
  });
  assert.throws(()=>canonicalJson(withGetter),/enumerable data properties/);
  assert.equal(getterCalls,0,'Canonicalization must reject accessors without invoking them');

  const arrayWithExtra=[1];
  arrayWithExtra.extra='secret';
  assert.throws(()=>canonicalJson(arrayWithExtra),/dense and have no extra properties/);
});


test('two-sided decklist priors keep exact own lists bound to physical seats',()=>{
  const decklistsBySeat=[
    {id:'candidate-seat-0',cards:Array(60).fill('Candidate Card')},
    {id:'opponent-seat-1',cards:Array(60).fill('Opponent Card')}
  ];
  const opponentPriorByActorSeat=[
    [{id:'seat-1-as-seen-by-seat-0',cards:decklistsBySeat[1].cards,weight:1}],
    [{id:'seat-0-as-seen-by-seat-1',cards:decklistsBySeat[0].cards,weight:1}]
  ];
  const provider=createPhysicalSeatDecklistPriorProvider({
    decklistsBySeat,opponentPriorByActorSeat
  });
  // Provider construction snapshots the fixed own lists and both actor priors.
  decklistsBySeat[0].cards[0]='mutated-candidate';
  decklistsBySeat[1].cards[0]='mutated-opponent';
  opponentPriorByActorSeat[0][0].cards[0]='mutated-seat1-prior';
  opponentPriorByActorSeat[1][0].cards[0]='mutated-seat0-prior';
  const publicView={
    active:null,bench:[],stadium:[],discard:[],lostZone:[],
    resolvingSupporter:[],prizeSlots:[]
  };
  const seat0Observation={actorSeat:0,opponentPublic:publicView};
  const seat1Observation={actorSeat:1,opponentPublic:publicView};

  const seat0Own=provider(seat0Observation,0,0,()=>0);
  const seat0Opponent=provider(seat0Observation,0,1,()=>0);
  const seat1Own=provider(seat1Observation,1,1,()=>0);
  const seat1Opponent=provider(seat1Observation,1,0,()=>0);

  assert.equal(seat0Own.id,'candidate-seat-0');
  assert.equal(seat0Opponent.id,'seat-1-as-seen-by-seat-0');
  assert.equal(seat1Own.id,'opponent-seat-1');
  assert.equal(seat1Opponent.id,'seat-0-as-seen-by-seat-1');
  assert.equal(seat0Own.cards[0],'Candidate Card');
  assert.equal(seat0Opponent.cards[0],'Opponent Card');
  assert.equal(seat1Own.cards[0],'Opponent Card');
  assert.equal(seat1Opponent.cards[0],'Candidate Card');
  assert.notStrictEqual(seat0Own.cards,decklistsBySeat[0].cards);
  assert.notStrictEqual(seat1Own.cards,decklistsBySeat[1].cards);
});
