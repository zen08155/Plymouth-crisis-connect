from datetime import date
class UserSkills:
    """Skills object with information validation based on skill_type
    """
    def __init__(self, 
                 id : int, 
                 title : str,
                 description : str,
                 skill_type : str,
                 skill_description : str | None = None,
                 proof_of_certificate : str | None = None,
                 name_of_certificate : str | None = None,
                 expiration_date_certificate : date | None = None,
                 course_taken_at : date | None = None
                 ):
        self.id = id or None #None on first creation, afterwards fetch id from db
        self.title = title
        self.description = description
        self.skill_type = skill_type
        self.skill_description = skill_description #only when skilltype: other is selected
        self.course_taken_at = course_taken_at # Only for skilltype: course or crashCourse

        #below is only required for skilltype: certified or work
        self.proof_of_certificate = proof_of_certificate 
        self.name_of_certificate = name_of_certificate 
        self.expiration_date_certificate = expiration_date_certificate
        self.__validate()


    def __validate(self):
        """Checks if each field is filled as required

        Raises:
            ValueError: throws if skilltype requires information, but no information is given
        """
        if self.skill_type == "other" and not self.skill_description:
            raise ValueError("Skill description is required when skill_type is 'other'")
        
        if self.skill_type in  ("crashcourse", "course") and not self.course_taken_at:
            raise ValueError("Course_taken_at date is required when skill_type is 'course' or 'crashcourse'")

        if self.skill_type in ("work", "certified"):
            required = [
                self.proof_of_certificate,
                self.name_of_certificate,
                self.expiration_date_certificate
            ]

            if not all(required):
                raise ValueError("Certificate information is required")
        
        
     
