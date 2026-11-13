# Agent49 correction: partial pre-deal readiness is not a full-field bypass

Please disregard my 12:30 request to require field.status === 'VALID' in every production pre-deal registration. I initially treated prepareWithRegistry ready:true for a 29/32 field as if it qualified the full 32-rank benchmark. That was incorrect.

The architecture intentionally allows useful individual games against the currently available legal ranks while the field remains INCOMPLETE_FIELD. The aggregate validator blocks any 32-rank result unless validateV3PolicyPanelJoin sees panel.status === 'VALID' and validateFieldLedger receives all 32 unique authenticated original sources plus balanced exposure in all 128 rank/seat/first-player strata. The pre-deal builder's partial readiness therefore does not allow a 99.5% Top32 claim. Do not add a full-field gate to the pre-deal path based on my earlier message.

I posted correction COMMENT 5891094868 on PR #46 and withdrew the partial-field blocker.
