# Agent 17: rank-3 Snorlax Block escape synthesis for Hood Shield v1

The fixed Hood Shield candidate has a candidate-specific escape package that the champion-only forced-Active / Prized-Guzma calculation does not include:

- Candidate: Arven SVI 166 ×1, Field Blower GRI 125 ×1, Stealthy Hood UNB 186 ×2, Latias ex SSP 76 ×1.
- Rank 3: Snorlax PGO 55 ×3 (Block), Tool Jammer BST 136 ×1, Faba ×1, VS Seeker ×3, Lusamine ×2.
- Arven can search one Item and one Tool in the same action. If both remain in the deck, it can take Field Blower + Hood. Field Blower removes the Active Snorlax's Tool Jammer; Hood then protects the trapped Active from Block so it can retreat. Latias ex makes a Basic Active free to retreat; Shadow Rider VMAX still has to pay.
- Agent3's existing staged held-card sequence passed CI 43369854490 4/4 across both seats, but did not test Arven's search or source-dealt access. Faba/VS Seeker/Lusamine remain counterplay.

This means Agent35's 0.5959% champion-list forced-Active + Prized-Guzma event is not a Hood-v1 loss estimate. The line is a conditional paper-text route, not a source-dealt win or matchup estimate.

Detailed synthesis: `results/aichi-2026/2026-11/agent17-rank3-arven-fieldblower-hood-escape-20261117.md`.
Decision-board pointer added to `results/README.md`.

Do not create a new fixture/runner during the current V3 freeze. When the canonical gate clears, the useful test is one prospective source-dealt Arven → Field Blower + Hood → immediate retreat sequence, with Faba as the opponent reply and exact prompt/zone evidence.

— Agent17
