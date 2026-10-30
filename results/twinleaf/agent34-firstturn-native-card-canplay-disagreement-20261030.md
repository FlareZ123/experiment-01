# Native first-player Supporter legality: 11 card.canPlay positives rejected by Store

**Agent 34 | 30 October 2026 | compiled original source-dealt negative test | no competitive games**

## Question

Can a shared owner-visible action chooser treat a positive individual printed `card.canPlay(null,state,owner)` as sufficient legality evidence for ordinary Supporters on the first player's opening turn? The paper rule prohibits ordinary first-player first-turn Supporters; printed exceptions such as **Carmine TWM** must still work. The optional independent pre-dispatch research guard in [the earlier scoped report](agent34-first-player-supporter-pre-dispatch-gate-20261030.md) was intended to protect this boundary, while the actual native Store behavior was initially unknown.

## Exact natural source inputs and adversarial proposal

The original pinned Twinleaf engine revision is `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`, under `EXPANDED_SOURCE_PROFILE`. I reused the **unchanged actual published rank 1 Shadow Rider 60 and rank 11 Absol/Garbodor 60**, plus Agent 48's fully predeclared **24 identical seeds `2026102901` to `2026102924`** and maximum 48 actions. The actual first owner's authentic hand and visible board were extracted from the Store; no card was injected, rearranged, or drawn from the unseen deck. An adversarial research wrapper selected the **first held ordinary Supporter** (excluding Carmine) at the real global first-turn root and proposed a physical native `PlayCardAction` despite the paper prohibition. In a paired replay of the same exact physical deal, the new default-OFF paper guard intercepted that exact card before native dispatch.

The adversarial proposal deliberately tests engine enforcement when a malformed action is supplied. It is never a recommended game action. A third unmodified original-bot control confirms initial source owner-hand equality. Every seeded attempt, including two with no ordinary Supporter held at that root, is retained.

## Compiled observed result

**[GitHub Actions 41005754778](https://github.com/FlareZ123/experiment-01/actions/runs/41005754778)**, head `fbc9d26c1a22e56002aef8c62d4b49508c72101e`, successfully executed both focused native test steps. The native experiment artifact `agent34-firstturn-ordinary-native-source`, ID **12954474541**, ZIP SHA-256 `93d5065f972f3397df5209a9cc221e5f1a2bc38824908fbdebcf08c2cc9b1e6b` preserves all 24 source deals. The separate positive/negative Carmine control artifact `agent34-native-firstturn-supporter-allowdeny`, ID **12955905066**, ZIP SHA-256 `28c25021ae65623ddb79921503f0628a45bd18c4151ca34629c41beafb4c03c2`, preserves all 24 original deals and four matched printed-exception branches.

| Directly observed metric | Result |
| --- | ---: |
| Source-dealt physical seeds | **24** |
| Ordinary Supporter physically held by actual first owner | **22** |
| `card.canPlay(null,state,owner) === true` among those ordinary proposals | **11** |
| `card.canPlay(null,state,owner) === false` | **11** |
| Ordinary first-turn direct `PlayCardAction` accepted by native Store | **0** |
| Native Store refused, `CANNOT_PLAY_THIS_CARD` | **22** |
| Reversible pre-dispatch research guard refused | **22** |
| Exact same-source Carmine printed exception accepted by native Store | **4 of 4 eligible** |
| Same Carmine exception allowed through research guard's explicit callback | **4** |
| Same Carmine exception rejected when callback deliberately refused it | **4** |
| Competitively qualified games | **0** |

The seven printed ordinary Supporter families selected on these hands were Lillie's Determination (7), Acerola (4), Raihan (4), Teammates (3), Guzma (2), Tulip (1), and Iono (1). The actual first owner was physical **seat 0 in all 24 sampled first-turn source deals**; no opposite-seat certification follows. The existing original-bot source games had no error across 24 control seeds.

The most important direct result is the **11/22 discrepancy between a card-level positive `canPlay` and the actual native Store's rejection**. The Store correctly enforced the broader first-player timing rule in all observed cases. This is **not evidence of a current native first-turn illegality defect**. It is evidence that the decision-policy interface must check player-wide timing, card-specific restrictions, and the Store's accepted action separately.

## Action for the shared chooser

For Agent 41's integrated both-actor chooser, classify a held Supporter with `canPlay=true` as at most a card-level candidate. An ordinary first-player global-turn-one Supporter should never become an autonomous legal offer. The printed exception must be explicitly identified from its real card text, and native dispatch still has to settle. Avoid taking `canPlay(null)` alone as paper permission; for 11 source-real ordinary opening opportunities it was positive while the Store rightly rejected the action. The optional pre-dispatch paper guard can remain a regression/fail-closed facility, but it is **redundant against the native first-turn rule for the 22 tested ordinary proposals** and is OFF by default.

Run evidence is a bounded rules mechanism audit with forced prohibited actions. It provides **no game winners or candidate ranking**. No decision is made about playing Carmine when other valuable cards would be discarded. The complete 29/32 field authentication and all-matchup policy qualification gaps remain unresolved, and the 99.5% target remains unproven.

## Reproduction

- `simulation/twinleaf/agent34-firstturn-ordinary-source-native.cjs`, exports `withOrdinaryFirstTurnProposal` and `runAudit`
- `simulation/twinleaf/agent34-native-firstturn-supporter-guard.cjs`, matched printed-exception allow/deny
- Existing manual workflow `.github/workflows/aichi-lock-board-tests.yml`, opt-in `agent48_carmine_first_native=true`
- Core first-turn wrapper `simulation/twinleaf/agent48-firstturn-carmine-native-probe.cjs`; inherited original fixed source seeding and source identity
