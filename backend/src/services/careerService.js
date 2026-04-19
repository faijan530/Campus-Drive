export const CAREER_PATHS = [
  {
    career: "Frontend Developer",
    coreSkills: ["react", "javascript", "html", "css", "html/css"],
    roadmap: [
      "Deepen understanding of React state management",
      "Learn modern CSS frameworks and responsive design",
      "Build complex, interactive frontend applications",
      "Study web performance optimization"
    ]
  },
  {
    career: "Backend Developer",
    coreSkills: ["node.js", "node", "express", "dsa", "database", "sql", "mongodb"],
    roadmap: [
      "Learn API design and RESTful patterns",
      "Master database modeling and optimization",
      "Build scalable server applications",
      "Practice system design strategies"
    ]
  },
  {
    career: "Full Stack Developer",
    coreSkills: ["react", "javascript", "node.js", "node", "database", "mongodb", "sql"],
    roadmap: [
      "Connect frontend to backend APIs seamlessly",
      "Handle comprehensive application state",
      "Learn deployment workflows and CI/CD",
      "Understand full-system security practices"
    ]
  },
  {
    career: "Data Analyst",
    coreSkills: ["python", "sql", "statistics", "data", "pandas", "excel"],
    roadmap: [
      "Master Python data libraries (Pandas, NumPy)",
      "Improve complex SQL querying capabilities",
      "Learn data visualization tools (Tableau, PowerBI)",
      "Practice advanced statistical modeling"
    ]
  }
];

function getWeight(level) {
  if (level === "Advanced") return 3;
  if (level === "Intermediate") return 2;
  return 1;
}

function generateCareerInsights(career, matched) {
  const insights = [];
  if (matched.length > 0) {
    const top = matched.slice(0, 2).map(m => m.name).join(" and ");
    insights.push(`Strong ${top} skills indicate natural alignment for the ${career} role.`);
  } else {
    insights.push(`You currently have limited exposure to core ${career} technologies.`);
  }
  return insights;
}

function generateSkillGaps(career, missing) {
  const gaps = [];
  if (missing.length > 0) {
    const topMissing = missing.slice(0, 3).join(", ");
    gaps.push(`For ${career}, you are missing or need to improve: ${topMissing}.`);
  } else {
    gaps.push(`You have excellent coverage of core requirements for this role.`);
  }
  return gaps;
}

function generateRoadmap(careerDef) {
  return careerDef.roadmap || [];
}

export const careerService = {
  calculateCareerMatches(userData) {
    const { skills = [], projects = [], testResults = [] } = userData;

    // Normalize user skills for easy matching
    const userSkillsMap = skills.map(s => ({
      name: s.name.toLowerCase().trim(),
      level: s.level,
      weight: getWeight(s.level)
    }));

    const recommendations = CAREER_PATHS.map(path => {
      let scoreAcc = 0;
      const matched = [];
      const missing = [];

      path.coreSkills.forEach(req => {
        const found = userSkillsMap.find(u => u.name.includes(req) || req.includes(u.name));
        if (found && !matched.some(m => m.name === found.name)) {
          scoreAcc += found.weight;
          matched.push(found);
        } else if (!found) {
          missing.push(req);
        }
      });

      // To normalize, assume a target of achieving 3 core skills at Advanced level (9 points) guarantees 100%
      const MAX_SCORE = 9; 
      let score = Math.round((scoreAcc / MAX_SCORE) * 100);
      if (score > 100) score = 100;

      let label = "Low Match";
      if (score >= 70) label = "High Match";
      else if (score >= 40) label = "Medium Match";

      const insights = generateCareerInsights(path.career, matched);
      if (projects.length > 0) insights.push("Your portfolio projects provide practical evidence of capability.");

      const gaps = generateSkillGaps(path.career, missing);
      const roadmap = generateRoadmap(path);

      return {
        career: path.career,
        score,
        label,
        insights,
        gaps,
        roadmap
      };
    });

    return recommendations.sort((a, b) => b.score - a.score);
  }
};
