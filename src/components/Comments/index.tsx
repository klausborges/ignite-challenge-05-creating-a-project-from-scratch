import { useEffect } from "react";

const Comments = (): JSX.Element => {
  useEffect(() => {
    const target = document.getElementById("utterances-comments");

    const script = document.createElement("script");

    script.setAttribute("src", "https://utteranc.es/client.js");
    script.setAttribute("crossorigin", "anonymous");
    script.setAttribute("async", "true");

    // Configure the repository, issue style, issue label, and theme
    script.setAttribute(
      "repo",
      "klausborges/ignite-challenge-05-creating-a-project-from-scratch"
    );
    script.setAttribute("issue-term", "pathname");
    script.setAttribute("label", "blog-comment");
    script.setAttribute("theme", "dark-blue");

    target.appendChild(script);
  }, []);

  return <div id="utterances-comments" />;
};

export { Comments };
