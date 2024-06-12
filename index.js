require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
const app = express();
const port = process.env.PORT || 4000;

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Middleware to parse JSON bodies and handle CORS
app.use(express.json());
app.use(cors());

// Basic route
app.get('/', (req, res) => {
  res.send('Hello, ready to go?!');
});

// Sign-up route
app.post('/signup', async (req, res) => {
  const { email, password } = req.body;
  try {
    const { user, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
    res.status(200).json({ user });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Login route
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const { session, error } = await supabase.auth.signIn({ email, password });
    if (error) throw error;
    res.status(200).json({ session });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Logout route
app.post('/logout', async (req, res) => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Payment route
app.post('/pay', async (req, res) => {
  const { amount, email, currency } = req.body;

  try {
    const response = await axios.post(
      'https://api.flutterwave.com/v3/payments',
      {
        tx_ref: `tx-${Date.now()}`,
        amount,
        currency,
        redirect_url: 'https://your-redirect-url.com', // Replace with your actual redirect URL
        customer: {
          email,
        },
        customizations: {
          title: 'Payment for Services',
          description: 'Payment for goods and services',
        },
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    res.status(200).json(response.data);
  } catch (error) {
    console.error(error.response ? error.response.data : error.message);
    res.status(500).json({ error: error.message });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
