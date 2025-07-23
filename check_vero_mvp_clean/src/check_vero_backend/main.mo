
actor {
  public query func verifyNumber(number : Text) : async Text {
    if (number == "+31612345678") {
      return "✅ This number is verified: Acme Bank";
    } else if (number == "+61298765432") {
      return "✅ This number is verified: Gov Australia";
    } else {
      return "❌ This number is not registered. Proceed with caution.";
    }
  }
}
