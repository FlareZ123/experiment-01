'use strict';
const assert=require('node:assert/strict');
const path=require('node:path');
const {initializeCards}=require('./headless.cjs');
const {inspectPhysicalCardZones,locatedOrPromptCountAnomalies}=
  require('./physical-card-ledger.cjs');
const {VERSION,PIN,withCorrectedCelestialRoarCustody}=
  require('./agent25-regidrago-v-celestial-roar-card-custody-hook.cjs');
const out=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
const load=module=>require(path.join(out,module));

/**
 * Exactly 60 physical original printed cards per seat; synthetic physical
 * top-three is controlled to isolate the upstream moving-forEach bug.
 * @param {0|1} attackingSeat
 * @param {'one-basic-two-non'|'zero-basic-three-non'|'two-basic-one-non'} mode
 * @param {boolean} repaired
 */
function trial(attackingSeat,mode,repaired){
  const {State,GamePhase}=load('game/store/state/state');
  const {Player}=load('game/store/state/player');
  const {CardList}=load('game/store/state/card-list');
  const {Store}=load('game/store/store');
  const {GameSettings}=load('game/core/game-settings');
  const {Format}=load('game/store/card/card-types');
  const {AttackAction}=load('game/store/actions/game-actions');
  const {ResolvePromptAction}=load('game/store/actions/resolve-prompt-action');
  const {PlayerType,SlotType}=load('game/store/actions/play-card-action');
  const cards=initializeCards();
  let id=80000;
  const printed=name=>{
    const card=cards.getCardByName(name);
    assert.ok(card,'Native missing printed card '+name);
    card.id=++id;return card;
  };
  const owner=new Player();owner.id=401;owner.name='Source Regidrago';
  const opp=new Player();opp.id=402;opp.name='Dhelmise test opponent';
  const attacker=printed('Regidrago V SIT');
  const attached=printed('Psychic Energy SVE');
  owner.active.cards.push(attacker,attached);
  owner.active.energies.cards.push(attached);
  opp.active.cards.push(printed('Dhelmise M5'));
  const profile={
    'one-basic-two-non':['Grass Energy SVE','Quick Ball SSH','Arven SVI'],
    'zero-basic-three-non':['Quick Ball SSH','Arven SVI','Field Blower GRI'],
    'two-basic-one-non':['Grass Energy SVE','Psychic Energy SVE','Arven SVI']
  }[mode];
  assert.ok(profile);
  owner.deck.cards.push(...profile.map(printed));
  for(let i=0;i<49;i++)owner.deck.cards.push(printed('Psychic Energy SVE'));
  for(let i=0;i<53;i++)opp.deck.cards.push(printed('Psychic Energy SVE'));
  for(const player of [owner,opp]){
    for(let i=0;i<6;i++){
      const prize=new CardList();prize.cards.push(printed('Psychic Energy SVE'));
      player.prizes.push(prize);
    }
  }
  const state=new State();
  state.players=attackingSeat===0?[owner,opp]:[opp,owner];
  state.activePlayer=attackingSeat;state.turn=3;
  state.phase=GamePhase.PLAYER_TURN;
  const settings=new GameSettings();
  settings.format=Format.EXPANDED;state.gameSettings=settings;
  state.rules=settings.rules;
  const store=new Store({onStateChange(){}});store.state=state;
  const initial=inspectPhysicalCardZones(state);
  assert.deepEqual(initial.canonicalCounts,[60,60]);
  const execution=()=>{
    store.dispatch(new AttackAction(owner.id,'Celestial Roar'));
    const resolved=[];
    for(let i=0;i<16;i++){
      const prompt=store.state.prompts.find(p=>p.result===undefined);
      if(!prompt)break;
      const name=prompt.constructor.name;
      let answer;
      if(name==='AttachEnergyPrompt'){
        const elig=prompt.cardList.cards.filter(c=>c.name.endsWith('Energy'));
        assert.ok(elig.length>=1);
        assert.equal(prompt.options.min,elig.length);
        answer=elig.map(card=>({card,
          to:{player:PlayerType.BOTTOM_PLAYER,slot:SlotType.ACTIVE,index:0}}));
        assert.equal(prompt.validate(answer),true);
      }else if(name==='WaitPrompt')answer=null;
      else throw new Error('Unexpected native attack prompt '+name);
      store.dispatch(new ResolvePromptAction(prompt.id,answer));
      resolved.push(name);
    }
    assert.equal(store.state.prompts.filter(p=>p.result===undefined).length,0);
    const ledger=inspectPhysicalCardZones(state);
    const discardNonEnergy=owner.discard.cards.filter(c=>
      c.name==='Quick Ball'||c.name==='Arven'||c.name==='Field Blower');
    const attachedBasicEnergy=owner.active.energies.cards.length-1;
    return {ledger,accounted:ledger.canonicalCounts[attackingSeat],
      conservationAnomalies:locatedOrPromptCountAnomalies(ledger),
      originalTopThree:profile,discardedNonEnergyNames:discardNonEnergy.map(c=>c.name),
      attachedBasicEnergy,remainingDeck:owner.deck.cards.length,
      promptsResolved:resolved,
      ownerNativeCardTotal:ledger.canonicalCounts[attackingSeat]};
  };
  const wrapper=repaired?
    withCorrectedCelestialRoarCustody(execution):
    {result:execution(),audit:null};
  return {attackingSeat,mode,repaired,
    enginePin:PIN,version:VERSION,
    originalNativeStoreAttackAction:true,
    nativeStorePromptResolution:true,
    ...wrapper.result,
    correctedAudit:wrapper.audit,
    artificialFixture:true,qualifiedCompetitiveGame:false};
}
function run(){
  const results=[];
  for(const mode of ['one-basic-two-non','zero-basic-three-non',
      'two-basic-one-non']){
    for(const seat of [0,1])
      for(const repaired of [false,true])
        results.push(trial(seat,mode,repaired));
  }
  assert.equal(results.length,12);
  for(const seat of [0,1]){
    const find=(mode,repaired)=>results.find(x=>
      x.mode===mode&&x.attackingSeat===seat&&x.repaired===repaired);
    const b=find('one-basic-two-non',false);
    const f=find('one-basic-two-non',true);
    assert.equal(b.accounted,59,'original Store skipped a non-Energy card');
    assert.equal(f.accounted,60,'corrected Store retains all original 60 cards');
    assert.equal(b.attachedBasicEnergy,1);
    assert.equal(f.attachedBasicEnergy,1);
    assert.equal(b.discardedNonEnergyNames.length,1);
    assert.equal(f.discardedNonEnergyNames.length,2);
    assert.ok(f.correctedAudit.originalReducerRestored);
    assert.ok(f.correctedAudit.allRemaindersZero);
    const c=find('zero-basic-three-non',false),d=find('zero-basic-three-non',true);
    assert.equal(c.accounted,60);
    assert.equal(d.accounted,60);
    assert.equal(d.discardedNonEnergyNames.length,3);
    assert.equal(d.attachedBasicEnergy,0);
    const e=find('two-basic-one-non',false),g=find('two-basic-one-non',true);
    assert.equal(e.accounted,60);
    assert.equal(g.accounted,60);
    assert.equal(g.discardedNonEnergyNames.length,1);
    assert.equal(g.attachedBasicEnergy,2);
  }
  return {version:VERSION,enginePin:PIN,results,passed:true,
    vendorFilesChanged:false,artificialMidgame:true,
    competitiveQualifiedGames:0};
}
module.exports={trial,run};
if(require.main===module)process.stdout.write(JSON.stringify(run(),null,2)+'\n');
