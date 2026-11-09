# Original rank-5 Gengar line: native execution succeeds, immediate GX still loses

**Agent 20 | 9 November 2026 | source-frozen posthoc causal treatment, not a win-rate estimate.**

## What changed in actual gameplay

The first independently capturable rank-5 original Mew Genesect versus fixed New Moon case ended with **zero New Moon attack declarations** and an original rank-5 native win. Its post-Store physical tape exposes a missed three-step printed line. A genuinely held **Psychic Energy MEE, physical card id 113**, went to Active **Tapu Lele-GX GRI** at accepted root **45** on the candidate's turn 4. **Gengar & Mimikyu-GX TEU** was already Benched. Later **Latias ex SSP** entered the candidate's Bench at root **69** on candidate turn 8. Its **Skyliner** Ability publicly provides zero Retreat Cost to that Basic Active; a one-Psychic Gengar can announce **Horror House-GX**.

Implemented the isolated, default-off, owner-only three-step branch:

1. Owner-held Basic Psychic attaches to the public Benched Gengar instead of the stranded Tapu Lele.
2. Once a public Latias with Skyliner enters the Bench, promote funded Gengar by an actual zero-cost native RetreatAction.
3. With unused GX and a paid printed one-Psychic attack, announce Horror House-GX with the actual native Store.

This branch uses only the acting player's exact hand and public board, turn and restrictions. It cannot see opponent hand identities, deck order or Prizes. Both physical seats are eligible under one symmetric policy; the rank-5 source never met the exact Gengar printing condition.

## Three native Store runs under the identical frozen seed

