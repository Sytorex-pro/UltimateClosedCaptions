import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Home from './pages/Home/';
import Dashboard from './pages/Dashboard/';
import Thanks from './pages/Thanks';
import Error from './pages/Error';

import PageTitle from './components/PageTitle';
import Logout from './components/Logout';
import AppFooter from './components/AppFooter';
import Navigation from './components/Navigation';

import './webroot/style/colors.css';
import './webroot/style/main.css';
import './webroot/style/font.css';

import LogoImg from './assets/logo.png';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <React.StrictMode>
        <Router>
            <PageTitle />
            <div className='mainContainer'>
                <div className='contentContainer'>
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/logout" element={<Logout />} />
                        {/* thank-you */}
                        <Route path="/thank-you" element={<Thanks />} />
                        <Route path="*" element={<Error />} />
                    </Routes>
                    <AppFooter />
                </div>
                <Navigation logo={LogoImg}/>
            </div>
        </Router>
    </React.StrictMode>
);
