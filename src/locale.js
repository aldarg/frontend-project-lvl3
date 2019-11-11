import i18next from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import resources from '../locales';

export default () => {
  i18next
    .use(LanguageDetector)
    .init({
      debug: true,
      detection: { order: ['htmlTag'] },
      resources,
    });

  return {
    error: {
      subscribed: i18next.t('errors:subscribed'),
      source: i18next.t('errors:source'),
      connection: i18next.t('errors:connection'),
    },
    element: {
      input: i18next.t('elements:input'),
      subscribe: i18next.t('elements:subscribe'),
      feeds: i18next.t('elements:feeds'),
    },
  };
};
