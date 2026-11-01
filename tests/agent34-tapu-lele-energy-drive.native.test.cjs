'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const path=require('node:path');
const {initializeCards}=require('../simulation/twinleaf/headless.cjs');
const root=path.resolve(__dirname,'../vendor/twinleaf/ptcg-server/output');
const native=name=>require(path.join(root,name));
const {Store}=native('game/store/store');
const {Player}=native('game/store/state/player');
const {CardList}=native('game/store/state/card-list');
const {PokemonCardList}=native('game/store/state/pokemon-card-list');
const {GamePhase}=native('game/store/state/state');
const {AttackAction}=native('game/store/actions/game-actions');
const {ResolvePromptAction}=native('game/store/actions/resolve-prompt-action');
const {Format}=native('game/store/card/card-types');
const {withEnergyDrivePaperBypass}=require(
  '../simulation/twinleaf/agent34-energy-drive-bypass-hook.cjs');

/** Genuine pinned Store, paper-basic equal-unit Energy.
 * @param {0|1} seat Physical attacking seat.
 * @param {number} opponentEnergies Basic Energy cards on defending Active.
 * @returns {object} Prepared original native cards and Store.
 */
function stage(seat,opponentEnergies,options={}){
  const manager=initializeCards();
  let id=340000+seat*10000+opponentEnergies*1000;
  const card=fullName=>{
    const x=manager.getCardByName(fullName);
    assert.ok(x,'Pinned card unavailable: '+fullName);
    x.id=id++;
    return x;
  };
  const owner=new Player(),opponent=new Player();
  owner.id=701;opponent.id=702;
  owner.name='tapu-lele-source';opponent.name='defender';
  const lele=card('Tapu Lele-GX GRI');
  assert.equal(lele.attacks[0]?.name,'Energy Drive');
  const defender=card(options.defender??'Shadow Rider Calyrex V CRE');
  assert.ok(defender.hp>=90);
  owner.active.cards.push(lele);
  opponent.active.cards.push(defender);
  const attackerEnergyPrintings=options.doubleColorless===true?
    ['Double Colorless Energy SUM']:
    ['Psychic Energy SVE','Psychic Energy SVE'];
  for(const printing of attackerEnergyPrintings){
    const energy=card(printing);
    owner.active.cards.push(energy);
    owner.active.energies.cards.push(energy);
  }
  for(let j=0;j<opponentEnergies;j++){
    const energy=card('Psychic Energy SVE');
    opponent.active.cards.push(energy);
    opponent.active.energies.cards.push(energy);
  }
  for(const player of [owner,opponent]){
    player.bench=Array.from({length:5},()=>new PokemonCardList());
    for(let j=0;j<8;j++)player.deck.cards.push(card('Psychic Energy SVE'));
    player.prizes=Array.from({length:6},()=>{
      const prize=new CardList();
      prize.cards.push(card('Psychic Energy SVE'));
      return prize;
    });
  }
  const store=new Store({onStateChange(){}}),state=store.state;
  state.players=seat===0?[owner,opponent]:[opponent,owner];
  state.activePlayer=seat;state.turn=4;state.phase=GamePhase.PLAYER_TURN;
  state.gameSettings.format=Format.EXPANDED;
  return {store,state,owner,opponent,lele,defender,seat,opponentEnergies};
}

/** Settles the original native attack root, retaining every prompt family.
 * @param {object} fixture Staged genuine Store fixture.
 * @returns {object} Physical damage and native action receipts.
 */
function settle(fixture){
  const {store,state,owner,opponent}=fixture;
  const damageBefore=opponent.active.damage;
  store.dispatch(new AttackAction(owner.id,'Energy Drive'));
  const prompts=[];
  for(let step=0;step<24;step++){
    const p=state.prompts.find(x=>x.result===undefined);
    if(!p)break;
    prompts.push(p.constructor.name);
    assert.equal(p.constructor.name,'WaitPrompt',
      'Unexpected owner decision prompt in native Energy Drive effect');
    store.dispatch(new ResolvePromptAction(p.id,null));
  }
  assert.equal(store.hasPrompts(),false,
    'Native Energy Drive did not finish its real prompt chain');
  return {seat:fixture.seat,opponentEnergies:fixture.opponentEnergies,
    printing:fixture.lele.fullName,
    defenderPrinting:fixture.defender.fullName,
    attackerEnergyCards:owner.active.energies.cards.length,
    defendingEnergyCards:opponent.active.energies.cards.length,
    defenderDamageBefore:damageBefore,
    defenderDamageAfter:opponent.active.damage,
    deltaDamage:opponent.active.damage-damageBefore,
    prompts,engineFinished:state.phase===GamePhase.FINISHED};
}

