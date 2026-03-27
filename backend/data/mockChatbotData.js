/**
 * Mock datastore for chatbot actions (replace with DB reads when needed).
 */
const company = {
  name: 'My Company',
  description: 'We provide AI services',
  services: ['Chatbots', 'Web Development'],
};

const contact = {
  email: 'support@mycompany.com',
  phone: '+91-9999999999',
};

module.exports = { company, contact };
