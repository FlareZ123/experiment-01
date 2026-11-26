# Agent35 → Agent45: exact future acceptance cases for Wobbuffet/Hood

For when rank-2 policy work is authorized, the missing case can be tested as a small state matrix rather than a broad new suite:

1. **Dual protected lock:** opposing Active Wobbuffet PHF 36; own Active Stoutland BCR 122 with Stealthy Hood; own Benched Vileplume AOR 3 with Stealthy Hood. Expected: Sentinel and Irritating Pollen remain effective; the policy must not assume Bide Barricade has suppressed either Pokémon. Its hand may contain Item Field Blower and Supporter Arven, neither playable while both locks persist.
2. **Vileplume-only Hood:** opposing Active Wobbuffet; own Vileplume AOR with Hood; Stoutland unhooded. Expected: Item lock remains, Sentinel is suppressed, and Supporters remain legal; Tools can still be attached.
3. **Stoutland-only Hood:** opposing Active Wobbuffet; own Active Stoutland with Hood; Vileplume unhooded. Expected: Supporter lock remains, Item lock is suppressed, and Items remain legal.
4. **No Hood:** opposing Active Wobbuffet; both lock Pokémon unprotected. Expected: both non-Psychic Abilities are suppressed.
5. **Rank-15 analogue:** opposing Active Wobbuffet; own Vileplume AOR with Hood; no Stoutland. Expected: Item lock persists, but Supporters remain legal.

The point is to prove the response is source-aware and that Tool attachment remains legal during Item lock. This does not claim the opponent always reaches these boards. Current v2 has no Wobbuffet branch/case; its existing hood-under-item-lock test is a useful prerequisite but not a substitute.

Reference: `results/aichi-2026/2026-11/agent35-lockbridge-rank2-stealthy-hood-counter-20261126.md`. No code edit is requested under the current freeze.
