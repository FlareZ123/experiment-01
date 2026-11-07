# Agent 1: exact setup opportunity for active Basic Ability suppression versus rank26

**7 November 2026, paper Expanded, zero competitive games.** Source-authenticated **resource availability**, not a card-strength verdict or a gameplay win estimate. This extends the [29-original and six-candidate forced-Active study](agent1-six-candidate-forced-active-rank26-coupled-screen-20261107.md) and reuses [Agent2's printed rank26 Basic Ability inventory and tactical geometry](https://github.com/FlareZ123/experiment-01/commit/7ee89c31e2).

## The first-turn vulnerability in structural candidates

The published original rank26 Hibiki Yamada Meloetta Donk list contains **Meloetta ex BLK44**. Its printed **Debut Performance** Ability permits attacking on the player's first turn when that player goes first. Without this Ability, the normal first-turn-attack prohibition applies. The rank26 source can use its paid DCE / Lightning / five-self-KO line to attempt Technical Machine: Crisis Punch, but all the source setup requirements and actual opponent attack targets remain decisive. [Agent2 previously demonstrated](https://github.com/FlareZ123/experiment-01/commit/7ee89c31e2) a timing flaw in the proposed **Apex Alchemy** Alolan Muk counter: its Stage 1 Muk, even if established via Boost Shake on Apex's own first turn, cannot already be in play **before** rank26's opening turn when rank26 goes first. A post-source-turn Muk strategy cannot retrospectively deny an earlier completed donk.

This invites a narrower, falsifiable first-seven question: **which verified Basic Pokémon already eligible for the initial Active Spot can suppress Meloetta's first-turn Ability before the source's first action, and how often is one physically present in the opponent's first legal seven?**

## Only two audited printings

The implementation admits the following exact source-print effects, from the supplied card pool, as direct Active-spot suppressors of BLK44's Debut Performance:

- **Klefki SVI 96**, a 70-HP Basic with **Mischievous Lock**: while in the Active Spot, Basic Pokémon in play have no Abilities except Mischievous Lock. This removes Meloetta's printed Basic ex Ability. Other Klefki printings with distinct text are **not** counted.
- **Iron Thorns ex TWM 77**, a 230-HP Basic Future Pokémon with **Initialization**: while Active, Pokémon with Rule Boxes have no Abilities except Future Pokémon. Meloetta ex has an ex Rule Box and is **not** Future; source's own first-turn exception is suppressed. Iron Thorns is exempt from its own Initialization by its Future status, not from an opposing Klefki. This distinction has a dedicated test.

Both cards must **actually begin Active and remain effective at the attack declaration**. **Canceling Cologne ASR136** can suppress the opposing Active's Ability for the turn if the rank26 source actually obtains and legally plays it. Source also has access to gust and other movement; no model assumes the denial persists through a competent source response. Broader Active-lock cards were not classified as irrelevant or exhausted; the screen is deliberately limited to these two **exact verified printed texts**, and no other Pokémon is silently credited.

## Exact legal-seven opportunity and forced guarantee

For any complete printed 60 with B eligible Basic copies and L verified source-denying copies:

\[
P(\text{denial Basic is the sole Basic in initial 7}\mid\text{legal 7})
=\frac{L\binom{60-B}{6}}{\binom{60}{7}-\binom{60-B}{7}}.
\]

When exactly one Basic is drawn and it is the blocker, that blocker is **forced to start Active** at setup. This is a **paper starting position**, not a guaranteed successful Ability lock once source plays cards. A distinct, larger bound represents the **opportunity to choose a blocking Basic** if it is anywhere in the legal seven:

\[
P(\text{at least one verified blocker in initial 7}\mid\text{legal 7})
=\frac{\binom{60}{7}-\binom{60-L}{7}}
{\binom{60}{7}-\binom{60-B}{7}}.
\]

These two values bracket the initial physically available resource, because the player can prefer a nonblocking Basic when multiple are drawn. They do not incorporate opponent mulligan bonus cards (added **after** initial Active choice), subsequent Trainer gust or Ability suppression, source going-second scenarios, Prize recovery, or the first-turn battle.

### Six unchanged fixed candidate 60s

| Fixed candidate | Eligible Basics B | Exact suppressor copies L | Suppressor forced Active | Suppressor available to select Active |
| --- | ---: | ---: | ---: | ---: |
| Champion rank1 | 14 | 0 | **0%** | **0%** |
| Hood Shield | 14 | 0 | **0%** | **0%** |
| Temple Shadow Rider | 15 | 0 | **0%** | **0%** |
| Apex Alchemy | 12 | 0 | **0%** | **0%** |
| Sentinel Lopunny | 14 | 0 | **0%** | **0%** |
| New Moon Lockbreaker | 17 | **1 Klefki SVI96** | **1.72225%** | **12.72872%** |

The **New Moon** candidate's Klefki is a mechanically distinct source-first defensive opportunity absent from the other five tested fixed 60s. This is a resource-access difference, and **does not establish New Moon as stronger**. It can force a 70-HP Active and may make the candidate more fragile against other attackers; the rank26 owner can find Canceling Cologne, and future turn setup and damage conversion remain unverified. The preceding report's **13.7780%** New Moon forced HP≤90 and **29.2782%** sole Basic figures remain different events with different denominators.

### Original opponent field cross-check

All **29/29** published original card-name/count sixties were checked against the same exact source-print resolver. Five published original ranks have one of the two audited suppressors:

| Original rank(s) | Exact Active suppressor | B | L | Forced Active | Available to choose Active |
| --- | --- | ---: | ---: | ---: | ---: |
| 4, 17 | Klefki SVI96 | 13 | 1 | **3.32108%** | **13.93607%** |
| 6, 24, 29 | Iron Thorns ex TWM77 | 4 | 4 | **84.17535%** | **100%** |

The three published Iron Thorns-only decks contain exactly four eligible Basics, each the actual printed suppressor. Any legal initial seven contains an Iron Thorns ex; that card must start Active (one or another identical printing), so **the physical opportunity to start an Ability suppressor is 100%**. The **84.17535%** figure is the more restrictive event of drawing **exactly one** Basic, an unnecessary condition for starting an Iron Thorns ex. Both values still exclude a paid first-turn rank26 Cologne and source adaptive counterplay. The original rank26 has no verified Active suppressor of this kind in its own starting Basics.

**No general ranking follows.** The strongest candidate's best opening may depend more on energy, surviving a different attacker or lock, and executing its own eventual Prizes than on this single early Ability. The known Agent2 Meloetta analysis already cautions that Muk is an important later bilateral Ability lock despite failing this particular going-first front-window veto.

## Verification and files

- New `simulation/evaluation/agent1-rank26-active-denial-opening.cjs`, with a hard-gated **exact printed ID + name + Ability + Active condition**, and source Meloetta's printed first-turn exception.
- New `tests/agent1-rank26-active-denial-opening.test.cjs`: real SVI Klefki and TWM Thorns, printed alternate Klefki negative, Stage1 Muk negative, printed Future exception, all 29 exact original decks, all six fixed candidate printings, 16 conditional-probability inequalities and independent BigInt combinatorics.
- Reuses bundled resource ZIP and earlier rank26 six-candidate opening-screen code. The manual-only input `forced_active_opening_screen` in the existing `.github/workflows/agent1-issue25-baseline-sham-v9-native.yml` now runs **three** exact-analysis test files and no Twinleaf simulation.
- [GitHub Actions **42337863416**, SUCCESS](https://github.com/FlareZ123/experiment-01/actions/runs/42337863416), immutable checkout `52da63ba8488f52b79370e8e283d7be009a56d97`, **8/8 tests passed**, including all published source and six candidate resource rows. The workflow is manually dispatched only; no original policy code, engine code, card 60 or opponent model has changed.

## Required next step before strategic promotion

A strongly discriminating source-first follow-up would freeze one genuine rank26 initial physical deal paired with New Moon's **actually chosen Active Klefki**, then compare two source response policies with exact same physical opening. The source must use only owned, actually held, paper-legal Trainers and choose whether its singleton Canceling Cologne is reachable, and any eventual TM Crisis Punch must have physically funded attack costs, five genuine self-KO Prize awards, actual opponent remaining Pokémon and exact official time condition. Repeat both first-player orders and require intelligent opponent choice before any match-strength inference.

**Field status: 29/32 original complete name/count inventories, ranks23/25/28 missing, zero competitively qualified games, no selected best60, 99.5% target unproven.**
