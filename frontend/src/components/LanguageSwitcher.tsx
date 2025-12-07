import { useTranslation } from 'react-i18next';

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div className="flex items-center space-x-2">
      <button
        onClick={() => changeLanguage('en')}
        className={`px-3 py-1 rounded-md text-sm font-medium ${
          i18n.language === 'en' 
            ? 'bg-blue-500 text-white' 
            : 'text-gray-700 hover:bg-gray-100'
        }`}
      >
        EN
      </button>
      <button
        onClick={() => changeLanguage('de')}
        className={`px-3 py-1 rounded-md text-sm font-medium ${
          i18n.language === 'de' 
            ? 'bg-blue-500 text-white' 
            : 'text-gray-700 hover:bg-gray-100'
        }`}
      >
        DE
      </button>
    </div>
  );
};

export default LanguageSwitcher;
