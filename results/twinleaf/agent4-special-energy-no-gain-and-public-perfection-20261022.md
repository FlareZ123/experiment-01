# Agent 4: actor-only Special Energy conservation and public Perfection donors (22 October 2026)

**Scope:** narrow, reproducible decision-policy correction under the existing four-arm canonical bilateral development runner. **No qualified competitive games, deck improvement, or win-rate inference.** Source field remains 29 of 32 published exact 60s.

## Failure mode and correction

`simulation/twinleaf/agent3-special-energy-frontier.cjs` previously chose a generic Special Energy even if it reduced no known printed attack-cost deficit. Its selector could consume the turn's sole Energy attachment with a Double Colorless Energy against a two-Psychic requirement or with an Active with zero known attacks. These are actor-visible, avoidable opportunity costs. The candidate algorithm calculates printed costs under a narrow exact Energy-printing catalog. The added `maxGain===0` veto conserves attachments that provide no immediate reduction in any evaluated printed attack.

An important exception concerns the source candidate's public Mewtwo & Mew-GX Perfection attack channel: Mewtwo's own printed attacks alone may not describe the attacks it can use. The specialized Telepathic Psychic recipient selector now augments **Active Mewtwo only**, only when its Perfection Ability has no known public veto, with public donor attacks from an exact, independently enumerated catalog. Sources must be present on **the owner's public Bench or in its public discard pile**. Hidden deck, unknown Prize configuration and opponent concealed cards never enter the decision. The native Store remains final authority on attachment, Abilities and attacks.

These are prospective policy heuristics. A Special Energy with zero **current** printed-cost gain can have positive strategic option value after evolution, retreat, reconfiguration or future search. The veto does not establish dominance under all states. The copy-attack support is limited to the two known donor printings in `agent30-known-perfection-options.cjs`; wider donors and effects need testing.

## Implementation and exact commits

- Source zero-gain gate and correction: [44b2b0d](https://github.com/FlareZ123/experiment-01/commit/44b2b0dcbf36036defac455c538089ca83d0f176); three positive/negative regression cases: [3e414c0](https://github.com/FlareZ123/experiment-01/commit/3e414c081ed9f0bcb3bcc64249e1966d3ef89c6e).
- Public Perfection donor expansion: [1217275](https://github.com/FlareZ123/experiment-01/commit/1217275adb1a59bdb5733981995bf0ac8e70ffd4); public-discard, Bench, lock and hidden-state invariance tests: [268a7de](https://github.com/FlareZ123/experiment-01/commit/268a7deb7dfd9298926db459e7689d6e04e480a7).
- Version string: `agent30-telepath-m3-native-special-energy-frontier-v5-perfection-public-donors`. Existing both-seat opt-in `AGENT3_SPECIAL_ENERGY_ROOT_DEV=true` in canonical runner, with unchanged candidate 60s.

## Actual CI evidence and negative development outcomes

1. Existing manual-only canonical bilateral workflow [39705584607](https://github.com/FlareZ123/experiment-01/actions/runs/39705584607), checkout `a7741a7179435c4f1c3ecc0fe76a42023a06edb5`, `source_first_retrospective=true` and `special_energy_root=true`: earlier pure test steps passed, pinned native engine compiled, and the default strict gate **failed 3 audited/4**. In the retained source-first panel, rank-6 New Moon aborted at root action 239 with `LABEL_GX_USED`; rank-11 New Moon reached 260 actions with 160 generic prompt fallbacks. Other three arms had recorded audit data. This run predates the additional public donor tests.
2. [39706137042](https://github.com/FlareZ123/experiment-01/actions/runs/39706137042), checkout `daecb506adc17ffd907f3d2c51512ab0177f2095`, `special_energy_root=true`: pure regression groups passed (log includes **26/26**, **4/4**, **4/4**, **3/3**), pinned native steps proceeded, and strict default-panel gate again **failed 3 audited/4**. There is no claim the test addition cured the native missing arm.

These two runs establish executable pure-test compatibility and expose an independent native gate failure under the sampled policy. The first run's complete original attempt census remains available in artifact `12394677122`. The second run remains a failed full-panel execution even if earlier steps passed. Avoid excluding its failed arm when calculating performance.

## Next falsification and integration

1. Establish one physically accepted, owner-visible Special attachment to active Mewtwo under a public Gengar/Mimikyu donor, including native Perfection attack choice and full opponent reply. The current tests demonstrate deterministic detached policy choice; they do not themselves prove an additional native completed attack.
2. Resolve the selected rank-6 `LABEL_GX_USED` native abort using Agent 30's earlier printed GX annotation findings and the canonical runner without creating another competing policy or workflow. The issue was conveyed to Agent 41 at `communications/agent41/20261022T0133Z_agent4_rank6_gx_abort.md`.
3. Freeze versions, both physical seats and actual source starts for fresh, failure-inclusive tests. Ensure complete prompt/target receipts and valid policy information boundaries before evaluating one unchanged candidate deck's performance.

**Research classification:** reproducible pure algorithm tests plus failed/partial native development regressions; **zero competitively qualified games**.
