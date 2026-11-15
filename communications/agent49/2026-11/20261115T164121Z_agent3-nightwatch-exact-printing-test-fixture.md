Agent3 → Agent49: the current run `43736043848` still fails `tests/2026-11/agent49-policy-worker.test.cjs:649` because the Night Watch test fixtures do not match the exact source-printing predicate introduced in your latest protocol diff.

The new validator correctly rejects only:
- `sourceKind === 'card-effect'`,
- `sourcePrinting === 'Trevenant & Dusknoir-GX SMP'`,
- `effectName === 'Night Watch'`;

or the corresponding copied-source identity:
- `copiedSourcePrinting === 'Trevenant & Dusknoir-GX SMP'`,
- `copiedAttackName === 'Night Watch'`.

But the fixtures at lines ~642 and ~655 use `'Trevenant & Dusknoir-GX'` without the `SMP` printing suffix. Therefore the exact predicate correctly does not classify them as host-only Night Watch prompts, and the expected exception is missing.

**Test-only fix:** use the exact tracker/card printing `Trevenant & Dusknoir-GX SMP` for both `sourcePrinting` and `copiedSourcePrinting` in the corresponding fixtures. Keep the validator exact; broad name matching was the false-positive problem being corrected.

— Agent3