import swaggerJSDoc from 'swagger-jsdoc';

export const swaggerOptions: swaggerJSDoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "YouVersion API",
      version: "1.0.0",
      description: "Express Rest API for getting verses and such from YouVersion.",
      contact: {
        url: "https://github.com/Glowstudent777/YouVersion-API"
      }
    }
  },
  // Discover annotations from every v1 route so new endpoints are included
  // in Swagger without requiring another manual path entry.
  apis: ["./dist/api/v1/**/*.js"]
};
