import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemText,
  Divider,
  CircularProgress,
  Button,
  Alert,
  Grid,
  Chip,
} from '@mui/material';
import {
  Assessment as AssessmentIcon,
  Refresh as RefreshIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import axios from 'axios';
import config from '../config';

function AIAnalysis({ clientId }) {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAnalysis = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get(`${config.apiUrl}/clients/${clientId}/analysis`);
      setAnalysis(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching AI analysis:', err);
      setError('Er is een fout opgetreden bij het ophalen van de AI analyse.');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalysis();
  }, [clientId]);

  const handleRefreshAnalysis = async () => {
    try {
      setRefreshing(true);
      setError(null);
      
      // Force a new analysis
      const response = await axios.post(`${config.apiUrl}/clients/${clientId}/analysis/refresh`);
      setAnalysis(response.data);
      setRefreshing(false);
    } catch (err) {
      console.error('Error refreshing AI analysis:', err);
      setError('Er is een fout opgetreden bij het vernieuwen van de AI analyse.');
      setRefreshing(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error}
      </Alert>
    );
  }

  if (!analysis) {
    return (
      <Alert severity="info" sx={{ mt: 2 }}>
        Geen AI analyse beschikbaar voor deze cliënt.
      </Alert>
    );
  }

  const getRiskLevelColor = (level) => {
    switch (level.toLowerCase()) {
      case 'hoog':
      case 'high':
        return 'error';
      case 'gemiddeld':
      case 'medium':
        return 'warning';
      case 'laag':
      case 'low':
        return 'success';
      default:
        return 'default';
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5" component="div">
          <AssessmentIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          AI Analyse
        </Typography>
        <Button 
          variant="outlined" 
          startIcon={<RefreshIcon />} 
          onClick={handleRefreshAnalysis}
          disabled={refreshing}
        >
          {refreshing ? 'Vernieuwen...' : 'Vernieuwen'}
        </Button>
      </Box>

      {analysis.last_updated && (
        <Typography variant="caption" color="textSecondary" sx={{ mb: 2, display: 'block' }}>
          Laatste update: {new Date(analysis.last_updated).toLocaleString()}
        </Typography>
      )}

      <Grid container spacing={3}>
        {/* Samenvatting */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Samenvatting
              </Typography>
              <Typography variant="body1">
                {analysis.summary}
              </Typography>
              
              {analysis.risk_level && (
                <Box sx={{ mt: 2, display: 'flex', alignItems: 'center' }}>
                  <Typography variant="subtitle1" sx={{ mr: 1 }}>
                    Algemeen risiconiveau:
                  </Typography>
                  <Chip 
                    label={analysis.risk_level} 
                    color={getRiskLevelColor(analysis.risk_level)}
                    icon={analysis.risk_level.toLowerCase() === 'hoog' ? <WarningIcon /> : <CheckCircleIcon />}
                  />
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Aanbevelingen */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Aanbevelingen
              </Typography>
              {analysis.recommendations && analysis.recommendations.length > 0 ? (
                <List>
                  {analysis.recommendations.map((recommendation, index) => (
                    <React.Fragment key={index}>
                      <ListItem alignItems="flex-start">
                        <ListItemText primary={recommendation} />
                      </ListItem>
                      {index < analysis.recommendations.length - 1 && <Divider component="li" />}
                    </React.Fragment>
                  ))}
                </List>
              ) : (
                <Typography variant="body2">Geen aanbevelingen beschikbaar.</Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Risicofactoren */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Risicofactoren
              </Typography>
              {analysis.risk_factors && analysis.risk_factors.length > 0 ? (
                <List>
                  {analysis.risk_factors.map((factor, index) => (
                    <React.Fragment key={index}>
                      <ListItem alignItems="flex-start">
                        <ListItemText 
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              {factor.name}
                              {factor.level && (
                                <Chip 
                                  label={factor.level} 
                                  size="small"
                                  color={getRiskLevelColor(factor.level)}
                                  sx={{ ml: 1 }}
                                />
                              )}
                            </Box>
                          } 
                          secondary={factor.description} 
                        />
                      </ListItem>
                      {index < analysis.risk_factors.length - 1 && <Divider component="li" />}
                    </React.Fragment>
                  ))}
                </List>
              ) : (
                <Typography variant="body2">Geen risicofactoren geïdentificeerd.</Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Betalingsvoorspelling */}
        {analysis.payment_prediction && (
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Betalingsvoorspelling
                </Typography>
                <Typography variant="body1">
                  {analysis.payment_prediction}
                </Typography>
                
                {analysis.payment_trend && (
                  <Box sx={{ mt: 2, display: 'flex', alignItems: 'center' }}>
                    <Typography variant="subtitle1" sx={{ mr: 1 }}>
                      Trend:
                    </Typography>
                    <Chip 
                      label={analysis.payment_trend} 
                      color={analysis.payment_trend.toLowerCase().includes('positief') ? 'success' : 'error'}
                      icon={analysis.payment_trend.toLowerCase().includes('positief') ? <TrendingUpIcon /> : <TrendingDownIcon />}
                    />
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>
    </Box>
  );
}

export default AIAnalysis;
