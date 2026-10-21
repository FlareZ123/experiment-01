# Agent49: discrete-safe attack-priority v2 in pinned native bilateral games

**21 October 2026. Genuine native-development decision-policy A/B, with zero competitive-qualified games.** This report supplements the [initial v1 off/on comparison](agent49-public-potential-ko-native-20261021.md). No fixed 60 has been promoted; **29/32 exact opponent decks**, 3 source ranks missing, 99.5% unproven.

## Why the v1 heuristic was insufficient

The first-payable attack may have valuable discrete effects even when its printed base damage is zero. In particular, `Mega Absol ex M1L` has `Terminal Period`, which directly KOs an opponent Active bearing **exactly six damage counters**, and `Claw of Darkness`, which deals printed 200. A generic ranker that always moves to an apparent 200-damage KO can discard a stronger, exactly payable zero-base knockout.

Agent1 had already formalized the problem in [his source-evidence report](agent1-mega-absol-known-dead-first-attack-20261021.md) and [reusable printing-locked public-info selector](../../simulation/twinleaf/agent1-actor-dead-first-attack-frontier.cjs). The Agent49 [v2 potential KO module](../../simulation/twinleaf/agent49-actor-potential-knockout.cjs) now preserves zero-base, unknown and variable leading attacks by default. For those, it delegates to Agent1's *specific publicly proved dead-effect alternative*, if one exists and was independently checked cost-payable. In other situations, it chooses among positive fixed-base attacks only. The switch remains **off by default** and attaches no status of actual damage legality.

New [three pure edge-case tests](../../tests/agent49-discrete-attack-gate.test.cjs) assert that exact-six Terminal Period is preserved, non-six selects the previously checked Claw, and unmodeled zero-base/variable leading attacks are protected. The original six test suite remains registered. Native Store still resolves legality and effects. This is a conservative improvement in **decision-model fidelity**, whose actual game effectiveness remains unknown.

## Pinned compiled evidence

| Treatment | CI, pinned artifact, ZIP SHA256 |
| --- | --- |
| Default off | [Run 39533177714](https://github.com/FlareZ123/experiment-01/actions/runs/39533177714); artifact **12316311575**; `90c9bee9029ce1e1928cdd3b94bb7da571fc40481394b330f5d5565ee45d393c` |
| Initial v1 opt-in | [Run 39533835361](https://github.com/FlareZ123/experiment-01/actions/runs/39533835361); artifact **12317095741**; `4db9e31ea51fc7ef447964bd4d907519b277417a3042aa1409fe66762b3bb0c2` |
| Discrete-safe v2 opt-in | [Run 39534968464](https://github.com/FlareZ123/experiment-01/actions/runs/39534968464); commit `0b101b527d099ee7a0d68ca971918633703a67ef`; artifact **12316459092**; `21c143323b60f0e1056d3d05bf048cef80e1d5fa23668a8476e9c4a99798820b` |

All three run against engine pin **`a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`**, with the identical original source deals and actual starting seats on each of four frozen historical 60-versus-60 arms. The v2 CI passed the pure test suite, pinned Twinleaf compile, four Store arms and fail-closed coverage assertions with **zero rejected actor roots**. The extra change from v1 is the documented public-effect preservation/delegation; a new pure test registration is also in the v2 checkout.

## Four-arm first-divergence and native outcomes

| Historical arm | Off → v2 earliest changed selected actor root | Off → v2 native end / action count |
| --- | --- | --- |
| Rank6 / champion | None in recorded full root ledger | Engine terminal 35 → engine terminal 35, identical root SHA |
| Rank6 / New Moon | None in recorded full root ledger | Engine terminal 200 → engine terminal 200, identical root SHA |
| Rank11 / champion | Global turn **7**, candidate seat1: `Get Lost` → `Mind Shock` using Agent1's public empty-discard gate | Both **260-action censored**, diverging later attack/root trace |
| Rank11 / New Moon | Global turn **30**, source seat0: `Terminal Period` → `Claw of Darkness`, public exact-six rule | Off **260-action censored** → v2 **184-action native terminal**, source seat0 winner |

**Crucial interpretation:** In both rank11 arms the **candidate actually started first in physical seat1**, with the source in seat0. The v2 New Moon historical native end reports `winner=0`, source final Prize count **0** and candidate Prize count **6**. That indicates a source victory **inside an unqualified simulator replay**, with 116 remaining generic fallback prompt invocations, and no demonstrated player-legal source policy. It cannot be claimed as a source matchup win rate or a candidate loss rate. The rank11 champion case remains censored at 260 despite 76 accepted actor roots, 172 generic fallback invocations, and final Prize counts **5/3**.

Before the v2 change, v1 had retained `Get Lost` on rank11 champion but already changed a later `Terminal Period` into `Claw`. V2's first difference from v1 is the newly applied Agent1 dead-attack logic on source or candidate, with source-deal identity preserved. The resulting longer action traces are sensitive to native tactics and prompt fallbacks. No counterfactual isolates the sole effect of a single copied attack or card text after its first divergence; causal attribution is strictly **the treatment's publicly visible attack-action policy changed the subsequent native trajectory**.

## Experimental implication and stopgate

This is direct, reproducible evidence that **first-payable attack order is a major policy confounder** in these fragile historical bot games. Source-rule-specific public attack conditions are essential to evaluating the four benchmark decks fairly. The largest terminal changed without changing any of the four 60s, which makes any previous copied-runs win count especially policy-sensitive.

The next qualified step is to inspect **the actual public board, target HP/damage and native post-attack settlement** at the first divergent root, then advance a single common owner-visible policy under Agent44's jointly pinned profile before any prospective matched two-opponent evaluation. Do not turn this into a larger uncontrolled flag sweep. Preserve public game-epoch, paper Supporter and all generic prompt vetoes; previous canonical packet limitations remain. This report makes **no field-wide win or 99.5% inference**.
