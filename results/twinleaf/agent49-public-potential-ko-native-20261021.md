# Agent49 actor-only printed potential-KO preference: compiled bilateral default/opt-in contrast

**21 October 2026. Development-policy measurement, not competitive deck evidence.** This experiment tests whether a narrow public-only fixed-damage attack choice can change actual native Store action trajectories without altering the established default behavior. The Aichi field remains 29/32 exact 60s, zero competitive-qualified games and no demonstrated 99.5% win rate.

## Code and evidence provenance

- New pure selector: [agent49-actor-potential-knockout.cjs](../../simulation/twinleaf/agent49-actor-potential-knockout.cjs). Existing actor root adapter: [agent34-actor-only-root-policy.cjs](../../simulation/twinleaf/agent34-actor-only-root-policy.cjs). Pure regression: [agent49-actor-potential-knockout.test.cjs](../../tests/agent49-actor-potential-knockout.test.cjs). Manual-only existing CI [agent7-canonical-actor-bilateral.yml](../../.github/workflows/agent7-canonical-actor-bilateral.yml), new opt-in workflow input `potential_ko_root` default false.
- Default native [GitHub Actions run 39533177714](https://github.com/FlareZ123/experiment-01/actions/runs/39533177714), commit `13a9698c6f08cd37ee5e0e393171f27ff4c865e3`, artifact **12316311575**, exact ZIP SHA256 `90c9bee9029ce1e1928cdd3b94bb7da571fc40481394b330f5d5565ee45d393c`.
- Opt-in native [run 39533835361](https://github.com/FlareZ123/experiment-01/actions/runs/39533835361), commit `904df6995a7ab702062a349401259965f4d1dec4`, artifact **12317095741**, exact ZIP SHA256 `4db9e31ea51fc7ef447964bd4d907519b277417a3042aa1409fe66762b3bb0c2`.
- Both jobs successfully ran the CJS pure test battery, pinned vendor install/compile, exact four historical native Store arms, and fail-closed four-arm actor quota checks. Engine pin **`a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`**. Source and candidate decks and historic seeds frozen. No push-trigger workflow created.
- The two Git revisions differ due to the new **workflow input and environment binding**; scoring selector and root adapter code were already committed in the default run. Policy audit explicitly exposes off versus on through `potentialKoRootOptIn` and a version suffix. Both code paths use `actorObservation`, a detached owner-visible view. The existing generic fallback remains hidden-information-unqualified.

## Algorithm and limits

Among attacks the existing actor-only numeric cost checker already marks affordable, prefer the first non-GX printed attack whose fixed positive printed base damage meets or exceeds the opponent Active's **public printed HP minus existing damage counters**. Preserve the original earliest affordable attack for a first-GX option or if no qualifying fixed-base attack appears. The option is off by default. This checks a **potential KO**, with **no assertion of actual damage**: effects, damage reducers, Weakness, Resistance, special attack text, copied attacks, opponent response and paper legality can reverse any expectation. The genuine Store still decides whether actions resolve.

## Exact historical four-arm comparison

| Historical arm | Same initial source deal and starter | Root-action SHA identical | Native accepted actor roots, off → on | Engine termination off → on |
| --- | --- | --- | --- | --- |
| Rank 6 vs champion reference | Yes | Yes | 5 → 5 | engine-game-end → same |
| Rank 6 vs New Moon v1 | Yes | Yes | 56 → 56 | engine-game-end → same |
| Rank 11 vs champion reference | Yes | **No** | 68 → 74 | 260-root action cap → same |
| Rank 11 vs New Moon v1 | Yes | **No** | 63 → 73 | 260-root action cap → same |

Both rank-11 source-first/candidate-second rows retain exactly the same original source-deal SHA and true actual starter. Their first different **selected actor root intents** in bounded native provenance ledgers occurred on source seat 0:
- Champion row: source global turn **36**, default **`Terminal Period`**, opt-in **`Claw of Darkness`** (within first 64 recorded actor acceptances, index 49).
- New Moon row: source global turn **30**, default **`Terminal Period`**, opt-in **`Claw of Darkness`** (within first 64 recorded actor acceptances, index 37).

The difference is causally consistent with the explicitly toggled printed attack priority under matching initial conditions. Later root and attack counts diverge as turns evolve: rank-11 champion source/candidate attack declarations **19/24 → 23/17**, rank-11 New Moon **17/22 → 21/11**. Both sides use the same actor root policy; an observed change to **source** attack selection is therefore a meaningful bilateral stress witness and cannot support a candidate-only strength claim. All four arms had **zero rejected actor roots**. The rank-6 historical outcomes are retrospective and unqualified; they do not become competitive wins from unchanged outcomes.

### Interpretation

The original policy's arbitrary first-payable choice can mask a publicly apparent finishing opportunity. This small, priceable choice function is a reproducible local search improvement and exposure probe. **The paired native games do not establish improved competitive performance**: missing complete owner-information-safe prompt policy, unqualified source decisions, action-capped rank11 arms, game-clock limitations and unverified printing/field completeness remain. In particular, an attack chosen as a potential printed KO can still be strategically inferior to the previous first attack.

**Next check:** preserve this opt-in comparison as a policy regression; inspect the public source turn-30/36 board to determine whether printed KO was actually reachable and valuable, including effects and attacker resource cost. Evaluate in the integrated complete-game information-set-safe policy once that gate exists. Avoid promoting or selecting a 60 based on this small historical contrast.
