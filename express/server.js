const express = require('express')
const bodyParser = require('body-parser')
const nodemailer = require('nodemailer')
const cors = require('cors');

// const { html } = require('./html-templates.js');

const app = express()
app.use(cors());

/**
 * Email & SMTP config
 */
const config = {
  to: 'office@chesscoders.com',
  from: 'Patrick Leclair\'s Birthday Event <info@patrickleclair.eu>',
}

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 25,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
})

app.post('/api/newcode', (request, response) => {
  if (!validNewCode(request)) {
    return response.sendStatus(400)
  }
  
  // last chance to skip the mail sending
  if (skip(request)) {
    return response.sendStatus(204)
  }

  transporter.sendMail({
    html: html.newCode(request.body.lastName, request.body.code),
    to: request.body.to,
    bcc: 'office@chesscoders.com',
    from: config.from,
    subject: `[patrickleclair.eu] Unregistered ${request.body.lastName}`,
  })
  .then(() => {
    return response.sendStatus(200)
  })
  .catch((error) => {
    return response.status(500).send(JSON.stringify(error))
  })
})

app.post('/api/unregister', (request, response) => {
  if (!validUnregister(request)) {
    return response.sendStatus(400)
  }

  // last chance to skip the mail sending
  if (skip(request)) {
    return response.sendStatus(204)
  }

  transporter.sendMail({
    html: html.unregister(request.body.lastName, request.body.code),
    to: request.body.to,
    bcc: 'office@chesscoders.com',
    from: config.from,
    subject: `[patrickleclair.eu] Unregistered ${request.body.lastName}`,
  })
  .then(() => {
    return response.sendStatus(200)
  })
  .catch((error) => {
    return response.status(500).send(JSON.stringify(error))
  })
})

