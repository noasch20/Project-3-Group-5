from flask import Flask, jsonify, render_template, request
import sqlite3
import os

app = Flask(__name__)

# 
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, "database.db")

@app.route("/")
def index():
    return render_template("index.html") 

@app.route("/countries")
def get_countries():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT CountryCode, CountryName FROM countries")
    rows = cursor.fetchall()
    conn.close()

    countries = [{"CountryCode": row[0], "CountryName": row[1]} for row in rows]
    return jsonify(countries)


@app.route("/indicators")
def get_indicators():
    country_code = request.args.get("country_code")
    year = request.args.get("year")

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("""
        SELECT HealthExpenditure, GDP, LifeExpectancy, Population
        FROM indicators
        WHERE CountryCode = ? AND Year = ?
    """, (country_code, year))
    row = cursor.fetchone()
    conn.close()

    if row:
        indicators = {
            "HealthExpenditure": row[0],
            "GDP": row[1],
            "LifeExpectancy": row[2],
            "Population": row[3]
        }
        return jsonify([indicators])
    else:
        return jsonify([])

@app.route("/debug-tables")
def debug_tables():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
    tables = cursor.fetchall()
    conn.close()
    return jsonify([t[0] for t in tables])

@app.route("/correlation")
def get_correlation_data():
    indicator_x = request.args.get("x")
    indicator_y = request.args.get("y")
    year = request.args.get("year")

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    query = f"""
        SELECT i.CountryCode, c.CountryName, i.{indicator_x}, i.{indicator_y}
        FROM indicators i
        JOIN countries c ON i.CountryCode = c.CountryCode
        WHERE i.Year = ?
        AND i.{indicator_x} IS NOT NULL
        AND i.{indicator_y} IS NOT NULL
    """
    cursor.execute(query, (year,))
    rows = cursor.fetchall()
    conn.close()

    result = []
    for row in rows:
        result.append({
            "CountryCode": row[0],
            "CountryName": row[1],
            "x": row[2],
            "y": row[3]
        })
    return jsonify(result)

@app.route("/correlation-view")
def correlation_view():
    return render_template("correlation.html")


if __name__ == "__main__":
    app.run(debug=True)



