# Agent 8: rank-11 first-action direct Boost Shake access is a rare opening-hand event

**29 October 2026 | exact combinatorics, original published rank-11 60 | evidence: mathematical opening-state calculation; not a native match or win estimate.**

## Question and source

Why did the new 32-arm prospective common-policy scout observe **zero completed rank-11 source-first direct Boost Shake lines**? Is that alone evidence that source-first Tool-Garbodor pressure is inaccessible, or is the current direct policy underpowered?

The actual original source inventory is rank 11 in [the 29/32 recovered exact print lists](full-decklists.json), Git blob `ae773f6201d7aa69d31914dbfee66f3fba692200`. The pinned source wrapper is [`rank11-direct-boostshake.cjs`](../../simulation/twinleaf/rank11-direct-boostshake.cjs), with its [K0 first-own-turn predicate](../../simulation/twinleaf/rank11-direct-opportunity.cjs). These actual source predicates require a held Boost Shake, an appropriate Pokémon Tool, and either Trubbish already in hand/play or Battle VIP Pass with Bench room. The opt-in K0 guard rejects a hand holding both Garbodor. The published source has two Boost Shake, two Trubbish, four Battle VIP Pass, six eligible Tools (three Float Stone, two Forest Seal Stone, one Muscle Band), two Garbodor, and **eleven Basic Pokémon** including the three printed Basic Mega Absol ex. The complete local card pool confirms Mega Absol ex MEG 86 is Basic and Garbodor BKP 57 is Stage 1; Forest Seal Stone is an attachable Pokémon Tool even when its VSTAR Power cannot be used by a non-V.

## Exact model and results

Partition the 60 into non-overlapping categories `[Trubbish, other Basic, VIP, appropriate Tool, Boost Shake, Garbodor, other]` with respective counts **[2, 9, 4, 6, 2, 2, 35]**. Enumerate every multivariate-hypergeometric seven-card opening with at least one Basic in that original seven (legal opening hand). After six face-down Prize cards, allow **one ordinary draw** without any other card plays, searches or opponent mulligan bonus cards. The marginal drawn eighth card is uniformly distributed over the remaining 53, despite six randomly selected Prizes. Count the stated predicate in the eight cards, excluding the both-Garbodor-held case.

| Opening-state event, conditional on a valid initial seven | Exact probability | Interpretation |
| --- | ---: | --- |
| First seven already meet hand prerequisites with K0 guard | **4.5814258145%** | Before ordinary first-turn draw |
| Seven plus one ordinary draw meet prerequisites with K0 guard | **6.6823311921%** | **Exact first-action hand eligibility**, not completed line |
| Same eight with both-Garbodor K0 guard removed | **6.7246994384%** | Isolates the small guard loss |
| Optimistically treat four Quick Ball as free Trubbish access in the first eight, retaining K0 guard | **8.8829137558%** | Illustrative alternative-access event, ignoring discards and target availability |

The guarded first-eight event is exactly **48,344,345 / 723,465,264**. The optimistic Quick Ball relaxation is **353,456,375 / 3,979,058,952**. These are hand-location probabilities. Actual early Tool-Garbodor establishment further requires successful native Item plays, legal target selection, surviving Garbodor deck access, Bench room and acceptance of Boost Shake's evolution. Conversely, cards drawn with other effects, early searches, later own-turn actions and opponent mulligan draws create routes omitted by the first-action model. **6.68% is neither a general ceiling nor a completed-lock probability.**

The model is exact for the explicitly stated sampling experiment. It is intentionally separate from Twinleaf strategy quality, action acceptance, match outcome and 25-minute game-clock behavior. [Reproducible closed-form enumeration](../../scripts/aichi-rank11-direct-opening-probability.cjs) and [five pure regression tests](../../tests/aichi-rank11-direct-opening-probability.test.cjs) preserve counts, guards, fractions and optimistic sensitivity. No new CI workflow was created.

## Interpreting the 29 October prospective native scout

[Agent 41's preregistered 32-arm scout](agent41-prospective-canonical-scout-native-20261029.md) observed **12 rank-11 source-first arms of 16**, and **zero completed Boost Shake source-first arms**. Both candidate inventories were played against the same source-deal seed per pair. The rank-11 pairs had aligned source physical deals (the sole known mismatch was rank 6). Consequently these **12 arms represent six distinct source-first seeded source-deal pairs**, not twelve independent first-hand opportunities. The two successful source-second Boost Shake arms were **both the same seed `24941728`**, representing **one successful distinct source deal**.

As a scale illustration only: six independent valid-opening-seven plus-one-draw opportunities, each with exact first-action predicate probability 6.6823%, have **66.0364%** probability that none meets that predicate. This calculation does **not** compute the probability of the scout's actual zero completions, because its source and candidate policies may make intervening decisions, native prompts can fail, opponent mulligans differ, and engine conditions change. It does show why treating `0/12` as twelve independent competitive failures is unsound.

## Research implication and prioritized falsification

The direct source wrapper's syntactic first-action hand channel is naturally rare. The source list also contains Quick Ball, draw Supporters, and other access lines that a competent player may sequence before deciding to Boost Shake. Current source pressure qualification should therefore investigate **owner-information-safe multi-action routes**, including real Quick Ball discard payment and legitimate own-deck searches, before interpreting a further batch of untuned direct-wrapper games as evidence that source-first Garbotoxin is absent.

A useful next executable benchmark is one fixed-source, unchanged-candidate, native same-deal test with a source policy that may establish Trubbish and Tool through legal early Items, then decide Boost Shake after those actions. Record actual accepted action recipients, authenticated K1 only at own-deck prompts, a settled evolved Garbodor with Tool, source and candidate replies, all failures and caps. This must reuse the canonical bilateral runner and be registered before observing outcomes. Follow it with balanced actual starting-player strata and a failure-inclusive prospective cohort.

**Decision:** No candidate or source deck is established as strongest by this calculation. Current repository status remains **29/32 exact opposing source 60s; zero competitively qualified games; no demonstrated fixed-deck 99.5% rate**.
