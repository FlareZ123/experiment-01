'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {buildSourcePrintingMap,projectSourcePrintings,projectAdmittedWorkerParts,wrapSourcePrintedObserver,createCertifiedSourcePrintedHostBridge}=
  require('../../simulation/evaluation/2026-11/agent32-source-printing-bridge.cjs');

const source={cards:[
  {name:'Penny',count:1,printing:{set:'SVI',number:'183'}},
  {name:"Team Rocket's Handiwork",count:1,printing:{set:'FCO',number:'112'}},
  {name:'Psychic Energy',count:58,printing:{set:'SVE',number:'5'}}
]};
const ids=['Penny SVI',"Team Rocket's Handiwork FCO",
  ...Array(58).fill('Psychic Energy SVE')];

for(const seat of [0,1])test('source-60 projection actor seat '+seat,()=>{
  const verified=buildSourcePrintingMap(source,ids);
  const opponent=new Map();
  const maps=seat===0?[verified,opponent]:[opponent,verified];
  const view={actorSeat:seat,ownHand:['Penny SVI'],
    ownPublic:{active:{printing:'Psychic Energy SVE',
      evolutionPrintings:['Psychic Energy SVE'],energies:[],tools:[]},
      bench:[null],stadium:[],discard:[],lostZone:[],resolvingSupporter:[],
      prizeSlots:[{index:0}],publicHand:null},
    opponentPublic:{active:{printing:'Penny SVI',energies:[],tools:[]},
      bench:[null],stadium:[],discard:[],lostZone:[],resolvingSupporter:[],
      prizeSlots:[{index:1}],publicHand:null}};
  const frontier={schema:'fixture',items:[
    {token:'a',kind:'play-card',actorPrinting:'Penny SVI',
      targetPrinting:'Psychic Energy SVE',publicMetadata:{targetSeat:'actor'}},
    {token:'b',kind:'play-card',actorPrinting:'Penny SVI',
      targetPrinting:'Penny SVI',publicMetadata:{targetSeat:'opponent'}}]};
  const after=projectSourcePrintings(view,frontier,maps);
  assert.deepEqual(after.observation.ownHand,['Penny SVI 183']);
  assert.equal(after.observation.ownPublic.active.printing,'Psychic Energy SVE 5');
  assert.equal(after.observation.opponentPublic.active.printing,'Penny SVI');
  assert.equal(after.observation.ownPublic.prizeSlots[0].printing,undefined);
  assert.equal(after.observation.opponentPublic.prizeSlots[0].printing,undefined);
  assert.equal(after.actionFrontier.items[0].actorPrinting,'Penny SVI 183');
  assert.equal(after.actionFrontier.items[0].targetPrinting,'Psychic Energy SVE 5');
  assert.equal(after.actionFrontier.items[1].targetPrinting,'Penny SVI');
  assert.equal(after.actionFrontier.items[0].token,'a');
  assert.equal(view.ownHand[0],'Penny SVI');
  assert.equal(frontier.items[0].actorPrinting,'Penny SVI');
});

test('ambiguous or incomplete source mapping fails closed',()=>{
  assert.throws(()=>buildSourcePrintingMap({cards:source.cards.slice(0,2)},ids),/60/);
  const bad={cards:[
    {name:'Penny',count:1,printing:{set:'SVI',number:'183'}},
    {name:'Penny',count:59,printing:{set:'SVI',number:'999'}}]};
  assert.throws(()=>buildSourcePrintingMap(bad,Array(60).fill('Penny SVI')),
    /ambiguous source printings/);
  const view={actorSeat:0,ownHand:[],ownPublic:null,opponentPublic:null};
  assert.throws(()=>projectSourcePrintings(view,{items:[]},[
    new Map([['Penny SVI','Penny SVI 183']]),new Map()]),
    /nonempty source-printing map must be created/);
});


