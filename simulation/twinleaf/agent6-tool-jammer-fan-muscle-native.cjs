'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const {initializeCards}=require('./headless.cjs');
const {withBilateralActiveToolJammerPaperGuard,VERSION,PIN}=
  require('./agent6-bilateral-tool-jammer-paper-guard.cjs');

const compiled=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
const native=name=>require(path.join(compiled,name));
const MODES=['none','pinned-uncorrected','legacy-hook',
  'paper-corrected','legacy-plus-paper-corrected'];
const FAMILIES=['Handheld Fan TWM','Muscle Band XY'];
const FAN_BENCH_LAYOUTS=['defender-only','attacker-only','both','neither'];

/**
 * Drive actual pinned Store.reduceEffect for two original-field Tool
 * implementations. These staged effect calls are not complete attacks.
 * Handheld Fan deliberately has ToolEffect.player=attacking player even
 * though the Tool is physically attached to defending Active. The existing
 * globally installed headless ToolJammer hook is a separate comparison arm.
 *
 * @param {string} family Tool fullName
 * @param {0|1} toolOwnerSeat Actual physical Active Tool owner seat
 * @param {string} mode Stage variant
 * @param {{benchLayout?:string}} [options] Staged Bench positions
 * @returns {object} Exact reducer outcome and source contract witness
 */
function probe(family,toolOwnerSeat,mode,{benchLayout='defender-only'}={}){
  assert.ok(FAMILIES.includes(family)&&MODES.includes(mode));
  assert.ok(FAN_BENCH_LAYOUTS.includes(benchLayout));
  assert.ok([0,1].includes(toolOwnerSeat));
  const manager=initializeCards();
  let id=1;
  const card=printed=>{
    const result=manager.getCardByName(printed);
    assert.ok(result,'Pinned card missing: '+printed);
    result.id=id++;
    return result;
  };
  const {Store}=native('game/store/store');
  const {Player}=native('game/store/state/player');
  const {PokemonCardList}=native('game/store/state/pokemon-card-list');
  const {GamePhase}=native('game/store/state/state');
  const {AttackEffect}=native('game/store/effects/game-effects');
  const {AfterDamageEffect,DealDamageEffect}=
    native('game/store/effects/attack-effects');
  const stateStore=new Store({onStateChange(){}});
  const state=stateStore.state;
  const player0=new Player(),player1=new Player();
  player0.id=101;player1.id=202;
  state.players=[player0,player1];
  state.activePlayer=1-toolOwnerSeat;
  state.turn=4;
  state.phase=GamePhase.ATTACK;
  const toolOwner=state.players[toolOwnerSeat];
  const other=state.players[1-toolOwnerSeat];
  toolOwner.active.cards.push(card('Pidgey MEW'));
  other.active.cards.push(card('Pidgey MEW'));
  const tool=card(family);
  toolOwner.active.tools.push(tool);
  const jammer=mode==='none'?null:card('Tool Jammer BST');
  if(jammer)other.active.tools.push(jammer);
  const branch=family==='Handheld Fan TWM'?'defending-fan':'attacking-band';
  let attacker=other,defender=toolOwner;
  if(branch==='attacking-band'){
    attacker=toolOwner;defender=other;
  }
  state.activePlayer=state.players.indexOf(attacker);
  // Independently vary both sides' Bench counts. Printed Handheld Fan
  // targets the attacker's Bench, while the pinned reducer currently tests
  // the defender's Bench before presenting its target prompt.
  const addBench=player=>{
    const slot=new PokemonCardList();
    slot.cards.push(card('Pidgey MEW'));
    player.bench.push(slot);
  };
  if(branch==='attacking-band'||
     benchLayout==='defender-only'||benchLayout==='both')addBench(defender);
  if(benchLayout==='attacker-only'||benchLayout==='both')addBench(attacker);
  attacker.active.energies.cards.push(card('Psychic Energy MEE'));
  const basic=attacker.active.getPokemonCard();
  assert.ok(basic.attacks.length>0);
  const attack=new AttackEffect(attacker,defender,basic.attacks[0]);
  const effect=branch==='attacking-band'?
    new DealDamageEffect(attack,20):new AfterDamageEffect(attack,20);
  const before=state.prompts.filter(p=>p.result===undefined).length;
  const runEffect=()=>{
    stateStore.reduceEffect(state,effect);
    return state.prompts.filter(p=>p.result===undefined)
      .slice(before).map(p=>p.constructor.name);
  };
  const legacy=mode==='legacy-hook'||
    mode==='legacy-plus-paper-corrected';
  const paper=mode==='paper-corrected'||
    mode==='legacy-plus-paper-corrected';
  const restoreLegacy=legacy?
    require('./tool-jammer-hook.cjs').installToolJammerHook():null;
  let observed;
  try{
    observed=paper?withBilateralActiveToolJammerPaperGuard(runEffect):
      {result:runEffect(),audit:null};
  }finally{restoreLegacy?.();}
  const received=observed.result;
  const nativeLegacyBlocks=legacy&&branch==='attacking-band';
  const blocked=paper||nativeLegacyBlocks;
  const hasDefenderBench=defender.bench.length>0;
  const hasAttackerBench=attacker.bench.length>0;
  const expected=branch==='attacking-band'?
    {damage:blocked?20:40,prompts:0}:
    {damage:20,prompts:!blocked&&hasDefenderBench?1:0};
  assert.equal(effect.damage,expected.damage);
  assert.equal(received.length,expected.prompts);
  if(branch==='defending-fan'&&received.length)
    assert.deepEqual(received,['AttachEnergyPrompt']);
  if(observed.audit){
    assert.equal(observed.audit.blockedByOwnerSeat[String(toolOwnerSeat)],1);
    assert.equal(observed.audit.blockedForeignEffectPlayerQueries,
      branch==='defending-fan'?1:0);
    assert.equal(observed.audit.blockedByOwnerSeat[String(1-toolOwnerSeat)],0);
  }
  return {family,branch,toolOwnerSeat,mode,benchLayout,
    attackerBenchCount:attacker.bench.length,
    defenderBenchCount:defender.bench.length,
    nativePromptMatchesPrintedBenchEligibility:branch==='attacking-band'||
      blocked||(hasAttackerBench===hasDefenderBench),
    actualDamage:effect.damage,nativeNewPromptTypes:received,
    paperGuardAudit:observed.audit,
    noFullNativeAttackSettlement:true,competitiveQualified:false};
}

