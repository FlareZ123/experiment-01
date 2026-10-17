# Rank-2 source-K0 Bunnelby policy: same-head compiled comparison

**Agent 40, 17 October 2026. This is an experimental policy integration result, not qualified matchup evidence.**

## Intervention and provenance

The source-known K0 Bunnelby policy offers Technical Machine: Evolution using the original 60 and visible own cards, avoiding the older predicate that inspects concealed real deck identity before the player's first deck search. Earlier paired physical allocations showed that the old pre-search decision can depend on unknown Prizes. [Implementation commit](https://github.com/FlareZ123/experiment-01/commit/1468d2e900f233f3fcd7bd5e8ecfbadbf1bfe9e2) enables opt-in `bunnelbyK0SafeEvolution` in fixed Aichi diagnostics, conditionally avoids installing the legacy policy inside the Expanded profile, and checks the engine's echoed runtime flag.

Both compiled manual workflows used research revision `1468d2e900f233f3fcd7bd5e8ecfbadbf1bfe9e2`; pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`; exact Aichi rank-2 Vileplume source list; the same unchanged champion, Hood and Temple candidate 60s; seed protocol `decorrelated-slots-v3`, base `20261016`, plan digest `01ab9959e9b94f8d89fe6dc010072b9959ce3dfa2c4d670f9864ed3d237c9d60`; and the `expanded-action-fidelity-probe-v1` experimental bot with matching other flags.

| Variant | CI run | Archive ID | Archive SHA-256 | CI |
| --- | --- | ---: | --- | --- |
| Source K0 (`true`) | [38995220149](https://github.com/FlareZ123/experiment-01/actions/runs/38995220149) | 12086808686 | `f8838fe64b6e0134462fed1b19476f1c30cd8970c525267efe564eb79335d2cd` | Success |
| Legacy (`false`) | [38995268798](https://github.com/FlareZ123/experiment-01/actions/runs/38995268798) | 12086539487 | `f6bdcaad917a3db4f7c34dae441edacdd2a16aba09af2623f564d0bf80137c55` | Success |

## Actual six-trial comparison

I retrieved both complete ZIP archives and recursively compared every `aichi-campaign-diagnostic.json` record and all remaining six JSON reports. **Both arms had six `completed-engine-game` records, identical physical source deck hashes, scheduled seeds, verified first movers, chronological meaningful-action SHA-256s, attacks, action counts, turn counts, engine winners, public quality screens and every other diagnostic report.** Only each record's `policy` string and the top-level requested `policyFlags.bunnelbyK0SafeEvolution` differed.

| Candidate / physical slot | Seed | Candidate starts | Root actions | Candidate / opponent attacks | Engine winner slot |
| --- | ---: | --- | ---: | ---: | ---: |
| Champion A | 1872892219 | First | 234 | 6 / 7 | 0 |
| Champion B | 4149597228 | Second | 315 | 1 / 14 | 0 |
| Hood A | 1872892219 | First | 358 | 8 / 14 | 0 |
| Hood B | 4149597228 | Second | 408 | 10 / 22 | 0 |
| Temple A | 1872892219 | First | 393 | 11 / 16 | 0 |
| Temple B | 4149597228 | Second | 541 | 32 / 17 | 1 |

No decision divergence was observed in these six fixed physically seeded games. This verifies an operational selectable option and absence of observed regression on these exact deals. It does **not** establish increased strength or a fair complete policy.

## Qualification and follow-up

The historical source-K0 archive labels `+BunnelbySourceK0PossibleEvolution-v1` twice, once in the headless layer and once in the Expanded wrapper. A follow-up label deduplication is metadata-only, intentionally separate from the archived same-revision trial evidence.

The source-known possibility predicate also remains optimistic **after** a genuine deck search would establish K1 and allow inference about Prized stages; observation history is not yet tracked. Other policies and speculative Store simulation may still access hidden information or contaminate Cards. Neither source replay mechanics nor strategic competence is fully qualified. Fixed reused physical seeds are shared across candidates, so these diagnostics are not six independent competitive outcomes. The project retains **zero independently qualified competitive games**, only **29/32** confirmed full opposing source lists, and no demonstrated 99.5% win rate.

Related: [Bunnelby hidden Prize counterexample](../twinleaf/bunnelby-k0-prize-hidden-branch.md), [source-60 joint hidden-zone sampler](../twinleaf/k0-joint-hidden-zone-sampling.md), and [rank-2 qualification packet](qualification-packets/rank-02/README.md).


## Independent original-v2 late-pass K1 timing correction

**A separate archived v2 physical deal was checked, without transferring the newer v3 observations across seeds.** Original compiled source pilot [CI 38845353476](https://github.com/FlareZ123/experiment-01/actions/runs/38845353476), artifact `12023246166`, ZIP SHA-256 `35ed9e01b55ba4c7634940aabe84297f0ae9892000b1933e48c3953d0177e7ab`, contains `pilot:2:0:hood-shield-v1:B` on seed `20363065`, schedule `independent-slots-v2`. Its recorded meaningful-action trace digest is `8ccd9879e271df9dfc9221f6384b68e8392e9618206a1705146012444ee912a4`.

- At **turn 6**, physical opponent seat 0 plays `Capture Energy` (root action **45**) and resolves an owner-deck `ChooseCardsPrompt` to put `Bunnelby PRC` onto the Bench (root action **46**, `sourceZone:'deck'`, `sourcePlayerSlot:0`). This is the **first directly confirmed complete owner-deck selection** for that seat in the captured trace.
- The same turn, that player plays `Guzma & Hala` (action **49**) and resolves a source-deck Stadium search for `Artazon PAL` (action **50**), independently confirming the deck had been searchable.
- On **turn 56**, actions **339–346** culminate in the previously studied Bunnelby `PassTurnAction` at root action **346** after attaching Jet Energy, Tool and using a deck-search Ability. The independently archived single-action fork [CI 38883700346](https://github.com/FlareZ123/experiment-01/actions/runs/38883700346), artifact `12039395099`, ZIP SHA-256 `f426e3bd2434f06d5a38bb1bbebe957fe9b29b1f64fb43c22ef553f3052e89be`, reports the same source trial and seed and an accepted Evolution announcement.

Consequently, the specific **turn-56 pass was post-first-deck-search**, so the K0 hidden Prize objection alone cannot establish that this late decision used information unavailable to a skilled player. The K0 source-predicate counterexample remains valid for genuinely pre-search states. The archived v2 trace does not prove perfect human memory, exact full reducer replay, or tactical superiority.

The separately checked v3 seed `4149597228` in this report had its first confirmed opponent full-deck choice on turn 9, action 68, through Guzma & Hala; this is a **different physical deal** and must not be used as evidence for v2 turn 56.
