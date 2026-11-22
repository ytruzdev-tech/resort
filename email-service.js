/**
 * EmailJS Service Module
 */
const EMAILJS_CONFIG = {
  PUBLIC_KEY: 'WRuDcUYyM9iTI2kyn',
  SERVICE_ID: 'service_k90nv9l',
  TEMPLATE_ID: 'template_4tuigis'
};

// Initialize EmailJS SDK
(function initEmailJS() {
  if (typeof emailjs !== 'undefined' && EMAILJS_CONFIG.PUBLIC_KEY !== 'YOUR_PUBLIC_KEY') {
    emailjs.init({
      publicKey: EMAILJS_CONFIG.PUBLIC_KEY
    });
  }
})();

/**
 * Nagpapadala ng booking inquiry gamit ang EmailJS
 * @param {Object} templateParams
 * @returns {Promise}
 */
async function sendBookingEmail(templateParams) {
  if (typeof emailjs === 'undefined') {
    throw new Error('Hindi na-load ang EmailJS SDK. I-check ang internet connection.');
  }

  // Huwag palitan ang placeholders dito — check lang ito kung nakalimutan i-set ang config sa taas
  if (
    !EMAILJS_CONFIG.PUBLIC_KEY ||
    EMAILJS_CONFIG.PUBLIC_KEY === 'YOUR_PUBLIC_KEY' ||
    !EMAILJS_CONFIG.SERVICE_ID ||
    EMAILJS_CONFIG.SERVICE_ID === 'YOUR_SERVICE_ID' ||
    !EMAILJS_CONFIG.TEMPLATE_ID ||
    EMAILJS_CONFIG.TEMPLATE_ID === 'YOUR_TEMPLATE_ID'
  ) {
    throw new Error(
      'I-set muna ang iyong EmailJS PUBLIC_KEY, SERVICE_ID, at TEMPLATE_ID sa email-service.js.'
    );
  }

  return emailjs.send(
    EMAILJS_CONFIG.SERVICE_ID,
    EMAILJS_CONFIG.TEMPLATE_ID,
    templateParams
  );
}