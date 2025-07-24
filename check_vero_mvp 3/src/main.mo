actor CheckVero {
  type User = {
    id: Text;
    email: Text;
    name: Text;
  };

  stable var users: [User] = [];

  public func registerUser(id: Text, email: Text, name: Text): async Bool {
    for (user in users.vals()) {
      if (user.id == id or user.email == email) {
        return false;
      };
    };
    let newUser: User = { id = id; email = email; name = name };
    users := Array.append(users, [newUser]);
    return true;
  };

  public query func verifyUser(id: Text, email: Text): async Bool {
    for (user in users.vals()) {
      if (user.id == id and user.email == email) {
        return true;
      };
    };
    return false;
  };

  public query func getUsers(): async [User] {
    return users;
  };
};
