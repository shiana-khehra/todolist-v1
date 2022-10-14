import express from 'express';
import bodyParser from 'body-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import getDate from './date.js';

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(bodyParser.urlencoded({extended: true}));
app.set('view engine', 'ejs');
app.use(express.static("public"));

let items = [];
let workitems = [];

app.get("/", function(req, res){
    var day = getDate();

    res.render("list", {ListTitle: day, newListItems: items});
});

app.post("/", function(req, res){
    if(req.body.list === "Work") {
        workitems.push(req.body.newItem);
        res.redirect("/work");
    } else {
        items.push(req.body.newItem);
        res.redirect("/");
    }
});

app.get("/work", function(req, res){
    res.render("list", {ListTitle: "Work List", newListItems: workitems});
});

app.listen(3000, function(){
    console.log("Server running on port 3000.");
});