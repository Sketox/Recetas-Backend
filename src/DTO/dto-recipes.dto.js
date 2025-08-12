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
    this.userId = data.userId;
  }

  isValid() {
    const difficulties = ["Fácil", "Intermedio", "Difícil"];
    const categories = ["Desayuno", "Almuerzo", "Cena", "Postre", "Snack"];

    return (
      typeof this.title === "string" &&
      this.title.trim().length > 0 &&
      typeof this.description === "string" &&
      this.description.trim().length > 0 &&
      Array.isArray(this.ingredients) &&
      this.ingredients.length > 0 &&
      Array.isArray(this.instructions) &&
      this.instructions.length > 0 &&
      typeof this.prepTime === "number" &&
      this.prepTime > 0 &&
      typeof this.cookTime === "number" &&
      this.cookTime > 0 &&
      typeof this.servings === "number" &&
      this.servings > 0 &&
      difficulties.includes(this.difficulty) &&
      categories.includes(this.category) &&
      typeof this.imageUrl === "string" &&
      typeof this.rating === "number" &&
      typeof this.userId === "string" &&
      this.rating >= 0 &&
      this.rating <= 5
    );
  }
}

module.exports = RecipeDTO;
