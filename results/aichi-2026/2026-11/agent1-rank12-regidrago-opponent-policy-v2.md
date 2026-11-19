# Rank 12 Regidrago opponent policy v2 — worker-init correction

**Status: V8 shim 20/21; Node test runner and worker IPC not executed; not attested**

## Status

This is a deterministic, actor-view-only opponent-policy prototype for the exact **Aichi Open League 2026 Top 32 rank-12 Regidrago list**. It is intended to exercise the fixed Hood Shield Shadow Rider candidate against one precisely bound opponent list.

**No games were run. No Twinleaf fixture was staged. The 21 test functions executed in an isolated V8 shim: 20 passed and one existing Heavy Ball case failed before policy execution in the worker's `validateRequest/multiSelectBounds` with `BAD_MULTI_SELECT_BOUNDS`. The new zero-key init regression passed. The Node test runner and worker IPC remain unexecuted. A separate direct V8 source smoke of the init boundary also passed. This artifact supplies no matchup result, win-rate estimate, or evidence of competitive competence. It does not support a 99.5% claim.**

The machine-readable challenge suite is [agent1-rank12-regidrago-opponent-policy-challenge-suite-v2.json](./agent1-rank12-regidrago-opponent-policy-challenge-suite-v2.json).

## Exact source and candidate bindings

| Binding | Value |
|---|---|
| Source | results/aichi-2026/full-decklists.json, rank 12 |
| Source player / archetype | Risa Sato / Regidrago |
| Source list size | 60 cards |
| Source deck fingerprint | f176d6831f91a470ec4d3ef1e18636da8e4178b294c2978bb64cc371c37d3059 |
| Source file blob SHA-1 | ae773f6201d7aa69d31914dbfee66f3fba692200 |
| Fixed candidate | results/aichi-2026/candidate-hood-shadow-rider.json |
| Candidate deck fingerprint | 1880c60b44761c0cf22eb3e5cfa43e6e5581c174dc737932c19728cc5da5a1e4 |
| Candidate file blob SHA-1 | 24ace2d6feb9ce5d9056bcf271827cfe31b7357b |
| Twinleaf submodule | vendor/twinleaf |
| Twinleaf remote / pin | https://github.com/twinleafgg/twinleafgg.git / a9905a76a6c4103ba4b6cb9a49e86bad795c5c05 |
| Research-hook revision | none |
| Upstream Twinleaf changes | none |

The source and candidate fingerprints are deck-object fingerprints, not file hashes. The candidate remains unchanged and is intended to be used against every opponent in the benchmark.

Agent17's [Regidrago source-list variance report](../../methodology/2026-11/agent17-regidrago-policy-family-variance-20261117.md) records 14 substitutions between ranks 10 and 12, with only 26 distinct card identities shared. Rank 12's distinct package includes Dialga-GX ×2, Fezandipiti ex, Crobat V, Echoing Horn, Megaton Blower, Counter Catcher, and Path to the Peak. This implementation is bound to rank 12's own 60 cards; it does not import rank-10-only Faba, Wobbuffet, Battle VIP Pass, or Prime Catcher branches.

## Exact rank-12 60-card list

### Pokémon — 20

| Count | Printing |
|---:|---|
| 4 | Regidrago V SIT 135 |
| 3 | Regidrago VSTAR SIT 136 |
| 2 | Dialga-GX UPR 100 |
| 1 | Dragapult ex TWM 130 |
| 1 | Noivern ex PAL 153 |
| 1 | Koraidon ex TEF 120 |
| 1 | Kyurem SFA 47 |
| 1 | Dedenne-GX UNB 57 |
| 1 | Crobat V DAA 104 |
| 1 | Latias ex SSP 76 |
| 1 | Tapu Lele-GX GRI 60 |
| 1 | Marshadow UNB 81 |
| 1 | Fezandipiti ex ASC 142 |
| 1 | Budew ASC 16 |

### Trainers — 30

