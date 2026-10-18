# Rank11 held-Boost-Shake K0/K1 resource-conservation regression

**Agent 6, 18 October 2026. Source-dealt, compiled policy regression.** This is a narrow decision-quality correction on three retrospective source seeds. It is **not** a competitive game-win result.

## Falsified behavior

The published rank11 Wataru Yano 60 contains exactly **two Garbodor BKP 57** and two Boost Shake EVS. An earlier autonomous, six-action policy used Battle VIP Pass to Bench a Trubbish, attached a Tool, then played held Boost Shake. On archived original-deal trials **137** and **155**, it discovered no valid Garbodor target only at stage 4, after committing the Tool and ending the turn with Boost Shake. The archived 160-deal report had explicitly retained both aborts.

The narrower cause differs between them:

- Trial **155**, seed **1804615887**: source player's *own initial hand* held **both printed Garbodor**. Because these are the only copies in the fixed 60, the K0 information set already proved that searching the deck for Garbodor could not succeed.
- Trial **137**, seed **1043379306**: own initial hand held one Garbodor. The legitimate **owner-facing deck search for Battle VIP Pass** subsequently exposed **zero searchable Garbodor**, triggering a K1 resource-conservation decision. The policy cannot infer the Prizes before that search and does not inspect hidden zones outside the owner's deck-search prompt.

Boost Shake's printed attack-independent Item effect permits first-turn evolution from the deck and ends the turn. The source rank11 60 has no other evolution target beyond Garbodor. Playing it with no valid evolution is a meaningful lost action and turn opportunity. Pokémon search, including Battle VIP Pass, is permitted to select fewer cards than the upper limit; the K1 guard still selects the source Trubbish to complete already-played VIP Pass.

## Correction and freeze boundary

Added opt-in **`conserveGarbodor: true`**, reported as **`rank11-held-shake-v2-k1-guard`**, to [the existing autonomous policy](../../simulation/twinleaf/rank11-held-shake-opener.cjs). The old `rank11-held-shake-v1` is unchanged by default, preserving published seed-study comparability.

- **K0**: if the current own hand contains both Garbodor, do not start the specialized Boost Shake line. Fall back to the original bot without touching its hidden deck or Prizes.
- **K1**: after playing VIP Pass, inspect the actual owner's active deck-search prompt. If the remaining deck contains no Garbodor, legally finish selecting Trubbish, then relinquish the Boost Shake script. The held Tool and Boost Shake are conserved.
- **Positive route**: when a searched Garbodor exists, follow the original six-action line.

The [three-pair regression](../../simulation/twinleaf/rank11-held-shake-k1-guard-regression.cjs) uses original published rank11 in physical seat 1, originally first on every selected seed, and rank1 Shadow Rider in seat 0. Printed-60 hashes are asserted equal within each source pair. These are previously observed source seeds, never fresh prospective opportunities.

| Source trial / seed | Original v1 | Opt-in v2 | Outcome qualification |
| --- | --- | --- | --- |
| **131 / 100383471** | Six actions; immediate Tool-Garbodor witness | Same six actions, candidate trace and terminal result | Unchanged positive; weak bot |
| **137 / 1043379306** | Four actions, stage-4 missing owner target | Two actions, explicit K1 guarded exit at stage 1 | Both bounded at 85 root actions, unfinished |
| **155 / 1804615887** | Four actions, stage-4 missing owner target | No specialized actions; generic decision trace replayed identically to unwrapped source | Both bounded at 85 root actions, unfinished |

The positive trial 131 had the same 69-action / ten-global-turn engine result in both arms, with rank11 winning and physical Prizes **[3,6]**. The two negative trials are not comparable game-win observations: neither reaches a finished match. Trial 155's alternate continuation has a different global-turn count at the same 85-action cutoff. The policy change is explicitly a **resource/decision quality guard**, not evidence of an improved win rate.

## Executable verification

- [Manual-only compiled CI **39149352378**](https://github.com/FlareZ123/experiment-01/actions/runs/39149352378) **PASSED**, research head `7ffb09bd678313828c7dfc1c3ef56bf8c290e50d`, pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.
- [Full machine-readable regression artifact](https://github.com/FlareZ123/experiment-01/actions/runs/39149352378/artifacts/12144805944): ZIP SHA256 `1cf57416577a0853a85f68eab83e1e478e82019db91d5ad15ef5adbffd0ca9a0`; contained JSON SHA256 `d9cc305d26e617408515c9bd866f13761dc32574547c1507eb5bcbd1cc8afe73`.
- Existing manual cross-lock CI executes [the privacy and K0 regression tests](../../tests/rank11-held-shake-opener.test.cjs), the source runner's frozen precommitted schedule tests and 11 other shared lock-action fixture steps before the opt-in experiment.
- All original 80/160 prospective `v1` report hashes remain historical and are **not** relabeled as v2 outcomes.

## Interpretation and next gate

The research correction establishes that a fixed-60 policy can avoid two observed deterministic wasted-resource lines by respecting K0 card-count knowledge and K1 deck-search information. It has not established that conserving a Tool and Shake changes the match result, that the original bot's alternative move is strategically strongest, that all other Garbodor and Item paths are handled correctly, or that 25-minute paper tournament games are modeled.

An independent **prospective** v2 source cohort with both actual starting orders, complete candidate responses and negative opportunity denominators is needed before any frequency generalization. The full field remains **29/32 exact opponent 60s** (ranks 23, 25 and 28 unavailable). **Zero independently qualified competitive games**, no target-qualified final deck, and no demonstrated 99.5% win rate.
