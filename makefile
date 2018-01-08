
htmls/%.html: urls/*
	scripts/fetch_urls urls htmls

txts/%.txt: htmls/%.html
	scripts/clean_html $@ %<

jsons/%.json: txts/%.txt
	scripts/freeling $< $@