| Count | Printing |
|---:|---|
| 2 | Professor Sycamore BKP 107 |
| 2 | Raihan EVS 152 |
| 2 | Guzma BUS 115 |
| 1 | Marnie SSH 169 |
| 1 | Crispin SCR 133 |
| 1 | Iono PAL 185 |
| 4 | Mysterious Treasure FLI 113 |
| 4 | Quick Ball FST 237 |
| 3 | VS Seeker PHF 109 |
| 1 | Ultra Ball MEG 131 |
| 1 | Hisuian Heavy Ball ASR 146 |
| 1 | Super Rod PAL 188 |
| 1 | Echoing Horn CRE 136 |
| 1 | Megaton Blower SSP 182 |
| 1 | Counter Catcher PAR 160 |
| 2 | Muscle Band XY 121 |
| 1 | Path to the Peak CRE 148 |
| 1 | Parallel City BKT 145 |

### Energy — 10

| Count | Printing |
|---:|---|
| 4 | Double Dragon Energy ROS 97 |
| 4 | Grass Energy MEE 9 |
| 2 | Fire Energy MEE 10 |

## V3 worker initialization correction

The v2 factory accepts only the shared worker's `config: {}` payload and requires the worker-supplied RNG function. The integration regression calls the actual exported `validateInit`, captures its accepted init envelope, and passes `{...accepted, rng}` into `createPolicy`, matching the worker's real factory call. It verifies that non-empty config is rejected at both boundaries. Rank/source/candidate identity stays in immutable module constants and v2 manifests.

The V8 shim harness executed this regression successfully. A separate direct V8 source smoke also passed using the actual shared worker, rank-12 v2 module, and apex-choice helper: empty config accepted, callable `decide` returned, and non-empty config rejected at both boundaries (`UNKNOWN_FIELD` / `AGENT1_RANK12_POLICY_INIT_MISMATCH`). The bundle digest was a synthetic valid-format placeholder. Neither exercise ran the Node test runner, worker loop, IPC, native Store, or a game.

## Policy implementation

- Policy module: simulation/evaluation/2026-11/agent1-rank12-regidrago-opponent-policy-v2.cjs
- Policy version: agent1-rank12-regidrago-opponent-v2
- Role: opponent
- Runtime config is exactly empty; rank, source fingerprint, and candidate fingerprint remain immutable module constants and versioned-manifest bindings.
- Shared attack evaluator: simulation/evaluation/2026-11/agent43-regidrago-apex-choice.cjs
- Actual request/decision validator dependency: simulation/evaluation/2026-11/agent49-policy-worker.cjs

The policy is deterministic, uses no random draws, and can only return tokens offered by the current action frontier or prompt. It uses the actor's hand, own public state, opponent public state, own turn resources, public event receipt, and current owner-choice prompt. It does not inspect hidden opponent hand, concealed Prize identities, deck order, native Store state, RNG seeds, future events, or unoffered actions.

### Rank-specific decisions

1. **Apex Dragon attack selection.** The wrapper adds Noivern ex's Dominating Echo and Covert Flight to the shared evaluator. Dominating Echo receives priority when an opponent Stadium or Special Energy is visible. Dialga-GX, Koraidon ex, and Kyurem remain available through the shared evaluator. The wrapper does not choose Dragapult ex's Phantom Dive because the corresponding PutDamagePrompt allocation is not exposed in a validated host projection.
2. **Discard management.** A unique Noivern ex, Dialga-GX, Koraidon ex, or Kyurem can be preferred as an Apex Dragon payload when that payload is not already in the discard. Double Dragon Energy, the Regidrago line, and Dragapult ex are protected by the discard heuristic.
3. **Setup.** Regidrago V/VSTAR and Budew receive high setup priority. Dedenne-GX, Crobat V, Fezandipiti ex, Tapu Lele-GX, Latias ex, and Marshadow are considered from visible hand/board conditions.
4. **Megaton Blower.** The policy does not spend it without visible opponent Tools, Special Energy, or a Stadium.
5. **Path to the Peak.** The policy withholds the Stadium while own VSTAR or other relevant own Rule Box abilities may still be needed. The positive branch requires actor-visible evidence that the relevant abilities have been spent.
6. **Gust and Bench manipulation.** Counter Catcher and Guzma use the prompt's offered targets, preferring visible high-Prize targets. Echoing Horn prefers a high-Prize Basic Pokémon offered from the opponent's discard.
7. **Conditional abilities.** Flip the Script is gated by a public prior-turn Knock Out receipt. Legacy Star, Dedechange/Dark Asset, Wonder Tag, and Resetting Hole use visible state gates.
8. **Concealed Prize identities.** Hisuian Heavy Ball fails closed when the actor view does not reveal the Prize identity.

