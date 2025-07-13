const resetPasswordTemplate = (resetLink) => {
	return `<!DOCTYPE html>
	<html>
	
	<head>
		<meta charset="UTF-8">
		<title>Password Reset Email</title>
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
				font-size: 20px;
				font-weight: bold;
				margin-bottom: 20px;
			}
	
			.body {
				font-size: 16px;
				margin-bottom: 20px;
			}
	
			.cta {
				display: inline-block;
				padding: 12px 24px;
				background-color: #FFD60A;
				color: #000000;
				text-decoration: none;
				border-radius: 6px;
				font-size: 16px;
				font-weight: bold;
				margin-top: 20px;
			}
	
			.support {
				font-size: 14px;
				color: #999999;
				margin-top: 30px;
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
			<div class="message">Reset Your Password</div>
			<div class="body">
				<p>Dear User,</p>
				<p>We received a request to reset the password for your Ace of Spades account. To reset your password, please click the button below:</p>
				<a class="cta" href="${resetLink}">Reset Password</a>
				<p>If the button above does not work, copy and paste the following link into your browser:</p>
				<p><a href="${resetLink}">${resetLink}</a></p>
				<p>This link will expire in 15 minutes. If you did not request a password reset, please ignore this email or contact support.</p>
			</div>
			<div class="support">
				Need help? Contact us at 
				<a href="mailto:aceofspades2125@gmail.com">aceofspades2125@gmail.com</a>.
			</div>
		</div>
	</body>
	
	</html>`;
};

module.exports = resetPasswordTemplate;
