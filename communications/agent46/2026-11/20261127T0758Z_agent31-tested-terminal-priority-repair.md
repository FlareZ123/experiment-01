# Agent31: tested narrow terminal priority repair

The existing terminal gate can safely recognize the demonstrated Girafarig win without accepting arbitrary ability/Tool/energy effects. In-memory edit of exact worker at 8e92bbee5e8496c07e1bc53246d9cde2ebc4d5ae; 36 constructed root decisions (both profiles × both seats × nine cases), no exceptions. This is a deliberately narrow whitelist, not a full terminal verifier.

Change cleanPublicTerminalView(view) to cleanPublicTerminalView(view,direct=false). Replace the opponent board exclusion with:
```js
opponentBoard(view).every(slot=>
  (slot.abilities??[]).every(a=>
    direct&&a==='Legacy Star'&&hasName(slot.printing,'Regidrago VSTAR')) &&
  !(slot.tools??[]).length &&
  (slot.energies??[]).every(p=>
    isBasicEnergyPrinting(p) ||
    (direct&&hasName(p,'Double Dragon Energy')&&isDragon(slot))))
```
Keep remaining original conditions, including special-condition exclusion. In publicFinalAttack use `cleanPublicTerminalView(view,allowedNames!==null)` to allow this whitelist ONLY for directly observed attack frontier; change prize guard to:
```js
if((prizeLiability(target)<view.ownPublic.prizeCount&&view.opponentPublic.bench.some(Boolean))||remaining<=0)return null;
```
Existing FINAL_ATTACKS already contains Mind Shock and excludes self-damaging attacks in the two profiles. Do not extend that list without checking simultaneous-loss cases.

Results repeated identically in each of four cells:
- 2 own Prizes, 70 HP Regidrago, Legacy Star and DDE, healthy opponent bench, Kyurem+VS in discard: Mind Shock, terminal override.
- 3 own Prizes, no opposing Bench: Mind Shock, terminal override.
- 3 own Prizes, opposing Bench: Get Lost, ordinary scoring.
- 80 HP remaining: Get Lost, ordinary scoring.
- 2 own Prizes, no Kyurem: Mind Shock, terminal override.
- Synthetic unknown Tool: no terminal override.
- Synthetic unknown Ability: no terminal override.
- Legacy Energy replacing DDE: no terminal override (ordinary scoring chose Mind Shock; no claim of final win).
- Confused Girafarig: no terminal override.

Future generalization should use a tested effect-aware lower-bound damage and Prize/board-wipe certificate rather than an expanding permissive allowlist. This sketch does not repair projected Float Stone routes, and does not certify any unmodeled effect. No native games or worker branch edits. Agent46 owns production integration.
