export type Language = 'tr' | 'en';
export const LANGUAGES: readonly Language[] = ['tr', 'en'];

const tr = {
  'mode.marathon.title': 'Maraton',
  'mode.marathon.subtitle': 'Klasik · 15 seviye',
  'mode.marathon.description': 'Satır temizledikçe hız artar. 150 satıra ulaş.',
  'mode.sprint.title': 'Sprint',
  'mode.sprint.subtitle': '40 satır',
  'mode.sprint.description': '40 satırı en kısa sürede temizle.',
  'mode.zen.title': 'Huzur',
  'mode.zen.subtitle': 'Rahatlatıcı',
  'mode.zen.description': 'Hızlanma yok. Sakin sakin oyna.',
  'mode.ultra.title': 'Ultra',
  'mode.ultra.subtitle': '2 dakika',
  'mode.ultra.description': '2 dakikada olabildiğince çok puan topla.',

  'mode.party.title': 'Şenlik',
  'mode.party.subtitle': 'Bomba · yavaşlatma',
  'mode.party.description':
    'Üst üste 3 parçayla satır temizle, sıradaki parça bomba olsun. 4 satır yapınca zaman yavaşlar.',
  'mode.dig.title': 'Kazı',
  'mode.dig.subtitle': 'Çöp satırlar',
  'mode.dig.description': 'Alttaki çöp satırların hepsini en kısa sürede temizle.',

  'home.tagline': 'sakin · çevrimdışı',
  'home.pickMode': 'MOD SEÇ',
  'home.best': 'EN İYİLER',
  'home.resume': '▶ Devam: {score} puan · {lines} satır',
  'home.resumeText': 'Kaldığın yerden devam edebilirsin ({score} puan, {lines} satır).',
  'home.settings': 'Ayarlar',

  'common.continue': 'Devam Et',
  'common.startOver': 'Yeni Başla',
  'common.cancel': 'İptal',
  'common.back': '‹ Geri',

  'game.menu': '‹ Menü',
  'game.pause': 'Duraklat',
  'game.resume': 'Devam',
  'game.swapSide': 'Tuşları diğer yana al',
  'game.paused': 'Duraklatıldı',
  'game.over': 'Oyun Bitti',
  'game.finished': 'Tamamlandı!',
  'game.timeUp': 'Süre Doldu',
  'game.score': 'Puan: {value}',
  'game.lines': 'Satır: {value}',
  'game.time': 'Süre: {value}',
  'game.newBest': 'Yeni rekor!',
  'game.playAgain': 'Tekrar Oyna',
  'game.restart': 'Yeniden Başla',
  'game.mainMenu': 'Ana Menü',
  'game.watchAd': 'Reklam izle, devam et',
  'game.adLoading': 'Reklam hazırlanıyor…',
  'game.adUnavailable': 'Şu an reklam yok, biraz sonra tekrar dene.',

  'stat.next': 'SIRADAKİ',
  'stat.hold': 'TUT',
  'stat.score': 'PUAN',
  'stat.lines': 'SATIR',
  'stat.level': 'SEVİYE',
  'stat.time': 'SÜRE',
  'stat.left': 'KALAN',

  'home.howTo': 'Nasıl oynanır',

  'settings.colorblind': 'RENK KÖRLÜĞÜ MODU',
  'settings.colorblindHint': 'Parçalar birbirinden kolay ayırt edilen renklerle çizilir.',
  'settings.privacy': 'GİZLİLİK',
  'settings.privacyButton': 'Gizlilik politikası',
  'settings.supportButton': 'Destek',

  'game.sound': 'Ses efektleri',
  'game.music': 'Müzik',
  'game.howTo': 'Nasıl oynanır',
  'game.nextLabel': 'Sıradaki parçalar',

  'toast.double': 'ÇİFT',
  'toast.triple': 'ÜÇLÜ',
  'toast.tetris': '4 SATIR!',
  'toast.combo': 'KOMBO ×{n}',
  'toast.backToBack': 'ARKA ARKAYA',
  'toast.perfect': 'MÜKEMMEL TEMİZLİK!',
  'toast.level': 'SEVİYE {n}',

  'howto.title': 'Nasıl oynanır',
  'howto.gotIt': 'Anladım',
  'howto.close': 'Kapat',
  'howto.goal.title': 'Amaç',
  'howto.goal.text':
    'Düşen parçaları yerleştir, satırları doldurup temizle. Tahta tepeye kadar dolarsa oyun biter.',
  'howto.controls.title': 'Kontroller',
  'howto.gestures.tap': 'Dokun: parçayı döndürür',
  'howto.gestures.swipe': 'Yana kaydır: parçayı yana götürür',
  'howto.gestures.hold': 'Basılı tut: parça aşağı iner, tuttukça hızlanır',
  'howto.gestures.flick': 'Hızlı aşağı fiske: parçayı çat diye indirir',
  'howto.buttons.moves': '◀ ▶  parçayı yana götürür',
  'howto.buttons.rotate': '↻  parçayı döndürür',
  'howto.buttons.down': '▼  aşağı indirir (basılı tutunca hızlanır)',
  'howto.buttons.swap': '⇄  tuşları ekranın diğer yanına alır',
  'howto.controls.change': 'Kontrolü Ayarlar\'dan değiştirebilirsin.',
  'howto.hold.title': 'Parçayı tut',
  'howto.hold.text':
    'TUT kutusuna dokun: düşen parça kenara geçer. Bir sonraki sefer tuttuğun parçayla yer değiştirir. Her parça için bir kez.',
  'howto.score.title': 'Puan',
  'howto.score.text':
    '1 satır 100, 2 satır 300, 3 satır 500, 4 satır 800 puan, seviye ile çarpılır. Art arda satır temizlersen kombo, arka arkaya 4 satır ×1,5, tahtayı bomboş bırakırsan büyük bonus gelir.',
  'howto.lock.title': 'Son an',
  'howto.lock.text':
    'Parça bir yere değince hemen kilitlenmez: yarım saniye içinde yana kaydırıp döndürebilirsin.',
  'howto.ad.title': 'Devam',
  'howto.ad.text':
    'Oyun bitince bir reklam izleyerek oyuna bir kez devam edebilirsin: tahtanın üst yarısı silinir.',

  'home.classic': 'KLASİK',
  'home.fun': 'EĞLENCE',
  'dig.easy': 'Kolay',
  'dig.normal': 'Normal',
  'dig.hard': 'Zor',
  'dig.pick': 'Zorluk seç',
  'dig.pickText': 'Kaç çöp satırı: kolay 6, normal 10, zor 14.',
  'dig.best': 'Kazı · {level}',
  'stat.junk': 'ÇÖP',
  'toast.bomb': 'BOMBA!',
  'toast.slow': 'YAVAŞLATMA!',
  'howto.party.title': 'Şenlik modu',
  'howto.party.text':
    'Üst üste 3 parçayla satır temizlersen sıradaki parça bir bomba olur. Bomba yere değince çevresindeki 3×3 alanı siler. 4 satır temizlersen 10 saniye zaman yavaşlar.',
  'howto.dig.title': 'Kazı modu',
  'howto.dig.text':
    'Tahta çöp satırlarla başlar. Hepsini temizlediğinde biter, en kısa süre kaydedilir. Zorluk, çöp satırı sayısını ve hızı belirler.',

  'a11y.left': 'Sola',
  'a11y.right': 'Sağa',
  'a11y.down': 'Aşağı',
  'a11y.rotate': 'Döndür',
  'a11y.hold': 'Parçayı tut',

  'settings.title': 'Ayarlar',
  'settings.language': 'DİL',
  'settings.theme': 'TEMA',
  'settings.controls': 'KONTROL',
  'settings.haptics': 'TİTREŞİM',
  'settings.sound': 'SES EFEKTLERİ',
  'settings.music': 'MÜZİK',
  'settings.adPrivacy': 'REKLAM GİZLİLİĞİ',
  'settings.adPrivacyButton': 'Reklam gizlilik seçenekleri',
  'settings.on': 'Açık',
  'settings.off': 'Kapalı',
  'settings.controls.gestures': 'Tuşsuz',
  'settings.controls.buttons': 'Tuşlar',
  'settings.controls.gesturesHint':
    'Dokun: döndür · aşağı fiske: çat diye indir · kaydır: yana · basılı tut: hızlanarak in',
  'settings.controls.buttonsHint':
    'Tuşlar bir yanda, durum kutusu diğer yanda. Oyunda ⇄ ile yer değiştirir',
  'theme.rose': 'Gül',
  'theme.lavender': 'Lavanta',
  'theme.mint': 'Nane',
} as const;

