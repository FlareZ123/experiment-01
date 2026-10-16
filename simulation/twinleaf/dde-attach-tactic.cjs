'use strict';

const path=require('node:path');
const root=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
/** @param {string} name */
const load=name=>require(path.join(root,name));

/**
 * Check whether effective Energy units cover Apex Dragon's printed GGF cost.
 * The availability of an attack also depends on other game-state restrictions.
 * This check intentionally does not simulate an attack or mutate Card history.
 *
 * @param {Array<number|string>} provided Actual effective Energy units.
 * @param {object} types Pinned Twinleaf CardType constants.
 * @returns {boolean}
 */
function coversPrintedApexCost(provided, types) {
  const required = [types.GRASS, types.GRASS, types.FIRE];
  const assign = (costIndex, used) => {
    if (costIndex === required.length) return true;
    return provided.some((unit, index) =>
      !used.has(index) && (unit === required[costIndex] || unit === types.ANY) &&
      assign(costIndex + 1, new Set([...used, index]))
    );
  };
  return assign(0, new Set());
}

/**
 * Opt-in research tactic to recover a missed legal Double Dragon attachment.
 * Insert immediately AFTER upstream AttachEnergyTactic so proven static-score
 * attachments retain their existing priority.
 *
 * It tests the actual PlayCardAction on a cloned engine state and requires
 * the attached card to contribute effective Energy under current effects.
 * No source changes to Twinleaf are needed.
 *
 * @returns {Function} A class accepted by SimpleTacticsAi options.tactics.
 */
function makeDoubleDragonAttachTactic() {
  const {SimpleTactic}=load('simple-bot/simple-tactics/simple-tactics');
  const {PlayCardAction,PlayerType,SlotType}=
    load('game/store/actions/play-card-action');
  const {Simulator}=load('game/bots/simulator');
  const {CheckProvidedEnergyEffect}=load('game/store/effects/check-effects');
  const {CardType}=load('game/store/card/card-types');

  return class DoubleDragonAttachTactic extends SimpleTactic {
    /** @param {object} state @param {object} player @returns {object|undefined} */
    useTactic(state,player) {
      if (state.prompts.some(p=>p.result===undefined)) return;
      if (player.energyPlayedTurn>=state.turn) return;
      const handIndex=player.hand.cards.findIndex(c=>
        c.name==='Double Dragon Energy'&&c.set==='ROS');
      if (handIndex<0) return;
      const wanted=player.hand.cards[handIndex];
      const activePosition={
        player:PlayerType.BOTTOM_PLAYER,slot:SlotType.ACTIVE,index:0
      };
      const benchPositions=player.bench.map((_,index)=>({
        player:PlayerType.BOTTOM_PLAYER,slot:SlotType.BENCH,index
      }));
      // Matchup-specific attacker hierarchy. Copy-payload Dragons such as
      // Kyurem and Dialga remain eligible once unpowered Regidrago lines are
      // considered. VSTAR targets already paying printed Apex are lower tier.
      let reserveForBench=false;
      const benchTiers=benchPositions.map(target=>{
        const pokemon=player.bench[target.index].getPokemonCard();
        if(pokemon?.name==='Regidrago VSTAR'&&pokemon.set==='SIT')return 0;
        if(pokemon?.name==='Regidrago V'&&pokemon.set==='SIT')return 1;
        return 2;
      });
      const hasDragon=benchPositions.some(target=>
        player.bench[target.index].getPokemonCard()?.cardType.includes(CardType.DRAGON));
      try {
        const sim=new Simulator(state,this.options.arbiter);
        const self=sim.store.state.players.find(p=>p.id===player.id);
        const hasPrintedApex=(slot)=>{
          const check=new CheckProvidedEnergyEffect(self,slot);
          sim.store.reduceEffect(sim.store.state,check);
          const attached=new Set(slot.energies.cards);
          const supplied=check.energyMap.filter(row=>attached.has(row.card))
            .flatMap(row=>row.provides);
          return coversPrintedApexCost(supplied,CardType);
        };
        const active=self.active.getPokemonCard();
        if(hasDragon&&active?.name==='Regidrago VSTAR'&&active.set==='SIT')
          reserveForBench=hasPrintedApex(self.active);
        benchPositions.forEach((target,i)=>{
          const pokemon=self.bench[target.index].getPokemonCard();
          if(pokemon?.name==='Regidrago VSTAR'&&pokemon.set==='SIT'&&
              hasPrintedApex(self.bench[target.index]))benchTiers[i]=3;
        });
      } catch {
        reserveForBench=false;
      }
      const orderedBench=benchPositions.slice().sort((a,b)=>
        benchTiers[a.index]-benchTiers[b.index]);
      const positions=reserveForBench
        ? [...orderedBench,activePosition]
        : [activePosition,...orderedBench];
      for(const target of positions) {
        const action=new PlayCardAction(player.id,handIndex,target);
        try {
          const sim=new Simulator(state,this.options.arbiter);
          sim.dispatch(action);
          if (sim.store.state.prompts.some(p=>p.result===undefined)) continue;
          const updated=sim.store.state.players.find(p=>p.id===player.id);
          const location=target.slot===SlotType.ACTIVE
            ? updated.active:updated.bench[target.index];
          if (!location.cards.includes(wanted)) continue;
          const check=new CheckProvidedEnergyEffect(updated,location);
          sim.store.reduceEffect(sim.store.state,check);
          const units=check.energyMap
            .filter(row=>row.card===wanted)
            .reduce((n,row)=>n+row.provides.length,0);
          if(units>0) return action;
        } catch {
          continue;
        }
      }
    }
  };
}

/** @param {object} options Existing SimpleBotOptions. @returns {object} */
function withDoubleDragonRecovery(options) {
  const basic=options.tactics.findIndex(Tactic=>Tactic.name==='AttachEnergyTactic');
  if(basic<0) throw new Error('Required default AttachEnergyTactic missing');
  return {
    ...options,
    tactics:[
      ...options.tactics.slice(0,basic+1),
      makeDoubleDragonAttachTactic(),
      ...options.tactics.slice(basic+1)
    ]
  };
}
module.exports={coversPrintedApexCost,makeDoubleDragonAttachTactic,withDoubleDragonRecovery};
