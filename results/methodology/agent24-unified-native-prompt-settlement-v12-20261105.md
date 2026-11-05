# Unified paper prompt audit: native return-only counterexample and v12 settlement receipt

**Agent 24, 5 November 2026.** This is a source-derived evidence integrity correction and pure mock regression, not a paper-game result or new card-strength conclusion. There are **zero** competitively qualified games.

## Audited implementation

The current multi-family [unified paper prompt guard](../../simulation/twinleaf/agent41-paper-prompt-contract-portfolio.cjs) v11 already has independent printed-paper negative checks for multiple source-stamped prompt families. At the point where a real `ResolvePromptAction` returns from the underlying `Store.dispatch`, however, v11 increments `event.nativeAccepted`, `audit.nativeAccepted`, `store.acceptedPromptReplies` and per-trial acceptance **without checking that the pending source prompt was actually resolved**. This is an identical return-only evidence weakness to the narrower Agent12 observer v1, with a wider potential release interpretation surface.

A prepared physical Store may return unchanged for a stale prompt ID. The critical observable distinction is: a prompt could remain pending after a nonthrowing call while paper pre-dispatch classification remains `PAPER_PROMPT_VERIFIED`. Such a result demonstrates only that a paper-choice geometry was independently allowed for the proposed answer, not that the answer actually affected the native game.

## V12 change

Source [commit `5e878b6`](https://github.com/FlareZ123/experiment-01/commit/5e878b64c08d6322e4a11d770fe3bdae512cc0f7) upgrades the schema to `agent41-unified-paper-prompt-contract-portfolio-v12-prompt-result-settlement`. Retains all printed-paper preflight classifications and vetoes and all trial denominators; it separates:

- `nativeReturnedWithoutThrow`: Store returned normally.
- `nativePromptSettled`: a captured pending prompt's result is **defined** and identical to the submitted answer after dispatch.
- `nativeSilentNoop`: same captured pending prompt object remains pending with undefined result after return.
- `nativeSettlementUnverified`: no matching pending source prompt or ambiguous post-dispatch state.

Legacy `nativeAccepted`, per-trial `nativeAccepted` and `store.acceptedPromptReplies` increment **only with nativePromptSettled**. Even then, generic effects remain `physicalEffectVerified:false`, and the full paper-validity/game-qualification flags remain negative. The `result !== undefined` requirement expressly prevents the mock counterexample where `ResolvePromptAction(id, undefined)` falsely equals an unchanged prompt `result:undefined`.

Pure regression [commit `efdc11a`](https://github.com/FlareZ123/experiment-01/commit/efdc11a93a7a6c3a026a77b7c771e627d50b1bea) extends the existing test suite with both-seat Camping Gear originally selected physical card answers sent to a Store that returns unchanged; despite a valid printed selection, accepted count must remain zero. Two additional tests cover a silent undefined answer and a stale unmatched prompt ID. The pre-existing complete suite retains genuine positive `FakeStore` prompt-result setter tests.

The existing [`twinleaf-completion.yml`](../../.github/workflows/twinleaf-completion.yml) `abort-custody` job now includes this test file together with the two Agent12 paper/settlement regressions, at [workflow commit `ffa9dfb`](https://github.com/FlareZ123/experiment-01/commit/ffa9dfb61dd40b9ee0f0d55b7eff0248d213e5f7). This is a reuse of an existing manually dispatched runner; **no new workflow** was created.

## Validation boundaries and relation to the narrower observer

The source and tests are committed and read back on GitHub. A complete GitHub Actions job **has not been dispatched for the v12 revision** in this invocation; therefore the new tests are registered and statically reviewed but **not yet CI-verified**. Earlier local Node 22 reproduced mock tests for the narrower Agent12 v2 behavior passed 10/10; that does not count as a v12 native compiled proof. The v12 `nativeAccepted` metric should not be used to promote older v11 records without original prompt resolution evidence.

The separate Agent12 v2 observer still has an **outstanding undefined-result false-positive**, exposed by an independent simple local mock and documented [here](agent24-general-prompt-return-only-settlement-v2-20261105.md). A safety-blocked write prevented patching that narrower observer; its result must not be treated as a fully sound universal settlement gate. The unified v12 code includes the necessary additional defined-result condition. Keep evidence streams version-specific.

## Implication for the single fixed-60 objective

Release-integrated paper action evidence must distinguish candidate/offered action, paper-choice geometry, actual native pending prompt settlement, source-specific physical card movement, beneficiary/opponent reply and full game outcomes. The v12 guard addresses only one measurement seam. It does **not** establish a strategic bot, correct past winners, or improve any fixed deck's measured strength. Field admission remains **29/32 name/count sources, missing 23/25/28, zero qualified games, no final selected 60 and no demonstrated 99.5%**.
