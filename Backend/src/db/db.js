const mongoose = require('mongoose');

const connectDb = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      dbName: 'mydb', // 👈 ensures it uses your specific DB name
    });

    console.log(`✅ MongoDB connected to: ${mongoose.connection.name}`);
  } catch (err) {
    console.error("❌ Error connecting to MongoDB:", err.message);
    process.exit(1); // 👈 stops the server if DB connection fails
  }
};

module.exports = connectDb;
