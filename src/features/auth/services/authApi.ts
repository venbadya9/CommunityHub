export class InvalidCredentialsError extends Error {
  name = "InvalidCredentialsError";
}

const MOCK_ACCOUNT = {
  email: "test@demo.com",
  password: "password123",
};

export const authApi = {
  login: async (email: string, password: string) => {
    await new Promise((resolve) => setTimeout(resolve, 1200));

    if (
      email.toLowerCase() !== MOCK_ACCOUNT.email ||
      password !== MOCK_ACCOUNT.password
    ) {
      throw new InvalidCredentialsError("Invalid email or password.");
    }

    return {
      token: "mock-jwt-response-token",
      user: { id: "v-129", email },
    };
  },
};
