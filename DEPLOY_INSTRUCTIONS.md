# FinFit Schuldbeheer - Deployment Instructies

## GitHub Pages Deployment

Volg deze stappen om de FinFit Schuldbeheer applicatie te deployen naar GitHub Pages:

1. Maak een GitHub account aan als je die nog niet hebt op [GitHub](https://github.com)

2. Maak een nieuwe repository aan op GitHub:
   - Ga naar https://github.com/new
   - Vul een naam in voor je repository (bijv. "finfit-schuldbeheer")
   - Kies of je repository publiek of privé wilt maken
   - Klik op "Create repository"

3. Push je code naar GitHub met de volgende commando's:
   ```bash
   # Voeg de remote repository toe
   git remote add origin https://github.com/JOUW_USERNAME/finfit-schuldbeheer.git

   # Push de main branch
   git checkout main
   git push -u origin main

   # Push de gh-pages branch
   git checkout gh-pages
   git push -u origin gh-pages
   ```

4. Configureer GitHub Pages:
   - Ga naar je repository op GitHub
   - Klik op "Settings"
   - Scroll naar beneden naar de "GitHub Pages" sectie
   - Selecteer de "gh-pages" branch als bron
   - Klik op "Save"

5. Je site is nu gepubliceerd op:
   `https://JOUW_USERNAME.github.io/finfit-schuldbeheer/`

## Alternatieve Hosting Opties

### Netlify Deployment

1. Maak een account aan op [Netlify](https://netlify.com)
2. Klik op "New site from Git"
3. Kies GitHub als je Git provider
4. Selecteer je repository
5. Kies de branch die je wilt deployen (main of gh-pages)
6. Klik op "Deploy site"

### Vercel Deployment

1. Maak een account aan op [Vercel](https://vercel.com)
2. Klik op "Import Project"
3. Kies "Import Git Repository"
4. Vul de URL van je GitHub repository in
5. Klik op "Deploy"

## Backend API Deployment

Voor een volledig functionele applicatie moet je ook de backend API deployen. Hiervoor kun je services gebruiken zoals:

- [Render](https://render.com)
- [Heroku](https://heroku.com)
- [Railway](https://railway.app)

Instructies voor het deployen van de backend API:

1. Maak een account aan bij een van de bovenstaande services
2. Maak een nieuw web service project aan
3. Verbind het met je GitHub repository
4. Configureer de build settings:
   - Build command: `pip install -r requirements.txt`
   - Start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
5. Voeg eventuele environment variables toe
6. Deploy de service

Na het deployen van de backend API, update je de `apiUrl` in de frontend configuratie om naar je nieuwe backend API URL te wijzen.
