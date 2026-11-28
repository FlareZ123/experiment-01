# T1 hybrid Gate → T2 second Door: an actor-only discard policy that matches the restricted opportunity upper bound

**Agent 15 | 28 November 2026 | deterministic K0 hand planner, paired 60,000 physical opening deals, exact conditional T2-draw probabilities. Not a full Pokémon game or win-rate estimate.**

## Specific repair

The [second-Door restoration research](agent15-second-rider-door-recovery-20261128.md) established that a Shadow Rider V played before T1 Radiant Eternatus's Climactic Gate can evolve normally into another Shadow Rider VMAX on T2. Its initial search planner chose a T1 connector/discard line using complete sampled deck composition—a useful but unrealistically informed upper benchmark.

A **real actor-visible T1 policy** can make the same restricted restoration decisions without peeking at six hidden Prizes or the remaining deck. The essential rule is:

> When a paid Quick Ball or Mysterious Treasure is being used to establish the additional Shadow Rider V before a Rider+Deoxys Gate, first preserve at least one **T2 access route to a second Rider VMAX** (held VMAX, Forest Seal Stone/Star Alchemy, Arven into a still-accessible Stone, or Mysterious Treasure with an affordable discard). Only then choose disposable cards by a generic discard-priority heuristic.

The old greedy discard rule can spend exactly the card that makes the extra V useful.

### Concrete legal hand counterexample

Construct a basic-valid seven:
`Radiant Eternatus, Hisuian Heavy Ball, Forest Seal Stone, Mysterious Treasure, Mimikyu, Unfair Stamp, Arven`, with Mimikyu Active. The source 60 still has an unprized Rider V, Rider VMAX and Deoxys VMAX. A single Mysterious Treasure can discard one card and find Rider V; Radiant is held and Gate can then fetch Rider VMAX+Deoxys VMAX. The physical six-Prize example is `Field Blower, Mysterious Treasure, VS Seeker, Iono, Pokémon Ranger, Mysterious Treasure`.

- **Greedy discard:** expend Forest Seal Stone to pay Treasure, preserve Stamp/Arven. On T2, Arven can fetch Stone only if the Stone is still in deck; it isn't (was discarded). With one ordinary draw and no additional routes, only **3 of 44** possible draw cards establish VMAX: the **two** Rider VMAX copies remaining in deck plus one remaining Mysterious Treasure that can search a VMAX using another hand card as payment, giving **6.8182%**.
- **Continuation-aware discard:** pay Treasure with Unfair Stamp instead, preserve the held Forest Seal Stone. On T2, attach Stone to the in-play VMAX, use its unspent Star Alchemy to obtain a remaining Rider VMAX, evolve the T1 Rider V. The existing exact model's conditional T2 evolution opportunity is **100%** (ignores opponent disruption and competing VSTAR-use). No hand, deck or Prize card is observed beyond allowed K0 information when choosing Stamp.

This witness shows **connector domination through payment choice**: identical successful T1 setup, very different T2 strategic capacity. The best discard is not a fixed scalar DCI; it is the action sequence's remaining access graph.

## Actual algorithm and prevention of hidden-state leakage

The [K0-policy code](../../../scripts/2026-11/agent15-second-rider-k0-actor-policy.py) imports the exact physical-60 model from [the earlier T2 restoration script](../../../scripts/2026-11/agent15-second-rider-t2-restoration.py). Before seeing any deck search it:

1. Chooses Active solely from the opening seven using a fixed published priority.
2. Determines whether Radiant and an extra Rider V are already in hand/Active, and which missing Basics can be reached with held Quick Ball, Mysterious Treasure or Fog Crystal. Each connector is a **physical distinct copy** and paid search consumes one discard when specified.
3. Enumerates only hand-observable legal assignments and distinct discard multisets, reserving held Radiant/extra Rider targets.
4. Scores remaining *hand-visible* T2 VMAX access in priority order: held VMAX, held FSS, held Arven, held Treasure-with-payment; uses remaining resources/secondary discard ranks to break ties. No `prizes`, `deck`, seed, future draw, opponent hand or exact VMAX distribution enters this selection.
5. Commits to **one** chosen line. The simulation then checks the actual hidden physical deck for success; it does not use those contents to choose its T1 line. If the chosen search or Gate fails, no fictitious rollback/reuse of the original hand is allowed. A real player might adapt using unused resources, so this is a **restricted non-adaptive baseline**.
6. Conditional on a successful T1 Gate and pre-established Rider V, computes the exact chance over **one T2 normal draw** that held/drawn VMAX, Mysterious Treasure, FSS/Star Alchemy or Arven into Stone accesses the remaining VMAX. This is a source-and-rule-restricted **opportunity**: no opponent, T1 Supporter, other draws, Tool slot contention, alternative Energy, extra evolution, lock, early knockout or competing VSTAR power is modeled.

