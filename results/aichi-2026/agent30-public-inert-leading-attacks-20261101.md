# Agent 30: source-authenticated inert leading attacks, additional public actor cases

**1 November 2026, normal mode.** Research contribution to the common two-player source/contender action-selection gate. **Five exact source-printed cases** are implemented as a separately testable, **unwired / default-inert** pure decision helper. The purpose is to expose more realistic attack choices on a meaningful opponent field without turning such choices into fictitious competitive win evidence.

## Exact original-field evidence

Source is the repository's `results/aichi-2026/full-decklists.json` containing 29 published original Top32 sixties. The attached English database `cards/en/` and supplied Advanced Player's Rulebook are the card-text/rule sources. These counts describe which original decks **contain** a card; they do not measure how often that card can be Active, afforded, or tactically preferred.

| Exact printing | Original final ranks | First printed attack and condition making its intended action inert | Later printed attack proposed only when separately payable |
| --- | --- | --- | --- |
| Pidgey **MEW 16** | 2 (2 copies) | **Call for Family:** full owner Bench prevents putting any searched Basic onto Bench | **Tackle**, printed 20 |
| Duskull **PRE 35** | 31 (3 copies) | **Come and Get You:** full owner Bench prevents moving any discarded Duskull into play | **Mumble**, printed 30 |
| Trubbish **NVI 48** | 22 (1 copy) | **Garbage Collection:** empty public owner discard means there is no card to recover to deck top | **Sludge Bomb**, printed 20 |
| Dialga-GX **UPR 100** | 1, 10, 12, 13, 14, 18, 20, 21, 27, 30, 32 (13 copies in 11 lists) | **Overclock:** owner already holds at least six cards, so the effect of drawing *until* six adds no cards | **Shred**, printed 80 |\n| Buneary **PFL 83** | 15 (2 copies) | **Run Around:** with no Benched Pokémon, the switch cannot change the board | **Kick**, printed 20 |

All conditions rely on the **actor's own public board or own visible hand**, plus opponent's presence of a public Active Pokémon. They never consult the opponent's hand, deck, or Prize identities, nor unknown contents of the owner's deck. The alternative must already appear in the native-cost-checked payable list, must have the exact printed attack name and numeric damage, and must have no variable damageCalculation field.

**Rules:** Advanced Player's Rulebook section **C-11** explicitly says a Bench-filling attack ends before deck search if the Bench is full. This is particularly relevant for Pidgey: besides not placing a Basic, Call for Family does **not** permit an extra K0-to-K1 deck inspection when the Bench is full. Duskull's discard-to-Bench action similarly cannot place Pokémon on a full Bench. The rulebook's H. Deck discussion constrains search, but none of these observations presumes that a card is or is not among concealed Prizes. Trubbish and Dialga observations follow their exact printed effect texts and already visible zones.

## Critical original-60 Energy feasibility correction (20:40 UTC)

**Printed attack reachability must be checked against the authentic deck's Energy roster.** The five printed cases above are all real card texts, but **only three have a direct legal Energy funding route inside the original source 60**. This changes their research priority substantially.

| Exact source case | Printed alternative cost | Relevant original source Energy supply | Direct funding possible? |
| --- | --- | --- | --- |
| Rank 2 Pidgey MEW Tackle | [C][C] | 2 Capture, 2 Jet, 1 Memory and 1 Grass | **Yes**, two one-unit attachments can pay |
| Rank 31 Duskull PRE Mumble | [P][P] | 3 Telepathic Psychic and 2 Basic Psychic | **Yes**, two Psychic-producing attachments can pay |
| Rank 15 Buneary PFL Kick | [C][C] | 1 Double Colorless, 1 Powerful Colorless, 1 Capture, 2 Jet and 2 Grass | **Yes**, including one Double Colorless |
| Rank 22 Trubbish NVI Sludge Bomb | [P][C] | 5 Basic Darkness and 3 Basic Lightning, no Psychic provider | **No**, in its unchanged original 60 |
| Rank 1/10/12/13/14/18/20/21/27/30/32 Dialga-GX UPR Shred | [M][C][C] | Rank 1 Psychic only; rank 30 Psychic/Telepathic Psychic; Regidrago lists Grass/Fire/Double Dragon | **No**, for an Active Metal-type Dialga-GX in these unchanged original 60s |

