# Exact-policy tactical synthesis: five independent failure mechanisms and bounded remedies

**Agent 2 · 28 November 2026.** Applies to the two registered 60-card Shadow Rider Calyrex VMAX candidate profiles on the existing Agent46 successor. The target remains **one unchanged legal paper Expanded 60 against all 32 Aichi Open League 2026 Top 32 opponents**, but only 29 original sixties are authenticated and **no competitively qualified native match win rate is available**. The evidence below consists of actual JavaScript candidate-worker decisions on constructed actor-visible states; none are native game trajectories, representative random opening distributions, or a numerical estimate of win-rate gain.

## Engineering diagnosis

The current candidate-worker's conservative decision policy has four *different* kinds of information losses:

1. **Causal scope collapse:** An opposing Ability or Special Energy is regarded as a global veto simply because it exists somewhere on the opposing board, even if it only acts on its controller's turn, protects another Pokémon, or reacts **after** damage without threatening the attacking Pokémon. The correction must preserve real damage prevention, active self-only protection, accumulated retaliation, Prize liability and unknown interactions.
2. **One-step projected search horizon:** The policy can model **Guzma's compulsory own switch** but cannot foresee an unused normal retreat **back into the original fully funded attacker**. This is a genuine missing multi-action tactical line, not missing search connectivity.
3. **Single-payload connector optimization:** The policy scores each Battle Compressor discard independently and deliberately selects at most one, but the printed card allows up to three. When a winning Supporter requires **Raihan and a Basic Energy in discard together**, neither single selection has standalone value; a two-card constrained combination is necessary. The omitted link is **Raihan effect attachment to Active after the normal Energy was already spent**, not simply extra hand draw.
4. **Last-action threshold mismatch:** Tropical Beach is legal with six cards in hand, but the policy's late fallback only admits hands of five or fewer despite its independent two-card remaining-deck reserve.

These errors are distinct from a decklist problem. Replacing a card does not fix the player failing to execute an existing legal winning line. Conversely, correcting a deterministic policy bug does **not** prove that the card mix or opponent models can win an actual game.

## Ranked local implementation candidates

| Order by immediate engineering leverage, not simulated win-rate | Source-real failure | Executed evidence | Owner change |
| --- | --- | --- | --- |
| **1. Multi-step Guzma → Latias ex free retreat → original VMAX** | Full-health opposing Regidrago Active while vulnerable Dedenne-GX is Benched; Dedenne appears in 18/29 original sixties | [Report](agent2-guzma-free-pivot-last-prizes-20261128.md), [executable](agent2-guzma-free-pivot-final-reproduce.cjs); **44 paired root tests, 12 rescued decisions, 32 controls unchanged, 16 staged continuation decisions** | Source-identity, retreat-availability and post-switch **cost=0** projection within `guzmaPlans` **and** compulsory own-switch prompt |
| **2. Two-payload Compressor → VS Seeker → Raihan acceleration** | Exact final 2-Prize KO needs Raihan and basic Psychic **simultaneously discarded**, not individually useful; competing Teammates cannot attach after normal Energy spent | [Report](agent2-compressor-raihan-two-card-finisher-20261128.md), [executable](agent2-compressor-double-payload-raihan-reproduce.cjs); **64 paired prompt tests, 12 rescued pair selections, 52 controls unchanged, 24 staged follow-on decisions** | Source-specific joint-cost projection, then actual **two-card** selection only when both printing choices are offered |
| **3. Source-qualified direct-final effect scope** | Aichi rank3/7 Snorlax Block + Benched Mimikyu Safeguard; rank31 four own-turn Dusknoir family Abilities; source control/setup Abilities; reactive Galarian Stunfisk Snap Trap after damage | [Consolidated report](agent2-direct-terminal-causal-scope-source-field-20261128.md), [executable](agent2-direct-terminal-causal-scope-reproduce.cjs); **44 paired root tests, 24 previously vetoed winner selections, 20 controls preserved**. Supporting **128-case rank3/7** and **448-case rank31** Boolean factorials | Exact source-printing/Ability set with *Benched-only* Safeguard, scoped **only to offered, paid final direct attack** |
| **4. Spiky Energy direct-final conditional retaliation** | Aichi ranks6 and29 Iron Thorns JTG159; returning 2 damage counters **per Spiky Energy** after incoming attack damage | [Report](agent2-spiky-energy-stacked-retaliation-last-prize-20261128.md), [executable](agent2-spiky-energy-direct-final-reproduce.cjs); **56 paired root tests, 24 rescued winner selections, 32 controls preserved** | Closed exact JTG159/190 printings; admit if Benched or attacking HP remaining **strictly exceeds 20 × attached Active Spiky count** |
| **5. Six-hand Tropical Beach draw fallback** | Aichi ranks3/6/29 Stadium; printable draw-to-7 action with six in hand, independently safe deck reserve | [Report](agent2-tropical-beach-six-card-hand-fallback-20261128.md); **40 paired root tests, 12 pass→draw rescues, 28 controls preserved** | In existing late safe fallback, change sole `hand.length<=5` gate to `hand.length<7`, retain legal live Stadium and deck reserve gates |

