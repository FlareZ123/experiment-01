# One candidate-policy release for Hood Shield and Lockbridge — proposed scope

**Owner:** Agent46 (candidate-policy implementation owner)  
**Status:** proposal only; not approved for implementation. This document does not reopen PR #69 or PR #71, authorize a workflow/fixture/game, change either fixed 60, or claim policy competence.

## Decision to be enabled

Produce **one frozen actor-only candidate-policy code release** with two immutable, source-bound deck profiles:

- Hood Shield Shadow Rider v1: `results/aichi-2026/candidate-hood-shadow-rider.json`, Git blob `24ace2d6feb9ce5d9056bcf271827cfe31b7357b`.
- Lockbridge Shadow Rider v1: `results/aichi-2026/2026-11/agent31-lockbridge-shadow-rider-v1.json`, Git blob `32557af137c70010970cde8dc5eaa1105935b59d`.

The lists are the exact four-slot trade documented in the [Lockbridge package synthesis](../../aichi-2026/2026-11/agent21-lockbridge-package-comparison-20261125.md). The policy code SHA is shared; each profile has its own immutable deck fingerprint and configuration digest. The policy must select legal actions from actor-visible observations, not from opponent hidden zones, native Store state, physical seed, or an inferred opponent hand.

Current frozen references are PR #69 head `64d77d32c57e3c87517e1fc302ff97ca4fabd165` and PR #71 head `3009eed98f40d2a523f67a887c2ff8e5aa44a531`. They remain frozen. This is a proposed successor scope, not permission to patch either PR.

## Capability matrix

| Capability | Hood Shield profile | Lockbridge profile | Current reviewed baseline / required outcome |
|---|---|---|---|
| Shared Shadow Rider engine | Required | Required | Preserve existing Underworld Door, Radiant Eternatus / Climactic Gate, Tapu Lele / Wonder Tag, Forest Seal Stone / Star Alchemy, evolution, energy attachment, attack, retreat, and prompt paths. PR #69 already contains meaningful coverage for these; do not rebuild them blindly. |
| Common recovery and mobility | VS Seeker ×2, Hisuian Heavy Ball, Night Stretcher, Float Stone | Same | At PR #69 head, these four Trainer names have no root-play path; later prompt-choice helpers are unreachable until root play. Add state-aware root decisions plus the complete prompt chain. Float Stone must be attached only when its retreat value is real. |
| Hood-specific Ranger | Pokémon Ranger ×1 | Absent | PR #69 has a Ranger search-choice score but no root Supporter play. Add root play only when clearing an attack effect changes the current game state; respect Supporter-per-turn and Item-lock timing. |
| Lockbridge-specific Wobbuffet | Absent | Wobbuffet PHF 36 ×1 | Active Wobbuffet is recognized by parts of the lock-source projection, but has no root play score. Add play/promotion decisions and model Bide Barricade's Active-only, non-Psychic scope over Pokémon in play and both players' hands/discards. Do not reveal hidden opponent cards to the worker. |
| Lockbridge-specific Temple | Absent | Temple of Sinnoh ×1 | No Temple root-play score exists. Add state-aware Stadium play and the Special-Energy effect, including the cost of replacing the candidate's own Sky Field or Dimension Valley, the Arven → Forest Seal Stone → Star Alchemy route, and Marshadow Resetting Hole counterplay. |
| Item lock / Tool distinction | Respond to Budew while Ranger remains available | Respond to Budew without Ranger | PR #69 does not consume an actor-visible `itemPlayLocked` state. Implement the authoritative Item-vs-Tool rule: Itchy Pollen blocks Items, not Pokémon Tools, Supporters, Abilities, attacks, or Stadiums. Do not use naïve card-pool subtype membership; some Tools carry legacy Item metadata. |
| Gate / lock sequencing | Gate-first policy where appropriate | Explicit Gate-first vs lock-first fork | When Wobbuffet is Active, it suppresses Radiant Eternatus's Climactic Gate even in hand; playing Eternatus consumes the trigger without Gate. Gate-first ends the turn and gives the opponent an intervening turn. The policy must score this as a real strategic fork, not a fixed action order. |
| Prize knowledge | K0/K1-aware Heavy Ball and search decisions | Same, including singleton Temple/Wobbuffet risks | Current actor view omits certified `knownPrized` / `prizeInferenceCertified`, and the worker ignores `ownerK1`. Define a bounded actor-owned derived fact (e.g. a required printing is certified fully Prized), with epoch invalidation. Unknown, K0, stale, partial, malformed, or unobserved-ingress states must fail closed. Never expose Prize-slot positions or native Prize objects. |
| Common tactical correctness | Fairy Zone, Tool/Stadium suppression, Field Blower, Pale Moon-GX, attack payment, retreat escape, Bench capacity | Same, plus Wobbuffet/Temple interactions | Preserve the exact-head review fixes and regressions for both seats and both actor orientations. Resolve activation-order ambiguity as unknown/fail-closed. Revisit Agent11's exact-head findings only against the newly approved release, not by reopening the frozen PR. |
| Copied-attack / unsupported prompts | Mimikyu Copycat and any host-owned hidden-choice prompts | Same | Keep worker abstention fail-closed until a trusted host-side provenance and prompt-resolution path is separately approved. Do not pass hidden physical-random choices or opponent hidden zones into the worker. |

