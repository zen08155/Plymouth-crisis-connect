# Bouwprompt: Plymouth Crisis Connect met FastAPI en SQL

Je werkt in de bestaande repository `Plymouth-crisis-connect`. Verbeter de huidige applicatie zonder er een Django-project van te maken. Behoud de bestaande React/Vite-frontend en FastAPI-backend. Vervang de tijdelijke Python dictionary in `fake_database.py` door een echte relationele SQL-database.

Lees eerst de volledige codebase. Behoud bestaande routes, vormgeving en werkende functionaliteit waar mogelijk. Ruim pas oude bestanden op nadat hun functionaliteit correct is vervangen en getest.

## Projectdoel

Plymouth Crisis Connect coördineert vrijwilligers tijdens rampen en maatschappelijke crisissituaties in Plymouth. Het platform koppelt vrijwilligers aan incidenten en projecten, toont actieve situaties op een kaart en ondersteunt teams, rollen en managementstatistieken.

## Technologie

- Python 3.12+
- FastAPI
- SQLAlchemy 2
- PostgreSQL als productie- en Docker-database
- Alembic voor database migrations
- Pydantic voor request- en responsevalidatie
- `psycopg` als PostgreSQL-driver
- `bcrypt` of `passlib` voor wachtwoordhashing
- Veilige server-side sessies met een willekeurige session ID in een `HttpOnly`-cookie
- `pytest` en FastAPI `TestClient`
- Bestaande React/Vite-frontend
- Docker en Docker Compose
- FastAPI OpenAPI-documentatie

Gebruik geen Django, Django REST Framework of Django ORM.

Gebruik geen authenticatietoken in `localStorage` of `sessionStorage`. De browser ontvangt na login een veilige `HttpOnly`-sessioncookie. De React-frontend gebruikt bij API-calls `credentials: "include"`.

## Rollen en rechten

De applicatie heeft drie rollen:

### System Manager

- Bekijkt alle geregistreerde gebruikers.
- Wijzigt gebruikersrollen.
- Promoveert volunteers naar coordinator.
- Activeert en deactiveert accounts.
- Bekijkt actieve incidenten, projecten en managementstatistieken.

### Coordinator

- Maakt en beheert incidenten en projecten.
- Beheert teams, taken en teamleiders.
- Mag deelnemers uit eigen projecten verwijderen met een verplichte reden.
- Mag volunteers nooit gedwongen aan een incident of project toevoegen.

### Volunteer

- Registreert zichzelf.
- Beheert profiel, vaardigheden en beschikbaarheid.
- Kiest zelf aan welke incidenten en projecten die deelneemt.
- Ontvangt passende suggesties op basis van vaardigheden en beschikbaarheid.

Dwing rechten altijd af in de FastAPI-backend met herbruikbare dependencies. Vertrouw nooit alleen op frontendcontroles.

## Architectuur

Gebruik een duidelijke gelaagde structuur die bij FastAPI past:

```text
app/
  main.py
  api/
    dependencies.py
    routers/
      auth.py
      users.py
      incidents.py
      participation.py
      teams.py
      dashboard.py
  core/
    config.py
    security.py
  database/
    session.py
    base.py
  models/
    user.py
    skill.py
    incident.py
    participation.py
    team.py
    notification.py
    session.py
  repositories/
  schemas/
  services/
```

Verantwoordelijkheden:

- SQLAlchemy-modellen beschrijven databasegegevens en relaties.
- Pydantic-schema's valideren API-input en bepalen API-output.
- Repositories voeren databasequery's uit.
- Services bevatten business rules en use cases.
- Routers behandelen alleen HTTP, dependencies en responsecodes.
- Dependencies verzorgen authenticatie, database sessions en rolvalidatie.

Maak routers dun. Plaats geen SQL-query's in React of grote business rules rechtstreeks in endpoints.

## SQL-datamodel

Gebruik foreign keys, constraints, indexes, timestamps en consistente snake_case-kolomnamen.

### users

- `id`
- `email`, uniek en case-insensitive behandeld
- `password_hash`
- `first_name`
- `last_name`
- `role`: `system_manager`, `coordinator`, `volunteer`
- `phone_number` als `VARCHAR`, zodat `+31...` geldig is
- `date_of_birth`
- `is_active`
- `on_call`
- `availability_status`
- `average_response_time_seconds`
- `created_at`
- `updated_at`

