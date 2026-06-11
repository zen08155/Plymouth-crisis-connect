import mysql.connector
from mysql.connector import Error


class Database:
    def __init__(self, host: str, db_name: str, username: str, password: str):
        self.host = host
        self.db_name = db_name
        self.username = username
        self.password = password
        self.connection = None

        self.connect()

    def connect(self) -> None:
        try:
            self.connection = mysql.connector.connect(
                host=self.host,
                database=self.db_name,
                user=self.username,
                password=self.password,
                charset="utf8mb4",
            )

            if self.connection.is_connected():
                print("Database connection established.")

        except Error as e:
            print(f"Connection failed: {e}")

    def get_connection(self):
        return self.connection


# Usage
database = Database(
    host="127.0.0.1",
    db_name="plymouthCrisis",
    username="root",
    password="root"
)

connection = database.get_connection()  