import { createTheme } from '@mui/material/styles';

// Tema personalizado com as cores vermelho sangue e branco
const theme = createTheme({
  palette: {
    primary: {
      main: '#990000', // vermelho sangue
      dark: '#660000',
      light: '#CC0000',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#FFFFFF', // branco
      contrastText: '#990000',
    },
    background: {
      default: '#FFFFFF',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#333333',
      secondary: '#666666',
    },
    error: {
      main: '#FF0000',
    },
    warning: {
      main: '#FFA500',
    },
    info: {
      main: '#0288d1',
    },
    success: {
      main: '#2e7d32',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 600,
    },
    h2: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
    button: {
      fontWeight: 600,
      textTransform: 'none',
    },
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#990000',
          color: '#FFFFFF',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        containedPrimary: {
          backgroundColor: '#990000',
          color: '#FFFFFF',
          '&:hover': {
            backgroundColor: '#660000',
          },
        },
        outlinedPrimary: {
          color: '#990000',
          borderColor: '#990000',
          '&:hover': {
            borderColor: '#660000',
            color: '#660000',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
        },
      },
    },
  },
});

export default theme;