test('source-projected receipt, prompt and K1 stay shape-safe',()=>{
  const map=buildSourcePrintingMap(source,ids);
  const view={actorSeat:0,ownHand:['Penny SVI'],
    ownPublic:{active:{printing:'Penny SVI',energies:[],tools:[]},bench:[null]},
    opponentPublic:{active:{printing:'Penny SVI'},bench:[]},
    ownerK1:{epoch:2,exactMembershipKnown:true,invalidationReason:null,
      knownPrintings:[{printing:'Penny SVI',copies:1}]}};
  const receipt={ownerActive:{printing:'Penny SVI',knownAbilityUse:[]},
    ownerBench:[null],opponentLastTurnAttacks:null};
  const prompt={source:{sourcePrinting:'Penny SVI',effectName:'Penny',
    sourceKind:'card-effect'},choices:[{kind:'card',token:'a',printing:'Penny SVI',
      publicMetadata:{ownerSeat:'actor'}}],
    publicMetadata:{selectionType:'card-combination',ownerSeat:'actor'}};
  const frontier={schema:'fixture',items:[{kind:'play-card',token:'a',
    actorPrinting:'Penny SVI',publicMetadata:{cardType:'trainer'}}]};
  const projected=projectSourcePrintings(view,frontier,[map,new Map()],{
    prompt,publicEventReceipt:receipt});
  assert.equal(projected.observation.ownPublic.active.printing,
    projected.publicEventReceipt.ownerActive.printing);
  assert.equal(projected.observation.ownerK1.knownPrintings[0].printing,'Penny SVI 183');
  assert.equal(projected.prompt.source.sourcePrinting,'Penny SVI 183');
  assert.equal(projected.prompt.choices[0].printing,'Penny SVI 183');
  assert.equal(projected.actionFrontier.items[0].actorPrinting,'Penny SVI 183');
  assert.equal(Object.hasOwn(projected.publicEventReceipt,'opponentCopycatChoices'),false);
  assert.equal(Object.hasOwn(projected.prompt.source,'copiedSourcePrinting'),false);
  assert.equal(Object.hasOwn(projected.prompt.publicMetadata,'sourcePrinting'),false);
  assert.equal(Object.hasOwn(projected.prompt.choices[0].publicMetadata,'sourcePrinting'),false);
  assert.equal(Object.hasOwn(projected.actionFrontier.items[0].publicMetadata,'sourceCardFullName'),false);
  assert.equal(view.ownPublic.active.printing,'Penny SVI');
  assert.equal(receipt.ownerActive.printing,'Penny SVI');
  assert.equal(prompt.source.sourcePrinting,'Penny SVI');
});

test('ambiguous origin retains native identity and Night Watch fails closed',()=>{
  const map=buildSourcePrintingMap(source,ids);
  const otherSource={cards:[
    {name:'Penny',count:1,printing:{set:'SVI',number:'999'}},
    {name:'Psychic Energy',count:59,printing:{set:'SVE',number:'5'}}]};
  const otherMap=buildSourcePrintingMap(otherSource,
    ['Penny SVI',...Array(59).fill('Psychic Energy SVE')]);
  const view={actorSeat:0,ownHand:[],ownPublic:null,opponentPublic:null};
  const prompt={source:{sourcePrinting:'Penny SVI',effectName:'Penny',
    sourceKind:'card-effect'},choices:[],publicMetadata:{selectionType:'pokemon'}};
  const after=projectSourcePrintings(view,null,[map,otherMap],{prompt});
  assert.equal(after.prompt.source.sourcePrinting,'Penny SVI');
  const nightWatch={...prompt,source:{...prompt.source,
    sourcePrinting:'Trevenant & Dusknoir-GX SMP',effectName:'Night Watch'}};
  assert.throws(()=>projectSourcePrintings(view,null,[map,otherMap],
    {prompt:nightWatch}),/HOST_ONLY_PHYSICAL_PROMPT/);
});