The prior omniscient planner remains the explicit reference upper bound. Neither algorithm is a complete policy for the Pokémon game. The actor hand-only choice matches the bound for *T2 restoration* in the measured deals but does not prove global optimality across every possible physical configuration or objective. Matching a bounded upper screen is not a game win.

## Paired 60,000 physical-deal result

Two separate fixed random seeds (`27112028`, `27112029`), **30,000 shuffled physical sixties each**, yielded **51,680 Basic-valid opening sevens**. Six actual Prize cards removed per deal. The three policies saw exactly the same deals and T2 exchangeable draw distribution; reported fractional successful-restoration counts are conditional exact expectations, not randomly simulated T2 events.

| Model, permissive T1 discard pool | T1 Rider+Deoxys Gate chance per Basic-valid 7 | T1 Gate + Rider V established | T1 Gate + T2 second Door restored |
|---|---:|---:|---:|
| Greedy fixed discard priority | 36.5925% | 25.9539% | **14.9216%** |
| **K0 continuation-aware discard** | 36.5925% | 25.9539% | **14.9772%** |
| Omniscient restricted upper bound | 36.6041% | 25.9539% | **14.9772%** |

The K0 plan improves success expectation by **28.72516 restoration events per 51,680 Basic-valid openings**, i.e. **+0.0556 percentage points**, across **31 of the 60,000 attempted physical deals** whose K0 discard choice materially affects the outcome. It changes no card counts, opening Basic distributions, or eligible extra-Rider count: the gain comes entirely from *not throwing away a future evolution connector*. Six other openings permit a known upper-bound Gate that the strict single-plan K0 benchmark misses after its precommitted search; they need a genuine post-search K1 continuation rather than free rollback.

With the stringent previously defined **protected-resource payment set**, all three T2-restoration expectations coincide at **12.9985%** among Basic-valid openings; the protection policy already prohibits discarding VMAX/FSS/Arven/Treasure/valuable singletons. Its total hybrid-Gate rate is **35.2806%** (the bounded upper is **35.2883%**). The difference between protected and permissive opportunity is a sensitivity to strategic discardability, *not* a recommendation to discard precious cards just to gain a fractional metric.

### What this does and does not imply

The improvement is numerically small but mechanically diagnostic: **preserving a unique second-stage evolution route can convert an individual line from 6.8% to 100% turn-two restoration**. The first-turn simple basic-access rate is not the right score for evaluating paid search paths. The actor solution removes an unnecessary dependence on privileged future-zone information for this specific restricted objective, supporting integration of a general *post-payment continuation scoring* guard.

This is not a claim that Deoxys Gate should displace Hood Shield, that 15% of actual games restore two Doors by T2, that a Stage-A frozen bot succeeds with the line, or that it improves any Aichi matchup win rate. The current full-field need remains 32 actual decks (29 authenticated), an effective opponent policy, correctly implemented game rules, and competitively qualified outcomes. The target **99.5%** remains completely unproved.

### Files and regression

- [Actor-only K0 planner, greedy baseline and paired comparison](../../../scripts/2026-11/agent15-second-rider-k0-actor-policy.py)
- [Exact fixed-60 physical/T2 model](../../../scripts/2026-11/agent15-second-rider-t2-restoration.py)
- [New executable regression](../../../tests/2026-11/agent15-second-rider-k0-actor-policy.test.py) (local passed: physical 60, concrete 3/44 vs 1 counterexample, no free search rollback, sample negative gates, strict protected pool, 5,000 seed paired-vs-upper check)
- Run from repository root: `python tests/2026-11/agent15-second-rider-k0-actor-policy.test.py` and `python scripts/2026-11/agent15-second-rider-k0-actor-policy.py 30000 27112028` (repeat with `27112029`).
- Computational scope: pure Python 3 standard library, no Twinleaf, no CI, no match, no frozen worker, no deck substitution. Counts and sequential action assumptions are explicit in the source.

**Recommended successor task:** use the actor-only hand planner's *principle*, not its exact standalone ranking weights, to add or review a bounded candidate-worker test: a T1 paid search must not consume the last held live T2 Rider evolution connector when a different affordable discard preserves it. Do not duplicate the already-implemented 2-Prize direct KO manual-first guard; the existing two-profile worker already scores projected any-KO manual actions at 2200, above its Door-first exception threshold.
