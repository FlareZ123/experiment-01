# Agent 26: stable first-turn full ordered source-deal parity across candidate 60s

**20 October 2026, 09:22 UTC.** Evidence class: original frozen source schedule re-executed in the actual pinned Twinleaf Store, with opt-in researcher-only SHA-256 fingerprint of ordered source card positions at the first stable player-turn root. Independent raw-archive analysis performed after successful compilation and execution. **No completed match, strength estimate or competitive win-rate claim.**

## Question and preregistered treatment

Prior 120-arm Agent26 setup snapshots saw **96/96 equal source-zone digests** across frozen champion/Hood/Temple candidate arrangements. However the original observer triggered as soon as `turn===1`; this can occur at phase 8 while a setup `ResolvePromptAction` is still active. Its opaque source-zone digest also included only **remaining deck length**, not remaining-deck order. Therefore earlier 96/96 equality could not prove identical ordered source card positions at the first legal player action.

**Falsifiable question:** when the source opponent's printed 60 and resolved engine 60, frozen RNG seed, physical source seat and source input order are unchanged, do the five original candidate arrangements produce identical **source hand, ordered remaining deck, Prize positions, Active, Bench and other source zones** at the **first stable pre-action `PLAYER_TURN` phase 2 root**? Both source invariance and source mismatches must be retained. No game score is being tested.

Frozen setup schedule and treatments are unchanged: opposing published ranks **6, 8, 10**; **4** v3 repetitions per rank; physical candidate slot A and B; five candidate configurations per `(rank, repeat, seed, slot)` block:

- Published rank-one champion, original physical input order.
- Hood Shield, original order and `reference-aligned-v1` order.
- Temple, original order and `reference-aligned-v1` order.

These are **24 independent seed/seat blocks**, **120 actual first-turn Store setups** and **96 candidate-arm comparisons to the reference within their blocks**. The candidate printings remain unchanged, the opponent engine deck input is unchanged within each block, and each actual first-player assignment is observed.

## Observation contract and failed initial attempt

The existing `simulation/evaluation/source-physical-deal-fingerprint.cjs` is an independently tested read-only helper. It requires `state.turn===1`, `state.phase===2`, completed setup prompts and **zero previous player-turn actions**. Its `fingerprintInitialSourceDeal` hashes source-side exact `fullName` card identities and order in hand, deck, Prize locations, Active/Bench slots and attachments, discard, Lost Zone, Stadium and Supporter. It returns only `{schema,seat,digestSha256}`. No hidden source card identity is given to the bot.

An **initial** instrumentation patch called it on the original first `turn===1` dispatch. [Manual CI #39399041181](https://github.com/FlareZ123/experiment-01/actions/runs/39399041181) failed **120/120** source samples at the same phase mismatch, first reported as `ResolvePromptAction` after 10 actions with `phase 8 !== PLAYER_TURN phase 2`. Pure fingerprint tests had passed. This is evidence that the historical sampler's original earliest-turn snapshot was not necessarily a settled player-turn root. Do not erase or pool this failed diagnostic with the corrected measurement.

Correction in `simulation/evaluation/aichi-setup-only-capture.cjs`: when opt-in `sourceSeat` is supplied, defer capture until phase 2 with settled prompts, check both **before and after** a Store dispatch so the first legal player action cannot mutate card zones before the digest is taken, and then interrupt with the existing exact private sentinel. The original early-`turn===1` default capture remains unchanged for historical replay. A new unit regression explicitly tests the phase-8 intermediate setup transition and successful phase-2 transition, along with digest sensitivity to hidden source deck ordering.

`simulation/evaluation/aichi-multiseed-setup-coupling.cjs` accepts explicit `sourcePhysicalDealAudit:true` and saves the opaque source hash alongside the original setup records, checks every row is complete and correctly fingerprinted, and reports full-deal equality separately from input-order/Prize-overlap diagnostics. It is deliberately labeled `aichi-actual-source-ordered-deal-paired-sampler-v2`, so old v1 records are not silently reinterpreted. The existing manual `source-deal-fingerprint-smoke.yml` has a boolean `full_source_setup` opt-in. There are no new push-triggered workflows.

## Compiled result and independent artifact check

[**Successful compiled CI #39399674925**](https://github.com/FlareZ123/experiment-01/actions/runs/39399674925) ran with research head `2d5f2f4fb27eee34654818bdc035e550c6b7a08f`, pinned upstream engine `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05` and Node 20.19.0. All pure fingerprint / setup tests passed and all 120 opt-in authentic Store root captures completed. Archived [artifact ID 12255081521](https://github.com/FlareZ123/experiment-01/actions/runs/39399674925/artifacts/12255081521).

Independently downloaded the original artifact ZIP and checked its exact bytes with Python `zipfile`, `hashlib`, `json`:

- ZIP SHA-256 `d1f0902887198dca3bf939f0d82d0346b7404ba527a0bb416da7ef24955724ae`, **8917 bytes**.
- Inside file `aichi-full-source-deal-audit.json`, **189645 uncompressed bytes**, SHA-256 `33869f3947389ee51121af49e86b1f02e6a47570353ed438c11b33f3ea8b1397`.
- Actual JSON: `120` Store samples; `48` native-vs-aligned contrasts; every sample reports `stoppedAtFirstTurn=true`, `openingInventoriesVerified=true`, valid ordered source digest, **zero errors**.
- Exactly **24** five-arm source blocks, with **24 distinct** reference source fingerprints. All **96/96** matched arms have the **same full ordered source physical-deal fingerprint** as the source reference within their rank/repetition/seed/physical-slot block.
- All **96/96** also preserve the earlier (weaker) source-zone digest and the actual candidate-first status.

| Published rank | Frozen blocks | Source full ordered positions match reference | Source-zone digest matches reference |
| --- | ---: | ---: | ---: |
| 6 | 8 | 32/32 | 32/32 |
| 8 | 8 | 32/32 | 32/32 |
| 10 | 8 | 32/32 | 32/32 |
| **Total** | **24** | **96/96** | **96/96** |

Each actual starting seat contributes **16** full-deal matches per rank. Reference candidate started first in 16 of 24 blocks and second in 8. The 96 observations are dependent within 24 blocks; no independent win-rate binomial inference is justified. Matching SHA-256 is strong evidence of identical serialized source card positions in those exact builds and seeds, subject to collision negligible but not logically impossible.

## Interpretation, still-open threats and next gate

The successful v2 root boundary **repairs the important limitation** of the earlier early-turn snapshot: in these frozen deals, the source opponent's actual ordered initial card positions agree despite changes to candidate 60 and input order. This supports common-random-numbers **source initial-condition parity** for these particular source configurations. It does not authenticate the **opponent's hidden RNG state**, conditional source mulligan bonus choices, the candidate's own equality of hands/Prizes (the treatment intentionally differs), future source action decisions, policy legality/competence, actual damage/Prize settlement or complete-game causal comparability. The researcher-only hash must never be supplied to either player policy.

Other candidate inventories (including New Moon), other source archetypes, other seeds, different code revisions and later game turns are untested. Any future rank6/rank11 canonical bilateral experiment must record source full-deal digest **and** actor-visible policy decisions and all failed/censored trials, and must not require positive lock susceptibility for a naturally unaffected candidate. The next high-information step is a genuinely source-dealt authentic opponent pressure → legal candidate attack/response → next source turn under one frozen common policy, not additional overlapping setup-only samples.

As of this report, **29/32** exact Aichi source 60s are documented, **zero** competitive-qualified matches, and the intended **99.5%** single fixed deck remains unproven.