app.post('/api/newdetails', (request, response) => {
  if (!validNewDetails(request)) {
    return response.sendStatus(400)
  }

  // last chance to skip the mail sending
  if (skip(request)) {
    return response.sendStatus(204)
  }

  let html1 = `<html>
  <body>
  <table style="height:100%;width:100%;background-color:#fafafa;font-family:Roboto,Arial,Helvetica,sans-serif" align="center">
    <tbody>
      <tr>
        <td valign="top" style="width:100%;height:100%;padding-top:30px;padding-bottom:30px;background-color:#fafafa">
  
  <table align="center" border="0" cellpadding="0" cellspacing="0" style="max-width:600px;box-sizing:border-box;width:100%;margin:0px auto;background-color:#fff;padding:20px;">
    <tbody>
      <tr>
          <td>
            <p style="text-align:left;margin:0px;padding:0px">
              <strong>
                <span style="color:#011b66;font-size:24px">Greetings, Patrick!</span>
              </strong>
            </p>
  
            <p style="line-height:1.75em;margin:0px;padding:0px">
                <span style="font-size:16px">
                  <br>
                </span>
              </p>
          </td>
      </tr>
      <tr>
        <td>
          <p style="line-height:1.75em;margin:0px;padding:0px">
            <span style="font-size:16px">Mr(Ms) <strong>${request.body.lastName}</strong> associated with the code <strong>${request.body.code}</strong> has updated their details. <br/><br/><br/>Below you can review the data they have submitted. <br/>Have a great day!</span>
          </p>
  
          <p style="line-height:1.75em;margin:0px;padding:0px">
            <span style="font-size:16px">
              <br>
            </span>
          </p>
        </td>
      </tr>
      <tr>
        <td>`
  
          if (request.body.mainGuest.lastName) {
            html1 += `
          <p style="line-height:1.75em;margin:0px;padding:0px">
              <h3>Main guest</h3>
  <table style="border-collapse: collapse;">
    <tr style="color: #aaa; border-collapse: collapse; border: solid 2px transparent; border-left: solid 5px #b48484; ">
      <td style="padding: 0 10px;">Last name</td>
    </tr>
    <tr style="border-collapse: collapse; border: solid 2px transparent; border-left: solid 5px #b48484;">
      <td style="padding: 0 10px;">${request.body.mainGuest.lastName}</td>
    </tr>
    <tr style="color: #aaa; border-collapse: collapse; border: solid 2px transparent; border-left: solid 5px #f50136">
      <td style="padding: 0 10px;">First name</td>
    </tr>
    <tr style="border-collapse: collapse; border: solid 2px transparent; border-left: solid 5px #f50136;">
      <td style="padding: 0 10px;">${request.body.mainGuest.firstName}</td>
    </tr>
    <tr style="color: #aaa; border-collapse: collapse; border: solid 2px transparent; border-left: solid 5px #8729e5;">
      <td style="padding: 0 10px;">Location</td>
    </tr>
    <tr style="border-collapse: collapse; border: solid 2px transparent; border-left: solid 5px #8729e5;">
      <td style="padding: 0 10px;">${request.body.mainGuest.location}</td>
    </tr>
    <tr style="color: #aaa; border-collapse: collapse; border: solid 2px transparent; border-left: solid 5px #e8f6a4;">
      <td style="padding: 0 10px;">Company</td>
    </tr>
    <tr style="border-collapse: collapse; border: solid 2px transparent; border-left: solid 5px #e8f6a4;">
      <td style="padding: 0 10px;">${request.body.mainGuest.company}</td>
    </tr>
    <tr style="color: #aaa; border-collapse: collapse; border: solid 2px transparent; border-left: solid 5px #47cd6b;">
      <td style="padding: 0 10px;">Position</td>
    </tr>
    <tr style="border-collapse: collapse; border: solid 2px transparent; border-left: solid 5px #47cd6b;">
      <td style="padding: 0 10px;">${request.body.mainGuest.position}</td>
    </tr>
  </table>
          </p>
  
          <p style="line-height:1.75em;margin:0px;padding:0px">
            <span style="font-size:16px">
              <br>
            </span>
          </p>`
  
        }
  
        if (request.body.extraGuest.lastName) {
          html1 += `
  
          <p style="line-height:1.75em;margin:0px;padding:0px">
            <h3>Extra guest</h3>
  <table style="border-collapse: collapse;">
    <tr style="color: #aaa; border-collapse: collapse; border: solid 2px transparent; border-left: solid 5px #b48484; ">
      <td style="padding: 0 10px;">Last name</td>
    </tr>
    <tr style="border-collapse: collapse; border: solid 2px transparent; border-left: solid 5px #b48484;">
      <td style="padding: 0 10px;">${request.body.extraGuest.lastName}</td>
    </tr>
    <tr style="color: #aaa; border-collapse: collapse; border: solid 2px transparent; border-left: solid 5px #f50136">
      <td style="padding: 0 10px;">First name</td>
    </tr>
    <tr style="border-collapse: collapse; border: solid 2px transparent; border-left: solid 5px #f50136;">
      <td style="padding: 0 10px;">${request.body.extraGuest.firstName}</td>
    </tr>
    <tr style="color: #aaa; border-collapse: collapse; border: solid 2px transparent; border-left: solid 5px #8729e5;">
      <td style="padding: 0 10px;">Location</td>
    </tr>
    <tr style="border-collapse: collapse; border: solid 2px transparent; border-left: solid 5px #8729e5;">
      <td style="padding: 0 10px;">${request.body.extraGuest.location}</td>
    </tr>
    <tr style="color: #aaa; border-collapse: collapse; border: solid 2px transparent; border-left: solid 5px #e8f6a4;">
      <td style="padding: 0 10px;">Company</td>
    </tr>
    <tr style="border-collapse: collapse; border: solid 2px transparent; border-left: solid 5px #e8f6a4;">
      <td style="padding: 0 10px;">${request.body.extraGuest.company}</td>
    </tr>
    <tr style="color: #aaa; border-collapse: collapse; border: solid 2px transparent; border-left: solid 5px #47cd6b;">
      <td style="padding: 0 10px;">Position</td>
    </tr>
    <tr style="border-collapse: collapse; border: solid 2px transparent; border-left: solid 5px #47cd6b;">
      <td style="padding: 0 10px;">${request.body.extraGuest.position}</td>
    </tr>
  </table>
          </p>
  
          <p style="line-height:1.75em;margin:0px;padding:0px">
            <span style="font-size:16px">
              <br>
            </span>
          </p>`
        }
  
          html1 += `
        </td>
      </tr>
  
      <tr>
        <td>
  
  <table cellspacing="0" cellpadding="0" style="text-align:left;" align="left">
    <tbody>
      <tr>
        <td align="left" style="border-radius:4px;padding:12px;background:#ffaa00">
          <a href="https://patrickleclair.eu" style="color:#ffffff;font-size:16px;text-decoration:none;display:inline-block" target="_blank">
            <span style="color:#ffffff"><b>Visit the admin area</b></span>
          </a>
        </td>
      </tr>
    </tbody>
  </table>
  
        </td>
      </tr>
  
      <tr>
        <td>
          <p style="line-height:1.75em;margin:0px;padding:0px">
            <span style="font-size:16px">
              <br>
            </span>
          </p>
        </td>
      </tr>
  
      <tr>
        <td>
          <p style="line-height:1.75em;margin:0px;padding:0px">
            <span style="font-size:16px">With regards,</span>
          </p>
          <p style="line-height:1.75em;margin:0px;padding:0px">
            <span style="font-size:16px">An automated message from Chess Coders</span>
          </p>
  
          <p style="line-height:1.75em;margin:0px;padding:0px">
            <span style="font-size:16px">
              <br>
            </span>
          </p>
        </td>
      </tr>
  
    </tbody>
  </table>
  
        </td>
      </tr>
    </tbody>
  </table>
  
  </body>
  </html>
  `;

  transporter.sendMail({
    html: html1,
    to: request.body.to,
    bcc: 'office@chesscoders.com',
    from: config.from,
    subject: '[patrickleclair.eu] New members have registered',
  })
  .then(() => {
    return response.sendStatus(200)
  })
  .catch((error) => {
    return response.status(500).send(JSON.stringify(error))
  })
});


const validUnregister = (request) => {
  return !!request.body.code && !!request.body.lastName
}
const validNewCode = (request) => {
  return !!request.body.code && !!request.body.to || !!request.body.firstName || !!request.body.lastName
}
const validNewDetails = (request) => {
  return !!request.body.code && !!request.body.lastName &&
    typeof (request.body.mainGuest === 'object') && typeof (request.body.extraGuest === 'object')
}

const skip = (request) => {
  return !!request.body.skip || !request.body.to
}
