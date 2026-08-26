import { jest } from "@jest/globals";
import {
  createCardioLog,
  getAllCardioLogs,
  getCardioLog,
  deleteCardioLog,
} from "./cardioController.js";
import cardioModal from "../MongoDB/modals/cardioModal.js";
import calculateCalories from "../utils/calculateCalories.js";

// ── Mocks ──────────────────────────────────────────────────────────────
// Replace the real Mongoose model with a fake constructor that behaves
// enough like the real one for our purposes: it copies the data passed
// in, and gives back a working save().
jest.mock("../MongoDB/modals/cardioModal.js", () => {
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

// Replace the real calorie math with a fixed, predictable value.
// We already unit-test calculateCalories.js on its own — mocking it
// here keeps this file focused on the controller's own logic.
jest.mock("../utils/calculateCalories.js", () => jest.fn(() => 363));

// ── Shared helpers ────────────────────────────────────────────────────
const mockReq = (overrides = {}) => ({
  params: {},
  body: {},
  user: { _id: "user1", weight: 70 },
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

// ── Tests ─────────────────────────────────────────────────────────────
describe("createCardioLog", () => {
  it("creates a log and returns 201", async () => {
    const req = mockReq({
      body: { type: "running", duration: 30, distance: 5, notes: "Morning run" },
    });
    const res = mockRes();

    await createCardioLog(req, res);

    expect(calculateCalories).toHaveBeenCalledWith("running", 30, 70, 5);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        user: "user1",
        type: "running",
        totalCalories: 363,
        duration: 30,
        distance: 5,
        notes: "Morning run",
      }),
    );
  });

  it("returns 400 if type or duration is missing", async () => {
    const req = mockReq({ body: { notes: "no type or duration" } });
    const res = mockRes();

    await createCardioLog(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: "Type and duration are required",
    });
  });
});

describe("getAllCardioLogs", () => {
  it("returns the user's logs sorted by newest", async () => {
    const fakeLogs = [{ _id: "log1" }, { _id: "log2" }];
    // find() returns a query object with .sort() on it — mock that shape
    cardioModal.find.mockReturnValue({
      sort: jest.fn().mockResolvedValue(fakeLogs),
    });

    const req = mockReq();
    const res = mockRes();

    await getAllCardioLogs(req, res);

    expect(cardioModal.find).toHaveBeenCalledWith({ user: "user1" });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(fakeLogs);
  });
});

describe("getCardioLog", () => {
  it("returns the log if found", async () => {
    const fakeLog = { _id: "log1", type: "running" };
    cardioModal.findOne.mockResolvedValue(fakeLog);

    const req = mockReq({ params: { id: "log1" } });
    const res = mockRes();

    await getCardioLog(req, res);

    expect(cardioModal.findOne).toHaveBeenCalledWith({
      _id: "log1",
      user: "user1",
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(fakeLog);
  });

  it("returns 404 if not found", async () => {
    cardioModal.findOne.mockResolvedValue(null);

    const req = mockReq({ params: { id: "missing" } });
    const res = mockRes();

    await getCardioLog(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: "Cardio log not found" });
  });
});

describe("deleteCardioLog", () => {
  it("deletes the log and returns 200 when found", async () => {
    cardioModal.findOneAndDelete.mockResolvedValue({ _id: "log1" });

    const req = mockReq({ params: { id: "log1" } });
    const res = mockRes();

    await deleteCardioLog(req, res);

    expect(cardioModal.findOneAndDelete).toHaveBeenCalledWith({
      _id: "log1",
      user: "user1",
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: "Cardio log deleted successfully",
    });
  });

  it("returns 404 when the log doesn't exist", async () => {
    cardioModal.findOneAndDelete.mockResolvedValue(null);

    const req = mockReq({ params: { id: "missing" } });
    const res = mockRes();

    await deleteCardioLog(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: "Cardio log not found" });
  });
});