/** @returns {object} Source-stamped physical-tool staged Store matrix. */
function run(){
  const attempts=[];
  for(const family of FAMILIES)for(const seat of [0,1])
    for(const mode of MODES){
      let receipt=null,error=null;
      try{receipt=probe(family,seat,mode);}
      catch(e){error=String(e?.stack??e);}
      attempts.push({family,toolOwnerSeat:seat,mode,receipt,error});
    }
  for(const seat of [0,1])for(const benchLayout of FAN_BENCH_LAYOUTS){
    let receipt=null,error=null;
    try{receipt=probe('Handheld Fan TWM',seat,'none',{benchLayout});}
    catch(e){error=String(e?.stack??e);}
    attempts.push({family:'Handheld Fan TWM',toolOwnerSeat:seat,
      mode:'none-geometry',benchLayout,receipt,error});
  }
  const failures=attempts.filter(x=>x.error);
  return {version:'agent6-fan-muscle-native-paper-guard-v1',paperHook:VERSION,
    pinnedTwinleaf:PIN,stagedNativeCases:attempts.length,
    failedChecks:failures.length,failures,attempts,
    competitiveQualifiedGames:0};
}
if(require.main===module){
  const data=run();
  process.stdout.write(JSON.stringify(data,null,2)+'\n');
  if(data.failedChecks)process.exitCode=1;
}
module.exports={FAMILIES,MODES,probe,run};
