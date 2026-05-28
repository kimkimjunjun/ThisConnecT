const fs = require('fs')
const { execSync } = require('child_process')

const [, , msgFile, source] = process.argv

// amend / merge / squash 등은 건드리지 않음
if (source) process.exit(0)

try {
  const branch = execSync('git branch --show-current', { encoding: 'utf8' }).trim()

  // 패턴: feat/#2/login, fix/#3/bug, refactor/#4/my-page
  const match = branch.match(
    /^(feat|fix|refactor|docs|style|test|chore|build)\/#\d+\/(.+)$/,
  )
  if (!match) process.exit(0)

  const [, type, scope] = match
  const current = fs.readFileSync(msgFile, 'utf8')

  // 이미 내용이 있으면(재시도 커밋 등) 건드리지 않음
  if (current.trim()) process.exit(0)

  fs.writeFileSync(msgFile, `${type}(${scope}): `)
} catch {
  process.exit(0)
}
