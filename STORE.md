# Rosablock: App Store submission kit

Everything to paste into App Store Connect, and what to check before pressing "Add for Review".
Limits are Apple's; every text below was checked against them.

## 1. App information

| Field | Value |
| --- | --- |
| Name | Rosablock |
| Bundle ID | com.mifarosa.rosablock |
| SKU | rosablock |
| Primary category | Games, subcategory **Puzzle** (secondary: Games / Casual) |
| Price | Free (contains ads) |
| Age rating | **4+** (answer *None* to every question in the questionnaire) |
| Copyright | © 2026 Mifarosa |
| Privacy Policy URL | https://mifarosa.com/rosablock/privacy.html |
| Support URL | https://mifarosa.com/rosablock/support.html |
| Marketing URL | https://mifarosa.com/rosablock/ (optional) |
| Languages | English (primary), Turkish |
| Version / What's New | 1.0.0 / "First release." (TR: "İlk sürüm.") |

The privacy and support pages are in `docs/` and are published by `.github/workflows/pages.yml`
(see section 6). The URLs must open before you submit.

## 2. Text: English (primary)

**Subtitle** (25/30)

Calm falling-block puzzle

**Promotional text** (106/170)

Six modes, three soft themes, one-handed play and gentle sounds. Play offline, relax and clear a few rows.

**Keywords** (93/100)

`block,puzzle,falling,blocks,calm,relax,offline,one hand,lines,combo,bomb,pastel,zen,dig,party`

**Description** (1497/4000)

Rosablock is a calm falling-block puzzle with soft colors that are easy on the eyes. Place the pieces, fill rows, clear them, and let the stack stay low.

SIX MODES
• Marathon: the classic climb through 15 levels.
• Sprint: clear 40 lines as fast as you can.
• Calm: no speed-ups, play at your own pace.
• Ultra: score as much as you can in 2 minutes.
• Party: three clearing pieces in a row make the next piece a bomb that clears a 3x3 area. Clear four rows to slow time down.
• Dig: dig through rows of junk blocks; pick Easy, Normal or Hard and chase your best time.

BUILT FOR ONE HAND
• Gestures: tap to rotate, swipe to move, hold to drop (it speeds up), flick down to drop at once.
• Buttons: a compact pad for one thumb, with a switch to put it on the left or the right.

PLAYS WELL
• Wall kicks, a half-second lock delay, hold piece, a preview of the next three pieces and a ghost piece.
• Combos, back-to-back bonuses and perfect clears, with pop-up text.
• Rows flash before they collapse, soft haptics, a haze when the game ends.

NICE TO LOOK AT AND LISTEN TO
• Three themes: Rose, Lavender and Mint, with soft vector backdrops.
• A colorblind-friendly color option.
• Gentle marimba-like sound effects and calm music (each can be switched off).

ALSO
• Works offline. Your best scores and saved games stay on your device.
• English and Turkish.
• A short how-to-play guide, always one tap away.

Rosablock is free and contains ads. After a game ends you can watch one ad to continue.

## 3. Text: Turkish

**Altyazı** (24/30)

Sakin blok bulmaca oyunu

**Tanıtım metni** (109/170)

Altı mod, üç yumuşak tema, tek elle oynama ve tatlı sesler. Çevrimdışı oyna, rahatla ve birkaç satır temizle.

**Anahtar kelimeler** (92/100)

`blok,bulmaca,sakin,rahat,çevrimdışı,tek el,satır,bomba,pastel,huzur,kombo,düşen,eğlence,kazı`

**Açıklama** (1522/4000)

Rosablock, göz yormayan yumuşak renklere sahip sakin bir düşen blok bulmacasıdır. Parçaları yerleştir, satırları doldur, temizle ve yığını alçak tut.

ALTI MOD
• Maraton: 15 seviyelik klasik tırmanış.
• Sprint: 40 satırı en kısa sürede temizle.
• Huzur: hızlanma yok, kendi hızında oyna.
• Ultra: 2 dakikada olabildiğince çok puan topla.
• Şenlik: üst üste 3 parçayla satır temizlersen sıradaki parça, 3×3 alanı silen bir bomba olur. 4 satır temizlersen zaman yavaşlar.
• Kazı: çöp bloklu satırları kaz; Kolay, Normal ya da Zor'u seç ve en iyi süreni kovala.

TEK ELLE OYNAMAYA GÖRE
• Tuşsuz: dokun = döndür, kaydır = yana, basılı tut = aşağı (hızlanır), aşağı fiske = çat diye indir.
• Tuşlar: tek başparmağa göre kompakt bir tuş kümesi, sola ya da sağa alınabilir.

İYİ OYNANIR
• Duvar itmesi, yarım saniyelik kilit gecikmesi, parça tutma, sıradaki üç parçanın önizlemesi ve gölge parça.
• Kombo, arka arkaya bonusu ve mükemmel temizlik; her biri için ekranda yazı.
• Satırlar çökmeden önce parlar, yumuşak titreşim, oyun bitince tahtayı bir sis kaplar.

