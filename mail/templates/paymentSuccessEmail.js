exports.paymentSuccessEmail = (name, amount, orderId, paymentId) => {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Payment Confirmation - AOS-Shiksha</title>
  <style>
    body {
      background-color: #ffffff;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      font-size: 16px;
      line-height: 1.5;
      color: #222222;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 30px 20px;
      text-align: center;
    }
    .logo {
      max-width: 180px;
      margin-bottom: 25px;
    }
    .message {
      font-size: 20px;
      font-weight: bold;
      color: #1e40af;
      margin-bottom: 20px;
    }
    .body {
      font-size: 16px;
      color: #333333;
    }
    .highlight {
      font-weight: bold;
      color: #10b981;
    }
    .cta {
      display: inline-block;
      padding: 10px 20px;
      background-color: #1e40af;
      color: white;
      text-decoration: none;
      border-radius: 8px;
      font-size: 16px;
      font-weight: bold;
      margin-top: 30px;
    }
    .support {
      font-size: 14px;
      color: #666666;
      margin-top: 30px;
    }
  </style>
</head>
<body>
  <div class="container">
    <a href="https://ace-of-spades.onrender.com">
      <img
  src="https://encrypted-tbn1.gstatic.com/images?q=tbn:ANd9GcQfOLKg5D--izvZvSjD83j0Eyd_paSC7WwZS3NH88yMLWyQoP2w"
  alt="Ace of Spades Logo"
  className="w-16 h-16 object-contain"
/>

    </a>
    <div class="message">Thank you for your payment!</div>
    <div class="body">
      <p>Dear ${name},</p>
      <p>We have successfully received your payment of <span class="highlight">₹${amount}</span>.</p>
      <p>Your <strong>Payment ID:</strong> ${paymentId}</p>
      <p>Your <strong>Order ID:</strong> ${orderId}</p>
    </div>
    <a class="cta" href="https://ace-of-spades.onrender.com/dashboard">Go to Your Dashboard</a>
    <div class="support">
      If you have any questions, reach us at <a href="mailto:support@aos-shiksha.in">support@aos-shiksha.in</a><br />
      We're here to help you succeed!
    </div>
  </div>
</body>
</html>`;
};
