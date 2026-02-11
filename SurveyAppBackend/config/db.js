// Database Configuration
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/surveyapp';

    // Log connection attempt (mask password for security)
    const maskedURI = mongoURI.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@');
    console.log('==========================================');
    console.log('Attempting MongoDB Connection...');
    console.log('Connection URI:', maskedURI);
    console.log('==========================================');

    const conn = await mongoose.connect(mongoURI);

    console.log('==========================================');
    console.log('✅ MongoDB Connected Successfully!');
    console.log('Host:', conn.connection.host);
    console.log('Database:', conn.connection.name);
    console.log('Port:', conn.connection.port);
    console.log('==========================================');

    return conn;
  } catch (error) {
    console.log('==========================================');
    console.error('❌ MongoDB Connection Error!');
    console.error('Error Name:', error.name);
    console.error('Error Message:', error.message);
    console.error('Error Code:', error.code);

    // Additional debugging info
    if (error.reason) {
      console.error('Error Reason:', error.reason);
    }

    // Check if it's a DNS/network issue
    if (error.message.includes('ENOTFOUND') || error.message.includes('querySrv')) {
      console.error('\n🔍 DNS Resolution Issue Detected!');
      console.error('Possible causes:');
      console.error('1. Invalid MongoDB URI in .env file');
      console.error('2. Placeholder values (<username>, <password>) not replaced');
      console.error('3. Network/DNS issues');
      console.error('4. MongoDB Atlas cluster not accessible');
      console.error('\n💡 Solution: Check your MONGODB_URI in .env file');
    }

    // Check if it's an authentication issue
    if (error.message.includes('authentication') || error.message.includes('auth')) {
      console.error('\n🔍 Authentication Issue Detected!');
      console.error('Possible causes:');
      console.error('1. Incorrect username or password');
      console.error('2. User not created in MongoDB Atlas');
      console.error('3. User lacks proper permissions');
    }

    console.log('==========================================');
    console.error('\nFull Error Stack:', error.stack);
    console.log('==========================================');

    process.exit(1);
  }
};

module.exports = connectDB;
