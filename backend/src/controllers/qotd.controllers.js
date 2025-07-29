import { db } from "../libs/db.js";
import axios from "axios";
import * as cheerio from "cheerio"; 
import { generateEditorialFromGemini } from "../libs/editorialGenerator.js";


const SCRAPER_API_KEY = process.env.SCRAPER_API_KEY;

export const linkCodeforcesHandle = async (req, res) => {
  const { handle } = req.body;
  const userId = req.user.id;

  if (!handle) {
    return res.status(400).json({ error: "Codeforces handle is required" });
  }

  try {
    const existingUser = await db.user.findFirst({
      where: {
        codeforcesHandle: handle,
        NOT: { id: userId }, 
      },
    });

    if (existingUser) {
      return res.status(409).json({ error: "This Codeforces handle is already linked to another account" });
    }

    // Verify Codeforces handle from Codeforces API
    const cfRes = await fetch(`https://codeforces.com/api/user.info?handles=${handle}`);
    const data = await cfRes.json();

    if (data.status !== "OK") {
      return res.status(404).json({ error: "Codeforces handle not found" });
    }


    await db.user.update({
      where: { id: userId },
      data: { codeforcesHandle: handle },
    });

    return res.status(200).json({
      message: "Codeforces handle linked successfully",
       success: true,
  updatedUser: {
    ...user,
    codeforcesHandle: handle,
  },
    });

  } catch (error) {
    console.error("Error linking Codeforces handle:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};






export const generateGlobalQOTD = async (req, res) => {
  try {
    // Check if a question already exists for today
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existing = await db.question.findUnique({
      where: {
        date: today,
      },
    });

    if (existing) {
      return res.status(200).json({
        success: true,
        question: existing,
        message: "Question already exists for today.",
      });
    }

    // Fetch all problems from Codeforces
    const cfRes = await fetch("https://codeforces.com/api/problemset.problems");
    const data = await cfRes.json();

    if (data.status !== "OK") {
      return res.status(502).json({ error: "Failed to fetch Codeforces problems" });
    }

    const problems = data.result.problems;
    const filtered = problems.filter(
      (p) => p.rating >= 800 && p.rating <= 1200 && p.contestId && p.index
    );

    const chosen = filtered[Math.floor(Math.random() * filtered.length)];
    const link = `https://codeforces.com/contest/${chosen.contestId}/problem/${chosen.index}`;

    // Scrape problem statement
    const html = await fetchProblemStatement(chosen.contestId, chosen.index);
    const $ = cheerio.load(html);
    const statement = $(".problem-statement").text().trim();

    // Generate editorial (fallback to null)
    let editorial = null;
    if (statement) {
      editorial = await generateEditorialFromGemini(statement);
    }

    // Save to DB
    const question = await db.question.create({
      data: {
        title: chosen.name,
        codeforcesId: chosen.contestId,
        link,
        rating: chosen.rating,
        date: today,
        editorialUrl: editorial || null,
      },
    });

    return res.status(200).json({
      success: true,
      question: {
        id: question.id,
        title: question.title,
        rating: question.rating,
        link: question.link,
        editorial: editorial,
      },
    });
  } catch (error) {
    console.error("❌ Error generating QOTD:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// 🔧 ScraperAPI Helper
const fetchProblemStatement = async (contestId, index) => {
  const url = `https://codeforces.com/problemset/problem/${contestId}/${index}`;
  const scraperUrl = `https://api.scraperapi.com?api_key=${SCRAPER_API_KEY}&url=${encodeURIComponent(url)}`;

  try {
    const { data } = await axios.get(scraperUrl);
    return data;
  } catch (err) {
    console.error("❌ ScraperAPI failed:", err.message);
    return "";
  }
};

// ✅ controllers/qotd.controllers.js

export const getEditorialIfAllowed = async (req, res) => {
  try {
    console.log("getEditorialIfAllowed called");

    const { codeforcesHandle, questionTitle } = req.body;

    if (!codeforcesHandle || !questionTitle) {
      return res
        .status(400)
        .json({ error: "Missing codeforcesHandle or questionTitle." });
    }

    // ✅ Find user with that handle
    const user = await prisma.user.findUnique({
      where: { codeforcesHandle },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    // ✅ Find question by title
    const question = await prisma.question.findFirst({
      where: { title: questionTitle },
    });

    if (!question) {
      return res.status(404).json({ error: "Question not found." });
    }

    // ✅ Check if user submitted the question
    const submission = await prisma.submission.findUnique({
      where: {
        userId_questionId: {
          userId: user.id,
          questionId: question.id,
        },
      },
    });

    // ✅ Check if editorial is allowed

    const today = new Date();
    const isToday = question.date.toDateString() === today.toDateString();
   

    
    const isAllowed =
      submission?.status === "ACCEPTED" || !isToday; // after 1 day

    if (!isAllowed) {
      return res
        .status(403)
        .json({ error: "Editorial locked. Solve the question to view it." });
    }

    return res.status(200).json({
      editorial: question.editorialUrl || "No editorial available.",
    });
  } catch (error) {
    console.error("getEditorialIfAllowed error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};



export const getHandle = async (req, res) => {
  try {
    const userId = req.user?.id; // assuming `req.user` is populated by your auth middleware

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await db.user.findUnique({
      where: { id: userId },
      select: { cfHandle: true },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({ cfHandle: user.cfHandle });
  } catch (error) {
    console.error("Error fetching CF handle:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const getTodayQuestion = async (req, res) => {
  try {
    const now = new Date();

    const startOfDay = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0));
    const endOfDay = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 23, 59, 59));

    const question = await db.question.findFirst({
      where: {
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    });

    if (!question) {
      return res.status(404).json({ error: "No question available today" });
    }

    return res.status(200).json({ question });
  } catch (error) {
    console.error("getTodayQuestion error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};


export const UpdatePoints = async (req, res) => {
  try {
    const { questionTitle, codeforcesHandle } = req.body;

    if (!questionTitle || !codeforcesHandle) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Get question from DB
    const question = await db.question.findFirst({
      where: { title: questionTitle },
    });

    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }

    // Get user from DB
    const user = await db.user.findUnique({
      where: { codeforcesHandle },
    });

    if (!user) {
      return res.status(404).json({ message: "User with handle not found" });
    }

    const codeforcesId = question.codeforcesId;

    // Fetch latest submissions
    const { data } = await axios.get(
      `https://codeforces.com/api/user.status?handle=${codeforcesHandle}`
    );

    const solved = data.result.some((submission) => {
      return (
        submission.verdict === "OK" &&
        submission.problem.contestId === codeforcesId
      );
    });

    if (!solved) {
      return res.status(200).json({ status: "REJECTED" });
    }

    const today = new Date();
    const isToday = question.date.toDateString() === today.toDateString();

    if (!isToday) {
      return res.status(200).json({ status: "EXPIRED" });
    }
    // Check if already submitted
    const existingSubmission = await db.submission.findUnique({
      where: {
        userId_questionId: {
          userId: user.id,
          questionId: question.id,
        },
      },
    });

    if (!existingSubmission) {
      // Create submission
      await db.submission.create({
        data: {
          userId: user.id,
          questionId: question.id,
          status: "ACCEPTED",
          score: 100,
        },
      });
    } else if (existingSubmission.status !== "ACCEPTED") {
      // Update status
      await db.submission.update({
        where: {
          userId_questionId: {
            userId: user.id,
            questionId: question.id,
          },
        },
        data: {
          status: "ACCEPTED",
          score: 100,
        },
      });
    }

    return res.status(200).json({ status: "ACCEPTED" });
  } catch (err) {
    console.error("❌ Error in UpdatePoints:", err.message);
    console.error("❌ Error in UpdatePoints:", err);

    return res.status(500).json({ message: "Server error" });
  }
};


export const getLeaderboard = async (req, res) => {
  try {
    const users = await db.user.findMany({
      include: {
        submissions: {
          where: { status: "ACCEPTED" },
        },
      },
    });

    const leaderboard = users
      .map((user) => ({
        srn: user.srn,
        email: user.email,
        codeforcesHandle: user.codeforcesHandle,
        points: user.submissions.reduce((sum, sub) => sum + sub.score, 0),
      }))
      .sort((a, b) => b.points - a.points);

    return res.status(200).json({ leaderboard });
  } catch (error) {
    console.error("getLeaderboard error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getAllQuestions = async (req, res) => {
  try {
    const questions = await db.question.findMany({
      orderBy: { date: "desc" },
    });

    return res.status(200).json({ questions });
  } catch (error) {
    console.error("getAllQuestions error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getRecentSubmissionsFromCF = async (req, res) => {
  const userId = req.user.id;

  try {
    const user = await db.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.codeforcesHandle) {
      return res.status(400).json({ error: "User handle not linked" });
    }

    const cfRes = await fetch(`https://codeforces.com/api/user.status?handle=${user.codeforcesHandle}`);
    const data = await cfRes.json();

    if (data.status !== "OK") {
      return res.status(502).json({ error: "Failed to fetch submissions from Codeforces" });
    }

    const now = Date.now();
    const last24Hours = now - 24 * 60 * 60 * 1000;

    const recent = data.result.filter((sub) => {
      return sub.creationTimeSeconds * 1000 >= last24Hours;
    }).map((sub) => ({
      id: sub.id,
      contestId: sub.contestId,
      index: sub.problem.index,
      name: sub.problem.name,
      verdict: sub.verdict,
      language: sub.programmingLanguage,
      time: new Date(sub.creationTimeSeconds * 1000).toISOString(),
      link: `https://codeforces.com/contest/${sub.contestId}/submission/${sub.id}`,
    }));

    return res.status(200).json({ recentSubmissions: recent });

  } catch (error) {
    console.error("getRecentSubmissionsFromCF error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