This is a **necessary type/resource feasibility audit**, conditional on unchanged original 60 and ordinary printed attack costs. Double Dragon Energy can only remain attached to Dragon-type Pokémon and therefore cannot supply Metal to UPR Dialga-GX (a Metal-type Basic); Telepathic Psychic provides Psychic. This reasoning uses source list identities and English card rules, while actual native Store and paper game-state exceptions remain to be checked. Dialga-GX in Regidrago often serves as a discarded **attack-copy payload**, which is a different action channel from directly paying Dialga's Active attacks.

**Consequence:** Do not report the apparent 11-list Dialga coverage or rank-22 Trubbish branch as source-player opportunities. The pure function safely refuses unpayable attacks because the caller supplies an already-paid `payable` list, but those two additions contribute **zero ordinary direct-attack source coverage** in this benchmark. Reconstructed K0/K1 hand access, tool effects and extraordinary energy substitution are separate unverified questions. Next original-source action audit should prioritize rank 2 Pidgey, rank 15 Buneary and rank 31 Duskull only. This illustrates the associativity/AMR error from counting printed cards without resource compatibility.

## Implementation and narrow local verification

- `simulation/twinleaf/agent30-public-inert-leading-attack.cjs`: one pure `choosePublicInertLeadingAttack(view,payable)` function returning the later attack name/reason or `null`. Requires an actor-root observation. No Store mutations, random numbers, policy installation, privileged card reads, or vendor changes.
- `tests/agent30-public-inert-leading-attack.test.cjs`: **16/16** Node built-in pure tests passed locally on 1 November 2026, including full five- and eight-slot Benches, vacancy, an insufficient hand, nonempty discard, exact-printing exclusion, unpayable alternative, variable-damage exclusion, absent defender, and hostile concealed-opponent getters.
- The helper is deliberately **not yet wired** into `chooseActorRootIntent` or any canonical frozen policy. It does not alter the archived original native Store v1/v2 configurations. There is **no compiled native Store fixture or tournament-rate evidence** for this module.

### Decision boundary and non-dominance

This is a board-observable tactical preference, **not an unconditional dominance theorem**. Damage can trigger counter-effects, and another attack (including GX), retreat, or other turn action might be strategically preferable. In particular, high card prevalence for Dialga-GX is mostly Regidrago's donor/deck payload inclusion and should never be counted as eleven genuine Active Dialga decision opportunities.

In the intended integration, only call the helper **after** the native actor chooser has enumerated attacks as affordable and passed normal lock/turn restrictions. Use its return only as a suggested printing-locked branch under an explicit opt-in, and preserve native accepted attacks, actual damage/KO receipts, the following opponent decision, resource contention, original physical-deal identity and all censored outcomes. A negative or absent case should preserve existing selection semantics exactly.

## Proposed next falsification

Integrate alongside the existing `agent1-actor-dead-first-attack-frontier.cjs` (which already covers other exact-printing cases) after coordination with its active steward. An opt-in both-seat compiled source study on **rank 2, rank 15 and rank 31**, plus source-printed UPR100 wherever it becomes genuinely Active, can answer the concrete empirical question: *how often does the full-field policy actually meet each strict trigger, and do the resulting attack choices settle with meaningful opponent continuations?* First collect owner-visible positive opportunity denominators from original physical deals. Do not preselect only wins or trigger-positive hands, and do not turn simulator engine terminals into paper-timed win claims.

The global fixed-sixty objective remains unchanged: **29/32 exact source sixties, 0 competitive-qualified games, no established single 60 or 99.5% result**.
