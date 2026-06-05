from datetime import date
class UserSkills:
    def __init__(self, 
                 id : int, 
                 title : int,
                 description : str,
                 skill_type : str,
                 skill_description : str,
                 proof_of_certificate : str,
                 name_of_certificate : str,
                 expiration_date_certificate : date,
                 course_taken_at : date
                 ):
        self.id = id or None
        self.title = title
        self.description = description
        self.skill_type = skill_type
        self.skill_description = skill_description or None
        self.proof_of_certificate = proof_of_certificate or None
        self.name_of_certificate = name_of_certificate or None
        self.expiration_date_certificate = expiration_date_certificate or None
        self.course_taken_at = course_taken_at or None
     