export type StringKey = keyof typeof tr;

const en: Record<StringKey, string> = {
  'mode.marathon.title': 'Marathon',
  'mode.marathon.subtitle': 'Classic · 15 levels',
  'mode.marathon.description': 'Speed rises as you clear lines. Reach 150 lines.',
  'mode.sprint.title': 'Sprint',
  'mode.sprint.subtitle': '40 lines',
  'mode.sprint.description': 'Clear 40 lines as fast as you can.',
  'mode.zen.title': 'Calm',
  'mode.zen.subtitle': 'Relaxing',
  'mode.zen.description': 'No speed-ups. Play at your own pace.',
  'mode.ultra.title': 'Ultra',
  'mode.ultra.subtitle': '2 minutes',
  'mode.ultra.description': 'Score as much as you can in 2 minutes.',

  'mode.party.title': 'Party',
  'mode.party.subtitle': 'Bombs · slow-down',
  'mode.party.description':
    'Clear lines with three pieces in a row and the next piece is a bomb. Clear four rows to slow time down.',
  'mode.dig.title': 'Dig',
  'mode.dig.subtitle': 'Junk rows',
  'mode.dig.description': 'Clear every junk row at the bottom as fast as you can.',

  'home.tagline': 'calm · offline',
  'home.pickMode': 'PICK A MODE',
  'home.best': 'BEST',
  'home.resume': '▶ Continue: {score} pts · {lines} lines',
  'home.resumeText': 'You can pick up where you left off ({score} pts, {lines} lines).',
  'home.settings': 'Settings',

  'common.continue': 'Continue',
  'common.startOver': 'Start over',
  'common.cancel': 'Cancel',
  'common.back': '‹ Back',

  'game.menu': '‹ Menu',
  'game.pause': 'Pause',
  'game.resume': 'Resume',
  'game.swapSide': 'Move the buttons to the other side',
  'game.paused': 'Paused',
  'game.over': 'Game over',
  'game.finished': 'Done!',
  'game.timeUp': "Time's up",
  'game.score': 'Score: {value}',
  'game.lines': 'Lines: {value}',
  'game.time': 'Time: {value}',
  'game.newBest': 'New record!',
  'game.playAgain': 'Play again',
  'game.restart': 'Restart',
  'game.mainMenu': 'Main menu',
  'game.watchAd': 'Watch an ad to continue',
  'game.adLoading': 'Loading the ad…',
  'game.adUnavailable': 'No ad right now, try again in a moment.',

  'stat.next': 'NEXT',
  'stat.hold': 'HOLD',
  'stat.score': 'SCORE',
  'stat.lines': 'LINES',
  'stat.level': 'LEVEL',
  'stat.time': 'TIME',
  'stat.left': 'LEFT',

  'home.howTo': 'How to play',

  'settings.colorblind': 'COLORBLIND COLORS',
  'settings.colorblindHint': 'Pieces use colors that are easy to tell apart.',
  'settings.privacy': 'PRIVACY',
  'settings.privacyButton': 'Privacy policy',
  'settings.supportButton': 'Support',

  'game.sound': 'Sound effects',
  'game.music': 'Music',
  'game.howTo': 'How to play',
  'game.nextLabel': 'Upcoming pieces',

  'toast.double': 'DOUBLE',
  'toast.triple': 'TRIPLE',
  'toast.tetris': '4 LINES!',
  'toast.combo': 'COMBO ×{n}',
  'toast.backToBack': 'BACK-TO-BACK',
  'toast.perfect': 'PERFECT CLEAR!',
  'toast.level': 'LEVEL {n}',

  'howto.title': 'How to play',
  'howto.gotIt': 'Got it',
  'howto.close': 'Close',
  'howto.goal.title': 'Goal',
  'howto.goal.text':
    'Place the falling pieces and fill rows to clear them. If the stack reaches the top, the game is over.',
  'howto.controls.title': 'Controls',
  'howto.gestures.tap': 'Tap: rotates the piece',
  'howto.gestures.swipe': 'Swipe sideways: moves the piece',
  'howto.gestures.hold': 'Press and hold: the piece drops, faster the longer you hold',
  'howto.gestures.flick': 'Flick down fast: drops the piece at once',
  'howto.buttons.moves': '◀ ▶  move the piece sideways',
  'howto.buttons.rotate': '↻  rotates the piece',
  'howto.buttons.down': '▼  drops the piece (hold it to speed up)',
  'howto.buttons.swap': '⇄  moves the buttons to the other side of the screen',
  'howto.controls.change': 'You can change the controls in Settings.',
  'howto.hold.title': 'Hold a piece',
  'howto.hold.text':
    'Tap the HOLD box to set the falling piece aside. Next time it swaps with the piece you held. Once per piece.',
  'howto.score.title': 'Score',
  'howto.score.text':
    '1 row 100, 2 rows 300, 3 rows 500, 4 rows 800 points, times your level. Clearing rows with consecutive pieces gives a combo, back-to-back four-row clears score x1.5, and emptying the whole board gives a big bonus.',
  'howto.lock.title': 'Last moment',
  'howto.lock.text':
    'A piece does not lock the moment it lands: you have half a second to slide and rotate it.',
  'howto.ad.title': 'Continue',
  'howto.ad.text':
    'When the game ends you can watch an ad to continue once: the top half of the board is cleared.',

  'home.classic': 'CLASSIC',
  'home.fun': 'FUN',
  'dig.easy': 'Easy',
  'dig.normal': 'Normal',
  'dig.hard': 'Hard',
  'dig.pick': 'Pick a difficulty',
  'dig.pickText': 'Junk rows: easy 6, normal 10, hard 14.',
  'dig.best': 'Dig · {level}',
  'stat.junk': 'JUNK',
  'toast.bomb': 'BOMB!',
  'toast.slow': 'SLOW-DOWN!',
  'howto.party.title': 'Party mode',
  'howto.party.text':
    'Clear lines with three pieces in a row and the next piece is a bomb. When it lands it clears the 3x3 area around it. Clear four rows and time slows down for 10 seconds.',
  'howto.dig.title': 'Dig mode',
  'howto.dig.text':
    'The board starts with junk rows. Clear them all to finish; your fastest time is saved. The difficulty sets how many junk rows there are and how fast the pieces fall.',

  'a11y.left': 'Left',
  'a11y.right': 'Right',
  'a11y.down': 'Down',
  'a11y.rotate': 'Rotate',
  'a11y.hold': 'Hold piece',

  'settings.title': 'Settings',
  'settings.language': 'LANGUAGE',
  'settings.theme': 'THEME',
  'settings.controls': 'CONTROLS',
  'settings.haptics': 'HAPTICS',
  'settings.sound': 'SOUND EFFECTS',
  'settings.music': 'MUSIC',
  'settings.adPrivacy': 'AD PRIVACY',
  'settings.adPrivacyButton': 'Ad privacy options',
  'settings.on': 'On',
  'settings.off': 'Off',
  'settings.controls.gestures': 'Gestures',
  'settings.controls.buttons': 'Buttons',
  'settings.controls.gesturesHint':
    'Tap: rotate · flick down: drop · swipe: move · hold: speed down',
  'settings.controls.buttonsHint':
    'Buttons on one side, status box on the other. Use ⇄ in the game to swap sides',
  'theme.rose': 'Rose',
  'theme.lavender': 'Lavender',
  'theme.mint': 'Mint',
};

const STRINGS: Record<Language, Record<StringKey, string>> = { tr, en };

export type Translate = (key: StringKey, params?: Record<string, string | number>) => string;

export function translate(
  lang: Language,
  key: StringKey,
  params?: Record<string, string | number>,
): string {
  let text = STRINGS[lang][key];
  if (params) {
    for (const [name, value] of Object.entries(params)) {
      text = text.split(`{${name}}`).join(String(value));
    }
  }
  return text;
}

/** The device language: Turkish if the phone is set to Turkish, English otherwise. */
export function detectLanguage(): Language {
  try {
    const locale = Intl.DateTimeFormat().resolvedOptions().locale;
    return locale.toLowerCase().startsWith('tr') ? 'tr' : 'en';
  } catch {
    return 'tr';
  }
}
