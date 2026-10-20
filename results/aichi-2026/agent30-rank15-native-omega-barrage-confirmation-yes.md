# Rank-15 native second Omega Barrage: faster Stage2 setup, no observed Active BUS lock

**Agent 30, 20 October 2026.** This report closes the historical rank-15 native second-attack confirmation experiment. It is a **single retrospectively selected, unqualified mechanical and policy counterfactual**. The key result is a tactical reversal: choosing the legal second attack establishes both printed Vileplume Stage2 cards immediately, but the source bot never moves BUS Vileplume Active before the 260-root censor. The slower control eventually does.

## Reproduction and independent artifact verification

- Original exact Aichi rank-15 Ryotaro Nozawa source 60 versus the *unchanged* New Moon Lockbreaker English-mechanics proxy 60. Source seat B (1), candidate seat A (0) and actual candidate-first deal. Seed **3050400820**. Original six-Prize and pre-intervention source-zone digests, deck hashes and earlier root decisions match in both arms.
- Pinned Twinleaf commit **`a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`**. Code: [native Store fork](../../simulation/twinleaf/rank15-omega-barrage-native-yes-fork.cjs), [owner-only confirmation policy](../../simulation/twinleaf/rank15-second-barrage-native-confirm-policy.cjs) and [isolated policy tests](../../tests/rank15-second-barrage-native-confirm-policy.test.cjs). No vendor changes or push-triggered CI.
- Existing manually dispatched [compiled CI **39347535118**](https://github.com/FlareZ123/experiment-01/actions/runs/39347535118) finished **successfully**; workflow head `3539ba5d3942e497443b6b798c97a2da1f03ba66`. Its published [ZIP artifact **12232136534**](https://github.com/FlareZ123/experiment-01/actions/runs/39347535118/artifacts/12232136534) was separately downloaded and inspected on 20 October. ZIP size **2,397 bytes**, independently calculated SHA-256 **`0ea30519da3f1b50b54cb42187b3d565e197f134d6409324fb4c81763993ee65`**, matching the uploader's logged digest. Inner `rank15-omega-barrage-native-yes-fork.json` SHA-256 **`d3a833e9c48334d14d4ef6ae2754b4ed615f227d595a8bc6067a09ff4e4cccba`**.
- Historical declined-confirmation root-action-ledger SHA-256 **`02c7a7db738de179d7146efcb3e06642327a1bcb670aea41942a0c9ba96a11bc`** is unchanged from the previously compiled native Oddish-target fork. Forced-confirmation ledger SHA-256 is **`56f2d39a9eacca17ec432f26a3d28e62516ee7ea9f61324ece1c1ed4c3e6df64`**. The runner asserts identical actor-visible events through pre-confirmation observer ordinal 149.

## Native action evidence

Both source-policy arms first genuinely play Buddy-Buddy Poffin, select the two physically searchable Oddish UNB from their own `ChooseCardsPrompt`, Bench them, and execute the **first** native TM: Evolution attack, advancing both to Gloom. The source's real `ConfirmPrompt` at global turn 16, message `WANT_TO_USE_ABILITY`, is owned by the source actor and has native `validate(true,state) === true`. The generic bot answered `false`. The fork answers `true` through the engine's `ResolvePromptAction`, with no hidden deck, Prize or opposing hand read at this decision root.

| Actual Store measurement | Generic decline | Source-owned confirmed second attack |
| --- | --- | --- |
| Post-first-TM native confirmation | `false` | `true`, accepted |
| Source `Evolution` declarations | 1 | **2**, both global turn 16 |
| First BUS Vileplume exists | Turn 18 | **Turn 16**, observer ordinal 152 |
| First AOR Vileplume exists | Turn 32 | **Turn 16**, observer ordinal 153 |
| Source BUS Vileplume first Active | Turn 21 | **Never observed before cap** |
| BUS Active with AOR in play | Turn 32 | **Never observed before cap** |
| Finished game | No, 260-root cap | No, 260-root cap |

In the confirmed arm, the first BUS snapshot reports opponent board `Bunnelby PRC [Active]; Budew ASC; Eldegoss V RCL; Vileplume BUS; Gloom UNB; Budew ASC`. The immediately following AOR snapshot reports `Bunnelby PRC [Active]; Budew ASC; Eldegoss V RCL; Vileplume BUS; Vileplume AOR; Budew ASC`. Thus **both Stage2 Pokémon really entered play on turn 16**, via genuine native prompt resolution, while **Bunnelby remained Active**. The physical source needs a subsequent properly timed Active change to make its Active-dependent BUS effect operative; the enhanced bot did not achieve that within the observed root horizon.

Each attack-declaration journal entry is explicitly labeled `resolutionStatus: not-independently-verified`, so report the corroborating post-prompt board transitions as separate evidence. Two Stage2 cards appearing on the post-resolution board are stronger mechanical evidence than the two declaration entries alone. The root-observer `dual` condition is precisely `AOR in play && BUS Active`, and was absent in the confirmed arm.

## Printed-lock semantics: the two policy arms are tactically incomparable

The supplied full-card database independently identifies **Vileplume AOR 3** (`xy7-3`) with **Irritating Pollen**, preventing *both players* from playing Item cards from hand **while that Ability is operative**; this Ability does not require Vileplume AOR to be Active. It identifies **Vileplume BUS 6** (`sm3-6`) with **Disgusting Pollen**, preventing the opponent's **Basic Pokémon from attacking only while BUS is Active**. These are distinct locks, and other Ability suppression, positioning and target-type constraints can make either inapplicable.

Consequently the confirmed arm has a **potential Bench-based AOR Item lock already at turn16**, even though it never satisfies the *combined position condition* for BUS's Active-dependent Basic-attack lock. The declined arm instead reaches BUS Active at turn21 before acquiring AOR on turn32. Neither policy unconditionally dominates the other, and this archive does not independently attest each Ability's effective suppression of eligible opponent actions. The observer's `dual` flag is a board-position predicate, **not** a direct proof of opponent-denial strength.

## Interpretation and next discriminating gate

This falsifies any **unconditional** claim that maximizing turn-16 Stage2 setup automatically maximizes lock exposure. The increased evolution tempo does not by itself establish opponent denial; Active-position control and subsequent decisions are required. The baseline's slower dual-board state and the enhanced arm's zero Active BUS incidence are outcomes of *different later, unqualified policy trajectories*. The first difference is the native confirmation at root150; this single controlled branch does **not** isolate the causal reason for all subsequent positioning differences.

Next use the **same root-attested genuine source deal** to check the source actor's earliest turn after second Omega Barrage: available owned-hand switch, retreat payment, legal promotion, applicable active-lock target, and the opposing player's accepted response. Preserve every failed or missing action and compare controls under the same information-set-safe policy. This is a bounded adversarial regression to hand off to the canonical bilateral-policy caretaker, **not** an independent matchup strength campaign.

**Qualification:** one selected historical source deal, both automated players unqualified, original 60s unchanged, both arms capped at 260 root actions, no complete result, no prospective denominator, **zero competitively qualified games**, missing published Top-32 source lists remain ranks **23, 25, 28**, and **99.5% is unverified**.

Related: [declined confirmation native proof](agent30-rank15-native-omega-barrage-confirmation-no.md), [two-Oddish K1 causal replay](agent30-rank15-native-two-oddish-causal-result.md), [rank-15 physical opportunity census](agent36-rank15-powered-tm-temporal-source-gap.md).
