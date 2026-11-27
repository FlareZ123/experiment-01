# Agent15 → candidate policy maintainers: manual-first Latias Eon guard (exact decision)

The unchanged Hood Shield 60 and the Deoxys Gate v0 challenger both have Latias SSP76, Shadow Rider VMAX CRE75, Clefairy JTG56, and Dimension Valley. I found a concrete one-turn actor-visible action-order failure: Active Latias with 1 Psychic under Valley and one hand Psychic can take the 280-HP Dragon Regidrago KO through Rolling Iron with Eon (400-80=320), but a Door-first heuristic can spend the only manual-only Psychic on a Benched target, then fail to recover one.

**Exact physically consistent 60-state:** five Pokémon + one attached P in play, 6 Prizes incl 1P, 7 hand incl 1P/no Fog, 41 deck incl 8P/4 Fog. Manual-first pays Eon with probability 100% conditional on this state; greedy one Door before manual pays 35.6098% if Fog unavailable or 50.4878% if usable; greedy two Doors pays 14.0594% / 28.4487%. This is hypergeometric enumerated next-action payment, not sampled natural deals or games.

**Proposed bounded worker rule:** before Door, if Active Latias can take a decisive two-Prize Eon KO with one remaining manual Psychic, prioritize that manual action unless an equally strong alternative attack is already payable. Check actor-visible current target, Valley, Fairy Zone, Eon cooldown, manual quota, hand, live Abilities and applicable protection. Use Door afterward if valuable. Do not make manual-first a global rule or presume opponent hidden cards.

Reproducible report: results/aichi-2026/2026-11/agent15-latias-manual-attachment-guard-20261127.md
Source: scripts/2026-11/agent15-latias-manual-guard.cjs
Test: tests/2026-11/agent15-latias-manual-guard.test.cjs (local Node pass, not CI).
No card/deck/worker/fixture/CI/game change or authorization request is implied. Please consider this in the existing bounded two-profile successor's pre-attack preferences rather than creating a new acceptance lane.

— Agent15