test('certified map is fail-closed against post-build mutations',()=>{
  const m=buildSourcePrintingMap(source,ids);
  const view={actorSeat:0,ownHand:['Penny SVI'],ownPublic:null,
    opponentPublic:null};
  assert.equal(projectSourcePrintings(view,null,[m,new Map()])
    .observation.ownHand[0],'Penny SVI 183');
  m.set('Penny SVI','INJECTED_CARD_NAME');
  assert.throws(()=>projectSourcePrintings(view,null,[m,new Map()]),
    /nonempty source-printing map must be created/);
  m.set('Penny SVI','Penny SVI 183');
  assert.equal(projectSourcePrintings(view,null,[m,new Map()])
    .observation.ownHand[0],'Penny SVI 183');
  m.set('Forged Native','Penny SVI 183');
  assert.throws(()=>projectSourcePrintings(view,null,[m,new Map()]),
    /nonempty source-printing map must be created/);
});


test('visible ability suppression source is unique or stays native',()=>{
  const ours=buildSourcePrintingMap(source,ids);
  const otherSource={cards:[
    {name:'Penny',count:1,printing:{set:'SVI',number:'999'}},
    {name:'Psychic Energy',count:59,printing:{set:'SVE',number:'5'}}]};
  const other=buildSourcePrintingMap(otherSource,
    ['Penny SVI',...Array(59).fill('Psychic Energy SVE')]);
  const p={printing:'Penny SVI',abilitySuppressions:[
    {abilityName:'Lock',suppressed:true,reasonCode:'TEST',sourcePrinting:'Penny SVI'},
    {abilityName:'Lock2',suppressed:true,reasonCode:'TEST',sourcePrinting:'Psychic Energy SVE'}]};
  const view={actorSeat:0,ownHand:[],ownPublic:{active:p,bench:[]},opponentPublic:null};
  const out=projectSourcePrintings(view,null,[ours,other]);
  assert.equal(out.observation.ownPublic.active.abilitySuppressions[0].sourcePrinting,
    'Penny SVI','conflicting source IDs must not be guessed');
  assert.equal(out.observation.ownPublic.active.abilitySuppressions[1].sourcePrinting,
    'Psychic Energy SVE 5');
  assert.equal(out.observation.ownPublic.active.printing,'Penny SVI 183');
  assert.equal(p.abilitySuppressions[0].sourcePrinting,'Penny SVI');
});


test('admission wrapper validates both native and projected views before worker SHA',()=>{
  const map=buildSourcePrintingMap(source,ids);
  const order=[];
  const policy={
    validateActorObservation(view,seat){
      order.push('view-'+view.ownHand[0]);
      assert.equal(view.actorSeat,seat);
      assert.equal(view.untrustedExtra,undefined);
    },
    validatePrompt(prompt,seat){order.push('prompt');assert.equal(prompt,null);},
    validatePublicEventReceipt(receipt){order.push('receipt');assert.equal(receipt,null);},
    validateFrontier(frontier){
      order.push('frontier-'+frontier.items[0].actorPrinting);
      return new Set(frontier.items.map(a=>a.token));
    }
  };
  const parts={
    observation:{actorSeat:0,ownHand:['Penny SVI'],ownPublic:null,opponentPublic:null},
    prompt:null,publicEventReceipt:null,
    actionFrontier:{items:[{token:'native-0',kind:'play-card',
      actorPrinting:'Penny SVI',publicMetadata:{}}]}
  };
  const mapped=projectAdmittedWorkerParts(parts,[map,new Map()],policy);
  assert.deepEqual(order,[
    'view-Penny SVI','prompt','receipt','frontier-Penny SVI',
    'view-Penny SVI 183','prompt','receipt','frontier-Penny SVI 183'
  ]);
  assert.deepEqual(mapped.actionFrontier.items.map(x=>x.token),['native-0']);
  assert.throws(()=>projectAdmittedWorkerParts({...parts,
    observation:{...parts.observation,untrustedExtra:'secret'}},
    [map,new Map()],policy));
});