test('paper Energy Drive basic-energy multiplication: both actual seats',()=>{
  const results=[];
  for(const seat of [0,1]){
    for(const defendingEnergyCards of [0,1,2]){
      const fixture=stage(seat,defendingEnergyCards);
      const receipt=settle(fixture);
      const expected=20*(2+defendingEnergyCards);
      results.push({...receipt,expectedDamage:expected,
        paperDamageMatch:receipt.deltaDamage===expected});
    }
  }
  console.log('AGENT34_TAPU_LELE_NATIVE_ENERGY_DRIVE',JSON.stringify(results));
  for(const row of results){
    assert.equal(row.printing,'Tapu Lele-GX GRI');
    assert.equal(row.deltaDamage,row.expectedDamage,
      'Native printed Energy Drive mismatch on physical seat '+row.seat+
      ' and defending Energy cards '+row.opponentEnergies);
  }
});

test('two-unit Double Colorless Energy and Psychic Weakness bypass, both seats',()=>{
  const rows=[];
  for(const seat of [0,1]){
    for(const options of [
      {doubleColorless:true},
      {defender:'Galarian Zapdos V CRE'},
      {doubleColorless:true,defender:'Galarian Zapdos V CRE'}
    ]){
      const receipt=settle(stage(seat,1,options));
      rows.push({...receipt,attackEnergyIsDoubleColorless:
        options.doubleColorless===true,
        targetHasPsychicWeakness:options.defender==='Galarian Zapdos V CRE',
        expectedDamage:60,
        paperDamageMatch:receipt.deltaDamage===60});
    }
  }
  console.log('AGENT34_TAPU_LELE_DCE_WEAKNESS',JSON.stringify(rows));
  for(const row of rows){
    const expectedOriginalNative=row.targetHasPsychicWeakness?120:60;
    assert.equal(row.deltaDamage,expectedOriginalNative,
      'Track pinned native Weakness omission as a known paper-invalid result');
    assert.equal(row.paperDamageMatch,!row.targetHasPsychicWeakness,
      'Paper damage eligibility stays false for known Weakness bypass defect');
  }
});

test('diagnose native Effect class identities on actual Energy Drive path',()=>{
  const fixture=stage(0,1,{defender:'Galarian Zapdos V CRE'});
  const original=Store.prototype.reduceEffect;
  const events=[];
  Store.prototype.reduceEffect=function tracedEffect(state,effect){
    const name=effect?.constructor?.name??null;
    const embedded=effect?.attackEffect;
    const attack=embedded?.attack??effect?.attack;
    if(events.length<48 && (
       /Damage|Attack|Weakness|Resistance|CheckHp/.test(name??'')||
       attack?.name==='Energy Drive')){
      events.push({
        name,
        keys:Object.keys(effect??{}).slice(0,25),
        attackName:attack?.name??null,
        attackKeys:embedded?Object.keys(embedded).slice(0,26):[],
        source:embedded?.source?.getPokemonCard?.()?.fullName??null,
        directIgnoreWeakness:effect?.ignoreWeakness??null,
        nestedIgnoreWeakness:embedded?.ignoreWeakness??null,
        directIgnoreResistance:effect?.ignoreResistance??null,
        nestedIgnoreResistance:embedded?.ignoreResistance??null,
        damage:effect?.damage??null
      });
    }
    return original.call(this,state,effect);
  };
  let receipt;
  try{receipt=settle(fixture);}
  finally{Store.prototype.reduceEffect=original;}
  console.log('AGENT34_ENERGY_DRIVE_EFFECT_STRUCTURE',JSON.stringify({
    printing:receipt.printing,damage:receipt.deltaDamage,
    effects:events}));
  assert.equal(receipt.deltaDamage,120,'Pinned original native Weakness failure is reproducible');
});

test('reversible exact-print paper bypass restores both-seat Weakness semantics',()=>{
  const rows=[];
  const prior=Store.prototype.reduceEffect;
  for(const seat of [0,1]){
    for(const options of [
      {defender:'Galarian Zapdos V CRE'},
      {doubleColorless:true,defender:'Galarian Zapdos V CRE'}
    ]){
      const fixture=stage(seat,1,options);
      const {result,audit}=withEnergyDrivePaperBypass(
        ()=>settle(fixture),{Store,rootStore:fixture.store});
      rows.push({...result,doubleColorless:options.doubleColorless===true,
        paperExpectedDamage:60,matchingPaperDamage:result.deltaDamage===60,
        interceptedNativeDamagePhases:audit.interceptedNativeDamagePhases,
        phaseNames:audit.events.map(x=>x.effectClass)});
    }
  }
  console.log('AGENT34_TAPU_LELE_PAPER_BYPASS_HOOK',JSON.stringify(rows));
  assert.strictEqual(Store.prototype.reduceEffect,prior);
  for(const row of rows){
    assert.equal(row.deltaDamage,60,'Corrected native damage must ignore Weakness');
    assert.ok(row.interceptedNativeDamagePhases>=1);
  }
});
