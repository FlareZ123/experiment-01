# A single held Lillie's Determination source decision changes the rank1 native mirror from a 6–0 terminal into a two-attack continuation

**Agent15, 6 November 2026 | preregistered source-owner-only policy A/B/A | qualified competitive games: 0.**

## Hypothesis and registration

The original rank1 source owner held **no Energy cards at all twelve observed Pass decisions** in the 110-root actual native rank1 mirror, but retained unused `Lillie's Determination M1L` in its own nine-card hand after the original source's turn20 Pass. See [exact hand provenance](agent15-rank1-mirror-owner-hand-postchoice-census-20261106.md). Test whether the source owner can instead **play that physically held Supporter once**, and whether a genuine subsequent Store continuation produces any concrete action/attack payoff. This is a retrospective single-source intervention after observing a failed original game, not a preregistered unknown-seed tournament selection.

Before the native attempt, the precise [registration](../aichi-2026/registrations/agent15-rank1-mirror-lillie-first-own-turn20-aba-20261106.json) fixed:

- Source and candidate: exactly the **same rank1 original printed 60**, with independent physical shuffles; source original seat0, candidate seat1, frozen trial `1:212:B:champion-reference`, native seed **1084952875**.
- Control **A**: original v8 + Telepathic search + Confirm-false policy, no changed owner decisions.
- Treatment **B**: exactly at source global turn20 when its original owner bot would Pass, consult **that owner's own hand, Supporter quota and lock flag**. If still holding `Lillie's Determination M1L` and able to use a Supporter, replace Pass with a typed `PlayCardAction` at that actual hand index; allow genuine native Store prompts, subsequent source actions and opponent reply to resolve. No further forced actions.
- Control **A-repeat**: exactly the initial unaltered policy, again. All other seven registered v8 arms are preserved unaltered in each of the three phases.
- Exact comparison of the full physical deal (not seed alone), original accepted public root prefix up to the fork and two entire A/A-repeat root tapes. Native game ends and aborts retain their observed statuses.

Implementation: [reversible policy wrapper](../../simulation/twinleaf/agent15-rank1-mirror-lillie-aba.cjs), [four pure unit tests](../../tests/agent15-rank1-mirror-lillie-aba.test.cjs), [one full compiled native A/B/A test](../../tests/agent15-rank1-mirror-lillie-aba.native.test.cjs). Research hook is default-off and fully restored in `finally`. No registered deck or pinned Twinleaf vendor code was changed.

## Native result and exact custody

[GitHub Actions run 42303068498](https://github.com/FlareZ123/experiment-01/actions/runs/42303068498), head `eacfba4f92cea70eb57c59b3b5e32359cd5b525e`, pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`: native vendor compile success, **Lillie pure preflight step 4/4 PASS**, **native A/B/A step 1/1 PASS**, archive upload success. The **overall workflow is RED** due to the subsequent unrelated pre-existing `detached-simulator-existing-fixtures.cjs` Bunnelby `WaitPrompt` failure. Dedicated A/B/A passed and archived before that later failure.

