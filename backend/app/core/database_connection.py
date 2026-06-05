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
                host="localhost",
                user="root",
                password="",
                database="plym"
            )

        return cls._connection
    
    
