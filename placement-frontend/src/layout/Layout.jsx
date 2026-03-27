import React from 'react'
import MainNavbar from '../components/MainNavbar'
import { Outlet } from 'react-router-dom'
import { Footer } from '../components/Footer'
export const Layout = () => {
    return (
        <div>
            <MainNavbar />
            <main>
                <Outlet />
            </main>
            <Footer />
        </div>
    )
}