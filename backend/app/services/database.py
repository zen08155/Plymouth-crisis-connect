from typing import Any
class Database:
    def execute(self, query : str, params: tuple = ()) -> Any:
        """Wrapper for database, made so code isn't dependent on it

        Args:
            query (str): query to be executed
            params (tuple, optional): Params to replace the placeholders with. Defaults to ().

        TODO: Implement db thingie
        Returns:
            Any: just forwards return of the actual db response
        """
        raise Exception("db not implemented")