const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const port = process.env.PORT || 3000;
app.use(bodyParser.json());

//placeholder data for user and post storage(in-memory)
const users = [];
const posts = [];

const MongoClient = require("mongodb").MongoClient;
const url = "mongodb://localhost:27017/your-database-name";

MongoClient.connect(uri, (err, client) => {
  if (err) {
    console.error("Failed to connect to the databases", err);
  } else {
    console.log("Connected to the database");
    const db = client.db();
    const usersCollection = db.collection("users");
    //Insert a user document
    usersCollection.insertOne(
      { name: "John Doe", email: "john@example.com" },
      (err, result) => {
        if (err) {
          console.error("Failed to insert a user document", err);
        } else {
          console.log("User document inserted:", result.ops[0]);
        }
      }
    );
    //Query for users
    usersCollection.find({}).toArray((err, users) => {
      if (err) {
        console.error("Error Querying users:", err);
      } else {
        console.log(("Users found": users));
      }
    });
    client.close();
  }
});

//Users sign-up API
app.post("api/signup", (req, res) => {
  const { name, email } = req.body;
  if (!name || !email) {
    return res.status(400).json({ error: "Name and email are required" });
  }
  //Create a user document in the MongoDB 'users' collection
  const user = { name, email };
  const usersCollection = db.collection("users");

  usersCollection.insertOne(user, (err, result) => {
    if (err) {
      return res.status(500).json({ error: "Failed to register user" });
    }
    res
      .status(200)
      .json({ message: "User registration successfully", user: result.ops[0] });
  });
});

//create POST API
app.post("/api/posts", (req, res) => {
  const { userId, content } = req.body;
  if (!userId || !content) {
    return res.status(400).json({ error: "User ID and content are required" });
  }
  //check if the user exists in the mongoDB 'users'
  const userCollection = db.collection("users");
  userCollection = findOne({ _id: userId }, (err, user) => {
    if (err) {
      return res.status(500).json({ error: "Error finding the user" });
    }
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    //create a post document in the mongoDB 'posts' collection
    const post = { userId, content };
    const postsCollection = db.collection("posts");

    postsCollection.insertOne(post, (err, result) => {
      if (err) {
        return res.status(500).json({ error: "Failed to create the post" });
      }
      res
        .status(200)
        .json({ message: "Post created successfully", post: result.ops[0] });
    });
  });
});

//Delete the API
app.delete("/api/deletePost/:postId", (req, res) => {
  const postId = parseInt(req.params.postId);
  //Check if the post exists
  const postIndex = posts.findIndex((post) => post.id === postId);
  if (postIndex === -1) {
    return res.status(404).json({ error: "Post not found" });
  }
  //Delete the post
  posts.splice(postIndex, 1);
  res.status(200).json({ message: "Post deleted successfully" });
});

//Fetch user's post API
app.get("/api/posts/:userId", (req, res) => {
  const userId = parseInt(req.params.userId);
  //Find all posts by the specified user
  const userPosts = posts.filter((post) => post.userId === userId);
  res.status(200).json({ posts: userPosts });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
