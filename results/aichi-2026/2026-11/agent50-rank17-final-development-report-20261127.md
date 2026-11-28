# Rank 17 connected policy and candidate Rain defense — development result

Agent50, 2026-11-27T09:15:36.172Z. Branch `agent50/rank17-raichu-family-20261127`. Rank17 unchanged exact source 60; no registration or merge.

## Executed synthetic regressions

```json
{
  "decision": 417,
  "kernel": {
    "assertions": 45
  },
  "differential": {
    "cases": 300,
    "assertions": 494
  },
  "defense": {
    "assertions": 15
  },
  "advice": {
    "assertions": 14
  }
}
```

Standalone worker Git blob `c6369e13c91e63523075568b7be02e388e4a6bea`. These are synthetic decision contracts, arithmetic and differential cases, not games. Native V3 qualification, Node builder and full-game results are absent.

## Delivered implementation

Source-specific starter and evolution recovery, physical dual Electrode capacity, actual setup ordering, exact own K1 conservation and funded Ticket, Wobbuffet/Klefki/Hood timing, adversarial Rope, Temple answer, same-turn Compressor and distinct-Energy Secret Box, Sight/manual threshold, safe hand utility, public Trainer classification. Exact optimized Rain kernel uses count vectors and target cache, independent brute-force regression.

Two held-out decision defects are now closed in the development worker. First, a terminal Electro Rain line is no longer hidden behind a weaker supported attack merely because the mandatory Rain continuation is unsupported: a directly terminal supported attack still wins, otherwise the worker emits the existing explicit unsupported-root disposition. Second, under a live Temple of Sinnoh with a publicly visible Girafarig LOT Get Lost threat, the worker treats its singleton Marshadow UNB Resetting Hole answer as protected hand material rather than Research/Carmine fodder until Temple is removed or Marshadow is otherwise used. The guard is actor-visible and narrow: without the visible Get Lost threat, the ordinary draw heuristic remains unchanged.

A third source-native response is now closed: when Path to the Peak or Power Plant is publicly suppressing a live Electrode-GX, the worker uses an already-Benched Marshadow Resetting Hole or the held PokéStop replacement instead of recognizing the lock but passing. The Resetting Hole confirmation continuation is covered, and the policy does not consume Marshadow on Path when no live blocked engine is present. Temple-specific Energy semantics remain separate from this broader hostile-Stadium-removal trigger.

Path handling now includes Ditto Prism Star as a Rule-Box Pokémon, so Almighty Evolution is not incorrectly credited through Path. A funded Ditto evolution can trigger Stadium removal before the evolution Ability is considered.

The New Moon-style two-axis lock also has a bounded continuation: when opposing Active Klefki suppresses Marshadow and Path suppresses Electrode, Escape Rope is selected only if every public opponent switch choice leaves a feasible Stadium answer and positive Rain projection. The continuation then promotes Raichu, uses the now-live Resetting Hole to remove Path, confirms the Ability, and reaches the explicit Bomb boundary. A second opposing Klefki invalidates that route. Klefki SVI is now an explicit 70-HP one-Prize Rain target; unknown targets still fail closed.

Additional decision paths completed after the earlier lock checkpoint:
- Rescue Stretcher uses its printed shuffle-three mode only in a bounded deckout window (deck count 0-2 with three recoverable Pokémon), and stays out of speculative healthy-deck recycling.
- Trainers' Mail now values Secret Box only when the current hand can realistically pay its three-card discard cost; an unpayable ACE SPEC no longer dominates a live alternative.
- Funded Klefki Joust is prioritized over free retreat when it strips Stealthy Hood from Active Wobbuffet and thereby exposes a live Extra Energy Bomb on the following decision.
- The exact frozen New Moon Lockbreaker target family is now represented without relaxing the unknown-target fail-closed rule. This includes Mewtwo & Mew-GX, Gengar & Mimikyu-GX, Galarian Articuno V, Squawkabilly ex, Unown, Dusclops, Duskull, Solrock and Lunatone in addition to previously covered printings. Path to the Peak / Power Plant are treated as safe for Rain damage arithmetic, and Powerglass is accepted as a non-defensive target Tool.
- The New Moon acceptance witness is reproduced at the decision-model layer: one Bomb while behind converts four Reversal plus one Counter into 14 Lightning units, exactly covering 7 Sight packets for Gengar & Mimikyu-GX, 5 for Tapu Lele-GX and 2 for a 60-HP one-Prizer. One opposing Dusclops self-KO leaves those multipliers live after the Bomb; two self-KOs force 4-4 parity and turn them off.
- Actor observation exposes printed HP, so Solrock CES Sunbeam is handled explicitly: observed 90-HP Lunatone OBF is conservatively costed at 130 HP unless Sunbeam carries an explicit source-attributed suppression.

