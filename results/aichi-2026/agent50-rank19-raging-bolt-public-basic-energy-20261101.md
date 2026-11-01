# Agent 50: rank-19 Raging Bolt public Basic-Energy attack threshold

**1 November 2026 | default-off actor-only policy development, zero competitive-qualified games.**

## Original opponent and exact attack

The independently published original Aichi Open League 2026 final rank-19 source (Mark Takahashi, Raging Bolt) has two **Raging Bolt ex TEF 123**, nine ordinary Basic Energy (three each Lightning, Fighting, Darkness), and four Double Dragon Energy ROS. These are the authentic original-source roster copies in [the 29-source archive](full-decklists.json), not a newly optimized list.

Printed Raging Bolt ex TEF attacks are:

- **Burst Roar**, Colorless: discard your hand and draw six; damage zero.
- **Bellowing Thunder**, Lightning + Fighting: optionally discard any amount of **Basic Energy from your Pokémon**, dealing 70 attack damage per Basic Energy card discarded.

Published printing: [Limitless TEF123](https://limitlesstcg.com/cards/en/TEF/123), independently echoed by [Pokémon's official Temporal Forces rendering](https://www.pokemon.com/uk/pokemon-tcg/pokemon-cards/series/sv05/196/).

The generic actor first-payable root in `simulation/twinleaf/agent34-actor-only-root-policy.cjs` chooses the first printed payable attack. For this printing that can choose the hand-reset setup action even when a public-board Basic-Energy discard reaches a nominal immediate knockout. This is a previously unqualified **policy-choice opportunity**, not an observed full-game source decision yet.

## New proposed decision boundary

[Public selector](../../simulation/twinleaf/agent50-raging-bolt-nominal-ko.cjs), [pure regressions](../../tests/agent50-raging-bolt-nominal-ko.test.cjs), and [two-seat staged native probe](../../tests/agent50-raging-bolt-nominal-ko.native.test.cjs).

The default-off option `ragingBoltNominalKoRoot:true` is installed into the existing owner root's attack-choice arbitration, without changing any fixed 60, source seed, previously frozen policy or vendor implementation.

The selector requires authenticated public owner observations, exact active printing `Raging Bolt ex TEF`, first payable attack Burst Roar and an independently payable Bellowing Thunder. It counts Basic Energy **cards** attached to every own public Active/Bench Pokémon, using the already built pinned-card catalog. It never counts Double Dragon Energy or other Special Energy toward 70-damage increments. With defender's public printed HP `H`, damage counters totaling `D`, and `B` exposed Basic Energy cards, it proposes Bellowing Thunder only if `B >= ceil((H-D)/70)` and positive HP remain.

The source-only heuristic deliberately makes **no** promise about an actual knockout. HP Tools, resistance, protection, damage modifiers, prompt settlement, correct payment card selection, depletion of future Energy, Bench tactical value and future draw from Burst Roar can all make a printed nominal threshold misleading. The genuine Store must validate the AttackAction and each discard prompt. The actor does not read opponent concealed hand, unknown deck cards or hidden Prize identities.

## Reproducible checks and gate status

- Seven source-level policy regressions passed via direct execution of fetched CommonJS modules in a JavaScript harness; an isolated injected-root check confirmed default Burst Roar, enabled Bellowing Thunder when affordable and nominally lethal, and no override when insufficient Energy was exposed. Those tests are **not** native Store behavior.
- The eighth regression exercises the real canonical actor root. First manual compiled-workflow attempt [41354066491](https://github.com/FlareZ123/experiment-01/actions/runs/41354066491) found an invalid test expectation: its purported two-Energy case had a **third Basic Energy on the Bench**, making an opponent with 210 remaining HP nominally payable. The fixture was corrected to 211 HP at commit `e99a3ea4b47defdde31c3d7a5c242ac93928523a`. No production policy adjustment was justified by that failure.
- The second manual compiled-workflow attempt [41354238414](https://github.com/FlareZ123/experiment-01/actions/runs/41354238414) **succeeded** with all **303/303** initial source-level regressions passing. Its two new staged native scenarios each selected the correct root and returned an owner-owned native `WaitPrompt` after the genuine `AttackAction`. At that first unconsumed wait, opponent damage remained 90 and no Basic Energy was discarded, so this establishes attack acceptance and initial prompt ownership only. A further manually dispatched [Wait-chain trace](../../tests/agent50-raging-bolt-nominal-ko.native.test.cjs) follows the initial native prompt sequence. The separately registered staged native test is a conditional genuine Store board in both physical seats, with owner Raging Bolt's Lightning/Fighting attached, an extra Basic Darkness on own Sandy Shocks ex Bench, and opposing Iron Thorns ex (230 HP, 90 damage). It records the actual first prompt after the proposed Bellowing Thunder; it does **not** itself certify discards, damage or Prize taking.

## Implications

This exposes a generalizable policy-design issue: a single printed first-attack preference can suppress a plausible high-impact variable-damage line. The two-sided rank-11 known-dead attack experiment has already demonstrated that attack-choice quality can reverse native engine winner labels; it gives a reason to test new fields, **not** a basis for transferring its numerical outcomes to rank 19.

Next validation is a genuine same-prompt, owner-private-safe Basic-Energy discard receipt and native damage settlement, followed by preregistered unchanged-deck, two-seat rank-19 source-deal trials if the prompt boundary is sound. Neither a conditional staged board nor a future unqualified native terminal measures tournament win strength. The collective gate stays **29/32 authenticated exact source 60s, 0 competitively qualified games, no demonstrated 99.5% target**.
