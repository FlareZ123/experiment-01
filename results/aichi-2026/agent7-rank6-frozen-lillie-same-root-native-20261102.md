# Original frozen rank6 candidate turn4 Pass: genuine Store-cloned Lillie's Determination settles twice

**Agent7 | 2026-11-02 | Verified compiled native detached Store diagnostic, retrospectively selected exact roots. Zero competitive game certificates.**

## Immutable native source and question

Original frozen, single selected bilateral policy: `simulation/evaluation/agent20-frozen-rank6-canary-v1.json` with profile SHA256 `6ff3ee325098cfc68253928a9dd5370da52c9cc64b86a4435be2b07a0d392dc6`, four registered original-rank6 games, exact printed-sixties and physical player seats. Two candidate-seat-A trials share original-source physical fingerprint `ea76cd9d80563dcaf904b404b39b64c3c9aed8ea5a1bae9b9b843221a853c82f`, seed `430745698`. The frozen source had executed turn3 Guzma & Hala -> Thunder Mountain P* + DCE -> Volt Cyclone for one Prize. Both candidates then selected immediate `PassTurnAction` at their global turn4 while retaining owned `Lillie's Determination M1L`.

Question: At the **exact same, actual post-choice owner turn4 Pass states**, will a detached pinned Store accept and settle legal-looking Lillie, or was its presence in the owner's hand merely a misleading apparent opportunity?

## Method

`simulation/twinleaf/agent7-frozen-candidate-lillie-pass-clone.cjs` wraps `Store.prototype.dispatch` reversibly around the **unchanged original frozen `runFrozenCanary()`**. It counts genuine real Store instances (each identified by its `AddPlayerAction`), detects candidate physical seat A's selected turn4 `PassTurnAction`, and copies the entire state internally into a new Store using pinned `deepClone`. For that candidate only, it tries `PlayCardAction` with its own held printed Lillie at the same original root, deterministically settles each prompt in the detached Store, and checks Lillie physical departure from owner hand to owner discard, Supporter quota, remaining turn, hand and deck counts. The alternate action is **never dispatched to the original match**. It does not read concealed opponent card identities into the decision, does not replace a selected action and makes no claim about whether playing Lillie dominates Pass. Pure owner-ordinal wrapper tests 3/3 pass.

`simulation/evaluation/agent7-frozen-rank6-lillie-pass-clone.cjs` joins these exact native Pass roots to the four original selected registration IDs and physical source fingerprints; separate output `agent7-frozen-rank6-lillie-pass-clone-output.json` is written atomically/locked and never edits the frozen historical v1 disposition. CI **[41480647001](https://github.com/FlareZ123/experiment-01/actions/runs/41480647001) SUCCESS**, source head `6d940413ac35304ed1460ebfbd7c0f467e2068f7`, pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`, artifact **[13159607685](https://github.com/FlareZ123/experiment-01/actions/runs/41480647001/artifacts/13159607685)**, ZIP SHA256 `b7c8e7ab23596f01de6032833bd176c584642f1b1812dc66995d3c77442cddfa`. Frozen v1 four arms and physical source-pair audit still pass; no source card or gameplay action was changed.

## Actual independent same-root receipts

| Registered original case | Original native candidate Pass ordinal | Held Lillie, quota | Native same-root cloned Lillie | Prompt chain | Final owner hand/deck | Draw & paper-local source check |
|---|---:|---|---|---|---|---|
| `6:0:A:champion-reference` | 36 | 1 in 6-card hand, Supporter quota 0 | Accepted | Wait, ShuffleDeck, Wait all resolved | 8 hand, 41 deck | 8-card draw, quota 1, physical Lillie in discard |
| `6:0:A:new-moon-lockbreaker-v1` | 34 | 1 in 6-card hand, Supporter quota 0 | Accepted | Wait, ShuffleDeck, Wait all resolved | 8 hand, 41 deck | 8-card draw, quota 1, physical Lillie in discard |

For both: owner deck initially 44, six remaining Prizes, original turn4 preserved in detached clone. The chosen alternate uses no additional input cards, so the expected post-effect deck equals `44 + (6−1) −8 = 41` and hand equals `8`; the native result matches. Both detached cases finish with `outcome='NATIVE_LILLIE_SETTLED'` and `printedDrawCountVerified:true`. Physical source deal, original Pass and root ordinal are anchored to the original raw native Store ledger, rather than inferred from a hand list alone.

**Interpretation:** the original policy demonstrably chose Pass at two real decision states with an executable and fully native-settled Lillie shuffle-and-draw alternative. This is actionable evidence of policy *resource coverage weakness*. It does **not** prove Lillie is the preferred strategic action, because card shuffle discards the current hand's tactical selection and downstream responses may differ; it does not prove alternate outcomes or benchmark win-rate changes. The two games share a physical source seed, so they are not independent trials.

## Next intervention gate

The next **prospectively registered, unchanged-60** bilateral policy should evaluate Lillie vs Pass as a true selected action, record original and altered owner follow-through and opponent response in both physical seats with independent new seeds, and validate opponent Supporter quotas and game-clock rules. A separate natural G&H owner-hand-to-discard receipt is under test by Agent7; no whole-game paper certificate is implied by the localized Lillie result.

The shared method gap remains 29/32 authenticated original source sixties, zero competitively qualified games, no selected fixed 60, and no validated 99.5% performance claim.
