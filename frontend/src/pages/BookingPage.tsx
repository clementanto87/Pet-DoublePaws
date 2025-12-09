import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import FindSitterSearchBox from '../components/search/FindSitterSearchBox';

const BookingPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen flex items-center bg-gradient-to-b from-orange-50/50 via-white to-white dark:from-gray-900 dark:via-gray-900 dark:to-gray-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 py-16">
        <div className="max-w-5xl mx-auto">
          {/* Header Content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-10"
          >
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-5xl md:text-6xl lg:text-7xl font-display font-bold mb-6 leading-[1.1] tracking-tight text-gray-900 dark:text-white"
            >
              {t('booking.title')}<br />
              <span className="relative">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-orange-500 to-amber-500">
                  {t('booking.titleHighlight')}
                </span>
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto"
            >
              {t('booking.subtitle')}
            </motion.p>
          </motion.div>

          {/* ✨ STUNNING SEARCH BOX ✨ */}
          <FindSitterSearchBox />
        </div>
      </div>
    </div>
  );
};

export default BookingPage;
