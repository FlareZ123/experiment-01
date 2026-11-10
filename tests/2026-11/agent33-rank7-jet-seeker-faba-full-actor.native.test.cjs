'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const path=require('node:path');
const {stagePrepared,PIN}=
  require('../../simulation/twinleaf/agent40-rank7-wobbuffet-hood-native-v2.cjs');
const {withActorOnlyRootPolicy}=
  require('../../simulation/twinleaf/agent34-actor-only-root-policy.cjs');
const OUT=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
const native=name=>require(path.join(OUT,name));

/** @param {object} player Count distinct actual paper-card identities. */
function assertSixty(player){
  const slot=s=>[...new Map([...s.cards,...s.tools,...s.energies.cards]
    .map(c=>[c.id,c])).values()];
  const cards=[...slot(player.active),...player.bench.flatMap(slot),
    ...player.hand.cards,...player.deck.cards,...player.discard.cards,
    ...player.lostzone.cards,...player.stadium.cards,
    ...player.supporter.cards,...player.prizes.flatMap(p=>p.cards)];
  assert.equal(cards.length,60);
  assert.equal(new Set(cards.map(c=>c.id)).size,60);
}

/** @param {0|1} seat Actual physical seat of the printed rank7 owner. */
function run(seat){
  const {SimpleTacticsAi}=native('simple-bot/simple-tactics-ai');
  const {ResolvePromptAction}=
    native('game/store/actions/resolve-prompt-action');
  const {PlayCardAction}=native('game/store/actions/play-card-action');
  const x=stagePrepared({seat,wobbuffetActive:false,hood:false,
    vileplumePresent:true});
  return withActorOnlyRootPolicy(()=>{
    const ownerId=x.originalPlayer.id;
    const source=()=>x.store.state.players.find(p=>p.id===ownerId);
    const rival=()=>x.store.state.players.find(p=>p.id!==ownerId);
    source().hand.moveCardTo(x.nest,source().deck);
    for(const printing of ['Jet Energy PAL','VS Seeker PHF']){
      const card=source().deck.cards.find(c=>c.fullName===printing);
      assert.ok(card);
      source().deck.moveCardTo(card,source().hand);
    }
    const faba=source().deck.cards.find(c=>c.fullName==='Faba LOT');
    assert.ok(faba);
    source().deck.moveCardTo(faba,source().discard);
    assertSixty(source());assertSixty(rival());
    const ai=new SimpleTacticsAi({id:ownerId},
      {tactics:[],promptResolvers:[]},null);
    const roots=[],prompts=[];
    for(let i=0;i<16;i++){
      const pending=x.store.state.prompts.find(p=>p.result===undefined);
      if(pending?.type==='WaitPrompt'||pending?.type==='Show cards'){
        x.store.dispatch(new ResolvePromptAction(pending.id,
          pending.type==='WaitPrompt'?null:true));
        prompts.push(pending.type);
        continue;
      }
      const action=ai.decodeNextAction(x.store.state);
      assert.ok(action);
      if(pending){
        assert.equal(pending.playerId,ownerId);
        assert.equal(pending.type,'Choose cards');
        assert.strictEqual(pending.cards,source().discard);
        assert.equal(action.constructor.name,'ResolvePromptAction');
        prompts.push(pending.type);
      }else{
        assert.ok(action instanceof PlayCardAction,
          'Expected staged source Jet/VS root, received '+action.constructor.name+
          '; step '+i+'; turn '+x.store.state.turn+
          '; phase '+x.store.state.phase+
          '; activeSeat '+x.store.state.activePlayer+
          '; sourceSeat '+seat+
          '; acceptedRootCards '+JSON.stringify(roots)+
          '; sourceHand '+JSON.stringify(source().hand.cards.map(c=>c.fullName))+
          '; sourceActive '+source().active.getPokemonCard()?.fullName+
          '; sourceSupporterCount '+source().supporterTurn+
          '; sourceEnergyTurn '+source().energyPlayedTurn);
        roots.push(source().hand.cards[action.handIndex]?.fullName);
      }
      x.store.dispatch(action);
      if(!x.store.hasPrompts()&&
          source().hand.cards.some(c=>c.id===faba.id)&&
          source().discard.cards.some(c=>c.fullName==='VS Seeker PHF'))
        break;
    }
    assert.deepEqual(roots,['Jet Energy PAL','VS Seeker PHF']);
    assert.ok(prompts.includes('Choose cards'));
    assert.equal(source().active.getPokemonCard()?.fullName,'Wobbuffet PHF');
    assert.ok(source().active.energies.cards.some(c=>
      c.fullName==='Jet Energy PAL'));
    assert.ok(source().hand.cards.some(c=>c.id===faba.id));
    assert.ok(!source().discard.cards.some(c=>c.id===faba.id));
    assert.equal(x.store.hasPrompts(),false);
    assertSixty(source());assertSixty(rival());
    return {seat,pin:PIN,roots,prompts,qualifiedCompetitiveGames:0};
  },{stagedStore:x.store,jetBenchSwitchRoot:true,
    jetPostSeekerFabaContinuation:true});
}
for(const seat of [0,1]){
  test('rank7 full actor Jet -> VS -> Faba seat '+seat,()=>{
    const r=run(seat);
    assert.equal(r.audit.jetPostSeekerFabaPromptsProposed,1);
    assert.equal(r.audit.jetPostSeekerFabaPromptsAccepted,1);
    assert.equal(r.audit.competitiveGameQualified,false);
    console.log('AGENT33_RANK7_FULL_ACTOR_JET_VS_FABA',JSON.stringify(r.result));
  });
}
