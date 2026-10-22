"""Check the canonical manually dispatched research workflow before a GitHub push.

Requires PyYAML 6.x. Runs locally or as an explicitly invoked test.
No Actions trigger or simulator is created by this module.
"""
from __future__ import annotations

import re
from pathlib import Path

import yaml

MAX_DISPATCH_INPUTS = 25
CANONICAL_WORKFLOW = Path(".github/workflows/agent7-canonical-actor-bilateral.yml")
_INPUT_REF = re.compile(r"(?<![\w.])(?:github\.event\.)?inputs\.([a-zA-Z_][\w-]*)")


class UniqueKeyLoader(yaml.BaseLoader):
    """Parse YAML without coercing 'on' to a Boolean and reject duplicate keys."""

    def construct_mapping(self, node: yaml.MappingNode, deep: bool = False) -> dict:
        result = {}
        for key, value in self.construct_pairs(node, deep=deep):
            if key in result:
                raise ValueError(f"Duplicate YAML mapping key: {key}")
            result[key] = value
        return result


def check_dispatch_contract(contents: str, *, path: str = "<workflow>") -> dict:
    """Audit the trigger, input limit, and all declared job input references.

    A syntactic connection does not establish policy or engine correctness.
    """
    document = yaml.load(contents, Loader=UniqueKeyLoader)
    if not isinstance(document, dict):
        raise ValueError(f"{path}: expected a YAML mapping")
    events = document.get("on")
    if not isinstance(events, dict) or set(events) != {"workflow_dispatch"}:
        raise ValueError(f"{path}: canonical workflow must be manual-only")
    config = events["workflow_dispatch"]
    if not isinstance(config, dict) or not isinstance(config.get("inputs"), dict):
        raise ValueError(f"{path}: workflow_dispatch.inputs must be a mapping")
    inputs = config["inputs"]
    if len(inputs) > MAX_DISPATCH_INPUTS:
        raise ValueError(f"{path}: {len(inputs)} dispatch inputs exceeds {MAX_DISPATCH_INPUTS}")
    if not isinstance(document.get("jobs"), dict) or not document["jobs"]:
        raise ValueError(f"{path}: expected at least one job")

    for name, item in inputs.items():
        if not isinstance(item, dict):
            raise ValueError(f"{path}: malformed dispatch input {name}")
        if item.get("type") not in {"boolean", "choice", "number", "string", "environment"}:
            raise ValueError(f"{path}: unsupported input type for {name}")
        if item.get("type") == "boolean" and item.get("default") not in {"true", "false"}:
            raise ValueError(f"{path}: boolean {name} requires explicit true/false default")

    # Restrict reference check to job definitions, excluding self-declarations.
    job_text = yaml.safe_dump(document["jobs"], sort_keys=False)
    used = set(_INPUT_REF.findall(job_text))
    dead = set(inputs) - used
    unknown = used - set(inputs)
    if dead or unknown:
        raise ValueError(
            f"{path}: dispatch mapping mismatch: "
            f"unused={sorted(dead)}, undeclared={sorted(unknown)}"
        )
    return {
        "workflow": path,
        "events": ["workflow_dispatch"],
        "dispatch_input_count": len(inputs),
        "dispatch_limit": MAX_DISPATCH_INPUTS,
        "inputs_referenced": len(used),
        "all_inputs_referenced": True,
        "claims_policy_semantics_validated": False,
    }


def check_canonical_file(root: Path = Path(".")) -> dict:
    """Read the repository's canonical workflow by path and audit it."""
    path = root / CANONICAL_WORKFLOW
    return check_dispatch_contract(path.read_text(encoding="utf-8"), path=str(path))


if __name__ == "__main__":
    import json

    print(json.dumps(check_canonical_file(), indent=2, sort_keys=True))
