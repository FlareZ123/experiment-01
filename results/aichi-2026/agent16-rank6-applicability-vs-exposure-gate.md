# Candidate immunity can make the rank6 bilateral early-pressure gate structurally unsatisfiable

**Agent 16, 20 October 2026. Evidence: independent source-code implication, exact native paired source opening, and logical counterexample. Methodological finding, no strength estimate.**

## Executed counterexample to conflating lock source with affected target

In the registered historical source-first rank6 seed `407516727`, candidate seat B, the source's genuine Active is **Iron Thorns ex TWM** on both candidates' first turns. The physically dealt source initial digest is identical across the frozen champion reference and New Moon lists. [Compiled full native replay 39371254472](https://github.com/FlareZ123/experiment-01/actions/runs/39371254472), 20/20 tests passed, archived artifact `12242130186`. The read-only full public-Power checks at candidate turn2 report:

| Candidate | Source's Active | Visible eligible non-Future Rule Box Powers | Native blocks |
| --- | --- | --- | --- |
| Champion reference | Iron Thorns ex | Latias ex **Skyliner** and Tapu Lele-GX **Wonder Tag** | Both blocked |
| New Moon Lockbreaker | Iron Thorns ex | None: Unown Active, Solrock + Trevenant & Dusknoir-GX Bench | None possible |

For the champion, we also executed a separate pinned native Store Active/Benched control proving a real Latias **retreat-cost and RetreatAction availability** difference (see [printing-specific report](agent16-rank6-latias-mobility-pressure-window.md)). The New Moon no-target row still correctly belongs in the unconditional matched source-deal census, and its original action-cap outcome must be retained.

The second row is **not evidence that the source failed to establish Initialization**. A continuously active lock can exist without a target. If the opponent is inherently immune or has not yet played an eligible Pokémon, that absence is strategically meaningful and depends partly on candidate deck construction. It cannot be equated with a failed source opener or a missing source first-turn root.

## Formal gate failure mode

The existing [rank-specific preflight](../../simulation/evaluation/agent3-source-first-pressure-kind.cjs) returns source-first native pressure verified for rank6 only when `rank6PassivePressure.nativeCapabilitySuppressed===true`. The [bilateral v2 intake](../../simulation/evaluation/bilateral-v2-evidence-gate.cjs) then sets a pair's `bothSourceFirstEarlyPressureWitnesses` only if **both candidate arms** have that positive source-first pressure witness. Its `bothHardRanksHaveSourceFirstEarlyPressurePairedBilateralWitnesses` and higher `nativeSourceFirstEarlyPressure` promotion conditions require such a matched positive pair for rank6.

Consider any otherwise legal deck deliberately constructed with **no Ability on a non-Future Rule Box Pokémon**, for example a non-Rule-Box-only plan or Future-only Pokémon. Under correct Initialization semantics, it can be genuinely source-first-exposed on every seed while having **zero eligible native Power targets on every seed**. For that deck, `nativeCapabilitySuppressed` is always false. Consequently **no positive rank6 pair can satisfy the present two-candidate positive-pressure predicate**, even with a perfect opponent source policy, correct physical deals, flawless participant decisions and complete paper rules. This is a structural acceptance counterexample, not an observed competitive outcome.

The current gate describes itself as a *mechanical stress pilot*. Such a positive-affected-target test can be useful as a separate integration proof. It must not be mistaken for a universal prerequisite proving all robust candidate inventories comparable or for an appropriate filtering rule on a future fixed-deck win-rate denominator. A deck may be *stronger against the opposing lock precisely because it avoids providing targets*.

## Minimal actionable repair to consider

Keep three independent evidence dimensions in the **same existing** canonical runner and intake, rather than inventing a second cohort or relaxing paper legality:

1. **Source lock establishment and continuity:** authenticated source-first board and real Store turn lineage; an Active Iron Thorns ex with functioning Initialization confirmed through a controlled vulnerable positive/negative Power test when available. This is source-policy/effect fidelity, independent of whether the current candidate presents a susceptible Pokémon.
2. **Candidate-specific applicability:** report `native-blocked-eligible-power`, `no-eligible-power-present`, `only-exempt-power-present`, `target-present-but-not-blocked`, or `unverified` for every genuine source first start. Preserve every category in denominators. This is susceptibility and actual visible board.
3. **Tactically denied action:** only promote a proved applicable attack, Ability, retreat, draw or search line when an owner-legal opportunity is independently observed. A generic blocked Power name is insufficient, and native Action acceptance on staged boards does not establish that a policy would choose it.

A dedicated **positive-affected-target stress test** may continue to require an actually blocked Power, even for both candidate lists when testing a specifically selected susceptible pair. The full prospective and competitive evaluation gate needs an explicit valid **source-functional, candidate-unaffected** branch so a deliberately lock-resistant deck is evaluable without forging an Ability target or conditioning away its successful resistance. Full-policy information safety, clock, source exact lists and actual game wins remain hard independent requirements.

This finding builds on Agent39's existing warning about candidate-dependent opening target selection. Its additional contribution is the **algebraic impossibility of the present paired-positive criterion for whole classes of legal deck inventories**, linked to the new real pinned paired source opening and hard-coded v2 gate conditions.

**No deck win or 99.5% claim is supported.** Exact Top32 source coverage remains 29/32; ranks 23, 25 and 28 lack attributable full 60s.

## Concrete Top32-derived candidate that the current criterion cannot accept

The frozen exact-published Aichi field roster `results/aichi-2026/full-decklists.json` contains **rank 6, Kazuma Kashi**, with exactly **four Iron Thorns ex TWM 77** as its *entire Pokémon inventory* and 56 Trainer/Energy cards. It also contains **rank 29, Kohei Hamamichi**, with the same four Iron Thorns ex-only Pokémon structure. Iron Thorns ex is a **Future Pokémon** with the printed Initialization Ability. The Ability's own restriction expressly excludes Future Pokémon.

An unchanged legally registered copy of either source 60 used as the *candidate* against another Iron Thorns ex-only source is an actual known-in-field, completely specified archetype, rather than a made-up theoretical inventory. There can **never** be any candidate-side **non-Future Rule Box Ability** for the opposing Iron Thorns to suppress on any turn or seed: the candidate's only Pokémon are Future-tagged Iron Thorns ex. Nonetheless source Active Initialization may be continuously functional, and the candidate remains a real competitive tournament list. Thus the two-candidate-positive-block pilot gate can never accept a pair containing this candidate, independently of player skill, source setup or random draw. This sharpens the structural limitation with a **verified 60-card real-world roster**. Do not mistake this for a demonstration that the rank 6 mirror matchup is favorable or that the list is a strong final nomination; it is purely a format-and-evidence applicability counterexample.

### Full exact-ranked Future-only cohort

The same immutable full-decklist manifest additionally confirms **rank 24, Ryoya Fujii**, also exactly four Iron Thorns ex TWM 77 and no other Pokémon. Thus **all three** published Iron Thorns Top32 source 60s, ranks **6, 24, 29**, satisfy the Future-only structural counterexample (three of 32 ranks, **9.375%** of the equal-rank field). Their Trainer/Energy distributions differ; the exclusion proof depends only on the exact printed Pokémon entries. These rosters also show why an Ability-suppression-positive-only evaluation sample is a poor substitute for a complete rank-weighted field comparison. This is a composition fact and qualification-logic result, not a simulated matchup.
