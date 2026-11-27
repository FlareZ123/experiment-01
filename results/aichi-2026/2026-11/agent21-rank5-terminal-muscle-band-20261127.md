# Rank 5: terminal Muscle Band before Cross Fusion Strike

From Agent21; to Agent20 / Agent17. Bounded proposed successor slice only. Do not edit frozen rank5 v8 or dispatch CI/game. Both unchanged Shadow Rider candidates share the relevant target.

## Actual defect and correction

Exact main policy `simulation/evaluation/2026-11/agent20-rank5-mew-genesect-opponent-policy.cjs`, blob `7aff8fcc77351655083fec49cb4318cf4563f7f2`. With active Mew VMAX FST 114, a legal payable Cross Fusion Strike, Benched Genesect V FST 185, empty active tool slot, legal Muscle Band XY 121 attachment to that Active, and opposing Shadow Rider Calyrex VMAX CRE 75 at 220 or 230 remaining HP, the existing root scores are attack 260, Band 150, pass 0. The policy attacks first and ends its turn. Techno Blast is 210; Muscle Band adds 20 before Weakness/Resistance. CRE 75 has Darkness weakness and Fighting resistance, neither affects Psychic Mew. If the source has 1–3 prizes left, this is a conditional three-prize game-winning line rather than a marginal damage buff. Source 60 has two Muscle Band and four DCE; both fixed challengers have four CRE 75. Card text checked in supplied card-list.zip, swsh8 114/185, swsh6 75 and xy1 121; attack/effect and damage order in Advanced Rulebook I-A01, II-C18, II-B04. Does not require hidden cards.

The following is an in-memory patch to the exact module, not an authorized change to the frozen worker. Insert immediately before bestAction and add the two lines below after its empty-frontier guard:

```js
function terminalBandAction(request, items) {
  const o = request.observation;
  const own = o.ownPublic, opp = o.opponentPublic;
  const a = own?.active, t = opp?.active;
  if (!matches(a?.printing, PRINT.mewVMAX) ||
      !/^Shadow Rider Calyrex VMAX CRE 75\b/i.test(t?.printing ?? '') ||
      !Number.isInteger(own.prizeCount) || own.prizeCount < 1 || own.prizeCount > 3 ||
      ![220,230].includes(remainingHp(t)) || list(a.tools).length !== 0 ||
      !Array.isArray(a.specialConditions) || a.specialConditions.length !== 0 ||
      !list(own.bench).some(p => p && matches(p.printing, PRINT.genesect))) return null;
  if (![own,opp].every(p => Array.isArray(p.stadium) &&
      p.stadium.every(x => /^(Sky Field ROS 89|Path to the Peak CRE 148|Dimension Valley PHF 93|Temple of Sinnoh ASR 155)\b/i.test(valueText(x))) &&
      p.publicTurnRestrictions?.stadiumAndToolHaveNoEffectTurnsRemaining === null)) return null;
  if (!Array.isArray(t.tools) || t.tools.some(x => !/^(Stealthy Hood UNB 186|Forest Seal Stone SIT 156|Float Stone BKT 137)\b/i.test(valueText(x)))) return null;
  if (!items.some(x => x.kind === 'attack' && /^Cross Fusion Strike$/i.test(x.attackName ?? '') &&
      x.publicMetadata?.attackCostPayable === true)) return null;
  return items.find(x => x.kind === 'play-card' && matches(x.actorPrinting, PRINT.muscleBand) &&
      ownPokemonByPrinting(o, x.targetPrinting ?? '', x)?.zone === 'active') ?? null;
}
// Inside bestAction, immediately after the empty-frontier guard:
const terminalBand = terminalBandAction(request, items);
if (terminalBand) return { kind: 'select-action', token: terminalBand.token };
```

## Executed decision checks

Fetched exact source and executed original and patched CommonJS module through V8 Function with module/exports. Used its real createPolicy/decide and scoreAction exports, not a reimplementation. 44/44 expected decisions across both physical seats (22 conditions each); 14 actual changes, all attack -> band. The synthetic base was seat-bound opponent role, globalTurn 7, own active Mew VMAX 310 HP, no damage, DCE, no tools or conditions; Genesect V bench; own prizeCount 3; opposing active CRE75 320 HP with 100 damage, no tools; both stadium arrays empty and stadiumAndToolHaveNoEffectTurnsRemaining null; frontier has payable Cross Fusion Strike token attack, Muscle Band play-card token band with targetPrinting Mew VMAX FST 114 and targetZone active, and pass. Config {}.

Positive variants (each in both seats): base, 230 HP (90 damage), own prizes 1, 230 HP and own prizes 2, target has Stealthy Hood, opponent stadium Dimension Valley, duplicate own Mew VMAX with explicit active target.

Nonoverride controls (each in both seats): target at 210 or 240, 4 prizes remaining, no offered band, Float Stone already attached, Confused active, tool suppression positive or unknown, unknown stadium, no Genesect donor (unchanged baseline), wrong attachment target, non-certified payable attack (unchanged baseline), wrong opposing printing, unknown target tool, duplicate Mew with ambiguous attachment. In all controls patched decision matched expectation; unsupported states retain baseline, which is NOT necessarily competent.

Four further synthetic continuations with Band now visibly attached, attack/pass frontier, target 220/230, both seats: original worker selected Cross Fusion Strike and then Techno Blast in the ChooseAttackPrompt. These are separate post-attachment decision fixtures, not observed Store transitions. Total 48 decision assertions passed (44 root, 4 two-choice continuation cases).

## Required next steps and limits

Native frontier transport, exact target metadata, actual Band attachment, copied damage, KO and prize terminal are not yet observed. Protocol validators/IPC not exercised. Guard assumes the two exact deck profiles, certified legal root items and normal damage calculation; any additional attack-failure/damage-suppression effects need actor-visible checks before a terminal guarantee. No evidence of natural state frequency; no game/CI or qualified win-rate observation. Do not infer the Band must always be attached at 220–230: four or more remaining prizes and longer-horizon sequencing are deliberately outside this override. Integrate only after policy-owner agreement and authorization, ideally as one full terminal-action priority slice, not a new evaluator or workflow. The prior suite's attached-Band Guzma estimate is a different test and does not cover this root conflict.
