import { PartnerRequest } from "../models/PartnerRequest.js";
import { PartnerApplication } from "../models/PartnerApplication.js";
import { Doubt } from "../models/Doubt.js";
import { Conversation } from "../models/Conversation.js";
import { Message } from "../models/Message.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { badRequest, notFound, forbidden } from "../utils/httpError.js";

// -- Partners --

export const createPartnerRequest = asyncHandler(async (req, res) => {
  const { title, description, skillsRequired, level, duration } = req.body;
  if (!title || !description || !level || !duration) throw badRequest("Missing fields");

  const pr = await PartnerRequest.create({
    userId: req.auth.userId,
    title, description, skillsRequired, level, duration
  });
  res.status(201).json({ request: pr });
});

export const getPartnerRequests = asyncHandler(async (req, res) => {
  const requests = await PartnerRequest.find({ status: "Open" })
    .populate("userId", "name email")
    .sort({ createdAt: -1 }).lean();
  
  // Attach application count to each request
  const requestsWithCounts = await Promise.all(requests.map(async (r) => {
    const count = await PartnerApplication.countDocuments({ requestId: r._id });
    return { ...r, applicantCount: count };
  }));

  res.json({ requests: requestsWithCounts });
});

export const getPartnerRequestById = asyncHandler(async (req, res) => {
  const request = await PartnerRequest.findById(req.params.id)
    .populate("userId", "name email").lean();
  if (!request) throw notFound("Request not found");
  
  let applications = [];
  if (request.userId._id.toString() === req.auth.userId) {
    applications = await PartnerApplication.find({ requestId: request._id })
      .populate("applicantId", "name email").lean();
  }
  
  res.json({ request, applications });
});

export const applyForPartner = asyncHandler(async (req, res) => {
  const { message } = req.body;
  if (!message) throw badRequest("Message is required");

  const reqExists = await PartnerRequest.findById(req.params.id);
  if (!reqExists) throw notFound("Partner request not found");

  if (reqExists.userId.toString() === req.auth.userId) {
    throw badRequest("Cannot apply to your own request");
  }

  const existing = await PartnerApplication.findOne({ requestId: req.params.id, applicantId: req.auth.userId });
  if (existing) throw badRequest("Already applied");

  const app = await PartnerApplication.create({
    requestId: req.params.id,
    applicantId: req.auth.userId,
    message
  });
  res.status(201).json({ application: app });
});

export const getMyRequests = asyncHandler(async (req, res) => {
  const requests = await PartnerRequest.find({ userId: req.auth.userId }).sort({ createdAt: -1 }).lean();
  res.json({ requests });
});

export const acceptApplication = asyncHandler(async (req, res) => {
  const app = await PartnerApplication.findById(req.params.appId).populate("requestId");
  if (!app) throw notFound("Application not found");

  if (app.requestId.userId.toString() !== req.auth.userId) {
    throw forbidden("Only request owner can accept");
  }

  app.status = "Accepted";
  await app.save();

  let conv = await Conversation.findOne({
    participants: { $all: [app.requestId.userId, app.applicantId], $size: 2 }
  });

  if (!conv) {
    conv = await Conversation.create({
      participants: [app.requestId.userId, app.applicantId],
      referenceType: "Partner",
      referenceId: app.requestId._id
    });
  }

  res.json({ application: app, conversation: conv });
});

export const getMyApplications = asyncHandler(async (req, res) => {
  const applications = await PartnerApplication.find({ applicantId: req.auth.userId })
    .populate({
      path: "requestId",
      populate: { path: "userId", select: "name email" }
    })
    .sort({ createdAt: -1 })
    .lean();
  res.json({ applications });
});

export const closePartnerRequest = asyncHandler(async (req, res) => {
  const pr = await PartnerRequest.findById(req.params.id);
  if (!pr) throw notFound("Request not found");

  if (pr.userId.toString() !== req.auth.userId) {
    throw forbidden("Only owner can close request");
  }

  pr.status = "Closed";
  await pr.save();
  res.json({ request: pr });
});

// -- Doubts --

export const createDoubt = asyncHandler(async (req, res) => {
  const { title, description, category, priority } = req.body;
  if (!title || !description || !category) throw badRequest("Missing fields");

  const doubt = await Doubt.create({
    studentId: req.auth.userId,
    title, description, category, priority: priority || "Normal"
  });

  const conv = await Conversation.create({
    participants: [req.auth.userId],
    referenceType: "Doubt",
    referenceId: doubt._id
  });

  res.status(201).json({ doubt, conversationId: conv._id });
});

