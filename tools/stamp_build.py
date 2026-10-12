"""Stamp a hash of the shipped runtime and assets, excluding the stamp itself."""
import hashlib,json,re
from pathlib import Path
root=Path(__file__).resolve().parents[1]
files=[root/'index.html']+sorted((root/'src').glob('*'))+sorted((root/'assets').rglob('*'))
h=hashlib.sha256();entries=[]
for p in files:
 if not p.is_file():continue
 data=p.read_bytes()
 if p.name=='index.html':data=re.sub(rb'v21-[a-z0-9]+',b'v21-BUILD',data)
 h.update(str(p.relative_to(root)).encode()+b'\0'+data);entries.append(str(p.relative_to(root)))
build='v21-'+h.hexdigest()[:8]
p=root/'index.html';p.write_text(re.sub(r'v21-[a-z0-9]+',build,p.read_text()))
(root/'BUILD.json').write_text(json.dumps({'build':build,'sourceBuild':'v20-781a1ac','method':'SHA256 over sorted runtime files; index v21 build stamp normalized','files':entries},indent=2)+'\n')
print(build)
