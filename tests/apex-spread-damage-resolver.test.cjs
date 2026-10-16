'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {
  prizeWindowDamageMap,
  prizeWindowPutDamageResolverClass,
  withPrizeWindowPutDamageResolver
} = require('../simulation/twinleaf/apex-spread-damage-resolver.cjs');

/** @param {number[]} remainingHP
 * @param {object} [overrides]
 */
function fixture(remainingHP, overrides = {}) {
  const codes = {attackPhase:3,opponentSide:2,benchSlot:4};
  const me = {
    id:101,
    active:{getPokemonCard:()=>({fullName:'Regidrago VSTAR SIT'})}
  };
  const bench = remainingHP.map(hp=>({
    damage:100-hp,
    hp:100,
    tools:[],
    getPokemonCard:()=>({hp:100,powers:[]})
  }));
  const opponent={id:202,bench};
  const state={phase:3,players:[me,opponent]};
  const prompt={
    playerId:101,
    damage:60,
    playerType:2,
    slots:[4],
    maxAllowedDamage:bench.map((_,index)=>({
      target:{player:2,slot:4,index},damage:9999
    })),
    options:{blocked:[]},
    validate:(map)=>map.reduce((s,v)=>s+v.damage,0)===60,
    ...overrides
  };
  return {state,me,opponent,prompt,codes};
}

test('targets a lone 30HP Bench KO and allocates all 60 damage',()=>{
  const f=fixture([30]);
  assert.deepEqual(prizeWindowDamageMap(f.state,f.me,f.prompt,f.codes),[
    {target:{player:2,slot:4,index:0},damage:60}
  ]);
});

test('finds two 30HP Knock Outs from six damage counters',()=>{
  const f=fixture([30,30,100]);
  assert.deepEqual(prizeWindowDamageMap(f.state,f.me,f.prompt,f.codes),[
    {target:{player:2,slot:4,index:0},damage:30},
    {target:{player:2,slot:4,index:1},damage:30}
  ]);
});

test('maximizes KO count ahead of preserving fewer counters',()=>{
  const f=fixture([60,40,20]);
  assert.deepEqual(prizeWindowDamageMap(f.state,f.me,f.prompt,f.codes),[
    {target:{player:2,slot:4,index:1},damage:40},
    {target:{player:2,slot:4,index:2},damage:20}
  ]);
});

test('avoids blocked and protected target entries',()=>{
  const f=fixture([30,30]);
  f.prompt.options.blocked=[{player:2,slot:4,index:0}];
  f.opponent.bench[1].tools=[{}];
  assert.equal(prizeWindowDamageMap(f.state,f.me,f.prompt,f.codes),null);
});

test('preserves generic policy for wrong Pokemon, phase, prompt type, or validation',()=>{
  const f=fixture([30]);
  f.me.active.getPokemonCard=()=>({fullName:'Mimikyu GRI'});
  assert.equal(prizeWindowDamageMap(f.state,f.me,f.prompt,f.codes),null);
  f.me.active.getPokemonCard=()=>({fullName:'Regidrago VSTAR SIT'});
  f.state.phase=2;
  assert.equal(prizeWindowDamageMap(f.state,f.me,f.prompt,f.codes),null);
  f.state.phase=3;
  f.prompt.damage=50;
  assert.equal(prizeWindowDamageMap(f.state,f.me,f.prompt,f.codes),null);
  f.prompt.damage=60;
  f.prompt.validate=()=>false;
  assert.equal(prizeWindowDamageMap(f.state,f.me,f.prompt,f.codes),null);
});

test('when no possible KO exists, delegates to the generic policy',()=>{
  const f=fixture([70,80]);
  assert.equal(prizeWindowDamageMap(f.state,f.me,f.prompt,f.codes),null);
});

