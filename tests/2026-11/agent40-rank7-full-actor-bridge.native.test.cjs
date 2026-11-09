'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { stagePrepared, PIN } =
  require('../../simulation/twinleaf/agent40-rank7-wobbuffet-hood-native-v2.cjs');
const { withActorOnlyRootPolicy, actorNativeActionReceipt } =
  require('../../simulation/twinleaf/agent34-actor-only-root-policy.cjs');
const OUT = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');
const native = name => require(path.join(OUT, name));

/** @param {0|1} seat */
function run(seat) {
  const { SimpleTacticsAi } = native('simple-bot/simple-tactics-ai');
  const { ResolvePromptAction } =
    native('game/store/actions/resolve-prompt-action');
  const { PlayCardAction } = native('game/store/actions/play-card-action');
  const x = stagePrepared({seat,wobbuffetActive:false,
    hood:true,vileplumePresent:true});
  return withActorOnlyRootPolicy(() => {
    const ownerId=x.originalPlayer.id;
    const source=()=>x.store.state.players.find(p=>p.id===ownerId);
    const opponent=()=>x.store.state.players.find(p=>p.id!==ownerId);
    for (const printing of ['Faba LOT','Jet Energy PAL']) {
      const card=source().deck.cards.find(c=>c.fullName===printing);
      assert.ok(card);
      source().deck.moveCardTo(card,source().hand);
    }
    const ai=new SimpleTacticsAi({id:ownerId},
      {tactics:[],promptResolvers:[]},null);
    const roots=[];
    const prompts=[];
    for(let i=0;i<13;i++){
      const pending=x.store.state.prompts.find(p=>p.result===undefined);
      if(pending?.type==='Shuffle deck') {
        const indices=Array.from({length:source().deck.cards.length},(_,j)=>j);
        let seed=(20261109+seat*419)>>>0;
        for(let k=indices.length-1;k>0;k--){
          seed=(Math.imul(seed,1664525)+1013904223)>>>0;
          const j=seed%(k+1);
          [indices[k],indices[j]]=[indices[j],indices[k]];
        }
        x.store.dispatch(new ResolvePromptAction(pending.id,indices));
        prompts.push('Shuffle deck');
        continue;
      }
      if(pending?.type==='WaitPrompt') {
        x.store.dispatch(new ResolvePromptAction(pending.id,null));
        prompts.push('WaitPrompt');
        continue;
      }
      const action=ai.decodeNextAction(x.store.state);
      assert.ok(action, 'Actor must decide a real owner action');
      if(pending) {
        assert.equal(pending.playerId,ownerId);
        assert.equal(action.constructor.name,'ResolvePromptAction');
        prompts.push(pending.type);
      }else{
        assert.ok(action instanceof PlayCardAction,
          'Root must be a real owner Faba, Jet or Nest PlayCardAction');
        const selected=source().hand.cards[action.handIndex]?.fullName;
        roots.push(selected);
      }
      x.store.dispatch(action);
      if(roots.includes('Nest Ball SVI')&&
         !x.store.state.prompts.some(p=>p.result===undefined))break;
    }
    assert.deepEqual(roots,['Faba LOT','Jet Energy PAL','Nest Ball SVI']);
    assert.ok(prompts.includes('Select'));
    assert.ok(prompts.includes('Choose pokemon'));
    assert.ok(prompts.includes('Choose cards'));
    assert.ok(source().active.getPokemonCard()?.fullName==='Wobbuffet PHF');
    assert.ok(opponent().lostzone.cards.some(c=>c.fullName==='Stealthy Hood UNB'));
    assert.ok(source().bench.some(s=>s.getPokemonCard()?.fullName==='Snorlax PGO'),
      'The owner K1 root prefers original deck-resident Snorlax PGO');
    assert.ok(source().discard.cards.some(c=>c.fullName==='Nest Ball SVI'));
    return {seat,pin:PIN,roots,prompts,sourceTurn:x.store.state.turn,
      originalSourceRank:7,stagedOnly:true,qualifiedCompetitiveGames:0};
  },{rank7FabaJetBridge:true,jetBenchSwitchRoot:true,
    stagedStore:x.store});
}
for(const seat of [0,1]){
  test('original rank7 real shared actor Faba Jet Nest full Store, seat '+seat,()=>{
    const r=run(seat);
    assert.equal(r.result.seat,seat);
    assert.ok(r.audit.rank7FabaJetBridgePromptsAccepted>=3);
    assert.equal(r.audit.competitiveGameQualified,false);
    console.log('AGENT40_RANK7_FULL_ACTOR_NATIVE',
      JSON.stringify({result:r.result,bridgeAccepted:
        r.audit.rank7FabaJetBridgePromptsAccepted,
        typedIntentCounts:r.audit.typedIntentCounts}));
  });
}
