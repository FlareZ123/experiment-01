'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const {createHash}=require('node:crypto');
const frame=require('../../results/aichi-2026/registrations/agent32-rank11-six-k0-star-vip-native-20261030.json');
const {verifyFrame:verifyParentFrame}=require('./agent32-rank11-eight-k0-bench-native.cjs');

/** @param {any} value @returns {string} */
function sha256(value) {
  return createHash('sha256').update(JSON.stringify(value)).digest('hex');
}

/** Require original source cohort identity and six exact native K0 cases. */
function verifyFrame(){
  const {frameSha256,...payload}=frame;
  assert.equal(sha256(payload),frameSha256);
  assert.equal(frame.schema,
    'agent32-rank11-retrospective-six-K0-starVIP-native-line-v1');
  assert.equal(frame.engineRevision,
    'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05');
  assert.equal(frame.exactK0Count,6);
  assert.equal(frame.sourceSeat,0);
  assert.equal(frame.candidateSeat,1);
  verifyParentFrame();
  const {seedFor}=require('../evaluation/rank11-conditional-k0-screen-run.cjs');
  const seen=new Set();
  for(const row of frame.selectedExactK0){
    assert.equal(seedFor(row.index),row.seed);
    assert.ok(!seen.has(row.index));
    seen.add(row.index);
    assert.equal(row.sourceFirstOwnerHandSha256.length,64);
    assert.equal(row.sourceBenchAtK0.length,5);
  }
  assert.equal(seen.size,6);
  return true;
}

/**
 * Owner may inspect the entire deck only when legitimately selecting from
 * its own ChooseCardsPrompt. This summary is never exposed before K1.
 * @param {object} prompt A native owner deck search.
 * @param {object} player Owner.
 */
function visibleK1Resources(prompt,player){
  assert.equal(prompt?.constructor?.name,'ChooseCardsPrompt');
  assert.equal(prompt.playerId,player.id);
  assert.equal(prompt.cards,player.deck);
  const cards=prompt.cards.cards.map(c=>c.fullName);
  const count=name=>cards.filter(c=>c===name).length;
  return {
    forestSealStone:count('Forest Seal Stone SIT'),
    floatStone:count('Float Stone BKT'),
    battleVipPass:count('Battle VIP Pass FST'),
    trubbish:count('Trubbish FST'),
    garbodor:count('Garbodor BKP')
  };
}

/**
 * Mechanical source-only first-turn followup. At most six original physical
 * K0-positive source deals, bounded to opponent's next root. Actions are
 * proposed by the authenticated owner bot and validated by the native Store.
 * No full-game outcome and no opponent-private data.
 * @returns {object}
 */