[Immutable artifact 13545470597](https://github.com/FlareZ123/experiment-01/actions/runs/42303068498/artifacts/13545470597) holds all 24 registered arm dispositions, three source-owner real public root tapes and SHA256 sidecar. Archive file `agent15-rank1-mirror-lillie-native-aba.json`: **112,414 bytes**, SHA256 `3190b628c773f08abf75a9dc4c2ca2d231ecea89e8b94674d09bd8140efbd9b1`. GitHub Actions ZIP digest `e4d80181a9e7a78577e452bd541e893782e03cac2fbcf34e5d7c489d080be047`. The native test asserted 8/8 control A/A-repeat original public-root identity, 8/8 treatment **same complete physical deal**, and 7/7 non-target B arms identical to control.

| Native observation | A original | B held Lillie on actual turn20 | A-repeat |
| --- | --- | --- | --- |
| Real rank1 original public accepted roots | 110 | **128, action-cap censored** | 110 |
| Status | Native terminal | **No terminal before 128-root cap** | Native terminal |
| Winner | Candidate seat1 | **Unresolved** | Candidate seat1 |
| Remaining Prizes `[source,candidate]` | `[6,0]` | **`[4,3]`** | `[6,0]` |
| Source accepted attack actions | 0 | **Two `Night Watch` declarations**, global turns22 and24 | 0 |
| Accepted source Lillie payment | None | **Actual source seat0 `PlayCardAction` root90** | None |
| Root SHA256 | `3f07a98bee3266a5866351307333d4ad1673ed9e3adb7f356c08cef1290c919a` | `13ab25c071544c887a1226ebfea909798e73eb7c6f2b92a4c0` | identical to A |

The originally chosen source Pass at **public root ordinal90** was replaced by a **native-accepted actual Store `PlayCardAction` of Lillie's Determination** on original source global turn20; the previous **90 accepted roots** were byte-for-byte identical. A's complete 110-root terminal outcome and A-repeat's did not differ at all. The B policy recorded exactly one typed intervention, source owner Supporter quota originally unused (`supporterTurn:0`), and the source hand index of Lillie exactly **8** of **9** physical cards. Actual prompt resolutions after the action are present in the native public-root tape.

Without further forced source actions, B's native opponent/source continuation shows **`Fog Crystal` Item at root94**, Benched **`Shadow Rider Calyrex V` and `Mimikyu` at roots99–100**, a **manual Psychic Energy attachment at root101**, and then another Psychic Energy on global turn22 at root109. Source **genuinely announced `Night Watch`** on original turn22 at root110, and again on original turn24 at root121 after a further manual Psychic attachment at root120. B recorded source Prize count decreasing **6 → 4** by the 128-root action cap; the present archive establishes the two attacks and final Prize count, but does **not** separately attribute both Prizes to a fully settled individual attack event, so avoid claiming that from this packet alone.

## What this demonstrates and what it does not

**Causal source-policy liveness evidence:** one physically held, owner-only available Supporter at the originally selected Pass can materially change native resource access and subsequent attack decisions under the same exact original physical opening. It achieved two native attack declarations, established additional Psychic Energy and a native scoreboard that no longer matched the previous candidate's 6–0 terminal at the fixed root horizon. It is meaningful progress beyond simply counting played Trainers or drawing proxies. It cannot be interpreted as an improved match **win rate**, because the B continuation is **censored at 128 roots with no winner**.

**Critical paper-legal and decision-policy veto:** pinned native `Night Watch` is known to use attacker-selected opponent-hand cards, while the printed attack requires **two random cards** from the opponent hand. See [Agent43's independently documented Night Watch random-target falsification](agent43-nightwatch-attacker-choice-native-falsification-20261105.md). Consequently, B's two native `Night Watch` attack resolutions are **NOT paper-qualified**, even if the printed Energy costs and physical Supporter payment are established. Our source policy is an after-the-fact, exact-turn best-case intervention against an unqualified generic opponent; the opponent's actual reply is not an adversarial competent-policy test. The original and treatment also need official paper 25-minute clock treatment and complete rule fidelity. Stronger policy might exploit held card, but this single source mirror cannot establish a competitive causal benefit or structural deck advantage.

**Next validation:** independently read native `sourceAttackSettlement` for two B `Night Watch` uses, actual Prize events and opponent reply; rerun B with Agent43's scoped paper-random Night Watch hook, a longer prospectively declared horizon and owner/clock constraints. A controlled opponent response may eliminate the apparent continuation advantage. Integrating a **general owner-visible resource policy** across all 32 opponents, both seats and many unseen physical deals is necessary before any deck selection.

**Global benchmark remains: 29/32 authenticated original card-name/count inventories, zero competitively qualified games, no selected fixed 60, no demonstrated 99.5% win rate.**
