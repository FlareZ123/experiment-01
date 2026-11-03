# Japanese M4 Special Red Card: exact original native printing yields one new paper ineligibility proof

**Agent 4 | 3 November 2026 | real pinned Store A/B/A evidence, source-printing correction; zero competitively qualified games**

## Source problem

The original Japanese Aichi Open League was played **10 May 2026**, after Japanese **Ninja Spinner M4** became available on **13 March 2026**. Its source-printed **Special Red Card M4 (#72)** states that the Item can only be used when the opponent has **three or fewer Prize cards remaining**. The corresponding English-display **Special Red Card CRI (#82)** was released later, on **22 May 2026**. The shared 29-original source roster `results/aichi-2026/full-decklists.json` expressly uses translated English print IDs where available and requires original Japanese printing verification. It reports **two CRI-display copies at rank5** and **one at rank26**, but this is a display/transcription convention rather than proof that post-event English cards were physically played at Aichi.

Previous exact-print source rules recognized only the English `Special Red Card CRI`. Actual native original-source observations have an **`M4`** hand printing, so the previously omitted public Prize prerequisite was conservatively classified UNKNOWN. No paper-playable false positive was certified, but the negative denominator was incomplete.

Sources: [official Japanese publisher expansion announcement](https://www.pokemon-card.com/ex/m4/), [official Japanese card #50156](https://www.pokemon-card.com/card-search/details.php/card/50156/regu/all), [Limitless Japanese M4 #72](https://limitlesstcg.com/cards/jp/M4/72?translate=en), [later English CRI #82](https://pokemoncard.io/card/special-red-card-me4-82/), and [Agent9's independently observed rank5 same-root enumerator counterexample](../agent9-rank5-turn16-native-enumerator-bidirectional-20261103.md).

## Source-exact, negative-only correction

- [Agent30 public Prize gate](../../../simulation/evaluation/agent30-public-prize-trainer-necessary.cjs) v2 adds **`'Special Red Card M4'`** with source identifier **`jp/M4/72`**, `Item`, and `opponent-prizes-at-most-3`. Existing English `'Special Red Card CRI'` remains distinct with identifier `me4-82`; names/other printings are not generalized.
- [Agent4 full owner root screen](../../../simulation/twinleaf/agent4-owner-paper-trainer-necessary-screen.cjs) v7 embeds that certificate in the same already-composed Trainer opportunity denominator. Opponent public Prize counts alone determine whether the necessary condition fails. Satisfying the public threshold remains UNKNOWN for all other card, payment, and Store conditions; no full card-text or strategic legality is inferred.
- [M4 native-alias regression](../../../tests/agent4-jp-m4-prize-native-alias.test.cjs) covers opponent remaining six/five/four = blocked; three/two/one/zero = not disproven, still UNKNOWN, distinct source IDs, exact actor's hand index, and complete independence from opponent concealed data.
- The original Aichi source decklist JSON was **not** rewritten. Historical pinned v3 preregistration and its results were **not** recomputed under this new screen. The v3 snapshot's deliberate Git blob enforcement still rejects a modern mutable HEAD with changed paper-rule source; old pinned tests remain attached to the archived commit.

## Authentic six-attempt same-seed native replay: one exact changed physical copy

The old v6 [CI 41693495660](https://github.com/FlareZ123/experiment-01/actions/runs/41693495660), [raw ZIP artifact 13258815691](https://github.com/FlareZ123/experiment-01/actions/runs/41693495660/artifacts/13258815691), ZIP SHA256 `f87ad90f1a241474c8878de32b0b747791c2f1e8076567d1eea9d2d9e4113747`, and new v7 [CI 41701394356](https://github.com/FlareZ123/experiment-01/actions/runs/41701394356), [raw ZIP artifact 13263780753](https://github.com/FlareZ123/experiment-01/actions/runs/41701394356/artifacts/13263780753), ZIP SHA256 `64aa9ff800ddd5380cd2e2d4f037ead753655943d9818042af228b2ac5fe164c`, were independently decoded and compared by Agent4. Both use the exact frozen historical original rank5/rank11 source 60s, original two known seeds (912174767,1914651848), both actual physical source-seat placements and the identical pinned Twinleaf engine `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. Three arms per seed = six authentic native attempts in each run.

**All 6/6 new Store attempts completed to the 90-root action cap without error.** All original physical initial-deal SHA256 fingerprints and complete accepted root ledger SHA256 fingerprints match their old v6 counterparts **byte for byte** across all three A/B/A arms, with the same 56 owner decision observations and 452 held Trainer-copy observations.

| Identically rooted original owner screen | Former v6 | New v7 | Difference |
| --- | ---: | ---: | ---: |
| Genuine owner decision frames | 56 | 56 | 0 |
| Repeated held Trainer appearances | 452 | 452 | 0 |
| Proven necessary-condition failures | 60 | **61** | **+1** |
| Remaining complete paper eligibility UNKNOWN | 392 | **391** | **−1** |
| Public Prize prerequisite held-copy observations | 0 | **1** | +1 |
| Proven public Prize failures | 0 | **1** | +1 |
| No-public-removal-target failures | 3 | 3 | 0 |
| Post-first-owner-turn VIP failures | 51 | 51 | 0 |

The **only newly classified actual source physical held copy** was:

- **Source seed 912174767; rank5 owner physical seat0; game global turn25; owner-root ordinal26; hand index18; `Special Red Card M4`, native enumerator offered = true.**
- Both public Prize counts were six, and the existing native owner root **selected PassTurnAction**; Store accepted Pass. Printed Japanese condition `opponent-prizes-at-most-3` failed, giving `printed-prize:public-prize-prerequisite-failed`. The old v6 row had no necessary blockers and was UNKNOWN; new v7 row certifies (paperPlayable=false). The new object retains `nativeStoreAcceptance='unverified'`, so **the Store was not asked to play Special Red Card**.
- That complete rank5-owner first physical-deal group had SHA256 `65c87abb4eb03985598acf3306a5169bb82a6b8a8fd021b630cb5c0f2318886a` and native complete-action SHA256 `0b241bf5f46f134df9cd062f3bd3daf0c4228caf2e4e0a5df5c18dfb3e38a4fc` in both v6 and v7 controls and observer, establishing read-only parity.

This **source-observed M4 offer** independently confirms Agent9's same-root conclusion that native Trainer enumeration may expose an Item when a printed Prize prerequisite is false, without implying actual Store acceptance. It occurs at a **different** authentic physical root from Agent9's rank5 global turn16 case, supporting recurring source-printing coverage concerns without producing an independent game-win sample.

## Evidence limits and next step

These are **repeated physical held-card observations across two reused actual seed groups**, with **zero qualified paper games**, no sampled competitive opponent competence, no game clock, no terminal observed within 90-root caps, no independently validated field win rate and no final fixed 60. The +1 is a **paper ineligibility proof** conditional on observed public Prize counts, rather than evidence a different card is strategically better.

The strongest next integrated owner-arbiter test is a genuine **action-changing** same-root comparison: owner-pass versus a physically affordable Basic search/Trainer's Mail line, with exact payment/target, effect prompt closure, supporting Bench and Energy position, opposing reply, and the first actual attack/Prize payoff before promoting any candidate policy. Keep source alias mapping and actual Japanese release chronology separate from English-display roster fields.
