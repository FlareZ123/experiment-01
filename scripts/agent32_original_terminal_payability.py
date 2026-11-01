"""Read-only rank-11 original-source Mega Absol attack alternative audit.

The supplied ZIP records are development evidence. No attack is replayed here.
"""
from __future__ import annotations

import argparse
import json
from collections import Counter
from pathlib import Path
from zipfile import ZipFile

PRINTED_TARGET_HP = {
    ("champion-reference", "Tapu Lele-GX"): 170,
    ("new-moon-lockbreaker-v1", "Unown"): 60,
}
CLAW_NATIVE_COST = [7, 7, 9]  # Darkness, Darkness, Colorless, from native printed attack


def audit(rows: list[dict]) -> dict:
    """Count observed dead Terminal Periods and printed-payable Claw alternatives.

    All facts use original source's public attack settlement and Store action
    ledger. The fixed printed HP map is separately verified from the card pool.
    """
    if len(rows) != 32 or len({r["trial"]["id"] for r in rows}) != 32:
        raise ValueError("Expected all 32 distinct frozen original attempt rows")
    totals = Counter()
    trials = []
    for row in rows:
        if row["trial"]["rank"] != 11:
            continue
        source_seat = row["sourceSeat"]
        candidate_seat = row["candidateSeat"]
        if {source_seat, candidate_seat} != {0, 1}:
            raise ValueError("Two physical seats must be distinct")
        ledger = {x["actionOrdinal"]: x for x in row["rootActionLedger"]}
        trial = row["trial"]
        counters = Counter()
        eligible_ordinals = []
        for effect in row["sourceAttackSettlement"]["attacks"]:
            if effect["attackName"] != "Terminal Period":
                continue
            counters["terminal_attacks"] += 1
            root = ledger.get(effect["actionOrdinal"])
            if (not root or root.get("action") != "AttackAction"
                or root.get("attack") != "Terminal Period"
                or root.get("playerSlot") != source_seat
                or root.get("turnBefore") != effect.get("turnBefore")
                or effect.get("settledPromptChain") is not True
                or effect.get("settlementCrossesClockReset") is True):
                raise ValueError("Original native Store root/settlement contract missing")
            before = effect["publicBoardBefore"]
            after = effect["publicBoardAfter"]
            if len(before) != 2 or len(after) != 2:
                raise ValueError("Incomplete two-seat public board")
            attacker = before[source_seat]["active"]
            defender = before[candidate_seat]["active"]
            if (attacker["name"] != "Mega Absol ex"
                or {"name": "Claw of Darkness", "cost": CLAW_NATIVE_COST}
                    not in attacker["printedAttacks"]):
                raise ValueError("Source printed Mega Absol alternative is not attested")
            if before == after:
                counters["unchanged_public_board"] += 1
            darkness_cards = attacker["energyCards"].count("Darkness Energy")
            if defender.get("damage") == 0:
                counters["defender_zero_damage"] += 1
            if darkness_cards >= 3 and defender.get("damage") != 60:
                counters["nominal_claw_payable_and_terminal_dead"] += 1
                hp = PRINTED_TARGET_HP.get((trial["candidateId"], defender["name"]))
                if hp is not None and 200 + defender["damage"] >= hp:
                    counters["nominal_printed_ko_if_unmodified"] += 1
                    eligible_ordinals.append(effect["actionOrdinal"])
        totals.update(counters)
        if counters["terminal_attacks"]:
            trials.append({"trialId": trial["id"],
                           "actualSourceStartsFirst": row["sourceActuallyFirst"],
                           "engineFinished": row["finished"],
                           "engineWinnerSlot": row["winner"],
                           "endReason": row["endReason"],
                           "counters": dict(counters),
                           "nominalClawKoRootOrdinals": eligible_ordinals})
    return {"schema": "agent32-original-rank11-terminal-payable-alternative-v1",
            "source": "original frozen v2 development ZIP; no gameplay rerun",
            "scheduledAttempts": len(rows),
            "rank11Attempts": sum(x["trial"]["rank"] == 11 for x in rows),
            "terminalsByTwoNativeGames": trials,
            "totals": dict(totals),
            "competitiveQualifiedGames": 0,
            "qualification": "Nominal printed cost and damage before modifiers only. No native Claw fork, poison/lock immunity check, policy equivalence, tournament clock, or win-rate inference."}


def audit_zip(path: Path) -> dict:
    with ZipFile(path) as archive:
        items = [name for name in archive.namelist()
                 if name.endswith("-native.json")]
        if len(items) != 1:
            raise ValueError("Expected one frozen native 32-arm JSON in ZIP")
        return audit(json.loads(archive.read(items[0]))["rows"])


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("archive", type=Path, help="frozen v2 original native ZIP")
    print(json.dumps(audit_zip(parser.parse_args().archive), indent=2))
