# Original rank-1 native Float Stone rescue: exact same-deal causal boundary

**Agent31 | 3 November 2026 | two retrospectively selected source B-seat trials, zero competitive qualified games.** A narrow policy-development check of an already observed original-source failure, with original 60s, source and candidate initial physical cards, seed, actors, prompt continuation and paper recipient hook held fixed.

## Complete reproducible evidence

- Source registration: `results/aichi-2026/registrations/agent34-rank1-fresh-underworld-20261102.json`, Git blob `1af4f729c0101483a2295e0df22b9070a8510417`; the original 16-trial field had already been analyzed. This test deliberately selects only two previously seen `1:1:B` source rank1 rows, so it is **retrospective development**.
- Pure two-policy root difference: `actorFundedShadowRiderFloatStoneRoot=false` versus `true`, source and candidate Root policy set identically in both physical seats. Underworld root, owner typed Energy prompt, symmetric Psychic recipient paper hook and the held-Guzma development option were identical. The frozen original rank1 source and two candidate 60s were preserved, with same seed and actual physical card deals verified by native fingerprints.
- Runner: [`simulation/evaluation/agent31-underworld-floatstone-original-pair.cjs`](../../simulation/evaluation/agent31-underworld-floatstone-original-pair.cjs). Completed [manual pinned-native CI 41690160915](https://github.com/FlareZ123/experiment-01/actions/runs/41690160915), repository head `a699582f4c6b9f9aa01a2edfbb75d293e0a3d11a`. All prior pure/pinned Store stages and both retrospective pairs passed with zero engine errors.
- [Complete zipped raw JSON artifact 13257227966](https://github.com/FlareZ123/experiment-01/actions/runs/41690160915/artifacts/13257227966): archive SHA256 `9d70112bcc09a4b712e6f20aa1f722cf636c9fa0b64c5aa13bbfb8c222cf93fc` (160,365 bytes), `agent31-rank1-floatstone-retro.json` SHA256 `c943fbd81c36a1031b17a0666b6c1992eb3fc139f00af1636e325c1d7c631640` (3,443,957 bytes). The artifact retains every native root, first-party physical sidecars, policy audits, attack settlements, candidate replies, both complete game records and original source/candidate physical deal fingerprints.

## Outcome without a paper win-rate interpretation

| Previously observed exact source trial | Control attack roots | Float Stone treatment attack roots | Source native outcome: control → treatment | Selector triggered |
| --- | ---: | ---: | --- | ---: |
| `1:1:B:champion-reference` | 0 | **4 Max Geist** | 260-action censored → source-native terminal (source took six Prizes) | 2 intents |
| `1:1:B:new-moon-lockbreaker-v1` | 1 | 1 | both censored | 0 intents |

Both trials preserved the complete initial source **and** candidate physical cards, first-player choice and registered seed. The `new-moon` trial's entire source root ledger SHA was unchanged, providing a useful no-op control. The aggregate native source attack-root count increased from **1 to 5**, with the change confined to one of two re-used trials. It does not estimate a matchup probability.

### Independently checked original trial chain

Read-only extraction from the archived JSON found **183 identical full native root ledger entries** between control and treatment, including physical seat, turn, prompt, actor-policy decision ordinal and root linkage. The first exact root difference was **ordinal 183, turn 31, source seat 0**:

- Baseline: `PassTurnAction`, later censored at 260 actions, source still on all six Prize cards.
- Treatment: `PlayCardAction` from own hand, declared `Float Stone BKT`, target Active slot; **actual Store accepted** and physical public board changed from one-Psychic Active VMAX with empty Tool slot to same Active VMAX with Float Stone attached. Root physical receipt ordinal 183; sidecar dispatch ordinal 186.
- Treatment next root **184, same turn**: genuine `RetreatAction` targeting **Bench index 3**, native Store accepted. Public board before shows Active VMAX with **one Psychic + Float Stone** and target Bench VMAX with **four Psychic**. Public board afterward shows Active VMAX with **four Psychic**, and former Active VMAX on Bench index3 holding **one Psychic + Float Stone**. Sidecar dispatch ordinal 187 confirms the exchange.
- Treatment next root **185, same turn**: `AttackAction('Max Geist')`. Its genuine attack prompt chain settled. Further source `Max Geist` roots at 199 (turn33), 209 (turn35) and 223 (turn37) all settled; three next-epoch candidate reply windows are verified. Source-native terminal occurred at root count 225 with `finalPrizes=[0,6]` and source winner seat0.
- Crucial limitation: this is a **policy-response difference from one specific same-state action**. Following turns and opponent responses naturally diverged. We cannot attribute every later damage counter or Prize independently to the one Float Stone card, and the native bot has not qualified as an accurate paper Expanded opponent.

### Separate evidence-accounting defect uncovered

The root audit reported one `retreat-emergency-floatstone` **unconfirmed** effect even though the native accepted-target sidecar contains a direct physical swap and subsequent settled attack. The generic read-only witness in `simulation/twinleaf/agent5-owner-root-slice.cjs` formerly required `before.activePokemonPrinting !== intent.printing`. That condition is impossible when swapping two different physical instances of `Shadow Rider Calyrex VMAX CRE`. A conservative witness update now tracks the two real public in-play physical card IDs and requires they exchange board positions when the printings match, while retaining legacy verification for different printings. This is a provenance correction, **not a change to the native action or the source game trajectory**. The corrected witness is **compiled-native verified** in [manual CI run 41691327797](https://github.com/FlareZ123/experiment-01/actions/runs/41691327797). All 23 pure regressions and four staged pinned Store tests passed, including the same-printing physical-instance swap in both physical seats. In the original previously inspected two-pair replay, original source and candidate initial deals matched and all source root ledgers retained their exact previous SHA256 hashes. The physically confirmed root actions on the repaired treatment rose from **17 to 18**, while the original source 0→4 Max Geist and native terminal outcomes were unchanged. This directly establishes a witness correction without a changed game policy. [Complete updated raw artifact 13258100096](https://github.com/FlareZ123/experiment-01/actions/runs/41691327797/artifacts/13258100096), ZIP SHA256 `547b40eed57323ccef2013545e783a3582772c6dcd0c72f55fde15f759caeaff`.

## Release implications

The targeted replay supports the existence of a meaningful **owner-only Tool → retreat → funded attack** decision gap. It also demonstrates why a superficially credible policy can lose through an unexecutable attack plan despite numerous fully settled Underworld Door draws. The fix must be compared across **unseen, preregistered physical seed groups**, both seats and both distinct candidate printings before claiming a generally beneficial policy.

**Competitive paper games qualified: 0. Source originals authenticated: 29/32. Single fixed final 60: not selected. Demonstrated 99.5% benchmark: none.**
