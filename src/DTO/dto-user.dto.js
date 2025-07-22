class UserDTO {
  constructor(data) {
    this.name = data.name;
    this.email = data.email;
    this.password = data.password;
  }

  isValidRegister() {
    return (
      typeof this.name === "string" &&
      this.name.trim() !== "" &&
      typeof this.email === "string" &&
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email) &&
      typeof this.password === "string" &&
      this.password.length >= 6
    );
  }

  isValidLogin() {
    return (
      typeof this.email === "string" &&
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email) &&
      typeof this.password === "string" &&
      this.password.length >= 6
    );
  }
}

module.exports = UserDTO;
