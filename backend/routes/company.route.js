const express = require('express')

// router after /api/v1/company/
const router = express.Router()

const authenticateToken = require('../middleware/auth.middleware')
const uploadUserProfile = require('../config/MulterProfilePhoto.js');

const {
  AddCompany,
  CompanyDetail,
  AllCompanyDetail,
  DeleteCompany,
  CompanyMyProfile,
  UpdateCompanyProfile,
  UploadCompanyLogo,
} = require('../controllers/Company/company.all-company.controller')
const companyLogin = require('../controllers/Company/company.login.controller')
const companySignup = require('../controllers/Company/company.signup.controller')

// Public registration
router.post('/signup', companySignup)

// Auth for company users
router.post('/login', companyLogin)

// company list/detail APIs
router.get('/company-detail', authenticateToken, AllCompanyDetail)
// router.get('/company-detail/:companyId', authenticateToken, CompanyDetail);

// company details
router.post('/add-company', authenticateToken, AddCompany)

router.post('/delete-company', authenticateToken, DeleteCompany)

router.get('/company-data', CompanyDetail)
router.get('/my-profile', authenticateToken, CompanyMyProfile)
router.post('/update-profile', authenticateToken, UpdateCompanyProfile)
router.post('/upload-logo', authenticateToken, uploadUserProfile.single('profileImgs'), UploadCompanyLogo)

module.exports = router
