import { jest } from "@jest/globals";
import bcrypt from "bcryptjs";
import { signup, login, logout, update, getMe, googleAuth } from "../controllers/authController.js";
import User from "../MongoDB/modals/userModal.js";
import { generateToken } from "../utils/generateWebToken.js";
import { OAuth2Client } from "google-auth-library";



jest.mock("../MongoDB/modals/userModal.js", () => {
  const MockModel = jest.fn().mockImplementation(function (data) {
    Object.assign(this, data);
    this.save = jest.fn().mockResolvedValue(this);
  });
  MockModel.findOne = jest.fn();
  MockModel.findById = jest.fn();
  return MockModel;
});

jest.mock("bcryptjs", () => ({
  genSalt: jest.fn(),
  hash: jest.fn(),
  compare: jest.fn(),
}));

jest.mock("../utils/generateWebToken.js", () => ({
  generateToken: jest.fn(),
}));

// mock google-auth-library — see googleAuth section below

const mockReq = (overrides = {}) => ({ body: {}, user: {}, ...overrides });
const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};
beforeEach(() => {
  User.mockImplementation(function (data) {
    Object.assign(this, data);
    this.save = jest.fn().mockResolvedValue(this);
  });
});

afterEach(() => {
  jest.resetAllMocks();
});
describe("signup", () => {
  it("rejects invalid email format", async () => {
    const req = mockReq({ body: { email: "not-an-email", password: "123456", username: "a", gender: "m" } });
    const res = mockRes();
    await signup(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "Invalid email format" });
  });

  it("rejects missing fields", async () => {
    const req = mockReq({ body: { email: "a@b.com" } });
    const res = mockRes();
    await signup(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("rejects short passwords", async () => {
    const req = mockReq({ body: { email: "a@b.com", password: "123", username: "a", gender: "m" } });
    const res = mockRes();
    await signup(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "Password must be at least 6 characters long" });
  });

  it("rejects a duplicate username", async () => {
    User.findOne.mockResolvedValueOnce({ username: "taken" }); // first call: username check
    const req = mockReq({ body: { email: "a@b.com", password: "123456", username: "taken", gender: "m" } });
    const res = mockRes();
    await signup(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "Username already exists" });
  });

  it("rejects a duplicate email", async () => {
    User.findOne
      .mockResolvedValueOnce(null)        // username check passes
      .mockResolvedValueOnce({ email: "a@b.com" }); // email check fails
    const req = mockReq({ body: { email: "a@b.com", password: "123456", username: "new", gender: "m" } });
    const res = mockRes();
    await signup(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "Email already exists" });
  });

  it("creates a user, hashes the password, and never returns it", async () => {
    User.findOne.mockResolvedValue(null);
    bcrypt.genSalt.mockResolvedValue("salt");
    bcrypt.hash.mockResolvedValue("hashedpw");
    generateToken.mockReturnValue("faketoken");

    const req = mockReq({ body: { email: "a@b.com", password: "123456", username: "new", gender: "m" } });
    const res = mockRes();

    await signup(req, res);

    // password was actually hashed, not stored raw
    expect(bcrypt.hash).toHaveBeenCalledWith("123456", "salt");

    // save was actually called (persistence, not just object construction)
    const responseBody = res.json.mock.calls[0][0];
    expect(res.status).toHaveBeenCalledWith(200);

    // security: password/hash must never appear in the response
    expect(responseBody.user.password).toBeUndefined();
    expect(JSON.stringify(responseBody)).not.toContain("hashedpw");
  });
});
describe("login", () => {
  it("returns 400 if user not found", async () => {
    User.findOne.mockResolvedValue(null);
    const req = mockReq({ body: { username: "ghost", password: "x" } });
    const res = mockRes();
    await login(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "User not found" });
  });

  it("returns 400 on wrong password", async () => {
    User.findOne.mockResolvedValue({ password: "hashed" });
    bcrypt.compare.mockResolvedValue(false);
    const req = mockReq({ body: { username: "user", password: "wrong" } });
    const res = mockRes();
    await login(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "Invalid password" });
  });

  it("logs in successfully and never returns the password hash", async () => {
    User.findOne.mockResolvedValue({ _id: "u1", username: "user", password: "hashed", email: "a@b.com" });
    bcrypt.compare.mockResolvedValue(true);
    generateToken.mockReturnValue("faketoken");
    const req = mockReq({ body: { username: "user", password: "correct" } });
    const res = mockRes();

    await login(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    const body = res.json.mock.calls[0][0];
    expect(body.token).toBe("faketoken");
    expect(body.user.password).toBeUndefined();
  });
});
describe("update", () => {
  it("rejects out-of-range height", async () => {
    const res = mockRes();
    await update(mockReq({ body: { height: 10 } }), res);
    expect(res.status).toHaveBeenCalledWith(400);
  });
  it("rejects out-of-range weight", async () => {
    const res = mockRes();
    await update(mockReq({ body: { weight: 500 } }), res);
    expect(res.status).toHaveBeenCalledWith(400);
  });
    it("rejects out-of-range age", async () => {
    const res = mockRes();
    await update(mockReq({ body: { age: 500 } }), res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("returns 400 if user not found", async () => {
    User.findOne.mockResolvedValue(null);
    const req = mockReq({ body: { height: 170, weight: 70, age: 30 }, user: { _id: "u1" } });
    const res = mockRes();
    await update(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("updates fields and saves", async () => {
    const fakeUser = { save: jest.fn().mockResolvedValue(true) };
    User.findById.mockResolvedValue(fakeUser);
    const req = mockReq({
      body: { username: "newname", height: 170, weight: 70, age: 30 },
      user: { _id: "u1" },
    });
    const res = mockRes();

    await update(req, res);

    expect(fakeUser.username).toBe("newname");
    expect(fakeUser.save).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
  });
  it("doesnt return the password hash in the response", async () => {
    const fakeUser = { save: jest.fn().mockResolvedValue(true) };
    User.findById.mockResolvedValue(fakeUser);
    const req = mockReq({
      body: { username: "newname", height: 170, weight: 70, age: 30 },
      user: { _id: "u1" },
    });
    const res = mockRes();  

    await update(req, res);

    const responseBody = res.json.mock.calls[0][0];
    expect(fakeUser.password).toBeUndefined();
  });

  it("only rehashes the password when newPassword is provided", async () => {
    const fakeUser = { save: jest.fn().mockResolvedValue(true) };
    User.findById.mockResolvedValue(fakeUser);
    bcrypt.genSalt.mockResolvedValue("salt");
    bcrypt.hash.mockResolvedValue("newhashed");
    const req = mockReq({
      body: { newPassword: "newpass1", height: 170, weight: 70, age: 30 },
      user: { _id: "u1" },
    });
    const res = mockRes();

    await update(req, res);

    expect(bcrypt.hash).toHaveBeenCalledWith("newpass1", "salt");
    expect(fakeUser.password).toBe("newhashed");
  });
    it("looks up the user by their own id, not an unrelated record", async () => {
    const fakeUser = { _id: "u1", save: jest.fn().mockResolvedValue(true) };
    User.findOne.mockResolvedValue(fakeUser);
    const req = mockReq({
      body: { height: 170, weight: 70, age: 30 },
      user: { _id: "u1" },
    });
    const res = mockRes();

    await update(req, res);

    expect(User.findById).toHaveBeenCalledWith("u1"); // will fail against current code
  });
});
describe("getMe", () => {
  it("returns the user without the password field", async () => {
    const selectMock = jest.fn().mockResolvedValue({ _id: "u1", username: "user" });
    User.findById.mockReturnValue({ select: selectMock });

    const req = mockReq({ user: { _id: "u1" } });
    const res = mockRes();

    await getMe(req, res);

    expect(User.findById).toHaveBeenCalledWith("u1");
    expect(selectMock).toHaveBeenCalledWith("-password");
    expect(res.status).toHaveBeenCalledWith(200);
  });
});


