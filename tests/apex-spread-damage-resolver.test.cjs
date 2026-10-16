'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {
  nominalKnockoutPrizes,
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

test('pinned tag and KO-slot rules produce nominal one-, two-, and three-Prize values',()=>{
  const pokemon=tags=>({tags});
  assert.equal(nominalKnockoutPrizes(pokemon([]),{}),1);
  assert.equal(nominalKnockoutPrizes(pokemon(['VSTAR']),{}),2);
  assert.equal(nominalKnockoutPrizes(pokemon(['ex']),{}),2);
  assert.equal(nominalKnockoutPrizes(pokemon(['VMAX']),{}),3);
  assert.equal(nominalKnockoutPrizes(pokemon(['GX','Tag Team']),{}),3);
  assert.equal(nominalKnockoutPrizes(pokemon(['GX','Tag Team']),{
    denyPrizesIfKnockedOutNextTurn:true,
    denyPrizesIfKnockedOutNextTurnPending:false
  }),0);
  assert.equal(nominalKnockoutPrizes(pokemon(['V']),{
    extraPrizesIfKnockedOutNextTurn:1,
    extraPrizesIfKnockedOutNextTurnPending:false
  }),3);
  assert.equal(nominalKnockoutPrizes(pokemon(['V']),{
    extraPrizesIfKnockedOutNextTurn:1,
    extraPrizesIfKnockedOutNextTurnPending:true
  }),2);
});

test('selects three-Prize VMAX KO ahead of two exposed single-Prize KOs',()=>{
  const f=fixture([30,30,50]);
  f.opponent.bench[2].getPokemonCard=()=>({
    hp:100,powers:[],tags:['VMAX']
  });
  const allocation=prizeWindowDamageMap(f.state,f.me,f.prompt,f.codes);
  assert.equal(allocation.find(row=>row.target.index===2)?.damage,50);
  assert.equal(allocation.reduce((sum,row)=>sum+row.damage,0),60);
  assert.equal(allocation.filter(row=>row.target.index!==2).length,1);
  assert.equal(allocation.find(row=>row.target.index!==2).damage,10);
});

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

