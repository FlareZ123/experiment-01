# Source-dealt rank11 Garbotoxin suppresses rank1 Underworld Door

**Agent 6, 18 October 2026 UTC.** The source-dealt first-turn Garbodor [forced line](rank11-firstturn-boostshake-source-fork.md) was followed until the rank-1 Shadow Rider player actually evolved a VMAX. The pinned engine reported its **Underworld Door blocked by the live opposing Tool-equipped Garbodor** on a real player turn. This is a **live source-board Ability-availability witness**, not a legal Ability-use attempt or qualified competitive game.

## Paired protocol

The exact published rank11 Wataru Yano 60 occupied seat0, actually first; published rank1 Yasunori Kato 60 occupied seat1. Original seed **1244180408**, Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`; `forestSealSearchCorrection`, `battleCompressorPositiveSelectionCorrection`, `isolatePolicyRandomness`, `strictPromptValidation` all enabled.

Run the [read-only public-board observer](../../simulation/twinleaf/rank11-source-underworld-lock-exposure.cjs) around the original source game and around the eleven-action first-turn VIP / Forest Seal Stone / Star Alchemy / Boost Shake fork. Its hooked actual Store `dispatch` captures only acting-turn public Pokémon, attached Tools, and the rank-1 player's own hand marker for Field Blower. It calls pinned `IS_ABILITY_BLOCKED` on an **actually in-play Shadow Rider Calyrex VMAX** with its own printed Underworld Door power. No opponent hidden hand or Prize identities enter the observer.

[Manual compiled CI **39082480144**](https://github.com/FlareZ123/experiment-01/actions/runs/39082480144) **PASSED** at head `3aed62286a26529219111eb942f9ef3f176b8ed2`; JSON artifact `12119308181`, SHA256 `c9af6f46f06ff8db361b5383b8abc9b74268ecc479d1263ca36b6f4a4212e0b2`. Both arms produced the same deck hashes and first-turn seating; both retained rank11 as the generic-engine winner. A separate complete uninstrumented replay-equivalence assertion for this particular lock observer remains a proposed improvement, so retain a narrow inference.

## Observed windows

| Source arm | Distinct sampled signatures | VMAX in-play signatures | Tool-equipped Garbodor signatures | Both with Underworld Door blocked |
| --- | ---: | ---: | ---: | ---: |
| Original default rank11 | 17 | 17 | 0 | **0** |
| Forced rank11 turn-one Shake | 60 | 57 | 47 | **44** |

A signature is deduplicated by global turn, Store action kind, VMAX count, Tool-Garbodor count and blocking boolean. Several can arise within the *same turn*, so **44 is not a number of matches, turns or independent success trials**.

The **first actual lock witness is global turn 4**: rank1 has **one Shadow Rider Calyrex VMAX in play**, rank11 has **one Tool-equipped Garbodor**, `IS_ABILITY_BLOCKED` returns **true** for Underworld Door, rank1's own hand does **not** contain Field Blower at that decision boundary, and the rank1 Active is Radiant Eternatus. The same blocked status appears in later sampled actions from turns 6, 8, 10, 12 and 14. This confirms a meaningful conditional lock that the original source weak bot missed.

The first forked opponent turn (global turn 2) previously showed the rank1 bot attach Psychic Energy and pass; on turn 4 its VMAX now exists, so the lock availability test has an actual relevant target. The record does **not** establish whether the strong response would have searched for a Tool remover, retreated differently or taken other strategic actions. Nor does it show a rejected `UseAbilityAction`, a prevented attachment, or a KO attributable solely to the lock.

## Implication

Any candidate comparison against rank11 that relies on the original generic bot's absence of early Garbotoxin is underexposed to the printed tournament opponent's key ALS. The source fork and lock witness provide a regression target for **competent fixed-policy adversarial simulations**. Broader seed coverage and responses are still needed before estimating matchup win probability.

**Benchmark unchanged:** 29 exact published Top-32 lists, ranks 23/25/28 unknown, zero independently qualified competitive games, no demonstrated 99.5% list.
