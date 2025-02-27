import React from 'react';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
} from '@mui/material';

function Dashboard() {
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        {/* Welkom kaart */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h4" gutterBottom>
              Welkom bij FinFit Schuldbeheer
            </Typography>
            <Typography variant="body1">
              Beheer uw schulden op een overzichtelijke manier
            </Typography>
          </Paper>
        </Grid>

        {/* Statistieken */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6">Totaal Aantal Cliënten</Typography>
              <Typography variant="h3">1</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6">Totaal Schuldbedrag</Typography>
              <Typography variant="h3">€5.000</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6">Openstaande Betalingen</Typography>
              <Typography variant="h3">1</Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Recente activiteit */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Recente Activiteit
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Typography variant="body1">
                • Nieuwe cliënt toegevoegd: John Doe
              </Typography>
              <Typography variant="body1">
                • Nieuwe schuld geregistreerd: €5.000
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}

export default Dashboard;
