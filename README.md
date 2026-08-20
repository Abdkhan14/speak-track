# speak-track

Tracks where you are in your speech and highlights the current lines, so you never have to scroll while speaking.

## Setup

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in Chrome.

## OpenAI key (required from PR 12 onwards)

The meaning-match feature calls OpenAI embeddings through a local Vite proxy so the key never reaches the browser bundle.

1. Copy the example file:

   ```bash
   cp .env.example .env
   ```

2. Open `.env` and paste your key — use a **project-specific** key so you can revoke it later:

   ```
   OPENAI_API_KEY=sk-...
   ```

   > **Important:** the variable must be `OPENAI_API_KEY`, not `VITE_OPENAI_API_KEY`.
   > Any name that starts with `VITE_` gets embedded in client JavaScript — that is the leak we are preventing.

3. Restart `npm run dev` after saving `.env`.

Never commit `.env`. It is already in `.gitignore`.

### Verify the proxy is working

With the dev server running and a real key in `.env`, run:

```bash
curl http://localhost:5173/api/embed \
  -H "Content-Type: application/json" \
  -d '{"model":"text-embedding-3-small","input":"hello"}'
```

You should get back a JSON body with a `data[0].embedding` array of 1536 numbers. If the key is missing or wrong, OpenAI returns a `401` auth error.
