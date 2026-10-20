# Rank-6 Iron Thorns: owner-payable printed Gengar escape window

**Agent 43; 20 October 2026.** Mathematical card-resource calculation plus inspected printed card text and pinned generic policy. **No simulated outcome, qualified matchup, attack certification or win-rate estimate.** This is a specific causal next-action hypothesis for the canonical bilateral runner, not a new deck nomination.

## Why this matters to the ongoing four-arm gate

The existing [Agent41 canonical rank-6 New Moon arm](agent41-canonical-integrated-settlement-20261020.md) finished **260 Store roots / 17 candidate Passes / zero candidate attacks**, while the rank-6 source actually attacked six times. The final observed candidate board contained **Gengar & Mimikyu-GX Active with Powerglass and zero Energy**. Authentic owner searches selected Gengar on global turn 5 and Psychic Energy on turns 9 and 13, but those observations do not prove an attachment was available, nor determine which original attachment choices caused the failure. Source-first lock coverage and competent policies are still unqualified.

The unchanged [New Moon 60](../als/new-moon-lockbreak-60-candidate.md) has **one printed Gengar & Mimikyu-GX TEU 53**. That card has **no Ability** and its **Horror House-GX costs one Psychic Energy**. It can attack while the opponent's active Iron Thorns ex uses Initialization to suppress Rule-Box Abilities such as Mewtwo & Mew-GX's Perfection. Its separate Poltergeist attack costs two Psychic Energy. Both facts are from printed English equivalents in the provided card database, not inferred from a simulator outcome. Active positioning, usable attachment, GX-attack availability, other locks and opponent response still matter. The printed route does not require Canceling Cologne, but a Gengar TAG TEAM knocked out concedes three Prizes.

## Exact narrow early resource screen

For a **candidate going second**, condition on a valid candidate opening seven (at least one Basic). The opponent offers **no optional mulligan bonus cards**. Consider only a simple route:

1. The unique Gengar was in the original seven, allowing its selection as the opening Active Pokémon.
2. By the candidate's first draw (eight seen), at least one of the deck's **six Energy cards** (three Basic Psychic plus three Telepathic Psychic) is in hand, **or** a held Fog Crystal can select one **unprized Basic Psychic Energy** still in the deck.
3. A manual attachment remains available and Fog Crystal, when required, is legally playable. The calculation checks card availability for those actions; their legality against a real opponent must be checked separately.

The frozen candidate has 19 Pokémon, **17 Basic Pokémon**, 6 Energy and 4 Fog Crystal. Telepathic Psychic Energy supplies Psychic **while attached**, so is counted as a directly seen attachment but **not** as a searchable Psychic Energy card while still in the deck. This is corroborated by the pinned [Fog Crystal reducer](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/sets/09-sword-and-shield/set-chilling-reign/fog-crystal.ts), which selects only `EnergyType.BASIC` cards named `Psychic Energy`. The pinned [Telepathic Psychic Energy reducer](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/sets/11-mega-evolution/set-perfect-order/telepath-psychic-energy.ts) supplies Psychic when the Energy is attached. Mysterious Treasure, Secret Box, Hisuian Heavy Ball, Escape Rope, other draw/search and any post-opening pivot are outside this particular screen.

| Conditional event among legal opening sevens | Exact fraction | Probability |
| --- | --- | ---: |
| Opening seven already contain Gengar | 1185723 / 9315337 | **12.728718%** |
| Gengar in seven and an Energy directly among the first eight | 12349477 / 176991403 | **6.977445%** |
| Gengar in seven, no directly seen Energy, and Fog can fetch unprized Basic Psychic | 263689004544 / 10365501516695 | **2.543910%** |
| **Either eligible attachment inventory route** | **986936125049 / 10365501516695** | **9.521354%** |

The last figure is a *restricted resource opportunity*, conditional on clean card play. It is **neither a lower bound nor an upper bound on the actual matchup attack rate**: additional search/switch routes increase opportunities; actual opponent actions and other requirements can invalidate a nominally accessible line.

### Counting proof

Let C(n,k) be the binomial coefficient. The legal-seven count is C(60,7) - C(43,7). The first Gengar-in-seven factor is C(59,6) divided by this count.

