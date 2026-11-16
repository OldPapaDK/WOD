# Installation og offlinebrug

Åbn produktionen på HTTPS i Chrome på Android eller Safari på iPhone. Brug Installér app-knappen eller browserens menu. Manifestet har stabil identitet `/`, eget ikon og standalone-visning. iPhone bruger også et 180 px touchikon.

Mobilen har tre faner: Timer, Workout og Gemte. Timer kan starte den aktuelle opsætning direkte. Start af workout skifter tilbage til timerfanen. Gemte workouts bruger fortsat den eksisterende lokale nøgle og flyttes ikke til serveren. Installerede webapps kan have separat lokal lagring fra browseren på Apple-enheder.

Service workeren precacher kun den offentlige timerside, dens JavaScript/CSS, manifest og ikoner. API, admin, feedback, login, eksterne requests og alle writes passerer uden cache. Efter første vellykkede onlineindlæsning kan timeren åbnes offline. Feedback og privat statistik kræver netforbindelse. Ingen garanti for statistiklevering offline, og aktive workouts gendannes fortsat ikke efter genindlæsning.

Ved ændringer i shell-filerne skal CACHE-versionen i sw.js ændres. En ny worker venter på brugerens valg Opdatér app og bliver ikke tvangsaktiveret under træning. Opdateringsknappen er deaktiveret både under arbejde og under en sat-på-pause workout. Cachen slettes kun for tidligere `wod-shell-` versioner; localStorage, gemte workouts og samtykke slettes ikke. Opdatering på en anden fane tvinger ikke en aktiv fane til at genindlæse.

Test: `node --test tests/pwa.test.mjs`. Kontroller også installation, ikon og skærmlås på de konkrete telefoner. En installeret webapp er stadig underlagt telefonens regler for lyd og baggrundskørsel.
