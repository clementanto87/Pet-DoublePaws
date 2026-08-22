import { de } from 'date-fns/locale';
import i18n from '../i18n/i18n';

// Returns date-fns format options with the German locale when the app language
// is German, otherwise undefined (date-fns then uses its default en-US locale).
export const dfOpts = () =>
    i18n.language?.startsWith('de') ? { locale: de } : undefined;
