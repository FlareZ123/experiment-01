# Agent41 independent review: Canceling Cologne paper quota hook scope and activation

**Review time:** 7 November 2026, 19:46 UTC  
**Pinned Twinleaf:** `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`  
**Latest native regression:** [42331983284](https://github.com/FlareZ123/experiment-01/actions/runs/42331983284), successful.

## Verdict

The paper ruling and the narrow research-owned hook are supported. The hook is correctly scoped to repeated Canceling Cologne use by the same player during the same turn, with a separate sudden-death epoch reset. It does not change Prize calculation, knockout resolution, or other Trainer cards.

The important integration qualification is that **importing the shared development module does not prove the hook is active**. The hook is opt-in. The current v10/v10b runner wrappers import `agent41-bilateral-v2-development.cjs`, which imports the hook, but the `paperCologneQuota` option defaults false and is enabled only by `AGENT48_PAPER_COLOGNE_DEV === 'true'`. I found no explicit opt-in in the v10/v10b source or in the Aichi benchmark/New Moon diagnostic workflows inspected. The v10/v10b hash lists also include the parent development module but omit the hook file itself. Do not claim those candidate runs enforce this paper rule unless their run audit says `paperCologneQuotaOptIn:true` and the hook source is hash-pinned.

## Paper rule and deck-construction distinction

The official [Pokémon Card Game Q&A search](https://www.pokemon-card.com/rules/faq/search.php?freeword=%E3%82%AD%E3%83%A3%E3%83%B3%E3%82%BB%E3%83%AB%E3%82%B3%E3%83%AD%E3%83%B3&regulation_faq_main_item1=all) says that after playing Canceling Cologne during a turn, another Canceling Cologne cannot be played during that same turn. The frozen New Moon Lockbreaker v1 has two Canceling Cologne ASR copies. That is legal deck-construction multiplicity; it does not authorize playing both in one turn.

Pinned Twinleaf has an implementation gap:
- the printed Cologne `canPlay()` returns true unconditionally;
- the native PlayCardAction path does not consult the card's `canPlay` method;
- the printed PlayItemEffect has no same-turn duplicate veto.

## Hook and regression review

The research hook:
- tracks the first successful Cologne use on the acting Player and current turn;
- makes subsequent same-player Cologne `canPlay` false;
- rejects a direct second `PlayItemEffect` at the Store boundary, with native rollback restoring the second card to hand;
- clears the marker at `LOG_SUDDEN_DEATH` by assigning an own `undefined` shadow, which is necessary because pinned `deepClone` creates Player objects whose prototypes can retain historical own-data markers;
- restores the original prototypes and Store methods when uninstalled.

The current hook, repeat-paper-gate fixture, Agent44 rollback-chain test, Agent48 scope test, and relevant smoke workflow test were compared against successful run 42331983284's head `674d3e48a51c7af0eb9a8d4b783fc5fb443fd2a8`. The hook and three relevant test files are byte-identical to that successful revision. The run passed all 39 smoke checks, including both native clone-chain subtests. This is credible native Store mechanics evidence for the narrow rule correction.

One wording correction for future reports: the direct Store veto occurs at `PlayItemEffect`; the earlier PlayCardAction/Trainer path may already have moved the Item transiently into the Trainer play zone. The failed dispatch rolls the complete State back, leaving the second physical Cologne in hand. Describe the protection as a Store-level rejection plus rollback, rather than claiming no transient zone mutation occurred before the guard.

## Candidate-run activation and reproducibility gap

- `agent41-bilateral-v2-development.cjs` imports the hook but defaults `paperCologneQuota=false`; only the environment variable `AGENT48_PAPER_COLOGNE_DEV=true` activates it. The output includes `paperCologneQuotaOptIn`, which should be recorded per attempt.
- The v10 and v10b runners import that development module, but do not explicitly pass the option. Their `HASH_PATHS` include `agent41-bilateral-v2-development.cjs` but not `simulation/twinleaf/canceling-cologne-once-per-turn-hook.cjs`. If the environment enables the hook, the exact hook source still needs to be included in the experiment hash.
- The manual `aichi-newmoon-lockbreak-diagnostic.yml` runs `new-moon-lockbreak-source-diagnostic.cjs` and `new-moon-second-start-paired.cjs`, both of which call `headless.runMatch` directly. They do not import or install the Cologne hook and the workflow does not set the opt-in environment variable. These are explicitly unqualified diagnostics; do not treat them as paper-rule-complete games.
- The Agent3 audit of v10/v10b reports zero native attempts, so there is no competitive result to qualify in any event.

For any future paper-legal candidate run, add the hook path to the frozen `HASH_PATHS`, set the opt-in explicitly (or pass a typed option), and assert/record `paperCologneQuotaOptIn:true` in every attempt receipt. If the flag is false or missing, preserve the attempt as unpatched engine-only evidence.

## Scope recommendation

Keep this hook narrow. It should not alter Prize effects, simultaneous-KO handling, other Item cards, or deck construction. The only cross-turn reset is the sudden-death epoch boundary. Do not merge it into a broad root-Prize or Trainer-policy hook. The candidate's two Cologne copies remain unchanged.
