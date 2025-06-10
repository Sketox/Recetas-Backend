class RecipeDTO {
  constructor(data) {
    this.title = data.title;
    this.description = data.description;
    this.ingredients = data.ingredients;
    this.instructions = data.instructions;
    this.prepTime = data.prepTime;
    this.cookTime = data.cookTime;
    this.servings = data.servings;
    this.difficulty = data.difficulty;
    this.category = data.category;
    this.imageUrl = data.imageUrl;
    this.rating = data.rating;
  }

  isValid() {
    const difficulties = ["Fácil", "Intermedio", "Difícil"];
    const categories = ["Desayuno", "Almuerzo", "Cena", "Postre", "Snack"];

    return (
      typeof this.title === "string" &&
      typeof this.description === "string" &&
      Array.isArray(this.ingredients) &&
      Array.isArray(this.instructions) &&
      typeof this.prepTime === "number" &&
      typeof this.cookTime === "number" &&
      typeof this.servings === "number" &&
      difficulties.includes(this.difficulty) &&
      categories.includes(this.category) &&
      typeof this.imageUrl === "string" &&
      typeof this.rating === "number" &&
      this.rating >= 1 &&
      this.rating <= 5
    );
  }
}

module.exports = RecipeDTO;
