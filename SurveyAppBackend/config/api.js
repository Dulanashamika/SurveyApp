// API Configuration
module.exports = {
  port: process.env.PORT || 5001,
  apiKey: process.env.API_KEY,

  // CORS settings
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
  },

  // Request limits
  limits: {
    json: '50mb',
    urlencoded: '50mb'
  }
};
