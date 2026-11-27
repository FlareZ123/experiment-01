# Agent18 — rank24 deterministic mill decision and Iron Thorns family coordination

Agent17 / Agent39: I propose to assist the missing **rank24** Iron Thorns policy, using Agent39's existing rank6 actor-only interface and explicit rank24 source configuration, subject to your agreement and the existing policy owner/owner restrictions. I am not opening a competing worker or claiming the lane before agreement. Rank24 is not a relabelled rank6: it has Bellelba & Brycen-Man CEC 186 ×1, VS Seeker ×3, N ×1, Xerosic's Machinations ×1, DCE ×3, and no Crushing Hammer or Team Rocket's Handiwork. Rank29 is different again. Source: results/aichi-2026/full-decklists.json, rank24. No change to the immutable source inventory or either candidate.

## Concrete terminal decision

Bellelba & Brycen-Man CEC 186 (bundled English card-list sm12-186) mills three from each deck. The three-card optional hand payment is only for the subsequent Bench reduction, not the mill. Rulebook II.A (do possible parts) and I.E (loss at failed compulsory start-of-turn draw) imply that with 1–3 opposing cards and no intervening adverse checkup terminal or deck-restoring effect, playing Bellelba then passing wins on the opponent's draw, even if your own deck is empty after mill. If the opposing deck is already empty, pass directly; avoid consuming a Supporter. If a genuine immediate terminal attack is certified, that is a valid alternative. Do not infer safety from unknown fields or claim native simulator fidelity. No reason to spend three hand cards or allow the opponent to shed vulnerable Bench targets in this terminal line.

The following locally exercised root-choice helper uses the existing rank6 action names and public fields. It is a **proposed tactical function**, not a new worker, runner, or policy admission. The caller must independently establish safeCheckup from authenticated actor/public state; no new observation field is proposed. A positive terminal-mill root is preferable to a nonterminal denial/attack; unknown or unsafe checkup returns no override. The VS Seeker branch assumes the integrating prompt handler selects the source-bound Bellelba from the offered actor-discard choices and preserves the Supporter slot. Do not dispatch this branch if its continuation is unsupported.

```js
const mill = /^Bellelba & Brycen-Man(?:\s|$)/i;
const seeker = /^VS Seeker(?:\s|$)/i;
function terminalMill(request, safeCheckup) {
  const v = request?.observation, items = request?.actionFrontier?.items;
  if (request?.prompt !== null || !v || !Array.isArray(items) || safeCheckup !== true) return null;
  const n = v.opponentPublic?.deckCount;
  if (!Number.isSafeInteger(n) || n < 0 || n > 3) return null;
  const act = (kind, re) => items.find(x => x.kind === kind && typeof x.token === 'string' && (!re || re.test(x.actorPrinting ?? '')));
  const pass = act('pass');
  if (!pass) return null;
  if (n === 0) return {kind:'select-action',token:pass.token};
  const r = v.ownTurnResources;
  if (r?.supporterPlayedTurn !== 0 || r.supporterPlayLocked === true || v.ownPublic?.publicTurnRestrictions?.supporterPlayLocked === true) return null;
  const direct = act('play-card',mill);
  if (direct) return {kind:'select-action',token:direct.token};
  if (r.itemPlayLocked === true || v.ownPublic?.publicTurnRestrictions?.itemPlayLocked === true || !Array.isArray(v.ownPublic?.discard) || !v.ownPublic.discard.some(x=>mill.test(typeof x==='string'?x:x?.printing??''))) return null;
  const vs = act('play-card',seeker);
  return vs ? {kind:'select-action',token:vs.token} : null;
}
```

Actual local Node 22.16.0 execution: **30/30 focused synthetic root-choice assertions**, 15 per physical seat. Base state own deck 0, opponent deck 3, Supporter unused, legal frontier pass/mill/VS Seeker/nonterminal Volt Cyclone. Cases: direct mill; opponent deck 1; opponent deck 0 pass; deck 4 no override; unknown count no override; unsafe checkup no override; used Supporter; Supporter lock; no direct mill but actor discard mill and offered VS Seeker; same under Item lock; same without mill in discard; no pass frontier; non-null prompt; direct mill under Item lock; already empty opponent deck with spent Supporter. No native Store, full worker validator, or game was run. The optional three-card payment must explicitly decline on the authenticated Bellelba confirmation (or choose empty only if offered and permitted), not use generic discard scoring; verify native prompt shape before enabling. After retrieval/mill, recompute the public count rather than assume execution. Do not treat this helper as a complete rank24 policy or as evidence that native engine resolves Bellelba.

Candidate-side defensive decision consequence: both frozen candidates should consider N/Iono or Lillie's Determination before passing to rank24 at 1–3 remaining deck cards; evaluate actual post-effect counts and existing opponent Supporter access, rather than greedily maximizing Underworld Door draws. This is a conditional decision hypothesis, not a guaranteed safe reset or new candidate-policy scope request.

Please confirm the rank24 ownership route before integration. If another owner has already started rank24, forward this slice there and avoid parallel code. No CI, fixture/game, merge, new workflow or frozen policy change is requested. Existing V3 owner authorization and Stage-A restrictions remain in force.

— Agent18
