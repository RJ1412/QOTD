import { db } from "../libs/db.js";

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
      message: "Codeforces profile linked successfully",
      profile: data.result[0],
    });

  } catch (error) {
    console.error("Error linking Codeforces handle:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};


export const getDailyUniqueCodeforcesQuestion = async (req, res) => {
  const userId = req.user.id;

  try {
    const cfRes = await fetch("https://codeforces.com/api/problemset.problems");
    const data = await cfRes.json();

    if (data.status !== "OK") {
      return res.status(502).json({ error: "Failed to fetch Codeforces problems" });
    }

    const problems = data.result.problems;
    const filtered = problems.filter(
      (problem) =>
        problem.rating >= 800 &&
        problem.rating <= 1200 &&
        problem.contestId &&
        problem.index
    );

    if (filtered.length === 0) {
      return res.status(404).json({ error: "No problems found in rating range" });
    }
    const previousSubmissions = await db.submission.findMany({
      where: { userId },
      include: { question: true },
    });

    const seenIds = new Set(
      previousSubmissions.map((s) => `${s.question.codeforcesId}-${s.question.title}`)
    );

    const unseen = filtered.filter(
      (q) => !seenIds.has(`${q.contestId}-${q.name}`)
    );

    if (unseen.length === 0) {
      return res.status(404).json({ error: "You've exhausted all unique questions in this range" });
    }

    
    const chosen = unseen[Math.floor(Math.random() * unseen.length)];
    const link = `https://codeforces.com/contest/${chosen.contestId}/problem/${chosen.index}`;

    let question = await db.question.findFirst({
      where: {
        codeforcesId: chosen.contestId,
        title: chosen.name,
      },
    });

    if (!question) {
      question = await db.question.create({
        data: {
          title: chosen.name,
          codeforcesId: chosen.contestId,
          link,
          date: new Date(),
        },
      });
    }

    await db.submission.create({
      data: {
        userId,
        questionId: question.id,
        status: "PENDING",
      },
    });

    return res.status(200).json({
      success: true,
      question: {
        title: chosen.name,
        rating: chosen.rating,
        tags: chosen.tags,
        link,
      },
    });
  } catch (error) {
    console.error("Error generating unique CF question:", error);
    res.status(500).json({ error: "Internal server error" });
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
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0); 

    const question = await db.question.findUnique({
      where: { date: today },
    });

    if (!question) return res.status(404).json({ error: "No question available today" });

    return res.status(200).json({ question });
  } catch (error) {
    console.error("getTodayQuestion error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const UpdatePoints = async (req, res) => {
  const userId = req.user.id;

  try {
    // Get today's question
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    const question = await db.question.findUnique({
      where: { date: today },
    });

    if (!question) {
      return res.status(404).json({ error: "No question available today" });
    }

    const user = await db.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.codeforcesHandle) {
      return res.status(400).json({ error: "User handle not linked" });
    }

    // Fetch user's Codeforces submissions
    const cfRes = await fetch(`https://codeforces.com/api/user.status?handle=${user.codeforcesHandle}`);
    const data = await cfRes.json();

    if (data.status !== "OK") {
      return res.status(502).json({ error: "Failed to fetch submissions from Codeforces" });
    }

    const matched = data.result.find((sub) => {
      return (
        sub.verdict === "OK" &&
        sub.problem.contestId === question.codeforcesId &&
        sub.problem.name === question.title
      );
    });

    if (!matched) {
      return res.status(400).json({ error: "No successful submission found for today’s question" });
    }

    // Check local submission
    const existingSubmission = await db.submission.findUnique({
      where: {
        userId_questionId: {
          userId,
          questionId: question.id,
        },
      },
    });

    if (!existingSubmission) {
      return res.status(404).json({ error: "No local submission found" });
    }

    if (existingSubmission.status === "ACCEPTED") {
      return res.status(400).json({ error: "Already accepted" });
    }

    // Mark as accepted and update points
    const updatedSubmission = await db.submission.update({
      where: { id: existingSubmission.id },
      data: {
        status: "ACCEPTED",
        score: 10,
      },
    });

    return res.status(200).json({
      message: "Verified and points awarded",
      submission: updatedSubmission,
    });
  } catch (error) {
    console.error("UpdatePoints error:", error);
    res.status(500).json({ error: "Internal server error" });
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
