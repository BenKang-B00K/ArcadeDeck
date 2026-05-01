import json
import os
import sys
from typing import Any, Dict

BASE_FILE = "en.json"

LANGS = [
    "ja", "ko", "zh", "fr", "de",
    "es", "es-LA", "pt", "ru", "vi"
]

META_KEYS = {"_comment", "label"}


def load(path: str) -> Dict:
    with open(path, encoding="utf-8") as f:
        return json.load(f)


def save(path: str, data: Dict):
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)


def is_empty(value: Any) -> bool:
    return value in ("", None) or value == {} or value == []


def merge(base: Any, overlay: Any) -> Any:
    """
    Recursively merge overlay onto base.
    Overlay wins only when value is non-empty.
    """
    if isinstance(base, dict):
        result = {}
        overlay = overlay or {}
        for k, v in base.items():
            if k in META_KEYS:
                result[k] = v
                continue
            result[k] = merge(v, overlay.get(k))
        return result

    if isinstance(base, list):
        if overlay and isinstance(overlay, list) and len(overlay) > 0:
            return overlay
        return base

    # primitive
    if not is_empty(overlay):
        return overlay
    return base


def validate_complete(node: Any, path="") -> bool:
    """
    Returns False if ANY translatable value is empty.
    """
    if isinstance(node, dict):
        for k, v in node.items():
            if k in META_KEYS:
                continue
            if not validate_complete(v, f"{path}.{k}" if path else k):
                return False
        return True

    if isinstance(node, list):
        return len(node) > 0

    return not is_empty(node)


def main():
    base = load(BASE_FILE)
    failed = False

    for lang in LANGS:
        lang_file = f"{lang}.json"
        if not os.path.exists(lang_file):
            print(f"❌ {lang}: missing base locale file")
            failed = True
            continue

        overlay = load(lang_file)
        merged = merge(base, overlay)

        out_file = f"{lang}.full.json"
        save(out_file, merged)

        if not validate_complete(merged):
            print(f"🚨 {lang}: unresolved missing translations")
            failed = True
        else:
            print(f"✅ {lang}: merge + validation OK")

    if failed:
        print("🚨 일부 언어에서 누락 발견 — 빌드 실패")
        sys.exit(1)

    # Cleanup missing.json files only on success
    for lang in LANGS:
        mf = f"{lang}.missing.json"
        if os.path.exists(mf):
            os.remove(mf)
            print(f"🧹 삭제: {mf}")

    print("🎉 모든 언어 병합 + 검증 성공")


if __name__ == "__main__":
    main()