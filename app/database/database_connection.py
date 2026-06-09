import mysql.connector
import os

class Database:
    """Singleton database connection

    Returns:
        PDO: Returns the existing db connection, or creates it if it doesn't exist yet
    """
    _connection = None

    #FIXME: use real db
    @classmethod
    def get_connection(cls):
        if cls._connection is None:
            cls._connection = mysql.connector.connect(
                host=os.getenv("DB_HOST", "localhost"),
                user=os.getenv("DB_USER", "root"),
                password=os.getenv("DB_PASSWORD", ""),
                database=os.getenv("DB_NAME", "plymouthCrisis")
            )

        return cls._connection
    
    
