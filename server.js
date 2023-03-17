const express = require('express')
const app = express()
const fs = require('fs');
const fileupload = require('express-fileupload');

const shareDir = ''
console.log(shareDir)

app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/css'));
app.use(express.static(__dirname + '/images'));
app.use(
    fileupload()
);

//app.use('/public', express.static('public'))
function makeid(length) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < length) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
        counter += 1;
    }
    return result;
}



app.get('/', (req, res) => {
    return res.send("<a href='/download'>/download</a><br><a href='/upload'>/upload</a>")
})


app.get('/upload', (req, res) => {
    return res.render("upload.ejs")
})

app.post('/uploadhandler', (req, res) => {
    var file = req.files.uploadfile
    var id = makeid(15)

    if (!fs.existsSync(shareDir + id)) {
        fs.mkdirSync(shareDir + id)
        var folder = id + "/"
        file.mv(shareDir + folder + file.name)



        return res.send(req.files.uploadfile.name)
    }
})




app.get('/download/file/:fileid', (req, res) => {
    var folder = req.params.fileid;

    if (fs.existsSync(shareDir + folder)) {
        var ip = req.socket.remoteAddress
        console.log(ip + " [" + folder + "]")

        var folderContents = fs.readdirSync(shareDir + folder)
        folderContents.forEach(file => {
            console.log(file)
            if (file) {
                console.log(shareDir + folder + "/" + file)
                res.download(shareDir + folder + "/" + file)
            }
        })
    } else {
        res.json({
            status: 404,
            target: {
                id: folder
            },
            message: "File not found"
        })
    }
})
app.get('/download', (req, res) => {
    var MainfolderContents = fs.readdirSync(shareDir)
    var files = []

    MainfolderContents.forEach(folder => {
        console.log(folder)
        var folderID = folder
        var folderContents = fs.readdirSync(shareDir + folder)
        folderContents.forEach(file => {
            var fileStat = fs.statSync(shareDir + folder + "/" + file)
            var fileData = { name: file, size: fileStat.size, folderid: folderID }
            files.push(fileData)
        })

    })
    console.log(files)


    return res.render("download.ejs", { error: "200ok", files: JSON.stringify(files), author: { name: "ADMIN" } })


})

app.listen(8080)