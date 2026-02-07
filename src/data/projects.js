// Local projects data. Add or edit entries freely.
// Images should go to /public/projects and be referenced as "/projects/<file>".

export const projects = [
  {
    id: "todo-app",
    Title: "ToDo App (with AI integration)",
    Description:
      "Create, view, and mark todos as done. Integrated AI helper to enhance productivity.",
    Img: "/Portfolio-Website/projects/todo-app.png",
    Link: "https://github.com/Sunay4826/ToDoApp.git",
    TechStack: ["React", "Node", "Express", "CSS"],
  },
  {
    id: "ai-finance-platform",
    Title: "AI Finance Platform",
    Description:
      "AI-powered finance dashboard for account insights, tracking, and analytics.",
    Img: "/Portfolio-Website/projects/todo-app.png",
    Link: "https://ai-finance-platform-imp.vercel.app/account/9ad844c9-fd1e-4d56-8c7f-fb14da706fbe",
    TechStack: ["React", "Vercel"],
  },
  {
    id: "remote-blogging-platform",
    Title: "Remote Blogging Platform",
    Description:
      "Full-stack blogging platform with posts, comments, likes, bookmarks, and tags.",
    Img: "/Portfolio-Website/projects/ChatGPT Image Feb 8, 2026 at 01_26_08 AM.png",
    Link: "https://blog-sbyr.vercel.app/blogs",
    Github: "Private",
    TechStack: [
      "React",
      "Tailwind CSS",
      "Hono",
      "Prisma",
      "PostgreSQL",
      "Cloudflare Workers",
      "Vercel",
    ],
    Features: [
      "Create and publish posts with tagging support.",
      "Engagement features: comments, likes, and bookmarks.",
      "Responsive UI with a modern, cross-device experience.",
      "Secure authentication and server-side validation with Hono.",
      "Prisma + PostgreSQL backend deployed on Cloudflare Workers.",
      "Frontend deployed on Vercel for fast global delivery.",
    ],
  },
  {
    id: "advanced-pipify",
    Title: "Advanced PiPify - Professional Picture-in-Picture Tool",
    Description:
      "Modern multi-window PiP with screen/window/tab/camera capture, themes, settings, and hotkeys.",
    Img: "/Portfolio-Website/projects/pipify.png",
    Link: "https://sunay4826.github.io/pipify_tool-main/",
    TechStack: ["Python", "Streamlit"],
  },
  {
    id: "movie-recommendation-system",
    Title: "Movie Recommendation System",
    Description:
      "Streamlit app offering content-based and collaborative filtering recommendations without external APIs.",
    Img: "/Portfolio-Website/projects/mrs.png",
    Link: "https://movie-recommendation-system86.streamlit.app/",
    TechStack: ["Python", "Streamlit"],
  },
  {
    id: "cws-dbms",
    Title: "CWS_DBMS - Commonwealth Games Database Management System",
    Description:
      "A revolutionary approach to managing the Commonwealth Games through a comprehensive database system that streamlines operations, enhances user experience, and elevates the overall event experience.",
    Img: "/Portfolio-Website/projects/cws-dbms.png",
    Link: "https://github.com/Sunay4826/CWS_DBMS",
    TechStack: ["Database Management", "System Design"],
  },
];

export default projects;