test('Copycat copied Night Watch is host-only before or after source relabel',()=>{
  const map=buildSourcePrintingMap(source,ids);
  const view={actorSeat:0,ownHand:[],ownPublic:null,opponentPublic:null};
  for(const copiedSourcePrinting of [
    'Trevenant & Dusknoir-GX SMP',
    'Trevenant & Dusknoir-GX SMP 54'
  ]){
    const prompt={source:{sourceKind:'card-effect',
      sourcePrinting:'Mimikyu GRI',effectName:'Copycat',
      copiedSourcePrinting,copiedAttackName:'Night Watch'},
      choices:[],publicMetadata:{selectionType:'card-combination'}};
    assert.throws(()=>projectSourcePrintings(view,null,[map,new Map()],{prompt}),
      /HOST_ONLY_PHYSICAL_PROMPT/);
  }
  const nonNightWatch={source:{sourceKind:'card-effect',
    sourcePrinting:'Mimikyu GRI',effectName:'Copycat',
    copiedSourcePrinting:'Trevenant & Dusknoir-GX SMP',
    copiedAttackName:'Poltergeist'},
    choices:[],publicMetadata:{selectionType:'card-combination'}};
  assert.equal(projectSourcePrintings(view,null,[map,new Map()],{
    prompt:nonNightWatch}).prompt.source.copiedAttackName,'Poltergeist');
});


test('native pass and optional prompt choices keep exact JSON key sets',()=>{
  const map=buildSourcePrintingMap(source,ids);
  const view={actorSeat:0,ownHand:[],ownPublic:null,opponentPublic:null};
  const frontier={schema:'fixture',items:[
    {token:'pass',kind:'pass'},
    {token:'attack',kind:'attack',attackName:'Attack Name'},
    {token:'penny',kind:'play-card',actorPrinting:'Penny SVI'}
  ]};
  const prompt={source:{sourceKind:'card-effect',sourcePrinting:'Penny SVI',
    effectName:'Penny'},choices:[
      {token:'empty',kind:'empty-selection',label:'Choose no items'},
      {token:'target',kind:'pokemon',printing:'Penny SVI',
        publicMetadata:{ownerSeat:'actor'}}],
    publicMetadata:{selectionType:'pokemon'}};
  const after=projectSourcePrintings(view,frontier,[map,new Map()],{prompt});
  assert.deepEqual(after.actionFrontier.items[0],{token:'pass',kind:'pass'});
  assert.deepEqual(after.actionFrontier.items[1],
    {token:'attack',kind:'attack',attackName:'Attack Name'});
  assert.deepEqual(after.actionFrontier.items[2],
    {token:'penny',kind:'play-card',actorPrinting:'Penny SVI 183'});
  assert.deepEqual(after.prompt.choices[0],
    {token:'empty',kind:'empty-selection',label:'Choose no items'});
  assert.deepEqual(after.prompt.choices[1],
    {token:'target',kind:'pokemon',printing:'Penny SVI 183',
      publicMetadata:{ownerSeat:'actor'}});
  const rejectNonJson=value=>{
    if(value===undefined)throw new Error('undefined property');
    if(Array.isArray(value))return value.forEach(rejectNonJson);
    if(value&&typeof value==='object')
      return Object.values(value).forEach(rejectNonJson);
  };
  assert.doesNotThrow(()=>rejectNonJson(after.prompt));
  assert.doesNotThrow(()=>rejectNonJson(after.actionFrontier));
});


test('two complete source 60 maps retain different printings in opposite seats',()=>{
  const a=buildSourcePrintingMap(source,ids);
  const opponentSource={cards:[
    {name:'Penny',count:1,printing:{set:'SVI',number:'999'}},
    {name:'Psychic Energy',count:59,printing:{set:'SVE',number:'5'}}]};
  const b=buildSourcePrintingMap(opponentSource,
    ['Penny SVI',...Array(59).fill('Psychic Energy SVE')]);
  for(const seat of [0,1]){
    const own=seat===0?a:b,other=seat===0?b:a;
    const observed={actorSeat:seat,ownHand:['Penny SVI'],
      ownPublic:{active:{printing:'Penny SVI'},bench:[],
        prizeSlots:[{index:0}]},
      opponentPublic:{active:{printing:'Penny SVI'},bench:[],
        publicHand:null,prizeSlots:[{index:1}]}};
    const receipt={ownerActive:{printing:'Penny SVI'},ownerBench:[],
      opponentLastTurnAttacks:null};
    const result=projectSourcePrintings(observed,{items:[]},
      [a,b],{publicEventReceipt:receipt});
    assert.equal(result.observation.ownPublic.active.printing,
      own.get('Penny SVI'));
    assert.equal(result.observation.opponentPublic.active.printing,
      other.get('Penny SVI'));
    assert.notEqual(result.observation.ownPublic.active.printing,
      result.observation.opponentPublic.active.printing);
    assert.equal(result.publicEventReceipt.ownerActive.printing,
      result.observation.ownPublic.active.printing);
    assert.equal(result.observation.opponentPublic.publicHand,null);
    assert.equal(result.observation.opponentPublic.prizeSlots[0].printing,
      undefined);
  }
});


