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
  'game.hintGestures':
    'dokun: döndür · fiske: çat diye indir · kaydır: yana · basılı tut: yavaş in',
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
  'settings.on': 'Açık',
  'settings.off': 'Kapalı',
  'settings.controls.gestures': 'Tuşsuz',
  'settings.controls.buttons': 'Tuşlar',
  'settings.controls.gesturesHint':
    'Dokun: döndür · aşağı fiske: çat diye indir · kaydır: yana · basılı tut (dolar): yavaş in',
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
  'game.hintGestures': 'tap: rotate · flick down: drop · swipe: move · hold: soft drop',
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
  'settings.on': 'On',
  'settings.off': 'Off',
  'settings.controls.gestures': 'Gestures',
  'settings.controls.buttons': 'Buttons',
  'settings.controls.gesturesHint':
    'Tap: rotate · flick down: drop · swipe: move · hold (it fills): soft drop',
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
