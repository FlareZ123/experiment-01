'use strict';

const assert=require('node:assert/strict');
const {ironThornsDirect} = require('./new-moon-thorns-starter-joint.cjs');
const source=require('../results/als/new-moon-lockbreak-english-proxy-60.json');

/**
 * Directly visible resources for either native Horror House or an
 * Ability-dependent copied attack under opposing Initialization.
 *
 * Native: Gengar starts in first seven and Energy is visible.
 * Copied: Mewtwo starts in first seven, Cologne and Energy visible.
 *
 * Does not require the Gengar copy payload to be on Bench/discard for the
 * copied branch. It is a resource-visibility model, not an attack model.
 *
 * @param {{gengar:number,mewtwo:number,cologne:number,energy:number,basics:number}} roles
 * @returns {object}
 */
function directChannels(roles) {
  const {gengar,mewtwo,cologne,energy,basics}=roles;
  for(const x of Object.values(roles))assert.ok(Number.isInteger(x)&&x>=0);
  assert.ok(gengar>0 && mewtwo>0 && cologne>0 && energy>0);
  assert.ok(basics>=gengar+mewtwo && basics<=60);
  const params={size:60,hand:7,prizes:6,basics,opponentBasics:4};
  const native=ironThornsDirect({...params,starters:gengar,groups:[energy]});
  const copied=ironThornsDirect({...params,starters:mewtwo,groups:[cologne,energy]});
  const bothNativeAndCopiedResources=ironThornsDirect({
    ...params,starters:gengar,groups:[cologne,energy]
  });
  const eitherStartWithCopiedResources=ironThornsDirect({
    ...params,starters:gengar+mewtwo,groups:[cologne,energy]
  });
  const overlap={
    firstDraw:bothNativeAndCopiedResources.firstDraw+
      copied.firstDraw-eitherStartWithCopiedResources.firstDraw,
    withAllBonuses:bothNativeAndCopiedResources.withAllBonuses+
      copied.withAllBonuses-eitherStartWithCopiedResources.withAllBonuses
  };
  return {
    native,copied,overlap,
    either:{
      firstDraw:native.firstDraw+copied.firstDraw-overlap.firstDraw,
      withAllBonuses:native.withAllBonuses+copied.withAllBonuses-
        overlap.withAllBonuses
    }
  };
}

/** @returns {object} */
function main(){
  assert.equal(source.canonical_id_count_sha256,
    'a693748bc4fc4326142f2dfec26570b9f1e1f7139790d36a089de1137d1cb4c4');
  /** @param {string} name */
  const copies=name=>source.entries.filter(x=>x.name_en===name)
    .reduce((sum,x)=>sum+x.count,0);
  const baseline={
    gengar:copies('Gengar & Mimikyu-GX'),
    mewtwo:copies('Mewtwo & Mew-GX'),
    cologne:copies('Canceling Cologne'),
    energy:copies('Telepathic Psychic Energy')+copies('Basic Psychic Energy'),
    basics:source.counts['Pokémon']-copies('Dusclops')
  };
  assert.deepEqual(baseline,{
    gengar:1,mewtwo:2,cologne:2,energy:6,basics:17
  });
  const structuralSwap={...baseline,gengar:baseline.gengar+1,
    cologne:baseline.cologne-1,basics:baseline.basics+1};
  const sourceResult=directChannels(baseline);
  const alternateResult=directChannels(structuralSwap);
  return {
    schema:'newmoon-two-gengar-one-cologne-visibility-triage-v1',
    actualSourceHash:source.canonical_id_count_sha256,
    baseline,structuralSwap,
    swap:'Hypothetical single printed Gengar & Mimikyu-GX TEU 53 replacing one Canceling Cologne ASR 136',
    rank6_24_29IronThornsFourBasicOpponent:true,
    sourceResult,alternateResult,
    deltaEither:{
      firstDraw:alternateResult.either.firstDraw-sourceResult.either.firstDraw,
      withAllBonuses:alternateResult.either.withAllBonuses-
        sourceResult.either.withAllBonuses
    },
    qualification:'Proxy visibility only. No revised 60 has been game-tested, and neither new list nor matchup strength is nominated.'
  };
}
if(require.main===module)process.stdout.write(JSON.stringify(main(),null,2)+'\n');
module.exports={directChannels,main};