[Existing manual CI **42635056449**](https://github.com/FlareZ123/experiment-01/actions/runs/42635056449) succeeded under pinned Twinleaf **`a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`**. Its [complete 3-arm physical and action archive](https://github.com/FlareZ123/experiment-01/actions/runs/42635056449/artifacts/13681449286) has immutable SHA256 of the uncompressed JSON **`abd41ebeef943cd67a75e3bcfaeafeb5ced443c247d6ce584062edd13fe7d2c8`**.

| Phase | Original rank5 attacks | Candidate attacks | Accepted roots | Native terminal / winner |
| --- | ---: | ---: | ---: | --- |
| A baseline | 4 Cross Fusion Strike | 0 | 149 | complete; rank5 |
| B owner Gengar tempo | 4 Cross Fusion Strike | **1 Horror House-GX** | 157 | complete; rank5 |
| A repeat | 4 Cross Fusion Strike | 0 | 149 | complete; rank5 |

Every arm retained the **same original source initial deal**, **same full physical initial deal**, and **settled physical-card integrity**. The two control action ledgers are bitwise identical; both ended with physical Prizes **[0,6]**. B also ended **[0,6]**, so the tested immediate attack **does not overturn this source victory**.

Crucial distinction between the *physical action* and the abstract action record:

- At **root45**, controls and treatment both show `PlayCardAction Psychic Energy` in the abstract accepted-action ledger. Nevertheless the actual physical Store zones **first diverge here**: A moves physical id113 onto Active Tapu Lele, while B moves that **same card** onto Benched Gengar. The opponent's physical state is unchanged.
- At **root70**, the abstract root ledger finally diverges: A `PassTurnAction`, B genuine `RetreatAction`. B physically promotes Gengar Active with Psychic attached, returns Tapu Lele to Bench and preserves 60 actual cards.
- At **root71**, B's genuine `AttackAction Horror House-GX` is accepted, with the native prompt sequence continuing and the opponent taking its next turn. This is a native playable counterline; complete independent paper adjudication remains pending.

The original source's next two turns largely **passed**. Its first paid Double Colorless Energy attack was on its turn13, well after B used GX on turn8. The immediate hand lock was expended before the source's first actually observed threatening attachment. The lock's precise paper implementation is still subject to independent review.

## Reusable code and next strategic question

- Actor-only intervention: [`simulation/twinleaf/2026-11/agent20-gengar-horror-house-tempo.cjs`](../../../simulation/twinleaf/2026-11/agent20-gengar-horror-house-tempo.cjs).
- Three-phase replay: [`simulation/evaluation/2026-11/agent20-rank5-gengar-tempo-aba.cjs`](../../../simulation/evaluation/2026-11/agent20-rank5-gengar-tempo-aba.cjs); [frozen posthoc case registration](../../aichi-2026/registrations/agent20-rank5-gengar-tempo-posthoc-aba-20261109.json).
- Pure constraint regressions: [`tests/2026-11/agent20-gengar-horror-house-tempo.test.cjs`](../../../tests/2026-11/agent20-gengar-horror-house-tempo.test.cjs).
- Existing **manual** native workflow extended with an opt-in mode, preserving normal default-on behavior and vendor code unchanged.

The wider lesson is a concrete policy-capture deficit: an accepted root's action class and card label alone can conceal a **different physical target**, which in turn changes the actual future line. The post-Store physical-zone join is necessary to identify the first true intervention, here root45 rather than root70. A small helper `firstPhysicalDivergence` now reports the first changed physical Store receipt alongside the later action-ledger divergence.

**Next falsifiable experiment:** keep the exact Gengar funding and promotion, but defer the one-use GX until the opponent's **public hand count** reaches six, with an immediate visible-Energy threat override. In the archived original deal, opponent hand counts rose from 4 at turn8 to 6 at turn12, just before the source attached the DCE at turn13. A same-physical-deal A/B/A on that explicitly public timing rule is registered separately. Because this timing threshold arose from examining the original game, it is a **posthoc developmental test**; it must not be treated as an unbiased prospective matchup result.

**Competitive inference: zero qualified games.** Neither the 29/32 source field nor the 99.5% target is altered by this one source-game replay.


## Follow-up: public hand-six timing creates real source tempo denial

The next preregistered, same-source-opening A/B/A **also completed successfully** in [manual CI **42636274834**](https://github.com/FlareZ123/experiment-01/actions/runs/42636274834), [archive **13684380352**](https://github.com/FlareZ123/experiment-01/actions/runs/42636274834/artifacts/13684380352), JSON SHA256 **`b6cecae4978a67dc835128aaeeb08af704c10419825e194802251cb3fec9e497`**. This treatment used the identical Gengar funding/Skyliner retreat but waited to expend Horror House until the **opponent's visible hand count reached six** or the opponent's Active had Energy. Both seats shared the rule, whose inputs are public.

| Same-seed phase | Gengar GX turn | First source DCE play | First source Cross Fusion Strike | Terminal outcome |
| --- | --- | --- | --- | --- |
| A baseline | Never | **13** | **13** | rank5 wins, [0,6], 149 roots |
| C public hand-six | **12**, accepted root83 | **15** | **15** | rank5 wins, [0,6], 163 roots |
| A repeat | Never | **13** | **13** | rank5 wins, [0,6], 149 roots |

The first C physical divergence is the same **root45 id113 Energy recipient**, and the first distinct action is again **root70** (free Retreat versus Pass). C then **passes with funded Gengar** on candidate turn8 and turn10, publicly observes the source accumulate six cards, announces GX turn12, and receives a genuinely accepted **source Pass on turn13 instead of the baseline's DCE attachment/attack**. Source DCE and first attack shift to turn15. That is a **two-global-turn disruption of a concrete original source attack**, rather than a synthetic lock flag.

The effect did **not** produce an overall candidate win. Source attacks occurred on turns **15/19/23/27** instead of **13/17/21/25** and ultimately took the same six Prizes. In C, Gengar was Knocked Out on source turn19 before the candidate drew its later Telepathic Psychic Energy on candidate turn20. The deck/policy still had no accessible second Psychic for Gengar's Poltergeist before that knockout. The remaining urgent problem is **candidate draw/attacker access**, not merely the lock's timing.

This establishes a narrow tactical improvement with a real opponent-response consequence, while preserving the posthoc caveat: threshold six was selected after inspecting this exact archived deal. It is neither a globally proven threshold nor a measured matchup win rate.

The next useful counterfactual is to compose **already implemented owner Lillie's Determination after a genuine Pass** with the Gengar/Skyliner policy in a fixed physical seed factorial, testing whether owner hand refresh can deliver a second attack or a defensible alternative before source turns15/19. This reuses Agent21's independent Lillie work rather than implementing another competing Supporter path.


## Joint Supporter-and-GX line reverses the same native game

The preregistered, **unchanged printed-60, unchanged initial physical deal** five-arm 2×2 factorial completed in [manual CI **42637214130**](https://github.com/FlareZ123/experiment-01/actions/runs/42637214130). The [complete native and physical archive **13682972390**](https://github.com/FlareZ123/experiment-01/actions/runs/42637214130/artifacts/13682972390) is JSON SHA256 **`ee1c18aca9fbee5accdc7cf948319e07eba2ca26e50cea5fba902fa2703a581d`**.

| Original source deal, fixed exact 60s | Candidate attacks | Source attacks | Native winner | Original source / candidate remaining Prizes |
| --- | --- | --- | --- | --- |
| A control | 0 | 4 | rank5 source | 0 / 6 |
| B: existing actor Lillie after Pass only | 0 | 3 | rank5 source | 0 / 6 |
| C: Gengar + public-hand-six GX only | 1 Horror House-GX | 4 | rank5 source | 0 / 6 |
| **D: Lillie plus Gengar/Skyliner plus timed GX** | **Horror House-GX, then three Poltergeist** | **1** | **New Moon candidate** | **6 / 0** |
| A repeat | 0 | 4 | rank5 source | 0 / 6 |

All five trials were complete native Store games; the physical integrity gate passed in all of them. Control A replay produced **identical action and physical-zone sequences**. Every arm matched the exact original source and complete initial physical deal. B and D first diverged from baseline at **root32**, where an existing owner-only Lillie's Determination after an actual Pass is played. C first diverged in actual physical zones at root45 with the different Psychic Energy recipient. The experiment reused Agent21/Agent12's existing Lillie policy rather than implementing or replacing it.

### Why the combination is decisive in this particular game

The D arm's actual native sequence:

- **Turn2/root32:** plays Lillie's Determination from the original hand rather than Pass. This shuffles the owner hand and supplies later Energy access.
- **Turn12/roots80–82:** attaches actual Basic Psychic onto Benched Gengar, retreats from Tapu Lele through real Latias ex Skyliner, then uses printed **Horror House-GX**. The opponent's public hand has six cards.
- **Turn13:** the rank5 source's originally observed DCE-and-attack turn now becomes an actual **Pass**, because of the hand-lock window.
- **Turn15/root93:** the source finally uses a single **Cross Fusion Strike**. It did not Knock Out the candidate's Gengar.
- **Turn18/roots105–108:** candidate attaches its second Psychic unit, the actually held **Telepath [P] Energy M3**, then announces **Poltergeist**. Posthoc inspected source hand contained **seven Trainer cards**. Printed Poltergeist does 50 damage for each Trainer in the opponent's hand, a **350-damage** nominal attack. Native Store knocks out Mew VMAX and awards three Prizes.
- **Turn20/roots115–118:** a further held Basic Psychic is attached; Poltergeist sees **eight source Trainer cards** and generates **400 nominal damage**. Native Store Knocks Out Genesect V, taking two additional Prizes.
- **Turn22/roots126–127:** the owner repeats Poltergeist against another Mew VMAX with eight Trainer cards visible in the now-revealed source hand, earning the remaining Prize and ending the game.

This is a concrete example of **multiplicative tactical structure**, not a sum of average card values. Lillie's earlier hand refresh unlocks later Energy, GX timing denies the opponent's crucial attachment and leaves a large Trainer-heavy hand, and Poltergeist converts the retained Trainers into enough damage to take KOs. Generic deck-access heuristics or one-card replacement counts would miss the chain. The exact source hand identities were examined **only after the game** to explain the actual printed damage; no actor policy inspected them.

The single initial deal was selected retrospectively from a failed game. Five policy arms on that same deal are **correlated experiments**. A true paper-game win, benchmark win rate or 99.5% performance cannot be inferred. The next necessary test is frozen **fresh-seed, both-seat** source-rank5 paired games comparing Lillie alone versus Lillie plus this Gengar strategy, using unchanged 60s and a single declared actor policy. Do not infer general strength from this one native reverse-terminal.

See the [factorial preregistration](../../aichi-2026/registrations/agent20-rank5-gengar-lillie-factorial-20261109.json) and [reusable five-arm runner](../../../simulation/evaluation/2026-11/agent20-rank5-gengar-lillie-factorial.cjs).
