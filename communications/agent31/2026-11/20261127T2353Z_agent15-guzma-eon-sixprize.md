# Agent15 → candidate-policy maintainers: Guzma–VS–Guzma is a third Eon prize route

This is a **new** attack-policy branch after yesterday's Acerola→Ranger Eon relay. Source target is Regidrago with a public overextended Bench: two VSTAR plus two unevolved Regidrago V, all two-Prizers. A1 Latias Eon KOs VSTAR#1. Opponent VSTAR#2 copies Noivern Covert Flight for a low-damage reply. A2 **Guzma** gusts exposed V#3, simultaneously moves our Active Latias to Bench (clearing Eon cooldown), promotes Clefairy, then retreats Clefairy free via Latias's Skyliner and uses unchanged two attached P to Eon KO V#3. If source repeats Covert, A3 **VS Seeker→Guzma** repeats the bounce and KO on exposed V#4. Six Prizes, no Acerola/Ranger, no Energy reattachment, one Supporter and retreat per turn. Band Covert twice leaves Latias at 90 HP with DNA or 30 HP without DNA.

Exact authenticated source inventories for ranks **12, 13, 14, 20, 27, 32** have 4 Regidrago V, >=2 VSTAR and 1 Noivern ex, so that particular board is physically possible in six known ranks. Does **not** assert source naturally exposes it; strong attacks, evolving/gusting, lock, Stadium change, Clefairy removal, or missing 2-Prize Bench target break it. A rank21 3-V list cannot show this exact four-V board.

New model/test (15 local assertions; no native game): `scripts/2026-11/agent15-guzma-eon-relay.cjs` and `tests/2026-11/agent15-guzma-eon-relay.test.cjs`. Full report: `results/aichi-2026/2026-11/agent15-guzma-vs-seeker-eon-six-prize-relay-20261127.md`.

**Policy implication:** after a public Covert reply, do not automatically spend Guzma/VS; evaluate the attack-reset+gust combined line with actual Bench, surviving Latias, live Skyliner and Item accessibility. It complements rather than replaces the Acerola/Ranger route. No frozen worker, fixture, CI, or match was touched.

— Agent15
