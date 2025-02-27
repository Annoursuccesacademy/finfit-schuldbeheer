import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Grid,
  Button,
  Tabs,
  Tab,
  Box,
  TextField,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Alert,
  Snackbar
} from '@mui/material';
import { 
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  AttachMoney as AttachMoneyIcon,
  EventNote as EventNoteIcon,
  Assessment as AssessmentIcon
} from '@mui/icons-material';
import axios from 'axios';
import config from '../config';

function ClientDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [client, setClient] = useState(null);
  const [debts, setDebts] = useState([]);
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openNoteDialog, setOpenNoteDialog] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [openPaymentDialog, setOpenPaymentDialog] = useState(false);
  const [newPayment, setNewPayment] = useState({
    amount: '',
    payment_method: 'bank',
    notes: ''
  });
  const [selectedDebt, setSelectedDebt] = useState(null);
  const [aiAnalysis, setAiAnalysis] = useState(null);

  useEffect(() => {
    const fetchClientData = async () => {
      try {
        setLoading(true);
        const clientResponse = await axios.get(`${config.apiUrl}/clients/${id}`);
        setClient(clientResponse.data);
        
        const debtsResponse = await axios.get(`${config.apiUrl}/clients/${id}/debts`);
        setDebts(debtsResponse.data);
        
        // Fetch AI analysis
        try {
          const analysisResponse = await axios.get(`${config.apiUrl}/clients/${id}/analysis`);
          setAiAnalysis(analysisResponse.data);
        } catch (analysisError) {
          console.error('Error fetching AI analysis:', analysisError);
          setAiAnalysis({
            summary: 'AI analyse momenteel niet beschikbaar.',
            recommendations: ['Probeer later opnieuw.']
          });
        }
        
        setLoading(false);
      } catch (err) {
        setError('Er is een fout opgetreden bij het ophalen van de gegevens.');
        setLoading(false);
        console.error(err);
      }
    };

    fetchClientData();
  }, [id]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleBackClick = () => {
    navigate('/clients');
  };

  const handleAddNote = async () => {
    if (!newNote.trim()) return;
    
    try {
      await axios.post(`${config.apiUrl}/clients/${id}/notes`, { note: newNote });
      
      // Update client data with new note
      setClient({
        ...client,
        notes: client.notes ? [...client.notes, { date: new Date().toISOString(), text: newNote }] : [{ date: new Date().toISOString(), text: newNote }]
      });
      
      setNewNote('');
      setOpenNoteDialog(false);
      setSnackbarMessage('Notitie succesvol toegevoegd');
      setOpenSnackbar(true);
    } catch (err) {
      setError('Er is een fout opgetreden bij het toevoegen van de notitie.');
      console.error(err);
    }
  };

  const handleOpenPaymentDialog = (debt) => {
    setSelectedDebt(debt);
    setOpenPaymentDialog(true);
  };

  const handleAddPayment = async () => {
    if (!newPayment.amount || !selectedDebt) return;
    
    try {
      const paymentData = {
        ...newPayment,
        amount: parseFloat(newPayment.amount),
        payment_date: new Date().toISOString().split('T')[0]
      };
      
      await axios.post(`${config.apiUrl}/debts/${selectedDebt.id}/payments`, paymentData);
      
      // Update debts data with new payment
      const updatedDebts = debts.map(debt => {
        if (debt.id === selectedDebt.id) {
          return {
            ...debt,
            payment_history: [...debt.payment_history, paymentData]
          };
        }
        return debt;
      });
      
      setDebts(updatedDebts);
      setNewPayment({ amount: '', payment_method: 'bank', notes: '' });
      setOpenPaymentDialog(false);
      setSnackbarMessage('Betaling succesvol toegevoegd');
      setOpenSnackbar(true);
    } catch (err) {
      setError('Er is een fout opgetreden bij het toevoegen van de betaling.');
      console.error(err);
    }
  };

  if (loading) return <Typography>Laden...</Typography>;
  if (error) return <Typography color="error">{error}</Typography>;
  if (!client) return <Typography>Geen cliënt gevonden</Typography>;

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Button 
        startIcon={<ArrowBackIcon />} 
        onClick={handleBackClick}
        sx={{ mb: 2 }}
      >
        Terug naar cliënten
      </Button>
      
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={8}>
            <Typography variant="h4">{client.name}</Typography>
            <Typography variant="body1" color="textSecondary">{client.email}</Typography>
            <Typography variant="body1" color="textSecondary">{client.phone}</Typography>
            {client.address && (
              <Typography variant="body1" color="textSecondary">
                {client.address}, {client.postal_code} {client.city}
              </Typography>
            )}
          </Grid>
          <Grid item xs={12} sm={4} sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'flex-start' }}>
            <Button 
              variant="outlined" 
              startIcon={<EditIcon />}
              sx={{ mr: 1 }}
            >
              Bewerken
            </Button>
            <Button 
              variant="outlined" 
              color="error" 
              startIcon={<DeleteIcon />}
            >
              Verwijderen
            </Button>
          </Grid>
        </Grid>
      </Paper>
      
      <Box sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="client tabs">
            <Tab label="Overzicht" />
            <Tab label="Schulden" />
            <Tab label="Notities" />
            <Tab label="AI Analyse" />
          </Tabs>
        </Box>
        
        {/* Overzicht Tab */}
        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Schulden Samenvatting</Typography>
                  <Typography variant="body1">
                    Totaal aantal schulden: {debts.length}
                  </Typography>
                  <Typography variant="body1">
                    Totaal schuldbedrag: €{debts.reduce((sum, debt) => sum + debt.amount, 0).toFixed(2)}
                  </Typography>
                  <Typography variant="body1">
                    Hoogste schuld: €{debts.length > 0 ? Math.max(...debts.map(debt => debt.amount)).toFixed(2) : '0.00'}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Recente Activiteit</Typography>
                  {client.notes && client.notes.length > 0 ? (
                    <List>
                      {client.notes.slice(0, 3).map((note, index) => (
                        <ListItem key={index} disablePadding>
                          <ListItemText 
                            primary={note.text} 
                            secondary={new Date(note.date).toLocaleDateString()}
                          />
                        </ListItem>
                      ))}
                    </List>
                  ) : (
                    <Typography variant="body2">Geen recente activiteiten</Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Volgende Acties</Typography>
                  <List>
                    {debts.filter(debt => debt.next_payment_date).slice(0, 3).map((debt, index) => (
                      <ListItem key={index} disablePadding>
                        <ListItemText 
                          primary={`Betaling voor ${debt.creditor}`} 
                          secondary={`Vervaldatum: ${new Date(debt.next_payment_date).toLocaleDateString()}`}
                        />
                      </ListItem>
                    ))}
                    {debts.filter(debt => debt.next_payment_date).length === 0 && (
                      <Typography variant="body2">Geen geplande acties</Typography>
                    )}
                  </List>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>
        
        {/* Schulden Tab */}
        <TabPanel value={tabValue} index={1}>
          <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
            <Button variant="contained" startIcon={<AddIcon />}>
              Nieuwe Schuld
            </Button>
          </Box>
          
          {debts.length > 0 ? (
            debts.map((debt) => (
              <Card key={debt.id} sx={{ mb: 2 }}>
                <CardContent>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={8}>
                      <Typography variant="h6">{debt.creditor}</Typography>
                      <Typography variant="body1">€{debt.amount.toFixed(2)}</Typography>
                      <Typography variant="body2" color="textSecondary">
                        Status: {debt.status}
                      </Typography>
                      {debt.start_date && (
                        <Typography variant="body2" color="textSecondary">
                          Start datum: {new Date(debt.start_date).toLocaleDateString()}
                        </Typography>
                      )}
                      {debt.notes && (
                        <Typography variant="body2" sx={{ mt: 1 }}>
                          {debt.notes}
                        </Typography>
                      )}
                    </Grid>
                    <Grid item xs={12} sm={4} sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'flex-start' }}>
                      <IconButton 
                        color="primary" 
                        onClick={() => handleOpenPaymentDialog(debt)}
                        title="Betaling toevoegen"
                      >
                        <AttachMoneyIcon />
                      </IconButton>
                      <IconButton 
                        color="primary"
                        title="Notitie toevoegen"
                      >
                        <EventNoteIcon />
                      </IconButton>
                      <IconButton 
                        color="primary"
                        title="Bewerken"
                      >
                        <EditIcon />
                      </IconButton>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            ))
          ) : (
            <Typography>Geen schulden gevonden</Typography>
          )}
        </TabPanel>
        
        {/* Notities Tab */}
        <TabPanel value={tabValue} index={2}>
          <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
            <Button 
              variant="contained" 
              startIcon={<AddIcon />}
              onClick={() => setOpenNoteDialog(true)}
            >
              Nieuwe Notitie
            </Button>
          </Box>
          
          {client.notes && client.notes.length > 0 ? (
            client.notes.map((note, index) => (
              <Paper key={index} sx={{ p: 2, mb: 2 }}>
                <Typography variant="body1">{note.text}</Typography>
                <Typography variant="caption" color="textSecondary">
                  {new Date(note.date).toLocaleDateString()} {new Date(note.date).toLocaleTimeString()}
                </Typography>
              </Paper>
            ))
          ) : (
            <Typography>Geen notities gevonden</Typography>
          )}
        </TabPanel>
        
        {/* AI Analyse Tab */}
        <TabPanel value={tabValue} index={3}>
          {aiAnalysis ? (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      <AssessmentIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                      AI Analyse Samenvatting
                    </Typography>
                    <Typography variant="body1" paragraph>
                      {aiAnalysis.summary}
                    </Typography>
                    
                    <Typography variant="h6" gutterBottom>Aanbevelingen</Typography>
                    <List>
                      {aiAnalysis.recommendations.map((recommendation, index) => (
                        <ListItem key={index}>
                          <ListItemText primary={recommendation} />
                        </ListItem>
                      ))}
                    </List>
                    
                    {aiAnalysis.risk_factors && (
                      <>
                        <Typography variant="h6" gutterBottom>Risicofactoren</Typography>
                        <List>
                          {aiAnalysis.risk_factors.map((factor, index) => (
                            <ListItem key={index}>
                              <ListItemText 
                                primary={factor.name} 
                                secondary={factor.description} 
                              />
                            </ListItem>
                          ))}
                        </List>
                      </>
                    )}
                    
                    {aiAnalysis.payment_prediction && (
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="h6" gutterBottom>Betalingsvoorspelling</Typography>
                        <Typography variant="body1">
                          {aiAnalysis.payment_prediction}
                        </Typography>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          ) : (
            <Typography>AI analyse wordt geladen...</Typography>
          )}
        </TabPanel>
      </Box>
      
      {/* Add Note Dialog */}
      <Dialog open={openNoteDialog} onClose={() => setOpenNoteDialog(false)}>
        <DialogTitle>Nieuwe Notitie</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Notitie"
            fullWidth
            multiline
            rows={4}
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenNoteDialog(false)} startIcon={<CancelIcon />}>
            Annuleren
          </Button>
          <Button onClick={handleAddNote} color="primary" startIcon={<SaveIcon />}>
            Opslaan
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Add Payment Dialog */}
      <Dialog open={openPaymentDialog} onClose={() => setOpenPaymentDialog(false)}>
        <DialogTitle>Nieuwe Betaling</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Bedrag"
            type="number"
            fullWidth
            value={newPayment.amount}
            onChange={(e) => setNewPayment({...newPayment, amount: e.target.value})}
            sx={{ mb: 2 }}
          />
          <TextField
            select
            margin="dense"
            label="Betaalmethode"
            fullWidth
            value={newPayment.payment_method}
            onChange={(e) => setNewPayment({...newPayment, payment_method: e.target.value})}
            sx={{ mb: 2 }}
            SelectProps={{
              native: true,
            }}
          >
            <option value="bank">Bank</option>
            <option value="contant">Contant</option>
            <option value="automatisch">Automatische incasso</option>
          </TextField>
          <TextField
            margin="dense"
            label="Notities"
            fullWidth
            multiline
            rows={2}
            value={newPayment.notes}
            onChange={(e) => setNewPayment({...newPayment, notes: e.target.value})}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenPaymentDialog(false)} startIcon={<CancelIcon />}>
            Annuleren
          </Button>
          <Button onClick={handleAddPayment} color="primary" startIcon={<SaveIcon />}>
            Opslaan
          </Button>
        </DialogActions>
      </Dialog>
      
      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={() => setOpenSnackbar(false)}
      >
        <Alert onClose={() => setOpenSnackbar(false)} severity="success" sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
}

// TabPanel component for tab content
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`client-tabpanel-${index}`}
      aria-labelledby={`client-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

export default ClientDetail;
