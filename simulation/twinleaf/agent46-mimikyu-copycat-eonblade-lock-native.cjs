'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const {stageCopycat}=require('./agent46-mimikyu-apex-copycat-native.cjs');
const {initializeCards}=require('./headless.cjs');
const {installDeclaredCopyHistoryHook}=
  require('./copycat-declared-history-hook.cjs');
const {installMimikyuNonGxCopycatHook}=
  require('./copycat-compat.cjs');

const OUTPUT=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
/** @param {string} name @returns {any} */
const native=name=>require(path.join(OUTPUT,name));
const {AttackAction,RetreatAction,PassTurnAction}=
  native('game/store/actions/game-actions');
const {ResolvePromptAction}=
  native('game/store/actions/resolve-prompt-action');
const {clearCopyAttackSessionsForTests}=
  native('game/store/prefabs/copy-attack-delegation');

/**
 * Settle a real opponent Eon Blade, retreat into a physically funded Mimikyu,
 * then use printed Copycat and test its next-own-turn attack lock.
 *
 * The active Mega Absol survives the opponent's 200 damage. Mimikyu remains
 * benched during that attack, so the copied 200 damage does not KO Mimikyu.
 * All attacks, retreat, prompts and turn transitions use the pinned Store.
 *
 * @param {0|1} seat Physical owner seat for Mimikyu.
 * @param {'none'|'history'|'compat'|'both'} hookMode Research hook combination.
 * @returns {object} Native Store effect, identity and next-turn lock receipt.
 */
function runSeat(seat,hookMode='none'){
  const restore=[];
  if(hookMode==='history'||hookMode==='both'){
    restore.push(installDeclaredCopyHistoryHook({
      mimikyu:true,regidrago:false
    }));
  }
  if(hookMode==='compat'||hookMode==='both'){
    restore.push(installMimikyuNonGxCopycatHook());
  }

  clearCopyAttackSessionsForTests();
  try{
    const staged=stageCopycat(seat,'gnaw');
    const x=staged.x;
    const manager=initializeCards();
    let id=970000;
    /** @param {string} name @returns {any} */
    const card=name=>{
      const result=manager.getCardByName(name);
      assert.ok(result,'Pinned card unavailable: '+name);
      result.id=id++;
      return result;
    };

    const mimikyu=x.owner.active.getPokemonCard();
    const mimikyuEnergy=x.owner.active.energies.cards.slice();
    assert.equal(mimikyu?.fullName,'Mimikyu GRI');
    assert.equal(mimikyuEnergy.length,2);

    x.owner.active.cards.length=0;
    x.owner.active.energies.cards.length=0;
    for(const slot of x.owner.bench){
      slot.cards.length=0;
      slot.energies.cards.length=0;
    }
    x.owner.bench[0].cards.push(mimikyu,...mimikyuEnergy);
    x.owner.bench[0].energies.cards.push(...mimikyuEnergy);

    const megaAbsol=card('Mega Absol ex M1L');
    const activeEnergy=[card('Psychic Energy SVE'),card('Psychic Energy SVE')];
    x.owner.active.cards.push(megaAbsol,...activeEnergy);
    x.owner.active.energies.cards.push(...activeEnergy);

    x.opponent.active.cards.length=0;
    x.opponent.active.energies.cards.length=0;
    const latias=card('Latias ex SSP');
    const latiasEnergy=[
      card('Psychic Energy SVE'),
      card('Psychic Energy SVE'),
      card('Psychic Energy SVE')
    ];
    x.opponent.active.cards.push(latias,...latiasEnergy);
    x.opponent.active.energies.cards.push(...latiasEnergy);

    x.state.playerLastAttack={};
    x.state.lastAttack=undefined;
    x.state.activePlayer=1-seat;
    x.state.turn=2;
    x.state.phase=x.GamePhase.PLAYER_TURN;

    /**
     * Only mandatory native animation prompts are accepted by this fixture.
     * @param {string} stageName
     * @returns {string[]}
     */
    function settleWaits(stageName){
      const prompts=[];
      for(let i=0;i<40;i++){
        const pending=x.state.prompts.find(prompt=>prompt.result===undefined);
        if(!pending)break;
        const kind=pending.constructor.name;
        assert.equal(kind,'WaitPrompt',
          stageName+' unexpected native prompt: '+kind);
        prompts.push(kind);
        x.store.dispatch(new ResolvePromptAction(pending.id,null));
      }
      assert.equal(x.state.prompts.filter(prompt=>prompt.result===undefined).length,0,
        stageName+' must leave no unresolved native prompts');
      return prompts;
    }

    x.store.dispatch(new AttackAction(x.opponent.id,'Eon Blade'));
    const sourceWaits=settleWaits('opponent Eon Blade');
    const prior=x.state.playerLastAttack?.[x.opponent.id];
    assert.equal(prior?.attack?.name,'Eon Blade');
    assert.strictEqual(prior?.sourceCard,latias);
    assert.equal(prior.attack.gxAttack===true,false);
    assert.equal(x.owner.active.damage,200,
      'Opponent Eon Blade must settle 200 on the surviving Active');
    assert.equal(x.opponent.active.cannotAttackNextTurn,true,
      'Original Latias ex must receive its own printed next-turn lock');
    assert.equal(x.state.activePlayer,seat,
      'Mimikyu owner must receive the next turn after Eon Blade');
    assert.equal(x.state.phase,x.GamePhase.PLAYER_TURN);

    x.store.dispatch(new RetreatAction(x.owner.id,0));
    const retreatWaits=settleWaits('Mega Absol retreat');
    assert.strictEqual(x.owner.active.getPokemonCard(),mimikyu,
      'The exact original Mimikyu object must become Active');
    assert.equal(x.owner.active.energies.cards.length,2,
      'Mimikyu must retain its own two attached Psychic Energy');

    const damageBeforeCopycat=x.opponent.active.damage;
    const mimikyuAttackBefore=x.owner.active.cannotAttackNextTurn===true;
    x.store.dispatch(new AttackAction(x.owner.id,'Copycat'));
    const copycatWaits=settleWaits('Mimikyu Copycat Eon Blade');
    const damageAfterCopycat=x.opponent.active.damage;
    const copiedRecord=x.state.playerLastAttack?.[x.owner.id];

    assert.equal(damageAfterCopycat-damageBeforeCopycat,200,
      'Mimikyu Copycat must settle the donor Eon Blade damage');
    assert.equal(copiedRecord?.attack?.name,'Eon Blade');
    assert.strictEqual(copiedRecord?.sourceCard,mimikyu,
      'The copied attack must remain attached to the exact physical Mimikyu');
    assert.equal(mimikyuAttackBefore,false);
    assert.equal(x.owner.active.cannotAttackNextTurn,true,
      'Copied Eon Blade must arm the Mimikyu next-turn attack lock');
    assert.equal(x.owner.active.cannotAttackNextTurnPending,false,
      'The lock must be active after the Copycat attack ends its turn');
    assert.equal(x.state.activePlayer,1-seat);

    x.store.dispatch(new PassTurnAction(x.opponent.id));
    const opponentPassWaits=settleWaits('opponent pass');
    assert.equal(x.state.activePlayer,seat);
    assert.equal(x.state.phase,x.GamePhase.PLAYER_TURN);
    assert.strictEqual(x.owner.active.getPokemonCard(),mimikyu,
      'The locked physical Mimikyu must remain Active');
    assert.equal(x.owner.active.cannotAttackNextTurn,true,
      'The copied Eon Blade lock must survive the opponent turn');

    let repeatedAttackError=null;
    try{
      x.store.dispatch(new AttackAction(x.owner.id,'Copycat'));
    }catch(error){
      repeatedAttackError=String(error?.message??error);
    }
    assert.equal(repeatedAttackError,'BLOCKED_BY_EFFECT',
      'The same Mimikyu must be unable to attack on its next turn');

    const result={
      seat,hookMode,
      pinnedEngine:'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
      sourceAttack:{name:prior.attack.name,source:prior.sourceCard.fullName,
        nonGx:prior.attack.gxAttack!==true,damage:200},
      copycat:{
        physicalAttacker:mimikyu.fullName,
        physicalAttackerIdentityPreserved:x.owner.active.getPokemonCard()===mimikyu,
        ownEnergyCount:x.owner.active.energies.cards.length,
        printedCost:['Psychic','Colorless'],
        donorCost:['Psychic','Psychic','Colorless'],
        donorCostAppliedToMimikyu:false,
        damage:damageAfterCopycat-damageBeforeCopycat,
        recordedAttack:copiedRecord.attack.name,
        recordedSource:copiedRecord.sourceCard.fullName
      },
      lock:{
        activeImmediatelyAfterCopycat:x.owner.active.cannotAttackNextTurn===true,
        pendingAfterCopycat:x.owner.active.cannotAttackNextTurnPending,
        remainsAfterOpponentPass:x.owner.active.cannotAttackNextTurn===true,
        repeatedAttackRejectedAs:repeatedAttackError
      },
      prompts:{sourceWaits,retreatWaits,copycatWaits,opponentPassWaits},
      noChooseAttackPromptForCopycat:copycatWaits.every(kind=>kind!=='ChooseAttackPrompt'),
      qualifiedCompetitiveGames:0
    };
    console.log('AGENT46_MIMIKYU_COPYCAT_EONBLADE_LOCK '+JSON.stringify(result));
    return result;
  }finally{
    clearCopyAttackSessionsForTests();
    for(const undo of restore.reverse())undo();
  }
}

