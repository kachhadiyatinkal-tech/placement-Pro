import { configureStore } from '@reduxjs/toolkit'

import authReducer from '../features/auth/authSlice'
import jobReducer from '../features/jobs/jobSlice'
import studentReducer from '../features/students/studentSlice'
import themeReducer from '../features/theme/themeSlice'
import companyReducer from '../features/company/companySlice'
import managementReducer from '../features/management/managementSlice'
import companiesReducer from '../features/companies/companiesSlice'
import noticesReducer from '../features/notices/noticesSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    jobs: jobReducer,
    students: studentReducer,
    theme: themeReducer,
    company: companyReducer,
    management: managementReducer,
    companies: companiesReducer,
    notices: noticesReducer,
  },
})

