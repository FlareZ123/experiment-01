# Source-first rank-10 Regidrago: three real Apex copies limited to Regidrago V's Dragon Laser

**Agent 20, 18 October 2026.** Source-based, single-deal negative tactical study. An actual Store observer now establishes the copied attack choices, source printing identities, public damage and Prize consequences of the prior [two-action DDE→Guzma fork](dde-root133-guzma-bridge-negative.md). The diagnostic's original actor-selection bug was fixed after inspecting the pinned `AttackAction.clientId` constructor. A one-action mock/clone exclusion and `ChooseAttackPrompt` resolution regression is compiled and passing.

## Sources, scope and exact reproducibility

- Published Aichi Top-32 **rank 1 Shadow Rider Calyrex** seat 0 versus **rank 10 Regidrago VSTAR** seat 1, unchanged printed [field 60s](../aichi-2026/full-decklists.json). Seed `4246551499`, rank10 actually takes the first turn.
- Pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`, simplified DDE v4 research adapter. One actual Store root133 DDE fork attaches to two-Grass Regidrago VSTAR, then one actually in-hand unused Guzma promotes it. Both interventions are bounded to the one observed source decision window.
- [Read-only Apex source observer](../../simulation/twinleaf/dde-root133-apex-copy-audit.cjs) captures only *real* `Store.dispatch` calls, and logs actual `ChooseAttackPrompt` options and `ResolvePromptAction` attack object identities. [Mock regression](../../tests/dde-root133-apex-copy-audit.test.cjs) asserts live `AttackAction.clientId` discrimination, source Store identity, copied attack selection and dispatcher restoration.
- **Compiled full manual [CI 39094999965](https://github.com/FlareZ123/experiment-01/actions/runs/39094999965)** passed all steps and regression, at head `a9c44475f6b51c9545a4c1f182665e5d75106679`. Archived original per-action JSON: [Apex choice artifact 12124098235](https://github.com/FlareZ123/experiment-01/actions/runs/39094999965/artifacts/12124098235), archive digest `sha256:b6c1bf22888f3fa913dad29fe17c29039ff9926f1bf4913e5de6ff0bdf945a0e`.
- Source-control observable digest unchanged both before and after observer `fa9c8c213beefb3164f24add23f0ca8eebe95431347d23ab872a78df8ef4f019`; source fork digest `66903ab886f2040605dbfe2bc6a5ff8ac19f563b005f21bac501f7907fe5f0a1` matches the earlier audited two-action fork. Observer is read-only; digest agreement is an observation rather than a proof of complete Store graph equivalence.

## What the actual Apex copy prompt contained

At **all three** real Regidrago VSTAR `Apex Dragon` attack declarations, the *only* Dragon Pokémon in Regidrago's discard was **Regidrago V SIT**. Its two available attacks were:

| Source printing | Copied-attack option | Printed base damage |
| --- | --- | --- |
| Regidrago V SIT | Celestial Roar | 0; Energy-acceleration effect |
| Regidrago V SIT | **Dragon Laser** | **130**, plus a 30-damage Bench hit |

The simple-bot `ChooseAttackPromptResolver` selected **Dragon Laser** on all three turns. The pinned resolver sorts primarily by printed damage, with printed Energy cost length as tie-breaker. Here its choice is unsurprising: no stronger attack payload was present in the discard. Source-card access was the fundamental restriction, even with Apex made legal to announce.

Regidrago VSTAR held **Muscle Band XY**, contributing **+20 damage** to the opponent's Active, consistent with the witnessed **150** Active damage when copying the 130-base Dragon Laser. This Tool and its effect were visible in the actual public board. The attack also sends 30 damage to a Bench target when one is eligible.

## Exact source turn progression

| Global turn, Regidrago going first | Opponent Active before attack | Chosen actual copied attack | Opponent Active / Prize result by end of turn |
| --- | --- | --- | --- |
| **27** | Marshadow UNB at 0 damage | Regidrago V's **Dragon Laser** | Marshadow knocked out, rank10 takes **one Prize** (remaining Prizes [6,5]); opposing new Active Latias ex SSP at 30 damage |
| **29** | Shadow Rider Calyrex VMAX CRE at 0 damage | **Dragon Laser** | VMAX has **150 damage**, no additional Prizes ([6,5]) |
| **31** | Shadow Rider Calyrex VMAX CRE at 150 damage | **Dragon Laser** | VMAX has **300 damage**, no additional Prizes ([6,5]) |

The pinned Shadow Rider Calyrex VMAX has **320 HP**, so 300 accumulated damage leaves **20 HP**. The two late attacks failed to Knock Out this three-Prize target despite an otherwise correct-looking 2HKO attempt. No alternative higher-output Dragon-copy payload existed in the discard in any of these three decision states.

## What this establishes

The original unchanged branch with DDE attached Active Koraidon finished with rank1 win and Prizes **[0,3]**, while the two-action DDE→Guzma→Apex branch finished rank1 win **[0,5]**. This observer narrows the explanation: the Apex branch had only a low-ceiling copy menu in its actual discard pile. An abstract score for Energy sufficiency, access to VSTAR Active, or number of Apex declarations would reward the wrong branch in this source deal. A payload-sensitive model must evaluate the *publicly available discard Dragon moves*, chosen target HP, extra Bench damage and likely opponent responses before spending both Energy and a Supporter.

The original generic bot and its opponent remain unqualified decision policies. The source branch is a controlled, hypothesis-generating one-seed replay, **not** a competitive sample, real paper-win percentage, stronger 60-card nomination, or evidence that a different Dragon printing should simply be added. It is not yet established whether a realistically executable alternative line could discard a stronger Dragon at this source position without sacrificing the Guzma connector or another critical action.

**Next falsifiable task:** inspect the source root133 hand/search options and the effect of each line on *which Dragon copy payload reaches discard*, while accounting for simultaneous Supporter contention, Sky Field Bench constraints, opposing VMAX HP, and actual paper Expanded legality. Look for a legal higher-damage or strategic copied-attack alternative, and compare the full resulting game, rather than forcing nonexistent prompt options or adding phantom discard cards. Full benchmark remains **29/32 registered 60s and zero independently qualified competitive games**.
