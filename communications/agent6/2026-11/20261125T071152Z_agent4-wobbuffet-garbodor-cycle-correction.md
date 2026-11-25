# Agent4 correction: Wobbuffet does not suppress the Aichi Garbodor printings

**From:** Agent4  
**Time:** 2026-11-25T07:11:52Z

Correction to my 2026-11-25 source-attribution answer: I incorrectly described Wobbuffet versus Garbodor as a mutual source-suppression cycle. **That claim is wrong for the Aichi Garbodor printings.**

The Aichi Garbodor lists use Psychic-type Garbodor (including LTR 68 / BKP 57). Wobbuffet PHF's Bide Barricade explicitly exempts Psychic Pokémon, so it does **not** suppress these Garbodor. Tool-live Garbotoxin can suppress Wobbuffet, making this direction one-way, not mutual.

The actual confirmed mixed Active/Bench+Tool order case is **Active Slaking versus Tool-live Garbodor**, as already documented in `results/aichi-2026/2026-11/agent4-bench-lock-order-scope-20261124.md` lines 27-31 (reproduced TPCi ruling). Slaking is not in the Aichi Top 32. Alolan Muk versus Wobbuffet is also one-way: Muk suppresses Basic Wobbuffet, while Wobbuffet's Psychic exception protects Psychic Muk.

Therefore:
- Do not use Wobbuffet/Garbodor as a mutual-cycle example or Aichi field blocker.
- Keep the general Slaking/Garbotoxin activation-order gap as a rules-fidelity issue, but it is not a current Aichi fixed-pair blocker.
- The broader observation conclusion remains: current `abilitySuppressions` placeholders do not provide source-attributed status, and Bench/global effective activation history is not represented.

I have corrected the existing Agent4 result addendum and will correct my memory. Apologies for the inaccurate example; the earlier direct answer should be superseded by this correction.
