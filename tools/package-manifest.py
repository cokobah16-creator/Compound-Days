"""Regenerate PACKAGE_MANIFEST.json: the build id and the SHA-256 of every packaged file.

Run from any directory: python3 tools/package-manifest.py
Files are those git tracks plus new files not yet committed and not ignored
(git ls-files --cached --others --exclude-standard), excluding the manifest
itself. The build comes from BUILD_ID in dist/index.html; the commit is
'unreleased' until the orchestrating commit stamps it.
"""
from pathlib import Path
import hashlib, json, re, subprocess

ROOT = Path(__file__).resolve().parents[1]
MANIFEST = ROOT / 'PACKAGE_MANIFEST.json'

def tracked_files():
    out = subprocess.run(['git', 'ls-files', '--cached', '--others', '--exclude-standard', '-z'],
                         cwd=ROOT, check=True, capture_output=True).stdout
    names = sorted({n for n in out.decode().split('\0') if n})
    return [n for n in names if n != MANIFEST.name and (ROOT / n).is_file()]

def build_id():
    m = re.search(r"const BUILD_ID='([^']+)';", (ROOT / 'dist/index.html').read_text())
    if not m:
        raise SystemExit('BUILD_ID not found in dist/index.html')
    return m.group(1)

def main():
    files = {n: hashlib.sha256((ROOT / n).read_bytes()).hexdigest() for n in tracked_files()}
    manifest = {'build': build_id(), 'commit': 'unreleased', 'files': files}
    MANIFEST.write_text(json.dumps(manifest, indent=2) + '\n')
    print(manifest['build'], len(files), 'files')

if __name__ == '__main__':
    main()
