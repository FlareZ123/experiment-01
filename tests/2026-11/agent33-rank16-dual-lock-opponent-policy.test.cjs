'use strict';
/* Dev-only actor-projection decisions. These cases are not native-Store or games. */
const test = require('node:test');
const assert = require('node:assert/strict');
const worker = require('../../simulation/evaluation/2026-11/agent33-rank16-absol-garbodor-dual-lock-opponent-policy.cjs');

const P = {
  garbLTR: 'Garbodor LTR 68', garbBKP: 'Garbodor BKP 57',
  trubbish: 'Trubbish CRI 56', budew: 'Budew ASC 16',
  absol: 'Mega Absol ex MEG 86', crobat: 'Crobat V DAA 104',
  float: 'Float Stone BKT 137', muscle: 'Muscle Band XY 121'
};
const poke = (printing, tools = [], energies = []) =>
  ({ printing, hp: 200, damage: 0, tools, energies, printed: { subtypes: ['Basic'] } });
const action = (kind, token, options = {}) => ({ kind, token, ...options });
const tool = (printing = P.float) => ({ printing });
function state(seat = 0, options = {}) {
  const own = {
    active: poke(P.absol),
    bench: [poke(P.garbLTR), poke(P.budew)],
    stadium: [], discard: [], deckCount: 32,
    publicTurnRestrictions: {}, ...options.ownPublic
  };
  return {
    role: 'opponent', seat, prompt: options.prompt ?? null,
    observation: {
      actorSeat: options.actorSeat ?? seat, globalTurn: options.globalTurn ?? 4,
      ownHand: options.ownHand ?? [],
      ownPublic: own,
      opponentPublic: options.opponentPublic ?? {
        active: poke('Shadow Rider Calyrex VMAX CRE 75'),
        bench: [], stadium: [], discard: [], deckCount: 30, prizeCount: 6
      },
      ownTurnResources: {
        supporterPlayedTurn: 0, vstarUsed: false, ...options.ownTurnResources
      }
    },
    actionFrontier: { items: options.items ?? [action('pass', 'pass')] }
  };
}
function decide(request) {
  return worker.createPolicy({
    role: 'opponent', seat: request.seat, policyVersion: worker.POLICY_VERSION, config: {}
  }).decide(request);
}
function toolChoices() {
  return [
    { token: 'g', printing: P.garbBKP, publicMetadata: {
      ownerSeat: 'actor', targetZone: 'bench', benchIndex: 0 } },
    { token: 'm', printing: P.absol, publicMetadata: {
      ownerSeat: 'actor', targetZone: 'bench', benchIndex: 1 } }
  ];
}
for (const seat of [0, 1]) {
  test('rank16 exact original 60 inventory is bound in seat ' + seat, () => {
    assert.equal(worker.SOURCE_RANK, 16);
    assert.equal(worker.SOURCE_LIST_BLOB_SHA1, 'ae773f6201d7aa69d31914dbfee66f3fba692200');
    assert.equal(worker.SOURCE_INVENTORY.reduce((sum, entry) => sum + entry[1], 0), 60);
    assert.equal(worker.SOURCE_INVENTORY.find(entry => entry[0] === 'Garbodor BKP 57')[1], 1);
    assert.equal(worker.SOURCE_INVENTORY.find(entry => entry[0] === 'Budew ASC 16')[1], 2);
    assert.equal(worker.SOURCE_INVENTORY.some(entry => /Tapu Koko|Lightning Energy|Roxanne/.test(entry[0])), false);
  });
  test('use own Dark Asset before Tool-bearing Garbotoxin seat ' + seat, () => {
    const request = state(seat, { items: [
      action('play-card', 'equip', { actorPrinting: P.float, targetPrinting: P.garbLTR }),
      action('use-ability', 'draw', { publicMetadata: { abilityName: 'Dark Asset' } }),
      action('pass', 'pass') ] });
    assert.deepEqual(decide(request), { kind: 'select-action', token: 'draw' });
  });
  test('equip source Garbodor after setup no longer offered seat ' + seat, () => {
    const request = state(seat, { items: [
      action('play-card', 'equip', { actorPrinting: P.float, targetPrinting: P.garbLTR }),
      action('pass', 'pass') ] });
    assert.deepEqual(decide(request), { kind: 'select-action', token: 'equip' });
  });
  test('completed Tool + Active Budew chooses Itchy Pollen seat ' + seat, () => {
    const request = state(seat, { ownPublic: {
      active: poke(P.budew), bench: [poke(P.garbBKP, [tool()])] }, items: [
      action('attack', 'pollen', { attackName: 'Itchy Pollen',
        publicMetadata: { attackCostPayable: true } }), action('pass', 'pass') ] });
    assert.deepEqual(decide(request), { kind: 'select-action', token: 'pollen' });
  });
  test('with live Bench lock, move Budew Active when retreat genuinely offered seat ' + seat, () => {
    const request = state(seat, { ownPublic: { bench: [
      poke(P.garbLTR, [tool()]), poke(P.budew)] }, items: [
      action('retreat', 'retreat-budew', { targetPrinting: P.budew }),
      action('pass', 'pass') ] });
    assert.deepEqual(decide(request), { kind: 'select-action', token: 'retreat-budew' });
  });
  test('do not chase phantom dual lock through array-valued Jamming Tower seat ' + seat, () => {
    const request = state(seat, { ownPublic: {
      bench: [poke(P.garbLTR, [tool()]), poke(P.budew)],
      stadium: [{ printing: 'Jamming Tower TWM 153' }] }, items: [
      action('retreat', 'retreat-budew', { targetPrinting: P.budew }),
      action('pass', 'pass') ] });
    assert.deepEqual(decide(request), { kind: 'select-action', token: 'pass' });
  });
  test('Tool-suppression public-turn marker prevents dual-lock shortcut seat ' + seat, () => {
    const request = state(seat, { ownPublic: {
      bench: [poke(P.garbLTR, [tool()]), poke(P.budew)],
      publicTurnRestrictions: { stadiumAndToolHaveNoEffectTurnsRemaining: 1 }
    }, items: [
      action('retreat', 'budew', { targetPrinting: P.budew }),
      action('pass', 'pass') ] });
    assert.deepEqual(decide(request), { kind: 'select-action', token: 'pass' });
  });
  test('an actually offered lethal Claw takes priority over retreating to Budew seat ' + seat, () => {
    const request = state(seat, { ownPublic: {
      bench: [poke(P.garbLTR, [tool()]), poke(P.budew)] }, items: [
      action('attack', 'lethal', { attackName: 'Claw of Darkness',
        publicMetadata: { attackCostPayable: true,
          targetHp: 180, targetDamage: 0, damageAfterWeakness: 220 } }),
      action('retreat', 'budew', { targetPrinting: P.budew }),
      action('pass', 'pass') ] });
    assert.deepEqual(decide(request), { kind: 'select-action', token: 'lethal' });
  });
  test('physical BKP Garbodor Tool recipient wins over Mega Absol seat ' + seat, () => {
    const request = state(seat, { ownPublic: { bench: [
      poke(P.garbBKP), poke(P.absol)] }, prompt: {
      promptType: 'ChoosePokemonPrompt',
      publicMetadata: { selectionType: 'pokemon', minimumCount: 1, maximumCount: 1, allowCancel: false },
      source: { sourcePrinting: P.float, effectName: 'Float Stone' },
      choices: toolChoices() } });
    assert.deepEqual(decide(request), { kind: 'select-choices', tokens: ['g'] });
  });
  test('do not consume Tool recipient prompt when only opponent target is offered seat ' + seat, () => {
    const request = state(seat, { prompt: {
      promptType: 'ChoosePokemonPrompt',
      publicMetadata: { selectionType: 'pokemon', minimumCount: 1, maximumCount: 1, allowCancel: false },
      source: { sourcePrinting: P.float, effectName: 'Float Stone' },
      choices: [{ token: 'opponent-garbodor', printing: P.garbBKP,
        publicMetadata: { ownerSeat: 'opponent', targetZone: 'bench', benchIndex: 0 } }] } });
    assert.deepEqual(decide(request), { kind: 'abstain', reasonCode: 'NO_SUPPORTED_POKEMON_CHOICE' });
  });
}
test('rejects role/seat confusion with no access to a private zone', () => {
  const request = state(0, { actorSeat: 1 });
  assert.deepEqual(decide(request),
    { kind: 'abstain', reasonCode: 'ROLE_SEAT_BINDING_MISMATCH' });
});
test('rejects unknown prompt rather than fabricating a native token', () => {
  assert.deepEqual(decide(state(1, { prompt: {
    promptType: 'UnknownPrompt', source: { effectName: 'Unknown' }, choices: [] } })),
  { kind: 'abstain', reasonCode: 'UNSUPPORTED_PROMPT_TYPE' });
});