### skills

- `id`
- `title`
- `description`
- `category`
- `requires_certificate`

### volunteer_skills

- `id`
- `user_id`
- `skill_id`
- `description`
- `is_certified`
- `certificate_name`
- `certificate_url`
- `certificate_expires_at`
- `course_taken_at`

Voeg een unique constraint toe voor `user_id + skill_id`.

### incidents

- `id`
- `title`
- `description`
- `incident_type`
- `latitude`
- `longitude`
- `priority`: `low`, `normal`, `high`, `critical`
- `status`: `open`, `in_progress`, `closed`
- `created_by_id`
- `started_at`
- `ended_at`
- `ended_by_id`
- `is_project`
- `project_name`
- `progress_percent`, beperkt tot 0-100
- `created_at`
- `updated_at`

Voeg indexes toe voor status, priority, incident type, projectstatus en veelgebruikte dashboardfilters.

### participations

- `id`
- `volunteer_id`
- `incident_id`
- `status`: `joined`, `active`, `completed`, `removed`, `left`
- `joined_at`
- `responded_at`
- `ended_at`
- `removed_by_id`
- `removal_reason`

Voeg een unique constraint toe voor `volunteer_id + incident_id`.

### teams

- `id`
- `incident_id`
- `name`
- `coordinator_id`
- `team_leader_id`
- `task`
- `created_at`
- `updated_at`

### team_memberships

- `id`
- `team_id`
- `volunteer_id`
- `joined_at`

Voeg een unique constraint toe voor `team_id + volunteer_id`.

### notifications

- `id`
- `user_id`
- `title`
- `message`
- `notification_type`
- `is_read`
- `created_at`

### user_sessions

- `id`
- `session_token_hash`
- `user_id`
- `expires_at`
- `created_at`
- `last_used_at`
- `revoked_at`

Sla alleen een hash van de session token op. Verwijder of blokkeer verlopen en ingetrokken sessies.

## Authenticatie

