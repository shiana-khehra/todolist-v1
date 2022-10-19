import express from 'express';
import bodyParser from 'body-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import lodash from 'lodash';

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(bodyParser.urlencoded({extended: true}));
app.set('view engine', 'ejs');
app.use(express.static("public"));
mongoose.connect("mongodb://localhost:27017/todolistDB");

const itemsSchema = {
    name: String
};

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
    name: "Cook Food"
});

const item2 = new Item({
    name: "Buy Food"
});

const item3 = new Item({
    name: "Taste Food"
});

const defaultItems = [item1, item2, item3];

const listSchema = {
    name: String,
    items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);

app.get("/", function(req, res){

    Item.find({}, function(err, foundItems){

        if(foundItems.length === 0) {
            Item.insertMany(defaultItems, function(err){
            if(err) {
                console.log(err);
            } else {
                console.log("Insertion successful");
            }
        });
        res.redirect("/");
        } else {
            res.render("list", {ListTitle: "Today", newListItems: foundItems});
        }
    });
});

app.post("/", function(req, res){
    const itemName = req.body.newItem;
    const listName = req.body.list;

    const item = new Item({
        name: itemName
    });

    if(listName === "Today") {
        item.save();
        res.redirect("/");
    } else {
        List.findOne({name: listName}, function(err, foundList){
        foundList.items.push(item);
        foundList.save();
        res.redirect("/" + listName);
        })
    }
});

app.get("/:listType", function(req, res){

    const listType = lodash.capitalize(req.params.listType);
    List.findOne({name: listType},function(err, foundList){
        if(!err) {
            if(!foundList) {
                const list = new List({
                name: listType,
                items: defaultItems
                });
                list.save();
                res.render("list", {ListTitle: listType, newListItems: list.items});
            } else {
                res.render("list", {ListTitle: foundList.name, newListItems: foundList.items});
            }
        }
    });
});

app.post("/delete", function(req, res){
    const checkedItemId = req.body.checkbox;
    const listName = req.body.listName;

    if(listName === "Today") {
        Item.findByIdAndRemove(checkedItemId, function(err){
            if(err) {
                console.log(err);
            } else {
                console.log("Item removed");
                res.redirect("/");
            }
        });
    } else {
        List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}, function(err, foundList){
            if(err) {
                console.log(err);
            } else {
                console.log(foundList);
                res.redirect("/" + listName);
            }
        });
    }
});

app.listen(3000, function(){
    console.log("Server running on port 3000.");
});