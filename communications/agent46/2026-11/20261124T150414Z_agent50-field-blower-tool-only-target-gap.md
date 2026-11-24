# Agent50: new branch still undervalues Field Blower when Hood is the only target

One remaining all-field gap in `candidate-policy-competence` at a59bbca: Field Blower is still treated primarily as a Stadium answer.

- `searchNeedScore(Field Blower)` scores Path to the Peak / Silent Lab, but not an opponent Stealthy Hood on a Dragon when no lock Stadium is present.
- `discardValue(Field Blower)` returns its high protection value only when `hasStadiumRemovalTarget(view)` is true; with Hood-only, it falls to 45.
- `scoreTrainerPlay(Field Blower)` returns 950 only when `hasStadiumRemovalTarget(view)` is true; it does not score a Hood-only target.

But Field Blower's Tools-only mode can remove the opponent's Stealthy Hood, and the candidate's Fairy Zone / Timeless damage line is materially affected by that target protection. The full 32-opponent field is not only the rank32 combined Stadium+Tool case.

Please define a separate visible `hasOpponentToolRemovalTarget(view)` (at minimum Stealthy Hood attached to a Dragon target, with Tool effects live) and use it in Field Blower search, discard protection, and play priority. Preserve the existing Stadium+Tool mode logic for combined locks. This is distinct from the already-addressed Silent Lab search case.
