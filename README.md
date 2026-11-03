# WOD Timer
Dansk træningstimer med AMRAP, For Time op/ned, EMOM med ekstra skiftetid, TABATA og MIX. Tidsvælger i minutter:sekunder og trin på 15 sekunder. Eksisterende 20/10 Tabata-værdier bevares. Workouts gemmes lokalt i browseren.

## Hosting
Vercel Other, output directory `.`, install command `npm ci`, ingen build command. Node 24. API-ruter i `api/` anvender Vercel Functions. Brug HTTPS. Koden kan ikke længere køres fuldt med en almindelig statisk filserver; timeren kan vises statisk, men statistik og feedback kræver API.

## Privat testdashboard
`/admin` åbner login. `WOD_ADMIN_HASH` indeholder salt og scrypt-hash af den eneste administratorkode, og `WOD_SESSION_SECRET` bruges af iron-session til den krypterede login-cookie. Der er ingen offentlig registrering af administratorer. Login-cookie er Secure, HttpOnly, SameSite=Strict og udløber efter otte timer. Koden og hemmelighederne må aldrig lægges i Git. Rotér administratorkoden ved at erstatte hashen; rotér sessionshemmeligheden for at logge alle sessioner ud.

Private testdata gemmes i projektets private Vercel Blob store i Frankfurt via serverens `BLOB_READ_WRITE_TOKEN`. Loginforsøg begrænses i den fælles lagring til ti pr. IP-hash pr. 15-minutters vindue. Indsamling har en supplerende in-memory begrænsning pr. function-instans; det er ikke et distribueret værn mod målrettet misbrug.

Testdata sendes kun efter testerens aktive ja. Valget kan ændres nederst på forsiden. Kun et tilfældigt ID pr. sideåbning bruges; ingen vedvarende personidentifikator, workouttekst, rå IP-adresse eller browserfingeraftryk gemmes i statistikken. Statistik: sideåbninger, start, gennemførelse, tidlig afslutning, pause/genoptagelse og tre grove fejlkategorier. Demoer tælles separat. Fejlkategorier registreres højst én gang pr. besøg. Der er ikke historiske data fra tiden før denne funktion.

Feedback kan sendes uafhængigt af statistikvalget og inkluderer testerens fritekst og svar om lyd/skærm. Formularen beder om at undlade personlige oplysninger. Feedback kan slettes enkeltvis i dashboardet. Data beholdes, indtil administrator sletter dem. En knap sletter data ældre end 90 dage; dette er ikke en automatisk opbevaringsfrist.

Dashboardet viser 7, 30 eller 90 dage. Det er til en lille testgruppe: højst 200 statistikposter pr. sideåbning, 2000 sideåbninger og 500 feedbackposter pr. dashboardlæsning. Hvis lagerlisten bliver afkortet, vises en advarsel om ufuldstændige tal. En større offentlig lancering bør migrere statistik til en database og anvende en mere omfattende misbrugsbeskyttelse. Indsamlingen er best effort, ikke en garanteret levering ved offlinebrug eller lukning af browseren.

## Tests
`npm ci` og `npm test` tester filtrering af data, statistik, adgangskontrol, scrypt-verifikation, afvisning af fremmede origins og manglende samtykke. `node engine.test.mjs` tester timeren. Lyd sammen med musik, fuld skærm og skærmlås skal også testes på de konkrete telefoner.