function run({observeOpponentReturn=false}={}){
  assert.equal(typeof observeOpponentReturn,'boolean');
  verifyFrame();
  const {resolvedPrintedDecks}=
    require('../evaluation/rank11-conditional-k0-screen-run.cjs');
  const decks=resolvedPrintedDecks();
  assert.equal(decks.engineRevision,frame.engineRevision);
  const {runMatch}=require('./headless.cjs');
  const {actorObservation}=require('./actor-observation-contract.cjs');
  const root=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
  const native=p=>require(path.join(root,p));
  const {SimpleTacticsAi}=native('simple-bot/simple-tactics-ai');
  const {PlayCardAction,PlayerType,SlotType}=
    native('game/store/actions/play-card-action');
  const {UseAbilityAction}=native('game/store/actions/game-actions');
  const {ResolvePromptAction}=
    native('game/store/actions/resolve-prompt-action');
  const {GamePhase}=native('game/store/state/state');
  const board={player:PlayerType.ANY,slot:SlotType.BOARD,index:0};
  const active={player:PlayerType.BOTTOM_PLAYER,slot:SlotType.ACTIVE,index:0};
  const rows=[];
  for(const selected of frame.selectedExactK0){
    const original=SimpleTacticsAi.prototype.decodeNextAction;
    const STOP=Symbol('agent32-end-of-registered-mechanical-source-turn');
    const row={index:selected.index,seed:selected.seed,
      status:'not-yet-observed',actions:[],K1SourceSearchOccurred:false,
      ...(observeOpponentReturn?{opponentRootProposals:[],
        opponentFirstRootObserved:false,sourceReturnObserved:false}: {})};
    let stage=-1,needs=[];
    /** @param {object} state @param {string} status @param {string} reason */
    function stop(state,status,reason){
      row.status=status;
      row.stopReason=reason;
      row.stopGlobalTurn=state?.turn??null;
      row.lastNativeStage=stage;
      throw STOP;
    }
    /** @param {object} owner @param {string} name @param {object} target */
    function play(owner,name,target){
      const index=owner.hand.cards.findIndex(c=>c.name===name);
      return index<0?null:new PlayCardAction(owner.id,index,target);
    }
    /**
     * Search only from a legitimate source-owned deck prompt, and require
     * Store validate to accept exact card objects.
     */
    function pickCards(state,owner,prompt,names){
      if(prompt?.constructor?.name!=='ChooseCardsPrompt' ||
        prompt.playerId!==owner.id || prompt.cards!==owner.deck) return null;
      const chosen=[],pool=[...prompt.cards.cards];
      for(const name of names){
        const index=pool.findIndex(c=>c.fullName===name);
        if(index<0)return null;
        chosen.push(pool.splice(index,1)[0]);
      }
      return prompt.validate(chosen,state)?
        new ResolvePromptAction(prompt.id,chosen):null;
    }
    /** @param {object} state @param {object} action @param {string} note */
    function select(state,action,note){
      if(!action)stop(state,'blocked-own-action','Missing own hand card or native target: '+note);
      row.actions.push({turn:state.turn,stage,note,
        nativeActionClass:action.constructor.name});
      stage++;
      return action;
    }
    function indexOfTrubbish(owner){
      return owner.bench.findIndex(s=>s.getPokemonCard()?.name==='Trubbish');
    }
    const hooked=SimpleTacticsAi.prototype.decodeNextAction=function followup(state){
      const owner=state.players[0];
      const actor=state.players.find(p=>p.id===this.client?.id);
      const pending=state.prompts.find(p=>p.result===undefined);
      if(stage===11 && !pending && state.turn>=2 &&
        state.activePlayer===1 && actor===state.players[1]){
        const garbodor=owner.bench.find(s=>
          s.getPokemonCard()?.name==='Garbodor' &&
          s.tools.some(t=>t.name==='Float Stone'));
        row.witness={
          atOpponentOriginalRoot:true,sourceUsedVSTAR:owner.usedVSTAR===true,
          sourceActiveForestStone:owner.active.tools.some(t=>
            t.name==='Forest Seal Stone'),
          sourceEquippedGarbodor:Boolean(garbodor),
          sourceGarbodorBenchIndex:garbodor?owner.bench.indexOf(garbodor):null
        };
        const successful=row.witness.sourceUsedVSTAR&&
          row.witness.sourceEquippedGarbodor;
        if(successful&&observeOpponentReturn){
          const opponentOwnerView=actorObservation(state,1);
          assert.equal(opponentOwnerView.actorSeat,1);
          assert.equal(opponentOwnerView.decisionKind,'owner-root');
          const held=opponentOwnerView.ownHand;
          row.opponentFirstOwnerResources={
            handSize:held.length,
            fieldBlower:held.filter(p=>p==='Field Blower GRI').length,
            guzma:held.filter(p=>p==='Guzma BUS').length,
            vsSeeker:held.filter(p=>p==='VS Seeker PHF').length,
            quickBall:held.filter(p=>p==='Quick Ball FST').length,
            ownerDeckCount:opponentOwnerView.ownPublic.deckCount,
            sourceToolGarbodorPublic:true,
            privateEvidenceScope:'opponent-acting-owner private hand audit only; no source bot decision input'
          };
          row.opponentFirstRootObserved=true;
          stage=12;
        }else{
          stop(state,successful?'native-equipped-garbotoxin-source-first-root':
            'native-nextturn-witness-not-established',
            successful?'First opponent root after real Boost Shake':
              'Native next turn lacks expected public Tool-Garbodor/VSTAR board');
        }
      }
      if(stage===12){
        // Continue through the actual opposing bot's turn, without choosing
        // any opposing cards. Store-driven turn progression is required to
        // reach a genuine source-owner decision on the following turn.
        if(!pending&&actor===owner&&state.activePlayer===0&&state.turn>=3){
          row.sourceReturnObserved=true;
          const equipped=owner.bench.filter(slot=>
            slot.getPokemonCard()?.name==='Garbodor'&&
            slot.tools.some(tool=>tool.name==='Float Stone'));
          row.afterOpponentPublic={
            turn:state.turn,sourceEquippedGarbodorCount:equipped.length,
            sourceUsedVSTAR:owner.usedVSTAR===true,
            sourceActivePrinting:owner.active.getPokemonCard()?.fullName??null,
            sourceRemainingPrizes:owner.prizes.reduce((n,p)=>n+p.cards.length,0)
          };
          stop(state,'native-opponent-turn-returned-to-source-root',
            'Opponent completed a real Store turn; source root available');
        }
        const proposed=original.call(this,state);
        if(!pending&&actor===state.players[1]&&
            state.turn===2&&state.activePlayer===1&&
            row.opponentRootProposals.length<80){
          const proposedCard=proposed?.constructor?.name==='PlayCardAction'?
            state.players[1].hand.cards[proposed.handIndex]:null;
          row.opponentRootProposals.push({
            turn:state.turn,kind:proposed?.constructor?.name??null,
            fieldBlowerProposed:proposedCard?.fullName==='Field Blower GRI',
            qualification:'proposal-only; Store acceptance not attested here'
          });
        }
        return proposed;
      }
      if(actor!==owner)return original.call(this,state);
      if(stage===-1){
        if(state.turn!==1||state.activePlayer!==0||
          state.phase!==GamePhase.PLAYER_TURN||pending)
          return original.call(this,state);
        const view=actorObservation(state,0);
        const starter=view.ownPublic.active?.name;
        const bench=view.ownPublic.bench.map(slot=>slot?.printing??null);
        const hand=view.ownHand;
        assert.equal(starter,'Oranguru V');
        assert.equal(sha256(hand),selected.sourceFirstOwnerHandSha256);
        assert.deepEqual(bench,selected.sourceBenchAtK0);
        assert.ok(hand.includes('Boost Shake EVS'));
        assert.ok(!hand.includes('Trubbish FST'));
        assert.ok(!hand.includes('Battle VIP Pass FST'));
        assert.ok(!bench.some(p=>p?.startsWith('Trubbish FST')));
        assert.equal(hand.length+1+bench.filter(Boolean).length,8);
        assert.equal(owner.active.tools.length,0);
        needs=['Forest Seal Stone SIT','Float Stone BKT']
          .filter(name=>!hand.includes(name));
        assert.ok(needs.length>=1);
        row.originalK0Replayed=true;
        row.initialToolNeeds=needs;
        stage=0;
      }
      if(stage===11){
        if(pending)return original.call(this,state);
        stop(state,'blocked-native-end-turn',
          'Boost Shake did not reach opponent root before another source root');
      }
      let action=null;
      if(pending){
        switch(stage){
          case 1:{
            if(pending.playerId===owner.id&&pending.cards===owner.deck &&
              pending.constructor.name==='ChooseCardsPrompt'){
              const k1=visibleK1Resources(pending,owner);
              row.K1SourceSearchOccurred=true;
              row.K1OwnerSearchCounts=k1;
              const missing=[];
              if(k1.battleVipPass===0)missing.push('Battle VIP Pass');
              if(k1.trubbish===0)missing.push('Trubbish');
              if(k1.garbodor===0)missing.push('Garbodor');
              for(const name of needs){
                if(name==='Forest Seal Stone SIT'&&k1.forestSealStone===0)
                  missing.push('Forest Seal Stone');
                if(name==='Float Stone BKT'&&k1.floatStone===0)
                  missing.push('Float Stone');
              }
              if(missing.length)stop(state,'k1-required-resource-unavailable',
                'Legitimate source first own-deck search missing: '+missing.join(', '));
              action=pickCards(state,owner,pending,needs);
            }
            break;
          }
          case 4:
            action=pickCards(state,owner,pending,['Battle VIP Pass FST']);
            break;
          case 6:
            action=pickCards(state,owner,pending,['Trubbish FST']);
            break;
          case 9:
            action=pickCards(state,owner,pending,['Garbodor BKP']);
            break;
          case 10:{
            const i=indexOfTrubbish(owner);
            if(pending.constructor.name==='ChoosePokemonPrompt'&&
              pending.playerId===owner.id&&i>=0&&
              pending.validate([owner.bench[i]],state)){
              action=new ResolvePromptAction(pending.id,[owner.bench[i]]);
            }
            break;
          }
          default:break;
        }
        if(action)return select(state,action,'Owner-validated native search/target prompt');
        // Unrelated mandatory shuffle/wait prompts are delegated without
        // consuming our stage; our own search and target prompts must validate.
        if([1,4,6,9,10].includes(stage) &&
          (pending.constructor.name==='ChooseCardsPrompt' ||
           pending.constructor.name==='ChoosePokemonPrompt') &&
          pending.playerId===owner.id)
          stop(state,'blocked-own-prompt','Expected owner prompt selection rejected');
        return original.call(this,state);
      }
      switch(stage){
        case 0:
          action=new UseAbilityAction(owner.id,'Back Order',active);
          break;
        case 2:
          action=owner.active.tools.length===0?
            play(owner,'Forest Seal Stone',active):null;
          break;
        case 3:
          action=!owner.usedVSTAR&&owner.active.tools.some(t=>
            t.name==='Forest Seal Stone')?
            new UseAbilityAction(owner.id,'Star Alchemy',active):null;
          break;
        case 5:
          action=play(owner,'Battle VIP Pass',board);
          break;
        case 7:{
          const i=indexOfTrubbish(owner);
          if(i>=0&&owner.bench[i].tools.length===0)
            action=play(owner,'Float Stone',{
              player:PlayerType.BOTTOM_PLAYER,slot:SlotType.BENCH,index:i});
          break;
        }
        case 8:{
          const i=indexOfTrubbish(owner);
          if(i>=0&&owner.bench[i].tools.some(t=>t.name==='Float Stone'))
            action=play(owner,'Boost Shake',board);
          break;
        }
        default:break;
      }
      return select(state,action,'Owner-sequenced original Star-fetched VIP route');
    };
    try{
      try{
        const game=runMatch({
          ...decks,seed:selected.seed,
          label:'rank11-conditional-K0-screen-v1:'+selected.index,
          maxActions:200,strictPromptValidation:true,
          forestSealSearchCorrection:true,
          battleCompressorPositiveSelectionCorrection:true,
          isolatePolicyRandomness:true
        });
        if(row.status==='not-yet-observed'){
          row.status=observeOpponentReturn&&row.opponentFirstRootObserved?
            (game.finished===true?'engine-terminal-before-next-source-root':
              'censored-before-next-source-root'):
            'blocked-native-no-boundary';
          row.stopReason=observeOpponentReturn&&row.opponentFirstRootObserved?
            'Native run returned before a next source-owner decision':
            'Native run returned before specified stop';
          if(observeOpponentReturn&&row.opponentFirstRootObserved){
            row.nativeEngineFinished=game.finished===true;
            row.nativeEngineWinner=game.finished===true?game.winner:null;
          }
        }
      }catch(error){
        if(error!==STOP){
          row.status='blocked-native-exception';
          row.stopReason=String(error?.stack??error).slice(0,1500);
        }
      }
    }finally{
      assert.strictEqual(SimpleTacticsAi.prototype.decodeNextAction,hooked);
      SimpleTacticsAi.prototype.decodeNextAction=original;
    }
    row.selectedActions=row.actions.length;
    row.qualifiedCompetitiveGame=false;
    row.gameWinner=null;
    rows.push(row);
  }
  return {
    schema:observeOpponentReturn?
      'agent1-rank11-six-native-opponent-return-v1':
      'agent32-rank11-six-star-fetched-VIP-native-K1-v1',
    registrationSha256:frame.frameSha256,
    parentFrameSha256:frame.parentFrameSha256,
    engineRevision:frame.engineRevision,
    scheduled:frame.exactK0Count,attempted:rows.length,
    handAndBenchParity:rows.filter(r=>r.originalK0Replayed===true).length,
    firstLegalK1Searches:rows.filter(r=>r.K1SourceSearchOccurred).length,
    completedNativeEquippedGarbodor:rows.filter(r=>
      r.status==='native-equipped-garbotoxin-source-first-root').length,
    K1Unavailable:rows.filter(r=>
      r.status==='k1-required-resource-unavailable').length,
    blocked:rows.filter(r=>r.status.startsWith('blocked')).length,
    ...(observeOpponentReturn?{
      opponentFirstRoots:rows.filter(r=>r.opponentFirstRootObserved).length,
      sourceReturnRoots:rows.filter(r=>r.sourceReturnObserved).length,
      nonreturningTerminals:rows.filter(r=>
        r.status==='engine-terminal-before-next-source-root').length,
      nonreturningCensors:rows.filter(r=>
        r.status==='censored-before-next-source-root').length
    }:{}),
    rows,competitiveQualifiedGames:0,
    warning:'Retrospectively K0-selected native mechanics check, not all-field strength, not a win rate; no card target is read before its owner deck search.'
  };
}
if(require.main===module){
  const output=run({observeOpponentReturn:
    process.argv.includes('--opponent-return')});
  process.stdout.write(JSON.stringify(output,null,2)+'\n');
  if(output.blocked>0)process.exitCode=1;
}
module.exports={sha256,verifyFrame,visibleK1Resources,run};
