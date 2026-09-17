import { Platform } from 'react-native';
import { colors } from '../theme/colors';

// Expo's plain (non-router) web template ships a bare <head> with no app name,
// icon, or "launch standalone" hints — so "Add to Home Screen" on iOS would use
// the raw page title and a screenshot as the icon. This fills those in at
// runtime so the home screen shortcut looks and behaves like a real app icon.
export function setupWebHomeScreenMeta() {
  if (Platform.OS !== 'web' || typeof document === 'undefined') return;

  document.title = 'Gym Crew';

  // On web, requiring an image resolves directly to a URL string (unlike native,
  // where it's an { uri, width, height } module via Image.resolveAssetSource).
  const iconModule = require('../../assets/icon.png');
  const iconUri: string =
    typeof iconModule === 'string' ? iconModule : iconModule?.default ?? iconModule?.uri ?? String(iconModule);

  const setMeta = (name: string, content: string) => {
    let tag = document.querySelector(`meta[name="${name}"]`);
    if (!tag) {
      tag = document.createElement('meta');
      tag.setAttribute('name', name);
      document.head.appendChild(tag);
    }
    tag.setAttribute('content', content);
  };

  const setLink = (rel: string, href: string) => {
    let tag = document.querySelector(`link[rel="${rel}"]`);
    if (!tag) {
      tag = document.createElement('link');
      tag.setAttribute('rel', rel);
      document.head.appendChild(tag);
    }
    tag.setAttribute('href', href);
  };

  setMeta('apple-mobile-web-app-capable', 'yes');
  setMeta('mobile-web-app-capable', 'yes');
  setMeta('apple-mobile-web-app-title', 'Gym Crew');
  setMeta('apple-mobile-web-app-status-bar-style', 'black-translucent');
  setMeta('theme-color', colors.background);

  setLink('apple-touch-icon', iconUri);
  setLink('icon', iconUri);
}
