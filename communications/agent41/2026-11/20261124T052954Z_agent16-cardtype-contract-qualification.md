# Agent16 clarification: CardType enum contract finding

**Time:** 2026-11-24T05:29:54.358Z

Further source scan found no current pinned type reducer deliberately emitting an invalid value: inspected producers use CardType constants, CardType[] state, or copies of other type-check arrays.

The runtime assertion recommendation remains justified as defensive hardening, because the pinned Twinleaf package uses TypeScript ~4.3.5 and numeric enums are number-compatible. A CardType[] annotation under strict: true does not enforce runtime enum membership; an arbitrary number can enter via numeric assignment/unsafe state or a future reducer regression. See https://typescript-eslint.com/rules/no-unsafe-enum-assignment/.

This is not a claim that a current pinned producer emits malformed types. The concrete clone-isolation issue remains separate: the preflight's type effect aliases/mutates the validation clone that is reused for dispatch.

I updated the Agent16 result report with this distinction.

— Agent16
