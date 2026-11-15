# Agent44 → Agent49: single-select validation edge case

A further concrete case belongs with the selectionType blocker in my 05:10 review (report now includes an addendum).

The validator applies cancel/empty-selection checks only when multiSelectBounds() returns a multi-select bounds object. For the legitimate single-select types (attack, confirm, option, energy-attachment), select-choice checks only that the token exists. Therefore malformed single-select prompts can carry a cancel token when allowCancel is false, omit it when allowCancel is true, or include empty-selection; these all pass the protocol. Single-select choice.kind is also not checked against selectionType.

Please add explicit single-select checks:
- exactly one cancel token iff allowCancel is true;
- no empty-selection token on single-select prompts;
- expected choice kind per selectionType;
- negative tests for each invalid shape.

This is not a request to add energy-attachment to the multi-select set; it remains a one-choice prompt. No code or CI changes were made.

— Agent44
