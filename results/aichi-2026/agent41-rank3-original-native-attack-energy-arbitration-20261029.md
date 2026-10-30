# First original-source, both-seat live Store conflict: Capture Energy before Collapse

**Agent 41, 29 October 2026. Evidence class: native action-choice proof in a fixed, non-competitive developmental A/B/A field game.** This is one bounded, source-dealt, genuine Store-positive owner-root arbitration witness under a limited common actor policy. It does not establish favorable strategy under skilled opponent actions, make a new deck recommendation, or qualify a game for field strength.

## Real original source and controlled experiment

The original published **Aichi rank-3 Snorlax Stall 60** (including Bunnelby PRC, Capture Energy RCL and Snorlax PGO) was converted using the repo's verified `planAichi` resolution with explicitly enabled equivalent Basic Energy, mirror printing and Japanese promo hooks. The candidate was the unchanged original published **rank-1 Shadow Rider Calyrex reference 60**. The internal engine card-list SHA-256s are recorded in the full native JSON, separately from the manifest; equivalent substitutions must not be silently described as exact physical original printings. The two 60-card inventories were never edited between treatment arms.

Before executing any trial, the checked-in `simulation/evaluation/agent41-rank3-arbitration-original-store.cjs` fixed seed values **290126 and 290127** for each physical candidate seat **0 and 1**, a 260-root action cap, and the ordered A/B/A profiles: common actor root baseline, same policy with **only** `terminalArbitration=true`, and baseline repeat. All runs enabled the same public Special Energy opportunity, original Store, both-actor owner-only root, native prompt and Supporter quota guards. This is a small registered **mechanical-exposure** cohort, not randomized competitive evaluation. All 12 outcomes, including caps and errors, are preserved.

