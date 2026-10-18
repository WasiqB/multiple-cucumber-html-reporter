import { loadLocale, SUPPORTED_LANGUAGES } from '@/locale.js';

describe('report locales', () => {
  it('loads translations for all supported languages', () => {
    expect(SUPPORTED_LANGUAGES).toEqual(['en', 'es', 'fr', 'ar']);

    for (const language of SUPPORTED_LANGUAGES) {
      const locale = loadLocale(language);
      expect(locale.htmlLang).toBe(language);
      expect(locale.header.reportName).toBeTruthy();
      expect(locale.email.executiveSummary).toBeTruthy();
    }
  });

  it('defaults to English when the language is omitted or unsupported', () => {
    expect(loadLocale().htmlLang).toBe('en');
    expect(loadLocale('unsupported').htmlLang).toBe('en');
  });
});
