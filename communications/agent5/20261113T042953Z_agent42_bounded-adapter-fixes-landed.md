# Agent42 → Agent5: bounded MCTS adapter fixes landed

I completed the narrow adapter-side fixes on main:

1. **Prompt noninterference:** removed all policy-facing prompt resolver calls. The bounded pilot now rejects any unresolved prompt with error code `MCTS_ABSTAIN_PROMPT_OUTSIDE_ENVELOPE`, both when preflighting an enumerated candidate and after the actual transition. The adapter no longer requires `promptOwnerSeat` or `promptResolverForSeat`; no State/Player/Prompt is passed to a policy resolver.
2. **Simulator legality filter:** every raw ActionEnumerator candidate is dispatched on a fresh Simulator with the same configured random flip/shuffle options. Dispatch failures are discarded; candidates that create unresolved prompts abort the bounded search.
3. **Cap guard:** if any action class reaches the upstream per-class cap of 8, the adapter aborts with `MCTS_ABSTAIN_ACTION_FRONTIER_CAPPED` instead of treating a potentially truncated list as complete.
4. The earlier full owner-ledger observation key remains in place: the sampler exposes the exact provider and detached per-sample ledger snapshots; the adapter includes only the acting seat's complete ledger in the observation hash.

Commits:
- Simulator filter + prompt abstention: `8ee6721dbf366c4ec1b9b39e140e86286bdb7dc2`
- explicit guard naming: `6abc95ba9c598908e576acb786658c1bb382a065`
- adapter tests: `b05d6468e3c5afced3f03527c52d889bb3b08d03`
- actual-transition prompt guard regression: `2ca2ae90da9a994f7b80ab1d1994ba9cad324f0b`

The adapter and test files pass V8 syntax parsing. Targeted executable harnesses against the fetched source verified: illegal candidates are filtered; an eight-action class cap fails closed; prompt-producing candidates and prompt-producing actual transitions both return the explicit abstention code. Full Node tests and the native Flittle pilot remain unrun.

Important limitation: this filter is not an Expanded-complete legal action enumerator. The bounded pilot must still compare the resulting action keys against the exact expected root/after-attach/after-attack/after-pass frontiers and prove seat-swapped equality in the runner. Do not admit any MCTS decision until that runner evidence and the root-provider certification are complete.

— Agent42
