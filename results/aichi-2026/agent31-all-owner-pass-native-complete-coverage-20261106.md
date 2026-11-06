# Agent31: complete original-owner Pass census adds two missed funded Shadow Rider windows

**6 November 2026 | native pinned engine | retrospective observational replay | zero competitively qualified games**

## Question and strict evidence boundary

The earlier [Agent31 crossrank rank5/rank11 Float Stone observation](agent31-owner-visible-funded-vmax-pass-frontier-20261104.md) inspected candidate Passes only when the source had attacked on the previous turn. It recorded nine funded Shadow Rider VMAX Float Stone situations in one original rank11 trial, but over half of candidate Pass roots in the full 32-pair archive lacked that conditional owner snapshot. This investigation asks whether an already existing, post-choice **both-seat and all-Pass** observer recovers additional visible opportunities in that historical game, while keeping the native Store policy and physical openings unchanged.

No new random samples were selected. Four **outcome-known** control arms were deliberately retrieved from the pre-existing [32-pair preregistered original rank5/rank11 baseline](registrations/agent31-crossrank5-11-floatstone-20261103.json): `5:0:A:champion-reference`, `5:0:A:new-moon-lockbreaker-v1`, `11:3:B:champion-reference`, `11:3:B:new-moon-lockbreaker-v1`. Both contenders remain their previously fixed, distinct printed 60s; the rank11 Champion case was selected **because its known historical Float Stone positive had already been observed**.

## Exact native execution and reproducibility

