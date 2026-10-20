# Canonical bilateral v2 full candidate settlement integrated and independently replay-verified

**Agent 41, 20 October 2026 UTC.** This is a same-four-arm historical **development** verification. There is no competitive win inference, no held-out cohort and no paper-clock validation.

## Implementation and reproducibility

- Integration commit [405973da](https://github.com/FlareZ123/experiment-01/commit/405973da13df089e4d5538ce6fd98355b89603b4): the **existing** `simulation/evaluation/agent41-bilateral-v2-development.cjs` now enables read-only `capturePoltergeistEffectTrace` for every Store run and includes the **entire** actor-filtered `candidateAttackSettlement` packet returned by `agent37-candidate-attack-settlement.cjs`. The earlier first-two-settled-attacks field remains only a legacy summary.
- Added a same-root, same-packet independent reconciliation gate `scripts/agent41-canonical-candidate-settlement-gate.cjs`, new pure test `tests/agent41-canonical-candidate-settlement-gate.test.cjs`, and a multiple-declaration/truncated-leading-source-events regression in `tests/agent37-candidate-attack-settlement.test.cjs`.
- Existing **manual-only** `.github/workflows/newmoon-compressor-source-partitions.yml` runs the old independent Agent 37 observer and the new direct canonical packet under the **same late14 owner-Compressor policy**. No workflow has been created for pushes.
- [Compiled manual run 39347202101](https://github.com/FlareZ123/experiment-01/actions/runs/39347202101), **success** at Git revision `18ccd51fd29548ecc8f3fbc1dfbebc5ac2df247a`, pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.
- [Original artifact 12231093443](https://github.com/FlareZ123/experiment-01/actions/runs/39347202101/artifacts/12231093443), ZIP SHA256 `d66c0b45164c498ff4fda5babfbf6d45b37db64adc669a4956ced46c9cd93b57`. Contents: canonical full four arms SHA256 `5889c7f98e883993c0b8fcab5c673831b58ef9864eb9bf3bed38a3bc7c6fcff6`; independent observer SHA256 `73d356bb40e817acd3bff909e673deb0026a85f229b82097ac21480e6ad5808c`; gate report SHA256 `78cc508fda2036989acf7258869764cd280496f9e96b33313089b50e17c72534`. All artifact bytes were separately downloaded and hashed.

## Four-arm decision packet

| Retrospective exact-source arm | Actor-owned candidate declarations | Prompt-closed public settlements | Immediate next-source turns | Terminal status |
| --- | ---: | ---: | ---: | --- |
| rank6, champion reference, candidate A | 3 | 3 | 2 | engine terminal |
| rank6, New Moon, candidate A | 0 | 0 | 0 | **260-root censor** |
| rank11, champion reference, candidate B | 1 | 1 | 1 | engine terminal |
| rank11, New Moon, candidate B | **2** | **2** | **1** | engine terminal |

The `agent41-canonical-versus-independent-settlement-gate-v1` passed **4/4** arm comparisons. Every complete canonical `candidateAttackSettlement` object was byte-equivalent in parsed JSON structure to Agent 37's independently replayed observer packet. Every original action-history SHA256 equaled the independent frozen value, including rank11 New Moon `6dab28f91a196a7cc63c18bbfa86f552dbe594c2d33aeb762727756221517618` and rank6 New Moon `87ef423a77ec6aafd6063fd3ad054ce3f9d29806a52ab04f21c1c6bb0e1495e4`.

The rank11 New Moon candidate was physically **first**; source's turn-one Tool-Garbodor autonomous line reported `completed:false`. Two delegated Poltergeist declarations at roots 149 and 162 settled at roots 154 and 163. A genuine intervening source root was observed after the first. Both copied attacks yielded three Prize cards each in this specific opponent execution. These mechanics were independently documented earlier by [Agents 37/9](agent9-independent-late14-settled-poltergeist-audit.md); the new contribution is wiring the **same** full evidence into the canonical runner and checking it against its independent observer, not rediscovering those KOs.

## New adjacent evidence and surviving blockers

A separate [Agent 9 source-first replay](https://github.com/FlareZ123/experiment-01/actions/runs/39346205829), artifact 12231322666, was independently downloaded (ZIP SHA256 `a208e55960309571e552f64d543638ab49879acb3521dbed01990a88fea90877`). Across **four retrospectively selected** rank11 source-first physical seeds, both unchanged candidates had exactly matched source-deal fingerprints, source `completed:true` with a turn-one owner-played VIP/Boost Shake/Garbodor-search sequence, and a turn-two public equipped-Garbodor witness. All eight candidate games registered later prompt-closed attacks. New Moon's seed `482443328` selected **Field Blower as the first candidate root on turn two** against equipped Float Stone Garbodor, recorded a native legal Item target/removal, then had five later settled Poltergeist declarations. This is promising pressure/response **development** evidence; the source-first seeds were preselected on previous source success against a different candidate, and functional Ability suppression, complete native action legality, opponent policy, actual matchup success and 25-minute tournament-clock equivalence are not certified by this packet alone. Coordinate with Agent 9 rather than duplicating their source-first report.

**Vetoes remain:** `hiddenInformationSafe:false` in the common policy, prior proven concealed-opponent-hand-dependent default-bot decisions, incomplete universal source-first lock/response qualification, unqualified source and candidate bot competence, incomplete paper card equivalence and no timed model. The rank6 New Moon censor has no established candidate attack and requires a causal board/resource/decision diagnosis. Replaying favorable retrospective seeds does not authorize new held-out performance cohorts. Opposing source lists recovered **29/32** (missing ranks **23, 25, 28**), competitively qualified games **0**, 99.5% target **unproven**.

## Next integration

Keep `simulation/evaluation/agent41-bilateral-v2-development.cjs` as the sole canonical runner. Apply a demonstrably legal, actor-owned, information-set-safe setup sequencer **equally to both fixed candidates**, verify parity through native plus delegated choices, and rerun the same archived source-first pressure and rank6 censor cases under frozen two-player policies. Require a fully accepted first-turn source Tool-Garbodor lock, candidate action, settled consequence, subsequent opponent response and a paper-clock limitation statement in the same archive before discussing the prospective full-field qualification gate.
