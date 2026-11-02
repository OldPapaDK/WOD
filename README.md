# WOD Timer
Dansk webapp med AMRAP, For Time op/ned, EMOM med ekstra skiftetid, TABATA og MIX.

## GitHub og Vercel
Læg filerne i roden af dit GitHub repository. Importér det i Vercel. Vælg Framework Preset: Other. Ingen installation, buildkommando eller særlig outputmappe er nødvendig. Vercel serverer index.html direkte. Brug HTTPS, så skærmlås kan fungere.

## Lokal kørsel
Kør `python3 -m http.server 8000` fra mappen, og åbn http://localhost:8000. JavaScript bruger moduler, så åbn ikke index.html direkte som en fil.

## Kontrol
Kør `node engine.test.mjs`.

## Funktioner
Alle tider indtastes i sekunder. Runder gentages pr. sæt. Pausen mellem sæt erstatter den almindelige pause ved sætskift. Der tilføjes ingen afsluttende pause. MIX har en valgfri pause efter hver blok undtagen den sidste. Du kan omarrangere og slette blokke.

For Time har en fast tidsgrænse uanset timerretning. EMOM kan bruge vilkårlig intervallængde og valgfri ekstra skiftetid. Dette er en udvidet intervalfunktion; med skiftetid over nul starter intervallerne ikke præcist hvert minut.

Workouts gemmes lokalt i browseren og deles ikke mellem enheder. Der er ingen konto, database eller login. En aktiv workout overlever ikke genindlæsning. Appen forsøger at advare før siden forlades.

Lyd aktiveres ved tryk på Start. Tre afsluttende bip, et særskilt skiftesignal og valgfrit halvvejssignal per arbejdsinterval. Meget korte intervaller prioriterer de sidste tre sekunders bip over halvvejssignalet. Skærmlås kræver browserstøtte, HTTPS og en synlig fane. Telefonens baggrundsbegrænsninger kan suspendere lyd og timeropdateringer; ved genåbning beregnes korrekt position fra forløbet tid. Fuld skærm afhænger af browseren. Afprøv lyd og skærmlås på din egen telefon før træning.

Første version. Timerens logik er automatisk testet; visning, lyd, fuld skærm og skærmlås skal stadig testes på fysiske enheder.
