import dotenv from 'dotenv'
import commandLineArgs from 'command-line-args'

const options = commandLineArgs([
    {
        name: 'env',
        alias: 'e',
        defaultValue: 'prod',
        type: String,
    },
])

const result = dotenv.config({
    path: `./${options.env}.env`,
})

if (result.error) {
    console.error(`Не найден файл ./${options.env}.env .Добавьте его на примере example.env`)
    throw result.error
}