/** @returns {object} Both-seat baseline and hook-equivalence results. */
function run(){
  const rows=[];
  for(const seat of [0,1]){
    const baseline=runSeat(seat,'none');
    for(const hookMode of ['history','compat','both']){
      const hooked=runSeat(seat,hookMode);
      assert.deepEqual({
        sourceAttack:hooked.sourceAttack,
        copycat:hooked.copycat,
        lock:hooked.lock,
        noChooseAttackPromptForCopycat:hooked.noChooseAttackPromptForCopycat
      },{
        sourceAttack:baseline.sourceAttack,
        copycat:baseline.copycat,
        lock:baseline.lock,
        noChooseAttackPromptForCopycat:baseline.noChooseAttackPromptForCopycat
      },'Copycat compatibility hooks must preserve ordinary Eon Blade copy semantics');
      rows.push({seat,hookMode,baseline,hooked});
    }
    rows.push({seat,hookMode:'none',baseline});
  }
  const out={
    schema:'agent46-mimikyu-copycat-eonblade-next-own-turn-lock-both-seats-v1',
    pinnedEngine:'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    genuinePriorOpponentEonBlade:true,
    actualMimikyuCopycat:true,
    bothPhysicalSeats:true,
    declaredHistoryAndApexCompatibilityHooksCompared:true,
    stagedBoardAndNativeActionsOnly:true,
    paperMatchQualified:false,
    competitivelyQualifiedGames:0,
    rows
  };
  console.log('AGENT46_MIMIKYU_COPYCAT_EONBLADE_LOCK_SUMMARY '+JSON.stringify(out));
  return out;
}

if(require.main===module)run();
module.exports={runSeat,run};