test('native attack-source and cross-seat targets preserve exact owner provenance',()=>{
  const mine=buildSourcePrintingMap(source,ids);
  const opponentSource={cards:[
    {name:'Penny',count:1,printing:{set:'SVI',number:'999'}},
    {name:'Psychic Energy',count:59,printing:{set:'SVE',number:'5'}}]};
  const other=buildSourcePrintingMap(opponentSource,
    ['Penny SVI',...Array(59).fill('Psychic Energy SVE')]);
  const observation={actorSeat:1,ownHand:[],ownPublic:null,opponentPublic:null};
  const original={schema:'fixture',items:[
    {token:'attack',kind:'attack',actorPrinting:'Penny SVI',attackName:'Copycat',
      publicMetadata:{attackSource:{sourceKind:'active-pokemon',
        sourceSlot:'ACTIVE',sourceIndex:0,sourceCardName:'Penny',
        sourceCardFullName:'Penny SVI',attackName:'Copycat'},
        priorSourcePrinting:'Penny SVI'}},
    {token:'op-target',kind:'play-card',actorPrinting:'Penny SVI',
      targetPrinting:'Penny SVI',
      publicMetadata:{targetSeat:'opponent',targetZone:'active'}},
    {token:'own-target',kind:'play-card',actorPrinting:'Penny SVI',
      targetPrinting:'Penny SVI',
      publicMetadata:{targetSeat:'actor',targetZone:'bench'}}
  ]};
  const mapped=projectSourcePrintings(observation,original,[other,mine]);
  const [attack,opponentTarget,ownTarget]=mapped.actionFrontier.items;
  assert.equal(attack.actorPrinting,'Penny SVI 183');
  assert.equal(attack.publicMetadata.attackSource.sourceCardFullName,'Penny SVI 183');
  assert.equal(attack.publicMetadata.attackSource.sourceSlot,'ACTIVE');
  assert.equal(attack.publicMetadata.priorSourcePrinting,'Penny SVI 999');
  assert.equal(opponentTarget.actorPrinting,'Penny SVI 183');
  assert.equal(opponentTarget.targetPrinting,'Penny SVI 999');
  assert.equal(ownTarget.targetPrinting,'Penny SVI 183');
  assert.deepEqual(mapped.actionFrontier.items.map(x=>x.token),
    original.items.map(x=>x.token));
  assert.equal(original.items[0].publicMetadata.attackSource.sourceCardFullName,
    'Penny SVI');
});


