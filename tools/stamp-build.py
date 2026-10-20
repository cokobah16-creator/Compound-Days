"""Stamp a deterministic digest of the playable files, excluding the stamp itself."""
from pathlib import Path
import hashlib,re
root=Path(__file__).resolve().parents[1]/'dist'
h=hashlib.sha256()
for p in sorted(x for x in root.rglob('*') if x.is_file()):
    data=p.read_bytes()
    if p.name=='index.html':data=re.sub(rb"const BUILD_ID='[^']+';",b"const BUILD_ID='CONTENT-HASH';",data)
    h.update(p.relative_to(root).as_posix().encode()+b'\0'+data)
build='v33-'+h.hexdigest()[:8]
p=root/'index.html';p.write_text(re.sub(r"const BUILD_ID='[^']+';",f"const BUILD_ID='{build}';",p.read_text()))
print(build)
