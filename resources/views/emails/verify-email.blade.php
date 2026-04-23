<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify your email · {{ config('app.name') }}</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: 'Instrument Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #f4f5f8;
            color: #111827;
        }
        .wrapper {
            width: 100%;
            padding: 32px 16px;
        }
        .container {
            max-width: 560px;
            margin: 0 auto;
            background: #ffffff;
            border: 1px solid #e5e7eb;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 8px 24px rgba(17, 24, 39, 0.06);
        }
        .brand {
            padding: 28px 32px 0;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        .brand-dot {
            width: 28px;
            height: 28px;
            border-radius: 8px;
            background: #0f1629;
            display: inline-block;
        }
        .brand-name {
            font-size: 18px;
            font-weight: 600;
            letter-spacing: -0.01em;
            color: #0f1629;
        }
        .content {
            padding: 24px 32px 8px;
        }
        .eyebrow {
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.08em;
            color: #6b7280;
            margin: 0 0 12px;
        }
        h1 {
            margin: 0 0 12px;
            font-size: 24px;
            font-weight: 600;
            color: #0f1629;
            letter-spacing: -0.015em;
        }
        p {
            color: #4b5563;
            font-size: 15px;
            line-height: 1.6;
            margin: 0 0 16px;
        }
        .cta-wrap {
            padding: 12px 32px 24px;
        }
        .cta {
            display: inline-block;
            background: #0f1629;
            color: #ffffff !important;
            text-decoration: none;
            padding: 12px 22px;
            border-radius: 10px;
            font-weight: 600;
            font-size: 15px;
        }
        .cta:hover {
            background: #1f2937;
        }
        .fallback {
            padding: 0 32px 24px;
            font-size: 13px;
            color: #6b7280;
            line-height: 1.6;
            word-break: break-all;
        }
        .fallback a {
            color: #0f1629;
            text-decoration: underline;
        }
        .meta {
            border-top: 1px solid #e5e7eb;
            padding: 16px 32px;
            font-size: 12px;
            color: #9ca3af;
            background: #fafbfc;
        }
        .meta strong {
            color: #6b7280;
            font-weight: 600;
        }
    </style>
</head>
<body>
    <div class="wrapper">
        <div class="container">
            <div class="brand">
                <span class="brand-dot"></span>
                <span class="brand-name">{{ config('app.name') }}</span>
            </div>

            <div class="content">
                <p class="eyebrow">Finish setting up your account</p>
                <h1>Verify your email</h1>
                <p>
                    Thanks for joining {{ config('app.name') }}. Confirm this is your
                    email and you'll be ready to play.
                </p>
            </div>

            <div class="cta-wrap">
                <a href="{{ $url }}" class="cta">Verify email</a>
            </div>

            <div class="fallback">
                This link expires in {{ $count }} minutes. If the button doesn't
                work, paste this into your browser:<br>
                <a href="{{ $url }}">{{ $url }}</a>
            </div>

            <div class="meta">
                <strong>Didn't sign up?</strong> You can ignore this email — no
                account will be created.
            </div>
        </div>
    </div>
</body>
</html>
