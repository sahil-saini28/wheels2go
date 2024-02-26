## Wheels2Go App Backend

This repository contains the backend server for a Yoga Booking App. The server handles user authentication, booking management, and database operations for the application.

## Getting Started

To get started with the server, follow these steps:

1. **Clone the repository:**
   
   `git clone https://github.com/sahil-saini28/wheels2go.git`

2. Install dependencies:
   
    npm install`

3. Start the server:
   
   `npm start`
   
   The server will start running on port `4000` by default. You can modify the port in the `app.js` file if needed.

## Database

The server uses a MongoDB database to store user information, booking details, and other relevant data. I provide the database connection URI in the `.env` file. 

Example `.env` file:

`MONGODB_URI=mongodb://localhost:27017/yoga_booking_app`

## Api Routes

Once the server is running, you can use it to handle API requests from the frontend application. All routes information availabe in Api documentaion file 

## Technologies Used

- Node.js
- Express.js
- bcryptjs
- jsonwebtoken

## Contributing

Contributions are welcome! Feel free to open an issue or submit a pull request.

## License

This project is licensed under the MIT License.
