const otpTemplate = (otp) => {
	return `<!DOCTYPE html>
	<html>
	
	<head>
		<meta charset="UTF-8">
		<title>OTP Verification Email</title>
		<style>
			body {
				background-color: #ffffff;
				font-family: Arial, sans-serif;
				font-size: 16px;
				line-height: 1.4;
				color: #333333;
				margin: 0;
				padding: 0;
			}

			.container {
				max-width: 600px;
				margin: 0 auto;
				padding: 20px;
				text-align: center;
			}

			.logo {
				max-width: 200px;
				margin-bottom: 20px;
			}

			.message {
				font-size: 18px;
				font-weight: bold;
				margin-bottom: 20px;
			}

			.body {
				font-size: 16px;
				margin-bottom: 20px;
			}

			.cta {
				display: inline-block;
				padding: 10px 20px;
				background-color: #FFD60A;
				color: #000000;
				text-decoration: none;
				border-radius: 5px;
				font-size: 16px;
				font-weight: bold;
				margin-top: 20px;
			}

			.support {
				font-size: 14px;
				color: #999999;
				margin-top: 20px;
			}

			.highlight {
				font-weight: bold;
			}
		</style>
	</head>
	
	<body>
		<div class="container">
			<a href="https://ace-of-spades.onrender.com">
				<img class="logo"
					src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ1egew5suQlAcB6W95du1lDMC8_7PqV3hnaQ&s"
					alt="ACE OF SPADES" />
			</a>
			<div class="message">OTP Verification Email</div>
			<div class="body">
				<p>Dear User,</p>
				<p>Thank you for registering with <strong>AOS-Shiksha</strong>. To complete your registration, please use the following OTP (One-Time Password) to verify your account:</p>
				<h2 class="highlight">${otp}</h2>
				<p>This OTP is valid for 5 minutes. If you did not request this verification, please disregard this email. Once your account is verified, you will have full access to our platform.</p>
			</div>
			<div class="support">
				Need help? Contact us at <a href="mailto:aceofspades2125@gmail.com">aceofspades2125@gmail.com</a>.
			</div>
		</div>
	</body>
	
	</html>`;
};

module.exports = otpTemplate;
