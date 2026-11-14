# Rosablock

React Native (Expo) ile yapılmış, iOS ve Android için sakin, nostaljik bir Tetris. Göz yormayan yumuşak renkler, "tatlı" sentezlenmiş sesler ve tamamen çevrimdışı çalışan bir oyun.

[English](README.md)

## Özellikler

- **Dört mod**
  - **Maraton**: klasik, 15 seviye; satır temizledikçe hız artar; 150 satırda biter.
  - **Sprint**: 40 satırı en kısa sürede temizle (süre tutulur).
  - **Huzur**: hızlanma yok, kendi hızında oyna; tahta dolunca biter.
  - **Ultra**: 2 dakikada olabildiğince çok puan topla.
- **İki oynama biçimi**
  - **Tuşsuz** (tam ekran): dokun = döndür, yana kaydır = hareket, basılı tut = hızlı in (tutarken parçanın içi alttan yukarı dolar), aşağı fiske = çat diye indir.
  - **Tuşlar**: durum kutusunun yanında kompakt 2x2 tuş kümesi, tek başparmakla oynamak için; küçük ⇄ tuşu tarafları değiştirir.
- **Gerçek Tetris kuralları**: duvar itmeli SRS döndürme, 7'li torba, gölge parça, parça tutma (parça başına bir kez), seviyeye göre yerçekimi.
- **His**: dolan satırlar çökmeden önce parlar, 3-4 satırda tahta sarsılır, titreşim satır sayısına göre güçlenir.
- **Otomatik kayıt ve devam**: her modun kendi kaydı var; kayıtlı modu seçince "Devam Et / Yeni Başla" sorulur, devam edilen oyun 3-2-1 geri sayımla başlar.
- Her mod için **en iyiler** (Sprint'te en iyi süre).
- **Diller**: İngilizce ve Türkçe (telefonun dilini izler, Ayarlar'dan değiştirilir).
- **Temalar**: Gül, Lavanta ve Nane; son ikisinde yumuşak vektörel arka planlar (lavanta başakları, nane dalları).
- **Ses**: yumuşak marimba/çıngırak tınılı efektler ve sakin bir müzik döngüsü; hepsi bir betikle sentezlenir (hazır örnek yok). Efektlerin ve müziğin ayrı anahtarı var; telefonun sessiz düğmesine uyulur.
- **Reklam**: ödüllü reklam, oyun bittikten sonra oyuna bir kez devam ettirir (üstteki 10 satır silinir); oyunlar arasında, rahatsız etmeyecek şekilde seyreltilmiş bir geçiş reklamı çıkabilir. Yasanın istediği yerlerde onay sorulur.

## Teknoloji

- Expo SDK 58, React Native 0.88, React 19, TypeScript (katı)
- `@react-native-async-storage/async-storage`: en iyiler, ayarlar, kayıtlı oyunlar
- `expo-audio`, `expo-haptics`, `react-native-svg`, `react-native-safe-area-context`
- `react-native-google-mobile-ads`: AdMob (ödüllü ve geçiş) ve UMP onayı

Oyun ağ istemez, yalnızca reklamlar ister.

## Başlarken

```bash
npm install
npm run typecheck      # katı TypeScript kontrolü
npx expo start         # geliştirme sunucusu
```

Uygulamanın bir kısmı yerel (native) kod içerir (reklam, ses, titreşim, SVG). Referans olarak geliştirme ya da TestFlight build'i kullanılır; yerel modülü bulunmayan özellikler (reklam, ses) çökmek yerine atlanır.

Sesleri ve müziği yeniden üretmek için (müzik için `ffmpeg` gerekir):

```bash
node scripts/makeSounds.mjs
```

## Proje yapısı

```
App.tsx                  giriş noktası: sağlayıcılar ve ekran yönlendirme
src/
  ads/                   AdMob: ödüllü, geçiş, sıklık, onay
  app/AppContext.tsx     tüm uygulama için ayarlar, tema ve çeviriler
  components/            Board, Controls, GestureArea, ScoreBoard, Dialog, ThemeBackground ...
  constants/             tetromino'lar (SRS şekilleri ve itmeler), modlar, temalar, vektörel arka planlar
  hooks/useTetris.ts     oyun motoru (saf fonksiyonlar) ve React hook'u
  i18n/strings.ts        İngilizce ve Türkçe metinler
  screens/               Ana menü, Oyun, Ayarlar
  settings/              ayar modeli, varsayılanlar ve saklama
  utils/                 kayıtlar, depolama, titreşim, ses, jest takibi, biçimlendirme
scripts/makeSounds.mjs   sesleri ve müziği sentezler
```

`src/hooks/useTetris.ts` içindeki motor, değişmez bir `GameState` üzerinde çalışan düz fonksiyonlardır (çarpışma, itmeli döndürme, satır temizleme, puanlama, tutma, reklamla devam); zamanlayıcıları ince bir hook yönetir.

## Yayın

Build'ler GitHub üzerinde (`.github/workflows/ios-build.yml`) EAS ile alınır. Kurulum, TestFlight ve reklam kontrol listesi için [RELEASE.md](RELEASE.md) dosyasına bakın.

`src/ads/adsConfig.ts` içindeki `ADS_LIVE` `false` olduğundan test build'leri Google'ın test reklamlarını gösterir; yalnızca App Store build'i için `true` yapın.