After fixing Gengar among the first seven, the other six opening cards and the mandatory draw form a uniform seven-card sample from 59 remaining physical cards. The event of finding a direct Energy has count **C(59,7) - C(53,7)**; finding no Energy but at least one Fog has count **C(53,7) - C(49,7)**. After seeing eight, six face-down Prizes are exchangeable among 52 other cards. With no Energy seen, all three Basic Psychic remain among 52; they are all Prized in **C(49,3) / C(52,6)** of arrangements. Multiply and add the disjoint direct/Fog cases to obtain the last fraction.

[Versioned exact BigInt calculator](../../scripts/new-moon-printed-gengar-thorns-window.cjs) and [pure regression](../../tests/new-moon-printed-gengar-thorns-window.test.cjs) pin the source 60 fingerprint **a693748bc4fc4326142f2dfec26570b9f1e1f7139790d36a089de1137d1cb4c4** and all four fractions. Independently recomputed with Python integer combinations and rational reduction. **No compiled CI or original-engine trial was dispatched for this calculation.**

## Independent reread of the genuine 260-root rank-6 archive

I downloaded and SHA256-checked the original [canonical compiled artifact 12231093443](https://github.com/FlareZ123/experiment-01/actions/runs/39347202101/artifacts/12231093443). ZIP SHA256: `d66c0b45164c498ff4fda5babfbf6d45b37db64adc669a4956ced46c9cd93b57`. Its `agent5-bilateral-late14-compressor.json` contains 43 genuine candidate-owner root snapshots over 18 distinct own turns. The printed Gengar route existed **much later** than the opening window modeled above, so the 9.52% event is **not a classification of this exact game**.

The owner-root snapshots show the card first **Benched at global turn 5** and still Benched in sampled roots through **turn 25**. It was **Active at turn 27** and in subsequent candidate root snapshots through **turn 35**. Its final Tool was Powerglass, its Energy list empty, and no Bench Pokémon held Energy. The sampled own-deck counts went from 45 remaining at turn 1 to 16 remaining at turn 35. They do not disclose whether Basic Psychic Energy was Prized, discarded, held, removed by source disruption, or whether an attachment was available and ignored in a specific turn.

The exact rank-6 source 60 includes **four Plumeria, four Crushing Hammer, two Team Flare Grunt, two Enhanced Hammer, one Faba and one Handheld Fan**, creating several distinct Energy-denial opportunities. This is a **source-card inventory**, not evidence those effects actually resolved in this archived game. A final zero-Energy board is consistent with source removal as well as inadequate candidate attachments.

A further important implementation detail: the pinned [Powerglass SFA implementation](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/sets/10-scarlet-and-violet/set-shrouded-fable/power-hourglass.ts) checks `EndTurnEffect`, whether the Tool is attached to the current Active, and whether at least one **Basic Energy** is in the owner's discard pile. If so, it emits an optional `AttachEnergyPrompt` with a 0-to-1 selection. It does **not check that the player previously attacked** in that turn. The pinned [AttachEnergyPromptResolver](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/simple-bot/prompt-resolver/attach-energy-prompt-resolver.ts) includes choosing zero as a scored possibility and evaluates attaching under the generic score. Thus any authoritative diagnostic should independently log Powerglass activation, Basic Energy in discard at this EndTurnEffect, offered legal prompt and chosen resolution. Presence of Powerglass alone proves none of those preconditions were met.

## Registered one-arm native read-only replay

**Registered 20 October 2026, before manual CI dispatch.** This is one *original* rank-6 260-root New Moon development replay through the unchanged `executeDevelopment` exported by the canonical Agent41 runner. Frozen actual physical history: trial `6:0:A:new-moon-lockbreaker-v1`, seed **407516727**, candidate physical **A and first**, source physical **B and second**, pinned engine commit `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`, original root SHA256 `87ef423a77ec6aafd6063fd3ad054ce3f9d29806a52ab04f21c1c6bb0e1495e4`. The unchanged candidate and opponent print lists are those supplied to Agent41 through `planAichi`. The selected opt-in owner late14 Compressor and read-only owner opportunity flags match the archived original.

The [research-owned observer](../../simulation/twinleaf/owner-energy-window-audit.cjs) intercepts actual owner bot roots and genuine accepted `Store.dispatch` actions, recording only own hand Energy, public Active attached Energy and Tools, visible manual-attachment turn flag, owner Basic Energy discard inventory, owner actual accepted native Energy plays, and native owner discard-to-Active Powerglass-looking prompts with zero/one selections. The observable prompt signature is deliberately **not certified as created by Powerglass alone**, since another live effect might produce an indistinguishable offer. All hooks restore their prior methods in a `finally` block. The [pure fake-Store regression](../../tests/owner-energy-window-audit.test.cjs) covers prompt acceptance/declination, attached-Energy conservation, avoiding unrevealed opponent hand/deck getters, and restoration after failure.

The [single-arm replay](../../simulation/evaluation/agent43-rank6-owner-energy-replay.cjs) fails closed unless all these historical controls agree: same root SHA, original 260 actions, candidate actually first, zero candidate attack declarations, final Gengar Active with Powerglass and no Energy. Its output additionally preserves all owner snapshots and accepted action transfers. The existing **manually dispatched only** `newmoon-compressor-source-partitions.yml` now has an explicit `agent43_rank6_energy_window` opt-in and preserves its raw JSON artifact for every result. No new workflow or push trigger was created.

**Predeclared success criterion:** passing pure tests, compiled pinned engine, original action-history SHA, a complete owner Energy opportunity stream and native prompt/attachment ledger. **Failure criterion:** any root mismatch, test error or missing native event evidence remains a reported negative or error. An adapter read-only success would establish a causal diagnostic opportunity, never a competitive win or upgraded game rate. The next interpretation must distinguish available owner Energy from source denial, earlier spent attachment, an optional Tool prompt and blocked play.

## First native replay outcome and source-turn recheck

**First compiled run completed 20 October 2026:** [CI 39359811098](https://github.com/FlareZ123/experiment-01/actions/runs/39359811098) succeeded at original frozen 260-root SHA, with [raw ZIP artifact 12236588788](https://github.com/FlareZ123/experiment-01/actions/runs/39359811098/artifacts/12236588788) SHA256 `86f76dde8c41488e06a2bc2e2f81869ee4c734ebbbaa995dc719ea630edce191`. The raw machine JSON has **43 actual candidate owner decision snapshots** and **five accepted native manual Energy plays**: turn 1 Basic Psychic to Latias ex, turn 3 Telepathic Psychic to Latias, turn 5 Telepathic Psychic to Active Unown, turn 9 Basic Psychic to Galarian Articuno V, and turn 13 Basic Psychic to Galarian Articuno V. Source control or board movement can remove these attached cards later; the first replay did not instrument all underlying source effects.

On candidate global turn **33** after Powerglass became attached to Active Gengar, the genuine owner discard-to-Active native prompt `id=163` was offered with **three Basic Psychic Energy** in discard. The generic bot **selected one Basic Psychic Energy** (a positive `ResolvePromptAction`), and the observed postdispatch Active Gengar had one attached Psychic. In its next observed own decision, turn **35**, Gengar had **zero** attached Energy and still had Powerglass. Therefore a real Energy transfer **occurred**, then the board state lost that attachment in the intervening game progression. Since Horror House-GX was never announced during this archived game, the precise cause of the interim loss is strategically relevant. The observed Store prompt fingerprint is consistent with the Powerglass reducer but does not by itself prove exclusive attribution if another effect emits the same signature.

**A narrowly registered second diagnostic** extends exactly the same read-only adapter to capture **all actual public owner board Energy transitions**, including source-turn reductions across both Active and Bench. It deliberately reads **no unrevealed source hand**, recording only public attached Energy and the accepted native action class and pre-action actor/turn. No printed source-card identity is inferred from an unobserved opponent hand. The second replay must reproduce the **same exact original root SHA** as the first, with all 43 actor decisions, five manual attachments, and one positive Powerglass-like prompt. Any divergence fails closed and remains an error; it cannot be added to a game-winning denominator. The point is to distinguish an intervening source removal from a change of Active position or another mechanism.

## Second native replay: complete attached-Energy accounting

The registered second exact-source run [manual CI 39360446476](https://github.com/FlareZ123/experiment-01/actions/runs/39360446476) **passed** with [artifact 12236683159](https://github.com/FlareZ123/experiment-01/actions/runs/39360446476/artifacts/12236683159), ZIP SHA256 `fe859b10d0785231e1a8f72d24e504691ff39759813894b4bc328db98ee0fd39`. The root SHA remained **identically** `87ef423a77ec6aafd6063fd3ad054ce3f9d29806a52ab04f21c1c6bb0e1495e4`, with 43 owner decisions, 18 own turns, five accepted normal Energy attachments and the single positive Powerglass-like prompt. The adapter observed 28 public board-Energy/slot transition events; events with zero attached-card delta are positions and do not count as physical Energy acquisition or loss.

The nonzero attached-Energy transitions in the **same** rank-6 historical game are:

| Global turn | Acting seat | Native accepted action | Change in candidate's publicly attached Energy cards |
| --- | --- | --- | ---: |
| 1 | Candidate A | PlayCardAction, manual Basic Psychic to Latias ex | +1 |
| 3 | Candidate A | PlayCardAction, manual Telepathic Psychic to Latias ex | +1 |
| 4 | Source B | ResolvePromptAction | **−2** (both Latias energies gone) |
| 5 | Candidate A | PlayCardAction, manual Telepathic Psychic to Unown | +1 |
| 5 | Candidate A | RetreatAction | **−1** (Unown's attached Telepathic Energy spent) |
| 9 | Candidate A | PlayCardAction, manual Basic Psychic to Galarian Articuno V | +1 |
| 10 | Source B | ResolvePromptAction | **−1** |
| 13 | Candidate A | PlayCardAction, manual Basic Psychic to Galarian Articuno V | +1 |
| 14 | Source B | ResolvePromptAction | **−1** |
| 33 | Candidate A | ResolvePromptAction, accepted Basic Psychic onto Gengar from own discard with Powerglass active | +1 |
| 34 | Source B | ResolvePromptAction | **−1** (Gengar's newly attached Psychic gone) |

The accounting reconciles exactly: **six positive attached-card transfers** (five manual + one prompted) and **six attached-card losses** (five at source-prompt resolutions and one paid candidate retreat) leave zero cards attached on the final candidate board. The turn-34 loss is an **accepted real source-side native prompt resolution**, with Gengar remaining Active; it is therefore an actual resource-denial consequence in the same game history. The telemetry does **not disclose the triggering source Trainer by name**, and the adapter explicitly refuses to read the opponent's unrevealed hand. Attribution to any specific Crushing Hammer, Plumeria, Team Flare Grunt, Faba, Enhanced Hammer or other card still needs a public root/card witness.

This **falsifies two simplistic causal stories** about the 260-root censor: the bot did make legal manual Energy attachments, and its turn-33 Powerglass prompt did select and attach a Basic Psychic Energy. The immediate source continuation removed that Energy before the candidate's next observed owner turn. That makes **retention and timing under repeatable source Energy denial** the demonstrated issue in this historical seed. Whether a different candidate decision sequence could force Horror House-GX before the source reply remains untested.

The paired same-source-physical-deal champion reference in the original artifact did execute **Pale Moon-GX** and **two Night Watch attacks** and finished as seat-A winner at turn 7, while this candidate ended at the 260-action cap at turn 35 with five Prize cards already taken by source. This is a **single selected-development-seed contrast under an unqualified common bot**, offering a direct reason to challenge this New Moon 60 against control. It is not an unbiased matchup win-rate sample.

## Immediate causal falsification for Agent41's same runner

Use the **existing canonical rank-6 fixed-seed replay** and preserve its 260-root negative as control. At the first genuine candidate root with Gengar Active, collect **only candidate-visible** hand Energy and attachment-used status plus the exact public attached Energy, current active lock, owner GX usage and pending game prompts. The pinned upstream **AttachEnergyTactic** scores each distinct held Energy on actual in-play Pokémon and only accepts score improvements; **EnergyScore** values missing printed attack/retreat costs, with active weight greater than bench weight. If an attachable Psychic Energy is genuinely held and a manual attachment is unused, test whether a native PlayCardAction offers an accepted attachment to Gengar, whether any Item/Fog search prompt resolves through the acting player's own deck, and whether a native Horror House-GX declaration settles. If not, identify the **first** legal rejection or decision-resource alternative rather than asserting that all 17 archived Passes were avoidable.

Carry the same test against a **genuine source-first early Initialization game**, including the authentic opponent continuation, using the same common policy as the unchanged rank-1 reference. A favorable scripted or retrospectively selected seed is a positive mechanical control and cannot enter a competitive denominator. This route remains conditional on the paper rules, the engine's supported print and clean hidden-information decisions.

**Relevant pinned vendor code:** [AttachEnergyTactic](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/simple-bot/simple-tactics/attach-energy-tactic.ts) and [EnergyScore](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/simple-bot/state-score/energy-score.ts). Inspection explains its local greedy criterion, **not** why this specific game ended without Energy. Read-only first-root resource evidence is the necessary next distinction.

The program remains at **29/32** exact opposing source 60s, zero competitively qualified games, and no supported 99.5% claim.
