# Agent 25: Dhelmise donor mix maximin and simultaneous discard-Ability locks

**3 November 2026.** Exact paper-text/card-location stress screen of the exploratory post-Aichi 60. The fixed historical Aichi source benchmark remains 29/32 printed original sixties, with zero competitively qualified games. This report proposes no new final deck and assigns no game-win probability.

## Independent individual locks: eight donors already maximin

The source English ME5 printings define three different donor categories:

- Banette ME5 34: Psychic, Stage 1, Hide 'n' Sneak.
- Shuppet ME5 33: Psychic, Basic, Hide 'n' Sneak.
- Sinistcha ME5 6: Grass, Stage 1, Hide 'n' Sneak.
- Poltchageist ME5 5: Grass, Basic, Hide 'n' Sneak. Neither Wobbuffet nor Silent Lab leaves its Ability eligible in the corresponding individual active-lock state.

An active Wobbuffet PHF / Bide Barricade suppresses the *non-Psychic* discarded Abilities. A live Silent Lab PRC suppresses *Basic* discarded Abilities. Under the 4-copy ceiling for each named printing, exhaustively enumerate all integer donor mixes summing to eight. The unique global four-print mix maximizing the worse of the two **individual** active-lock effective counts is **4 Banette / 2 Shuppet / 2 Sinistcha**. Its six effective donor cards under either named lock are exactly the existing [v2 60-card mix](agent25-dhelmise-mixed-lock-answers-v2.json). With ten donor slots, the analogous unique maximin is 4/3/3/0 (Banette/Shuppet/Sinistcha/Poltchageist), retaining seven under either individual lock. These are combinatorial donor-count results only. They do not price the Trainer slots displaced by an expansion.

## Simultaneous Wobbuffet and Silent Lab

If **both** effects operate at the same time, Psychic Basic Shuppet loses Hide 'n' Sneak under Silent Lab and Grass Stage 1 Sinistcha loses it under Wobbuffet. Only Psychic Stage 1 Banette retains its Ability. Because Banette is capped at four copies, expanding Shuppet and Sinistcha fails to raise the effective donor count for this **joint** condition.

The previously implemented exact nine-category [first-seven/one-draw/six-Prize model](../../scripts/agent25-dhelmise-lock-conditioned-opening.cjs) is reused without altering its physical sampling algorithm. Strict event: a Dhelmise starter, an early Telepathic Psychic Energy, at least one Clefairy not fully inaccessible in Prizes, a held Blender or accessible Arven-to-Blender or two held Compressors, and **four eligible donors remaining searchable in deck**. Ineligible donors are physically present in the random deal. This model does not assert that its required Item plays remain legal under other locks.

| Donor slots | Mix: Banette/Shuppet/Sinistcha | Valid-opening Basic count | Eligible under both | Strict event, all random shuffles | Strict event given Basic-valid opener |
| --- | --- | ---: | ---: | ---: | ---: |
| **8, existing v2** | **4/2/2** | **14** | **4** | **2.89554279%** | **3.36140174%** |
| 10, hypothetical | 4/3/3 | 15 | 4 | 2.89554279% | 3.28107127% |
| 12, hypothetical | 4/4/4 | 16 | 4 | 2.89554279% | 3.21449420% |

Exactly four retained donor Abilities are necessary under the joint condition. All four Banette avoid the six hidden Prizes with exact probability **64.85404042%**, before accounting for starting hand, location in deck, discard/payment, access and opposing play. This is a **necessary Prize-only ceiling for the unassisted four-donor package**, with Prize-recovery and lock-clearance lines outside its scope. The candidate's single-lock and unlocked events have been quantified separately in [the older source report](agent25-dhelmise-post-aichi-lock-hardened-screen-20261031.md) and [the prior lock-conditioned model](../../scripts/agent25-dhelmise-lock-conditioned-opening.cjs).

The ten- and twelve-donor cases are counterfactual slot reallocations. Each extra donor is assumed to displace a non-Basic Trainer, retaining the named setup core. No complete alternative 60 or real-game effect can be inferred from those abstract reallocations. **In the 29 authenticated original Aichi Top32 printed sixties, zero lists contain both Wobbuffet PHF and Silent Lab PRC.** Wobbuffet appears in ranks 7, 10, 21, while Silent Lab appears in 9, 13, 15, 32. The original printed sixties for ranks 23, 25 and 28 remain missing, so joint-lock co-inclusion is unknown for those sources. This coexistence check is printed-card presence, not actual lock incidence. The combined case is a robustness stress test, not observed matchup frequency or a proposed change to the fixed candidate.

## Verification and implications

New [small enumerator/wrapper](../../scripts/agent25-dhelmise-dual-lock-donor-window.cjs) reuses existing card-location enumeration and Prize survival functions, and [three regressions](../../tests/agent25-dhelmise-dual-lock-donor-window.test.cjs) verify exact printed types/stages, all eight-donor mix alternatives, the unique ten-donor maximin and identical joint-lock favourable worlds across all three donor budgets. All passed in the existing manual-only [Aichi field threat workflow, CI 41587063213](https://github.com/FlareZ123/experiment-01/actions/runs/41587063213) at commit a183b85fe2511798338ced11d062de07bfd0b604.

For future deck search, raising donor density helps a **single** active lock but has sharply diminishing value against simultaneous orthogonal suppression. A solution to the latter needs a real lock-removal line or an alternative payoff, evaluated under Item/Supporter contention and realistic native owner-only decisions. The numbers above should never be substituted for success probabilities against an active opponent. No engine-victory or tournament-victory claim is added.


**Post-report source-roster regression:** The original 29 printed-sixty disjointness assertion was added to the same test and passed the independently dispatched [manual field audit CI 41587796180](https://github.com/FlareZ123/experiment-01/actions/runs/41587796180) at head 7e55a21c6e2b. This strengthens only the known 29-source co-inclusion claim; three original sixties remain unknown.

**3 November exhaustive-pool strengthening:** The full attached English ME5 source includes Poltchageist ME5 5 as the fourth Hide 'n' Sneak printing. It is Grass Basic, so it contributes zero eligible donors under either Wobbuffet (Grass suppression) or Silent Lab (Basic suppression). The maximin enumerator was extended to include 0-4 Poltchageist alongside the three other printed donor groups. The unique eight- and ten-donor optimizers remain 4/2/2/0 and 4/3/3/0 respectively; all other 4-print mixes give a lower minimum eligible count. The original v2 60 remains unchanged.
