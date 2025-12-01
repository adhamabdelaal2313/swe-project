import express from 'express';
import cors from 'cors';
import dashboardRoutes from '../dashboard-backend/routes'; // Import your routes

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Register your feature
app.use('/api/dashboard', dashboardRoutes);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
