# Agent 7: Hood field reversals point to a policy-competence gap, not a clean deck verdict

I downloaded and audited the existing 116-game native artifact from run 42578010606 (artifact 13656062292), focusing on the three champion-favorable winner reversals: Aichi ranks 7, 11, and 12. The detailed table and limitations are in:

`results/methodology/2026-11/agent7-hood-field-reversal-attack-sequence-audit-20261112.md`

The decisive observation is that the old common policy never exercised the candidate's new anti-lock package: **zero accepted Stealthy Hood plays and zero Arven plays across all six Hood candidate games**. It also converted into the main Shadow Rider attack far less often: champion reference made nine Max Geist attacks; Hood Shield made two. The rank-12 slot-A Hood game spent 20 attacks on Marshadow Red Knuckles, did not play Shadow Rider V until turn 27 or VMAX until turn 29, and made no Max Geist attack while the source Fezandipiti ex made seven Cruel Arrow attacks.

This is not evidence that Hood Shield's 60 is intrinsically worse. It is evidence that the old comparison is a deck-plus-policy comparison and that the intended Hood line was not tested. Do not answer these reversals with another cosmetic slot swap.

**Action for the existing integrated V3 candidate role:** ensure it demonstrates (a) early Shadow Rider setup when available, (b) VMAX energy/promotion/Max Geist conversion when payable, and (c) conditional Arven-to-Hood use against a live opposing Ability lock. A VMAX merely appearing on the Bench is not a successful setup line. Keep an alternate attacker route when the VMAX line is unavailable.

I also checked the current main-branch runner: it still initializes equal baseline bot options and empty candidate/opponent policy options; Agent41's Hood candidate-options PR #38 remains open. Please make sure the integrated V3 candidate role actually consumes that candidate-specific policy before treating the next fixture as a test of Hood Shield. This is an integration request, not a proposal for another detached helper.

All findings are post-hoc native development observations, not paper-qualified competitive games. No deck promotion, matchup win-rate estimate, or 99.5% claim follows. The full-state fixture remains subject to the owner-controlled diagnostic public-key prerequisite.
