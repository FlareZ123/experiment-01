# Agent 50: eight genuinely new rank-11 source deals, both-seat attack-choice policy comparison

**Registered 1 November 2026 at 18:51:52 UTC before observing any gameplay from these new seeds.** Native Store research on original rank-11 Absol/Garbodor, two existing unchanged candidate sixties, two intervention policies, 32 scheduled games. Zero competitive-qualified games at registration.

## Experimental design

Registration: [`registrations/agent50-prospective-rank11-bilateral-known-dead-20261101.json`](registrations/agent50-prospective-rank11-bilateral-known-dead-20261101.json), initial immutable seed commit `30378d011fc75c404e2599d039a7a325c5de35a5`. Python `secrets.randbits(32)` sequential independent uniform draws, accepted first **two projected heads and two projected tails per physical candidate seat** under the pinned `seededRandom` first xorshift32 output. All **12 drawn values** retained in registry, including **four rejected excess-stratum draws**. No game outcomes or simulator requests preceded the original registration.

| Candidate physical seat | Selected projected tails (seed) | Selected projected heads (seed) | Source physical seat |
| --- | --- | --- | --- |
| A, candidate seat 0 | `1550013320`, `2680168583` | `1068765975`, `4039884054` | 1 |
| B, candidate seat 1 | `1767975561`, `3831234043` | `3831821809`, `1131666043` | 0 |

The engine's native accepted setup coin, choice, first draw and actual start must confirm every projected first seat. For each of eight exogenous physical seed groups, hold rank-11 exact original opponent printing and original seed fixed; play both the unchanged champion-reference and New Moon candidate 60s under (1) historical frozen v2 policy option set and (2) the same option set with **one extra `bilateralKnownDeadAttackRoot:true` option applying identically to both players**. This yields **8 groups × 2 printed candidate 60s × 2 original-Store policies = 32 native game attempts**. Each baseline/treatment pair must prove identical source deck, candidate deck, initial physical full-deal SHA, source deal SHA and actual starting seat.