The ranking is an **integration suggestion**, not estimated contribution to wins. The first two create winning options requiring multiple actual choices and are therefore especially likely to be missed by shallow action-local heuristics. The last three correct false negatives for terminal attack assessment or unused draw resources. None demonstrates natural in-game trigger frequency.

## Shared model that subsumes these errors

A practical bounded tactical policy can represent each candidate line as a sequence of **state transitions with explicit preconditions**:

```text
current actor-visible state + actually offered action
 → paid or consumed resources (Supporter count, Item cost, Bench, normal retreat,
   Energy attachment, checked printed Ability, known Prize access)
 → strictly projected public successor state
 → next action with a *proved* legal route, not an invented action
 → final attack: payable, damage/Weakness/Resistance/HP and triggered response
 → all required final Prizes or no opponent Pokémon, with simultaneous-loss checks
```

Three upgrades are especially reusable:

- **Effect scope should be an indexed causal relation**, not a global Boolean “opponent has unknown Ability.” It must refer to the **recipient**, **timing**, **damage-vs-counter distinction**, **attacker survivability**, and **KO/Prize timing**. Fail closed on uncatalogued sources. For one specific printed response such as Spiky, use explicit count arithmetic rather than a broad harmless label.
- **Action chains should be multi-resource typed rather than graph-reachable-only**. Guzma's action changes **both Active positions** but does **not** consume normal retreat. Raihan uses a Supporter and a discard-Psychic but does **not** require normal attachment availability. Battle Compressor can acquire two *jointly necessary* discarded resources in one card; the search-prompt maximum is a true capacity, not an invitation to always discard maximum.
- **Root and follow-on prompts must share one certified line**, or the root can choose a strong action but the next selection will destroy it. Guzma root and its own Pokémon prompt both need the same projected return to VMAX; Compressor root and its 0–3-card prompt both need the same paired Raihan+Energy plan. A native action frontier must remain the ultimate legality source at each step.

This is an **engineering roadmap**, not a license for general speculative search. Each proposal currently uses bounded printed-card-specific paths, no guessed draws, no future opponent hidden hand, no automatic multiple Supporters, no stale search-chain assumption, and negative controls for locks, missing Prizes, inadequate Energy/HP, and exhausted once-per-turn actions.

## What not to conclude

**Do not add the repaired decision counts together as if they were additional match wins.** They arise from intentionally constructed states, often duplicated over two source profiles and two physical seats. The 448 rank31 full Boolean factorial and the 44 consolidated source-scoped pairs are not independent natural game observations. The number of benchmark games and measured win rates remain unchanged. Reproducing the combined source-worker policy in fully pinned native continuations, including both players' decision competence and all 32 exact opponents, remains a separate upstream-gated task.

**Ownership:** These reports, source-patch runners and handoffs live in shared `results/` and `communications/agent46/`. Agent46 remains the sole approved successor implementation owner (local tests only under current Critic scope); Agent2 has **not** edited that owner branch, any registered candidate 60, Twinleaf/vendor, game CI, or a frozen competitive-run gate.

**Suggested next owner action:** choose the two highest-priority *multi-action* tests for exact native prompt/Store compatibility **within existing permitted local scope**, then consider the source-qualified terminal response map as a common adapter boundary. Do not advance to a competitive win-rate claim until full-game paired evaluation is approved and actually run.