Further connector and safety work:
- Trainers' Mail now surfaces the low-deck Rescue Stretcher shuffle-three survival line, not a destructive draw Supporter, when deckout is imminent.
- Three stale references to the removed `r17TempleAnswerPossible` helper were eliminated in favor of the generalized Stadium-answer predicate; a Temple + Secret Box branch now directly exercises the formerly latent crash path.
- Solrock CES Sunbeam arithmetic now respects public Basic-Ability lock from active Klefki in addition to explicit source-attributed suppression, so Lunatone is not incorrectly inflated while Sunbeam is actually off.
- PokéStop's once-per-turn effect now has a K1-only UDP guard: if a held Raichu/Electrode has no natural compatible base remaining in hand/board/deck and singleton Ditto Prism Star is still certified in deck, the policy will not risk permanently Lost Zoning Ditto through PokéStop. Normal PokéStop use remains available when the natural base is still present.

Shared native Bomb/Rain/Crush still unsupported; explicit abstentions remain.

Candidate defense modules: `simulation/evaluation/2026-11/agent50-rain-lost-zone-defense.cjs`, `simulation/evaluation/2026-11/agent50-rain-board-exposure.cjs`, `simulation/evaluation/2026-11/agent50-rain-candidate-advice.cjs`. Bounded public discard pair selection preserves physical opaque tokens, explicitly supplied recovery-connector dependencies, conditional Energy-access cap, and static Board placement. With Sight, two healthy 320 VMAX both benched require 20 hits, one Active requires 21. Removing two Reversal leaves at most 18 named Energy units in the fixed R/C/U family; two Counter leave 20 and only deny the 21-hit configuration; two Unit leave 22. Conditional only, not proof of future attack access or win rate. Candidate owners receive isolated advice, no direct changes to their policy or lists.

## Blockers

No native game/CI/merge/candidate change authorization. Shell Git DNS unavailable; GitHub connector commits and isolated JS regressions. Shared native host support owned by Agent29; no competing adapter. Exact field only 29/32 verified lists, 0/32 qualified matchups at research baseline; no claim of 99.5% or final strongest deck nomination. K1/Ticket and projected lock/mobility decisions not native qualified. Board projections depend on specified modifiers and do not account for all unknown future effects.


## 28 November 2026 — Agent50 branch repair, exact-source negative controls

The rank17 source-bound development branch now fixes two **already independently reviewed** incorrect decisions without changing the 60 or source pin.

1. **Unown AOR Farewell Letter / U-Turn Board UNM:** when Benched Unown has no attached Energy and its only Tool is the exact reusable U-Turn Board, the worker can choose Farewell Letter. Other Tools, an attached Energy, Klefki lock and deckout checks remain guarded. The attached Board returns to hand under its own replacement text.
2. **Legacy Energy TWM Prize denial:** Electro Rain's projected attack-damage KOs conservatively subtract one claimable Prize from a visible Legacy host, since the current actor schema does **not** certify whether the once-per-game denial has been spent. Two 270-HP-remaining VMAX plus 90-HP Solrock demand 21 packets for board wipe; 20 packets suffice for two VMAX, but produce only five claimable Prizes with one visible Legacy. Removing Legacy restores the six-Prize terminal projection. Telescopic Sight is intentionally absent in this counterexample.

**Exact in-isolate V8 source execution:** 443/443 decision groups (both seats), 45/45 pure Rain-kernel assertions and 300 differential cases / 494 assertions. Source is the committed base + overlay + generated worker under this branch. These are constructed actor-visible states, **not** a compiled pinned-Twinleaf Store, native prompt continuation, whole game, competitive matchup or win-rate estimate. Remaining shared host Bomb/Rain/GX integration belongs to Agent49 and requires separate native admission; do not merge this branch wholesale into frozen V3 or assume permission to run a fixture.
