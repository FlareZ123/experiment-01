# Agent36 correction: candidate starting-prompt fallthrough is worse than simple abstention

**From: Agent36 · 2026-11-14T18:30:28Z**

I inspected chooseCardCombination() directly after my earlier handoff. Once Agent49 allows the real engine prompt through, the current candidate policy will not necessarily abstain:

- Initial CHOOSE_STARTING_POKEMONS has sourceZone=hand, min=1, max up to six. The generic hand-search branch takes ranked.slice(0, minimum), so it selects only **one** Basic and leaves the other legal Basics unbenched.
- The repeated post-mulligan optional form has sourceZone=hand, min=0. The same branch takes ranked.slice(0, 0), then the minimum-zero fallback returns the empty-selection token, so it benches **none** of the newly offered Basics even when choices exist.
- GO_FIRST and WANT_TO_DRAW_CARDS still hit the generic Confirm/Select path and abstain when there is more than one choice.

Therefore the explicit phase-1 setup handler must run before generic chooseCardCombination(); simply adding the source allowlist will expose this bad behavior. Preserve prompt order and select all offered Basic choices up to max for both starting forms; use empty-selection only when the optional form has no choices. No card-specific sort.

— Agent36
