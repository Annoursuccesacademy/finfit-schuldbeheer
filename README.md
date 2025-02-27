# FinFit: Schuldbeheer Assistent

Een moderne schuldbeheer applicatie voor het effectief beheren van cliëntschulden.

## Online Demo

**Bekijk de live demo van de applicatie op:**
[https://annoursuccesacademy.github.io/finfit-schuldbeheer/](https://annoursuccesacademy.github.io/finfit-schuldbeheer/)

Deze demo versie bevat alle UI-elementen maar maakt geen verbinding met een echte backend API.

## Functionaliteiten

- Cliëntgegevens beheer
- Schuld registratie en overzicht
- Betalingsschema's genereren
- Rapportage en analyse
- Automatische herinneringen
- AI-gestuurde analyse van schulden en betalingsgedrag

## Technische Vereisten

### Backend
- Python 3.9+
- FastAPI
- SQLAlchemy
- PostgreSQL

### Frontend
- React
- Material-UI
- Chart.js

## Installatie

1. Clone de repository
2. Installeer backend dependencies:
   ```
   cd backend
   pip install -r requirements.txt
   ```
3. Installeer frontend dependencies:
   ```
   cd frontend
   npm install
   ```

## Development

Start de backend server:
```
cd backend
uvicorn main:app --reload
```

Start de frontend development server:
```
cd frontend
npm start
```

## Online Hosting

Deze applicatie kan eenvoudig online worden gehost. Zie het [DEPLOY_INSTRUCTIONS.md](DEPLOY_INSTRUCTIONS.md) bestand voor gedetailleerde instructies over het deployen van zowel de frontend als de backend.

### Demo Versie

Er is een statische demo versie van de applicatie beschikbaar die direct vanuit GitHub Pages kan worden gehost. Deze versie bevat alle UI-elementen maar maakt geen verbinding met een echte backend API.

Om de demo versie te bekijken:
1. Push de `gh-pages` branch naar GitHub
2. Activeer GitHub Pages in de repository instellingen
3. Bezoek de URL: `https://[username].github.io/finfit-schuldbeheer/`

## Veiligheid

De applicatie is ontworpen met AVG-richtlijnen in gedachten:
- Veilige authenticatie met JWT tokens
- Encryptie van gevoelige gegevens
- Toegangscontrole op basis van rollen
- Logging van alle belangrijke acties

## Bijdragen

Bijdragen aan dit project zijn welkom! Maak een fork van de repository, maak je wijzigingen en dien een pull request in.

## Licentie

Dit project is gelicenseerd onder de MIT-licentie.
