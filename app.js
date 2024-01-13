import express from "express";
import bodyParser from "body-parser";
import { fileURLToPath } from "url";
import { dirname } from "path";
import mongoose from "mongoose";
const { Schema } = mongoose;
import _ from "lodash";

main().catch((err) => console.log(err));

async function main() {
  await mongoose.connect(
    "mongodb+srv://sayujya57:pv3vju1WDyH9moxE@cluster0.u4sgcsh.mongodb.net/todolistDB?retryWrites=true&w=majority"
  );
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(express.static("public"));

// MONGOOOSE Initial Start -------------------------------------------
const itemSchema = new Schema({
  name: String,
});
const Item = mongoose.model("Item", itemSchema);

const listSchema = {
  name: String,
  items: [itemSchema],
};
const List = mongoose.model("List", listSchema);

const item1 = new Item({
  name: "Welcome to your todolist",
});
const item2 = new Item({
  name: "Hit the + button to add new Item",
});
const item3 = new Item({
  name: "<-- Hit this to delete an item",
});

// If the list is Empty we add the default items to the list
const defaultItems = [item1, item2, item3];

const count = await Item.countDocuments({});
if (count === 0) {
  await Item.insertMany(defaultItems);
}

// ------------------------------------------------------
const dayToday = "Today";
app.get("/", async (req, res) => {
  const items = await Item.find({});

  res.render("index", { heading: dayToday, newListItems: items });
});

app.post("/", async (req, res) => {
  const itemName = req.body.newItem;
  const listName = req.body.button;

  const item = new Item({
    name: itemName,
  });

  if (listName === dayToday) {
    await item.save();
    res.redirect("/");
  } else {
    const foundList = await List.findOne({ name: listName });
    foundList.items.push(item);
    await foundList.save();
    res.redirect(`/${listName}`);
  }
});

app.post("/delete", async (req, res) => {
  const deleteItemsId = req.body.deleteItemsId;
  const listName = req.body.listName;

  if (listName === dayToday) {
    await Item.deleteOne({ _id: deleteItemsId });
    res.redirect("/");
  } else {
    await List.findOneAndUpdate({ name: listName }, { $pull: { items: { _id: deleteItemsId } } });
    res.redirect(`/${listName}`);
  }
});

// Dynamic Routing
app.get("/:nameOfList", async (req, res) => {
  const nameOfList = _.upperFirst(_.lowerCase(req.params.nameOfList));
  const foundItem = await List.findOne({ name: nameOfList });

  if (foundItem === null) {
    const list = new List({
      name: nameOfList,
      items: defaultItems,
    });

    await list.save();
    res.redirect(`/${nameOfList}`);
  } else {
    res.render("index", { heading: nameOfList, newListItems: foundItem.items });
  }
});

let PORT = process.env.port || 3000;
app.listen(3000, () => {
  console.log("Server Started Running");
});
