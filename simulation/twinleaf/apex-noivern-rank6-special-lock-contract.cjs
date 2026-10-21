'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const {initializeCards}=require('./headless.cjs');
const {preparedRegidrago}=require('./apex-attack-action.cjs');

const output=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
/** @param {string} p @returns {any} */
const load=p=>require(path.join(output,p));

/**
 * Verify whether a paid copied Dominating Echo blocks a hand-played DCE
 * on an opposing Basic after the native Store's actual next-turn transition.
 * Initial Pokémon, Energy and held reply card remain injected fixtures.
 * @param {boolean} lockCopied
 * @returns {object}
 */
function stagedEchoDceReply(lockCopied){
  const cards=initializeCards();
  const get=name=>cards.getCardByName(name);
  const noivern=get('Noivern ex PAL');
  const thorns=get('Iron Thorns ex TWM');
  const dce=get('Double Colorless Energy SUM');
  assert.ok(noivern&&thorns&&dce,'Pinned source card missing');
  const f=preparedRegidrago();
  f.attachFire();
  f.defending.active.cards.splice(0,1,thorns);
  if(lockCopied)f.attacking.discard.cards.push(noivern);
  const source=lockCopied?noivern:f.dratini;
  const attackName=lockCopied?'Dominating Echo':'Tail Snap';
  const {AttackAction}=load('game/store/actions/game-actions');
  const {ResolvePromptAction}=load('game/store/actions/resolve-prompt-action');
  const {PlayCardAction,PlayerType,SlotType}=
    load('game/store/actions/play-card-action');
  const {GamePhase}=load('game/store/state/state');
  const {clearCopyAttackSessionsForTests}=
    load('game/store/prefabs/copy-attack-delegation');
  try {
    f.store.dispatch(new AttackAction(101,'Apex Dragon'));
    const select=f.state.prompts.find(p=>p.result===undefined&&
      p.constructor.name==='ChooseAttackPrompt');
    assert.ok(select?.cards.includes(source),'Expected donor in native prompt');
    const attack=source.attacks.find(a=>a.name===attackName);
    assert.ok(attack&&select.validate(attack,f.state));
    f.store.dispatch(new ResolvePromptAction(select.id,attack));
    for(let n=0;n<12;n++){
      const p=f.state.prompts.find(x=>x.result===undefined);
      if(!p)break;
      assert.equal(p.constructor.name,'WaitPrompt');
      f.store.dispatch(new ResolvePromptAction(p.id,null));
    }
    const nativeBefore={turn:f.state.turn,activePlayer:f.state.activePlayer,
      phase:f.state.phase};
    assert.equal(f.state.activePlayer,1,
      'Native copied attack/Waits must hand off to opposing player');
    assert.equal(f.state.turn,5);
    assert.equal(f.state.phase,GamePhase.PLAYER_TURN);
    f.defending.hand.cards.push(dce);
    const dceIndex=f.defending.hand.cards.indexOf(dce);
    assert.ok(dceIndex>=0,'DCE must be a physical held card');
    const target={player:PlayerType.TOP_PLAYER,slot:SlotType.ACTIVE,index:0};
    let rejectedByDispatch=false;
    let errorName=null;
    try {
      f.store.dispatch(new PlayCardAction(202,dceIndex,target));
    } catch(e){
      rejectedByDispatch=true;
      errorName=e.constructor?.name??'Error';
    }
    const dceAttached=f.defending.active.energies.cards.includes(dce);
    const handRetained=f.defending.hand.cards.includes(dce);
    assert.equal(dceAttached,!lockCopied,
      lockCopied?'Copied Echo must block hand DCE attachment':
        'Unprotected control must allow native DCE hand attachment');
    assert.equal(handRetained,lockCopied,
      'DCE should remain held iff hand-play lock applies');
    return {copiedAttack:attackName,sourceAttackDamage:f.defending.active.damage,
      nativeBeforeManualNextTurn:nativeBefore,
      replyDcePrinting:dce.fullName,rejectedByDispatch,errorName,
      dceAttached,handRetained,storeOwnTurnHandoff:true,
      competitiveGameQualified:false};
  }finally{
    clearCopyAttackSessionsForTests();
  }
}

/** @returns {object} */
function compareEchoAgainstRank6Dce(){
  return {kind:'native-staged-noivern-dominating-echo-dce-v1',
    pinnedEngine:'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    control:stagedEchoDceReply(false),
    treatment:stagedEchoDceReply(true),
    qualification:'Genuine Store turn handoff from staged board, no actual opening/search/policy or competitive game',
    competitiveGamesQualified:0};
}
if(require.main===module)process.stdout.write(
  JSON.stringify(compareEchoAgainstRank6Dce(),null,2)+'\n');
module.exports={stagedEchoDceReply,compareEchoAgainstRank6Dce};