[Original 12-arm execution 40975741900](https://github.com/FlareZ123/experiment-01/actions/runs/40975741900) passed. [Forensic same-deal action-ordinal replay 40976237566](https://github.com/FlareZ123/experiment-01/actions/runs/40976237566) passed. [Owner-visible printed Bench target replay 40976351576](https://github.com/FlareZ123/experiment-01/actions/runs/40976351576) passed. The latter's [raw original-Store ZIP artifact 12942573410](https://github.com/FlareZ123/experiment-01/actions/runs/40976351576/artifacts/12942573410) has GitHub-reported ZIP SHA-256 `74470793c3921e8cfbf457702a4d6fe9f34aef21025cea750005cafb457347c6`. Simulator pin: `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.

## One real source decision changed

The selected cell was **physical candidate seat 1, source seat 0, seed 290126**; native first player was candidate seat 1, with the first-draw log verified. Both arms began from the **same opaque full physical deal digest** `4ad12400d209312107da35c7c2d132dfbaa20d9f44489ada80496f72bad38bd8`. The source is rank3, and the candidate is the original rank1 reference.

At the actual source owner's **global turn 22, root #36**, the existing actor root first chose printed `Collapse` from **Active Snorlax PGO** against Active **Latias ex SSP**. The new arbitration collector proposed an owner-held, exact **Capture Energy RCL** card to occupied **Bench index 3, Bunnelby PRC**. It changed the root action to the attachment.

The pinned native Store **accepted** `PlayCardAction` with physically named Capture Energy, confirmed a public Energy-placement transition on the source's side, reduced the owner's hand count by one, and kept the turn open. The printed Capture Energy effect then initiated native `ChooseCardsPrompt`, `ShuffleDeckPrompt`, and `WaitPrompt` resolutions. Source Bench population changed from **four to five** before the turn-ending attack, corroborating a further Basic Bench effect without claiming its identity or strategic benefit. The next owner's typed root #37 was **Attack Collapse**; the native Store accepted `AttackAction` at global action ordinal 126, logged the exact attack declaration, and completed the prompted turn transition. The candidate's next genuine typed root on turn 23 was **Pass** under the incomplete native bot.

The identical-physical-deal control at owner root #36 instead selected **Attack Collapse** immediately, and did not attach Capture Energy to its Bench until **turn 26**, after two further source attack turns. This establishes a concrete original-deck difference in **when a resource and a Pokémon-search effect become available**, with the original selected attack retained in the treatment turn.

### Printed-card implications checked against the supplied card pool

The supplied complete card database confirms the exact originals:

- **Bunnelby PRC 121** (`cards/en/xy5.json`) has the `Ω Barrage` Ancient Trait and two one-Colorless attacks: Burrow mills the opponent's top card, while Rototiller recycles a card from the discard pile. A single Capture Energy on Bunnelby provides the printed Colorless needed for either attack; the potential to attack twice is part of the printed trait. This does **not** establish that the Source later promoted Bunnelby or successfully used either effect.
- **Capture Energy RCL 171** (`cards/en/swsh2.json`) provides one Colorless while attached and, on a hand attachment, searches the user's deck for a Basic Pokémon to Bench and then shuffles. The actual native prompt chain and Bench population increase are consistent with that complete printed effect.
- **Snorlax PGO 55** (`cards/en/pgo.json`) has Block (opponent Active cannot retreat while Snorlax is Active) and its four-Colorless Collapse attack deals 150 printed damage while making Snorlax Asleep. The actual source decision preserved that same named attack after attaching Capture to Bunnelby.

This identifies the fork as **concurrent stall infrastructure and attack sequencing**. It involves an independent future one-Energy Bunnelby recycling/milling route and an additional Basic Bench search. The data certify the Store effects and printing, while the value of that future line against a stronger opponent remains a hypothesis.

**Crucial limitations:** A Store-accepted attack declaration plus prompted turn transition is stronger than a proposed attack but a separate public settled damage/Prize snapshot should still be inspected. The opponent's next action was Pass, which is weak adversarial evidence; the fixed candidate reference and root source bot have unqualified Supporter/Stadium/control planning. The same engine winner is **source seat 0** in both arms. Do not count this selected sequence as a competitive win-rate increase.

## All-attempt census

| Candidate seat / seed | Same initial full deal across A/B/A | Baseline reproduced | Changed owner roots | Native statuses A/B/A |
| --- | --- | --- | ---: | --- |
| Seat 0 / 290126 | Yes | Yes | 0 | cap / cap / cap |
| Seat 0 / 290127 | Yes | Yes | 0 | terminal / terminal / terminal |
| Seat 1 / 290126 | Yes | Yes | **1 (source-side)** | terminal / terminal / terminal |
| Seat 1 / 290127 | Yes | Yes | 0 | terminal / terminal / terminal |

Totals: **12 attempted games, 9 native engine terminals, 3 action caps, 0 native exceptions, 4/4 same-full-physical-deal groups, 4/4 same observed native repeated controls, and 1 native Store-accepted arbitration change**. These counts describe development execution quality; the actual field of 32 has 29 recovered printed originals, missing 23/25/28. **Competitive-qualified games remain 0, with no evidence for a 99.5% fixed-deck game win rate.**

## Implications for a common action arbiter

The root policy's first-return attack priority can miss a beneficial nonterminal preparation in a real original source game, even when the same attack still happens later that turn. The opportunity includes card-specific non-Energy effects: here Capture Energy's Bench search and resulting full Bench. Prior native *staged* tests correctly found a similar two-seat fork with Double Dragon Energy, while the earlier 12-arm rank6/rank11 A/B/A had **0/36 attack roots** with a supported Bench Special alternative. Together these results identify high model variance in *state exposure*, rather than a justified global win-rate uplift.

A release gate still needs meaningful resource-hold negatives, legal alternative comparison including off-frontier Trainer actions, multiple fresh original-deal positive opportunities across the field, opponent actions competently answering the different source board, full hidden-state policy isolation, verified paper timing and actual tournament-like clock behavior. Use the currently opt-in implementation as a testable module, retaining the legacy root as control. All output is explicitly developmental.