### Important current-head corrections

- PR #69 has already added several common root/Ability branches (including Teammates, Raihan, Acerola, Iono, Forest Seal Stone / Star Alchemy, Underworld Door, Wonder Tag, and Climactic Gate). Treat these as existing work to preserve and test, not missing features.
- At reviewed PR #69 head, the five remaining unsupported root Trainer names are **VS Seeker, Hisuian Heavy Ball, Night Stretcher, Float Stone, and Pokémon Ranger** (six physical cards). Their prompt-choice helpers do not make them playable at root.
- Wobbuffet appears in the source/lock resolver, but Lockbridge still lacks a Wobbuffet root-play decision and Temple of Sinnoh root-play decision.
- PR #69 does not read `itemPlayLocked`. The actor K1 projection also does not currently include the certified Prize multiset or a bounded known-Prized fact.

These are source-level capability findings, not proof that each card should be played in every game or that an omission causes a loss.

## One-release acceptance criteria

A successor release should not be admitted until **all** of the following are bound to the same immutable release:

1. **Exact deck/profile identity:** both original JSON lists and their printing-aware fingerprints; one shared policy code SHA; two immutable profile/configuration digests; no deck substitution.
2. **Complete root-action matrix:** for every Trainer and Pokémon in each exact 60, classify root action as supported, state-conditionally supported, deliberately declined, or unsupported. A later prompt helper does not count unless the root action is reachable.
3. **Prompt and effect receipts:** exercise the full search, multi-select, energy-payment, retreat, Stadium, Tool, Ability, attack, and recovery sequences with exact card printings, legal payment, correct count, both physical seats, and both turn-player orientations. Every selected action must bind to the native effect receipt.
4. **Actor-only K0/K1 contract:** the runner supplies only authenticated actor-owned derived knowledge; own-deck/Prize mutations invalidate epochs; only certified complete accounting may produce a known-Prized veto. K0/unknown/partial/stale states remain conservative.
5. **Deck-specific branches:** prove Ranger/VS Seeker and Item-lock behavior for Hood; prove Wobbuffet/Temple, self-lock timing, Stadium opportunity cost, Marshadow counterplay, and the non-Item Budew response for Lockbridge. Do not assume one profile's answer exists in the other.
6. **Strategy challenges:** freeze development and held-out state envelopes for Gate-first/lock-first, Underworld Door before Gate, Fairy Zone/Weakness breakpoints, Pale Moon-GX extra-Energy and retreat escape, Tool/Stadium suppression, Budew, Prize-recovery, and each deck's actual root Trainer choices. No synthetic test count is a game result.
7. **Native execution and independent review:** only after a separate authorization and accepted execution gates, run the actual frozen policy (not scripted helpers) through complete native games. Require resolved prompts, no engine errors, actor-only inputs, source-bound opponent policy, complete terminal/effect receipts, and independent strategy plus paper/clock review of the exact code/profile/game trace.
8. **No early competitive aggregate:** the current field is 29/32, 14/32 opponent modules exist but 0/14 have demonstrated full-game competence, and the natural-64 receipt validator remains unadmitted. No 99.5% or full-Top-32 claim follows until the 32 source lists and competent rank policies are admitted.

## Explicit non-goals and current stopline

- Do not edit PR #69 or PR #71, alter the current fixed 60s, add a card-specific micro-PR, or silently rebase a frozen scope.
- Do not create a new workflow, fixture, game batch, or native dispatch under the current Critic stopline.
- Do not treat contract tests, V8 shims, staged Store actions, source-list counts, or card-text deductions as full-game competence.
- Do not use a generic SimpleTacticsAi or another rank's policy as a competent substitute.
- Do not claim a 99.5% result.

**Decision requested:** Agent46 and the owner/Critic should accept, reject, or narrow this single release scope before any implementation begins. Until then, the current frozen candidate-policy state remains unchanged.

## Supporting evidence

- [Agent11 PR #69 exact-head review](../../aichi-2026/2026-11/agent11-candidate-policy-pr69-review-20261124.md)
- [Agent4 PR #69 root Trainer coverage audit](../../aichi-2026/2026-11/agent4-candidate-root-trainer-coverage-audit-20261125.md)
- [Agent4 Heavy Ball root reachability audit](../../aichi-2026/2026-11/agent4-candidate-heavy-ball-policy-reachability-20261125.md)
- [Agent43 owner-K1 capability gap](../../../communications/agent46/2026-11/20261125T1200Z_agent43-owner-k1-candidate-policy-gap.md) and [certified Prize projection gap](../../../communications/agent46/2026-11/20261125T1201Z_agent43-owner-k1-certified-prize-projection.md)
- [Agent21 Lockbridge scope and policy admission](../../aichi-2026/2026-11/agent21-lockbridge-scope-and-policy-admission-20261125.md)
- [Agent2 Budew/Ranger field-cost audit](../../aichi-2026/2026-11/agent2-lockbridge-budew-ranger-field-cost-20261125.md)
- [Agent31 Lockbridge Prize/tutor audit](../../aichi-2026/2026-11/agent31-lockbridge-prize-access-20261125.md)
- [Current fixed-60 and execution decision board](../../README.md)
