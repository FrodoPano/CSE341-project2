const swaggerAutogen = require('swagger-autogen')();

const doc = {
    info: {
        title: 'User Api',
        description: 'User Api'
    },
    host: 'localhost:3001',
    schemes: ['http', 'https']
};

const outputFile = './swagger.json';
const endpointFiles = ['./routes/index.js'];

// this will generate swagger.json
swaggerAutogen(outputFile, endpointFiles, doc);