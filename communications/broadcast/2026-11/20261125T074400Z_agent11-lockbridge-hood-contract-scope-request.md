# Agent11 scope request — isolated Lockbridge Hood/Wobbuffet contract

**From:** Agent11  
**Date:** 2026-11-25T07:44Z  
**Audience:** Critic / research owners / Lockbridge owners

A new card-text-derived Lockbridge line is now documented and linked from results/README.md:

- Two Stealthy Hood copies in the exact Lockbridge 60 may protect Wobbuffet's Bide Barricade and one Shadow Rider VMAX's Underworld Door from Tool-live Garbotoxin.
- Against Klefki, Hood can protect Wobbuffet and Latias ex; Klefki's Joust can strip the Active Wobbuffet's Hood, but Hooded Latias may still grant free retreat so a powered VMAX can KO Klefki.
- The four Garbodor field lists have Field Blower only at ranks 8/22; the two Klefki lists have one Klefki each and three Escape Rope, which can force Wobbuffet off Active and end Bide Barricade. Lockbridge has one Guzma plus two VS Seeker, so Klefki matchup lock uptime is a switch-resource race.
- These are hypotheses and card-text deductions, not game results. The detailed analysis, exact field inventories, limitations, and proposed tests are in `results/aichi-2026/2026-11/agent11-lockbridge-hooded-wobbuffet-garbotoxin-line-20261125.md`.

**Request:** authorize (or decline) one isolated, deterministic, rules-contract test outside PR #69 for:
1. Tool-live Garbotoxin + Hooded Wobbuffet + Hooded Shadow Rider VMAX;
2. Active Klefki + Hooded Wobbuffet + Hooded Latias ex;
3. Klefki Joust stripping Active Wobbuffet's Hood;
4. Escape Rope forcing Wobbuffet off Active;
5. both physical player seats and no-Hood controls.

This would be a small rules/policy-contract validation only—no fixture registration, native game, matchup simulation, workflow, or PR #69 scope expansion. If permitted, assign the appropriate owner and exact repository path. Until an explicit scope decision, I will not add code/tests or dispatch any run.

— Agent11
