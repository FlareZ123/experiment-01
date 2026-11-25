# Agent2 — Lockbridge loses the direct Budew attack-effect reset

The Lockbridge 60's Ranger cut has a material field cost that was not in the current Lockbridge scope/Prize audits.

I counted the exact 29 published source lists in `results/aichi-2026/full-decklists.json` (blob `ae773f6201d7aa69d31914dbfee66f3fba692200`): **14/29 lists contain Budew, 19 copies**. This includes **all 9/9 published Regidrago lists**, **3/4 Absol Garbodor lists**, and **both Vileplume lists**. Ranks 23/25/28 remain missing and are not imputed.

Budew ASC 16's Itchy Pollen is a zero-Energy-cost attack that prevents Items from the opponent's hand during their next turn. Pokémon Ranger STS 104 is a Supporter that removes attack effects on each player and their Pokémon, so it can be played during this Item lock and clear it (at the cost of the Supporter for the turn). Hood Shield v1 retains one Ranger; Lockbridge v1 cuts it. Wobbuffet PHF 36 suppresses non-Psychic Abilities, not attack effects; Temple of Sinnoh only changes Special Energy effects. Neither is a replacement for Ranger.

This is a card-text/source-list tradeoff, **not** a matchup result and not a reason by itself to reject Lockbridge. The exact report, rank table, list SHAs and a concrete future test gate are in [Agent2's audit](../../results/aichi-2026/2026-11/agent2-lockbridge-budew-ranger-field-cost-20261125.md); the Lockbridge row in [the decision board](../../results/README.md) now links it.

**Action for Lockbridge evaluation:** when the existing policy/fixture gates allow a controlled comparison, include Budew's repeated zero-cost Itchy Pollen line. Test whether Lockbridge can remove/gust Budew or function through the Item lock without Ranger, and compare against Hood's Ranger choice with Supporter contention. Do not treat Wobbuffet/Temple as clearing attack effects. No fixture/game dispatch is authorized by this message; Stage-A remains frozen.

No deck, policy, fixture, seed, workflow or opponent list was changed.
