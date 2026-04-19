import mongoose from "mongoose";
import { badRequest, forbidden, notFound } from "../../utils/httpError.js";
import { Test, TestStatus } from "./test.model.js";

function assertTimeWindow(startTime, endTime) {
  if (!(startTime instanceof Date) || Number.isNaN(startTime.getTime())) throw badRequest("Invalid start_time");
  if (!(endTime instanceof Date) || Number.isNaN(endTime.getTime())) throw badRequest("Invalid end_time");
  if (endTime <= startTime) throw badRequest("end_time must be after start_time");
}

export const testService = {
  async createTest({ title, durationMinutes, startTime, endTime }) {
    assertTimeWindow(startTime, endTime);
    const t = await Test.create({
      title,
      durationMinutes,
      startTime,
      endTime,
      status: TestStatus.SCHEDULED,
    });
    return t.toObject();
  },

  /**
   * Activates one test and completes any other ACTIVE tests.
   * Strict rule: One active test at a time.
   */
  async activateTest(testId) {
    console.log("🔴 ADMIN ACTIVATE TEST called for testId:", testId);
    const session = await mongoose.startSession();
    try {
      let updated;
      await session.withTransaction(async () => {
        const test = await Test.findById(testId).session(session);
        if (!test) throw notFound("Test not found");

        // Allow admin to activate test at any time (remove strict time window check)
        // const now = new Date();
        // if (now < test.startTime || now > test.endTime) {
        //   throw forbidden("Cannot activate test outside its scheduled window");
        // }

        // Only prevent activation if test is already completed
        if (test.status === TestStatus.COMPLETED) {
          throw forbidden("Cannot activate a completed test");
        }

        await Test.updateMany({ status: TestStatus.ACTIVE, _id: { $ne: test._id } }, { $set: { status: TestStatus.COMPLETED } }).session(session);
        test.status = TestStatus.ACTIVE;
        await test.save({ session });
        updated = test.toObject();
      });
      return updated;
    } finally {
      session.endSession();
    }
  },

  // Student activation without time window check (test should already be active)
  async studentActivateTest(testId) {
    console.log("🟢 STUDENT ACTIVATE TEST called for testId:", testId);
    const session = await mongoose.startSession();
    try {
      let updated;
      await session.withTransaction(async () => {
        const test = await Test.findById(testId).session(session);
        if (!test) throw notFound("Test not found");

        const now = new Date();
        
        // Students can activate tests that are already ACTIVE or scheduled for future
        if (test.status !== TestStatus.ACTIVE) {
          throw forbidden("Test is not active yet");
        }

        // No time window check for students - they can activate active tests anytime
        updated = test.toObject();
      });
      return updated;
    } finally {
      session.endSession();
    }
  },

  async getActiveTest() {
    const now = new Date();
    
    // Check for any ACTIVE tests (including future scheduled ones activated by admin)
    let test = await Test.findOne({
      status: TestStatus.ACTIVE,
    })
      .sort({ startTime: 1 }) // Earliest starting test first
      .lean();

    // Auto complete stale ACTIVE tests that have ended (past their endTime)
    await Test.updateMany(
      { status: TestStatus.ACTIVE, endTime: { $lt: now } },
      { $set: { status: TestStatus.COMPLETED } }
    );

    return test;
  },

  async getTestById(testId) {
    const test = await Test.findById(testId).lean();
    if (!test) throw notFound("Test not found");
    return test;
  },
};

