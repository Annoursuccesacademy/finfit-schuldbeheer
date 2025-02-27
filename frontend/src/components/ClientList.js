import React from 'react';
import {
  Container,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Button,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

function ClientList() {
  const clients = [
    {
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
      phone: '0612345678',
      city: 'Amsterdam',
    },
  ];

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <Typography variant="h5" gutterBottom>
            Cliënten Overzicht
          </Typography>
          <Button variant="contained" startIcon={<AddIcon />}>
            Nieuwe Cliënt
          </Button>
        </div>
        
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Naam</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Telefoon</TableCell>
                <TableCell>Stad</TableCell>
                <TableCell>Acties</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {clients.map((client) => (
                <TableRow key={client.id}>
                  <TableCell>{client.name}</TableCell>
                  <TableCell>{client.email}</TableCell>
                  <TableCell>{client.phone}</TableCell>
                  <TableCell>{client.city}</TableCell>
                  <TableCell>
                    <Button variant="outlined" size="small">
                      Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Container>
  );
}

export default ClientList;
