from abc import ABC, abstractmethod

class Validator(ABC):

    fail_message = ""
    challenges = []
        
    @abstractmethod
    def validate(self, data):
        pass

    @abstractmethod
    def requirements(self, data):
        pass

    @abstractmethod
    def challenge(self, data):
        pass
    
class Sandwich(Validator):
    
    challenges = [
        "Fix the following sandwich: [bread, ham, cheese]",
        "Is the following sandwich valid? [bread, ham, cheese, bread]",
    ]

    def validate(self, data: dict):
        ingredients = data.get("ingredients", [])
        if self.data["ingredients"].empty():
            self.fail_message = "No ingredients provided"
            return False
        if ingredients[0] != "bread" or ingredients[-1] != "bread":
            self.fail_message = "First and last ingredient must be bread"
            return False
        return True

    def requirements(self):
        return """
        topic: "Sandwiches"
        details: "The sandwich must have bread as the first and last ingredient"
        ingredients: list[str]
        """
    def challenge(self):
        return """
        examples: {}
        """.format(",".join(self.challenges))


