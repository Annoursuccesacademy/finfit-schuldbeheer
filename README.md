# FinFit: Schuldbeheer Assistent

Een moderne schuldbeheer applicatie voor het effectief beheren van cliëntschulden.

## Functionaliteiten

- Cliëntgegevens beheer
- Schuld registratie en overzicht
- Betalingsschema's genereren
- Rapportage en analyse
- Automatische herinneringen

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
