'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {buildTwinleafBeliefInput,applySampledPartitionsToTwinleafState,createPublicDecklistPriorProvider,createTwinleafDeterminizationSampler}=require('../../simulation/twinleaf/2026-11/agent5-twinleaf-belief-input.cjs');

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
  resolvingSupporter:[],handCount,deckCount,prizeCount
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
  const a=buildTwinleafBeliefInput({state:f.state,actorSeat:0,seat:0,
    observation:f.observation,registered60:f.registered[0],knowledgeBySeat:f.knowledgeBySeat});
  const b=buildTwinleafBeliefInput({state:f.state,actorSeat:0,seat:1,
    observation:f.observation,registered60:f.registered[1],knowledgeBySeat:f.knowledgeBySeat});
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
      evolutionPrintings:['Mon1','Energy1'],energies:['Energy1'],tools:['Tool1']}},
    ownerK1:null};
  const decks=[
    ['Mon0','Energy0','Tool0','HandA','HandB',...Array(49).fill('D0'),...Array(6).fill('P0')],
    ['Mon1','Energy1','Tool1',...Array(3).fill('H1'),...Array(48).fill('D1'),...Array(6).fill('P1')]
  ];
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
  const sampler=createTwinleafDeterminizationSampler({
    actorObservation:()=>observation,
    cloneState,
    knowledgeBySeat:()=>knowledge,
    decklistForSeat:(_state,_actorSeat,seat)=>({id:'deck-'+seat,cards:decks[seat]}),
    createCard:printing=>({id:-1,fullName:printing})
  });
  const sampled=sampler(state,0,()=>0.314159);
  assert.equal(typeof sampler.knowledgeBySeat,'function');
  const capturedLedgers=sampler.metadataByState.get(sampled).knowledgeBySeat;
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
  assert.equal(provider(f.state,0,0,f.observation,()=>0).id,'own-list');
  assert.equal(provider(f.state,0,1,f.observation,()=>0).id,'fieldA');
  f.state.players[1].hand.isPublic=true;
  f.state.players[1].hand.cards=[{fullName:'H'}];
  const withPublicHand=createPublicDecklistPriorProvider({
    ownDecklist:{id:'own-list',cards:Array(60).fill('Own')},
    opponentPrior:[list('fieldA','OppMon','A'),
      {id:'fieldC',cards:['OppMon','Energy','Tool','P','H',...Array(55).fill('C')],weight:1}]
  });
  assert.equal(withPublicHand(f.state,0,1,f.observation,()=>0.9).id,'fieldC');
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
  const before=provider(f.state,0,1,f.observation,()=>0).id;
  f.state.players[1].hand.cards=[{fullName:'SecretHandOnly'}];
  f.state.players[1].deck.cards=[{fullName:'SecretDeckOnly'}];
  f.state.players[1].prizes[1].cards=[{fullName:'SecretFaceDownPrizeOnly'}];
  const after=provider(f.state,0,1,f.observation,()=>0).id;
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
  const result=buildTwinleafBeliefInput({state:f.state,actorSeat:0,seat:0,
    observation:f.observation,registered60:f.registered[0],knowledgeBySeat:f.knowledgeBySeat});
  assert.equal(result.exactPrizeMembership,true);
  assert.deepEqual(result.knownPrizeCards,Array(6).fill('P'));
  f.knowledgeBySeat[1]={verified:true,mode:'K1',
    knownPrizePrintings:known,
    ownerK1Snapshot:{epoch:8,exactMembershipKnown:true,knownPrintings:known}};
  const opponent=buildTwinleafBeliefInput({state:f.state,actorSeat:0,seat:1,
    observation:f.observation,registered60:f.registered[1],knowledgeBySeat:f.knowledgeBySeat});
  assert.deepEqual(opponent.knownPrizeCards,Array(6).fill('P'),
    'opponent K1 must be validated from its own ledger without entering actor view');
  f.knowledgeBySeat[0]={verified:true,mode:'K1',
    knownPrizePrintings:[{printing:'P',copies:5},{printing:'D',copies:1}],
    ownerK1Snapshot:snapshot};
  assert.throws(()=>buildTwinleafBeliefInput({state:f.state,actorSeat:0,seat:0,
    observation:f.observation,registered60:f.registered[0],knowledgeBySeat:f.knowledgeBySeat}),
    /disagree about Prize membership/);
});

test('Ticket-like K1 invalidation requires PARTIAL knowledge and a known bottom block',()=>{
  const f=fixture();
  f.observation.ownerK1={epoch:4,exactMembershipKnown:false,knownPrintings:null,
    invalidationReason:'redeal'};
  f.knowledgeBySeat[0]={verified:true,mode:'PARTIAL',knownBottomDeck:['P','P','P','P','P','P']};
  const result=buildTwinleafBeliefInput({state:f.state,actorSeat:0,seat:0,
    observation:f.observation,registered60:f.registered[0],knowledgeBySeat:f.knowledgeBySeat});
  assert.equal(result.exactPrizeMembership,false);
  assert.equal(result.knownBottomDeck.length,6);
});

test('refuses an unverified opponent knowledge assumption',()=>{
  const f=fixture();
  f.knowledgeBySeat[1]={mode:'K0'};
  assert.throws(()=>buildTwinleafBeliefInput({state:f.state,actorSeat:0,seat:1,
    observation:f.observation,registered60:f.registered[1],knowledgeBySeat:f.knowledgeBySeat}),
    /authenticated information-state ledger/);
});

test('a public opponent hand is included as known hand rather than sampled',()=>{
  const f=fixture();
  f.state.players[1].hand.isPublic=true;
  f.state.players[1].hand.cards=[{fullName:'H'},{fullName:'H'},{fullName:'H'}];
  const result=buildTwinleafBeliefInput({state:f.state,actorSeat:0,seat:1,
    observation:f.observation,registered60:f.registered[1],knowledgeBySeat:f.knowledgeBySeat});
  assert.deepEqual(result.knownHand,['H','H','H']);
  assert.equal(result.hiddenHandCount,0);
});