Allow all action-cap, paper-integrity failure, prompt failure, engine abort, and complete game outcomes; never select or regenerate seeds after observing execution. The source profile’s old frozen transitive closure cannot certify this new option. Explicit registration pins original roster and both central source modules by Git Blob SHA and the unchanged upstream Twinleaf commit `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.

## Reproducible files and CI

- Generator/strict real Store wrapper: `simulation/evaluation/agent50-prospective-rank11-bilateral-known-dead-native.cjs`.
- Reusable paired public root, attack, first-source-response, physical-prompt receipt comparison: `simulation/evaluation/agent50-rank11-bilateral-known-dead-native-pair.cjs`.
- Precommit, native-setup and eight-count regression tests: `tests/agent50-prospective-rank11-bilateral-known-dead-native.test.cjs` and `tests/agent50-rank11-bilateral-known-dead-native-pair.test.cjs`.
- Reuses **existing manual-only** `.github/workflows/aichi-benchmark-stats.yml` via `agent50_fresh_rank11_bilateral` flag; default is off. Full raw output uploaded on failure or completion.

## Preserved integration failures

1. [Native run 41339286445](https://github.com/FlareZ123/experiment-01/actions/runs/41339286445) failed before playing a game: registered trials had a noncanonical string ID. Source driver requires `rank:repeat:seat:candidateId`. Corrected ID and regression added, with seeds unchanged.
2. [Native run 41339545218](https://github.com/FlareZ123/experiment-01/actions/runs/41339545218) executed two 16-arm native batches, then failed to assemble a paired report because a postgame helper incorrectly asserted Map cardinality four. No game outcome packet was emitted to the investigator and the new seed groups were kept unchanged. Fixed helper cardinality and added a 16-arm regression. Registration records both analytical amendments with the earlier blob IDs and never overwrites the original random draws.
3. [Native run 41340025588](https://github.com/FlareZ123/experiment-01/actions/runs/41340025588) was dispatched after that repair. **Its eventual outcome is to be read from the run and its complete archive, not assumed here.**

## Qualification boundary

The study measures how the same public-actor native attack-choice repair affects results on uninspected, prospectively selected **rank-11 source seeds**. Even if every native Store attack, Prize, setup and card-custody receipt passes, the general bot still lacks a complete hidden-information-safe policy, native Night Watch paper-random fulfillment, universal paper-prompt correctness, and the official 25-minute game clock. It represents **one** of 32 opponent rankings, with just two candidate sixties. Native outcomes are developmental observations only. Full benchmark still needs three exact original sixties and currently has **zero** competitively qualified games.

## Completed prospectively seeded native evidence

**Success: [frozen branch compiled CI 41340503240](https://github.com/FlareZ123/experiment-01/actions/runs/41340503240)**, branch `research/agent50-rank11-fresh-bothseat-20261101`, exactly pinned source commit `0f2560ba9dfc0f36f68c3c7ae5ab3c65a36a9fd8`. The 32-attempt [complete artifact 13096918772](https://github.com/FlareZ123/experiment-01/actions/runs/41340503240/artifacts/13096918772) has ZIP SHA-256 `8d7a05c4fe89242c81e630187449f40c1e0091b4e41667d7334336810a19f009`, and full uncompressed JSON SHA-256 `4192608ebdd609ac1e008ab53477030a379382e9bd02ab1a42e2a769c28c8663` (45,121,910 bytes). This job passed 14 preregistration/pairing pure tests, compiled the pinned native Store, played all 32 attempts and uploaded the full packet. Its source head was sealed before dispatch so unrelated concurrent main-branch changes could not alter the evaluated profile.

**Physical validity and receipts:** **16/16** baseline/treatment pairs matched the registered source and candidate printed 60 SHA, original seeded full-physical-deal digest, source-deal SHA, actual physical first-player seat and seed. **32/32** native games reported `SETTLED_PHYSICAL_INTEGRITY_PASSED`, consistent accepted original setup coin and verified first draw, no sudden-death restart. No native engine aborts occurred. Original projected starting seats matched all **32/32** native starting receipts. These receipts identify the same original physical-game starts; they do not certify the official rules or 25-minute clock.

| Outcome across the **16 paired fixed-60/deal cases** | Original policy | Same exact-print correction on both seats |
| --- | ---: | ---: |
| Original rank-11 source engine wins | **5** | **10** |
| Candidate engine wins | **7** | **4** |
| Root-action caps (260) | **4** | **2** |
| Native errors / missing attempts | **0** | **0** |

**Crucial observation:** the *same* one-option actor policy improved original source engine outcomes in **five** matched cases: **three former candidate engine wins became original source engine wins**, and **two former action caps became original source engine wins**. One capped comparison remained capped but original source Prizes improved. All nine other comparisons retained the identical terminal/cap outcome. This is direct evidence of a material opponent-policy decision deficiency under the previous benchmark; the lower measured candidate win count cannot be interpreted as a change in the fixed candidate decks' intrinsic strength.

### Every registered printed-60 / original-source seed pairing

Notation: `C` candidate engine win, `S` original source engine win, `Cap` 260-root censor. The printed 60 names remain identical in both policy arms.

| Registered seed / slot | Fixed candidate 60 | Baseline | Both-seat repair | First true common-root change |
| --- | --- | --- | --- | --- |
| `1550013320` A | Champion | C | C | None |
| `1550013320` A | New Moon | C | C | None |
| `1068765975` A | Champion | Cap | Cap | Source T53: `Terminal Period` → `Claw of Darkness` (root 231) |
| `1068765975` A | New Moon | C | C | None |
| `2680168583` A | Champion | S | S | None |
| `2680168583` A | New Moon | S | S | None |
| `4039884054` A | Champion | Cap | S | Source T9: `Call for Family` → `Super Poison Breath` (root 52) |
| `4039884054` A | New Moon | C | S | Source T7: `Call for Family` → `Super Poison Breath` (root 43) |
| `3831821809` B | Champion | Cap | Cap | None |
| `3831821809` B | New Moon | C | C | None |
| `1131666043` B | Champion | S | S | None |
| `1131666043` B | New Moon | S | S | None |
| `1767975561` B | Champion | S | S | Source T15: `Terminal Period` → `Claw of Darkness` (root 88) |
| `1767975561` B | New Moon | C | S | Source T15: `Terminal Period` → `Claw of Darkness` (root 68) |
| `3831234043` B | Champion | Cap | S | Source T11: `Terminal Period` → `Claw of Darkness` (root 51) |
| `3831234043` B | New Moon | C | S | Source T11: `Terminal Period` → `Claw of Darkness` (root 54) |

All **seven** first changed roots were authentic original **source**-owned `AttackAction` choices, with no candidate-only privilege. **Five** chose effective `Claw of Darkness` over dead `Terminal Period`, and **two** chose `Super Poison Breath` instead of full-Bench `Call for Family`. At all seven, both base and treatment attack declarations settled through genuine Store prompt chains and had verified immediate opposing next-turn roots in the same game epoch. Treatment's first attack took **2 Prizes** on two matched cases, **1 Prize** on three, and **0 immediately** on the two poison effects; future turns still sometimes reversed terminal outcomes. A first-prefix same-state comparison is asserted only for those seven root events, never later matched numeric indices after the trajectories diverged.

### Independent original postgame physical prompt prefix audit

The additional pure-tested `simulation/evaluation/agent50-native-prompt-before-attack-diff.cjs` audits physically named original native prompt selections **strictly before** the first changed root, independently of root-label matching. On this 32-attempt raw packet, all **seven** changed first-root cases had identical ordered native-reported selected printing names, source zones, selector indices and zone-size receipts through their unchanged decision prefix. All **seven** had **zero unknown printing names** in that recorded prefix, representing 29 named pre-fork prompt events across the seven pairs. This strengthens the same-state causality interpretation within the observer's scope, although unseen prompt information and source backend rules remain outside its authority. The other nine paired games did not change any Store root, so a first-divergence prompt-prefix comparison is inapplicable.

### Printed 60 outcomes by candidate identity (descriptive only)

- Champion reference: **baseline 1 C, 3 S, 4 Cap**; repaired **1 C, 5 S, 2 Cap**.
- New Moon Lockbreaker: **baseline 6 C, 2 S, 0 Cap**; repaired **3 C, 5 S, 0 Cap**.

Each candidate uses exactly the same eight source seeds in matching physical seats, and each original source deck may be paired against two different candidate 60s. These eight source groups and sixteen dependent candidate/deal cases are not a valid 32-game independent field win-rate sample. One rank-11 opponent has been studied. The native opponent policy remains unqualified for paper randomized effects, official 25-minute timer, and opponent-hidden-information-safety; the candidate policy has those same limitations. **Competitive-qualified games = 0**. Any tempting deck ranking from these native win columns is therefore premature. Preserve all action caps when comparing potential strength.

## Engineering verdict

Precommitted both-seat attack-action policy competency matters on genuinely fresh native deals. The previous two retrospectively selected source-deal reversals were not one-off artifacts of those exact historical seeds: in this first new prospective cohort the source's dead-attack replacements reversed five engine outcomes under identical initial physical deals. This narrows one critical simulation-policy failure with exact archived causality, while leaving the full paper Expanded evaluation and single-60 deck optimization objective open.
