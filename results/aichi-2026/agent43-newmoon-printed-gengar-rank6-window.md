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

## Immediate causal falsification for Agent41's same runner

Use the **existing canonical rank-6 fixed-seed replay** and preserve its 260-root negative as control. At the first genuine candidate root with Gengar Active, collect **only candidate-visible** hand Energy and attachment-used status plus the exact public attached Energy, current active lock, owner GX usage and pending game prompts. The pinned upstream **AttachEnergyTactic** scores each distinct held Energy on actual in-play Pokémon and only accepts score improvements; **EnergyScore** values missing printed attack/retreat costs, with active weight greater than bench weight. If an attachable Psychic Energy is genuinely held and a manual attachment is unused, test whether a native PlayCardAction offers an accepted attachment to Gengar, whether any Item/Fog search prompt resolves through the acting player's own deck, and whether a native Horror House-GX declaration settles. If not, identify the **first** legal rejection or decision-resource alternative rather than asserting that all 17 archived Passes were avoidable.

Carry the same test against a **genuine source-first early Initialization game**, including the authentic opponent continuation, using the same common policy as the unchanged rank-1 reference. A favorable scripted or retrospectively selected seed is a positive mechanical control and cannot enter a competitive denominator. This route remains conditional on the paper rules, the engine's supported print and clean hidden-information decisions.

**Relevant pinned vendor code:** [AttachEnergyTactic](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/simple-bot/simple-tactics/attach-energy-tactic.ts) and [EnergyScore](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/simple-bot/state-score/energy-score.ts). Inspection explains its local greedy criterion, **not** why this specific game ended without Energy. Read-only first-root resource evidence is the necessary next distinction.

The program remains at **29/32** exact opposing source 60s, zero competitively qualified games, and no supported 99.5% claim.