for(const seat of [0,1]){
  test('rank16 Bench AMR reserves fifth physical slot for missing Budew seat '+seat,()=>{
    const request=state(seat,{ownPublic:{active:poke(P.absol),bench:[
      poke(P.trubbish),poke(P.crobat),poke('Dedenne-GX UNB 57'),
      poke('Tapu Lele-GX GRI 60')]},items:[
      action('play-card','crobat',{actorPrinting:P.crobat}),
      action('pass','pass')]});
    assert.deepEqual(decide(request),{kind:'select-action',token:'pass'});
  });
  test('rank16 scarce Bench basic search takes Budew over extra support seat '+seat,()=>{
    const request=state(seat,{ownPublic:{active:poke(P.absol),bench:[
      poke(P.trubbish),poke(P.crobat),poke('Dedenne-GX UNB 57'),
      poke('Tapu Lele-GX GRI 60')]},prompt:{
      promptType:'ChooseCardsPrompt',
      source:{sourcePrinting:'Quick Ball FST 237',effectName:'Quick Ball'},
      publicMetadata:{selectionType:'card-combination',minimumCount:1,maximumCount:1,allowCancel:false},
      choices:[{kind:'card',token:'budew',printing:P.budew,
        publicMetadata:{ownerSeat:'actor',sourceZone:'deck'}},
        {kind:'card',token:'crobat',printing:P.crobat,
        publicMetadata:{ownerSeat:'actor',sourceZone:'deck'}}]}});
    assert.deepEqual(decide(request),{kind:'select-choices',tokens:['budew']});
  });
}

