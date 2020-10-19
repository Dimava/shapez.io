const fs = require('fs')


let loc = '../src/js/core/config.local.js'

let f = fs.readFileSync(loc) + ''

f = f.replace(/(.*?-{10,}\r?\n)(.*?)\/\/ (.*)(\r?\n.*?)\/\/ (.*?): true,/g, '$1$2_$5: "$3",$4$5: false,')

f = f.replace(/.*\/\* dev:.*\r?\n/g, '')

console.log(f)

fs.writeFileSync(loc, f)
