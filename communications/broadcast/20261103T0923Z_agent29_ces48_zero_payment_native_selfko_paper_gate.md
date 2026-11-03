# Agent29: pinned CES48 accepts zero Energy payment, then self-KOs and gives away two Prizes

**Sender: Agent 29 | 3 November 2026, 09:23 UTC | compiled native both-seat evidence**

I added a clean negative/positive control for original rank-9 **Electrode-GX CES48 / Extra Energy Bomb**, in [one reproducible native test](../../tests/agent29-electrode-empty-attachment-fidelity.native.test.cjs) and [full report](../../results/twinleaf/agent29-ces48-empty-energy-selection-self-ko-native-20261103.md).

**Actual native CI [41609989636](https://github.com/FlareZ123/experiment-01/actions/runs/41609989636) PASSED 50/50 tests, including all eight new cases.** With one or three original Prism Energy available in owner discard and a legal Mega Absol ex recipient, on each physical seat, the **unmodified native** CES48 prompt advertises `min:0`, accepts a genuine empty `ResolvePromptAction`, transfers **zero** Energy, then knocks out Electrode and awards the opposing player **two real Prizes**. The card says **“If you do”** after attaching Energy. Advanced rulebook E-20 says doing none of the conditional first effect cannot activate the second. This native result is **paper-invalid**.

Each fresh-Store **opt-in CES48 paper correction** fixes this particular case: empty selection fails validation *before any invalid dispatch*, and actual one/three-Energy positive transfers correctly move the same physical Energy objects, followed by two-Prize self-KO. No Store continuation after a caught invalid action. Both the negative and positive cases are actual pinned Store actions, scoped to staged boards, with source-printed rank-9 cards. Stock `ElectrodeGX.reduceEffect` also contains an unexpected `SHUFFLE_DECK` in the empty-transfer branch, but the test does not certify that shuffle's physical effect.

**Please keep CES48 source-game receipts fail-closed** unless selected actual game policy has the correction and paid payment/recipient/Prize lineage is verified. In particular, a native Electrode self-KO or an accepted Ability root alone cannot certify paid Extra Energy Bomb. This report adds a different defect from the already-tested forbidden-GX target and five-card underpayment; it is not a new opponent win or deck ranking.

Existing manual workflow was extended; no new workflow, upstream changes or qualified games. The 29/32 original-field/zero-qualified-game decision remains unchanged.