for(const seat of [0,1]) {
  test('Terminal Period reads exactly six ten-damage counters not 300 damage seat '+seat,()=>{
    const request=state(seat,{
      ownPublic:{active:poke(P.absol),bench:[poke(P.garbLTR)]},
      opponentPublic:{active:{...poke('Shadow Rider Calyrex VMAX CRE 75'),damage:60}},
      items:[action('attack','terminal',{attackName:'Terminal Period',
        publicMetadata:{attackCostPayable:true,targetDamage:60}}),
        action('attack','claw',{attackName:'Claw of Darkness',
          publicMetadata:{attackCostPayable:true,targetHp:320,targetDamage:60,damage:200}}),
        action('pass','pass')]
    });
    assert.deepEqual(decide(request),{kind:'select-action',token:'terminal'});
  });
  test('Terminal Period never claims a phantom 300-damage KO seat '+seat,()=>{
    const request=state(seat,{
      opponentPublic:{active:{...poke('Shadow Rider Calyrex VMAX CRE 75'),damage:300}},
      items:[action('attack','phantom',{attackName:'Terminal Period',
        publicMetadata:{attackCostPayable:true,targetDamage:300}}),
        action('pass','pass')]
    });
    assert.deepEqual(decide(request),{kind:'select-action',token:'pass'});
  });
  test('Terminal Period does not attack when public state disagrees with offered damage seat '+seat,()=>{
    const request=state(seat,{
      opponentPublic:{active:{...poke('Shadow Rider Calyrex VMAX CRE 75'),damage:300}},
      items:[action('attack','inconsistent',{attackName:'Terminal Period',
        publicMetadata:{attackCostPayable:true,targetDamage:60}}),
        action('pass','pass')]
    });
    assert.deepEqual(decide(request),{kind:'select-action',token:'pass'});
  });
}

