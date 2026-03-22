let allowedOrigins = [];

if (process.env.NODE_ENV === 'production') {
  allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',').map((origin) => origin.trim()) || [];
} else {
  allowedOrigins = [
    'http://localhost:3100',
    'http://localhost:3101',
    'http://localhost:3102',
    'http://localhost:3103',
    'http://localhost:5500',
  ];
}

const corsConfig = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'x-csrf-token'],
};

export default corsConfig;
