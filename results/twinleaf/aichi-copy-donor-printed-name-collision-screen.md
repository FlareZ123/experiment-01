# Fixed-field copied-donor name collision screen

**Agent 34, 19 October 2026 UTC.** The underlying engine defect is real and reproduced separately. This report limits its relevance in the **currently known** Aichi field.

## Scope and computation

The versioned [screen script](../../scripts/aichi-copy-donor-name-collision-screen.cjs) reads only original [29 published decklists](../aichi-2026/full-decklists.json), [English set metadata](../../resources/sets/en.json), and printed [card data](../../resources/cards/en/). It resolves each Pokémon by its explicit source set code and printed number. Trainer Gallery and Galarian Gallery codes are distinguished from parent sets, avoiding silently mapping SIT/LOR/CRZ 100-series cards into 30-card gallery datasets.

For a Regidrago VSTAR list, eligible potential source donors are all printed **Dragon-type Pokémon** other than Regidrago VSTAR itself. For a Mewtwo & Mew-GX list, the sources are GX/EX Pokémon other than Mewtwo & Mew-GX itself. Within each deck's potential donor inventory, the script groups printed attacks by exact attack name and flags a name if **two or more distinct donor attacks differ in cost, damage, or text**. It neither assumes cards enter discard nor rewards theoretical accessibility.

**Successful pure-data manual CI [39179499062](https://github.com/FlareZ123/experiment-01/actions/runs/39179499062)** at head a27735d64d2cae7850ced9aecd583f772c1e5819:

| Measure | Recorded result |
| --- | ---: |
| Published exact decklists examined | **29** |
| Copy-mechanism source lists matched | **9** |
| Lists with different-text, same-name eligible donor attacks | **0** |
| Unresolved relevant Pokémon source printings | **0** |

The nine copy-mechanism lists were Regidrago VSTAR. No Mewtwo & Mew-GX Perfection list was present in the 29 published source lists, so this negative result applies to **Apex Dragon source-inventory ambiguity** across those nine lists. It is **not** an empirical absence result for every variant of Perfection or for the three unavailable full field decks, ranks 23, 25, and 28.

## Important distinction

A [compiled pinned-Twinleaf bug demonstration](copied-attack-duplicate-name-printing-identity.md) showed the engine copied the wrong printing's Fast Raid when Latios-EX ROS and Pheromosa-GX UPR were staged together. The compiled [research-only correction](../../simulation/twinleaf/copy-attack-source-identity-hook.cjs) repaired that case, and its restoration test passed. Neither fact implies that the miscopy was exercised in any Aichi source game.

This source screen provides a useful **negative field-exposure filter**: do not spend competitive comparison compute correcting a hypothetical same-name different-printing conflict in the nine known Regidrago decks before evidence of actual collision in their source inventory. The hook should remain opt-in and full copied-source action telemetry should remain precise because other formats, candidates, card printings, and future field decks could exercise the bug.

The scan does not address native versus delegated attack resolution, clone aliasing, wrong-source callbacks for attacks with **different names**, or printed source attacks supported by Twinleaf. The 99.5% benchmark and official timed game outcomes remain unverified; **zero qualified competitive games** are recorded.
