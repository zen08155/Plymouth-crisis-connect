import os
from dataclasses import dataclass

import mysql.connector
from mysql.connector import pooling


@dataclass(frozen=True)
class QueryResult:
    rowcount: int
    lastrowid: int | None

class Database:
    """Database connection pool

    Returns:
        PooledMySQLConnection: Returns a live database connection from the pool.
    """
    _pool = None

    @classmethod
    def _connection_config(cls):
        return {
            "host": os.getenv("DB_HOST", "127.0.0.1"),
            "port": int(os.getenv("DB_PORT", "3306")),
            "user": os.getenv("DB_USER", "root"),
            "password": os.getenv("DB_PASSWORD", "root"),
            "database": os.getenv("DB_NAME", "plymouthCrisis"),
            "autocommit": False,
        }

    @classmethod
    def _get_pool(cls):
        if cls._pool is None:
            cls._pool = pooling.MySQLConnectionPool(
                pool_name="plymouth_api_pool",
                pool_size=10,
                pool_reset_session=True,
                **cls._connection_config(),
            )
        return cls._pool

    @classmethod
    def get_connection(cls):
        conn = cls._get_pool().get_connection()
        conn.ping(reconnect=True, attempts=3, delay=1)
        return conn
    
    @staticmethod
    def execute(sql: str, params: tuple = ()):
        """
    Executes a SQL query using a pooled database connection.

    This method:
    - Retrieves a connection from the pool
    - Executes the given SQL statement with optional parameters
    - Commits the transaction on success
    - Rolls back the transaction on failure
    - Always closes the cursor and returns the connection to the pool

    Args:
        sql (str): The SQL query to execute. Should use `%s` placeholders for parameters.
        params (tuple, optional): Values to bind to the SQL query placeholders.
                                   Defaults to an empty tuple.

    Returns:
        QueryResult: Row count and last inserted id for the executed statement.

    Raises:
        Exception: Re-raises any database error that occurs during execution.
                   The transaction is rolled back before raising.

    Example:
        Database.execute(
            "INSERT INTO users (name, email) VALUES (%s, %s)",
            ("John", "john@example.com")
        )

        result = Database.execute("UPDATE users SET isActive = TRUE WHERE userId = %s", (1,))
    """
        conn = Database.get_connection()
        cursor = conn.cursor(dictionary=True)

        try:
            cursor.execute(sql, params)
            result = QueryResult(
                rowcount=cursor.rowcount,
                lastrowid=cursor.lastrowid,
            )
            conn.commit()
            return result

        except Exception as e:
            conn.rollback()
            raise e
        
        finally: 
            cursor.close()
            conn.close()
