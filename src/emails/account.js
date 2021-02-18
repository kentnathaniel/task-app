const api_key = process.env.MAILGUN_API_KEY;
const domain = 'sandboxf0e2ad3bc091443e8e74b76aeffa4ce0.mailgun.org';

const mailgun = require('mailgun-js')({apiKey: api_key, domain: domain});

const sendWelcomeEmail = (email, name) => {
  const data = {
    from : 'kent.nathaniel2@gmail.com',
    to: email,
    subject: 'Thanks for joining in!',
    text: `Welcome to the app, ${name}. Let me know how you get along with us`
  }

  mailgun.messages().send(data, (error, body) => {
    console.log(body)
  })
}

const sendCancelationEmail = (email, name) => {
  const data = {
    from : 'kent.nathaniel2@gmail.com',
    to: email,
    subject: 'Account Deletion',
    text: `Goodbye, ${name}. I hope to see you back sometime soon`
  }

  mailgun.messages().send(data, (error, body) => {
    console.log(body)
  })
}

module.exports = {
  sendWelcomeEmail,
  sendCancelationEmail
}