GÖZE VE KULAĞA HOŞ
• Üç tema: Gül, Lavanta ve Nane; arkada yumuşak vektörel çizimler.
• Renk körlüğüne uygun renk seçeneği.
• Marimba tınılı yumuşak ses efektleri ve sakin müzik (ikisi de kapatılabilir).

AYRICA
• Çevrimdışı çalışır. En iyi skorların ve kayıtlı oyunların cihazında kalır.
• Türkçe ve İngilizce.
• Her an bir dokunuş uzakta kısa bir nasıl oynanır rehberi.

Rosablock ücretsizdir ve reklam içerir. Oyun bitince bir reklam izleyerek devam edebilirsin.

Do not put "Tetris" (a registered trademark) in the name, subtitle, keywords or description, and do
not name competitor apps. The texts above avoid it on purpose.

## 4. App Privacy ("nutrition label")

The game itself collects nothing; Google AdMob (the ads) does. Answer in App Store Connect ->
App Privacy, and **check Google's current "App Store privacy details" guidance for AdMob** (it
changes over time) before you publish:

- **Data collected**: Identifiers -> *Device ID*; Usage Data -> *Product Interaction* and
  *Advertising Data*; Diagnostics -> *Crash/Performance Data* (as Google lists for AdMob).
- **Purpose**: *Third-Party Advertising* (and *Analytics* where Google's list says so).
- **Linked to the user**: Google's guidance applies; the app has no accounts and sends no user
  data of its own.
- **Tracking**: the app requests non-personalized ads only and shows no App Tracking Transparency
  prompt. If you later turn on personalized ads, add the ATT prompt and answer "Yes" to tracking.
- The app's own data (best scores, settings, saved games) stays on the device and is not collected.

## 5. App Review information

- **Sign-in**: none required (there are no accounts).
- **Contact**: your name, phone and e-mail (only Apple sees them).
- **Notes for the reviewer** (paste):

> Rosablock is an offline block puzzle game; no sign-in is needed. Tap any mode on the home screen
> to play. Ads are shown with Google AdMob: after a game ends the player may choose to watch one
> rewarded ad to continue (it is always optional and clearly labeled), and a full-screen ad may
> appear when a new game starts, at most every second game and not sooner than 2.5 minutes after
> the previous ad. In the EEA/UK a Google consent form (UMP) is shown first. The settings screen
> links to the privacy policy and a support page.

## 6. One-time setup of the site (privacy and support pages)

1. GitHub: repository **Settings -> Pages -> Source: GitHub Actions**.
2. Actions -> **Publish site** -> Run workflow (it also runs when `docs/` changes).
3. Open https://mifarosa.com/rosablock/privacy.html and .../support.html. Wasorty uses the same
   Pages setup, so the address follows the same rule. If your Pages address differs, change
   `PRIVACY_URL` and `SUPPORT_URL` in `src/constants/links.ts` and the URLs in App Store Connect.

## 7. Screenshots

The app is iPhone-only (`supportsTablet: false`), so only iPhone screenshots are needed. Apple needs
one set of the largest size and scales it for the others:

- **6.9"** 1320 x 2868 (iPhone 16 Pro Max / 17 Pro Max) or **6.5"** 1284 x 2778 / 1242 x 2688.
- Take them from the TestFlight build on a real iPhone (side button + volume up), real screens only.
  Do not add text that promises features the app does not have.
- Suggested 5 shots: (1) a game in progress with the gestures layout; (2) the buttons layout;
  (3) Party with a bomb; (4) a line-clear pop-up; (5) the home screen or Settings with another theme.
  Up to 10 are allowed. Do them in English and, if you want, again with the phone set to Turkish.

## 8. Build and submit

1. Make sure the Pages site is live (section 6).
2. AdMob: the Privacy & messaging (GDPR) message exists and is assigned to Rosablock;
   `app-ads.txt` is on the developer website; the app is linked to its App Store page once live.
3. Actions -> **iOS build** -> Run workflow -> *profile* **store**, tick *submit*. The `store`
   profile is the only one that shows real ads; `production` (TestFlight tests) shows test ads.
4. When the build finishes processing, in App Store Connect choose it under the version, fill the
   export compliance answer if asked (the app sets "no non-exempt encryption"), and *Add for Review*.
5. Install the `store` build from TestFlight on your phone and look at a rewarded and a between-games
   ad once (real ads: **never tap them**). Then submit.

## 9. Pre-flight checklist

- [ ] Privacy and support pages open from the URLs above
- [ ] AdMob consent message created; `app-ads.txt` published
- [ ] App Privacy answers saved; age rating questionnaire done (4+)
- [ ] Screenshots, subtitle, promo text, keywords, description in both languages
- [ ] Support URL, Privacy URL and Copyright filled in; price set to Free
- [ ] Build made with profile **store**, tested on a real iPhone
- [ ] Review notes pasted and contact details filled in