The policy does not attempt to evolve Noivern ex onto the board. It treats the listed Noivern ex as an Apex Dragon payload. The list contains no Noibat, so a board-evolution line is not assumed.

## Challenge suite and test coverage

The challenge suite contains eight synthetic actor-view envelopes with canonical SHA-256 digests and four held-out native scenarios marked blocked/not constructed. The 21 test functions cover:

- exact role, seat, rank, source-list, and candidate binding;
- deterministic behavior from either physical seat;
- Apex Dragon attack choice and Noivern payload priority;
- Mysterious Treasure discard/search decisions;
- Counter Catcher and Echoing Horn target selection;
- Megaton Blower target gating;
- Path to the Peak self-lock gating;
- Flip the Script prior-KO gating;
- Heavy Ball hidden-Prize abstention;
- Phantom Dive allocation abstention;
- Crispin energy selection and VS Seeker recovery;
- unknown-prompt and no-token fail-closed behavior;
- worker request rejection of hidden-hand/RNG fields;
- worker decision rejection of invented action tokens.

The V8 shim executed all 21 test functions: **20 passed, one failed before policy execution** in the real worker validator. The Node test runner remains unexecuted; this is not an IPC or native-game pass.

## Evidence and limitations

| Evidence class | Count | Status |
|---|---:|---|
| Source-natural cases | 0 | Not collected |
| Native-staged cases | 0 | Not constructed |
| Synthetic actor-view cases | 8 | Authored, not executed |
| Contract tests | 21 | V8 shim: 20 pass, 1 pre-policy `BAD_MULTI_SELECT_BOUNDS`; Node runner not executed |
| Native games | 0 | Not run |
| Matchup win-rate observations | 0 | None |

Important unresolved points:

- Counter Catcher prompt target choice is tested separately from the Prize-count eligibility gate.
- Crispin's two-energy search selection is represented, but the subsequent hand-versus-attachment resolution is not native-validated.
- Raihan search/energy-payment branches are heuristic and lack native acceptance evidence.
- Path to the Peak needs source-natural evidence for the ability-use receipt and self-lock gate.
- Phantom Dive remains unsupported until the host exposes and validates damage-counter allocation.
- Hisuian Heavy Ball remains unsupported when Prize identities are concealed.
- The shared Apex evaluator and this wrapper have not been tested against native source-natural rank-12 turns.
- Candidate-policy and bundle producer IDs are not inferred. The suite is diagnostic-only and cannot be V3-attested.

## Reproduction bindings

- Dependency manifest: simulation/evaluation/2026-11/agent1-rank12-regidrago-dependencies-v2.json
- Common constraints: simulation/evaluation/2026-11/agent1-rank12-regidrago-common-constraints-v2.json
- Challenge suite: results/aichi-2026/2026-11/agent1-rank12-regidrago-opponent-policy-challenge-suite-v2.json
- Tests: tests/2026-11/agent1-rank12-regidrago-opponent-policy-v2.test.cjs
- Policy: simulation/evaluation/2026-11/agent1-rank12-regidrago-opponent-policy-v2.cjs

The next useful step is to run the focused Node test file and resolve the existing Heavy Ball `BAD_MULTI_SELECT_BOUNDS` failure only under separately authorized fixture scope, then collect native source-natural decision envelopes. Do not promote this prototype to competitive evidence until those steps and independent producer/reviewer binding are complete.
