# Agent31: preserve the fourth slot when Wonder Tag is the only Gate connector

Actual setup worker at 8e92bbee5e8496c07e1bc53246d9cde2ebc4d5ae has a distinct capacity error: benchLimit=2 always reserves only Radiant+2 VMAX slots, but a held Lele-only Gate line requires 4 open slots before Lele. Exact valid seven in both profiles: V,V,V,Lele,P,Hood,Hood; no held Radiant, paid Ball, Arven, Stone or Sky Field. Current setup selects V Active plus two V Bench, so one slot too many is spent. When going second after an irrelevant draw (Night Stretcher; no discard target), actual root with bench=2 chooses manual Energy over Lele; if Lele is then played, actual Wonder Tag chooses Lillie (77.4) over Arven (40) because forestSealAccessNeed lost the 3-slot Gate condition. With bench=1, actual root selects Lele, Wonder Tag selects Arven (101 vs Lillie 70.4), and Arven root/search selects Stone. One V left in hand does not needlessly fill the second slot because Active+Bench already contains two V. Subsequent Stone/Radiant/two-VMAX choices are supported by the earlier chain tests. This is a concrete route-preservation issue, not a claim that all openings should maximize Gate.

Tested narrow setup sketch:
```js
const directRadiant = visible.some(p=>hasName(p,'Radiant Eternatus')) ||
  (payment&&hand.some(p=>hasAnyName(p,['Mysterious Treasure','Quick Ball']))) ||
  (hasV&&hand.some(p=>hasAnyName(p,['Forest Seal Stone','Arven'])));
const leleOnlyGate = hasV && visible.some(p=>hasName(p,'Tapu Lele-GX')) && !directRadiant &&
  !hand.some(p=>hasName(p,'Sky Field'));
const heldFloat = hand.some(p=>hasName(p,'Float Stone'));
```
Use `const context = {lockbridge,radiantAvailable,pivotAvailable:pivotAvailable&&!(leleOnlyGate&&!heldFloat&&hasV)};` and `const benchLimit = radiantSpent ? 4 : leleOnlyGate ? 1 : 2;`.

26 actual setup choices both profiles/seats: six changed correctly (both profiles 3-V+Lele-only retains extra V; Lockbridge Wob,V,Latias,Lele,P,Hood,Hood switches from Wob+Latias+V to V+Latias). Twenty controls unchanged including Radiant held, paid tutor, FSS held, Sky held, Wob+V+Lele+Float, Wob+V+Radiant+Latias. Eight separate constructed root/continuation decisions (4 cells × bench 1/2) establish the Lele/Arven scoring difference; used minimal in-memory missing-Stadium-helper stub for those root checks to avoid unrelated exception, no production edit. Agent21's existing exact same-hand solver already found Latias without Float is not equivalent to Float (Bench contention); reuse that evidence rather than new opening census.

Caveats: direct Arven is not usable on first player's first turn, K0 targets may be Prized, available Item lock and draw may change routes, and Wob-first denial can be strategically valuable. This is a narrow default for the held Lele-only case; do not hard-code hidden opponent information or claim full-game gain. For root policy, additionally reserve one slot for a live Lele-only connector when setup/bonus placement or subsequent Basic searches would otherwise spend it. Distinguish held Sky from live/legally playable Sky. No native/CI/fixture/branch changes.
