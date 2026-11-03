# Agent 5: independent printed-cost and unplayed counter-reply audit of rank-6 Thunder Mountain activation

**3 November 2026 | disposition: printed cost is consistent, native attack/Prize receipt is genuine, opponent-response competence is unqualified.** This is an adversarial check of Agent 7's original-rank6-vs-rank9 natural-deal retrospective, not a new selected policy experiment, a result about other matchups, or a competitive win sample.

## Evidence and reproducibility

- Source: exact authenticated original printed rank-6 Iron Thorns ex and rank-9 Absol/Electrode sixties in `results/aichi-2026/full-decklists.json`, held immutable by original registration `results/aichi-2026/registrations/agent7-original6v9-own-stadium-pass-retro-20261103.json`.
- Pinned native CI: [41707597245](https://github.com/FlareZ123/experiment-01/actions/runs/41707597245), vendor `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`, research head `f1ed63894837fc0835d8f0d8dfdf4b77d84db278`.
- Independently downloaded ZIP artifact `13266395809`, verified SHA256 `596f242b3c235a503fde53c61ff825b9799b97d31d9e0ad600741e6daaf4b816`. Independently decompressed its `agent7-original6v9-stadium-selected-retrospective.json`, verified 841,416 bytes and SHA256 `45e60c76249abe23b57024178c31b0b27572f93d9fce1b46d484bca357b1360a`. This report was checked against the raw archive rather than inferred from the Agent 7 narrative. No engine rebuild was run by this independent audit.
- Card rules independently read from attached `card-list.zip` IDs `sv6-77`, `sm9-158`, `sm8-191`, `swsh2-171`, `swsh2-173`, `xy7-30`, `swsh5-125`, and the supplied Advanced Player's Rulebook I.B-01/I.B-04, II.C-03/05 and II.D-12.
- The archive's two rank6/rank9 cases have intact full-deal equality within their respective A/B/A trios and byte-identical repeated control traces. First divergent root in **both** trios is action ordinal **61**. All six attempts are **90-action capped** and contribute zero competitively qualified games.

## Independent paper arithmetic

The rank6 actor's actual turn10 pre-intervention public state has Active `Iron Thorns ex TWM`, two Benched Iron Thorns ex, two attached `Speed Lightning Energy RCL` and one attached `Capture Energy RCL`, and its own `Wondrous Labyrinth Prism Star TEU` in play. Opposing Active `Unown AOR` holds one `Prism Energy ASC`. The native control selects `PassTurnAction`; the intervention plays the physically held `Thunder Mountain Prism Star LOT` at slot7, which real Store accepts and moves displaced Wondrous to the **own Lost Zone** (not discard).

| Paper-attached cost fact | Before | After Thunder replacement | After first Volt Cyclone moves a Speed Lightning | After second Volt Cyclone moves Capture |
| --- | --- | --- | --- | --- |
| Required Volt Cyclone symbols | Lightning + 3 Colorless (Wondrous adds 1 Colorless) | 2 Colorless (Thunder removes 1 Lightning) | 2 Colorless | 2 Colorless |
| Active attached single-unit Energy | 3 | 3 | 2 | 1 |
| Payable from these attached cards | **No** | **Yes** | **Yes** | **No** |

The direct printed base attack `Volt Cyclone` is 140 damage. Original `Unown AOR` has 60 HP, Psychic weakness and no attack-damage immunity; the attacker is Lightning, so Psychic weakness does not multiply the damage. A normal one-Prize Knock Out is consistent. The actor's Active Initialization affects Abilities on eligible Rule Box Pokémon, not the Stadium effects or attached Speed/Capture Energy text. The paper cost sequence contains no apparent contradiction.

The raw selected native ledger has `AttackAction Volt Cyclone` at global turn10 action **62** and turn12 action **76**; each has `AttachEnergyPrompt`, `ChoosePrizePrompt`, opposing `ChoosePokemonPrompt`, and transition to opponent turn. The Store postdispatch snapshots show actual Active Energy count **3→2→1**, opponent Active `Unown AOR` leaving play twice, source Prize count **6→5→4**, and real opponent continuation. The control has **zero** settled AttackAction entries in its 90-action truncation. This is a **real native source pay-off** in one historical physical deal.

## Newly identified owner-visible adversarial reply at opponent turn 11

The source original rank9 actor (seat1) is observed after the first KO, before source rank6's second attack:

1. Opponent global turn11 action69: physically played `Rescue Carrier EVS` and selected `Unown AOR` from discard into hand at action70.
2. Opponent turn11 action72: physically played `Unown AOR` from hand to the Bench. The rank9 player therefore has a Benched Pokémon. Source rank6 has two Benched Iron Thorns ex.
3. Opponent turn11 action73: selected **`PassTurnAction` while still physically holding `Escape Rope BST`**, visible in `decisionTrace.decisionHandBefore.ownHandPrintings`. `Guzma BUS`, `Battle Compressor PHF`, `Trainers' Mail ROS`, and `Iono PAL` also remain held. This is a genuine missed *opportunity*, not an invented possible draw.

The supplied `Escape Rope` printing states that each player switches Active with one Benched Pokémon, opponent first. It is an Item; the source rank6 deck's only Pokémon are four Iron Thorns ex, whose Initialization is **Ability suppression**, and the selected Thunder Mountain is not Item lock. The user-visible board contains Benched Pokémon on each side. Under those printed and observed public conditions, rank9 could plausibly play `Escape Rope` before passing, forcing rank6's **two-Energy funded Active** to its Bench and promoting one of the other two Iron Thorns ex.

The rank6 source played just three Energy cards before global turn10, at turns **2, 6, 8**. All three appear attached to the Active at the intervention root, and after the first `Volt Cyclone` one of them has moved away. Under the recorded pre-turn action history, neither alternative Benched Thorns has two attached Energy; a forced promotion would temporarily lack the **two Colorless** needed for Volt Cyclone under Thunder Mountain. However, the rank6 actor held `Guzma BUS`, and can potentially gust/switch to the funded former Active on its next turn if a valid opposing Bench target persists. **This cannot establish that Escape Rope would avert the second Prize.** The correct effect on tempo, Supporter contention, active lock and opponent Prize race requires a selected same-root counterfactual with opponent reply and source continuation.

This is an evidence-quality warning: the actual opponent bot passes while holding a likely legal high-impact interaction. Even if playing it proves inferior, its absence shows the two-Prize continuation was tested against a specific incomplete native decision policy.

## Receipt gaps and next discriminating experiment

The archived `postSelectedStoreEvents` captures source Active Energy card names, its **Bench Pokémon names without attached Energy**, the opponent Active name and Energy, Stadium zones, and Prize counts. It does **not** preserve (a) each Bench recipient's public attached Energy, (b) public damage counters/remaining HP, (c) the chosen `AttachEnergyPrompt` recipient, or (d) the opponent's Bench members at every Store event. Thus the archive independently proves accepted attack roots, prompted effect/Prize progression and Active Energy loss, while **full Energy transfer target and exact numeric damage** are not proven by those public snapshots. An accepted Store resolution should be confirmed against exact printed legality and full public movement before being promoted to a paper-qualified game.

Most informative successor: preregister a single **turn11 original-rank9 owner-visible Escape Rope-vs-Pass A/B/A** fork on this same physical historical deal, preserve before/after public two-player Bench attachment and damage receipts, and let the rank6 actor respond with its naturally held `Guzma BUS`. Report exact selected and competing action roots, payer/target, Store acceptance, two further turns, and any lost upside. Then test any funded-Stadium planner on independently preregistered fresh seeds and both seats with the full one-policy integration. Do not count the historical deal, synthetic paper cost or these censored traces as win-rate trials.

**Conclusion:** Agent7's actual native first divergence, Stadium destination and two Prize awards survive this independent check. A previously unreported, physically held opponent counterline and incomplete target-level receipts prevent stronger paper-match or policy-strength conclusions. Original field status remains **29/32 authenticated exact original sixties, missing 23/25/28; zero competitively qualified games, no final fixed 60.**
