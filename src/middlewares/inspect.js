const pathToRegexp = require('path-to-regexp');

// Define endpoints statically (outside middleware)
const endpoints = [
  {
    path: '/api/v1/paste/all',
    methods: ['GET']
  },
  {
    path: '/api/v1/paste/view/:id',
    methods: ['GET']
  },
  {
    path: '/api/v1/paste/create',
    methods: ['POST']
  },
  {
    path: '/api/v1/paste/update/:id',
    methods: ['PATCH']
  },
  {
    path: '/api/v1/paste/delete/:id',
    methods: ['DELETE']
  },
];

// Precompile routes for better performance
const compiledEndpoints = endpoints.map(endpoint => ({
  regex: pathToRegexp(endpoint.path, [], { strict: true }),
  methods: new Set(endpoint.methods.map(m => m.toUpperCase()))
}));

const inspectRequests = (req, res, next) => {
  const currentPath = req.path;
  const currentMethod = req.method.toUpperCase();
  
  let allowedMethods = new Set();
  let pathExists = false;

  for (const endpoint of compiledEndpoints) {
    if (endpoint.regex.exec(currentPath)) {
      pathExists = true;
      
      // Merge allowed methods
      endpoint.methods.forEach(m => allowedMethods.add(m));

      if (endpoint.methods.has(currentMethod)) {
        return next();
      }
    }
  }

  if (!pathExists) {
    return res.status(404).json({ 
      error: 'Not Found',
      message: `Route ${currentPath} does not exist`
    });
  }

  res.setHeader('Allow', [...allowedMethods].join(', '));
  return res.status(405).json({
    error: 'Method Not Allowed',
    message: `Method ${currentMethod} not allowed for ${currentPath}`
  });
};

module.exports = inspectRequests;