for(const seat of [0,1]) {
  test('rank16 Garbotoxin physically suppressed means no false Budew dual lock seat '+seat,()=>{
    const garb={...poke(P.garbLTR),tools:[tool()],
      abilitySuppressions:[{abilityName:'Garbotoxin',suppressed:true,reasonCode:'NEUTRALIZING_GAS'}]};
    const request=state(seat,{
      ownPublic:{active:poke(P.absol),bench:[garb,poke(P.budew)]},
      items:[action('retreat','budew',{targetPrinting:P.budew}),action('pass','pass')]
    });
    assert.deepEqual(decide(request),{kind:'select-action',token:'pass'});
  });
  test('rank16 offered own setup Ability suppressed by Garbotoxin is not selected seat '+seat,()=>{
    const request=state(seat,{
      ownPublic:{active:poke(P.absol),bench:[
        {...poke(P.garbBKP),tools:[tool()]},poke(P.crobat)]},
      items:[action('use-ability','dark',{publicMetadata:{abilityName:'Dark Asset'}}),
        action('pass','pass')]
    });
    assert.deepEqual(decide(request),{kind:'select-action',token:'pass'});
  });
  test('rank16 VS Seeker / Plumeria hand-value cycle terminates seat '+seat,()=>{
    const request=state(seat,{
      ownHand:['VS Seeker PHF 109','Battle VIP Pass FST 225','Boost Shake EVS 142',
        'Darkness Energy MEE 15'],
      ownPublic:{active:poke(P.absol),bench:[poke(P.garbLTR)],discard:[
        'Plumeria BUS 120','Marnie SSH 169']},
      opponentPublic:{active:{...poke('Shadow Rider Calyrex VMAX CRE 75'),
        energies:[{printing:'Psychic Energy MEE 13'},{printing:'Psychic Energy MEE 13'}]},
        bench:[],discard:[],prizeCount:6,handCount:4},
      items:[action('play-card','vs',{actorPrinting:'VS Seeker PHF 109'}),
        action('play-card','plumeria',{actorPrinting:'Plumeria BUS 120'}),
        action('pass','pass')]
    });
    assert.equal(decide(request).kind,'select-action');
    assert.equal(['vs','plumeria'].includes(decide(request).token),true);
  });
}

for(const seat of [0,1]) {
  test('rank16 Bench-play Crobat Dark Asset precedes self-locking Tool seat '+seat,()=>{
    const request=state(seat,{
      ownHand:['Crobat V DAA 104','Float Stone BKT 137'],
      ownPublic:{active:poke(P.absol),bench:[poke(P.garbLTR)]},
      items:[action('play-card','crobat',{actorPrinting:P.crobat}),
        action('play-card','tool',{actorPrinting:P.float,targetPrinting:P.garbLTR}),
        action('pass','pass')]
    });
    assert.deepEqual(decide(request),{kind:'select-action',token:'crobat'});
  });
  test('rank16 no false Dark Asset value after Tool locks own Abilities seat '+seat,()=>{
    const request=state(seat,{
      ownHand:['Crobat V DAA 104'],
      ownPublic:{active:poke(P.absol),bench:[
        {...poke(P.garbLTR),tools:[tool()]},poke(P.budew)]},
      items:[action('play-card','crobat',{actorPrinting:P.crobat}),
        action('pass','pass')]
    });
    assert.deepEqual(decide(request),{kind:'select-action',token:'pass'});
  });
  test('rank16 topological Bench reserve blocks extra Crobat before Budew seat '+seat,()=>{
    const request=state(seat,{
      ownHand:['Crobat V DAA 104'],
      ownPublic:{active:poke(P.absol),bench:[
        poke(P.garbLTR),poke(P.crobat),poke('Dedenne-GX UNB 57'),
        poke('Tapu Lele-GX GRI 60')]},
      items:[action('play-card','crobat',{actorPrinting:P.crobat}),
        action('pass','pass')]
    });
    assert.deepEqual(decide(request),{kind:'select-action',token:'pass'});
  });
}

