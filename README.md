# napita-mobile

The **Ñapita** phone app for iPhone and Android: surprise bags (*bolsas sorpresa*) from bakeries, cafés and restaurants in your Colombian neighborhood, at the end of the day.

Built with [Expo](https://expo.dev) (React Native), TypeScript and Expo Router: one codebase for both phones.

## How it fits with the other repos

| Repo | What's in it |
|---|---|
| [`Napita-docs`](https://github.com/NapitaService/Napita-docs) (docs) | Product rules, design, flows and decisions. **Read this first.** No code. |
| `napita-mobile` (this repo) | The app |
| `napita-backend` (not created yet) | Supabase: database, sign-in, payments logic |

The design this app copies lives in the docs repo: [`design/README.md`](https://github.com/NapitaService/Napita-docs/blob/main/design/README.md) and the [live design canvas](https://claude.ai/artifact/B2sY1G2J96dGMaJ7rf6u9G).

## What works today

- **Welcome screen** with an ES / EN switch, "Ver lugares cerca de mí" and "Tengo un negocio".
- **Customer mode**, 5 tabs built to match the design: Descubrir, Mapa, Pedidos, Favoritos, Perfil.
- **Create an account / sign in** (Welcome → "Crea tu cuenta", or Perfil): celular + 6-digit code only, with warnings for numbers that can't be a Colombian mobile. For now nothing is sent and any 6 digits work. See decision 0005 in the docs repo.
- **Business mode**, 4 tabs. **Hoy** (today's numbers, who's coming) and **Bolsas** (your bags, +/− quantity, "Publicar hoy") are built, and **Entregas** (hand over orders) is built; Negocio is a placeholder.
- **Hand over an order** on Entregas: scan the customer's QR with the camera (asks for camera permission the first time), type their 4-digit code (confirms on the last digit), or tap "Entregar" next to their name. A green "Entregado" screen with "Deshacer" follows; a wrong code shows "Este código no coincide". Counts on Hoy and Bolsas update. To try the scan, open Pedidos in customer mode on a second phone (code 4821).
- **Create a bolsa** in 3 steps from Hoy → "Publicar más bolsas" or Bolsas → "Nueva bolsa": what goes in it, price (3 suggestions ending in .900), quantity and pickup time with "repeat weekly", then "¡Listo!" with a WhatsApp share. New bags appear in Bolsas until you close the app. Ñapita's commission still shows `[X] %` (open question).
- **Colombian Spanish by default, English as an option.** Switch in Perfil (or Negocio). The choice is remembered.
- **Prices in COP** (`$12.900`), with a **USD** display option in Perfil → Moneda (`US$3,20`). Charges always stay in COP.
- Everything uses **sample data** (`src/data/sample.ts`). There's no sign-in, checkout or backend yet.

## See it on your phone (Expo Go)

You need a computer (Mac, Windows or Linux) and your phone **on the same Wi-Fi**.

**One-time setup**

1. On your phone, install **Expo Go** from the [App Store](https://apps.apple.com/app/expo-go/id982107779) or [Google Play](https://play.google.com/store/apps/details?id=host.exp.exponent).
2. On your computer, install **Node.js** (the "LTS" version) from [nodejs.org](https://nodejs.org).
3. Download this repo. Either click **Code → Download ZIP** on GitHub and unzip it, or run:
   ```bash
   git clone https://github.com/NapitaService/napita-mobile.git
   ```
4. Open a terminal in the `napita-mobile` folder and install the app's libraries (takes a few minutes):
   ```bash
   npm install
   ```

**Every time you want to run it**

1. In the `napita-mobile` folder, get the latest changes and any new libraries, then start:
   ```bash
   git pull
   npm install
   npx expo start
   ```
   `npm install` is quick when nothing is new. Skipping it after a pull can cause errors like *"Failed to resolve plugin for module …"*. A big QR code appears in the terminal.
2. Scan it:
   - **iPhone:** open the normal **Camera** app, point it at the QR code and tap the banner.
   - **Android:** open **Expo Go** and tap **Scan QR code**.
3. The app opens in Expo Go. When you save a change to the code, the phone updates by itself.

**If it doesn't connect** (office or public Wi-Fi often blocks it), stop with `Ctrl + C` and run:
```bash
npx expo start --tunnel
```

**If Expo Go says the project is incompatible:** update Expo Go from the store. This app uses Expo SDK 57.

**If your iPhone says "There was a problem running the requested project" or mentions signing in:** on an iPhone, Expo Go and your computer must be signed in to the **same Expo account**. In Expo Go, tap the account icon (top right) and sign in with the account shown by `npx expo whoami` on your computer, then tap **Try Again**. No account yet? Create a free one at [expo.dev/signup](https://expo.dev/signup) and run `npx expo login` on your computer. Android phones don't need this.

## Where things are

```
src/
├── app/                  Screens. Every file here is a screen (Expo Router).
│   ├── index.tsx         Welcome
│   ├── (customer)/       Customer tabs: descubrir, mapa, pedidos, favoritos, perfil
│   └── (business)/       Business tabs: hoy, bolsas, entregas, negocio
├── components/           Pieces shared by screens (icons, text, switches, map)
├── i18n/                 ALL app wording: es-CO.json (default) and en.json
├── lib/format.ts         $12.900, 6:00 p. m., a 1,1 km, sáb. 3 de oct.
├── settings/             Language and currency choice
├── data/sample.ts        Sample places, orders and favorites
└── theme.ts              Colors and fonts from the design
```

## Rules for changing the app

These come from [`CLAUDE.md`](https://github.com/NapitaService/Napita-docs/blob/main/CLAUDE.md) in the docs repo:

- **No text written directly in screens.** Add every word to both `src/i18n/es-CO.json` and `src/i18n/en.json`.
- Informal "tú". Business side says **negocio**, never "tienda".
- Never use "basura", "rescatar", "sobrante", "sobras" or "barato", and no crossed-out "original price".
- Prices are whole pesos (`12900`). Format them with `useFormat().price(...)`, never by hand.
- Touch targets at least 44 px.

## Checks to run before committing

```bash
npm run typecheck    # TypeScript finds mistakes
npm run lint         # code style
npm run check:i18n   # es-CO.json and en.json match, no banned words
```

## Not built yet

Bag detail, checkout and payment (Wompi / Mercado Pago / PayU, see the docs repo), real sign-in (the screens exist but need `napita-backend`), the Negocio screen, and the business sign-up flow. See [`open-questions.md`](https://github.com/NapitaService/Napita-docs/blob/main/open-questions.md) in the docs repo.
