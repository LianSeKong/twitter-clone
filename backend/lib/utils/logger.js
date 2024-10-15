import chalk from "chalk";
export const infoLogger = (...params) => {
    console.log(chalk.green.bold(...params))
}

export const errorLogger = (...params) => {
    console.log(chalk.black.bold(chalk.bgRed(...params)));
}