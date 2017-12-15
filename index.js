#!/usr/bin/env node
~function () {

const os = require('os');
let relativeLogPath = `${os.homedir()}/.relative-path.log`;

const argv = require('yargs')
    .option('l', {
        alias: ['log', 'history'],
        demand: false,
        default: false,
        describe: `Print relative generation logs stored in ${relativeLogPath},
use this option means that the script would be terminate right now,
remain code would not be executed!`,
        type: 'boolean',
    })
    .option('n', {
        alias: ['non-copy', 'non-copy-relative-path'],
        demand: false,
        default: false,
        describe: `Do not write the res which was computed as distination relative path into the X clipboard;`,
        type: 'boolean',
    })
    .option('b', {
        alias: ['base-path', 'from-dir'],
        demand: false,
        default: false,
        describe: 'Special the base-path;',
        type: 'string'
    })
    .option('w', {
        alias: ['swap-path'],
        demand: false,
        default: false,
        describe: 'Specail a swap-path to store the text current text in X clipboard.',
        type: 'string',
    })
    .argv;

const fs = require('fs');
const path = require('path');

const chalk = require('chalk');
const log = console.log;
const detail =  function(msg){
    log(chalk.hex('#333').bold(msg));
};
const warn =  function(msg){
    log(chalk.hex('#aaaa44').bold(msg));
};
const success =  function(msg){
    log(chalk.hex('#77cc22').bgWhiteBright.bold(msg));
};
const tip =  function(msg){
    log(chalk.hex('#006688').bgWhiteBright(msg));;
};
const gold =  function(msg){
    log(chalk.hex('#ff6600').bgWhiteBright(msg));;
};

const basePath = argv.b || '.';
const absDistPath = argv._[0] || '.';
const homeDir = os.homedir();
let clipboardSwapPath = argv['swap-path'] || `${homeDir}/.tmp-clipboard.swp`;

relativeLogPath = argv['log-path'] || relativeLogPath;



if (argv.l || argv.log || argv.history) {
    if(fs.existsSync(relativeLogPath)){
    const relativePathLogs = fs.readFileSync(relativeLogPath, 'utf-8');
    detail( relativePathLogs );
    success(`
----------------------------------------------------------------------------------------------------------------------------------------- 
          Above is the relative compute log.
----------------------------------------------------------------------------------------------------------------------------------------- 
    `);
    }
    else {
     detail(`
----------------------------------------------------------------------------------------------------------------------------------------- 
    ${relativeLogPath} was not found,
    If if you execute again without weather --log nor --history arg,
    one would be generate.
----------------------------------------------------------------------------------------------------------------------------------------- 
    `);
    }
    //这只是在输出日志，不执行后边的代码了;
    return void 0;
}

const exec = require('child_process').exec;

const relative = require('relative');

if(absDistPath === '.'){
    warn(`
----------------------------------------------------------------------------------------------------------------------------------------- 
    The absolute distination path requals to the base path,
    if you are not trying to compare them, 
    or just review the log of relative generatations,
    you must pass in path,
    both relative path and absolute path is valid.
----------------------------------------------------------------------------------------------------------------------------------------- 
    `);
}

let res = relative(basePath, absDistPath);

//将本次计算的日志内容追加到 relativePath 文件
const logDetail =  `
----------------------------------------------------------------------------------------------------------------------------------------- 
Base-path: ${basePath}
Relative path of distinate path: ${res}
Absoute of distinate path: 
    ${absDistPath}
-----------------------------------------------------------------------------------------------------------------------------------------
`;

detail(logDetail);

exec(`
   cat << EOF >> ${relativeLogPath}
       ${logDetail}
`);
//我不知道上边为什么不用以 EOF 结束, 加上会原样打印 EOF, 如果亲爱的读者你知道请告诉我. 邮箱：zhouyu@zhouyu.pro

if(!argv.n){
//将外部clipboard中的文本内容覆盖到 clipboardSwapPath, 每次执行都会覆盖, 这是用来临时储存之前剪贴板中的内容的;
exec(`
   echo $(xclip -sel c -o) > ${clipboardSwapPath}
`);

//将本次计算的相对路径结果覆盖到将外部clipboard中;
exec(`
   echo ${res} | xclip -sel c
`);

success(`The relative distination path:`);
gold(`  ${res}`);
success(`has been write to your public clipboard;`);
tip(`If your os is linux, these words was print in the buffer of this executing node script, you can just press ctrl-c `);
tip(`mouse-right-button, or shift-insert key to paste it out.`);
warn(`Using ctrl-c to paste, just be valid in other editable area, if in this buffer area, buffer will be terminated, 
and both the terminal clipboard and X clipboard would be erase; `);
tip(`Specailly, if you copy any text into the X clipboard, this buffer would be terminated immediately;`);
}

}();