- The shared original two-seat `runDevelopment` uses its historical control policy, with `actorFundedShadowRiderFloatStoneRoot:false` on both real seats, unchanged registered seeds 2352487734 (rank5/A) and 1681435956 (rank11/B), native engine pin `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`, and the previously registered recipient/Underworld and source-observation hooks. The **sole requested measurement extension** is `nativeAllOwnerPassFrontier:true`, which reconciles real Store Pass roots to post-choice owner hand and both public boards without changing actions.
- New [test and runner](../../tests/agent31-allowner-pass-retrospective-native.test.cjs), existing [all-owner auditor](../../simulation/evaluation/agent31-bilateral-all-owner-pass-evidence.cjs), and existing [narrow visible funded VMAX criterion](../../simulation/evaluation/agent31-shadow-rider-visible-pass-frontier.cjs).
- Reused the [manual-only Agent14 native workflow](../../.github/workflows/agent14-native-floatstone-reply.yml), option `agent31-allowner-pass-native`. The initial [CI 42145486097](https://github.com/FlareZ123/experiment-01/actions/runs/42145486097) failed a registered-group preflight: an attempted two-arm subset omitted the required second contender in each seed group. **No games executed in that failing run.** Corrected to all four registered arms at commit `1eb8989e36fc4e033cbcd0ba1c8dc21459a79d5e`.
- Corrected full native [CI 42145965996](https://github.com/FlareZ123/experiment-01/actions/runs/42145965996), exact head `1eb8989e36fc4e033cbcd0ba1c8dc21459a79d5e`, **SUCCESS**, one native Node test passed, all four original attempts completed. Archive [artifact 13469977744](https://github.com/FlareZ123/experiment-01/actions/runs/42145965996/artifacts/13469977744), complete 3,771,332-byte JSON, GitHub ZIP SHA-256 `37f23be549934f450815549d1bfe8e295038c17346d838c3c942a18c8c3b3b05`.
- Independently downloaded previous [original 32-pair baseline ZIP 13260926041](https://github.com/FlareZ123/experiment-01/actions/runs/41694723676/artifacts/13260926041), ZIP SHA-256 `8333ea0989cd8c9092040c93435c35f5a454dc204601ee89593681ea5994d634`; cross-checked every one of these four new rows to its **exact original control row**, including source-deal fingerprint, full physical-deal fingerprint, actual `rootActionLedger` array equality (all accepted actions and ordinal ordering), action count, native ending/turn count, and root digest. **All four rows have exact root equality** and identical physical starts, providing direct evidence that this observer-only replay did not change accepted native play.
- In comparison across the *two different contender decklists*, full physical deals differ, as expected; within each unchanged printed contender/control comparison they match. The shared original-source deal digest does match across candidate lists in these two selected seed groups. This is a retrospective diagnostic and cannot justify paired performance inference across arbitrary different 60s.

## Full Pass coverage and new positives

| Original rank and fixed contender | Source-owned Pass roots | Contender-owned Pass roots | Held Float Stone at contender Pass | Narrow funded contender VMAX windows |
| --- | ---: | ---: | ---: | ---: |
| 5 / Champion | 12 | 0 | 0 | 0 |
| 5 / New Moon | 16 | 17 | 0 | 0 |
| 11 / Champion | 9 | 25 | 25 | **11** |
| 11 / New Moon | 21 | 14 | 0 | 0 |
| **Total** | **58** | **56** | **25** | **11** |

Every one of the **114** accepted native `PassTurnAction` roots has a unique same-ordinal/same-turn/same-seat owner decision receipt with the owner's genuine hand and both public boards: **114/114** reconciled, zero missing or duplicated. Of the 55 owner Pass roots with Float Stone held (30 source, 25 contender), 11 satisfy the **narrow, position-specific** Shadow Rider VMAX predicate. The 30 source held-Stone Pass roots belong to a different original archetype and fail this Shadow Rider predicate by design.

In the historical rank11 Champion control, the previous source-attack-conditioned observer saw nine plausible missed funded VMAX roots: `137, 144, 151, 192, 199, 207, 215, 222, 251`. The complete all-Pass observer confirms those nine and additionally captures **root170 (global turn35)** and **root185 (global turn37)**. Both omitted Passes are verified actual owner decisions, within the *same* physical trial `11:3:B:champion-reference`, source seat0, contender seat1:

- **Root170**: acting owner holds `Float Stone BKT`; untooled Active `Shadow Rider Calyrex VMAX` carries two Psychic Energy; a distinct Benched VMAX has four Psychic; no Stadium is in play; opposing Active `Mega Absol ex` and Bench `Oranguru V`, with no attached Tools. Prior root169 was a Psychic Energy play by the contender; source's next attack occurs at root173, so the earlier observer that required a *preceding* source attack missed this Pass.
- **Root185**: the same owner still holds Float Stone, Active VMAX has two Psychic, and its Benched VMAX now has five Psychic. The public safe-opponent/Tool/Stadium checks again pass. Original source attacks at root188 after this Pass, so this was also outside the earlier prior-source-attack-conditioned snapshot.

The 11 positive Pass observations come from **one original physical game**. They are correlated turns, never 11 separate games or 11 independent opportunities. The other three historical arms add no positive VMAX Pass under the same narrow predicate. This four-arm retrospective panel cannot estimate unconditional incidence across the 32 opponent field or validate the 99.5% benchmark.

## Interpretation and independent vetoes

The previously archived matched-policy intervention in this exact game did physically attach held Float Stone at root137, retreat at root138 into an already funded Benched VMAX, and settle Max Geist at root139. This independent old native action chain validates feasibility of **one actual Store-selected move sequence** for this game, without establishing that every later counterfactual Pass was paper-payable or strategically better. The new replay makes zero player-policy changes and does not test playing Float Stone at roots170/185.

The predicate abstains on unrepresented Special Conditions, persistent attack effects, complete printed Tool permission and full paper payment. The native Store has other known paper-semantic gaps; original source opponent decisions, a full same-policy response and the Aichi 25-minute match clock are not competitively validated. The selected Issue25 bilateral developmental policy remains v4, with zero qualified games, and the existing `results/README.md` **no selected 60** disposition is unchanged.

**Concrete follow-up:** instrument all owner Pass roots in a *new prospectively frozen* common policy and evaluate actual affordable Tool→Retreat→attack opportunities with real opposing alternatives, using the physical-trial rather than turn-root as the independence unit. Track error and root-cap censoring separately.


## Follow-up exact archive-parity regression

Independent retrospective equivalence is now executable as [`agent31-original-allpass-archive-parity.cjs`](../../simulation/evaluation/agent31-original-allpass-archive-parity.cjs), with five synthetic [fail-closed tests](../../tests/agent31-original-allpass-archive-parity.test.cjs). The comparator accepts the complete earlier historical baseline archive and the later full four-arm replay JSON; it checks each original registered ID, physical deal fingerprint, action ledger SHA, **deep equality of all accepted native Store root-action records**, full Pass ownership, and recovery of visible opportunities excluded by the earlier source-attack-conditioned observer. It rejects changed opening cards, altered accepted actions, missing owner Pass receipts, missing candidate group arms, and a changed policy flag.

All five synthetic comparator tests passed along with the existing Agent31 tool-chain/Pass regression suites on [lightweight CI 42147400371](https://github.com/FlareZ123/experiment-01/actions/runs/42147400371), **SUCCESS**, using commit `a1f6cdec2fe0c081daa72902dc30675f8221f91c`. That CI tests the comparator's contracts on fixtures. The *actual 53.7MB-vs-3.8MB original archive parity* was independently checked against both downloaded verified ZIPs using the Python runtime as reported above, and is an offline computation rather than a claim that the lightweight test job downloaded both large original artifacts.

The two added rank11 candidate roots have a full **five-Pokémon Bench**. This does not itself bar Retreat: the supplied *Advanced Player's Rulebook*, section A-03, expressly permits Retreat with five Benched Pokémon when another Benched Pokémon can replace the Active. The visible-funded predicate therefore correctly permits a full Bench, and an additional pure [full-Bench case](../../tests/agent31-shadow-rider-visible-pass-frontier.test.cjs) was added after that lightweight CI run. The latter case requires a separate post-change regression before claiming CI coverage.
