# Agent 7: conditional printed attack choice, genuine pinned Store settlement

**21 October 2026 UTC.** Evidence type: default-off actor-visible common-root policy integration plus controlled native attack-resolution proof. **No complete-game performance, no competitive-qualified games, and no deck recommendation follows.**

## Research question

The shared `chooseActorRootIntent` in `simulation/twinleaf/agent34-actor-only-root-policy.cjs` originally picked the first numerically cost-payable printed attack. In a publicly observable board position, that can be a strategically empty choice: Mega Absol ex M1L's first printed `Terminal Period` has no knockout effect unless the opposing Active has **exactly 60 damage**; its payable `Claw of Darkness` can instead deal printed 200 damage. Girafarig LOT's first `Get Lost` similarly has no target when the opposing public discard pile is empty and `Mind Shock` is funded.

The exact-printing, public-only proof function already existed in Agent 1's [known-dead attack frontier](../../simulation/twinleaf/agent1-actor-dead-first-attack-frontier.cjs). This result **integrates that existing function** into the same canonical root, rather than adding an independent competing bot.

## Implementation and qualification boundary

- Root implementation: [agent34-actor-only-root-policy.cjs](../../simulation/twinleaf/agent34-actor-only-root-policy.cjs). New `knownDeadAttackRoot` option is **off by default**; explicit opt-in is `AGENT7_KNOWN_DEAD_ATTACK_ROOT_DEV=true`. It receives the same detached `actorObservation` and the existing `payable` attacks after printed numeric Energy-cost and known public restriction screening. In the documented conditional case it selects an alternative only when that alternative is already in the payable array. No owner deck/Prize identities or opponent hidden cards are passed to the selector.
- Regression: [agent7-known-dead-attack-root.test.cjs](../../tests/agent7-known-dead-attack-root.test.cjs) covers default parity, known-dead opt-in, exact-six preservation, unpayable alternative, wrong printing, empty discard Girafarig, concealed hand invariance, and blocked second attack. These passed in the existing canonical manually dispatched [CI run 39533608310](https://github.com/FlareZ123/experiment-01/actions/runs/39533608310), source head `cd207104e6941e45477694e8140196a674f6d7d4`. That run also compiled pinned Twinleaf and passed four historical bilateral actor audits, but those are unqualified.
- Native physical fixture: [agent7-known-dead-attack-native.cjs](../../simulation/twinleaf/agent7-known-dead-attack-native.cjs), run through the existing manual `agent7-canonical-actor-bilateral.yml` only when `native_known_dead_attack_gate=true`. Engine gitlink `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05` (Twinleaf), Node 22, no vendor changes.
- **Successful compiled native [run 39535590131](https://github.com/FlareZ123/experiment-01/actions/runs/39535590131)**; exact test checkout head `e566c7e4b4c30df4f83fbcf687680953a915e1ac`. Native paired gate, pure tests, vendor compilation, canonical four-arm historical runner and actor-audit fail-closed step all passed. [Unmodified full CI artifact 12317735382](https://github.com/FlareZ123/experiment-01/actions/runs/39535590131/artifacts/12317735382); ZIP SHA256 `e2b776b9f4955a36755112ac31d9451357b62b8a49870b7bb3de35a3a6f2c408`.

## Pinned native Store experiment

Construct four independent **injected turn-three** positions with the exact source printing `Mega Absol ex M1L`, three attached physical `Darkness Energy SVE` cards, an opposing Active `Shadow Rider Calyrex V CRE` (210 printed HP), and `Tapu Lele-GX GRI` on the defender's Bench. Each player starts with six physical Prize cards. No winner or legally reachable 60-card starting state is asserted. The **initial board SHA256 is asserted equal** between off/on pairs, and all actor intentions are chosen by the actual shared pure common-root function from a detached native `actorObservation`.

Each choice is passed to the **real compiled Store** as an `AttackAction`. The fixture resolves all genuine `WaitPrompt`, `ChoosePrizePrompt` and `ChoosePokemonPrompt` steps and counts remaining **nonempty Prize slots** rather than the fixed number of physical Prize containers.

| Opponent prior damage | Flag | Native attack | Prize cards taken | Defender Active after resolution |
| --- | --- | --- | ---: | --- |
| 10 | off | Terminal Period | 0 | Shadow Rider Calyrex V |
| 10 | on | Claw of Darkness | 2 | Tapu Lele-GX |
| 60 | off | Terminal Period | 2 | Tapu Lele-GX |
| 60 | on | Terminal Period | 2 | Tapu Lele-GX |

At prior 10 damage, the defender's remaining 200 HP is within Claw's 200 printed damage; the Terminal condition is publicly false. At 60 damage, Terminal's exact-six-counter KO applies, so both paths preserve it. All four native actions were accepted, the deferred prompts were closed, and the expected **`[0,2,2,2]`** Prize result was asserted in CI.

### Negative diagnostics preserved

The native fixture initially compared `player.prizes.length`, which remains 6 after Prize selection because each empty `CardList` slot persists, leading to a false failure despite knockout and promotion. Another initial check stopped before the mandatory `WaitPrompt` and `ChoosePrizePrompt` settlement. Both mistakes were corrected and their failed CI traces remain recoverable:

- [39534161114](https://github.com/FlareZ123/experiment-01/actions/runs/39534161114): premature Prize assertion, prompts outstanding.
- [39534446928](https://github.com/FlareZ123/experiment-01/actions/runs/39534446928): `WaitPrompt` and `ChoosePrizePrompt` observed; incorrect direct Prize-slot length.
- [39534931248](https://github.com/FlareZ123/experiment-01/actions/runs/39534931248): native Wait closed; subsequent ChoosePrize revealed.
- [39535262203](https://github.com/FlareZ123/experiment-01/actions/runs/39535262203): complete genuine Wait, Prize and promotion settlement; false zero count due empty containers.

## Integrated-policy relationship and unresolved questions

Agent 49's [native four-arm potential-KO ablation](agent49-public-potential-ko-native-20261021.md) already observes actual rank-11 source-side Terminal → Claw divergences on historical original physical deals, showing this interaction is strategically exposed in the common test surface. Its later `potentialKoRoot` **v2** also delegates to the same Agent1 known-dead proof for zero/non-numeric first attacks. The new `knownDeadAttackRoot` flag supplies a narrower independent causal ablation and **must not be counted as a second independent policy success**. Agent49 and joint caretaker Agent44 have been notified to consolidate options when freezing a single policy profile.

Native damage and Prize-card settlement are demonstrated on injected boards; the test does **not** establish that a complete candidate or source game used this option profitably, that every attack cost and lock is fully modeled, or that the policy satisfies opponent-hidden-information constraints along every delegated prompt. The synthetic fixture lacks natural setup and qualified opposing turns. The four historical native regression arms remain retrospective, partly capped and unqualified. **Field status remains 29/32 exact opponent 60s, zero competitive-qualified games, and no validated fixed deck at the 99.5% target.**
