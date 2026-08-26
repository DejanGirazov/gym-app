import { jest } from "@jest/globals";
import {
  createLog,
  deleteMeal,
  getAllMeals,
  getMeal,
  searchMeal,
  updateMeal,
  searchMealById,
  lookupBarcode,
} from "../controllers/mealController.js";
import mealModal from "../MongoDB/modals/mealModal.js";

jest.mock("../MongoDB/modals/mealModal.js", () => {
  const MockModel = jest.fn().mockImplementation(function (data) {
    Object.assign(this, data);
    this.save = jest.fn().mockResolvedValue(this);
  });
  // static methods used elsewhere in the controller
  MockModel.find = jest.fn();
  MockModel.findOne = jest.fn();
  MockModel.findOneAndDelete = jest.fn();
  return MockModel;
});

const mockReq = (overrides = {}) => ({
  params: {},
  body: {},
  user: { _id: "user1" },
  ...overrides,
});

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

afterEach(() => {
  jest.clearAllMocks();
});

describe("createLog", () => {
  it("creates a log and returns 201", async () => {
    const req = mockReq({
      body: { foods: [{ name: "Apple", calories: 95 }], type: "Breakfast" },
    });
    const res = mockRes();

    await createLog(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        user: "user1",
        type: "Breakfast",
        totalCalories: 95,
        foods: [{ name: "Apple", calories: 95 }],
      }),
    );
  });
  it("returns 400 if an empty array of foods is provided", async () => {
    const req = mockReq({
      body: { foods: [], type: "Breakfast" },
    });
    const res = mockRes();

    await createLog(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: "Foods array cannot be empty",
    });
  });
  it("returns 400 if type is missing", async () => {
    const req = mockReq({
      body: { foods: [{ name: "Apple", calories: 95 }] },
    });
    const res = mockRes();

    await createLog(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: "Foods and type are required",
    });
  });
  it("returns 500 if the database call fails", async () => {
  mealModal.find.mockReturnValue({
    sort: jest.fn().mockRejectedValue(new Error("DB down")),
  });
  const req = mockReq();
  const res = mockRes();
  await getAllMeals(req, res);
  expect(res.status).toHaveBeenCalledWith(500);
});
});

describe("getAllMeals", () => {
  it("returns the user's logs sorted by newest", async () => {
    const fakeLogs = [{ _id: "log1" }, { _id: "log2" }];
    // find() returns a query object with .sort() on it — mock that shape
    mealModal.find.mockReturnValue({
      sort: jest.fn().mockResolvedValue(fakeLogs),
    });

    const req = mockReq();
    const res = mockRes();

    await getAllMeals(req, res);

    expect(mealModal.find).toHaveBeenCalledWith({ user: "user1" });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(fakeLogs);
  });
  it("returns 500 if the database call fails", async () => {
  mealModal.find.mockReturnValue({
    sort: jest.fn().mockRejectedValue(new Error("DB down")),
  });
  const req = mockReq();
  const res = mockRes();
  await getAllMeals(req, res);
  expect(res.status).toHaveBeenCalledWith(500);
});
});
describe("getMeal", () => {
  it("returns the log if found", async () => {
    const fakeLog = {
      _id: "log1",
      type: "Breakfast",
      user: "user1",
    };
    mealModal.findOne.mockResolvedValue(fakeLog);

    const req = mockReq({ params: { id: "log1" } });
    const res = mockRes();

    await getMeal(req, res);

    expect(mealModal.findOne).toHaveBeenCalledWith({
      _id: "log1",
      user: "user1",
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(fakeLog);
  });

  it("returns 404 if not found", async () => {
    mealModal.findOne.mockResolvedValue(null);

    const req = mockReq({ params: { id: "missing" } });
    const res = mockRes();

    await getMeal(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: "Meal not found" });
  });
  it("returns 400 if there is no id", async () => {
    const req = mockReq({ params: { id: null } });
    const res = mockRes();

    await getMeal(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "Meal ID is required" });
  });
  it("returns 500 if the database call fails", async () => {
  mealModal.find.mockReturnValue({
    sort: jest.fn().mockRejectedValue(new Error("DB down")),
  });
  const req = mockReq();
  const res = mockRes();
  await getAllMeals(req, res);
  expect(res.status).toHaveBeenCalledWith(500);
});
});

describe("deleteMeal", () => {
  it("deletes the log and returns 200 when found", async () => {
    mealModal.findOneAndDelete.mockResolvedValue({ _id: "log1" });

    const req = mockReq({ params: { id: "log1" } });
    const res = mockRes();

    await deleteMeal(req, res);

    expect(mealModal.findOneAndDelete).toHaveBeenCalledWith({
      _id: "log1",
      user: "user1",
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: "Meal deleted successfully",
    });
  });

  it("returns 404 when the log doesn't exist", async () => {
    mealModal.findOneAndDelete.mockResolvedValue(null);

    const req = mockReq({ params: { id: "missing" } });
    const res = mockRes();

    await deleteMeal(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: "Meal not found" });
  });
  it("returns 400 if there is no id", async () => {
    const req = mockReq({ params: { id: null } });
    const res = mockRes();

    await deleteMeal(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "Meal ID is required" });
  });   
  it("returns 500 if the database call fails", async () => {
  mealModal.find.mockReturnValue({
    sort: jest.fn().mockRejectedValue(new Error("DB down")),
  });
  const req = mockReq();
  const res = mockRes();
  await getAllMeals(req, res);
  expect(res.status).toHaveBeenCalledWith(500);
});
});


