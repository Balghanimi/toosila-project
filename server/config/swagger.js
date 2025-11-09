const swaggerJsdoc = require('swagger-jsdoc');
const config = require('./env');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Toosila API Documentation',
      version: '1.0.0',
      description: 'Comprehensive API documentation for Toosila - Iraq Ride-Sharing Platform',
      contact: {
        name: 'Toosila Support',
        email: 'support@toosila.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: config.NODE_ENV === 'production'
          ? 'https://toosila-production.up.railway.app/api'
          : `http://localhost:${config.PORT || 5001}/api`,
        description: config.NODE_ENV === 'production' ? 'Production server' : 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT token in the format: Bearer {token}'
        }
      },
      schemas: {
        // User Schema
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'Unique user identifier'
            },
            name: {
              type: 'string',
              description: 'User full name',
              example: 'أحمد محمد'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'User email address',
              example: 'ahmed@example.com'
            },
            phone: {
              type: 'string',
              description: 'User phone number',
              example: '+9647XXXXXXXXX'
            },
            isDriver: {
              type: 'boolean',
              description: 'Whether user is registered as a driver',
              example: false
            },
            emailVerified: {
              type: 'boolean',
              description: 'Whether email is verified',
              example: true
            },
            isVerified: {
              type: 'boolean',
              description: 'Whether user account is verified by admin',
              example: false
            },
            languagePreference: {
              type: 'string',
              enum: ['ar', 'en', 'ku'],
              description: 'User preferred language',
              example: 'ar'
            },
            profilePicture: {
              type: 'string',
              nullable: true,
              description: 'URL to profile picture'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Account creation timestamp'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Last update timestamp'
            }
          }
        },

        // Offer Schema
        Offer: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'Unique offer identifier'
            },
            driverId: {
              type: 'string',
              format: 'uuid',
              description: 'Driver user ID'
            },
            origin: {
              type: 'string',
              description: 'Starting location',
              example: 'بغداد'
            },
            destination: {
              type: 'string',
              description: 'Destination location',
              example: 'البصرة'
            },
            departureTime: {
              type: 'string',
              format: 'date-time',
              description: 'Scheduled departure time'
            },
            availableSeats: {
              type: 'integer',
              minimum: 1,
              maximum: 7,
              description: 'Number of available seats',
              example: 3
            },
            pricePerSeat: {
              type: 'number',
              format: 'float',
              minimum: 0,
              description: 'Price per seat in IQD',
              example: 50000
            },
            vehicleType: {
              type: 'string',
              description: 'Type of vehicle',
              example: 'سيدان'
            },
            vehicleModel: {
              type: 'string',
              description: 'Vehicle model',
              example: 'Toyota Camry 2020'
            },
            notes: {
              type: 'string',
              nullable: true,
              description: 'Additional notes from driver'
            },
            isActive: {
              type: 'boolean',
              description: 'Whether offer is active',
              example: true
            },
            createdAt: {
              type: 'string',
              format: 'date-time'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time'
            }
          }
        },

        // Demand Schema
        Demand: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'Unique demand identifier'
            },
            passengerId: {
              type: 'string',
              format: 'uuid',
              description: 'Passenger user ID'
            },
            origin: {
              type: 'string',
              description: 'Starting location',
              example: 'أربيل'
            },
            destination: {
              type: 'string',
              description: 'Destination location',
              example: 'السليمانية'
            },
            departureTime: {
              type: 'string',
              format: 'date-time',
              description: 'Desired departure time'
            },
            seats: {
              type: 'integer',
              minimum: 1,
              maximum: 7,
              description: 'Number of seats needed',
              example: 2
            },
            maxPrice: {
              type: 'number',
              format: 'float',
              minimum: 0,
              description: 'Maximum price willing to pay per seat in IQD',
              example: 40000
            },
            notes: {
              type: 'string',
              nullable: true,
              description: 'Additional notes from passenger'
            },
            isActive: {
              type: 'boolean',
              description: 'Whether demand is active',
              example: true
            },
            createdAt: {
              type: 'string',
              format: 'date-time'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time'
            }
          }
        },

        // Booking Schema
        Booking: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'Unique booking identifier'
            },
            offerId: {
              type: 'string',
              format: 'uuid',
              description: 'Associated offer ID'
            },
            passengerId: {
              type: 'string',
              format: 'uuid',
              description: 'Passenger user ID'
            },
            driverId: {
              type: 'string',
              format: 'uuid',
              description: 'Driver user ID'
            },
            seats: {
              type: 'integer',
              minimum: 1,
              maximum: 7,
              description: 'Number of seats booked',
              example: 2
            },
            totalPrice: {
              type: 'number',
              format: 'float',
              description: 'Total booking price in IQD',
              example: 100000
            },
            status: {
              type: 'string',
              enum: ['pending', 'accepted', 'rejected', 'cancelled', 'completed'],
              description: 'Booking status',
              example: 'pending'
            },
            message: {
              type: 'string',
              nullable: true,
              description: 'Message from passenger'
            },
            createdAt: {
              type: 'string',
              format: 'date-time'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time'
            }
          }
        },

        // Message Schema
        Message: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'Unique message identifier'
            },
            senderId: {
              type: 'string',
              format: 'uuid',
              description: 'Sender user ID'
            },
            receiverId: {
              type: 'string',
              format: 'uuid',
              description: 'Receiver user ID'
            },
            content: {
              type: 'string',
              description: 'Message content',
              example: 'مرحبا، هل الرحلة متاحة؟'
            },
            isRead: {
              type: 'boolean',
              description: 'Whether message has been read',
              example: false
            },
            createdAt: {
              type: 'string',
              format: 'date-time'
            }
          }
        },

        // Rating Schema
        Rating: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'Unique rating identifier'
            },
            bookingId: {
              type: 'string',
              format: 'uuid',
              description: 'Associated booking ID'
            },
            raterId: {
              type: 'string',
              format: 'uuid',
              description: 'User who gave the rating'
            },
            ratedUserId: {
              type: 'string',
              format: 'uuid',
              description: 'User who received the rating'
            },
            rating: {
              type: 'integer',
              minimum: 1,
              maximum: 5,
              description: 'Rating value (1-5 stars)',
              example: 5
            },
            review: {
              type: 'string',
              nullable: true,
              description: 'Written review',
              example: 'سائق ممتاز وموعد دقيق'
            },
            createdAt: {
              type: 'string',
              format: 'date-time'
            }
          }
        },

        // Notification Schema
        Notification: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'Unique notification identifier'
            },
            userId: {
              type: 'string',
              format: 'uuid',
              description: 'User receiving notification'
            },
            type: {
              type: 'string',
              enum: ['booking', 'message', 'rating', 'verification', 'system'],
              description: 'Notification type',
              example: 'booking'
            },
            title: {
              type: 'string',
              description: 'Notification title',
              example: 'حجز جديد'
            },
            message: {
              type: 'string',
              description: 'Notification message',
              example: 'لديك حجز جديد من أحمد'
            },
            isRead: {
              type: 'boolean',
              description: 'Whether notification has been read',
              example: false
            },
            data: {
              type: 'object',
              nullable: true,
              description: 'Additional notification data'
            },
            createdAt: {
              type: 'string',
              format: 'date-time'
            }
          }
        },

        // DemandResponse Schema
        DemandResponse: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'Unique response identifier'
            },
            demandId: {
              type: 'string',
              format: 'uuid',
              description: 'Associated demand ID'
            },
            driverId: {
              type: 'string',
              format: 'uuid',
              description: 'Driver user ID'
            },
            offerPrice: {
              type: 'number',
              format: 'float',
              minimum: 0,
              description: 'Price offered by driver',
              example: 45000
            },
            availableSeats: {
              type: 'integer',
              minimum: 1,
              maximum: 7,
              description: 'Available seats in response',
              example: 3
            },
            message: {
              type: 'string',
              nullable: true,
              description: 'Message from driver'
            },
            status: {
              type: 'string',
              enum: ['pending', 'accepted', 'rejected', 'cancelled'],
              description: 'Response status',
              example: 'pending'
            },
            createdAt: {
              type: 'string',
              format: 'date-time'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time'
            }
          }
        },

        // City Schema
        City: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'Unique city identifier'
            },
            name: {
              type: 'string',
              description: 'City name in Arabic',
              example: 'بغداد'
            },
            createdAt: {
              type: 'string',
              format: 'date-time'
            }
          }
        },

        // Success Response Schema
        SuccessResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true
            },
            message: {
              type: 'string',
              example: 'Operation completed successfully'
            },
            data: {
              type: 'object',
              description: 'Response data'
            }
          }
        },

        // Error Response Schema
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            error: {
              type: 'object',
              properties: {
                code: {
                  type: 'string',
                  description: 'Error code',
                  example: 'VALIDATION_ERROR'
                },
                message: {
                  type: 'string',
                  description: 'Error message',
                  example: 'Invalid input data'
                },
                details: {
                  type: 'array',
                  items: {
                    type: 'object'
                  },
                  description: 'Detailed error information'
                }
              }
            }
          }
        },

        // Pagination Schema
        Pagination: {
          type: 'object',
          properties: {
            total: {
              type: 'integer',
              description: 'Total number of items',
              example: 100
            },
            page: {
              type: 'integer',
              description: 'Current page number',
              example: 1
            },
            limit: {
              type: 'integer',
              description: 'Items per page',
              example: 10
            },
            totalPages: {
              type: 'integer',
              description: 'Total number of pages',
              example: 10
            }
          }
        }
      },

      parameters: {
        PageParam: {
          in: 'query',
          name: 'page',
          schema: {
            type: 'integer',
            minimum: 1,
            default: 1
          },
          description: 'Page number for pagination'
        },
        LimitParam: {
          in: 'query',
          name: 'limit',
          schema: {
            type: 'integer',
            minimum: 1,
            maximum: 100,
            default: 10
          },
          description: 'Number of items per page'
        },
        IdParam: {
          in: 'path',
          name: 'id',
          required: true,
          schema: {
            type: 'string',
            format: 'uuid'
          },
          description: 'Resource unique identifier'
        }
      }
    },

    tags: [
      {
        name: 'Authentication',
        description: 'User authentication and account management endpoints'
      },
      {
        name: 'Offers',
        description: 'Ride offer management endpoints for drivers'
      },
      {
        name: 'Demands',
        description: 'Ride demand/request management endpoints for passengers'
      },
      {
        name: 'Bookings',
        description: 'Booking management endpoints'
      },
      {
        name: 'Messages',
        description: 'Messaging system endpoints'
      },
      {
        name: 'Ratings',
        description: 'User rating and review endpoints'
      },
      {
        name: 'Notifications',
        description: 'Notification management endpoints'
      },
      {
        name: 'Demand Responses',
        description: 'Driver responses to passenger demands'
      },
      {
        name: 'Cities',
        description: 'City management endpoints'
      },
      {
        name: 'Stats',
        description: 'User statistics and activity endpoints'
      },
      {
        name: 'Verification',
        description: 'User verification and document management'
      },
      {
        name: 'Email Verification',
        description: 'Email verification endpoints'
      },
      {
        name: 'Password Reset',
        description: 'Password reset and recovery endpoints'
      }
    ]
  },
  apis: ['./server/routes/*.js', './routes/*.js'], // Path to the API routes from both possible contexts
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
