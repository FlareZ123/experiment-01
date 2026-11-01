# Agent 31: forced-destination Guzma nominal KO as an owner-root Supporter alternative

**1 November 2026 | Agent 31 | Development-only, default OFF.**

## Question

Recent genuine paired native rank-11 results observed 322 owner-turn first roots holding Guzma over 16 games, and zero accepted Supporter roots of any printing. The existing Guzma mobility selector is deliberately narrow: it only acts when the current Active has no payable attack and a Benched Pokémon has a better future Energy path. Can a source-agnostic, owner-information-only policy expose a *presently payable* gust-plus-attack line without assuming an uncertain native Pokémon-choice prompt or spending the Supporter indiscriminately?

## Implementation

- [Source selector](../../simulation/twinleaf/agent31-forced-guzma-ko-frontier.cjs) exports `chooseForcedGuzmaNominalKo` and a fixed-version identifier.
- [Regression tests](../../tests/agent31-forced-guzma-ko-frontier.test.cjs) cover positive root intent, both forced destinations, ordinary direct-KO abstention, held Guzma versus Guzma & Hala, prior Supporter usage, first-global-turn prohibition, Eviolite mitigation, unfamiliar target Tools, attached Basic Energy payability, Special Conditions, missing Bench targets, public locks, and independence from opponent concealed-hand data.
- [Canonical actor-only root](../../simulation/twinleaf/agent34-actor-only-root-policy.cjs) recognizes `AGENT31_GUZMA_FORCED_KO_DEV=true` (or explicit injected `forcedGuzmaNominalKo:true`), disabled by default. The owner-visible proposal is evaluated before the normal payable attack's first-return choice. The typed native Guzma root uses the already established `PlayCardAction` Supporter target shape.
- The existing [manual Agent43 pinned-native workflow](../../.github/workflows/agent43-guzma-recipient-native.yml) includes these tests after pinned Twinleaf compilation. The existing native Guzma prompt tests provide separate background proof that legal recipient choices can settle on the pinned engine; our new policy's live matched turn and full outcome remain to be demonstrated.

## Bounded positive case

The owner has exactly one Bench Pokémon with a currently payable, positive, fixed printed attack; the opponent also has exactly one Bench Pokémon, in nominal knockout range. The owner holds exactly identified `Guzma`, has an unspent Supporter, is beyond the first global turn, and has no visible global Supporter/attack lock. Both effects of Guzma will offer only one Bench destination each, so the root proposer does not need to guess prompt target ordering. The selector declines when the present owner Active can already nominally KO the opposing Active.

Eviolite attached to the public targeted Pokémon is debited by 20 even where it could be inactive; any different visible Tool makes the policy abstain. Attacks with varying damage, textual effects, GX marker or non-Basic Energy payability are excluded. This limits false nominal-KO positives at the cost of suppressing useful opportunities.

**Critical limit:** Even a positive proposal cannot certify actual native Store `Guzma` acceptance, simultaneous target selection, exact damage, opponent response, paper legality, tactical optimality or match win. Damage prevention, type Weakness/Resistance, additional counters, Tool suppression, other Abilities and owner hand opportunity cost are outside the selector. In particular, a nominal KO obtained by gust can be tactically inferior to using another Supporter or attacking the current Active. No new game wins or win-rate estimates are claimed.

## Verification and remaining steps

Local isolated Node tests using behavioral copies of the existing Basic-energy and public-attack helpers passed **7/7 preliminary cases** before pushing. The authoritative cross-module tests and original pinned version require the manually dispatched GitHub Actions result. [Manual workflow run 41349875401](https://github.com/FlareZ123/experiment-01/actions/runs/41349875401) was dispatched after commit; inspect its terminal result before promoting even the pure regression status.

Highest-value next test: a both-seat, genuine pinned Store staged scenario with real Guzma hand consumption, two native single-recipient prompts, actual powered attack, actual KO/Prize and post-prompt Store acceptance; then an unchanged-source matched game-pair screen that counts positive opportunities and reports all failures/aborts/caps. A fresh preregistered sample could only follow confirmation that the trigger is reachable and not dominated by other first-return lines.

**Status:** 29/32 exact original opponent 60s; zero competitively qualified games; no demonstrated 99.5% fixed-60 result.
