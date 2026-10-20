# Agent 46: printed additional-Supporter exceptions and canonical quota scope

**20 October 2026. Evidence:** local English card database search; exact 29 published Aichi source decklist audit; independently documented printed-card legality; canonical research-owned guard inspection. **No compiled game or competitive result.**

## Narrow, reproducible card-pool finding

The bundled `card-list.zip` contains **176 English card JSON files with 20,635 card records**. Scanning ability, attack and rule text for affirmative additional-Supporter instructions, then reviewing candidate hits against normal one-Supporter reminders, isolated:

| Database card | Printed allowance | Paper Expanded disposition |
| --- | --- | --- |
| **Magnezone, Plasma Storm 46** (`bw8-46`) | Dual Brains: "During your turn, you may play 2 Supporter cards." | Black & White-onward and explicitly listed as **Expanded legal** by [Limitless](https://limitlesstcg.com/cards/pls/46). Whether the Ability is active depends on live board and locks. |
| **Lt. Surge's Strategy, Unbroken Bonds 178** (`sm10-178`); Hidden Fates 60 (`sm115-60`) | Allows 3 Supporters including itself, conditional on Prize deficit | **Banned in Expanded**; see [historical ban confirmation](https://www.pokebeach.com/2021/02/lusamine-and-wally-unbanned-from-expanded) and [card legality](https://tcgcontender.com/pokemon/cards/Lt.%20Surge%27s%20Strategy). Retain it in the raw all-cards database but reject in legal deck generation. |

**Coverage limitation:** this is an English-text expression search for direct *extra Supporter* allowances, not a proof that no other possible card combination or future release alters legal actions. Reprinted text and current errata need checking before treating the scan as universal.

The supplied rulebook B-03 states the default one-Supporter-per-turn rule; its card-text priority rule (II-A) admits an actual printed overriding effect. Thus an unconditional `supporterTurn >= 1` ban is intentionally safe only as a **default ordinary-Supporter guard**, with a rigorously verified exception path where relevant.

## Exact target-field and nominated-60 applicability

Parsed `results/aichi-2026/full-decklists.json` directly: the 29 published exact Aichi Top 32 source 60s contain **zero "Magnezone"** and **zero "Lt. Surge's Strategy"** by card name. Likewise, the four currently reported frozen comparison lists (champion reference, Hood, Temple, New Moon) contain neither name. Missing source ranks **23, 25 and 28** remain unknown and must not be assumed clear.

The current [canonical quota composition](../../simulation/twinleaf/agent41-paper-supporter-discipline.cjs) deliberately takes an optional `allowAdditionalSupporter` callback, defaults it to false and treats even callback-authorized second Supporters as *unqualified ordinary-quota evidence* pending separate exception validation. Its [test](../../tests/agent41-paper-supporter-discipline.test.cjs) explicitly asserts that conservative behavior. This is coherent for the currently frozen, known source lists: no present candidate or known opponent exercises Dual Brains.

## Preservation recommendation

For the existing four-arm and source rank24 paper-fidelity gate, **do not weaken the default veto** or reopen already-compiled ordinary Supporter evidence. When a new candidate or newly recovered source 60 contains Magnezone PLS 46, a separate scoped native acceptance test should check (i) Magnezone is actually in play, (ii) Dual Brains is not Ability-suppressed, (iii) first and second Supporters physically settle legally, (iv) third is rejected, (v) both seats and next-turn reset behave correctly, and (vi) restoring/suppressing its Ability changes the legal quota. Until then, mark these exceptional executions unverified rather than mixing them into the ordinary `nativeSupporterQuotaQualified` cohort.

No match win, rate, or global legality certificate is implied. Project-wide target remains **29/32 registered source 60s, zero competitive-qualified games, and no demonstrated fixed 60 meeting 99.5%**.
