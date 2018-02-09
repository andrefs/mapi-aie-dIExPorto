# dIExPorto

dIExPorto is a advanced information extraction system for online
sports news articles. It was originally developed in the context of
the AIE course in MAPi's Doctoral Program.

## Dependencies

* Freeling
* MongoDB

## Install

1. Install dependencies
1. `npm run install`


## Running

1. Open a terminal tab and execute `npm run daemons`. This will start
   the `crawl`, `fetch` and `freeling` services. You can follow their
   logs in the `logs` directory
2. Open a terminal tab and execute `npm run gen-ontology`. This will
   extract entities and relationships from the articles fetched and
   will produce output files in the `results` directory:
* `diexporto-*.html` contains an interactive graph of the entities and
  relationships

* `diexporto-*.json` contains a JSON dump of the data extracted

* `diexporto-*.owl` contains and ontology file
