from flask import Flask, request, jsonify, render_template
import sqlite3

app = Flask(__name__, static_folder="static", template_folder="templates")

# Connect to SQLite database
db_conn = sqlite3.connect("database.db", check_same_thread=False)
db_conn.row_factory = sqlite3.Row

# ------------------ HTML VIEWS ------------------

@app.route('/')
def home():
    return render_template("index.html")

@app.route('/correlation')
def correlation_view():
    return render_template("correlation.html")

# ------------------ API ROUTES ------------------

@app.route('/countries')
def get_countries():
    cursor = db_conn.execute("""
        SELECT DISTINCT CountryCode, CountryName
        FROM countries
        ORDER BY CountryName
    """)
    rows = cursor.fetchall()
    return jsonify([dict(row) for row in rows])

@app.route('/coordinates')
def get_coordinates():
    code = request.args.get("country_code")
    if not code:
        return jsonify({"error": "Missing parameter"}), 400

    cursor = db_conn.execute("""
        SELECT Latitude, Longitude
        FROM countries
        WHERE CountryCode = ?
    """, (code,))
    row = cursor.fetchone()
    if not row:
        return jsonify({"lat": None, "lon": None})
    return jsonify({"lat": row["Latitude"], "lon": row["Longitude"]})

@app.route('/indicators')
def get_indicators():
    country_code = request.args.get('country_code')
    year = request.args.get('year')

    if not country_code or not year:
        return jsonify({"error": "Missing parameters"}), 400

    try:
        year = int(year)
    except ValueError:
        return jsonify({"error": "Invalid year"}), 400

    cursor = db_conn.execute("""
        SELECT GDP, Population, LifeExpectancy, HealthExpenditure
        FROM indicators
        WHERE CountryCode = ? AND Year = ?
    """, (country_code, year))

    row = cursor.fetchone()
    if not row:
        return jsonify([])

    return jsonify([dict(row)])

# ✅ Final correlation data API used by correlation.js
@app.route('/api/correlation')
def get_correlation_data():
    x = request.args.get("x")
    y = request.args.get("y")
    year = request.args.get("year")

    if not x or not y or not year:
        return jsonify({"error": "Missing parameters"}), 400

    query = f"""
        SELECT c.CountryName, i.{x}, i.{y}
        FROM indicators i
        JOIN countries c ON i.CountryCode = c.CountryCode
        WHERE i.Year = ? AND i.{x} IS NOT NULL AND i.{y} IS NOT NULL
    """
    cursor = db_conn.execute(query, (year,))
    rows = cursor.fetchall()
    return jsonify([
        {
            "CountryName": r["CountryName"],
            "x": r[x],
            "y": r[y]
        } for r in rows
    ])

# ------------------ RUN SERVER ------------------

if __name__ == '__main__':
    app.run(debug=True, port=5001)












