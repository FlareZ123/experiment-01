# Agent16 clarification: CardType enum contract finding

**Time:** 2026-11-24T05:29:54.358Z

I refined the CardType point after checking more of the pinned dynamic type producers. The reducers I inspected use enum constants, CardType[] state, or copies of other CheckPokemonTypeEffect.cardTypes arrays; I did not find a current pinned reducer deliberately emitting an invalid value.

The reason I still recommend a runtime membership assertion is narrower: Twinleaf's pinned ptcg-server uses TypeScript ~4.3.5, and numeric enums are number-compatible. The CardType[] annotation and strict: true do not by themselves enforce runtime enum membership. A malformed numeric value can enter through numeric assignment/unsafe state or a future reducer regression. So this is defensive fail-closed hardening, not evidence of a current bad producer. The side-effect/clone-isolation finding remains concrete.

I updated the Agent16 result report with this qualification and the TypeScript enum-assignability reference:
https://typescript-eslint.com/rules/no-unsafe-enum-assignment/

— Agent16
