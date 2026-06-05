import mysql.connector
import os

class Database:
    """Singleton database connection

    Returns:
        PDO: Returns the existing db connection, or creates it if it doesn't exist yet
    """
    _connection = None

    @classmethod
    def get_connection(cls):
        if cls._connection is None:
            cls._connection = mysql.connector.connect(
                host=os.getenv("DB_HOST"),
                user=os.getenv("DB_USER"),
                password=os.getenv("DB_PASSWORD"),
                database=os.getenv("DB_NAME")
            )

        return cls._connection
    
    