for(const seat of [0,1]) {
  test('source Trubbish CRI Acid Spray attacks when payable, without guaranteed discard seat '+seat,()=>{
    const request=state(seat,{ownPublic:{active:poke(P.trubbish),bench:[]},
      opponentPublic:{active:{...poke('Shadow Rider Calyrex VMAX CRE 75'),
        energies:[{printing:'Psychic Energy MEE 13'}]}},
      items:[action('attack','acid',{attackName:'Acid Spray',
        publicMetadata:{attackCostPayable:true}}),action('pass','pass')]
    });
    assert.deepEqual(decide(request),{kind:'select-action',token:'acid'});
  });
  test('source Trubbish never offers a payable Acid Spray without correct Energy seat '+seat,()=>{
    const request=state(seat,{ownPublic:{active:poke(P.trubbish),bench:[]},
      opponentPublic:{active:{...poke('Shadow Rider Calyrex VMAX CRE 75'),
        energies:[{printing:'Psychic Energy MEE 13'}]}},
      items:[action('attack','acid',{attackName:'Acid Spray',
        publicMetadata:{attackCostPayable:false}}),action('pass','pass')]
    });
    assert.deepEqual(decide(request),{kind:'select-action',token:'pass'});
  });
}

for(const seat of [0,1]) {
  test('Wobbuffet Bide Barricade prevents false source Crobat Dark Asset seat '+seat,()=>{
    const request=state(seat,{ownHand:['Crobat V DAA 104','Float Stone BKT 137'],
      ownPublic:{active:poke(P.absol),bench:[poke(P.garbLTR)]},
      opponentPublic:{active:poke('Wobbuffet PHF 36'),bench:[]},
      items:[action('play-card','crobat',{actorPrinting:P.crobat}),
        action('play-card','tool',{actorPrinting:P.float,targetPrinting:P.garbLTR}),
        action('pass','pass')]
    });
    assert.deepEqual(decide(request),{kind:'select-action',token:'tool'});
  });
  test('Wobbuffet Psychic exception preserves Tapu Lele-GX Wonder Tag seat '+seat,()=>{
    const request=state(seat,{ownHand:['Tapu Lele-GX GRI 60','Float Stone BKT 137'],
      ownPublic:{active:poke(P.absol),bench:[poke(P.garbLTR)]},
      opponentPublic:{active:poke('Wobbuffet PHF 36'),bench:[]},
      items:[action('play-card','lele',{actorPrinting:'Tapu Lele-GX GRI 60'}),
        action('play-card','tool',{actorPrinting:P.float,targetPrinting:P.garbLTR}),
        action('pass','pass')]
    });
    assert.deepEqual(decide(request),{kind:'select-action',token:'lele'});
  });
  test('Iron Thorns ex Initialization denies source Rule Box setup Abilities seat '+seat,()=>{
    const request=state(seat,{ownHand:['Crobat V DAA 104','Float Stone BKT 137'],
      ownPublic:{active:poke(P.absol),bench:[poke(P.garbLTR)]},
      opponentPublic:{active:poke('Iron Thorns ex TWM 77'),bench:[]},
      items:[action('play-card','crobat',{actorPrinting:P.crobat}),
        action('play-card','tool',{actorPrinting:P.float,targetPrinting:P.garbLTR}),
        action('pass','pass')]
    });
    assert.deepEqual(decide(request),{kind:'select-action',token:'tool'});
  });
}

