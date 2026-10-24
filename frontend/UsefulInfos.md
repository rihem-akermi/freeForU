if we want to change port in Next 
1. Open your package.json file.
2. Locate the scripts object.
3. Append -p <port-number> to the dev and/or start

"scripts": {
  "dev": "next dev -p 4000",
  "build": "next build",
  "start": "next start -p 4000"
}