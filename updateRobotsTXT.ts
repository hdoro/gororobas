import { writeFileSync } from "fs"

// https://github.com/ai-robots-txt/ai.robots.txt
async function refreshRobotsTXT() {
  const robotsTXT = await fetch('https://raw.githubusercontent.com/ai-robots-txt/ai.robots.txt/main/robots.txt').then(res => res.text())

  writeFileSync('src/app/robots.txt', robotsTXT)
}

refreshRobotsTXT()