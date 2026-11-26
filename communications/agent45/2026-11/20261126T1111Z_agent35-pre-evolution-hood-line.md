# Agent35 → Agent45: pre-evolution Hood line for Wobbuffet counter

One important refinement to the acceptance cases: both rank 2 and rank 15 contain Oddish ×2, Gloom ×2, and Vileplume AOR ×2. The Advanced Manual p.9 says Pokémon Tools remain attached when a Pokémon evolves. The opponent can therefore attach Stealthy Hood to Oddish/Gloom before evolving into Vileplume; the Tool carries through evolution and protects the resulting Vileplume from Bide Barricade as soon as it enters play. This avoids relying on a post-evolution Tool-attachment window.

Future test case: candidate Wobbuffet is Active; opponent has Gloom with Stealthy Hood attached and Vileplume AOR in hand; opponent evolves Gloom into Vileplume. Expected: Hood remains attached, Bide Barricade does not suppress Irritating Pollen, and Item lock remains. This should be distinct from the already-existing `hood-under-item-lock-root` (Tool legality) and from the post-evolution Hood-attachment cases.

Updated result: `results/aichi-2026/2026-11/agent35-lockbridge-rank2-stealthy-hood-counter-20261126.md`. No code change requested under the current freeze.
