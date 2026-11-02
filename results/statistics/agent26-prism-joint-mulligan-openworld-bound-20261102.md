# Prism Star singleton and shared-sixty correction to Aichi source uncertainty

**Agent 26 | 2 November 2026 | exact combinatorial correction.** This extends the earlier [open-world mulligan bounds](agent26-openworld-mulligan-source-bound-20261102.md) and [visible-Thorns bounds](agent26-openworld-native-visible-thorns-active-20261102.md). **No new games or competitive wins are claimed.**

## Missing-copy constraint

The previous upper likelihood for the three unavailable original sixties (ranks 23, 25 and 28) conservatively allowed four copies of any revealed non-Basic name. The official [Prism Star rule](https://www.pokemon.com/static-assets/content-assets/cms2/pdf/trading-card-game/rulebook/par_rulebook_en.pdf), Appendix 14, permits **one copy per Prism Star name**. Two genuine archived rank-6 native opponent-opening records reveal Wondrous Labyrinth ♢ and Thunder Mountain ♢. Applying their actual cap of one shrinks the contribution of any hypothetical missing sixty to those public events.

The previous product of separately maximized failed-hand likelihoods also ignored that all publicly observed names must coexist in **one 60-card inventory**, and that the final seven must be Basic-valid. This is safe as an upper bound but can be substantially loose for several different revealed mulligans.

## Finite constrained maximization

For every observed failed seven \(H_i\), let \(u_{in}\) count copies of name \(n\). Optimize one common integer inventory \(c_n\), subject to \(c_n\ge\max_i u_{in}\), the applicable named-card cap (four ordinarily, one for Prism Star, unrestricted for Basic Energy), and \(\sum c_n\le60\). Remaining unseen slots may conservatively be filled with Basic Pokémon.

The greatest joint likelihood of all publicly revealed invalid sevens followed by an unseen valid seven is

\[
U_{\rm valid}(H)=\max_{\{c_n\}}
 \left[
 \prod_i\frac{\prod_n {c_n\choose u_{in}}}{{60\choose7}}
 \left(1-\frac{{\sum_n c_n\choose7}}{{60\choose7}}\right)
 \right].
\]

For an additional face-up **Iron Thorns ex Active** observation, grant each missing deck four Thorns and adversarially select it whenever present. The exact upper under this permissive construction is

\[
U_{\rm Thorns}(H)=\max_{\{c_n\},\sum c_n\le56}
 \left[
 \prod_i\frac{\prod_n {c_n\choose u_{in}}}{{60\choose7}}
 \left(1-\frac{{56\choose7}}{{60\choose7}}\right)
 \right].
\]

Dynamic programming tracks the highest exact BigInt likelihood product at each total number of physical card slots consumed. Fractions are preserved as exact numerator and denominator strings. These are maxima within an intentionally broad class of hypothetical legal inventories; they do not assert which cards ranks 23, 25 or 28 registered.

## Six authentic public opening receipts

Inputs are the [six native original rank-6 public setups](agent26-real-native-source6-public-mulligan-six.json), their [CI 41004538878](https://github.com/FlareZ123/experiment-01/actions/runs/41004538878), and all [29 authenticated original printed 60s](../aichi-2026/full-decklists.json). Exactly ranks 6, 24 and 29 of the known originals have Iron Thorns ex, each as four copies and the sole Pokémon; their observed Active is forced. Uniform prior over all 32 original ranks is held unchanged.

| Seed | Candidate seat | Public failed hands | Previous guaranteed rank-6 mass | Corrected guaranteed rank-6 mass |
| --- | ---: | --- | ---: | ---: |
| 4136149016 | 0 | 1, Wondrous Labyrinth ♢ | 0.389105% (1/257) | **1.538462% (1/65)** |
| 4136149016 | 1 | 1, no Prism | 0.218500% | **0.218500%** |
| 1514735430 | 0 | 0 | 16.666667% | **16.666667%** |
| 1514735430 | 1 | 1, no Prism | 0.291121% | **0.291121%** |
| 3730833191 | 0 | 1, Thunder Mountain ♢ and two Trainers' Mail | 0.065062% (1/1537) | **0.259740% (1/385)** |
| 3730833191 | 1 | 1, no Prism | 0.129702% | **0.129702%** |

The per-missing-deck event upper decreases **fourfold in each Prism witness**. The other four original public Active examples have unchanged strict upper bounds. Larger collections of different failed hands may benefit from the new common-60 constraint.

These percentages are worst-case mathematical posterior guarantees under the explicitly uniform source-rank prior, **not calibrated beliefs about opponent archetype**, game outcomes or deck performance. No hidden current hand, deck order or Prize cards are used.


## Additional cross-name ACE SPEC restriction

The exact 60-card missing-source optimizer now also enforces the **one ACE SPEC card total per deck** rule, including combinations of different ACE SPEC names across separately reshuffled public mulligans. The 39 identified names were collected from the bundled complete English card data under the card subtype ACE SPEC. This curated name set includes the ACE SPEC Special Energy Legacy Energy, as well as Computer Search, Prime Catcher and Secret Box. A publicly revealed Computer Search in one failed seven and Secret Box in another yields zero likelihood for any single legal sixty under those printed names. A repeated *same* singleton name across separately returned-and-reshuffled failed sevens remains possible. Four extra compiled regressions establish these cases. The [official Pokémon rules](https://assets.pokemon.com/assets/cms2-en-uk/pdf/trading-card-game/rulebook/sm2_rulebook_en.pdf) specify that the ACE SPEC limit is global across different names, and [Pokémon's Scarlet & Violet release](https://press.pokemon.com/en/MEDIA-ALERT-New-Pokemon-Trading-Card-Game-Scarlet-VioletTemporal-Force) includes Special Energy. No additional effect on the original six rank-6 receipts is expected since neither observed failed seven contains an ACE SPEC.

The 39-name registry is anchored to the supplied card database. If future printings or legal names beyond that archived database are introduced, the conservative default ordinary four-copy bound remains a safe but looser upper bound until the registry is regenerated. Names shared with pre-Black-and-White non-ACE SPEC printings are outside the paper Expanded card pool being studied.

## Reproducibility and qualification

- [Exact joint-card-cap solver](../../scripts/agent26-prism-joint-mulligan-envelope.cjs) and [twelve pure tests](../../tests/agent26-prism-joint-mulligan-envelope.test.cjs) passed **12/12 compiled Node22 CI regressions** in the existing manually dispatched [run 41481605169](https://github.com/FlareZ123/experiment-01/actions/runs/41481605169). The two original-receipt tests also passed, together with the older tests in the same statistical step. The global workflow remained **red at a separate policy-inventory gate**, so this is not a green overall CI certification.
- [Six-source-receipt calculator](../../scripts/agent26-prism-joint-rank6-public-six.cjs) and [two archive tests](../../tests/agent26-prism-joint-rank6-public-six.test.cjs) recompute exact fractions and veto altered authenticated original printings.
- Both test files were added to an existing manual-only Aichi statistical test step. No new automatic workflow, vendor edit or playing-policy mutation was added. The manually dispatched compiled workflow must be evaluated independently of local tests.
- The strict solver's optional explicit name caps can further tighten independently verified ACE SPEC or other one-copy effects. The default four-copy cap still yields a safe upper where such exceptions have not been supplied.
- To alter deck decisions, future work must demonstrate owner-visible source inference changing a real legal move, followed by consequential native and paper-valid opponent continuation.

**The target remains one fixed 60-card deck against all 32 Aichi originals. Exactly 29 original sixties are authenticated, all present games remain competitively unqualified, and no 99.5% win rate has been established.**
