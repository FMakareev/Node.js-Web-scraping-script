let fs = require("fs"),
    URL = 'http://begin-english.ru/audio/everyday-english/',
    needle = require('needle'),
    cheerio = require('cheerio'),
    http = require('http'),
    del = require('del');

const baseURL = 'http://begin-english.ru';

let parentLink = [];

function clear(){
    return del('lesson').then(paths => {
        console.log('Deleted files and folders:\n', paths.join('\n'));
    });
}

function parse() {
    needle.get(URL, function (err, res) {
        if (err) throw err;

        let $ = cheerio.load(res.body);
        $('#content ul li a').map((i, el) => {
            parentLink.push(el.attribs.href);
        });
        fs.mkdirSync('./lesson');
        parentLink.map(item => {
            let name = item.substring(item.search('/ee-'));
            let folder = './lesson' + name;
            let href = baseURL + item;
            fs.mkdirSync(folder);
            needle.get(href, (err, res) => {
                if (err) throw err;

                let audio = [];
                let $ = cheerio.load(res.body);

                $('audio source').map((i, item) => {
                    audio.push(item.attribs.src);

                    let file_name = item.attribs.src.substring(item.attribs.src.search(/\d_\d\d.mp3/));

                    let file = fs.createWriteStream(folder + '/' + file_name);
                    http.get(item.attribs.src, function (res) {
                        res.on('data', function (data) {
                            console.log(file_name + ' downloaded start ');
                            file.write(data);
                        }).on('end', function () {
                            file.end();
                            console.log(file_name + ' downloaded to ');
                        });
                    });
                });

            })

        });


    });
}

clear();
parse();