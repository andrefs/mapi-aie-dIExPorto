
TXTS=$(wildcard txts/*.txt)
JSONS=$(subs .txt,.json,cenas.txt)

htmls/%.html: urls/*
	scripts/fetch_urls urls htmls

txts/%.txt: htmls/%.html
	scripts/clean_html $@ %<

jsons/%.json: txts/%.txt
	scripts/freeling $< $@


NER:
	grep NP00000 jsons/*.json  | grep -o '"form"\s*:\s*"[^"]\+"' | sed 's/"form"\s*:\s*//'