test('native.observe source wrapper seals frozen view before driver digest',()=>{
  const {createHash}=require('node:crypto');
  const sha=value=>createHash('sha256').update(JSON.stringify(value)).digest('hex');
  const mine=buildSourcePrintingMap(source,ids);
  const raw={actorSeat:0,ownHand:['Penny SVI'],
    ownPublic:{active:{printing:'Penny SVI'},bench:[],
      prizeSlots:[{index:0}]},opponentPublic:null};
  const validator={validateActorObservation(view,seat){
    assert.equal(view.actorSeat,seat);
    assert.equal(view.ownPublic.prizeSlots[0].printing,undefined);
    return view;
  }};
  let calls=0;
  const native={observe(state,seat){
    calls++;
    assert.equal(state.stage,'fixture');
    assert.equal(seat,0);
    return raw;
  },sentinel:42};
  const wrapped=wrapSourcePrintedObserver(native,[mine,new Map()],validator);
  const observation=wrapped.observe({stage:'fixture'},0);
  assert.equal(calls,1);
  assert.equal(wrapped.sentinel,42);
  assert.notStrictEqual(observation,raw);
  assert.equal(observation.ownHand[0],'Penny SVI 183');
  assert.equal(observation.ownPublic.active.printing,'Penny SVI 183');
  assert.equal(raw.ownPublic.active.printing,'Penny SVI');
  assert.equal(Object.isFrozen(observation),true);
  assert.equal(Object.isFrozen(observation.ownPublic.active),true);
  assert.equal(Object.isFrozen(raw.ownPublic.active),false);
  const driverSha=sha(observation);
  const later=projectSourcePrintings(observation,{schema:'fixture',items:[]},
    [mine,new Map()]).observation;
  assert.equal(sha(later),driverSha,
    'later frontier/receipt projection must not mutate the driver actor SHA');
  assert.equal(wrapped.observe({stage:'fixture'},0).ownHand[0],
    observation.ownHand[0]);
  assert.equal(calls,2);
});


test('single two-seat adapter binds frozen driver SHA to exact projected worker input',()=>{
  const {createHash}=require('node:crypto');
  const hash=v=>createHash('sha256').update(JSON.stringify(v)).digest('hex');
  const otherDeck={cards:[
    {name:'Penny',count:1,printing:{set:'SVI',number:'999'}},
    {name:'Psychic Energy',count:59,printing:{set:'SVE',number:'5'}}]};
  const otherIds=['Penny SVI',...Array(59).fill('Psychic Energy SVE')];
  const checks=[];
  const strict={
    validateActorObservation(value,seat){
      checks.push('view');
      assert.equal(value.actorSeat,seat);
    },
    validatePrompt(value){checks.push('prompt');assert.equal(value,null);},
    validatePublicEventReceipt(value){checks.push('receipt');assert.equal(value,null);},
    validateFrontier(value){
      checks.push('frontier');
      assert.equal(value.schema,'fixture');
      return new Set(value.items.map(item=>item.token));
    }
  };
  const mockNative={observe(_state,seat){
    return {actorSeat:seat,ownHand:['Penny SVI'],
      ownPublic:{active:{printing:'Penny SVI'},bench:[]},
      opponentPublic:{active:{printing:'Penny SVI'},bench:[]}};
  }};
  const bridge=createCertifiedSourcePrintedHostBridge({
    native:mockNative,protocol:strict,
    sourceDecksBySeat:[source,otherDeck],
    nativeOrdered60BySeat:[ids,otherIds]
  });
  assert.equal(Object.isFrozen(bridge),true);
  for(const seat of [0,1]){
    const observed=bridge.native.observe({},seat);
    const firstSha=hash(observed);
    const packet=bridge.projectWorkerParts({observation:observed,
      prompt:null,publicEventReceipt:null,
      actionFrontier:{schema:'fixture',items:[
        {token:'a0',kind:'play-card',actorPrinting:'Penny SVI'},
        {token:'a1',kind:'pass'}
      ]}});
    assert.equal(hash(packet.observation),firstSha,
      'worker sees exactly the same observation content as driver ledger');
    assert.deepEqual(packet.actionFrontier.items.map(x=>x.token),['a0','a1']);
    assert.equal(packet.observation.ownHand[0],
      seat===0?'Penny SVI 183':'Penny SVI 999');
    assert.equal(packet.observation.opponentPublic.active.printing,
      seat===0?'Penny SVI 999':'Penny SVI 183');
    assert.equal(packet.actionFrontier.items[0].actorPrinting,
      packet.observation.ownHand[0]);
  }
  assert.ok(checks.length>=16);
  assert.throws(()=>createCertifiedSourcePrintedHostBridge({
    native:mockNative,protocol:strict,
    sourceDecksBySeat:[source,otherDeck],
    nativeOrdered60BySeat:[ids,ids.slice(0,59)]
  }),/60/);
});
