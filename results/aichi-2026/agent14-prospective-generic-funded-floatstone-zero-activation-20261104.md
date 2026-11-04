# First prospective original-source A/B: generic Float Stone mobility changes zero real roots

**Agent14 | 4 November 2026 | prospective 6 newly randomized original-source configurations × 2 unchanged candidate decks × 2 policies = 24 native attempts. Development-only, no competitively qualified games.**

## Question and registration

Would a single source-independent owner-public Float Stone rescue policy, after six successful *constructed-state pinned Store* tests, change actual opponent-source play on previously unseen physical initial deals for original Aichi rank **1 Shadow Rider**, rank **11 Mega Absol/Garbodor**, or rank **30 Lillie's Clefairy**?

The **pre-execution registration** is [agent14-prospective-generic-funded-floatstone-20261104.json](registrations/agent14-prospective-generic-funded-floatstone-20261104.json), committed as `1edd289b9649621ad90ece2fb7ed20e5d082cdbd` before launching the native CI. Six independent Python `secrets.randbits(32)` seeds cover source rank 1/11/30 with candidate physical seat A and B, respectively. Both unchanged candidate sixties, `champion-reference` and `new-moon-lockbreaker-v1`, were paired with each seed for **12 registered original-physical matching pairs**.

The control and treatment both used the same frozen `agent41-frozen-bilateral-development-v2.json` actor-only profile, plus identical natural evolution, VIP, Mega Absol funding, generic paid Retreat and Underworld Door actor/prompt options, in **both seats**. The **only** policy difference was `actorGenericFundedFloatStoneRoot:false` versus `true`. All original 60-card source and candidate deck fingerprints were preserved, with a full same-physical-deal and actual starter-seat check for every paired comparison. Native rules engine pin was `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.

## Reproducible evidence

- [Actual completed GitHub Actions run **41884669860**](https://github.com/FlareZ123/experiment-01/actions/runs/41884669860), **SUCCESS** on actual research HEAD `7b9705fdbd7342a426858f4882cb8483603393ba`, job **126765825728**, ran both identical-deal arms against pinned compiled Twinleaf, verified all exact registered IDs, and uploaded the raw observations.
- [Archived original full two-arm JSON and SHA-256 manifest](https://github.com/FlareZ123/experiment-01/actions/runs/41884669860/artifacts/13351940105), artifact ID **13351940105**, ZIP SHA-256 **`02aed8fe9420de48f64c23324d45372cdecd64acdef86858781ece8c8d6a0fa2`**.
- I independently downloaded the archived artifact through the GitHub connector and checked the bytes. ZIP contains **20,783,131-byte JSON** `agent14-prospective-generic-funded-floatstone.json`, SHA-256 **`f66065ed23626de9253d20203cce5ac068e58f22e4324fd8ea11c98736e02fd9`**, matching the included checksum file. Runner output's source closure SHA-256 **`eec16d96b2bbdab9f4a02d953c95f3fc8f6a8e678ebd7598ee79e2141b2cd7b6`**. The archive holds full raw `rawControl.rows` and `rawTreatment.rows`, native root-action ledgers, physical setup/source/candidate fingerprints, censors, source attacked turns, and summary comparisons.
- Committed reproducible [registered actual-Store runner](../../simulation/evaluation/agent14-prospective-generic-funded-floatstone.cjs) `728b3fea2eeaf7e1412c45c2f8f5de14560ee4f6`, existing [manual-only workflow](../../.github/workflows/agent14-native-floatstone-reply.yml) input `generic-field-matched`. It serializes complete control then complete treatment atomically with a lock, and uploads through `if: always()`. No automatic CI trigger.

## Actual results

| Original rank | Physical seed/seat groups | Registered 60-pair comparisons | Different root sequences | Native ending/censor |
| --- | ---: | ---: | ---: | --- |
| 1 Shadow Rider | 2 | 4 | **0** | All 4 arms in each policy ended by native game resolution |
| 11 Mega Absol/Garbodor | 2 | 4 | **0** | 3 native endings, 1 native action-limit cap, identically both policies |
| 30 Lillie's Clefairy | 2 | 4 | **0** | 3 native endings, 1 native action-limit cap, identically both policies |
| **Total** | **6** | **12** | **0 / 12** | **10 native endings, 2 action-limit censored**, identically both policies |

**All twelve pairs passed all original-deck fingerprint, candidate-deck fingerprint, complete two-player physical opening fingerprint, source deal fingerprint and actual starter-seat equivalence checks.** For every pair, `rootFirstDifferenceOrdinal:null` and unchanged exact full native root ledger; there were **no selected RetreatAction roots and no Float Stone card-name roots in either arm**, inspecting all 1,845 logged actions per arm. Each arm consists of **1,257 ResolvePromptAction, 209 AttackAction, 202 PlayCardAction, 171 PassTurnAction, six UseAbilityAction, zero RetreatAction** across these 12 attempts.

The explicitly enabled new generic tactic thus caused **zero observed changes** in this finite registered sample. The stated subset of original ranks, development policy, controlled physical deals and action limits are critical to the interpretation. An unchanged root sequence cannot distinguish a genuinely unavailable legal opportunity from an opportunity overshadowed by earlier policy actions unless owner-hand/public-board roots are instrumented at the exact decision moment. The output does not support a game win-rate change, paper matchup superiority, nor a claim that Float Stone is strategically unimportant.

### What this falsifies and what remains untested

The six prior [successful staged cases](../twinleaf/agent14-generic-funded-bench-floatstone-three-family-20261104.md) proved that hand Tool→native free Retreat→real damaging attack is executable on those conditional **constructed** boards (200 Claw, 100 Rondo, 220 Max Geist, both player seats). Those results **do not show** the conditional opportunity arises when real original source lists are played from shuffled seven-card hands. This prospective A/B is a direct negative check against confusing demonstrated *conditional access* with *measured on-policy success*.

Potential next investigation: audit whether an actual Pass or underfunded Active owner root simultaneously has held Float Stone, a funded Bench attack, an unused retreat and no suppressing public lock. Compare the proposal's opportunity score against source-native actor choice and other competing actions. Instrument an **observer-only** legal opportunity census on a frozen set of registered real source deals, identical policy in both seats, before changing priority again. Promote selected Issue25 only after actual honest original-source action, physical payment, complete attack effect and defender follow-up. Avoid repeatedly registering cosmetic Float Stone toggles without such evidence.

**Benchmark limits:** 29/32 authenticated original source 60s (ranks 23,25,28 missing); no competent all-32 opponent-response model, no official 25-minute game timing, incomplete paper card/engine fidelity, **zero competitively qualified games and no established 99.5% win rate**.
