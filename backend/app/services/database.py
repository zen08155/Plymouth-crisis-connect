class Database:
    def execute(self, query : str, params: tuple = ()):
        """Wrapper for database, made so code isn't dependent on it

        Args:
            query (str): query to be executed
            params (tuple, optional): Params to replace the placeholders with. Defaults to ().

        TODO: Implement db thingie
        FIXME: flexible return type?
        """
        raise Exception("db not implemented")