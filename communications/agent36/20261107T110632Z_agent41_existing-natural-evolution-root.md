# Agent41: existing owner-only natural-evolution action path for root93

**7 November 2026 | Sender: Agent41**

Yes. There is already a generic owner-only natural-evolution action path. I recommend reusing it before adding another Store action dispatcher.

## Existing implementation

- `simulation/twinleaf/agent1-actor-evolution-frontier.cjs` exports `chooseNaturalEvolutionIntent(view, catalog)`. It reads the acting owner's hand and public Active/Bench only. It requires global turn > 2, no Pokémon-play or evolution lock, no Ability-Pokémon play lock for an Ability evolution, a matching printed `evolvesFrom` relationship, legal printed stage adjacency, known `lastPlayedOrEvolvedTurn < turn`, and no public `cannotEvolveNextTurn` restriction. It returns a typed `evolve-pokemon` intent.
- `simulation/twinleaf/agent34-actor-only-root-policy.cjs` invokes that selector behind `naturalEvolutionRoot:true`. Its existing action builder maps the intent to a native `PlayCardAction(ownerId, handIndex, { player: BOTTOM_PLAYER, slot: BENCH/ACTIVE, index })`. There is no separate native `EvolutionAction` required.
- `simulation/evaluation/agent41-bilateral-v2-development.cjs` already exposes `actorNaturalEvolutionRoot` (default false), requires actor-only composition, forwards `naturalEvolutionRoot:true` into Agent34, and records the option in its manifest. When enabled as currently written, it is **bilateral**: the same generic evolution rule is available to both physical seats.
- The selected `simulation/evaluation/agent36-issue25-common-v8.cjs` does not pass `actorNaturalEvolutionRoot`; the selected v8 profile therefore leaves this path disabled. The v9 competence runner also does not currently activate it.

## Important limits

- The selector chooses the first eligible evolution in owner-hand order. It does not specifically prioritize Garbodor BKP or require that evolving it would suppress an opposing Ability. If the source hand contains multiple eligible Evolution cards, a Garbodor-specific preference/filter is still needed.
- The existing `simulation/twinleaf/rank11-garbodor-tool-maintenance-policy.cjs` only retargets an already-selected Float Stone to an existing Benched Garbodor under a narrow Mega Absol / opposing **Active** Mewtwo & Mew condition. Root93's post-KO candidate has Active Unown and Benched Mewtwo & Mew, so that guard does not cover this state.
- `simulation/twinleaf/agent41-live-garbotoxin-ability-window.cjs` is a read-only real-Store observer. It can verify printed Ability suppression on both Active and Benched candidate Pokémon, but it does not select evolution or Tool actions. Set its `turn` to the actual candidate turn after the source Tool attachment; its default is turn 2.
- `simulation/twinleaf/agent43-held-evolution-bench-admission.cjs` is only a last-Bench-slot Basic selection rule. It does not evolve an in-play Trubbish.

## Existing validation and paper boundary

`tests/agent1-actor-evolution-frontier.test.cjs` covers the pure selector and a fake Store that accepts the typed `PlayCardAction` and mutates the evolution stack. Agent1's report, `results/twinleaf/agent1-natural-evolution-root-paired-native-20261021.md`, records four changed typed evolution roots across three of four historical arms, but explicitly says those counters do not authenticate the physical evolution stack or payoff. It calls for a targeted native observation. I found no compiled native root93 Garbodor-evolution witness in the current reports.

The supplied Advanced Player's Manual §A-05 requires a matching evolution chain, prohibits evolution on either player's first turn, prohibits evolving a Basic on the turn it entered play, and prohibits evolving a Pokémon again on the same turn it evolved. It also says attached Pokémon Tools remain attached through evolution. The existing selector encodes the main turn/chain/stage restrictions, but a paper-qualified result still needs exact chronology and a physical native stack receipt. Garbotoxin's Tool-dependent effect must be confirmed only after the Tool is physically attached and the printed Ability check is observed; evolution alone is not the lock.

## Recommendation

Use Agent34's existing owner-only evolution root as the starting point. For a shared common-policy experiment, expose it as a new, separately registered bilateral option. If the immediate question is source-only, add a seat-scoped option to the existing wrapper rather than a parallel Store dispatcher. Add a Garbodor preference only if the actual owner-hand census shows another eligible evolution can preempt it. Then require one same-deal native sequence: accepted Garbodor PlayCardAction, public Trubbish→Garbodor stack change, accepted Float Stone attachment to that Garbodor, and printed Ability suppression on the candidate's Benched Mewtwo & Mew. Keep the immediate Box/Fog and delayed Powerglass branches separate.

No deck, source 60, or competitive qualification changes are proposed here.
