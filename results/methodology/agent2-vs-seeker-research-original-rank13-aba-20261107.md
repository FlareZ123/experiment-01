# Agent2: VS Seeker → Professor's Research owner-only root, genuine-original reachability

**7 November 2026. Status: default-off developmental route, successfully tested and native no-activation. No matchup-efficacy estimate.**

## Why this path was studied

A [source census](agent2-original29-trainer-demand-policy-priority-20261107.md) found VS Seeker in 23 of 29 authenticated Aichi 2026 original opposing sixties (59 listed copies). The stronger existing native owner-safe path `agent48-owner-vs-seeker-lillie.cjs` targets Lillie's Determination. A restricted proposed next test involved **VS Seeker PHF** retrieving **Professor's Research JTG**. Four authenticated original Regidrago lists (ranks 10,13,14,21) contain both printed names. The root was limited to a **sole VS Seeker in hand** and **Research already in the owner's public discard**, at least seven owner deck cards remaining, a genuine owner Active, unused Supporter quota and no visible Item/Supporter lock. After exact own-discard prompt recovery, only a sole Research hand is offered to native Store. This is a deliberately conservative reachable *candidate action*, not a generic Trainer-choice replacement or a recommendation to add a card.

## Registration and code

Original preregistration: [12-arm A/B/A](registrations/agent2-vs-seeker-research-original-rank13-aba-20261107.md); follow-up preregistration: [strict physical draw observer](registrations/agent2-rank13-research-physical-draw-replay-20261107.md). Source input: `results/aichi-2026/full-decklists.json`, exact original rank13 Regidrago and exact original rank3 Snorlax Stall, no swapped cards; engine pin `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.

Implementation:
- `simulation/twinleaf/agent2-owner-vs-seeker-research-root.cjs`: detached owner-only typed choice, default OFF.
- `simulation/twinleaf/agent34-actor-only-root-policy.cjs`: explicit opt-in `seekerResearchRoot:true`, authentic native `PlayCardAction`, existing generic own-discard ChooseCardsPrompt physical response, native Store acceptance counters. Existing Lillie path unchanged.
- `simulation/twinleaf/agent5-owner-root-slice.cjs`: physical played Item/Supporter and spent-Supporter quota observer.
- `simulation/twinleaf/agent2-professor-research-physical-draw-witness.cjs`: trusted opaque object-reference custody of seven cards from the owner's own deck, physical Research in public spent zone and once-per-turn quota. Hidden deck identities never enter the decision policy or serializable output.
- `simulation/twinleaf/agent2-professor-research-native-settlement.cjs`: reversible real-Store dispatch observer for an actor-typed Research root, including delayed completion.
- `simulation/evaluation/agent2-vs-seeker-research-original-rank13-aba.cjs`: 12 predetermined native attempts with error-inclusive A/B/A comparison.

## Evidence and result

The pure root/prompt fixtures and an isolated controlled Store full three-step sequence passed CI [42412331750](https://github.com/FlareZ123/experiment-01/actions/runs/42412331750). Physical card-identity, delayed prompt and false identical-printing draw cases passed the subsequent pure tests in [42413129102](https://github.com/FlareZ123/experiment-01/actions/runs/42413129102), which also compiled and ran the real pinned native engine.

The registered genuine-original native run [42413129102](https://github.com/FlareZ123/experiment-01/actions/runs/42413129102) ran **12 attempts**: exactly seeds **290134** and **290135**, rank13 candidate on **both physical seats**, each precommitted **control/treatment/control-repeat**. These are **four seed/seat scenarios**, each replayed three times, not 12 independent competitive trials.

- Both original printed 60s were unchanged. **4/4** scenario groups had identical full two-player physical deals in A/B/A, with source-deal identity aligned.
- **4/4** control repeats returned identical complete native root-action ledgers and recorded native terminal status/outcome.
- The B-treatment policy selected **zero** `play-seeker-get-research` Item roots, **zero** `play-seeker-recovered-research` Supporter roots, **zero** associated actual native own-discard prompt resolutions, and **zero** independently certified exact seven-card Research draw settlements.
- All twelve native rows reported `engine-terminal` in the runner, which is a raw engine outcome classification. No complete game was separately reviewed for Japanese Extra paper legality, paper clock, competent response or original-source attack/Prize timing.
- The initial [42412626469](https://github.com/FlareZ123/experiment-01/actions/runs/42412626469) run had passed its native job but failed pure source tests because the latter imported an uncompiled native card module. The import was deferred and the pure source test now reads original 60 names/counts; the **corrected 42413129102** run had both jobs green.
- Native stdout artifact [13590232819](https://github.com/FlareZ123/experiment-01/actions/runs/42413129102/artifacts/13590232819), zipped SHA256 `14090b568b344cdd566a279456f0f934abfc6e5d5047ef04ed25fdbc8bec7a84`.

**Interpretation:** This is a **positive no-impact replay control** and **zero observed treatment reachability in four original cases**. It provides no evidence the search→Research action helps or hurts outcomes. Green pure physical-witness tests do not substitute for a native event that never occurred. Widening the singleton-hand gate without comparative evidence risks discarding important strategic resources and would need separate preregistration. A complete whole-policy owner-safe vertical slice has greater priority than iterating this card-specific component.

**Collective status:** 29/32 original decks authenticated, missing ranks23/25/28, **zero competitively qualified paper games**, no chosen fixed 60 and no demonstrated 99.5% field win rate.
