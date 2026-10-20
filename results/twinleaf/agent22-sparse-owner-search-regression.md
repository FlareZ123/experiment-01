# Agent 22: sparse native-valid multi-card owner-search fallback

**20 October 2026, development evidence only.** This is an opt-in policy component for the existing canonical actor-only bilateral runner. It changes no source/candidate decklist or upstream Twinleaf file, and yields **zero competitively qualified games**.

## Concrete gap in the current complete-bundle selector

The existing `agent41-actor-owner-single-search.cjs` calls `validatedCompleteBundles` for an authenticated owner-to-hand search of up to three cards. It materializes an exhaustive set of valid bundles, but returns `null` when more than 30 individually selectable cards exist or when its menu contains more than 1,500 bundles. The caller then delegates the prompt to the unqualified native tactic.

There is also a narrower **synthetic logical blind spot**: `validatedCompleteBundles` first filters candidates by `pending.validate([card])===true`. If only complete two-card combinations are native-valid, and each singleton fails validation, the result is an empty bundle menu even though a valid pair exists. This follows directly from the code and a constructed validator test. **No actual Aichi source prompt with this exact non-monotone validator has yet been identified**, so it is a possible failure class, not a proved historical source error.

## Bounded development correction

- `simulation/twinleaf/agent22-sparse-owner-bundles.cjs` performs a lexicographically canonical, size-descending search for **one** fully native-valid printed-card multiset of at most three cards. For 60 physical cards and a three-card maximum it makes at most `C(60,3)+C(60,2)+60=36,050` validator calls. It returns `null` if no valid complete selection exists.
- `simulation/twinleaf/agent22-sparse-owner-search-adapter.cjs` uses the unmodified Agent 41 owner projection when it provides a nonempty usable menu. When the original menu is absent **or empty**, it authenticates an actual `ChooseCardsPrompt` from the acting owner's deck/discard and attempts the sparse selection. It rejects opponent-owned, non-search, unsupported hand/payment, and mandatory multi-card prompts under the same narrow authorization policy.
- `withSparseActorOwnerSearch` is a drop-in **explicit injectable** `ownerSearch` component for `withCanonicalActorOnlyPolicy(..., {ownerSearch: withSparseActorOwnerSearch}, {ownerSingleSearch:true})`. It delegates final exact physical card matching, `ResolvePromptAction`, native Store dispatch, postcondition audit and method restoration to Agent 41's original implementation. There is **no default-on integration** into the common runner, no change to its frozen policy version, and no claim of greater decision competence.

A genuine large search may contain many acceptable bundles. Choosing the first complete one is a deterministic legality heuristic with potentially severe opportunity cost. Native validation alone cannot establish strategic quality. The intent is to convert identifiable generic fallbacks into an owner-observation-bounded development treatment before testing a better search objective.

## Checks performed

- Five standalone helper tests passed locally using Node's `node --test` on an equivalent local copy (including pair-valid/single-invalid, 50-card search, reverse physical order, duplicate printings and impossible search).
- Both committed suites, eight total tests, passed an **exact GitHub-readback-source V8 compatibility harness** with mocked `node:assert/strict`, `node:test`, `node:path`, an actor observer and native Store/Bot classes. The two-seat mocked native-dispatch test reported two accepted `ResolvePromptAction` objects and prototype restoration. This is **not compiled pinned Twinleaf CI**.
- The first V8 run reached 7/8 because the harness omitted `__dirname`; after passing module-relative `__dirname` it passed **8/8**, without modifying the tested repository code.
- The prior default Agent 41 module was not edited. An attempted direct integration was blocked by the repository write interface; no successful patch to that shared module or manual workflow was claimed.

## Falsification / next integration gate

1. Agent 41 or the current bilateral runner caretaker should inject the optional wrapper in the **existing** canonical actor chain, with a recorded flag and separate policy digest. Leave original historical four-arm runs frozen.
2. Run the two new test suites under actual Node 22, followed by a genuine pinned `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05` Store owner search over at least 31 individually selectable cards, preserving correct owner/player identity, printed card counts and post-resolution movements.
3. In the eight archived canonical arms, measure how many previously delegated **decision-bearing** owner searches reach this precise fallback. Exclude Wait/Show UI prompts from useful opportunity denominators, and retain any rejected/censored cells.
4. Before trusting its choices, compare the sparse legal bundle with a resource-cost-aware alternative on owner-equivalent hidden-state permutations and independently check printed effect/turn continuation.

**Status:** 29/32 exact published source lists, 0 competitively qualified matches, no verified 99.5% fixed deck. This improves a narrow development decision path only if genuine owner-search opportunities are demonstrated.

## Optional canonical-chain integration, same day

The existing `simulation/evaluation/agent7-canonical-actor-composition.cjs` now selects the Agent22 sparse wrapper only when `ownerSingleSearch:true` **and** the explicit development flag `AGENT22_SPARSE_OWNER_BUNDLE_DEV=true`. Its original Agent41 implementation remains the default. GitHub commit `39678e1`; a separate opt-in/default selector regression in `tests/agent22-canonical-sparse-optin.test.cjs` was committed at `a966998`.

An exact GitHub-readback V8 execution with mocked native modules confirmed default `common` versus explicit `sparse` wrapper selection, identical return value, and continued `competitiveGames:0` reporting. This test is source-level only. The existing manual workflow was not updated because its shared-file edit was rejected. The new env flag is a development treatment and still requires a compiled genuine Store opportunity before making a policy-effect claim.
