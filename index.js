const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const client = require('prom-client');

const db = require('./config/mongoose');
const User = require('./models/register');
const Login = require('./models/login');
const Dashboard = require('./models/dashboard');

const port = 4000;
const app = express();

// === Prometheus setup ===
const register = new client.Registry();
client.collectDefaultMetrics({ register });

const httpRequestCounter = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'statusCode']
});
register.registerMetric(httpRequestCounter);

// === Prometheus middleware (only for defined routes) ===
app.use((req, res, next) => {
  res.on('finish', () => {
    const routePath = req.route?.path || req.originalUrl || req.path || 'unknown';
    httpRequestCounter.inc({
      method: req.method,
      route: routePath,
      statusCode: res.statusCode
    });
  });
  next();
});

// === Middleware ===
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('assets'));

// === View engine ===
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// === Prometheus endpoint ===
app.get('/metrics', async (req, res) => {
  try {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
  } catch (err) {
    res.status(500).end(err);
  }
});

// === Health check ===
app.get('/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  const status = dbStatus === 'connected' ? 'OK' : 'Unhealthy';

  res.status(status === 'OK' ? 200 : 503).json({
    status,
    dbStatus,
    timestamp: new Date().toISOString()
  });
});

// === Main routes ===
app.use("/", require("./routes/index"));

// === User registration ===
app.post('/register', (req, res) => {
  User.create(req.body)
    .then(user => {
      console.log("User created:", user);
      res.redirect('/dashboard');
    })
    .catch(err => {
      console.error("Registration error:", err);
      res.status(500).json({ error: "Registration failed" });
    });
});

// === Task management ===
app.post('/addtask', (req, res) => {
  Dashboard.create(req.body)
    .then(task => {
      console.log("Task created:", task);
      res.redirect('back');
    })
    .catch(err => {
      console.error("Task creation error:", err);
      res.redirect('back');
    });
});

app.get('/complete-task', (req, res) => {
  Dashboard.findByIdAndUpdate(req.query.id, { completed: true })
    .then(task => {
      console.log("Task completed:", task);
      res.redirect('back');
    })
    .catch(err => {
      console.error("Completion error:", err);
      res.redirect('back');
    });
});

app.get('/delete-task', (req, res) => {
  Dashboard.findByIdAndDelete(req.query.id)
    .then(() => {
      console.log("Task deleted");
      res.redirect('back');
    })
    .catch(err => {
      console.error("Deletion error:", err);
      res.redirect('back');
    });
});

// === Error handler ===
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err.stack);
  res.status(500).send('Something broke!');
});

// === Start server ===
app.listen(port, '0.0.0.0', () => {
  console.log(`Server running on port ${port}`);
});

