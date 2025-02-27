import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  Card,
  CardContent,
  IconButton,
  Tooltip,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  Event as EventIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Today as TodayIcon,
  NavigateBefore as NavigateBeforeIcon,
  NavigateNext as NavigateNextIcon,
} from '@mui/icons-material';
import axios from 'axios';
import config from '../config';
import { useNavigate } from 'react-router-dom';

function Calendar() {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [newAppointment, setNewAppointment] = useState({
    title: '',
    client_id: '',
    date: new Date().toISOString().split('T')[0],
    time: '09:00',
    duration: 60,
    location: '',
    notes: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch appointments for the current month
        const startDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
        const endDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
        
        const appointmentsResponse = await axios.get(`${config.apiUrl}/appointments`, {
          params: {
            start_date: startDate.toISOString().split('T')[0],
            end_date: endDate.toISOString().split('T')[0],
          }
        });
        
        // Fetch clients for the dropdown
        const clientsResponse = await axios.get(`${config.apiUrl}/clients`);
        
        setAppointments(appointmentsResponse.data);
        setClients(clientsResponse.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching calendar data:', err);
        setError('Er is een fout opgetreden bij het ophalen van de agenda.');
        setLoading(false);
      }
    };

    fetchData();
  }, [currentMonth]);

  const handlePreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const handleToday = () => {
    setCurrentMonth(new Date());
    setSelectedDate(new Date());
  };

  const handleDateClick = (date) => {
    setSelectedDate(date);
  };

  const handleOpenDialog = (appointment = null) => {
    if (appointment) {
      // Edit existing appointment
      setSelectedAppointment(appointment);
      setNewAppointment({
        title: appointment.title,
        client_id: appointment.client_id,
        date: appointment.date,
        time: appointment.time,
        duration: appointment.duration,
        location: appointment.location || '',
        notes: appointment.notes || '',
      });
    } else {
      // Create new appointment
      setSelectedAppointment(null);
      setNewAppointment({
        title: '',
        client_id: '',
        date: selectedDate.toISOString().split('T')[0],
        time: '09:00',
        duration: 60,
        location: '',
        notes: '',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedAppointment(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewAppointment({
      ...newAppointment,
      [name]: value,
    });
  };

  const handleSaveAppointment = async () => {
    try {
      const appointmentData = {
        ...newAppointment,
        duration: parseInt(newAppointment.duration, 10),
      };
      
      if (selectedAppointment) {
        // Update existing appointment
        await axios.put(`${config.apiUrl}/appointments/${selectedAppointment.id}`, appointmentData);
      } else {
        // Create new appointment
        await axios.post(`${config.apiUrl}/appointments`, appointmentData);
      }
      
      // Refresh appointments
      const startDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
      const endDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
      
      const response = await axios.get(`${config.apiUrl}/appointments`, {
        params: {
          start_date: startDate.toISOString().split('T')[0],
          end_date: endDate.toISOString().split('T')[0],
        }
      });
      
      setAppointments(response.data);
      handleCloseDialog();
    } catch (err) {
      console.error('Error saving appointment:', err);
      setError('Er is een fout opgetreden bij het opslaan van de afspraak.');
    }
  };

  const handleDeleteAppointment = async () => {
    if (!selectedAppointment) return;
    
    try {
      await axios.delete(`${config.apiUrl}/appointments/${selectedAppointment.id}`);
      
      // Refresh appointments
      const startDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
      const endDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
      
      const response = await axios.get(`${config.apiUrl}/appointments`, {
        params: {
          start_date: startDate.toISOString().split('T')[0],
          end_date: endDate.toISOString().split('T')[0],
        }
      });
      
      setAppointments(response.data);
      handleCloseDialog();
    } catch (err) {
      console.error('Error deleting appointment:', err);
      setError('Er is een fout opgetreden bij het verwijderen van de afspraak.');
    }
  };

  const navigateToClient = (clientId) => {
    navigate(`/clients/${clientId}`);
  };

  // Calendar generation functions
  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year, month) => {
    return new Date(year, month, 1).getDay();
  };

  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    
    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    
    return days;
  };

  const getAppointmentsForDate = (date) => {
    if (!date) return [];
    
    return appointments.filter(appointment => {
      const appointmentDate = new Date(appointment.date);
      return (
        appointmentDate.getFullYear() === date.getFullYear() &&
        appointmentDate.getMonth() === date.getMonth() &&
        appointmentDate.getDate() === date.getDate()
      );
    });
  };

  const isToday = (date) => {
    if (!date) return false;
    
    const today = new Date();
    return (
      date.getFullYear() === today.getFullYear() &&
      date.getMonth() === today.getMonth() &&
      date.getDate() === today.getDate()
    );
  };

  const isSelectedDate = (date) => {
    if (!date) return false;
    
    return (
      date.getFullYear() === selectedDate.getFullYear() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getDate() === selectedDate.getDate()
    );
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5">
            <EventIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            Agenda
          </Typography>
          <Box>
            <Button
              variant="outlined"
              startIcon={<TodayIcon />}
              onClick={handleToday}
              sx={{ mr: 1 }}
            >
              Vandaag
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog()}
            >
              Nieuwe Afspraak
            </Button>
          </Box>
        </Box>
        
        {/* Calendar Navigation */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <IconButton onClick={handlePreviousMonth}>
            <NavigateBeforeIcon />
          </IconButton>
          <Typography variant="h6">
            {currentMonth.toLocaleString('nl-NL', { month: 'long', year: 'numeric' })}
          </Typography>
          <IconButton onClick={handleNextMonth}>
            <NavigateNextIcon />
          </IconButton>
        </Box>
        
        {/* Calendar Grid */}
        <Grid container spacing={1}>
          {/* Weekday Headers */}
          {['Zo', 'Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za'].map((day, index) => (
            <Grid item xs={12 / 7} key={index}>
              <Box sx={{ textAlign: 'center', fontWeight: 'bold', p: 1 }}>
                {day}
              </Box>
            </Grid>
          ))}
          
          {/* Calendar Days */}
          {generateCalendarDays().map((date, index) => (
            <Grid item xs={12 / 7} key={index}>
              {date ? (
                <Card 
                  sx={{ 
                    height: 120, 
                    cursor: 'pointer',
                    backgroundColor: isSelectedDate(date) ? 'primary.light' : (isToday(date) ? 'secondary.light' : 'background.paper'),
                    '&:hover': {
                      backgroundColor: isSelectedDate(date) ? 'primary.light' : 'action.hover',
                    },
                  }}
                  onClick={() => handleDateClick(date)}
                >
                  <CardContent sx={{ p: 1, height: '100%', overflow: 'auto' }}>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        fontWeight: isToday(date) ? 'bold' : 'normal',
                        color: isToday(date) ? 'secondary.main' : 'text.primary',
                        mb: 1
                      }}
                    >
                      {date.getDate()}
                    </Typography>
                    
                    {getAppointmentsForDate(date).slice(0, 3).map((appointment, idx) => (
                      <Box 
                        key={idx} 
                        sx={{ 
                          backgroundColor: 'primary.main', 
                          color: 'white', 
                          p: 0.5, 
                          borderRadius: 1, 
                          mb: 0.5,
                          fontSize: '0.75rem',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenDialog(appointment);
                        }}
                      >
                        {appointment.time.substring(0, 5)} {appointment.title}
                      </Box>
                    ))}
                    
                    {getAppointmentsForDate(date).length > 3 && (
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        +{getAppointmentsForDate(date).length - 3} meer
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <Box sx={{ height: 120, backgroundColor: 'action.disabledBackground' }} />
              )}
            </Grid>
          ))}
        </Grid>
      </Paper>
      
      {/* Selected Date Appointments */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Afspraken voor {selectedDate.toLocaleDateString('nl-NL', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </Typography>
        
        {getAppointmentsForDate(selectedDate).length > 0 ? (
          getAppointmentsForDate(selectedDate)
            .sort((a, b) => a.time.localeCompare(b.time))
            .map((appointment, index) => (
              <Card key={index} sx={{ mb: 2 }}>
                <CardContent>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={8}>
                      <Typography variant="h6">{appointment.title}</Typography>
                      <Typography variant="body1">
                        {appointment.time} - {appointment.duration} minuten
                      </Typography>
                      {appointment.location && (
                        <Typography variant="body2">
                          Locatie: {appointment.location}
                        </Typography>
                      )}
                      {appointment.client_id && (
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            color: 'primary.main', 
                            cursor: 'pointer',
                            '&:hover': {
                              textDecoration: 'underline'
                            }
                          }}
                          onClick={() => navigateToClient(appointment.client_id)}
                        >
                          Cliënt: {clients.find(c => c.id === appointment.client_id)?.name || 'Onbekend'}
                        </Typography>
                      )}
                      {appointment.notes && (
                        <Typography variant="body2" sx={{ mt: 1 }}>
                          {appointment.notes}
                        </Typography>
                      )}
                    </Grid>
                    <Grid item xs={12} sm={4} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <Tooltip title="Bewerken">
                        <IconButton 
                          color="primary" 
                          onClick={() => handleOpenDialog(appointment)}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Verwijderen">
                        <IconButton 
                          color="error"
                          onClick={() => {
                            setSelectedAppointment(appointment);
                            handleDeleteAppointment();
                          }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            ))
        ) : (
          <Typography variant="body1">Geen afspraken voor deze dag.</Typography>
        )}
        
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          sx={{ mt: 2 }}
        >
          Nieuwe Afspraak
        </Button>
      </Paper>
      
      {/* Add/Edit Appointment Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedAppointment ? 'Afspraak Bewerken' : 'Nieuwe Afspraak'}
        </DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="Titel"
            type="text"
            fullWidth
            name="title"
            value={newAppointment.title}
            onChange={handleInputChange}
            required
            sx={{ mb: 2 }}
          />
          
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel id="client-select-label">Cliënt</InputLabel>
            <Select
              labelId="client-select-label"
              name="client_id"
              value={newAppointment.client_id}
              onChange={handleInputChange}
              label="Cliënt"
            >
              <MenuItem value="">Geen cliënt</MenuItem>
              {clients.map((client) => (
                <MenuItem key={client.id} value={client.id}>
                  {client.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                margin="dense"
                label="Datum"
                type="date"
                fullWidth
                name="date"
                value={newAppointment.date}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                margin="dense"
                label="Tijd"
                type="time"
                fullWidth
                name="time"
                value={newAppointment.time}
                onChange={handleInputChange}
                required
              />
            </Grid>
          </Grid>
          
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                margin="dense"
                label="Duur (minuten)"
                type="number"
                fullWidth
                name="duration"
                value={newAppointment.duration}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                margin="dense"
                label="Locatie"
                type="text"
                fullWidth
                name="location"
                value={newAppointment.location}
                onChange={handleInputChange}
              />
            </Grid>
          </Grid>
          
          <TextField
            margin="dense"
            label="Notities"
            type="text"
            fullWidth
            multiline
            rows={4}
            name="notes"
            value={newAppointment.notes}
            onChange={handleInputChange}
          />
        </DialogContent>
        <DialogActions>
          {selectedAppointment && (
            <Button 
              onClick={handleDeleteAppointment} 
              color="error" 
              startIcon={<DeleteIcon />}
              sx={{ mr: 'auto' }}
            >
              Verwijderen
            </Button>
          )}
          <Button onClick={handleCloseDialog}>Annuleren</Button>
          <Button onClick={handleSaveAppointment} color="primary" variant="contained">
            Opslaan
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Calendar;