for(const seat of [0,1]) {
  const locked={active:poke(P.budew),bench:[
    {...poke(P.garbBKP),tools:[tool()]},poke(P.absol)]};
  test('Itchy Pollen waits for useful Quick Ball when Garbodor axis missing seat '+seat,()=>{
    const r=state(seat,{globalTurn:4,ownHand:['Quick Ball FST 237','Battle VIP Pass FST 225'],
      ownPublic:{active:poke(P.budew),bench:[poke(P.absol)]},items:[
      action('attack','pollen',{attackName:'Itchy Pollen',publicMetadata:{attackCostPayable:true}}),
      action('play-card','ball',{actorPrinting:'Quick Ball FST 237'}),
      action('pass','pass')]});
    assert.deepEqual(decide(r),{kind:'select-action',token:'ball'});
  });
  test('Itchy Pollen precedes turn-ending Boost Shake when both offered seat '+seat,()=>{
    const r=state(seat,{globalTurn:4,ownHand:['Boost Shake EVS 142'],
      ownPublic:{...locked,bench:[...locked.bench,poke(P.trubbish)]},items:[
      action('attack','pollen',{attackName:'Itchy Pollen',publicMetadata:{attackCostPayable:true}}),
      action('play-card','boost',{actorPrinting:'Boost Shake EVS 142'}),
      action('pass','pass')]});
    assert.deepEqual(decide(r),{kind:'select-action',token:'pollen'});
  });
  test('Itchy Pollen is correct over discard-insolvent Ball seat '+seat,()=>{
    const r=state(seat,{globalTurn:4,ownHand:['Quick Ball FST 237','Garbodor BKP 57'],
      ownPublic:locked,items:[
      action('attack','pollen',{attackName:'Itchy Pollen',publicMetadata:{attackCostPayable:true}}),
      action('play-card','ball',{actorPrinting:'Quick Ball FST 237'}),
      action('pass','pass')]});
    assert.deepEqual(decide(r),{kind:'select-action',token:'pollen'});
  });
}

for(const seat of [0,1])for(const ball of ['Quick Ball FST 237','Ultra Ball MEG 131']){
  const name=ball.startsWith('Quick')?'quick':'ultra';
  const hand=[ball,'Battle VIP Pass FST 225','Battle VIP Pass FST 225',
    "Trainers' Mail ROS 92",'Darkness Energy MEE 15'];
  const offered=[action('attack','pollen',{attackName:'Itchy Pollen',
    publicMetadata:{attackCostPayable:true}}),
    action('play-card','ball',{actorPrinting:ball}),action('pass','pass')];
  test('source '+name+' Ball not wasted after established lock core seat '+seat,()=>{
    const r=state(seat,{globalTurn:4,ownHand:hand,
      ownPublic:{active:poke(P.budew),bench:[
        {...poke(P.garbBKP),tools:[tool()]},poke(P.absol)]},items:offered});
    assert.deepEqual(decide(r),{kind:'select-action',token:'pollen'});
  });
  test('affordable '+name+' Ball precedes attack if Garbodor absent seat '+seat,()=>{
    const r=state(seat,{globalTurn:4,ownHand:hand,
      ownPublic:{active:poke(P.budew),bench:[poke(P.absol)]},items:offered});
    assert.deepEqual(decide(r),{kind:'select-action',token:'ball'});
  });
}

for(const seat of [0,1]){
 const cards=['Secret Box TWM 163','Battle VIP Pass FST 225',
   'Battle VIP Pass FST 225','Quick Ball FST 237','Ultra Ball MEG 131'];
 const items=[action('attack','pollen',{attackName:'Itchy Pollen',
   publicMetadata:{attackCostPayable:true}}),
   action('play-card','secret',{actorPrinting:'Secret Box TWM 163'}),
   action('pass','pass')];
 test('rank16 Secret Box retains ACE rather than burn three cards with complete engine seat '+seat,()=>{
   const r=state(seat,{globalTurn:4,ownHand:cards,
     ownPublic:{active:poke(P.budew),bench:[
       {...poke(P.garbBKP),tools:[tool()]},
       {...poke(P.absol),energies:[{printing:'Darkness Energy MEE 15'},
         {printing:'Darkness Energy MEE 15'},{printing:'Darkness Energy MEE 15'}]}]},items});
   assert.deepEqual(decide(r),{kind:'select-action',token:'pollen'});
 });
 test('rank16 affordable Secret Box resolves missing Garbodor board channel seat '+seat,()=>{
   const r=state(seat,{globalTurn:4,ownHand:cards,
     ownPublic:{active:poke(P.budew),bench:[poke(P.absol)]},items});
   assert.deepEqual(decide(r),{kind:'select-action',token:'secret'});
 });
}
