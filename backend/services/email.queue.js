const Queue = require('bull');
const sendEmail = require('../utils/emailService');

// Create the email queue
const emailQueue = new Queue('email-queue', {
  redis: {
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD || undefined
  }
});

// Process the queue
emailQueue.process(async (job) => {
  try {
    console.log(`Processing email job: ${job.id} for ${job.data.email}`);
    await sendEmail(job.data);
    console.log(`Email sent successfully: ${job.id}`);
  } catch (error) {
    console.error(`Failed to send email job: ${job.id}`, error);
    throw error; // Let Bull handle retries if configured
  }
});

// Event listeners for monitoring
emailQueue.on('completed', (job) => {
  console.log(`Job ${job.id} completed!`);
});

emailQueue.on('failed', (job, err) => {
  console.error(`Job ${job.id} failed with error: ${err.message}`);
});

/**
 * Add email to queue with fallback to direct sending
 */
const enqueueEmail = async (data) => {
  try {
    // Attempt to add to queue with a timeout mechanism
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Redis queue add timeout')), 2000)
    );
    
    await Promise.race([
      emailQueue.add(data, {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 5000
        }
      }),
      timeoutPromise
    ]);
    console.log('Email added to queue successfully');
  } catch (queueError) {
    console.error('Redis/Bull Queue failed, falling back to direct email sending:', queueError.message);
    // Fallback to direct sending
    try {
      await sendEmail(data);
      console.log('Fallback email sent successfully');
    } catch (directError) {
      console.error('Fallback email sending also failed:', directError);
      throw directError;
    }
  }
};

module.exports = {
  emailQueue,
  enqueueEmail
};
