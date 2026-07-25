"""Export the FastAPI OpenAPI schema to a deterministic JSON file."""

from __future__ import annotations

import argparse
import json
from pathlib import Path
import sys

BACKEND_ROOT = Path(__file__).resolve().parents[1]
if str(BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(BACKEND_ROOT))

from app.main import app  # noqa: E402


def _replace_refs(value: object, replacements: dict[str, str]) -> None:
    """Keep generated references stable across supported Pydantic versions."""
    if isinstance(value, dict):
        for key, child in value.items():
            if isinstance(child, str) and child in replacements:
                value[key] = replacements[child]
            else:
                _replace_refs(child, replacements)
    elif isinstance(value, list):
        for child in value:
            _replace_refs(child, replacements)


def _normalize_openapi_schema(schema: dict[str, object]) -> dict[str, object]:
    """Normalize equivalent Pydantic input/output model names.

    Pydantic may emit separate ``-Input``/``-Output`` component names for
    discriminated unions depending on its patch version. The C4 model has an
    identical schema in both directions, so keeping one canonical component
    prevents harmless dependency drift from failing CI.
    """
    components = schema.get("components")
    if not isinstance(components, dict):
        return schema
    schemas = components.get("schemas")
    if not isinstance(schemas, dict):
        return schema

    input_name = "C4DiagramData-Input"
    output_name = "C4DiagramData-Output"
    canonical_name = "C4DiagramData"
    if input_name not in schemas or output_name not in schemas:
        return schema

    schemas[canonical_name] = schemas[input_name]
    del schemas[input_name]
    del schemas[output_name]
    _replace_refs(
        schema,
        {
            f"#/components/schemas/{input_name}": f"#/components/schemas/{canonical_name}",
            f"#/components/schemas/{output_name}": f"#/components/schemas/{canonical_name}",
        },
    )
    return schema


def export_openapi(output: Path) -> None:
    output.parent.mkdir(parents=True, exist_ok=True)
    schema = _normalize_openapi_schema(app.openapi())
    output.write_text(
        json.dumps(schema, ensure_ascii=False, indent=2, sort_keys=True) + "\n",
        encoding="utf-8",
    )


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--output",
        type=Path,
        default=Path(__file__).resolve().parents[1] / "openapi.json",
        help="Path to write the generated OpenAPI schema.",
    )
    return parser.parse_args()


if __name__ == "__main__":
    args = parse_args()
    export_openapi(args.output)
