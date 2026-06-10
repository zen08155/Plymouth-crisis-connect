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
    
    @staticmethod
    def execute(sql: str, params: tuple = ()):
        """
    Executes a SQL query using the shared database connection.

    This method:
    - Retrieves the singleton database connection
    - Executes the given SQL statement with optional parameters
    - Commits the transaction on success
    - Rolls back the transaction on failure
    - Always closes the cursor after execution

    Args:
        sql (str): The SQL query to execute. Should use `%s` placeholders for parameters.
        params (tuple, optional): Values to bind to the SQL query placeholders.
                                   Defaults to an empty tuple.

    Returns:
        mysql.connector.cursor.MySQLCursor: The cursor after execution.
        Useful for fetching results (e.g. fetchone(), fetchall()).

    Raises:
        Exception: Re-raises any database error that occurs during execution.
                   The transaction is rolled back before raising.

    Example:
        Database.execute(
            "INSERT INTO users (name, email) VALUES (%s, %s)",
            ("John", "john@example.com")
        )

        cursor = Database.execute(
            "SELECT * FROM users WHERE id = %s",
            (1,)
        )
        result = cursor.fetchone()
    """
        conn = Database.get_connection()
        cursor = conn.cursor(dictionary=True)

        try:
            cursor.execute(sql, params)
            conn.commit()
            return cursor

        except Exception as e:
            conn.rollback()
            raise e
        
        finally: 
            cursor.close()