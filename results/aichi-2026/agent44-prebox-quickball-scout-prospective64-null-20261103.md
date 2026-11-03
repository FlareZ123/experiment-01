# Agent 44: prospective rank-8 Quick Ball-before-Secret Box, 64 physical-deal null (3 November 2026)

**Outcome: no observed gain on the strict source-board endpoint.** In a **precommitted 64-fresh-deal**, symmetric-both-seat, original-rank-8 Absol/Garbodor versus fixed Hood Shield v1 native experiment, pre-Box Quick Ball scouting produced exactly **one** genuine owner-K1 scout in 64 registrations. That scout retained the original planned Box line, with the same recorded outcome as baseline. No baseline/treatment endpoint changed in the 64 matched original physical deals. This result does **not** establish general strategic equivalence, full game quality, or any tournament win rate.

## Frozen registration and execution

- Pre-run registration: [agent44-rank8-prebox-scout-vs-box-first-fresh64-20261102.json](registrations/agent44-rank8-prebox-scout-vs-box-first-fresh64-20261102.json), authored 2 November 23:21 UTC and committed before compiled execution. Fresh original-source indices **402–465** inclusive, 32 in each physical source seat, source-seed schedule SHA256 `332d1769aadbe4a03cb59c669eeb23f70e2c6ef0058d66f71221680eb78715bf`.
- Original rank-8 printed 60 identity SHA256 `6d955f821a0ae206110189adf53621a29c2d49afdeade1206dee46a2a50f8541`. Candidate printed 60 unchanged Hood Shield v1. Each fresh deal was run as baseline and treatment with identical complete initial source/two-player physical fingerprints and the identical canonical both-seat actor. Both arms enabled the same owner-only Box strategy; treatment added Quick Ball-before-Box scouting only if the real paper-payable Trubbish search path required it.
- Compiled manual [GitHub Actions run 41545198366](https://github.com/FlareZ123/experiment-01/actions/runs/41545198366), checkout `fedefeadab113e11c3d7c72eed8a23e073755d31`, status SUCCESS, [full native artifact 13189241027](https://github.com/FlareZ123/experiment-01/actions/runs/41545198366/artifacts/13189241027). Artifact ZIP SHA256 reported by Actions `e309cc70f7758b976b03b1ef35b853430712adeb8dd623d74f748aea4bc7021c`. Source runner `simulation/evaluation/agent44-canonical-boxshake-native-pilot.cjs` with `AGENT44_RANK8_CANONICAL_SCOUT_PROSPECTIVE64=true`; original pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.
- Strict paper-payment correction hooks for original Quick Ball and TWM Secret Box, genuine 3-physical-card Box discard custody, owner-visible K1 recorder, original-source and complete-deal parity, 120-action cap and actual public opponent root for strict success. The reporter included **one separately identified historical selected positive**; the denominator of the below comparison excludes that control.

## All 64 preregistered rows

| Observation | Baseline (Box before search) | Treatment (Quick Ball-before-Box if applicable) |
| --- | ---: | ---: |
| Registered fresh matched physical deals | 64 | 64 |
| Box offered in owner root | 6 | 6 |
| Physically paid Box | 6 | 6 |
| Equipped Garbodor + actual opponent public turn root | 5 | 5 |
| Offered/paid Box but no settled opponent public reply | 1 | 1 |
| No Box opportunity encountered | 58 | 58 |
| Source-native execution errors | 0 | 0 |
| Paper-payment guard exceptions | 0 | 0 |

**All 64 baseline/treatment status labels matched and initial physical-deal parity was true throughout.** Six matching paid-Box rows were indices 423, 450, **451**, 458, 461, 465. Native strict completion in all except 461. In index **461**, both arms paid Box but the owner-authorized K1 search found `shakeInDeck:false` and `garbodorInDeck:true`, so the intended Tool-Garbodor construction could not complete and the native opponent-root endpoint was not met.

**One actual treatment scout occurred** at original-source index **451**. The treatment paid a real Quick Ball, discarded **VS Seeker**, searched the actual owner deck, observed `shakeInDeck:true`, and continued with a physically paid Box. Both arms reached the same strict equipped-Garbodor/opponent-root endpoint. Zero treatment rows were classified `SCOUTED_K1_NO_BOX`. This is an observed conditional scout with **no demonstrated avoided expensive commitment**.

The full CI job printed the per-row status, offered and physical-payment counts, genuine scouts and owner-K1 reason. The archived artifact contains richer original ledgers; the abbreviated log-derived summary above is independently reproducible from that run's `agent44-canonical-boxshake-native.json` object and the reporter invocation in the job log. It is not an estimate of whole-game wins.

## Cheap exact source-inventory diagnostic (independent of the native result)

A companion [BigInt combinatorial model](../../scripts/agent44-rank8-directheld-k0-scout-window.cjs) with [three passing local Node 22 tests](../../tests/agent44-rank8-directheld-k0-scout-window.test.cjs) counts a deliberately narrow direct-held information window in the authenticated original rank8 sixty. The deck has **1 Secret Box, 4 Quick Ball, 2 Basic Trubbish, 8 other Basic Pokémon and 45 other cards**. Condition on a valid **initial seven-card hand with at least one Basic**, one following top-deck draw and **no other actions or extra draws**. The resulting eight-card physical inventory must contain Box and at least one Quick Ball while containing zero Trubbish. The exact event probabilities are:

- Before conditioning on the Basic requirement: **4.308679%**.
- Conditional on a valid initial seven: **3.36778344%**, corresponding to **2.15538 expected event inventories in 64 independent hands**.
- Under this **inventory-only Bernoulli** approximation, 0 or 1 such inventories in 64 is not surprising (probability about **36.064%**). This probability does not represent an empirically measured source strategy outcome.

This calculation is a *cheap experimental-design baseline*. The event can still be strategically unpayable or useless because of UDP/discard costs, existing board state, ACE SPEC expenditure, game search sequencing, or opponent pressure. Conversely, an actual native policy may reach Box or Quick Ball through additional searches/draws, opponent mulligan bonuses, and later turns. Therefore **3.3678% is neither an upper bound nor a lower bound on natural native scout opportunities**, and the observed **1/64 actual scout** is not a direct trial of the inventory model. No hidden Prize/deck information is used to decide a real K0 action in either experiment.

## What this falsifies and what remains open

The earlier post-selected index383 demonstrated a legal K0→K1 owner-deck scout **could** prevent a Box commitment when Shake was absent. That posthoc example was correctly excluded here. The fresh 64-deal cohort does **not** show that the new conditionally enabled policy improves the precommitted strict endpoint or frequently exercises the scout. The informative treatment event frequency was **1/64**, and the whole-cohort physical opportunity to offer Box was **6/64**.

**Next useful question:** Can an already-required owner deck search realistically precede irreversible ACE SPEC payment in *more actual early-game states*, while preserving a paper-payable target? The current root selector requires a held Quick Ball specifically to fetch missing Trubbish. Merely extending this same policy to hundreds of randomly seeded full native games would predominantly yield `NOT_ENCOUNTERED` rows and add little information about the conditional advantage. Favor a **cheap owner-visible root opportunity census** followed by a separately precommitted policy intervention on the represented, naturally reachable eligible class. Preserve the old 64 as the unscreened base-rate reference, rather than treating prospectively selected eligible roots as population-representative.

Separately, the repository's critical shared-policy gate is original ranks 5/11 joint-source competence on identical source physical deals; see [Critic same-deal transport directive](../../communications/broadcast/20261103T0319Z_critic_joint-policy_transport_failure_and_frozen-source-gate.md). This rank-8 scout is an atomic methodology result, **not** a contender promotion. No qualified tournament games; no 99.5% result; 29/32 original field sixties still authenticated.
