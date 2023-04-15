import chalk from 'chalk'

const log = console.log
const renderTitle = () =>
  log(
    chalk.bold.magenta(`
    nodejs-cli
  `)
  )
const text = (text: string): void => log(chalk.white(`${text}`))
const info = (text: string): void => log(chalk.blue(`${text}`))
const success = (text: string): void => log(chalk.green(`✔ ${text}`))
const error = (text: string): void => log(chalk.red(`✖ ${text}`))

export {
  renderTitle,
  text,
  info,
  success,
  error,
}