import swaggerAutogen from 'swagger-autogen';

const doc = {
  info: {
    title: 'Fonik API',
    description: 'Fonik API'
  },
  host: 'https://fonik-backend.onrender.com'
};

const outputFile = './swagger.json';
const routes = [ './routes/phonesRoutes.js','./routes/userRoutes.js', './routes/authRoutes.js'];

/* NOTE: If you are using the express Router, you must pass in the 'routes' only the 
root file where the route starts, such as index.js, app.js, routes.js, etc ... */

swaggerAutogen({openapi: '3.0.0'})(outputFile, routes, doc);