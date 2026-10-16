'use strict';

const path=require('node:path');
const {immediateBurrowDeckout}=require('./bunnelby-evolution-policy.cjs');
const source=require('../../results/aichi-2026/full-decklists.json');

const root=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
/** @param {string} relative */
const load=relative=>require(path.join(root,relative));

const rank2=source.decks.find(d=>d.rank===2);
if(!rank2 || rank2.archetype!=='Vileplume Control') {
  throw new Error('Published rank-2 source inventory unavailable');
}
const originalCounts=new Map(rank2.cards.map(c=>[c.name,c.count]));
const sourceLineage=new Map([
  ['Oddish',['Gloom']],
  ['Gloom',['Vileplume','Vileplume-GX']],
  ['Pidgey',['Pidgeotto']],
  ['Pidgeotto',['Pidgeot ex']],
  ['Lillipup',['Herdier']],
  ['Herdier',['Stoutland']]
]);
for(const targets of sourceLineage.values()) {
  for(const target of targets) {
    if(!(originalCounts.get(target)>0)) {
      throw new Error('Expected rank-2 source evolution target '+target);
    }
  }
}

/**
 * Before a player searches their deck, the private full deck list is known
 * but the face-down Prize identities and deck composition are not. Count only
 * cards exposed to their owner or public in play. Unknown cards could still
 * be in either the concealed deck or Prize locations. An optimistic potential
 * is an information-set-legal proposal, not a promise of search success.
 * No true deck-card identity, Prize identity, or shuffled order is consulted.
 * @param {object} player Pinned Twinleaf Player.
 * @returns {boolean} Whether a source-list Stage target remains possible.
 */
function hasSourceVisibleBenchEvolutionPotential(player) {
  if(player.deck.cards.length===0) return false;
  const visible=[
    ...player.hand.cards,
    ...player.discard.cards,
    ...player.lostzone.cards,
    ...player.active.cards,
    ...player.bench.flatMap(slot=>slot.cards)
  ];
  const observed=new Map();
  for(const card of visible) {
    observed.set(card.name,(observed.get(card.name)||0)+1);
  }
  return player.bench.some(slot=>{
    const current=slot.getPokemonCard();
    if(!current) return false;
    const targets=sourceLineage.get(current.name)||[];
    return targets.some(target=>
      (originalCounts.get(target)||0)>(observed.get(target)||0));
  });
}

/**
 * Conservative K0-safe proposal of the rank-2 TM Evolution attack.
 * Even when all target cards happen to be hidden in Prizes, the agent may
 * announce Evolution under its incomplete information. This is intentional.
 */
function makeSourceVisibleBunnelbyTactic() {
  const {SimpleTactic}=load('simple-bot/simple-tactics/simple-tactics');
  const {AttackAction}=load('game/store/actions/game-actions');
  const {Simulator}=load('game/bots/simulator');
  return class SourceVisibleBunnelbyTactic extends SimpleTactic {
    /** @param {object} state @param {object} player */
    useTactic(state,player) {
      if(state.prompts.some(p=>p.result===undefined)) return;
      if(player.active.getPokemonCard()?.fullName!=='Bunnelby PRC' ||
        !player.active.tools.some(t=>t.fullName==='Technical Machine: Evolution PAR') ||
        !hasSourceVisibleBenchEvolutionPotential(player) ||
        immediateBurrowDeckout(state,player)) return;
      const action=new AttackAction(player.id,'Evolution');
      try{
        new Simulator(state,this.options.arbiter).dispatch(action);
        return action;
      }catch{return;}
    }
  };
}

/** Use the same incomplete-information rule for Bunnelby's second Barrage. */
function makeSourceVisibleBarrageResolver() {
  const {PromptResolver}=load('simple-bot/prompt-resolver/prompt-resolver');
  const {ChooseAttackPrompt}=load('game/store/prompts/choose-attack-prompt');
  const {ResolvePromptAction}=load('game/store/actions/resolve-prompt-action');
  const {GamePhase}=load('game/store/state/state');
  return class SourceVisibleBarrageResolver extends PromptResolver {
    /** @param {object} state @param {object} player @param {object} prompt */
    resolvePrompt(state,player,prompt) {
      if(!(prompt instanceof ChooseAttackPrompt) ||
        state.phase!==GamePhase.ATTACK ||
        player.active.getPokemonCard()?.fullName!=='Bunnelby PRC' ||
        !hasSourceVisibleBenchEvolutionPotential(player) ||
        immediateBurrowDeckout(state,player)) return;
      const index=prompt.cards.findIndex(c=>
        c.fullName==='Technical Machine: Evolution PAR');
      if(index<0) return;
      const attack=prompt.cards[index].attacks.find(a=>a.name==='Evolution');
      if(!attack || prompt.options.blocked.some(row=>
        row.index===index && row.attack===attack.name) ||
        !prompt.validate(attack)) return;
      return new ResolvePromptAction(prompt.id,attack);
    }
  };
}

/**
 * Versioned, opt-in alternative to the existing hidden-deck-aware Bunnelby
 * tactic. The caller must choose exactly one variant; the default is intact.
 * @param {object} options SimpleBotOptions.
 */
function withSourceVisibleBunnelbyLine(options) {
  if(!Array.isArray(options.tactics)||!Array.isArray(options.promptResolvers))
    throw new Error('Source-visible Bunnelby requires tactics and prompt resolvers');
  if(options.tactics.some(t=>/BunnelbyEvolutionTactic|SourceVisibleBunnelbyTactic/.test(t.name)) ||
    options.promptResolvers.some(r=>/BarrageEvolutionResolver|SourceVisibleBarrageResolver/.test(r.name)))
    throw new Error('A Bunnelby evolution variant is already installed');
  const tool=options.tactics.findIndex(t=>t.name==='ToolAwareAttackTactic');
  const attack=tool<0?options.tactics.findIndex(t=>t.name==='AttackTactic'):tool;
  const resolve=options.promptResolvers.findIndex(r=>r.name==='ChooseAttackPromptResolver');
  if(attack<0||resolve<0) throw new Error('Required attack strategy unavailable');
  return {
    ...options,
    tactics:[
      ...options.tactics.slice(0,attack),
      makeSourceVisibleBunnelbyTactic(),
      ...options.tactics.slice(attack)
    ],
    promptResolvers:[
      ...options.promptResolvers.slice(0,resolve),
      makeSourceVisibleBarrageResolver(),
      ...options.promptResolvers.slice(resolve)
    ]
  };
}
module.exports={
  hasSourceVisibleBenchEvolutionPotential,
  makeSourceVisibleBunnelbyTactic,
  makeSourceVisibleBarrageResolver,
  withSourceVisibleBunnelbyLine
};