test('effect-blocking attached Energy is excluded as a certain counter KO',()=>{
  const f=fixture([30,30]);
  f.opponent.bench[0].cards=[{name:'Mist Energy'}];
  const result=prizeWindowDamageMap(f.state,f.me,f.prompt,f.codes);
  assert.ok(result);
  assert.equal(result.find(row=>row.target.index===1)?.damage,30);
  assert.equal(result.reduce((sum,row)=>sum+row.damage,0),60);
  f.opponent.bench[1].cards=[{name:'Wonder Energy'}];
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

test('distributes counters into a legal knockout despite sub-60 per-target caps',()=>{
  const f=fixture([10,100]);
  f.prompt.maxAllowedDamage[0].damage=30;
  f.prompt.maxAllowedDamage[1].damage=30;
  assert.deepEqual(prizeWindowDamageMap(f.state,f.me,f.prompt,f.codes),[
    {target:{player:2,slot:4,index:0},damage:30},
    {target:{player:2,slot:4,index:1},damage:30}
  ]);
});

test('avoids unnecessary KO overkill when another target can receive counters',()=>{
  const f=fixture([10,100]);
  f.prompt.maxAllowedDamage[0].damage=30;
  f.prompt.maxAllowedDamage[1].damage=60;
  assert.deepEqual(prizeWindowDamageMap(f.state,f.me,f.prompt,f.codes),[
    {target:{player:2,slot:4,index:0},damage:10},
    {target:{player:2,slot:4,index:1},damage:50}
  ]);
});

test('searches valid lower-priority allocations if the best proposal is invalid',()=>{
  const f=fixture([20,30]);
  f.prompt.validate=map=>map.reduce((sum,row)=>sum+row.damage,0)===60 &&
    map.every(row=>row.target.index!==1);
  assert.deepEqual(prizeWindowDamageMap(f.state,f.me,f.prompt,f.codes),[
    {target:{player:2,slot:4,index:0},damage:60}
  ]);
});

test('pinned Store rank-15 board allows two Bench Knock Outs while Pidgeot survives',
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
  // All these printed Pokemon occur together in Aichi rank 15.
  ready.defending.active.cards.push(
    get('Pidgey FLF'),get('Pidgeotto TEU'),get('Pidgeot ex OBF')
  );
  assert.ok(ready.defending.active.getPokemonCard()?.hp>200);
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
  const oldCount=ready.attacking.getPrizeLeft();
  ready.store.dispatch(recommended);
  const {ResolvePromptAction}=load('game/store/actions/resolve-prompt-action');
  const {ChoosePrizePromptResolver}=load(
    'simple-bot/prompt-resolver/choose-prize-prompt-resolver');
  const prizeResolver=new ChoosePrizePromptResolver({scores:defaultStateScores});
  // A real game completes animation prompts, then chooses Prize cards.
  // The copied attack and counter allocation are already committed here.
  const resolvedPrompts=[];
  for(let i=0;i<12;i++) {
    const pending=ready.state.prompts.find(p=>p.result===undefined);
    if(pending?.constructor.name==='WaitPrompt') {
      ready.store.dispatch(new ResolvePromptAction(pending.id,null));
    } else if(pending?.constructor.name==='ChoosePrizePrompt') {
      const chooser=ready.state.players.find(p=>p.id===pending.playerId);
      assert.ok(chooser);
      const chosen=prizeResolver.resolvePrompt(ready.state,chooser,pending);
      assert.ok(chosen);
      ready.store.dispatch(chosen);
    } else {
      break;
    }
    resolvedPrompts.push(pending.constructor.name);
  }
  const trace={
    applied:recommended.result,resolvedPrompts,
    discard:ready.defending.discard.cards.map(card=>card.fullName),
    bench:ready.defending.bench.map(slot=>({
      card:slot.getPokemonCard()?.fullName||null,damage:slot.damage,
      cardIds:slot.cards.map(card=>card.id)
    })),
    prizesBefore:oldCount,prizesAfter:ready.attacking.getPrizeLeft(),
    phase:ready.state.phase,
    pending:ready.state.prompts.filter(p=>p.result===undefined).map(p=>p.constructor.name)
  };
  assert.ok(budews.every(budew=>ready.defending.discard.cards.includes(budew)),
    'Both 30 HP Benched Budew should actually be Knocked Out by counters: '+JSON.stringify(trace));
  assert.equal(oldCount-ready.attacking.getPrizeLeft(),2,
    'Two one-Prize Pokemon should yield two taken Prizes: '+JSON.stringify(trace));

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

test('pinned rank-15 Mega Lopunny ex Bench KO takes three actual Prizes',
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
  const {ResolvePromptAction}=load('game/store/actions/resolve-prompt-action');
  const {ChoosePrizePromptResolver}=load(
    'simple-bot/prompt-resolver/choose-prize-prompt-resolver');
  const {defaultStateScores}=load('simple-bot/simple-bot-definitions');
  const manager=initializeCards();
  const get=name=>manager.getCardByName(name);
  const ready=preparedRegidrago();
  ready.attachFire();
  ready.defending.active.cards.length=0;
  ready.defending.active.cards.push(
    get('Pidgey FLF'),get('Pidgeotto TEU'),get('Pidgeot ex OBF')
  );
  const mega=new PokemonCardList();
  const base=get('Buneary M2');
  const evolved=get('Mega Lopunny ex M2');
  assert.ok(base && evolved);
  mega.cards.push(base,evolved);
  mega.damage=280; // 330 HP, leaving 50 HP.
  const budews=[];
  for(let i=0;i<2;i++) {
    const slot=new PokemonCardList();
    const budew=get('Budew ASC');
    slot.cards.push(budew);
    ready.defending.bench.push(slot);
    budews.push(budew);
  }
  ready.defending.bench.push(mega);
  ready.attacking.discard.cards.push(
    get('Dragapult ex TWM'),get('Hisuian Goodra VSTAR LOR')
  );
  assert.equal(nominalKnockoutPrizes(evolved,mega),3);
  const before=ready.attacking.getPrizeLeft();
  ready.store.dispatch(new AttackAction(ready.attacking.id,'Apex Dragon'));
  const choose=ready.state.prompts.find(p=>
    p.result===undefined && p.constructor.name==='ChooseAttackPrompt');
  assert.ok(choose);
  const Choice=spreadAwareCopyResolverClass();
  const picked=new Choice({scores:defaultStateScores})
    .resolvePrompt(ready.state,ready.attacking,choose);
  assert.equal(picked.result.name,'Phantom Dive');
  ready.store.dispatch(picked);
  const damage=ready.state.prompts.find(p=>
    p.result===undefined && p.constructor.name==='PutDamagePrompt');
  assert.ok(damage);
  const Resolver=prizeWindowPutDamageResolverClass();
  const move=new Resolver({scores:defaultStateScores})
    .resolvePrompt(ready.state,ready.attacking,damage);
  assert.equal(damage.validate(move.result,ready.state),true);
  assert.equal(move.result.find(row=>row.target.index===2)?.damage,50);
  assert.equal(move.result.reduce((sum,row)=>sum+row.damage,0),60);
  ready.store.dispatch(move);
  const prizeResolver=new ChoosePrizePromptResolver({scores:defaultStateScores});
  for(let i=0;i<12;i++) {
    const pending=ready.state.prompts.find(p=>p.result===undefined);
    if(pending?.constructor.name==='WaitPrompt') {
      ready.store.dispatch(new ResolvePromptAction(pending.id,null));
    } else if(pending?.constructor.name==='ChoosePrizePrompt') {
      const chooser=ready.state.players.find(p=>p.id===pending.playerId);
      ready.store.dispatch(prizeResolver.resolvePrompt(ready.state,chooser,pending));
    } else break;
  }
  assert.ok(ready.defending.discard.cards.includes(evolved),
    'Mega Lopunny ex must be Knocked Out by five counters');
  assert.ok(budews.every(card=>!ready.defending.discard.cards.includes(card)));
  assert.equal(before-ready.attacking.getPrizeLeft(),3);
});

test('pinned Mist Energy prevents opponent attack counter placement',
{skip:!fs.existsSync(path.resolve(__dirname,'../vendor/twinleaf/ptcg-server/output/game'))},
()=>{
  const root=path.resolve(__dirname,'../vendor/twinleaf/ptcg-server/output');
  /** @param {string} name */
  const load=name=>require(path.join(root,name));
  const {initializeCards}=require('../simulation/twinleaf/headless.cjs');
  const {preparedRegidrago}=require('../simulation/twinleaf/apex-attack-action.cjs');
  const {PokemonCardList}=load('game/store/state/pokemon-card-list');
  const {AttackAction}=load('game/store/actions/game-actions');
  const {ResolvePromptAction}=load('game/store/actions/resolve-prompt-action');
  const {ChoosePrizePromptResolver}=load(
    'simple-bot/prompt-resolver/choose-prize-prompt-resolver');
  const {SlotType}=load('game/store/actions/play-card-action');
  const {defaultStateScores}=load('simple-bot/simple-bot-definitions');
  const get=initializeCards().getCardByName;
  const ready=preparedRegidrago();
  ready.attachFire();
  ready.defending.active.cards.length=0;
  ready.defending.active.cards.push(
    get('Pidgey FLF'),get('Pidgeotto TEU'),get('Pidgeot ex OBF')
  );
  const protectedBudew=get('Budew ASC');
  const ordinaryBudew=get('Budew ASC');
  const protectedSlot=new PokemonCardList();
  const ordinarySlot=new PokemonCardList();
  protectedSlot.cards.push(protectedBudew,get('Mist Energy TEF'));
  ordinarySlot.cards.push(ordinaryBudew);
  ready.defending.bench.push(protectedSlot,ordinarySlot);
  ready.attacking.discard.cards.push(get('Dragapult ex TWM'));
  const before=ready.attacking.getPrizeLeft();
  ready.store.dispatch(new AttackAction(ready.attacking.id,'Apex Dragon'));
  const choose=ready.state.prompts.find(p=>
    p.result===undefined && p.constructor.name==='ChooseAttackPrompt');
  assert.ok(choose);
  const copy=choose.cards.flatMap(card=>card.attacks)
    .find(attack=>attack.name==='Phantom Dive');
  assert.ok(copy);
  assert.equal(choose.validate(copy),true);
  ready.store.dispatch(new ResolvePromptAction(choose.id,copy));
  const prompt=ready.state.prompts.find(p=>
    p.result===undefined && p.constructor.name==='PutDamagePrompt');
  assert.ok(prompt);
  const targets=prompt.maxAllowedDamage.filter(row=>
    row.target.slot===SlotType.BENCH).slice(0,2)
    .map(row=>({target:row.target,damage:30}));
  assert.equal(targets.length,2);
  assert.equal(prompt.validate(targets,ready.state),true);
  ready.store.dispatch(new ResolvePromptAction(prompt.id,targets));
  const prizeResolver=new ChoosePrizePromptResolver({scores:defaultStateScores});
  for(let i=0;i<12;i++) {
    const pending=ready.state.prompts.find(p=>p.result===undefined);
    if(pending?.constructor.name==='WaitPrompt') {
      ready.store.dispatch(new ResolvePromptAction(pending.id,null));
    } else if(pending?.constructor.name==='ChoosePrizePrompt') {
      const chooser=ready.state.players.find(p=>p.id===pending.playerId);
      ready.store.dispatch(prizeResolver.resolvePrompt(ready.state,chooser,pending));
    } else break;
  }
  assert.equal(protectedSlot.damage,0);
  assert.ok(!ready.defending.discard.cards.includes(protectedBudew));
  assert.ok(ready.defending.discard.cards.includes(ordinaryBudew));
  assert.equal(before-ready.attacking.getPrizeLeft(),1);
});
