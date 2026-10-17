'use strict';
const assert=require('node:assert/strict');
const path=require('node:path');
const {initializeCards}=require('./headless.cjs');
const {preparedRegidrago}=require('./apex-attack-action.cjs');
const root=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
const load=name=>require(path.join(root,name));

/** Inspect an actual paid Apex Dragon copy of printed Mega Dragonite ex.
 * The real Store owns every prompt. This is an established synthetic board,
 * not a dealt or competitively qualified source game.
 */
function inspectRyunoGlideDiscard(){
  const manager=initializeCards();
  const f=preparedRegidrago();
  f.attachFire();
  const mega=manager.getCardByName('Mega Dragonite ex ASC');
  const doubleDragon=manager.getCardByName('Double Dragon Energy ROS');
  assert.ok(mega&&doubleDragon,'Missing rank14 printed payload or Energy');
  f.attacking.discard.cards.push(mega);
  f.attacking.active.cards.push(doubleDragon);
  f.attacking.active.energies.cards.push(doubleDragon);
  const attached=f.attacking.active.energies.cards.slice();
  const {AttackAction}=load('game/store/actions/game-actions');
  const {ResolvePromptAction}=load('game/store/actions/resolve-prompt-action');
  f.store.dispatch(new AttackAction(101,'Apex Dragon'));
  const choose=f.state.prompts.find(p=>p.result===undefined&&
    p.constructor.name==='ChooseAttackPrompt');
  assert.ok(choose&&choose.cards.includes(mega));
  assert.equal(choose.validate(mega.attacks[0]),true);
  f.store.dispatch(new ResolvePromptAction(choose.id,mega.attacks[0]));
  const pending=f.state.prompts.filter(p=>p.result===undefined);
  const variants=[
    {name:'one-Double-Dragon',cards:[doubleDragon]},
    {name:'two-Basic',cards:attached.slice(0,2)},
    {name:'one-Grass-one-Fire',cards:[attached[0],attached[2]]}
  ];
  const outcomes=pending.map(p=>({
    kind:p.constructor.name,
    selectionFields:Object.keys(p).filter(k=>!['cards','source'].includes(k)),
    candidates:variants.map(v=>{
      let accepted=false,reason=null;
      try {accepted=Boolean(p.validate(v.cards,f.state));}
      catch(error){reason=String(error.message||error);}
      return {name:v.name,accepted,reason};
    })
  }));
  return {
    schema:'apex-mega-dragonite-discard-source-board-v1',
    printedPayload:mega.fullName,printedAttack:mega.attacks[0],
    engineEnergyProvision:'3 Basic Energy + 1 Double Dragon Energy',
    beforeAttached:attached.map(c=>c.fullName),
    afterAttached:f.attacking.active.energies.cards.map(c=>c.fullName),
    pending:outcomes,
    damage:f.defending.active.damage,
    originalQueueLength:pending.length,
    qualifiedForCompetitiveInference:false
  };
}
if(require.main===module)process.stdout.write(
  JSON.stringify(inspectRyunoGlideDiscard(),null,2)+'\n');
module.exports={inspectRyunoGlideDiscard};
