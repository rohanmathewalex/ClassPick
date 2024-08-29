import { Inter } from "next/font/google";
import "./globals.css";
import { AppBar, Toolbar, Typography, CssBaseline, Box } from "@mui/material";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Rate My Professor Support Agent",
  description: "An AI-powered assistant to help students find the best professors.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <CssBaseline />
        <Box display="flex" flexDirection="column" minHeight="100vh">
          {/* Header */}
          <AppBar position="static" style={{ backgroundColor: '#1976d2' }}>
            <Toolbar>
              <Typography variant="h6" component="div">
                Rate My Professor Support Agent
              </Typography>
            </Toolbar>
          </AppBar>

          {/* Main Content */}
          <Box component="main" flexGrow={1} style={{ padding: '20px 0' }}>
            {children}
          </Box>

          {/* Footer */}
          <Box
            component="footer"
            py={2}
            bgcolor="#1976d2"
            color="white"
            textAlign="center"
          >
            <Typography variant="body2">
              © 2024 Rohan Mathew Alex - All rights reserved.
            </Typography>
          </Box>
        </Box>
      </body>
    </html>
  );
}
