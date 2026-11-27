# Rank 17 Raichu/Electrode source-family decision implementation — Agent 50, 2026-11-27

**Status:** isolated development branch; synthetic decision and arithmetic evidence only. NOT native-qualified, NOT an active registration, NOT a matchup or win-rate result.

## Delivered decision paths

Rank 17 Yuya Yamano source entry in `results/aichi-2026/full-decklists.json` (Git blob ae773f6201d7aa69d31914dbfee66f3fba692200), compact entry SHA256 41743dd93f080bff72981d0245b24df7615be3b1d3a03900e673a0dc2b6a2083, exact 60. Reuses rank4 v2 pure helpers, base blob 6897cd7f73ad8be8c01eafb97295fed6d74d376e. Source-specific overlay `simulation/evaluation/2026-11/agent50-rank17-family-overlay.inc.js`; standalone bundle `agent50-rank17-raichu-electrode-opponent-policy.cjs`.

- Compressor → Carrier → missing Voltorb/Pikachu bench establishment; if one starter already recoverable, compress only the other. Do not consume sole Carrier drawing Unown first if Compressor can supply both core pieces. If both already recoverable, Carrier dominates Compressor.
- Unown recycle, Farewell Letter priority, preserve attached resources; no Active Unown ability, no self-Klefki / known Basic lock, no last-card draw.
- VIP own first turn, not absolute turn 1 only; two distinct starters; no use after first turn.
- Escape Rope → ready bench Gengar & Mimikyu-GX → Horror House-GX on first turn going second when opponent has at most one public attached Energy card and more than three Prizes remaining; free direct retreat dominates Rope, don't use unsupported paid-retreat path. This is a tempo heuristic, not proof of optimal play.
- Owner-scoped prompt choices; ordinary opaque Prize slots use exact requiredCount (never infer face-down identity); selective support for Secret Box, Stretcher, Trainers' Mail, Squawk, Research/Carmine, PokéStop, Temple removal, U-Turn Board. No blanket Tool/Item conflation.

Executed exact retrieved bundle blob a0fc2d51d26b0d0023e98bc8c2d210e733f13c14, protocol blob 468f957b17656f41cf9af8c77e6954bb79ea5695, test blob e64059b74f1a1c094f625f952f83b80b9fb7f620, kernel test blob c9b45bf6acc5aa9f66022e22cb8b0b3f7b7bfd04 in isolated JavaScript runtime: **103/103 decision-contract assertions**, including both physical seats, and **45/45 arithmetic assertions**. Synthetic state transitions; not full actor observation validation, not Node/worker subprocess, not actual Store. No CI or native game.

## Shared Bomb/Rain immediate tactical kernel

`planRainTurn` is a pure exported helper inside the same worker, intentionally not invoked by createPolicy while host support is absent. It requires explicitly complete public attack window and target modifiers. It enumerates legal physical card subsets, exact min(5,eligible) per Bomb, post-self-KO Prize condition, discarded Lightning **units**, simultaneous target allocation and immediate KO subsets. It disallows a self-KO that awards the opponent their final Prizes, and prioritizes immediate victory over nonterminal favorable net Prize trade. Unknown modifiers/identities fail closed.

Grounding:
- CES48 Extra Energy Bomb moves Energy cards, not units. Advanced manual II.D-04 covers fewer eligible cards.
- UNM57 Electro Rain deals attack damage, not damage counters; separate energy units determine target selections, and weakness/resistance are not applied.
- Official Japanese FAQ search for Alolan Raichu: https://www.pokemon-card.com/rules/faq/search.php?freeword=%E3%82%A2%E3%83%AD%E3%83%BC%E3%83%A9%E3%83%A9%E3%82%A4%E3%83%81%E3%83%A5%E3%82%A6 : one live Counter Energy gives two selections; 3 choices against an Active GX plus Choice Band gives 120 (not 180). Official card wording https://www.pokemon-card.com/card-search/details.php/card/36550/regu/XY confirms damage per target equals selection count times 30. The extension to live Reversal's three provided Energy units follows the card text and general rulebook II.C-01 Ignition Energy example; it is a derived paper arithmetic result, not direct card-specific FAQ or native execution.
- Telescopic Sight gives +30 once to each eligible targeted Benched V/GX (not an ex, not a damage-counter modifier). Caller must establish Tool and attack modifier effects and any prevention. Post-discard conditional shields can be represented by minRemainingEnergy and requiresNoSpecialAttached.
- Narrow scope: all Bomb Energy assigned to one ready Raichu, no future-turn planning, no unknown triggered effects, no attack execution. Native hooks and V3 host support still absent for Extra Energy Bomb multi-assignment, Electro Rain PutDamagePrompt (engine representation; paper damage), Crush and Burn-GX discard/damage. Abstention remains mandatory.

## Concrete candidate defenses — executed kernel cases

Assume both start with six Prizes remaining, ready Raichu, no prevention/other modifiers, live Telescopic Sight, active target not boosted, opponent board exactly listed. Both unchanged Hood and Lockbridge inventories include Girafarig, Trevenant & Dusknoir-GX, Tapu Lele-GX and Shadow Rider VMAX.

| Attack resources | Target board | Immediate result |
|---|---|---|
| One Bomb + one manual, 4 Reversal + 2 Counter = 16 Lightning units | Active Girafarig 90 (3 hits), Benched TrevDusk 270 (8 hits with Sight), Benched Lele 170 (5 hits with Sight) | 6 Prizes / board-out |
| Same after two Reversal removed, max 2 Reversal + 4 Counter = 14 units | Same | 5 Prizes, not terminal |
| Two Bombs, 4 Reversal + 4 Counter + 2 Unit = 22 units available | Active VMAX320 (11 hits), Benched VMAX320 (10 hits with Sight) | 6 Prizes; solver spends 21 units, retains one Unit |
| Two Reversal Lost Zoned, ALL remaining 2R+4C+4U = 18 units | Same two undamaged VMAX | no 6-Prize KO; solver prefers one Bomb for 3 Prizes |
| Two Counter Lost Zoned, ALL remaining 4R+2C+4U = 20 units | Same | no 6-Prize KO |
| Two Unit Lost Zoned, ALL remaining 4R+4C+2U = 22 units | Same | six-Prize KO possible |

This gives a direct tactical rationale for Girafarig Get Lost priority: prefer live/available Reversal to Counter to Unit when other effects and tempo equal; removing two Reversal prevents this one-Bomb 16-hit exposed-board line, and removing two Reversal OR two Counter prevents the specified undamaged two-VMAX OTK even if the entire surviving inventory becomes attached. It does not guarantee survival of damaged VMAX or other cheaper Prize paths, or establish Get Lost as superior to an immediate winning attack. Never assume exact hidden inventory; actual candidate decisions must use publicly observed cards and actor-safe information. Lockbridge's Wobbuffet/Temple package can force removal of two distinct blockers but opponent has Marshadow (Psychic) and PokéStop plus Escape Rope, so it is not hard immunity.

No qualification/promotion of either candidate, no game, no owner gate change, no merge.