export const getDoubts = asyncHandler(async (req, res) => {
  let query = {};
  if (req.auth.role === "Student") {
    query.studentId = req.auth.userId;
  }
  const doubts = await Doubt.find(query).populate("studentId teacherId", "name email").sort({ createdAt: -1 }).lean();
  res.json({ doubts });
});

export const getDoubtById = asyncHandler(async (req, res) => {
  const doubt = await Doubt.findById(req.params.id).populate("studentId teacherId", "name email").lean();
  if (!doubt) throw notFound("Doubt not found");

  const conv = await Conversation.findOne({ referenceType: "Doubt", referenceId: doubt._id }).lean();
  
  res.json({ doubt, conversation: conv });
});

export const resolveDoubt = asyncHandler(async (req, res) => {
  const doubt = await Doubt.findById(req.params.id);
  if (!doubt) throw notFound("Doubt not found");
  
  doubt.status = "Resolved";
  await doubt.save();
  res.json({ doubt });
});

// -- Conversations/Chats --

export const getMessages = asyncHandler(async (req, res) => {
  const { convId } = req.params;
  
  // Mark all unread messages in this conversation as read by the user
  await Message.updateMany(
    { conversationId: convId, senderId: { $ne: req.auth.userId }, readBy: { $ne: req.auth.userId } },
    { $addToSet: { readBy: req.auth.userId } }
  );

  const messages = await Message.find({ conversationId: convId })
    .populate("senderId", "name role")
    .sort({ createdAt: 1 }).lean();
  res.json({ messages });
});

export const postMessage = asyncHandler(async (req, res) => {
  const { convId } = req.params;
  const { content } = req.body;
  
  const conv = await Conversation.findById(convId);
  if (!conv) throw notFound("Conversation not found");

  if (!conv.participants.includes(req.auth.userId)) {
    if (conv.referenceType === "Doubt" && ["Teacher", "Admin"].includes(req.auth.role)) {
       conv.participants.push(req.auth.userId);
       await conv.save();
       await Doubt.findByIdAndUpdate(conv.referenceId, { teacherId: req.auth.userId });
    } else {
       throw forbidden("Not part of this conversation");
    }
  }

  const msg = await Message.create({
    conversationId: convId,
    senderId: req.auth.userId,
    content
  });

  conv.lastMessage = content;
  conv.lastMessageAt = new Date();

  const otherParticipants = conv.participants.filter(p => p.toString() !== req.auth.userId);
  otherParticipants.forEach(pId => {
    const key = pId.toString();
    conv.unreadCount.set(key, (conv.unreadCount.get(key) || 0) + 1);
  });
  await conv.save();

  const populatedMsg = await msg.populate("senderId", "name role");
  res.status(201).json({ message: populatedMsg });
});

export const getMyConversations = asyncHandler(async (req, res) => {
  const convs = await Conversation.find({ participants: req.auth.userId })
    .populate("participants", "name avatar role lastSeen")
    .sort({ lastMessageAt: -1 })
    .lean();

  res.json({ conversations: convs });
});

export const getUnreadCount = asyncHandler(async (req, res) => {
  const convs = await Conversation.find({ participants: req.auth.userId }, 'unreadCount').lean();
  let total = 0;
  for (const conv of convs) {
    if (conv.unreadCount && conv.unreadCount[req.auth.userId]) {
      total += conv.unreadCount[req.auth.userId];
    }
  }

  res.json({ unreadCount: total });
});

export const openConversation = asyncHandler(async (req, res) => {
  const { convId } = req.params;
  const userId = req.auth.userId;

  const convo = await Conversation.findById(convId);
  if (!convo) throw notFound("Conversation not found");

  convo.unreadCount.set(userId.toString(), 0);
  await convo.save();

  res.json({ success: true });
});

export const getOrCreateDirectConversation = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const currentUserId = req.auth.userId;

  let convo = await Conversation.findOne({
    participants: { $all: [currentUserId, userId], $size: 2 }
  });

  if (!convo) {
    convo = await Conversation.create({
      participants: [currentUserId, userId],
      referenceType: "General",
    });
  }

  res.json({ conversation: convo });
});

export const askAiAssistant = asyncHandler(async (req, res) => {
  const { message } = req.body;
  if (!message) throw badRequest("Message is required");
  
  const response = `🤖 [AI Assistant]: I received your message: "${message.substring(0, 30)}...". Let me help you with your query!`;
  res.json({ reply: response });
});
