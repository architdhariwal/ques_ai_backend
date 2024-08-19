const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const cors = require('cors')


dotenv.config();
connectDB();

const app = express();
app.use(cors())
app.use(express.json());


app.use('/api/auth', require('./routes/auth.route'));
app.use('/api/projects', require('./routes/project.route'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));