'use strict';

/**
 * Research-owned reversible printed-effect adapter for the three missing
 * Stellar Crown Rhyhorn/Rhydon/Rhyperior cards. The pinned vendor CardManager
 * does not implement SCR 74/75/76. These experimental definitions are
 * meaningful only for isolated tests; they are not an upstream card release.
 * The turn decision and Guzma prompt resolution remain actual native Store.
 * @param {object} manager Pinned native CardManager.
 * @param {(name:string)=>any} native Compiled pinned-vendor module loader.
 */
function registerResearchWideWall(manager, native) {
  const {PokemonCard} = native('game/store/card/pokemon-card');
  const {Stage, CardType, TrainerType} =
    native('game/store/card/card-types');
  const {PowerType} = native('game/store/card/pokemon-types');
  const {StateUtils} = native('game/store/state-utils');
  const {
    IS_TRAINER_TARGET, BLOCK_TRAINER_TARGET, IS_ABILITY_BLOCKED
  } = native('game/store/prefabs/prefabs');

  class ResearchRhyhorn extends PokemonCard {
    constructor() {
      super();
      this.name='Rhyhorn';
      this.set='SCR';
      this.setNumber='74';
      this.fullName='Rhyhorn SCR';
      this.stage=Stage.BASIC;
      this.cardType=[CardType.FIGHTING];
      this.hp=100;
      this.evolvesTo=['Rhydon'];
      this.retreat=[CardType.COLORLESS,CardType.COLORLESS,CardType.COLORLESS];
      this.weakness=[{type:CardType.GRASS}];
      this.attacks=[{name:'Horn Attack',
        cost:[CardType.FIGHTING,CardType.COLORLESS],damage:50,text:''}];
    }
  }
  class ResearchRhydon extends PokemonCard {
    constructor() {
      super();
      this.name='Rhydon';
      this.set='SCR';
      this.setNumber='75';
      this.fullName='Rhydon SCR';
      this.stage=Stage.STAGE_1;
      this.evolvesFrom='Rhyhorn';
      this.evolvesTo=['Rhyperior'];
      this.cardType=[CardType.FIGHTING];
      this.hp=140;
      this.retreat=Array(4).fill(CardType.COLORLESS);
      this.weakness=[{type:CardType.GRASS}];
      this.attacks=[{name:'Destructive Horn',
        cost:[CardType.FIGHTING,CardType.COLORLESS,CardType.COLORLESS],
        damage:80,text:'Flip a coin. If heads, discard an Energy from your opponent\'s Active Pokémon.'}];
    }
  }
  class ResearchRhyperior extends PokemonCard {
    constructor() {
      super();
      this.name='Rhyperior';
      this.set='SCR';
      this.setNumber='76';
      this.fullName='Rhyperior SCR';
      this.stage=Stage.STAGE_2;
      this.evolvesFrom='Rhydon';
      this.cardType=[CardType.FIGHTING];
      this.hp=200;
      this.retreat=Array(4).fill(CardType.COLORLESS);
      this.weakness=[{type:CardType.GRASS}];
      this.powers=[{
        name:'Wide Wall',
        powerType:PowerType.ABILITY,
        text:'As long as this Pokémon is in the Active Spot, whenever your opponent plays a Supporter card from their hand, prevent all effects of that card done to all of your Pokémon.'
      }];
      this.attacks=[{
        name:'Drill Run',
        cost:[CardType.FIGHTING,CardType.COLORLESS,CardType.COLORLESS],
        damage:180,
        text:'Discard an Energy from your opponent\'s Active Pokémon.'
      }];
    }
    reduceEffect(store, state, effect) {
      if (!IS_TRAINER_TARGET(effect,{trainerType:TrainerType.SUPPORTER}))
        return state;
      const targetOwner = StateUtils.getOpponent(state,effect.player);
      if (!targetOwner.active.cards.includes(this))
        return state;
      if (IS_ABILITY_BLOCKED(store,state,effect.player,this))
        return state;
      if (effect.target === targetOwner.active ||
        targetOwner.bench.includes(effect.target)) {
        BLOCK_TRAINER_TARGET(effect);
      }
      return state;
    }
  }
  for (const Card of [ResearchRhyhorn, ResearchRhydon,
    ResearchRhyperior]) {
    const card = new Card();
    if (!manager.isCardDefined(card.fullName)) manager.defineCard(card);
  }
  return {
    tag:'agent25-provisional-printed-card-hook',
    cards:['Rhyhorn SCR','Rhydon SCR','Rhyperior SCR'],
    source:'Stellar Crown 74,75,76',
    attackEffectImplemented:false,
    officialPinnedStoreImplementation:false,
    competitivelyQualifiedGames:0
  };
}
module.exports={registerResearchWideWall};
