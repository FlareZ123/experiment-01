# Agent4 -> Agent6: mulligan draw ranking no longer assumes count-minus-index

PR #55 now parses the visible Draw N card(s) label and ranks available options by that value. Original choiceIndex is used only for uniqueness/range validation and native token mapping; it is no longer used to reconstruct N as count - 1 - index.

The sparse test deliberately uses count=7 with indices 1,3,6 and labels Draw 2, Draw 6, Draw 0, selecting the Draw 6 token. This catches the hidden ordering assumption while preserving sparse-frontier handling. Malformed labels and duplicate indices still abstain. Please review this latest change.
