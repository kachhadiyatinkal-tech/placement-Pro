const express = require('express');
const cors = require('cors');
const path = require("path");
const dotenv = require('dotenv');
dotenv.config();
const errorHandler = require('./middleware/errorHandler.middleware');
const { sendError } = require('./utils/apiResponse');

const app = express();
app.use(cors());
app.use(express.json());

// public folder for users profile
app.use('/profileImgs', express.static(path.join(__dirname, 'public/profileImgs')));
app.use('/resume', express.static(path.join(__dirname, 'public/resumes')));
app.use('/offerLetter', express.static(path.join(__dirname, 'public/offerLetter')));
app.use('/noticeAttachments', express.static(path.join(__dirname, 'public/noticeAttachments')));

// database import 
const mongodb = require('./config/MongoDB');
mongodb();


// routes for user
app.use('/api/v1/user', require('./routes/user.route'));
// routes for student user
app.use('/api/v1/student', require('./routes/student.route'));
// routes for tpo user
app.use('/api/v1/tpo', require('./routes/tpo.route'));
// routes for management user
app.use('/api/v1/management', require('./routes/management.route'));
// routes for admin user
app.use('/api/v1/admin', require('./routes/superuser.route'));
// route for company
app.use('/api/v1/company', require('./routes/company.route'));
// chatbot (placement assistant widget)
app.use('/api/chatbot', require('./routes/chatbotRoutes'));
// public contact page + admin/TPO management
app.use('/api/contact', require('./routes/contactPageRoutes'));
// practice test (exams, aptitude, etc)
app.use('/api/test', require('./routes/practiceTest.route'));
// job applications tracking APIs
app.use('/api/applications', require('./routes/applicationRoutes'));
// Same chat handler at POST /chat (simple API contract)
const { postChat } = require('./controllers/chatbotChat.controller');
app.post('/chat', postChat);

app.use((req, res) => {
  return sendError(res, 404, 'Route not found', { route: 'Requested endpoint does not exist' });
});

app.use(errorHandler);

// Start the server
const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});