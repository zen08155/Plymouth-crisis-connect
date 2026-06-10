import mysql.connector

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
                host="127.0.0.1",
                user="root",
                password="root",
                database="plymouthCrisis"
            )

        return cls._connection
    
    
