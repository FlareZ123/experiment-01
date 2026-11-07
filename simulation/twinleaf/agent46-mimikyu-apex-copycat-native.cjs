'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const {stage}=require('./agent5-attack-special-arbitration-native.cjs');
const {initializeCards}=require('./headless.cjs');

const output=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
const native=part=>require(path.join(output,part));

/**
 * Construct a genuine pinned Store for Mimikyu GRI's printed Copycat.
 * Prior-turn attack metadata is injected directly to distinguish the source
 * copycat-flag gate from the native attack-payment, timing and prompt engine.
 * This is a staged rule witness, never a naturally dealt game or source match.
 *
 * @param {0|1} seat Physical owner seat.
 * @param {'apex'|'gnaw'} lastAttackBranch Prior opponent attack metadata.
 * @returns {object} Staged owner and actual physical Store.
 */
function stageCopycat(seat,lastAttackBranch){
  const x=stage(seat);
  const manager=initializeCards();
  let id=930001;
  const card=fullName=>{
    const c=manager.getCardByName(fullName);
    assert.ok(c,'Native card unavailable: '+fullName);
    c.id=id++;
    return c;
  };

  const mimikyu=card('Mimikyu GRI');
  const firstEnergy=card('Psychic Energy SVE');
  const secondEnergy=card('Psychic Energy SVE');
  x.owner.active.cards.length=0;
  x.owner.active.energies.cards.length=0;
  x.owner.active.cards.push(mimikyu,firstEnergy,secondEnergy);
  x.owner.active.energies.cards.push(firstEnergy,secondEnergy);

  const opposing=lastAttackBranch==='apex'?
    card('Regidrago VSTAR SIT'):card('Venonat MEW');
  x.opponent.active.cards.length=0;
  x.opponent.active.cards.push(opposing);
  const priorAttack=opposing.attacks.find(a=>a.name===
    (lastAttackBranch==='apex'?'Apex Dragon':'Gnaw'));
  assert.ok(priorAttack,'Source attack text unavailable');
  assert.equal(priorAttack.gxAttack===true,false);
  assert.equal(priorAttack.copycatAttack===true,lastAttackBranch==='apex');

  // Dragon Dialga-GX UPR is an authentic owner discard target for Apex Dragon.
  // It is intentionally distinct from Metal Dialga-GX FLI, which is not Dragon.
  const target=card('Dialga-GX UPR');
  assert.ok(target.cardType.includes(native('game/store/card/card-types').CardType.DRAGON));
  assert.equal(target.attacks.some(a=>a.name==='Timeless-GX'&&a.gxAttack===true),true);
  x.owner.discard.cards.push(target);

  x.state.playerLastAttack={
    [x.opponent.id]:{attack:priorAttack,sourceCard:opposing}
  };
  x.state.lastAttack=priorAttack;
  return {x,mimikyu,priorAttack,target,opposing};
}

/**
 * Run the original Card's real Copycat attack through Store dispatch,
 * resolving only nondiscretionary Wait prompts. Never fabricate a choice for
 * the nested Apex Dragon attack that the pinned code may fail to offer.
 *
 * @param {0|1} seat Physical owner seat.
 * @param {'apex'|'gnaw'} branch Opponent last attack.
 * @returns {object} Native prompt sequence, effect and printed flags.
 */
function probe(seat,branch){
  const s=stageCopycat(seat,branch),x=s.x;
  const {AttackAction}=native('game/store/actions/game-actions');
  const {ResolvePromptAction}=native('game/store/actions/resolve-prompt-action');
  const beforeDamage=x.opponent.active.damage;
  const beforeHand=x.owner.hand.cards.length;
  const prompts=[];
  let error=null;
  try{
    x.store.dispatch(new AttackAction(x.owner.id,'Copycat'));
    for(let i=0;i<16;i++){
      const p=x.store.state.prompts.find(q=>q.result===undefined);
      if(!p)break;
      prompts.push({kind:p.constructor.name,owner:p.playerId===x.owner.id});
      if(p.constructor.name!=='WaitPrompt')break;
      x.store.dispatch(new ResolvePromptAction(p.id,null));
    }
  }catch(e){error=String(e?.message??e);}
  return {seat,branch,error,
    originalAttackName:s.priorAttack.name,
    lastAttackIsCopyAttack:s.priorAttack.copycatAttack===true,
    lastAttackIsGxAttack:s.priorAttack.gxAttack===true,
    ownerActivePrint:x.owner.active.getPokemonCard()?.fullName??null,
    opponentActivePrint:x.opponent.active.getPokemonCard()?.fullName??null,
    originalDragonGXInOwnDiscard:x.owner.discard.cards.includes(s.target),
    copiedAttackOffered:prompts.some(p=>p.kind==='ChooseAttackPrompt'),
    nativePrompts:prompts,
    opponentDamageBefore:beforeDamage,
    opponentDamageAfter:x.opponent.active.damage,
    ownerHandBefore:beforeHand,
    ownerHandAfter:x.owner.hand.cards.length,
    opponentPrizeCount:x.opponent.prizes.length,
    ownerUsedGX:x.owner.usedGX===true,
    pendingPromptTypes:x.store.state.prompts
      .filter(p=>p.result===undefined).map(p=>p.constructor.name),
    turnAfter:x.store.state.turn,
    phaseAfter:x.store.state.phase,
    fullPaperGameCertified:false,qualifiedCompetitiveGames:0
  };
}

function run(){
  const rows=[];
  for(const seat of [0,1]){
    const positive=probe(seat,'gnaw');
    assert.equal(positive.error,null);
    assert.equal(positive.lastAttackIsCopyAttack,false);
    assert.equal(positive.opponentDamageAfter>positive.opponentDamageBefore,true,
      'Actual native Copycat must resolve ordinary non-GX Gnaw');
    assert.deepEqual(positive.pendingPromptTypes,[]);

    const apex=probe(seat,'apex');
    assert.equal(apex.error,null);
    assert.equal(apex.lastAttackIsCopyAttack,true);
    assert.equal(apex.lastAttackIsGxAttack,false);
    assert.equal(apex.originalDragonGXInOwnDiscard,true);
    assert.equal(apex.copiedAttackOffered,false,
      'Pinned native source rejects Apex Dragon because it is marked copycat');
    assert.equal(apex.opponentDamageAfter,apex.opponentDamageBefore);
    assert.equal(apex.ownerUsedGX,false);
    assert.deepEqual(apex.pendingPromptTypes,[]);
    rows.push({seat,positive,apex});
  }
  const out={schema:'agent46-mimikyu-gri-copycat-vs-nongx-apex-native-v1',
    pin:'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    sourcePrintedRule:'If opponent used an attack that is not a GX attack, Copycat uses it as this attack',
    sourceHandlerCondition:'lastAttack.copycatAttack === true || lastAttack.gxAttack === true',
    nativeRealStore:true,
    priorAttackMetadataInjected:true,
    originalAichiChampionHasMimikyuAndDialgaGX:true,
    note:'One injected prior-attack state; no full Regidrago turn, nested Timeless-GX, paper randomness, or win rate is certified',
    qualifiedCompetitiveGames:0,rows};
  console.log('AGENT46_MIMIKYU_APEX_COPYCAT_NATIVE '+JSON.stringify(out));
  return out;
}
if(require.main===module)run();
module.exports={stageCopycat,probe,run};
