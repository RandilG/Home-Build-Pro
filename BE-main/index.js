var express = require('express');
var bodyParser = require('body-parser');
var cors = require('cors');
var path = require('path');
const router = require('./routes/routes');
const dotenv = require('dotenv');
var connection = require('./services/connection');

var app = express();
dotenv.config();

const corsOptions = {
    origin: ['http://localhost:8000', 'http://localhost:19000'], // Allowed origins
    optionsSuccessStatus: 200
};

// Apply CORS with options
app.use(cors(corsOptions));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(router);


// Use Routes
app.use('/api', router);


// Database Connection Check
connection.connect((err) => {
    if (err) {
        console.error('Database connection failed:', err.message);
    } else {
        console.log('Connected to MySQL database');
    }
});

const port = 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
