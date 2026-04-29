import 'dotenv/config';
import app from './app.js';
import { env } from './config/env.js';

const PORT = env.PORT;

app.listen(PORT, () => {
  console.log(`🚀 TasteBuddy API running on port ${PORT}`);
  console.log(`📚 API Docs: http://localhost:${PORT}/docs`);
  console.log(`🏥 Health: http://localhost:${PORT}/health`);
});
