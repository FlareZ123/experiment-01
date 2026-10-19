# Night Watch chance samples inside bot planning and live attack resolution

**Agent 3, 19 October 2026.** Bounded, retrospectively selected source-dealt mechanical audit. **No competitive game qualification.**

## Question

The opt-in, identity-blind Night Watch correction previously counted every call to the attack's sampled opponent-hand prompt. Twinleaf's `SimpleTacticsAi.decodeNextAction` can simulate action candidates through a separate `Simulator`, so a sample count alone cannot prove that a choice occurred in the live game. Determine how many corrected prompt precommits originate inside bot decision computation, and whether the resulting sample totals are usable as actual attack counts.

## Input and method

- Frozen original 60-card Aichi rank 11 (Absol/Garbodor) versus frozen rank 1 (Shadow Rider Calyrex) from `planAichi(1)`, including explicitly recorded equivalent Basic Energy and Japanese promo adapter options.
- One prior outcome-selected physical source seed **2809154458**. Both arms retain the printed decks, true starting seat **1**, action cap **160**, existing autonomous rank-11 first-turn opener, and the same baseline headless options. This is an existing *mechanical regression specimen*, never a random win-rate sample.
- Pinned upstream submodule `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. The compiled manual [CI run 39179418167](https://github.com/FlareZ123/experiment-01/actions/runs/39179418167) used repository head `e9f8a4bd7e561fe5cb7660d9f97521ee1e936ea6`; the full JSON artifact is [12155597838](https://github.com/FlareZ123/experiment-01/actions/runs/39179418167/artifacts/12155597838).
- A reversible diagnostic wrapper around `SimpleTacticsAi.prototype.decodeNextAction` maintains an exception-safe nesting counter only when the audit option is enabled. The existing Night Watch reducer/prompt resolver records which compartment it occupied at each sample/resolve event. It retains card-identity opacity and restores prototype descriptors. Aggregate count equalities are asserted during the source replay.
- Original/default and corrected physical source paths were compared using the existing [conditioned source replay](../../simulation/twinleaf/rank11-night-watch-random-paired.cjs) and independent [real-root hand-choice journal](../../simulation/twinleaf/rank11-night-watch-effect-journal.cjs). All underlying Night Watch card corrections remain opt-in; vendor files were unchanged.

## Compiled observations

| Metric | Corrected source arm |
| --- | ---: |
| Sampled Night Watch prompts created while inside bot decision computation | **6** |
| Sampled Night Watch prompts created outside bot decision computation | **3** |
| Precommits across both compartments | **9** |
| Sampled prompt resolutions while inside bot decision computation | **3** |
| Sampled prompt resolutions outside bot decision computation | **0** |
| Invalid sampled prompt resolutions | **0** |
| Independently journaled real-root Night Watch declarations | **3** |
| Engine-finished, winner physical seat 1 (same as default arm) | yes |
| Qualified competitive games | **0** |

The *six* in-decision precommits are evidence that planning can invoke the printed Night Watch reducer and consume provisional random selections. They **must not be counted as live attacks**. The three outside-decision precommits align numerically with the independently observed three live attack declarations, but this compartment check alone does not prove a one-to-one mapping; the real-root journal remains the authority for physical action counting.

The three prompt **resolutions** inside `decodeNextAction` are consistent with the bot deciding how to answer the live unresolved prompts. It would be wrong to classify every resolution inside a bot decision as speculative. The distinction here is between *creation of a chance prompt while the bot searches* and *resolution of a prompt in the live Store*, requiring Store identity for the latter.

The repeated conditioned baseline and corrected arms both finished with engine winner seat 1 and three Night Watch declarations. The earlier [real-root position audit](night-watch-uniform-random-source-hook.md) already establishes different first root sampled positions between policies, so an unchanged engine winner does not erase the state divergence.

## Implications and limits

This is a concrete source-replay falsification of the assumption **`hook.created === number of live chance events`**. For this specimen, the unstratified count 9 would overstate three observed root attack events by a factor of three. Counts here concern *attempted sample creation*, not independent legal draws or RNG quality.

The experiment does **not** show that the bot preferred or rejected a line because of the sampled hypothetical future opponent-hand cards. The speculative Store may have hidden-information access, but observing six planning prompts alone does not prove exploitative foresight. In the current headless configuration, `isolatePolicyRandomness:true` runs the speculative bot with a separate deterministic policy RNG; whether the policy's own chosen action is biased by simulated hidden-card outcomes needs a separately controlled decision test.

A useful follow-up is to freeze one authentic owner-information-correct pre-action state, enumerate multiple *planning-only* chance streams, and compare the **actual first selected action and legal option set** without changing physical game chance or candidate/opponent lists. If policy decisions vary, inspect information leakage and search scoring before any tactical-performance claim. Extend the replay to a genuine opponent pressure and challenger reply, aligned with the [Critic evidence gate](../critic-review-70.md).

**Field inference is unchanged:** 29/32 exact original Top-32 lists are sourced; ranks 23/25/28 remain missing. Zero independent competitive games qualify. No fixed candidate demonstrates the 99.5% goal.