Implementeer of behoud:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`

Eisen:

- Registratie maakt standaard een volunteer.
- Login werkt voor alle rollen.
- Wachtwoorden worden veilig gehasht en nooit teruggestuurd.
- Login maakt een databasesessie en zet een `HttpOnly`-cookie.
- De cookie gebruikt `Secure` in productie, `SameSite=Lax` en een beperkte levensduur.
- `/api/auth/me` leest de gebruiker uit de actieve databasesessie.
- Logout trekt de sessie in en verwijdert de cookie.
- Een gebruiker blijft ingelogd bij navigeren en vernieuwen.
- Voeg rate limiting toe aan login.
- Configureer CORS alleen voor toegestane frontend-origins.
- Gebruik CSRF-bescherming voor muterende requests met cookie-authenticatie.
- Na login navigeert React automatisch naar het juiste scherm voor de rol.

## API-functionaliteit

### Gebruikers en rollen

- Gebruikerslijst met zoeken, filters en paginering.
- Gebruikersdetails.
- Rol wijzigen.
- Volunteer promoveren naar coordinator.
- Gebruiker activeren en deactiveren.
- Voorkom dat de laatste actieve system manager wordt gedeactiveerd of gedegradeerd.

### Incidenten en projecten

- CRUD voor coordinators.
- Actieve incidenten en projecten ophalen.
- Filter op type, prioriteit, status, project en datumbereik.
- Sorteer `critical` en `high` bovenaan.
- Alleen de eigenaar of een system manager mag een incident beheren.
- Incident sluiten registreert tijd en uitvoerende gebruiker.

### Deelname en matching

- Volunteer kan zichzelf aanmelden en afmelden.
- Coordinator kan geen volunteer gedwongen aanmelden.
- Coordinator kan een deelnemer uit een eigen project verwijderen met reden.
- Geef suggesties op basis van skills, beschikbaarheid, prioriteit en eventueel afstand.
- Bereken response time vanuit incidentstart en eerste reactie.

### Teams

- Team aanmaken voor een incident.
- Teamleider benoemen.
- Alleen deelnemers van hetzelfde incident aan het team koppelen.
- Taken per team beheren.

### Dashboard

Lever endpoints voor:

- aantal actieve volunteers
- aantal open incidenten
- open incidenten per prioriteit en type
- actieve projecten en voortgang
- gemiddelde response time
- volunteer participation
- activiteit per dag of week
- incident heatmap met latitude, longitude en gewicht
- gecombineerde real-time managementinformatie

Ondersteun waar relevant filters op incident, project, type, priority, status en datumbereik.

Gebruik efficiënte SQLAlchemy-query's met joins, eager loading en databaseaggregaties. Voorkom N+1-query's.

## API-responses

Behoud een consistent formaat:

```json
{
  "success": true,
  "message": "Active incidents loaded.",
  "data": []
}
```

Gebruik correcte HTTP-statuscodes. Geef begrijpelijke validatiefouten terug. Gebruik geen brede `except Exception` zonder logging en gerichte foutafhandeling.

## Migratie van de huidige code

1. Analyseer de huidige FastAPI-routes, fake database, repositories, modellen, React API-calls en tests.
2. Maak een mapping van de bestaande dictionaryvelden naar SQL-tabellen en ORM-modellen.
3. Voeg SQLAlchemy en Alembic toe zonder direct werkende routes te verwijderen.
4. Bouw repositories om zodat zij een SQLAlchemy `Session` gebruiken.
5. Verplaats business rules uit `SystemManager.py` naar services waar nodig.
6. Maak een initiële Alembic migration.
7. Maak een seedscript met realistische Plymouth-testdata en testaccounts.
8. Vervang de in-memory login sessions door SQL-sessies en cookies.
9. Pas `app/views/api.ts` aan naar `credentials: "include"` en CSRF.
10. Behoud bestaande frontendroutes en rolgestuurde navigatie.
11. Verwijder `fake_database.py` pas wanneer alle queries en tests via SQL werken.
12. Ruim ongebruikte bestanden, imports en dependencies op.

Geen volledige rewrite uitvoeren als bestaande code veilig kan worden aangepast.

## Docker

Docker Compose bevat minimaal:

- React/Vite frontend
- FastAPI backend
- PostgreSQL

Voeg toe:

- database healthcheck
- backend healthcheck
- environment variables
- `.env.example`
- persistent PostgreSQL-volume
- gecontroleerd uitvoeren van Alembic migrations

Plaats geen wachtwoorden of andere secrets in Git.

## Tests

Schrijf tests voor minimaal:

- registratie als volunteer
- login, sessiebehoud, `/me` en logout
- toegang per rol
- promotie naar coordinator
- verboden promotie door niet-managers
- gebruikersfilters en paginering
- incident CRUD en ownership
- vrijwillig deelnemen en verlaten
- verbod op gedwongen aanmelden
- verwijderen door bevoegde coordinator met verplichte reden
- prioriteitssortering
- teams en memberships
- dashboardfilters en aggregaties
- SQL constraints
- verlopen of ingetrokken sessies
- CSRF en ongeauthenticeerde requests

Gebruik voor tests een geïsoleerde SQL-testdatabase. Voer backendtests, frontendbuild en relevante integratietests uit.

## Acceptatiecriteria

- De backend blijft FastAPI.
- De frontend blijft React/Vite.
- De applicatie gebruikt PostgreSQL en geen Python dictionary.
- Databasewijzigingen worden beheerd met Alembic.
- Login gebruikt een veilige server-side databasesessie.
- Profiel openen vereist niet opnieuw inloggen.
- Alle rollen worden na login naar het juiste scherm gestuurd.
- Rollen worden backend-side afgedwongen.
- Internationale telefoonnummers zoals `+31...` werken.
- De kaart haalt actieve incidenten en filters uit de SQL-database.
- Dashboarddata komt uit echte SQL-query's.
- Tests slagen.
- `docker compose up` start de volledige applicatie.
- README beschrijft installatie, migrations, seeddata, testaccounts en testcommando's.

## Werkwijze

Werk zelfstandig door tot de SQL-migratie functioneel en getest is. Lees bestanden voordat je ze wijzigt. Behoud bestaande gebruikerswijzigingen en voorkom ongerelateerde redesigns.

Sluit af met:

- gewijzigde architectuur
- belangrijkste endpoints
- database en migrations
- testresultaten
- lokale URL's
- bekende beperkingen
