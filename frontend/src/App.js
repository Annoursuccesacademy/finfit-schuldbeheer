import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Dashboard from './components/Dashboard';
import ClientList from './components/ClientList';
import ClientDetail from './components/ClientDetail';
import Navigation from './components/Navigation';
import Login from './components/Login';
import Calendar from './components/Calendar';
import PrivateRoute from './components/PrivateRoute';
import { AuthProvider } from './context/AuthContext';
import { Container } from '@mui/material';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            
            {/* Protected Routes */}
            <Route element={<PrivateRoute />}>
              <Route path="/" element={
                <>
                  <Navigation />
                  <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
                    <Dashboard />
                  </Container>
                </>
              } />
              
              <Route path="/clients" element={
                <>
                  <Navigation />
                  <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
                    <ClientList />
                  </Container>
                </>
              } />
              
              <Route path="/clients/:id" element={
                <>
                  <Navigation />
                  <ClientDetail />
                </>
              } />
              
              <Route path="/calendar" element={
                <>
                  <Navigation />
                  <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
                    <Calendar />
                  </Container>
                </>
              } />
            </Route>
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
