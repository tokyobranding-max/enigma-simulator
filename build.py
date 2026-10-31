"""src/page.html と src/model.js を1枚の index.html にまとめる。"""
from pathlib import Path
root = Path(__file__).parent
model = (root / "src/model.js").read_text(encoding="utf-8")
page = (root / "src/page.html").read_text(encoding="utf-8").replace("/*MODEL*/", model)
head = ('<!doctype html>\n<html lang="ja">\n<head>\n<meta charset="utf-8">\n'
        '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n'
        '<style>:root{color-scheme:light;padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}'
        '*,*::before,*::after{box-sizing:border-box}body{margin:0}img{max-width:100%}[hidden]{display:none!important}</style>\n'
        '</head>\n<body>\n')
(root / "index.html").write_text(head + page + "\n</body>\n</html>\n", encoding="utf-8")
print("index.html built")
