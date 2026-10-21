import path from 'node:path';
import fs from 'fs-extra';
import { generate } from '@/generate-report.js';
import { loadLocale, normalizeLanguage, parseLanguage, SUPPORTED_LANGUAGES } from '@/locale.js';
import type { SupportedLanguage } from '@/types.js';

const localesDir = path.resolve(process.cwd(), 'src/locales');

/** Every leaf path in a locale file, such as `runInfo.runningLocally`. */
const leafKeys = (value: unknown, prefix = ''): string[] => {
  if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
    return Object.entries(value as Record<string, unknown>).flatMap(([key, child]) =>
      leafKeys(child, prefix ? `${prefix}.${key}` : key),
    );
  }
  return [prefix];
};

describe('report locales', () => {
  it('loads translations for all supported languages', () => {
    expect(SUPPORTED_LANGUAGES).toEqual(['en', 'es', 'fr', 'pt', 'ar']);

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

  it('narrows a regional Portuguese tag onto the Brazilian Portuguese catalog', () => {
    expect(normalizeLanguage('pt-BR')).toBe('pt');
    expect(normalizeLanguage('pt-PT')).toBe('pt');
    expect(normalizeLanguage('pt_BR')).toBe('pt');
    expect(loadLocale('pt-BR').feature.screenshot).toBe('+ Captura de tela');
  });

  it('parses a --language value the way the API and config file do', () => {
    expect(parseLanguage('pt-BR')).toBe('pt');
    expect(parseLanguage('PT')).toBe('pt');
    expect(parseLanguage('es_MX')).toBe('es');
    expect(parseLanguage('ar')).toBe('ar');
  });

  it('rejects a --language value that matches nothing, and names the supported ones', () => {
    // Unlike loadLocale, which falls back to English, this is for a flag the user typed.
    expect(() => parseLanguage('xx')).toThrowError(/Unsupported language "xx".*en, es, fr, pt, ar/);
    expect(() => parseLanguage('')).toThrowError(/Unsupported language/);
  });

  it('gives every locale file the same keys as English', () => {
    const englishKeys = leafKeys(fs.readJsonSync(path.join(localesDir, 'en.json'))).sort();
    const files = fs.readdirSync(localesDir).filter((file) => file.endsWith('.json'));

    expect(files.map((file) => file.replace(/\.json$/, '')).sort()).toEqual([...SUPPORTED_LANGUAGES].sort());

    for (const file of files) {
      const locale = fs.readJsonSync(path.join(localesDir, file)) as Record<string, unknown>;
      const keys = leafKeys(locale).sort();
      const missing = englishKeys.filter((key) => !keys.includes(key));
      const extra = keys.filter((key) => !englishKeys.includes(key));
      expect(missing).withContext(`${file} is missing keys`).toEqual([]);
      expect(extra).withContext(`${file} has keys English does not define`).toEqual([]);

      for (const key of keys) {
        const value = key.split('.').reduce<unknown>((current, part) => {
          return current && typeof current === 'object' ? (current as Record<string, unknown>)[part] : undefined;
        }, locale);
        expect(typeof value)
          .withContext(`${file} ${key}`)
          .toBe('string');
        expect((value as string).length)
          .withContext(`${file} ${key} is empty`)
          .toBeGreaterThan(0);
      }
    }
  });
});

describe('localised pages', () => {
  const reportPath = path.resolve(process.cwd(), './.tmp/locale-pages');
  const jsonDir = './src/test/unit/data/video-html-attachment/';
  const nonEnglish = SUPPORTED_LANGUAGES.filter((language) => language !== 'en');

  const readIndex = (folder: string): string => fs.readFileSync(path.join(reportPath, folder, 'index.html'), 'utf8');
  const readFeaturePage = (folder: string): string => {
    const featuresDir = path.join(reportPath, folder, 'features');
    return fs.readFileSync(path.join(featuresDir, fs.readdirSync(featuresDir)[0]), 'utf8');
  };

  beforeAll(async () => {
    fs.removeSync(reportPath);
    for (const language of SUPPORTED_LANGUAGES) {
      await generate({
        jsonDir,
        reportPath: path.join(reportPath, language),
        staticFilePath: true,
        language,
        logging: 'silent',
      });
    }
    // A regional tag, as a config file or the API can pass it.
    await generate({
      jsonDir,
      reportPath: path.join(reportPath, 'pt-BR'),
      staticFilePath: true,
      language: 'pt-BR' as SupportedLanguage,
      logging: 'silent',
    });
  });

  afterAll(() => {
    fs.removeSync(reportPath);
  });

  // Every template lookup carries an English `| default:` fallback, so text that cannot see
  // `locale` (for example inside an isolated `{% render %}` partial) does not fail, it quietly
  // shows English. Only inspecting the rendered output catches that.
  for (const language of nonEnglish) {
    describe(`"${language}"`, () => {
      const locale = loadLocale(language);

      it('should set the document language and direction and translate the dashboard', () => {
        const index = readIndex(language);
        expect(index).toContain(`<html lang="${locale.htmlLang}" dir="${locale.direction}">`);
        expect(index).toContain(locale.dashboard.featuresOverview);
      });

      it('should translate the metadata tooltips on a feature page instead of leaving the English fallback', () => {
        const page = readFeaturePage(language);
        expect(page).withContext('Node version').toContain(`title="${locale.runInfo.nodeVersion} `);
        expect(page).withContext('report version').toContain(`title="${locale.runInfo.reportVersion} `);
        expect(page).withContext('running locally').toContain(`title="${locale.runInfo.runningLocally}"`);
        expect(page).not.toContain('title="Running locally"');
        expect(page).not.toContain('title="Node Version');
        expect(page).not.toContain('title="Report Version');
      });

      it('should translate the platform tooltip in the server-rendered features table', () => {
        const index = readIndex(language);
        expect(index).toContain(`title="${locale.runInfo.localMachine}"`);
        expect(index).not.toContain('title="Local machine"');
      });
    });
  }

  it('should keep the English text for English', () => {
    expect(readFeaturePage('en')).toContain('title="Running locally"');
    expect(readIndex('en')).toContain('title="Local machine"');
  });

  it('should treat a regional tag as its base language', () => {
    const index = readIndex('pt-BR');
    expect(index).toContain('<html lang="pt" dir="ltr">');
    expect(index).toContain(loadLocale('pt').dashboard.featuresOverview);
  });
});
