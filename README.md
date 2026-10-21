# napita-mobile

The **Ñapita** phone app for iPhone and Android: surprise bags (*bolsas sorpresa*) from bakeries, cafés and restaurants in your Colombian neighborhood, at the end of the day.

Built with [Expo](https://expo.dev) (React Native), TypeScript and Expo Router: one codebase for both phones.

## How it fits with the other repos

| Repo | What's in it |
|---|---|
| [`Napita-docs`](https://github.com/NapitaService/Napita-docs) (docs) | Product rules, design, flows and decisions. **Read this first.** No code. |
| `napita-mobile` (this repo) | The app |
| [`napita-backend`](https://github.com/NapitaService/napita-backend) | Supabase: database, sign-in, payments logic. The app isn't connected to it yet. |

The design this app copies lives in the docs repo: [`design/README.md`](https://github.com/NapitaService/Napita-docs/blob/main/design/README.md) and the [live design canvas](https://claude.ai/artifact/B2sY1G2J96dGMaJ7rf6u9G).

## What works today

- **Welcome / login screen**, the only way in (decision 0005), with an ES / EN switch:
  - **"Ver lugares cerca de mí"** creates a **customer account** (name + celular → 6-digit code) and goes straight to Descubrir.
  - **"Tengo un negocio"** creates a **business account** (celular → code), then 3 sign-up steps: business details (with logo), **opening days and hours** with a pickup time inside them (decision 0011), and **documents** (certificado bancario, RUT, ID of the legal representative, and Cámara de Comercio for a persona jurídica). Then the business waits on "Estamos revisando tu negocio" until the team approves it (decision 0016). For testing, that screen has a "(Prueba) Simular aprobación" button while running in Expo Go.
  - **"Inicia sesión"** opens whichever side the account belongs to. The app stays signed in until you log out.
  - Customer and business are separate accounts. To switch, use **Cerrar sesión** (Perfil or Negocio) and sign in with the other account.
  - Warnings for numbers that can't be a Colombian mobile, a number that already has an account, or an unknown number when signing in. For now nothing is sent and any 6 digits work.
- **Customer side**, 5 tabs built to match the design: Descubrir, Mapa, Pedidos, Favoritos, Perfil.
- **Cancel an order** in Pedidos until the pickup window begins (decision 0010): "Cancelar pedido" shows the refund amount and asks to confirm, then the order moves to Anteriores as "Cancelado". The bag goes back on sale, so the place's "Quedan" count goes up. Pedidos also says that an order not picked up before closing time isn't refunded; such orders show as "No recogido" (decision 0008).
- **Business side**, 4 tabs: **Hoy** (today's numbers with net sales, who's coming), **Bolsas** (your bags, +/− quantity, "Publicar hoy"), **Entregas** (hand over orders) and **Negocio** (details, hours with "Cambiar horario", language, Cerrar sesión). A new business sees "¡Bienvenidos!" with "Crear mi primera bolsa".
- **Hand over an order** on Entregas: scan the customer's QR with the camera (asks for camera permission the first time), type their 4-digit code (confirms on the last digit), or tap "Entregar" next to their name. A green "Entregado" screen with "Deshacer" follows; a wrong code shows "Este código no coincide". For 15 minutes after an order is placed, **Cancelar · N min** lets the business cancel it (with a confirmation); its bags go back on sale (decision 0010). Orders not picked up show "No vino". To try the scan, sign in as the demo customer on a second phone and open Pedidos (code 4821).
- **Create a bolsa** in 3 steps from Hoy → "Publicar más bolsas" or Bolsas → "Nueva bolsa": what goes in it, price (3 suggestions ending in .900), quantity and pickup time (only times inside the business's hours; closed days can't be picked) with "repeat weekly", then "¡Listo!" with a WhatsApp share. The price step shows the value and price only; Ñapita's 20 % commission isn't shown in the app (decision 0007).
- **Colombian Spanish by default, English as an option.** Switch on the Welcome screen, Perfil or Negocio. The choice is remembered.
- **Prices in COP** (`$12.900`), with a **USD** display option in Perfil → Moneda (`US$3,20`). Charges always stay in COP.
- Everything uses **sample data** (`src/data/sample.ts`, `src/data/business.ts`). There's no real sign-in, checkout or backend yet. Accounts are saved on the phone only.

### Demo accounts

Two accounts come with sample orders so there's something to look at. Tap **Inicia sesión** and use any 6 digits as the code:

| Celular | Account |
|---|---|
| 300 000 0001 | Customer "Ana", with an order to pick up today and past orders |
| 300 000 0002 | Business "Panadería La Espiga", with bags and today's orders |

New accounts start empty.

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

## Working on this repo with Claude Code

Claude Code can read the code, follow the team's rules and run the app for you.

1. **Get access.** Ask an owner of the NapitaService GitHub organization to invite you (GitHub → NapitaService → People → Invite), with access to `Napita-docs` and `napita-mobile`.
2. **Install, once:** [Git](https://git-scm.com/downloads), [Node.js LTS](https://nodejs.org), [Claude Code](https://claude.com/claude-code) (the desktop app, or the terminal version), and **Expo Go** on your phone.
3. **Download both repos side by side**, in a terminal:
   ```bash
   mkdir napita && cd napita
   git clone https://github.com/NapitaService/Napita-docs.git
   git clone https://github.com/NapitaService/napita-mobile.git
   ```
4. **Open Claude in the app folder:** in the desktop app, open the `napita/napita-mobile` folder; in a terminal, `cd napita-mobile` then `claude`. Claude reads `CLAUDE.md` automatically, which points it to the docs folder next door.
5. **First message to Claude:**
   > Read CLAUDE.md and the docs it points to. Then install everything and start the app so I can open it on my phone with Expo Go.
6. **iPhone:** create a free Expo account at [expo.dev/signup](https://expo.dev/signup), run `npx expo login` on the laptop and sign in to Expo Go with the same account.
7. **Making changes:** ask Claude to work on a new branch and open a pull request, so the team can review before it reaches `main`.

## Where things are

```
src/
├── app/                  Screens. Every file here is a screen (Expo Router).
│   ├── index.tsx         Welcome / login
│   ├── cuenta/           Create an account or sign in, then the 6-digit code
│   ├── negocio-nuevo/    Business sign-up: details, then opening hours
│   ├── (customer)/       Customer tabs: descubrir, mapa, pedidos, favoritos, perfil
│   ├── (business)/       Business tabs: hoy, bolsas, entregas, negocio
│   ├── nueva-bolsa/      Create a bolsa in 3 steps
│   └── entrega/          Scan, "Entregado" and wrong-code screens
├── components/           Pieces shared by screens (icons, text, switches, map)
├── i18n/                 ALL app wording: es-CO.json (default) and en.json
├── lib/format.ts         $12.900, 6:00 p. m., a 1,1 km, sáb. 3 de oct.
├── settings/             Accounts and sign-in, language and currency, business and order state
├── data/                 Sample places, orders, bags (sample.ts, business.ts)
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

Bag detail, checkout and payment (Wompi / Mercado Pago / PayU, see the docs repo), real sign-in and saved data (the screens exist but need `napita-backend`), the payout account, and "Usar mi ubicación actual" at sign-up. See [`open-questions.md`](https://github.com/NapitaService/Napita-docs/blob/main/open-questions.md) in the docs repo.
