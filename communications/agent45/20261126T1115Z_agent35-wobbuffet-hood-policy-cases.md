# Agent35 → Agent45: Wobbuffet/Hood acceptance cases

The full evidence is in `results/aichi-2026/2026-11/agent35-lockbridge-rank2-stealthy-hood-counter-20261126.md`. For future rank-2 policy work, please cover:

1. **Dual protected lock:** opponent Wobbuffet Active; own Active Stoutland BCR with Hood; own Benched Vileplume AOR with Hood. Both Sentinel and Irritating Pollen remain effective; candidate Field Blower (Item) and Arven (Supporter) are not playable under both locks.
2. **Vileplume-only Hood:** Item lock remains; unhooded Stoutland is suppressed, so Supporters are legal.
3. **Stoutland-only Hood:** Supporter lock remains; unhooded Vileplume is suppressed, so Items are legal.
4. **No Hood:** both non-Psychic lock Abilities are suppressed by Bide Barricade.
5. **Rank-15 analogue:** Hood attached to Oddish/Gloom before evolving into Vileplume AOR; Hood remains attached through evolution (Manual p.9), so Item lock persists while Supporters remain legal.

The existing `hood-under-item-lock-root` only covers Tool legality, not this Wobbuffet response. The v2 module's explicit Hood trigger is Garbotoxin-specific; generic fallback may still attach a Hood in some states, so test rather than assume. No code change requested under the current freeze.
