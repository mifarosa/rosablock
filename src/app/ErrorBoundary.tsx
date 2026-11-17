import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { THEMES } from '../constants/colors';
import { detectLanguage } from '../i18n/strings';

interface State {
  failed: boolean;
  attempt: number;
}

const TEXTS = {
  tr: { title: 'Bir sorun oldu', text: 'Oyun beklenmedik bir hatayla karşılaştı.', button: 'Yeniden başlat' },
  en: { title: 'Something went wrong', text: 'The game ran into an unexpected error.', button: 'Restart' },
} as const;

/**
 * Catches errors while the app draws, so a bug shows a calm screen with a restart button instead
 * of a blank one. It cannot rely on the app's own settings (they may be what failed), so it uses
 * the default theme and the device language.
 */
export default class ErrorBoundary extends React.Component<{ children: React.ReactNode }, State> {
  state: State = { failed: false, attempt: 0 };

  static getDerivedStateFromError(): Partial<State> {
    return { failed: true };
  }

  componentDidCatch(): void {
    // Nothing is sent anywhere: the game is offline. The restart button is the way out.
  }

  private restart = () => {
    this.setState((prev) => ({ failed: false, attempt: prev.attempt + 1 }));
  };

  render(): React.ReactNode {
    if (!this.state.failed) {
      // A new key on restart gives the whole app a fresh start.
      return <React.Fragment key={this.state.attempt}>{this.props.children}</React.Fragment>;
    }
    const colors = THEMES.rose;
    const text = TEXTS[detectLanguage()];
    return (
      <View style={[styles.root, { backgroundColor: colors.background }]}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>{text.title}</Text>
        <Text style={[styles.text, { color: colors.textSecondary }]}>{text.text}</Text>
        <Pressable
          accessibilityRole="button"
          onPress={this.restart}
          style={[styles.button, { backgroundColor: colors.textSecondary }]}
        >
          <Text style={[styles.buttonText, { color: colors.background }]}>{text.button}</Text>
        </Pressable>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  root: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 12 },
  title: { fontSize: 22, fontWeight: '800', textAlign: 'center' },
  text: { fontSize: 15, textAlign: 'center' },
  button: { marginTop: 12, borderRadius: 10, paddingVertical: 14, paddingHorizontal: 32 },
  buttonText: { fontSize: 16, fontWeight: '800' },
});
