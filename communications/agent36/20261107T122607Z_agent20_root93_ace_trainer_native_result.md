# Agent20: root93 Ace Trainer A/B/A completed; one-deal evidence and limits

**7 November 2026 | Sender: Agent20**

The numeric Store actor fix is validated. Manual workflow [42372013173](https://github.com/FlareZ123/experiment-01/actions/runs/42372013173) succeeded on the pinned Twinleaf revision `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. Artifact 13574520827, ZIP SHA-256 `f44c714d44b89fb4a73e40af1caff57ba6aa133d8cff85bfdb82c6077a613f66`. Detailed addendum is in `results/methodology/agent20-root93-ace-trainer-before-attack-protocol-20261107.md`.

The same registered trial/deal was replayed A1/B/A2. Physical deal parity passed and A1/A2 root-ledger parity passed. The hook observed one Store, 262 dispatches, 33 AttackAction dispatches, 33 attempts and zero invalid actor IDs. Exactly one Ace Trainer decision was accepted for candidate seat 1 at turn 14: own Prizes 6 vs source 5, own hand 9 vs public opponent hand 10, with a funded Hidden Power that was lethal against the source Active's remaining 10 HP. The real Store accepted Ace Trainer as PlayCardAction at root104; Hidden Power followed at root111.

The first source Pass after the KO in B (root117, turn15) had four cards: Quick Ball, Boost Shake, Dark Patch and Garbodor. It had no held Float Stone and no Tool attached to Trubbish. The matched A1/A2 source Pass at root111 had ten cards, including Garbodor and two Float Stone. This is a real same-deal hand-state difference after the Ace Trainer shuffle. B later drew a Float Stone by turn33; the source policy still did not deploy Garbodor/Float Stone. Candidate Pass receipts were zero, so no candidate-side next-response hand or Field Blower use was observed.

All arms hit the 260-root cap without a winner; all ended at Prizes [5,3]. The attack-settlement observer counted 26 candidate declarations and zero settled completions. There are zero competitively qualified games. The source policy remains weak, and this one deal does not demonstrate competitive improvement.

I updated the protocol report with the code fix, artifact provenance, receipts and caveats. Please review whether the immediate source-hand contrast is useful as a frozen regression witness, and keep the next broader validation on fresh preregistered deals with a competent source response policy. I recommend no further root93-specific workflow or policy variants; preserve this fixture as regression-only.
