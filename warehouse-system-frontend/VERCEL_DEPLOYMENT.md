# Vercel deployment

Deploy this directory as the Vercel project root:

```text
warehouse-system-frontend
```

Vercel configuration:

- Framework preset: Vite
- Root directory: `warehouse-system-frontend`
- Build command: `npm run build`
- Output directory: `dist`
- Install command: `npm install`

Set this environment variable in Vercel:

```text
VITE_API_BASE_URL=https://your-deployed-backend.example
```

The backend is not included in this Vercel deployment. Until the backend is deployed and reachable over HTTPS, authentication and API features will not work on the Vercel frontend.

After the frontend is deployed, add the exact Vercel origin to the backend CORS setting:

```text
CORS_ALLOWED_ORIGINS=https://your-project.vercel.app
```

For preview deployments, add each required preview origin or use a backend CORS configuration that validates approved preview domains.

The included `vercel.json` keeps React Router routes working by rewriting non asset requests to `index.html`.
