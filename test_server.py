from flask import Flask, jsonify, render_template_string, redirect, url_for

app = Flask(__name__)

# HTML template for the index page
INDEX_TEMPLATE = """
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Visual LLM Thesaurus - Maintenance</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            margin: 0;
            padding: 20px;
            background: linear-gradient(135deg, #1a0033, #2d0052);
            color: white;
            min-height: 100vh;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            text-align: center;
        }
        h1 {
            color: #00e5ff;
            margin-bottom: 30px;
        }
        .card {
            background: rgba(255, 255, 255, 0.1);
            border-radius: 10px;
            padding: 20px;
            margin-bottom: 20px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .btn {
            display: inline-block;
            background: #9c27b0;
            color: white;
            padding: 10px 20px;
            border-radius: 5px;
            text-decoration: none;
            margin: 10px;
            transition: background 0.3s;
        }
        .btn:hover {
            background: #7b1fa2;
        }
        .auth-buttons {
            display: flex;
            justify-content: center;
            margin-bottom: 30px;
        }
        .sign-in-btn {
            background-color: rgba(30, 0, 60, 0.5);
            border: 2px solid rgba(0, 195, 255, 0.3);
            color: #00c3ff;
            border-radius: 50px;
            padding: 15px 30px;
            text-decoration: none;
            margin-right: 20px;
            font-weight: bold;
        }
        .register-btn {
            background-color: rgba(180, 70, 207, 0.8);
            border: 2px solid rgba(255, 255, 255, 0.2);
            color: white;
            border-radius: 50px;
            padding: 15px 30px;
            text-decoration: none;
            font-weight: bold;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Visual LLM Thesaurus</h1>

        <div class="auth-buttons">
            <a href="/sign-in" class="sign-in-btn">Sign In</a>
            <a href="/register" class="register-btn">Register</a>
        </div>

        <div class="card">
            <h2>Maintenance in Progress</h2>
            <p>We're currently performing maintenance on the Visual LLM Thesaurus.</p>
            <p>Please check back later. We apologize for any inconvenience.</p>
        </div>

        <div class="card">
            <h2>Available Features</h2>
            <a href="/health" class="btn">Health Check</a>
            <a href="/status" class="btn">Server Status</a>
        </div>
    </div>
</body>
</html>
"""

@app.route('/')
def index():
    return render_template_string(INDEX_TEMPLATE)

@app.route('/health')
def health():
    return jsonify({
        'status': 'ok',
        'message': 'Test server is running'
    })

@app.route('/status')
def status():
    return jsonify({
        'status': 'maintenance',
        'message': 'The main application server is currently undergoing maintenance. Please check back later.',
        'estimated_completion': 'Soon'
    })

@app.route('/sign-in')
@app.route('/register')
def auth_placeholder():
    return redirect(url_for('index'))

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5003, debug=True)
