'use strict';
const assert=require('node:assert/strict');
const {initializeCards}=require('./headless.cjs');
const {actorObservation}=require('./actor-observation-contract.cjs');
const {chooseActorRootIntent}=require('./agent34-actor-only-root-policy.cjs');
const {choosePublicContextSpecialEnergy}=
  require('./agent17-public-context-special-energy.cjs');
const {stage,nativeAttack}=
  require('./agent5-attack-special-arbitration-native.cjs');

const DD='Double Dragon Energy ROS';
const P='Psychic Energy SVE';
const options={publicContextSpecialEnergy:true};

/** @param {object} x @param {number} world */
function conceal(x,world){
  const cards=initializeCards();
  let id=900000+world*100;
  const fresh=name=>{
    const card=cards.getCardByName(name);
    assert.ok(card,name);card.id=id++;return card;
  };
  if(world===0){
    x.owner.deck.cards[0]=fresh(DD);
    x.opponent.hand.cards.push(fresh(DD));
  }else{
    x.owner.prizes[0].cards[0]=fresh(DD);
    x.opponent.deck.cards[0]=fresh(DD);
    x.opponent.hand.cards.push(fresh(P));
  }
}

/** @param {object} x */
function inventories(x){
  const identity=p=>p.map(c=>c.fullName).sort();
  return {
    owner:identity([...x.owner.deck.cards,
      ...x.owner.prizes.flatMap(p=>p.cards)]),
    opponent:identity([...x.opponent.hand.cards,
      ...x.opponent.deck.cards,
      ...x.opponent.prizes.flatMap(p=>p.cards)])
  };
}

/** @param {0|1} seat */
function verifySeat(seat){
  const rows=[];
  for(let world=0;world<2;world++){
    const x=stage(seat);
    conceal(x,world);
    const view=actorObservation(x.state,seat);
    const chosen=chooseActorRootIntent(view,x.catalog,options);
    const alternate=choosePublicContextSpecialEnergy(view,x.catalog);
    assert.deepStrictEqual(chosen,{kind:'attack',attackName:'Gnaw'});
    assert.deepStrictEqual(alternate,{kind:'attach-special-energy',
      printing:DD,handIndex:0,slot:'bench',index:1});
    const settled=nativeAttack(x);
    rows.push({world,view,chosen,alternate,inventory:inventories(x),
      damage:settled.damageAfter});
  }
  assert.deepStrictEqual(rows[0].view,rows[1].view,
    'Owner observation changed across unseen K0 card arrangements');
  assert.deepStrictEqual(rows[0].inventory,rows[1].inventory,
    'Physical card multiset must remain fixed across worlds');
  assert.deepStrictEqual(rows[0].chosen,rows[1].chosen);
  assert.deepStrictEqual(rows[0].alternate,rows[1].alternate);
  assert.equal(rows[0].damage,rows[1].damage);
  return {seat,ownerViewInvariant:true,physicalInventoryPreserved:true,
    chosen:rows[0].chosen,alternative:rows[0].alternate,
    genuineNativeAttackSettledInBothWorlds:true,
    actualDamage:rows[0].damage};
}
function run(){
  return {schema:'agent18-k0-root-native-invariance-v1',
    pin:'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    records:[verifySeat(0),verifySeat(1)],
    competitiveQualifiedGames:0,
    limit:'Staged non-60 root; no source-dealt matchup or strategic rank.'};
}
if(require.main===module)process.stdout.write(JSON.stringify(run(),null,2)+'\n');
module.exports={conceal,inventories,verifySeat,run};
