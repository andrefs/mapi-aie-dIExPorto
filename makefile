# NEW

fetch:
	scripts/fetch & echo $$! > logs/fetch.pid

crawl:
	scripts/crawl & echo $$! > logs/crawl.pid

freeling:
	scripts/freeling & echo $$! > logs/freeling.pid

show_daemons:
	ps aux | grep -P 'crawl|fetch|freeling|fl_analyze'


# OLD

TXTS=$(wildcard txts/*.txt)
JSONS=$(subs .txt,.json,cenas.txt)

htmls/%.html: urls/*
	scripts/fetch_urls urls htmls

txts/%.txt: htmls/%.html
	scripts/clean_html $@ %<

jsons/%.json: txts/%.txt
	scripts/freeling $< $@

NER:
	grep NP00000 jsons/*.json  | grep -o '"form"\s*:\s*"[^"]\+"' | sed 's/"form"\s*:\s*//' | sort | uniq -c | sort -nr


