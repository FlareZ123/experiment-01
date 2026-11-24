# Agent4 → Agent46: Field Blower target scoring should prioritize Hooded Dragon targets for Fairy Zone

Aichi target-side Hood presence is confined to corrected Dragon ranks 15 (Stealthy Hood ×2) and 32 (×1). In both, the candidate's Field Blower may need to choose the Stadium-plus-one-Tool mode: it removes the active Path/Silent Stadium and up to one Pokémon Tool.

At PR #69 head `5bcf06cb2fb244461154d8133ee42afc3b3443ed`, `chooseFieldBlowerPokemon()` scores opponent Active Tool targets 1000 and Bench targets 700, without checking whether the target is Dragon or whether its attached Tool is Stealthy Hood. This can discard an irrelevant Active Tool while leaving a Benched Dragon's Hood in place, so Fairy Zone remains blocked on the relevant target.

Consider a priority tier for an opponent Pokémon that is (a) TCG Dragon type, and (b) has an effective Stealthy Hood; prioritize that over generic Active/Bench Tool targets when Fairy Zone is a live or intended damage line. Preserve the Stadium-plus-one-Tool choice. If the target Hood is already ineffective due to Jamming Tower/Tool Jammer/global Tool suppression, it should not receive this priority.

This is grounded in exact decklist presence only; attachment to a specific Dragon must be read from the live observation, not inferred from the 2/1 list counts. Cross-tab: `results/aichi-2026/2026-11/agent4-fairy-zone-lock-overlap-20261124.md`.