test('pinned Store paid Apex Dragon automatically takes two Bench Knock Outs',
{skip:!fs.existsSync(path.resolve(__dirname,'../vendor/twinleaf/ptcg-server/output/game'))},
()=>{
  const root=path.resolve(__dirname,'../vendor/twinleaf/ptcg-server/output');
  /** @param {string} name */
  const load=name=>require(path.join(root,name));
  const {initializeCards}=require('../simulation/twinleaf/headless.cjs');
  const {preparedRegidrago}=require('../simulation/twinleaf/apex-attack-action.cjs');
  const {spreadAwareCopyResolverClass}=
    require('../simulation/twinleaf/apex-spread-copy-resolver.cjs');
  const {PokemonCardList}=load('game/store/state/pokemon-card-list');
  const {AttackAction}=load('game/store/actions/game-actions');
  const {ChooseAttackPromptResolver}=load(
    'simple-bot/prompt-resolver/choose-attack-prompt-resolver');
  const {PutDamagePromptResolver}=load(
    'simple-bot/prompt-resolver/put-damage-prompt-resolver');
  const {defaultStateScores,allPromptResolvers}=
    load('simple-bot/simple-bot-definitions');
  const manager=initializeCards();
  const get=name=>manager.getCardByName(name);
  const ready=preparedRegidrago();
  ready.attachFire();
  ready.defending.active.cards.length=0;
  ready.defending.active.cards.push(get('Mimikyu PAL'));
  const budews=[];
  for(let i=0;i<2;i++) {
    const budew=get('Budew ASC');
    const slot=new PokemonCardList();
    slot.cards.push(budew);
    ready.defending.bench.push(slot);
    budews.push(budew);
  }
  ready.attacking.discard.cards.push(
    get('Dragapult ex TWM'),get('Hisuian Goodra VSTAR LOR')
  );

  ready.store.dispatch(new AttackAction(ready.attacking.id,'Apex Dragon'));
  const choose=ready.state.prompts.find(p=>
    p.result===undefined && p.constructor.name==='ChooseAttackPrompt');
  assert.ok(choose);
  const baseline=new ChooseAttackPromptResolver({scores:defaultStateScores})
    .resolvePrompt(ready.state,ready.attacking,choose);
  assert.equal(baseline.result.name,'Rolling Iron');
  const Choose=spreadAwareCopyResolverClass();
  const copyChoice=new Choose({scores:defaultStateScores})
    .resolvePrompt(ready.state,ready.attacking,choose);
  assert.equal(copyChoice.result.name,'Phantom Dive');
  ready.store.dispatch(copyChoice);
  const damagePrompt=ready.state.prompts.find(p=>
    p.result===undefined && p.constructor.name==='PutDamagePrompt');
  assert.ok(damagePrompt,'Copied Phantom Dive should request counter allocation');
  const genericDamage=new PutDamagePromptResolver({scores:defaultStateScores})
    .resolvePrompt(ready.state,ready.attacking,damagePrompt);
  assert.ok(genericDamage);
  const Patched=prizeWindowPutDamageResolverClass();
  const recommended=new Patched({scores:defaultStateScores})
    .resolvePrompt(ready.state,ready.attacking,damagePrompt);
  assert.equal(damagePrompt.validate(recommended.result,ready.state),true);
  assert.equal(recommended.result.length,2);
  assert.deepEqual(recommended.result.map(x=>x.damage),[30,30]);
  assert.equal(recommended.result.reduce((sum,row)=>sum+row.damage,0),60);
  const oldCount=ready.attacking.prizes.length;
  ready.store.dispatch(recommended);
  const trace={
    applied:recommended.result,
    discard:ready.defending.discard.cards.map(card=>card.fullName),
    bench:ready.defending.bench.map(slot=>({
      card:slot.getPokemonCard()?.fullName||null,damage:slot.damage,
      cardIds:slot.cards.map(card=>card.id)
    })),
    prizesBefore:oldCount,prizesAfter:ready.attacking.prizes.length,
    phase:ready.state.phase,
    pending:ready.state.prompts.filter(p=>p.result===undefined).map(p=>p.constructor.name)
  };
  assert.ok(budews.every(budew=>ready.defending.discard.cards.includes(budew)),
    'Both 30 HP Benched Budew should actually be Knocked Out by counters: '+JSON.stringify(trace));
  assert.equal(oldCount-ready.attacking.prizes.length,2,
    'Two one-Prize Pokemon should yield two taken Prizes');

  const index=allPromptResolvers.findIndex(
    cls=>cls.name==='PutDamagePromptResolver');
  assert.ok(index>=0);
  const original=allPromptResolvers[index];
  assert.equal(
    withPrizeWindowPutDamageResolver(()=>allPromptResolvers[index].name),
    'PrizeWindowPutDamageResolver'
  );
  assert.equal(allPromptResolvers[index],original);
  assert.throws(()=>withPrizeWindowPutDamageResolver(()=>{
    throw new Error('guarded experiment');
  }),/guarded experiment/);
  assert.equal(allPromptResolvers[index],original);
});
