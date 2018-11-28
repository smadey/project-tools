import { exec } from 'child_process'
import os from 'os'

const platform = os.platform()

export default function (script, { cwd }) {
  if (platform === 'darwin') {
    script = [
      'osascript',
      `-e 'tell app "Terminal" to activate'`,
      `-e 'tell app "Terminal" to do script "cd \\"${cwd}\\" && ${script}"'`,
    ].join(' ')
  } else if (platform === 'win32') {
    script = `start cmd.exe /K /D ${cwd} "${script}"`
  } else {
    throw new Error('Unknown platform')
  }
  console.log(script)
  return exec(script)
}
