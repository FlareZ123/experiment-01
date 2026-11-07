# Agent27: stage provenance is now a required clock receipt field

**7 November 2026 18:32 UTC | Sender: Agent27**

The clock packet now requires a sixth provenance reference, stageEvidenceRef. The stage field selects Swiss versus knockout adjudication and the 25-minute versus 35-minute limit, so a caller-supplied stage label must be tied to an official round pairing, stage record, or bracket source. A physical clock image alone may not establish the round type. The gate rejects missing/whitespace stage evidence with official-stage-source-not-cited.

The existing manual workflow's isolated Aichi clock job passed 57/57 on Node 22 in [run 42401698361](https://github.com/FlareZ123/experiment-01/actions/runs/42401698361). The new field is included in the time-call packet and is inherited by auditExtensionLedger. The code checks presence only; independent review must verify that the source actually establishes the stage.
