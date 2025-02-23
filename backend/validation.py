from abc import ABC, abstractmethod
from sympy import sympify
class Validator(ABC):

    fail_message = ""
    challenges = []
    format_msg = ""
        
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
        "You have unlimited bread and two slices of provolone cheese. Make a sandwich.",
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
    
class Calculus(Validator):
    
    challenges = [
        "Find the derivative of the following function: f(x) = x^2",
        "Solve the following integral: ∫ x^2 dx",
    ]

    format_msg = """
        
        user_input: str
        instructions: "Use sympy to represent the expressions (from users input) in the following fields"
        symbols: list[str] 
        question_expression: str
        given_answer: str"""
    

    def validate(self, data: dict):
        symbols = data.get("symbols", [])
        if not symbols:
            self.fail_message = "No symbols provided"
            return False
        equations = data.get("target-expression", [])
        if not equations:
            self.fail_message = "No expression provided"
            return False
        given_answer = data.get("given-answer", [])
        if not given_answer:
            self.fail_message = "No answer provided"
            return False
        try:
            target_expression = sympify(equations)
            given_answer = sympify(given_answer)
            if target_expression.diff(*symbols) != given_answer:
                self.fail_message = "Incorrect derivative"
                return False

        except:
            self.fail_message = "Invalid expression"
            return False
        pass

    def requirements(self):
        return """
        topic: "Calculus"
        details: "The user must respond in valid calculus, and the derivative must be correct"
        """
    def challenge(self):
        return """
        examples: {}
        """.format(",".join(self.challenges))
    format_examples = """
    [
  {
    "written": "dy/dx",
    "sympy": "Derivative(y, x)"
  },
  {
    "written": "d/dx of x^2",
    "sympy": "diff(x**2, x)"
  },
  {
    "written": "second derivative of sin(x)",
    "sympy": "diff(sin(x), x, 2)"
  },
  {
    "written": "f'(x)",
    "sympy": "diff(f(x), x)"
  },
  {
    "written": "f''(x)",
    "sympy": "diff(f(x), x, 2)"
  },
  {
    "written": "∂f/∂x",
    "sympy": "Derivative(f, x)"
  },
  {
    "written": "partial derivative of f with respect to y",
    "sympy": "Derivative(f, y)"
  },
  {
    "written": "∂²f/∂x∂y",
    "sympy": "Derivative(f, x, y)"
  },
  {
    "written": "integral of x^2 dx",
    "sympy": "integrate(x**2, x)"
  },
  {
    "written": "∫ (3x^3 + 2x) dx",
    "sympy": "integrate(3*x**3 + 2*x, x)"
  },
  {
    "written": "definite integral of x^2 from 0 to 3",
    "sympy": "integrate(x**2, (x, 0, 3))"
  },
  {
    "written": "∫ e^x dx",
    "sympy": "integrate(exp(x), x)"
  },
  {
    "written": "integral of sin(x) from 0 to pi",
    "sympy": "integrate(sin(x), (x, 0, pi))"
  },
  {
    "written": "∫ 1/x dx",
    "sympy": "integrate(1/x, x)
  },
  {
    "written": "lim x -> inf 1/x",
    "sympy": "limit(1/x, x, oo)"
  },
  {
    "written": "limit of (x^2 - 1)/(x - 1) as x -> 1",
    "sympy": "limit((x**2 - 1)/(x - 1), x, 1)"
  },
  {
    "written": "lim x -> 0 sin(x)/x",
    "sympy": "limit(sin(x)/x, x, 0)"
  },
  {
    "written": "limit of (1 + 1/n)^n as n -> inf",
    "sympy": "limit((1 + 1/n)**n, n, oo)"
  },
  {
    "written": "lim x -> 0⁺ 1/x",
    "sympy": "limit(1/x, x, 0, dir='+')"
  },
  {
    "written": "lim x -> 0⁻ 1/x",
    "sympy": "limit(1/x, x, 0, dir='-')"
  },
  {
    "written": "limit of x^3 - x as x -> 0",
    "sympy": "limit(x**3 - x, x, 0)"
  },
  {
    "written": "lim x -> inf e^(-x)",
    "sympy": "limit(exp(-x), x, oo)"
  },
  {
    "written": "lim x -> a f(x)",
    "sympy": "limit(f(x), x, a)"
  },
  {
    "written": "lim x -> 0 (x^2 - 4)/(x - 2)",
    "sympy": "limit((x**2 - 4)/(x - 2), x, 0)"
  }
]

"""
