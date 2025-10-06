<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify Your Email - {{ config('app.name') }}</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            background: #f8f9fa;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .container {
            max-width: 600px;
            width: 100%;
            margin: 20px;
            background: white;
            border-radius: 12px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            overflow: hidden;
        }
        .header {
            background: #667eea;
            padding: 30px 30px 20px;
            text-align: center;
            color: white;
        }
        .header h1 {
            margin: 0;
            font-size: 24px;
            font-weight: 600;
        }
        .content {
            padding: 40px 30px;
            text-align: center;
        }
        .content h2 {
            color: #333;
            font-size: 20px;
            margin-bottom: 16px;
            font-weight: 600;
        }
        .content p {
            color: #666;
            line-height: 1.6;
            margin-bottom: 24px;
            font-size: 16px;
        }
        .button {
            display: inline-block;
            background: #667eea;
            color: white;
            text-decoration: none;
            padding: 12px 24px;
            border-radius: 6px;
            font-weight: 500;
            font-size: 16px;
            transition: background-color 0.2s ease;
        }
        .button:hover {
            background: #5a67d8;
        }
        .footer {
            background: #f8f9fa;
            padding: 20px 30px;
            text-align: center;
            border-top: 1px solid #e9ecef;
        }
        .footer p {
            color: #666;
            font-size: 14px;
            margin: 0;
            line-height: 1.5;
        }
        .footer a {
            color: #667eea;
            text-decoration: none;
            font-weight: 500;
        }
        .footer a:hover {
            text-decoration: underline;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>{{ config('app.name') }}</h1>
        </div>

        <div class="content">
            <h2>Verify Your Email Address</h2>
            <p>Hi there! Thanks for joining {{ config('app.name') }}. To get started, please verify your email address by clicking the button below.</p>

            <a href="{{ $url }}" class="button">
                Verify Email Address
            </a>

            <p style="margin-top: 24px; font-size: 14px; color: #888;">
                This verification link will expire in {{ $count }} minutes.<br>
                If the button doesn't work, copy and paste this URL into your browser:<br>
                <span style="word-break: break-all; color: #667eea;">{{ $url }}</span>
            </p>
        </div>

        <div class="footer">
            <p>
                If you didn't create an account, no further action is required.<br>
                Need help? <a href="{{ url('/') }}">Visit our website</a> for support.
            </p>
            <p style="margin-top: 12px; font-size: 12px; color: #999;">
                © {{ date('Y') }} {{ config('app.name') }}. All rights reserved.
            </p>
        </div>
    </div>
</body>
</html>
