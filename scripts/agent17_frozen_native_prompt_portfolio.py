"""Read-only portfolio of actual Store prompt families in a frozen bilateral archive.

Usage: python scripts/agent17_frozen_native_prompt_portfolio.py ARCHIVE.zip
The JSON output is aggregated; no owner hand or selected-card contents are emitted.
This is evidence inventory, never a paper-legality certificate.
"""
from collections import Counter
import hashlib
import json
from pathlib import Path
import sys
from zipfile import ZipFile

PROTOCOL = "agent17-frozen-v2-prompt-denominator-v1"


def audit_archive(path):
    path = Path(path)
    raw_bytes = path.read_bytes()
    with ZipFile(path) as archive:
        filenames = [
            name for name in archive.namelist()
            if name.endswith("-native.json")
        ]
        if len(filenames) != 1:
            raise ValueError("Expected exactly one frozen native JSON")
        data = json.loads(archive.read(filenames[0]))
    return audit_native(data, hashlib.sha256(raw_bytes).hexdigest())


def audit_native(data, archive_sha256="synthetic"):
    rows = data["rows"]
    if len(rows) != data["attempted"] or len(rows) != data["expectedAttempts"]:
        raise ValueError("Attempt denominator mismatch")
    seen = set()
    families = Counter()
    seats = Counter()
    printing_links = Counter()
    printing_examples = Counter()
    choose = Counter()
    select_option = Counter()
    energy = Counter()
    gaps = Counter()
    source_rows = []

    for row in rows:
        trial_id = row["trial"]["id"]
        if trial_id in seen:
            raise ValueError("Duplicate trial")
        seen.add(trial_id)
        ledger = row["rootActionLedger"]
        if len(ledger) != row["rootActionCount"] or len(ledger) != row["actionCount"]:
            raise ValueError("Root-action ledger is incomplete")
        for ordinal, event in enumerate(ledger):
            if event["actionOrdinal"] != ordinal:
                raise ValueError("Root ordinals are discontinuous")

        choices = {e["ordinal"]: e for e in row["nativePromptChoices"]["events"]}
        if len(choices) != len(row["nativePromptChoices"]["events"]):
            raise ValueError("Duplicate choice receipt ordinal")
        sidecar = {
            e["rootActionOrdinal"]: e
            for e in row["nativeAcceptedTargetSidecar"]["events"]
            if e.get("rootActionOrdinal") is not None
        }
        for ordinal, event in enumerate(ledger):
            if event["action"] != "ResolvePromptAction":
                continue
            family = event["pendingPrompt"]
            seat = "source" if event["playerSlot"] == row["sourceSeat"] else "candidate"
            families[family] += 1
            seats[(family, seat)] += 1
            parent_ordinal = event["initiatingRootActionOrdinal"]
            if parent_ordinal is None:
                parent = None
                parent_action = "no-linked-root"
            else:
                if not isinstance(parent_ordinal, int) or not 0 <= parent_ordinal < ordinal:
                    raise ValueError("Invalid prompt parent ordinal")
                parent = ledger[parent_ordinal]
                parent_action = parent["action"]
            if parent_action == "PlayCardAction":
                card = sidecar.get(parent_ordinal, {}).get("declared", {}).get("ownerHandPrinting")
                if card:
                    printing_links[family] += 1
                    printing_examples[(family, card)] += 1

            if family in ("ChooseCardsPrompt", "SelectOptionPrompt"):
                choice = choices.get(ordinal)
                if choice is None or choice["kind"] != family or choice["actorSeat"] != event["playerSlot"]:
                    raise ValueError("Missing/misaligned owner choice receipt")
                if family == "ChooseCardsPrompt":
                    selected = choice["selectedCards"]
                    indices = choice["selectedIndices"]
                    if isinstance(selected, list):
                        count = len(selected)
                    elif isinstance(indices, list):
                        count = len(indices)
                    else:
                        count = None
                    if count is None:
                        choose["selection-payload-unobserved"] += 1
                        gaps[(trial_id, parent.get("attack") if parent else None)] += 1
                    elif choice["nativePromptMin"] <= count <= choice["nativePromptMax"]:
                        choose["native-bounds-consistent"] += 1
                    else:
                        choose["native-bounds-inconsistent"] += 1
                    choose["recorded"] += 1
                else:
                    if not isinstance(choice.get("selectedOption"), int):
                        raise ValueError("No selected option ordinal")
                    select_option["recorded"] += 1
            elif ordinal in choices:
                raise ValueError("Misclassified choice event")
        if sum(1 for e in ledger if e["action"] == "ResolvePromptAction" and e["pendingPrompt"] in ("ChooseCardsPrompt", "SelectOptionPrompt")) != len(choices):
            raise ValueError("Choice receipts and prompt roots differ")

        side = row["nativeAcceptedEnergyPromptSidecar"]
        count = sum(e["pendingPrompt"] == "AttachEnergyPrompt" for e in ledger if e["action"] == "ResolvePromptAction")
        if side["acceptedEnergyPromptResolutions"] != count or len(side["events"]) != count:
            raise ValueError("Energy prompt sidecar is incomplete")
        energy["native-accepted"] += count
        energy["publicly-changed"] += side["publiclyChangedResolutions"]
        energy["public-delta-unobserved"] += side["publicDeltaUnobserved"]
        source_rows.append({
            "trial": trial_id,
            "root_actions": len(ledger),
            "prompts": sum(e["action"] == "ResolvePromptAction" for e in ledger),
            "status": "engine-terminal" if row["finished"] else "censored",
        })

    return {
        "protocol": PROTOCOL,
        "archive_sha256": archive_sha256,
        "research_commit": data["researchHeadCommit"],
        "vendor_pin": data["nativePin"],
        "attempts": len(rows),
        "root_actions": sum(r["rootActionCount"] for r in rows),
        "prompt_resolutions": sum(families.values()),
        "families": [
            {
                "family": family,
                "native_instances": count,
                "source_instances": seats[(family, "source")],
                "candidate_instances": seats[(family, "candidate")],
                "exact_printing_links_from_played_cards": printing_links[family],
                "paper_verified": 0,
                "paper_invalid": 0,
                "paper_unverified": count,
            }
            for family, count in sorted(families.items(), key=lambda pair: (-pair[1], pair[0]))
        ],
        "played_card_printings": [
            {"family": family, "printing": printing, "native_instances": count}
            for (family, printing), count in sorted(printing_examples.items())
        ],
        "choose_cards": dict(choose),
        "select_option": dict(select_option),
        "attach_energy": dict(energy),
        "unobserved_selection_groups": [
            {"trial": trial, "initiator_attack": attack, "count": count}
            for (trial, attack), count in sorted(gaps.items())
        ],
        "statuses": dict(Counter(r["status"] for r in source_rows)),
        "paper_prompt_verdict": "PAPER_PROMPT_UNVERIFIED",
        "note": (
            "Only native root and selective physical receipts were audited. "
            "Recorded native min/max bounds and public deltas do not prove "
            "independent printed-card contract validity. Untested prompts "
            "must never be labeled legal or illegal from this archive."
        ),
    }


if __name__ == "__main__":
    print(json.dumps(audit_archive(sys.argv[1]), indent=2, sort_keys=True))
