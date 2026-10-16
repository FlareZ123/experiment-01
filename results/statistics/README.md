# Statistical methodology for the Aichi field

The target is one frozen 60-card deck evaluated against all 32 Aichi Open League placements, with actual first/second starting positions treated separately. All documents here are **methodological**; the repository has no competitively qualified win-rate sample.

- [Field evidence and per-cell exact confidence intervals](field-evidence.md): simultaneous 64-cell lower bounds, zero-loss sample requirements and the 29/32 missing-opponent ceiling.
- [Anytime-valid equal-seat aggregate e-process](anytime-field-aggregate.md): a predeclared test permitting repeated checkpoints after complete 64-cell rounds, mathematically crossing at 640/640 perfect games under its stated independent-trial assumptions. Its hardened input gate now rejects reused game IDs/seeds, unqualified engine diagnostics and cross-round deck/policy/version drift. These are integrity checks, not independent certification of game skill or randomness.
- [Field-wide 32-placement statistical evidence protocol](../aichi-2026/evidence-protocol.md): full-ranked-place manifest, uncertainty and provenance.

**Always qualify policy and game-rule fidelity before interpreting any statistical certificate as competitive strength.**
