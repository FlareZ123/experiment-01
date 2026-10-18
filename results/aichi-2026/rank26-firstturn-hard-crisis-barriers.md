# Aichi rank 26: exact unavoidable first-turn Crisis Punch barriers

**Agent 34, 18 October 2026.** Evidence: registered printing-resolved rank-26 60-card source inventory; exact finite-population counting; independent exhaustive physical-deal enumeration on three miniature decks. The bound concerns **the first-turn Crisis Punch line when Meloetta is the first player** and the opponent has not yet had a turn. It is **not** a lost-game probability, policy evaluation, or win-rate measurement.

## Source mechanics and restricted claim

The [registered rank-26 deck](full-decklists.json) has **12 Basic Pokémon**, exactly one **Meloetta ex BLK 44**, one **Double Colorless Energy SUM 136 (D)**, two basic Lightning Energy, one **Redeemable Ticket JTG 156 (T)** and one **Escape Rope BST 125 (R)**. The [source line](meloetta-donk-als.md) uses Meloetta ex's first-player Debut Performance, five self-KO Prizes awarded to the opponent, one Double Colorless plus an accelerated Lightning, and the Tool-provided **Technical Machine: Crisis Punch** attack requiring three Colorless Energy. Tapu Koko Prism Star attaches Lightning Energy to *Benched* Pokémon, excluding an Active Meloetta.

Consider a uniformly shuffled physical 60. Accept an initial seven only if it contains a Basic; place six unseen Prize cards. The following distinct opening-deal events each prevent the specified first-turn Crisis Punch under the registered source card effects and ordinary rules:

- **A: D and T are both in the initial six Prizes.** Ticket, the list's only Prize redeal, is inaccessible; Hisuian Heavy Ball retrieves only a Basic Pokémon and cannot retrieve either singleton. With D inaccessible, the entire remaining energy inventory supplies at most **two** Energy, insufficient for Crisis Punch's [CCC]. Other initial cards, searches and choices cannot overcome this printed-resource bound on the first turn.
- **B: Meloetta is the only Basic in the initial seven, while R and T are both in the initial Prizes.** Meloetta must begin Active. The sole source-deck Item that can switch its own Active is inaccessible, and Ticket cannot recover it. A manual retreat would spend the only retreat for the turn and leave Meloetta Benched. Float Stone cannot re-promote it; attaching Float Stone directly also contends with the TM Tool slot. As long as it stays Active, Tapu Koko cannot accelerate Lightning to it; one manual attachment supplies at most the Double Colorless's two Energy. Therefore the intended [CCC] attack is inaccessible even with otherwise perfect search/draw.

**Why Ticket is explicitly included in both barriers:** A Prized D or R alone is *not* necessarily a hard block, since a playable Redeemable Ticket can relocate its old Prize cards to the bottom of the deck, after which search/shuffling may expose them. The [source-conserved Ticket → Forest Seal Stone Store witness](rank26-ticket-crobat-stone-direct-rescue.md) actually recovered the original Prized D in a constructed legal-action state. Ignoring this rescue mechanism would substantially overstate the bound.

## Exact joint probability

Let `N=60`, `B=12` Basics, `h=7` initial hand, and `p=6` Prizes. Write `V = C(60,7) − C(48,7)` for the number of Basic-valid opening hands and `Z = V × C(53,6)` for equally weighted accepted hand/Prize partitions. The event counts in that common denominator are:

- `A = [C(58,7) − C(46,7)] × C(51,4)` (neither D nor T opened, both Prized);
- `B = C(46,6) × C(51,4)` (Meloetta and six non-Basics excluding R,T opened; R,T Prized);
- `A∩B = C(45,6) × C(50,3)` (the above opening also excludes D, and D,R,T are all Prized).

| Exact event | Favorable accepted hand/Prize partitions | Fraction of legal initial sevens |
| --- | ---: | ---: |
| A: D and T both Prized | 61,762,637,059,200 | **0.860683385%** |
| B: Meloetta forced Active, R and T both Prized | 2,340,768,068,100 | **0.032619400%** |
| A and B overlap | 159,643,176,000 | 0.002224682% |
| **A ∪ B: first-turn Crisis Punch structurally blocked** | **63,943,761,951,300** | **0.891078103%** |

`Z = 7,175,999,693,903,040`. By inclusion-exclusion, even an ideal rank-26 player cannot announce and successfully pay the specific first-turn Crisis Punch in at least **0.891078103%** of valid opening deals in this restricted first-player setting. Equivalently, **99.108921897%** is an *upper bound on availability of this particular first-turn attack*, not on the game win rate.

## Reproducibility and limits

- Source-guarded BigInt count: [`scripts/aichi-rank26-crisis-barriers.cjs`](../../scripts/aichi-rank26-crisis-barriers.cjs), which rejects changed rank-26 singleton printing/count assumptions.
- Independent miniature-physical-deal enumeration: [`tests/aichi-rank26-crisis-barriers.test.cjs`](../../tests/aichi-rank26-crisis-barriers.test.cjs). The brute enumeration chooses each valid hand and every possible Prize set without relying on the analytic event formulas; all three tested parameterizations matched the exact counts locally.
- The existing **manual-only** [Redeemable Ticket workflow](../../.github/workflows/aichi-redeemable-ticket.yml) includes the new test. Record the current-head compiled/CI run here after validation; local Node 22 miniature counts were passing before dispatch.

The events ignore opponent mulligan bonus draws (which cannot remove already-Prized D, T or R), opponent-turn intervention (hence first-player scope), attack costs outside these events, conventional setup failures, and any later-game route to victory. The forced-Meloetta subset deliberately requires that **both** Ticket and Escape Rope are Prized, making its switching obstruction robust against known in-deck Ticket rescue. This lower bound may be strengthened by additional disjoint paper-legal failure mechanisms, but this report establishes only the two enumerated events.

**Implication for evaluation:** a purported virtually guaranteed turn-one Meloetta donk must account for unavoidable opening-resource failure and should not be inferred from resource-access search-path connectivity. This statistic does not say anything directly about the win rate of the fixed deck the research population ultimately nominates against rank 26.
